export const BEE_STOP_ROUNDS = 10;
export const BEE_STOP_MAX_SCORE = BEE_STOP_ROUNDS * 100;

export type BeeBand = "perfect" | "good" | "okay" | "miss";

export const BAND_POINTS: Record<BeeBand, number> = {
  perfect: 100,
  good: 60,
  okay: 30,
  miss: 0,
};

export const BAND_LABEL: Record<BeeBand, string> = {
  perfect: "Perfect!",
  good: "Good!",
  okay: "Close one",
  miss: "So close",
};

/** Deterministic so skill carries between runs instead of luck deciding the round. */
export const FLOWER_SPOTS = [
  0.32, 0.68, 0.5, 0.24, 0.76, 0.4, 0.6, 0.3, 0.7, 0.46,
] as const;

export const FEEDBACK_MS = 700;

/** Sweeps per second, fastest on the last round. */
export function speedFor(round: number): number {
  return 0.9 + 0.1 * (clampRound(round) - 1);
}

/** Half-widths of each scoring band, narrowing as rounds go on. */
export function zoneFor(round: number): {
  perfect: number;
  good: number;
  okay: number;
} {
  const good = 0.08 - 0.004 * (clampRound(round) - 1);
  return { perfect: good * 0.45, good, okay: good * 1.75 };
}

export function flowerFor(round: number): number {
  return FLOWER_SPOTS[clampRound(round) - 1];
}

export function bandFor(distance: number, round: number): BeeBand {
  const zone = zoneFor(round);
  if (distance <= zone.perfect) return "perfect";
  if (distance <= zone.good) return "good";
  if (distance <= zone.okay) return "okay";
  return "miss";
}

export function scoreFor(distance: number, round: number): number {
  return BAND_POINTS[bandFor(distance, round)];
}

/** Longest step any frame may take, so a backgrounded tab cannot teleport the bee. */
export const MAX_STEP_SECONDS = 0.05;

/** Moves the bee one frame and bounces it off either end of the bar. */
export function advance(
  pos: number,
  dir: number,
  speed: number,
  dt: number,
): { pos: number; dir: number } {
  const step = dir * speed * dt;
  let next = pos + step;
  let facing = dir;
  if (next >= 1) {
    next = 1 - (next - 1);
    facing = -1;
  } else if (next <= 0) {
    next = -next;
    facing = 1;
  }
  return { pos: Math.min(1, Math.max(0, next)), dir: facing };
}

/**
 * Visible hops per second under reduced motion, where the bee steps instead of
 * gliding. The hop size is speed / this rate, and it must stay narrower than the
 * widest scoring band or a hop could clear the band entirely and leave the round
 * unwinnable. 20 keeps the worst hop at 0.58 of the okay band.
 */
export const REDUCED_MOTION_FPS = 20;

/** Coin bands. Finishing any run pays at least 15; a flawless run caps at 120. */
export function coinsFor(score: number): number {
  if (!Number.isFinite(score) || score < 0) return 0;
  if (score >= 900) return 120;
  if (score >= 700) return 90;
  if (score >= 450) return 60;
  if (score >= 200) return 35;
  return 15;
}

function clampRound(round: number): number {
  if (!Number.isFinite(round)) return 1;
  return Math.min(BEE_STOP_ROUNDS, Math.max(1, Math.round(round)));
}
