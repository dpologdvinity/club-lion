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
  BOXY_LEVELS,
  isSolved,
  loadLevel,
  moveBoxy,
  type BoxyStep,
} from "../../utils/boxy.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "solved" | "done";
const KEYS: Record<string, BoxyStep> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};
const PAD = [
  { step: "up", label: "Up", Icon: ArrowUp },
  { step: "left", label: "Left", Icon: ArrowLeft },
  { step: "right", label: "Right", Icon: ArrowRight },
  { step: "down", label: "Down", Icon: ArrowDown },
] as const;

/** Push every box onto a goal; Reset puts the room back. */
export function Boxy({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const [state, setState] = useState(() => loadLevel(BOXY_LEVELS[0]));
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const map = BOXY_LEVELS[level];

  const start = () => {
    paid.current = false;
    setLevel(0);
    setState(loadLevel(BOXY_LEVELS[0]));
    setPhase("play");
    setAnnouncement("Push every box onto a target!");
  };

  const move = (step: BoxyStep) => {
    if (phase !== "play") return;
    const next = moveBoxy(state, step);
    if (next === state) {
      playCuteSound("boing");
      return;
    }
    setState(next);
    if (isSolved(next)) {
      playCuteSound("yay");
      setPhase("solved");
      setAnnouncement("Every box is home!");
    }
  };

  const next = () => {
    if (level + 1 >= BOXY_LEVELS.length) {
      setPhase("done");
      setAnnouncement("All five rooms solved!");
      if (!paid.current) {
        paid.current = true;
        onFinish(BOXY_LEVELS.length);
      }
      return;
    }
    setLevel(level + 1);
    setState(loadLevel(BOXY_LEVELS[level + 1]));
    setPhase("play");
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

  const cols = Math.max(...map.map((line) => line.length));
  return (
    <div className="fg-game boxy-game">
      <p
        className="fg-hud"
        aria-label={`Room ${level + 1} of ${BOXY_LEVELS.length}`}
      >
        📦 {level + 1}/{BOXY_LEVELS.length}
      </p>
      <div className="fg-board">
        <div
          className="boxy-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`Boxy is at row ${state.player[0] + 1}, column ${state.player[1] + 1}`}
        >
          {map.flatMap((line, r) =>
            [...line.padEnd(cols, "#")].map((_, c) => {
              const k = `${r},${c}`;
              const wall = state.walls.has(k) || c >= line.length;
              const goal = state.goals.has(k);
              const box = state.boxes.has(k);
              const boxy = state.player[0] === r && state.player[1] === c;
              return (
                <span
                  key={k}
                  className={`boxy-cell${wall ? " is-wall" : ""}${goal ? " is-goal" : ""}`}
                >
                  {boxy ? "🤖" : box ? (goal ? "✅" : "📦") : goal ? "🎯" : ""}
                </span>
              );
            }),
          )}
        </div>
        {phase === "solved" && (
          <div className="fg-overlay">
            <p className="fg-result">✅</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label="Next room"
              onClick={next}
            >
              <Play size={34} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        )}
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && (
              <p className="fg-result">📦 {BOXY_LEVELS.length}</p>
            )}
            <p className="fg-hint">Push every box onto a target!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Boxy"}
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
      <div className="fg-pad">
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
        <button
          type="button"
          className="maze-arrow boxy-reset"
          aria-label="Reset the room"
          disabled={phase !== "play"}
          onClick={() => setState(loadLevel(map))}
        >
          <RotateCcw size={30} aria-hidden="true" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
