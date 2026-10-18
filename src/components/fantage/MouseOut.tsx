import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Play,
  RotateCcw,
} from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  MAZES,
  findCell,
  stepMouse,
  type Spot,
  type Step,
} from "../../utils/mouseOut.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "found" | "done";
const KEYS: Record<string, Step> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};
const PAD: { step: Step; label: string; Icon: typeof ArrowUp }[] = [
  { step: "up", label: "Up", Icon: ArrowUp },
  { step: "left", label: "Left", Icon: ArrowLeft },
  { step: "right", label: "Right", Icon: ArrowRight },
  { step: "down", label: "Down", Icon: ArrowDown },
];

/** Steer the mouse through each maze to the cheese. */
export function MouseOut({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const maze = MAZES[level];
  const [mouse, setMouse] = useState<Spot>(() => findCell(MAZES[0], "M"));
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const cheese = findCell(maze, "C");

  const start = () => {
    paid.current = false;
    setLevel(0);
    setMouse(findCell(MAZES[0], "M"));
    setPhase("play");
    setAnnouncement("Use the arrows to find the cheese!");
  };

  const next = () => {
    if (level + 1 >= MAZES.length) {
      setPhase("done");
      setAnnouncement("Every maze solved! Yum!");
      if (!paid.current) {
        paid.current = true;
        onFinish(MAZES.length);
      }
      return;
    }
    setLevel(level + 1);
    setMouse(findCell(MAZES[level + 1], "M"));
    setPhase("play");
  };

  const move = (step: Step) => {
    if (phase !== "play") return;
    const to = stepMouse(maze, mouse, step);
    if (to === mouse) {
      playCuteSound("boing");
      return;
    }
    setMouse(to);
    if (to.row === cheese.row && to.col === cheese.col) {
      playCuteSound("yay");
      setPhase("found");
      setAnnouncement("Cheese! The mouse is happy.");
    }
  };

  const moveRef = useRef(move);
  moveRef.current = move;
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (event: KeyboardEvent) => {
      const step = KEYS[event.key];
      if (!step) return;
      event.preventDefault();
      moveRef.current(step);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  return (
    <div className="fg-game maze-game">
      <p className="fg-hud" aria-label={`Maze ${level + 1} of ${MAZES.length}`}>
        🧀 {level + 1}/{MAZES.length}
      </p>
      <div className="fg-board">
        <div
          className="maze-grid"
          role="img"
          aria-label={`The mouse is at row ${mouse.row + 1}, column ${mouse.col + 1}`}
        >
          {maze.flatMap((line, row) =>
            [...line].map((cell, col) => (
              <span
                key={`${row}-${col}`}
                className={`maze-cell${cell === "#" ? " is-wall" : ""}`}
              >
                {mouse.row === row && mouse.col === col
                  ? "🐭"
                  : cheese.row === row && cheese.col === col
                    ? "🧀"
                    : ""}
              </span>
            )),
          )}
        </div>
        {phase === "found" && (
          <div className="fg-overlay">
            <p className="fg-result">🐭 🧀</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label="Next maze"
              onClick={next}
            >
              <Play size={34} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        )}
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🧀 {MAZES.length}</p>}
            <p className="fg-hint">Guide the mouse to the cheese!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Mouse Out"}
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
      <div className="maze-pad">
        {PAD.map(({ step, label, Icon }) => (
          <button
            key={step}
            type="button"
            className={`maze-arrow maze-${step}`}
            aria-label={label}
            disabled={phase !== "play"}
            onClick={() => move(step)}
          >
            <Icon size={32} aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
