import { test } from "node:test";
import assert from "node:assert/strict";
import { computePetTrailingStep } from "./petFollower.ts";

test("avatar heading right: target offset is behind-left of avatar", () => {
  const step = computePetTrailingStep(
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    "right",
    0.016,
    5.0,
  );
  // target = (200 - 35, 100 + 5) = (165, 105)
  // newX = 100 + (165 - 100) * min(1, 5 * 0.016) = 100 + 65*0.08 = 105.2
  assert.ok(Math.abs(step.newPos.x - 105.2) < 1e-6);
  assert.ok(Math.abs(step.newPos.y - 100.4) < 1e-6);
});

test("avatar heading left: target offset is behind-right of avatar", () => {
  const step = computePetTrailingStep(
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    "left",
    0.016,
    5.0,
  );
  // target = (200 + 35, 100 + 5) = (235, 105)
  const expectedX = 100 + (235 - 100) * Math.min(1, 5.0 * 0.016);
  assert.ok(Math.abs(step.newPos.x - expectedX) < 1e-6);
});

test("isTrotting is true when distance to target exceeds 8px", () => {
  const step = computePetTrailingStep(
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    "right",
    0.016,
    5.0,
  );
  assert.equal(step.isTrotting, true);
});

test("isTrotting is false when within 8px of target", () => {
  // target when heading right = (200 - 35, 0 + 5) = (165, 5); start pet very close to target
  const step = computePetTrailingStep(
    { x: 164, y: 4 },
    { x: 200, y: 0 },
    "right",
    0.016,
    5.0,
  );
  assert.equal(step.isTrotting, false);
});

test("heading in result reflects avatarHeading passed in", () => {
  const stepRight = computePetTrailingStep(
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    "right",
  );
  assert.equal(stepRight.heading, "right");

  const stepLeft = computePetTrailingStep(
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    "left",
  );
  assert.equal(stepLeft.heading, "left");
});

test("lerp factor is clamped to 1 when followStiffness * deltaSeconds exceeds 1", () => {
  // large deltaSeconds should snap pet directly to target, not overshoot
  const step = computePetTrailingStep(
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    "right",
    10,
    5.0,
  );
  // target = (100 - 35, 0 + 5) = (65, 5)
  assert.equal(step.newPos.x, 65);
  assert.equal(step.newPos.y, 5);
});

test("default parameters are applied when deltaSeconds and followStiffness omitted", () => {
  const step = computePetTrailingStep(
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    "right",
  );
  // target = (65, 5); factor = min(1, 5.0 * 0.016) = 0.08
  const expectedX = 0 + 65 * 0.08;
  const expectedY = 0 + 5 * 0.08;
  assert.ok(Math.abs(step.newPos.x - expectedX) < 1e-6);
  assert.ok(Math.abs(step.newPos.y - expectedY) < 1e-6);
});
