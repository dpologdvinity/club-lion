import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Gamepad2,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Coin, Lion } from "./Lion";
import {
  buildPattern,
  buildTrail,
  laneOf,
  laneTop,
  spawnX,
} from "./mangoPattern";

type Mode = "intro" | "playing" | "paused" | "gameover";
type Point = { x: number; y: number };
type Obstacle = Point & { id: number };
type Mango = Point & { id: number };
type Frame = {
  obstacles: Obstacle[];
  mangoes: Mango[];
  lion: Point;
  score: number;
};

const FIELD_W = 480;
const FIELD_H = 340;
const LION_SIZE = 36;
const MANGO_SIZE = 26;
const OBSTACLE_SIZE = 30;
const LION_SPEED = 200;
const SCROLL_SPEED = 95;
const DISTANCE_POINTS = 0.1;
const MANGO_POINTS = 10;
const START_LIVES = 3;
const INVULN_MS = 500;
const SLOW_MOTION = 0.6;
const LION_START: Point = { x: 56, y: (FIELD_H - LION_SIZE) / 2 };
const EMPTY_FRAME: Frame = {
  obstacles: [],
  mangoes: [],
  lion: LION_START,
  score: 0,
};

const DIRECTIONS = ["up", "down", "left", "right"] as const;

const STEER: Record<string, (typeof DIRECTIONS)[number]> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

const PAD_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
} as const;

