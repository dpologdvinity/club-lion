/**
 * Pop the Fireflies rules with no React or DOM dependency: fireflies blink,
 * and only a glowing one can be caught. Golden fireflies are worth 3.
 */

export const FIREFLY_ROUND_MS = 30_000;
export const FIREFLY_SPAWN_MS = 700;
export const FIREFLY_START = 6;
export const FIREFLY_STAMP_SCORE = 15;
/** No round can spawn more fireflies than this, so no real score passes the cap. */
export const FIREFLY_MAX_SCORE =
  (FIREFLY_START + Math.ceil(FIREFLY_ROUND_MS / FIREFLY_SPAWN_MS)) * 3;

/** A tap this soon after the glow fades still catches: little fingers are slower. */
export const GRACE_MS = 250;

/** Part of each blink a firefly spends glowing. */
const LIT_SHARE = 0.55;

export type Firefly = {
  id: number;
  /** Percent of the meadow width and height. */
  x: number;
  y: number;
  /** Milliseconds into its blink at time 0. */
  phase: number;
  /** Milliseconds for one glow-and-dark blink. */
  period: number;
  golden: boolean;
};

export function isLit(fly: Firefly, now: number): boolean {
  const at = (((now + fly.phase) % fly.period) + fly.period) % fly.period;
  return at < fly.period * LIT_SHARE;
}

export function catchPoints(fly: Firefly, now: number): 0 | 1 | 3 {
  if (!isLit(fly, now) && !isLit(fly, now - GRACE_MS)) return 0;
  return fly.golden ? 3 : 1;
}

export function makeFirefly(
  id: number,
  random: () => number = Math.random,
): Firefly {
  const golden = random() < 0.125;
  const period = 1600 + Math.round(random() * 1000);
  return {
    id,
    x: 8 + random() * 84,
    y: 12 + random() * 68,
    phase: Math.round(random() * period),
    period,
    golden,
  };
}
