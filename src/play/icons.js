/*
 * Vigo Quest glyphs: a 24-unit construction grid, 1.6-unit square-ended strokes,
 * chamfered silhouettes and open interiors. Every UI and world glyph uses the
 * same path data. The caller supplies mint, teal or amber through currentColor
 * (SVG) or the final drawIcon argument (canvas); no colour is baked into a path.
 */
const STROKE = 1.6;
const PATHS = Object.freeze({
  retrieval: [
    'M5 3H14L18 7V10M14 3V7H18M5 3V21H10',
    'M8 10H12M8 14H10',
    'M19 15A4 4 0 1 1 11 15A4 4 0 1 1 19 15Z',
    'M18 18L21 21',
  ],
  cloud: [
    'M5 17L3 15V12L5 10H7L8 6L11 4H14L17 6L18 10H20L22 12V15L20 17Z',
    'M12 17V21M8 21H16',
  ],
  data: [
    'M4 5L7 3H17L20 5V19L17 21H7L4 19Z',
    'M4 5L7 7H17L20 5M4 11L7 13H17L20 11M4 17L7 19H17L20 17',
  ],
  agent: [
    'M6 6H18L21 9V17L18 20H6L3 17V9Z',
    'M12 3V6M10 3H14',
    'M7 10H9V12H7ZM15 10H17V12H15Z',
    'M8 16H16',
  ],
  parallel: [
    'M3 10V14M3 12H6M6 12L10 5H20M6 12H20M6 12L10 19H20',
    'M17 2L20 5L17 8M17 9L20 12L17 15M17 16L20 19L17 22',
  ],
  vision: [
    'M3 8V3H8M16 3H21V8M21 16V21H16M8 21H3V16',
    'M7 7H12V12H7ZM12 12H17V17H12Z',
    'M12 7H17V12M7 12V17H12',
  ],
  ml: [
    'M12 3L16 7L12 11L8 7Z',
    'M12 11V14H5V17M12 14H19V17',
    'M3 17H7V21H3ZM17 17H21V21H17Z',
  ],
  'deep-learning': [
    'M5.5 6.5L10.5 4.5M5.5 7.5L10.5 11.5M5.5 16.5L10.5 12.5M5.5 17.5L10.5 19.5',
    'M13.5 4.5L18.5 6.5M13.5 11.5L18.5 7.5M13.5 12.5L18.5 16.5M13.5 19.5L18.5 17.5',
    'M2.5 5.5H5.5V8.5H2.5ZM2.5 15.5H5.5V18.5H2.5Z',
    'M10.5 2.5H13.5V5.5H10.5ZM10.5 10.5H13.5V13.5H10.5ZM10.5 18.5H13.5V21.5H10.5Z',
    'M18.5 5.5H21.5V8.5H18.5ZM18.5 15.5H21.5V18.5H18.5Z',
  ],
  software: [
    'M4 3H20L22 5V19L20 21H4L2 19V5Z',
    'M2 8H22M5 5.5H7M10 5.5H12',
    'M8 12L5 15L8 18M16 12L19 15L16 18M13 11L11 19',
  ],
  about: [
    'M9 3H15L17 5V9L15 11H9L7 9V5Z',
    'M5 21V17L8 14H16L19 17V21Z',
  ],
  contact: [
    'M3 5H21V17L18 20H3Z',
    'M3 5L12 12L21 5M3 19L8 14M21 17L17 13',
  ],
  resume: [
    'M5 3H14L19 8V21H5ZM14 3V8H19',
    'M8 11H15M8 15H16M8 18H13',
  ],
  chip: [
    'M7 6H17L18 7V17L17 18H7L6 17V7Z',
    'M9 9H15V15H9Z',
    'M9 2V6M15 2V6M9 18V22M15 18V22M2 9H6M2 15H6M18 9H22M18 15H22',
  ],
  checkpoint: [
    'M5 21V3M5 4H19L16 8L19 12H5',
    'M8 7L10 9L13 6M3 21H9',
  ],
  portal: [
    'M3 21V7L7 3H17L21 7V21H16V9L14 7H10L8 9V21Z',
    'M1 21H8M16 21H23',
  ],
  mission: [
    'M8 3H16V6H8ZM8 4H5V21H19V4H16',
    'M8 11L10 13L15 8M8 17H16',
  ],
  progress: [
    'M3 20V15H7V20ZM10 20V10H14V20ZM17 20V4H21V20Z',
  ],
  'arrow-right': ['M4 12H20M14 6L20 12L14 18'],
  'arrow-left': ['M20 12H4M10 6L4 12L10 18'],
  jump: ['M12 18V4M6 10L12 4L18 10M4 21H20'],
  interact: [
    'M4 4H20V20H4Z',
    'M15 8V12H8M11 9L8 12L11 15',
  ],
  close: ['M6 6L18 18M18 6L6 18'],
  restart: [
    'M19 9L16 5H8L4 9V16L8 20H16L20 16M19 3V9H13',
  ],
  sound: [
    'M3 9H7L12 5V19L7 15H3Z',
    'M16 8L19 11V13L16 16M19 5L22 9V15L19 19',
  ],
  muted: [
    'M3 9H7L12 5V19L7 15H3Z',
    'M16 9L22 15M22 9L16 15',
  ],
  pause: ['M5 4H9V20H5ZM15 4H19V20H15Z'],
  play: ['M7 4L20 12L7 20Z'],
  map: [
    'M3 5L9 3L15 6L21 4V19L15 21L9 18L3 20Z',
    'M9 3V18M15 6V21M5 9L7 8M17 15L19 14',
  ],
  external: [
    'M13 3H21V11M21 3L11 13',
    'M9 5H5L3 7V19L5 21H17L19 19V15',
  ],
  check: ['M5 12L10 17L20 7'],
});

const pathCache = new Map();
const knownName = name => typeof name === 'string' && Object.hasOwn(PATHS, name) ? name : 'portal';
const safeSize = size => Number.isFinite(size) && size > 0 ? Math.min(size, 512) : 24;

/** Decorative SVG; its containing button/link must provide an accessible name. */
export function icon(name, size = 24) {
  const key = knownName(name);
  const dimension = safeSize(size);
  const paths = PATHS[key].map(d => `<path d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="vq-icon vq-icon--${key}" width="${dimension}" height="${dimension}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${STROKE}" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="2" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/** Draw the identical glyph at the top-left (x, y) of a size-square in canvas. */
export function drawIcon(ctx, name, x, y, size, color = '#a8e3c9') {
  const key = knownName(name);
  if (!pathCache.has(key)) pathCache.set(key, new Path2D(PATHS[key].join(' ')));
  const path = pathCache.get(key);
  const scale = safeSize(size) / 24;
  ctx.save();
  try {
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = STROKE;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.stroke(path);
  } finally {
    ctx.restore();
  }
}
