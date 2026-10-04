import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Sparkles, Trophy, Waves } from "lucide-react";
import {
  stepRiverSurf,
  checkRiverCollision,
  checkRiverPickup,
  calculateRiverSurfPayout,
  playRiverSurfSound,
  type SurfState,
  type RiverObstacle,
  type RiverFeature,
} from "../utils/riverSurfEngine.ts";

const RUN_DISTANCE = 600;
const TRICK_LABELS: Record<string, string> = {
  spin_360: "360 Spin!",
  tail_slide: "Tail Slide!",
  air_jump: "Big Air!",
};

function initialState(): SurfState {
  return {
    laneX: 0,
    distance: 0,
    speed: 40,
    isAirborne: false,
    activeTrick: null,
    trickCombo: 0,
    score: 0,
    wipedOut: false,
  };
}

function generateObstacles(): RiverObstacle[] {
  const types: RiverObstacle["type"][] = ["boulder", "log", "whirlpool"];
  const obstacles: RiverObstacle[] = [];
  for (let distance = 80; distance < RUN_DISTANCE - 20; distance += 70) {
    obstacles.push({
      distance,
      laneX: Math.round((Math.random() * 2 - 1) * 140),
      type: types[Math.floor(Math.random() * types.length)],
    });
  }
  return obstacles;
}

function generateFeatures(): RiverFeature[] {
  const types: RiverFeature["type"][] = [
    "ramp_wave",
    "golden_fish",
    "boost_current",
  ];
  const features: RiverFeature[] = [];
  for (let distance = 50; distance < RUN_DISTANCE - 20; distance += 55) {
    features.push({
      distance,
      laneX: Math.round((Math.random() * 2 - 1) * 140),
      type: types[Math.floor(Math.random() * types.length)],
    });
  }
  return features;
}

type Result = { score: number; coins: number; tricks: number };

