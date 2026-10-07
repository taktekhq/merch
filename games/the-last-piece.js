// the last piece. — a 3x3 slide puzzle of the puzzle's own picture: all ivory,
// one green dot. The last piece clicks in and the tin opens.
export default function mount(kit) {
  const IVORY = '#F7F5F1', CARD = '#EFECE6', INK = '#0D0D0E', GREEN = kit.colors.accent || '#00A862';
  const SIZE = 3, CELL = 1000 / SIZE, BLANK = SIZE * SIZE - 1;
  const DOT_HOME = 4; // centre tile carries the picture's one green dot

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: CARD }));
  kit.stage.append(svg);

  const tileLayer = kit.svg('g');
  svg.append(tileLayer);

  // pos[boardIndex] = home index of the tile sitting there (BLANK = empty slot)
  let pos = Array.from({ length: SIZE * SIZE }, (_, i) => i);
  let blankAt = BLANK;
  let locked = false;

  const rc = (i) => [Math.floor(i / SIZE), i % SIZE];
  const solved = () => pos.every((v, i) => v === i);

  const neighbors = (i) => {
    const [r, c] = rc(i);
    const out = [];
    if (r > 0) out.push(i - SIZE);
    if (r < SIZE - 1) out.push(i + SIZE);
    if (c > 0) out.push(i - 1);
    if (c < SIZE - 1) out.push(i + 1);
    return out;
  };

  const tiles = new Map(); // home index -> svg group
  for (let h = 0; h < SIZE * SIZE; h++) {
    if (h === BLANK) continue;
    const g = kit.svg('g', { 'data-home': h, style: { cursor: 'pointer' } });
    g.append(kit.svg('rect', { x: 3, y: 3, width: CELL - 6, height: CELL - 6, rx: 14, fill: IVORY, stroke: INK, 'stroke-width': 4 }));
    if (h === DOT_HOME) g.append(kit.svg('circle', { cx: CELL / 2, cy: CELL / 2, r: CELL * 0.18, fill: GREEN }));
    g.append(kit.svg('text', { x: 16, y: CELL - 14, 'font-family': 'var(--mono)', 'font-size': 18, fill: INK, opacity: 0.22 }, [String(h + 1)]));
    tileLayer.append(g);
    tiles.set(h, g);
  }

  const place = () => {
    pos.forEach((home, boardIndex) => {
      if (home === BLANK) return;
      const [r, c] = rc(boardIndex);
      tiles.get(home).setAttribute('transform', `translate(${c * CELL} ${r * CELL})`);
    });
    svg.setAttribute('data-pos', JSON.stringify(pos));
    svg.setAttribute('data-blank', String(blankAt));
  };

  const trySwap = (boardIndex) => {
    if (locked) return;
    if (!neighbors(blankAt).includes(boardIndex)) return;
    [pos[blankAt], pos[boardIndex]] = [pos[boardIndex], pos[blankAt]];
    blankAt = boardIndex;
    place();
    if (solved()) {
      locked = true;
      kit.status('solved.');
      kit.win('the last piece. the tin opens.');
    }
  };

  // scramble with real valid moves, so it's always solvable
  (() => {
    let last = -1;
    for (let n = 0; n < 24; n++) {
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
    const col = Math.min(SIZE - 1, Math.max(0, Math.floor(p.x * SIZE)));
    const row = Math.min(SIZE - 1, Math.max(0, Math.floor(p.y * SIZE)));
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
}
