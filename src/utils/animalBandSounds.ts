/**
 * One procedural voice per animal for the Animal Orchestra. Everything routes
 * through the shared SFX bus, so the global mute and volume controls reach it.
 */
import { getSharedAudioBus } from "./audioBus.ts";
import type { AnimalId } from "./animalBand.ts";

type Target = { ctx: AudioContext; out: AudioNode };

function output(): Target | null {
  const bus = getSharedAudioBus();
  const ctx = bus.getContext();
  const out = bus.getSfxDestination();
  if (!ctx || !out) return null;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return { ctx, out };
}

/** A pitched tone that decays; `to` bends the pitch, `filter` softens it. */
function tone(
  { ctx, out }: Target,
  type: OscillatorType,
  from: number,
  length: number,
  peak: number,
  options: { to?: number; lowpass?: number } = {},
) {
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  if (options.to)
    osc.frequency.exponentialRampToValueAtTime(options.to, start + length);
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  if (options.lowpass) {
    const filter = ctx.createBiquadFilter();
    filter.frequency.value = options.lowpass;
    osc.connect(filter).connect(gain);
  } else {
    osc.connect(gain);
  }
  gain.connect(out);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

/** A short burst of filtered noise: the monkey's shaker. */
function shake({ ctx, out }: Target, length: number, peak: number) {
  const start = ctx.currentTime;
  const frames = Math.floor(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frames; index++)
    data[index] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = 6_000;
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  source.connect(band).connect(gain).connect(out);
  source.start(start);
}

// Pitches sit on a C major pentatonic set so any mix of animals stays friendly.
const VOICES: Record<AnimalId, (target: Target) => void> = {
  // Lion: a booming bass drum with a pitch drop.
  lion: (target) => tone(target, "sine", 150, 0.3, 0.7, { to: 45 }),
  // Zebra: a plucked piano note that rings out.
  zebra: (target) => {
    tone(target, "triangle", 261.63, 0.9, 0.3);
    tone(target, "sine", 523.25, 0.5, 0.08);
  },
  // Giraffe: a bright xylophone tick.
  giraffe: (target) => tone(target, "sine", 783.99, 0.25, 0.3),
  // Hippo: a soft, low tuba with the high notes filtered away.
  hippo: (target) =>
    tone(target, "sawtooth", 65.41, 0.6, 0.28, { lowpass: 400 }),
  // Monkey: a quick maraca shake.
  monkey: (target) => shake(target, 0.09, 0.35),
  // Parrot: a whistle that slides up and wobbles.
  parrot: (target) => tone(target, "sine", 1046.5, 0.35, 0.14, { to: 1318.5 }),
};

/** Plays one animal's sound now. Silent if audio is unavailable. */
export function playAnimalSound(animal: AnimalId): void {
  try {
    const target = output();
    if (target) VOICES[animal](target);
  } catch {
    // Sound is optional; a failed effect must never interrupt play.
  }
}
