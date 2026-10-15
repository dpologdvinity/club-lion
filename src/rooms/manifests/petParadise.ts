import type { RoomManifest } from "../types.ts";

export const petParadiseManifest: RoomManifest = {
  id: "pet-paradise",
  name: "Pet Paradise Nursery",
  district: "uptown",
  stageWidth: 2400,
  stageHeight: 720,
  backgroundAsset: "pet-paradise-bg.png",
  walkablePolygon: [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "tub-row", y: 450, asset: "clawfoot-tub-bank.png" },
    { id: "cushion-nest", y: 520, asset: "velvet-cushion-nest.png" },
    { id: "agility-tunnel", y: 500, asset: "agility-tunnel.png" },
    { id: "paw-chandelier", y: 300, asset: "paw-print-chandelier.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 780, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Downtown Plaza",
    },
  ],
  interactives: [
    {
      id: "pet-grooming-station",
      type: "secret_clickable",
      position: { x: 1200, y: 400 },
      actionData: {},
    },
    {
      id: "pet-animal-band",
      type: "game_launch",
      position: { x: 1700, y: 600 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "pet-spa-ambient",
  obstacles: [
    // Velvet cushion nest (x 528..752) sits on the floor at y ~568.
    {
      id: "cushion-nest",
      shape: "polygon",
      points: [
        [536, 546],
        [744, 546],
        [752, 556],
        [744, 566],
        [536, 566],
        [528, 556],
      ],
    },
  ],
};
