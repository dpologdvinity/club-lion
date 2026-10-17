import type { RoomManifest } from "../types.ts";

export const canopyCafeManifest: RoomManifest = {
  id: "cafe",
  name: "Canopy café",
  district: "savanna",
  stageWidth: 1920,
  stageHeight: 720,
  backgroundAsset: "",
  walkablePolygon: [
    [0, 535],
    [1920, 535],
    [1920, 720],
    [0, 720],
  ],
  depthLayers: [],
  portals: [
    {
      targetRoomId: "square",
      targetSpawn: {
        x: 660,
        y: 639,
      },
      triggerBounds: {
        x1: 0,
        y1: 565,
        x2: 120,
        y2: 700,
      },
      label: "Savanna Square",
    },
  ],
  props: [
    {
      id: "cupcake",
      emoji: "🧁",
      label: "cupcake",
      x: 860,
      y: 565,
      food: true,
    },
    {
      id: "smoothie",
      emoji: "🥤",
      label: "smoothie",
      x: 1040,
      y: 565,
      food: true,
    },
    { id: "cookie", emoji: "🍪", label: "cookie", x: 1450, y: 565, food: true },
  ],
  interactives: [
    {
      id: "cafe-smoothies",
      label: "Blend smoothies",
      icon: "🥭",
      type: "game_launch",
      position: {
        x: 570,
        y: 480,
      },
      actionData: {
        gameId: "smoothie",
      },
      object: {
        kind: "blender",
        width: 155,
        height: 205,
      },
      reaction: {
        message: "The blender whirls with fresh mango!",
        sound: "blender",
      },
    },
    {
      id: "cafe-tea",
      label: "Pour a cup of tea",
      icon: "🫖",
      type: "activity",
      position: {
        x: 970,
        y: 490,
      },
      actionData: {},
      object: {
        kind: "tea",
        width: 190,
        height: 150,
      },
      reaction: {
        message: "A warm cup of flower tea, just for you.",
        sound: "bubble",
      },
    },
    {
      id: "cafe-oven",
      label: "Bake a sunny pastry",
      icon: "🥐",
      type: "activity",
      position: {
        x: 1320,
        y: 495,
      },
      actionData: {},
      object: {
        kind: "oven",
        width: 210,
        height: 220,
      },
      reaction: {
        message: "Ding! A golden pastry rises in the oven.",
        sound: "chime",
      },
    },
    {
      id: "cafe-cake",
      label: "Decorate a cake",
      icon: "🎂",
      type: "game_launch",
      position: {
        x: 1740,
        y: 520,
      },
      actionData: {
        gameId: "bakery",
      },
      object: {
        kind: "cake",
        width: 145,
        height: 210,
      },
    },
  ],
  ambientAudioPreset: "canopy-cafe",
  neighbors: [
    {
      id: "milo",
      x: 1590,
      y: 640,
    },
  ],
};
