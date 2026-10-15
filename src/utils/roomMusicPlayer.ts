import { getSharedAudioBus, type AudioBus } from "./audioBus.ts";
import {
  collectDueSteps,
  getSharedJukeboxController,
  whiteNoiseBuffer,
} from "./proceduralJukebox.ts";
import {
  ROOM_MUSIC_FALLBACK,
  midiToFrequency,
  roomMusicFor,
  roomNotesAt,
  roomStepSeconds,
  shouldPlayRoomMusic,
  type RoomBed,
  type RoomMusicTrack,
  type RoomNote,
  type ToneVoice,
} from "./roomMusic.ts";

/** Room music sits well below sound effects so it stays a soft bed for small ears. */
const ROOM_MUSIC_LEVEL = 0.3;
const CROSSFADE_SECONDS = 1.5;
const SCHEDULE_AHEAD_SECONDS = 0.1;
const SCHEDULER_INTERVAL_MS = 25;
const MAX_CATCH_UP_SECONDS = 1;
const NOISE_SECONDS = 2;

type ToneSpec = {
  wave: OscillatorType;
  /** Extra partials as [frequency ratio, level] on top of the fundamental. */
  partials: readonly (readonly [number, number])[];
  attack: number;
  decay: number;
  peak: number;
  cutoff?: number;
};

const TONES: Record<ToneVoice, ToneSpec> = {
  "music-box": {
    wave: "sine",
    partials: [[4, 0.3]],
    attack: 0.005,
    decay: 1.4,
    peak: 0.22,
  },
  marimba: {
    wave: "sine",
    partials: [[4, 0.15]],
    attack: 0.004,
    decay: 0.5,
    peak: 0.25,
  },
  bell: {
    wave: "sine",
    partials: [
      [2.76, 0.3],
      [5.4, 0.1],
    ],
    attack: 0.003,
    decay: 2,
    peak: 0.2,
  },
  "steel-drum": {
    wave: "sine",
    partials: [[2, 0.25]],
    attack: 0.003,
    decay: 0.9,
    peak: 0.22,
  },
  ukulele: {
    wave: "triangle",
    partials: [[2, 0.1]],
    attack: 0.003,
    decay: 0.7,
    peak: 0.2,
    cutoff: 3000,
  },
  pizzicato: {
    wave: "triangle",
    partials: [[2, 0.08]],
    attack: 0.003,
    decay: 0.22,
    peak: 0.25,
    cutoff: 2400,
  },
  pad: {
    wave: "triangle",
    partials: [[1.004, 0.8]],
    attack: 0.35,
    decay: 2.2,
    peak: 0.12,
    cutoff: 1400,
  },
  lounge: {
    wave: "triangle",
    partials: [[2, 0.1]],
    attack: 0.01,
    decay: 1.2,
    peak: 0.16,
  },
  calliope: {
    wave: "square",
    partials: [[1.005, 0.6]],
    attack: 0.02,
    decay: 0.45,
    peak: 0.12,
    cutoff: 1800,
  },
  pulse: {
    wave: "sawtooth",
    partials: [],
    attack: 0.005,
    decay: 0.25,
    peak: 0.14,
    cutoff: 600,
  },
};

function playTone(
  ctx: AudioContext,
  dest: AudioNode,
  now: number,
  frequency: number,
  spec: ToneSpec,
  level: number,
): void {
  const end = now + spec.attack + spec.decay;
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.linearRampToValueAtTime(spec.peak * level, now + spec.attack);
  envelope.gain.exponentialRampToValueAtTime(0.001, end);
  envelope.connect(dest);
  let input: AudioNode = envelope;
  if (spec.cutoff !== undefined) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = spec.cutoff;
    filter.connect(envelope);
    input = filter;
  }
  const parts: (readonly [number, number])[] = [[1, 1], ...spec.partials];
  for (const [ratio, amount] of parts) {
    const osc = ctx.createOscillator();
    const mix = ctx.createGain();
    osc.type = spec.wave;
    osc.frequency.value = frequency * ratio;
    mix.gain.value = amount;
    osc.connect(mix);
    mix.connect(input);
    osc.start(now);
    osc.stop(end);
  }
}

