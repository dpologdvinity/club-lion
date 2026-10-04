import assert from "node:assert/strict";
import { test } from "node:test";
import {
  stepRiverSurf,
  checkRiverCollision,
  checkRiverPickup,
  calculateRiverSurfPayout,
  playRiverSurfSound,
  type SurfState,
  type RiverObstacle,
  type RiverFeature,
} from "./riverSurfEngine.ts";

function freshState(overrides: Partial<SurfState> = {}): SurfState {
  return {
    laneX: 0,
    distance: 0,
    speed: 8,
    isAirborne: false,
    activeTrick: null,
    trickCombo: 0,
    score: 0,
    wipedOut: false,
    ...overrides,
  };
}

// --- stepRiverSurf: lateral clamping ---

test("stepRiverSurf clamps laneX to -160 when steering hard left repeatedly", () => {
  let state = freshState();
  for (let i = 0; i < 50; i++) {
    state = stepRiverSurf(state, -1, null, 100);
  }
  assert.equal(state.laneX, -160);
});

test("stepRiverSurf clamps laneX to 160 when steering hard right repeatedly", () => {
  let state = freshState();
  for (let i = 0; i < 50; i++) {
    state = stepRiverSurf(state, 1, null, 100);
  }
  assert.equal(state.laneX, 160);
});

test("stepRiverSurf moves laneX proportional to steerInput and deltaMs", () => {
  const state = freshState();
  const next = stepRiverSurf(state, 1, null, 100);
  assert.ok(next.laneX > 0);
  assert.ok(next.laneX <= 160);
});

test("stepRiverSurf with zero steerInput does not change laneX", () => {
  const state = freshState({ laneX: 20 });
  const next = stepRiverSurf(state, 0, null, 100);
  assert.equal(next.laneX, 20);
});

// --- stepRiverSurf: distance progression ---

test("stepRiverSurf advances distance based on speed and deltaMs, capped at 600", () => {
  const state = freshState({ speed: 10, distance: 0 });
  const next = stepRiverSurf(state, 0, null, 1000);
  assert.equal(next.distance, 10);
});

test("stepRiverSurf caps distance at 600 meters", () => {
  const state = freshState({ speed: 10, distance: 598 });
  const next = stepRiverSurf(state, 0, null, 1000);
  assert.equal(next.distance, 600);
});

// --- stepRiverSurf: tricks ---

test("stepRiverSurf sets activeTrick and increments trickCombo when trickInput given while airborne", () => {
  const state = freshState({ isAirborne: true });
  const next = stepRiverSurf(state, 0, "360_spin", 100);
  assert.equal(next.activeTrick, "360_spin");
  assert.equal(next.trickCombo, 1);
});

test("stepRiverSurf ignores trickInput when not airborne", () => {
  const state = freshState({ isAirborne: false });
  const next = stepRiverSurf(state, 0, "360_spin", 100);
  assert.equal(next.activeTrick, null);
  assert.equal(next.trickCombo, 0);
});

test("stepRiverSurf increments trickCombo across consecutive airborne tricks", () => {
  let state = freshState({ isAirborne: true });
  state = stepRiverSurf(state, 0, "360_spin", 100);
  state = stepRiverSurf(state, 0, "tail_slide", 100);
  assert.equal(state.trickCombo, 2);
});

test("stepRiverSurf raises score when a trick is landed", () => {
  const state = freshState({ isAirborne: true });
  const next = stepRiverSurf(state, 0, "360_spin", 100);
  assert.ok(next.score > state.score);
});

// --- stepRiverSurf: wipeout ---

test("stepRiverSurf leaves wipedOut state unchanged by normal stepping", () => {
  const state = freshState();
  const next = stepRiverSurf(state, 0.5, null, 100);
  assert.equal(next.wipedOut, false);
});

test("stepRiverSurf never produces non-finite numeric fields", () => {
  let state = freshState();
  for (let i = 0; i < 200; i++) {
    state = stepRiverSurf(
      state,
      Math.sin(i),
      i % 3 === 0 ? "air_jump" : null,
      50,
    );
    assert.ok(Number.isFinite(state.laneX));
    assert.ok(Number.isFinite(state.distance));
    assert.ok(Number.isFinite(state.speed));
    assert.ok(Number.isFinite(state.trickCombo));
    assert.ok(Number.isFinite(state.score));
  }
});

// --- checkRiverCollision ---

test("checkRiverCollision returns true when an obstacle shares lane and distance window", () => {
  const state = freshState({ laneX: 10, distance: 100 });
  const obstacles: RiverObstacle[] = [
    { distance: 102, laneX: 15, type: "boulder" },
  ];
  assert.equal(checkRiverCollision(state, obstacles), true);
});

test("checkRiverCollision returns false when obstacle is far outside lane range", () => {
  const state = freshState({ laneX: -150, distance: 100 });
  const obstacles: RiverObstacle[] = [
    { distance: 101, laneX: 150, type: "log" },
  ];
  assert.equal(checkRiverCollision(state, obstacles), false);
});

