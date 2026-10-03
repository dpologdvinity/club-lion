import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPattern,
  buildTrail,
  spawnX,
  LANES,
  LANE_HEIGHT,
  MAX_LANE_SHIFT,
  WARNING_S,
} from "./mangoPattern.ts";

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const RAMPS = [0, 0.3, 0.6, 0.9];

function samplePairs() {
  const pairs: { ramp: number; lionLane: number; rng: () => number }[] = [];
  for (const ramp of RAMPS) {
    for (let lionLane = 0; lionLane < LANES; lionLane++) {
      for (let seed = 1; seed <= 40; seed++) {
        pairs.push({ ramp, lionLane, rng: seeded(seed) });
      }
    }
  }
  return pairs;
}

test("rocks may block the lane the lion already stands in", () => {
  const blockedOwnLane = samplePairs().filter(({ ramp, lionLane, rng }) =>
    buildPattern(ramp, lionLane, rng).rows.some((row) =>
      row.blocked.includes(lionLane),
    ),
  );
  assert.ok(
    blockedOwnLane.length > 0,
    "no pattern ever threatens the lane the lion occupies",
  );
});

test("every row leaves the gap lane open", () => {
  for (const { ramp, lionLane, rng } of samplePairs()) {
    const pattern = buildPattern(ramp, lionLane, rng);
    for (const row of pattern.rows) {
      assert.ok(
        !row.blocked.includes(pattern.gapLane),
        `row blocked the gap lane at ramp ${ramp}`,
      );
    }
  }
});

test("the gap lane is close enough to reach inside the warning time", () => {
  const laneSeconds = LANE_HEIGHT / 200;
  for (const { ramp, lionLane, rng } of samplePairs()) {
    const pattern = buildPattern(ramp, lionLane, rng);
    const shift = Math.abs(pattern.gapLane - lionLane);
    assert.ok(
      shift <= MAX_LANE_SHIFT,
      `gap lane ${pattern.gapLane} too far from lion lane ${lionLane}`,
    );
    assert.ok(
      shift * laneSeconds < WARNING_S,
      `lane shift ${shift} cannot be made in ${WARNING_S}s`,
    );
  }
});

test("spawning early by the warning time holds at every scroll speed", () => {
  const lionX = 56;
  for (const scroll of [95, 95 * 1.9]) {
    const lead = spawnX(lionX, scroll) - lionX;
    assert.ok(Math.abs(lead / scroll - WARNING_S) < 1e-9);
  }
});

test("mango trails sit in blocked lanes and never in the gap", () => {
  for (const { ramp, lionLane, rng } of samplePairs()) {
    const pattern = buildPattern(ramp, lionLane, rng);
    const trail = buildTrail(pattern.rows);
    assert.ok(trail.length > 0, "pattern produced no tempting trail");
    for (const mango of trail) {
      assert.notEqual(mango.lane, pattern.gapLane);
      const leading = pattern.rows.some(
        (row) => row.blocked.includes(mango.lane) && mango.x < row.x,
      );
      assert.ok(leading, "mango did not lead any rock in its lane");
    }
  }
});
