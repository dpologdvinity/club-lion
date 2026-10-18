/**
 * BoBo Fish rules with no React or DOM dependency: steer BoBo around the
 * reef and gobble fish smaller than BoBo; each one makes BoBo grow. Bigger
 * fish only nudge BoBo aside, so nothing is ever lost.
 */

export const BOBO_ROUND_MS = 45_000;
export const BOBO_MAX_SCORE = 300;
export const BOBO_START_SIZE = 10;

export type Fish = {
  id: number;
  x: number;
  y: number;
  vx: number;
  size: number;
};

/** BoBo's size after eating `eaten` fish: grows quickly, then slowly. */
export function boboSize(eaten: number): number {
  return BOBO_START_SIZE + Math.min(14, Math.sqrt(eaten) * 2.4);
}

/** A fish swimming in from one side, sized around BoBo's current size. */
export function makeFish(
  id: number,
  bobo: number,
  random: () => number = Math.random,
): Fish {
  const fromLeft = random() < 0.5;
  // Two of every three are snack-sized, so there is always food.
  const size =
    random() < 0.66
      ? bobo * (0.4 + random() * 0.45)
      : bobo * (1.2 + random() * 0.6);
  return {
    id,
    x: fromLeft ? -8 : 108,
    y: 10 + random() * 80,
    vx: (fromLeft ? 1 : -1) * (8 + random() * 10),
    size,
  };
}

/** Moves fish `dt` seconds; drops those that swam off. */
export function swim(fish: readonly Fish[], dt: number): Fish[] {
  return fish
    .map((f) => ({ ...f, x: f.x + f.vx * dt }))
    .filter((f) => f.x > -12 && f.x < 112);
}

/** Smaller fish touching BoBo at (x, y) with size `bobo`. */
export function gobbled(
  fish: readonly Fish[],
  x: number,
  y: number,
  bobo: number,
): number[] {
  return fish
    .filter(
      (f) =>
        f.size < bobo && Math.hypot(f.x - x, f.y - y) < (bobo + f.size) / 2,
    )
    .map((f) => f.id);
}
