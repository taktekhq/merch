// who touched the thermostat. — someone keeps nudging it down. Hold 22 degrees
// for twenty seconds (your +/- or arrow keys fight back).
export default function mount(kit) {
  const INK = '#0D0D0E', MUTED = '#6B6A66', GREEN = kit.colors.accent || '#00A862', CLAY = '#C9764F', DUSTY = '#8FA6B8', FOREST = '#2F4F46';
  const TARGET = 22, TOL = 0.5, MIN = 10, MAX = 30, HOLD_MS = 20000;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#EFECE6' }));
  // a sliver of sweater-knit wall texture, decorative
  const knit = kit.svg('g', { stroke: FOREST, 'stroke-width': 3, opacity: 0.12 });
  for (let y = 40; y < 1000; y += 46) knit.append(kit.svg('path', { d: `M0 ${y} q 23 -20 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0 t 46 0`, fill: 'none' }));
  svg.append(knit);

  const dialC = { x: 500, y: 460, r: 300 };
  const angleFor = (t) => {
    const f = (t - MIN) / (MAX - MIN); // 0..1
    return -220 + f * 260; // degrees, sweeping a gauge arc
  };
  const toXY = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return { x: dialC.x + Math.cos(a) * r, y: dialC.y + Math.sin(a) * r }; };
  const arcPath = (a0, a1, r) => {
    const p0 = toXY(a0, r), p1 = toXY(a1, r);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
  };

  svg.append(kit.svg('circle', { cx: dialC.x, cy: dialC.y, r: dialC.r, fill: '#FFFFFF', stroke: INK, 'stroke-width': 10 }));
  svg.append(kit.svg('path', { d: arcPath(angleFor(MIN), angleFor(MAX), dialC.r - 36), fill: 'none', stroke: DUSTY, 'stroke-width': 18, 'stroke-linecap': 'round', opacity: 0.35 }));
  const targetA = angleFor(TARGET);
  svg.append(kit.svg('path', { d: arcPath(angleFor(TARGET - TOL), angleFor(TARGET + TOL), dialC.r - 36), fill: 'none', stroke: GREEN, 'stroke-width': 18, 'stroke-linecap': 'round' }));

  const needle = kit.svg('g');
  needle.append(kit.svg('line', { x1: dialC.x, y1: dialC.y, x2: dialC.x, y2: dialC.y - (dialC.r - 50), stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round' }));
  svg.append(needle);
  svg.append(kit.svg('circle', { cx: dialC.x, cy: dialC.y, r: 14, fill: INK }));

  const reading = kit.svg('text', { x: dialC.x, y: dialC.y + 170, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 64, 'font-weight': 700, fill: INK });
  svg.append(reading);

  const ghost = kit.svg('text', { x: dialC.x, y: 120, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 22, fill: CLAY, opacity: 0 });
  ghost.textContent = 'someone touched the thermostat.';
  svg.append(ghost);

  kit.stage.append(svg);

  const controls = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', bottom: '6%', display: 'flex', justifyContent: 'center', gap: '18px' } });
  const minus = kit.el('button', { class: 'g-btn', text: '−' });
  const plus = kit.el('button', { class: 'g-btn solid', text: '+' });
  controls.append(minus, plus);
  kit.stage.append(controls);

  let temp = 19, held = 0, ghostTimer = null;

  const render = () => {
    needle.setAttribute('transform', `rotate(${angleFor(temp)} ${dialC.x} ${dialC.y})`);
    reading.textContent = `${temp.toFixed(1)}°`;
    reading.setAttribute('data-temp', temp.toFixed(1));
  };
  const nudge = (d) => { temp = Math.max(MIN, Math.min(MAX, +(temp + d).toFixed(1))); render(); };

  minus.onclick = () => nudge(-0.5);
  plus.onclick = () => nudge(0.5);
  kit.on(window, 'keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); nudge(0.5); }
    if (e.key === 'ArrowDown' || e.key === '-') { e.preventDefault(); nudge(-0.5); }
  });

  const sabotage = () => {
    const drop = 1 + Math.random() * 1.5;
    temp = Math.max(MIN, +(temp - drop).toFixed(1));
    render();
    ghost.setAttribute('opacity', 1);
    kit.after(1400, () => ghost.setAttribute('opacity', 0));
    kit.after(kit.reducedMotion ? 6000 : 3200 + Math.random() * 2600, sabotage);
  };
  kit.after(2600, sabotage);

  render();
  kit.status(`0.0s / 20s`);

  kit.loop((dt) => {
    const inRange = Math.abs(temp - TARGET) <= TOL;
    held = inRange ? held + dt : Math.max(0, held - dt * 1.5);
    kit.status(`${Math.min(20, held / 1000).toFixed(1)}s / 20s`);
    if (held >= HOLD_MS) { kit.win('22. finally. it’s yours.'); return false; }
  });
}
