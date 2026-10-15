import type { RoomObstacle } from "../rooms/types.ts";

/**
 * Solid-scenery collision for room walking. Everything is in stage units.
 *
 * `radius` is the body radius of whoever walks (avatar or pet). A point is
 * free when it sits inside the walkable polygon and at least `radius` away
 * from every obstacle. Routes are visibility graphs over points that hug
 * the inflated obstacles, so paths never clip a corner.
 */

export type Point = { x: number; y: number };
export type Polygon = [number, number][];
export type RoomSpace = { walkable: Polygon; obstacles: RoomObstacle[] };

/** Ring candidates sit this far outside an obstacle, so they stay free. */
const RING_CLEARANCE = 3;
const ELLIPSE_RING_SAMPLES = 16;
/** A keyboard step that gets less than this share of its length bumps. */
const BUMP_FRACTION = 0.15;

export function pointInPolygon(point: Point, polygon: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j];
    const [bx, by] = polygon[i];
    if (
      ay > point.y !== by > point.y &&
      point.x < ((bx - ax) * (point.y - ay)) / (by - ay) + ax
    )
      inside = !inside;
  }
  return inside;
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const lengthSquared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) /
              lengthSquared,
          ),
        );
  return Math.hypot(a.x + t * (b.x - a.x) - p.x, a.y + t * (b.y - a.y) - p.y);
}

function orientation(a: Point, b: Point, c: Point): number {
  return Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
}

function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
  return (
    orientation(a, b, c) !== orientation(a, b, d) &&
    orientation(c, d, a) !== orientation(c, d, b)
  );
}

/** Signed distance: negative inside. Ellipses use the usual radial estimate. */
export function obstacleDistance(p: Point, obstacle: RoomObstacle): number {
  if (obstacle.shape === "ellipse") {
    const { center, rx, ry } = obstacle;
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    const length = Math.hypot(dx, dy);
    const scaled = Math.hypot(dx / rx, dy / ry);
    if (length === 0 || scaled === 0) return -Math.min(rx, ry);
    return length * (1 - 1 / scaled);
  }
  const { points } = obstacle;
  let best = Infinity;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [ax, ay] = points[j];
    const [bx, by] = points[i];
    best = Math.min(
      best,
      distanceToSegment(p, { x: ax, y: ay }, { x: bx, y: by }),
    );
  }
  return pointInPolygon(p, points) ? -best : best;
}

/** Walkable and at least `radius` clear of every obstacle. */
export function isFreePoint(
  p: Point,
  space: RoomSpace,
  radius: number,
): boolean {
  if (!pointInPolygon(p, space.walkable)) return false;
  return space.obstacles.every(
    (obstacle) => obstacleDistance(p, obstacle) >= radius,
  );
}

/** Points just outside an obstacle, used as route corners and snap targets. */
function ringPoints(obstacle: RoomObstacle, clearance: number): Point[] {
  if (obstacle.shape === "ellipse") {
    const { center, rx, ry } = obstacle;
    return Array.from({ length: ELLIPSE_RING_SAMPLES }, (_, i) => {
      const angle = (i / ELLIPSE_RING_SAMPLES) * Math.PI * 2;
      return {
        x: center.x + (rx + clearance) * Math.cos(angle),
        y: center.y + (ry + clearance) * Math.sin(angle),
      };
    });
  }
  const { points } = obstacle;
  // Signed area decides which side of each edge is outside.
  let area = 0;
  points.forEach(([x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length];
    area += x * ny - nx * y;
  });
  const side = area > 0 ? 1 : -1;
  const normals = points.map(([x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length];
    const length = Math.hypot(nx - x, ny - y) || 1;
    return { x: (side * (ny - y)) / length, y: (-side * (nx - x)) / length };
  });
  const out: Point[] = [];
  points.forEach(([x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length];
    const before = normals[(i - 1 + points.length) % points.length];
    const after = normals[i];
    // Offset each corner along its bisector so the inflated outline keeps its corners.
    const bisectorX = before.x + after.x;
    const bisectorY = before.y + after.y;
    const bisectorLength = Math.hypot(bisectorX, bisectorY) || 1;
    const bisector = {
      x: bisectorX / bisectorLength,
      y: bisectorY / bisectorLength,
    };
    const cosine = Math.max(0.3, bisector.x * after.x + bisector.y * after.y);
    const scale = clearance / cosine;
    out.push({ x: x + bisector.x * scale, y: y + bisector.y * scale });
    out.push({
      x: (x + nx) / 2 + after.x * clearance,
      y: (y + ny) / 2 + after.y * clearance,
    });
  });
  return out;
}

/**
 * Nearest free point to `p`. A free `p` comes back unchanged. A point inside
 * an obstacle snaps to the nearest free point on that obstacle's edge.
 * Returns null only when the room has no free ring point at all.
 */
export function nearestFreePoint(
  p: Point,
  space: RoomSpace,
  radius: number,
): Point | null {
  if (isFreePoint(p, space, radius)) return p;
  let best: Point | null = null;
  let bestDistance = Infinity;
  for (const obstacle of space.obstacles) {
    for (const candidate of ringPoints(obstacle, radius + RING_CLEARANCE)) {
      const distance = Math.hypot(candidate.x - p.x, candidate.y - p.y);
      if (distance < bestDistance && isFreePoint(candidate, space, radius)) {
        best = candidate;
        bestDistance = distance;
      }
    }
  }
  return best;
}

