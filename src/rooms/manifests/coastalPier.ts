import type { RoomManifest } from "../types.ts";

export const coastalPierManifest: RoomManifest = {
  id: "coastal-pier",
  name: "Coastal Pier & Boardwalk",
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
      targetRoomId: "sunset-beach",
      targetSpawn: { x: 2120, y: 620 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Sunset Beach",
    },
  ],
  interactives: [
    {
      id: "lighthouse-foghorn",
      type: "instrument",
      position: { x: 1950, y: 520 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "ocean-surf",
};
