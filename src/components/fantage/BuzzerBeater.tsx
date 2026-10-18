import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  BUZZER_SHOTS,
  meterLevel,
  shotPoints,
} from "../../utils/buzzerBeater.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";

/** Shoot hoops when the power meter swings into the green. */
export function BuzzerBeater({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [ms, setMs] = useState(0);
  const [shots, setShots] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

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

  const start = () => {
    paid.current = false;
    setShots([]);
    setMs(0);
    setPhase("play");
    setAnnouncement("Shoot when the meter is in the green!");
  };

  const level = meterLevel(ms);
  const score = shots.reduce((sum, p) => sum + p, 0);
  const shoot = () => {
    if (phase !== "play") return;
    const points = shotPoints(level);
    playCuteSound(points === 2 ? "yay" : points ? "pop" : "boing");
    const next = [...shots, points];
    setShots(next);
    setAnnouncement(
      points === 2
        ? "Swish!"
        : points
          ? "Off the rim, and in!"
          : "Close! Try again.",
    );
    if (next.length >= BUZZER_SHOTS) {
      const total = next.reduce((sum, p) => sum + p, 0);
      setPhase("done");
      setAnnouncement(`Buzzer! You scored ${total}.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(total);
      }
    }
  };

  return (
    <div className="fg-game buzzer-game">
      <ol className="fg-hud">
        <li
          aria-label={`Shot ${Math.min(shots.length + 1, BUZZER_SHOTS)} of ${BUZZER_SHOTS}`}
        >
          🏀 {Math.min(shots.length + 1, BUZZER_SHOTS)}/{BUZZER_SHOTS}
        </li>
        <li aria-label={`${score} points`}>⭐ {score}</li>
      </ol>
      <div className="fg-board buzzer-court">
        <div className="buzzer-hoop" aria-hidden="true">
          <span className="buzzer-board" />
          <span className="buzzer-rim" />
        </div>
        <div className="buzzer-meter" aria-hidden="true">
          <span className="buzzer-green" />
          <span className="buzzer-level" style={{ bottom: `${level}%` }} />
        </div>
        {phase === "play" && (
          <button
            type="button"
            className="fg-start buzzer-shoot"
            aria-label="Shoot"
            onClick={shoot}
          >
            🏀
          </button>
        )}
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">⭐ {score}</p>}
            <p className="fg-hint">Shoot when the meter is in the green!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Buzzer Beater"
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
