import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DanceFloor } from "../../src/components/DanceFloor";
import {
  CLUB_PULSE_DANCE_FLOOR_BOUNDS,
  clubPulseManifest,
} from "../../src/rooms/manifests/clubPulse";
import {
  FLOOR_COLUMNS,
  FLOOR_ROWS,
  type FloorPoint,
} from "../../src/utils/danceFloorRhythm";
import "../../src/styles.css";

const bounds = CLUB_PULSE_DANCE_FLOOR_BOUNDS;

/** Stage position at the centre of a tile, the way world movement would land. */
function tileCenter(column: number, row: number): FloorPoint {
  return {
    x: bounds.x + ((column + 0.5) * bounds.width) / FLOOR_COLUMNS,
    y: bounds.y + ((row + 0.5) * bounds.height) / FLOOR_ROWS,
  };
}

const STEPS: { label: string; column: number; row: number }[] = [
  { label: "top left", column: 0, row: 0 },
  { label: "bottom right", column: FLOOR_COLUMNS - 1, row: FLOOR_ROWS - 1 },
  { label: "middle", column: 3, row: 2 },
];

function Fixture() {
  const [avatar, setAvatar] = useState<FloorPoint | null>(null);
  const [tiles, setTiles] = useState<number[]>([]);
  return (
    <main>
      <h1>Bounded dance floor</h1>
      {STEPS.map((step) => (
        <button
          key={step.label}
          onClick={() => setAvatar(tileCenter(step.column, step.row))}
        >
          Step to {step.label}
        </button>
      ))}
      <output aria-label="Lit tiles">{JSON.stringify(tiles)}</output>
      {/*
        Mirrors the Task 7 mounting contract: a positioned container in stage
        units, with the bounded floor placing itself from its own bounds.
      */}
      <div
        data-testid="stage"
        style={{
          position: "relative",
          width: `${clubPulseManifest.stageWidth}px`,
          height: `${clubPulseManifest.stageHeight}px`,
          background: "#0d0a18",
        }}
      >
        <DanceFloor
          muted
          floorBounds={bounds}
          avatarPosition={avatar}
          onTileLight={(tile) => setTiles((items) => [...items, tile])}
        />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
