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
