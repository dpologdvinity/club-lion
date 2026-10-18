import { gameCabinets } from "../gameCabinets.ts";
import type { RoomManifest } from "../types.ts";

export const mtMistBasecampManifest: RoomManifest = {
  id: "mt-mist",
  name: "Mt. Mist Alpine Basecamp",
  district: "canyon",
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
      targetSpawn: { x: 370, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Downtown Plaza",
    },
    {
      targetRoomId: "snowflake-rink",
      targetSpawn: { x: 280, y: 620 },
      triggerBounds: { x1: 2260, y1: 520, x2: 2400, y2: 660 },
      label: "Snowflake Rink",
    },
  ],
  props: [
    {
      id: "cocoa",
      emoji: "☕",
      label: "hot cocoa",
      x: 600,
      y: 565,
      food: true,
    },
    { id: "mittens", emoji: "🧤", label: "mittens", x: 1600, y: 565 },
    { id: "sled", emoji: "🛷", label: "toy sled", x: 2200, y: 565 },
  ],
  interactives: [
    {
      id: "sled-run-gate",
      label: "Sled Run Race",
      icon: "🛷",
      type: "activity",
      position: { x: 1800, y: 530 },
      actionData: { gameId: "sled-run" },
    },
    {
      id: "mist-campfire",
      label: "Warm up at the campfire",
      icon: "🔥",
      type: "activity",
      position: { x: 1000, y: 520 },
      actionData: {},
      object: { kind: "campfire", width: 150, height: 170 },
      reaction: {
        message: "Crackle! The campfire glows warm.",
        sound: "crackle",
      },
    },
    {
      id: "mist-alphorn",
      label: "Blow the alphorn",
      icon: "🎺",
      type: "activity",
      position: { x: 1400, y: 530 },
      actionData: {},
      object: { kind: "alphorn", width: 190, height: 180 },
      reaction: {
        message: "Hooooo! The echo rolls down the mountain.",
        sound: "chime",
      },
    },
    ...gameCabinets("mt-mist"),
  ],
  ambientAudioPreset: "alpine-wind",
  obstacles: [
    // Lodge front base (x 685..1195); its walls sit on the walkable top edge.
    {
      id: "lodge",
      shape: "polygon",
      points: [
        [685, 541],
        [1195, 541],
        [1195, 556],
        [685, 556],
      ],
    },
  ],
};
