import type { RoomManifest } from "../types.ts";

export const lionAquariumManifest: RoomManifest = {
  id: "lion-aquarium",
  name: "Lion Aquarium",
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
      targetRoomId: "coastal-pier",
      targetSpawn: { x: 2120, y: 620 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Coastal Pier & Boardwalk",
    },
  ],
  interactives: [
    {
      id: "aquarium-feed-fish",
      type: "secret_clickable",
      position: { x: 760, y: 560 },
      actionData: {},
    },
    {
      id: "aquarium-touch-pool",
      type: "secret_clickable",
      position: { x: 1560, y: 560 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "aquarium-bubbles",
};
