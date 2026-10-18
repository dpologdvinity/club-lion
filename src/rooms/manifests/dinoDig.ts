import { gameCabinets } from "../gameCabinets.ts";
import type { RoomManifest } from "../types.ts";

type Items = RoomManifest["interactives"];

/** True once every fossil spot has been dug all the way at least once (tap counts only grow). */
export function foundAllFossils(
  states: Record<string, number>,
  items: Items,
): boolean {
  const fossils = items.filter((item) => item.actionData.fossil);
  return (
    fossils.length > 0 &&
    fossils.every(
      (item) => (states[item.id] ?? 0) >= (item.object?.steps ?? 2) - 1,
    )
  );
}

const digSpot = (id: string, x: number, find: string): Items[number] => ({
  id: `dig-${id}`,
  label: `Dig for a ${find}`,
  icon: "⛏️",
  type: "activity",
  position: { x, y: 590 },
  actionData: { fossil: true },
  object: {
    kind: "digspot",
    width: 150,
    height: 110,
    steps: 3,
    caption: false,
  },
  reaction: {
    message: "Dig, dig!",
    messages: [
      "The sand is smooth again.",
      "Dig, dig! Something is down there…",
      `Wow! A dinosaur ${find}!`,
    ],
    sound: "rustle",
  },
});

/** Dino Dig: a desert fossil site off Downtown Plaza. */
export const dinoDigManifest: RoomManifest = {
  id: "dino-dig",
  name: "Dino Dig",
  district: "downtown",
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
      targetSpawn: { x: 1770, y: 665 },
      triggerBounds: { x1: 0, y1: 520, x2: 90, y2: 720 },
      label: "Downtown Plaza",
    },
  ],
  // Phones arrive at the door and the desktop map mid-site; a friend waits at each.
  neighbors: [
    { id: "pip", x: 430, y: 660 },
    { id: "cleo", x: 1290, y: 660 },
  ],
  interactives: [
    {
      id: "dino-door-plaza",
      label: "Back to Downtown Plaza",
      icon: "⛲",
      type: "activity",
      position: { x: 170, y: 560 },
      actionData: { travel: "downtown-plaza" },
      object: { kind: "door", width: 110, height: 120 },
      reaction: { message: "Downtown Plaza!", sound: "chime" },
    },
    digSpot("skull", 600, "skull"),
    digSpot("bone", 880, "leg bone"),
    digSpot("shell", 1520, "shell fossil"),
    digSpot("tooth", 1800, "giant tooth"),
    {
      id: "dino-volcano",
      label: "Wake the volcano",
      icon: "🌋",
      type: "activity",
      position: { x: 1200, y: 520 },
      actionData: { tune: { step: 2, notes: [7, 4, 2, 0] } },
      object: {
        kind: "volcano",
        width: 300,
        height: 260,
        steps: 3,
        caption: false,
      },
      reaction: {
        message: "Rumble rumble!",
        messages: [
          "The volcano is sleepy.",
          "Rumble rumble… puff!",
          "KABOOM! A lava fountain!",
        ],
        sound: "crackle",
      },
    },
    {
      id: "dino-egg",
      label: "Warm the dino egg",
      icon: "🥚",
      type: "activity",
      position: { x: 2180, y: 560 },
      actionData: {},
      object: {
        kind: "dinoegg",
        width: 140,
        height: 160,
        steps: 4,
        caption: false,
      },
      reaction: {
        message: "Crack!",
        messages: [
          "A new egg waits in the nest.",
          "Wobble wobble…",
          "Crack! Someone is peeking out!",
          "A baby dinosaur! Hello, little one!",
        ],
        sound: "chime",
      },
    },
    {
      id: "dino-sifter",
      label: "Shake the sand sifter",
      icon: "💎",
      type: "activity",
      position: { x: 2000, y: 560 },
      actionData: {},
      object: { kind: "sifter", width: 150, height: 130, caption: false },
      reaction: {
        message: "Shake shake!",
        messages: ["Sand falls through.", "Shake shake! A shiny gem!"],
        sound: "rustle",
      },
    },
    ...gameCabinets("dino-dig"),
  ],
  ambientAudioPreset: "dino-dig",
};
