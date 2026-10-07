// it's not tennis. — a wall, a paddle, a ball. Ten returns in a row.
// Move the paddle with the pointer, touch, or the arrow keys.
export default function mount(kit) {
  const INK = '#0D0D0E', MUTED = '#6B6A66', GREEN = kit.colors.accent || '#00A862', FOREST = '#2F4F46';
  const WIN = 10;
  const PADDLE_W = 170, PADDLE_Y = 880, PADDLE_H = 22;
  const BALL_R = 16;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#EFECE6' }));
  // the wall
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 110, fill: FOREST }));
  const brickRows = kit.svg('g', { stroke: '#1d352e', 'stroke-width': 3, opacity: 0.5 });
  for (let r = 0; r < 2; r++) {
    brickRows.append(kit.svg('line', { x1: 0, y1: 38 + r * 36, x2: 1000, y2: 38 + r * 36 }));
    for (let c = 0; c < 10; c++) brickRows.append(kit.svg('line', { x1: c * 100 + (r % 2 ? 50 : 0), y1: 2 + r * 36, x2: c * 100 + (r % 2 ? 50 : 0), y2: 38 + r * 36 }));
  }
  svg.append(brickRows);
  // court lines, decorative
  svg.append(kit.svg('line', { x1: 500, y1: 110, x2: 500, y2: 940, stroke: INK, 'stroke-width': 3, opacity: 0.08 }));
  svg.append(kit.svg('rect', { x: 60, y: 110, width: 880, height: 830, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: 0.08 }));

  const paddle = kit.svg('rect', { x: 500 - PADDLE_W / 2, y: PADDLE_Y, width: PADDLE_W, height: PADDLE_H, rx: 11, fill: GREEN, stroke: '#07351f', 'stroke-width': 4 });
  svg.append(paddle);
  const ball = kit.svg('circle', { cx: 500, cy: 500, r: BALL_R, fill: INK });
  svg.append(ball);

  const streakText = kit.svg('text', { x: 500, y: 70, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 30, fill: '#F7F5F1' });
  svg.append(streakText);

  kit.stage.append(svg);

  let paddleX = 500;
  let ball_ = { x: 500, y: 450, vx: 220, vy: -340 };
  let returns = 0, speedMul = 1, won = false;

  const place = () => {
    paddle.setAttribute('x', paddleX - PADDLE_W / 2);
    ball.setAttribute('cx', ball_.x);
    ball.setAttribute('cy', ball_.y);
    streakText.textContent = `${returns}/${WIN}`;
  };

  const movePaddle = (clientFracX) => { paddleX = Math.max(PADDLE_W / 2, Math.min(1000 - PADDLE_W / 2, clientFracX * 1000)); };
  kit.on(kit.stage, 'pointermove', (e) => movePaddle(kit.point(e).x));
  kit.on(kit.stage, 'pointerdown', (e) => movePaddle(kit.point(e).x));

  let left = false, right = false;
  kit.on(window, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') { left = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { right = true; e.preventDefault(); }
  });
  kit.on(window, 'keyup', (e) => {
    if (e.key === 'ArrowLeft') left = false;
    if (e.key === 'ArrowRight') right = false;
  });

  const resetBall = () => {
    ball_ = { x: 500, y: 450, vx: (Math.random() < 0.5 ? -1 : 1) * 200, vy: -320 };
    speedMul = 1;
  };

  kit.status(`0/${WIN}`);
  place();

  kit.loop((dt) => {
    if (won) return;
    const s = dt / 1000;
    if (left) paddleX = Math.max(PADDLE_W / 2, paddleX - 640 * s);
    if (right) paddleX = Math.min(1000 - PADDLE_W / 2, paddleX + 640 * s);

    ball_.x += ball_.vx * speedMul * s;
    ball_.y += ball_.vy * speedMul * s;

    if (ball_.x <= BALL_R) { ball_.x = BALL_R; ball_.vx *= -1; }
    if (ball_.x >= 1000 - BALL_R) { ball_.x = 1000 - BALL_R; ball_.vx *= -1; }
    if (ball_.y <= 110 + BALL_R) { ball_.y = 110 + BALL_R; ball_.vy *= -1; }

    if (ball_.vy > 0 && ball_.y + BALL_R >= PADDLE_Y && ball_.y + BALL_R <= PADDLE_Y + PADDLE_H + 20) {
      if (ball_.x >= paddleX - PADDLE_W / 2 - BALL_R && ball_.x <= paddleX + PADDLE_W / 2 + BALL_R) {
        ball_.vy = -Math.abs(ball_.vy);
        const off = (ball_.x - paddleX) / (PADDLE_W / 2);
        ball_.vx = off * 260;
        returns++;
        speedMul = Math.min(1.5, speedMul + 0.04);
        kit.status(`${returns}/${WIN}`);
        if (returns >= WIN) { won = true; kit.status(`${WIN}/${WIN}`); place(); kit.win("ten in a row. that's not tennis."); return false; }
      }
    }

    if (ball_.y > 1000 + 40) {
      returns = 0; speedMul = 1;
      kit.status('missed. again.');
      resetBall();
    }
    place();
  });
}
