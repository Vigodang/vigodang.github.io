import { drawIcon } from './icons.js';

// Original procedural artwork for the existing Vigo Quest world. Coordinates are
// CSS pixels; the game owns the DPR transform, simulation and interaction state.
// All wall-clock ornament is behind the shared effects gate in drawWorld.
const C = {
  sky: '#10202e', horizon: '#203d48', far: '#233d49', farEdge: '#304d57',
  city: '#2c4c55', citySide: '#25424d', cityEdge: '#3c6066', window: '#688f8b',
  floor: '#17343b', floorDeep: '#112a32', conduit: '#315758',
  body: '#193b45', side: '#244a50', inset: '#102d37', trim: '#568d86',
  mint: '#9ddbc0', light: '#c1e9d4', teal: '#69b2a4', muted: '#94b9b1',
  ink: '#e4f0e9', amber: '#e9bd73', amberLight: '#ffe2a3',
  charcoal: '#0d2630', roof: '#32575c', edge: '#719e93',
};
const ICONS = ['retrieval', 'cloud', 'data', 'agent', 'parallel', 'vision'];
const FONT = '"Segoe UI", Arial, sans-serif';
const hash = n => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

function line(ctx, points, color = C.trim, width = 1) {
  ctx.beginPath();
  ctx.moveTo(Math.round(points[0][0]) + .5, Math.round(points[0][1]) + .5);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(Math.round(points[i][0]) + .5, Math.round(points[i][1]) + .5);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function box(ctx, x, y, w, h, radius = 4, fill = C.body, stroke = C.trim, thickness = 1) {
  x = Math.round(x); y = Math.round(y);
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = thickness; ctx.stroke(); }
}

function shape(ctx, points, fill, stroke = null) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const p of points.slice(1)) ctx.lineTo(p[0], p[1]);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

// Small, explicit planes make each instrument feel built, without introducing
// perspective scaling that could blur its CSS-pixel controls or icon.
function cabinet(ctx, x, y, w, h, depth = 7, fill = C.body) {
  shape(ctx, [[x + w, y], [x + w + depth, y - depth], [x + w + depth, y + h - depth], [x + w, y + h]], C.side, C.trim);
  shape(ctx, [[x, y], [x + depth, y - depth], [x + w + depth, y - depth], [x + w, y]], C.roof, C.trim);
  box(ctx, x, y, w, h, 2, fill, C.trim);
  line(ctx, [[x + 3, y + 3], [x + 3, y + h - 3]], '#315a60');
}

function fasteners(ctx, x, y, w, h) {
  for (const [dx, dy] of [[0, 0], [w, 0], [0, h], [w, h]]) rect(ctx, x + dx, y + dy, 2, 2, C.edge);
}

function slot(ctx, x, y, w, active = false) {
  box(ctx, x, y, w, 12, 1, C.charcoal, null);
  rect(ctx, x + 4, y + 4, Math.max(3, w - 13), 2, C.trim);
  rect(ctx, x + w - 6, y + 4, 2, 3, active ? C.mint : C.side);
}

function vents(ctx, x, y, width, rows = 3, color = C.trim) {
  for (let i = 0; i < rows; i++) rect(ctx, x, y + i * 6, width, 2, color);
}

function indicator(ctx, x, y, active = true) {
  rect(ctx, x, y, 3, 3, active ? C.mint : C.trim);
}

function emblem(ctx, name, x, y, size = 32) {
  drawIcon(ctx, name, Math.round(x), Math.round(y), size, C.mint);
}

function skyAnchor(ctx, s, effects) {
  // One distant, subdued moon is drawn before both skyline layers, so roofs
  // naturally interrupt its lower edge. Its mobile footprint stays compact.
  const radius = s.width < 560 ? Math.min(45, s.width * .16) : Math.min(94, s.height * .2);
  const x = s.width * .68 - (effects ? s.camera * .018 : 0);
  const y = s.ground * .41;
  ctx.fillStyle = C.mint;
  ctx.globalAlpha = .016;
  ctx.beginPath(); ctx.ellipse(x, y, radius + 12, radius + 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = .075;
  ctx.beginPath(); ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = .1; ctx.strokeStyle = C.light; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, radius, -Math.PI * .87, Math.PI * .09); ctx.stroke();
  ctx.globalAlpha = 1;
}

