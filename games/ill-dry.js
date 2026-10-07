// i'll dry. — plates slide off the rack; tap as each one passes the towel.
// Twelve in a row without a drop. Mouse, touch or Space all tap.
export default function mount(kit) {
  const CARD = '#EFECE6', INK = '#0D0D0E', GREEN = kit.colors.accent || '#00A862', MUTED = '#6B6A66';
  const WIN = 12;
  const DURATION = 1350; // ms for a plate to cross the rack
  const ZONE = [0.52, 0.74]; // progress window over the towel

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#F7F5F1' }));

  // the counter and a sink basin, so the rack has somewhere to stand
  svg.append(kit.svg('rect', { x: 0, y: 800, width: 1000, height: 200, fill: '#EFECE6' }));
  svg.append(kit.svg('rect', { x: 20, y: 790, width: 300, height: 90, rx: 24, fill: '#E3DFD6', stroke: '#D9D4C8', 'stroke-width': 4 }));

  // rack: a few diagonal slats, standing in the basin
  const rack = kit.svg('g', { stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.55 });
  for (let i = 0; i < 5; i++) rack.append(kit.svg('line', { x1: 120 + i * 40, y1: 120, x2: 60 + i * 40, y2: 740 }));
  svg.append(rack);

  // the dried stack: grows by one flat plate for every twelve-streak step
  const driedStack = kit.svg('g');
  svg.append(driedStack);

  // path the plates travel: top-left to bottom-right
  const P0 = { x: 170, y: 150 }, P1 = { x: 760, y: 760 };
  const lerp = (a, b, t) => a + (b - a) * t;

  // towel, folded, with the catch zone marked
  const towelX = lerp(P0.x, P1.x, (ZONE[0] + ZONE[1]) / 2);
  const towelY = lerp(P0.y, P1.y, (ZONE[0] + ZONE[1]) / 2);
  const towel = kit.svg('g', { transform: `translate(${towelX} ${towelY}) rotate(-38)` });
  towel.append(
    kit.svg('rect', { x: -110, y: -70, width: 220, height: 140, rx: 18, fill: '#FFFFFF', stroke: '#D9D4C8', 'stroke-width': 4 }),
    kit.svg('line', { x1: -90, y1: 0, x2: 90, y2: 0, stroke: GREEN, 'stroke-width': 6, 'stroke-dasharray': '2 14', 'stroke-linecap': 'round' }),
  );
  svg.append(towel);

  const zoneHint = kit.svg('circle', { cx: towelX, cy: towelY, r: 70, fill: 'none', stroke: GREEN, 'stroke-width': 4, opacity: 0.35, 'stroke-dasharray': '6 10' });
  svg.append(zoneHint);

  const plate = kit.svg('ellipse', { rx: 70, ry: 26, fill: CARD, stroke: INK, 'stroke-width': 6 });
  svg.append(plate);

  const dryCount = kit.svg('text', { x: 900, y: 80, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 28, fill: MUTED });
  svg.append(dryCount);

  kit.stage.append(svg);

  let streak = 0, progress = 0, active = false, resolvedThisPlate = false, duration = DURATION;

  const drawStack = () => {
    driedStack.replaceChildren();
    for (let i = 0; i < streak; i++) {
      driedStack.append(kit.svg('ellipse', { cx: 820 - (i % 6) * 10, cy: 850 - Math.floor(i / 6) * 16, rx: 50, ry: 16, fill: CARD, stroke: INK, 'stroke-width': 4 }));
    }
  };

  const place = () => {
    const t = Math.min(1, progress);
    plate.setAttribute('cx', lerp(P0.x, P1.x, t));
    plate.setAttribute('cy', lerp(P0.y, P1.y, t));
    const wobble = active ? Math.sin(t * 14) * (1 - t) * 4 : 0;
    plate.setAttribute('transform', `rotate(${wobble} ${lerp(P0.x, P1.x, t)} ${lerp(P0.y, P1.y, t)})`);
    plate.setAttribute('data-progress', progress.toFixed(3));
    plate.setAttribute('data-active', active ? '1' : '0');
  };

  const spawn = () => {
    progress = 0; active = true; resolvedThisPlate = false;
    duration = DURATION + (Math.random() * 160 - 80);
    plate.style.opacity = 1;
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
    if (streak >= WIN) { kit.win('twelve. not one chip.'); return; }
    plate.style.opacity = 0;
    kit.after(220, spawn);
  };

  const tap = () => {
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
}
