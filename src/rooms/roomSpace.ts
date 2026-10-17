import type { PlaceId } from "../game.ts";
import type { Polygon, RoomSpace } from "../utils/obstacles.ts";
import type { RoomManifest } from "./types.ts";

/** Body radii in the space units used for collision. */
export const AVATAR_RADIUS = 26;
export const PET_RADIUS = 14;
/** Where the pet's body sits relative to the avatar's feet, in space units. */
export const PET_OFFSET = 88;
/** Percent-space rooms (no manifest) use percent units, so the sizes are small. */
const PERCENT_AVATAR_RADIUS = 3;
const PERCENT_PET_RADIUS = 1.5;
const PERCENT_PET_OFFSET = 6;
const PERCENT_WALKABLE: Polygon = [
  [12, 57],
  [88, 57],
  [88, 89],
  [12, 89],
];

export type RoomFrame = {
  space: RoomSpace;
  radius: number;
  /** Converts a stored position (percent of the room) into space units. */
  scale: { x: number; y: number };
  /** Size of the space, for debug overlays. */
  size: { width: number; height: number };
  /** CSS unit that places a space point inside the room's stage. */
  unit: "px" | "%";
  petRadius: number;
  petOffset: number;
};

/** Collision frame for a room. Positions are stored in percent for every room. */
export function roomFrameFor(
  place: PlaceId,
  manifest: RoomManifest | undefined,
): RoomFrame {
  if (manifest) {
    return {
      space: {
        walkable: manifest.walkablePolygon,
        obstacles: manifest.obstacles ?? [],
      },
      radius: AVATAR_RADIUS,
      scale: { x: manifest.stageWidth / 100, y: manifest.stageHeight / 100 },
      size: { width: manifest.stageWidth, height: manifest.stageHeight },
      unit: "px",
      petRadius: PET_RADIUS,
      petOffset: PET_OFFSET,
    };
  }
  return {
    space: {
      walkable: PERCENT_WALKABLE,
      obstacles: [],
    },
    radius: PERCENT_AVATAR_RADIUS,
    scale: { x: 1, y: 1 },
    size: { width: 100, height: 100 },
    unit: "%",
    petRadius: PERCENT_PET_RADIUS,
    petOffset: PERCENT_PET_OFFSET,
  };
}
