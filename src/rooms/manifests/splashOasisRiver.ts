import { gameCabinets } from "../gameCabinets.ts";
import type { RoomManifest } from "../types.ts";

export const splashOasisRiverManifest: RoomManifest = {
  id: "splash-oasis-river",
  name: "Lazy River Oasis",
  district: "tropical",
  stageWidth: 2800,
  stageHeight: 720,
  backgroundAsset: "splash-oasis-river-bg.png",
  walkablePolygon: [
    [0, 560],
    [2800, 560],
    [2800, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "lazy-river", y: 400, asset: "lazy-river-channel.png" },
    { id: "boardwalk-1", y: 600, asset: "riverbank-boardwalk.png" },
    { id: "boardwalk-2", y: 600, asset: "riverbank-boardwalk.png" },
    { id: "tube-rack", y: 580, asset: "inner-tube-rack.png" },
  ],
  portals: [
    {
      targetRoomId: "splash-oasis-entry",
      targetSpawn: { x: 2500, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 120, y2: 650 },
      label: "Splash Oasis",
    },
  ],
  interactives: [
    {
      id: "lazy-river-current",
      label: "Float the Lazy River",
      icon: "🛶",
      type: "ride",
      position: { x: 1400, y: 400 },
      actionData: { rideId: "lazy-river-current" },
    },
    ...gameCabinets("splash-oasis-river"),
  ],
  ambientAudioPreset: "tropical-splash-ambient",
  obstacles: [
    {
      id: "tube-rentals-hut",
      shape: "polygon",
      points: [
        [1928, 562],
        [2172, 562],
        [2172, 568],
        [1928, 568],
      ],
    },
    {
      id: "palm-1",
      shape: "ellipse",
      center: { x: 300, y: 640 },
      rx: 12,
      ry: 6,
    },
    {
      id: "palm-2",
      shape: "ellipse",
      center: { x: 2770, y: 668 },
      rx: 13,
      ry: 7,
    },
  ],
};
