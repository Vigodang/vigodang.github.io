document.documentElement.classList.add('js');
const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav-links]');
if (toggle && nav) {
  const close = (returnFocus = false) => {
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('span').textContent = '+';
    nav.classList.remove('is-open');
    if (returnFocus && wasOpen) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? '−' : '+';
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => {
    const anchor = event.target.closest('a');
    if (anchor) close(anchor.hasAttribute('download'));
  });
  document.querySelector('.header-after-dark')?.addEventListener('click', () => close());
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
  window.matchMedia('(min-width: 601px)').addEventListener('change', () => close());
}

// Motion never controls navigation or progress. Native page scrolling stays intact.
// Offscreen sections reveal once; keyboard focus and browser find reveal them immediately.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const revealTargets = [...document.querySelectorAll('[data-reveal]')];
let revealObserver;
let motionFrame = 0;
let pointerX = 0;
let pointerY = 0;
const hero = document.querySelector('.hero');
const portraitScene = document.querySelector('[data-portrait-scene]');

function revealAll() {
  revealObserver?.disconnect();
  revealTargets.forEach(element => element.classList.remove('reveal-pending'));
}
function configureMotion() {
  revealAll();
  document.documentElement.classList.toggle('motion-ready', !motionPreference.matches);
  document.body.classList.toggle('hero-enter', !motionPreference.matches);
  if (motionPreference.matches) {
    portraitScene?.style.removeProperty('--portrait-x');
    portraitScene?.style.removeProperty('--portrait-y');
    return;
  }
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        revealObserver.unobserve(entry.target);
      }
    }, {rootMargin:'0px 0px 4% 0px', threshold:0.06});
    revealTargets.forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('reveal-pending');
      revealObserver.observe(element);
    });
  }
}
function queuePortraitMotion() {
  if (!portraitScene || motionFrame || motionPreference.matches || !finePointer.matches) return;
  motionFrame = requestAnimationFrame(() => {
    motionFrame = 0;
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom <= 0) return;
    const scrollOffset = Math.min(34, Math.max(0, -bounds.top) * 0.065);
    portraitScene.style.setProperty('--portrait-x', `${pointerX * 7}px`);
    portraitScene.style.setProperty('--portrait-y', `${pointerY * 5 + scrollOffset}px`);
  });
}
hero?.addEventListener('pointermove', event => {
  const bounds = hero.getBoundingClientRect();
  pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
  pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
  queuePortraitMotion();
});
hero?.addEventListener('pointerleave', () => { pointerX = pointerY = 0; queuePortraitMotion(); });
window.addEventListener('scroll', queuePortraitMotion, {passive:true});
finePointer.addEventListener('change', () => {
  pointerX = pointerY = 0;
  portraitScene?.style.removeProperty('--portrait-x');
  portraitScene?.style.removeProperty('--portrait-y');
});
motionPreference.addEventListener('change', configureMotion);
document.addEventListener('focusin', event => event.target.closest('[data-reveal]')?.classList.remove('reveal-pending'));
// Browser search, anchor jumps and printing must not leave text in a pending state.
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') revealAll();
});
window.addEventListener('hashchange', revealAll);
window.addEventListener('beforeprint', revealAll);
window.addEventListener('pageshow', event => { if (event.persisted) revealAll(); });
configureMotion();
document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

// The dedicated visual pages start at original resolution; native scrolling also works without JS.
const viewport = document.querySelector('[data-viewer]');
const zoomControls = document.querySelector('[data-viewer-controls]');
if (viewport && zoomControls) {
  const image = viewport.querySelector('[data-viewer-image]');
  const status = zoomControls.querySelector('[data-zoom-status]');
  const baseWidth = Number(image.getAttribute('width'));
  let displayedWidth = baseWidth;
  const setWidth = next => {
    displayedWidth = Math.max(baseWidth * 0.1, Math.min(baseWidth * 3, next));
    image.style.width = `${displayedWidth}px`;
    status.textContent = `${Math.round(displayedWidth / baseWidth * 100)}%`;
  };
  zoomControls.hidden = false;
  zoomControls.addEventListener('click', event => {
    const action = event.target.closest('[data-zoom]')?.dataset.zoom;
    if (action === 'in') setWidth(displayedWidth * 1.25);
    if (action === 'out') setWidth(displayedWidth / 1.25);
    if (action === 'actual') setWidth(baseWidth);
    if (action === 'fit') setWidth(Math.min(baseWidth, viewport.clientWidth));
  });
}
