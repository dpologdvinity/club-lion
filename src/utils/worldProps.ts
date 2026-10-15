import type { RoomObstacle } from "../rooms/types.ts";
import {
  isFreePoint,
  obstacleDistance,
  type Point,
  type RoomSpace,
} from "./obstacles.ts";

/** Walking within this many space units of a prop makes it react. */
export const PROP_NEAR_MARGIN = 60;
/** Minimum gap between walk-near reactions of the same prop. */
export const PROP_COOLDOWN_MS = 2500;
/** Avatar counts as sitting when this close to a bench seat. */
export const SEAT_REACH = 30;

export function obstacleCenter(obstacle: RoomObstacle): Point {
  if (obstacle.shape === "ellipse") return obstacle.center;
  const { points } = obstacle;
  return {
    x: points.reduce((sum, [x]) => sum + x, 0) / points.length,
    y: points.reduce((sum, [, y]) => sum + y, 0) / points.length,
  };
}

export function isNearProp(avatar: Point, obstacle: RoomObstacle): boolean {
  return obstacleDistance(avatar, obstacle) <= PROP_NEAR_MARGIN;
}

export function isThrottled(
  lastAt: number,
  now: number,
  gapMs: number,
): boolean {
  return now - lastAt < gapMs;
}

/** The bench spot the avatar sits on: its explicit seat, else its centre. */
export function seatFor(obstacle: RoomObstacle): Point {
  return obstacle.seat ?? obstacleCenter(obstacle);
}

/** The bench whose seat the avatar has stopped on, if any. */
export function benchAtPoint(
  point: Point,
  obstacles: RoomObstacle[],
): RoomObstacle | undefined {
  return obstacles.find((obstacle) => {
    if (obstacle.prop !== "bench") return false;
    const seat = seatFor(obstacle);
    return Math.hypot(seat.x - point.x, seat.y - point.y) <= SEAT_REACH;
  });
}

/**
 * Pet trails on the right of the avatar. When that spot is inside scenery or
 * off the floor, it moves to the left, and stays on the right if neither is free.
 */
export function petSideFor(
  avatar: Point,
  space: RoomSpace,
  petRadius: number,
  offset: number,
): "left" | "right" {
  const right = { x: avatar.x + offset, y: avatar.y };
  if (isFreePoint(right, space, petRadius)) return "right";
  const left = { x: avatar.x - offset, y: avatar.y };
  return isFreePoint(left, space, petRadius) ? "left" : "right";
}
