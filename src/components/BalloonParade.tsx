import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Play, Rainbow, RotateCcw, Sparkles, Star } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import {
  BALLOON_COLORS,
  RAINBOW_ORDER,
  isRainbowFinished,
  pickSurprise,
  rainbowProgress,
  spawnColor,
  type BalloonColor,
  type Surprise,
} from "../utils/balloonParade.ts";
import {
  playRainbowNote,
  playSqueakyPop,
} from "../utils/balloonParadeSounds.ts";
import { AnimalArt } from "./AnimalArt";

/** A new balloon rises every this many milliseconds. */
const SPAWN_MS = 1_100;
/** The stage keeps at most this many balloons in the air. */
const MAX_BALLOONS = 12;
/** How long a pop's surprise stays on screen. */
const POP_MS = 1_800;
const STICKERS = ["🌈", "🌟", "🏆"];
const CONFETTI_COLORS = ["#ff7aa2", "#5ec8e2", "#ffb347", "#ffd84d", "#4cc97a"];
/** Stripe outlines for the arch, outermost (first in the order) to innermost. */
const RAINBOW_ARCS = RAINBOW_ORDER.map((color, index) => {
  const radius = 92 - index * 12;
  return {
    id: color,
    d: `M${100 - radius} 104A${radius} ${radius} 0 0 1 ${100 + radius} 104`,
  };
});

type Mode = "pop" | "rainbow";
type Balloon = {
  id: number;
  color: BalloonColor;
  left: number;
  duration: number;
  /** Seconds already into the rise, so the first balloons are spread up the stage. */
  offset: number;
  surprise: Surprise;
  /** Bumps when a wrong colour is tapped in rainbow order, to replay the wiggle. */
  wiggle: number;
};
type Pop = {
  key: number;
  x: number;
  y: number;
  color: BalloonColor;
  surprise: Surprise;
};

/** Lanes in spawn order: back-to-back balloons rise two lanes apart, so tap targets never overlap. */
const LANES = [12, 50, 88, 31, 69];

function newBalloon(
  id: number,
  mode: Mode,
  progress: number,
  offset: number,
): Balloon {
  return {
    id,
    color: spawnColor(mode, progress),
    left: LANES[id % LANES.length],
    duration: 10 + Math.random(),
    offset,
    surprise: pickSurprise(),
    wiggle: 0,
  };
}

