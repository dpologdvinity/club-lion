import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCameraOffset } from "./camera.ts";

test("clamps to left edge when avatar near stage start", () => {
  assert.equal(computeCameraOffset(50, 2400, 800), 0);
});

test("centers viewport on avatar mid-stage", () => {
  assert.equal(computeCameraOffset(1200, 2400, 800), 800);
});

test("clamps to right edge when avatar near stage end", () => {
  assert.equal(computeCameraOffset(2390, 2400, 800), 1600);
});

test("returns 0 when stage fits entirely within viewport", () => {
  assert.equal(computeCameraOffset(100, 600, 800), 0);
});
