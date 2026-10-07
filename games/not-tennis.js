// T19 — it's not tennis. pickleball paddle
// A court from above, a green wall, a paddle with a handle, a ball with real holes.
// Ten returns in a row — a satisfying squash on each one.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT;
  const WIN = 10;
  const PADDLE_W = 180, PADDLE_Y = 860, PADDLE_H = 26;
  const BALL_R = 17;
  const head = art.heading(kit, "it's not tennis.", 'rally — ten in a row');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#EFECE6' }));

  // the wall
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 150, fill: art.SPRUCE }));
  svg.append(kit.svg('rect', { x: 0, y: 136, width: 1000, height: 14, fill: art.shade(art.SPRUCE, -0.2) }));
  const bricks = kit.svg('g', { stroke: art.shade(art.SPRUCE, -0.2), 'stroke-width': 2, opacity: 0.35 });
  for (let r0 = 0; r0 < 3; r0++) {
    bricks.append(kit.svg('line', { x1: 0, y1: 10 + r0 * 44, x2: 1000, y2: 10 + r0 * 44 }));
    for (let c = 0; c < 10; c++) bricks.append(kit.svg('line', { x1: c * 100 + (r0 % 2 ? 50 : 0), y1: 10 + r0 * 44, x2: c * 100 + (r0 % 2 ? 50 : 0), y2: 10 + (r0 + 1) * 44 }));
  }
  svg.append(bricks);

  // the court, from above
  svg.append(kit.svg('rect', { x: 70, y: 150, width: 860, height: 760, fill: 'none', stroke: ink, 'stroke-width': 4, opacity: 0.16 }));
  svg.append(kit.svg('line', { x1: 500, y1: 150, x2: 500, y2: 910, stroke: ink, 'stroke-width': 3, opacity: 0.09 }));
  svg.append(kit.svg('line', { x1: 70, y1: 390, x2: 930, y2: 390, stroke: art.shade(art.SPRUCE, 0.1), 'stroke-width': 4, opacity: 0.4, 'stroke-dasharray': '3 12' }));

  // the paddle: a head, a handle, a hand gripping it from the bottom edge
  const paddleRoot = kit.svg('g');
  paddleRoot.append(kit.svg('rect', { x: -9, y: -4, width: 18, height: 54, rx: 9, fill: art.DUSTY }));
  paddleRoot.append(kit.svg('circle', { cx: 0, cy: 50, r: 28, fill: art.SKINS[1] }));
  paddleRoot.append(kit.svg('ellipse', { cx: 0, cy: -46, rx: PADDLE_W / 2, ry: PADDLE_H * 1.3, fill: accent, stroke: '#07351f', 'stroke-width': 5 }));
  paddleRoot.append(kit.svg('ellipse', { cx: -PADDLE_W * 0.16, cy: -70, rx: PADDLE_W * 0.2, ry: PADDLE_H * 0.55, fill: art.shade(accent, 0.18), opacity: 0.5 }));
  svg.append(paddleRoot);

  // the ball: real dimples, not a plain dot
  const ballRoot = kit.svg('g');
  ballRoot.append(kit.svg('circle', { cx: 0, cy: 0, r: BALL_R, fill: '#F7F5F1', stroke: ink, 'stroke-width': 3 }));
  for (const [hx, hy] of [[0, -9], [8, -3], [-8, -3], [5, 7], [-5, 7], [0, 10]]) ballRoot.append(kit.svg('circle', { cx: hx, cy: hy, r: 2.2, fill: ink, opacity: 0.5 }));
  svg.append(ballRoot);

  kit.stage.append(svg);

  let paddleX = 500, ball_ = { x: 500, y: 450, vx: 220, vy: -340 }, returns = 0, speedMul = 1, won = false, started = false;
  let paddleSquashT = -1, ballSquashT = -1;
  const SQ = 180;
  const squash = (t0) => { if (t0 < 0) return 1; const dt = performance.now() - t0; return dt > SQ ? 1 : 1 - Math.sin((dt / SQ) * Math.PI) * 0.3; };

  const place = () => {
    const ps = squash(paddleSquashT), bs = squash(ballSquashT);
    paddleRoot.setAttribute('transform', `translate(${paddleX} ${PADDLE_Y}) scale(1 ${ps})`);
    ballRoot.setAttribute('transform', `translate(${ball_.x} ${ball_.y}) scale(${2 - bs} ${bs})`);
  };

  const touch = () => { if (!started) { started = true; head.hide(); } };
  const movePaddle = (fx) => { touch(); paddleX = Math.max(PADDLE_W / 2, Math.min(1000 - PADDLE_W / 2, fx * 1000)); };
  kit.on(kit.stage, 'pointermove', (e) => movePaddle(kit.point(e).x));
  kit.on(kit.stage, 'pointerdown', (e) => movePaddle(kit.point(e).x));

  let left = false, right = false;
  kit.on(window, 'keydown', (e) => { touch(); if (e.key === 'ArrowLeft') { left = true; e.preventDefault(); } if (e.key === 'ArrowRight') { right = true; e.preventDefault(); } });
  kit.on(window, 'keyup', (e) => { if (e.key === 'ArrowLeft') left = false; if (e.key === 'ArrowRight') right = false; });

  const resetBall = () => { ball_ = { x: 500, y: 450, vx: (Math.random() < 0.5 ? -1 : 1) * 200, vy: -320 }; speedMul = 1; };

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
    if (ball_.y <= 150 + BALL_R) { ball_.y = 150 + BALL_R; ball_.vy *= -1; ballSquashT = performance.now(); }

    if (ball_.vy > 0 && ball_.y + BALL_R >= PADDLE_Y - 46 && ball_.y + BALL_R <= PADDLE_Y - 46 + PADDLE_H * 1.3 + 20) {
      if (ball_.x >= paddleX - PADDLE_W / 2 - BALL_R && ball_.x <= paddleX + PADDLE_W / 2 + BALL_R) {
        ball_.vy = -Math.abs(ball_.vy);
        const off = (ball_.x - paddleX) / (PADDLE_W / 2);
        ball_.vx = off * 260;
        returns++;
        speedMul = Math.min(1.5, speedMul + 0.04);
        paddleSquashT = performance.now(); ballSquashT = performance.now();
        kit.status(`${returns}/${WIN}`);
        if (returns >= WIN) {
          won = true; place();
          kit.after(150, () => { art.winBeat(kit, "it's not tennis."); kit.after(1100, () => kit.win("ten in a row. that's not tennis.")); });
          return false;
        }
      }
    }

    if (ball_.y > 1040) { returns = 0; speedMul = 1; kit.status('missed. again.'); resetBall(); }
    place();
  });
}
