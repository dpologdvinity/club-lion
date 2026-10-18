import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  KING_SIZE,
  applyMove,
  countSide,
  movesFor,
  newCheckers,
  pipChecker,
  type Checkers,
} from "../../utils/kingMe.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "you" | "pip" | "done";
const START_PIECES = 6;
const MAX_TURNS = 60;
const PIP_MS = 700;

/** Checkers against Pip on a small board; jumps capture, far row crowns. */
export function KingMe({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [board, setBoard] = useState<Checkers>(newCheckers);
  const [picked, setPicked] = useState<number | null>(null);
  const [turns, setTurns] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  const captured = START_PIECES - countSide(board, "black");
  const finish = (final: Checkers, message: string) => {
    setPhase("done");
    setAnnouncement(message);
    if (!paid.current) {
      paid.current = true;
      onFinish(START_PIECES - countSide(final, "black"));
    }
  };

  // After each move, check whether the game is over for the side to play.
  const after = (next: Checkers, turn: number, toPlay: "you" | "pip") => {
    if (!countSide(next, "black"))
      return finish(next, "You captured every piece! King of checkers!");
    if (!countSide(next, "red") || turn >= MAX_TURNS)
      return finish(next, "Good game! Let's count your captures.");
    const side = toPlay === "you" ? "red" : "black";
    if (!movesFor(next, side).length)
      return finish(next, "No moves left. Good game!");
    setPhase(toPlay);
  };

  useEffect(() => {
    if (phase !== "pip") return;
    const id = window.setTimeout(() => {
      const move = pipChecker(board);
      if (!move) return finish(board, "Pip is stuck. Good game!");
      const next = applyMove(board, move);
      playCuteSound(move.jumped !== null ? "boing" : "pop");
      setBoard(next);
      setTurns(turns + 1);
      after(next, turns + 1, "you");
    }, PIP_MS);
    return () => window.clearTimeout(id);
  });

  const start = () => {
    paid.current = false;
    setBoard(newCheckers());
    setPicked(null);
    setTurns(0);
    setPhase("you");
    setAnnouncement("You are red. Tap a piece, then where it should go.");
  };

  const mine = phase === "you" ? movesFor(board, "red") : [];
  const tap = (i: number) => {
    if (phase !== "you") return;
    if (board[i]?.side === "red") {
      setPicked(i);
      return;
    }
    const move = mine.find((m) => m.from === picked && m.to === i);
    if (!move) {
      playCuteSound("boing");
      return;
    }
    const next = applyMove(board, move);
    playCuteSound(move.jumped !== null ? "yay" : "pop");
    setBoard(next);
    setPicked(null);
    setTurns(turns + 1);
    setAnnouncement(
      move.jumped !== null ? "Jump! You captured a piece." : "Pip's turn.",
    );
    after(next, turns + 1, "pip");
  };

  const targets = new Set(
    mine.filter((m) => m.from === picked).map((m) => m.to),
  );
  return (
    <div className="fg-game kingme-game">
      <ol className="fg-hud">
        <li aria-label={phase === "pip" ? "Pip's turn" : "Your turn"}>
          {phase === "pip" ? "⚫ Pip" : "🔴 You"}
        </li>
        <li aria-label={`${captured} captured`}>👑 {captured}</li>
      </ol>
      <div className="fg-board">
        <div className="kingme-grid">
          {board.map((piece, i) => {
            const r = Math.floor(i / KING_SIZE);
            const c = i % KING_SIZE;
            const dark = (r + c) % 2 === 1;
            return (
              <button
                key={i}
                type="button"
                className={`kingme-cell${dark ? " is-dark" : ""}${picked === i ? " is-picked" : ""}${targets.has(i) ? " is-target" : ""}`}
                aria-label={`Row ${r + 1}, column ${c + 1}${piece ? `, ${piece.side}${piece.king ? " king" : ""}` : ""}`}
                disabled={phase !== "you" || !dark}
                onClick={() => tap(i)}
              >
                {piece && (
                  <span aria-hidden="true">
                    {piece.side === "red" ? "🔴" : "⚫"}
                    {piece.king && <small className="kingme-crown">👑</small>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">👑 {captured}</p>}
            <p className="fg-hint">You are red. Jump Pip's black pieces!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start King Me"}
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
