import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  EMPTY_BOARD,
  TAC_ROUNDS,
  pipMove,
  roundPoints,
  tacResult,
  type Board,
} from "../../utils/snackTacToe.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "you" | "pip" | "between" | "done";
const SNACK = { donut: "🍩", cookie: "🍪" } as const;
const PIP_MS = 650;
const NEXT_MS = 1500;

/** Three rounds of tic-tac-toe with snacks against friendly Pip. */
export function SnackTacToe({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [board, setBoard] = useState<Board>(EMPTY_BOARD);
  const [round, setRound] = useState(0);
  const [points, setPoints] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const result = tacResult(board);

  // A finished board scores the round, then the next one starts.
  const endRound = (next: Board) => {
    const outcome = tacResult(next);
    if (!outcome) return false;
    setPoints((p) => p + roundPoints(outcome));
    playCuteSound(roundPoints(outcome) === 2 ? "yay" : "boing");
    setAnnouncement(
      outcome === "draw"
        ? "A tie! One point."
        : outcome.winner === "donut"
          ? "Three donuts in a row! You win the round."
          : "Pip got three cookies. Good game!",
    );
    setPhase("between");
    return true;
  };

  useEffect(() => {
    if (phase !== "pip") return;
    const id = window.setTimeout(() => {
      const cell = pipMove(board);
      if (cell < 0) return;
      const next = board.map((c, i) => (i === cell ? "cookie" : c));
      setBoard(next);
      if (!endRound(next)) setPhase("you");
    }, PIP_MS);
    return () => window.clearTimeout(id);
  }, [phase, board]);

  useEffect(() => {
    if (phase !== "between") return;
    const id = window.setTimeout(() => {
      if (round + 1 >= TAC_ROUNDS) {
        setPhase("done");
        return;
      }
      setRound(round + 1);
      setBoard(EMPTY_BOARD);
      // Pip starts the middle round so both get a turn going first.
      setPhase(round + 1 === 1 ? "pip" : "you");
    }, NEXT_MS);
    return () => window.clearTimeout(id);
  }, [phase, round]);

  useEffect(() => {
    if (phase !== "done" || paid.current) return;
    paid.current = true;
    finishRef.current(points);
    setAnnouncement(`Match over! You scored ${points} points.`);
  }, [phase, points]);

  const start = () => {
    paid.current = false;
    setBoard(EMPTY_BOARD);
    setRound(0);
    setPoints(0);
    setPhase("you");
    setAnnouncement("You are the donuts. Get three in a row!");
  };

  const place = (index: number) => {
    if (phase !== "you" || board[index] !== null) return;
    const next = board.map((c, i) => (i === index ? "donut" : c));
    setBoard(next);
    if (!endRound(next)) setPhase("pip");
  };

  const line = result && result !== "draw" ? result.line : [];

  return (
    <div className="fg-game tac-game">
      <ol className="fg-hud" aria-label={`Round ${round + 1} of ${TAC_ROUNDS}`}>
        <li>
          Round {Math.min(round + 1, TAC_ROUNDS)}/{TAC_ROUNDS}
        </li>
        <li aria-label={`${points} points`}>⭐ {points}</li>
      </ol>
      <div className="fg-board">
        <div className="tac-grid">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              className={`tac-cell${line.includes(index) ? " is-line" : ""}`}
              aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}${
                cell ? `, ${cell}` : ""
              }`}
              disabled={phase !== "you" || cell !== null}
              onClick={() => place(index)}
            >
              {cell && <span aria-hidden="true">{SNACK[cell]}</span>}
            </button>
          ))}
        </div>
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">⭐ {points}</p>}
            <p className="fg-hint">
              You are 🍩, Pip is 🍪. Get three in a row!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Snack Tac Toe"
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