function sky(ctx, s, effects) {
  const { width, height, ground } = s;
  const gradient = ctx.createLinearGradient(0, 0, 0, ground);
  gradient.addColorStop(0, C.sky);
  gradient.addColorStop(1, C.horizon);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  // The small stars remain legible background detail, never a particle field.
  const count = Math.ceil(width / 32);
  const drift = effects ? s.camera * .025 : 0;
  for (let i = 0; i < count; i++) {
    const x = ((hash(i + 8) * width - drift) % width + width) % width;
    const y = 26 + hash(i + 137) * Math.max(40, ground * .56);
    ctx.globalAlpha = effects ? .23 + .12 * Math.sin(s.time * .0008 + i * 2.1) : .29;
    rect(ctx, x, y, i % 9 === 0 ? 2 : 1, i % 9 === 0 ? 2 : 1, C.light);
  }
  ctx.globalAlpha = 1;
  skyAnchor(ctx, s, effects);
  // A quiet horizontal haze ties the two silhouettes to a single skyline.
  ctx.globalAlpha = .035;
  rect(ctx, 0, ground - Math.min(160, height * .3), width, Math.min(160, height * .3), C.mint);
  ctx.globalAlpha = 1;
  // Long, low-contrast bands suggest the humid city air. There is no full-scene
  // flashing: the optional modulation is only a few thousandths of opacity.
  ctx.globalAlpha = effects ? .025 + .004 * Math.sin(s.time * .00023) : .025;
  rect(ctx, 0, ground - Math.min(184, height * .39), width, 19, C.mint);
  ctx.globalAlpha = .035;
  rect(ctx, 0, ground - 48, width, 48, C.sky);
  ctx.globalAlpha = 1;
}

function cityLayer(ctx, s, far, effects) {
  const pitch = far ? 142 : 113;
  const scroll = effects ? s.camera * (far ? .12 : .3) : 0;
  const start = Math.floor(scroll / pitch) - 1;
  const end = start + Math.ceil(s.width / pitch) + 3;
  const unit = Math.min(1, Math.max(.65, s.height / 510));
  for (let i = start; i < end; i++) {
    const n = i + (far ? 100 : 300);
    const x = Math.round(i * pitch - scroll);
    const w = Math.round((far ? 86 : 68) + hash(n) * (far ? 55 : 42));
    const h = Math.round(((far ? 115 : 86) + hash(n + 91) * (far ? 145 : 115)) * unit);
    const y = s.ground - h + (far ? 5 : 17);
    rect(ctx, x, y, w, h, far ? C.far : C.city);
    rect(ctx, x + w - 9, y + 4, 9, h - 4, far ? C.farEdge : C.citySide);
    rect(ctx, x + 4, y - 4, w - 17, 4, far ? C.farEdge : C.cityEdge);
    if (i % 3 === 0) {
      rect(ctx, x + 13, y - 13, Math.max(20, w * .45), 9, far ? C.far : C.citySide);
      line(ctx, [[x + 21, y - 13], [x + 21, y - 26]], far ? C.farEdge : C.cityEdge);
    }
    if (far && i % 4 === 1) {
      rect(ctx, x + 12, y - 17, Math.max(20, w - 45), 13, C.far);
      rect(ctx, x + 17, y - 20, Math.max(17, w - 56), 3, C.farEdge);
    }
    if (far) continue;
    // Facade divisions are broad enough to read as architecture at mobile size.
    line(ctx, [[x + 8, y + 7], [x + 8, s.ground]], C.cityEdge);
    const cols = Math.max(2, Math.floor((w - 24) / 20));
    const rows = Math.min(4, Math.floor((h - 28) / 27));
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const lit = hash(n + row * 9 + col * 17) > .45;
        rect(ctx, x + 20 + col * 19, y + 21 + row * 27, 3, 5, lit ? C.window : C.cityEdge);
      }
    }
    // Roof plant, a recessed service door and the occasional connecting bridge
    // give the near skyline three readable depth planes, rather than noise.
    if (i % 2 === 0) {
      rect(ctx, x + w - 30, y - 12, 19, 8, C.citySide);
      vents(ctx, x + w - 27, y - 10, 12, 1, C.cityEdge);
    }
    rect(ctx, x + w - 28, s.ground - 36, 14, 36, C.citySide);
    line(ctx, [[x + w - 28, s.ground - 36], [x + w - 14, s.ground - 36]], C.cityEdge);
    if (i % 4 === 0) {
      rect(ctx, x + w, s.ground - 63, Math.max(15, pitch - w + 12), 12, C.citySide);
      line(ctx, [[x + w, s.ground - 62], [x + pitch + 12, s.ground - 62]], C.cityEdge);
    }
  }
}

function floor(ctx, s) {
  const { ground: g, width, height, camera } = s;
  rect(ctx, 0, g, width, height - g, C.floor);
  rect(ctx, 0, g, width, 3, C.mint);
  rect(ctx, 0, g + 3, width, 4, C.conduit);
  rect(ctx, 0, g + 7, width, 3, C.floorDeep);
  rect(ctx, 0, g + 51, width, Math.max(1, height - g - 51), C.floorDeep);
  line(ctx, [[0, g + 23], [width, g + 23]], '#23484c');
  line(ctx, [[0, g + 44], [width, g + 44]], '#23484c');
  const first = Math.floor(camera / 64) * 64;
  for (let worldX = first; worldX < camera + width + 64; worldX += 64) {
    const x = worldX - camera;
    line(ctx, [[x, g + 8], [x, g + 20]], C.conduit);
    rect(ctx, x + 17, g + 32, 26, 3, '#2a5153');
    rect(ctx, x + 4, g + 12, 2, 2, C.trim);
    rect(ctx, x + 57, g + 12, 2, 2, C.trim);
    if (worldX % 256 === 0) {
      box(ctx, x + 9, g + 47, 41, 15, 1, C.floorDeep, C.conduit);
      rect(ctx, x + 18, g + 53, 12, 2, C.trim);
      rect(ctx, x + 36, g + 53, 4, 2, C.teal);
    }
  }
}

