import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  VEGGIES,
  VEGGIE_HOLES,
  VEGGIE_MAX_SCORE,
  VEGGIE_ROUND_MS,
  nextHole,
  veggieUpMs,
} from "../../utils/whackAVeggie.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
/** One veggie up in a hole until `until` (ms into the round). */
type Up = { veggie: string; until: number; bonked: boolean };
const TICK_MS = 100;
const POP_EVERY_MS = 600;

/** Bonk the veggies as they pop out of the garden for 30 seconds. */
export function WhackAVeggie({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [holes, setHoles] = useState<(Up | null)[]>(() =>
    Array(VEGGIE_HOLES).fill(null),
  );
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // One clock drives the round: veggies sink when their time is up and a new
  // one pops every POP_EVERY_MS.
  useEffect(() => {
    if (phase !== "play") return;
    const started = performance.now();
    let lastPop = -POP_EVERY_MS;
    const id = window.setInterval(() => {
      const now = performance.now() - started;
      if (now >= VEGGIE_ROUND_MS) {
        setElapsed(VEGGIE_ROUND_MS);
        setPhase("done");
        return;
      }
      setElapsed(now);
      // Decide the pop out here: updaters must stay pure (StrictMode runs them twice).
      const pop = now - lastPop >= POP_EVERY_MS;
      if (pop) lastPop = now;
      const roll = Math.random();
      const veggie = VEGGIES[Math.floor(Math.random() * VEGGIES.length)];
      setHoles((all) => {
        const next = all.map((up) => (up && up.until > now ? up : null));
        const hole = pop ? nextHole(next.map(Boolean), () => roll) : -1;
        if (hole >= 0)
          next[hole] = { veggie, until: now + veggieUpMs(now), bonked: false };
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done" || paid.current) return;
    paid.current = true;
    const final = Math.min(score, VEGGIE_MAX_SCORE);
    finishRef.current(final);
    setAnnouncement(`Time's up! You bonked ${final} veggies.`);
  }, [phase, score]);

  const start = () => {
    paid.current = false;
    setHoles(Array(VEGGIE_HOLES).fill(null));
    setScore(0);
    setElapsed(0);
    setPhase("play");
    setAnnouncement("Bonk the veggies!");
  };

  const bonk = (index: number) => {
    const up = holes[index];
    if (phase !== "play" || !up || up.bonked) return;
    playCuteSound("boing");
    setScore((s) => s + 1);
    // A bonked veggie stays a moment, squished, then sinks.
    setHoles((all) =>
      all.map((h, i) =>
        i === index && h ? { ...h, bonked: true, until: elapsed + 250 } : h,
      ),
    );
  };

  const secondsLeft = Math.ceil((VEGGIE_ROUND_MS - elapsed) / 1000);

  return (
    <div className="fg-game veggie-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`${score} veggies`}>🥕 {score}</li>
      </ol>
      <div className="fg-board veggie-garden">
        {holes.map((up, index) => (
          <button
            key={index}
            type="button"
            className={`veggie-hole${up ? " is-up" : ""}${up?.bonked ? " is-bonked" : ""}`}
            aria-label={
              up && !up.bonked ? `Bonk the ${up.veggie}` : `Hole ${index + 1}`
            }
            disabled={phase !== "play"}
            onClick={() => bonk(index)}
          >
            <span className="veggie" aria-hidden="true">
              {up?.veggie ?? ""}
            </span>
          </button>
        ))}
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🥕 {score}</p>}
            <p className="fg-hint">Bonk the veggies when they pop up!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Whack A Veggie"
              }
              onClick={start}
            >
              {phase === "done" ? (
                <RotateCcw size={34} aria-hidden="true" />
              ) : (
                <Play size={34} fill="currentColor" aria-hidden="true" />
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
