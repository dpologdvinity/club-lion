import type { RoomManifest } from "../types.ts";

export const snowflakeRinkManifest: RoomManifest = {
  id: "snowflake-rink",
  name: "Snowflake Rink",
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
      targetRoomId: "mt-mist",
      targetSpawn: { x: 2120, y: 620 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Mt. Mist Alpine Basecamp",
    },
  ],
  interactives: [
    {
      id: "rink-skate",
      type: "activity",
      position: { x: 1280, y: 560 },
      actionData: {},
    },
    {
      id: "rink-hot-cocoa",
      type: "secret_clickable",
      position: { x: 640, y: 560 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "rink-ambient",
};
