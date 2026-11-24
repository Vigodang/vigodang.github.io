/* Native scroll drives pinned compositions, without wheel interception,
   colour interpolation, fading text or a continuous render loop. */
const body = document.body;
if (body?.matches('[data-scroll-story="home"], [data-scroll-story="about"]')) mountSequences();

function mountSequences() {
  const nodes = [...document.querySelectorAll('[data-motion-sequence]')];
  if (!nodes.length) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const space = matchMedia('(min-height: 700px)');
  const print = matchMedia('print');
  const header = document.querySelector('.site-header');
  const targets = nodes.flatMap(node => [...node.querySelectorAll('.sequence-title, .sequence-copy, .sequence-portrait, .sequence-feature, .sequence-rail-window, .sequence-rail, .sequence-frame')]);
  const saved = new Map(targets.map(node => [node, node.style.getPropertyValue('transform')]));
  const oldHeader = body.style.getPropertyValue('--motion-header');
  const cache = new Map();
  let items = [], active = false, disposed = false, suspended = false, printing = false;
  let frame = 0, dirty = true, observer, headerHeight = 0;
  const scroll = () => schedule();
  const layout = () => schedule(true);
  const visibility = () => document.hidden ? cancel() : schedule(true);
  const load = event => { if (event.target instanceof HTMLImageElement) layout(); };
  const beforePrint = () => { printing = true; sync(); };
  const afterPrint = () => { printing = false; sync(); };
  const pageHide = event => { suspended = true; stop(); if (!event.persisted) destroy(); };
  const pageShow = () => { suspended = false; sync(); };
  // Keyboard links are reached at their readable, settled position.
  const focus = event => {
    const item = items.find(item => item.node.contains(event.target));
    if (item && item.progress < .86) {
      window.scrollTo({ top: item.top - headerHeight + item.travel * .9, behavior: 'instant' });
      schedule();
    }
  };
  const cleanups = [motion, space, print].map(query => listen(query, sync));
  addEventListener('beforeprint', beforePrint);
  addEventListener('afterprint', afterPrint);
  addEventListener('pagehide', pageHide);
  addEventListener('pageshow', pageShow);
  sync();

  function sync() {
    if (disposed) return;
    if (motion.matches || !space.matches || print.matches || printing || suspended) stop();
    else start();
  }
  function start() {
    if (active) return;
    active = true;
    body.classList.add('scroll-story-ready');
    for (const node of nodes) node.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', layout, { passive: true });
    window.visualViewport?.addEventListener('resize', layout, { passive: true });
    document.addEventListener('load', load, true);
    document.addEventListener('toggle', layout, true);
    document.addEventListener('focusin', focus);
    document.addEventListener('visibilitychange', visibility);
    document.fonts?.addEventListener('loadingdone', layout);
    if ('ResizeObserver' in window) {
      observer = new ResizeObserver(layout);
      observer.observe(body);
      if (header) observer.observe(header);
    }
    document.fonts?.ready.then(() => { if (active) layout(); }).catch(() => {});
    schedule(true);
  }
  function stop() {
    active = false;
    cancel();
    removeEventListener('scroll', scroll);
    removeEventListener('resize', layout);
    window.visualViewport?.removeEventListener('resize', layout);
    document.removeEventListener('load', load, true);
    document.removeEventListener('toggle', layout, true);
    document.removeEventListener('focusin', focus);
    document.removeEventListener('visibilitychange', visibility);
    document.fonts?.removeEventListener('loadingdone', layout);
    observer?.disconnect();
    observer = undefined;
    body.classList.remove('scroll-story-ready');
    if (oldHeader) body.style.setProperty('--motion-header', oldHeader);
    else body.style.removeProperty('--motion-header');
    for (const [node, transform] of saved) {
      if (transform) node.style.setProperty('transform', transform);
      else node.style.removeProperty('transform');
    }
    for (const node of nodes) {
      node.removeAttribute('data-motion-progress');
      node.removeAttribute('data-motion-static');
      node.style.removeProperty('--portrait-room');
    }
    items = [];
    cache.clear();
    dirty = true;
  }
  function destroy() {
    stop();
    disposed = true;
    removeEventListener('beforeprint', beforePrint);
    removeEventListener('afterprint', afterPrint);
    removeEventListener('pagehide', pageHide);
    removeEventListener('pageshow', pageShow);
    cleanups.forEach(remove => remove());
  }
  function cancel() { if (frame) cancelAnimationFrame(frame); frame = 0; }
  function schedule(measure = false) {
    dirty ||= measure;
    if (!active || disposed || frame || document.hidden) return;
    frame = requestAnimationFrame(update);
  }
  function measure() {
    headerHeight = Math.ceil(header?.getBoundingClientRect().height || 0);
    body.style.setProperty('--motion-header', `${headerHeight}px`);
    for (const node of targets) node.style.removeProperty('transform');
    cache.clear();
    for (const node of nodes) {
      node.removeAttribute('data-motion-static');
      node.style.removeProperty('--portrait-room');
    }
    // Larger browser text can fall back per scene when the final layout cannot fit.
    for (const node of nodes) {
      const stage = node.querySelector('.motion-stage');
      const copy = node.querySelector('.sequence-copy');
      const title = node.querySelector('.sequence-title');
      const portrait = node.querySelector('.sequence-portrait');
      let photoFits = true;
      if (portrait && innerWidth <= 800) {
        const room = copy.offsetTop - portrait.offsetTop - 24;
        node.style.setProperty('--portrait-room', `${Math.max(0, room)}px`);
        photoFits = room >= 160;
      }
      if (!stage || !copy || !title || !photoFits || copy.offsetTop < title.offsetTop + title.offsetHeight + 12) node.setAttribute('data-motion-static', '');
    }
    items = nodes.filter(node => !node.hasAttribute('data-motion-static')).map(node => {
      const stage = node.querySelector('.motion-stage');
      const title = node.querySelector('.sequence-title');
      const range = document.createRange();
      range.selectNodeContents(title);
      const ink = range.getBoundingClientRect();
      const titleBox = title.getBoundingClientRect();
      const width = stage.clientWidth, height = stage.clientHeight;
      const peak = Math.min(1.8, width * .9 / Math.max(1, ink.width), height * .67 / Math.max(1, ink.height));
      return {
        node, stage, title, width, height, top: node.getBoundingClientRect().top + window.scrollY,
        travel: Math.max(1, node.offsetHeight - height),
        titleLeft: title.offsetLeft + ink.left - titleBox.left,
        titleTop: title.offsetTop + ink.top - titleBox.top,
        inkWidth: ink.width, inkHeight: ink.height, peak,
        copy: node.querySelector('.sequence-copy'), portrait: node.querySelector('.sequence-portrait'),
        feature: node.querySelector('.sequence-feature'), window: node.querySelector('.sequence-rail-window'),
        rail: node.querySelector('.sequence-rail'), photos: [...node.querySelectorAll('.sequence-frame')], progress: 0
      };
    });
    dirty = false;
  }
  function update() {
    frame = 0;
    if (!active || disposed || document.hidden) return;
    try {
      if (dirty) measure();
      for (const item of items) {
        const p = clamp((window.scrollY + headerHeight - item.top) / item.travel);
        item.progress = p;
        item.node.dataset.motionProgress = p.toFixed(4);
        const dock = ease(p, .12, .34);
        const scale = mix(item.peak * mix(.82, 1, ease(p, 0, .12)), 1, dock);
        const x = (item.width - item.inkWidth * scale) / 2 - item.titleLeft;
        const y = (item.height - item.inkHeight * scale) / 2 - item.titleTop;
        pose(item.title, x * (1 - dock), y * (1 - dock), scale);
        const copyEnter = item.rail ? ease(p, .14, .42) : ease(p, .20, .46);
        pose(item.copy, 0, item.height * (1 - copyEnter));
        if (item.portrait) {
          const enter = ease(p, .08, .34);
          pose(item.portrait, item.width * (item.width > 700 ? -.28 : .16) * (1 - enter), item.height * .92 * (1 - enter), mix(.68, 1, enter));
        }
        if (item.feature) {
          const enter = ease(p, .08, .34);
          pose(item.feature, -item.width * .26 * (1 - enter), item.height * .94 * (1 - enter), mix(1.3, 1, enter));
        }
        if (item.rail) {
          pose(item.window, 0, item.height * .92 * (1 - ease(p, .16, .38)));
          const index = ease(p, .44, .58) + ease(p, .72, .86);
          pose(item.rail, -index * item.window.clientWidth, 0);
          item.photos.forEach((photo, number) => pose(photo, 0, 0, 1 - Math.min(1, Math.abs(index - number)) * .12));
        }
      }
    } catch { destroy(); }
  }
  function pose(node, x = 0, y = 0, scale = 1) {
    if (!node) return;
    const value = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    if (cache.get(node) !== value) { node.style.transform = value; cache.set(node, value); }
  }
}
function clamp(value) { return Math.max(0, Math.min(1, value)); }
function mix(a, b, t) { return a + (b - a) * t; }
function ease(value, start, end) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}
function listen(query, listener) {
  if (query.addEventListener) {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }
  query.addListener(listener);
  return () => query.removeListener(listener);
}