function base(ctx, x, g, w = 174) {
  shape(ctx, [[x - w / 2, g - 10], [x - w / 2 + 7, g - 15], [x + w / 2 + 6, g - 15], [x + w / 2, g - 10]], C.roof, C.trim);
  box(ctx, x - w / 2, g - 10, w, 10, 2, C.side, C.trim);
  rect(ctx, x - w / 2 + 8, g - 10, w - 16, 2, C.muted);
  rect(ctx, x - w / 2 + 11, g, 13, 3, C.inset);
  rect(ctx, x + w / 2 - 24, g, 13, 3, C.inset);
  rect(ctx, x - w / 2 + 5, g - 6, 2, 2, C.edge);
  rect(ctx, x + w / 2 - 7, g - 6, 2, 2, C.edge);
}

function retrievalStation(ctx, x, g) {
  // An open archive gantry: unequal shelf bays, a suspended search head and a
  // visible dark passage between them, rather than another closed cabinet.
  base(ctx, x, g, 192);
  cabinet(ctx, x - 87, g - 156, 35, 146, 7, C.side);
  cabinet(ctx, x + 43, g - 131, 35, 121, 7);
  cabinet(ctx, x - 88, g - 165, 160, 20, 7);
  rect(ctx, x - 78, g - 159, 83, 3, C.mint);
  vents(ctx, x + 18, g - 157, 42, 2);
  for (let row = 0; row < 6; row++) slot(ctx, x - 81, g - 138 + row * 20, 23, row === 1 || row === 4);
  for (let row = 0; row < 4; row++) slot(ctx, x + 49, g - 112 + row * 23, 23, row === 2);
  line(ctx, [[x - 36, g - 144], [x - 36, g - 120], [x + 14, g - 120]], C.trim, 2);
  cabinet(ctx, x - 34, g - 118, 62, 66, 5);
  box(ctx, x - 27, g - 110, 48, 45, 2, C.charcoal, C.trim);
  emblem(ctx, 'retrieval', x - 18, g - 104, 31);
  rect(ctx, x - 24, g - 59, 34, 2, C.teal);
  line(ctx, [[x - 4, g - 51], [x - 4, g - 29], [x - 52, g - 29]], C.teal, 2);
  line(ctx, [[x + 3, g - 51], [x + 3, g - 21], [x + 43, g - 21]], C.trim, 2);
  box(ctx, x - 22, g - 23, 37, 13, 2, C.inset, C.trim);
  fasteners(ctx, x - 82, g - 162, 147, 12);
  return 172;
}

function cloudStation(ctx, x, g) {
  // Two tapered infrastructure pods share a suspended routing bridge. The
  // open space under the bridge and the stepped roof distinguish this district.
  base(ctx, x, g, 198);
  shape(ctx, [[x - 87, g - 117], [x - 78, g - 129], [x - 47, g - 129], [x - 38, g - 117], [x - 38, g - 10], [x - 87, g - 10]], C.body, C.trim);
  shape(ctx, [[x + 37, g - 139], [x + 46, g - 151], [x + 73, g - 151], [x + 83, g - 139], [x + 83, g - 10], [x + 37, g - 10]], C.side, C.trim);
  rect(ctx, x - 46, g - 115, 7, 96, C.side);
  rect(ctx, x + 75, g - 137, 7, 118, C.body);
  box(ctx, x - 79, g - 111, 29, 48, 2, C.charcoal, null);
  box(ctx, x + 45, g - 132, 25, 57, 2, C.charcoal, null);
  vents(ctx, x - 73, g - 102, 17, 6);
  vents(ctx, x + 51, g - 123, 13, 7);
  rect(ctx, x - 74, g - 49, 4, 18, C.mint);
  rect(ctx, x + 50, g - 59, 4, 26, C.teal);
  line(ctx, [[x - 64, g - 129], [x - 64, g - 160], [x + 60, g - 160], [x + 60, g - 151]], C.charcoal, 7);
  line(ctx, [[x - 64, g - 129], [x - 64, g - 160], [x + 60, g - 160]], C.trim, 2);
  cabinet(ctx, x - 35, g - 119, 68, 55, 5);
  box(ctx, x - 28, g - 111, 54, 40, 2, C.charcoal, null);
  emblem(ctx, 'cloud', x - 18, g - 108, 35);
  line(ctx, [[x - 38, g - 88], [x - 35, g - 88]], C.teal, 3);
  line(ctx, [[x + 33, g - 88], [x + 37, g - 88]], C.teal, 3);
  line(ctx, [[x - 13, g - 64], [x - 13, g - 40], [x + 18, g - 40], [x + 18, g - 23]], C.trim, 2);
  box(ctx, x - 24, g - 29, 49, 19, 2, C.side, C.trim);
  for (let i = 0; i < 4; i++) indicator(ctx, x - 15 + i * 10, g - 22, i !== 2);
  rect(ctx, x - 16, g - 163, 31, 3, C.teal);
  return 164;
}

