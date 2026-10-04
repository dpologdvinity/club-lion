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
      type: "ride",
      position: { x: 1400, y: 400 },
      actionData: { rideId: "lazy-river-current" },
    },
  ],
  ambientAudioPreset: "tropical-splash-ambient",
};
