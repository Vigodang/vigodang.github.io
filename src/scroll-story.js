/* A time-based camera follows native scroll. It settles between wheel events,
   renders nearby scenes only, and never intercepts wheel or touch input. */
const body = document.body;
if (body?.matches('[data-scroll-story="home"], [data-scroll-story="about"]')) mountCamera();

function mountCamera() {
  const nodes = [...document.querySelectorAll('[data-motion-sequence]')];
  if (!nodes.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const print = matchMedia('print');
  const desktop = matchMedia('(min-width: 1000px) and (min-height: 700px)');
  const header = document.querySelector('.site-header');
  const targets = nodes.flatMap(node => [...node.querySelectorAll('.world-track, .spread-copy, .spread-media, .sequence-title, .sequence-title > span, .sequence-copy, .sequence-feature')]);
  const saved = new Map(targets.map(node => [node, node.style.getPropertyValue('transform')]));
  const previousHeader = body.style.getPropertyValue('--motion-header');
  const poses = new Map();
  let records = [], enabled = false, disposed = false, suspended = false, printing = false;
  let frame = 0, lastTime = 0, dirty = true, renderedY = window.scrollY, targetY = window.scrollY;
  let viewport = innerHeight, headerHeight = 0, observer;
  const scroll = () => {
    targetY = window.scrollY;
    // Anchors, scrollbar jumps and restored pages must not trail by whole screens.
    if (Math.abs(targetY - renderedY) > viewport * 1.4) renderedY = targetY;
    schedule();
  };
  const layout = () => { dirty = true; schedule(); };
  const visibility = () => { if (document.hidden) cancel(); else layout(); };
  const beforePrint = () => { printing = true; sync(); };
  const afterPrint = () => { printing = false; sync(); };
  const pageHide = event => { suspended = true; stop(); if (!event.persisted) destroy(); };
  const pageShow = () => { suspended = false; sync(); };
  const focus = event => {
    const item = records.find(item => item.pinned && item.node.contains(event.target));
    if (!item) return;
    let progress = 0;
    if (item.kind === 'world') {
      const index = item.spreads.findIndex(spread => spread.node.contains(event.target));
      if (index < 0) return;
      progress = item.spreads[index].trackTop / Math.max(1, item.travel);
    } else if (!item.copy?.contains(event.target)) return;
    const y = item.top - headerHeight + clamp(progress) * item.scrollRange;
    window.scrollTo({ top: y, behavior: 'instant' });
    targetY = renderedY = window.scrollY;
    schedule();
  };
  const cleanups = [reduce, print].map(query => listen(query, sync));
  cleanups.push(listen(desktop, layout));
  addEventListener('beforeprint', beforePrint);
  addEventListener('afterprint', afterPrint);
  addEventListener('pagehide', pageHide);
  addEventListener('pageshow', pageShow);
  sync();

  function sync() {
    if (disposed) return;
    if (reduce.matches || print.matches || printing || suspended) stop();
    else start();
  }
  function start() {
    if (enabled) return;
    enabled = true;
    dirty = true;
    renderedY = targetY = window.scrollY;
    body.classList.add('scroll-story-ready');
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', layout, { passive: true });
    window.visualViewport?.addEventListener('resize', layout, { passive: true });
    document.addEventListener('toggle', layout, true);
    document.addEventListener('focusin', focus);
    document.addEventListener('visibilitychange', visibility);
    document.fonts?.addEventListener('loadingdone', layout);
    if ('ResizeObserver' in window) {
      observer = new ResizeObserver(layout);
      if (header) observer.observe(header);
      nodes.forEach(node => observer.observe(node.querySelector('.world-stage, .motion-stage')));
    }
    document.fonts?.ready.then(() => { if (enabled) layout(); }).catch(() => {});
    schedule();
  }
  function stop() {
    enabled = false;
    cancel();
    removeEventListener('scroll', scroll);
    removeEventListener('resize', layout);
    window.visualViewport?.removeEventListener('resize', layout);
    document.removeEventListener('toggle', layout, true);
    document.removeEventListener('focusin', focus);
    document.removeEventListener('visibilitychange', visibility);
    document.fonts?.removeEventListener('loadingdone', layout);
    observer?.disconnect(); observer = undefined;
    body.classList.remove('scroll-story-ready');
    if (previousHeader) body.style.setProperty('--motion-header', previousHeader);
    else body.style.removeProperty('--motion-header');
    for (const [node, value] of saved) {
      if (value) node.style.transform = value;
      else node.style.removeProperty('transform');
    }
    nodes.forEach(node => {
      node.removeAttribute('data-in-view');
      node.removeAttribute('data-motion-static');
      node.removeAttribute('data-motion-progress');
      node.querySelectorAll('[data-spread-view]').forEach(spread => spread.removeAttribute('data-spread-view'));
    });
    poses.clear(); records = []; dirty = true;
  }
  function destroy() {
    stop(); disposed = true;
    removeEventListener('beforeprint', beforePrint);
    removeEventListener('afterprint', afterPrint);
    removeEventListener('pagehide', pageHide);
    removeEventListener('pageshow', pageShow);
    cleanups.forEach(remove => remove());
  }
  function cancel() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; lastTime = 0;
  }
  function schedule() {
    if (enabled && !disposed && !frame && !document.hidden) frame = requestAnimationFrame(update);
  }
  function measure() {
    viewport = innerHeight;
    headerHeight = Math.ceil(header?.getBoundingClientRect().height || 0);
    body.style.setProperty('--motion-header', `${headerHeight}px`);
    targets.forEach(node => node.style.removeProperty('transform'));
    poses.clear();
    nodes.forEach(node => node.removeAttribute('data-motion-static'));
    if (desktop.matches) {
      for (const node of nodes) {
        const stage = node.querySelector('.world-stage, .motion-stage');
        const text = [...node.querySelectorAll('.spread-copy, .sequence-copy')];
        if (text.some(copy => copy.offsetHeight > stage.clientHeight * .88)) node.setAttribute('data-motion-static', '');
      }
    }
    const y = window.scrollY;
    records = nodes.map(node => {
      const stage = node.querySelector('.world-stage, .motion-stage');
      const track = node.querySelector('.world-track');
      const top = node.getBoundingClientRect().top + y;
      const spreads = [...node.querySelectorAll('.story-spread')].map(spread => ({
        node: spread, trackTop: spread.offsetTop,
        top: spread.getBoundingClientRect().top + y, height: spread.offsetHeight,
        copy: spread.querySelector('.spread-copy'), media: spread.querySelector('.spread-media'), visible: false
      }));
      return {
        node, stage, track, spreads, top, height: node.offsetHeight, width: stage.clientWidth,
        stageHeight: stage.clientHeight, kind: node.dataset.motionSequence,
        pinned: desktop.matches && !node.hasAttribute('data-motion-static'),
        travel: track ? Math.max(0, track.scrollHeight - stage.clientHeight) : 0,
        scrollRange: Math.max(1, node.offsetHeight - stage.clientHeight),
        title: node.querySelector('.sequence-title'), word: node.querySelector('.sequence-title > span:last-child'),
        copy: node.querySelector('.sequence-copy'), feature: node.querySelector('.sequence-feature'),
        visible: false, painted: false, warmed: false
      };
    });
    renderedY = targetY = y;
    dirty = false;
  }
  function update(time) {
    frame = 0;
    if (!enabled || disposed || document.hidden) return;
    if (dirty) measure();
    const dt = lastTime ? Math.min(32, Math.max(1, time - lastTime)) : 16.67;
    lastTime = time;
    // Milliseconds, rather than frame counts, keep the same response at 60/120Hz.
    const alpha = 1 - Math.exp(-dt / 60);
    renderedY += (targetY - renderedY) * alpha;
    const settling = Math.abs(targetY - renderedY) > .75;
    if (!settling) renderedY = targetY;
    for (const item of records) {
      const visible = item.top < targetY + viewport * 1.15 && item.top + item.height > targetY - viewport * .15;
      if (visible !== item.visible) {
        item.visible = visible;
        item.node.toggleAttribute('data-in-view', visible);
      }
      if (visible && !item.warmed) {
        item.warmed = true;
        item.node.querySelectorAll('img').forEach(img => { img.loading = 'eager'; img.decode?.().catch(() => {}); });
      }
      if (!visible && item.painted) continue;
      if (item.pinned) {
        const p = clamp((renderedY + headerHeight - item.top) / item.scrollRange);
        item.node.dataset.motionProgress = p.toFixed(4);
        if (item.kind === 'world') {
          pose(item.track, 0, -p * item.travel);
        } else {
          pose(item.title, 0, -p * item.stageHeight * .10, 1 + p * .06);
          pose(item.word, 0, p * item.stageHeight * .04);
          pose(item.copy, 0, -p * item.stageHeight * .08);
          pose(item.feature, -p * item.width * .01, -p * item.stageHeight * .025, 1 + p * .06);
        }
      } else if (visible) {
        for (const spread of item.spreads) {
          const near = spread.top < targetY + viewport * 1.1 && spread.top + spread.height > targetY - viewport * .1;
          if (near !== spread.visible) { spread.visible = near; spread.node.toggleAttribute('data-spread-view', near); }
          if (!near) continue;
          const q = clamp((renderedY + viewport - spread.top) / (viewport + spread.height)) - .5;
          pose(spread.copy, 0, q * 10);
          pose(spread.media, 0, -q * 18);
        }
      }
      item.painted = true;
    }
    if (settling) schedule();
    else lastTime = 0;
  }
  function pose(node, x = 0, y = 0, scale = 1) {
    if (!node) return;
    const value = `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) scale(${scale.toFixed(5)})`;
    if (poses.get(node) !== value) { node.style.transform = value; poses.set(node, value); }
  }
}
function clamp(value) { return Math.max(0, Math.min(1, value)); }
function listen(query, listener) {
  if (query.addEventListener) {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }
  query.addListener(listener);
  return () => query.removeListener(listener);
}
