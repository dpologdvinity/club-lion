import {
  COASTER_PHASE_STARTS,
  computeCoasterTrackPosition,
  type CoasterTrackPoint,
} from "./kineticRides.ts";

export const MAX_COASTER_STEP_SECONDS = 0.05;
const GRAVITY = 180;
const SAMPLE_COUNT = 2400;
const STEP_SECONDS = 1 / 120;

// Arc length makes velocity meaningful even through unequal spline spans.
const TRACK = Array.from({ length: SAMPLE_COUNT + 1 }, (_, index) => ({
  point: computeCoasterTrackPosition(index / SAMPLE_COUNT),
  distance: 0,
}));
for (let i = 1; i < TRACK.length; i++) {
  TRACK[i].distance =
    TRACK[i - 1].distance +
    Math.hypot(
      TRACK[i].point.x - TRACK[i - 1].point.x,
      TRACK[i].point.y - TRACK[i - 1].point.y,
    );
}
export const COASTER_TRACK_LENGTH = TRACK[SAMPLE_COUNT].distance;

function distanceAtParameter(parameter: number): number {
  const sample = parameter * SAMPLE_COUNT;
  const index = Math.floor(sample);
  return (
    TRACK[index].distance +
    (TRACK[index + 1].distance - TRACK[index].distance) * (sample - index)
  );
}

const LOOP_START_DISTANCE = distanceAtParameter(COASTER_PHASE_STARTS.loop);
const LOOP_EXIT_DISTANCE = distanceAtParameter(COASTER_PHASE_STARTS.hop);
/** Photo gate at the loop exit, expressed as normalized arc-length progress. */
export const COASTER_PHOTO_PROGRESS = LOOP_EXIT_DISTANCE / COASTER_TRACK_LENGTH;

export function coasterPointAtDistance(distance: number): CoasterTrackPoint {
  const bounded = Math.max(0, Math.min(COASTER_TRACK_LENGTH, distance));
  let lo = 0;
  let hi = SAMPLE_COUNT;
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (TRACK[mid].distance <= bounded) lo = mid;
    else hi = mid;
  }
  const fraction =
    (bounded - TRACK[lo].distance) / (TRACK[hi].distance - TRACK[lo].distance);
  return computeCoasterTrackPosition((lo + fraction) / SAMPLE_COUNT);
}

export function downhillAcceleration(angleDegrees: number): number {
  return GRAVITY * Math.sin((angleDegrees * Math.PI) / 180);
}

/** Normal load in g for a circular loop; angle is the public tangent in degrees. */
export function loopGForce(
  velocity: number,
  radius: number,
  angleDegrees: number,
): number {
  return (
    (velocity * velocity) / (radius * GRAVITY) +
    Math.cos((angleDegrees * Math.PI) / 180)
  );
}

export type CoasterState = {
  distance: number;
  velocity: number;
  elapsed: number;
  gForce: number;
  photoTaken: boolean;
  finished: boolean;
};

export function createCoasterState(): CoasterState {
  return {
    distance: 0,
    velocity: 85,
    elapsed: 0,
    gForce: 1,
    photoTaken: false,
    finished: false,
  };
}

export function advanceCoaster(
  state: CoasterState,
  deltaSeconds: number,
): {
  state: CoasterState;
  photoTriggered: boolean;
  finishedNow: boolean;
} {
  const dt = Number.isFinite(deltaSeconds)
    ? Math.max(0, Math.min(MAX_COASTER_STEP_SECONDS, deltaSeconds))
    : 0;
  if (state.finished || dt === 0)
    return { state, photoTriggered: false, finishedNow: false };
  let distance = state.distance;
  let velocity = state.velocity;
  let elapsed = state.elapsed;
  let remaining = dt;
  while (remaining > 1e-10 && distance < COASTER_TRACK_LENGTH) {
    const step = Math.min(STEP_SECONDS, remaining);
    const point = coasterPointAtDistance(distance);
    // Chain lift is powered; gravity drives the drop. Return brakes settle the car.
    const lift = point.speedMultiplier === 0.6;
    const braking = point.speedMultiplier === 0.9;
    const acceleration = lift
      ? (85 - velocity) * 5
      : downhillAcceleration(point.angle) - velocity * (braking ? 0.75 : 0.08);
    const nextVelocity = Math.max(
      lift ? 85 : braking ? 140 : 110,
      Math.min(480, velocity + acceleration * step),
    );
    distance = Math.min(
      COASTER_TRACK_LENGTH,
      distance + (velocity + nextVelocity) * 0.5 * step,
    );
    velocity = nextVelocity;
    elapsed += step;
    remaining -= step;
  }
  const photoTriggered = !state.photoTaken && distance >= LOOP_EXIT_DISTANCE;
  const finished = distance >= COASTER_TRACK_LENGTH;
  const point = coasterPointAtDistance(distance);
  const inLoop =
    distance >= LOOP_START_DISTANCE && distance < LOOP_EXIT_DISTANCE;
  return {
    state: {
      distance,
      velocity: finished ? 0 : velocity,
      elapsed,
      gForce: inLoop ? loopGForce(velocity, 110, point.angle) : 1,
      photoTaken: state.photoTaken || photoTriggered,
      finished,
    },
    photoTriggered,
    finishedNow: finished,
  };
}
