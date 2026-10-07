// T13 — i'll dry. hand towel
// A dish rack beside a sink. Plates of different colours slide off; tap as each one passes
// the towel, held in a hand, waiting at the catch zone. Twelve in a row without a drop.
import * as art from './_art.js';

export default function mount(kit) {
  const INK = art.INK, MUTED = art.MUTED;
  const WIN = 12;
  const DURATION = 1350;
  const ZONE = [0.52, 0.74];
  const head = art.heading(kit, "i'll dry.", 'tap as each plate reaches the towel');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const WALL = '#EFE7DA';
  const r = art.room(kit, { wall: WALL, floor: '#D8D2C4', floorY: 820, window: { x: 700, y: 110, w: 180, h: 160, sun: true } });
  svg.append(r.el);
  for (let row = 0; row < 10; row++) for (let c = 0; c < 14; c++) svg.append(kit.svg('rect', { x: c * 72, y: row * 72, width: 68, height: 68, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.3 }));

  // counter + sink basin
  svg.append(kit.svg('rect', { x: 0, y: 720, width: 1000, height: 100, fill: '#D8D2C4' }));
  svg.append(kit.svg('rect', { x: 0, y: 720, width: 1000, height: 14, fill: art.shade('#D8D2C4', -0.16) }));
  svg.append(kit.svg('rect', { x: 20, y: 700, width: 260, height: 90, rx: 22, fill: art.shade('#D8D2C4', -0.42) }));
  svg.append(kit.svg('rect', { x: 32, y: 710, width: 236, height: 70, rx: 18, fill: art.shade('#D8D2C4', -0.55) }));
  // tap
  svg.append(kit.svg('rect', { x: 128, y: 630, width: 20, height: 80, rx: 8, fill: art.DUSTY }));
  svg.append(kit.svg('path', { d: 'M 138 630 L 138 598 Q 138 584 152 584 L 178 584 Q 196 584 196 600 L 196 630', stroke: art.DUSTY, 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round' }));

  // the rack: a tray base with upright slats, standing in the basin
  const rackX = 150, rackY = 700;
  const rackG = kit.svg('g', { transform: `translate(${rackX} ${rackY})` });
  rackG.append(kit.svg('ellipse', { cx: 0, cy: 4, rx: 130, ry: 16, fill: art.shade('#D8D2C4', -0.5), opacity: 0.5 }));
  for (let i = 0; i < 6; i++) rackG.append(kit.svg('line', { x1: -100 + i * 40, y1: -8, x2: -60 + i * 40, y2: -210, stroke: '#9CA3A8', 'stroke-width': 8, 'stroke-linecap': 'round' }));
  rackG.append(kit.svg('rect', { x: -112, y: -14, width: 224, height: 16, rx: 8, fill: '#9CA3A8' }));
  svg.append(rackG);

  // the dried stack: a growing pile of clean plates on the counter
  const driedStack = kit.svg('g');
  svg.append(driedStack);

  // path the plates travel: off the rack, down to the towel
  const P0 = { x: 190, y: 150 }, P1 = { x: 760, y: 760 };
  const lerp = (a, b, t) => a + (b - a) * t;

  const towelX = lerp(P0.x, P1.x, (ZONE[0] + ZONE[1]) / 2);
  const towelY = lerp(P0.y, P1.y, (ZONE[0] + ZONE[1]) / 2);

  // a hand holding the folded towel, waiting at the catch zone
  const handG = kit.svg('g', { transform: `translate(${towelX} ${towelY}) rotate(-38)` });
  handG.append(kit.svg('rect', { x: -110, y: -70, width: 220, height: 140, rx: 18, fill: '#FFFFFF', stroke: '#D9D4C8', 'stroke-width': 4 }));
  handG.append(kit.svg('line', { x1: -90, y1: 0, x2: 90, y2: 0, stroke: art.ACCENT, 'stroke-width': 6, 'stroke-dasharray': '2 14', 'stroke-linecap': 'round' }));
  handG.append(kit.svg('path', { d: 'M 80 10 Q 130 -10 160 30 Q 170 50 150 60 L 90 50 Z', fill: art.SKINS[1] }));
  for (let i = 0; i < 4; i++) handG.append(kit.svg('rect', { x: 150 + i * 11, y: 6, width: 10, height: 24, rx: 5, fill: art.SKINS[1], transform: `rotate(${18 - i * 6} ${150 + i * 11} 6)` }));
  svg.append(handG);

  const zoneHint = kit.svg('circle', { cx: towelX, cy: towelY, r: 76, fill: 'none', stroke: art.ACCENT, 'stroke-width': 5, opacity: 0.4, 'stroke-dasharray': '6 10' });
  svg.append(zoneHint);

  const PLATE_COLORS = [art.CARD, art.CLAY, art.DUSTY, art.BUTTER, art.SPRUCE, '#C23B3B'];
  const plate = kit.svg('ellipse', { rx: 70, ry: 26, fill: art.CARD, stroke: INK, 'stroke-width': 6 });
  const plateRing = kit.svg('ellipse', { rx: 46, ry: 17, fill: 'none', stroke: art.shade(art.CARD, -0.2), 'stroke-width': 2, opacity: 0.4 });
  svg.append(plate, plateRing);

  const dryCount = kit.svg('text', { x: 900, y: 80, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 28, fill: MUTED });
  svg.append(dryCount);

  kit.stage.append(svg);

  let streak = 0, progress = 0, active = false, resolvedThisPlate = false, duration = DURATION, started = false, plateColor = art.CARD;

  const drawStack = () => {
    driedStack.replaceChildren();
    for (let i = 0; i < streak; i++) {
      driedStack.append(kit.svg('ellipse', { cx: 850 - (i % 6) * 10, cy: 790 - Math.floor(i / 6) * 16, rx: 50, ry: 16, fill: PLATE_COLORS[i % PLATE_COLORS.length], stroke: INK, 'stroke-width': 4 }));
    }
  };

  const place = () => {
    const t = Math.min(1, progress);
    const x = lerp(P0.x, P1.x, t), y = lerp(P0.y, P1.y, t);
    plate.setAttribute('cx', x); plate.setAttribute('cy', y);
    plateRing.setAttribute('cx', x); plateRing.setAttribute('cy', y);
    const wobble = active ? Math.sin(t * 14) * (1 - t) * 4 : 0;
    plate.setAttribute('transform', `rotate(${wobble} ${x} ${y})`);
    plateRing.setAttribute('transform', `rotate(${wobble} ${x} ${y})`);
  };

  const spawn = () => {
    progress = 0; active = true; resolvedThisPlate = false;
    duration = DURATION + (Math.random() * 160 - 80);
    plateColor = PLATE_COLORS[Math.floor(Math.random() * PLATE_COLORS.length)];
    plate.setAttribute('fill', plateColor);
    plateRing.setAttribute('stroke', art.shade(plateColor, -0.2));
    plate.style.opacity = 1; plateRing.style.opacity = 1;
    place();
  };

  const miss = (msg) => {
    streak = 0;
    active = false;
    drawStack();
    kit.status(msg);
    kit.after(260, spawn);
  };

  const hit = () => {
    streak++;
    resolvedThisPlate = true;
    active = false;
    drawStack();
    dryCount.textContent = `${streak}/${WIN}`;
    kit.status(`${streak}/${WIN}`);
    if (streak >= WIN) {
      kit.after(300, () => {
        art.winBeat(kit, "i'll dry.");
        kit.after(1100, () => kit.win('twelve. not one chip.'));
      });
      return;
    }
    plate.style.opacity = 0; plateRing.style.opacity = 0;
    kit.after(220, spawn);
  };

  const tap = () => {
    if (!started) { started = true; head.hide(); }
    if (!active || resolvedThisPlate) return;
    if (progress >= ZONE[0] && progress <= ZONE[1]) hit();
    else miss(progress < ZONE[0] ? 'too soon. it slipped.' : 'too late. dropped.');
  };

  kit.on(kit.stage, 'pointerdown', (e) => { e.preventDefault(); tap(); });
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); tap(); } });

  kit.status(`0/${WIN}`);
  dryCount.textContent = `0/${WIN}`;
  spawn();

  kit.loop((dt) => {
    if (!active) return;
    progress = Math.max(0, progress + dt / duration);
    place();
    if (progress > 1 && !resolvedThisPlate) miss('dropped. again.');
  });

  window.__id = {
    run: () => new Promise((resolve) => {
      const tick = () => {
        if (streak >= WIN || kit.won) { resolve('done'); return; }
        if (active && !resolvedThisPlate) { progress = (ZONE[0] + ZONE[1]) / 2; tap(); }
        setTimeout(tick, 40);
      };
      tick();
    }),
  };
}