function playKick(
  ctx: AudioContext,
  dest: AudioNode,
  now: number,
  peak: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  gain.gain.setValueAtTime(peak, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playSeagull(
  ctx: AudioContext,
  dest: AudioNode,
  now: number,
  peak: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1700, now);
  osc.frequency.linearRampToValueAtTime(2300, now + 0.12);
  osc.frequency.linearRampToValueAtTime(1500, now + 0.3);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.32);
}

type NoiseSpec = {
  filter: BiquadFilterType;
  frequency: number;
  q: number;
  peak: number;
  decay: number;
};

const NOISE_HITS: Record<"hat" | "snare" | "splash", NoiseSpec> = {
  hat: { filter: "highpass", frequency: 7000, q: 1, peak: 0.07, decay: 0.04 },
  snare: { filter: "bandpass", frequency: 1500, q: 1, peak: 0.09, decay: 0.12 },
  splash: {
    filter: "bandpass",
    frequency: 2500,
    q: 0.8,
    peak: 0.1,
    decay: 0.5,
  },
};

function playNoiseHit(
  ctx: AudioContext,
  dest: AudioNode,
  noise: AudioBuffer,
  now: number,
  spec: NoiseSpec,
  level: number,
): void {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = spec.filter;
  filter.frequency.value = spec.frequency;
  filter.Q.value = spec.q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(spec.peak * level, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + spec.decay);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(now, Math.random());
  src.stop(now + spec.decay);
}

function playRoomNote(
  ctx: AudioContext,
  dest: AudioNode,
  noise: AudioBuffer,
  note: RoomNote,
  now: number,
): void {
  const { voice, level } = note;
  if (voice === "kick") {
    playKick(ctx, dest, now, 0.22 * level);
  } else if (voice === "seagull") {
    playSeagull(ctx, dest, now, 0.05 * level);
  } else if (voice === "hat" || voice === "snare" || voice === "splash") {
    playNoiseHit(ctx, dest, noise, now, NOISE_HITS[voice], level);
  } else {
    playTone(ctx, dest, now, midiToFrequency(note.midi), TONES[voice], level);
  }
}

/** Looping noise through a filter, with a slow LFO swelling its level. */
function startBed(
  ctx: AudioContext,
  dest: AudioNode,
  bed: RoomBed,
  noise: AudioBuffer,
): AudioScheduledSourceNode[] {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = bed.filter;
  filter.frequency.value = bed.cutoff;
  filter.Q.value = bed.q;
  const gain = ctx.createGain();
  gain.gain.value = bed.level;
  const swell = ctx.createOscillator();
  swell.frequency.value = bed.swellHz;
  const depth = ctx.createGain();
  depth.gain.value = bed.swellDepth;
  swell.connect(depth);
  depth.connect(gain.gain);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start();
  swell.start();
  return [src, swell];
}

/** Soft limiter so stacked notes can never jump loud, whatever the bus volume. */
function createRoomOutput(
  ctx: AudioContext | null,
  destination: AudioNode | null,
): GainNode | null {
  if (!ctx || !destination) return null;
  try {
    const out = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.2;
    out.connect(limiter);
    limiter.connect(destination);
    return out;
  } catch {
    return null;
  }
}

type RoomLayerState = {
  track: RoomMusicTrack;
  gain: GainNode;
  beds: AudioScheduledSourceNode[];
  step: number;
  nextStepTime: number;
};

class RoomMusicPlayer {
  private readonly bus: AudioBus;
  private readonly ctx: AudioContext | null;
  private readonly out: GainNode | null;
  private noise: AudioBuffer | null = null;
  private track: RoomMusicTrack = ROOM_MUSIC_FALLBACK;
  /** The track currently audible; a retired layer only fades out. */
  private layer: RoomLayerState | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private on = false;
  private visible = true;

