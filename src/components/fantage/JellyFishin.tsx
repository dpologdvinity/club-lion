import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  JELLY_DROPS,
  JELLY_ROWS,
  boatX,
  dropCatch,
  jellyX,
  makeJellies,
} from "../../utils/jellyFishin.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";

/** Drop the hook from the gliding boat to catch a drifting jelly. */
export function JellyFishin({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [ms, setMs] = useState(0);
  const [jellies, setJellies] = useState(() => makeJellies());
  const [drops, setDrops] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  useGameLoop(phase === "play", (t) => setMs(t));

  const start = () => {
    paid.current = false;
    setJellies(makeJellies());
    setDrops([]);
    setMs(0);
    setPhase("play");
    setAnnouncement("Drop the hook when a jelly is under the boat!");
  };

  const score = drops.reduce((sum, p) => sum + p, 0);
  const boat = boatX(ms);
  const drop = () => {
    if (phase !== "play") return;
    const { index, points } = dropCatch(jellies, boat, ms);
    playCuteSound(points ? "yay" : "boing");
    // A caught jelly swims off and a fresh one takes its place.
    if (index >= 0)
      setJellies((all) =>
        all.map((j, i) =>
          i === index ? { ...j, offset: j.offset + 50, gold: false } : j,
        ),
      );
    const next = [...drops, points];
    setDrops(next);
    setAnnouncement(
      points === 3
        ? "A golden jelly! 3 points!"
        : points
          ? "Caught one!"
          : "Splash! Nothing there.",
    );
    if (next.length >= JELLY_DROPS) {
      const total = next.reduce((sum, p) => sum + p, 0);
      setPhase("done");
      setAnnouncement(`Trip over! ${total} points of jellies.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(total);
      }
    }
  };

  return (
    <div className="fg-game jelly-game">
      <ol className="fg-hud">
        <li
          aria-label={`Drop ${Math.min(drops.length + 1, JELLY_DROPS)} of ${JELLY_DROPS}`}
        >
          🎣 {Math.min(drops.length + 1, JELLY_DROPS)}/{JELLY_DROPS}
        </li>
        <li aria-label={`${score} points`}>🪼 {score}</li>
      </ol>
      <div className="fg-board jelly-sea">
        <span
          className="jelly-boat"
          style={{ left: `${boat}%` }}
          aria-hidden="true"
        >
          🛶
          <span className="jelly-line" />
        </span>
        {Array.from({ length: JELLY_ROWS }, (_, row) => (
          <div key={row} className="jelly-row" aria-hidden="true">
            {jellies
              .filter((j) => j.row === row)
              .map((j, i) => (
                <span
                  key={i}
                  className="jelly"
                  style={{ left: `${jellyX(j, ms)}%` }}
                >
                  {j.gold ? "🌟" : "🪼"}
                </span>
              ))}
          </div>
        ))}
        {phase === "play" && (
          <button
            type="button"
            className="fg-start jelly-drop"
            aria-label="Drop the hook"
            onClick={drop}
          >
            🎣
          </button>
        )}
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🪼 {score}</p>}
            <p className="fg-hint">
              Drop the hook when a jelly is right under the boat!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Jelly Fishin'"
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
