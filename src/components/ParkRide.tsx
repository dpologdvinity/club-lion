import { useEffect, useRef, useState, type PointerEvent } from "react";
import { DoorOpen, RotateCcw } from "lucide-react";
import {
  DEFAULT_AVATAR_LOOK,
  type AvatarLook,
  type PetState,
} from "../types/world.ts";
import { getSharedAudioBus } from "../utils/audioBus.ts";
import {
  PARK_RIDES,
  type ParkRideId,
  type RideBeat,
  type RideCue,
} from "../utils/parkRides.ts";
import { RIDE_SCENES } from "./ParkRideScenes";
import "./parkRides.css";

export type ParkRideProps = {
  ride: ParkRideId;
  look?: AvatarLook;
  pet?: PetState;
  onClose: () => void;
  /** Reports each naturally finished run. Rewards are granted by the caller. */
  onFinish?: () => void;
};

type Burst = { id: number; x: number; y: number; emoji: string };

const CHEERS = ["🎉", "😄", "⭐", "💖", "🙌", "🥳", "✨", "🦁"];
const CONFETTI = ["#ff5d8f", "#ffd23f", "#3bceac", "#5b8cff", "#ff8c42"];
// Moments where the rider throws both paws up on their own.
const ARMS_UP: readonly RideCue[] = ["top", "drop", "splash"];

// ---------- Procedural ride audio, routed through the shared bus ----------

function audio() {
  const bus = getSharedAudioBus();
  const ctx = bus.getContext();
  if (!ctx || ctx.state === "closed") return null;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return {
    ctx,
    sfx: bus.getSfxDestination() ?? ctx.destination,
    music: bus.getMusicDestination() ?? ctx.destination,
  };
}

function tone(
  ctx: AudioContext,
  out: AudioNode,
  freq: number,
  start: number,
  length: number,
  volume: number,
  type: OscillatorType = "sine",
  endFreq?: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq)
    osc.frequency.exponentialRampToValueAtTime(endFreq, start + length);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

function whoosh(
  ctx: AudioContext,
  out: AudioNode,
  start: number,
  length: number,
  volume: number,
  from: number,
  to: number,
) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(to, start + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + length * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  noise.connect(filter).connect(gain).connect(out);
  noise.start(start);
}

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

function playCheer() {
  try {
    const a = audio();
    if (!a) return;
    const now = a.ctx.currentTime;
    const first = Math.floor(Math.random() * 4);
    [0, 2, 3].forEach((step, i) =>
      tone(
        a.ctx,
        a.sfx,
        PENTATONIC[first + step],
        now + i * 0.07,
        0.3,
        0.12,
        "triangle",
      ),
    );
    tone(a.ctx, a.sfx, 1400, now, 0.08, 0.05, "square", 2200);
  } catch {
    /* Audio is a bonus; the ride still works without it. */
  }
}

