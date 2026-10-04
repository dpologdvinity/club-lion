import type { RoomManifest } from "../types.ts";

export const penthouseCondoManifest: RoomManifest = {
  id: "penthouse-condo",
  name: "Luxury Penthouse Condo",
  district: "uptown",
  stageWidth: 1920,
  stageHeight: 720,
  backgroundAsset: "penthouse-condo-bg.png",
  walkablePolygon: [
    [0, 0],
    [1920, 0],
    [1920, 720],
    [0, 720],
  ],
  depthLayers: [],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 1200, y: 600 },
      triggerBounds: { x1: 0, y1: 0, x2: 160, y2: 160 },
      label: "Downtown Plaza",
    },
  ],
  interactives: [],
  ambientAudioPreset: "penthouse-lofi-chill",
};
