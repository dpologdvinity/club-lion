/**
 * Bricks Breaking rules with no React or DOM dependency: a ball bounces off
 * walls, the paddle and bricks in a 100 × 140 court. The floor bounces too,
 * so the ball is never lost; the round ends when the bricks are gone or the
 * clock runs out.
 */

export const BRICK_COLS = 8;
export const BRICK_ROWS = 5;
export const BRICKS_TOTAL = BRICK_COLS * BRICK_ROWS;
export const BRICKS_ROUND_MS = 90_000;
export const COURT_W = 100;
export const COURT_H = 140;
export const PADDLE_Y = 128;
export const PADDLE_W = 26;
const BALL_R = 2.4;
const BRICK_TOP = 12;
const BRICK_H = 6;

export type Ball = { x: number; y: number; vx: number; vy: number };

export function brickBox(i: number) {
  const w = COURT_W / BRICK_COLS;
  return {
    x: (i % BRICK_COLS) * w,
    y: BRICK_TOP + Math.floor(i / BRICK_COLS) * BRICK_H,
    w,
    h: BRICK_H,
  };
}

export function newBall(): Ball {
  return { x: 50, y: 110, vx: 22, vy: -38 };
}

/**
 * Moves the ball `dt` seconds with the paddle centred at `paddle`; returns
 * the new ball and which bricks it broke. Steps finely so it never tunnels.
 */
export function stepBall(
  ball: Ball,
  dt: number,
  paddle: number,
  standing: readonly boolean[],
): { ball: Ball; broke: number[] } {
  let { x, y, vx, vy } = ball;
  const broke: number[] = [];
  const steps = Math.max(1, Math.ceil(dt / 0.008));
  const h = dt / steps;
  for (let s = 0; s < steps; s++) {
    x += vx * h;
    y += vy * h;
    if (x < BALL_R) [x, vx] = [BALL_R, Math.abs(vx)];
    if (x > COURT_W - BALL_R) [x, vx] = [COURT_W - BALL_R, -Math.abs(vx)];
    if (y < BALL_R) [y, vy] = [BALL_R, Math.abs(vy)];
    // The soft floor: a free bounce, never a lost ball.
    if (y > COURT_H - BALL_R) [y, vy] = [COURT_H - BALL_R, -Math.abs(vy)];
    if (
      vy > 0 &&
      y + BALL_R >= PADDLE_Y &&
      y + BALL_R <= PADDLE_Y + 4 &&
      Math.abs(x - paddle) <= PADDLE_W / 2 + BALL_R
    ) {
      // Where it lands on the paddle steers it left or right.
      vx = ((x - paddle) / (PADDLE_W / 2)) * 34;
      vy = -Math.abs(vy);
      y = PADDLE_Y - BALL_R;
    }
    for (let i = 0; i < standing.length; i++) {
      if (!standing[i] || broke.includes(i)) continue;
      const b = brickBox(i);
      if (
        x + BALL_R > b.x &&
        x - BALL_R < b.x + b.w &&
        y + BALL_R > b.y &&
        y - BALL_R < b.y + b.h
      ) {
        broke.push(i);
        vy = -vy;
        break;
      }
    }
  }
  return { ball: { x, y, vx, vy }, broke };
}
