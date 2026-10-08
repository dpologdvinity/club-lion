import { getSharedAudioBus } from "./audioBus.ts";

export type PropType =
  | "chair"
  | "bed"
  | "lamp"
  | "plant"
  | "water"
  | "table"
  | "blender"
  | "arcade_cabinet"
  | "clock"
  | "tub"
  | "bridge"
  | "fireplace";

export type PropSound =
  | "sit"
  | "splash"
  | "chime"
  | "lamp"
  | "blender"
  | "bubble"
  | "rustle"
  | "crackle";

export interface PropInteractionResult {
  nextActiveState: boolean;
  message: string;
  sound: PropSound;
  action: string;
}

export function getPropInteraction(
  propType: PropType,
  currentActiveState = false,
): PropInteractionResult {
  switch (propType) {
    case "chair":
      return {
        nextActiveState: !currentActiveState,
        message: "You settled into the comfy chair. Ahh, so relaxing! 🪑",
        sound: "sit",
        action: "sit",
      };
    case "bed":
      return {
        nextActiveState: !currentActiveState,
        message: "You curled up for a cozy lion catnap. Zzz... 💤",
        sound: "sit",
        action: "rest",
      };
    case "lamp": {
      const turningOn = !currentActiveState;
      return {
        nextActiveState: turningOn,
        message: turningOn
          ? "Click! The cozy lamp lights up with a warm amber glow. 💡"
          : "Click! The lamp turns off. Night vibes engaged. 🌙",
        sound: "lamp",
        action: "toggle",
      };
    }
    case "plant":
      return {
        nextActiveState: !currentActiveState,
        message:
          "You gave the leafy houseplant a gentle pat. Leaves rustle happily! 🌿",
        sound: "rustle",
        action: "shake",
      };
    case "water":
      return {
        nextActiveState: !currentActiveState,
        message:
          "Splash! Cool savanna water ripples gently under your paws! 💦",
        sound: "splash",
        action: "splash",
      };
    case "table":
      return {
        nextActiveState: !currentActiveState,
        message: "You inspect the polished wooden tabletop. Squeaky clean! ✨",
        sound: "chime",
        action: "inspect",
      };
    case "blender":
      return {
        nextActiveState: !currentActiveState,
        message:
          "Whirrrr! Fresh mango smoothie blends to creamy perfection! 🥭🥤",
        sound: "blender",
        action: "whirl",
      };
    case "arcade_cabinet":
      return {
        nextActiveState: !currentActiveState,
        message:
          "BEEP BOOP! The retro arcade cabinet flashes with high scores! 🕹️",
        sound: "chime",
        action: "play_arcade",
      };
    case "clock":
      return {
        nextActiveState: !currentActiveState,
        message:
          "DONGGG! The historic town clock chimes across the savanna! 🕰️",
        sound: "chime",
        action: "inspect",
      };
    case "tub":
      return {
        nextActiveState: !currentActiveState,
        message: "Bubbly lavender suds pop playfully in the clawfoot tub! 🛁🫧",
        sound: "bubble",
        action: "splash",
      };
    case "bridge":
      return {
        nextActiveState: !currentActiveState,
        message:
          "The canyon suspension bridge sways gently in the mountain breeze! 🌉",
        sound: "rustle",
        action: "inspect",
      };
    case "fireplace": {
      const lit = !currentActiveState;
      return {
        nextActiveState: lit,
        message: lit
          ? "Crackling savanna pine logs warm the whole room! 🔥"
          : "The cozy embers gently fade down to rest. 🪵",
        sound: "crackle",
        action: "toggle",
      };
    }
    default:
      return {
        nextActiveState: !currentActiveState,
        message: "You interacted with the scenery! ✨",
        sound: "chime",
        action: "inspect",
      };
  }
}

/** Synthesizes procedural Web Audio for interactive props without external sound assets. */
export function playPropSound(
  sound: PropSound,
  audioContextOverride?: AudioContext | null,
): void {
  try {
    const bus = getSharedAudioBus();
    const ctx =
      audioContextOverride !== undefined
        ? audioContextOverride
        : bus.getContext();
    if (!ctx || ctx.state === "closed") return;

    const destination = bus.getSfxDestination() ?? ctx.destination;
    const now = ctx.currentTime;

    switch (sound) {
      case "sit": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case "splash": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      case "lamp": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case "chime": {
        const notes = [659.25, 880, 1318.5]; // E5, A5, E6
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(t);
          osc.stop(t + 0.25);
        });
        break;
      }
      case "blender": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.15);
        osc.frequency.linearRampToValueAtTime(190, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case "bubble": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case "rustle": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case "crackle": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
    }
  } catch {
    // Gracefully ignore audio failures on environments without audio support
  }
}
