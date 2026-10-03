import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Dialog } from "./Dialog";
import {
  generateChart,
  findHittableNote,
  judge,
  pointsFor,
  nextCombo,
  comboMultiplier,
  coinsForScore,
  JUDGMENT_LABEL,
  JUDGMENT_WINDOW_MS,
  LANE_KEYS,
  LANE_ARROW_KEYS,
  type BeatNote,
  type Judgment,
  type Lane,
} from "../utils/rhythmEngine.ts";

const BEAT_COUNT = 32;
const BPM = 120;
const NOTE_TRAVEL_MS = 1800;
const LANE_LABEL = ["D", "F", "J", "K"] as const;
const JUDGMENT_CLASS: Record<Judgment, string> = {
  perfect: "dj-badge-perfect",
  great: "dj-badge-great",
  good: "dj-badge-good",
  miss: "dj-badge-miss",
};

type Result = { score: number; combo: number; coins: number };

function getAudioContextClass(): typeof AudioContext | undefined {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

/** 808 kick: a pitch envelope sweeping from 150Hz down to 40Hz. */
function playKick(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.9, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

/** Snare: bandpass-filtered white noise burst layered over a sine body. */
function playSnare(ctx: AudioContext) {
  const bufferSize = Math.floor(ctx.sampleRate * 0.2);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(180, ctx.currentTime);
  bodyGain.gain.setValueAtTime(0.4, ctx.currentTime);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  body.connect(bodyGain);
  bodyGain.connect(ctx.destination);

  noise.start();
  body.start();
  body.stop(ctx.currentTime + 0.12);
}

/** Hi-hat: highpass-filtered metallic pulse of white noise. */
function playHiHat(ctx: AudioContext) {
  const bufferSize = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

/** Synth bass drop: a sawtooth with a resonant lowpass sweep. */
function playBassDrop(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.4);
  filter.type = "lowpass";
  filter.Q.value = 12;
  filter.frequency.setValueAtTime(3000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

const LANE_SOUND = [playKick, playSnare, playHiHat, playBassDrop];

export function DJBeatDrop({
  onFinish,
  onClose,
  best,
}: {
  onFinish: (result: Result) => void;
  onClose: () => void;
  best: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [notes, setNotes] = useState<BeatNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<{
    judgment: Judgment;
    key: number;
  } | null>(null);

  const chartRef = useRef<BeatNote[]>([]);
  const hitIdsRef = useRef<Set<number>>(new Set());
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const startRef = useRef(0);
  const frameRef = useRef(0);
  const doneRef = useRef(false);
  const feedbackIdRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const bestAtStart = useRef(best);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const audioContext = () => {
    if (!audioRef.current) {
      const AudioContextClass = getAudioContextClass();
      if (AudioContextClass) audioRef.current = new AudioContextClass();
    }
    return audioRef.current;
  };

  useEffect(() => {
    return () => {
      audioRef.current?.close().catch(() => {});
    };
  }, []);

  const showFeedback = (judgment: Judgment) => {
    feedbackIdRef.current += 1;
    setFeedback({ judgment, key: feedbackIdRef.current });
  };

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const finalResult: Result = {
      score: scoreRef.current,
      combo: comboRef.current,
      coins: coinsForScore(scoreRef.current),
    };
    setResult(finalResult);
    setPlaying(false);
    finishRef.current(finalResult);
  };

  useEffect(() => {
    if (!playing) return;
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const lastNote = chartRef.current[chartRef.current.length - 1];
      if (lastNote && elapsed > lastNote.timeMs + NOTE_TRAVEL_MS) {
        finish();
        return;
      }
      setNotes(
        chartRef.current.filter(
          (note) =>
            !hitIdsRef.current.has(note.id) &&
            elapsed > note.timeMs - NOTE_TRAVEL_MS &&
            elapsed < note.timeMs + JUDGMENT_WINDOW_MS.good + 400,
        ),
      );
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [playing]);

  const hitLane = (lane: Lane) => {
    if (!playing) return;
    const elapsed = performance.now() - startRef.current;
    const note = findHittableNote(
      chartRef.current,
      lane,
      hitIdsRef.current,
      elapsed,
    );
    const ctx = audioContext();
    if (ctx) LANE_SOUND[lane](ctx);
    if (!note) return;
    hitIdsRef.current.add(note.id);
    const offset = elapsed - note.timeMs;
    const judgment = judge(offset);
    const gained = pointsFor(judgment, comboRef.current);
    scoreRef.current += gained;
    comboRef.current = nextCombo(judgment, comboRef.current);
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    showFeedback(judgment);
  };

  useEffect(() => {
    if (!playing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement)?.tagName,
        )
      )
        return;
      const keyIndex = LANE_KEYS.indexOf(
        event.key.toUpperCase() as (typeof LANE_KEYS)[number],
      );
      const arrowIndex = LANE_ARROW_KEYS.indexOf(
        event.key as (typeof LANE_ARROW_KEYS)[number],
      );
      const lane = keyIndex >= 0 ? keyIndex : arrowIndex;
      if (lane < 0) return;
      event.preventDefault();
      hitLane(lane as Lane);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const start = () => {
    bestAtStart.current = best;
    chartRef.current = generateChart(BEAT_COUNT, BPM);
    hitIdsRef.current = new Set();
    scoreRef.current = 0;
    comboRef.current = 0;
    doneRef.current = false;
    startRef.current = performance.now();
    setScore(0);
    setCombo(0);
    setNotes([]);
    setFeedback(null);
    setResult(null);
    setPlaying(true);
  };

  if (!playing && !result) {
    return (
      <div className="game-intro dj-intro">
        <div className="dj-hero" aria-hidden="true">
          <span>🎧</span>
          <span>🎵</span>
          <span>🔊</span>
        </div>
        <h3>DJ Beat Drop!</h3>
        <p>Hit the falling beats on time. Chain hits for a bigger combo.</p>
        <div className="fruit-instructions">
          <span>D F J K or arrow keys</span>
          <span>Perfect / Great / Good / Miss timing</span>
          <span>Combo streaks multiply your score up to 4x</span>
        </div>
        {best > 0 && (
          <p className="fruit-best">
            <Trophy size={15} /> Personal best: <strong>{best}</strong>
          </p>
        )}
        <button className="button button-primary" onClick={start}>
          Drop the beat <Sparkles size={16} />
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="game-intro game-win dj-result">
        <div className="trophy-icon">
          <Trophy size={48} />
        </div>
        <h3>{result.score >= 2000 ? "Beat master!" : "Nice rhythm!"}</h3>
        <p>
          You scored <strong>{result.score}</strong> points with a top combo of{" "}
          <strong>{result.combo}</strong> and earned{" "}
          <strong>{result.coins}</strong> coins.
        </p>
        <p className="fruit-best">
          {result.score > bestAtStart.current
            ? "A new personal best! 🏆"
            : `Personal best: ${Math.max(best, result.score)}`}
        </p>
        <div className="game-win-actions">
          <button className="button button-secondary" onClick={start}>
            <RotateCcw size={16} /> Play again
          </button>
          <button className="button button-primary" onClick={onClose}>
            Back to the pride <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dj-game">
      <div className="fruit-game-stats">
        <span>
          <Sparkles size={16} /> {score} pts
        </span>
        <span className="dj-combo-banner">
          {combo} combo · {comboMultiplier(combo)}x
        </span>
      </div>
      <div
        className="dj-field"
        role="img"
        aria-label={`DJ Beat Drop in progress. Score ${score}, combo ${combo}.`}
      >
        {feedback && (
          <span
            key={feedback.key}
            className={`dj-feedback ${JUDGMENT_CLASS[feedback.judgment]}`}
          >
            {JUDGMENT_LABEL[feedback.judgment]}
          </span>
        )}
        <div className="dj-lanes">
          {LANE_LABEL.map((label, laneIndex) => (
            <div className="dj-lane" key={label}>
              <div className="dj-lane-track">
                {notes
                  .filter((note) => note.lane === laneIndex)
                  .map((note) => {
                    const elapsed = performance.now() - startRef.current;
                    const progress =
                      (elapsed - (note.timeMs - NOTE_TRAVEL_MS)) /
                      NOTE_TRAVEL_MS;
                    return (
                      <span
                        key={note.id}
                        className="dj-note"
                        style={{
                          top: `${Math.min(100, Math.max(0, progress * 100))}%`,
                        }}
                        aria-hidden="true"
                      />
                    );
                  })}
                <span className="dj-hit-line" aria-hidden="true" />
              </div>
              <button
                className="dj-pad"
                onClick={() => hitLane(laneIndex as Lane)}
                aria-label={`Hit lane ${label}`}
              >
                {label}
              </button>
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {score} points. Combo {combo}.
      </p>
    </div>
  );
}

export function DJBeatDropModal({
  onFinish,
  onClose,
  best,
}: {
  onFinish: (result: Result) => void;
  onClose: () => void;
  best: number;
}) {
  return (
    <Dialog
      title="Club Pulse DJ Booth"
      subtitle="Drop the beat!"
      onClose={onClose}
    >
      <DJBeatDrop onFinish={onFinish} onClose={onClose} best={best} />
    </Dialog>
  );
}
