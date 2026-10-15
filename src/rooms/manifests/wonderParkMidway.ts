import type { RoomManifest } from "../types.ts";

export const wonderParkMidwayManifest: RoomManifest = {
  id: "wonder-park-midway",
  name: "Carnival Midway",
  district: "wonder-park",
  stageWidth: 2800,
  stageHeight: 720,
  backgroundAsset: "wonder-park-midway-bg.png",
  walkablePolygon: [
    [0, 540],
    [2800, 540],
    [2800, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "carousel-canopy", y: 480, asset: "carousel-canopy.png" },
    { id: "teacup-platform", y: 560, asset: "teacup-platform.png" },
    { id: "game-stall-1", y: 580, asset: "midway-game-stall.png" },
    { id: "game-stall-2", y: 580, asset: "midway-game-stall.png" },
    { id: "midway-lantern-1", y: 460, asset: "midway-lantern.png" },
    { id: "midway-lantern-2", y: 460, asset: "midway-lantern.png" },
  ],
  portals: [
    {
      targetRoomId: "wonder-park-entrance",
      targetSpawn: { x: 2650, y: 600 },
      triggerBounds: { x1: 2680, y1: 520, x2: 2800, y2: 650 },
      label: "Wonder Park Entrance",
    },
  ],
  interactives: [
    {
      id: "spinning-mango-teacups",
      type: "ride",
      position: { x: 700, y: 600 },
      actionData: { rideId: "mango-teacups" },
    },
    {
      id: "grand-golden-carousel",
      type: "ride",
      position: { x: 1500, y: 560 },
      actionData: { rideId: "golden-carousel" },
    },
    {
      id: "lion-leap-tower",
      type: "ride",
      position: { x: 2500, y: 600 },
      actionData: { rideId: "lion-leap-tower" },
    },
    {
      id: "midway-game-booth",
      type: "game_launch",
      position: { x: 2200, y: 610 },
      actionData: { gameId: "fruit" },
    },
  ],
  obstacles: [
    {
      id: "teacup-platform",
      shape: "ellipse",
      center: { x: 700, y: 570 },
      rx: 250,
      ry: 28,
    },
    {
      id: "carousel-platform",
      shape: "ellipse",
      center: { x: 1500, y: 555 },
      rx: 250,
      ry: 15,
    },
    {
      id: "popcorn-cart",
      shape: "polygon",
      points: [
        [1080, 544],
        [1160, 544],
        [1160, 562],
        [1080, 562],
      ],
    },
    {
      id: "game-booth",
      shape: "polygon",
      points: [
        [2064, 548],
        [2336, 548],
        [2336, 566],
        [2064, 566],
      ],
    },
    {
      id: "lion-tower-base",
      shape: "polygon",
      points: [
        [2414, 544],
        [2586, 544],
        [2586, 562],
        [2414, 562],
      ],
    },
    {
      id: "lamp-1",
      shape: "ellipse",
      center: { x: 220, y: 548 },
      rx: 12,
      ry: 7,
      prop: "lamp",
    },
    {
      id: "lamp-2",
      shape: "ellipse",
      center: { x: 1850, y: 548 },
      rx: 12,
      ry: 7,
      prop: "lamp",
    },
  ],
  ambientAudioPreset: "carnival-midway",
};
