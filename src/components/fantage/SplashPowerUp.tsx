import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  ANGLES,
  BALLOON_THROWS,
  SPLASH_TARGETS,
  landingX,
  powerMeter,
  splashPoints,
} from "../../utils/splashPowerUp.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "aim" | "flying" | "done";
const FLIGHT_MS = 900;

/** Launch water balloons at the bucket, duck and whale. */
export function SplashPowerUp({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [ms, setMs] = useState(0);
  const [angle, setAngle] = useState<(typeof ANGLES)[number]["id"]>("mid");
  const [landing, setLanding] = useState<number | null>(null);
  const [throws, setThrows] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  useGameLoop(phase === "aim", (t) => setMs(t));

  useEffect(() => {
    if (phase !== "flying" || landing === null) return;
    const id = window.setTimeout(() => {
      const points = splashPoints(landing);
      playCuteSound(points ? "yay" : "whoosh");
      const next = [...throws, points];
      setThrows(next);
      setAnnouncement(
        points ? `Splash! ${points} points!` : "Splash! Missed the targets.",
      );
      if (next.length >= BALLOON_THROWS) {
        const total = next.reduce((sum, p) => sum + p, 0);
        setPhase("done");
        setAnnouncement(`Out of balloons! ${total} points.`);
        if (!paid.current) {
          paid.current = true;
          onFinish(total);
        }
        return;
      }
      setPhase("aim");
    }, FLIGHT_MS);
    return () => window.clearTimeout(id);
  }, [phase, landing, throws, onFinish]);

  const start = () => {
    paid.current = false;
    setThrows([]);
    setLanding(null);
    setPhase("aim");
    setAnnouncement("Pick an angle, then launch when the power is right!");
  };

  const power = powerMeter(ms);
  const launch = () => {
    if (phase !== "aim") return;
    const degrees = ANGLES.find((a) => a.id === angle)?.degrees ?? 45;
    playCuteSound("pop");
    setLanding(landingX(degrees, power));
    setPhase("flying");
  };

  const total = throws.reduce((sum, p) => sum + p, 0);
  return (
    <div className="fg-game balloon-game">
      <ol className="fg-hud">
        <li
          aria-label={`Balloon ${Math.min(throws.length + 1, BALLOON_THROWS)} of ${BALLOON_THROWS}`}
        >
          🎈 {Math.min(throws.length + 1, BALLOON_THROWS)}/{BALLOON_THROWS}
        </li>
        <li aria-label={`${total} points`}>💦 {total}</li>
      </ol>
      <div className="fg-board balloon-field">
        <span className="balloon-catapult" aria-hidden="true">
          🏹
        </span>
        {SPLASH_TARGETS.map((t) => (
          <span
            key={t.x}
            className="balloon-target"
            style={{ left: `${t.x}%` }}
            aria-hidden="true"
          >
            {t.emoji}
            <small>{t.points}</small>
          </span>
        ))}
        {phase === "flying" && landing !== null && (
          <span
            className="balloon-shot"
            style={{ left: `${Math.min(98, landing)}%` }}
            aria-hidden="true"
          >
            🎈
          </span>
        )}
        <div className="splash-meter balloon-meter" aria-hidden="true">
          <span className="splash-level" style={{ height: `${power}%` }} />
        </div>
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">💦 {total}</p>}
            <p className="fg-hint">
              Pick an angle, then launch at the targets!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Splash Power-Up"
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
      <div className="balloon-controls">
        <div role="group" aria-label="Angle" className="balloon-angles">
          {ANGLES.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`math-choice balloon-angle${angle === a.id ? " selected" : ""}`}
              aria-pressed={angle === a.id}
              disabled={phase !== "aim"}
              onClick={() => setAngle(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="fg-start"
          aria-label="Launch"
          disabled={phase !== "aim"}
          onClick={launch}
        >
          🎈
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
