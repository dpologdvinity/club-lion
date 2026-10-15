/**
 * Procedural sounds for the Balloon Parade: a squeaky pop and a rising
 * rainbow note. Both route through the shared SFX bus, so mute and volume apply.
 */
import { getSharedAudioBus } from "./audioBus.ts";
import { RAINBOW_ORDER, type BalloonColor } from "./balloonParade.ts";

/** One pitch per arch stripe: a pentatonic climb from C5 to C6. */
const STRIPE_HZ = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

function output() {
  const bus = getSharedAudioBus();
  const ctx = bus.getContext();
  const out = bus.getSfxDestination();
  if (!ctx || !out || ctx.state === "closed") return null;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return { ctx, out };
}

/** A balloon bursting: a squeak that wobbles up and down, then a soft puff. */
export function playSqueakyPop(): void {
  const target = output();
  if (!target) return;
  const { ctx, out } = target;
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(900, start);
  osc.frequency.exponentialRampToValueAtTime(2400, start + 0.06);
  osc.frequency.exponentialRampToValueAtTime(1300, start + 0.14);
  gain.gain.setValueAtTime(0.22, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + 0.18);

  const frames = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frames; index++)
    data[index] = (Math.random() * 2 - 1) * (1 - index / frames);
  const noise = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  const puff = ctx.createGain();
  noise.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = 2500;
  puff.gain.value = 0.25;
  noise.connect(band).connect(puff).connect(out);
  noise.start(start);
}

/** The rainbow note for a stripe, so the arch sings as it fills in. */
export function playRainbowNote(color: BalloonColor): void {
  const target = output();
  if (!target) return;
  const { ctx, out } = target;
  const index = Math.max(0, RAINBOW_ORDER.indexOf(color));
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(STRIPE_HZ[index], start);
  gain.gain.setValueAtTime(0.26, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + 0.52);
}
