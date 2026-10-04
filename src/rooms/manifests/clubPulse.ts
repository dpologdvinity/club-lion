import type { RoomManifest } from "../types.ts";
import type { FloorBounds } from "../../utils/danceFloorRhythm.ts";

/** Game id the DJ Booth hotspot launches, matching the DJ Beat Drop minigame. */
export const DJ_BEAT_DROP_GAME_ID = "dj-beat-drop";

/** Stable hotspot id so world routing can target the booth without guessing. */
export const CLUB_PULSE_DJ_BOOTH_ID = "club-pulse-dj-booth";

/**
 * Stage rectangle the LED dance floor covers, in this room's stage units.
 *
 * Pass it to `DanceFloor` as `floorBounds`. The component then owns its own
 * placement: it absolutely positions itself at this x/y with this width and
 * height, and renders its 8x6 grid as exactly this rectangle, so tile edges
 * match the `tileFromPosition` mapping of avatar stage positions. Mount it
 * inside the positioned stage container, not inside an extra offset wrapper.
 */
export const CLUB_PULSE_DANCE_FLOOR_BOUNDS: FloorBounds = {
  x: 320,
  y: 420,
  width: 1280,
  height: 240,
};

export const clubPulseManifest: RoomManifest = {
  id: "club-pulse",
  name: "Club Pulse",
  district: "uptown",
  stageWidth: 1920,
  stageHeight: 720,
  backgroundAsset: "club-pulse-bg.png",
  walkablePolygon: [
    [0, 420],
    [1920, 420],
    [1920, 720],
    [0, 720],
  ],
  depthLayers: [
    { id: "dj-booth", y: 400, asset: "dj-booth.png" },
    { id: "speaker-stack-left", y: 440, asset: "speaker-stack.png" },
    { id: "speaker-stack-right", y: 440, asset: "speaker-stack.png" },
    { id: "vip-mezzanine", y: 300, asset: "vip-mezzanine.png" },
  ],
  portals: [
    {
      targetRoomId: "downtown-plaza",
      targetSpawn: { x: 1200, y: 600 },
      triggerBounds: { x1: 40, y1: 420, x2: 220, y2: 700 },
      label: "Downtown Plaza",
    },
  ],
  interactives: [
    {
      id: CLUB_PULSE_DJ_BOOTH_ID,
      type: "game_launch",
      position: { x: 960, y: 400 },
      actionData: {
        gameId: DJ_BEAT_DROP_GAME_ID,
        label: "DJ Booth",
        prompt: "Drop the beat at the DJ Booth",
      },
    },
    {
      id: "club-pulse-dance-floor",
      type: "instrument",
      position: { x: 960, y: 540 },
      actionData: {
        surface: "dance-floor",
        bounds: CLUB_PULSE_DANCE_FLOOR_BOUNDS,
      },
    },
  ],
  ambientAudioPreset: "club-pulse-house",
};
