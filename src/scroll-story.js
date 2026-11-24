// Native, reversible scroll motion for the two editorial story pages.
// CSS owns the presentation; this module only supplies bounded progress and colour.
const storyBody = document.body;

if (storyBody && ['home', 'about'].includes(storyBody.dataset.scrollStory)) {
  initialiseScrollStory(storyBody);
}

function initialiseScrollStory(body) {
  const scenes = [...body.querySelectorAll('[data-story-scene]')];
  if (!scenes.length) return;

  const targetSelector = '[data-story-type], [data-story-copy], [data-story-photo], [data-story-preview]';
  const targets = [...new Set(scenes.flatMap(scene => [scene, ...scene.querySelectorAll(targetSelector)]))];
  const progressProperties = ['--story-progress', '--story-enter', '--story-exit'];
  const colourProperties = ['--story-bg', '--story-ink', '--story-muted'];
  const savedStyles = new Map(targets.map(node => [node, saveProperties(node, progressProperties)]));
  savedStyles.set(body, saveProperties(body, colourProperties));
  const lastValues = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const printMedia = window.matchMedia('print');
  const palettes = {
    cream: { bg: [243, 235, 221], ink: [1, 50, 48], muted: [83, 99, 86] },
    sage: { bg: [200, 213, 193], ink: [1, 50, 48], muted: [64, 86, 76] },
    forest: { bg: [1, 50, 48], ink: [243, 235, 221], muted: [211, 214, 200] },
    clay: { bg: [234, 212, 195], ink: [1, 50, 48], muted: [92, 77, 65] }
  };

  let active = false;
  let destroyed = false;
  let suspended = false;
  let printing = false;
  let frame = 0;
  let needsMeasure = true;
  let viewportHeight = 1;
  let bounds = [];
  let themedScenes = [];
  let resizeObserver;

  const onScroll = () => schedule();
  const onLayoutChange = () => schedule(true);
  const onImageLoad = event => {
    if (event.target instanceof HTMLImageElement) schedule(true);
  };
  const onVisibilityChange = () => {
    if (document.hidden) cancelFrame();
    else schedule(true);
  };
  const onBeforePrint = () => {
    printing = true;
    synchronise();
  };
  const onAfterPrint = () => {
    printing = false;
    synchronise();
  };
  const onPageHide = event => {
    suspended = true;
    stop();
    if (!event.persisted) destroy();
  };
  const onPageShow = () => {
    suspended = false;
    synchronise();
    schedule(true);
  };

  window.addEventListener('beforeprint', onBeforePrint);
  window.addEventListener('afterprint', onAfterPrint);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  const removeMotionListener = listenToMedia(reducedMotion, synchronise);
  const removePrintListener = listenToMedia(printMedia, synchronise);
  synchronise();

  function synchronise() {
    if (destroyed) return;
    if (reducedMotion.matches || printMedia.matches || printing || suspended) stop();
    else start();
  }

  function start() {
    if (active || destroyed) return;
    active = true;
    needsMeasure = true;
    // Existing one-shot reveal behaviour must not hide a story target.
    for (const scene of scenes) {
      scene.classList.remove('reveal-pending');
      scene.querySelectorAll('.reveal-pending').forEach(node => node.classList.remove('reveal-pending'));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onLayoutChange, { passive: true });
    window.visualViewport?.addEventListener('resize', onLayoutChange, { passive: true });
    document.addEventListener('load', onImageLoad, true);
    document.addEventListener('toggle', onLayoutChange, true);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.fonts?.addEventListener('loadingdone', onLayoutChange);
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(onLayoutChange);
      resizeObserver.observe(body);
      targets.forEach(node => resizeObserver.observe(node));
    }
    document.fonts?.ready.then(() => {
      if (active && !destroyed) schedule(true);
    }).catch(() => {});
    schedule(true);
  }

  function stop() {
    active = false;
    cancelFrame();
    body.classList.remove('scroll-story-ready');
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onLayoutChange);
    window.visualViewport?.removeEventListener('resize', onLayoutChange);
    document.removeEventListener('load', onImageLoad, true);
    document.removeEventListener('toggle', onLayoutChange, true);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.fonts?.removeEventListener('loadingdone', onLayoutChange);
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    for (const [node, properties] of savedStyles) restoreProperties(node, properties);
    lastValues.clear();
    needsMeasure = true;
  }

  function destroy() {
    if (destroyed) return;
    stop();
    destroyed = true;
    window.removeEventListener('beforeprint', onBeforePrint);
    window.removeEventListener('afterprint', onAfterPrint);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    removeMotionListener();
    removePrintListener();
  }

  function cancelFrame() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  function schedule(measure = false) {
    needsMeasure ||= measure;
    if (!active || destroyed || document.hidden || frame) return;
    frame = window.requestAnimationFrame(update);
  }

  function measure() {
    viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
    // offset geometry ignores CSS transforms, preventing scroll motion from
    // feeding its own translated/scaled bounds back into the next measurement.
    bounds = targets.map(node => ({ node, top: layoutTop(node), height: Math.max(1, node.offsetHeight) }));
    const byNode = new Map(bounds.map(item => [item.node, item]));
    themedScenes = scenes.map(node => ({ ...byNode.get(node), palette: palettes[node.dataset.storyTheme] }))
      .filter(item => item.palette).sort((a, b) => a.top - b.top);
    needsMeasure = false;
  }

  function update() {
    frame = 0;
    if (!active || destroyed || document.hidden) return;
    try {
      if (needsMeasure) measure();
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      for (const item of bounds) {
        const top = item.top - scrollTop;
        const bottom = top + item.height;
        write(item.node, '--story-progress', clamp((viewportHeight - top) / (viewportHeight + item.height)).toFixed(4));
        write(item.node, '--story-enter', clamp((viewportHeight - top) / (viewportHeight * 0.8)).toFixed(4));
        write(item.node, '--story-exit', clamp((viewportHeight - bottom) / (viewportHeight * 0.6)).toFixed(4));
      }
      writeColours(scrollTop);
      body.classList.add('scroll-story-ready');
    } catch {
      // A static page remains the complete, readable fallback.
      destroy();
    }
  }

  function writeColours(scrollTop) {
    let palette = themedScenes[0]?.palette || palettes[body.dataset.scrollStory === 'home' ? 'forest' : 'cream'];
    const focus = scrollTop + viewportHeight * 0.5;
    for (let index = 1; index < themedScenes.length; index += 1) {
      const next = themedScenes[index];
      const amount = clamp((focus - (next.top - viewportHeight * 0.3)) / (viewportHeight * 0.6));
      if (amount === 0) break;
      palette = mixPalette(palette, next.palette, amount);
    }
    const background = palette.bg.map(Math.round);
    const ink = readableColour(palette.ink.map(Math.round), background);
    const desiredMuted = palette.muted.map(Math.round);
    const muted = contrast(desiredMuted, background) >= 4.5 ? desiredMuted : ink;
    write(body, '--story-bg', rgb(background));
    write(body, '--story-ink', rgb(ink));
    write(body, '--story-muted', rgb(muted));
  }

  function write(node, property, value) {
    let values = lastValues.get(node);
    if (!values) lastValues.set(node, values = new Map());
    if (values.get(property) === value) return;
    node.style.setProperty(property, value);
    values.set(property, value);
  }

  function readableColour(preferred, background) {
    if (contrast(preferred, background) >= 4.5) return preferred;
    const candidates = [palettes.forest.bg, palettes.cream.bg, [0, 0, 0], [255, 255, 255]];
    return candidates.reduce((best, candidate) => contrast(candidate, background) > contrast(best, background) ? candidate : best);
  }
}

function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

function layoutTop(node) {
  let top = 0;
  let current = node;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent;
    if (current) top += current.clientTop;
  }
  return top;
}

function mixPalette(from, to, amount) {
  return Object.fromEntries(['bg', 'ink', 'muted'].map(key => [key,
    from[key].map((channel, index) => channel + (to[key][index] - channel) * amount)
  ]));
}

function rgb(channels) {
  return `rgb(${channels.join(', ')})`;
}

function contrast(first, second) {
  const luminance = colour => colour.map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function saveProperties(node, properties) {
  return properties.map(property => ({ property, value: node.style.getPropertyValue(property), priority: node.style.getPropertyPriority(property) }));
}

function restoreProperties(node, properties) {
  for (const { property, value, priority } of properties) {
    if (value) node.style.setProperty(property, value, priority);
    else node.style.removeProperty(property);
  }
}

function listenToMedia(query, listener) {
  if (query.addEventListener) {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }
  query.addListener(listener);
  return () => query.removeListener(listener);
}
