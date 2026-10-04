import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RoomManifest } from "../rooms/types.ts";
import { computeCameraOffset, pointerToStage } from "../rooms/camera.ts";

export function CameraViewport({
  manifest,
  avatarPos,
  avatarHeading,
  children,
  onWalk,
  onPortal,
  movementMultiplier = 1,
}: {
  manifest: RoomManifest;
  movementMultiplier?: number;
  avatarPos: { x: number; y: number };
  avatarHeading: "left" | "right";
  children: ReactNode;
  onWalk: (x: number, y: number) => void;
  onPortal?: (targetRoomId: string, spawn: { x: number; y: number }) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 360 });
  const lastPortal = useRef<string | null>(null);
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setViewport({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const portal = manifest.portals.find(
      ({ triggerBounds: b }) =>
        avatarPos.x >= b.x1 &&
        avatarPos.x <= b.x2 &&
        avatarPos.y >= b.y1 &&
        avatarPos.y <= b.y2,
    );
    if (!portal) {
      lastPortal.current = null;
      return;
    }
    if (lastPortal.current === portal.targetRoomId) return;
    lastPortal.current = portal.targetRoomId;
    onPortal?.(portal.targetRoomId, portal.targetSpawn);
  }, [avatarPos.x, avatarPos.y, manifest, onPortal]);
  const scale = viewport.height / manifest.stageHeight;
  const cameraOffset = computeCameraOffset(
    avatarPos.x,
    manifest.stageWidth,
    viewport.width / scale,
  );
  return (
    <div
      ref={viewportRef}
      className="camera-viewport"
      data-room-id={manifest.id}
      data-camera-offset={cameraOffset}
    >
      <button
        type="button"
        className="world-ground camera-viewport-ground"
        aria-label={`Walk around ${manifest.name}. Use arrow keys or click the ground.`}
        onClick={(event) => {
          // Keyboard activation has no ground coordinates; arrows own walking.
          if (event.detail === 0) return;
          const box = event.currentTarget.getBoundingClientRect();
          const point = pointerToStage(
            event.clientX,
            event.clientY,
            box,
            cameraOffset,
            scale,
          );
          onWalk(point.x, point.y);
        }}
        onKeyDown={(event) => {
          const keys: Record<string, [number, number]> = {
            ArrowLeft: [-45, 0],
            ArrowRight: [45, 0],
            ArrowUp: [0, -32],
            ArrowDown: [0, 32],
            a: [-45, 0],
            d: [45, 0],
            w: [0, -32],
            s: [0, 32],
          };
          const delta = keys[event.key];
          if (delta) {
            event.preventDefault();
            onWalk(
              avatarPos.x + delta[0] * movementMultiplier,
              avatarPos.y + delta[1] * movementMultiplier,
            );
          }
        }}
      />
      <div
        className="camera-viewport-stage"
        data-avatar-heading={avatarHeading}
        style={{
          width: manifest.stageWidth,
          height: manifest.stageHeight,
          transform: `translateX(${-cameraOffset * scale}px) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
