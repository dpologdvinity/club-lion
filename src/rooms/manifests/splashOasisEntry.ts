import type { RoomManifest } from "../types.ts";

export const splashOasisEntryManifest: RoomManifest = {
  id: "splash-oasis-entry",
  name: "Splash Oasis",
  district: "tropical",
  stageWidth: 2800,
  stageHeight: 720,
  backgroundAsset: "splash-oasis-entry-bg.png",
  walkablePolygon: [
    [0, 540],
    [2800, 540],
    [2800, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "wave-pool", y: 560, asset: "wave-pool-generator.png" },
    { id: "palm-1", y: 500, asset: "beach-palm-tree.png" },
    { id: "palm-2", y: 500, asset: "beach-palm-tree.png" },
    { id: "cabana", y: 560, asset: "tropical-cabana.png" },
    { id: "dump-bucket-fortress", y: 540, asset: "dump-bucket-fortress.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 400, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 120, y2: 650 },
      label: "Downtown Plaza",
    },
    {
      targetRoomId: "splash-oasis-river",
      targetSpawn: { x: 2700, y: 560 },
      triggerBounds: { x1: 2680, y1: 520, x2: 2800, y2: 650 },
      label: "Lazy River Oasis",
    },
  ],
  interactives: [
    {
      id: "tsunami-wave-pool",
      type: "ride",
      position: { x: 900, y: 600 },
      actionData: { rideId: "tsunami-wave-pool" },
    },
    {
      id: "speed-slides",
      type: "ride",
      position: { x: 1560, y: 560 },
      actionData: { rideId: "speed-slides" },
    },
    {
      id: "dump-bucket-fortress",
      type: "ride",
      position: { x: 1900, y: 580 },
      actionData: { rideId: "dump-bucket-fortress" },
    },
  ],
  ambientAudioPreset: "tropical-splash-ambient",
  obstacles: [
    {
      id: "wave-pool",
      shape: "polygon",
      points: [
        [431, 541],
        [1369, 541],
        [1358, 548],
        [1296, 574],
        [1159, 601],
        [900, 616],
        [640, 601],
        [443, 549],
      ],
    },
    { id: "lifeguard-leg-w", shape: "ellipse", center: { x: 1358, y: 598 }, rx: 6, ry: 4 },
    { id: "lifeguard-leg-e", shape: "ellipse", center: { x: 1442, y: 598 }, rx: 6, ry: 4 },
    { id: "foot-shower", shape: "ellipse", center: { x: 250, y: 606 }, rx: 14, ry: 6 },
    { id: "splash-pad-fortress", shape: "ellipse", center: { x: 1900, y: 580 }, rx: 214, ry: 30 },
  ],
};
