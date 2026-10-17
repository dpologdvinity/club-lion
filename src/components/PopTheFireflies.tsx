import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import {
  FIREFLY_ROUND_MS,
  FIREFLY_SPAWN_MS,
  FIREFLY_START,
  catchPoints,
  isLit,
  makeFirefly,
  type Firefly,
} from "../utils/fireflies.ts";
import "./popTheFireflies.css";

const TICK_MS = 100;
const MAX_ON_SCREEN = 9;

type Phase = "ready" | "play" | "done";

/** Catch fireflies only while they glow; golden ones are worth 3. One jar per round. */
export function PopTheFireflies({
  best,
  onFinish,
}: {
  best: number;
  onFinish: (score: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [flies, setFlies] = useState<Firefly[]>([]);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [missed, setMissed] = useState<{ id: number; key: number } | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  const startAt = useRef(0);
  const nextId = useRef(0);
  const lastSpawn = useRef(0);
  const scoreRef = useRef(0);
  const paid = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(() => {
      const t = Date.now() - startAt.current;
      setElapsed(t);
      if (t >= FIREFLY_ROUND_MS) {
        setPhase("done");
        if (!paid.current) finishRef.current(scoreRef.current);
        paid.current = true;
        setAnnouncement(`Night is over. ${scoreRef.current} in your jar!`);
        return;
      }
      if (t - lastSpawn.current >= FIREFLY_SPAWN_MS) {
        lastSpawn.current = t;
        setFlies((all) =>
          all.length >= MAX_ON_SCREEN
            ? all
            : [...all, makeFirefly(++nextId.current, Math.random, all)],
        );
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  const start = () => {
    startAt.current = Date.now();
    lastSpawn.current = 0;
    scoreRef.current = 0;
    paid.current = false;
    setScore(0);
    setElapsed(0);
    const first: Firefly[] = [];
    for (let i = 0; i < FIREFLY_START; i++)
      first.push(makeFirefly(++nextId.current, Math.random, first));
    setFlies(first);
    setAnnouncement("Tap the fireflies while they glow!");
    setPhase("play");
  };

  const tap = (fly: Firefly) => {
    if (phase !== "play") return;
    const points = catchPoints(fly, Date.now() - startAt.current);
    if (points === 0) {
      playCuteSound("boing");
      setMissed({ id: fly.id, key: Date.now() });
      setAnnouncement("It went dark. Wait for the glow!");
      return;
    }
    playCuteSound("sparkle");
    scoreRef.current += points;
    setScore(scoreRef.current);
    setFlies((all) => all.filter((item) => item.id !== fly.id));
    setAnnouncement(
      fly.golden ? `Golden firefly! Plus ${points}.` : "Caught one!",
    );
  };

  const secondsLeft = Math.max(
    0,
    Math.ceil((FIREFLY_ROUND_MS - elapsed) / 1000),
  );

  return (
    <div className="firefly-game">
      <div className="firefly-bar">
        <span className="firefly-jar" aria-label={`${score} in your jar`}>
          🫙 <strong>{score}</strong>
        </span>
        <span
          className="firefly-time"
          aria-label={`${secondsLeft} seconds left`}
        >
          <Timer size={22} aria-hidden="true" /> {secondsLeft}
        </span>
        <span className="firefly-best" aria-label={`Best ${best}`}>
          <Trophy size={20} aria-hidden="true" /> {best}
        </span>
      </div>
      <div className="firefly-meadow" data-phase={phase}>
        {phase === "play" &&
          flies.map((fly) => {
            const lit = isLit(fly, elapsed);
            const wiggle = missed?.id === fly.id ? missed.key : 0;
            return (
              <button
                key={fly.id}
                type="button"
                className={`firefly${lit ? " is-lit" : ""}${fly.golden ? " is-golden" : ""}`}
                style={{ left: `${fly.x}%`, top: `${fly.y}%` }}
                aria-label={fly.golden ? "Golden firefly" : "Firefly"}
                data-lit={lit}
                onClick={() => tap(fly)}
              >
                <span
                  key={wiggle}
                  className={
                    wiggle ? "firefly-body firefly-wiggle" : "firefly-body"
                  }
                  aria-hidden="true"
                />
              </button>
            );
          })}
        {phase !== "play" && (
          <div className="firefly-overlay">
            {phase === "done" && (
              <p className="firefly-result">
                🫙 {score} {score === 1 ? "firefly" : "fireflies"}!
              </p>
            )}
            <p className="firefly-hint">
              Tap fireflies while they glow. Golden ones are worth 3!
            </p>
            <button
              type="button"
              className="firefly-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Let's catch!"}
              onClick={start}
            >
              {phase === "done" ? (
                <RotateCcw size={30} aria-hidden="true" />
              ) : (
                <Play size={30} fill="currentColor" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
