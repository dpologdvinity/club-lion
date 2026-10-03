import test from "node:test";
import assert from "node:assert/strict";
import { computeArcTrajectory } from "./ballistics.ts";

test("trajectory begins at the origin and ends at the target", () => {
  assert.deepEqual(computeArcTrajectory(50, 80, 200, 120, 0), { x: 50, y: 80 });
  assert.deepEqual(computeArcTrajectory(50, 80, 200, 120, 1), {
    x: 200,
    y: 120,
  });
});

test("default arc raises the midpoint 80 pixels above the straight line", () => {
  assert.deepEqual(computeArcTrajectory(50, 80, 200, 120, 0.5), {
    x: 125,
    y: 20,
  });
});

test("custom elevation follows a parabola on both sides of the midpoint", () => {
  assert.deepEqual(computeArcTrajectory(0, 100, 200, 100, 0.25, 60), {
    x: 50,
    y: 55,
  });
  assert.deepEqual(computeArcTrajectory(0, 100, 200, 100, 0.5, 60), {
    x: 100,
    y: 40,
  });
  assert.deepEqual(computeArcTrajectory(0, 100, 200, 100, 0.75, 60), {
    x: 150,
    y: 55,
  });
});

test("zero elevation follows the straight line including leftward throws", () => {
  assert.deepEqual(computeArcTrajectory(200, 120, 0, 40, 0.25, 0), {
    x: 150,
    y: 100,
  });
});

test("a throw to the origin still arcs upward and returns", () => {
  assert.deepEqual(computeArcTrajectory(25, 100, 25, 100, 0.5, 60), {
    x: 25,
    y: 40,
  });
  assert.deepEqual(computeArcTrajectory(25, 100, 25, 100, 1, 60), {
    x: 25,
    y: 100,
  });
});
