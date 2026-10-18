import { useRef, useState, type PointerEvent } from "react";
import { Flag, Play, RotateCcw, Star } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  BALL_R,
  HOLES,
  HOLE_R,
  PUTT_H,
  PUTT_MAX_STROKES,
  PUTT_W,
  aimAt,
  holeStars,
  inCup,
  isStopped,
  rollBall,
  type Ball,
} from "../../utils/puttPutt.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "aim" | "rolling" | "holed" | "done";
const teeBall = (i: number): Ball => ({
  x: HOLES[i].tee[0],
  y: HOLES[i].tee[1],
  vx: 0,
  vy: 0,
});

/** Mini golf: tap where the ball should roll and bank it into the cup. */
export function PuttPutt({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [hole, setHole] = useState(0);
  const [ball, setBall] = useState<Ball>(() => teeBall(0));
  const [strokes, setStrokes] = useState(0);
  const [stars, setStars] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const live = useRef<Ball>(teeBall(0));
  // One ending per hole, even if another frame runs before the loop stops.
  const ended = useRef(false);
  const course = HOLES[hole];

  const endHole = (sunk: boolean, used: number) => {
    if (ended.current) return;
    ended.current = true;
    const got = sunk ? holeStars(used, course.par) : 1;
    setStars((all) => [...all, got]);
    setPhase("holed");
    setAnnouncement(
      sunk
        ? `In the cup in ${used}! ${got} stars.`
        : "Nice try! On to the next hole.",
    );
    if (sunk) playCuteSound("yay");
  };

  useGameLoop(phase === "rolling", (_ms, dt) => {
    if (ended.current) return;
    const next = rollBall(live.current, dt, course);
    live.current = next;
    setBall(next);
    if (inCup(next, course)) {
      live.current = { x: course.cup[0], y: course.cup[1], vx: 0, vy: 0 };
      setBall(live.current);
      endHole(true, strokes);
    } else if (isStopped(next)) {
      if (strokes >= PUTT_MAX_STROKES) endHole(false, strokes);
      else setPhase("aim");
    }
  });

  const start = () => {
    paid.current = false;
    setHole(0);
    live.current = teeBall(0);
    setBall(live.current);
    setStrokes(0);
    setStars([]);
    ended.current = false;
    setPhase("aim");
    setAnnouncement("Tap where you want the ball to roll!");
  };

  const putt = (tx: number, ty: number) => {
    if (phase !== "aim") return;
    playCuteSound("pop");
    live.current = aimAt(live.current, tx, ty);
    setStrokes((s) => s + 1);
    setPhase("rolling");
  };
  const tapCourse = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    putt(
      ((event.clientX - box.left) / box.width) * PUTT_W,
      ((event.clientY - box.top) / box.height) * PUTT_H,
    );
  };

  const next = () => {
    if (hole + 1 >= HOLES.length) {
      const total = stars.reduce((sum, s) => sum + s, 0);
      setPhase("done");
      setAnnouncement(`Course complete! ${total} stars.`);
      if (!paid.current) {
        paid.current = true;
        onFinish(total);
      }
      return;
    }
    setHole(hole + 1);
    live.current = teeBall(hole + 1);
    setBall(live.current);
    setStrokes(0);
    ended.current = false;
    setPhase("aim");
  };

  const total = stars.reduce((sum, s) => sum + s, 0);
  return (
    <div className="fg-game putt-game">
      <ol className="fg-hud">
        <li
          aria-label={`Hole ${hole + 1} of ${HOLES.length}, par ${course.par}`}
        >
          ⛳ {hole + 1}/{HOLES.length}
        </li>
        <li aria-label={`${strokes} strokes`}>🏌️ {strokes}</li>
        <li aria-label={`${total} stars`}>⭐ {total}</li>
      </ol>
      <div className="fg-board putt-course">
        <svg
          viewBox={`0 0 ${PUTT_W} ${PUTT_H}`}
          role="img"
          aria-label="The golf course"
          onPointerDown={tapCourse}
        >
          <rect width={PUTT_W} height={PUTT_H} rx="6" fill="#4cc97a" />
          <rect
            width={PUTT_W}
            height={PUTT_H}
            rx="6"
            fill="none"
            stroke="#8a5620"
            strokeWidth="3"
          />
          {course.blocks.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="2"
              fill="#b7792f"
            />
          ))}
          <circle
            cx={course.cup[0]}
            cy={course.cup[1]}
            r={HOLE_R}
            fill="#1a2a1a"
          />
          <path
            d={`M${course.cup[0]} ${course.cup[1]}V${course.cup[1] - 14}l8 3l-8 3`}
            fill="#e8333a"
            stroke="#ffffff"
            strokeWidth="0.6"
          />
          <circle
            cx={ball.x}
            cy={ball.y}
            r={BALL_R}
            fill="#ffffff"
            stroke="#9aa4b8"
            strokeWidth="0.5"
          />
        </svg>
        {phase === "holed" && (
          <div className="fg-overlay">
            <p className="fg-result" aria-label={`${stars.at(-1) ?? 0} stars`}>
              {Array.from({ length: 3 }, (_, i) => (
                <Star
                  key={i}
                  size={30}
                  fill={i < (stars.at(-1) ?? 0) ? "#ffc83a" : "none"}
                  aria-hidden="true"
                />
              ))}
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label="Next hole"
              onClick={next}
            >
              <Play size={34} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        )}
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">⭐ {total}</p>}
            <p className="fg-hint">
              Tap where the ball should roll. Bounce it into the cup!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Putt Putt Revolution"
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
      <button
        type="button"
        className="maze-arrow putt-straight"
        aria-label="Putt toward the cup"
        disabled={phase !== "aim"}
        onClick={() => putt(course.cup[0], course.cup[1])}
      >
        <Flag size={30} aria-hidden="true" />
      </button>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
