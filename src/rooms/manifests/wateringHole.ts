import type { RoomManifest } from "../types.ts";

export const wateringHoleManifest: RoomManifest = {
  id: "water",
  name: "The watering hole",
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
    { id: "duck", emoji: "🦆", label: "rubber duck", x: 880, y: 565 },
    {
      id: "melon",
      emoji: "🍉",
      label: "watermelon",
      x: 1060,
      y: 565,
      food: true,
    },
    { id: "bucket", emoji: "🪣", label: "bucket", x: 1450, y: 565 },
  ],
  interactives: [
    {
      id: "water-fireflies",
      label: "Catch fireflies",
      icon: "✨",
      type: "game_launch",
      position: { x: 280, y: 470 },
      actionData: { gameId: "fireflies" },
    },
    {
      id: "lagoon-splash",
      label: "Splash the lagoon",
      icon: "💦",
      type: "activity",
      position: {
        x: 500,
        y: 515,
      },
      actionData: {},
      object: {
        kind: "splash",
        width: 330,
        height: 155,
      },
      reaction: {
        message: "Cool water makes a sparkling splash!",
        sound: "splash",
      },
    },
    {
      id: "lagoon-lilies",
      label: "Bounce the lily pads",
      icon: "🪷",
      type: "activity",
      position: {
        x: 1050,
        y: 510,
      },
      actionData: {},
      object: {
        kind: "lily",
        width: 280,
        height: 130,
      },
      reaction: {
        message: "Boing! The little frog hops between the lily pads.",
        sound: "bubble",
      },
    },
    {
      id: "lagoon-chimes",
      label: "Ring the shell chimes",
      icon: "🐚",
      type: "activity",
      position: {
        x: 1480,
        y: 350,
      },
      actionData: {},
      object: {
        kind: "chimes",
        width: 160,
        height: 230,
      },
      reaction: {
        message: "Shells sing in the savanna breeze.",
        sound: "chime",
      },
    },
    {
      id: "lagoon-bubbles",
      label: "Bubble Pop",
      icon: "🫧",
      type: "game_launch",
      position: {
        x: 1750,
        y: 525,
      },
      actionData: {
        gameId: "bubble-pop",
      },
      object: {
        kind: "bubbles",
        width: 135,
        height: 210,
      },
    },
  ],
  ambientAudioPreset: "savanna-water",
  neighbors: [
    {
      id: "cleo",
      x: 1590,
      y: 640,
    },
  ],
};
