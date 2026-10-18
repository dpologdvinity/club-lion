/**
 * Splash Power-Up rules with no React or DOM dependency: launch a water
 * balloon from the catapult at one of three angles with the power meter's
 * strength; it arcs and splashes. Hitting a target scores its points.
 */

export const BALLOON_THROWS = 10;
export const BALLOON_MAX_SCORE = 30;
export const ANGLES = [
  { id: "low", label: "Low", degrees: 30 },
  { id: "mid", label: "Middle", degrees: 45 },
  { id: "high", label: "High", degrees: 60 },
] as const;
export const SPLASH_TARGETS = [
  { x: 35, width: 14, points: 1, emoji: "🪣" },
  { x: 60, width: 12, points: 2, emoji: "🦆" },
  { x: 85, width: 10, points: 3, emoji: "🐳" },
] as const;
const GRAVITY = 9.8;

/** Power 0–100 at `ms`, sweeping up and down. */
export function powerMeter(ms: number, periodMs = 2000): number {
  const phase = (ms % periodMs) / periodMs;
  return phase < 0.5 ? phase * 200 : (1 - phase) * 200;
}

/** Where the balloon lands (0–100 % across) for an angle and power. */
export function landingX(degrees: number, power: number): number {
  const speed = 6 + (power / 100) * 22;
  const rad = (degrees * Math.PI) / 180;
  // Flat-ground range from the catapult at x = 8.
  return 8 + (speed * speed * Math.sin(2 * rad)) / GRAVITY;
}

/** Points for a landing spot: the target it splashes, if any. */
export function splashPoints(x: number): number {
  return (
    SPLASH_TARGETS.find((t) => Math.abs(x - t.x) <= t.width / 2)?.points ?? 0
  );
}
