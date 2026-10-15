import { test } from "node:test";
import assert from "node:assert/strict";
import { ROOM_MANIFESTS } from "./registry.ts";
import type { RoomManifest } from "./types.ts";
import { AVATAR_RADIUS } from "./roomSpace.ts";
import {
  findRoute,
  isFreePoint,
  pointInPolygon,
  type Point,
  type RoomSpace,
} from "../utils/obstacles.ts";

const manifests = Object.values(ROOM_MANIFESTS).flatMap((room) =>
  room ? [room] : [],
);

function spaceOf(room: RoomManifest): RoomSpace {
  return { walkable: room.walkablePolygon, obstacles: room.obstacles ?? [] };
}

/** Every spot a visitor can appear at: the room's default spawn and every portal arriving here. */
function arrivalSpawns(room: RoomManifest): Point[] {
  const arrivals = manifests.flatMap((other) =>
    other.portals
      .filter((portal) => portal.targetRoomId === room.id)
      .map((portal) => portal.targetSpawn),
  );
  return [{ x: room.stageWidth / 2, y: 600 }, ...arrivals];
}

for (const room of manifests) {
  test(`${room.name}: obstacles are valid, inside the floor and off the spawns`, () => {
    const space = spaceOf(room);
    for (const obstacle of room.obstacles ?? []) {
      if (obstacle.shape === "ellipse") {
        assert.ok(obstacle.rx > 0 && obstacle.ry > 0, `${obstacle.id} radii`);
        const { center, rx, ry } = obstacle;
        for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
          const edge = {
            x: center.x + rx * Math.cos(angle),
            y: center.y + ry * Math.sin(angle),
          };
          assert.ok(
            pointInPolygon(edge, room.walkablePolygon),
            `${obstacle.id} reaches outside the floor`,
          );
        }
      } else {
        assert.ok(
          obstacle.points.length >= 3,
          `${obstacle.id} needs 3+ points`,
        );
        for (const [x, y] of obstacle.points) {
          assert.ok(
            pointInPolygon({ x, y }, room.walkablePolygon),
            `${obstacle.id} vertex outside the floor`,
          );
        }
      }
      if (obstacle.seat) {
        assert.ok(
          isFreePoint(obstacle.seat, { ...space, obstacles: [] }, 0),
          `${obstacle.id} seat must be on the floor`,
        );
      }
    }
    for (const spawn of arrivalSpawns(room)) {
      assert.ok(
        isFreePoint(spawn, space, AVATAR_RADIUS),
        `${room.name} spawn ${JSON.stringify(spawn)} is blocked`,
      );
    }
  });

  test(`${room.name}: every portal can be reached from every arrival spot`, () => {
    const space = spaceOf(room);
    for (const portal of room.portals) {
      const { x1, y1, x2, y2 } = portal.triggerBounds;
      const targets: Point[] = [];
      for (let i = 0; i <= 8; i++)
        for (let j = 0; j <= 4; j++)
          targets.push({
            x: x1 + ((x2 - x1) * i) / 8,
            y: y1 + ((y2 - y1) * j) / 4,
          });
      const open = targets.filter((point) =>
        isFreePoint(point, space, AVATAR_RADIUS),
      );
      assert.ok(open.length > 0, `${portal.label} trigger is fully blocked`);
      for (const spawn of arrivalSpawns(room)) {
        const reachable = open.some((point) =>
          findRoute(spawn, point, space, AVATAR_RADIUS),
        );
        assert.ok(
          reachable,
          `${portal.label} unreachable from ${JSON.stringify(spawn)}`,
        );
      }
    }
  });
}

test("Downtown Plaza keeps its fountain solid and reactive", () => {
  const plaza = ROOM_MANIFESTS["downtown-plaza"];
  assert.ok(plaza?.obstacles?.some((obstacle) => obstacle.prop === "fountain"));
});
