import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Rocket } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  ROCKET_MAX_SCORE,
  ROCKET_ROUND_MS,
  ROCKET_X,
  driftSky,
  flyRocket,
  makeSkyThing,
  nearRocket,
  type SkyThing,
} from "../../utils/rocketBoard.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const THING_EVERY_MS = 700;

/** Hold Boost to climb, let go to drift down; grab the stars. */
export function RocketBoard({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [view, setView] = useState({ y: 50, things: [] as SkyThing[], ms: 0 });
  const [stars, setStars] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const boosting = useRef(false);
  const live = useRef({
    y: 50,
    things: [] as SkyThing[],
    next: 0,
    id: 0,
    stars: 0,
  });

  useGameLoop(phase === "play", (ms, dt) => {
    const game = live.current;
    if (ms >= ROCKET_ROUND_MS) {
      setPhase("done");
      if (!paid.current) {
        paid.current = true;
        const final = Math.min(game.stars, ROCKET_MAX_SCORE);
        onFinish(final);
        setAnnouncement(`Landing! ${final} stars.`);
      }
      return;
    }
    game.y = flyRocket(game.y, boosting.current, dt);
    game.things = driftSky(game.things, dt);
    if (ms >= game.next) {
      game.things = [...game.things, makeSkyThing(game.id++)];
      game.next = ms + THING_EVERY_MS;
    }
    const near = nearRocket(game.things, game.y);
    if (near.length) {
      const got = near.filter((t) => t.star).length;
      if (got) {
        playCuteSound("pop");
        game.stars += got;
        setStars(game.stars);
      }
      // A cloud is a soft bump down, nothing more.
      if (near.some((t) => !t.star)) game.y = Math.min(94, game.y + 8);
      game.things = game.things.filter((t) => !near.includes(t));
    }
    setView({ y: game.y, things: game.things, ms });
  });

  useEffect(() => {
    if (phase !== "play") return;
    const down = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "ArrowUp") {
        event.preventDefault();
        boosting.current = true;
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "ArrowUp")
        boosting.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  const start = () => {
    paid.current = false;
    live.current = { y: 50, things: [], next: 0, id: 0, stars: 0 };
    boosting.current = false;
    setStars(0);
    setView({ y: 50, things: [], ms: 0 });
    setPhase("play");
    setAnnouncement("Hold Boost to fly up!");
  };

  const secondsLeft = Math.ceil((ROCKET_ROUND_MS - view.ms) / 1000);
  return (
    <div className="fg-game rocket-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`${stars} stars`}>⭐ {stars}</li>
      </ol>
      <div className="fg-board rocket-sky" aria-hidden="true">
        {view.things.map((t) => (
          <span
            key={t.id}
            className="rocket-thing"
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
          >
            {t.star ? "⭐" : "☁️"}
          </span>
        ))}
        <span
          className="rocket-rider"
          style={{ left: `${ROCKET_X}%`, top: `${view.y}%` }}
        >
          🛹
        </span>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">⭐ {stars}</p>}
            <p className="fg-hint">
              Hold Boost to fly up, let go to float down!
            </p>
          </div>
        )}
      </div>
      {phase === "play" ? (
        <button
          type="button"
          className="fg-start rocket-boost"
          aria-label="Boost"
          onPointerDown={() => (boosting.current = true)}
          onPointerUp={() => (boosting.current = false)}
          onPointerLeave={() => (boosting.current = false)}
          onPointerCancel={() => (boosting.current = false)}
        >
          <Rocket size={34} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          className="fg-start"
          autoFocus
          aria-label={phase === "done" ? "Play again" : "Start Rocket Board"}
          onClick={start}
        >
          {phase === "done" ? (
            <RotateCcw size={34} aria-hidden="true" />
          ) : (
            <Play size={34} fill="currentColor" aria-hidden="true" />
          )}
        </button>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
