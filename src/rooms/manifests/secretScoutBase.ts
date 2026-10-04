import type { RoomManifest } from "../types.ts";

export const secretScoutBaseManifest: RoomManifest = {
  id: "secret-scout-base",
  name: "The Pride HQ - Secret Scout Command Center",
  district: "underground",
  stageWidth: 1920,
  stageHeight: 720,
  backgroundAsset: "secret-scout-base-bg.png",
  walkablePolygon: [
    [0, 540],
    [1920, 540],
    [1920, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "server-racks", y: 500, asset: "server-rack-bank.png" },
    { id: "holo-map-table", y: 560, asset: "holo-map-table.png" },
    { id: "surveillance-wall", y: 480, asset: "surveillance-screen-wall.png" },
    { id: "tunnel-hatch", y: 580, asset: "secret-tunnel-hatch.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 250, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 120, y2: 650 },
      label: "Secret Tunnel to Downtown Plaza",
    },
  ],
  interactives: [
    {
      id: "spy-terminal",
      type: "game_launch",
      position: { x: 960, y: 520 },
      actionData: { game: "spy-terminal" },
    },
    {
      id: "surveillance-holo-map",
      type: "secret_clickable",
      position: { x: 1500, y: 500 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "spy-hq-ambient",
};
