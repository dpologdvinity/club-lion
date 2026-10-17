import type { PropSound } from "../utils/interactiveProps.ts";
import type { GameId } from "../games/catalog.ts";
import type { PlaceId } from "../game.ts";

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
  | "snowglobe"
  | "campfire"
  | "alphorn"
  | "yarn"
  | "treats"
  | "popcorn"
  | "balloons"
  | "fishing"
  | "seagull"
  | "flag"
  | "duck"
  | "sprinkler"
  | "periscope"
  | "kayak"
  | "fountain"
  | "tree"
  | "bush"
  | "lanterns"
  | "bunting"
  | "sandbox"
  | "swing"
  | "door"
  | "flower"
  | "ricecooker"
  | "pot"
  | "lechon"
  | "halohalo"
  | "fan"
  | "shelf"
  | "jeepney"
  | "karaoke"
  | "digspot"
  | "volcano"
  | "dinoegg"
  | "sifter";

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
    /** `steps` (default 2, on/off) is how many looks a tap cycles through. */
    object?: {
      kind: RoomObjectKind;
      width: number;
      height: number;
      steps?: number;
      /** false hides the visible caption; the button keeps its accessible name. */
      caption?: false;
    };
    /** `messages` gives one read-aloud line per step; `message` covers the rest. */
    reaction?: { message: string; messages?: string[]; sound: PropSound };
    requiresDecor?: "plant" | "cushion";
    actionData: Record<string, unknown> & {
      gameId?: GameId;
      roomAction?: "games" | "shop" | "leaderboard";
      /** A picture door: travel here after the reaction. */
      travel?: PlaceId;
      /** A music toy: tapping plays this marimba note (0–7). */
      note?: number;
      /** Notes hummed when a tap reaches `step`. */
      tune?: { step: number; notes: number[] };
      /** A dig spot: digging every one in the room earns the Fossil Finder stamp. */
      fossil?: true;
    };
  }[];
  ambientAudioPreset: string;
  /** Toys and snacks a child can pick up, carry anywhere and give to a neighbor. */
  props?: {
    id: string;
    emoji: string;
    label: string;
    x: number;
    y: number;
    food?: true;
  }[];
  /** Extra room-wide play layer: the square's weather toy and butterfly hunt. */
  fun?: "square";
  /** Solid scenery. Optional so rooms without collisions stay valid. */
  obstacles?: RoomObstacle[];
};
