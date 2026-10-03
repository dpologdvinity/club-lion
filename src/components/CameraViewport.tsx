import { useEffect, useRef, useState } from "react";
import type { RoomManifest } from "../rooms/types.ts";
import { computeCameraOffset } from "../rooms/camera.ts";

export function CameraViewport({
  manifest,
  avatarPos,
  avatarHeading,
  children,
  onWalk,
  onPortal,
}: {
  manifest: RoomManifest;
  avatarPos: { x: number; y: number };
  avatarHeading: "left" | "right";
  children: React.ReactNode;
  onWalk: (x: number, y: number) => void;
  onPortal?: (targetRoomId: string, spawn: { x: number; y: number }) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setViewportWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onPortal) return;
    for (const portal of manifest.portals) {
      const { x1, y1, x2, y2 } = portal.triggerBounds;
      if (
        avatarPos.x >= x1 &&
        avatarPos.x <= x2 &&
        avatarPos.y >= y1 &&
        avatarPos.y <= y2
      ) {
        onPortal(portal.targetRoomId, portal.targetSpawn);
        return;
      }
    }
  }, [avatarPos, manifest.portals, onPortal]);

  const cameraOffset = computeCameraOffset(
    avatarPos.x,
    manifest.stageWidth,
    viewportWidth,
  );

  return (
    <div
      ref={viewportRef}
      className="camera-viewport"
      data-room-id={manifest.id}
    >
      <button
        type="button"
        className="camera-viewport-ground"
        aria-label={`Walk around ${manifest.name}. Click or tap to move.`}
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          onWalk(e.clientX - box.left + cameraOffset, e.clientY - box.top);
        }}
        style={{
          width: manifest.stageWidth,
          height: manifest.stageHeight,
          transform: `translateX(${-cameraOffset}px)`,
        }}
      />
      <div
        className="camera-viewport-stage"
        data-avatar-heading={avatarHeading}
        style={{
          width: manifest.stageWidth,
          height: manifest.stageHeight,
          transform: `translateX(${-cameraOffset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
