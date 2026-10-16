import type { PropSound } from "../utils/interactiveProps.ts";
import type { GameId } from "../games/catalog.ts";

export type RoomPortal = {
  targetRoomId: string;
  targetSpawn: { x: number; y: number };
  triggerBounds: { x1: number; y1: number; x2: number; y2: number };
  label: string;
};

export type DepthLayer = {
  id: string;
  y: number;
  asset: string;
};

/** Small tappable or sit-able scenery that sits on a solid obstacle. */
export type ObstacleProp = "fountain" | "bench" | "lamp" | "bush";

type RoomObstacleBase = {
  id: string;
  /** Interactive prop drawn on top of this obstacle (see `WorldProp`). */
  prop?: ObstacleProp;
  /** Bench sit spot in stage units; walking onto it makes the avatar sit. */
  seat?: { x: number; y: number };
};

/** Solid scenery the avatar and pet cannot walk through, in stage units. */
export type RoomObstacle = RoomObstacleBase &
  (
    | {
        shape: "ellipse";
        center: { x: number; y: number };
        rx: number;
        ry: number;
      }
    | { shape: "polygon"; points: [number, number][] }
  );

/** Illustrated objects share the manifest action path with room navigation. */
export type RoomObjectKind =
  | "splash"
  | "lily"
  | "chimes"
  | "blender"
  | "tea"
  | "oven"
  | "bubbles"
  | "cake"
  | "cabinet"
  | "prizes"
  | "disco"
  | "fireplace"
  | "lamp"
  | "books"
  | "plant"
  | "cushion"
  | "sandcastle"
  | "shell"
  | "beachball"
  | "jellyfish"
  | "treasure"
  | "snowman"
  | "snowglobe";

export type RoomManifest = {
  id: string;
  name: string;
  district: string;
  stageWidth: number;
  stageHeight: number;
  backgroundAsset: string;
  walkablePolygon: [number, number][];
  depthLayers: DepthLayer[];
  portals: RoomPortal[];
  neighbors?: { id: string; x: number; y: number }[];
  interactives: {
    id: string;
    label?: string;
    icon?: string;
    type:
      | "activity"
      | "ride"
      | "instrument"
      | "game_launch"
      | "secret_clickable"
      | "shop";
    position: { x: number; y: number };
    object?: { kind: RoomObjectKind; width: number; height: number };
    reaction?: { message: string; sound: PropSound };
    requiresDecor?: "plant" | "cushion";
    actionData: Record<string, unknown> & {
      gameId?: GameId;
      roomAction?: "games" | "shop" | "leaderboard";
    };
  }[];
  ambientAudioPreset: string;
  /** Solid scenery. Optional so rooms without collisions stay valid. */
  obstacles?: RoomObstacle[];
};
