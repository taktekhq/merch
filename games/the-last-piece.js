// T20 — the last piece. jigsaw with tin
// Keep the plain ivory picture (it's the real puzzle) but give the tiles real jigsaw knobs,
// interlocking the way true pieces do, sitting in the tin lid with a soft shadow.
import * as art from './_art.js';

// A jigsaw-piece outline for a cell of size w×h. `edges` is {top,right,bottom,left}, each
// 0 (straight — a board edge), +1 (a tab poking outward) or -1 (a socket, same spot, inward).
function piecePath(w, h, edges) {
  const seg = (x1, y1, x2, y2, sign, nx, ny) => {
    if (!sign) return ` L ${x2} ${y2}`;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const depth = sign * len * 0.17, half = len * 0.16, r = len * 0.15;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const ax = mx - ux * half, ay = my - uy * half;
    const bx = mx + ux * half, by = my + uy * half;
    const cx = mx + nx * depth, cy = my + ny * depth;
    const n1x = ax + nx * r * 0.8, n1y = ay + ny * r * 0.8;
    const n2x = bx + nx * r * 0.8, n2y = by + ny * r * 0.8;
    return ` L ${ax} ${ay} C ${n1x} ${n1y} ${cx - ux * r} ${cy - uy * r} ${cx} ${cy} C ${cx + ux * r} ${cy + uy * r} ${n2x} ${n2y} ${bx} ${by} L ${x2} ${y2}`;
  };
  let d = 'M 0 0';
  d += seg(0, 0, w, 0, edges.top, 0, -1);
  d += seg(w, 0, w, h, edges.right, 1, 0);
  d += seg(w, h, 0, h, edges.bottom, 0, 1);
  d += seg(0, h, 0, 0, edges.left, -1, 0);
  return d + ' Z';
}

