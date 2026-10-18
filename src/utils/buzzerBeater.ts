/**
 * Buzzer Beater rules with no React or DOM dependency: a power meter swings
 * up and down; shooting in the green zone is a swish, near it a bank shot.
 */

export const BUZZER_SHOTS = 10;
export const BUZZER_MAX_SCORE = 20;

/** Meter level 0–100 at `ms`, bouncing up and down. */
export function meterLevel(ms: number, periodMs = 1800): number {
  const phase = (ms % periodMs) / periodMs;
  return phase < 0.5 ? phase * 200 : (1 - phase) * 200;
}

/** 2 points for 60–80 (swish), 1 for 45–95 (off the rim and in), else 0. */
export function shotPoints(level: number): number {
  if (level >= 60 && level <= 80) return 2;
  if (level >= 45 && level <= 95) return 1;
  return 0;
}
