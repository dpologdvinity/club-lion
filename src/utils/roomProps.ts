/**
 * Carry-anywhere room props: pure rules for where a dropped prop lands and
 * who catches it. No React or DOM.
 */

type Point = { x: number; y: number };

/** Stage px around a neighbor's feet that count as "gave it to them". */
export const CATCH_RADIUS = 110;
/** Keeps a prop's center far enough inside the stage to stay tappable. */
const EDGE = 40;
const TOP = 60;

/** Catcher id for the player's own doll; neighbor ids never clash with it. */
export const YOUR_DOLL = "you";

export function catcherAt(
  point: Point,
  neighbors: readonly ({ id: string } & Point)[],
  doll?: Point,
): string | null {
  let best: string | null = null;
  let bestDistance = CATCH_RADIUS;
  const all = doll ? [...neighbors, { id: YOUR_DOLL, ...doll }] : neighbors;
  for (const n of all) {
    const distance = Math.hypot(n.x - point.x, n.y - point.y);
    if (distance <= bestDistance) {
      best = n.id;
      bestDistance = distance;
    }
  }
  return best;
}

export function clampToStage(
  point: Point,
  stage: { width: number; height: number },
): Point {
  return {
    x: Math.min(stage.width - EDGE, Math.max(EDGE, point.x)),
    y: Math.min(stage.height - 20, Math.max(TOP, point.y)),
  };
}

export function thanksFor(prop: { emoji: string; food?: true }): string {
  return prop.food
    ? `${prop.emoji} Yum yum! Thank you!`
    : `${prop.emoji} For me? Thank you!`;
}
