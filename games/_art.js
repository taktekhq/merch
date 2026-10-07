// _art.js — shared illustration library for Taktek unlock games.
// One light source (top-left) everywhere: shade() darkens toward ink for the shadow side,
// lightens toward paper for a highlight. Everything is built with kit.svg so it tears down
// cleanly with the game. Import with: import * as art from './_art.js'
//
//   import * as art from './_art.js';
//   const g = art.person(kit, { x: 500, y: 640, shirt: art.SPRUCE, pose: 'wave' });
//
// Coordinate convention for scene pieces (person/door/table/box/can/plant): (x, y) is the
// object's ground point — where it meets the floor — unless noted otherwise.

let uid = 0;
const nextId = (p) => `${p}${uid++}`;

// ---------------------------------------------------------------------------------------
// Palette (matches GAMES.md). Re-exported so games don't hand-roll hexes.
export const PAPER = '#F7F5F1';
export const CARD = '#EFECE6';
export const INK = '#0D0D0E';
export const MUTED = '#6B6A66';
export const ACCENT = '#00A862';
export const RULE = '#E4E0D8';
export const OAT = '#E8DFCF';
export const CLAY = '#C9764F';
export const BUTTER = '#F2D98A';
export const SPRUCE = '#2F4F46';
export const DUSTY = '#8FA6B8';
export const NIGHT = '#1B2230';
export const SKINS = ['#F1C7A5', '#D9A27E', '#A8714F', '#6E4A33'];
export const HAIRS = { ink: '#0D0D0E', brown: '#4A3426', butter: '#D9B65B', grey: '#A9A6A0' };

// Mix hex toward ink (k negative, shadow side) or toward paper (k positive, highlight).
// k is -1..1. shade(hex, -0.18) is the standard "shadow side" per POLISH.md; shade(hex, 0.12)
// is the standard highlight.
export function shade(hex, k) {
  const toward = k < 0 ? INK : PAPER;
  const t = Math.min(1, Math.abs(k));
  const a = hexToRgb(hex), b = hexToRgb(toward);
  const mix = (x, y) => Math.round(x + (y - x) * t);
  return rgbToHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b));
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) };
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// A soft contact shadow ellipse under something sitting on a surface. Appends to `parent`
// (any SVG container node) and returns the ellipse. w is the shadow's width at 1000 scale.
export function shadow(parent, x, y, w, opacity = 0.1) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  el.setAttribute('cx', x); el.setAttribute('cy', y);
  el.setAttribute('rx', w / 2); el.setAttribute('ry', Math.max(4, w * 0.11));
  el.setAttribute('fill', INK); el.setAttribute('opacity', opacity);
  parent.append(el);
  return el;
}

// Gentle idle sway, applied as an SVG `transform` ATTRIBUTE (not CSS) composed onto `base`
// (any transform already on the element, e.g. a translate) — ox,oy is the pivot in the
// element's OWN local coordinates (before `base`). CSS fill-box origins are deliberately
// avoided here: they're computed from the element's full bounding box, which rarely sits at
// the pivot you actually want, and silently throws off anything with an ancestor scale.
const sway = (kit, el, { amp = 2, period = 2600, ox = 0, oy = 0, base = '', axis = 'rotate' } = {}) => {
  if (kit.reducedMotion) return;
  const t0 = performance.now() + Math.random() * period;
  kit.loop(() => {
    const p = ((performance.now() - t0) % period) / period;
    const v = Math.sin(p * Math.PI * 2) * amp;
    const move = axis === 'rotate' ? `rotate(${v} ${ox} ${oy})` : `translate(0 ${v})`;
    el.setAttribute('transform', base ? `${base} ${move}` : move);
  });
};

