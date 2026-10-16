import type { RoomManifest } from "../types.ts";

export const neighborhoodArcadeManifest: RoomManifest = {
  id: "arcade",
  name: "The arcade",
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
        x: 43,
        y: 78,
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
      id: "arcade-memory",
      label: "Memory Safari",
      icon: "🃏",
      type: "game_launch",
      position: {
        x: 380,
        y: 520,
      },
      actionData: {
        gameId: "memory",
      },
      object: {
        kind: "cabinet",
        width: 185,
        height: 290,
      },
    },
    {
      id: "arcade-bee",
      label: "Bee Stop",
      icon: "🐝",
      type: "game_launch",
      position: {
        x: 680,
        y: 520,
      },
      actionData: {
        gameId: "bee",
      },
      object: {
        kind: "cabinet",
        width: 185,
        height: 290,
      },
    },
    {
      id: "arcade-steps",
      label: "Paw Steps",
      icon: "🐾",
      type: "game_launch",
      position: {
        x: 980,
        y: 520,
      },
      actionData: {
        gameId: "paw",
      },
      object: {
        kind: "cabinet",
        width: 185,
        height: 290,
      },
    },
    {
      id: "arcade-prizes",
      label: "Drop a surprise ball",
      icon: "🎁",
      type: "activity",
      position: {
        x: 1300,
        y: 520,
      },
      actionData: {},
      object: {
        kind: "prizes",
        width: 200,
        height: 280,
      },
      reaction: {
        message: "Clunk! A colorful surprise rolls into the tray.",
        sound: "bubble",
      },
    },
    {
      id: "arcade-disco",
      label: "Change the dance lights",
      icon: "🪩",
      type: "activity",
      position: {
        x: 1590,
        y: 350,
      },
      actionData: {},
      object: {
        kind: "disco",
        width: 170,
        height: 190,
      },
      reaction: {
        message: "The dance lights change color!",
        sound: "chime",
      },
    },
    {
      id: "arcade-all-games",
      label: "Choose a game",
      icon: "🎮",
      type: "activity",
      position: {
        x: 1730,
        y: 560,
      },
      actionData: {
        roomAction: "games",
      },
    },
    {
      id: "arcade-scores",
      label: "Arcade Leaderboard",
      icon: "🏆",
      type: "activity",
      position: {
        x: 190,
        y: 560,
      },
      actionData: {
        roomAction: "leaderboard",
      },
    },
  ],
  ambientAudioPreset: "arcade",
  neighbors: [
    {
      id: "pip",
      x: 1810,
      y: 640,
    },
  ],
};
