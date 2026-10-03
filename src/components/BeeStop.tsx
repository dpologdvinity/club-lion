import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Flower2,
  Gamepad2,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Coin } from "./Lion";
import {
  advance,
  BAND_LABEL,
  BAND_POINTS,
  bandFor,
  BEE_STOP_ROUNDS,
  coinsFor,
  FEEDBACK_MS,
  flowerFor,
  MAX_STEP_SECONDS,
  REDUCED_MOTION_FPS,
  speedFor,
  type BeeBand,
  zoneFor,
} from "../beeStop.ts";

type Phase = "intro" | "running" | "feedback" | "won";

const PETAL_FILL: Record<BeeBand, string> = {
  perfect: "#e8a72c",
  good: "#579371",
  okay: "#d8c7a2",
  miss: "none",
};

export function BeeStop({
  best,
  onFinish,
  onClose,
}: {
  best: number;
  onFinish: (score: number) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(1);
  const [bands, setBands] = useState<BeeBand[]>([]);
  const [lastBand, setLastBand] = useState<BeeBand | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const trackRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const scoreRef = useRef(0);
  const finishRef = useRef(onFinish);
  const settledRef = useRef(false);
  const bestAtStart = useRef(best);
  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  useEffect(() => {
    finishRef.current = onFinish;
  });
  const total = bands.reduce((sum, band) => sum + BAND_POINTS[band], 0);
  const zone = zoneFor(round);
  const flower = flowerFor(round);

  const paint = (pos: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.setProperty("--bee-pos", pos.toFixed(4));
    track.dataset.beePos = pos.toFixed(4);
  };

  useEffect(() => {
    if (phase !== "running") return;
    let frame = 0;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_STEP_SECONDS);
      last = now;
      const moved = advance(
        posRef.current,
        dirRef.current,
        speedFor(round),
        dt,
      );
      posRef.current = moved.pos;
      dirRef.current = moved.dir;
      if (reducedMotion) {
        carry += dt;
        if (carry < 1 / REDUCED_MOTION_FPS) {
          frame = requestAnimationFrame(tick);
          return;
        }
        carry -= 1 / REDUCED_MOTION_FPS;
      }
      paint(posRef.current);
      frame = requestAnimationFrame(tick);
    };
    paint(posRef.current);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, round, reducedMotion]);

  useEffect(() => {
    if (phase === "running") trackRef.current?.focus();
  }, [phase, round]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const id = window.setTimeout(() => {
      if (round < BEE_STOP_ROUNDS) {
        setRound(round + 1);
        setLastBand(null);
        setPhase("running");
        return;
      }
      setFinalScore(scoreRef.current);
      if (!settledRef.current) {
        settledRef.current = true;
        finishRef.current(scoreRef.current);
      }
      setPhase("won");
    }, FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [phase, round]);

  const stop = () => {
    if (phase !== "running") return;
    const band = bandFor(Math.abs(posRef.current - flower), round);
    scoreRef.current += BAND_POINTS[band];
    setBands((previous) => [...previous.slice(0, round - 1), band]);
    setLastBand(band);
    setPhase("feedback");
  };

  const restart = () => {
    scoreRef.current = 0;
    settledRef.current = false;
    bestAtStart.current = best;
    posRef.current = 0;
    dirRef.current = 1;
    setBands([]);
    setLastBand(null);
    setFinalScore(0);
    setRound(1);
    setPhase("running");
  };

  if (phase === "intro")
    return (
      <div className="bee-game">
        <div className="game-intro">
          <div className="game-illustration bee-illustration">
            <span>🌼</span>
            <span>🐝</span>
            <span>🍯</span>
          </div>
          <h3>Bee Stop</h3>
          <p>
            A honeybee is zooming all over the flower bar.
            <br />
            Stop it right on the blossom. Ten rounds, no way to lose.
          </p>
          <div className="game-features">
            <span>
              <Sparkles size={15} /> Easy at first, trickier by round ten.
            </span>
            <span>
              <Coin amount={coinsFor(600)} /> up to 120
            </span>
          </div>
          <button className="button button-primary" onClick={restart}>
            Let’s play <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

  if (phase === "won") {
    const earned = coinsFor(finalScore);
    const record = finalScore > bestAtStart.current;
    return (
      <div className="bee-game">
        <div className="game-intro game-win">
          <div className="trophy-icon">
            <Trophy size={53} />
          </div>
          <h3>{record ? "A brand new best!" : "Nicely done, friend."}</h3>
          <Bloom bands={bands} />
          <p>
            {finalScore} points across {BEE_STOP_ROUNDS} rounds.
            <br />
            Best run so far: {Math.max(best, finalScore)}.
          </p>
          <div className="reward-display">
            + <Coin amount={earned} />
          </div>
          <div className="game-win-actions">
            <button className="button button-secondary" onClick={restart}>
              <RotateCcw size={16} /> Play again
            </button>
            <button className="button button-primary" onClick={onClose}>
              Back to the pride <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bee-game">
      <div className="game-stats">
        <span>
          <Gamepad2 size={17} /> Round {round} / {BEE_STOP_ROUNDS}
        </span>
        <span>
          <Flower2 size={17} /> {total} points
        </span>
      </div>
      <button
        type="button"
        ref={trackRef}
        className="bee-track"
        onPointerDown={stop}
        onKeyDown={(event) => {
          if (event.key !== " " && event.key !== "Enter") return;
          event.preventDefault();
          if (event.repeat) return;
          stop();
        }}
        aria-label="Stop the bee"
      >
        <span
          className="bee-zone bee-zone-okay"
          style={{
            left: `${(flower - zone.okay) * 100}%`,
            width: `${zone.okay * 200}%`,
          }}
        />
        <span
          className="bee-zone bee-zone-good"
          style={{
            left: `${(flower - zone.good) * 100}%`,
            width: `${zone.good * 200}%`,
          }}
        />
        <span
          className="bee-zone bee-zone-perfect"
          style={{
            left: `${(flower - zone.perfect) * 100}%`,
            width: `${zone.perfect * 200}%`,
          }}
        />
        <span className="bee-flower" style={{ left: `${flower * 100}%` }}>
          🌼
        </span>
        <span className="bee-runner">
          <span className="bee-body">🐝</span>
        </span>
      </button>
      <p className="bee-announce" role="status">
        {phase === "feedback" && lastBand
          ? `${BAND_LABEL[lastBand]} Round ${round} of ${BEE_STOP_ROUNDS}. ${scoreRef.current} points.`
          : `Round ${round} of ${BEE_STOP_ROUNDS}. Stop the bee on the flower.`}
      </p>
      <p className="game-help">
        Press <kbd>Space</kbd>, <kbd>Enter</kbd>, or tap the bar to stop the
        bee.
      </p>
    </div>
  );
}

function Bloom({ bands }: { bands: BeeBand[] }) {
  return (
    <svg
      className="bee-bloom"
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Flower with ${bands.length} of ${BEE_STOP_ROUNDS} petals earned`}
    >
      {Array.from({ length: BEE_STOP_ROUNDS }, (_, index) => {
        const band = bands[index];
        return (
          <ellipse
            key={index}
            cx="50"
            cy="21"
            rx="11"
            ry="17"
            transform={`rotate(${index * 36} 50 50)`}
            fill={band ? PETAL_FILL[band] : "none"}
            stroke={band ? "none" : "#ded7c4"}
            strokeWidth="1.5"
          />
        );
      })}
      <circle cx="50" cy="50" r="14" fill="#f0c14b" stroke="#c99b23" />
    </svg>
  );
}
