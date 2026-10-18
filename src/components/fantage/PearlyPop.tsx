import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  PEARLS,
  PEARL_COLS,
  PEARL_MAX_SCORE,
  PEARL_ROWS,
  groupPoints,
  hasGroup,
  makePearlBoard,
  popGroup,
} from "../../utils/pearlyPop.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";

/** Tap groups of matching pearls; bigger groups score more. */
export function PearlyPop({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [board, setBoard] = useState(() => makePearlBoard());
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  const start = () => {
    paid.current = false;
    setBoard(makePearlBoard());
    setScore(0);
    setPhase("play");
    setAnnouncement("Tap two or more matching pearls that touch!");
  };

  const tap = (col: number, row: number) => {
    if (phase !== "play") return;
    const { board: next, popped } = popGroup(board, col, row);
    if (!popped) {
      playCuteSound("boing");
      setAnnouncement("That pearl needs a matching friend next to it.");
      return;
    }
    playCuteSound(popped >= 5 ? "yay" : "pop");
    const total = Math.min(score + groupPoints(popped), PEARL_MAX_SCORE);
    setBoard(next);
    setScore(total);
    setAnnouncement(`${popped} pearls! ${groupPoints(popped)} points.`);
    if (!hasGroup(next)) {
      setPhase("done");
      setAnnouncement(`No more pairs! ${total} points.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(total);
      }
    }
  };

  return (
    <div className="fg-game pearl-game">
      <p className="fg-hud" aria-label={`${score} points`}>
        🫧 {score}
      </p>
      <div className="fg-board pearl-sea">
        <div className="pearl-grid">
          {Array.from({ length: PEARL_ROWS }, (_, fromTop) => {
            const row = PEARL_ROWS - 1 - fromTop;
            return Array.from({ length: PEARL_COLS }, (_, col) => {
              const pearl = board[col][row];
              return pearl === null ? (
                <span key={`${col}-${row}`} className="pearl-empty" />
              ) : (
                <button
                  key={`${col}-${row}`}
                  type="button"
                  className="pearl"
                  aria-label={`Pearl column ${col + 1} row ${row + 1}, ${PEARLS[pearl]}`}
                  disabled={phase !== "play"}
                  onClick={() => tap(col, row)}
                >
                  <span aria-hidden="true">{PEARLS[pearl]}</span>
                </button>
              );
            });
          })}
        </div>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🫧 {score}</p>}
            <p className="fg-hint">
              Pop groups of two or more matching pearls!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Pearly Pop"}
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
