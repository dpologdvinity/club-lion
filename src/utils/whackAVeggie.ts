/**
 * Whack A Veggie rules with no React or DOM dependency: veggies pop out of
 * nine garden holes for a 30-second round; every bonk counts, misses cost
 * nothing.
 */

export const VEGGIE_HOLES = 9;
export const VEGGIE_ROUND_MS = 30_000;
export const VEGGIE_MAX_SCORE = 200;
export const VEGGIES = ["🥕", "🥦", "🍅", "🌽", "🍆", "🥔"];

/** How long a veggie stays up: slower at the start, never a blink. */
export function veggieUpMs(elapsedMs: number): number {
  return Math.max(700, 1500 - Math.floor(elapsedMs / 1000) * 30);
}

/** A free hole for the next veggie, or -1 when every hole is busy. */
export function nextHole(
  busy: readonly boolean[],
  random: () => number = Math.random,
): number {
  const free = busy.flatMap((up, i) => (up ? [] : [i]));
  if (!free.length) return -1;
  return free[Math.min(free.length - 1, Math.floor(random() * free.length))];
}
