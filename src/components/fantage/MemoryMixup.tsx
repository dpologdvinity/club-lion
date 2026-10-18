import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Star } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  MIXUP_PAIRS,
  makeMixupDeck,
  mixupStars,
} from "../../utils/memoryMixup.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const MATCH_MS = 450;
const MISS_MS = 950;

/** Flip two cards at a time to find the matching snacks. */
export function MemoryMixup({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [deck, setDeck] = useState(() => makeMixupDeck());
  const [up, setUp] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // Two cards up: keep a pair, turn a miss back over.
  useEffect(() => {
    if (up.length !== 2) return;
    const [a, b] = up;
    const pair = deck[a].snack === deck[b].snack;
    const id = window.setTimeout(
      () => {
        if (pair) setMatched((all) => [...all, a, b]);
        setUp([]);
      },
      pair ? MATCH_MS : MISS_MS,
    );
    return () => window.clearTimeout(id);
  }, [up, deck]);

  const stars = mixupStars(turns);
  useEffect(() => {
    if (matched.length !== MIXUP_PAIRS * 2 || paid.current) return;
    paid.current = true;
    setPhase("done");
    finishRef.current(stars);
    setAnnouncement(`All matched in ${turns} turns! ${stars} stars.`);
  }, [matched, stars, turns]);

  const start = () => {
    paid.current = false;
    setDeck(makeMixupDeck());
    setUp([]);
    setMatched([]);
    setTurns(0);
    setPhase("play");
    setAnnouncement("Find the matching snacks!");
  };

  const flip = (index: number) => {
    if (
      phase !== "play" ||
      up.length === 2 ||
      up.includes(index) ||
      matched.includes(index)
    )
      return;
    const next = [...up, index];
    setUp(next);
    if (next.length < 2) return;
    setTurns((t) => t + 1);
    const pair = deck[next[0]].snack === deck[next[1]].snack;
    playCuteSound(pair ? "yay" : "boing");
    setAnnouncement(pair ? "A match!" : "Not a match. Try again!");
  };

  return (
    <div className="fg-game mixup-game">
      <p className="fg-hud" aria-label={`Turns: ${turns}`}>
        🔄 {turns}
      </p>
      <div className="fg-board">
        <div className="mixup-grid">
          {deck.map((card, index) => {
            const faceUp = up.includes(index) || matched.includes(index);
            return (
              <button
                key={card.id}
                type="button"
                className={`mixup-card${faceUp ? " is-up" : ""}${
                  matched.includes(index) ? " is-matched" : ""
                }`}
                aria-label={`Card ${index + 1}${faceUp ? `, ${card.snack}` : ""}`}
                disabled={phase !== "play"}
                onClick={() => flip(index)}
              >
                <span className="mixup-snack" aria-hidden="true">
                  {card.snack}
                </span>
              </button>
            );
          })}
        </div>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && (
              <p className="fg-result" aria-label={`${stars} stars`}>
                {Array.from({ length: 3 }, (_, i) => (
                  <Star
                    key={i}
                    size={34}
                    fill={i < stars ? "#ffc83a" : "none"}
                    aria-hidden="true"
                  />
                ))}
              </p>
            )}
            <p className="fg-hint">Flip two cards to find matching snacks!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Memory Mixup"
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
