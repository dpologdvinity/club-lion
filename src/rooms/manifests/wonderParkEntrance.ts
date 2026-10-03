import type { RoomManifest } from "../types.ts";

export const wonderParkEntranceManifest: RoomManifest = {
  id: "wonder-park-entrance",
  name: "Wonder Park Entrance",
  district: "wonder-park",
  stageWidth: 2800,
  stageHeight: 720,
  backgroundAsset: "wonder-park-entrance-bg.png",
  walkablePolygon: [
    [0, 540],
    [2800, 540],
    [2800, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "flume-splashdown", y: 540, asset: "flume-splashdown.png" },
    { id: "ticket-gate-1", y: 560, asset: "ticket-gate.png" },
    { id: "ticket-gate-2", y: 560, asset: "ticket-gate.png" },
    { id: "lamppost-1", y: 500, asset: "carnival-lamppost.png" },
    { id: "lamppost-2", y: 500, asset: "carnival-lamppost.png" },
    { id: "lion-topiary-1", y: 580, asset: "floral-lion-topiary.png" },
    { id: "lion-topiary-2", y: 580, asset: "floral-lion-topiary.png" },
    { id: "banner-1", y: 460, asset: "wonder-park-banner.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      // Clear of Downtown's Canopy Cafe trigger (2180-2360), which would
      // otherwise fire the moment the player arrives.
      targetSpawn: { x: 2050, y: 600 },
      triggerBounds: { x1: 2680, y1: 520, x2: 2800, y2: 650 },
      label: "Downtown Plaza",
    },
    {
      targetRoomId: "wonder-park-midway",
      targetSpawn: { x: 100, y: 600 },
      triggerBounds: { x1: 0, y1: 520, x2: 120, y2: 650 },
      label: "Carnival Midway",
    },
  ],
  interactives: [
    {
      id: "coaster-ticket-gate",
      type: "ride",
      position: { x: 900, y: 600 },
      actionData: { rideId: "wonder-coaster" },
    },
    {
      id: "giant-ferris-wheel",
      type: "ride",
      position: { x: 1700, y: 560 },
      actionData: { rideId: "giant-ferris-wheel" },
    },
    {
      id: "park-map-kiosk",
      type: "secret_clickable",
      position: { x: 1400, y: 610 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "carnival-ambient",
};
