import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  BULLSEYE_MAX_SCORE,
  BULLSEYE_THROWS,
  targetX,
  throwPoints,
} from "../../utils/bullseye.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
/** The dart always flies straight up the middle of the lane. */
const DART_X = 50;

/** Throw when the gliding target lines up with the dart. */
export function Bullseye({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [ms, setMs] = useState(0);
  const [throws, setThrows] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    if (phase !== "play") return;
    const started = performance.now();
    let frame = 0;
    const tick = () => {
      setMs(performance.now() - started);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const score = throws.reduce((sum, p) => sum + p, 0);
  useEffect(() => {
    if (throws.length < BULLSEYE_THROWS || paid.current) return;
    paid.current = true;
    setPhase("done");
    finishRef.current(Math.min(score, BULLSEYE_MAX_SCORE));
    setAnnouncement(`All darts thrown! ${score} points.`);
  }, [throws, score]);

  const start = () => {
    paid.current = false;
    setThrows([]);
    setMs(0);
    setPhase("play");
    setAnnouncement("Throw when the target is in the middle!");
  };

  const target = targetX(ms);
  const fire = () => {
    if (phase !== "play" || throws.length >= BULLSEYE_THROWS) return;
    const points = throwPoints(DART_X, target);
    playCuteSound(points >= 5 ? "yay" : "boing");
    setThrows((all) => [...all, points]);
    setAnnouncement(points ? `${points} points!` : "Missed. Try again!");
  };

  return (
    <div className="fg-game bullseye-game">
      <ol className="fg-hud">
        <li
          aria-label={`Dart ${Math.min(throws.length + 1, BULLSEYE_THROWS)} of ${BULLSEYE_THROWS}`}
        >
          🎯 {Math.min(throws.length + 1, BULLSEYE_THROWS)}/{BULLSEYE_THROWS}
        </li>
        <li aria-label={`${score} points`}>⭐ {score}</li>
      </ol>
      <div className="fg-board bullseye-lane">
        <div className="bullseye-target" style={{ left: `${target}%` }}>
          <span />
        </div>
        <div className="bullseye-dart" aria-hidden="true">
          🏹
        </div>
        {phase === "play" && (
          <button
            type="button"
            className="fg-start bullseye-throw"
            aria-label="Throw"
            onClick={fire}
          >
            🎯
          </button>
        )}
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">⭐ {score}</p>}
            <p className="fg-hint">Throw when the target lines up!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Bullseye"}
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
