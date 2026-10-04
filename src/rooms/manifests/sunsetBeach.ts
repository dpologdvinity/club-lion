import type { RoomManifest } from "../types.ts";

export const sunsetBeachManifest: RoomManifest = {
  id: "sunset-beach",
  name: "Sunset Beach",
  district: "sunset_beach",
  stageWidth: 2400,
  stageHeight: 720,
  backgroundAsset: "",
  walkablePolygon: [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ],
  depthLayers: [],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 300, y: 620 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Downtown Plaza",
    },
    {
      targetRoomId: "coastal-pier",
      targetSpawn: { x: 280, y: 620 },
      triggerBounds: { x1: 2260, y1: 520, x2: 2400, y2: 660 },
      label: "Coastal Pier & Boardwalk",
    },
  ],
  interactives: [],
  ambientAudioPreset: "ocean-surf",
};
