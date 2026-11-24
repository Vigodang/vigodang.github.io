import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/scroll-story.js', import.meta.url), 'utf8');

function events() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    dispatch(type, event = {}) {
      for (const listener of listeners.get(type) || []) listener({type, ...event});
    },
  };
}

function style() {
  const values = new Map(), writes = [];
  const declaration = {
    values, writes,
    setProperty(property, value) { values.set(property, String(value)); writes.push([property, String(value)]); },
    removeProperty(property) { values.delete(property); },
    getPropertyValue(property) { return values.get(property) || ''; },
  };
  return new Proxy(declaration, {
    set(target, property, value) { target.setProperty(property, value); return true; },
  });
}

// Only the layout and browser facilities consumed by the enhancement are
// simulated. Coordinates stay in document space, as with real native scrolling.
function browser({nativeTimeline = false, reducedMotion = false, desktop = true} = {}) {
  const windowEvents = events(), documentEvents = events(), frames = new Map();
  let nextFrame = 0;
  const context = {scrollY: 0, innerHeight: 900};
  const makeNode = (top, height) => {
    const attributes = new Map();
    return {
      style: style(), offsetHeight: height, clientHeight: height,
      getBoundingClientRect() { return {top: top - context.scrollY, height}; },
      setAttribute(name, value = '') { attributes.set(name, value); },
      removeAttribute(name) { attributes.delete(name); },
      hasAttribute(name) { return attributes.has(name); },
      toggleAttribute(name, force) {
        if (force ?? !attributes.has(name)) attributes.set(name, '');
        else attributes.delete(name);
      },
    };
  };
  const classes = new Set();
  const body = {
    matches: selector => selector === '[data-scroll-story]',
    style: style(),
    classList: {add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name)},
  };
  const header = makeNode(0, 72), stage = makeNode(1000, 800), copy = makeNode(1000, 500);
  const scene = makeNode(1000, 1400), photo = makeNode(2000, 500);
  scene.querySelector = selector => ({'.project-stage': stage, '.scene-inner': copy})[selector] || null;
  const media = new Map();
  const matchMedia = query => {
    if (!media.has(query)) media.set(query, {
      ...events(),
      matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : query === 'print' ? false : desktop,
    });
    return media.get(query);
  };
  const document = {
    ...documentEvents, body, hidden: false,
    querySelector: selector => selector === '.site-header' ? header : null,
    querySelectorAll: selector => selector === '[data-motion-sequence="project"]' ? [scene] : selector === '[data-parallax]' ? [photo] : [],
  };
  Object.assign(context, {
    document, matchMedia,
    CSS: {supports: () => nativeTimeline},
    addEventListener: windowEvents.addEventListener,
    requestAnimationFrame(callback) { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() {} },
  });
  vm.runInNewContext(source, context, {filename: 'scroll-story.js'});
  return {
    body, scene, photo,
    pending: () => frames.size,
    flush() {
      const pending = [...frames.values()]; frames.clear();
      for (const callback of pending) callback();
      return pending.length;
    },
    scroll(y) { context.scrollY = y; windowEvents.dispatch('scroll'); },
    dispatch: windowEvents.dispatch,
    reduce(value) {
      const query = matchMedia('(prefers-reduced-motion: reduce)');
      query.matches = value; query.dispatch('change', {matches: value});
    },
  };
}

const sceneMotionWrites = node => node.style.writes.filter(([property]) => property.startsWith('--scene-') || property === 'transform');
const motionValues = node => [...node.style.values].filter(([property]) => /^(?:--scene-|--photo-|transform$)/.test(property));
const imagePosition = page => parseFloat(page.scene.style.getPropertyValue('--scene-image-y'));

test('fallback responds immediately to native scroll and reverses without an easing tail', () => {
  const page = browser(); page.flush();
  page.scroll(1050); page.flush();
  const first = imagePosition(page);
  page.scroll(1250); page.flush();
  const forward = imagePosition(page);
  assert(Number.isFinite(first) && Number.isFinite(forward));
  assert(forward < first, 'the preview must progress as the reader scrolls forward');
  page.scroll(1050); page.flush();
  assert.equal(imagePosition(page), first, 'returning to the same native position must restore the same pose in one frame');
  assert.equal(page.pending(), 0, 'reversed scrolling must not start a settling animation');
});

test('scroll events are coalesced and no animation frame continues at rest', () => {
  const page = browser();
  assert.equal(page.pending(), 1);
  assert.equal(page.flush(), 1);
  assert.equal(page.pending(), 0);
  page.scroll(1050); page.scroll(1150); page.scroll(1250);
  assert.equal(page.pending(), 1, 'a burst of native scroll events needs only one paint');
  page.flush();
  const painted = [...page.scene.style.writes];
  assert.equal(page.pending(), 0);
  assert.equal(page.flush(), 0, 'the page must remain idle after painting the latest scroll position');
  assert.deepEqual(page.scene.style.writes, painted);
});

test('reduced motion clears sticky enhancement and motion, including when enabled at load', () => {
  const page = browser(); page.flush();
  page.scroll(1100); page.flush();
  assert(page.body.classList.contains('scroll-story-ready'));
  assert(motionValues(page.scene).length > 0);
  assert(motionValues(page.photo).length > 0);
  page.scroll(1200);
  assert.equal(page.pending(), 1);
  page.reduce(true);
  assert.equal(page.body.classList.contains('scroll-story-ready'), false);
  assert.equal(page.pending(), 0, 'changing the preference must cancel an outstanding paint');
  assert.deepEqual(motionValues(page.scene), []);
  assert.deepEqual(motionValues(page.photo), []);
  page.scroll(1250);
  assert.equal(page.pending(), 0);
  const reducedAtLoad = browser({reducedMotion: true});
  assert.equal(reducedAtLoad.body.classList.contains('scroll-story-ready'), false);
  assert.equal(reducedAtLoad.pending(), 0);
  assert.deepEqual(motionValues(reducedAtLoad.scene), []);
});

test('page cache restoration reinstates enhancement after pagehide and pageshow', () => {
  const page = browser(); page.flush();
  page.scroll(1100); page.flush();
  page.scroll(1200);
  page.dispatch('pagehide', {persisted: true});
  assert.equal(page.body.classList.contains('scroll-story-ready'), false);
  assert.equal(page.pending(), 0);
  assert.deepEqual(motionValues(page.scene), []);
  page.scroll(1250);
  assert.equal(page.pending(), 0, 'a cached page must remain suspended');
  page.dispatch('pageshow', {persisted: true});
  assert(page.body.classList.contains('scroll-story-ready'));
  assert.equal(page.pending(), 1);
  page.flush();
  assert(motionValues(page.scene).length > 0, 'restored pages must resume sampling native scroll');
  assert.equal(page.pending(), 0);
});

test('native view timelines own pinned scene transforms without competing fallback writes', () => {
  const page = browser({nativeTimeline: true}); page.flush();
  page.scroll(1050); page.flush();
  page.scroll(1250); page.flush();
  assert(page.body.classList.contains('scroll-story-ready'));
  assert(page.scene.hasAttribute('data-in-view'));
  assert.deepEqual(sceneMotionWrites(page.scene), [], 'the JS fallback must not compete with the native scene animation');
  assert(page.photo.style.writes.some(([property]) => property === '--photo-y'), 'independent photo parallax should remain active');
  assert.equal(page.pending(), 0);
});
