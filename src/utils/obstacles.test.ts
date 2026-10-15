import { test } from "node:test";
import assert from "node:assert/strict";
import type { RoomObstacle } from "../rooms/types.ts";
import {
  findRoute,
  isFreePoint,
  isFreeSegment,
  nearestFreePoint,
  obstacleDistance,
  slideStep,
  type Point,
  type RoomSpace,
} from "./obstacles.ts";

const RADIUS = 26;
const floor: [number, number][] = [
  [0, 560],
  [2400, 560],
  [2400, 720],
  [0, 720],
];
const fountain: RoomObstacle = {
  id: "fountain",
  shape: "ellipse",
  center: { x: 1200, y: 640 },
  rx: 90,
  ry: 40,
  prop: "fountain",
};
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
  seat: { x: 650, y: 620 },
};
const space: RoomSpace = { walkable: floor, obstacles: [fountain, bench] };

/** Deterministic PRNG so property checks are stable run to run. */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function assertFreeRoute(start: Point, route: Point[]): void {
  let from = start;
  for (const waypoint of route) {
    assert.ok(
      isFreeSegment(from, waypoint, space, RADIUS),
      `segment ${JSON.stringify(from)} -> ${JSON.stringify(waypoint)} is blocked`,
    );
    from = waypoint;
  }
}

test("ellipse distance is negative inside and about zero on the edge", () => {
  assert.ok(obstacleDistance({ x: 1200, y: 640 }, fountain) < 0);
  assert.ok(Math.abs(obstacleDistance({ x: 1290, y: 640 }, fountain)) < 0.01);
  assert.ok(obstacleDistance({ x: 1400, y: 640 }, fountain) > 100);
});

test("polygon distance is negative inside the bench", () => {
  assert.ok(obstacleDistance({ x: 650, y: 620 }, bench) < 0);
  assert.equal(obstacleDistance({ x: 700, y: 620 }, bench), 0);
  assert.equal(obstacleDistance({ x: 750, y: 620 }, bench), 50);
});

test("a body is free only when clear of every obstacle and inside the floor", () => {
  assert.equal(isFreePoint({ x: 400, y: 650 }, space, RADIUS), true);
  assert.equal(isFreePoint({ x: 1200, y: 640 }, space, RADIUS), false);
  // Just outside the ellipse edge but closer than the body radius.
  assert.equal(isFreePoint({ x: 1290 + 10, y: 640 }, space, RADIUS), false);
  assert.equal(isFreePoint({ x: 400, y: 500 }, space, RADIUS), false);
});

test("straight segments through an ellipse or polygon are blocked", () => {
  assert.equal(
    isFreeSegment({ x: 1000, y: 640 }, { x: 1400, y: 640 }, space, RADIUS),
    false,
  );
  assert.equal(
    isFreeSegment({ x: 500, y: 620 }, { x: 800, y: 620 }, space, RADIUS),
    false,
  );
  // Passing below the fountain's base, clear of its inflated edge, is fine.
  assert.equal(
    isFreeSegment({ x: 1000, y: 716 }, { x: 1400, y: 716 }, space, RADIUS),
    true,
  );
});

test("routes go around an ellipse with every segment clear of it", () => {
  const start = { x: 1000, y: 640 };
  const goal = { x: 1400, y: 640 };
  const route = findRoute(start, goal, space, RADIUS);
  assert.ok(route, "expected a route around the fountain");
  assert.ok(route.length >= 2, "a detour needs at least one corner");
  assertFreeRoute(start, route);
  assert.deepEqual(route.at(-1), goal);
});

test("routes go around a polygon bench", () => {
  const start = { x: 500, y: 620 };
  const goal = { x: 800, y: 620 };
  const route = findRoute(start, goal, space, RADIUS);
  assert.ok(route);
  assertFreeRoute(start, route);
  assert.deepEqual(route.at(-1), goal);
});

test("an unobstructed route is a single waypoint", () => {
  assert.deepEqual(
    findRoute({ x: 300, y: 650 }, { x: 500, y: 650 }, space, RADIUS),
    [{ x: 500, y: 650 }],
  );
  assert.deepEqual(
    findRoute({ x: 300, y: 650 }, { x: 300, y: 650 }, space, RADIUS),
    [{ x: 300, y: 650 }],
  );
});

test("a target inside an obstacle snaps to its nearest free edge point", () => {
  const snapped = nearestFreePoint({ x: 1200, y: 640 }, space, RADIUS);
  assert.ok(snapped);
  assert.equal(isFreePoint(snapped, space, RADIUS), true);
  // The edge sits within the body clearance of the ellipse, not far away.
  assert.ok(obstacleDistance(snapped, fountain) >= RADIUS);
  assert.ok(obstacleDistance(snapped, fountain) < RADIUS + 10);
  const route = findRoute(
    { x: 1000, y: 650 },
    { x: 1200, y: 640 },
    space,
    RADIUS,
  );
  assert.ok(route);
  assert.deepEqual(route.at(-1), snapped);
  assertFreeRoute({ x: 1000, y: 650 }, route);
});

test("a free point comes back unchanged from nearestFreePoint", () => {
  assert.deepEqual(nearestFreePoint({ x: 300, y: 650 }, space, RADIUS), {
    x: 300,
    y: 650,
  });
});

test("keyboard steps slide along an obstacle instead of entering it", () => {
  // Heading right and a little down into the fountain's upper-left flank.
  const from = { x: 1080, y: 612 };
  const step = slideStep(from, { x: 1125, y: 630 }, space, RADIUS);
  assert.equal(step.blocked, false);
  assert.equal(
    isFreeSegment(from, step.point, space, RADIUS),
    true,
    "slide must stay free",
  );
  assert.ok(step.point.x >= from.x);
});

test("a straight keyboard press into an obstacle bumps and stays put", () => {
  const from = { x: 1080, y: 640 };
  const step = slideStep(from, { x: 1125, y: 640 }, space, RADIUS);
  assert.equal(step.blocked, true);
  assert.ok(isFreePoint(step.point, space, RADIUS));
  assert.ok(step.point.x < 1125);
});

test("a clear keyboard step moves exactly as asked", () => {
  const step = slideStep({ x: 300, y: 650 }, { x: 345, y: 650 }, space, RADIUS);
  assert.deepEqual(step, { point: { x: 345, y: 650 }, blocked: false });
});

test("random routes in the room are never blocked and never clip obstacles", () => {
  const next = random(7);
  const inside = (): Point => ({
    x: 60 + next() * 2280,
    y: 580 + next() * 120,
  });
  for (let i = 0; i < 150; i++) {
    const start = nearestFreePoint(inside(), space, RADIUS);
    const goal = nearestFreePoint(inside(), space, RADIUS);
    assert.ok(start && goal);
    const route = findRoute(start, goal, space, RADIUS);
    assert.ok(
      route,
      `no route from ${JSON.stringify(start)} to ${JSON.stringify(goal)}`,
    );
    assertFreeRoute(start, route);
    assert.deepEqual(route.at(-1), goal);
  }
});
