import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getLightingProfile,
  calculateTimeOfDayFromLocalTime,
  generateStars,
  generateFireflies,
  isTimeOfDay,
  decodeTimeOfDay,
  decodeAutoTime,
  type TimeOfDay,
} from "./environmentalLighting.ts";

test("getLightingProfile returns transparent overlay for day", () => {
  const profile = getLightingProfile("day");
  assert.equal(profile.time, "day");
  assert.equal(profile.overlayOpacity, 0);
  assert.equal(profile.showStars, false);
  assert.equal(profile.showFireflies, false);
  assert.equal(profile.ambientBrightness, 1.0);
});

test("getLightingProfile returns amber-orange overlay for sunset", () => {
  const profile = getLightingProfile("sunset");
  assert.equal(profile.time, "sunset");
  assert.equal(profile.overlayOpacity, 0.25);
  assert.equal(profile.showStars, false);
  assert.equal(profile.showFireflies, false);
  assert.equal(profile.ambientBrightness, 0.9);
});

test("getLightingProfile returns deep violet overlay for dusk with stars and fireflies", () => {
  const profile = getLightingProfile("dusk");
  assert.equal(profile.time, "dusk");
  assert.equal(profile.overlayOpacity, 0.4);
  assert.equal(profile.showStars, true);
  assert.equal(profile.showFireflies, true);
  assert.equal(profile.ambientBrightness, 0.75);
});

test("getLightingProfile returns midnight-blue overlay for night with stars and fireflies", () => {
  const profile = getLightingProfile("night");
  assert.equal(profile.time, "night");
  assert.equal(profile.overlayOpacity, 0.55);
  assert.equal(profile.showStars, true);
  assert.equal(profile.showFireflies, true);
  assert.equal(profile.ambientBrightness, 0.65);
});

test("getLightingProfile falls back to day for an invalid time value", () => {
  const profile = getLightingProfile("invalid" as TimeOfDay);
  assert.equal(profile.time, "day");
});

test("getLightingProfile includes a sunPosition coordinate", () => {
  const profile = getLightingProfile("day");
  assert.equal(typeof profile.sunPosition.x, "number");
  assert.equal(typeof profile.sunPosition.y, "number");
});

test("calculateTimeOfDayFromLocalTime classifies morning as day", () => {
  assert.equal(
    calculateTimeOfDayFromLocalTime(new Date(2026, 0, 1, 9, 0)),
    "day",
  );
});

test("calculateTimeOfDayFromLocalTime classifies 17:00 boundary as sunset", () => {
  assert.equal(
    calculateTimeOfDayFromLocalTime(new Date(2026, 0, 1, 17, 0)),
    "sunset",
  );
});

test("calculateTimeOfDayFromLocalTime classifies 19:30 boundary as dusk", () => {
  assert.equal(
    calculateTimeOfDayFromLocalTime(new Date(2026, 0, 1, 19, 30)),
    "dusk",
  );
});

test("calculateTimeOfDayFromLocalTime classifies 21:30 boundary as night", () => {
  assert.equal(
    calculateTimeOfDayFromLocalTime(new Date(2026, 0, 1, 21, 30)),
    "night",
  );
});

test("calculateTimeOfDayFromLocalTime classifies late night as night", () => {
  assert.equal(
    calculateTimeOfDayFromLocalTime(new Date(2026, 0, 1, 2, 0)),
    "night",
  );
});

test("calculateTimeOfDayFromLocalTime classifies just before 6am as night", () => {
  assert.equal(
    calculateTimeOfDayFromLocalTime(new Date(2026, 0, 1, 5, 59)),
    "night",
  );
});

test("calculateTimeOfDayFromLocalTime classifies 6am boundary as day", () => {
  assert.equal(
    calculateTimeOfDayFromLocalTime(new Date(2026, 0, 1, 6, 0)),
    "day",
  );
});

test("generateStars returns requested count of stars", () => {
  const stars = generateStars(10);
  assert.equal(stars.length, 10);
});

test("generateStars produces coordinates and sizing within normalized bounds", () => {
  const stars = generateStars(20);
  for (const star of stars) {
    assert.ok(star.x >= 0 && star.x <= 100);
    assert.ok(star.y >= 0 && star.y <= 100);
    assert.ok(star.size > 0);
    assert.ok(star.opacity > 0 && star.opacity <= 1);
  }
});

test("generateStars is deterministic for a given seed", () => {
  const a = generateStars(15, 7);
  const b = generateStars(15, 7);
  assert.deepEqual(a, b);
});

test("generateStars differs for different seeds", () => {
  const a = generateStars(15, 1);
  const b = generateStars(15, 2);
  assert.notDeepEqual(a, b);
});

test("isTimeOfDay accepts the four valid values", () => {
  assert.equal(isTimeOfDay("day"), true);
  assert.equal(isTimeOfDay("sunset"), true);
  assert.equal(isTimeOfDay("dusk"), true);
  assert.equal(isTimeOfDay("night"), true);
});

test("isTimeOfDay rejects invalid, empty, and non-string values", () => {
  assert.equal(isTimeOfDay("invalid"), false);
  assert.equal(isTimeOfDay(""), false);
  assert.equal(isTimeOfDay(null), false);
  assert.equal(isTimeOfDay(undefined), false);
  assert.equal(isTimeOfDay(42), false);
});

test("decodeTimeOfDay returns the value when it is a valid TimeOfDay", () => {
  assert.equal(decodeTimeOfDay("night"), "night");
});

test("decodeTimeOfDay falls back to null for invalid or missing input", () => {
  assert.equal(decodeTimeOfDay("invalid"), null);
  assert.equal(decodeTimeOfDay(null), null);
  assert.equal(decodeTimeOfDay(undefined), null);
});

test("decodeAutoTime defaults to true when unset", () => {
  assert.equal(decodeAutoTime(null), true);
  assert.equal(decodeAutoTime(undefined), true);
});

test("decodeAutoTime only turns off on the literal string false", () => {
  assert.equal(decodeAutoTime("false"), false);
  assert.equal(decodeAutoTime("true"), true);
  assert.equal(decodeAutoTime("garbage"), true);
});

test("generateFireflies returns requested count with normalized coordinates", () => {
  const flies = generateFireflies(12);
  assert.equal(flies.length, 12);
  for (const fly of flies) {
    assert.ok(fly.x >= 0 && fly.x <= 100);
    assert.ok(fly.y >= 0 && fly.y <= 100);
  }
});

test("generateFireflies is deterministic for a given seed", () => {
  const a = generateFireflies(8, 3);
  const b = generateFireflies(8, 3);
  assert.deepEqual(a, b);
});
