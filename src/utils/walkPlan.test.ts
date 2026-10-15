import { test } from "node:test";
import assert from "node:assert/strict";
import type { RoomObstacle } from "../rooms/types.ts";
import { isFreePoint, isFreeSegment, type RoomSpace } from "./obstacles.ts";
import { legDurations, planClickWalk, planKeyboardStep } from "./walkPlan.ts";

const RADIUS = 26;
const fountain: RoomObstacle = {
  id: "fountain",
  shape: "ellipse",
  center: { x: 1200, y: 640 },
  rx: 90,
  ry: 40,
  prop: "fountain",
};
const space: RoomSpace = {
  walkable: [
    [0, 560],
    [2400, 560],
    [2400, 720],
    [0, 720],
  ],
  obstacles: [fountain],
};

test("click walk routes around the fountain with every leg clear of it", () => {
  const from = { x: 1000, y: 650 };
  const plan = planClickWalk(from, { x: 1400, y: 650 }, space, RADIUS);
  assert.equal(plan.bump, false);
  assert.ok(plan.legs.length >= 2);
  let previous = from;
  for (const leg of plan.legs) {
    assert.ok(isFreeSegment(previous, leg, space, RADIUS));
    previous = leg;
  }
  assert.deepEqual(plan.legs.at(-1), { x: 1400, y: 650 });
});

test("click inside the fountain snaps to its edge and bumps", () => {
  const plan = planClickWalk(
    { x: 1000, y: 650 },
    { x: 1200, y: 640 },
    space,
    RADIUS,
  );
  assert.equal(plan.bump, true);
  const goal = plan.legs.at(-1);
  assert.ok(goal);
  assert.equal(isFreePoint(goal, space, RADIUS), true);
});

test("click outside the walkable floor is pulled back onto it", () => {
  const plan = planClickWalk(
    { x: 300, y: 650 },
    { x: 300, y: 100 },
    space,
    RADIUS,
  );
  assert.equal(plan.bump, false);
  assert.ok((plan.legs.at(-1)?.y ?? 0) >= 560);
});

test("keyboard step into the fountain bumps and gives no leg", () => {
  const plan = planKeyboardStep(
    { x: 1080, y: 640 },
    { x: 1125, y: 640 },
    space,
    RADIUS,
  );
  assert.equal(plan.bump, true);
  assert.ok(plan.legs.length <= 1);
  for (const leg of plan.legs) assert.ok(isFreePoint(leg, space, RADIUS));
});

test("keyboard step in open floor moves exactly one step without a bump", () => {
  assert.deepEqual(
    planKeyboardStep({ x: 300, y: 650 }, { x: 345, y: 650 }, space, RADIUS),
    { legs: [{ x: 345, y: 650 }], bump: false },
  );
});

test("leg durations add up to the total and respect the floor", () => {
  const durations = legDurations(
    { x: 0, y: 0 },
    [
      { x: 300, y: 0 },
      { x: 300, y: 10 },
    ],
    850,
  );
  assert.equal(durations.length, 2);
  assert.ok(Math.abs(durations[0] - (850 * 300) / 310) < 0.001);
  assert.ok(durations.every((ms) => ms >= 180));
  assert.deepEqual(legDurations({ x: 0, y: 0 }, [{ x: 0, y: 0 }], 850), [850]);
});
