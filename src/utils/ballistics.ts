export type Point = { x: number; y: number };

export function computeArcTrajectory(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  t: number,
  arcHeight: number = 80,
): Point {
  const x = startX + (targetX - startX) * t;
  const linearY = startY + (targetY - startY) * t;
  return { x, y: linearY - 4 * arcHeight * t * (1 - t) };
}
