/**
 * Slide n Splash rules with no React or DOM dependency: slide down, jump off
 * when the power meter glows, then tap tricks in the air. Each dive scores
 * jump points plus one per trick, and every dive ends in a splash.
 */

export const SPLASH_DIVES = 5;
export const SPLASH_TRICKS = 3;
export const SPLASH_MAX_SCORE = SPLASH_DIVES * (5 + SPLASH_TRICKS);
export const AIR_MS = 1600;

/** Meter 0–100 at `ms`, sweeping up and down. */
export function splashMeter(ms: number, periodMs = 1600): number {
  const phase = (ms % periodMs) / periodMs;
  return phase < 0.5 ? phase * 200 : (1 - phase) * 200;
}

/** Jump points 1–5: the higher the meter, the bigger the jump. */
export function jumpPoints(meter: number): number {
  return Math.max(1, Math.min(5, Math.ceil(meter / 20)));
}

export const TRICKS = [
  { id: "spin", emoji: "🌀", label: "Spin" },
  { id: "flip", emoji: "🤸", label: "Flip" },
  { id: "star", emoji: "⭐", label: "Star pose" },
] as const;
