import test from "node:test";
import assert from "node:assert/strict";
import {
  advanceCoaster,
  createCoasterState,
  downhillAcceleration,
  loopGForce,
  MAX_COASTER_STEP_SECONDS,
  COASTER_PHOTO_PROGRESS,
  coasterPointAtDistance,
  COASTER_TRACK_LENGTH,
} from "./coasterPhysics.ts";

function run(hz: number, seconds: number) {
  let state = createCoasterState();
  for (let i = 0; i < hz * seconds; i++)
    state = advanceCoaster(state, 1 / hz).state;
  return state;
}

test("gravity accelerates screen-coordinate descents and slows climbs using degrees", () => {
  assert.equal(downhillAcceleration(0), 0);
  assert.ok(downhillAcceleration(90) > 150);
  assert.ok(downhillAcceleration(-90) < -150);
  assert.ok(
    Math.abs(downhillAcceleration(30) * 2 - downhillAcceleration(90)) < 1e-8,
  );
});

test("velocity integrates distance and simulated elapsed time without frame-rate drift", () => {
  const initial = createCoasterState();
  const first = advanceCoaster(initial, 1 / 60).state;
  assert.ok(first.distance > 0 && first.velocity > 0);
  assert.ok(Math.abs(first.elapsed - 1 / 60) < 1e-8);
  assert.deepEqual(initial, createCoasterState(), "integration is pure");
  const slow = run(30, 12);
  const fast = run(120, 12);
  assert.ok(Math.abs(slow.distance - fast.distance) < 2);
  assert.ok(Math.abs(slow.velocity - fast.velocity) < 2);
});

test("a downhill car gains speed relative to the same velocity on the powered lift", () => {
  const initial = createCoasterState();
  const drop = {
    ...initial,
    distance: COASTER_TRACK_LENGTH * 0.2,
    velocity: 180,
  };
  assert.ok(coasterPointAtDistance(drop.distance).angle > 20);
  const descended = advanceCoaster(drop, 0.05).state.velocity;
  const climbing = advanceCoaster({ ...initial, velocity: 180 }, 0.05).state
    .velocity;
  assert.ok(descended > drop.velocity);
  assert.ok(descended > climbing);
});

test("loop load uses centrifugal force with lower load at the inverted apex", () => {
  assert.ok(loopGForce(250, 110, 0) > 3);
  assert.ok(
    Math.abs(loopGForce(250, 110, 0) - loopGForce(250, 110, 180) - 2) < 1e-8,
  );
  assert.ok(loopGForce(350, 110, 0) > loopGForce(250, 110, 0));
});

test("hidden-tab deltas cannot teleport the ride or inject invalid time", () => {
  const initial = createCoasterState();
  assert.deepEqual(
    advanceCoaster(initial, 900),
    advanceCoaster(initial, MAX_COASTER_STEP_SECONDS),
  );
  for (const dt of [-1, NaN, Infinity])
    assert.deepEqual(advanceCoaster(initial, dt).state, initial);
});

test("crossing the loop-exit photo landmark captures once and replay resets it", () => {
  const before = {
    ...createCoasterState(),
    distance: COASTER_PHOTO_PROGRESS * COASTER_TRACK_LENGTH - 1,
    velocity: 250,
  };
  const capture = advanceCoaster(before, 0.02);
  assert.equal(capture.photoTriggered, true);
  assert.equal(capture.state.photoTaken, true);
  assert.equal(advanceCoaster(capture.state, 0.02).photoTriggered, false);
  assert.equal(createCoasterState().photoTaken, false);
});

test("one circuit returns to the station and completion emits exactly once", () => {
  let state = createCoasterState();
  let photos = 0;
  let completions = 0;
  for (let i = 0; i < 120 * 120; i++) {
    const next = advanceCoaster(state, 1 / 120);
    state = next.state;
    photos += Number(next.photoTriggered);
    completions += Number(next.finishedNow);
    if (state.finished) break;
  }
  assert.equal(state.finished, true);
  assert.equal(state.distance, COASTER_TRACK_LENGTH);
  assert.ok(state.elapsed > 10 && state.elapsed < 120);
  assert.equal(photos, 1);
  assert.equal(completions, 1);
  assert.deepEqual(advanceCoaster(state, 0.05), {
    state,
    photoTriggered: false,
    finishedNow: false,
  });
  const station = coasterPointAtDistance(0);
  const arrival = coasterPointAtDistance(state.distance);
  assert.ok(Math.hypot(station.x - arrival.x, station.y - arrival.y) < 1e-6);
});
