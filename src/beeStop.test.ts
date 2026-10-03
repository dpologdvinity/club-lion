import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BEE_STOP_MAX_SCORE,
  BEE_STOP_ROUNDS,
  advance,
  bandFor,
  coinsFor,
  flowerFor,
  REDUCED_MOTION_FPS,
  scoreFor,
  speedFor,
  zoneFor,
} from "./beeStop.ts";

const closeTo = (actual: number, expected: number) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `expected ${actual} to be within 1e-9 of ${expected}`,
  );

test("every round has a reachable flower, a distinct spot, and a tighter setup than the last", () => {
  const spots = new Set<number>();
  for (let round = 1; round <= BEE_STOP_ROUNDS; round++) {
    const spot = flowerFor(round);
    assert.ok(
      spot > 0.1 && spot < 0.9,
      `round ${round} flower avoids the edges`,
    );
    assert.equal(
      spots.has(spot),
      false,
      `round ${round} repeats a flower spot`,
    );
    spots.add(spot);
    if (round > 1) {
      assert.ok(speedFor(round) > speedFor(round - 1));
      assert.ok(zoneFor(round).good < zoneFor(round - 1).good);
      assert.ok(zoneFor(round).perfect < zoneFor(round - 1).perfect);
    }
  }
  assert.equal(BEE_STOP_ROUNDS, 10);
});

test("scoring bands nest and pay perfect more than good more than okay more than miss", () => {
  for (let round = 1; round <= BEE_STOP_ROUNDS; round++) {
    const zone = zoneFor(round);
    assert.ok(zone.perfect < zone.good);
    assert.ok(zone.good < zone.okay);
    assert.equal(bandFor(0, round), "perfect");
    assert.equal(bandFor(zone.perfect, round), "perfect");
    assert.equal(bandFor(zone.perfect + 0.0001, round), "good");
    assert.equal(bandFor(zone.good, round), "good");
    assert.equal(bandFor(zone.good + 0.0001, round), "okay");
    assert.equal(bandFor(zone.okay, round), "okay");
    assert.equal(bandFor(zone.okay + 0.0001, round), "miss");
    assert.equal(bandFor(1, round), "miss");
    assert.ok(scoreFor(0, round) > scoreFor(zone.good, round));
    assert.ok(scoreFor(zone.good, round) > scoreFor(zone.okay, round));
    assert.ok(scoreFor(zone.okay, round) > scoreFor(1, round));
  }
});

test("a flawless run scores the documented maximum", () => {
  let total = 0;
  for (let round = 1; round <= BEE_STOP_ROUNDS; round++)
    total += scoreFor(0, round);
  assert.equal(total, BEE_STOP_MAX_SCORE);
  assert.equal(BEE_STOP_MAX_SCORE, 1000);
});

test("the bee bounces off both ends and never leaves the bar", () => {
  const fast = speedFor(BEE_STOP_ROUNDS);
  const atEnd = advance(0.98, 1, fast, 0.02);
  assert.equal(atEnd.dir, -1);
  closeTo(atEnd.pos, 1 + 0.02 - fast * 0.02);
  const atStart = advance(0.02, -1, fast, 0.02);
  assert.equal(atStart.dir, 1);
  closeTo(atStart.pos, fast * 0.02 - 0.02);
  assert.deepEqual(advance(0.5, 1, 1, 0.25), { pos: 0.75, dir: 1 });
  assert.deepEqual(advance(0, 1, 1, 0.05), { pos: 0.05, dir: 1 });
  for (let step = 0; step < 500; step++) {
    const moved = advance(0.5, 1, fast, 0.05);
    assert.ok(moved.pos >= 0 && moved.pos <= 1);
    assert.ok(moved.dir === 1 || moved.dir === -1);
  }
});

test("reduced motion stays playable because no hop can clear a scoring band", () => {
  for (let round = 1; round <= BEE_STOP_ROUNDS; round++) {
    const hop = speedFor(round) / REDUCED_MOTION_FPS;
    const zone = zoneFor(round);
    assert.ok(
      hop < zone.okay * 2,
      `round ${round} hop ${hop} can clear the okay band`,
    );
  }
});

test("coin bands rise with the score and never exceed the 120 cap", () => {
  assert.equal(coinsFor(1000), 120);
  assert.equal(coinsFor(900), 120);
  assert.equal(coinsFor(899), 90);
  assert.equal(coinsFor(700), 90);
  assert.equal(coinsFor(699), 60);
  assert.equal(coinsFor(450), 60);
  assert.equal(coinsFor(449), 35);
  assert.equal(coinsFor(200), 35);
  assert.equal(coinsFor(199), 15);
  assert.equal(coinsFor(0), 15);
  assert.equal(coinsFor(-1), 0);
  assert.equal(coinsFor(Number.NaN), 0);
});

test("out-of-range rounds fall back to the first or last round instead of nonsense", () => {
  assert.equal(speedFor(0), speedFor(1));
  assert.equal(speedFor(99), speedFor(BEE_STOP_ROUNDS));
  assert.equal(speedFor(Number.NaN), speedFor(1));
  assert.equal(flowerFor(0), flowerFor(1));
  assert.equal(zoneFor(-4).good, zoneFor(1).good);
  assert.equal(zoneFor(11).good, zoneFor(BEE_STOP_ROUNDS).good);
});
