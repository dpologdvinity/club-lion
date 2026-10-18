import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  GALAXY_MAX_SCORE,
  GALAXY_ROUND_MS,
  SHIP_Y,
  SHOT_EVERY_MS,
  makeMeteor,
  stepGalaxy,
  type Meteor,
  type Shot,
} from "../../utils/galaxyHero.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
type View = { ship: number; meteors: Meteor[]; shots: Shot[]; ms: number };
const METEOR_EVERY_MS = 800;
const NUDGE = 8;
const EMPTY: View = { ship: 50, meteors: [], shots: [], ms: 0 };

/** Steer the ship; it zaps the falling meteors on its own. */
export function GalaxyHero({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [view, setView] = useState<View>(EMPTY);
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const ship = useRef(50);
  const hits = useRef(0);

  useEffect(() => {
    if (phase !== "play") return;
    const started = performance.now();
    let last = started;
    let nextShot = 0;
    let nextMeteor = 0;
    let id = 0;
    let state: View = EMPTY;
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      const ms = now - started;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let shots = state.shots;
      let meteors = state.meteors;
      if (ms >= nextShot) {
        shots = [...shots, { id: id++, x: ship.current, y: SHIP_Y - 6 }];
        nextShot = ms + SHOT_EVERY_MS;
      }
      if (ms >= nextMeteor) {
        meteors = [...meteors, makeMeteor(id++)];
        nextMeteor = ms + METEOR_EVERY_MS;
      }
      const stepped = stepGalaxy(meteors, shots, dt);
      if (stepped.hits) {
        playCuteSound("pop");
        hits.current += stepped.hits;
        setScore(hits.current);
      }
      state = {
        ship: ship.current,
        meteors: stepped.meteors,
        shots: stepped.shots,
        ms,
      };
      setView(state);
      if (ms >= GALAXY_ROUND_MS) {
        setPhase("done");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done" || paid.current) return;
    paid.current = true;
    const final = Math.min(score, GALAXY_MAX_SCORE);
    onFinish(final);
    setAnnouncement(`Flight over! ${final} meteors zapped.`);
  }, [phase, score, onFinish]);

  const start = () => {
    paid.current = false;
    ship.current = 50;
    hits.current = 0;
    setScore(0);
    setView(EMPTY);
    setPhase("play");
    setAnnouncement("Steer under the meteors!");
  };

  const moveTo = (x: number) => {
    ship.current = Math.max(6, Math.min(94, x));
  };
  const follow = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    moveTo(((event.clientX - box.left) / box.width) * 100);
  };

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") moveTo(ship.current - NUDGE);
      else if (event.key === "ArrowRight") moveTo(ship.current + NUDGE);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const secondsLeft = Math.ceil((GALAXY_ROUND_MS - view.ms) / 1000);
  return (
    <div className="fg-game galaxy-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`${score} meteors zapped`}>☄️ {score}</li>
      </ol>
      <div className="fg-board galaxy-space">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label="Outer space"
          onPointerMove={follow}
          onPointerDown={follow}
        >
          <rect width="100" height="100" fill="#0d1238" />
          {view.shots.map((s) => (
            <rect
              key={s.id}
              x={s.x - 0.6}
              y={s.y - 3}
              width="1.2"
              height="5"
              rx="0.6"
              fill="#7cf7ff"
            />
          ))}
          {view.meteors.map((m) => (
            <text
              key={m.id}
              x={m.x}
              y={m.y}
              fontSize="9"
              textAnchor="middle"
              dominantBaseline="central"
            >
              ☄️
            </text>
          ))}
          <text
            x={view.ship}
            y={SHIP_Y}
            fontSize="11"
            textAnchor="middle"
            dominantBaseline="central"
          >
            🚀
          </text>
        </svg>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">☄️ {score}</p>}
            <p className="fg-hint">
              Steer the ship; it zaps meteors by itself!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Galaxy Hero"}
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
        <button
          type="button"
          className="maze-arrow"
          aria-label="Ship left"
          disabled={phase !== "play"}
          onClick={() => moveTo(ship.current - NUDGE * 2)}
        >
          <ArrowLeft size={32} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="maze-arrow"
          aria-label="Ship right"
          disabled={phase !== "play"}
          onClick={() => moveTo(ship.current + NUDGE * 2)}
        >
          <ArrowRight size={32} aria-hidden="true" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
