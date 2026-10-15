import { clampToWalkable } from "../rooms/camera.ts";
import {
  findRoute,
  nearestFreePoint,
  slideStep,
  type Point,
  type RoomSpace,
} from "./obstacles.ts";

export type WalkPlan = {
  /** Points to glide through in order. Empty when nothing should move. */
  legs: Point[];
  /** The body ran into solid scenery and should give a little bounce. */
  bump: boolean;
};

/** Click or tap: route around obstacles to the nearest free point near the target. */
export function planClickWalk(
  from: Point,
  target: Point,
  space: RoomSpace,
  radius: number,
): WalkPlan {
  const clamped = clampToWalkable(target, space.walkable);
  const goal = nearestFreePoint(clamped, space, radius);
  if (!goal) return { legs: [], bump: false };
  const snapped = Math.hypot(goal.x - clamped.x, goal.y - clamped.y) > 0.5;
  return {
    legs: findRoute(from, goal, space, radius) ?? [],
    bump: snapped,
  };
}

/** Arrow key or WASD: one step that slides along solid scenery instead of entering it. */
export function planKeyboardStep(
  from: Point,
  target: Point,
  space: RoomSpace,
  radius: number,
): WalkPlan {
  const clamped = clampToWalkable(target, space.walkable);
  const step = slideStep(from, clamped, space, radius);
  const moved = step.point.x !== from.x || step.point.y !== from.y;
  return { legs: moved ? [step.point] : [], bump: step.blocked };
}

/**
 * Splits a total walk time across legs in proportion to their length. Each leg
 * gets at least `minimumMs`, so the sum can run past `totalMs` on many short legs.
 */
export function legDurations(
  from: Point,
  legs: Point[],
  totalMs: number,
  minimumMs = 180,
): number[] {
  const lengths: number[] = [];
  let previous = from;
  for (const leg of legs) {
    lengths.push(Math.hypot(leg.x - previous.x, leg.y - previous.y));
    previous = leg;
  }
  const total = lengths.reduce((sum, length) => sum + length, 0);
  return lengths.map((length) =>
    total === 0
      ? totalMs / Math.max(1, legs.length)
      : Math.max(minimumMs, (totalMs * length) / total),
  );
}
