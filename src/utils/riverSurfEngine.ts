import { getSharedAudioBus } from "./audioBus.ts";

export type SurfState = {
  laneX: number;
  distance: number;
  speed: number;
  isAirborne: boolean;
  activeTrick: string | null;
  trickCombo: number;
  score: number;
  wipedOut: boolean;
};

export type RiverObstacle = {
  distance: number;
  laneX: number;
  type: "boulder" | "log" | "whirlpool";
};

export type RiverFeature = {
  distance: number;
  laneX: number;
  type: "ramp_wave" | "golden_fish" | "boost_current";
};

const LANE_MIN = -160;
const LANE_MAX = 160;
const DISTANCE_MAX = 600;
const STEER_SPEED = 240; // px/sec of lane travel at full steer input
const TRICK_SCORE = 150;

export function stepRiverSurf(
  state: SurfState,
  steerInput: number,
  trickInput: string | null,
  deltaMs: number,
): SurfState {
  const seconds = deltaMs / 1000;
  const clampedSteer = Math.min(1, Math.max(-1, steerInput));
  const laneX = Math.min(
    LANE_MAX,
    Math.max(LANE_MIN, state.laneX + clampedSteer * STEER_SPEED * seconds),
  );
  const distance = Math.min(
    DISTANCE_MAX,
    Math.max(0, state.distance + state.speed * seconds),
  );

  if (trickInput && state.isAirborne) {
    return {
      ...state,
      laneX,
      distance,
      activeTrick: trickInput,
      trickCombo: state.trickCombo + 1,
      score: state.score + TRICK_SCORE * (state.trickCombo + 1),
    };
  }

  return {
    ...state,
    laneX,
    distance,
    activeTrick: trickInput && state.isAirborne ? trickInput : null,
  };
}

const COLLISION_LANE_RANGE = 40;
const COLLISION_DISTANCE_RANGE = 6;

export function checkRiverCollision(
  state: SurfState,
  obstacles: RiverObstacle[],
): boolean {
  if (state.isAirborne) return false;
  return obstacles.some(
    (obstacle) =>
      Math.abs(obstacle.distance - state.distance) <=
        COLLISION_DISTANCE_RANGE &&
      Math.abs(obstacle.laneX - state.laneX) <= COLLISION_LANE_RANGE,
  );
}

const PICKUP_LANE_RANGE = 40;
const PICKUP_DISTANCE_RANGE = 6;
const GOLDEN_FISH_SCORE = 100;
const BOOST_CURRENT_SPEED_GAIN = 4;

export function checkRiverPickup(
  state: SurfState,
  features: RiverFeature[],
): { nextState: SurfState; pickup: RiverFeature | null } {
  const pickup =
    features.find(
      (feature) =>
        Math.abs(feature.distance - state.distance) <= PICKUP_DISTANCE_RANGE &&
        Math.abs(feature.laneX - state.laneX) <= PICKUP_LANE_RANGE,
    ) ?? null;

  if (!pickup) return { nextState: state, pickup: null };

  switch (pickup.type) {
    case "golden_fish":
      return {
        nextState: { ...state, score: state.score + GOLDEN_FISH_SCORE },
        pickup,
      };
    case "boost_current":
      return {
        nextState: { ...state, speed: state.speed + BOOST_CURRENT_SPEED_GAIN },
        pickup,
      };
    case "ramp_wave":
      return {
        nextState: { ...state, isAirborne: true },
        pickup,
      };
  }
}

export function calculateRiverSurfPayout(
  score: number,
  tricks: number,
  cleanFinish: boolean,
): number {
  const base = 10;
  const scoreCoins = Math.floor(Math.max(0, score) / 20);
  const trickCoins = Math.max(0, tricks) * 5;
  const cleanBonus = cleanFinish ? 25 : 0;
  return Math.max(base, base + scoreCoins + trickCoins + cleanBonus);
}

export type RiverSurfSoundType =
  "carve" | "splash" | "trick" | "air" | "wipeout";

export function playRiverSurfSound(
  type: RiverSurfSoundType,
  audioCtx?: AudioContext | null,
): void {
  try {
    const bus = audioCtx === undefined ? getSharedAudioBus() : null;
    const ctx = bus ? bus.getContext() : audioCtx;
    if (!ctx) return;
    const destination = bus ? bus.getSfxDestination() : ctx.destination;
    if (!destination) return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    switch (type) {
      case "carve":
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        break;
      case "splash":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        break;
      case "trick":
        osc.type = "square";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        break;
      case "air":
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.18);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        break;
      case "wipeout":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        break;
    }

    osc.connect(gain);
    gain.connect(destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    /* ignore: Web Audio unavailable or node in exotic test double */
  }
}