function playCue(ride: ParkRideId, cue: RideCue) {
  try {
    const a = audio();
    if (!a) return;
    const { ctx, sfx } = a;
    const now = ctx.currentTime;
    const ticks = (count: number, gap: number) => {
      for (let i = 0; i < count; i++)
        tone(ctx, sfx, i % 2 ? 900 : 760, now + i * gap, 0.05, 0.05, "square");
    };
    if (cue === "rise" && ride === "drop-tower") ticks(17, 0.5);
    else if (cue === "climb") ticks(19, 0.5);
    else if (cue === "rise") {
      [392, 523.25, 659.25, 783.99].forEach((f, i) =>
        tone(ctx, sfx, f, now + i * 0.35, 1.2, 0.08),
      );
      whoosh(ctx, sfx, now, 3, 0.05, 300, 900);
    } else if (cue === "top")
      [1046.5, 1318.5, 1568, 2093].forEach((f, i) =>
        tone(ctx, sfx, f, now + i * 0.16, 1.4, 0.07),
      );
    else if (cue === "drop") {
      whoosh(ctx, sfx, now, 1.8, 0.25, 400, 3200);
      tone(ctx, sfx, 880, now, 1.3, 0.08, "triangle", 160);
    } else if (cue === "splash") {
      whoosh(ctx, sfx, now, 1.6, 0.35, 2600, 220);
      tone(ctx, sfx, 300, now, 0.35, 0.15, "sine", 90);
    } else if (cue === "spin")
      [0, 0.5, 1].forEach((t) =>
        tone(ctx, sfx, 500, now + t, 0.45, 0.06, "sine", 1100),
      );
    else if (cue === "float") tone(ctx, sfx, 420, now, 0.25, 0.08, "sine", 180);
    else if (cue === "descend")
      [783.99, 659.25, 523.25].forEach((f, i) =>
        tone(ctx, sfx, f, now + i * 0.4, 1.1, 0.07),
      );
    else if (cue === "slow" || cue === "home")
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(ctx, sfx, f, now + i * 0.13, 0.5, 0.09, "triangle"),
      );
  } catch {
    /* Audio is a bonus; the ride still works without it. */
  }
}

// A carousel waltz: [MIDI note, beats]. Oom-pah-pah roots follow each bar.
const WALTZ: readonly (readonly [number, number])[] = [
  [72, 1],
  [76, 1],
  [79, 1],
  [84, 2],
  [79, 1],
  [81, 1],
  [79, 1],
  [76, 1],
  [79, 3],
  [77, 1],
  [81, 1],
  [84, 1],
  [83, 2],
  [79, 1],
  [77, 1],
  [76, 1],
  [74, 1],
  [72, 3],
];
const WALTZ_ROOTS = [48, 48, 53, 48, 53, 55, 55, 48];
const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);

/** Schedules the whole music-box tune up front; returns a stop function. */
function playMusicBox(seconds: number): () => void {
  try {
    const a = audio();
    if (!a) return () => {};
    const { ctx } = a;
    const out = ctx.createGain();
    out.connect(a.music);
    const beat = 0.42;
    const start = ctx.currentTime + 0.1;
    const end = start + seconds - 3;
    for (let bar = 0; start + bar * 3 * beat < end; bar++) {
      const t = start + bar * 3 * beat;
      const root = WALTZ_ROOTS[bar % WALTZ_ROOTS.length];
      tone(ctx, out, midi(root), t, 0.5, 0.09, "triangle");
      tone(ctx, out, midi(root + 16), t + beat, 0.25, 0.035, "triangle");
      tone(ctx, out, midi(root + 19), t + beat * 2, 0.25, 0.035, "triangle");
    }
    let t = start;
    for (let i = 0; t < end; i++) {
      const [note, beats] = WALTZ[i % WALTZ.length];
      tone(ctx, out, midi(note), t, 0.9, 0.1);
      tone(ctx, out, midi(note) * 3, t, 0.35, 0.025);
      t += beats * beat;
    }
    return () => {
      try {
        out.disconnect();
      } catch {
        /* Already stopped. */
      }
    };
  } catch {
    return () => {};
  }
}

// ---------- Ride shell ----------

