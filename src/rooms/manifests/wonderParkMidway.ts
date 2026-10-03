import type { RoomManifest } from "../types.ts";

export const wonderParkMidwayManifest: RoomManifest = {
  id: "wonder-park-midway",
  name: "Carnival Midway",
  district: "wonder-park",
  stageWidth: 2800,
  stageHeight: 720,
  backgroundAsset: "wonder-park-midway-bg.png",
  walkablePolygon: [
    [0, 540],
    [2800, 540],
    [2800, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "carousel-canopy", y: 480, asset: "carousel-canopy.png" },
    { id: "teacup-platform", y: 560, asset: "teacup-platform.png" },
    { id: "game-stall-1", y: 580, asset: "midway-game-stall.png" },
    { id: "game-stall-2", y: 580, asset: "midway-game-stall.png" },
    { id: "midway-lantern-1", y: 460, asset: "midway-lantern.png" },
    { id: "midway-lantern-2", y: 460, asset: "midway-lantern.png" },
  ],
  portals: [
    {
      targetRoomId: "wonder-park-entrance",
      targetSpawn: { x: 2650, y: 600 },
      triggerBounds: { x1: 2680, y1: 520, x2: 2800, y2: 650 },
      label: "Wonder Park Entrance",
    },
  ],
  interactives: [
    {
      id: "spinning-mango-teacups",
      type: "ride",
      position: { x: 700, y: 600 },
      actionData: { rideId: "mango-teacups" },
    },
    {
      id: "grand-golden-carousel",
      type: "ride",
      position: { x: 1500, y: 560 },
      actionData: { rideId: "golden-carousel" },
    },
    {
      id: "midway-game-booth",
      type: "game_launch",
      position: { x: 2200, y: 610 },
      actionData: { gameId: "midway-toss" },
    },
  ],
  ambientAudioPreset: "carnival-midway",
};