/** Pop the balloons to free the surprises; in rainbow mode, pop them in colour order to build an arch. */
export function BalloonParade({
  onRainbowDone,
}: {
  /** Called once per finished rainbow arch. */
  onRainbowDone: () => void;
}) {
  const [mode, setMode] = useState<Mode>("pop");
  const [progress, setProgress] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>(() =>
    Array.from({ length: 5 }, (_, index) =>
      newBalloon(index + 1, "pop", 0, index * 2),
    ),
  );
  const [pops, setPops] = useState<Pop[]>([]);
  const [stickers, setStickers] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const nextId = useRef(100);
  const progressRef = useRef(0);
  const paidArch = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const finishRef = useRef(onRainbowDone);
  finishRef.current = onRainbowDone;

  const finished = isRainbowFinished(progress);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => {
      const balloon = newBalloon(
        ++nextId.current,
        mode,
        progressRef.current,
        0,
      );
      setBalloons((list) =>
        list.length >= MAX_BALLOONS ? list : [...list, balloon],
      );
    }, SPAWN_MS);
    return () => window.clearInterval(id);
  }, [mode, finished]);

  const later = (task: () => void, ms: number) => {
    timers.current.push(window.setTimeout(task, ms));
  };

  const gone = (id: number) =>
    setBalloons((list) => list.filter((balloon) => balloon.id !== id));

  const pop = (
    balloon: Balloon,
    event: { clientX: number; clientY: number },
  ) => {
    gone(balloon.id);
    playSqueakyPop();
    const stage = stageRef.current?.getBoundingClientRect();
    const key = ++nextId.current;
    const x = stage ? ((event.clientX - stage.left) / stage.width) * 100 : 50;
    const y = stage ? ((event.clientY - stage.top) / stage.height) * 100 : 50;
    setPops((list) => [
      ...list,
      { key, x, y, color: balloon.color, surprise: balloon.surprise },
    ]);
    later(
      () => setPops((list) => list.filter((item) => item.key !== key)),
      POP_MS,
    );
  };

  const tap = (
    balloon: Balloon,
    event: { clientX: number; clientY: number },
  ) => {
    if (mode === "pop") {
      pop(balloon, event);
      return;
    }
    if (finished) return;
    if (RAINBOW_ORDER[progress] !== balloon.color) {
      // A wrong colour just wiggles. Nothing is lost and nothing ends.
      setBalloons((list) =>
        list.map((item) =>
          item.id === balloon.id ? { ...item, wiggle: item.wiggle + 1 } : item,
        ),
      );
      setAnnouncement(
        `Not yet. The next colour is ${colorLabel(RAINBOW_ORDER[progress])}.`,
      );
      return;
    }
    pop(balloon, event);
    playRainbowNote(balloon.color);
    const next = rainbowProgress(progress, balloon.color);
    progressRef.current = next;
    setProgress(next);
    if (!isRainbowFinished(next)) {
      setAnnouncement(
        `${colorLabel(balloon.color)} stripe added. Next is ${colorLabel(RAINBOW_ORDER[next])}.`,
      );
      return;
    }
    playCuteSound("yay");
    setStickers((list) => [...list, STICKERS[list.length % STICKERS.length]]);
    if (!paidArch.current) {
      paidArch.current = true;
      finishRef.current();
    }
    setAnnouncement("Rainbow done! You earned a sticker.");
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    setAnnouncement(
      next === "pop"
        ? "Pop mode. Tap any balloon."
        : `Rainbow mode. Pop the colours in order, starting with ${colorLabel(RAINBOW_ORDER[progress])}.`,
    );
  };

  const again = () => {
    progressRef.current = 0;
    paidArch.current = false;
    setProgress(0);
    setAnnouncement(`New rainbow. Start with ${colorLabel(RAINBOW_ORDER[0])}.`);
  };

  const nextColor = isRainbowFinished(progress)
    ? null
    : RAINBOW_ORDER[progress];

  return (
    <div className="bp-game">
      <div className="bp-bar">
        <div className="bp-modes" role="group" aria-label="Game mode">
          <button
            type="button"
            className="bp-mode"
            aria-pressed={mode === "pop"}
            aria-label="Pop mode"
            onClick={() => changeMode("pop")}
          >
            <Sparkles size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="bp-mode"
            aria-pressed={mode === "rainbow"}
            aria-label="Rainbow mode"
            onClick={() => changeMode("rainbow")}
          >
            <Rainbow size={22} aria-hidden="true" />
          </button>
        </div>
        {mode === "rainbow" && nextColor && (
          <span
            className="bp-next"
            role="img"
            aria-label={`Next colour: ${colorLabel(nextColor)}`}
            style={{ "--bp-color": colorHex(nextColor) } as CSSProperties}
          >
            <span className="bp-next-dot" aria-hidden="true" />
          </span>
        )}
        <ol className="bp-rounds" aria-label="Rainbows finished">
          {stickers.slice(-3).map((sticker, index) => (
            <li key={index} className="bp-round" aria-hidden="true">
              {sticker}
            </li>
          ))}
          {stickers.length === 0 && (
            <li className="bp-round" aria-hidden="true">
              <Star size={18} aria-hidden="true" />
            </li>
          )}
        </ol>
      </div>
      {mode === "rainbow" && (
        <svg className="bp-arch" viewBox="0 0 200 112" aria-hidden="true">
          {RAINBOW_ARCS.map((arc, index) => (
            <path
              key={arc.id}
              d={arc.d}
              className={index < progress ? "bp-arc is-built" : "bp-arc"}
              style={
                index < progress ? { stroke: colorHex(arc.id) } : undefined
              }
            />
          ))}
        </svg>
      )}
      <div
        className="bp-stage"
        ref={stageRef}
        role="group"
        aria-label="Balloons floating up"
      >
        {balloons.map((balloon) => (
          <button
            key={balloon.id}
            type="button"
            className="bp-balloon"
            aria-label={`${colorLabel(balloon.color)} balloon`}
            style={
              {
                left: `${balloon.left}%`,
                "--bp-dur": `${balloon.duration}s`,
                "--bp-delay": `${-balloon.offset}s`,
                "--bp-color": colorHex(balloon.color),
              } as CSSProperties
            }
            onAnimationEnd={(event) => {
              // The wiggle inside also ends here; only the rise removes the balloon.
              if (event.target === event.currentTarget) gone(balloon.id);
            }}
            onPointerDown={(event) => {
              if (event.button === 0) tap(balloon, event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const rect = event.currentTarget.getBoundingClientRect();
                tap(balloon, {
                  clientX: rect.left + rect.width / 2,
                  clientY: rect.top + rect.height / 2,
                });
              }
            }}
          >
            <span
              key={balloon.wiggle}
              className={balloon.wiggle ? "bp-wiggle" : undefined}
            >
              <BalloonShape />
            </span>
          </button>
        ))}
        {pops.map((item) => (
          <span
            key={item.key}
            className="bp-pop"
            style={
              {
                left: `${item.x}%`,
                top: `${item.y}%`,
                "--bp-color": colorHex(item.color),
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <span className="bp-burst" />
            {Array.from({ length: 6 }, (_, index) => (
              <span
                key={index}
                className="bp-spark"
                style={
                  {
                    "--bp-dx": `${Math.cos((index / 6) * Math.PI * 2) * 60}px`,
                    "--bp-dy": `${Math.sin((index / 6) * Math.PI * 2) * 60}px`,
                    background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                  } as CSSProperties
                }
              />
            ))}
            <span className="bp-surprise">
              {item.surprise === "note" ? (
                <svg viewBox="0 0 100 100" className="bp-note">
                  <ellipse cx="40" cy="74" rx="20" ry="15" fill="#2b2140" />
                  <rect x="56" y="18" width="8" height="58" fill="#2b2140" />
                  <path d="M56 18Q80 30 76 52L64 44Z" fill="#2b2140" />
                </svg>
              ) : (
                <AnimalArt animal={item.surprise} />
              )}
            </span>
          </span>
        ))}
        {finished && (
          <div className="bp-overlay">
            <span className="bp-sticker" role="img" aria-label="Sticker earned">
              {STICKERS[(stickers.length - 1) % STICKERS.length]}
            </span>
            <button
              type="button"
              className="bp-again"
              autoFocus
              aria-label="Make another rainbow"
              onClick={again}
            >
              <RotateCcw size={30} aria-hidden="true" />
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

function BalloonShape() {
  return (
    <svg viewBox="0 0 80 124" className="bp-balloon-art" aria-hidden="true">
      <path
        d="M40 4C18 4 6 22 6 42C6 66 26 80 36 86L40 92L44 86C54 80 74 66 74 42C74 22 62 4 40 4Z"
        fill="var(--bp-color)"
      />
      <ellipse cx="24" cy="30" rx="7" ry="11" fill="#fff" opacity="0.45" />
      <path d="M36 92L40 98L44 92Z" fill="var(--bp-color)" />
      <path
        d="M40 98Q34 108 42 118"
        fill="none"
        stroke="#7d5a9e"
        strokeWidth="2"
      />
    </svg>
  );
}

function colorLabel(color: BalloonColor): string {
  return BALLOON_COLORS.find((item) => item.id === color)?.label ?? color;
}

function colorHex(color: BalloonColor): string {
  return BALLOON_COLORS.find((item) => item.id === color)?.hex ?? "#ffffff";
}
