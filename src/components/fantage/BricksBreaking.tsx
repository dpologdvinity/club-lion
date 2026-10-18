import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  BRICKS_ROUND_MS,
  BRICKS_TOTAL,
  BRICK_COLS,
  COURT_H,
  COURT_W,
  PADDLE_W,
  PADDLE_Y,
  brickBox,
  newBall,
  stepBall,
  type Ball,
} from "../../utils/bricksBreaking.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const BRICK_COLORS = ["#ff5a8a", "#ffb52e", "#ffe14a", "#4cc97a", "#4aa8ff"];
const NUDGE = 9;

/** Bounce the ball off the paddle to break every brick. */
export function BricksBreaking({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [view, setView] = useState({
    ball: newBall(),
    standing: Array<boolean>(BRICKS_TOTAL).fill(true),
    paddle: 50,
    ms: 0,
  });
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const game = useRef(view);
  const paddle = useRef(50);

  useEffect(() => {
    if (phase !== "play") return;
    let last = performance.now();
    const started = last;
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      const { ball, broke }: { ball: Ball; broke: number[] } = stepBall(
        g.ball,
        dt,
        paddle.current,
        g.standing,
      );
      const standing = broke.length
        ? g.standing.map((up, i) => up && !broke.includes(i))
        : g.standing;
      if (broke.length) playCuteSound("pop");
      const ms = now - started;
      game.current = { ball, standing, paddle: paddle.current, ms };
      setView(game.current);
      if (!standing.some(Boolean) || ms >= BRICKS_ROUND_MS) {
        setPhase("done");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const broken = view.standing.filter((up) => !up).length;
  useEffect(() => {
    if (phase !== "done" || paid.current) return;
    paid.current = true;
    onFinish(broken);
    setAnnouncement(`Round over! ${broken} bricks broken.`);
  }, [phase, broken, onFinish]);

  const start = () => {
    paid.current = false;
    paddle.current = 50;
    game.current = {
      ball: newBall(),
      standing: Array<boolean>(BRICKS_TOTAL).fill(true),
      paddle: 50,
      ms: 0,
    };
    setView(game.current);
    setPhase("play");
    setAnnouncement("Move the paddle under the ball!");
  };

  const moveTo = (x: number) => {
    paddle.current = Math.max(
      PADDLE_W / 2,
      Math.min(COURT_W - PADDLE_W / 2, x),
    );
  };
  const follow = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    moveTo(((event.clientX - box.left) / box.width) * COURT_W);
  };

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") moveTo(paddle.current - NUDGE);
      else if (event.key === "ArrowRight") moveTo(paddle.current + NUDGE);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const secondsLeft = Math.ceil((BRICKS_ROUND_MS - view.ms) / 1000);
  return (
    <div className="fg-game bricks-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`${broken} bricks broken`}>🧱 {broken}</li>
      </ol>
      <div className="fg-board bricks-court">
        <svg
          viewBox={`0 0 ${COURT_W} ${COURT_H}`}
          role="img"
          aria-label="Brick court"
          onPointerMove={follow}
          onPointerDown={follow}
        >
          <rect width={COURT_W} height={COURT_H} fill="#16285a" />
          {view.standing.map((up, i) => {
            if (!up) return null;
            const b = brickBox(i);
            return (
              <rect
                key={i}
                x={b.x + 0.5}
                y={b.y + 0.5}
                width={b.w - 1}
                height={b.h - 1}
                rx="1.5"
                fill={
                  BRICK_COLORS[Math.floor(i / BRICK_COLS) % BRICK_COLORS.length]
                }
              />
            );
          })}
          <rect
            x={view.paddle - PADDLE_W / 2}
            y={PADDLE_Y}
            width={PADDLE_W}
            height="4"
            rx="2"
            fill="#ffffff"
          />
          <circle cx={view.ball.x} cy={view.ball.y} r="2.4" fill="#ffe14a" />
        </svg>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🧱 {broken}</p>}
            <p className="fg-hint">
              Slide the paddle to keep the ball bouncing!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Bricks Breaking"
              }
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
          aria-label="Paddle left"
          disabled={phase !== "play"}
          onClick={() => moveTo(paddle.current - NUDGE * 2)}
        >
          <ArrowLeft size={32} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="maze-arrow"
          aria-label="Paddle right"
          disabled={phase !== "play"}
          onClick={() => moveTo(paddle.current + NUDGE * 2)}
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
