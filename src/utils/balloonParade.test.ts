import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BALLOON_COLORS,
  RAINBOW_ORDER,
  SURPRISES,
  isBalloonColor,
  isRainbowFinished,
  pickSurprise,
  rainbowProgress,
  spawnColor,
} from "./balloonParade.ts";

test("the arch is built red, orange, yellow, green, blue, purple", () => {
  assert.deepEqual(
    [...RAINBOW_ORDER],
    ["red", "orange", "yellow", "green", "blue", "purple"],
  );
  assert.deepEqual(
    BALLOON_COLORS.map((color) => color.id),
    [...RAINBOW_ORDER],
  );
});

test("only the next colour in the order adds a stripe", () => {
  assert.equal(rainbowProgress(0, "red"), 1);
  assert.equal(rainbowProgress(0, "blue"), 0);
  assert.equal(rainbowProgress(2, "orange"), 2);
  assert.equal(rainbowProgress(2, "yellow"), 3);
});

test("a finished arch stays finished and wrong colours never undo stripes", () => {
  let progress = 0;
  for (const color of RAINBOW_ORDER)
    progress = rainbowProgress(progress, color);
  assert.equal(progress, RAINBOW_ORDER.length);
  assert.equal(isRainbowFinished(progress), true);
  assert.equal(isRainbowFinished(progress - 1), false);
  assert.equal(rainbowProgress(3, "red"), 3);
});

test("the next needed colour turns up about half the time in rainbow mode", () => {
  assert.equal(
    spawnColor("rainbow", 2, () => 0),
    "yellow",
  );
  assert.equal(
    spawnColor("rainbow", 2, () => 0.49),
    "yellow",
  );
  assert.equal(
    spawnColor("rainbow", 2, () => 0.99),
    "purple",
  );
  assert.equal(
    spawnColor("pop", 2, () => 0),
    "red",
  );
});

test("a finished arch no longer asks for a colour", () => {
  assert.equal(
    spawnColor("rainbow", 6, () => 0),
    "red",
  );
});

test("surprises are animals or a note, and every one is reachable", () => {
  assert.ok(SURPRISES.includes("note"));
  const seen = new Set(
    Array.from({ length: SURPRISES.length * 4 }, (_, index) =>
      pickSurprise(() => (index + 0.5) / (SURPRISES.length * 4)),
    ),
  );
  assert.equal(seen.size, SURPRISES.length);
});

test("only known colour ids pass validation", () => {
  assert.equal(isBalloonColor("purple"), true);
  for (const value of ["pink", "", 3, null, undefined])
    assert.equal(isBalloonColor(value), false, String(value));
});
