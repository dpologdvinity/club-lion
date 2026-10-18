import { useRef, useState, type PointerEvent } from "react";
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
  BOBO_MAX_SCORE,
  BOBO_ROUND_MS,
  boboSize,
  gobbled,
  makeFish,
  swim,
  type Fish,
} from "../../utils/boboFish.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const FISH_EVERY_MS = 650;
const SWIM_SPEED = 45;
const NUDGE = 10;

/** Steer BoBo to gobble the smaller fish and grow. */
export function BoboFish({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [view, setView] = useState({ x: 50, y: 50, fish: [] as Fish[], ms: 0 });
  const [eaten, setEaten] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const live = useRef({
    x: 50,
    y: 50,
    fish: [] as Fish[],
    next: 0,
    id: 0,
    eaten: 0,
  });
  const target = useRef({ x: 50, y: 50 });

  useGameLoop(phase === "play", (ms, dt) => {
    const game = live.current;
    if (ms >= BOBO_ROUND_MS) {
      setPhase("done");
      if (!paid.current) {
        paid.current = true;
        const final = Math.min(game.eaten, BOBO_MAX_SCORE);
        onFinish(final);
        setAnnouncement(`Swim over! BoBo gobbled ${final} fish.`);
      }
      return;
    }
    // BoBo swims toward the finger (or the arrows' target) at a steady pace.
    const dx = target.current.x - game.x;
    const dy = target.current.y - game.y;
    const dist = Math.hypot(dx, dy);
    const step = Math.min(dist, SWIM_SPEED * dt);
    if (dist > 0) {
      game.x += (dx / dist) * step;
      game.y += (dy / dist) * step;
    }
    const size = boboSize(game.eaten);
    game.fish = swim(game.fish, dt);
    if (ms >= game.next) {
      game.fish = [...game.fish, makeFish(game.id++, size)];
      game.next = ms + FISH_EVERY_MS;
    }
    const ate = gobbled(game.fish, game.x, game.y, size);
    if (ate.length) {
      playCuteSound("pop");
      game.fish = game.fish.filter((f) => !ate.includes(f.id));
      game.eaten += ate.length;
      setEaten(game.eaten);
    }
    // Bigger fish give a gentle nudge instead of any penalty.
    for (const f of game.fish)
      if (
        f.size >= size &&
        Math.hypot(f.x - game.x, f.y - game.y) < (size + f.size) / 2
      )
        game.y = Math.max(5, Math.min(95, game.y + (game.y < f.y ? -4 : 4)));
    setView({ x: game.x, y: game.y, fish: game.fish, ms });
  });

  const start = () => {
    paid.current = false;
    live.current = { x: 50, y: 50, fish: [], next: 0, id: 0, eaten: 0 };
    target.current = { x: 50, y: 50 };
    setEaten(0);
    setView({ x: 50, y: 50, fish: [], ms: 0 });
    setPhase("play");
    setAnnouncement("Steer BoBo to the little fish!");
  };

  const aim = (x: number, y: number) => {
    target.current = {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };
  const follow = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    aim(
      ((event.clientX - box.left) / box.width) * 100,
      ((event.clientY - box.top) / box.height) * 100,
    );
  };
  const nudge = (dx: number, dy: number) =>
    aim(live.current.x + dx, live.current.y + dy);

  const size = boboSize(eaten);
  const secondsLeft = Math.ceil((BOBO_ROUND_MS - view.ms) / 1000);
  return (
    <div className="fg-game bobo-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`${eaten} fish gobbled`}>🐟 {eaten}</li>
      </ol>
      <div className="fg-board bobo-reef">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label="The reef"
          onPointerMove={follow}
          onPointerDown={follow}
        >
          <rect width="100" height="100" fill="#2a9ad8" />
          <rect y="88" width="100" height="12" fill="#f2d8a0" />
          {view.fish.map((f) => (
            <text
              key={f.id}
              x={f.x}
              y={f.y}
              fontSize={f.size}
              textAnchor="middle"
              dominantBaseline="central"
              transform={
                f.vx > 0 ? `scale(-1 1) translate(${-2 * f.x} 0)` : undefined
              }
            >
              {f.size < size ? "🐟" : "🐡"}
            </text>
          ))}
          <text
            x={view.x}
            y={view.y}
            fontSize={size * 1.3}
            textAnchor="middle"
            dominantBaseline="central"
          >
            🐠
          </text>
        </svg>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🐟 {eaten}</p>}
            <p className="fg-hint">Steer BoBo to the smaller fish!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start BoBo Fish"}
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
        {(
          [
            ["up", "Swim up", ArrowUp, 0, -NUDGE],
            ["left", "Swim left", ArrowLeft, -NUDGE, 0],
            ["right", "Swim right", ArrowRight, NUDGE, 0],
            ["down", "Swim down", ArrowDown, 0, NUDGE],
          ] as const
        ).map(([area, label, Icon, dx, dy]) => (
          <button
            key={area}
            type="button"
            className={`maze-arrow maze-${area}`}
            aria-label={label}
            disabled={phase !== "play"}
            onClick={() => nudge(dx, dy)}
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
