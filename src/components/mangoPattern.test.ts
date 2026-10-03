import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPattern,
  buildTrail,
  spawnX,
  LANES,
  LANE_HEIGHT,
  LION_SIZE,
  LION_SPEED,
  OBSTACLE_SIZE,
  FIELD_H,
  laneTop,
  patternSpacing,
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
  const pairs: {
    ramp: number;
    lionY: number;
    speed: number;
    rng: () => number;
  }[] = [];
  for (const ramp of RAMPS) {
    for (const speed of [LION_SPEED, LION_SPEED * 0.6]) {
      for (let lionLane = 0; lionLane < LANES; lionLane++) {
        for (let seed = 1; seed <= 40; seed++) {
          const jitter = seeded(seed)() * (LANE_HEIGHT - 1);
          pairs.push({
            ramp,
            lionY: Math.min(
              lionLane * LANE_HEIGHT + jitter,
              FIELD_H - LION_SIZE,
            ),
            speed,
            rng: seeded(seed),
          });
        }
      }
    }
  }
  return pairs;
}

test("rocks may block the lane the lion already stands in", () => {
  const blockedOwnLane = samplePairs().filter(({ ramp, lionY, speed, rng }) =>
    buildPattern(ramp, lionY, speed, rng).rows.some((row) =>
      row.blocked.includes(Math.floor(lionY / LANE_HEIGHT)),
    ),
  );
  assert.ok(
    blockedOwnLane.length > 0,
    "no pattern ever threatens the lane the lion occupies",
  );
});

test("every vertical position can be threatened and every gap fits the lion", () => {
  for (let y = 0; y <= FIELD_H - LION_SIZE; y++) {
    const hit = [0, 1, 2, 3].some((lane) => {
      const rockY = laneTop(lane, LANE_HEIGHT);
      return y < rockY + LANE_HEIGHT && rockY < y + LION_SIZE;
    });
    assert.ok(hit, `permanent safe corridor at y=${y}`);
    for (const speed of [LION_SPEED, LION_SPEED * 0.6]) {
      const threatened = [0, 0.25, 0.5, 0.75, 0.999].some((roll) =>
        buildPattern(0.9, y, speed, () => roll).rows.some((row) =>
          row.blocked.some((lane) => {
            const rockY = laneTop(lane, LANE_HEIGHT);
            return y < rockY + LANE_HEIGHT && rockY < y + LION_SIZE;
          }),
        ),
      );
      assert.ok(threatened, `no possible threat at y=${y}, speed=${speed}`);
      const pattern = buildPattern(0.9, y, speed, seeded(y + 1));
      const gapY = laneTop(pattern.gapLane, LION_SIZE);
      assert.ok(Math.abs(gapY - y) / speed < WARNING_S);
      for (const row of pattern.rows) {
        for (const lane of row.blocked) {
          const rockY = laneTop(lane, LANE_HEIGHT);
          assert.ok(
            gapY + LION_SIZE <= rockY || gapY >= rockY + LANE_HEIGHT,
            "rock overlaps the escape position",
          );
        }
      }
    }
  }
});

test("successive patterns leave time to cross the field after the last wall clears", () => {
  for (const motion of [1, 0.6]) {
    const speed = LION_SPEED * motion;
    const scroll = 95 * 1.9 * motion;
    const rows = buildPattern(0.9, 152, speed, seeded(3)).rows;
    const spacing = patternSpacing(rows, scroll, speed);
    const clearTravel =
      spacing -
      Math.max(...rows.map((row) => row.x)) -
      OBSTACLE_SIZE -
      LION_SIZE;
    assert.ok(
      clearTravel / scroll >= (FIELD_H - LION_SIZE) / speed + WARNING_S - 1e-9,
    );
  }
});

test("every row leaves the gap lane open", () => {
  for (const { ramp, lionY, speed, rng } of samplePairs()) {
    const pattern = buildPattern(ramp, lionY, speed, rng);
    for (const row of pattern.rows) {
      assert.ok(
        !row.blocked.includes(pattern.gapLane),
        `row blocked the gap lane at ramp ${ramp}`,
      );
    }
  }
});

test("the gap's safe position is reachable inside the warning time", () => {
  for (const { ramp, lionY, speed, rng } of samplePairs()) {
    const pattern = buildPattern(ramp, lionY, speed, rng);
    const shift = Math.abs(laneTop(pattern.gapLane, LION_SIZE) - lionY);
    assert.ok(
      shift / speed <= WARNING_S,
      `gap lane ${pattern.gapLane} cannot be reached from y=${lionY} at ${speed}px/s`,
    );
  }
});

test("the first collision begins no earlier than the warning time", () => {
  for (const lionX of [0, 56, 300, 444]) {
    for (const scroll of [95, 95 * 1.9, 95 * 0.6, 95 * 1.9 * 0.6]) {
      const firstCollision = spawnX(lionX, scroll) - (lionX + LION_SIZE);
      assert.ok(
        Math.abs(firstCollision / scroll - WARNING_S) < 1e-9,
        `collision warning is too short at x=${lionX}, speed=${scroll}`,
      );
    }
  }
});

test("alternating mango trails offer safe and risky routes", () => {
  for (const { ramp, lionY, speed, rng } of samplePairs()) {
    const pattern = buildPattern(ramp, lionY, speed, rng);
    const safeTrail = buildTrail(pattern, true, seeded(7));
    const riskyTrail = buildTrail(pattern, false, seeded(7));
    assert.ok(safeTrail.length > 0, "safe pattern produced no mangoes");
    assert.ok(riskyTrail.length > 0, "risky pattern produced no mangoes");
    assert.ok(safeTrail.every((mango) => mango.lane === pattern.gapLane));
    assert.ok(riskyTrail.every((mango) => mango.lane !== pattern.gapLane));
    for (const mango of riskyTrail) {
      assert.ok(
        pattern.rows.some(
          (row) => row.blocked.includes(mango.lane) && mango.x < row.x,
        ),
        "risky mango does not lead a rock in its lane",
      );
    }
  }
});
