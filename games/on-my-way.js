// T07 — on my way tee
// Ten seconds to find keys, phone, wallet and sunglasses in a messy hallway. Make the door.
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const OAT = '#E8DFCF', CLAY = '#C9764F', DUSTY = '#8FA6B8';
  const TOTAL_MS = 10000;

  const NEEDED = [
    { id: 'keys', x: 230, y: 760, r: 34 },
    { id: 'phone', x: 700, y: 300, r: 36 },
    { id: 'wallet', x: 150, y: 420, r: 34 },
    { id: 'glasses', x: 560, y: 820, r: 36 },
  ];

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: OAT, opacity: 0.45 }));
  // clutter: coat pile, shoes, rug, bench
  svg.append(kit.svg('rect', { x: 60, y: 300, width: 220, height: 260, rx: 24, fill: muted, opacity: 0.25 }));
  svg.append(kit.svg('ellipse', { cx: 500, cy: 900, rx: 380, ry: 60, fill: CLAY, opacity: 0.3 }));
  svg.append(kit.svg('rect', { x: 600, y: 700, width: 260, height: 70, rx: 16, fill: muted, opacity: 0.3 }));
  for (let i = 0; i < 5; i++) svg.append(kit.svg('ellipse', { cx: 150 + i * 36, cy: 940, rx: 26, ry: 14, fill: ink, opacity: 0.25 }));

  const door = kit.svg('g', { style: { cursor: 'pointer' } });
  door.append(kit.svg('rect', { x: 860, y: 120, width: 120, height: 760, rx: 10, fill: '#2F4F46' }));
  door.append(kit.svg('circle', { cx: 900, cy: 500, r: 9, fill: BUTTER_SAFE() }));
  svg.append(door);
  function BUTTER_SAFE() { return '#F2D98A'; }

  const caption = kit.svg('text', { x: 440, y: 70, 'text-anchor': 'middle', 'font-size': 26, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
  svg.append(caption);

  const nodes = {};
  for (const n of NEEDED) {
    const g = kit.svg('g', { style: { cursor: 'pointer' } });
    g.append(kit.svg('circle', { cx: n.x, cy: n.y, r: n.r, fill: '#fff', stroke: ink, 'stroke-width': 4, opacity: 0.9 }));
    g.append(kit.svg('text', { x: n.x, y: n.y + 6, 'text-anchor': 'middle', 'font-size': 13, fill: ink, 'font-family': 'var(--mono)' }, n.id));
    svg.append(g);
    nodes[n.id] = g;
    kit.on(g, 'click', () => collect(n.id));
  }

  let found = new Set(), started = false, t0 = 0;

  function layout() {
    found = new Set();
    for (const n of NEEDED) { nodes[n.id].style.opacity = 1; nodes[n.id].style.pointerEvents = 'auto'; }
    door.style.opacity = 0.5;
    caption.textContent = 'find your keys, phone, wallet, sunglasses.';
  }
  layout();
  kit.status('get ready…');

  kit.after(700, () => { started = true; t0 = performance.now(); });

  function collect(id) {
    if (!started || kit.won) return;
    if (found.has(id)) return;
    found.add(id);
    nodes[id].style.opacity = 0.25;
    nodes[id].style.pointerEvents = 'none';
    if (found.size === NEEDED.length) {
      door.style.opacity = 1;
      caption.textContent = 'the door. go.';
    }
  }

  kit.on(door, 'click', () => {
    if (!started || kit.won) return;
    if (found.size === NEEDED.length) kit.win('on my way.');
  });

  kit.loop(() => {
    if (!started || kit.won) return;
    const left = Math.max(0, TOTAL_MS - (performance.now() - t0));
    kit.status(`${(left / 1000).toFixed(1)}s`);
    if (left <= 0) {
      started = false;
      caption.textContent = 'still looking. again.';
      kit.after(900, () => { layout(); kit.after(700, () => { started = true; t0 = performance.now(); }); });
    }
  });
}
