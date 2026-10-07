// T06 — food at home tote
// A checkout belt rolls past real groceries. Tap one and a voice says "we have food at
// home." and it resets. Let 30 seconds pass untouched, then the tote rolls by: that's the
// only thing you take.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED;
  const QUIET_MS = 30000;
  const WALL = '#EFEAE0', FLOORY = 640;
  const head = art.heading(kit, 'we have food at home.', 'let everything roll past');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  // store wall with a quiet tile grid, and the checkout floor
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: WALL }));
  for (let r0 = 0; r0 < 9; r0++) for (let c = 0; c < 14; c++) svg.append(kit.svg('rect', { x: c * 72, y: r0 * 72, width: 68, height: 68, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.35 }));
  svg.append(kit.svg('rect', { x: 0, y: FLOORY + 220, width: 1000, height: 300, fill: art.shade(art.OAT, -0.04) }));

  // the belt: a long dark track with a moving tread pattern, divider bar and till at the end
  const beltTop = FLOORY + 140, beltH = 110;
  svg.append(kit.svg('rect', { x: 0, y: beltTop - 14, width: 1000, height: beltH + 28, rx: 10, fill: '#CFC9BC' }));
  svg.append(kit.svg('rect', { x: 0, y: beltTop, width: 1000, height: beltH, fill: '#B9B2A2' }));
  const tread = kit.svg('g');
  svg.append(tread);
  const treadMarks = Array.from({ length: 26 }, (_, i) => kit.svg('rect', { y: beltTop + 6, width: 10, height: beltH - 12, rx: 3, fill: '#A79F8D', opacity: 0.6 }));
  treadMarks.forEach((m) => tread.append(m));

  // till at the right: register body, screen, a receipt curl
  const till = kit.svg('g', { transform: 'translate(900 0)' });
  art.shadow(till, 0, beltTop + beltH + 18, 180);
  till.append(kit.svg('rect', { x: -80, y: beltTop - 190, width: 160, height: 190, rx: 14, fill: '#DCD6C8' }));
  till.append(kit.svg('rect', { x: -80, y: beltTop - 190, width: 160, height: 26, rx: 14, fill: art.shade('#DCD6C8', -0.14) }));
  till.append(kit.svg('rect', { x: -56, y: beltTop - 160, width: 112, height: 72, rx: 8, fill: art.NIGHT }));
  till.append(kit.svg('rect', { x: -48, y: beltTop - 150, width: 96, height: 50, rx: 4, fill: art.shade(art.NIGHT, 0.25), opacity: 0.5 }));
  till.append(kit.svg('path', { d: 'M -20 ' + (beltTop - 78) + ' q 10 16 20 0 q 10 16 20 0 l 0 30 l -40 0 Z', fill: '#fff', opacity: 0.9 }));
  svg.append(till);

  // the parent, standing beside the till, facing the belt
  const parent = art.person(kit, { x: 915, standOn: beltTop - 20, scale: 0.68, facing: -1, shirt: art.DUSTY, skin: art.SKINS[2], hair: 'bun', pose: 'stand', legs: true, mood: 'calm' });
  svg.append(parent.el);

  // speech bubble from the parent
  const bubble = kit.svg('g', { opacity: 0 });
  bubble.append(kit.svg('rect', { x: 640, y: beltTop - 300, width: 290, height: 64, rx: 16, fill: '#fff', stroke: ink, 'stroke-width': 3 }));
  bubble.append(kit.svg('path', { d: `M ${860} ${beltTop - 238} l 24 30 l -40 -6 Z`, fill: '#fff', stroke: ink, 'stroke-width': 3 }));
  const bubbleText = kit.svg('text', { x: 785, y: beltTop - 264, 'text-anchor': 'middle', 'font-size': 20, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
  bubble.append(bubbleText);
  svg.append(bubble);

  // a divider bar (the plastic "next customer" stick) riding the belt with the groceries
  function dividerBar() {
    const w = 18, h = 92;
    const g = kit.svg('g');
    art.shadow(g, 0, 4, 60);
    g.append(kit.svg('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 6, fill: ink }));
    g.append(kit.svg('rect', { x: -w / 2, y: -h, width: w * 0.4, height: h, rx: 4, fill: art.shade(ink, 0.3), opacity: 0.4 }));
    return { el: g, w: 70, h };
  }

  // nine grocery shapes, each drawn with care, ground point at local (0,0)
  function chocolateBar(color) {
    const w = 104, h = 34;
    const g = kit.svg('g');
    g.append(kit.svg('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 6, fill: color }));
    g.append(kit.svg('rect', { x: -w / 2, y: -h, width: w, height: h * 0.4, rx: 6, fill: art.shade(color, 0.16), opacity: 0.55 }));
    for (let i = 1; i < 5; i++) g.append(kit.svg('line', { x1: -w / 2 + (i * w) / 5, y1: -h, x2: -w / 2 + (i * w) / 5, y2: 0, stroke: art.shade(color, -0.25), 'stroke-width': 2, opacity: 0.5 }));
    g.append(kit.svg('rect', { x: -w * 0.3, y: -h * 0.7, width: w * 0.6, height: h * 0.3, rx: 3, fill: art.PAPER, opacity: 0.85 }));
    return { el: g, w, h };
  }
  function chipsBag(color) {
    const w = 86, h = 118;
    const g = kit.svg('g');
    g.append(kit.svg('path', { d: `M ${-w * 0.3} 0 L ${-w / 2} ${-h * 0.8} L ${w / 2} ${-h * 0.8} L ${w * 0.3} 0 Z`, fill: color }));
    const teeth = [];
    for (let i = 0; i <= 6; i++) teeth.push(`${i % 2 ? 'L' : 'L'} ${-w / 2 + (i * w) / 6} ${-h * 0.8 - (i % 2 ? 12 : 0)}`);
    g.append(kit.svg('path', { d: `M ${-w / 2} ${-h * 0.8} ${teeth.join(' ')}`, fill: 'none', stroke: art.shade(color, -0.32), 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    g.append(kit.svg('rect', { x: -w * 0.3, y: -h * 0.56, width: w * 0.6, height: h * 0.22, rx: 6, fill: art.PAPER, opacity: 0.88 }));
    g.append(kit.svg('line', { x1: -w * 0.2, y1: -h * 0.46, x2: w * 0.2, y2: -h * 0.46, stroke: art.shade(color, -0.2), 'stroke-width': 3, opacity: 0.6 }));
    g.append(kit.svg('rect', { x: w * 0.16, y: -h * 0.72, width: w * 0.12, height: h * 0.62, fill: art.shade(color, 0.18), opacity: 0.45 }));
    return { el: g, w, h };
  }
  function cookiesPacket(color) {
    const w = 96, h = 70;
    const g = kit.svg('g');
    g.append(kit.svg('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 10, fill: color }));
    g.append(kit.svg('circle', { cx: 0, cy: -h * 0.55, r: h * 0.32, fill: art.PAPER, opacity: 0.9 }));
    for (const [dx, dy] of [[-10, -6], [10, -6], [0, 10], [-12, 12], [12, 10]]) g.append(kit.svg('circle', { cx: dx, cy: -h * 0.55 + dy, r: 5, fill: art.shade(color, -0.2) }));
    g.append(kit.svg('rect', { x: -w / 2, y: -h, width: w, height: h * 0.18, rx: 10, fill: art.shade(color, 0.16), opacity: 0.5 }));
    return { el: g, w, h };
  }
  function cheeseWedge(color) {
    const w = 90, h = 66;
    const g = kit.svg('g');
    g.append(kit.svg('path', { d: `M ${-w / 2} 0 L ${w / 2} 0 L 10 ${-h} Z`, fill: color }));
    g.append(kit.svg('path', { d: `M ${-w / 2} 0 L 10 ${-h} L ${-w / 2 + 16} ${-h * 0.2} Z`, fill: art.shade(color, 0.16), opacity: 0.6 }));
    for (const [dx, dy, rr] of [[-8, -16, 6], [10, -32, 5], [-20, -6, 4]]) g.append(kit.svg('circle', { cx: dx, cy: dy, r: rr, fill: art.shade(color, -0.2) }));
    return { el: g, w, h };
  }
  function pineapple() {
    const w = 76, h = 120;
    const g = kit.svg('g');
    const bodyTop = -h * 0.84;
    g.append(kit.svg('ellipse', { cx: 0, cy: -h * 0.42, rx: w * 0.42, ry: h * 0.42, fill: art.BUTTER }));
    g.append(kit.svg('ellipse', { cx: 0, cy: -h * 0.42, rx: w * 0.42, ry: h * 0.42, fill: 'none', stroke: art.shade(art.BUTTER, -0.22), 'stroke-width': 2, opacity: 0.4 }));
    for (let i = -2; i <= 2; i++) {
      g.append(kit.svg('path', { d: `M ${-w * 0.4} ${-h * 0.42 + i * 15} q ${w * 0.4} 13 ${w * 0.8} 0`, stroke: art.shade(art.BUTTER, -0.25), 'stroke-width': 2, fill: 'none', opacity: 0.5 }));
      g.append(kit.svg('path', { d: `M ${-w * 0.4} ${-h * 0.42 + i * 15} q ${w * 0.4} -13 ${w * 0.8} 0`, stroke: art.shade(art.BUTTER, -0.25), 'stroke-width': 2, fill: 'none', opacity: 0.5 }));
    }
    for (const [dx, len] of [[-18, 44], [-6, 60], [6, 60], [18, 44]]) {
      g.append(kit.svg('path', { d: `M ${dx * 0.4} ${bodyTop} Q ${dx} ${bodyTop - len * 0.6} ${dx * 1.3} ${bodyTop - len}`, stroke: art.SPRUCE, 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }));
    }
    return { el: g, w, h };
  }
  function cakeSlice(color) {
    const w = 98, h = 100;
    const g = kit.svg('g');
    g.append(kit.svg('path', { d: `M ${-w / 2} 0 L ${w / 2} 0 L 0 ${-h} Z`, fill: color }));
    g.append(kit.svg('path', { d: `M ${-w * 0.38} ${-h * 0.34} L ${w * 0.38} ${-h * 0.34} L 0 ${-h} Z`, fill: '#fff', opacity: 0.85 }));
    g.append(kit.svg('rect', { x: -w / 2, y: -h * 0.34, width: w, height: 6, fill: art.shade(color, -0.22), opacity: 0.55 }));
    g.append(kit.svg('circle', { cx: 0, cy: -h * 1.02, r: 9, fill: '#C23B3B' }));
    g.append(kit.svg('circle', { cx: -3, cy: -h * 1.05, r: 3, fill: '#fff', opacity: 0.6 }));
    return { el: g, w, h };
  }
  function gumPack(color) {
    const w = 50, h = 32;
    const g = kit.svg('g');
    g.append(kit.svg('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 5, fill: color }));
    g.append(kit.svg('line', { x1: -w / 2 + 6, y1: -h / 2, x2: w / 2 - 6, y2: -h / 2, stroke: art.PAPER, 'stroke-width': 3, opacity: 0.75 }));
    return { el: g, w, h };
  }
  function soda() { return { el: art.can(kit, 0, 0, { color: art.CLAY }), w: 46, h: 110 }; }
  function cereal() { return { el: art.box(kit, 0, 0, { color: art.BUTTER }), w: 90, h: 130 }; }

  const RED = '#C23B3B';
  const ITEMS = [
    () => soda(), () => cereal(), () => chocolateBar(ink), () => chipsBag(art.DUSTY),
    () => cookiesPacket(art.CLAY), () => cheeseWedge(art.BUTTER), () => pineapple(), () => cakeSlice(RED),
    () => gumPack(art.SPRUCE), () => chipsBag(RED), () => cookiesPacket(art.shade(art.CLAY, 0.18)),
    () => cheeseWedge(art.shade(art.BUTTER, -0.1)), () => chocolateBar('#5A3A28'), () => cakeSlice(art.DUSTY),
    () => soda(), () => gumPack(art.CLAY), () => cereal(), () => dividerBar(),
    () => chipsBag(art.SPRUCE), () => cookiesPacket(RED),
  ];

  const belt = kit.svg('g');
  svg.append(belt);
  const SPACING = 150;
  const beltY = beltTop + beltH - 16;
  const items = ITEMS.map((make, i) => {
    const spec = make();
    const wrap = kit.svg('g', { style: { cursor: 'pointer' } });
    art.shadow(wrap, 0, 4, spec.w * 0.9);
    wrap.append(spec.el);
    const hit = kit.svg('circle', { cx: 0, cy: -spec.h / 2, r: Math.max(46, spec.w * 0.7), fill: ink, opacity: 0.0001 });
    wrap.append(hit);
    wrap._x = i * SPACING;
    belt.append(wrap);
    kit.on(wrap, 'pointerdown', () => tempt());
    return wrap;
  });
  const total = items.length * SPACING;
  let speed = 92; // px/s

  let lastTouch = performance.now();
  let toteSpawned = false;
  let tote = null;
  let started = false;

  function tempt() {
    if (!started) { started = true; }
    if (toteSpawned) return;
    lastTouch = performance.now();
    bubbleText.textContent = 'we have food at home.';
    bubble.setAttribute('opacity', 1);
    kit.after(750, () => bubble.setAttribute('opacity', 0));
  }

  function foldedTote() {
    const w = 118, h = 100;
    const g = kit.svg('g', { style: { cursor: 'pointer' } });
    art.shadow(g, 0, 4, w);
    g.append(kit.svg('rect', { x: -w / 2, y: -h * 0.6, width: w, height: h * 0.6, rx: 10, fill: art.BUTTER, stroke: ink, 'stroke-width': 4 }));
    g.append(kit.svg('path', { d: `M ${-w * 0.28} ${-h * 0.6} Q ${-w * 0.28} ${-h} 0 ${-h} Q ${w * 0.28} ${-h} ${w * 0.28} ${-h * 0.6}`, fill: 'none', stroke: ink, 'stroke-width': 8 }));
    g.append(kit.svg('rect', { x: -w / 2, y: -h * 0.26, width: w, height: 6, fill: art.shade(art.BUTTER, -0.18), opacity: 0.6 }));
    g.append(kit.svg('rect', { x: -w / 2, y: -h * 0.6, width: w, height: h * 0.18, rx: 10, fill: art.shade(art.BUTTER, 0.16), opacity: 0.5 }));
    return { el: g, w, h };
  }

  function spawnTote() {
    toteSpawned = true;
    bubbleText.textContent = '';
    bubble.setAttribute('opacity', 0);
    const spec = foldedTote();
    tote = spec.el;
    tote._x = -120;
    belt.append(tote);
    kit.on(tote, 'pointerdown', () => {
      kit.status('that one. just that one.');
      kit.after(300, () => {
        art.winBeat(kit, 'we have food at home.');
        kit.after(1100, () => kit.win('we have food at home.'));
      });
    });
  }

  kit.loop((dt) => {
    const dx = (speed * dt) / 1000;
    for (const g of items) {
      if (toteSpawned) { g.style.display = 'none'; continue; }
      g._x -= dx;
      if (g._x < -120) g._x += total;
      g.setAttribute('transform', `translate(${g._x}, ${beltY})`);
    }
    for (const m of treadMarks) {
      m._x = ((m._x ?? 0) - dx * 1.4);
      if (m._x < -20) m._x += (1000 / treadMarks.length);
      m.setAttribute('x', m._x);
    }
    if (tote) {
      tote._x += dx * 0.9;
      tote.setAttribute('transform', `translate(${tote._x}, ${beltY})`);
      if (tote._x > 1120) tote._x = -120;
    }
    const idle = performance.now() - lastTouch;
    if (!toteSpawned) {
      const left = Math.max(0, QUIET_MS - idle);
      kit.status(`${Math.ceil(left / 1000)}s of nothing tempting you`);
      if (idle >= QUIET_MS) spawnTote();
    }
  });

  treadMarks.forEach((m, i) => { m._x = i * (1000 / treadMarks.length); m.setAttribute('x', m._x); });

  kit.after(2600, () => head.hide());
  kit.status('30s of nothing tempting you');

  // Testing hook so check.mjs can drive a win without waiting 30s. Harmless: the game is
  // the fun, not a lock (see earned/README.md).
  window.__fah = { skipToTote: () => { lastTouch = -1e9; }, clickTote: () => tote && tote.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) };
}