export default function mount(kit) {
  const IVORY = '#F7F5F1', ink = art.INK, accent = art.ACCENT, card = art.CARD;
  const SIZE = 3, BOARD = 700, CELL = BOARD / SIZE, GAP = 14, TILE = CELL - GAP, BLANK = SIZE * SIZE - 1, DOT_HOME = 4;
  const OX = (1000 - BOARD) / 2, OY = (1000 - BOARD) / 2 + 94;
  const head = art.heading(kit, 'the last piece.', 'slide the pieces home');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: card }));

  // the tin lid: a rim around the board, a soft shadow under it
  art.shadow(svg, 500, OY + BOARD + 20, BOARD * 0.95, 0.14);
  svg.append(kit.svg('rect', { x: OX - 34, y: OY - 34, width: BOARD + 68, height: BOARD + 68, rx: 24, fill: art.shade(card, -0.05), stroke: art.shade(card, -0.24), 'stroke-width': 4 }));
  svg.append(kit.svg('rect', { x: OX - 34, y: OY - 34, width: BOARD + 68, height: 16, rx: 8, fill: art.shade(card, 0.14), opacity: 0.7 }));

  const tileLayer = kit.svg('g');
  svg.append(tileLayer);
  kit.stage.append(svg);

  // one random tab/socket sign per internal grid edge, shared by the two neighbours, so
  // pieces truly interlock once they're back home
  const vSign = Array.from({ length: SIZE }, () => Array.from({ length: SIZE - 1 }, () => (Math.random() < 0.5 ? -1 : 1)));
  const hSign = Array.from({ length: SIZE - 1 }, () => Array.from({ length: SIZE }, () => (Math.random() < 0.5 ? -1 : 1)));
  const edgesOf = (home) => {
    const row = Math.floor(home / SIZE), col = home % SIZE;
    return {
      top: row === 0 ? 0 : -hSign[row - 1][col],
      bottom: row === SIZE - 1 ? 0 : hSign[row][col],
      left: col === 0 ? 0 : -vSign[row][col - 1],
      right: col === SIZE - 1 ? 0 : vSign[row][col],
    };
  };

  let pos = Array.from({ length: SIZE * SIZE }, (_, i) => i);
  let blankAt = BLANK;
  let locked = false, started = false;

  const rc = (i) => [Math.floor(i / SIZE), i % SIZE];
  const solved = () => pos.every((v, i) => v === i);
  const neighbors = (i) => {
    const [row, col] = rc(i);
    const out = [];
    if (row > 0) out.push(i - SIZE);
    if (row < SIZE - 1) out.push(i + SIZE);
    if (col > 0) out.push(i - 1);
    if (col < SIZE - 1) out.push(i + 1);
    return out;
  };

  const tiles = new Map();
  for (let h = 0; h < SIZE * SIZE; h++) {
    if (h === BLANK) continue;
    const d = piecePath(TILE, TILE, edgesOf(h));
    const g = kit.svg('g', { 'data-home': h });
    g.append(kit.svg('path', { d, fill: ink, opacity: 0.07, transform: 'translate(5 7)' }));
    g.append(kit.svg('path', { d, fill: IVORY, stroke: ink, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
    g.append(kit.svg('path', { d: `M 6 6 L ${TILE * 0.4} 6`, stroke: '#fff', 'stroke-width': 5, opacity: 0.5, 'stroke-linecap': 'round' }));
    if (h === DOT_HOME) g.append(kit.svg('circle', { cx: TILE / 2, cy: TILE / 2, r: TILE * 0.15, fill: accent }));
    g.style.cursor = 'pointer';
    tileLayer.append(g);
    tiles.set(h, g);
  }

  const place = () => {
    pos.forEach((home, boardIndex) => {
      if (home === BLANK) return;
      const [row, col] = rc(boardIndex);
      tiles.get(home).setAttribute('transform', `translate(${OX + col * CELL + GAP / 2} ${OY + row * CELL + GAP / 2})`);
    });
  };

  const trySwap = (boardIndex) => {
    if (locked) return;
    if (!neighbors(blankAt).includes(boardIndex)) return;
    if (!started) { started = true; head.hide(); }
    [pos[blankAt], pos[boardIndex]] = [pos[boardIndex], pos[blankAt]];
    blankAt = boardIndex;
    place();
    if (solved()) {
      locked = true;
      kit.status('solved.');
      bounceAndWin();
    }
  };

  function bounceAndWin() {
    const t0 = performance.now();
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / 420);
      const lift = Math.sin(p * Math.PI) * -10;
      tileLayer.setAttribute('transform', `translate(0 ${lift})`);
      if (p < 1) requestAnimationFrame(step);
      else {
        tileLayer.setAttribute('transform', 'translate(0 0)');
        art.winBeat(kit, 'the last piece.');
        kit.after(1100, () => kit.win('the last piece. the tin opens.'));
      }
    };
    step();
  }

  // scramble with real valid moves, so it's always solvable
  (() => {
    let last = -1;
    for (let n = 0; n < 40; n++) {
      const opts = neighbors(blankAt).filter((o) => o !== last);
      const next = opts[Math.floor(Math.random() * opts.length)];
      [pos[blankAt], pos[next]] = [pos[next], pos[blankAt]];
      last = blankAt;
      blankAt = next;
    }
    if (solved()) { const n = neighbors(blankAt)[0]; [pos[blankAt], pos[n]] = [pos[n], pos[blankAt]]; blankAt = n; }
  })();
  place();

  kit.on(svg, 'pointerdown', (e) => {
    e.preventDefault();
    const p = kit.point(e);
    const col = Math.min(SIZE - 1, Math.max(0, Math.floor(((p.x * 1000) - OX) / CELL)));
    const row = Math.min(SIZE - 1, Math.max(0, Math.floor(((p.y * 1000) - OY) / CELL)));
    trySwap(row * SIZE + col);
  });

  kit.on(window, 'keydown', (e) => {
    const [br, bc] = rc(blankAt);
    let target = null;
    if (e.key === 'ArrowUp') target = [br + 1, bc];
    else if (e.key === 'ArrowDown') target = [br - 1, bc];
    else if (e.key === 'ArrowLeft') target = [br, bc + 1];
    else if (e.key === 'ArrowRight') target = [br, bc - 1];
    if (!target) return;
    const [tr, tc] = target;
    if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) return;
    e.preventDefault();
    trySwap(tr * SIZE + tc);
  });

  kit.status('slide the pieces home.');

  // Testing hook so check.mjs can drive a solve without guessing pixel coordinates.
  // Harmless: the game is the fun, not a lock (see earned/README.md).
  window.__tlp = { pos: () => pos.slice(), blankAt: () => blankAt, trySwap };
}
