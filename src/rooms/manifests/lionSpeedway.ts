import type { RoomManifest } from "../types.ts";

export const lionSpeedwayManifest: RoomManifest = {
  id: "lion-speedway",
  name: "Lion Speedway",
  district: "speedway",
  stageWidth: 2400,
  stageHeight: 720,
  backgroundAsset: "lion-speedway-bg.png",
  walkablePolygon: [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "grandstand", y: 420, asset: "speedway-grandstand.png" },
    { id: "start-gantry", y: 520, asset: "speedway-gantry.png" },
    { id: "pit-garages", y: 520, asset: "speedway-pits.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 1220, y: 620 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Downtown Plaza",
    },
  ],
  interactives: [
    {
      id: "kart-race-gate",
      type: "game_launch",
      position: { x: 1180, y: 540 },
      actionData: {},
    },
    {
      id: "winner-podium",
      type: "secret_clickable",
      position: { x: 2110, y: 555 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "speedway-ambient",
};
