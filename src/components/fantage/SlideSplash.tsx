import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  AIR_MS,
  SPLASH_DIVES,
  TRICKS,
  jumpPoints,
  splashMeter,
} from "../../utils/slideSplash.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "slide" | "air" | "splash" | "done";
const SPLASH_MS = 1100;

/** Jump off the slide at full power, then tap tricks before the splash. */
export function SlideSplash({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [ms, setMs] = useState(0);
  const [dives, setDives] = useState<number[]>([]);
  const [jump, setJump] = useState(0);
  const [tricks, setTricks] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  useGameLoop(phase === "slide", (t) => setMs(t));

  // In the air for a moment, then the splash scores the dive.
  useEffect(() => {
    if (phase !== "air") return;
    const id = window.setTimeout(() => {
      playCuteSound("whoosh");
      setPhase("splash");
    }, AIR_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "splash") return;
    const points = jump + tricks.length;
    const all = [...dives, points];
    const id = window.setTimeout(() => {
      setDives(all);
      if (all.length >= SPLASH_DIVES) {
        const total = all.reduce((sum, p) => sum + p, 0);
        setPhase("done");
        setAnnouncement(`What a show! ${total} splash points.`);
        if (!paid.current) {
          paid.current = true;
          onFinish(total);
        }
        return;
      }
      setTricks([]);
      setPhase("slide");
    }, SPLASH_MS);
    setAnnouncement(`Splash! ${points} points.`);
    return () => window.clearTimeout(id);
  }, [phase, jump, tricks, dives, onFinish]);

  const start = () => {
    paid.current = false;
    setDives([]);
    setTricks([]);
    setPhase("slide");
    setAnnouncement("Tap Jump when the meter is high!");
  };

  const meter = splashMeter(ms);
  const leap = () => {
    if (phase !== "slide") return;
    playCuteSound("yay");
    setJump(jumpPoints(meter));
    setPhase("air");
    setAnnouncement("Tricks! Tap them before you splash!");
  };
  const trick = (id: string) => {
    if (phase !== "air" || tricks.includes(id)) return;
    playCuteSound("sparkle");
    setTricks((all) => [...all, id]);
  };

  const total = dives.reduce((sum, p) => sum + p, 0);
  return (
    <div className="fg-game splash-game">
      <ol className="fg-hud">
        <li
          aria-label={`Dive ${Math.min(dives.length + 1, SPLASH_DIVES)} of ${SPLASH_DIVES}`}
        >
          🛝 {Math.min(dives.length + 1, SPLASH_DIVES)}/{SPLASH_DIVES}
        </li>
        <li aria-label={`${total} points`}>💦 {total}</li>
      </ol>
      <div className={`fg-board splash-pool is-${phase}`}>
        <span className="splash-diver" aria-hidden="true">
          {phase === "splash"
            ? "💦"
            : tricks.length
              ? TRICKS.find((t) => t.id === tricks.at(-1))?.emoji
              : "🧒"}
        </span>
        <div className="splash-meter" aria-hidden="true">
          <span className="splash-level" style={{ height: `${meter}%` }} />
        </div>
        {phase !== "ready" && phase !== "done" && (
          <div className="splash-controls">
            {phase === "slide" && (
              <button
                type="button"
                className="fg-start"
                aria-label="Jump"
                onClick={leap}
              >
                🦘
              </button>
            )}
            {phase === "air" &&
              TRICKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="fg-start splash-trick"
                  aria-label={t.label}
                  aria-pressed={tricks.includes(t.id)}
                  disabled={tricks.includes(t.id)}
                  onClick={() => trick(t.id)}
                >
                  {t.emoji}
                </button>
              ))}
          </div>
        )}
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">💦 {total}</p>}
            <p className="fg-hint">
              Jump when the meter is high, then tap tricks!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Slide n Splash"
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
