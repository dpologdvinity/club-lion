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
  interactives: [
    {
      id: "condo-furniture-editor",
      label: "Customize Furniture Grid",
      icon: "🛋️",
      type: "game_launch",
      position: { x: 1200, y: 350 },
      actionData: { action: "edit_furniture" },
    },
    {
      id: "condo-jukebox",
      label: "Grand Jukebox",
      icon: "🎵",
      type: "secret_clickable",
      position: { x: 800, y: 350 },
      actionData: { action: "open_jukebox" },
    },
  ],
  obstacles: [
    {
      id: "jukebox",
      shape: "polygon",
      points: [
        [746, 452],
        [854, 452],
        [854, 484],
        [746, 484],
      ],
    },
    {
      id: "sofa",
      shape: "polygon",
      points: [
        [1434, 520],
        [1726, 520],
        [1726, 562],
        [1434, 562],
      ],
    },
    {
      id: "floor-lamp",
      shape: "ellipse",
      center: { x: 420, y: 562 },
      rx: 14,
      ry: 7,
      prop: "lamp",
    },
    {
      id: "plant-pot",
      shape: "ellipse",
      center: { x: 1830, y: 574 },
      rx: 24,
      ry: 6,
      prop: "bush",
    },
  ],
  ambientAudioPreset: "penthouse-lofi-chill",
};
