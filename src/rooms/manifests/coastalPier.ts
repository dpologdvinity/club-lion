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
  obstacles: [
    {
      id: "lighthouse",
      shape: "polygon",
      points: [[1845, 542], [2055, 542], [2055, 556], [1845, 556]],
    },
    {
      id: "deck-bench",
      shape: "polygon",
      points: [[640, 542], [880, 542], [880, 552], [640, 552]],
      prop: "bench",
      seat: { x: 760, y: 550 },
    },
    {
      id: "fishing-crate",
      shape: "polygon",
      points: [[1112, 542], [1178, 542], [1178, 552], [1112, 552]],
    },
    { id: "bollard-1", shape: "ellipse", center: { x: 560, y: 600 }, rx: 20, ry: 7 },
    { id: "bollard-2", shape: "ellipse", center: { x: 1480, y: 600 }, rx: 20, ry: 7 },
    { id: "bollard-3", shape: "ellipse", center: { x: 2280, y: 600 }, rx: 20, ry: 7 },
  ],
};