test("checkRiverCollision returns false when obstacle is far outside distance window", () => {
  const state = freshState({ laneX: 0, distance: 100 });
  const obstacles: RiverObstacle[] = [
    { distance: 400, laneX: 0, type: "whirlpool" },
  ];
  assert.equal(checkRiverCollision(state, obstacles), false);
});

test("checkRiverCollision returns false when airborne (jumping over obstacles)", () => {
  const state = freshState({ laneX: 0, distance: 100, isAirborne: true });
  const obstacles: RiverObstacle[] = [
    { distance: 100, laneX: 0, type: "boulder" },
  ];
  assert.equal(checkRiverCollision(state, obstacles), false);
});

test("checkRiverCollision returns false for an empty obstacle list", () => {
  const state = freshState({ laneX: 0, distance: 100 });
  assert.equal(checkRiverCollision(state, []), false);
});

// --- checkRiverPickup ---

test("checkRiverPickup returns the feature and boosts score for golden_fish within range", () => {
  const state = freshState({ laneX: 0, distance: 200, score: 10 });
  const features: RiverFeature[] = [
    { distance: 201, laneX: 5, type: "golden_fish" },
  ];
  const { nextState, pickup } = checkRiverPickup(state, features);
  assert.ok(pickup);
  assert.equal(pickup!.type, "golden_fish");
  assert.ok(nextState.score > state.score);
});

test("checkRiverPickup returns null pickup and unchanged state when nothing is in range", () => {
  const state = freshState({ laneX: 0, distance: 200, score: 10 });
  const features: RiverFeature[] = [
    { distance: 500, laneX: 0, type: "golden_fish" },
  ];
  const { nextState, pickup } = checkRiverPickup(state, features);
  assert.equal(pickup, null);
  assert.equal(nextState.score, 10);
});

test("checkRiverPickup increases speed for boost_current", () => {
  const state = freshState({ laneX: 0, distance: 200, speed: 8 });
  const features: RiverFeature[] = [
    { distance: 200, laneX: 0, type: "boost_current" },
  ];
  const { nextState, pickup } = checkRiverPickup(state, features);
  assert.ok(pickup);
  assert.ok(nextState.speed > state.speed);
});

test("checkRiverPickup sets isAirborne for ramp_wave", () => {
  const state = freshState({ laneX: 0, distance: 200, isAirborne: false });
  const features: RiverFeature[] = [
    { distance: 200, laneX: 0, type: "ramp_wave" },
  ];
  const { nextState, pickup } = checkRiverPickup(state, features);
  assert.ok(pickup);
  assert.equal(nextState.isAirborne, true);
});

// --- calculateRiverSurfPayout ---

test("calculateRiverSurfPayout returns at least 10 coins for a zero score run", () => {
  const coins = calculateRiverSurfPayout(0, 0, false);
  assert.ok(coins >= 10);
});

test("calculateRiverSurfPayout scales up with higher score", () => {
  const low = calculateRiverSurfPayout(100, 0, false);
  const high = calculateRiverSurfPayout(1000, 0, false);
  assert.ok(high > low);
});

test("calculateRiverSurfPayout scales up with more tricks", () => {
  const few = calculateRiverSurfPayout(500, 1, false);
  const many = calculateRiverSurfPayout(500, 10, false);
  assert.ok(many > few);
});

test("calculateRiverSurfPayout adds a clean finish bonus of at least 25 coins", () => {
  const dirty = calculateRiverSurfPayout(500, 3, false);
  const clean = calculateRiverSurfPayout(500, 3, true);
  assert.ok(clean - dirty >= 25);
});

test("calculateRiverSurfPayout always returns a finite non-negative integer", () => {
  for (const score of [0, 50, 999, 100000]) {
    for (const tricks of [0, 5, 50]) {
      for (const clean of [false, true]) {
        const coins = calculateRiverSurfPayout(score, tricks, clean);
        assert.ok(Number.isFinite(coins));
        assert.ok(Number.isInteger(coins));
        assert.ok(coins >= 10);
      }
    }
  }
});

// --- playRiverSurfSound: procedural audio safety ---

test("playRiverSurfSound does not throw when passed a null AudioContext", () => {
  for (const type of ["carve", "splash", "trick", "air", "wipeout"] as const) {
    assert.doesNotThrow(() => playRiverSurfSound(type, null));
  }
});

test("playRiverSurfSound does not throw when no AudioContext argument is given", () => {
  assert.doesNotThrow(() => playRiverSurfSound("carve"));
});

test("playRiverSurfSound connects its gain node to ctx.destination when an explicit AudioContext is passed", () => {
  const fakeDestination = {};
  let connectedTo: unknown = null;
  const fakeGainNode = {
    gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    connect(target: unknown) {
      connectedTo = target;
    },
    disconnect() {},
  };
  const fakeOsc = {
    type: "sine",
    frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    connect() {},
    start() {},
    stop() {},
    onended: null as (() => void) | null,
    disconnect() {},
  };
  const fakeCtx = {
    currentTime: 0,
    state: "running",
    createOscillator: () => fakeOsc,
    createGain: () => fakeGainNode,
    destination: fakeDestination,
  } as unknown as AudioContext;

  playRiverSurfSound("splash", fakeCtx);
  assert.equal(connectedTo, fakeDestination);
});
