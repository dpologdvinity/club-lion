import type { RoomManifest } from "../types.ts";

export const cozyDenManifest: RoomManifest = {
  id: "den",
  name: "Your cozy den",
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
  interactives: [
    {
      id: "den-fire",
      label: "Cozy fireplace",
      icon: "🔥",
      type: "activity",
      position: {
        x: 450,
        y: 520,
      },
      actionData: {},
      object: {
        kind: "fireplace",
        width: 290,
        height: 280,
      },
      reaction: {
        message:
          "The fireplace changes between a cozy glow and a quiet hearth.",
        sound: "crackle",
      },
    },
    {
      id: "den-reading-lamp",
      label: "Switch the reading lamp",
      icon: "💡",
      type: "activity",
      position: {
        x: 950,
        y: 490,
      },
      actionData: {},
      object: {
        kind: "lamp",
        width: 140,
        height: 240,
      },
      reaction: {
        message: "Click! The reading lamp switches its warm light.",
        sound: "lamp",
      },
    },
    {
      id: "den-storybook",
      label: "Turn the storybook pages",
      icon: "📖",
      type: "activity",
      position: {
        x: 1210,
        y: 520,
      },
      actionData: {},
      object: {
        kind: "books",
        width: 215,
        height: 140,
      },
      reaction: {
        message: "A new picture appears in your storybook.",
        sound: "rustle",
      },
    },
    {
      id: "den-shop",
      label: "Find something cozy",
      icon: "🛋️",
      type: "activity",
      position: {
        x: 1670,
        y: 560,
      },
      actionData: {
        roomAction: "shop",
      },
    },
    {
      id: "den-owned-plant",
      label: "Your happy houseplant",
      icon: "🪴",
      type: "activity",
      position: {
        x: 1510,
        y: 520,
      },
      actionData: {},
      object: {
        kind: "plant",
        width: 155,
        height: 200,
      },
      reaction: {
        message: "Your happy houseplant stretches its leaves.",
        sound: "rustle",
      },
      requiresDecor: "plant",
    },
    {
      id: "den-owned-cushion",
      label: "Your sunny cushion",
      icon: "☀️",
      type: "activity",
      position: {
        x: 760,
        y: 550,
      },
      actionData: {},
      object: {
        kind: "cushion",
        width: 170,
        height: 100,
      },
      reaction: {
        message: "You settle into your sunny cushion.",
        sound: "sit",
      },
      requiresDecor: "cushion",
    },
  ],
  obstacles: [
    {
      id: "reading-chair",
      shape: "ellipse",
      center: { x: 750, y: 565 },
      rx: 110,
      ry: 26,
    },
    {
      id: "story-table",
      shape: "ellipse",
      center: { x: 1200, y: 560 },
      rx: 130,
      ry: 24,
    },
  ],
  ambientAudioPreset: "cozy-den",
};
