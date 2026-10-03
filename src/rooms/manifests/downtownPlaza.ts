import type { RoomManifest } from "../types.ts";

export const downtownPlazaManifest: RoomManifest = {
  id: "downtown-plaza",
  name: "Downtown Plaza",
  district: "downtown",
  stageWidth: 2400,
  stageHeight: 720,
  backgroundAsset: "downtown-plaza-bg.png",
  walkablePolygon: [
    [0, 560],
    [2400, 560],
    [2400, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "lamppost-1", y: 480, asset: "lamppost.png" },
    { id: "lamppost-2", y: 480, asset: "lamppost.png" },
    { id: "bistro-table-1", y: 600, asset: "bistro-table.png" },
    { id: "bistro-table-2", y: 600, asset: "bistro-table.png" },
  ],
  portals: [
    {
      targetRoomId: "le-shop",
      targetSpawn: { x: 100, y: 600 },
      triggerBounds: { x1: 40, y1: 520, x2: 220, y2: 650 },
      label: "Le Shop",
    },
    {
      targetRoomId: "canopy-cafe",
      targetSpawn: { x: 2300, y: 600 },
      triggerBounds: { x1: 2180, y1: 520, x2: 2360, y2: 650 },
      label: "Canopy Café",
    },
  ],
  interactives: [
    {
      id: "marble-lion-fountain",
      type: "secret_clickable",
      position: { x: 1200, y: 550 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "plaza-ambient",
};
