import type { RoomManifest } from "../types.ts";

export const mtMistBasecampManifest: RoomManifest = {
  id: "mt-mist",
  name: "Mt. Mist Alpine Basecamp",
  district: "canyon",
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
      targetSpawn: { x: 370, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Downtown Plaza",
    },
  ],
  interactives: [
    {
      id: "sled-run-gate",
      type: "activity",
      position: { x: 1800, y: 530 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "alpine-wind",
};
