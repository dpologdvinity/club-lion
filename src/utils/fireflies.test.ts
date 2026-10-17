import test from "node:test";
import assert from "node:assert/strict";
import {
  FIREFLY_MAX_SCORE,
  FIREFLY_STAMP_SCORE,
  GRACE_MS,
  MIN_GAP,
  catchPoints,
  isLit,
  makeFirefly,
} from "./fireflies.ts";

const fly = { id: 1, x: 50, y: 50, phase: 0, period: 2000, golden: false };

test("a firefly glows for the first part of each blink", () => {
  assert.equal(isLit(fly, 0), true);
  assert.equal(isLit(fly, 1000), true);
  assert.equal(isLit(fly, 1500), false);
  assert.equal(isLit(fly, 2100), true);
  assert.equal(isLit({ ...fly, phase: 1500 }, 0), false);
  // Before time 0 the blink keeps its rhythm instead of glowing forever.
  assert.equal(isLit(fly, -200), false);
});

test("only a glowing firefly can be caught; golden ones are worth 3", () => {
  assert.equal(catchPoints(fly, 100), 1);
  assert.equal(catchPoints({ ...fly, golden: true }, 100), 3);
  assert.equal(catchPoints(fly, 1500), 0);
});

test("a tap just after the glow fades still counts, for slower fingers", () => {
  // Lit until 1100 ms of each 2000 ms blink.
  assert.equal(catchPoints(fly, 1200), 1);
  assert.equal(catchPoints(fly, 1100 + GRACE_MS + 1), 0);
});

test("new fireflies stay inside the meadow and blink at kid-friendly speeds", () => {
  const rolls = [0, 0.5, 0.999];
  for (const roll of rolls) {
    const made = makeFirefly(7, () => roll);
    assert.equal(made.id, 7);
    assert.ok(made.x >= 8 && made.x <= 92);
    assert.ok(made.y >= 12 && made.y <= 80);
    assert.ok(made.period >= 1600 && made.period <= 2600);
  }
  assert.equal(makeFirefly(1, () => 0).golden, true);
  assert.equal(makeFirefly(1, () => 0.5).golden, false);
});

test("the score cap is above any real round and the stamp is reachable", () => {
  assert.ok(FIREFLY_MAX_SCORE >= 100);
  assert.ok(FIREFLY_STAMP_SCORE < FIREFLY_MAX_SCORE);
});

test("a new firefly keeps clear of the others when there is room", () => {
  const first = makeFirefly(1, () => 0.5);
  let calls = 0;
  // The first spot lands right on top of the old firefly; the next is clear.
  const rolls = [0.9, 0.5, 0.5, 0.5, 0.9, 0.1, 0.1, 0.5];
  const second = makeFirefly(2, () => rolls[calls++ % rolls.length], [first]);
  assert.ok(Math.hypot(second.x - first.x, second.y - first.y) >= MIN_GAP);
});
