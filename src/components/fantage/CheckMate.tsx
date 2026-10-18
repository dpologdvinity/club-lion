import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  CHESS_LEVELS,
  CHESS_SIZE,
  PIECE_EMOJI,
  reachable,
} from "../../utils/checkMate.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "cleared" | "done";
const FILES = "abcdef";

/** Move one chess piece to collect every star and learn how it moves. */
export function CheckMate({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const [at, setAt] = useState<[number, number]>(CHESS_LEVELS[0].start);
  const [left, setLeft] = useState<[number, number][]>(CHESS_LEVELS[0].stars);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const lvl = CHESS_LEVELS[level];
  const moves = reachable(lvl.piece, at);
  const canGo = (r: number, c: number) =>
    moves.some(([mr, mc]) => mr === r && mc === c);

  const load = (i: number) => {
    setLevel(i);
    setAt(CHESS_LEVELS[i].start);
    setLeft(CHESS_LEVELS[i].stars);
    setPhase("play");
    setAnnouncement(`This is the ${CHESS_LEVELS[i].piece}. Collect the stars!`);
  };

  const start = () => {
    paid.current = false;
    load(0);
  };

  const tap = (r: number, c: number) => {
    if (phase !== "play") return;
    if (!canGo(r, c)) {
      playCuteSound("boing");
      setAnnouncement(`The ${lvl.piece} can't go there. Try a glowing square!`);
      return;
    }
    setAt([r, c]);
    const remaining = left.filter(([sr, sc]) => sr !== r || sc !== c);
    if (remaining.length < left.length) playCuteSound("pop");
    setLeft(remaining);
    if (!remaining.length) {
      playCuteSound("yay");
      setPhase("cleared");
      setAnnouncement(`Every star! You know the ${lvl.piece}.`);
    }
  };

  const next = () => {
    if (level + 1 >= CHESS_LEVELS.length) {
      setPhase("done");
      setAnnouncement("You moved every piece!");
      if (!paid.current) {
        paid.current = true;
        onFinish(CHESS_LEVELS.length);
      }
      return;
    }
    load(level + 1);
  };

  return (
    <div className="fg-game chess-game">
      <p
        className="fg-hud"
        aria-label={`Piece ${level + 1} of ${CHESS_LEVELS.length}: ${lvl.piece}`}
      >
        {PIECE_EMOJI[lvl.piece]} {level + 1}/{CHESS_LEVELS.length}
      </p>
      <div className="fg-board">
        <div className="chess-grid">
          {Array.from({ length: CHESS_SIZE * CHESS_SIZE }, (_, i) => {
            const r = Math.floor(i / CHESS_SIZE);
            const c = i % CHESS_SIZE;
            const here = at[0] === r && at[1] === c;
            const star = left.some(([sr, sc]) => sr === r && sc === c);
            const glow = phase === "play" && canGo(r, c);
            return (
              <button
                key={i}
                type="button"
                className={`chess-cell${(r + c) % 2 ? " is-dark" : ""}${glow ? " is-glow" : ""}`}
                aria-label={`${FILES[c]}${CHESS_SIZE - r}${here ? `, ${lvl.piece}` : star ? ", star" : ""}`}
                disabled={phase !== "play"}
                onClick={() => tap(r, c)}
              >
                <span aria-hidden="true">
                  {here ? PIECE_EMOJI[lvl.piece] : star ? "⭐" : ""}
                </span>
              </button>
            );
          })}
        </div>
        {phase === "cleared" && (
          <div className="fg-overlay">
            <p className="fg-result">{PIECE_EMOJI[lvl.piece]} ⭐</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label="Next piece"
              onClick={next}
            >
              <Play size={34} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        )}
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">♜ ♝ ♞ ♚ ♛</p>}
            <p className="fg-hint">
              Move the piece to the glowing squares to collect stars!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Check Mate"}
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
