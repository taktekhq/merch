// T01 — told you so. cap
// "Time it." Three little scenes where someone ignores a warning. Press "told you so."
// the moment it goes wrong: too early doesn't count, too late nobody hears. Three perfect ones.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT, muted = art.MUTED;
  const head = art.heading(kit, 'told you so.', 'press the moment it goes wrong');

  const scenes = [
    { flavor: 'the umbrella stays by the door.', draw: drawRain, dur: 3000, at: 0.62 },
    { flavor: 'the pan just came off the flame.', draw: drawPan, dur: 2600, at: 0.58 },
    { flavor: "it's not going to fit.", draw: drawSofa, dur: 3200, at: 0.66 },
  ];
  const TOL = kit.reducedMotion ? 0.09 : 0.055;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const scenery = kit.svg('g');
  const track = kit.svg('line', { x1: 150, y1: 870, x2: 850, y2: 870, stroke: muted, 'stroke-opacity': 0.3, 'stroke-width': 5, 'stroke-linecap': 'round' });
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => kit.svg('circle', { cx: 150 + 700 * t, cy: 870, r: 3.5, fill: muted, opacity: 0.35 }));
  const marker = kit.svg('g');
  const markerLine = kit.svg('line', { y1: 848, y2: 892, stroke: art.CLAY, 'stroke-width': 7, 'stroke-linecap': 'round' });
  const markerDot = kit.svg('circle', { cy: 848, r: 7, fill: art.CLAY });
  marker.append(markerLine, markerDot);
  const cursor = kit.svg('circle', { r: 13, fill: ink, cy: 870 });
  const flavor = kit.svg('text', { x: 500, y: 232, 'text-anchor': 'middle', 'font-size': 20, fill: muted, 'font-family': 'var(--mono)' });
  const flash = kit.svg('text', { x: 500, y: 300, 'text-anchor': 'middle', 'font-size': 28, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600, opacity: 0 });
  svg.append(scenery, track, ...ticks, marker, cursor, flavor, flash);

  const dots = [0, 1, 2].map((i) => kit.svg('circle', { cx: 460 + i * 40, cy: 935, r: 7, fill: 'none', stroke: muted, 'stroke-opacity': 0.4, 'stroke-width': 3 }));
  svg.append(...dots);

  const btn = kit.el('button', { class: 'g-btn solid', text: 'told you so', style: { position: 'absolute', left: '50%', bottom: '5%', transform: 'translateX(-50%)' } });
  kit.stage.append(btn);

  let scene = 0, perfect = 0, running = false, t0 = 0, resolved = false, started = false;

  function layoutScene() {
    const s = scenes[scene];
    scenery.replaceChildren(...s.draw());
    flavor.textContent = s.flavor;
    marker.setAttribute('transform', `translate(${150 + 700 * s.at} 0)`);
    cursor.setAttribute('cx', 150);
    flash.setAttribute('opacity', 0);
  }

  function startScene() {
    layoutScene();
    resolved = false;
    t0 = performance.now();
    running = true;
  }
  kit.after(400, startScene);

  kit.loop(() => {
    if (!running) return;
    const s = scenes[scene];
    const p = Math.min(1, (performance.now() - t0) / s.dur);
    cursor.setAttribute('cx', 150 + 700 * p);
    if (p >= 1 && !resolved) { resolved = true; miss('too late. nobody heard it.'); }
  });

  function miss(text) {
    running = false;
    flash.textContent = text;
    flash.setAttribute('fill', art.CLAY);
    flash.setAttribute('opacity', 1);
    kit.after(850, startScene);
  }

  function press() {
    if (!started) { started = true; head.hide(); }
    if (!running || resolved) return;
    const s = scenes[scene];
    const p = (performance.now() - t0) / s.dur;
    const diff = p - s.at;
    if (diff < -TOL) { resolved = true; miss("too early. hasn't happened yet."); return; }
    if (diff > TOL) { resolved = true; miss('too late. nobody heard it.'); return; }
    resolved = true;
    running = false;
    dots[perfect].setAttribute('fill', accent);
    dots[perfect].setAttribute('stroke', accent);
    perfect++;
    kit.status(`${perfect}/3`);
    if (perfect >= 3) { landWin(); return; }
    flash.textContent = 'told you so.';
    flash.setAttribute('fill', accent);
    flash.setAttribute('opacity', 1);
    scene = (scene + 1) % scenes.length;
    kit.after(950, startScene);
  }

  function landWin() {
    reactShock();
    flash.setAttribute('opacity', 0);
    kit.after(900, () => {
      art.winBeat(kit, 'told you so.');
      kit.after(1100, () => kit.win('told you so.'));
    });
  }

  kit.on(btn, 'click', press);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); press(); } });
  kit.status('0/3');

  // Testing hook so check.mjs can drive a perfectly-timed press without guessing. Harmless:
  // the game is the fun, not a lock (see earned/README.md).
  window.__tys = { getT: () => ({ scene, t0, dur: scenes[scene].dur, at: scenes[scene].at, running, resolved }), press };

  let shockFace = null;
  function reactShock() {
    if (shockFace) { shockFace.setAttribute('d', 'M -16 30 a 10 10 0 1 0 0.1 0'); }
  }

  function drawRain() {
    const g = [];
    const r = art.room(kit, { wall: '#ECEAE4', floor: art.OAT, floorY: 760, window: { x: 660, y: 240, w: 220, h: 300, curtain: art.DUSTY, light: false, sun: false } });
    g.push(r.el);
    // rain streaking the glass, over the window
    for (let i = 0; i < 9; i++) g.push(mk('line', { x1: 690 + i * 22, y1: 260, x2: 672 + i * 22, y2: 500, stroke: '#fff', 'stroke-width': 3, opacity: 0.55, 'stroke-linecap': 'round' }));
    g.push(mk('rect', { x: 650, y: 536, width: 240, height: 10, rx: 4, fill: art.shade('#ECEAE4', -0.2) }));
    // the front door, shut
    const d = art.door(kit, 300, 290, { w: 190, h: 450, color: art.SPRUCE, handleSide: 1 });
    g.push(d.el);
    // doormat
    g.push(mk('rect', { x: 260, y: 744, width: 270, height: 30, rx: 6, fill: art.shade(art.OAT, -0.1) }));
    for (let i = 0; i < 12; i++) g.push(mk('line', { x1: 268 + i * 21, y1: 748, x2: 268 + i * 21, y2: 770, stroke: art.shade(art.OAT, -0.22), 'stroke-width': 3, opacity: 0.5 }));
    // umbrella stand by the door, the umbrella still in it
    g.push(mk('ellipse', { cx: 180, cy: 766, rx: 26, ry: 9, fill: art.shade(art.CLAY, -0.15) }));
    g.push(mk('path', { d: 'M 156 700 L 204 700 L 196 766 L 164 766 Z', fill: art.CLAY }));
    g.push(mk('rect', { x: 150, y: 688, width: 60, height: 16, rx: 6, fill: art.shade(art.CLAY, 0.1) }));
    g.push(mk('line', { x1: 180, y1: 688, x2: 180, y2: 560, stroke: art.MUTED, 'stroke-width': 7, 'stroke-linecap': 'round' }));
    g.push(mk('path', { d: 'M 180 548 q -5 -16 8 -16', stroke: art.MUTED, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }));
    g.push(mk('path', { d: 'M 124 560 A 56 56 0 0 1 236 560 Z', fill: art.DUSTY }));
    for (let i = 1; i < 5; i++) g.push(mk('line', { x1: 124 + i * 22.4, y1: 560 - Math.sin(i / 5 * Math.PI) * 50, x2: 180, y2: 560, stroke: art.shade(art.DUSTY, -0.18), 'stroke-width': 2, opacity: 0.5 }));
    const pers = art.person(kit, { x: 560, standOn: 760, scale: 0.62, facing: -1, shirt: art.CLAY, skin: art.SKINS[1], hair: 'short', pose: 'stand', legs: true });
    g.push(pers.el);
    return g;
  }
  function drawPan() {
    const g = [];
    const r = art.room(kit, { wall: '#EFE7DA', floor: '#D8D2C4', floorY: 760 });
    g.push(r.el);
    // tiled wall, quietly
    for (let r0 = 0; r0 < 8; r0++) for (let c = 0; c < 14; c++) g.push(mk('rect', { x: c * 72, y: r0 * 72, width: 68, height: 68, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.3 }));
    // counter + stove
    g.push(mk('rect', { x: 260, y: 560, width: 480, height: 200, fill: '#D8D2C4' }));
    g.push(mk('rect', { x: 260, y: 560, width: 480, height: 16, fill: art.shade('#D8D2C4', -0.15) }));
    g.push(mk('rect', { x: 260, y: 600, width: 480, height: 3, fill: art.shade('#D8D2C4', -0.1), opacity: 0.5 }));
    g.push(mk('rect', { x: 400, y: 660, width: 80, height: 100, rx: 4, fill: art.shade('#D8D2C4', -0.1) }));
    g.push(mk('circle', { cx: 440, cy: 596, r: 34, fill: art.shade(art.INK, 0.1), opacity: 0.5 }));
    g.push(mk('circle', { cx: 440, cy: 596, r: 34, fill: 'none', stroke: art.INK, 'stroke-width': 4, opacity: 0.5 }));
    // pan with glowing handle (came off the flame)
    g.push(mk('ellipse', { cx: 430, cy: 580, rx: 78, ry: 20, fill: art.shade(art.MUTED, -0.2) }));
    g.push(mk('ellipse', { cx: 430, cy: 574, rx: 78, ry: 18, fill: art.MUTED }));
    g.push(mk('rect', { x: 505, y: 566, width: 100, height: 14, rx: 7, fill: art.CLAY }));
    for (let i = 0; i < 3; i++) g.push(mk('path', { d: `M ${400 + i * 30} 560 q -4 -20 4 -36`, stroke: art.CLAY, 'stroke-width': 4, fill: 'none', opacity: 0.55, 'stroke-linecap': 'round' }));
    const pers = art.person(kit, { x: 660, standOn: 760, scale: 0.6, facing: -1, shirt: art.DUSTY, skin: art.SKINS[2], hair: 'short', pose: 'reach', reachTo: { x: 175, y: -36 }, legs: true });
    g.push(pers.el);
    return g;
  }
  function drawSofa() {
    const g = [];
    const r = art.room(kit, { wall: '#DCE2E6', floor: art.OAT, floorY: 760 });
    g.push(r.el);
    // lift doors, jammed open by the sofa
    const dl = art.door(kit, 120, 300, { w: 230, h: 460, color: '#5A6372', open: 0.18, handleSide: 1 });
    const dr = art.door(kit, 650, 300, { w: 230, h: 460, color: '#5A6372', open: 0.18, handleSide: -1 });
    g.push(dl.el, dr.el);
    // sofa wedged in the gap
    const shadowG = mk('g', {});
    art.shadow(shadowG, 500, 606, 360);
    g.push(shadowG);
    g.push(mk('rect', { x: 330, y: 470, width: 340, height: 130, rx: 26, fill: art.CLAY }));
    g.push(mk('rect', { x: 330, y: 420, width: 80, height: 110, rx: 20, fill: art.CLAY }));
    g.push(mk('rect', { x: 590, y: 420, width: 80, height: 110, rx: 20, fill: art.CLAY }));
    g.push(mk('rect', { x: 356, y: 500, width: 130, height: 60, rx: 16, fill: art.shade(art.CLAY, 0.12) }));
    g.push(mk('rect', { x: 500, y: 500, width: 130, height: 60, rx: 16, fill: art.shade(art.CLAY, 0.12) }));
    const pers = art.person(kit, { x: 820, standOn: 760, scale: 0.62, facing: -1, shirt: art.SPRUCE, skin: art.SKINS[0], hair: 'bun', pose: 'lean', legs: true });
    g.push(pers.el);
    shockFace = pers.face.mouth;
    return g;
  }

  function mk(tag, attrs) { return kit.svg(tag, attrs); }
}
