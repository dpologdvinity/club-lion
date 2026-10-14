/**
 * Tiny procedural sound effects for the Bubble Pop and Coloring Book games.
 * Everything routes through the shared SFX bus, so the global mute and
 * volume controls reach it; there are no audio files.
 */
import { getSharedAudioBus } from "./audioBus.ts";

type Voice = {
  type: OscillatorType;
  from: number;
  to?: number;
  at?: number;
  length: number;
  peak?: number;
};

function output(): { ctx: AudioContext; out: AudioNode } | null {
  const bus = getSharedAudioBus();
  const ctx = bus.getContext();
  const out = bus.getSfxDestination();
  if (!ctx || !out) return null;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return { ctx, out };
}

function play(voices: Voice[]) {
  try {
    const target = output();
    if (!target) return;
    const { ctx, out } = target;
    for (const voice of voices) {
      const start = ctx.currentTime + (voice.at ?? 0);
      const end = start + voice.length;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = voice.type;
      osc.frequency.setValueAtTime(voice.from, start);
      if (voice.to) osc.frequency.exponentialRampToValueAtTime(voice.to, end);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(voice.peak ?? 0.2, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  } catch {
    // Sound is optional; a failed effect must never interrupt play.
  }
}

/** Pentatonic steps keep any run of pops musical. */
const STEPS = [0, 2, 4, 7, 9, 12, 14, 16];
const note = (base: number, step: number) =>
  base * 2 ** (STEPS[step % STEPS.length] / 12);

/** A soft, round bubble pop; higher steps sound brighter for combos. */
export function playPop(step = 0) {
  const pitch = note(520, step);
  play([
    { type: "sine", from: pitch * 1.6, to: pitch * 0.5, length: 0.09 },
    {
      type: "triangle",
      from: pitch * 3,
      to: pitch * 2,
      length: 0.04,
      peak: 0.06,
    },
  ]);
}

/** A bouncy little giggle for a surprise popping out. */
export function playGiggle() {
  play(
    [0, 1, 2, 3].map((index) => ({
      type: "triangle",
      from: 900 + (index % 2) * 260,
      to: 760 + (index % 2) * 200,
      at: 0.07 + index * 0.075,
      length: 0.06,
      peak: 0.12,
    })),
  );
}

/** A rising sparkle arpeggio for golden bubbles, rainbows and finished pages. */
export function playSparkle(notes = 4) {
  play(
    Array.from({ length: notes }, (_, index) => ({
      type: "sine",
      from: note(880, index * 2),
      at: index * 0.06,
      length: 0.28,
      peak: 0.1,
    })),
  );
}

/** A watery paint "bloop", pitched by the swatch so colors feel different. */
export function playFill(step = 0) {
  const pitch = note(330, step);
  play([
    {
      type: "sine",
      from: pitch * 0.7,
      to: pitch * 1.2,
      length: 0.14,
      peak: 0.16,
    },
  ]);
}

/** A gentle downward swish for the eraser and undo. */
export function playSwish() {
  play([{ type: "triangle", from: 700, to: 260, length: 0.16, peak: 0.07 }]);
}
