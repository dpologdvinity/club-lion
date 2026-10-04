import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateWaveOffset,
  calculateBucketCycle,
  isAvatarDrenched,
  calculateRiverDrift,
} from "./waterparkPhysics.ts";
import { splashOasisEntryManifest } from "../rooms/manifests/splashOasisEntry.ts";
import { splashOasisRiverManifest } from "../rooms/manifests/splashOasisRiver.ts";
import type { RoomManifest } from "../rooms/types.ts";

test("calculateWaveOffset is always finite and bounded within amplitude", () => {
  const amplitude = 12;
  for (let t = 0; t <= 20000; t += 137) {
    for (const x of [0, 400, 1400, 2800]) {
      const offset = calculateWaveOffset(t, x, 4000, amplitude);
      assert.ok(Number.isFinite(offset), `offset at t=${t} x=${x} not finite`);
      assert.ok(offset <= amplitude + 1e-9);
      assert.ok(offset >= -amplitude - 1e-9);
    }
  }
});

test("calculateWaveOffset repeats every period at a fixed x", () => {
  const periodMs = 4000;
  const amplitude = 12;
  const x = 500;
  const a = calculateWaveOffset(1234, x, periodMs, amplitude);
  const b = calculateWaveOffset(1234 + periodMs, x, periodMs, amplitude);
  assert.ok(Math.abs(a - b) < 1e-9);
});

test("calculateWaveOffset varies with x at a fixed time (traveling wave)", () => {
  const t = 1000;
  const a = calculateWaveOffset(t, 0);
  const b = calculateWaveOffset(t, 1400);
  assert.notEqual(a, b);
});

test("calculateBucketCycle accumulates fill smoothly from 0% to 80% of cycle", () => {
  const cycleDurationMs = 15000;
  const fillAt0 = calculateBucketCycle(0, cycleDurationMs);
  assert.equal(fillAt0.fillPercent, 0);
  assert.equal(fillAt0.tipAngleDeg, 0);
  assert.equal(fillAt0.isDumping, false);
  assert.equal(fillAt0.splashRadius, 0);

  const fillAt40 = calculateBucketCycle(cycleDurationMs * 0.4, cycleDurationMs);
  const fillAt79 = calculateBucketCycle(
    cycleDurationMs * 0.79,
    cycleDurationMs,
  );
  assert.ok(fillAt40.fillPercent > 0 && fillAt40.fillPercent < 100);
  assert.ok(fillAt79.fillPercent > fillAt40.fillPercent);
  assert.ok(fillAt79.fillPercent <= 100);
  assert.equal(fillAt40.tipAngleDeg, 0);
  assert.equal(fillAt40.isDumping, false);
  assert.equal(fillAt40.splashRadius, 0);

  const fillAt80 = calculateBucketCycle(cycleDurationMs * 0.8, cycleDurationMs);
  assert.ok(fillAt80.fillPercent >= 99.9);
});

test("calculateBucketCycle tips forward and dumps between 80% and 88%", () => {
  const cycleDurationMs = 15000;
  const atStartOfTip = calculateBucketCycle(
    cycleDurationMs * 0.8,
    cycleDurationMs,
  );
  const midTip = calculateBucketCycle(cycleDurationMs * 0.84, cycleDurationMs);
  const endTip = calculateBucketCycle(cycleDurationMs * 0.88, cycleDurationMs);

  assert.equal(atStartOfTip.tipAngleDeg, 0);
  assert.ok(midTip.tipAngleDeg > 0 && midTip.tipAngleDeg < 90);
  assert.ok(Math.abs(endTip.tipAngleDeg - 90) < 1e-6);

  assert.equal(midTip.isDumping, true);
  assert.ok(midTip.splashRadius > 0);
  assert.ok(midTip.splashRadius <= 180 + 1e-9);
});

test("calculateBucketCycle empties and swings back upright between 88% and 100%", () => {
  const cycleDurationMs = 15000;
  const start = calculateBucketCycle(cycleDurationMs * 0.88, cycleDurationMs);
  const mid = calculateBucketCycle(cycleDurationMs * 0.94, cycleDurationMs);
  const end = calculateBucketCycle(cycleDurationMs * 0.999, cycleDurationMs);
  const wrapped = calculateBucketCycle(cycleDurationMs, cycleDurationMs);

  assert.ok(Math.abs(start.tipAngleDeg - 90) < 1e-6);
  assert.ok(mid.tipAngleDeg < start.tipAngleDeg);
  assert.ok(end.tipAngleDeg < mid.tipAngleDeg);
  assert.ok(mid.splashRadius < 180);
  assert.equal(wrapped.tipAngleDeg, 0);
  assert.equal(wrapped.fillPercent, 0);
  assert.equal(wrapped.isDumping, false);
  assert.equal(wrapped.splashRadius, 0);
});

