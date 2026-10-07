// T10 — we're not lost bucket hat
// A small maze with a blinking "ask for directions" button. Press it and you've lost.
// Reach the end without it.
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const KHAKI = '#E8DFCF', CLAY = '#C9764F';

  // 1 = wall, 0 = open. 7x7, start top-left, exit bottom-right.
  const MAZE = [
    [0, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ];
  const N = MAZE.length;
  const CELL = 100, OX = 150, OY = 150;
  const start = { x: 0, y: 0 }, exit = { x: N - 1, y: N - 1 };

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: KHAKI, opacity: 0.4 }));
  const grid = kit.svg('g');
  svg.append(grid);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (MAZE[y][x]) grid.append(kit.svg('rect', { x: OX + x * CELL + 3, y: OY + y * CELL + 3, width: CELL - 6, height: CELL - 6, rx: 6, fill: ink, opacity: 0.75 }));
  }
  grid.append(kit.svg('rect', { x: OX + exit.x * CELL + 20, y: OY + exit.y * CELL + 20, width: CELL - 40, height: CELL - 40, rx: 10, fill: accent, opacity: 0.8 }));
  const player = kit.svg('circle', { r: 26, fill: ink });
  svg.append(player);
  const caption = kit.svg('text', { x: 500, y: 95, 'text-anchor': 'middle', 'font-size': 26, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
  svg.append(caption);
  caption.textContent = "we're not lost.";

  let pos = { ...start };
  const place = () => player.setAttribute('transform', `translate(${OX + pos.x * CELL + CELL / 2}, ${OY + pos.y * CELL + CELL / 2})`);
  place();

  // clickable neighbor targets
  const hint = kit.svg('g');
  svg.append(hint);
  function drawHints() {
    hint.replaceChildren();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = pos.x + dx, ny = pos.y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || MAZE[ny][nx]) continue;
      const cx = OX + nx * CELL + CELL / 2, cy = OY + ny * CELL + CELL / 2;
      const g = kit.svg('circle', { cx, cy, r: 20, fill: muted, opacity: 0.25, style: { cursor: 'pointer' } });
      kit.on(g, 'click', () => move(nx, ny));
      hint.append(g);
    }
  }
  drawHints();

  function move(nx, ny) {
    pos = { x: nx, y: ny };
    place();
    drawHints();
    if (pos.x === exit.x && pos.y === exit.y) kit.win("we're not lost.");
  }

  kit.on(window, 'keydown', (e) => {
    const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
    if (!d) return;
    e.preventDefault();
    const nx = pos.x + d[0], ny = pos.y + d[1];
    if (nx < 0 || ny < 0 || nx >= N || ny >= N || MAZE[ny][nx]) return;
    move(nx, ny);
  });

  // the blinking trap
  const ask = kit.el('button', { class: 'g-btn', text: 'ask for directions', style: { position: 'absolute', left: '50%', bottom: '5%', transform: 'translateX(-50%)' } });
  kit.stage.append(ask);
  kit.loop((dt, t) => { if (!kit.reducedMotion) ask.style.opacity = String(0.55 + 0.45 * Math.abs(Math.sin(t / 400))); });
  kit.on(ask, 'click', () => {
    pos = { ...start };
    place();
    drawHints();
    caption.textContent = 'asked. back to the start.';
    kit.after(1200, () => { caption.textContent = "we're not lost."; });
  });
}
