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
  interactives: [
    {
      id: "beach-seek-lookout",
      type: "game_launch",
      position: { x: 760, y: 560 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "ocean-surf",
  obstacles: [
    { id: "palm-2", shape: "ellipse", center: { x: 430, y: 548 }, rx: 10, ry: 5 },
    { id: "palm-3", shape: "ellipse", center: { x: 2050, y: 552 }, rx: 10, ry: 5 },
    { id: "downtown-sign-post", shape: "ellipse", center: { x: 190, y: 560 }, rx: 6, ry: 4 },
    { id: "tiki-torch-1", shape: "ellipse", center: { x: 600, y: 560 }, rx: 8, ry: 4, prop: "lamp" },
    { id: "tiki-torch-2", shape: "ellipse", center: { x: 1070, y: 560 }, rx: 8, ry: 4, prop: "lamp" },
    { id: "tiki-bar-post-1", shape: "ellipse", center: { x: 650, y: 560 }, rx: 8, ry: 4 },
    { id: "tiki-bar-post-2", shape: "ellipse", center: { x: 770, y: 560 }, rx: 8, ry: 4 },
    { id: "tiki-bar-post-3", shape: "ellipse", center: { x: 900, y: 560 }, rx: 8, ry: 4 },
    { id: "tiki-bar-post-4", shape: "ellipse", center: { x: 1020, y: 560 }, rx: 8, ry: 4 },
    {
      id: "surfboard-rack",
      shape: "polygon",
      points: [[1104, 556], [1216, 556], [1216, 564], [1104, 564]],
    },
    {
      id: "lounger-1",
      shape: "polygon",
      points: [[1268, 590], [1412, 590], [1412, 618], [1268, 618]],
    },
    {
      id: "lounger-2",
      shape: "polygon",
      points: [[1546, 582], [1674, 582], [1674, 606], [1546, 606]],
    },
    { id: "lifeguard-leg-w", shape: "ellipse", center: { x: 1830, y: 560 }, rx: 8, ry: 4 },
    { id: "lifeguard-leg-e", shape: "ellipse", center: { x: 1970, y: 560 }, rx: 8, ry: 4 },
    {
      id: "sandcastle",
      shape: "polygon",
      points: [[1122, 650], [1238, 650], [1238, 670], [1122, 670]],
    },
  ],
};
