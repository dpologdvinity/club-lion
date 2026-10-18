/**
 * Go Cart rules with no React or DOM dependency: the kart drives up a
 * three-lane track; coins and cones roll down. Coins add up, cones just make
 * a funny bump. Nothing ends the race early.
 */

export const CART_LANES = 3;
export const CART_ROUND_MS = 40_000;
export const CART_MAX_SCORE = 300;
/** Kart's distance from the top of the track, in %. */
export const CART_Y = 82;

export type TrackThing = { id: number; lane: number; y: number; coin: boolean };

/** Scrolls things `dt` seconds down the track at `speed` %/s. */
export function scrollTrack(
  things: TrackThing[],
  dt: number,
  speed: number,
): TrackThing[] {
  return things
    .map((t) => ({ ...t, y: t.y + speed * dt }))
    .filter((t) => t.y < 110);
}

/** Things touching the kart in `lane`. */
export function touching(
  things: readonly TrackThing[],
  lane: number,
): TrackThing[] {
  return things.filter((t) => t.lane === lane && Math.abs(t.y - CART_Y) < 6);
}

export function makeThing(
  id: number,
  random: () => number = Math.random,
): TrackThing {
  return {
    id,
    lane: Math.min(CART_LANES - 1, Math.floor(random() * CART_LANES)),
    y: -8,
    coin: random() < 0.7,
  };
}
