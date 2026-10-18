/**
 * Snow Day rules with no React or DOM dependency: penguins slide across three
 * snowy lanes; tap one to land a snowball. Misses cost nothing.
 */

export const SNOW_ROUND_MS = 30_000;
export const SNOW_LANES = 3;
export const SNOW_MAX_SCORE = 200;

export type Penguin = {
  id: number;
  lane: number;
  /** Round time it set off, and its speed in lane-widths per second. */
  start: number;
  speed: number;
  /** Sliding left to right, or right to left. */
  rightward: boolean;
};

/** Penguin position across its lane, 0–100 %; outside means gone. */
export function penguinX(p: Penguin, now: number): number {
  const travelled = ((now - p.start) / 1000) * p.speed * 100;
  return p.rightward ? -10 + travelled : 110 - travelled;
}

/** A new penguin: speeds pick up a little as the round goes on. */
export function makePenguin(
  id: number,
  now: number,
  random: () => number = Math.random,
): Penguin {
  return {
    id,
    lane: Math.min(SNOW_LANES - 1, Math.floor(random() * SNOW_LANES)),
    start: now,
    speed: 0.22 + random() * 0.12 + Math.min(0.12, now / 250_000),
    rightward: random() < 0.5,
  };
}