function dataStation(ctx, x, g) {
  // A low, broad analysis workstation: deep screen hood, sloped control deck,
  // separate storage cartridge and an exposed structural pedestal.
  base(ctx, x, g, 198);
  shape(ctx, [[x - 37, g - 68], [x + 31, g - 68], [x + 49, g - 10], [x - 49, g - 10]], C.side, C.trim);
  shape(ctx, [[x - 22, g - 56], [x + 18, g - 56], [x + 31, g - 19], [x - 31, g - 19]], C.charcoal, null);
  cabinet(ctx, x - 73, g - 134, 137, 80, 8);
  shape(ctx, [[x - 68, g - 128], [x + 58, g - 128], [x + 51, g - 118], [x - 61, g - 118]], C.roof, null);
  box(ctx, x - 62, g - 118, 114, 53, 2, C.charcoal, C.trim);
  emblem(ctx, 'data', x - 22, g - 110, 37);
  for (let i = 0; i < 3; i++) rect(ctx, x - 54, g - 108 + i * 12, 11, 2, i === 1 ? C.mint : C.trim);
  line(ctx, [[x + 34, g - 110], [x + 42, g - 110], [x + 42, g - 77]], C.trim);
  shape(ctx, [[x - 77, g - 56], [x + 71, g - 56], [x + 88, g - 28], [x - 89, g - 28]], C.roof, C.trim);
  shape(ctx, [[x - 89, g - 28], [x + 88, g - 28], [x + 88, g - 18], [x - 89, g - 18]], C.body, C.trim);
  line(ctx, [[x - 65, g - 49], [x + 58, g - 49]], C.teal);
  for (let row = 0; row < 2; row++) for (let col = 0; col < 7; col++) rect(ctx, x - 38 + col * 10, g - 43 + row * 6, 6, 2, row === 0 ? C.muted : C.trim);
  box(ctx, x + 49, g - 42, 12, 7, 2, C.charcoal, C.teal);
  cabinet(ctx, x - 96, g - 95, 17, 61, 4, C.side);
  rect(ctx, x - 91, g - 87, 4, 30, C.inset);
  indicator(ctx, x - 90, g - 47);
  fasteners(ctx, x - 69, g - 131, 127, 72);
  return 142;
}

function agentStation(ctx, x, g) {
  // A bounded, faceted core on an open support cradle. A single articulated
  // service arm and its tool dock make the silhouette distinct from storage.
  base(ctx, x, g, 194);
  shape(ctx, [[x - 36, g - 68], [x - 17, g - 68], [x - 32, g - 10], [x - 56, g - 10]], C.side, C.trim);
  shape(ctx, [[x + 25, g - 68], [x + 42, g - 68], [x + 62, g - 10], [x + 38, g - 10]], C.side, C.trim);
  const outer = [[x - 28, g - 160], [x + 31, g - 160], [x + 63, g - 131], [x + 63, g - 88], [x + 31, g - 58], [x - 28, g - 58], [x - 58, g - 88], [x - 58, g - 131]];
  shape(ctx, outer.map(([px, py]) => [px + 7, py - 6]), C.side, C.trim);
  shape(ctx, outer, C.body, C.teal);
  shape(ctx, [[x - 21, g - 147], [x + 24, g - 147], [x + 48, g - 124], [x + 48, g - 94], [x + 24, g - 72], [x - 21, g - 72], [x - 44, g - 94], [x - 44, g - 124]], C.charcoal, C.trim);
  box(ctx, x - 23, g - 131, 49, 45, 3, C.inset, C.trim);
  emblem(ctx, 'agent', x - 16, g - 126, 35);
  line(ctx, [[x - 19, g - 154], [x + 18, g - 154]], C.mint, 2);
  line(ctx, [[x - 50, g - 117], [x - 50, g - 101]], C.teal, 2);
  line(ctx, [[x + 54, g - 117], [x + 54, g - 101]], C.teal, 2);
  line(ctx, [[x - 75, g - 20], [x - 75, g - 78], [x - 59, g - 94]], C.charcoal, 9);
  line(ctx, [[x - 75, g - 20], [x - 75, g - 78], [x - 59, g - 94]], C.trim, 4);
  box(ctx, x - 81, g - 85, 12, 12, 2, C.side, C.muted);
  cabinet(ctx, x + 69, g - 63, 16, 53, 4, C.side);
  for (let row = 0; row < 3; row++) slot(ctx, x + 72, g - 54 + row * 13, 10, row !== 1);
  line(ctx, [[x + 47, g - 37], [x + 60, g - 37], [x + 60, g - 25], [x + 69, g - 25]], C.teal, 2);
  return 166;
}

