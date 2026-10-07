// T10 — we're not lost bucket hat
// A small maze with a blinking "ask for directions" button. Press it and you've lost.
// Reach the end without it. A town from above: houses, trees, a park, a car as the player.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED;
  const head = art.heading(kit, "we're not lost.", 'find your way — never ask');

  // 1 = block, 0 = street. 7x7, start top-left, exit bottom-right.
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
  const CELL = 100, OX = 110, OY = 150;
  const start = { x: 0, y: 0 }, exit = { x: N - 1, y: N - 1 };

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#D9D2BC' }));

  const grid = kit.svg('g');
  svg.append(grid);
  // streets: a light tarmac grid under everything
  grid.append(kit.svg('rect', { x: OX - 10, y: OY - 10, width: N * CELL + 20, height: N * CELL + 20, rx: 10, fill: '#BDB7A4' }));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    grid.append(kit.svg('rect', { x: OX + x * CELL, y: OY + y * CELL, width: CELL, height: CELL, fill: '#C7C0AC', stroke: '#BDB7A4', 'stroke-width': 2 }));
  }

  const RED = '#C23B3B';
  const rand = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s / 2147483647); }; };

  function house(x, y, rng) {
    const cx = OX + x * CELL + CELL / 2, cy = OY + y * CELL + CELL / 2;
    const g = kit.svg('g', { transform: `translate(${cx} ${cy})` });
    const roofColor = [art.CLAY, RED, art.SPRUCE, art.shade(art.DUSTY, -0.1)][Math.floor(rng() * 4)];
    const s = 60 + rng() * 10;
    g.append(kit.svg('rect', { x: -s / 2, y: -s / 2, width: s, height: s, rx: 4, fill: art.shade(art.OAT, 0.08) }));
    g.append(kit.svg('rect', { x: -s / 2, y: s / 2 - 6, width: s, height: 6, fill: art.shade(art.OAT, -0.2), opacity: 0.6 }));
    g.append(kit.svg('rect', { x: -s * 0.34, y: -s * 0.1, width: s * 0.68, height: s * 0.68, rx: 5, fill: roofColor }));
    g.append(kit.svg('rect', { x: -s * 0.34, y: -s * 0.1, width: s * 0.34, height: s * 0.34, fill: art.shade(roofColor, -0.16), opacity: 0.55 }));
    g.append(kit.svg('rect', { x: -6, y: s * 0.14, width: 12, height: 12, fill: art.shade(roofColor, -0.3) }));
    return g;
  }
  function tree(x, y, rng) {
    const cx = OX + x * CELL + CELL / 2, cy = OY + y * CELL + CELL / 2;
    const g = kit.svg('g', { transform: `translate(${cx} ${cy})` });
    const r = 22 + rng() * 8;
    g.append(kit.svg('circle', { cx: 0, cy: 0, r, fill: art.SPRUCE }));
    g.append(kit.svg('circle', { cx: -r * 0.3, cy: -r * 0.3, r: r * 0.55, fill: art.shade(art.SPRUCE, 0.14), opacity: 0.5 }));
    g.append(kit.svg('circle', { cx: 0, cy: 0, r: 5, fill: art.shade(art.SPRUCE, -0.3) }));
    return g;
  }
  function park(x, y) {
    const cx = OX + x * CELL + CELL / 2, cy = OY + y * CELL + CELL / 2;
    const g = kit.svg('g');
    g.append(kit.svg('rect', { x: cx - CELL / 2 + 4, y: cy - CELL / 2 + 4, width: CELL - 8, height: CELL - 8, rx: 10, fill: art.shade(art.SPRUCE, 0.22) }));
    for (const [dx, dy] of [[-24, -18], [20, 10], [-10, 22], [22, -20]]) g.append(tree2(cx + dx, cy + dy));
    return g;
    function tree2(tx, ty) {
      const t = kit.svg('g', { transform: `translate(${tx} ${ty})` });
      t.append(kit.svg('circle', { cx: 0, cy: 0, r: 14, fill: art.SPRUCE }));
      return t;
    }
  }

  const blocksLayer = kit.svg('g');
  grid.append(blocksLayer);
  const rng = rand(42);
  let parkPlaced = false;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if ((x === start.x && y === start.y) || (x === exit.x && y === exit.y)) continue;
    if (MAZE[y][x]) {
      if (!parkPlaced && rng() < 0.3) { blocksLayer.append(park(x, y)); parkPlaced = true; }
      else blocksLayer.append(house(x, y, rng));
    } else if (rng() < 0.22) {
      blocksLayer.append(tree(x, y, rng));
    }
  }

  // the exit: a little green front door, glowing
  const exitX = OX + exit.x * CELL + CELL / 2, exitY = OY + exit.y * CELL + CELL / 2;
  grid.append(kit.svg('circle', { cx: exitX, cy: exitY, r: 44, fill: art.ACCENT, opacity: 0.18 }));
  grid.append(kit.svg('rect', { x: exitX - 20, y: exitY - 28, width: 40, height: 56, rx: 6, fill: art.ACCENT }));
  grid.append(kit.svg('circle', { cx: exitX + 12, cy: exitY, r: 3, fill: '#fff' }));

  // the player: a small top-down car
  function topCar() {
    const g = kit.svg('g');
    g.append(kit.svg('rect', { x: -22, y: -34, width: 44, height: 68, rx: 14, fill: ink }));
    g.append(kit.svg('rect', { x: -16, y: -24, width: 32, height: 22, rx: 6, fill: art.DUSTY, opacity: 0.7 }));
    g.append(kit.svg('rect', { x: -16, y: 2, width: 32, height: 22, rx: 6, fill: art.DUSTY, opacity: 0.7 }));
    g.append(kit.svg('rect', { x: -26, y: -16, width: 6, height: 14, rx: 2, fill: muted }));
    g.append(kit.svg('rect', { x: 20, y: -16, width: 6, height: 14, rx: 2, fill: muted }));
    g.append(kit.svg('rect', { x: -26, y: 10, width: 6, height: 14, rx: 2, fill: muted }));
    g.append(kit.svg('rect', { x: 20, y: 10, width: 6, height: 14, rx: 2, fill: muted }));
    return g;
  }
  const player = kit.svg('g');
  player.append(topCar());
  svg.append(player);

  let pos = { ...start }, facing = 0;
  const place = () => player.setAttribute('transform', `translate(${OX + pos.x * CELL + CELL / 2}, ${OY + pos.y * CELL + CELL / 2}) rotate(${facing})`);
  place();

  const hint = kit.svg('g');
  svg.append(hint);
  function drawHints() {
    hint.replaceChildren();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = pos.x + dx, ny = pos.y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || MAZE[ny][nx]) continue;
      const cx = OX + nx * CELL + CELL / 2, cy = OY + ny * CELL + CELL / 2;
      const g = kit.svg('circle', { cx, cy, r: 16, fill: '#fff', opacity: 0.4, style: { cursor: 'pointer' } });
      kit.on(g, 'pointerdown', () => move(nx, ny, dx, dy));
      hint.append(g);
    }
  }
  drawHints();

  let started = false;
  function move(nx, ny, dx, dy) {
    if (!started) { started = true; head.hide(); }
    facing = dx === 1 ? 90 : dx === -1 ? -90 : dy === 1 ? 180 : 0;
    pos = { x: nx, y: ny };
    place();
    drawHints();
    if (pos.x === exit.x && pos.y === exit.y) {
      kit.after(300, () => {
        art.winBeat(kit, "we're not lost.");
        kit.after(1100, () => kit.win("we're not lost."));
      });
    }
  }

  kit.on(window, 'keydown', (e) => {
    const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
    if (!d) return;
    e.preventDefault();
    if (!started) { started = true; head.hide(); }
    const nx = pos.x + d[0], ny = pos.y + d[1];
    if (nx < 0 || ny < 0 || nx >= N || ny >= N || MAZE[ny][nx]) return;
    move(nx, ny, d[0], d[1]);
  });

  // the blinking trap: a passer-by who waves you over
  const askWrap = kit.el('button', { class: 'g-btn', style: { position: 'absolute', left: '50%', bottom: '4%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' } });
  const passerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  passerSvg.setAttribute('viewBox', '0 0 100 100');
  passerSvg.setAttribute('width', '28'); passerSvg.setAttribute('height', '28');
  const passer = art.person(kit, { x: 50, y: 92, scale: 0.42, facing: 1, shirt: art.CLAY, skin: art.SKINS[1], hair: 'short', pose: 'wave', legs: true, idle: false });
  passerSvg.append(passer.el);
  askWrap.append(passerSvg, document.createTextNode('ask for directions'));
  kit.stage.append(askWrap);
  kit.loop((dt, t) => { if (!kit.reducedMotion) askWrap.style.opacity = String(0.55 + 0.45 * Math.abs(Math.sin(t / 400))); });
  kit.on(askWrap, 'click', () => {
    if (!started) { started = true; head.hide(); }
    pos = { ...start };
    facing = 0;
    place();
    drawHints();
    kit.status('asked. back to the start.');
    kit.after(1200, () => kit.status(''));
  });

  window.__nl = { solve: () => {
    // walk a known-good path to the exit
    const path = [[1, 0], [0, 1], [0, 1], [-1, 0], [0, 1], [0, 1], [1, 0], [1, 0], [1, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 0]];
    let i = 0;
    const step = () => {
      if (i >= path.length || (pos.x === exit.x && pos.y === exit.y)) return;
      const [dx, dy] = path[i++];
      const nx = pos.x + dx, ny = pos.y + dy;
      if (nx >= 0 && ny >= 0 && nx < N && ny < N && !MAZE[ny][nx]) move(nx, ny, dx, dy);
      if (pos.x !== exit.x || pos.y !== exit.y) setTimeout(step, 10);
    };
    step();
  } };
}
