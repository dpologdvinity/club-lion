/**
 * Putt Putt Revolution rules with no React or DOM dependency: tap where the
 * ball should roll; it slows with friction and bounces off walls and blocks.
 * Every hole ends within six strokes, so nobody gets stuck.
 */

export const PUTT_W = 100;
export const PUTT_H = 140;
export const PUTT_MAX_STROKES = 6;
export const BALL_R = 2.2;
export const HOLE_R = 3.6;
const FRICTION = 1.6;

export type Block = { x: number; y: number; w: number; h: number };
export type Hole = {
  par: number;
  tee: [number, number];
  cup: [number, number];
  blocks: Block[];
};

export const HOLES: Hole[] = [
  { par: 1, tee: [50, 120], cup: [50, 25], blocks: [] },
  {
    par: 2,
    tee: [25, 120],
    cup: [75, 25],
    blocks: [{ x: 0, y: 65, w: 60, h: 8 }],
  },
  {
    par: 2,
    tee: [50, 125],
    cup: [50, 20],
    blocks: [{ x: 35, y: 60, w: 30, h: 10 }],
  },
  {
    par: 3,
    tee: [15, 125],
    cup: [85, 20],
    blocks: [
      { x: 30, y: 85, w: 70, h: 8 },
      { x: 0, y: 45, w: 70, h: 8 },
    ],
  },
  {
    par: 2,
    tee: [85, 125],
    cup: [15, 30],
    blocks: [{ x: 40, y: 50, w: 8, h: 60 }],
  },
  {
    par: 3,
    tee: [50, 128],
    cup: [50, 15],
    blocks: [
      { x: 0, y: 95, w: 40, h: 8 },
      { x: 60, y: 95, w: 40, h: 8 },
      { x: 30, y: 55, w: 40, h: 8 },
    ],
  },
];

export type Ball = { x: number; y: number; vx: number; vy: number };

/** The starting velocity that rolls the ball to about (tx, ty). */
export function aimAt(ball: Ball, tx: number, ty: number): Ball {
  // With exponential friction the ball travels v / FRICTION before stopping.
  return {
    ...ball,
    vx: (tx - ball.x) * FRICTION,
    vy: (ty - ball.y) * FRICTION,
  };
}

/** Moves the ball `dt` seconds with friction and wall/block bounces. */
export function rollBall(ball: Ball, dt: number, hole: Hole): Ball {
  let { x, y, vx, vy } = ball;
  const steps = Math.max(1, Math.ceil(dt / 0.008));
  const h = dt / steps;
  for (let s = 0; s < steps; s++) {
    const decay = Math.exp(-FRICTION * h);
    vx *= decay;
    vy *= decay;
    const nx = x + vx * h;
    const ny = y + vy * h;
    const hits = (px: number, py: number) =>
      px < BALL_R ||
      px > PUTT_W - BALL_R ||
      py < BALL_R ||
      py > PUTT_H - BALL_R ||
      hole.blocks.some(
        (b) =>
          px + BALL_R > b.x &&
          px - BALL_R < b.x + b.w &&
          py + BALL_R > b.y &&
          py - BALL_R < b.y + b.h,
      );
    if (hits(nx, y)) vx = -vx * 0.8;
    else x = nx;
    if (hits(x, ny)) vy = -vy * 0.8;
    else y = ny;
  }
  return { x, y, vx, vy };
}

export function isStopped(ball: Ball): boolean {
  return Math.hypot(ball.vx, ball.vy) < 2;
}

/** In the cup when close enough and not racing past. */
export function inCup(ball: Ball, hole: Hole): boolean {
  return (
    Math.hypot(ball.x - hole.cup[0], ball.y - hole.cup[1]) < HOLE_R &&
    Math.hypot(ball.vx, ball.vy) < 60
  );
}

/** Stars for a hole: 3 at par or better, 2 one over, otherwise 1. */
export function holeStars(strokes: number, par: number): number {
  return strokes <= par ? 3 : strokes === par + 1 ? 2 : 1;
}
