import { getSharedAudioBus } from "./audioBus.ts";

export type CuteSound = "pop" | "sparkle" | "boing" | "yay" | "whoosh";

type Note = {
  freq: number;
  to?: number;
  at: number;
  dur: number;
  type: OscillatorType;
  gain: number;
};

const NOTES: Record<Exclude<CuteSound, "whoosh">, Note[]> = {
  pop: [{ freq: 520, to: 980, at: 0, dur: 0.09, type: "sine", gain: 0.3 }],
  sparkle: [
    { freq: 1568, at: 0, dur: 0.12, type: "triangle", gain: 0.12 },
    { freq: 2093, at: 0.06, dur: 0.16, type: "triangle", gain: 0.1 },
  ],
  boing: [{ freq: 320, to: 140, at: 0, dur: 0.28, type: "sine", gain: 0.22 }],
  yay: [523.25, 659.25, 783.99, 1046.5].map((freq, i): Note => ({
    freq,
    at: i * 0.09,
    dur: 0.22,
    type: "triangle",
    gain: 0.2,
  })),
};

/** Short procedural cartoon sounds on the shared SFX bus, so mute and volume apply. */
export function playCuteSound(sound: CuteSound): void {
  try {
    const bus = getSharedAudioBus();
    const ctx = bus.getContext();
    if (!ctx || ctx.state === "closed") return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    const destination = bus.getSfxDestination() ?? ctx.destination;
    const now = ctx.currentTime;
    if (sound === "whoosh") {
      const length = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.4);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      noise.connect(filter).connect(gain).connect(destination);
      noise.start(now);
      return;
    }
    for (const note of NOTES[sound]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + note.at;
      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, start);
      if (note.to)
        osc.frequency.exponentialRampToValueAtTime(note.to, start + note.dur);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);
      osc.connect(gain).connect(destination);
      osc.start(start);
      osc.stop(start + note.dur + 0.02);
    }
  } catch {
    // Sound is a bonus; games keep working without Web Audio.
  }
}