function parallelStation(ctx, x, g) {
  // A precise compute bank: three stepped blade racks, a continuous overhead
  // bus, separate plinths and rear coolant lines. No cloud-style rounded pods.
  base(ctx, x, g, 202);
  line(ctx, [[x - 85, g - 21], [x - 85, g - 175], [x + 77, g - 175], [x + 77, g - 21]], C.charcoal, 8);
  line(ctx, [[x - 85, g - 21], [x - 85, g - 175], [x + 77, g - 175]], C.trim, 2);
  for (const [dx, height, rows] of [[-73, 122, 4], [-20, 158, 6], [33, 140, 5]]) {
    cabinet(ctx, x + dx, g - height, 36, height - 14, 6);
    box(ctx, x + dx - 3, g - 15, 47, 5, 1, C.side, C.trim);
    for (let row = 0; row < rows; row++) slot(ctx, x + dx + 5, g - height + 12 + row * 18, 25, row % 3 === 0);
    rect(ctx, x + dx + 7, g - height + 3, 16, 2, C.teal);
    line(ctx, [[x + dx + 15, g - height - 6], [x + dx + 15, g - 173]], C.trim, 2);
  }
  cabinet(ctx, x - 23, g - 118, 43, 43, 4, C.side);
  box(ctx, x - 17, g - 112, 31, 31, 2, C.charcoal, null);
  emblem(ctx, 'parallel', x - 16, g - 111, 29);
  line(ctx, [[x - 54, g - 31], [x - 54, g - 24], [x + 50, g - 24], [x + 50, g - 31]], C.teal, 2);
  for (let i = 0; i < 3; i++) rect(ctx, x - 17 + i * 13, g - 179, 7, 3, i === 1 ? C.mint : C.trim);
  return 180;
}

function visionStation(ctx, x, g) {
  // A real instrument silhouette: rear camera housing, projecting lens barrel,
  // faceted optical face, counterweight and a braced tripod with planted feet.
  base(ctx, x, g, 202);
  line(ctx, [[x - 17, g - 77], [x - 48, g - 12]], C.charcoal, 9);
  line(ctx, [[x - 17, g - 77], [x - 48, g - 12]], C.trim, 5);
  line(ctx, [[x + 22, g - 77], [x + 61, g - 12]], C.charcoal, 9);
  line(ctx, [[x + 22, g - 77], [x + 61, g - 12]], C.trim, 5);
  line(ctx, [[x + 4, g - 77], [x + 4, g - 12]], C.side, 5);
  line(ctx, [[x - 32, g - 41], [x + 43, g - 41]], C.trim, 3);
  box(ctx, x - 58, g - 15, 22, 5, 1, C.side, C.muted);
  box(ctx, x + 49, g - 15, 24, 5, 1, C.side, C.muted);
  cabinet(ctx, x - 56, g - 146, 83, 69, 7);
  box(ctx, x - 67, g - 132, 12, 42, 2, C.side, C.trim);
  cabinet(ctx, x - 35, g - 154, 40, 8, 5, C.side);
  box(ctx, x - 45, g - 134, 44, 39, 2, C.inset, C.trim);
  vents(ctx, x - 38, g - 125, 28, 4);
  indicator(ctx, x - 38, g - 101);
  shape(ctx, [[x + 11, g - 136], [x + 53, g - 136], [x + 65, g - 124], [x + 65, g - 96], [x + 53, g - 85], [x + 11, g - 85]], C.side, C.trim);
  line(ctx, [[x + 28, g - 132], [x + 28, g - 90]], C.trim, 2);
  line(ctx, [[x + 35, g - 132], [x + 35, g - 90]], C.trim);
  shape(ctx, [[x + 61, g - 141], [x + 79, g - 131], [x + 86, g - 116], [x + 86, g - 101], [x + 72, g - 82], [x + 57, g - 88], [x + 47, g - 102], [x + 47, g - 126]], C.body, C.teal);
  box(ctx, x + 52, g - 131, 28, 39, 8, C.charcoal, C.trim);
  emblem(ctx, 'vision', x + 51, g - 125, 29);
  box(ctx, x - 86, g - 67, 19, 57, 2, C.side, C.trim);
  rect(ctx, x - 81, g - 59, 8, 26, C.charcoal);
  line(ctx, [[x - 67, g - 25], [x - 61, g - 25], [x - 61, g - 77]], C.teal, 2);
  return 159;
}

const STATION_DRAWERS = [retrievalStation, cloudStation, dataStation, agentStation, parallelStation, visionStation];

function stationLabel(ctx, text, x, y, visited, nearby) {
  ctx.font = `600 13px ${FONT}`;
  const width = Math.ceil(ctx.measureText(text).width) + (visited ? 44 : 26);
  box(ctx, x - width / 2, y, width, 29, 3, C.inset, nearby ? C.light : C.trim);
  ctx.fillStyle = nearby ? C.light : C.ink;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, Math.round(x - width / 2 + 13), Math.round(y + 14));
  if (visited) drawIcon(ctx, 'checkpoint', Math.round(x + width / 2 - 27), Math.round(y + 7), 15, C.mint);
  ctx.textBaseline = 'alphabetic';
}

