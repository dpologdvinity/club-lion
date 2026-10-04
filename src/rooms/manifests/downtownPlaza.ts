import type { RoomManifest } from "../types.ts";

export const downtownPlazaManifest: RoomManifest = {
  id: "downtown-plaza",
  name: "Downtown Plaza",
  district: "downtown",
  stageWidth: 2400,
  stageHeight: 720,
  backgroundAsset: "downtown-plaza-bg.png",
  walkablePolygon: [
    [0, 560],
    [2400, 560],
    [2400, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "lamppost-1", y: 480, asset: "lamppost.png" },
    { id: "lamppost-2", y: 480, asset: "lamppost.png" },
    { id: "bistro-table-1", y: 600, asset: "bistro-table.png" },
    { id: "bistro-table-2", y: 600, asset: "bistro-table.png" },
  ],
  portals: [
    {
      targetRoomId: "sunset-beach",
      targetSpawn: { x: 280, y: 620 },
      triggerBounds: { x1: 100, y1: 675, x2: 240, y2: 720 },
      label: "Sunset Beach",
    },
    {
      targetRoomId: "mt-mist",
      targetSpawn: { x: 250, y: 600 },
      triggerBounds: { x1: 300, y1: 675, x2: 440, y2: 720 },
      label: "Mt. Mist Basecamp",
    },
    {
      targetRoomId: "square",
      targetSpawn: { x: 43, y: 78 },
      triggerBounds: { x1: 950, y1: 675, x2: 1100, y2: 720 },
      label: "Savanna Square",
    },
    {
      targetRoomId: "wonder-park-entrance",
      targetSpawn: { x: 2500, y: 600 },
      triggerBounds: { x1: 1700, y1: 560, x2: 1850, y2: 650 },
      label: "Wonder Park Entrance",
    },
    {
      targetRoomId: "club-pulse",
      targetSpawn: { x: 280, y: 600 },
      triggerBounds: { x1: 600, y1: 560, x2: 740, y2: 650 },
      label: "Club Pulse",
    },
    {
      targetRoomId: "le-shop",
      targetSpawn: { x: 100, y: 600 },
      triggerBounds: { x1: 40, y1: 520, x2: 220, y2: 650 },
      label: "Le Shop",
    },
    {
      targetRoomId: "cafe",
      targetSpawn: { x: 2300, y: 600 },
      triggerBounds: { x1: 2180, y1: 520, x2: 2360, y2: 650 },
      label: "Canopy Café",
    },
    {
      targetRoomId: "splash-oasis-entry",
      targetSpawn: { x: 300, y: 620 },
      triggerBounds: { x1: 1350, y1: 560, x2: 1500, y2: 650 },
      label: "Splash Oasis",
    },
    {
      targetRoomId: "penthouse-condo",
      targetSpawn: { x: 960, y: 400 },
      triggerBounds: { x1: 460, y1: 560, x2: 560, y2: 650 },
      label: "Penthouse Condo",
    },
    {
      targetRoomId: "secret-scout-base",
      targetSpawn: { x: 250, y: 600 },
      triggerBounds: { x1: 1910, y1: 560, x2: 2010, y2: 650 },
      label: "Secret Scout HQ",
    },
    {
      targetRoomId: "canyon-rapids",
      targetSpawn: { x: 600, y: 600 },
      triggerBounds: { x1: 500, y1: 675, x2: 640, y2: 720 },
      label: "Canyon Rapids",
    },
  ],
  interactives: [
    {
      id: "marble-lion-fountain",
      type: "secret_clickable",
      position: { x: 1200, y: 550 },
      actionData: {},
    },
  ],
  ambientAudioPreset: "plaza-ambient",
};
