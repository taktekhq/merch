// the good side. — the pillow warms under your head. Flip it at the right
// moment, eight times, and it stays cool all night: never too warm, never flipped early.
export default function mount(kit) {
  const IVORY = '#F7F5F1', INK = '#0D0D0E', MUTED = '#6B6A66', GREEN = kit.colors.accent || '#00A862', CLAY = '#C9764F', DUSTY = '#8FA6B8';
  const WIN = 8;
  const CYCLE = 4200; // ms to fully overheat if never flipped
  const ZONE = [0.55, 0.82]; // good-flip heat window (fraction of CYCLE)

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#1B2230' }));
  svg.append(kit.svg('rect', { x: 150, y: 560, width: 700, height: 260, rx: 40, fill: '#10141c', opacity: 0.6 })); // bed shadow

  const pillow = kit.svg('g');
  const pillowBody = kit.svg('rect', { x: 200, y: 380, width: 600, height: 340, rx: 90, fill: IVORY, stroke: INK, 'stroke-width': 8 });
  const warmth = kit.svg('rect', { x: 200, y: 380, width: 600, height: 340, rx: 90, fill: CLAY, opacity: 0 });
  pillow.append(pillowBody, warmth);
  // seam
  pillow.append(kit.svg('line', { x1: 330, y1: 390, x2: 330, y2: 710, stroke: INK, opacity: 0.12, 'stroke-width': 4 }));
  pillow.append(kit.svg('line', { x1: 670, y1: 390, x2: 670, y2: 710, stroke: INK, opacity: 0.12, 'stroke-width': 4 }));
  svg.append(pillow);

  // warmth gauge
  const gaugeX = 880, gaugeY0 = 380, gaugeH = 340;
  svg.append(kit.svg('rect', { x: gaugeX, y: gaugeY0, width: 24, height: gaugeH, rx: 12, fill: 'none', stroke: INK, 'stroke-width': 4, opacity: 0.4 }));
  const zoneTop = gaugeY0 + gaugeH * (1 - ZONE[1]);
  const zoneH = gaugeH * (ZONE[1] - ZONE[0]);
  svg.append(kit.svg('rect', { x: gaugeX, y: zoneTop, width: 24, height: zoneH, rx: 12, fill: GREEN, opacity: 0.3 }));
  const gaugeFill = kit.svg('rect', { x: gaugeX, y: gaugeY0 + gaugeH, width: 24, height: 0, rx: 12, fill: DUSTY });
  svg.append(gaugeFill);

  const streakText = kit.svg('text', { x: 500, y: 300, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 32, fill: MUTED });
  svg.append(streakText);

  kit.stage.append(svg);

  let heat = 0, streak = 0, locked = false;
  const render = () => {
    const frac = heat / CYCLE;
    warmth.setAttribute('opacity', Math.min(0.75, frac * 0.8));
    const h = gaugeH * frac;
    gaugeFill.setAttribute('y', gaugeY0 + gaugeH - h);
    gaugeFill.setAttribute('height', h);
    gaugeFill.setAttribute('fill', frac > ZONE[1] ? CLAY : frac >= ZONE[0] ? GREEN : DUSTY);
    streakText.textContent = `${streak}/${WIN}`;
    pillow.setAttribute('data-heat', frac.toFixed(3));
    pillow.setAttribute('data-streak', String(streak));
  };

  const reset = (msg) => { streak = 0; heat = 0; kit.status(msg); render(); };

  const flip = () => {
    if (locked) return;
    const frac = heat / CYCLE;
    if (frac < ZONE[0]) { reset('too early. barely warm.'); return; }
    if (frac > ZONE[1]) { reset('too warm. started over.'); return; }
    streak++;
    heat = 0;
    kit.status(`flipped. ${streak}/${WIN}`);
    render();
    if (streak >= WIN) { locked = true; kit.win('the good side. every time.'); }
  };

  kit.on(kit.stage, 'pointerdown', (e) => { e.preventDefault(); flip(); });
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); flip(); } });

  kit.status(`0/${WIN}`);
  render();

  kit.loop((dt) => {
    if (locked) return;
    heat = Math.max(0, heat + dt);
    if (heat >= CYCLE) { reset('too warm. started over.'); return; }
    render();
  });
}
