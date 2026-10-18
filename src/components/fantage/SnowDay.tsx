import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  SNOW_LANES,
  SNOW_MAX_SCORE,
  SNOW_ROUND_MS,
  makePenguin,
  penguinX,
  type Penguin,
} from "../../utils/snowDay.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const TICK_MS = 50;
const SPAWN_EVERY_MS = 900;

/** Toss snowballs at the penguins sliding across the snow. */
export function SnowDay({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [now, setNow] = useState(0);
  const [penguins, setPenguins] = useState<Penguin[]>([]);
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const live = useRef<{ penguins: Penguin[]; next: number; id: number }>({
    penguins: [],
    next: 0,
    id: 0,
  });

  useEffect(() => {
    if (phase !== "play") return;
    const started = performance.now();
    live.current = { penguins: [], next: 0, id: 0 };
    const id = window.setInterval(() => {
      const t = performance.now() - started;
      if (t >= SNOW_ROUND_MS) {
        setNow(SNOW_ROUND_MS);
        setPhase("done");
        return;
      }
      const game = live.current;
      game.penguins = game.penguins.filter((p) => {
        const x = penguinX(p, t);
        return x > -12 && x < 112;
      });
      if (t >= game.next) {
        game.penguins.push(makePenguin(game.id++, t));
        game.next = t + SPAWN_EVERY_MS;
      }
      setNow(t);
      setPenguins([...game.penguins]);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done" || paid.current) return;
    paid.current = true;
    const final = Math.min(score, SNOW_MAX_SCORE);
    onFinish(final);
    setAnnouncement(`Snow day's over! ${final} snowballs landed.`);
  }, [phase, score, onFinish]);

  const start = () => {
    paid.current = false;
    setScore(0);
    setNow(0);
    setPenguins([]);
    setPhase("play");
    setAnnouncement("Tap the penguins!");
  };

  const hit = (id: number) => {
    if (phase !== "play") return;
    playCuteSound("pop");
    live.current.penguins = live.current.penguins.filter((p) => p.id !== id);
    setPenguins([...live.current.penguins]);
    setScore((s) => s + 1);
  };

  const secondsLeft = Math.ceil((SNOW_ROUND_MS - now) / 1000);
  return (
    <div className="fg-game snow-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`${score} snowballs landed`}>❄️ {score}</li>
      </ol>
      <div className="fg-board snow-field">
        {Array.from({ length: SNOW_LANES }, (_, lane) => (
          <div key={lane} className="snow-lane">
            {penguins
              .filter((p) => p.lane === lane)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="snow-penguin"
                  style={{ left: `${penguinX(p, now)}%` }}
                  aria-label="Toss a snowball at the penguin"
                  onClick={() => hit(p.id)}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      transform: p.rightward ? "scaleX(-1)" : undefined,
                    }}
                  >
                    🐧
                  </span>
                </button>
              ))}
          </div>
        ))}
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">❄️ {score}</p>}
            <p className="fg-hint">Tap the penguins to toss snowballs!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Snow Day"}
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
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