function stationLight(ctx, x, g, id, visited, nearby, s, effects) {
  ctx.globalAlpha = .25;
  ctx.fillStyle = C.charcoal;
  ctx.beginPath(); ctx.ellipse(x + 5, g + 6, 105, 9, 0, 0, Math.PI * 2); ctx.fill();
  // Material light is present in the still image. Only its very small optional
  // modulation moves; turning atmosphere off does not remove opened state.
  ctx.globalAlpha = (nearby ? .08 : .035) + (effects ? .008 * Math.sin(s.time * .001 + id * 1.7) : 0);
  ctx.fillStyle = C.mint;
  ctx.beginPath(); ctx.ellipse(x, g - 58, 105, 75, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = visited ? .65 : .25;
  rect(ctx, x - 76, g + 9, 152, 2, visited ? C.mint : C.trim);
  ctx.globalAlpha = 1;
}

function activationFeedback(ctx, item, s, effects) {
  const event = s.activation;
  if (!effects || !event || event.id !== item.id) return;
  const duration = Math.max(200, Math.min(1600, Number(event.duration) || 720));
  const t = Math.max(0, Number(event.age) || 0) / duration;
  if (t >= 1) return;
  const x = item.x - s.camera;
  const envelope = Math.sin(Math.PI * t);
  // One bounded, smooth acknowledgement, never a repeating pulse or flash.
  ctx.globalAlpha = envelope * (event.first ? .28 : .18);
  ctx.strokeStyle = C.light; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, s.ground - 79, 71 + t * 7, 55 + t * 4, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = envelope * .6;
  const reach = 55 + t * 42;
  line(ctx, [[x - reach, s.ground + 5], [x + reach, s.ground + 5]], C.mint, 2);
  ctx.globalAlpha = 1;
}

function station(ctx, item, s, effects) {
  const x = item.x - s.camera;
  if (x < -150 || x > s.width + 150) return;
  const id = Number(item.id);
  const draw = STATION_DRAWERS[id] || STATION_DRAWERS[0];
  const nearby = s.nearbyId === item.id;
  const visited = s.visited?.has(item.id) || false;
  stationLight(ctx, x, s.ground, id, visited, nearby, s, effects);
  const h = draw(ctx, x, s.ground);
  activationFeedback(ctx, item, s, effects);
  if (nearby) {
    // Static interaction brackets also work when ambient/reduced motion is off.
    line(ctx, [[x - 99, s.ground - h + 12], [x - 99, s.ground - h - 4], [x - 83, s.ground - h - 4]], C.light, 2);
    line(ctx, [[x + 83, s.ground - h - 4], [x + 99, s.ground - h - 4], [x + 99, s.ground - h + 12]], C.light, 2);
    rect(ctx, x - 71, s.ground + 5, 142, 2, C.mint);
  }
  if (effects) {
    ctx.globalAlpha = .45 + .07 * Math.sin(s.time * .001 + id);
    rect(ctx, x + 57, s.ground - 20, 3, 3, C.mint);
    ctx.globalAlpha = 1;
  }
  stationLabel(ctx, item.short || item.name || ICONS[id].toUpperCase(), x, s.ground - h - 43, visited, nearby);
}

function terminal(ctx, item, s) {
  const x = item.x - s.camera;
  if (x < -90 || x > s.width + 90) return;
  const g = s.ground;
  base(ctx, x, g, 106);
  cabinet(ctx, x - 34, g - 106, 61, 96, 7);
  box(ctx, x - 25, g - 95, 43, 45, 2, C.inset, null);
  emblem(ctx, item.icon || (item.id === 'about' ? 'about' : 'contact'), x - 19, g - 87, 28);
  vents(ctx, x - 22, g - 36, 34, 3);
  indicator(ctx, x + 17, g - 31);
  stationLabel(ctx, item.label || 'PROFILE', x, g - 147, false, s.nearbyId === item.id);
}

function atmosphere(ctx, s, effects, foreground = false) {
  if (!effects) return;
  const count = Math.min(9, Math.ceil(s.width / 220) + 2);
  if (!foreground) {
    for (let i = 0; i < count; i++) {
      const travel = s.time * (.002 + hash(i + 71) * .002);
      const x = ((hash(i + 29) * s.width + travel - s.camera * .17) % (s.width + 20) + s.width + 20) % (s.width + 20) - 10;
      const y = 44 + hash(i + 51) * Math.max(25, s.ground - 84) + Math.sin(s.time * .0007 + i) * 4;
      ctx.globalAlpha = .13;
      rect(ctx, x, y, i % 3 === 0 ? 2 : 1, 1, C.mint);
    }
  }
  if (s.rain) {
    const drops = Math.min(29, Math.ceil(s.width / (foreground ? 76 : 47)));
    for (let i = 0; i < drops; i++) {
      const seed = i + (foreground ? 901 : 501);
      const speed = foreground ? .12 : .075;
      const span = s.ground + 30;
      const y = (hash(seed) * span + s.time * speed) % span - 18;
      if (y > s.ground - 8) continue;
      const x = ((hash(seed + 33) * (s.width + 30) - s.time * speed * .18 - s.camera * .08) % (s.width + 30) + s.width + 30) % (s.width + 30) - 15;
      ctx.globalAlpha = foreground ? .13 : .08;
      line(ctx, [[x, y], [x - 2, Math.min(s.ground - 2, y + (foreground ? 9 : 6))]], C.muted);
    }
  }
  ctx.globalAlpha = 1;
}

function platform(ctx, p, s) {
  const x = p.x - s.camera;
  if (x + p.w < 0 || x > s.width) return;
  const h = Math.max(12, p.h || 14);
  box(ctx, x, p.y, p.w, h, 2, C.side, C.trim);
  rect(ctx, x + 2, p.y, p.w - 4, 3, C.mint);
  for (let i = 12; i < p.w - 8; i += 24) rect(ctx, x + i, p.y + 7, 10, 2, C.trim);
  rect(ctx, x + 8, p.y + h, 8, 3, C.inset);
  rect(ctx, x + p.w - 16, p.y + h, 8, 3, C.inset);
}

function collectible(ctx, item, s, effects) {
  if (s.collected?.has(item.id)) return;
  const x = Math.round(item.x - s.camera);
  if (x < -20 || x > s.width + 20) return;
  const y = Math.round(item.y + (effects ? Math.sin(s.time * .0025 + item.x) * 3 : 0));
  if (effects) {
    ctx.globalAlpha = .08;
    box(ctx, x - 10, y - 13, 20, 26, 5, C.amber, null);
    ctx.globalAlpha = 1;
  }
  box(ctx, x - 5, y - 8, 10, 16, 2, C.amber, '#ad8954');
  rect(ctx, x - 3, y - 6, 2, 11, C.amberLight);
  rect(ctx, x + 1, y - 4, 2, 2, '#b48a4e');
  rect(ctx, x + 1, y + 1, 2, 2, '#b48a4e');
}

function dust(ctx, s, effects) {
  if (!effects) return;
  for (let i = 0; i < (s.dust || []).length; i++) {
    const p = s.dust[i];
    const age = Math.max(0, p.age / 320);
    if (age >= 1) continue;
    const direction = i % 2 ? 1 : -1;
    const x = p.x - s.camera + direction * age * 12;
    const y = p.y - age * 9;
    ctx.globalAlpha = (1 - age) * .35;
    rect(ctx, x, y, 3, 3, C.muted);
  }
  ctx.globalAlpha = 1;
}

// Pure pose geometry, expressed inside the unchanged 32 x 48 hero box. The
// engine supplies essential state even when atmosphere is off. `animated`
// controls only the optional cycling/settling within an already distinct pose.
export function getRobotPose({ pose = 'idle', poseAge = 0, walkTime = 0, animated = false } = {}) {
  let lean = 0, lift = 0, headLift = 0;
  let leftArm = [[6, 24], [4, 29], [4, 34]];
  let rightArm = [[26, 24], [28, 29], [28, 34]];
  let leftLeg = [[11, 34], [10, 40], [9, 46]];
  let rightLeg = [[21, 34], [22, 40], [23, 46]];
  const age = Math.max(0, Number(poseAge) || 0);
  const clock = Number(walkTime) || 0;
  if (pose === 'walk') {
    const stride = animated ? Math.sin(clock * .018) : .78;
    const step = stride * 4;
    lean = 1;
    lift = animated ? -Math.abs(stride) * .55 : 0;
    leftArm = [[6, 24], [5 - step * .35, 29], [6 - step * .7, 34 + step * .35]];
    rightArm = [[26, 24], [27 + step * .35, 29], [26 + step * .7, 34 - step * .35]];
    leftLeg = [[11, 34], [10 + step * .5, 40], [9 + step, 46 - Math.max(0, -stride) * 4]];
    rightLeg = [[21, 34], [22 - step * .5, 40], [23 - step, 46 - Math.max(0, stride) * 4]];
  } else if (pose === 'rise') {
    lean = 1; lift = -1; headLift = -1;
    leftArm = [[6, 24], [3, 28], [3, 31]];
    rightArm = [[26, 23], [27, 19], [26, 16]];
    leftLeg = [[11, 34], [11, 38], [15, 41]];
    rightLeg = [[21, 34], [25, 34], [25, 39]];
  } else if (pose === 'fall') {
    leftArm = [[6, 24], [3, 21], [3, 18]];
    rightArm = [[26, 24], [29, 21], [29, 18]];
    leftLeg = [[11, 34], [8, 40], [7, 46]];
    rightLeg = [[21, 34], [25, 40], [25, 46]];
  } else if (pose === 'land') {
    const settle = animated ? Math.max(0, 1 - age / 180) : 1;
    lift = 5 * settle; headLift = lift;
    leftArm = [[6, 24 + lift], [4, 30 + lift * .5], [3, 35 + lift * .3]];
    rightArm = [[26, 24 + lift], [28, 30 + lift * .5], [29, 35 + lift * .3]];
    leftLeg = [[11, 34 + lift], [6, 41 + settle], [7, 46]];
    rightLeg = [[21, 34 + lift], [26, 41 + settle], [25, 46]];
  } else if (animated) {
    lift = Math.sin(age * .0025) * .55;
    headLift = lift;
  }
  if (pose === 'walk') headLift = lift;
  // Leave room for the outer 6px mechanical limb stroke and pixel alignment.
  for (const arm of [leftArm, rightArm]) for (const point of arm) point[0] = Math.max(3, Math.min(28, point[0]));
  return { pose, lean, lift, headLift, leftArm, rightArm, leftLeg, rightLeg };
}

function limb(ctx, points, back = false, hand = false) {
  line(ctx, points, C.charcoal, 6);
  line(ctx, points, back ? C.trim : C.muted, 4);
  const joint = points[1];
  rect(ctx, joint[0] - 1, joint[1] - 1, 3, 3, C.side);
  const end = points[2];
  if (hand) box(ctx, end[0] - 2, end[1] - 1, 4, 5, 1, C.teal, null);
  else {
    rect(ctx, end[0] - 4, end[1] - 1, 9, 3, back ? C.trim : C.muted);
    rect(ctx, end[0] + 2, end[1] - 1, 3, 2, C.light);
  }
}

function robot(ctx, s, effects) {
  const h = s.hero;
  if (!h) return;
  const x = Math.round(h.x - s.camera), y = Math.round(h.y);
  // Older callers retain a sensible essential pose; timing is never inferred
  // from dust, because dust is intentionally absent with effects disabled.
  const inferred = h.onGround ? (Math.abs(h.vx) > .2 ? 'walk' : 'idle') : (h.vy < 0 ? 'rise' : 'fall');
  const pose = getRobotPose({ pose: s.heroPose || inferred, poseAge: s.poseAge, walkTime: s.walkTime ?? s.time, animated: effects });
  ctx.globalAlpha = .26;
  ctx.fillStyle = C.charcoal; ctx.beginPath();
  const altitude = Math.max(0, s.ground - y - h.h);
  ctx.ellipse(x + h.w / 2, s.ground + 4, Math.max(7, 15 - altitude * .025), 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(h.w / 32, h.h / 48);
  if (h.facing < 0) { ctx.translate(32, 0); ctx.scale(-1, 1); }
  limb(ctx, pose.leftLeg, true);
  limb(ctx, pose.leftArm, true, true);
  // Separate neck, chest, shoulder plates and head keep it a small machine,
  // with one instrument visor instead of oversized character eyes.
  const bx = 7 + pose.lean, by = 22 + pose.lift;
  rect(ctx, 13 + pose.lean, 19 + pose.headLift, 6, 5, C.trim);
  shape(ctx, [[bx + 2, by], [bx + 16, by], [bx + 19, by + 4], [bx + 17, by + 13], [bx, by + 13], [bx - 1, by + 4]], C.body, C.mint);
  rect(ctx, bx + 3, by + 3, 10, 3, C.side);
  rect(ctx, bx + 4, by + 9, 8, 2, C.teal);
  rect(ctx, bx - 2, by + 1, 3, 6, C.muted);
  rect(ctx, bx + 17, by + 1, 3, 6, C.trim);
  const hx = 5 + pose.lean, hy = 5 + pose.headLift;
  shape(ctx, [[hx + 3, hy], [hx + 18, hy], [hx + 22, hy + 4], [hx + 22, hy + 14], [hx + 18, hy + 17], [hx + 2, hy + 17], [hx, hy + 13], [hx, hy + 3]], C.body, C.mint);
  rect(ctx, hx + 3, hy + 2, 14, 2, C.side);
  box(ctx, hx + 3, hy + 6, 16, 7, 1, C.light, null);
  rect(ctx, hx + 7, hy + 8, 10, 2, C.charcoal);
  rect(ctx, hx + 17, hy + 7, 2, 2, C.teal);
  rect(ctx, hx + 4, hy + 15, 7, 1, C.trim);
  const antennaY = Math.max(0, Math.round(hy - 5));
  rect(ctx, hx + 8, antennaY + 2, 2, Math.max(1, hy - antennaY - 2), C.trim);
  rect(ctx, hx + 7, antennaY, 4, 2, C.amber);
  limb(ctx, pose.rightLeg);
  limb(ctx, pose.rightArm, false, true);
  ctx.restore();
}

export function drawWorld(ctx, s) {
  if (!ctx || !s || !s.width || !s.height) return;
  const effects = Boolean(s.ambient) && !s.reducedMotion;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
  sky(ctx, s, effects);
  cityLayer(ctx, s, true, effects);
  cityLayer(ctx, s, false, effects);
  atmosphere(ctx, s, effects);
  floor(ctx, s);
  for (const item of s.terminals || []) terminal(ctx, item, s);
  for (const item of s.stations || []) station(ctx, item, s, effects);
  for (const p of s.platforms || []) platform(ctx, p, s);
  for (const item of s.collectibles || []) collectible(ctx, item, s, effects);
  dust(ctx, s, effects);
  robot(ctx, s, effects);
  atmosphere(ctx, s, effects, true);
  ctx.restore();
}
