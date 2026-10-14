import { Component, type ReactNode } from "react";
import type { PlaceId } from "../game.ts";
import { RoomScenery } from "./RoomScenery.tsx";

type BoundaryProps = { children: ReactNode };
type BoundaryState = { failed: boolean };

// Scenery is decorative: if a drawing throws, drop it and keep the game running.
class SceneryErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

export function SafeRoomScenery({
  place,
  preview = false,
}: {
  place: PlaceId;
  preview?: boolean;
}) {
  // Keyed by place so a failed room does not hide the next room's scenery.
  return (
    <SceneryErrorBoundary key={place}>
      <RoomScenery place={place} preview={preview} />
    </SceneryErrorBoundary>
  );
}
