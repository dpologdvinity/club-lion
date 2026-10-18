import type { RoomManifest } from "../types.ts";
import { FANTAGE_GAMES } from "../../games/fantage.ts";

const FIRST_CABINET_X = 520;
const CABINET_GAP = 215;

/** Wide enough for one cabinet per Game Hall game, never under 2400. */
export const GAME_HALL_WIDTH = Math.max(
  2400,
  FIRST_CABINET_X + FANTAGE_GAMES.length * CABINET_GAP + 300,
);

/** The Game Hall off the arcade: a cabinet for every Fantage-style mini-game. */
export const gameHallManifest: RoomManifest = {
  id: "game-hall",
  name: "Game Hall",
  district: "savanna",
  stageWidth: GAME_HALL_WIDTH,
  stageHeight: 720,
  backgroundAsset: "",
  walkablePolygon: [
    [0, 535],
    [GAME_HALL_WIDTH, 535],
    [GAME_HALL_WIDTH, 720],
    [0, 720],
  ],
  depthLayers: [],
  portals: [
    {
      targetRoomId: "arcade",
      targetSpawn: { x: 5780, y: 640 },
      triggerBounds: { x1: 0, y1: 565, x2: 90, y2: 700 },
      label: "The arcade",
    },
  ],
  // Beside the stage-centre arrival so a friend is in the first view.
  neighbors: [{ id: "cleo", x: 330, y: 655 }],
  interactives: [
    {
      id: "hall-door-arcade",
      label: "Back to the arcade",
      icon: "🕹️",
      type: "activity",
      position: { x: 170, y: 560 },
      actionData: { travel: "arcade" },
      object: { kind: "door", width: 110, height: 120 },
      reaction: { message: "The arcade!", sound: "chime" },
    },
    ...FANTAGE_GAMES.map((game, i) => ({
      id: `hall-${game.id}`,
      label: game.name,
      icon: game.icon,
      type: "game_launch" as const,
      position: { x: FIRST_CABINET_X + i * CABINET_GAP, y: 520 },
      actionData: { gameId: game.id },
      object: { kind: "cabinet" as const, width: 185, height: 290 },
    })),
  ],
  ambientAudioPreset: "arcade",
};
