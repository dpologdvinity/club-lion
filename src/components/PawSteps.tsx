import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ListChecks,
  RotateCcw,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { PAW_STEPS_COINS_PER_ROUND } from "../game";
import { Coin } from "./Lion";

type Direction = "up" | "down" | "left" | "right";
type Phase = "intro" | "showing" | "input" | "over";

const DIRECTIONS: { id: Direction; label: string; icon: LucideIcon }[] = [
  { id: "up", label: "Up", icon: ArrowUp },
  { id: "left", label: "Left", icon: ArrowLeft },
  { id: "right", label: "Right", icon: ArrowRight },
  { id: "down", label: "Down", icon: ArrowDown },
];

const ARROW_KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const START_LENGTH = 2;
const STEP_MS = 520;
const GAP_MS = 200;
const TAP_FLASH_MS = 240;
const NEXT_ROUND_MS = 520;
const MISS_FLASH_MS = 420;
const REVEAL_MS = 900;

function randomDirection(): Direction {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)].id;
}

export function PawSteps({
  best,
  onFinish,
  onBack,
  onClose,
}: {
  best: number;
  onFinish: (rounds: number) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [sequence, setSequenceState] = useState<Direction[]>([]);
  const [phase, setPhaseState] = useState<Phase>("intro");
  const [rounds, setRoundsState] = useState(0);
  const [step, setStepState] = useState(0);
  const [lit, setLit] = useState<Direction | null>(null);
  const [missed, setMissed] = useState<Direction | null>(null);
  const timers = useRef<number[]>([]);
  const litTimer = useRef<number | undefined>(undefined);
  const rewarded = useRef(false);

  const playBtnRef = useRef<HTMLButtonElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");

  const phaseRef = useRef<Phase>("intro");
  const stepRef = useRef(0);
  const sequenceRef = useRef<Direction[]>([]);
  const roundsRef = useRef(0);

  const setPhase = (value: Phase) => {
    phaseRef.current = value;
    setPhaseState(value);
  };
  const setStep = (value: number) => {
    stepRef.current = value;
    setStepState(value);
  };
  const setSequence = (value: Direction[]) => {
    sequenceRef.current = value;
    setSequenceState(value);
  };
  const setRounds = (value: number) => {
    roundsRef.current = value;
    setRoundsState(value);
  };

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    window.clearTimeout(litTimer.current);
  };
  useEffect(() => clearTimers, []);

  const later = (delay: number, run: () => void) =>
    timers.current.push(window.setTimeout(run, delay));

  const flash = (direction: Direction, ms: number) => {
    window.clearTimeout(litTimer.current);
    setLit(direction);
    litTimer.current = window.setTimeout(() => setLit(null), ms);
  };

  const directionLabel = (d: Direction) =>
    DIRECTIONS.find((x) => x.id === d)?.label ?? d;

  useEffect(() => {
    if (phase === "intro") playBtnRef.current?.focus();
    if (phase === "showing" || phase === "input") padRef.current?.focus();
    if (phase === "over") playBtnRef.current?.focus();
  }, [phase]);

  const show = (steps: Direction[], then: () => void) => {
    setPhase("showing");
    setAnnouncement(`Showing: ${steps.map(directionLabel).join(", ")}`);
    steps.forEach((direction, index) => {
      later(index * (STEP_MS + GAP_MS), () => flash(direction, STEP_MS));
    });
    later(steps.length * (STEP_MS + GAP_MS), then);
  };

  const finish = () => {
    setPhase("over");
    if (rewarded.current) return;
    rewarded.current = true;
    onFinish(roundsRef.current);
  };

  const start = () => {
    clearTimers();
    rewarded.current = false;
    const first = Array.from({ length: START_LENGTH }, randomDirection);
    setSequence(first);
    setRounds(0);
    setStep(0);
    setMissed(null);
    setLit(null);
    show(first, () => {
      setStep(0);
      setPhase("input");
    });
  };

  const tap = (direction: Direction) => {
    if (phaseRef.current !== "input") return;
    const currentSeq = sequenceRef.current;
    const currentStep = stepRef.current;
    const expected = currentSeq[currentStep];
    if (!expected) return;
    flash(direction, TAP_FLASH_MS);
    if (direction !== expected) {
      setMissed(expected);
      setAnnouncement(
        `The next step was ${directionLabel(expected)}. Try again!`,
      );
      setPhase("showing");
      later(MISS_FLASH_MS, () => flash(expected, REVEAL_MS));
      later(MISS_FLASH_MS + REVEAL_MS, finish);
      return;
    }
    if (currentStep + 1 < currentSeq.length) {
      setStep(currentStep + 1);
      return;
    }
    const grown = [...currentSeq, randomDirection()];
    setRounds(roundsRef.current + 1);
    setSequence(grown);
    setPhase("showing");
    later(NEXT_ROUND_MS, () =>
      show(grown, () => {
        setStep(0);
        setPhase("input");
      }),
    );
  };

  useEffect(() => {
    if (phase !== "input") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const direction = ARROW_KEYS[event.key];
      if (!direction) return;
      event.preventDefault();
      if (event.repeat) return;
      tap(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, sequence, step, rounds]);

  const accepting = phase === "input";
  return (
    <div className="memory-game">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      {phase === "intro" ? (
        <div className="game-intro">
          <div className="game-illustration">
            <span>🐾</span>
            <span>🦁</span>
            <span>🐾</span>
          </div>
          <h3>Paw Steps</h3>
          <p>
            Watch the lion&apos;s paws light up, then tap them back in order.
            <br />
            Each round adds one more step. Every round is worth{" "}
            <strong>{PAW_STEPS_COINS_PER_ROUND} coins.</strong>
          </p>
          <div className="game-features">
            <span>
              <Sparkles size={15} /> No timer. Just remember.
            </span>
            <span>
              <ListChecks size={15} /> Starts at {START_LENGTH} steps
            </span>
          </div>
          {best > 0 && (
            <p className="game-help">
              Best so far: {best} {best === 1 ? "round" : "rounds"}
            </p>
          )}
          <div className="game-win-actions">
            <button
              ref={playBtnRef}
              className="button button-primary"
              onClick={start}
            >
              Let’s play <ArrowRight size={18} />
            </button>
            <button className="button button-secondary" onClick={onBack}>
              <ArrowLeft size={16} /> All games
            </button>
          </div>
        </div>
      ) : phase === "over" ? (
        <div className="game-intro game-win game-over">
          <div className="trophy-icon">
            <Trophy size={53} />
          </div>
          <h3>{rounds > 0 ? "What a run!" : "A brave first try!"}</h3>
          <p>
            You repeated {rounds} {rounds === 1 ? "round" : "rounds"} before the
            paws got sneaky.
            <br />
            Best so far: {Math.max(best, rounds)}{" "}
            {Math.max(best, rounds) === 1 ? "round" : "rounds"}.
          </p>
          <div className="reward-display">
            + <Coin amount={rounds * PAW_STEPS_COINS_PER_ROUND} />
          </div>
          <div className="game-win-actions">
            <button
              ref={playBtnRef}
              className="button button-secondary"
              onClick={start}
            >
              <RotateCcw size={16} /> Play again
            </button>
            <button className="button button-primary" onClick={onClose}>
              Back to the pride <ArrowRight size={16} />
            </button>
            <button className="button button-secondary" onClick={onBack}>
              <ArrowLeft size={16} /> All games
            </button>
          </div>
        </div>
      ) : (
        <>
          <button className="arcade-back" onClick={onBack}>
            <ArrowLeft size={15} /> All games
          </button>
          <div className="game-stats">
            <span>
              <ListChecks size={17} /> {rounds} rounds
            </span>
            <span>
              <Sparkles size={17} /> {sequence.length} steps
            </span>
            <Coin amount={rounds * PAW_STEPS_COINS_PER_ROUND} />
          </div>
          <div
            ref={padRef}
            className="paw-pad"
            role="group"
            aria-label="Paw step arrows"
            tabIndex={-1}
          >
            {DIRECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`paw-key paw-key-${id} ${lit === id ? "lit" : ""} ${missed === id ? "missed" : ""}`}
                aria-label={label}
                aria-disabled={!accepting}
                onClick={() => tap(id)}
              >
                <Icon size={30} />
              </button>
            ))}
            <span className="paw-center" aria-hidden="true">
              🐾
            </span>
          </div>
          <p className="game-help" role="status">
            {accepting
              ? `Your turn — repeat ${sequence.length - step} ${
                  sequence.length - step === 1 ? "step" : "steps"
                }.`
              : "Watch the paws…"}
          </p>
        </>
      )}
    </div>
  );
}
