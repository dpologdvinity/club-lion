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

test("pointer uses the viewport origin and one camera offset at any scale", async () => {
  const { pointerToStage } = await import("./camera.ts");
  assert.deepEqual(pointerToStage(300, 250, { left: 100, top: 50 }, 800, 0.5), {
    x: 1200,
    y: 400,
  });
  assert.deepEqual(pointerToStage(110, 90, { left: 10, top: 10 }, 0, 1), {
    x: 100,
    y: 80,
  });
});

test("room movement clamps to the actual walkable polygon, retaining reachable portals", async () => {
  const { clampToWalkable } = await import("./camera.ts");
  const polygon: [number, number][] = [
    [0, 540],
    [2800, 540],
    [2800, 720],
    [0, 720],
  ];
  assert.deepEqual(clampToWalkable({ x: 80, y: 100 }, polygon), {
    x: 80,
    y: 540,
  });
  assert.deepEqual(clampToWalkable({ x: 2900, y: 800 }, polygon), {
    x: 2800,
    y: 720,
  });
  assert.deepEqual(clampToWalkable({ x: 100, y: 600 }, polygon), {
    x: 100,
    y: 600,
  });
  assert.deepEqual(
    clampToWalkable({ x: 80, y: 80 }, [
      [0, 0],
      [100, 0],
      [0, 100],
    ]),
    { x: 50, y: 50 },
  );
});

test("every panoramic portal leads to a registered place or the catalog with a safe arrival", async () => {
  const { ROOM_MANIFESTS } = await import("./registry.ts");
  const { PLACES } = await import("../game.ts");
  const { clampToWalkable } = await import("./camera.ts");
  for (const room of Object.values(ROOM_MANIFESTS)) {
    for (const portal of room.portals) {
      assert.ok(
        portal.targetRoomId === "le-shop" ||
          PLACES.some((p) => p.id === portal.targetRoomId),
      );
      const target = Object.values(ROOM_MANIFESTS).find(
        (r) => r.id === portal.targetRoomId,
      );
      if (!target) continue;
      assert.deepEqual(
        clampToWalkable(portal.targetSpawn, target.walkablePolygon),
        portal.targetSpawn,
      );
      assert.equal(
        target.portals.some(
          ({ triggerBounds: b }) =>
            portal.targetSpawn.x >= b.x1 &&
            portal.targetSpawn.x <= b.x2 &&
            portal.targetSpawn.y >= b.y1 &&
            portal.targetSpawn.y <= b.y2,
        ),
        false,
        `${room.id} → ${target.id} arrival must not bounce`,
      );
    }
  }
});
