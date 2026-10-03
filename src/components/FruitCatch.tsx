import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

type Fruit = { id: number; x: number; y: number; ripe: boolean; born: number };
type Result = { caught: number; hits: number; score: number };
const ROUND_MS = 30_000;
const FRUIT_TOP = -8;
const CATCH_TOP = 83;
const MISS_TOP = 105;
const BASKET_CATCH = 10;
// Percent of field height per millisecond: ripe and rotten fruit reach the
// basket about three seconds after they spawn, on any frame rate.
const FALL_PER_MS = 0.03;
// Spawns start about every 900ms and tighten toward 500ms as the round ends,
// so the field stays busy without flooding the basket.
const SPAWN_START_MS = 900;
const SPAWN_END_MS = 500;
const SPAWN_RAMP_MS = 95;

// Rotten fruit only hurts when it lands in the basket, so say that plainly.
const hitLine = (hits: number) => {
  if (hits === 0) return "No rotten fruit landed in your basket.";
  const fruit = hits === 1 ? "One rotten piece" : `${hits} rotten pieces`;
  const hearts = hits === 1 ? "a heart" : `${hits} hearts`;
  return `${fruit} landed in your basket and cost you ${hearts}.`;
};

export function FruitCatch({
  onFinish,
  onClose,
  best,
}: {
  onFinish: (result: Result) => void;
  onClose: () => void;
  best: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [basketX, setBasketX] = useState(50);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const fruitsRef = useRef<Fruit[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [caught, setCaught] = useState(0);
  const [hits, setHits] = useState(0);
  const basketRef = useRef(50);
  const frameRef = useRef(0);
  const spawnRef = useRef(0);
  const nextSpawnRef = useRef(0);
  const fruitIdRef = useRef(0);
  const totalsRef = useRef({ caught: 0, hits: 0 });
  const livesRef = useRef(3);
  const doneRef = useRef(false);
  const bestAtStart = useRef(best);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const finish = (time = 0) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const finalResult = {
      ...totalsRef.current,
      score: totalsRef.current.caught * 10,
    };
    setResult(finalResult);
    setTimeLeft(Math.max(0, Math.ceil((ROUND_MS - time) / 1000)));
    setPlaying(false);
    finishRef.current(finalResult);
  };

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      const elapsed = now - spawnRef.current;
      if (elapsed >= ROUND_MS) {
        finish(ROUND_MS);
        return;
      }
      setTimeLeft(Math.ceil((ROUND_MS - elapsed) / 1000));
      let nextCaught = 0;
      let nextHits = 0;
      const next = fruitsRef.current.flatMap((fruit) => {
        const y = FRUIT_TOP + (now - fruit.born) * FALL_PER_MS;
        if (
          y >= CATCH_TOP &&
          y < MISS_TOP &&
          Math.abs(fruit.x - basketRef.current) < BASKET_CATCH
        ) {
          if (fruit.ripe) nextCaught += 1;
          else nextHits += 1;
          return [];
        }
        return y >= MISS_TOP ? [] : [{ ...fruit, y }];
      });
      if (nextCaught) {
        totalsRef.current.caught += nextCaught;
        setCaught(totalsRef.current.caught);
      }
      if (nextHits) {
        totalsRef.current.hits += nextHits;
        setHits(totalsRef.current.hits);
        livesRef.current = Math.max(0, livesRef.current - nextHits);
        setLives(livesRef.current);
      }
      const spawnEvery = Math.max(
        SPAWN_END_MS,
        SPAWN_START_MS - elapsed / SPAWN_RAMP_MS,
      );
      if (elapsed >= nextSpawnRef.current) {
        next.push({
          id: ++fruitIdRef.current,
          x: 9 + Math.random() * 82,
          y: FRUIT_TOP,
          ripe: Math.random() < 0.78,
          born: now,
        });
        nextSpawnRef.current = elapsed + spawnEvery;
      }
      fruitsRef.current = next;
      setFruits(next);
      if (livesRef.current <= 0) {
        finish(elapsed);
        return;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const move = (event: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement)?.tagName,
        )
      )
        return;
      const direction =
        event.key === "ArrowLeft" || event.key.toLowerCase() === "a"
          ? -1
          : event.key === "ArrowRight" || event.key.toLowerCase() === "d"
            ? 1
            : 0;
      if (!direction) return;
      event.preventDefault();
      const next = Math.max(8, Math.min(92, basketRef.current + direction * 7));
      basketRef.current = next;
      setBasketX(next);
    };
    window.addEventListener("keydown", move);
    return () => window.removeEventListener("keydown", move);
  }, [playing]);

  const start = () => {
    bestAtStart.current = best;
    totalsRef.current = { caught: 0, hits: 0 };
    livesRef.current = 3;
    doneRef.current = false;
    spawnRef.current = performance.now();
    nextSpawnRef.current = 0;
    setCaught(0);
    setHits(0);
    setLives(3);
    setTimeLeft(30);
    setFruits([]);
    fruitsRef.current = [];
    setResult(null);
    setBasketX(50);
    basketRef.current = 50;
    setPlaying(true);
  };
  const moveBasket = (direction: number) => {
    const next = Math.max(8, Math.min(92, basketRef.current + direction * 12));
    basketRef.current = next;
    setBasketX(next);
  };

  if (!playing && !result) {
    return (
      <div className="game-intro fruit-intro">
        <div className="fruit-hero" aria-hidden="true">
          <span>🍊</span>
          <span>🍎</span>
          <span>🧺</span>
          <span>🍐</span>
          <span>🍋</span>
        </div>
        <h3>Fruit Catch!</h3>
        <p>
          Catch the ripe fruit and dodge the rotten ones. How many can you scoop
          up before the timer runs out?
        </p>
        <div className="fruit-instructions">
          <span>← → or A / D to move</span>
          <span>🍏 ripe = +10 points</span>
          <span>🤢 rotten = lose a heart</span>
        </div>
        {best > 0 && (
          <p className="fruit-best">
            <Trophy size={15} /> Personal best: <strong>{best}</strong>
          </p>
        )}
        <button className="button button-primary" onClick={start}>
          Let’s play <Sparkles size={16} />
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="game-intro game-win fruit-result">
        <div className="trophy-icon">
          <Trophy size={48} />
        </div>
        <h3>{result.caught >= 20 ? "Fruit-tastic!" : "Nice catching!"}</h3>
        <p>
          You caught <strong>{result.caught}</strong> ripe fruit.{" "}
          {hitLine(result.hits)}
        </p>
        <div className="fruit-score">
          {result.score}
          <span>points</span>
        </div>
        <p className="fruit-best">
          {result.score > bestAtStart.current
            ? "A new personal best! 🏆"
            : `Personal best: ${Math.max(best, result.score)}`}
        </p>
        <div className="game-win-actions">
          <button className="button button-secondary" onClick={start}>
            <RotateCcw size={16} /> Play again
          </button>
          <button className="button button-primary" onClick={onClose}>
            Back to the pride <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fruit-game">
      <div className="fruit-game-stats">
        <span>
          <Sparkles size={16} /> {caught * 10} points
        </span>
        <span className={timeLeft <= 8 ? "fruit-urgent" : "fruit-timer"}>
          {timeLeft}s
        </span>
        <span role="img" aria-label={`${lives} lives`}>
          {Array.from({ length: 3 }, (_, index) => (
            <Heart
              key={index}
              size={17}
              fill={index < lives ? "currentColor" : "none"}
            />
          ))}
        </span>
      </div>
      <div
        className="fruit-field"
        role="img"
        aria-label={`Fruit falling. ${caught} caught, ${lives} hearts remaining.`}
      >
        <div className="fruit-sun" />
        <div className="fruit-cloud cloud-one" />
        <div className="fruit-cloud cloud-two" />
        {fruits.map((fruit) => (
          <span
            key={fruit.id}
            className="falling-fruit"
            style={{ left: `${fruit.x}%`, top: `${fruit.y}%` }}
            aria-hidden="true"
          >
            {fruit.ripe ? ["🍎", "🍊", "🍐", "🍋"][fruit.id % 4] : "🤢"}
          </span>
        ))}
        <span
          className="fruit-basket"
          style={{ left: `${basketX}%` }}
          aria-hidden="true"
        >
          🧺
        </span>
        <span className="fruit-ground" />
      </div>
      <div className="fruit-controls" role="group" aria-label="Move basket">
        <button
          className="button button-secondary"
          onClick={() => moveBasket(-1)}
          aria-label="Move basket left"
        >
          <ArrowLeft size={19} /> Left
        </button>
        <p>Catch ripe fruit, dodge the yucky ones!</p>
        <button
          className="button button-secondary"
          onClick={() => moveBasket(1)}
          aria-label="Move basket right"
        >
          Right <ArrowRight size={19} />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {caught} fruit caught. {lives} hearts left. {timeLeft} seconds
        remaining.
      </p>
    </div>
  );
}
