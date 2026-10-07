// T07 — 5 minutes away tee
// Ten seconds to find keys, phone, wallet and sunglasses in a messy hallway. Make the door.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED;
  const TOTAL_MS = 10000;
  const WALL = '#EFEAE0', FLOORY = 800;

  // Custom heading: the tee's line has no full stop — the green dot sits under it as a
  // printed mark instead of acting as punctuation (unlike art.heading's inline dot).
  function headingDotUnder(line, hint) {
    const wrap = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', top: '5%', textAlign: 'center', pointerEvents: 'none' } });
    const h = kit.el('div', { class: 'g-mono', text: line, style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: 'clamp(16px, 3.4vw, 22px)', color: ink, letterSpacing: '-0.01em' } });
    const dot = kit.el('div', { style: { width: '9px', height: '9px', borderRadius: '50%', background: art.ACCENT, margin: '7px auto 0' } });
    const hintEl = kit.el('div', { class: 'g-mono', text: hint || '', style: { fontSize: '12px', color: muted, marginTop: '6px', transition: 'opacity .4s ease' } });
    wrap.append(h, dot, hintEl);
    kit.stage.append(wrap);
    return { el: wrap, hide: () => { hintEl.style.opacity = '0'; } };
  }
  const head = headingDotUnder('5 minutes away', 'ten seconds — find everything, then the door');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const r = art.room(kit, { wall: WALL, floor: art.OAT, floorY: FLOORY, window: { x: 60, y: 190, w: 150, h: 190, curtain: art.DUSTY, sun: true } });
  svg.append(r.el);

  // coat hooks with coats, above the bench
  const hooks = kit.svg('g');
  svg.append(hooks);
  const hookXs = [330, 400, 470];
  const coatColors = [art.CLAY, art.SPRUCE, art.shade(art.DUSTY, -0.1)];
  hookXs.forEach((hx, i) => {
    hooks.append(kit.svg('circle', { cx: hx, cy: 260, r: 7, fill: art.shade(WALL, -0.3) }));
    const coat = kit.svg('path', { d: `M ${hx - 34} 270 Q ${hx} 250 ${hx + 34} 270 L ${hx + 40} 420 Q ${hx} 440 ${hx - 40} 420 Z`, fill: coatColors[i] });
    hooks.append(coat);
    hooks.append(kit.svg('path', { d: `M ${hx - 34} 270 L ${hx - 50} 330`, stroke: coatColors[i], 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round' }));
    hooks.append(kit.svg('path', { d: `M ${hx + 34} 270 L ${hx + 50} 330`, stroke: coatColors[i], 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round' }));
  });

  // a bench along the wall, shoes scattered under it
  svg.append(kit.svg('rect', { x: 270, y: 560, width: 300, height: 26, rx: 8, fill: '#C9A36A' }));
  svg.append(kit.svg('rect', { x: 290, y: 586, width: 14, height: 70, fill: art.shade('#C9A36A', -0.2) }));
  svg.append(kit.svg('rect', { x: 530, y: 586, width: 14, height: 70, fill: art.shade('#C9A36A', -0.2) }));
  for (const [sx, sy, rot, col] of [[300, 700, -8, art.CLAY], [350, 712, 10, art.INK], [420, 696, -4, art.DUSTY]]) {
    const g = kit.svg('g', { transform: `translate(${sx} ${sy}) rotate(${rot})` });
    g.append(kit.svg('path', { d: 'M -34 10 Q -34 -10 0 -10 L 34 -6 Q 40 6 20 12 Z', fill: col }));
    svg.append(g);
  }

  // a mail pile and a bowl on a small side table
  const sideTable = art.table(kit, 760, FLOORY, { w: 150, h: 16, legH: 90, color: '#C9A36A' });
  svg.append(sideTable);
  for (let i = 0; i < 4; i++) svg.append(kit.svg('rect', { x: 700 + i * 3, y: FLOORY - 106 - i * 3, width: 70, height: 48, rx: 3, fill: i % 2 ? art.PAPER : art.shade(art.PAPER, -0.06), stroke: art.shade(art.PAPER, -0.2), 'stroke-width': 2, transform: `rotate(${i * 3 - 5} ${735 + i * 3} ${FLOORY - 82 - i * 3})` }));

  // a canvas bag slumped by the door
  const bagG = kit.svg('g', { transform: `translate(820 ${FLOORY - 10})` });
  art.shadow(bagG, 0, 4, 120);
  bagG.append(kit.svg('path', { d: 'M -56 0 Q -62 -70 0 -72 Q 62 -70 56 0 Z', fill: art.BUTTER }));
  bagG.append(kit.svg('path', { d: 'M -30 -72 Q -30 -102 0 -102 Q 30 -102 30 -72', fill: 'none', stroke: ink, 'stroke-width': 7 }));
  svg.append(bagG);

  // the door, dim until everything's found, then it opens to daylight
  const d = art.door(kit, 860, 180, { w: 150, h: 560, color: art.SPRUCE, handleSide: -1 });
  svg.append(d.el);
  const daylight = kit.svg('rect', { x: 860, y: 180, width: 150, height: 560, rx: 6, fill: art.BUTTER, opacity: 0 });
  svg.append(daylight);

  // the four things, drawn for real, tucked among the clutter
  function keys(x, y) {
    const g = kit.svg('g', { transform: `translate(${x} ${y})` });
    g.append(kit.svg('circle', { cx: 0, cy: 0, r: 22, fill: 'none', stroke: '#B9AE86', 'stroke-width': 6 }));
    for (const [a, len] of [[0.3, 30], [1.1, 24]]) {
      g.append(kit.svg('line', { x1: 22 * Math.cos(a), y1: 22 * Math.sin(a), x2: (22 + len) * Math.cos(a), y2: (22 + len) * Math.sin(a), stroke: '#B9AE86', 'stroke-width': 7, 'stroke-linecap': 'round' }));
      g.append(kit.svg('rect', { x: (22 + len - 6) * Math.cos(a) - 3, y: (22 + len - 6) * Math.sin(a) - 8, width: 10, height: 16, fill: '#B9AE86' }));
    }
    return g;
  }
  function phone(x, y) {
    const g = kit.svg('g', { transform: `translate(${x} ${y}) rotate(-12)` });
    g.append(kit.svg('rect', { x: -22, y: -42, width: 44, height: 84, rx: 10, fill: ink }));
    g.append(kit.svg('rect', { x: -18, y: -36, width: 36, height: 68, rx: 4, fill: art.shade(art.DUSTY, 0.1) }));
    g.append(kit.svg('circle', { cx: 0, cy: -46, r: 2.4, fill: art.shade(ink, 0.2) }));
    return g;
  }
  function wallet(x, y) {
    const g = kit.svg('g', { transform: `translate(${x} ${y}) rotate(8)` });
    g.append(kit.svg('rect', { x: -36, y: -24, width: 72, height: 48, rx: 6, fill: '#5A3A28' }));
    g.append(kit.svg('rect', { x: -36, y: -24, width: 72, height: 18, rx: 6, fill: art.shade('#5A3A28', 0.14), opacity: 0.6 }));
    g.append(kit.svg('rect', { x: -14, y: -34, width: 44, height: 20, rx: 3, fill: art.PAPER, opacity: 0.9 }));
    return g;
  }
  function glasses(x, y) {
    const g = kit.svg('g', { transform: `translate(${x} ${y}) rotate(-4)` });
    g.append(kit.svg('ellipse', { cx: -24, cy: 0, rx: 22, ry: 16, fill: art.NIGHT }));
    g.append(kit.svg('ellipse', { cx: 24, cy: 0, rx: 22, ry: 16, fill: art.NIGHT }));
    g.append(kit.svg('line', { x1: -2, y1: -2, x2: 2, y2: -2, stroke: art.INK, 'stroke-width': 5 }));
    g.append(kit.svg('line', { x1: -46, y1: -4, x2: -62, y2: -14, stroke: art.INK, 'stroke-width': 5, 'stroke-linecap': 'round' }));
    g.append(kit.svg('line', { x1: 46, y1: -4, x2: 62, y2: -14, stroke: art.INK, 'stroke-width': 5, 'stroke-linecap': 'round' }));
    g.append(kit.svg('ellipse', { cx: -28, cy: -5, rx: 8, ry: 5, fill: '#fff', opacity: 0.35 }));
    return g;
  }

  const NEEDED = [
    { id: 'keys', x: 310, y: 650, r: 52, draw: keys },
    { id: 'phone', x: 740, y: 330, r: 50, draw: phone },
    { id: 'wallet', x: 160, y: 470, r: 50, draw: wallet },
    { id: 'glasses', x: 560, y: 860, r: 56, draw: glasses },
  ];

  const nodes = {};
  for (const n of NEEDED) {
    const g = kit.svg('g', { style: { cursor: 'pointer' } });
    art.shadow(g, n.x, n.y + n.r * 0.5, n.r * 1.5);
    g.append(n.draw(n.x, n.y));
    g.append(kit.svg('circle', { cx: n.x, cy: n.y, r: n.r, fill: ink, opacity: 0.0001 }));
    svg.append(g);
    nodes[n.id] = g;
    kit.on(g, 'pointerdown', () => collect(n.id));
  }

  let found = new Set(), started = false, t0 = 0, firstInput = false;

  function layout() {
    found = new Set();
    for (const n of NEEDED) { nodes[n.id].style.opacity = 1; nodes[n.id].style.pointerEvents = 'auto'; }
    d.el.style.opacity = 0.65;
    daylight.setAttribute('opacity', 0);
  }
  layout();
  kit.status('get ready…');

  kit.after(700, () => { started = true; t0 = performance.now(); });

  function collect(id) {
    if (!firstInput) { firstInput = true; head.hide(); }
    if (!started || kit.won) return;
    if (found.has(id)) return;
    found.add(id);
    nodes[id].style.transition = 'opacity .2s ease';
    nodes[id].style.opacity = 0.15;
    nodes[id].style.pointerEvents = 'none';
    kit.status(`${found.size}/4 — ${Math.max(0, (TOTAL_MS - (performance.now() - t0)) / 1000).toFixed(1)}s`);
    if (found.size === NEEDED.length) {
      d.el.style.opacity = 1;
      daylight.setAttribute('opacity', 0.55);
    }
  }

  kit.on(d.el, 'pointerdown', () => {
    if (!firstInput) { firstInput = true; head.hide(); }
    if (!started || kit.won) return;
    if (found.size === NEEDED.length) {
      daylight.setAttribute('opacity', 0.85);
      kit.after(300, () => {
        art.winBeat(kit, '5 minutes away');
        kit.after(1100, () => kit.win("5 minutes away. (you're still home.)"));
      });
    }
  });

  kit.loop(() => {
    if (!started || kit.won) return;
    const left = Math.max(0, TOTAL_MS - (performance.now() - t0));
    if (found.size < NEEDED.length) kit.status(`${found.size}/4 — ${(left / 1000).toFixed(1)}s`);
    if (left <= 0) {
      started = false;
      kit.status('still looking. again.');
      kit.after(900, () => { layout(); kit.status('get ready…'); kit.after(700, () => { started = true; t0 = performance.now(); }); });
    }
  });

  window.__fma = { collectAll: () => NEEDED.forEach((n) => collect(n.id)), openDoor: () => d.el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) };
}
