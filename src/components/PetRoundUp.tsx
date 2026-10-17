import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import { PET_PROFILES } from "../utils/petSpecies.ts";
import {
  PEN,
  ROUNDUP_PETS,
  ROUNDUP_ROUND_MS,
  ROUNDUP_STEP_MS,
  dragPet,
  hopTowardPen,
  isPenned,
  makePets,
  nudgePets,
  roundUpScore,
  stepPets,
  type RoundUpPet,
} from "../utils/petRoundUp.ts";
import { PetPicture } from "./PetSpeciesArt";
import "./petRoundUp.css";

type Phase = "ready" | "play" | "done";
type Point = { x: number; y: number };

const stillMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Herd wandering pets into the pen: they run from your finger, or drag one in. */
export function PetRoundUp({
  best,
  onFinish,
}: {
  best: number;
  onFinish: (score: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [pets, setPets] = useState<RoundUpPet[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const field = useRef<HTMLDivElement>(null);
  const petsRef = useRef<RoundUpPet[]>([]);
  const startAt = useRef(0);
  const herd = useRef<Point | null>(null);
  const drag = useRef<{ id: number; at: Point | null } | null>(null);
  const dragged = useRef(false);
  const phaseRef = useRef<Phase>("ready");
  const paid = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const finish = (final: number, message: string) => {
    phaseRef.current = "done";
    setPhase("done");
    setScore(final);
    if (!paid.current) finishRef.current(final);
    paid.current = true;
    setAnnouncement(message);
  };

  /** Every pet move goes through here so the pen count and the end stay in step. */
  const update = (move: (all: RoundUpPet[]) => RoundUpPet[]) => {
    if (phaseRef.current !== "play") return;
    const before = petsRef.current.filter(isPenned).length;
    petsRef.current = move(petsRef.current);
    setPets(petsRef.current);
    const penned = petsRef.current.filter(isPenned).length;
    if (penned === ROUNDUP_PETS) {
      playCuteSound("yay");
      const left = ROUNDUP_ROUND_MS - (Date.now() - startAt.current);
      const final = roundUpScore(petsRef.current, left);
      finish(final, `All the pets are home! Score ${final}.`);
    } else if (penned > before) {
      playCuteSound("pop");
      setAnnouncement(`${penned} of ${ROUNDUP_PETS} in the pen!`);
    }
  };
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(() => {
      const t = Date.now() - startAt.current;
      setElapsed(t);
      if (t >= ROUNDUP_ROUND_MS) {
        const final = roundUpScore(petsRef.current, 0);
        finish(final, `Time is up. ${final} pets in the pen!`);
        return;
      }
      updateRef.current((all) => {
        const herded = herd.current ? nudgePets(all, herd.current) : all;
        const walked = stepPets(herded, Math.random, !stillMotion());
        const held = drag.current;
        return held?.at ? dragPet(walked, held.id, held.at) : walked;
      });
    }, ROUNDUP_STEP_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  const start = () => {
    startAt.current = Date.now();
    paid.current = false;
    herd.current = null;
    drag.current = null;
    petsRef.current = makePets();
    setPets(petsRef.current);
    setElapsed(0);
    setScore(0);
    setAnnouncement("Shoo the pets into the pen!");
    phaseRef.current = "play";
    setPhase("play");
  };

  const pointAt = (event: PointerEvent): Point => {
    const box = field.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return { x: 50, y: 50 };
    return {
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    };
  };

  const onFieldDown = (event: PointerEvent) => {
    if (phaseRef.current !== "play") return;
    herd.current = pointAt(event);
    const at = herd.current;
    update((all) => nudgePets(all, at));
  };

  const onFieldMove = (event: PointerEvent) => {
    const held = drag.current;
    if (held) {
      const at = pointAt(event);
      held.at = at;
      dragged.current = true;
      update((all) => dragPet(all, held.id, at));
    } else if (herd.current) herd.current = pointAt(event);
  };

  const letGo = () => {
    herd.current = null;
    drag.current = null;
  };

  const tapPet = (pet: RoundUpPet) => {
    // A drag ends in a click too; only a plain tap hops the pet.
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    playCuteSound("boing");
    update((all) => hopTowardPen(all, pet.id));
  };

  const penned = pets.filter(isPenned).length;
  const secondsLeft = Math.max(
    0,
    Math.ceil((ROUNDUP_ROUND_MS - elapsed) / 1000),
  );

  return (
    <div className="roundup-game">
      <div className="roundup-bar">
        <span
          className="roundup-count"
          aria-label={`${penned} of ${ROUNDUP_PETS} in the pen`}
        >
          🏡 <strong>{penned}</strong>/{ROUNDUP_PETS}
        </span>
        <span
          className="roundup-time"
          aria-label={`${secondsLeft} seconds left`}
        >
          <Timer size={22} aria-hidden="true" /> {secondsLeft}
        </span>
        <span className="roundup-best" aria-label={`Best ${best}`}>
          <Trophy size={20} aria-hidden="true" /> {best}
        </span>
      </div>
      <div
        ref={field}
        className="roundup-field"
        data-phase={phase}
        onPointerDown={onFieldDown}
        onPointerMove={onFieldMove}
        onPointerUp={letGo}
        onPointerCancel={letGo}
        onPointerLeave={letGo}
      >
        <div
          className="roundup-pen"
          style={{ left: `${PEN.x1 - 4}%`, height: `${PEN.y2 + 6}%` }}
          aria-hidden="true"
        >
          <span className="roundup-pen-sign">🏡</span>
        </div>
        {phase === "play" &&
          pets.map((pet) => {
            const home = isPenned(pet);
            const name = PET_PROFILES[pet.species].label;
            return (
              <button
                key={pet.id}
                type="button"
                className={`roundup-pet${home ? " is-penned" : ""}`}
                style={{ left: `${pet.x}%`, top: `${pet.y}%` }}
                aria-label={home ? `${name}, in the pen` : name}
                data-pet-id={pet.id}
                data-penned={home}
                onPointerDown={(event) => {
                  // Grab this pet instead of shooing it.
                  event.stopPropagation();
                  dragged.current = false;
                  drag.current = { id: pet.id, at: null };
                }}
                onClick={() => tapPet(pet)}
              >
                <PetPicture species={pet.species} className="roundup-art" />
              </button>
            );
          })}
        {phase !== "play" && (
          <div className="roundup-overlay">
            {phase === "done" && (
              <p className="roundup-result">
                🏡 {score} {score === 1 ? "point" : "points"}!
              </p>
            )}
            <p className="roundup-hint">
              Tap near a pet to shoo it, or drag it into the pen.
            </p>
            <button
              type="button"
              className="roundup-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Let's round up!"}
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