// ---------------------------------------------------------------------------------------
// The top framing every stage uses: the product's line as a small heading (green dot full
// stop) and one short mono hint under it. Returns { hide() } — call hide() on first input.
// Pass `{ dark: true }` for a scene with a dark/night background (the heading is drawn in
// ink by default and otherwise vanishes): the line goes paper-coloured, the hint a muted
// light tone, green dot unchanged. `color`/`hintColor` override either explicitly.
export function heading(kit, line, hint, opts = {}) {
  const dark = !!opts.dark;
  const textColor = opts.color || (dark ? PAPER : INK);
  const hintColor = opts.hintColor || (dark ? 'rgba(247,245,241,0.6)' : MUTED);
  const wrap = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', top: '5%', textAlign: 'center', pointerEvents: 'none' } });
  const clean = line.replace(/\.\s*$/, '');
  const h = kit.el('div', {
    class: 'g-mono',
    style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: 'clamp(16px, 3.4vw, 22px)', color: textColor, letterSpacing: '-0.01em' },
  });
  const dot = kit.el('span', { style: { display: 'inline-block', width: '0.16em', height: '0.16em', borderRadius: '50%', background: ACCENT, marginLeft: '0.12em', marginBottom: '0.03em' } });
  h.append(clean, dot);
  const hintEl = kit.el('div', { class: 'g-mono', text: hint || '', style: { fontSize: '12px', color: hintColor, marginTop: '6px', transition: 'opacity .4s ease' } });
  wrap.append(h, hintEl);
  kit.stage.append(wrap);
  return { el: wrap, hide: () => { hintEl.style.opacity = '0'; } };
}

// The win moment's typography: the line, big and centred, green dot full stop, fading in.
// Call this after the scene's own little joke-beat, then kit.after(~1100, () => kit.win(...)).
export function winBeat(kit, line) {
  const clean = line.replace(/\.\s*$/, '');
  const box = kit.el('div', { class: 'g-center', style: { opacity: '0', transition: 'opacity .45s ease, transform .45s ease', transform: 'translateY(6px)' } });
  const big = kit.el('div', { class: 'g-big' });
  big.append(clean, kit.el('span', { style: { display: 'inline-block', width: '0.14em', height: '0.14em', borderRadius: '50%', background: ACCENT, marginLeft: '0.1em', marginBottom: '0.06em' } }));
  box.append(big);
  kit.stage.append(box);
  requestAnimationFrame(() => { box.style.opacity = '1'; box.style.transform = 'none'; });
  return box;
}

// ---------------------------------------------------------------------------------------
// A room shell: wall, floor, skirting line, and an optional window with light falling in.
// opts: { w, h, wall, floor, floorY, window:{x,y,w,h,night,curtain} }
export function room(kit, opts = {}) {
  const { w = 1000, h = 1000, wall = '#fff', floor = OAT, floorY = 760 } = opts;
  const g = kit.svg('g');
  g.append(kit.svg('rect', { x: 0, y: 0, width: w, height: h, fill: wall }));
  g.append(kit.svg('rect', { x: 0, y: floorY, width: w, height: h - floorY, fill: floor }));
  g.append(kit.svg('rect', { x: 0, y: floorY - 6, width: w, height: 6, fill: shade(floor, -0.15), opacity: 0.6 }));
  let win = null;
  if (opts.window) {
    const wo = opts.window;
    const night = !!wo.night;
    const frame = kit.svg('g');
    const sky = kit.svg('rect', { x: wo.x, y: wo.y, width: wo.w, height: wo.h, rx: 6, fill: night ? NIGHT : '#CFE6F2' });
    frame.append(sky);
    if (night) {
      for (let i = 0; i < 6; i++) frame.append(kit.svg('circle', { cx: wo.x + 14 + ((i * 37) % (wo.w - 20)), cy: wo.y + 10 + ((i * 53) % (wo.h - 40)), r: 1.6, fill: '#fff', opacity: 0.8 }));
      frame.append(kit.svg('circle', { cx: wo.x + wo.w * 0.72, cy: wo.y + wo.h * 0.28, r: 14, fill: '#EDE6D2', opacity: 0.9 }));
    } else if (wo.sun !== false) {
      frame.append(kit.svg('circle', { cx: wo.x + wo.w * 0.7, cy: wo.y + wo.h * 0.3, rx: 16, r: 16, fill: '#fff', opacity: 0.8 }));
    }
    frame.append(kit.svg('rect', { x: wo.x, y: wo.y, width: wo.w, height: wo.h, rx: 6, fill: 'none', stroke: shade(wall, -0.18), 'stroke-width': 8 }));
    frame.append(kit.svg('line', { x1: wo.x + wo.w / 2, y1: wo.y, x2: wo.x + wo.w / 2, y2: wo.y + wo.h, stroke: shade(wall, -0.18), 'stroke-width': 6 }));
    frame.append(kit.svg('line', { x1: wo.x, y1: wo.y + wo.h / 2, x2: wo.x + wo.w, y2: wo.y + wo.h / 2, stroke: shade(wall, -0.18), 'stroke-width': 6 }));
    let curtainL = null, curtainR = null;
    if (wo.curtain) {
      curtainL = kit.svg('path', { d: curtainPath(wo.x - 14, wo.y - 10, wo.h + 20, 1), fill: wo.curtain });
      curtainR = kit.svg('path', { d: curtainPath(wo.x + wo.w + 14, wo.y - 10, wo.h + 20, -1), fill: wo.curtain });
      frame.append(curtainL, curtainR);
      sway(kit, curtainL, { amp: 3, period: 3400, ox: wo.x - 14, oy: wo.y - 10 });
      sway(kit, curtainR, { amp: 3, period: 3100, ox: wo.x + wo.w + 14, oy: wo.y - 10 });
    }
    g.append(frame);
    if (wo.light && !night) {
      const beam = kit.svg('polygon', { points: `${wo.x},${wo.y + wo.h} ${wo.x + wo.w},${wo.y + wo.h} ${wo.x + wo.w + 160},${floorY} ${wo.x - 60},${floorY}`, fill: BUTTER, opacity: 0.14 });
      g.append(beam);
    }
    win = { frame, sky, curtainL, curtainR };
  }
  return { el: g, floorY, window: win };
}
function curtainPath(x, y, h, dir) {
  const w = 46 * dir;
  return `M ${x} ${y} q ${w * 0.6} ${h * 0.25} ${w * 0.2} ${h * 0.5} q ${-w * 0.3} ${h * 0.25} ${w * 0.1} ${h * 0.5} l ${-w * 0.35} 0 q ${-w * 0.1} ${-h * 0.25} 0 ${-h * 0.5} q ${w * 0.15} ${-h * 0.25} 0 ${-h * 0.5} Z`;
}

