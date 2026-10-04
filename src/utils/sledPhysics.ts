import { getSharedAudioBus } from "./audioBus.ts";

export type SledState = {
  laneX: number;
  distance: number;
  speed: number;
  airborne: boolean;
  jumpHeight: number;
  coinsCollected: number;
  tricksCompleted: number;
  crashed: boolean;
  /** Vertical velocity keeps the jump ballistic without hidden mutable state. */
  jumpVelocity?: number;
  /** Distance at which the short ramp launch window ends. */
  rampUntil?: number;
};
export type Obstacle = {
  distance: number;
  laneX: number;
  type: "tree" | "rock" | "snowdrift";
};
export type Collectible = {
  distance: number;
  laneX: number;
  type: "golden_pinecone" | "speed_boost" | "ramp";
};

export const SLED_FINISH_DISTANCE = 800;
const MAX_SPEED = 42;
export const SLED_OBSTACLES: readonly Obstacle[] = Array.from(
  { length: 14 },
  (_, i) => ({
    distance: 100 + i * 48,
    laneX: [-120, 0, 120][i % 3],
    type: (["tree", "rock", "snowdrift"] as const)[i % 3],
  }),
);
export const SLED_ITEMS: readonly Collectible[] = [
  ...Array.from({ length: 18 }, (_, i): Collectible => ({
    distance: 40 + i * 40,
    laneX: [0, -100, 100][Math.floor(i / 3) % 3],
    type: "golden_pinecone",
  })),
  ...Array.from({ length: 6 }, (_, i): Collectible => ({
    distance: 120 + i * 120,
    laneX: [0, -100, 100][i % 3],
    type: "ramp",
  })),
  ...Array.from({ length: 4 }, (_, i): Collectible => ({
    distance: 80 + i * 180,
    laneX: [100, -100][i % 2],
    type: "speed_boost",
  })),
];
export const SLED_MAX_PINECONES = SLED_ITEMS.filter(
  (item) => item.type === "golden_pinecone",
).length;
export const SLED_MAX_TRICKS = SLED_ITEMS.filter(
  (item) => item.type === "ramp",
).length;
export const SLED_MAX_PAYOUT =
  40 + SLED_MAX_PINECONES * 5 + SLED_MAX_TRICKS * 10;

export function stepSledPhysics(
  state: SledState,
  steerInput: number,
  jumpInput: boolean,
  deltaMs: number,
): SledState {
  if (
    state.crashed ||
    state.distance >= SLED_FINISH_DISTANCE ||
    !Number.isFinite(deltaMs) ||
    deltaMs <= 0
  )
    return state;
  // Limit background-tab catchup so even at top speed obstacles cannot be skipped.
  const dt = Math.min(deltaMs, 50) / 1000;
  const steer = Number.isFinite(steerInput)
    ? Math.max(-1, Math.min(1, steerInput))
    : 0;
  const speed = Math.min(
    MAX_SPEED,
    Math.max(0, state.speed + (5 - state.speed * 0.1) * dt),
  );
  const distance = Math.min(
    SLED_FINISH_DISTANCE,
    state.distance + (state.speed + speed) * 0.5 * dt,
  );
  let airborne = state.airborne;
  let jumpHeight = state.jumpHeight;
  let jumpVelocity = state.jumpVelocity ?? 0;
  let rampUntil = state.rampUntil;
  let tricksCompleted = state.tricksCompleted;
  if (rampUntil !== undefined && state.distance > rampUntil)
    rampUntil = undefined;
  if (jumpInput && !airborne && rampUntil !== undefined) {
    airborne = true;
    jumpVelocity = 8;
    rampUntil = undefined;
  }
  if (airborne) {
    jumpHeight = Math.max(0, jumpHeight + jumpVelocity * dt - 4.9 * dt * dt);
    jumpVelocity -= 9.8 * dt;
    if (jumpHeight === 0) {
      airborne = false;
      jumpVelocity = 0;
      tricksCompleted += 1;
    }
  }
  return {
    ...state,
    laneX: Math.max(-180, Math.min(180, state.laneX + steer * 220 * dt)),
    distance,
    speed: distance === SLED_FINISH_DISTANCE ? 0 : speed,
    airborne,
    jumpHeight,
    jumpVelocity,
    rampUntil,
    tricksCompleted,
  };
}

export function checkSledCollision(
  state: SledState,
  obstacles: readonly Obstacle[],
): boolean {
  return obstacles.some(
    (obstacle) =>
      Math.abs(state.distance - obstacle.distance) <= 3 &&
      Math.abs(state.laneX - obstacle.laneX) <= 26 &&
      (obstacle.type === "tree" || state.jumpHeight < 0.8),
  );
}

/** The caller removes pickedUp from its remaining items, making pickups one-shot. */
export function checkSledPickup(
  state: SledState,
  items: readonly Collectible[],
): { nextState: SledState; pickedUp: Collectible | null } {
  if (state.crashed || state.distance >= SLED_FINISH_DISTANCE)
    return { nextState: state, pickedUp: null };
  const pickedUp = items.find(
    (item) =>
      Math.abs(state.distance - item.distance) <= 3 &&
      Math.abs(state.laneX - item.laneX) <= 28,
  );
  if (!pickedUp) return { nextState: state, pickedUp: null };
  const nextState = { ...state };
  if (pickedUp.type === "golden_pinecone") nextState.coinsCollected += 1;
  if (pickedUp.type === "speed_boost")
    nextState.speed = Math.min(MAX_SPEED, state.speed + 12);
  if (pickedUp.type === "ramp" && !state.airborne)
    nextState.rampUntil = pickedUp.distance + 10;
  return { nextState, pickedUp };
}

export function calculateSledPayout(
  distance: number,
  coins: number,
  tricks: number,
): number {
  const count = (value: number) =>
    Number.isSafeInteger(value) && value >= 0 ? value : 0;
  return (
    10 +
    count(coins) * 5 +
    count(tricks) * 10 +
    (Number.isFinite(distance) && distance >= SLED_FINISH_DISTANCE ? 30 : 0)
  );
}

export function playSledSound(
  type: "whoosh" | "boost" | "pickup" | "jump" | "crash",
  ctx?: AudioContext | null,
): void {
  if (ctx === null) return;
  try {
    const bus = getSharedAudioBus();
    const context = ctx ?? bus.getContext();
    const destination = bus.getSfxDestination();
    if (
      !context ||
      context.state === "closed" ||
      !destination ||
      context !== bus.getContext()
    )
      return;
    if (context.state === "suspended") void context.resume().catch(() => {});
    const duration = type === "crash" ? 0.35 : 0.18;
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.connect(destination);
    let source: AudioBufferSourceNode | OscillatorNode;
    if (type === "whoosh" || type === "crash") {
      const buffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * duration),
        context.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++)
        samples[i] = Math.random() * 2 - 1;
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      source = noise;
    } else {
      const oscillator = context.createOscillator();
      oscillator.type = "triangle";
      const frequency = type === "pickup" ? 880 : type === "boost" ? 220 : 330;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 2,
        now + duration,
      );
      source = oscillator;
    }
    source.connect(gain);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start(now);
    source.stop(now + duration);
  } catch {
    // Audio is optional; gameplay also works when the browser denies sound.
  }
}
