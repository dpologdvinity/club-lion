import { gameCabinets } from "../gameCabinets.ts";
import type { RoomManifest } from "../types.ts";

export const lionAquariumManifest: RoomManifest = {
  id: "lion-aquarium",
  name: "Lion Aquarium",
  district: "sunset_beach",
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
      targetRoomId: "coastal-pier",
      targetSpawn: { x: 2120, y: 620 },
      triggerBounds: { x1: 0, y1: 520, x2: 140, y2: 660 },
      label: "Coastal Pier & Boardwalk",
    },
  ],
  props: [
    { id: "fish", emoji: "🐟", label: "fish plush", x: 400, y: 565 },
    { id: "cookie", emoji: "🍪", label: "cookie", x: 1300, y: 565, food: true },
    { id: "octopus", emoji: "🐙", label: "octopus plush", x: 2250, y: 565 },
  ],
  interactives: [
    {
      id: "aquarium-feed-fish",
      label: "Feed the fish",
      icon: "🐟",
      type: "secret_clickable",
      position: { x: 760, y: 560 },
      actionData: {},
    },
    {
      id: "aquarium-touch-pool",
      label: "Touch pool",
      icon: "🦀",
      type: "secret_clickable",
      position: { x: 1560, y: 560 },
      actionData: {},
    },
    {
      id: "aquarium-jellyfish",
      label: "Wake the jellyfish",
      icon: "🪼",
      type: "activity",
      position: { x: 1050, y: 520 },
      actionData: {},
      object: { kind: "jellyfish", width: 150, height: 180 },
      reaction: {
        message: "Glow glow! The jellyfish floats up.",
        sound: "bubble",
      },
    },
    {
      id: "aquarium-treasure",
      label: "Open the treasure chest",
      icon: "🪙",
      type: "activity",
      position: { x: 2000, y: 540 },
      actionData: {},
      object: { kind: "treasure", width: 170, height: 150 },
      reaction: { message: "Clink! Shiny gold coins inside!", sound: "chime" },
    },
    ...gameCabinets("lion-aquarium"),
  ],
  obstacles: [
    {
      id: "touch-pool",
      shape: "ellipse",
      center: { x: 1560, y: 610 },
      rx: 200,
      ry: 42,
    },
  ],
  ambientAudioPreset: "aquarium-bubbles",
};
