// T06 — food at home tote
// A checkout belt rolls past 20 tempting things. Tap one and a voice says "we have food
// at home." and it resets. Let 30 seconds pass untouched, then the tote rolls by: that's
// the only thing you take.
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const BUTTER = '#F2D98A', CLAY = '#C9764F', DUSTY = '#8FA6B8';
  const QUIET_MS = 30000;

  const ITEMS = [
    ['chips', CLAY], ['soda', DUSTY], ['candy', accent], ['cookies', BUTTER], ['gum', CLAY],
    ['chocolate', ink], ['cereal', BUTTER], ['juice', DUSTY], ['crackers', CLAY], ['pretzels', BUTTER],
    ['soda 2', DUSTY], ['candy 2', accent], ['chips 2', CLAY], ['popcorn', BUTTER], ['juice 2', DUSTY],
    ['cookies 2', BUTTER], ['gum 2', CLAY], ['chocolate 2', ink], ['cereal 2', BUTTER], ['crackers 2', CLAY],
  ];

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#fff', opacity: 0.3 }));
  svg.append(kit.svg('rect', { x: 0, y: 560, width: 1000, height: 70, fill: muted, opacity: 0.25 }));
  svg.append(kit.svg('line', { x1: 0, y1: 560, x2: 1000, y2: 560, stroke: ink, 'stroke-opacity': 0.2, 'stroke-width': 4 }));
  svg.append(kit.svg('line', { x1: 0, y1: 630, x2: 1000, y2: 630, stroke: ink, 'stroke-opacity': 0.2, 'stroke-width': 4 }));
  const caption = kit.svg('text', { x: 500, y: 120, 'text-anchor': 'middle', 'font-size': 30, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
  const bubble = kit.svg('text', { x: 500, y: 300, 'text-anchor': 'middle', 'font-size': 26, fill: CLAY, 'font-family': 'var(--display)', 'font-weight': 600, opacity: 0 });
  svg.append(caption, bubble);
  caption.textContent = "don't buy anything.";

  const belt = kit.svg('g');
  svg.append(belt);
  const SPACING = 150;
  const items = ITEMS.map((it, i) => {
    const g = kit.svg('g', { style: { cursor: 'pointer' } });
    g.append(kit.svg('rect', { x: -40, y: -40, width: 80, height: 80, rx: 14, fill: it[1] }));
    g.append(kit.svg('text', { x: 0, y: 70, 'text-anchor': 'middle', 'font-size': 14, fill: muted, 'font-family': 'var(--mono)' }, it[0]));
    g._x = i * SPACING;
    belt.append(g);
    kit.on(g, 'click', () => tempt());
    return g;
  });
  const total = items.length * SPACING;
  let speed = 90; // px/s

  let lastTouch = performance.now();
  let toteSpawned = false;
  let tote = null;

  function tempt() {
    if (toteSpawned) return;
    lastTouch = performance.now();
    bubble.textContent = 'we have food at home.';
    bubble.setAttribute('opacity', 1);
    kit.after(700, () => bubble.setAttribute('opacity', 0));
  }

  function spawnTote() {
    toteSpawned = true;
    caption.textContent = 'the tote.';
    tote = kit.svg('g', { style: { cursor: 'pointer' } });
    tote.append(kit.svg('rect', { x: -55, y: -50, width: 110, height: 95, rx: 10, fill: BUTTER, stroke: ink, 'stroke-width': 4 }));
    tote.append(kit.svg('path', { d: 'M -30 -50 Q -30 -90 0 -90 Q 30 -90 30 -50', fill: 'none', stroke: ink, 'stroke-width': 8 }));
    tote._x = -120;
    belt.append(tote);
    kit.on(tote, 'click', () => kit.win('that one. just that one.'));
  }

  kit.loop((dt) => {
    const dx = (speed * dt) / 1000;
    for (const g of items) {
      if (toteSpawned) continue;
      g._x -= dx;
      if (g._x < -120) g._x += total;
      g.setAttribute('transform', `translate(${g._x}, 595)`);
    }
    if (tote) {
      tote._x += dx * 0.9;
      tote.setAttribute('transform', `translate(${tote._x}, 595)`);
      if (tote._x > 1120) tote._x = -120; // keep it circling gently if missed
    }
    const idle = performance.now() - lastTouch;
    if (!toteSpawned) {
      const left = Math.max(0, QUIET_MS - idle);
      kit.status(`${Math.ceil(left / 1000)}s of nothing tempting you`);
      if (idle >= QUIET_MS) spawnTote();
    }
  });

  kit.status('30s of nothing tempting you');
}
