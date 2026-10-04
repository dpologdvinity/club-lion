import { test } from "node:test";
import assert from "node:assert/strict";
import {
  performPetCare,
  isPetFullyPampered,
  calculatePetCareDecay,
  playPetSound,
  DEFAULT_PET_CARE_STATE,
} from "./petCare.ts";

test("DEFAULT_PET_CARE_STATE has all stats initialized", () => {
  assert.ok(Number.isFinite(DEFAULT_PET_CARE_STATE.happiness));
  assert.ok(Number.isFinite(DEFAULT_PET_CARE_STATE.cleanliness));
  assert.ok(Number.isFinite(DEFAULT_PET_CARE_STATE.energy));
  assert.ok(Number.isFinite(DEFAULT_PET_CARE_STATE.hunger));
  assert.ok(Number.isFinite(DEFAULT_PET_CARE_STATE.lastCareTimestamp));
});

test("wash action increases cleanliness significantly", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const result = performPetCare(state, "wash");
  assert.ok(result.nextState.cleanliness > state.cleanliness);
  assert.ok(result.nextState.cleanliness <= 100);
  assert.equal(result.effectType, "bubbles");
});

test("brush action increases happiness", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const result = performPetCare(state, "brush");
  assert.ok(result.nextState.happiness > state.happiness);
  assert.ok(result.nextState.happiness <= 100);
  assert.equal(result.effectType, "sparkle");
});

test("feed action increases hunger toward 100", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const result = performPetCare(state, "feed");
  assert.ok(result.nextState.hunger > state.hunger);
  assert.ok(result.nextState.hunger <= 100);
  assert.equal(result.effectType, "munch");
});

test("play action increases happiness and decreases energy", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const result = performPetCare(state, "play");
  assert.ok(result.nextState.happiness > state.happiness);
  assert.ok(result.nextState.energy < state.energy);
  assert.ok(result.nextState.energy >= 0);
  assert.equal(result.effectType, "bounce");
});

test("stats are clamped to [0, 100] after action", () => {
  const state = {
    happiness: 95,
    cleanliness: 95,
    energy: 95,
    hunger: 95,
    lastCareTimestamp: Date.now(),
  };
  const result = performPetCare(state, "brush");
  assert.ok(result.nextState.happiness <= 100);
  assert.ok(result.nextState.cleanliness <= 100);
  assert.ok(result.nextState.energy <= 100);
  assert.ok(result.nextState.hunger <= 100);
});

test("happinessDelta reflects actual change", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const result = performPetCare(state, "play");
  const expected = result.nextState.happiness - state.happiness;
  assert.equal(result.happinessDelta, expected);
});

test("lastCareTimestamp updates on action", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const beforeTime = Date.now();
  const result = performPetCare(state, "wash");
  const afterTime = Date.now();
  assert.ok(result.nextState.lastCareTimestamp >= beforeTime);
  assert.ok(result.nextState.lastCareTimestamp <= afterTime + 10);
});

test("isPetFullyPampered returns true at happiness >= 100", () => {
  assert.equal(
    isPetFullyPampered({ ...DEFAULT_PET_CARE_STATE, happiness: 100 }),
    true,
  );
});

test("isPetFullyPampered returns false below 100", () => {
  assert.equal(
    isPetFullyPampered({ ...DEFAULT_PET_CARE_STATE, happiness: 99 }),
    false,
  );
});

test("calculatePetCareDecay with 0 elapsed hours returns unchanged stats", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const decayed = calculatePetCareDecay(state, 0);
  assert.equal(decayed.happiness, state.happiness);
  assert.equal(decayed.cleanliness, state.cleanliness);
  assert.equal(decayed.energy, state.energy);
  assert.equal(decayed.hunger, state.hunger);
});

test("calculatePetCareDecay with negative elapsed hours is no-op", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const decayed = calculatePetCareDecay(state, -1);
  assert.equal(decayed.happiness, state.happiness);
  assert.equal(decayed.cleanliness, state.cleanliness);
  assert.equal(decayed.energy, state.energy);
  assert.equal(decayed.hunger, state.hunger);
});

test("calculatePetCareDecay with positive elapsed hours decreases stats", () => {
  const state = {
    happiness: 80,
    cleanliness: 80,
    energy: 80,
    hunger: 80,
    lastCareTimestamp: Date.now(),
  };
  const decayed = calculatePetCareDecay(state, 1);
  assert.ok(decayed.happiness <= state.happiness);
  assert.ok(decayed.cleanliness <= state.cleanliness);
  assert.ok(decayed.energy <= state.energy);
  assert.ok(decayed.hunger <= state.hunger);
});

test("calculatePetCareDecay clamps stats to minimum 0", () => {
  const state = {
    happiness: 5,
    cleanliness: 5,
    energy: 5,
    hunger: 5,
    lastCareTimestamp: Date.now(),
  };
  const decayed = calculatePetCareDecay(state, 100);
  assert.ok(decayed.happiness >= 0);
  assert.ok(decayed.cleanliness >= 0);
  assert.ok(decayed.energy >= 0);
  assert.ok(decayed.hunger >= 0);
});

test("calculatePetCareDecay does not mutate lastCareTimestamp", () => {
  const state = DEFAULT_PET_CARE_STATE;
  const decayed = calculatePetCareDecay(state, 1);
  assert.equal(decayed.lastCareTimestamp, state.lastCareTimestamp);
});

test("playPetSound with null context throws nothing", () => {
  assert.doesNotThrow(() => {
    playPetSound("purr", null);
    playPetSound("bubble_pop", null);
    playPetSound("munch", null);
    playPetSound("heart_chime", null);
    playPetSound("happy_roar", null);
  });
});

test("playPetSound with undefined context throws nothing", () => {
  assert.doesNotThrow(() => {
    playPetSound("purr", undefined);
  });
});
