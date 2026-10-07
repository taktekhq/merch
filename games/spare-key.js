// T02 — the spare key hoodie
// A front porch: doormat, plant pot, fake rock, above the frame, under the gnome. All empty.
// Then the neighbour's window opens: "it's with me."
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const OAT = '#E8DFCF', CLAY = '#C9764F', SPRUCE = '#2F4F46';

  const spots = [
    { id: 'mat', x: 500, y: 860, draw: drawMat, line: 'just the mat.' },
    { id: 'pot', x: 210, y: 760, draw: drawPot, line: 'just the plant.' },
    { id: 'rock', x: 790, y: 800, draw: drawRock, line: 'a rock. a very fake rock.' },
    { id: 'frame', x: 500, y: 430, draw: drawFrame, line: 'nothing above the frame.' },
    { id: 'gnome', x: 330, y: 850, draw: drawGnome, line: 'the gnome has no pockets.' },
  ];
  const checked = new Set();

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: OAT }));
  // house wall + door
  svg.append(kit.svg('rect', { x: 150, y: 180, width: 700, height: 680, fill: '#fff', opacity: 0.55 }));
  svg.append(kit.svg('rect', { x: 430, y: 420, width: 140, height: 420, rx: 10, fill: SPRUCE }));
  svg.append(kit.svg('circle', { cx: 545, cy: 630, r: 8, fill: '#fff' }));
  // neighbour window, far right, closed
  const curtain = kit.svg('rect', { x: 850, y: 300, width: 110, height: 160, rx: 8, fill: SPRUCE });
  const windowFrame = kit.svg('rect', { x: 850, y: 300, width: 110, height: 160, rx: 8, fill: 'none', stroke: ink, 'stroke-width': 5, opacity: 0.5 });
  const face = kit.svg('circle', { cx: 905, cy: 380, r: 20, fill: ink, opacity: 0 });
  const bubble = kit.svg('g', { opacity: 0 });
  const bubbleRect = kit.svg('rect', { x: 700, y: 230, width: 230, height: 60, rx: 14, fill: '#fff', stroke: ink, 'stroke-width': 3 });
  const bubbleText = kit.svg('text', { x: 815, y: 268, 'text-anchor': 'middle', 'font-size': 24, fill: ink, 'font-family': 'var(--display)' });
  bubble.append(bubbleRect, bubbleText);
  svg.append(curtain, windowFrame, face, bubble);

  const caption = kit.svg('text', { x: 500, y: 80, 'text-anchor': 'middle', 'font-size': 26, fill: muted, 'font-family': 'var(--mono)' });
  svg.append(caption);
  caption.textContent = 'find the spare key.';

  const layer = kit.svg('g');
  svg.append(layer);
  const nodes = {};
  for (const s of spots) {
    const g = kit.svg('g', { style: { cursor: 'pointer' } });
    g.append(...s.draw());
    g.append(kit.svg('circle', { cx: s.x, cy: s.y - 70, r: 10, fill: 'none', stroke: muted, 'stroke-width': 3, opacity: 0.5 }));
    layer.append(g);
    nodes[s.id] = g;
    kit.on(g, 'click', () => check(s));
  }

  function check(s) {
    if (checked.has(s.id)) return;
    checked.add(s.id);
    nodes[s.id].style.opacity = 0.45;
    caption.textContent = s.line;
    kit.status(`${checked.size}/5 checked`);
    if (checked.size === spots.length) kit.after(500, reveal);
  }

  function reveal() {
    caption.textContent = 'huh.';
    kit.after(500, () => {
      curtain.setAttribute('x', 862); curtain.setAttribute('width', 85);
      face.setAttribute('opacity', 1);
      bubble.setAttribute('opacity', 1);
      bubbleText.textContent = "it's with me.";
      kit.after(1200, () => kit.win("it's with me."));
    });
  }

  function drawMat() { return [kit.svg('rect', { x: 430, y: 880, width: 140, height: 50, rx: 8, fill: CLAY })]; }
  function drawPot() { return [kit.svg('path', { d: 'M 170 760 L 250 760 L 235 830 L 185 830 Z', fill: CLAY }), kit.svg('circle', { cx: 210, cy: 740, r: 34, fill: SPRUCE })]; }
  function drawRock() { return [kit.svg('ellipse', { cx: 790, cy: 810, rx: 55, ry: 34, fill: muted, opacity: 0.6 })]; }
  function drawFrame() { return [kit.svg('rect', { x: 410, y: 400, width: 180, height: 20, rx: 6, fill: SPRUCE })]; }
  function drawGnome() { return [kit.svg('rect', { x: 310, y: 820, width: 40, height: 50, fill: SPRUCE }), kit.svg('path', { d: 'M 330 760 L 300 820 L 360 820 Z', fill: '#B33B3B' }), kit.svg('circle', { cx: 330, cy: 800, r: 14, fill: '#E8C9A8' })]; }
}
