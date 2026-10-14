import { playVoice } from "./nauticalAudio.ts";

/** Splash Oasis ride sounds: filtered noise for water, short sine chirps for voices. */
const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();

function noise(ctx: AudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}

/** One noise burst through a swept filter: splashes sweep down, whooshes sweep up. */
function waterNoise(
  type: BiquadFilterType,
  from: number,
  to: number,
  seconds: number,
  peak: number,
  attack = 0.01,
) {
  playVoice(undefined, (ctx, destination, track, cleanup) => {
    const now = ctx.currentTime;
    const source = track(ctx.createBufferSource());
    source.buffer = noise(ctx);
    const filter = track(ctx.createBiquadFilter());
    filter.type = type;
    filter.Q.value = type === "bandpass" ? 0.9 : 0.5;
    filter.frequency.setValueAtTime(from, now);
    filter.frequency.exponentialRampToValueAtTime(to, now + seconds);
    const gain = track(ctx.createGain());
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
    source.connect(filter).connect(gain).connect(destination);
    source.onended = cleanup;
    source.start(now, Math.random());
    source.stop(now + seconds + 0.05);
  });
}

/** Little tap splash at 0.3, landing splash at 1. */
export function playSplash(size = 0.5) {
  waterNoise(
    "lowpass",
    900 + size * 2600,
    220,
    0.25 + size * 0.9,
    0.08 + size * 0.22,
  );
}

export function playWhoosh() {
  waterNoise("bandpass", 260, 2400, 0.7, 0.14, 0.3);
}

export function playSquirt() {
  waterNoise("highpass", 2600, 1200, 0.35, 0.12, 0.02);
}

/** Sine blips with a pitch slide: bubbles, giggles and critter calls. */
function chirps(
  notes: readonly (readonly [from: number, to: number])[],
  step: number,
  type: OscillatorType = "sine",
  peak = 0.09,
) {
  playVoice(undefined, (ctx, destination, track, cleanup) => {
    const now = ctx.currentTime;
    notes.forEach(([from, to], i) => {
      const start = now + i * step;
      const osc = track(ctx.createOscillator());
      osc.type = type;
      osc.frequency.setValueAtTime(from, start);
      osc.frequency.exponentialRampToValueAtTime(to, start + step * 0.9);
      const gain = track(ctx.createGain());
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + step * 0.95);
      osc.connect(gain).connect(destination);
      if (i === notes.length - 1) osc.onended = cleanup;
      osc.start(start);
      osc.stop(start + step);
    });
  });
}

export function playBloop() {
  chirps([[520 + Math.random() * 200, 1100]], 0.14);
}

export function playGiggle() {
  chirps(
    [
      [900, 1300],
      [820, 1200],
      [760, 1150],
      [700, 1050],
      [980, 1500],
    ],
    0.11,
    "triangle",
  );
}

export function playWheee() {
  chirps([[500, 1400]], 0.9, "triangle", 0.07);
}

export function playSparkle() {
  chirps(
    [
      [1568, 1580],
      [2093, 2100],
      [2637, 2650],
    ],
    0.08,
  );
}

const CRITTER_CALLS = {
  parrot: [
    [2200, 3200],
    [2600, 3600],
    [2200, 3400],
  ],
  monkey: [
    [380, 620],
    [420, 700],
    [460, 780],
  ],
  turtle: [
    [220, 180],
    [200, 150],
  ],
  frog: [
    [160, 120],
    [180, 120],
  ],
  flamingo: [
    [700, 520],
    [760, 560],
  ],
} as const;

export function playCritter(id: keyof typeof CRITTER_CALLS) {
  chirps(
    CRITTER_CALLS[id],
    id === "parrot" ? 0.07 : 0.16,
    id === "frog" ? "square" : "triangle",
    id === "frog" ? 0.04 : 0.08,
  );
}
