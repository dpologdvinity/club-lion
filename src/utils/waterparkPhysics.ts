export function calculateWaveOffset(
  timeMs: number,
  x: number,
  periodMs = 4000,
  amplitude = 12,
): number {
  const angularFrequency = (2 * Math.PI) / periodMs;
  const wavelength = 900;
  const phase = angularFrequency * timeMs - (2 * Math.PI * x) / wavelength;
  return amplitude * Math.sin(phase);
}

export type BucketState = {
  fillPercent: number;
  tipAngleDeg: number;
  isDumping: boolean;
  splashRadius: number;
};

const FILL_END = 0.8;
const TIP_END = 0.88;
const MAX_SPLASH_RADIUS = 180;

export function calculateBucketCycle(
  timeMs: number,
  cycleDurationMs = 15000,
): BucketState {
  const cyclePos = timeMs / cycleDurationMs;
  const progress = cyclePos - Math.floor(cyclePos);

  if (progress < FILL_END) {
    const fillPercent = (progress / FILL_END) * 100;
    return {
      fillPercent,
      tipAngleDeg: 0,
      isDumping: false,
      splashRadius: 0,
    };
  }

  if (progress < TIP_END) {
    const tipProgress = (progress - FILL_END) / (TIP_END - FILL_END);
    return {
      fillPercent: 100,
      tipAngleDeg: tipProgress * 90,
      isDumping: true,
      splashRadius: tipProgress * MAX_SPLASH_RADIUS,
    };
  }

  const emptyProgress = (progress - TIP_END) / (1 - TIP_END);
  return {
    fillPercent: 100 * (1 - emptyProgress),
    tipAngleDeg: (1 - emptyProgress) * 90,
    isDumping: false,
    splashRadius: (1 - emptyProgress) * MAX_SPLASH_RADIUS,
  };
}

export function isAvatarDrenched(
  avatarPos: { x: number; y: number },
  bucketCenter: { x: number; y: number },
  splashRadius: number,
): boolean {
  if (splashRadius <= 0) return false;
  const dx = avatarPos.x - bucketCenter.x;
  const dy = avatarPos.y - bucketCenter.y;
  return Math.hypot(dx, dy) <= splashRadius;
}

const RIVER_CENTER_X = 1400;
const RIVER_CENTER_Y = 360;
const RIVER_RADIUS_X = 1300;
const RIVER_RADIUS_Y = 300;

export function calculateRiverDrift(t: number): {
  x: number;
  y: number;
  angle: number;
} {
  const theta = t * 2 * Math.PI;
  const x = RIVER_CENTER_X + RIVER_RADIUS_X * Math.cos(theta);
  const y = RIVER_CENTER_Y + RIVER_RADIUS_Y * Math.sin(theta);

  const dx = -RIVER_RADIUS_X * Math.sin(theta);
  const dy = RIVER_RADIUS_Y * Math.cos(theta);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { x, y, angle };
}
