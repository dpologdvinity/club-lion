import type { RoomManifest } from "../types.ts";

export const canyonRapidsManifest: RoomManifest = {
  id: "canyon-rapids",
  name: "Canyon Rapids",
  district: "canyon",
  stageWidth: 2400,
  stageHeight: 720,
  backgroundAsset: "canyon-rapids-bg.png",
  walkablePolygon: [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "canyon-wall-far", y: 460, asset: "canyon-wall-far.png" },
    { id: "rope-bridge", y: 500, asset: "rope-suspension-bridge.png" },
    { id: "pine-grove", y: 520, asset: "canyon-pine-grove.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 850, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Downtown Plaza",
    },
  ],
  interactives: [
    {
      id: "river-surf-dock",
      type: "activity",
      position: { x: 1750, y: 530 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "canyon-rapids-ambient",
};
