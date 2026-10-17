import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_MANIFESTS } from "../registry.ts";
import { savannaSquareManifest } from "./savannaSquare.ts";
import { obstacleDistance, pointInPolygon } from "../../utils/obstacles.ts";

const square = savannaSquareManifest;
const onFloor = (point: { x: number; y: number }) =>
  pointInPolygon(point, square.walkablePolygon) &&
  (square.obstacles ?? []).every(
    (obstacle) => obstacleDistance(point, obstacle) > 0,
  );

test("Savanna Square is a registered 1536 × 864 manifest room", () => {
  assert.equal(ROOM_MANIFESTS.square, square);
  assert.equal(square.id, "square");
  assert.equal(square.name, "Savanna Square");
  assert.equal(square.stageWidth, 1536);
  assert.equal(square.stageHeight, 864);
});

test("neighbors and the default arrival stand on open floor", () => {
  assert.deepEqual(
    (square.neighbors ?? []).map((n) => n.id),
    ["milo", "cleo", "pip"],
  );
  for (const neighbor of square.neighbors ?? [])
    assert.ok(onFloor(neighbor), neighbor.id);
  assert.ok(onFloor({ x: square.stageWidth / 2, y: 600 }));
});

test("every room that leads back to the square lands on open floor", () => {
  for (const [id, manifest] of Object.entries(ROOM_MANIFESTS)) {
    for (const portal of manifest?.portals ?? []) {
      if (portal.targetRoomId !== "square") continue;
      assert.ok(onFloor(portal.targetSpawn), `${id} → square`);
    }
  }
});

test("square exits lead to rooms that lead back", () => {
  assert.ok(square.portals.length >= 5);
  for (const portal of square.portals) {
    const target = Object.entries(ROOM_MANIFESTS).find(
      ([id]) => id === portal.targetRoomId,
    )?.[1];
    assert.ok(target, portal.targetRoomId);
    assert.ok(
      target.portals.some((back) => back.targetRoomId === "square"),
      `${portal.targetRoomId} has no way back`,
    );
    assert.ok(
      pointInPolygon(portal.targetSpawn, target.walkablePolygon),
      `${portal.targetRoomId} arrival is off the floor`,
    );
    for (const obstacle of target.obstacles ?? [])
      assert.ok(
        obstacleDistance(portal.targetSpawn, obstacle) > 0,
        `${portal.targetRoomId} arrival is inside ${obstacle.id}`,
      );
  }
});

test("multi-step square objects have one read-aloud line per step", () => {
  const stepped = square.interactives.filter((item) => item.object?.steps);
  assert.ok(stepped.length >= 2);
  for (const item of stepped)
    assert.equal(item.reaction?.messages?.length, item.object?.steps, item.id);
});

test("square picture doors each go to exactly one place", () => {
  const doors = square.interactives.filter(
    (item) => item.object?.kind === "door",
  );
  assert.equal(doors.length, 7);
  for (const door of doors) {
    const ways = [door.actionData.travel, door.actionData.roomAction].filter(
      Boolean,
    );
    assert.equal(ways.length, 1, door.id);
    assert.ok(door.reaction?.message, door.id);
  }
});

test("the square has fountain, tree, bushes, lanterns, flags, sandbox and swing", () => {
  const kinds: (string | undefined)[] = square.interactives.map(
    (item) => item.object?.kind,
  );
  for (const kind of [
    "fountain",
    "tree",
    "bush",
    "lanterns",
    "bunting",
    "sandbox",
    "swing",
  ])
    assert.ok(kinds.includes(kind), kind);
  assert.equal(kinds.filter((kind) => kind === "bush").length, 3);
});
