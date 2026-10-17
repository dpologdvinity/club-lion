import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Star } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import {
  PEEKABOO_ANIMALS,
  PEEKABOO_ROUNDS,
  makePeekabooRound,
  peekMsFor,
  type PeekabooRound,
} from "../utils/peekaboo.ts";
import "./peekabooAnimals.css";

const ANIMAL = Object.fromEntries(
  PEEKABOO_ANIMALS.map((animal) => [animal.id, animal]),
);
const GAP_MS = 150;
const NEXT_MS = 1100;

type Phase = "ready" | "peek" | "find" | "found" | "done";

/** Watch the animals peek out of the bushes, then find the one called. */
export function PeekabooAnimals({
  onFinish,
}: {
  /** Called once per finished game with the first-try finds. */
  onFinish: (found: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState(0);
  const [hiding, setHiding] = useState<PeekabooRound>(() =>
    makePeekabooRound(),
  );
  const [peeking, setPeeking] = useState<number | null>(null);
  const [shown, setShown] = useState<number[]>([]);
  const [firstTry, setFirstTry] = useState(true);
  const [stars, setStars] = useState<boolean[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // Each animal peeks out in turn, then everyone hides and the hunt starts.
  useEffect(() => {
    if (phase !== "peek") return;
    const peek = peekMsFor(round);
    const timers = hiding.spots.map((_, index) =>
      window.setTimeout(() => setPeeking(index), index * (peek + GAP_MS)),
    );
    timers.push(
      window.setTimeout(
        () => {
          setPeeking(null);
          setPhase("find");
          const target = ANIMAL[hiding.spots[hiding.target]];
          setAnnouncement(`Where is the ${target.label}?`);
        },
        hiding.spots.length * (peek + GAP_MS),
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [phase, round, hiding]);

  useEffect(() => {
    if (phase !== "found") return;
    const id = window.setTimeout(() => {
      if (round + 1 >= PEEKABOO_ROUNDS) {
        setPhase("done");
        return;
      }
      setRound(round + 1);
      setHiding(makePeekabooRound());
      setShown([]);
      setFirstTry(true);
      setPhase("peek");
    }, NEXT_MS);
    return () => window.clearTimeout(id);
  }, [phase, round]);

  const found = stars.filter(Boolean).length;
  useEffect(() => {
    if (phase !== "done" || paid.current) return;
    paid.current = true;
    finishRef.current(found);
    setAnnouncement(`All done! You found ${found} on the first try.`);
  }, [phase, found]);

  const start = () => {
    paid.current = false;
    setRound(0);
    setHiding(makePeekabooRound());
    setShown([]);
    setStars([]);
    setFirstTry(true);
    setPhase("peek");
    setAnnouncement("Watch the bushes!");
  };

  const pick = (index: number) => {
    if (phase !== "find") return;
    const animal = ANIMAL[hiding.spots[index]];
    if (index === hiding.target) {
      playCuteSound("yay");
      setShown((all) => [...all, index]);
      setStars((all) => [...all, firstTry]);
      setPhase("found");
      setAnnouncement(`Peekaboo! You found the ${animal.label}!`);
      return;
    }
    playCuteSound("boing");
    setFirstTry(false);
    setShown((all) => (all.includes(index) ? all : [...all, index]));
    setAnnouncement(`That's the ${animal.label}. Keep looking!`);
  };

  const target = ANIMAL[hiding.spots[hiding.target]];

  return (
    <div className="peekaboo-game">
      <ol
        className="peekaboo-rounds"
        aria-label={`Round ${Math.min(round + 1, PEEKABOO_ROUNDS)} of ${PEEKABOO_ROUNDS}`}
      >
        {Array.from({ length: PEEKABOO_ROUNDS }, (_, index) => (
          <li key={index} aria-hidden="true">
            <Star
              size={20}
              fill={stars[index] ? "currentColor" : "none"}
              className={stars[index] === false ? "is-found" : undefined}
            />
          </li>
        ))}
      </ol>
      <p className="peekaboo-call" aria-hidden={phase !== "find"}>
        {phase === "find" ? (
          <>
            Where's the <span className="peekaboo-target">{target.emoji}</span>?
          </>
        ) : phase === "peek" ? (
          "Watch closely… 👀"
        ) : (
          " "
        )}
      </p>
      <div className="peekaboo-field">
        {hiding.spots.map((id, index) => {
          const out = peeking === index || shown.includes(index);
          return (
            <button
              key={`${round}-${index}`}
              type="button"
              className={`peekaboo-bush${out ? " is-out" : ""}`}
              aria-label={`Bush ${index + 1}${out ? `, ${ANIMAL[id].label}` : ""}`}
              disabled={phase !== "find"}
              onClick={() => pick(index)}
            >
              <span className="peekaboo-animal" aria-hidden="true">
                {ANIMAL[id].emoji}
              </span>
              <span className="peekaboo-leaves" aria-hidden="true">
                🌳
              </span>
            </button>
          );
        })}
        {(phase === "ready" || phase === "done") && (
          <div className="peekaboo-overlay">
            {phase === "done" && (
              <p className="peekaboo-result">
                🙈 {found} / {PEEKABOO_ROUNDS}
              </p>
            )}
            <p className="peekaboo-hint">
              Watch the animals peek out, then find the one called!
            </p>
            <button
              type="button"
              className="peekaboo-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start peekaboo"}
              onClick={start}
            >
              {phase === "done" ? (
                <RotateCcw size={30} aria-hidden="true" />
              ) : (
                <Play size={30} fill="currentColor" aria-hidden="true" />
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