export function RiverSurf({
  best,
  onComplete,
  onClose,
}: {
  best: number;
  onComplete: (coins: number) => void;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [state, setState] = useState<SurfState>(initialState);
  const [result, setResult] = useState<Result | null>(null);
  const stateRef = useRef<SurfState>(initialState());
  const tricksLandedRef = useRef(0);
  const cleanRef = useRef(true);
  const steerRef = useRef(0);
  const pendingTrickRef = useRef<string | null>(null);
  const obstaclesRef = useRef<RiverObstacle[]>([]);
  const featuresRef = useRef<RiverFeature[]>([]);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const doneRef = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const tricks = tricksLandedRef.current;
    const coins = calculateRiverSurfPayout(
      stateRef.current.score,
      tricks,
      cleanRef.current && !stateRef.current.wipedOut,
    );
    const finalResult = { score: stateRef.current.score, coins, tricks };
    setResult(finalResult);
    setPlaying(false);
    completeRef.current(coins);
  };

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      const deltaMs = lastRef.current
        ? Math.min(64, now - lastRef.current)
        : 16;
      lastRef.current = now;

      const prevCombo = stateRef.current.trickCombo;
      let next = stepRiverSurf(
        stateRef.current,
        steerRef.current,
        pendingTrickRef.current,
        deltaMs,
      );
      pendingTrickRef.current = null;
      if (next.trickCombo > prevCombo) {
        tricksLandedRef.current += 1;
        playRiverSurfSound("trick");
      }

      const { nextState: afterPickup, pickup } = checkRiverPickup(
        next,
        featuresRef.current,
      );
      next = afterPickup;
      if (pickup) {
        featuresRef.current = featuresRef.current.filter((f) => f !== pickup);
        if (pickup.type === "ramp_wave") playRiverSurfSound("air");
        else playRiverSurfSound("carve");
      }

      if (checkRiverCollision(next, obstaclesRef.current)) {
        next = { ...next, wipedOut: true };
        cleanRef.current = false;
        playRiverSurfSound("wipeout");
      } else if (!next.isAirborne) {
        playRiverSurfSound("splash");
      }

      stateRef.current = next;
      setState(next);

      if (next.wipedOut || next.distance >= RUN_DISTANCE) {
        finish();
        return;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement)?.tagName,
        )
      )
        return;
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        steerRef.current = -1;
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault();
        steerRef.current = 1;
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        pendingTrickRef.current = "spin_360";
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        pendingTrickRef.current = "tail_slide";
      } else if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        pendingTrickRef.current = "air_jump";
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((key === "arrowleft" || key === "a") && steerRef.current < 0)
        steerRef.current = 0;
      else if ((key === "arrowright" || key === "d") && steerRef.current > 0)
        steerRef.current = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [playing]);

  const start = () => {
    const fresh = initialState();
    stateRef.current = fresh;
    tricksLandedRef.current = 0;
    cleanRef.current = true;
    steerRef.current = 0;
    pendingTrickRef.current = null;
    obstaclesRef.current = generateObstacles();
    featuresRef.current = generateFeatures();
    lastRef.current = 0;
    doneRef.current = false;
    setState(fresh);
    setResult(null);
    setPlaying(true);
  };

  if (!playing && !result) {
    return (
      <div className="game-intro river-surf-intro">
        <div className="river-surf-hero" aria-hidden="true">
          <Waves size={40} />
        </div>
        <h3>Canyon Rapids River Surf</h3>
        <p>
          Carve the whitewater, dodge boulders, and land tricks off the ramp
          waves for big combo points.
        </p>
        <div className="fruit-instructions">
          <span>← → or A / D to steer</span>
          <span>↑ 360 Spin · ↓ Tail Slide · Space Air Jump</span>
        </div>
        {best > 0 && (
          <p className="fruit-best">
            <Trophy size={15} /> Personal best score: <strong>{best}</strong>
          </p>
        )}
        <button className="button button-primary" onClick={start}>
          Hit the rapids <Sparkles size={16} />
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="game-intro game-win river-surf-result">
        <div className="trophy-icon">
          <Trophy size={48} />
        </div>
        <h3>{result.score > best ? "New personal best!" : "Nice run!"}</h3>
        <p>
          Final score <strong>{result.score}</strong> with{" "}
          <strong>{result.tricks}</strong> tricks landed.
        </p>
        <div className="fruit-score">
          +{result.coins}
          <span>coins</span>
        </div>
        <div className="game-win-actions">
          <button className="button button-secondary" onClick={start}>
            <RotateCcw size={16} /> Ride again
          </button>
          <button className="button button-primary" onClick={() => onClose()}>
            Return to Canyon <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(
    100,
    Math.round((state.distance / RUN_DISTANCE) * 100),
  );
  const laneOffsetPercent = ((state.laneX + 160) / 320) * 100;

  return (
    <div className="river-surf">
      <div className="surf-hud" role="group" aria-label="River surf status">
        <span>
          <Sparkles size={16} /> {state.score} pts
        </span>
        <span>Combo ×{state.trickCombo}</span>
        <span>{progressPercent}% downriver</span>
        {state.activeTrick && (
          <span className="surf-trick-flash">
            {TRICK_LABELS[state.activeTrick] ?? state.activeTrick}
          </span>
        )}
      </div>
      <div
        className={`river-surf-field${reducedMotion.current ? " reduced-motion" : ""}`}
        role="img"
        aria-label={`Surfing. ${progressPercent}% downriver, score ${state.score}.`}
      >
        <div className="river-water" aria-hidden="true" />
        <div className="river-foam" aria-hidden="true" />
        <span
          className={`river-surfer${state.isAirborne ? " airborne" : ""}`}
          style={{ left: `${laneOffsetPercent}%` }}
          aria-hidden="true"
        >
          🏄
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {progressPercent}% downriver. Score {state.score}. Combo{" "}
        {state.trickCombo}.
      </p>
    </div>
  );
}
