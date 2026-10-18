/**
 * Bullseye rules with no React or DOM dependency: the target glides left and
 * right; throwing scores by how close the dart lands to the middle.
 */

export const BULLSEYE_THROWS = 10;
export const BULLSEYE_MAX_SCORE = 100;
/** Ring edges as a share of the target's half-width, with their points. */
export const BULLSEYE_RINGS = [
  { edge: 0.2, points: 10 },
  { edge: 0.45, points: 5 },
  { edge: 0.7, points: 3 },
  { edge: 1, points: 1 },
] as const;

/** Target centre (0–100 % of the lane) at `ms`, gliding back and forth. */
export function targetX(ms: number, periodMs = 2600): number {
  const phase = (ms % periodMs) / periodMs;
  return 50 + 40 * Math.sin(phase * Math.PI * 2);
}

/** Points for a dart at lane position `dart` against a target at `target`. */
export function throwPoints(
  dart: number,
  target: number,
  halfWidth = 12,
): number {
  const off = Math.abs(dart - target) / halfWidth;
  return BULLSEYE_RINGS.find((ring) => off <= ring.edge)?.points ?? 0;
}