function holding(
  keys: Set<string>,
  pads: Map<number, string>,
  padKeys: Set<string>,
  direction: string,
) {
  if (keys.has(direction) || padKeys.has(direction)) return true;
  for (const held of pads.values()) if (held === direction) return true;
  return false;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function overlaps(a: Point, aSize: number, b: Point, bSize: number) {
  return (
    a.x < b.x + bSize &&
    b.x < a.x + aSize &&
    a.y < b.y + bSize &&
    b.y < a.y + aSize
  );
}

function spriteStyle(x: number, y: number, size: number) {
  return {
    left: `${(x / FIELD_W) * 100}%`,
    top: `${(y / FIELD_H) * 100}%`,
    width: `${(size / FIELD_W) * 100}%`,
    height: `${(size / FIELD_H) * 100}%`,
  };
}

export function MangoRun({
  best,
  onFinish,
  onClose,
}: {
  best: number;
  onFinish: (score: number) => void;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState<Mode>("intro");
  const [lives, setLives] = useState(START_LIVES);
  const [mangoesCount, setMangoesCount] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [invulnerable, setInvulnerable] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [frame, setFrame] = useState<Frame>(EMPTY_FRAME);

  const field = useRef<HTMLDivElement>(null);
  const again = useRef<HTMLButtonElement>(null);
  const resumeButton = useRef<HTMLButtonElement>(null);
  const lion = useRef<Point>(LION_START);
  const obstacles = useRef<Obstacle[]>([]);
  const mangoes = useRef<Mango[]>([]);
  const keys = useRef(new Set<string>());
  const pads = useRef(new Map<number, string>());
  const padKeys = useRef(new Set<string>());
  const distance = useRef(0);
  const collected = useRef(0);
  const livesNow = useRef(START_LIVES);
  const spawnIn = useRef(0);
  const invulnUntil = useRef(0);
  const nextId = useRef(1);
  const flash = useRef<number | undefined>(undefined);
  const finish = useRef(onFinish);

  finish.current = onFinish;

  const releaseSteering = () => {
    keys.current.clear();
    pads.current.clear();
    padKeys.current.clear();
  };

  useEffect(() => {
    if (mode === "playing") field.current?.focus({ preventScroll: true });
    if (mode === "paused") resumeButton.current?.focus({ preventScroll: true });
    if (mode === "gameover") again.current?.focus({ preventScroll: true });
  }, [mode]);

  useEffect(() => {
    const suspend = () => {
      releaseSteering();
      if (mode === "playing") setMode("paused");
    };
    const hide = () => {
      if (document.hidden) suspend();
    };
    const releasePointer = (event: globalThis.PointerEvent) => {
      pads.current.delete(event.pointerId);
    };
    window.addEventListener("blur", suspend);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    return () => {
      window.removeEventListener("blur", suspend);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
    };
  }, [mode]);

  useEffect(() => () => window.clearTimeout(flash.current), []);

  const pause = () => {
    releaseSteering();
    setMode("paused");
  };

  const resume = () => {
    releaseSteering();
    setMode("playing");
  };

  useEffect(() => {
    if (mode !== "paused") return;
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      resume();
    };
    document.addEventListener("keydown", onEscape, true);
    return () => document.removeEventListener("keydown", onEscape, true);
  }, [mode]);

  const start = () => {
    window.clearTimeout(flash.current);
    lion.current = LION_START;
    obstacles.current = [];
    mangoes.current = [];
    releaseSteering();
    distance.current = 0;
    collected.current = 0;
    livesNow.current = START_LIVES;
    spawnIn.current = 0.7;
    invulnUntil.current = 0;
    setLives(START_LIVES);
    setMangoesCount(0);
    setFinalScore(0);
    setInvulnerable(false);
    setAnnouncement("");
    setFrame(EMPTY_FRAME);
    setMode("playing");
  };

  useEffect(() => {
    if (mode !== "playing") return;
    let handle = 0;
    let last = performance.now();

    const tick = (now: number) => {
      handle = window.requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const motion = reduced ? SLOW_MOTION : 1;
      const ramp = Math.min(distance.current / 2600, 0.9);
      const scroll = SCROLL_SPEED * (1 + ramp) * motion;

      let { x, y } = lion.current;
      const step = LION_SPEED * motion * dt;
      if (holding(keys.current, pads.current, padKeys.current, "left"))
        x -= step;
      if (holding(keys.current, pads.current, padKeys.current, "right"))
        x += step;
      if (holding(keys.current, pads.current, padKeys.current, "up")) y -= step;
      if (holding(keys.current, pads.current, padKeys.current, "down"))
        y += step;
      x = Math.min(Math.max(x, 0), FIELD_W - LION_SIZE);
      y = Math.min(Math.max(y, 0), FIELD_H - LION_SIZE);
      lion.current = { x, y };
      distance.current += scroll * dt;

      spawnIn.current -= dt;
      if (spawnIn.current <= 0) {
        spawnIn.current = Math.max(0.5, 1.6 - ramp * 0.7);
        const pattern = buildPattern(ramp, laneOf(y), Math.random);
        const base = Math.max(FIELD_W + 6, spawnX(x, scroll));
        for (const mango of buildTrail(pattern.rows)) {
          mangoes.current.push({
            id: nextId.current++,
            x: base + mango.x,
            y: laneTop(mango.lane, MANGO_SIZE),
          });
        }
        for (const row of pattern.rows) {
          for (const lane of row.blocked) {
            obstacles.current.push({
              id: nextId.current++,
              x: base + row.x,
              y: laneTop(lane, OBSTACLE_SIZE),
            });
          }
        }
      }

      const moving: Obstacle[] = [];
      let hitRock = false;
      for (const rock of obstacles.current) {
        const moved = { ...rock, x: rock.x - scroll * dt };
        if (moved.x + OBSTACLE_SIZE <= 0) continue;
        if (
          !hitRock &&
          now >= invulnUntil.current &&
          overlaps(lion.current, LION_SIZE, moved, OBSTACLE_SIZE)
        ) {
          hitRock = true;
          continue;
        }
        moving.push(moved);
      }
      const rolling: Mango[] = [];
      let grabbed = 0;
      for (const mango of mangoes.current) {
        const moved = { ...mango, x: mango.x - scroll * dt };
        if (moved.x + MANGO_SIZE <= 0) continue;
        if (overlaps(lion.current, LION_SIZE, moved, MANGO_SIZE)) {
          grabbed++;
          continue;
        }
        rolling.push(moved);
      }
      obstacles.current = moving;
      mangoes.current = rolling;

      if (grabbed) {
        collected.current += grabbed;
        setMangoesCount(collected.current);
      }

      if (hitRock) {
        livesNow.current -= 1;
        setLives(livesNow.current);
        invulnUntil.current = now + INVULN_MS;
        window.clearTimeout(flash.current);
        if (reduced) {
          setInvulnerable(false);
        } else {
          setInvulnerable(true);
          flash.current = window.setTimeout(
            () => setInvulnerable(false),
            INVULN_MS,
          );
        }
        setAnnouncement(
          livesNow.current > 0
            ? `${livesNow.current} ${livesNow.current === 1 ? "life" : "lives"} left.`
            : "Out of lives.",
        );
      }

      const score =
        Math.floor(distance.current * DISTANCE_POINTS) +
        collected.current * MANGO_POINTS;

      if (livesNow.current <= 0) {
        releaseSteering();
        setFinalScore(score);
        finish.current(score);
        setMode("gameover");
        return;
      }
      setFrame({
        obstacles: moving,
        mangoes: rolling,
        lion: lion.current,
        score,
      });
    };

    handle = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(handle);
  }, [mode, reduced]);

  const steer = (held: boolean) => (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = STEER[event.key.toLowerCase()];
    if (!direction) return;
    event.preventDefault();
    if (held) keys.current.add(direction);
    else keys.current.delete(direction);
  };

  const pressPad = (event: PointerEvent<HTMLButtonElement>) => {
    const direction = event.currentTarget.dataset.direction;
    if (!direction) return;
    event.preventDefault();
    pads.current.set(event.pointerId, direction);
  };

  const resumeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    resume();
  };

  const pressPadKey =
    (direction: string, down: boolean) =>
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      if (down) padKeys.current.add(direction);
      else padKeys.current.delete(direction);
    };

  return (
    <div className={`mango-run ${reduced ? "mr-reduced" : ""}`}>
      {mode === "intro" && (
        <div className="game-intro">
          <div className="game-illustration">
            <span>🥭</span>
            <span>🦁</span>
            <span>🌵</span>
          </div>
          <h3>Mango Run</h3>
          <p>
            Steer your lion down the savanna trail.
            <br />
            Dodge the rocks, scoop up mangoes, run as far as you can.
          </p>
          <div className="game-features">
            <span>
              <Sparkles size={15} /> Endless. Three lives.
            </span>
            <span>
              <Coin amount={best} /> best run
            </span>
          </div>
          <button className="button button-primary" onClick={start}>
            Let’s run <ArrowRight size={18} />
          </button>
          <p className="game-help">
            Arrow keys, W A S D, or the on-screen pad to steer. Each mango is 10
            coins.
          </p>
        </div>
      )}

      {(mode === "playing" || mode === "paused") && (
        <>
          <div className="mr-hud game-stats">
            <span className="mr-lives" aria-hidden="true">
              {Array.from({ length: START_LIVES }, (_, index) => (
                <Heart
                  key={index}
                  className="mr-heart"
                  size={17}
                  fill={index < lives ? "currentColor" : "none"}
                />
              ))}
            </span>
            <span>
              <Gamepad2 size={17} /> {frame.score} points
            </span>
            <span>
              <span aria-hidden="true">🥭</span> {mangoesCount}
            </span>
            <span>
              <Coin amount={best} />
            </span>
            {mode === "playing" && (
              <button className="mr-pause" onClick={pause} aria-label="Pause">
                <Pause size={17} />
              </button>
            )}
          </div>
          <div className="mr-stage">
            <div
              className="mr-playfield"
              ref={field}
              style={{ width: "100%", aspectRatio: `${FIELD_W} / ${FIELD_H}` }}
              tabIndex={0}
              role="group"
              aria-label="Mango Run trail. Steer with the arrow keys, W A S D, or the on-screen pad."
              onKeyDown={steer(true)}
              onKeyUp={steer(false)}
              onBlur={releaseSteering}
            >
              {frame.mangoes.map((mango) => (
                <span
                  key={mango.id}
                  className="mr-mango"
                  style={spriteStyle(mango.x, mango.y, MANGO_SIZE)}
                  aria-hidden="true"
                >
                  🥭
                </span>
              ))}
              {frame.obstacles.map((rock) => (
                <span
                  key={rock.id}
                  className="mr-obstacle"
                  style={spriteStyle(rock.x, rock.y, OBSTACLE_SIZE)}
                  aria-hidden="true"
                >
                  🪨
                </span>
              ))}
              <span
                className={`mr-lion ${invulnerable ? "mr-invuln" : ""}`}
                style={spriteStyle(frame.lion.x, frame.lion.y, LION_SIZE)}
                aria-hidden="true"
              >
                <Lion />
              </span>
            </div>
            {mode === "paused" && (
              <div className="mr-paused" onKeyDown={resumeOnEscape}>
                <h3>Taking a breather</h3>
                <p>The trail waits for you.</p>
                <div className="game-win-actions">
                  <button
                    className="button button-primary"
                    ref={resumeButton}
                    onClick={resume}
                  >
                    <Play size={16} /> Resume
                  </button>
                  <button className="button button-secondary" onClick={start}>
                    <RotateCcw size={16} /> Restart
                  </button>
                </div>
              </div>
            )}
          </div>
          {mode === "playing" && (
            <div className="mr-dpad" role="group" aria-label="Steering pad">
              {DIRECTIONS.map((direction) => {
                const Icon = PAD_ICONS[direction];
                return (
                  <button
                    key={direction}
                    className={`mr-dpad-key mr-dpad-${direction}`}
                    data-direction={direction}
                    aria-label={`Steer ${direction}`}
                    onPointerDown={pressPad}
                    onKeyDown={pressPadKey(direction, true)}
                    onKeyUp={pressPadKey(direction, false)}
                  >
                    <Icon size={22} />
                  </button>
                );
              })}
            </div>
          )}
          <p className="game-help">
            Arrow keys, W A S D, or the on-screen pad to steer. Mangoes are 10
            coins each.
          </p>
        </>
      )}

      {mode === "gameover" && (
        <div className="game-intro game-win">
          <div className="trophy-icon">
            <Trophy size={53} />
          </div>
          <h3>{finalScore > best ? "A brand new best!" : "Nice run!"}</h3>
          <p>
            {finalScore} points and {mangoesCount} mangoes.
            <br />
            Every point turns into coins for your adventure.
          </p>
          <div className="reward-display">
            + <Coin amount={finalScore} />
          </div>
          <div className="game-win-actions">
            <button
              className="button button-secondary"
              ref={again}
              onClick={start}
            >
              <RotateCcw size={16} /> Run again
            </button>
            <button className="button button-primary" onClick={onClose}>
              Back to the pride <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
