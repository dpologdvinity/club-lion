import { useRef, useState } from "react";
import { Play, RotateCcw, Star } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  MATH_QUESTIONS,
  makeMathQuestion,
  type MathQuestion,
} from "../../utils/madMath.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";

/** Count the snacks and tap the right number. */
export function MadMath({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [question, setQuestion] = useState<MathQuestion>(() =>
    makeMathQuestion(),
  );
  const [stars, setStars] = useState<boolean[]>([]);
  const [missed, setMissed] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);

  const start = () => {
    paid.current = false;
    setStars([]);
    setMissed([]);
    setQuestion(makeMathQuestion());
    setPhase("play");
    setAnnouncement("How many snacks?");
  };

  const answer = (n: number) => {
    if (phase !== "play" || missed.includes(n)) return;
    if (n !== question.count) {
      playCuteSound("boing");
      setMissed((all) => [...all, n]);
      setAnnouncement("Not quite. Count again!");
      return;
    }
    playCuteSound("yay");
    const next = [...stars, missed.length === 0];
    setStars(next);
    setMissed([]);
    if (next.length >= MATH_QUESTIONS) {
      const score = next.filter(Boolean).length;
      setPhase("done");
      setAnnouncement(`All done! ${score} right on the first try.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(score);
      }
      return;
    }
    setQuestion(makeMathQuestion());
    setAnnouncement(`Yes, ${n}! Next one.`);
  };

  const score = stars.filter(Boolean).length;
  return (
    <div className="fg-game math-game">
      <ol
        className="fg-hud"
        aria-label={`Question ${Math.min(stars.length + 1, MATH_QUESTIONS)} of ${MATH_QUESTIONS}`}
      >
        {Array.from({ length: MATH_QUESTIONS }, (_, i) => (
          <li key={i} aria-hidden="true">
            <Star size={18} fill={stars[i] ? "#ffc83a" : "none"} />
          </li>
        ))}
      </ol>
      <div className="fg-board">
        <p className="math-snacks" aria-label={`${question.count} snacks`}>
          {Array.from({ length: question.count }, (_, i) => (
            <span key={i} aria-hidden="true">
              {question.snack}
            </span>
          ))}
        </p>
        <div className="math-choices">
          {question.choices.map((n) => (
            <button
              key={n}
              type="button"
              className={`math-choice${missed.includes(n) ? " is-missed" : ""}`}
              disabled={phase !== "play" || missed.includes(n)}
              onClick={() => answer(n)}
            >
              {n}
            </button>
          ))}
        </div>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">⭐ {score}</p>}
            <p className="fg-hint">Count the snacks, then tap the number!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Mad Math"}
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
