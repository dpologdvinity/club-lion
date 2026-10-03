export const LANES = 4;
export const FIELD_H = 340;
export const LANE_HEIGHT = FIELD_H / LANES;
export const LION_SIZE = 36;
export const OBSTACLE_SIZE = 30;
export const LION_SPEED = 200;
export const WARNING_S = 1.5;
const REACTION_S = 0.2;

export function laneTop(lane: number, size: number) {
  return lane * LANE_HEIGHT + (LANE_HEIGHT - size) / 2;
}

export type PatternRow = { x: number; blocked: number[] };
export type Pattern = { gapLane: number; rows: PatternRow[] };

function pickGap(lionY: number, lionSpeed: number, rng: () => number) {
  const options: number[] = [];
  for (let lane = 0; lane < LANES; lane++) {
    const travel = Math.abs(laneTop(lane, LION_SIZE) - lionY);
    if (travel <= lionSpeed * (WARNING_S - REACTION_S)) options.push(lane);
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
  lionY: number,
  lionSpeed: number,
  rng: () => number,
): Pattern {
  const gapLane = pickGap(lionY, lionSpeed, rng);
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

export function buildTrail(
  pattern: Pattern,
  safe: boolean,
  rng: () => number,
): { x: number; lane: number }[] {
  const lead = LANE_HEIGHT;
  const trail: { x: number; lane: number }[] = [];
  for (const row of pattern.rows) {
    const lane = safe
      ? pattern.gapLane
      : row.blocked[Math.floor(rng() * row.blocked.length)];
    trail.push({ x: row.x - lead, lane });
  }
  return trail;
}

export function spawnX(lionX: number, scroll: number) {
  return lionX + LION_SIZE + scroll * WARNING_S;
}

// Once the previous wall clears the whole lion, allow a full-field crossing
// plus a warning interval before the next wall can touch it.
export function patternSpacing(
  rows: PatternRow[],
  scroll: number,
  lionSpeed: number,
) {
  const lastRow = Math.max(...rows.map((row) => row.x));
  return (
    lastRow +
    OBSTACLE_SIZE +
    LION_SIZE +
    scroll * (WARNING_S + (FIELD_H - LION_SIZE) / lionSpeed)
  );
}