test("calculateBucketCycle fillPercent stays within 0 to 100 across full cycle", () => {
  const cycleDurationMs = 15000;
  for (let t = 0; t < cycleDurationMs; t += 97) {
    const state = calculateBucketCycle(t, cycleDurationMs);
    assert.ok(state.fillPercent >= 0 && state.fillPercent <= 100);
    assert.ok(state.tipAngleDeg >= 0 && state.tipAngleDeg <= 90);
    assert.ok(state.splashRadius >= 0 && state.splashRadius <= 180 + 1e-9);
  }
});

test("isAvatarDrenched returns true within splash radius, false outside or when inactive", () => {
  const bucketCenter = { x: 1000, y: 500 };
  assert.equal(isAvatarDrenched({ x: 1000, y: 500 }, bucketCenter, 100), true);
  assert.equal(isAvatarDrenched({ x: 1050, y: 500 }, bucketCenter, 100), true);
  assert.equal(isAvatarDrenched({ x: 1200, y: 500 }, bucketCenter, 100), false);
  assert.equal(isAvatarDrenched({ x: 1000, y: 500 }, bucketCenter, 0), false);
});

test("calculateRiverDrift forms a closed loop: start and end coincide", () => {
  const start = calculateRiverDrift(0);
  const end = calculateRiverDrift(1);
  assert.ok(Math.abs(start.x - end.x) < 1e-6);
  assert.ok(Math.abs(start.y - end.y) < 1e-6);
});

test("calculateRiverDrift stays within the 2800x720 stage bounds", () => {
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const point = calculateRiverDrift(t);
    assert.ok(point.x >= 0 && point.x <= 2800);
    assert.ok(point.y >= 0 && point.y <= 720);
    assert.ok(Number.isFinite(point.angle));
  }
});

test("calculateRiverDrift is continuous in position and heading", () => {
  const dt = 0.001;
  let maxJump = 0;
  for (let i = 0; i < 1000; i++) {
    const t = i / 1000;
    const a = calculateRiverDrift(t);
    const b = calculateRiverDrift((t + dt) % 1);
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    maxJump = Math.max(maxJump, dist);
  }
  assert.ok(maxJump < 50, `unexpected position jump: ${maxJump}`);
});

function assertValidManifest(manifest: RoomManifest, expectedId: string) {
  assert.equal(manifest.id, expectedId);
  assert.equal(manifest.stageWidth, 2800);
  assert.equal(manifest.stageHeight, 720);
  assert.ok(manifest.walkablePolygon.length >= 3);
  for (const [x, y] of manifest.walkablePolygon) {
    assert.ok(x >= 0 && x <= manifest.stageWidth);
    assert.ok(y >= 0 && y <= manifest.stageHeight);
  }
  for (const portal of manifest.portals) {
    assert.ok(portal.targetRoomId.length > 0);
    assert.ok(
      portal.targetSpawn.x >= 0 && portal.targetSpawn.x <= manifest.stageWidth,
    );
    assert.ok(
      portal.targetSpawn.y >= 0 && portal.targetSpawn.y <= manifest.stageHeight,
    );
  }
}

test("splashOasisEntryManifest is structurally valid", () => {
  const manifest = splashOasisEntryManifest;
  assertValidManifest(manifest, "splash-oasis-entry");
  assert.equal(manifest.name, "Splash Oasis");

  const backPortal = manifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  );
  assert.ok(backPortal, "expected portal back to downtown-plaza");
  assert.equal(backPortal!.targetSpawn.x, 400);
  assert.equal(backPortal!.targetSpawn.y, 600);

  const forwardPortal = manifest.portals.find(
    (p) => p.targetRoomId === "splash-oasis-river",
  );
  assert.ok(forwardPortal, "expected portal forward to splash-oasis-river");
  assert.equal(forwardPortal!.targetSpawn.x, 2700);
  assert.equal(forwardPortal!.targetSpawn.y, 560);
});

test("splashOasisRiverManifest is structurally valid", () => {
  const manifest = splashOasisRiverManifest;
  assertValidManifest(manifest, "splash-oasis-river");
  assert.equal(manifest.name, "Lazy River Oasis");

  const backPortal = manifest.portals.find(
    (p) => p.targetRoomId === "splash-oasis-entry",
  );
  assert.ok(backPortal, "expected portal back to splash-oasis-entry");
});
