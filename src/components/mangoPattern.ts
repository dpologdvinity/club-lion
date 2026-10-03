export const LANES = 4;
export const FIELD_H = 340;
export const LANE_HEIGHT = FIELD_H / LANES;
export const LION_SPEED = 200;
export const WARNING_S = 1;

export function laneTop(lane: number, size: number) {
  return lane * LANE_HEIGHT + (LANE_HEIGHT - size) / 2;
}

export function laneOf(y: number) {
  return Math.min(LANES - 1, Math.max(0, Math.floor(y / LANE_HEIGHT)));
}

const REACHABLE_LANE_SECONDS = LANE_HEIGHT / LION_SPEED;

export const MAX_LANE_SHIFT = Math.max(
  1,
  Math.floor(WARNING_S / REACHABLE_LANE_SECONDS),
);

export type PatternRow = { x: number; blocked: number[] };
export type Pattern = { gapLane: number; rows: PatternRow[] };

function pickGap(lionLane: number, rng: () => number) {
  const options: number[] = [];
  for (let lane = 0; lane < LANES; lane++) {
    if (Math.abs(lane - lionLane) <= MAX_LANE_SHIFT) options.push(lane);
  }
  return options[Math.floor(rng() * options.length)];
}

function blockedLanes(gapLane: number, count: number, rng: () => number) {
  const free: number[] = [];
  for (let lane = 0; lane < LANES; lane++) {
    if (lane !== gapLane) free.push(lane);
  }
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  return free.slice(0, count).sort((a, b) => a - b);
}

function rowCount(ramp: number) {
  if (ramp < 0.25) return 1;
  if (ramp < 0.6) return 1 + Math.round(ramp);
  return 2;
}

function blockedWidth(ramp: number) {
  if (ramp < 0.25) return 1;
  if (ramp < 0.6) return 2;
  return 3;
}

const STAGGER = 70;

export function buildPattern(
  ramp: number,
  lionLane: number,
  rng: () => number,
): Pattern {
  const gapLane = pickGap(lionLane, rng);
  const width = blockedWidth(ramp);
  const rows: PatternRow[] = [];
  const count = rowCount(ramp);
  for (let index = 0; index < count; index++) {
    rows.push({
      x: index * STAGGER,
      blocked: blockedLanes(gapLane, width, rng),
    });
  }
  return { gapLane, rows };
}

export function buildTrail(rows: PatternRow[]): { x: number; lane: number }[] {
  const lead = LANE_HEIGHT;
  const trail: { x: number; lane: number }[] = [];
  for (const row of rows) {
    for (const lane of row.blocked) {
      trail.push({ x: row.x - lead, lane });
    }
  }
  return trail;
}

export function spawnX(lionX: number, scroll: number) {
  return lionX + scroll * WARNING_S;
}
