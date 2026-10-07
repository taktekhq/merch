// T16 — the good side. pillow
// A bed from above, a head of hair on the pillow, warmth creeping under it. Flip at the
// right moment, eight times, and it stays cool all night: never too warm, never too early.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT;
  const WIN = 8;
  const CYCLE = 4200;
  const ZONE = [0.55, 0.82];
  const head = art.heading(kit, 'the good side.', 'flip it before it gets too warm');
  // dark scene: colour the heading by hand until heading() grows a colour option
  const [hLabel, hHint] = head.el.children;
  hLabel.style.color = '#F2EFE8';
  hHint.style.color = '#9BA2B0';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: art.NIGHT }));

  // headboard wall strip
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 150, fill: art.shade(art.NIGHT, 0.08) }));
  svg.append(kit.svg('rect', { x: 0, y: 144, width: 1000, height: 6, fill: art.shade(art.NIGHT, -0.2), opacity: 0.6 }));
  for (let i = 0; i < 5; i++) svg.append(kit.svg('circle', { cx: 60 + i * 220, cy: 24, r: 1.6, fill: '#fff', opacity: 0.5 }));

  // a nightstand + lamp for a little warmth and life
  const standX = 870;
  svg.append(kit.svg('rect', { x: standX - 70, y: 560, width: 140, height: 230, rx: 8, fill: art.shade(art.NIGHT, 0.04) }));
  const lampGlow = kit.svg('circle', { cx: standX, cy: 494, r: 48, fill: art.BUTTER, opacity: 0.16 });
  svg.append(lampGlow);
  svg.append(kit.svg('path', { d: `M ${standX - 26} 558 L ${standX + 26} 558 L ${standX + 14} 494 L ${standX - 14} 494 Z`, fill: art.shade(art.BUTTER, -0.08) }));
  svg.append(kit.svg('line', { x1: standX, y1: 558, x2: standX, y2: 598, stroke: '#6B7180', 'stroke-width': 6 }));

  // the bed + duvet, quilted
  art.shadow(svg, 420, 980, 760, 0.3);
  svg.append(kit.svg('rect', { x: 60, y: 180, width: 780, height: 780, rx: 50, fill: '#242C3E' }));
  svg.append(kit.svg('rect', { x: 60, y: 180, width: 780, height: 120, rx: 50, fill: art.shade('#242C3E', 0.08), opacity: 0.5 }));
  const quilt = kit.svg('g', { stroke: art.shade('#242C3E', -0.12), 'stroke-width': 3, opacity: 0.3 });
  for (let i = -6; i < 14; i++) quilt.append(kit.svg('line', { x1: 60 + i * 90, y1: 180, x2: 60 + i * 90 + 320, y2: 960 }));
  svg.append(quilt);

  // the pillow, drawn in its own local-origin group so a flip can scale it cleanly
  const PX = 420, PY = 350;
  const pillowRoot = kit.svg('g', { transform: `translate(${PX} ${PY})` });
  art.shadow(pillowRoot, 10, 178, 620, 0.28);
  pillowRoot.append(kit.svg('rect', { x: -300, y: -170, width: 600, height: 340, rx: 86, fill: '#F7F5F1', stroke: ink, 'stroke-width': 7 }));
  pillowRoot.append(kit.svg('line', { x1: -170, y1: -160, x2: -170, y2: 160, stroke: ink, opacity: 0.1, 'stroke-width': 4 }));
  pillowRoot.append(kit.svg('line', { x1: 170, y1: -160, x2: 170, y2: 160, stroke: ink, opacity: 0.1, 'stroke-width': 4 }));
  pillowRoot.append(kit.svg('rect', { x: -300, y: -170, width: 600, height: 90, rx: 86, fill: '#fff', opacity: 0.3 }));

  // the warmth glow — a soft radial under the head, cool blue to warm red
  const gradId = 'tgsWarm' + Math.floor(Math.random() * 1e6);
  const defs = kit.svg('defs');
  const grad = kit.svg('radialGradient', { id: gradId, cx: '38%', cy: '48%', r: '62%' });
  grad.append(kit.svg('stop', { offset: '0%', 'stop-color': art.CLAY }));
  grad.append(kit.svg('stop', { offset: '100%', 'stop-color': art.CLAY, 'stop-opacity': 0 }));
  defs.append(grad);
  pillowRoot.append(defs);
  const warmth = kit.svg('ellipse', { cx: -100, cy: -20, rx: 310, ry: 180, fill: `url(#${gradId})`, opacity: 0 });
  pillowRoot.append(warmth);

  // a sleeping head, hair spread on the pillow, eyes shut
  const headG = kit.svg('g', { transform: 'translate(-110 -20) rotate(-8)' });
  headG.append(kit.svg('path', { d: 'M -90 -10 q -10 70 70 86 q -56 4 -92 -40 q -16 -34 22 -46 Z', fill: art.HAIRS.brown, opacity: 0.95 }));
  headG.append(kit.svg('circle', { cx: 0, cy: 0, r: 62, fill: art.SKINS[1] }));
  headG.append(kit.svg('path', { d: 'M -62 -4 A 62 62 0 0 1 20 -58 Q -20 -70 -56 -40 Z', fill: art.HAIRS.brown }));
  headG.append(kit.svg('path', { d: 'M -22 10 q 8 6 16 0', stroke: ink, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }));
  headG.append(kit.svg('path', { d: 'M 10 10 q 8 6 16 0', stroke: ink, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }));
  pillowRoot.append(headG);
  svg.append(pillowRoot);

  // a little drawn thermometer as the gauge
  const gx = 900, gTop = 220, gBot = 540, gH = gBot - gTop;
  svg.append(kit.svg('rect', { x: gx - 10, y: gTop, width: 20, height: gH, rx: 10, fill: 'none', stroke: '#8B91A0', 'stroke-width': 4, opacity: 0.6 }));
  svg.append(kit.svg('circle', { cx: gx, cy: gBot + 20, r: 22, fill: 'none', stroke: '#8B91A0', 'stroke-width': 4, opacity: 0.6 }));
  const zoneTop = gTop + gH * (1 - ZONE[1]), zoneH = gH * (ZONE[1] - ZONE[0]);
  svg.append(kit.svg('rect', { x: gx - 10, y: zoneTop, width: 20, height: zoneH, rx: 10, fill: accent, opacity: 0.3 }));
  const mercury = kit.svg('rect', { x: gx - 6, y: gBot, width: 12, height: 0, fill: art.DUSTY });
  const bulb = kit.svg('circle', { cx: gx, cy: gBot + 20, r: 16, fill: art.DUSTY });
  svg.append(mercury, bulb);

  kit.stage.append(svg);

  let heat = 0, streak = 0, locked = false, started = false, flipping = false, flipT0 = 0;

  const render = () => {
    const frac = heat / CYCLE;
    warmth.setAttribute('opacity', Math.min(0.85, frac));
    const h = gH * frac;
    mercury.setAttribute('y', gBot - h);
    mercury.setAttribute('height', h);
    const col = frac > ZONE[1] ? art.CLAY : frac >= ZONE[0] ? accent : art.DUSTY;
    mercury.setAttribute('fill', col);
    bulb.setAttribute('fill', col);
    kit.status(`${streak}/${WIN}`);
  };

  const reset = (msg) => { streak = 0; heat = 0; kit.status(msg); render(); };

  const doFlip = () => { flipping = true; flipT0 = performance.now(); };

  const flip = () => {
    if (!started) { started = true; head.hide(); }
    if (locked) return;
    const frac = heat / CYCLE;
    doFlip();
    if (frac < ZONE[0]) { reset('too early. barely warm.'); return; }
    if (frac > ZONE[1]) { reset('too warm. started over.'); return; }
    streak++; heat = 0;
    kit.status(`flipped. ${streak}/${WIN}`);
    render();
    if (streak >= WIN) {
      locked = true;
      kit.after(400, () => {
        const b = art.winBeat(kit, 'the good side.');
        b.style.color = '#F2EFE8';
        kit.after(1100, () => kit.win('the good side. every time.'));
      });
    }
  };

  kit.on(kit.stage, 'pointerdown', (e) => { e.preventDefault(); flip(); });
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); flip(); } });

  kit.status(`0/${WIN}`);
  render();

  kit.loop((dt) => {
    if (flipping) {
      const p = Math.min(1, (performance.now() - flipT0) / 280);
      const s = p < 0.5 ? 1 - p * 2 * 0.9 : (p - 0.5) * 2 * 0.9 + 0.1;
      pillowRoot.setAttribute('transform', `translate(${PX} ${PY}) scale(1 ${s})`);
      if (p >= 1) { flipping = false; pillowRoot.setAttribute('transform', `translate(${PX} ${PY}) scale(1 1)`); }
    }
    const t = performance.now() / 1400;
    lampGlow.setAttribute('opacity', 0.14 + Math.sin(t) * 0.05);
    if (locked) return;
    heat = Math.max(0, heat + dt);
    if (heat >= CYCLE) { reset('too warm. started over.'); return; }
    render();
  });
}
