export function computeCameraOffset(
  avatarX: number,
  stageWidth: number,
  viewportWidth: number,
): number {
  if (stageWidth <= viewportWidth) return 0;
  const targetOffset = avatarX - viewportWidth / 2;
  return Math.max(
    0,
    Math.min(stageWidth - viewportWidth, Math.round(targetOffset)),
  );
}

export type StagePoint = { x: number; y: number };

/** The ground is viewport-sized: its origin is never camera-translated. */
export function pointerToStage(
  clientX: number,
  clientY: number,
  viewport: { left: number; top: number },
  cameraOffset: number,
  scale: number,
): StagePoint {
  return {
    x: (clientX - viewport.left) / scale + cameraOffset,
    y: (clientY - viewport.top) / scale,
  };
}

/** Keep foot positions inside the room, projecting outside clicks to its edge. */
export function clampToWalkable(
  point: StagePoint,
  polygon: [number, number][],
): StagePoint {
  let inside = false;
  let nearest = point;
  let nearestDistance = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j];
    const [bx, by] = polygon[i];
    if (
      ay > point.y !== by > point.y &&
      point.x < ((bx - ax) * (point.y - ay)) / (by - ay) + ax
    )
      inside = !inside;
    const length = (bx - ax) ** 2 + (by - ay) ** 2;
    const t =
      length === 0
        ? 0
        : Math.max(
            0,
            Math.min(
              1,
              ((point.x - ax) * (bx - ax) + (point.y - ay) * (by - ay)) /
                length,
            ),
          );
    const candidate = { x: ax + t * (bx - ax), y: ay + t * (by - ay) };
    const distance =
      (candidate.x - point.x) ** 2 + (candidate.y - point.y) ** 2;
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }
  return inside ? point : nearest;
}
