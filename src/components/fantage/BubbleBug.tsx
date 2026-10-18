import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  BUG_COLORS,
  BUG_COLS,
  BUG_MAX_SCORE,
  BUG_ROWS,
  BUG_SHOTS,
  makeBugGrid,
  shoot,
} from "../../utils/bubbleBug.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const nextColor = () => Math.floor(Math.random() * BUG_COLORS.length);

/** Shoot bubbles up a column; three of a colour touching pop. */
export function BubbleBug({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [grid, setGrid] = useState(() => makeBugGrid());
  const [loaded, setLoaded] = useState(nextColor);
  const [shots, setShots] = useState(0);
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  const start = () => {
    paid.current = false;
    setGrid(makeBugGrid());
    setLoaded(nextColor());
    setShots(0);
    setScore(0);
    setPhase("play");
    setAnnouncement("Tap a column to shoot the bubble up!");
  };

  const fire = (col: number) => {
    if (phase !== "play") return;
    const result = shoot(grid, col, loaded);
    if (!result.stuck) {
      playCuteSound("boing");
      setAnnouncement("That column is full. Try another!");
      return;
    }
    playCuteSound(result.popped ? "yay" : "pop");
    const total = Math.min(score + result.popped, BUG_MAX_SCORE);
    const used = shots + 1;
    setGrid(result.grid);
    setScore(total);
    setShots(used);
    setLoaded(nextColor());
    setAnnouncement(
      result.popped ? `Pop! ${result.popped} bubbles.` : "Stuck!",
    );
    if (used >= BUG_SHOTS) {
      setPhase("done");
      setAnnouncement(`Out of bubbles! You popped ${total}.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(total);
      }
    }
  };

  return (
    <div className="fg-game bug-game">
      <ol className="fg-hud">
        <li aria-label={`${BUG_SHOTS - shots} shots left`}>
          🫧 {BUG_SHOTS - shots}
        </li>
        <li aria-label={`${score} popped`}>⭐ {score}</li>
      </ol>
      <div className="fg-board bug-field">
        <div className="bug-grid" aria-hidden="true">
          {Array.from({ length: BUG_ROWS }, (_, row) =>
            Array.from({ length: BUG_COLS }, (_, col) => (
              <span key={`${col}-${row}`} className="bug-cell">
                {grid[col][row] === null ? "" : BUG_COLORS[grid[col][row] ?? 0]}
              </span>
            )),
          )}
        </div>
        <div className="bug-launch">
          {Array.from({ length: BUG_COLS }, (_, col) => (
            <button
              key={col}
              type="button"
              className="bug-column"
              aria-label={`Shoot up column ${col + 1}`}
              disabled={phase !== "play"}
              onClick={() => fire(col)}
            >
              ⬆️
            </button>
          ))}
        </div>
        <p
          className="bug-loaded"
          aria-label={`Next bubble ${BUG_COLORS[loaded]}`}
        >
          🐞 <span aria-hidden="true">{BUG_COLORS[loaded]}</span>
        </p>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">⭐ {score}</p>}
            <p className="fg-hint">
              Shoot a bubble up a column to match three!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Bubble Bug"}
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