export function ParkRide({
  ride,
  look = DEFAULT_AVATAR_LOOK,
  pet,
  onClose,
  onFinish,
}: ParkRideProps) {
  const info = PARK_RIDES[ride];
  const Scene = RIDE_SCENES[ride];
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const [beat, setBeat] = useState<RideBeat>(info.beats[0]);
  const [armsUp, setArmsUp] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const finishRef = useRef(onFinish);
  const holding = useRef(false);
  const timers = useRef(new Set<number>());
  const nextBurst = useRef(0);
  const stageRef = useRef<HTMLButtonElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  const later = (ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  };
  const raiseArms = () => {
    setArmsUp(true);
    later(1100, () => setArmsUp(false));
  };

  useEffect(() => {
    const ids = info.beats.map((b) =>
      window.setTimeout(() => {
        setBeat(b);
        playCue(ride, b.cue);
        if (ARMS_UP.includes(b.cue)) raiseArms();
      }, b.at * 1000),
    );
    ids.push(
      window.setTimeout(() => {
        holding.current = false;
        setDone(true);
        finishRef.current?.();
      }, info.seconds * 1000),
    );
    const stopMusic =
      ride === "carousel" ? playMusicBox(info.seconds) : undefined;
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      stopMusic?.();
    };
    // A new run restarts the timeline; raiseArms only touches refs and setters.
  }, [ride, run, info]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    let mounted = true;
    // The parent Dialog opens in its effect after this child mounts.
    queueMicrotask(() => {
      if (mounted) (done ? againRef : stageRef).current?.focus();
    });
    return () => {
      mounted = false;
    };
  }, [done]);

  const cheer = (x: number, y: number) => {
    const id = nextBurst.current++;
    const emoji = CHEERS[id % CHEERS.length];
    setBursts((list) => [...list.slice(-5), { id, x, y, emoji }]);
    later(1400, () => setBursts((list) => list.filter((b) => b.id !== id)));
    raiseArms();
    playCheer();
  };
  const tap = (event: PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    cheer(
      ((event.clientX - box.left) / box.width) * 100,
      ((event.clientY - box.top) / box.height) * 100,
    );
  };
  const again = () => {
    setDone(false);
    setBeat(info.beats[0]);
    setRun((n) => n + 1);
  };

  return (
    <section
      className={`park-ride pr-${ride}`}
      aria-label={`${info.name} ride`}
    >
      <div className="pr-stage">
        <Scene
          key={run}
          look={look}
          pet={pet}
          armsUp={armsUp}
          holding={holding}
        />
        <button
          ref={stageRef}
          type="button"
          className="pr-tap"
          aria-label={ride === "teacups" ? "Cheer and spin" : "Cheer"}
          disabled={done}
          onPointerDown={(event) => {
            holding.current = true;
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerUp={(event) => {
            holding.current = false;
            tap(event);
          }}
          onPointerCancel={() => {
            holding.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter")
              holding.current = true;
          }}
          onKeyUp={() => {
            holding.current = false;
          }}
          onClick={(event) => {
            // Keyboard activation has no pointer position: cheer at the rider.
            if (event.detail === 0) cheer(50, 45);
          }}
        />
        {bursts.map((b) => (
          <span
            key={b.id}
            className="pr-burst"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            aria-hidden="true"
          >
            {CONFETTI.flatMap((color, c) =>
              [0, 1, 2].map((k) => {
                const angle = ((c * 3 + k) / 15) * Math.PI * 2 + b.id;
                const reach = 70 + ((c + k * 2 + b.id) % 4) * 22;
                return (
                  <i
                    key={`${c}-${k}`}
                    style={{
                      background: color,
                      "--dx": `${Math.cos(angle) * reach}px`,
                      "--dy": `${Math.sin(angle) * reach - 30}px`,
                      "--spin": `${(c * 3 + k) * 47}deg`,
                    }}
                  />
                );
              }),
            )}
            <b>{b.emoji}</b>
          </span>
        ))}
        {done && (
          <div className="pr-finale">
            <div className="pr-finale-stars" aria-hidden="true">
              ⭐ 🎉 ⭐
            </div>
            <div className="pr-finale-actions">
              <button
                ref={againRef}
                type="button"
                className="pr-big-button pr-again"
                aria-label="Ride again"
                title="Ride again"
                onClick={again}
              >
                <RotateCcw size={40} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pr-big-button pr-exit"
                aria-label="Exit ride"
                title="Exit ride"
                onClick={onClose}
              >
                <DoorOpen size={40} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="sr-only" role="status">
        {done ? "Ride complete! Ride again or exit." : beat.say}
      </p>
    </section>
  );
}