function obstacleBlocksSegment(
  a: Point,
  b: Point,
  obstacle: RoomObstacle,
  radius: number,
): boolean {
  if (obstacle.shape === "ellipse") {
    // Map the inflated ellipse onto the unit circle and test the segment.
    const { center, rx, ry } = obstacle;
    const scaleX = rx + radius;
    const scaleY = ry + radius;
    const ax = (a.x - center.x) / scaleX;
    const ay = (a.y - center.y) / scaleY;
    const bx = (b.x - center.x) / scaleX;
    const by = (b.y - center.y) / scaleY;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const t =
      lengthSquared === 0
        ? 0
        : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
    return Math.hypot(ax + t * dx, ay + t * dy) < 1;
  }
  const { points } = obstacle;
  if (pointInPolygon(a, points) || pointInPolygon(b, points)) return true;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [ax2, ay2] = points[j];
    const [bx2, by2] = points[i];
    const c = { x: ax2, y: ay2 };
    const d = { x: bx2, y: by2 };
    if (segmentsCross(a, b, c, d)) return true;
    const gap = Math.min(
      distanceToSegment(a, c, d),
      distanceToSegment(b, c, d),
      distanceToSegment(c, a, b),
      distanceToSegment(d, a, b),
    );
    if (gap < radius) return true;
  }
  return false;
}

/** True when a body of `radius` can slide straight from `a` to `b`. */
export function isFreeSegment(
  a: Point,
  b: Point,
  space: RoomSpace,
  radius: number,
): boolean {
  if (!pointInPolygon(a, space.walkable) || !pointInPolygon(b, space.walkable))
    return false;
  return !space.obstacles.some((obstacle) =>
    obstacleBlocksSegment(a, b, obstacle, radius),
  );
}

/**
 * Waypoints from `start` to `goal` (goal included, start excluded). Returns
 * [] when already there, and null when the goal cannot be reached. A goal
 * inside an obstacle is first snapped to that obstacle's edge.
 */
export function findRoute(
  start: Point,
  goal: Point,
  space: RoomSpace,
  radius: number,
): Point[] | null {
  const from = nearestFreePoint(start, space, radius) ?? start;
  const to = nearestFreePoint(goal, space, radius);
  if (!to) return null;
  if (isFreeSegment(from, to, space, radius)) return [to];

  const nodes: Point[] = [from, to];
  for (const obstacle of space.obstacles) {
    for (const candidate of ringPoints(obstacle, radius + RING_CLEARANCE)) {
      if (isFreePoint(candidate, space, radius)) nodes.push(candidate);
    }
  }

  // Dijkstra over the visibility graph; edges are checked when first relaxed.
  const distances = nodes.map(() => Infinity);
  const previous = nodes.map(() => -1);
  const done = nodes.map(() => false);
  distances[0] = 0;
  for (;;) {
    let current = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (done[i] || distances[i] === Infinity) continue;
      if (current === -1 || distances[i] < distances[current]) current = i;
    }
    if (current === -1) return null;
    if (current === 1) break;
    done[current] = true;
    for (let i = 0; i < nodes.length; i++) {
      if (done[i]) continue;
      const step = Math.hypot(
        nodes[i].x - nodes[current].x,
        nodes[i].y - nodes[current].y,
      );
      const candidate = distances[current] + step;
      if (candidate >= distances[i]) continue;
      if (!isFreeSegment(nodes[current], nodes[i], space, radius)) continue;
      distances[i] = candidate;
      previous[i] = current;
    }
  }

  const corners: Point[] = [];
  for (let i = 1; i > 0; i = previous[i]) corners.unshift(nodes[i]);
  // String-pull: jump ahead to the furthest corner the body can already see.
  const route: Point[] = [];
  let anchor = from;
  let index = 0;
  while (index < corners.length) {
    let next = index;
    for (let j = corners.length - 1; j > index; j--) {
      if (isFreeSegment(anchor, corners[j], space, radius)) {
        next = j;
        break;
      }
    }
    anchor = corners[next];
    route.push(anchor);
    index = next + 1;
  }
  return route;
}

export type SlideResult = { point: Point; blocked: boolean };

/**
 * One keyboard step from `from` toward `to`. Slides along an obstacle when the
 * straight step is blocked: the axis-aligned moves and the furthest free point
 * on the segment are tried, and the best progress wins. `blocked` means the
 * body made no progress, which is when the avatar should bump.
 */
export function slideStep(
  from: Point,
  to: Point,
  space: RoomSpace,
  radius: number,
): SlideResult {
  if (isFreeSegment(from, to, space, radius))
    return { point: to, blocked: false };
  const candidates: Point[] = [
    { x: to.x, y: from.y },
    { x: from.x, y: to.y },
  ];
  let low = 0;
  let high = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) / 2;
    const probe = {
      x: from.x + (to.x - from.x) * mid,
      y: from.y + (to.y - from.y) * mid,
    };
    if (isFreeSegment(from, probe, space, radius)) low = mid;
    else high = mid;
  }
  candidates.push({
    x: from.x + (to.x - from.x) * low,
    y: from.y + (to.y - from.y) * low,
  });
  const intended = Math.hypot(to.x - from.x, to.y - from.y);
  if (intended === 0) return { point: from, blocked: false };
  const direction = {
    x: (to.x - from.x) / intended,
    y: (to.y - from.y) / intended,
  };
  let best = from;
  let bestProgress = 0;
  for (const candidate of candidates) {
    if (!isFreeSegment(from, candidate, space, radius)) continue;
    const progress =
      (candidate.x - from.x) * direction.x +
      (candidate.y - from.y) * direction.y;
    if (progress > bestProgress) {
      best = candidate;
      bestProgress = progress;
    }
  }
  return { point: best, blocked: bestProgress < intended * BUMP_FRACTION };
}
