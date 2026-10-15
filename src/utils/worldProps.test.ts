import { test } from "node:test";
import assert from "node:assert/strict";
import type { RoomObstacle } from "../rooms/types.ts";
import type { RoomSpace } from "./obstacles.ts";
import {
  benchAtPoint,
  isNearProp,
  isThrottled,
  obstacleCenter,
  petSideFor,
  PROP_NEAR_MARGIN,
  seatFor,
} from "./worldProps.ts";

const bench: RoomObstacle = {
  id: "bench",
  shape: "polygon",
  points: [
    [600, 600],
    [700, 600],
    [700, 640],
    [600, 640],
  ],
  prop: "bench",
  seat: { x: 650, y: 630 },
};
const lamp: RoomObstacle = {
  id: "lamp",
  shape: "ellipse",
  center: { x: 300, y: 640 },
  rx: 10,
  ry: 30,
  prop: "lamp",
};
const space: RoomSpace = {
  walkable: [
    [0, 560],
    [2400, 560],
    [2400, 720],
    [0, 720],
  ],
  obstacles: [bench, lamp],
};

test("obstacle centre is the ellipse centre or polygon centroid", () => {
  assert.deepEqual(obstacleCenter(lamp), { x: 300, y: 640 });
  assert.deepEqual(obstacleCenter(bench), { x: 650, y: 620 });
});

test("walk-near triggers inside the margin only", () => {
  assert.equal(
    isNearProp({ x: 300 + 10 + PROP_NEAR_MARGIN - 5, y: 640 }, lamp),
    true,
  );
  assert.equal(
    isNearProp({ x: 300 + 10 + PROP_NEAR_MARGIN + 20, y: 640 }, lamp),
    false,
  );
});

test("reactions are throttled by the cooldown", () => {
  assert.equal(isThrottled(1000, 2000, 2500), true);
  assert.equal(isThrottled(1000, 3500, 2500), false);
});

test("bench seat is its explicit seat, and sitting needs to be on it", () => {
  assert.deepEqual(seatFor(bench), { x: 650, y: 630 });
  assert.deepEqual(seatFor(lamp), { x: 300, y: 640 });
  assert.equal(benchAtPoint({ x: 655, y: 625 }, space.obstacles)?.id, "bench");
  assert.equal(benchAtPoint({ x: 900, y: 625 }, space.obstacles), undefined);
  // Lamps are not benches, even when standing right beside one.
  assert.equal(benchAtPoint({ x: 300, y: 640 }, space.obstacles), undefined);
});

test("pet trails on the right unless that spot is blocked", () => {
  assert.equal(petSideFor({ x: 400, y: 650 }, space, 14, 88), "right");
  // Avatar just left of the bench: the right-hand pet spot is inside it.
  assert.equal(petSideFor({ x: 560, y: 650 }, space, 14, 88), "left");
  // Right spot off the floor edge: the pet swaps to the left.
  assert.equal(petSideFor({ x: 2395, y: 650 }, space, 14, 88), "left");
});
