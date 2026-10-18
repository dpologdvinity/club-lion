import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Star } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  BOO_GHOSTS,
  makeBooRound,
  type BooRound,
} from "../../utils/typeBoo.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";

/** Tap (or type) the letter the friendly ghost is holding. */
export function TypeBoo({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState<BooRound>(() => makeBooRound());
  const [stars, setStars] = useState<boolean[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  const start = () => {
    paid.current = false;
    setStars([]);
    setMissed([]);
    setRound(makeBooRound());
    setPhase("play");
    setAnnouncement("Which letter is the ghost holding?");
  };

  const answer = (letter: string) => {
    if (phase !== "play" || missed.includes(letter)) return;
    if (letter !== round.letter) {
      playCuteSound("boing");
      setMissed((all) => [...all, letter]);
      setAnnouncement(`That's ${letter}. Look again!`);
      return;
    }
    playCuteSound("yay");
    const next = [...stars, missed.length === 0];
    setStars(next);
    setMissed([]);
    if (next.length >= BOO_GHOSTS) {
      const score = next.filter(Boolean).length;
      setPhase("done");
      setAnnouncement(`Boo-tiful! ${score} on the first try.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(score);
      }
      return;
    }
    setRound(makeBooRound());
    setAnnouncement(`${letter}! The ghost giggles away.`);
  };

  // Big kids can type the letter on a keyboard too.
  const answerRef = useRef(answer);
  answerRef.current = answer;
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (event: KeyboardEvent) => {
      const letter = event.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) answerRef.current(letter);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const score = stars.filter(Boolean).length;
  return (
    <div className="fg-game boo-game">
      <ol
        className="fg-hud"
        aria-label={`Ghost ${Math.min(stars.length + 1, BOO_GHOSTS)} of ${BOO_GHOSTS}`}
      >
        {Array.from({ length: BOO_GHOSTS }, (_, i) => (
          <li key={i} aria-hidden="true">
            <Star size={14} fill={stars[i] ? "#ffc83a" : "none"} />
          </li>
        ))}
      </ol>
      <div className="fg-board boo-night">
        <p className="boo-ghost" aria-label={`The ghost holds ${round.letter}`}>
          <span aria-hidden="true">👻</span>
          <span className="boo-letter" aria-hidden="true">
            {round.letter}
          </span>
        </p>
        <div className="boo-choices">
          {round.choices.map((letter) => (
            <button
              key={letter}
              type="button"
              className={`boo-choice${missed.includes(letter) ? " is-missed" : ""}`}
              disabled={phase !== "play" || missed.includes(letter)}
              onClick={() => answer(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">👻 {score}</p>}
            <p className="fg-hint">Tap the letter the ghost is holding!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Type Boo"}
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
