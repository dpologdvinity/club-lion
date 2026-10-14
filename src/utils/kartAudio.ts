import { getSharedAudioBus } from "./audioBus.ts";

/** Procedural kart race sounds; everything feeds the shared SFX bus so mute and volume apply. */

export type KartSound =
  "beep" | "go" | "bump" | "mango" | "boost" | "lap" | "cheer";

function sfx(): { ctx: AudioContext; out: AudioNode } | null {
  try {
    const bus = getSharedAudioBus();
    const ctx = bus.getContext();
    const out = bus.getSfxDestination();
    if (!ctx || !out || ctx.state === "closed") return null;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return { ctx, out };
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  out: AudioNode,
  type: OscillatorType,
  from: number,
  to: number,
  start: number,
  length: number,
  volume: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + length);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(out);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
  osc.start(start);
  osc.stop(start + length + 0.02);
}

function noise(
  ctx: AudioContext,
  out: AudioNode,
  start: number,
  length: number,
  volume: number,
  filterFrom: number,
  filterTo: number,
) {
  const buffer = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * length),
    ctx.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(filterFrom, start);
  filter.frequency.exponentialRampToValueAtTime(filterTo, start + length);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + length * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  source.connect(filter).connect(gain).connect(out);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
  source.start(start);
}

export function playKartSound(sound: KartSound): void {
  const audio = sfx();
  if (!audio) return;
  const { ctx, out } = audio;
  const now = ctx.currentTime;
  try {
    if (sound === "beep") tone(ctx, out, "square", 440, 440, now, 0.25, 0.08);
    else if (sound === "go") tone(ctx, out, "square", 880, 880, now, 0.6, 0.09);
    else if (sound === "bump") {
      tone(ctx, out, "sine", 160, 70, now, 0.18, 0.18);
      noise(ctx, out, now, 0.15, 0.12, 900, 300);
    } else if (sound === "mango")
      [660, 880, 1320].forEach((f, i) =>
        tone(ctx, out, "triangle", f, f * 1.02, now + i * 0.07, 0.16, 0.09),
      );
    else if (sound === "boost") {
      noise(ctx, out, now, 0.7, 0.16, 400, 3200);
      tone(ctx, out, "sawtooth", 120, 360, now, 0.5, 0.04);
    } else if (sound === "lap")
      [523, 659, 784].forEach((f, i) =>
        tone(ctx, out, "triangle", f, f, now + i * 0.1, 0.22, 0.08),
      );
    else {
      // A stadium cheer: a swelling crowd roar with happy whistles on top.
      noise(ctx, out, now, 2.2, 0.2, 700, 1800);
      [0.2, 0.55, 0.9].forEach((t, i) =>
        tone(
          ctx,
          out,
          "sine",
          1200 + i * 200,
          2000 + i * 300,
          now + t,
          0.35,
          0.05,
        ),
      );
    }
  } catch {
    // Audio is optional; the race works the same without it.
  }
}

/** A looping engine hum whose pitch follows the kart's speed. */
export function startEngineHum() {
  const audio = sfx();
  if (!audio) return { setSpeed: (_: number) => {}, stop: () => {} };
  const { ctx, out } = audio;
  const low = ctx.createOscillator();
  const buzz = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  low.type = "sawtooth";
  buzz.type = "square";
  filter.type = "lowpass";
  filter.frequency.value = 600;
  gain.gain.value = 0.0001;
  low.connect(filter);
  buzz.connect(filter);
  filter.connect(gain).connect(out);
  low.start();
  buzz.start();
  let stopped = false;
  return {
    /** 0 at idle, 1 at top speed, above 1 while boosting; negative is silent. */
    setSpeed(level: number) {
      if (stopped) return;
      const t = ctx.currentTime;
      const pitch = 55 + 95 * Math.max(0, level);
      low.frequency.setTargetAtTime(pitch, t, 0.08);
      buzz.frequency.setTargetAtTime(pitch * 2.01, t, 0.08);
      filter.frequency.setTargetAtTime(400 + 900 * level, t, 0.1);
      gain.gain.setTargetAtTime(
        level < 0 ? 0.0001 : 0.025 + 0.03 * Math.min(1, level),
        t,
        0.1,
      );
    },
    stop() {
      if (stopped) return;
      stopped = true;
      try {
        gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        low.stop(ctx.currentTime + 0.3);
        buzz.stop(ctx.currentTime + 0.3);
        low.onended = () => {
          low.disconnect();
          buzz.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      } catch {
        /* The audio device may already be gone. */
      }
    },
  };
}
