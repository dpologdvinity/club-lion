import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  CANDIES,
  CANDY_MAX_SCORE,
  CANDY_MOVES,
  areNeighbours,
  findLines,
  hasMove,
  makePlayableGrid,
  settle,
  swapCells,
} from "../../utils/candySwap.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";

/** Swap neighbouring candies to line up three or more of a kind. */
export function CandySwap({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [grid, setGrid] = useState(() => makePlayableGrid());
  const [picked, setPicked] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  const start = () => {
    paid.current = false;
    setGrid(makePlayableGrid());
    setPicked(null);
    setMoves(0);
    setScore(0);
    setPhase("play");
    setAnnouncement("Tap a candy, then a candy next to it to swap.");
  };

  const tap = (index: number) => {
    if (phase !== "play") return;
    if (picked === null || !areNeighbours(picked, index)) {
      setPicked(picked === index ? null : index);
      return;
    }
    const swapped = swapCells(grid, picked, index);
    setPicked(null);
    if (!findLines(swapped).size) {
      playCuteSound("boing");
      setAnnouncement("No line there. Try another swap!");
      return;
    }
    const { grid: calm, popped } = settle(swapped);
    playCuteSound("yay");
    const total = Math.min(score + popped, CANDY_MAX_SCORE);
    const used = moves + 1;
    // A stuck board deals a fresh one so there is always a swap to make.
    setGrid(hasMove(calm) ? calm : makePlayableGrid());
    setScore(total);
    setMoves(used);
    setAnnouncement(`Pop! ${popped} candies.`);
    if (used >= CANDY_MOVES) {
      setPhase("done");
      setAnnouncement(`Out of swaps! You popped ${total} candies.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(total);
      }
    }
  };

  return (
    <div className="fg-game candy-game">
      <ol className="fg-hud">
        <li aria-label={`${CANDY_MOVES - moves} swaps left`}>
          🔄 {CANDY_MOVES - moves}
        </li>
        <li aria-label={`${score} candies popped`}>🍬 {score}</li>
      </ol>
      <div className="fg-board">
        <div className="candy-grid">
          {grid.map((candy, index) => (
            <button
              key={index}
              type="button"
              className={`candy-cell${picked === index ? " is-picked" : ""}`}
              aria-label={`Candy ${index + 1}, ${CANDIES[candy]}`}
              aria-pressed={picked === index}
              disabled={phase !== "play"}
              onClick={() => tap(index)}
            >
              <span aria-hidden="true">{CANDIES[candy]}</span>
            </button>
          ))}
        </div>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🍬 {score}</p>}
            <p className="fg-hint">Swap two candies to make a line of three!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Candy Swap"}
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
