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
      label: "Grooming Spa",
      icon: "🛁",
      type: "secret_clickable",
      position: { x: 1200, y: 400 },
      actionData: {},
    },
    {
      id: "pet-pick-pet",
      label: "Pick your pet",
      icon: "🐾",
      type: "secret_clickable",
      position: { x: 640, y: 420 },
      actionData: {},
    },
    {
      id: "pet-animal-band",
      label: "Animal Orchestra",
      icon: "🎶",
      type: "game_launch",
      position: { x: 1700, y: 600 },
      actionData: { gameId: "animal-band" },
    },
    {
      id: "pet-yarn",
      label: "Roll the yarn ball",
      icon: "🧶",
      type: "activity",
      position: { x: 950, y: 540 },
      actionData: {},
      object: { kind: "yarn", width: 160, height: 150 },
      reaction: {
        message: "The yarn unrolls across the floor!",
        sound: "rustle",
      },
    },
    {
      id: "pet-treats",
      label: "Open the treat jar",
      icon: "🦴",
      type: "activity",
      position: { x: 1450, y: 520 },
      actionData: {},
      object: { kind: "treats", width: 130, height: 180 },
      reaction: {
        message: "Pop! A crunchy treat for a good pet.",
        sound: "bubble",
      },
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
