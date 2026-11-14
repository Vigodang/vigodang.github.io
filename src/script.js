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
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
  window.matchMedia('(min-width: 601px)').addEventListener('change', () => close());
}
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