// A potted plant. (x, y) is where the pot sits on the floor. Sways gently.
export function plant(kit, x, y, opts = {}) {
  const { scale = 1, pot = CLAY, leaf = SPRUCE } = opts;
  const g = kit.svg('g', { transform: `translate(${x} ${y}) scale(${scale})` });
  shadow(g, 0, 4, 70);
  g.append(kit.svg('path', { d: 'M -40 0 L 40 0 L 30 -56 L -30 -56 Z', fill: pot }));
  g.append(kit.svg('path', { d: 'M -30 -56 L 30 -56 L 26 -64 L -26 -64 Z', fill: shade(pot, 0.12) }));
  const leaves = kit.svg('g', { transform: 'translate(0 -64)' });
  const blades = [[-6, -10, -70, -40], [8, -8, 60, -70], [0, 0, 0, -95], [-10, 4, -40, -60], [14, 2, 46, -48]];
  for (const [cx, cy, ex, ey] of blades) {
    leaves.append(kit.svg('path', { d: `M 0 0 Q ${cx} ${cy} ${ex} ${ey}`, stroke: leaf, 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round' }));
  }
  g.append(leaves);
  sway(kit, leaves, { amp: 2.2, period: 3200, base: 'translate(0 -64)', ox: 0, oy: 0 });
  return g;
}

// A panelled door with frame and a brass handle. (x, y) is top-left of the opening.
// opts: { w, h, color, open (0..1 swing), glow (warm light spilling from under it) }
export function door(kit, x, y, opts = {}) {
  const { w = 160, h = 380, color = SPRUCE, open = 0, glow = false, handleSide = 1 } = opts;
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  g.append(kit.svg('rect', { x: -10, y: -10, width: w + 20, height: h + 14, rx: 6, fill: shade(color, -0.12) }));
  if (glow) g.append(kit.svg('rect', { x: 2, y: h - 10, width: w - 4, height: 16, fill: BUTTER, opacity: 0.55, filter: 'blur(1px)' }));
  const panel = kit.svg('g', { transform: `scale(${1 - open * 0.7} 1)`, style: { transformBox: 'fill-box', transformOrigin: handleSide > 0 ? '0% 50%' : '100% 50%' } });
  panel.append(kit.svg('rect', { x: 0, y: 0, width: w, height: h, rx: 4, fill: color }));
  panel.append(kit.svg('rect', { x: w * 0.14, y: h * 0.08, width: w * 0.72, height: h * 0.36, rx: 8, fill: shade(color, 0.08), stroke: shade(color, -0.15), 'stroke-width': 3 }));
  panel.append(kit.svg('rect', { x: w * 0.14, y: h * 0.52, width: w * 0.72, height: h * 0.4, rx: 8, fill: shade(color, 0.08), stroke: shade(color, -0.15), 'stroke-width': 3 }));
  panel.append(kit.svg('rect', { x: w * 0.78, y: h * 0.1, width: w * 0.08, height: h * 0.8, fill: shade(color, -0.18), opacity: 0.5 }));
  panel.append(kit.svg('circle', { cx: handleSide > 0 ? w * 0.86 : w * 0.14, cy: h * 0.55, r: 8, fill: BUTTER, stroke: shade(BUTTER, -0.2), 'stroke-width': 2 }));
  g.append(panel);
  return { el: g, panel };
}

// A tabletop with tapered legs and quiet wood-grain lines. (x, y) is the floor point under it.
export function table(kit, x, y, opts = {}) {
  const { w = 260, h = 24, legH = 120, color = '#C9A36A' } = opts;
  const g = kit.svg('g', { transform: `translate(${x - w / 2} ${y - legH - h})` });
  shadow(g, w / 2, legH + h + 6, w * 0.9);
  g.append(kit.svg('rect', { x: 14, y: h, width: 12, height: legH, fill: shade(color, -0.15) }));
  g.append(kit.svg('rect', { x: w - 26, y: h, width: 12, height: legH, fill: shade(color, -0.15) }));
  g.append(kit.svg('rect', { x: 0, y: 0, width: w, height: h, rx: 6, fill: color }));
  for (let i = 0; i < 4; i++) g.append(kit.svg('path', { d: `M ${10 + i * (w - 20) / 3} ${h * 0.3} q ${w / 8} ${h * 0.4} 0 ${h * 0.6}`, stroke: shade(color, -0.12), 'stroke-width': 1.6, fill: 'none', opacity: 0.4 }));
  g.append(kit.svg('rect', { x: 0, y: 0, width: w, height: h * 0.4, rx: 6, fill: shade(color, 0.14), opacity: 0.6 }));
  return g;
}

// A cereal-style grocery box: front panel, label band, a little bowl mark. (x, y) = base centre.
export function box(kit, x, y, opts = {}) {
  const { w = 90, h = 130, color = CLAY, label = PAPER } = opts;
  const g = kit.svg('g', { transform: `translate(${x - w / 2} ${y - h})` });
  shadow(g, w / 2, h + 4, w);
  g.append(kit.svg('rect', { x: 0, y: 0, width: w, height: h, rx: 6, fill: color }));
  g.append(kit.svg('rect', { x: w * 0.82, y: 0, width: w * 0.18, height: h, fill: shade(color, -0.16) }));
  g.append(kit.svg('rect', { x: w * 0.1, y: h * 0.12, width: w * 0.8, height: h * 0.34, rx: 4, fill: label }));
  g.append(kit.svg('path', { d: `M ${w * 0.3} ${h * 0.37} a ${w * 0.2} ${w * 0.12} 0 0 0 ${w * 0.4} 0 z`, fill: shade(color, -0.1) }));
  for (let i = 0; i < 3; i++) g.append(kit.svg('circle', { cx: w * 0.36 + i * w * 0.14, cy: h * 0.31, r: 3, fill: color }));
  g.append(kit.svg('rect', { x: w * 0.1, y: h * 0.56, width: w * 0.8, height: 6, rx: 3, fill: shade(color, -0.1), opacity: 0.6 }));
  g.append(kit.svg('rect', { x: w * 0.1, y: h * 0.68, width: w * 0.5, height: 6, rx: 3, fill: shade(color, -0.1), opacity: 0.4 }));
  return g;
}

// A soda can: cylinder body, band, ring pull. (x, y) = base centre.
export function can(kit, x, y, opts = {}) {
  const { w = 46, h = 110, color = CLAY } = opts;
  const g = kit.svg('g', { transform: `translate(${x - w / 2} ${y - h})` });
  shadow(g, w / 2, h + 3, w * 1.2);
  g.append(kit.svg('rect', { x: 0, y: 0, width: w, height: h, rx: w * 0.4, fill: color }));
  g.append(kit.svg('rect', { x: w * 0.68, y: 0, width: w * 0.22, height: h, rx: w * 0.1, fill: shade(color, -0.16) }));
  g.append(kit.svg('rect', { x: w * 0.12, y: 0, width: w * 0.16, height: h, rx: w * 0.08, fill: shade(color, 0.18), opacity: 0.7 }));
  g.append(kit.svg('rect', { x: 0, y: h * 0.38, width: w, height: h * 0.22, fill: shade(color, 0.1) }));
  g.append(kit.svg('ellipse', { cx: w / 2, cy: 6, rx: w * 0.46, ry: 6, fill: shade(color, 0.2) }));
  g.append(kit.svg('rect', { x: w * 0.4, y: -2, width: w * 0.2, height: 6, rx: 3, fill: shade(color, -0.3) }));
  return g;
}

// ---------------------------------------------------------------------------------------
// A friendly, proportioned little person: head, hair, neck, shoulders, collar, arms, hands.
// (x, y) is the shoulder line (where the neck meets the torso). opts:
//   scale, facing (1|-1), skin, hair ('short'|'bun'|'bald'), hairColor, shirt,
//   pose ('stand'|'wave'|'reach'|'lean'), reachTo ({x,y} local, for 'reach'), legs (bool),
//   idle (bool, breathing loop), mood ('calm'|'smile'|'oh')
// Returns { el, head, face } — face lets a caller tweak the mouth/eyes later.
// Pass `standOn` (a floor y) instead of `y` to have the feet land exactly on that line.
const PERSON_FEET_Y = 276; // local y of the feet when legs: true
export function person(kit, opts = {}) {
  const {
    x = 500, scale = 1, facing = 1,
    skin = SKINS[0], hair = 'short', hairColor = HAIRS.ink,
    shirt = SPRUCE, pose = 'stand', reachTo = { x: 150, y: -20 },
    legs = true, idle = true, mood = 'calm',
  } = opts;
  const y = opts.standOn != null ? opts.standOn - (legs ? PERSON_FEET_Y : 168) * scale : (opts.y ?? 640);

  const root = kit.svg('g', { transform: `translate(${x} ${y})` });
  const body = kit.svg('g', { transform: `scale(${scale * facing} ${scale})` });
  root.append(body);

  if (legs) shadow(root, 4, PERSON_FEET_Y * scale, 110 * scale);

  // legs
  if (legs) {
    const pants = shade(shirt, -0.3);
    body.append(kit.svg('rect', { x: -44, y: 150, width: 38, height: 120, rx: 14, fill: pants }));
    body.append(kit.svg('rect', { x: 6, y: 150, width: 38, height: 120, rx: 14, fill: pants }));
    body.append(kit.svg('rect', { x: -44, y: 258, width: 44, height: 18, rx: 9, fill: INK }));
    body.append(kit.svg('rect', { x: 0, y: 258, width: 44, height: 18, rx: 9, fill: INK }));
  }

  // arms (behind torso on the far side, in front on the near side)
  const armColor = skin;
  const farArm = limbPath(kit, pose === 'wave' || pose === 'reach' ? -1 : -1, { skin: armColor });
  body.append(farArm.el, farArm.hand);

  // torso + collar
  const lean = pose === 'lean' ? 10 : 0;
  const torso = kit.svg('g', { transform: `rotate(${lean})` });
  torso.append(kit.svg('rect', { x: -64, y: 0, width: 128, height: 168, rx: 30, fill: shirt }));
  torso.append(kit.svg('rect', { x: 20, y: 6, width: 44, height: 160, rx: 26, fill: shade(shirt, -0.16), opacity: 0.65 }));
  torso.append(kit.svg('rect', { x: -60, y: 4, width: 30, height: 150, rx: 22, fill: shade(shirt, 0.14), opacity: 0.4 }));
  torso.append(kit.svg('path', { d: 'M -22 0 L 0 26 L 22 0 L 10 -6 L -10 -6 Z', fill: shade(shirt, -0.2) }));
  body.append(torso);

  // neck + head
  const headY = -92;
  body.append(kit.svg('rect', { x: -17, y: headY + 58, width: 34, height: 30, fill: shade(skin, -0.08) }));
  const headG = kit.svg('g', { transform: `translate(0 ${headY})` });
  const face = buildHead(kit, skin, hairColor, hair, mood, facing);
  headG.append(...face.nodes);
  body.append(headG);

  // near arm, drawn after torso so the hand reads in front
  const nearArm = limbPath(kit, 1, { skin: armColor, pose, reachTo, headY });
  body.append(nearArm.el, nearArm.hand);

  if (pose === 'lean') {
    // push hands land on whatever the caller places ahead; just extend both arms forward
    nearArm.el.setAttribute('d', pathArm(70, 20, 150, -10, 190, -14));
    farArm.el.setAttribute('d', pathArm(-70, 20, -140, -14, -186, -18));
    nearArm.hand.setAttribute('cx', 190); nearArm.hand.setAttribute('cy', -14);
    farArm.hand.setAttribute('cx', -186); farArm.hand.setAttribute('cy', -18);
  }

  if (idle && !kit.reducedMotion) {
    // Breathing via the SVG `transform` ATTRIBUTE (not CSS style): a CSS transform here would
    // anchor on body's fill-box (head-to-feet), which sits nowhere near local (0,0) and silently
    // shifts the whole figure. The attribute always scales from exactly local (0,0) — no surprise offset.
    const t0 = performance.now() + Math.random() * 900;
    kit.loop(() => {
      const p = ((performance.now() - t0) % 2400) / 2400;
      const s = 1 + Math.sin(p * Math.PI * 2) * 0.012;
      body.setAttribute('transform', `scale(${scale * facing} ${scale * s})`);
    });
  }
  if (pose === 'wave' && !kit.reducedMotion) {
    const t0 = performance.now();
    kit.loop(() => {
      const a = Math.sin((performance.now() - t0) / 260) * 16;
      const g = `rotate(${a} 70 10)`;
      nearArm.el.setAttribute('transform', g);
      nearArm.hand.setAttribute('transform', g);
    });
  }

  return { el: root, head: headG, face };
}

function limbPath(kit, side, opts = {}) {
  const { skin, pose, reachTo, headY = -92 } = opts;
  let d, hx, hy;
  if (side > 0 && pose === 'wave') { d = pathArm(70, 10, 110, headY + 60, 86, headY + 30); hx = 86; hy = headY + 30; }
  else if (side > 0 && pose === 'reach') { d = pathArm(70, 10, (70 + reachTo.x) / 2, (10 + reachTo.y) / 2 - 14, reachTo.x, reachTo.y); hx = reachTo.x; hy = reachTo.y; }
  else { d = pathArm(68 * side, 10, 80 * side, 90, 76 * side, 168); hx = 76 * side; hy = 168; }
  const el = kit.svg('path', { d, stroke: skin, 'stroke-width': 28, fill: 'none', 'stroke-linecap': 'round' });
  const hand = kit.svg('circle', { cx: hx, cy: hy, r: 15, fill: skin });
  return { el, hand, hx, hy };
}
function pathArm(x1, y1, x2, y2, x3, y3) { return `M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3}`; }

function buildHead(kit, skin, hairColor, style, mood, facing) {
  const nodes = [];
  const r = 58;
  nodes.push(kit.svg('circle', { cx: 0, cy: 0, r, fill: skin }));
  nodes.push(kit.svg('path', { d: `M 10 -${r - 6} A ${r} ${r} 0 0 1 ${r - 4} 8 L ${r - 20} 8 A ${r - 14} ${r - 14} 0 0 0 10 -${r - 6} Z`, fill: shade(skin, -0.15), opacity: 0.55 }));
  nodes.push(kit.svg('ellipse', { cx: -22, cy: -34, rx: 20, ry: 14, fill: shade(skin, 0.22), opacity: 0.5 }));
  // ears
  nodes.push(kit.svg('circle', { cx: -r + 6, cy: 6, r: 9, fill: skin }));
  nodes.push(kit.svg('circle', { cx: r - 6, cy: 6, r: 9, fill: skin }));
  // hair
  if (style !== 'bald') {
    nodes.push(kit.svg('path', { d: `M ${-r - 2} 4 A ${r + 4} ${r + 4} 0 0 1 ${r + 2} 4 A ${r + 14} ${r + 14} 0 0 0 ${-r - 2} 4 Z`, fill: hairColor }));
    if (style === 'bun') nodes.push(kit.svg('circle', { cx: 0, cy: -r - 10, r: 16, fill: hairColor }));
    nodes.push(kit.svg('path', { d: `M -${r} 10 q -4 26 10 34 q -14 -2 -16 -30 Z`, fill: hairColor }));
  }
  // face: eyes + brow + mouth, offset a touch toward `facing` so it reads front-ish
  const ex = 20 * facing;
  const m = mood === 'shock' ? 'M -16 30 a 10 10 0 1 0 0.1 0' : mood === 'smile' ? 'M -18 26 Q 0 42 18 26' : 'M -14 30 Q 0 36 14 30';
  nodes.push(kit.svg('circle', { cx: -ex * 0.6, cy: -4, r: 5, fill: INK }));
  nodes.push(kit.svg('circle', { cx: ex * 0.6, cy: -4, r: 5, fill: INK }));
  nodes.push(kit.svg('path', { d: m, stroke: INK, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round' }));
  return { nodes, mouth: nodes[nodes.length - 1], eyes: [nodes[nodes.length - 3], nodes[nodes.length - 2]] };
}
