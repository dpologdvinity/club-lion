/**
 * Pet care simulation: state management and care actions for the companion lion.
 * Includes care engine, decay calculations, and procedural care sound effects.
 */
import { getSharedAudioBus } from "./audioBus.ts";

export type PetCareState = {
  happiness: number;
  cleanliness: number;
  energy: number;
  hunger: number;
  lastCareTimestamp: number;
};

export type CareAction = "wash" | "brush" | "feed" | "play";

export const DEFAULT_PET_CARE_STATE: PetCareState = {
  happiness: 60,
  cleanliness: 60,
  energy: 60,
  hunger: 60,
  lastCareTimestamp: 0,
};

export type CareResult = {
  nextState: PetCareState;
  happinessDelta: number;
  effectType: string;
};

/**
 * Apply a care action to the pet and return the new state.
 */
export function performPetCare(
  state: PetCareState,
  action: CareAction,
): CareResult {
  let nextState = { ...state };

  switch (action) {
    case "wash":
      nextState.cleanliness = Math.min(100, state.cleanliness + 25);
      nextState.happiness = Math.min(100, state.happiness + 10);
      break;
    case "brush":
      nextState.happiness = Math.min(100, state.happiness + 20);
      nextState.cleanliness = Math.min(100, state.cleanliness + 5);
      break;
    case "feed":
      nextState.hunger = Math.min(100, state.hunger + 30);
      nextState.happiness = Math.min(100, state.happiness + 15);
      break;
    case "play":
      nextState.happiness = Math.min(100, state.happiness + 25);
      nextState.energy = Math.max(0, state.energy - 20);
      break;
  }

  // Clamp all stats to [0, 100]
  nextState.happiness = Math.max(0, Math.min(100, nextState.happiness));
  nextState.cleanliness = Math.max(0, Math.min(100, nextState.cleanliness));
  nextState.energy = Math.max(0, Math.min(100, nextState.energy));
  nextState.hunger = Math.max(0, Math.min(100, nextState.hunger));
  nextState.lastCareTimestamp = Date.now();

  const happinessDelta = nextState.happiness - state.happiness;

  let effectType = "";
  switch (action) {
    case "wash":
      effectType = "bubbles";
      break;
    case "brush":
      effectType = "sparkle";
      break;
    case "feed":
      effectType = "munch";
      break;
    case "play":
      effectType = "bounce";
      break;
  }

  return {
    nextState,
    happinessDelta,
    effectType,
  };
}

/**
 * Check if pet is fully pampered (happiness >= 100).
 */
export function isPetFullyPampered(state: PetCareState): boolean {
  return state.happiness >= 100;
}

/**
 * Calculate care state decay over elapsed hours.
 */
export function calculatePetCareDecay(
  state: PetCareState,
  elapsedHours: number,
): PetCareState {
  if (elapsedHours <= 0) {
    return state;
  }

  // Decay rate: 5 points per hour per stat
  const decayPerHour = 5;
  const totalDecay = decayPerHour * elapsedHours;

  return {
    ...state,
    happiness: Math.max(0, state.happiness - totalDecay),
    cleanliness: Math.max(0, state.cleanliness - totalDecay),
    energy: Math.max(0, state.energy - totalDecay),
    hunger: Math.max(0, state.hunger - totalDecay),
  };
}

export type PetSoundType =
  "purr" | "bubble_pop" | "munch" | "heart_chime" | "happy_roar";

/**
 * Play procedural pet care sound effect.
 * Safe against null/missing AudioContext — no throw.
 */
export function playPetSound(
  type: PetSoundType,
  ctx?: AudioContext | null,
): void {
  try {
    const bus = ctx === undefined ? getSharedAudioBus() : null;
    const audioCtx = bus ? bus.getContext() : ctx;
    if (!audioCtx) return;
    const destination = bus ? bus.getSfxDestination() : audioCtx.destination;
    if (!destination) return;
    if (audioCtx.state === "suspended") void audioCtx.resume().catch(() => {});

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    switch (type) {
      case "purr":
        // Low frequency oscillator with gentle vibrato
        osc.type = "sine";
        osc.frequency.setValueAtTime(110, now);
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(4, now);
        lfoGain.gain.setValueAtTime(10, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(destination);
        osc.onended = () => {
          osc.disconnect();
          lfoGain.disconnect();
          lfo.disconnect();
          gain.disconnect();
        };
        lfo.start();
        osc.start();
        lfo.stop(now + 0.4);
        osc.stop(now + 0.4);
        break;

      case "bubble_pop":
        // Short high-pitched blip with pitch drop
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(destination);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start();
        osc.stop(now + 0.1);
        break;

      case "munch":
        // Short noisy/square burst
        osc.type = "square";
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(destination);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start();
        osc.stop(now + 0.15);
        break;

      case "heart_chime":
        // Two ascending sine notes
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.1); // E5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(destination);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start();
        osc.stop(now + 0.3);
        break;

      case "happy_roar":
        // Low-to-mid sawtooth sweep
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(destination);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start();
        osc.stop(now + 0.3);
        break;
    }
  } catch {
    // Sound is optional; unavailable or failing audio must never throw.
  }
}