  constructor(bus: AudioBus) {
    this.bus = bus;
    this.ctx = bus.getContext();
    this.out = createRoomOutput(this.ctx, bus.getMusicDestination());
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () =>
        this.setVisible(document.visibilityState !== "hidden"),
      );
    }
  }

  setPlace(placeId: string): void {
    const next = roomMusicFor(placeId);
    if (next === this.track) return;
    this.track = next;
    if (this.on) this.switchLayer();
  }

  setOn(on: boolean): void {
    if (on === this.on) return;
    this.on = on;
    if (on) this.switchLayer();
    else this.retireLayer();
    this.sync();
  }

  isOn(): boolean {
    return this.on;
  }

  private setVisible(visible: boolean): void {
    this.visible = visible;
    this.sync();
  }

  /** Runs the scheduler only while on and visible; a hidden tab suspends the clock. */
  private sync(): void {
    const running = this.on && this.visible;
    if (running && this.timer === null) {
      this.timer = setInterval(() => this.tick(), SCHEDULER_INTERVAL_MS);
    } else if (!running && this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (!this.ctx || !this.on) return;
    try {
      if (this.visible) void this.ctx.resume().catch(() => {});
      else void this.ctx.suspend().catch(() => {});
    } catch {
      /* ignore: audio may be unavailable in exotic test doubles */
    }
  }

  private tick(): void {
    const ctx = this.ctx;
    const layer = this.layer;
    if (!ctx || !layer) return;
    const now = ctx.currentTime;
    const live = shouldPlayRoomMusic({
      on: this.on,
      visible: this.visible,
      musicMuted: this.bus.isMusicMuted(),
      masterMuted: this.bus.isMasterMuted(),
      jukeboxPlaying: getSharedJukeboxController().isPlaying(),
    });
    if (!live) {
      // Keep the clock at "now" so unmuting resumes the loop without a burst of stale steps.
      layer.nextStepTime = now;
      return;
    }
    try {
      const { due, nextStep, nextStepTime } = collectDueSteps(
        layer.step,
        layer.nextStepTime,
        roomStepSeconds(layer.track),
        now,
        SCHEDULE_AHEAD_SECONDS,
        MAX_CATCH_UP_SECONDS,
      );
      layer.step = nextStep;
      layer.nextStepTime = nextStepTime;
      const noise = this.getNoise(ctx);
      for (const { step, time } of due) {
        for (const note of roomNotesAt(layer.track, step)) {
          playRoomNote(ctx, layer.gain, noise, note, time);
        }
      }
    } catch {
      /* keep the loop alive even if a single tick fails to synthesize */
    }
  }

  private switchLayer(): void {
    this.retireLayer();
    this.layer = this.startLayer(this.track);
  }

  private startLayer(track: RoomMusicTrack): RoomLayerState | null {
    const ctx = this.ctx;
    const out = this.out;
    if (!ctx || !out) return null;
    try {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(
        ROOM_MUSIC_LEVEL,
        now + CROSSFADE_SECONDS,
      );
      gain.connect(out);
      const beds = track.bed
        ? startBed(ctx, gain, track.bed, this.getNoise(ctx))
        : [];
      return { track, gain, beds, step: 0, nextStepTime: now };
    } catch {
      return null;
    }
  }

  private retireLayer(): void {
    const layer = this.layer;
    const ctx = this.ctx;
    this.layer = null;
    if (!layer || !ctx) return;
    const now = ctx.currentTime;
    layer.gain.gain.cancelScheduledValues(now);
    layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
    layer.gain.gain.linearRampToValueAtTime(0, now + CROSSFADE_SECONDS);
    setTimeout(
      () => {
        for (const source of layer.beds) {
          try {
            source.stop();
          } catch {
            /* already stopped */
          }
        }
        layer.gain.disconnect();
      },
      (CROSSFADE_SECONDS + 0.2) * 1000,
    );
  }

  private getNoise(ctx: AudioContext): AudioBuffer {
    if (!this.noise) this.noise = whiteNoiseBuffer(ctx, NOISE_SECONDS);
    return this.noise;
  }
}

let sharedPlayer: RoomMusicPlayer | null = null;

function getSharedRoomMusicPlayer(): RoomMusicPlayer {
  if (!sharedPlayer) sharedPlayer = new RoomMusicPlayer(getSharedAudioBus());
  return sharedPlayer;
}

/** Tells the room soundtrack which room the child is in. Crossfades when it changes. */
export function setRoomMusicPlace(placeId: string): void {
  getSharedRoomMusicPlayer().setPlace(placeId);
}

/** The World speaker button. Music starts from this tap and stays on across rooms. */
export function setRoomMusicOn(on: boolean): void {
  getSharedRoomMusicPlayer().setOn(on);
}

export function isRoomMusicOn(): boolean {
  return getSharedRoomMusicPlayer().isOn();
}
