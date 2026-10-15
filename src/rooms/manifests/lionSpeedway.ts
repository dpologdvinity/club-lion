import type { RoomManifest } from "../types.ts";

export const lionSpeedwayManifest: RoomManifest = {
  id: "lion-speedway",
  name: "Lion Speedway",
  district: "speedway",
  stageWidth: 2400,
  stageHeight: 720,
  backgroundAsset: "lion-speedway-bg.png",
  walkablePolygon: [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "grandstand", y: 420, asset: "speedway-grandstand.png" },
    { id: "start-gantry", y: 520, asset: "speedway-gantry.png" },
    { id: "pit-garages", y: 520, asset: "speedway-pits.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 1220, y: 620 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Downtown Plaza",
    },
  ],
  interactives: [
    {
      id: "kart-race-gate",
      type: "game_launch",
      position: { x: 1180, y: 540 },
      actionData: {},
    },
    {
      id: "winner-podium",
      type: "secret_clickable",
      position: { x: 2110, y: 555 },
      actionData: {},
    },
  ],
  obstacles: [
    {
      id: "tire-stack-1",
      shape: "ellipse",
      center: { x: 420, y: 546 },
      rx: 22,
      ry: 5,
    },
    {
      id: "tire-stack-2",
      shape: "ellipse",
      center: { x: 690, y: 546 },
      rx: 22,
      ry: 5,
    },
    {
      id: "tire-stack-3",
      shape: "ellipse",
      center: { x: 940, y: 546 },
      rx: 22,
      ry: 5,
    },
    {
      id: "tire-stack-4",
      shape: "ellipse",
      center: { x: 1460, y: 546 },
      rx: 22,
      ry: 5,
    },
    {
      id: "tire-stack-5",
      shape: "ellipse",
      center: { x: 1720, y: 546 },
      rx: 22,
      ry: 5,
    },
    {
      id: "tire-stack-6",
      shape: "ellipse",
      center: { x: 2280, y: 546 },
      rx: 22,
      ry: 5,
    },
    {
      id: "cone-1",
      shape: "ellipse",
      center: { x: 1000, y: 600 },
      rx: 16,
      ry: 6,
    },
    {
      id: "cone-2",
      shape: "ellipse",
      center: { x: 1370, y: 600 },
      rx: 16,
      ry: 6,
    },
    {
      id: "cone-3",
      shape: "ellipse",
      center: { x: 2240, y: 600 },
      rx: 16,
      ry: 6,
    },
    {
      id: "mango-crate",
      shape: "polygon",
      points: [
        [1264, 584],
        [1336, 584],
        [1336, 594],
        [1264, 594],
      ],
    },
    {
      id: "kart-blue",
      shape: "polygon",
      points: [
        [1478, 566],
        [1582, 566],
        [1582, 578],
        [1478, 578],
      ],
    },
    {
      id: "kart-pink",
      shape: "polygon",
      points: [
        [1758, 566],
        [1862, 566],
        [1862, 578],
        [1758, 578],
      ],
    },
    {
      id: "winner-podium",
      shape: "polygon",
      points: [
        [1885, 552],
        [2155, 552],
        [2155, 576],
        [1885, 576],
      ],
    },
  ],
  ambientAudioPreset: "speedway-ambient",
};
