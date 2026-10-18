import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  CART_LANES,
  CART_MAX_SCORE,
  CART_ROUND_MS,
  CART_Y,
  makeThing,
  scrollTrack,
  touching,
  type TrackThing,
} from "../../utils/goCart.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const SPEED = 45;
const THING_EVERY_MS = 650;
const BUMP_MS = 600;

/** Switch lanes to grab coins; cones just make a funny bump. */
export function GoCart({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [view, setView] = useState({
    lane: 1,
    things: [] as TrackThing[],
    ms: 0,
    bumped: false,
  });
  const [coins, setCoins] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const live = useRef({
    lane: 1,
    things: [] as TrackThing[],
    next: 0,
    id: 0,
    coins: 0,
    bumpUntil: 0,
  });

  useGameLoop(phase === "play", (ms, dt) => {
    const game = live.current;
    if (ms >= CART_ROUND_MS) {
      setPhase("done");
      if (!paid.current) {
        paid.current = true;
        const final = Math.min(game.coins, CART_MAX_SCORE);
        onFinish(final);
        setAnnouncement(`Finish line! ${final} coins.`);
      }
      return;
    }
    // A bump slows the kart for a moment; nothing else happens.
    const speed = ms < game.bumpUntil ? SPEED / 2 : SPEED;
    game.things = scrollTrack(game.things, dt, speed);
    if (ms >= game.next) {
      game.things = [...game.things, makeThing(game.id++)];
      game.next = ms + THING_EVERY_MS;
    }
    const hit = touching(game.things, game.lane);
    if (hit.length) {
      const got = hit.filter((t) => t.coin).length;
      if (got) {
        playCuteSound("pop");
        game.coins += got;
        setCoins(game.coins);
      }
      if (hit.some((t) => !t.coin)) {
        playCuteSound("boing");
        game.bumpUntil = ms + BUMP_MS;
      }
      game.things = game.things.filter((t) => !hit.includes(t));
    }
    setView({
      lane: game.lane,
      things: game.things,
      ms,
      bumped: ms < game.bumpUntil,
    });
  });

  const start = () => {
    paid.current = false;
    live.current = {
      lane: 1,
      things: [],
      next: 0,
      id: 0,
      coins: 0,
      bumpUntil: 0,
    };
    setCoins(0);
    setView({ lane: 1, things: [], ms: 0, bumped: false });
    setPhase("play");
    setAnnouncement("Steer into the coins!");
  };

  const steer = (d: number) => {
    live.current.lane = Math.max(
      0,
      Math.min(CART_LANES - 1, live.current.lane + d),
    );
  };

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") steer(-1);
      else if (event.key === "ArrowRight") steer(1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const lanePct = (lane: number) => ((lane + 0.5) / CART_LANES) * 100;
  const secondsLeft = Math.ceil((CART_ROUND_MS - view.ms) / 1000);
  return (
    <div className="fg-game cart-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`${coins} coins`}>🪙 {coins}</li>
      </ol>
      <div className="fg-board cart-track" aria-hidden="true">
        {view.things.map((t) => (
          <span
            key={t.id}
            className="cart-thing"
            style={{ left: `${lanePct(t.lane)}%`, top: `${t.y}%` }}
          >
            {t.coin ? "🪙" : "🚧"}
          </span>
        ))}
        <span
          className={`cart-kart${view.bumped ? " is-bumped" : ""}`}
          style={{ left: `${lanePct(view.lane)}%`, top: `${CART_Y}%` }}
        >
          🏎️
        </span>
      </div>
      {phase !== "play" && (
        <div className="fg-board cart-start">
          {phase === "done" && <p className="fg-result">🪙 {coins}</p>}
          <p className="fg-hint">Switch lanes to grab the coins!</p>
          <button
            type="button"
            className="fg-start"
            autoFocus
            aria-label={phase === "done" ? "Play again" : "Start Go Cart"}
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
      <div className="fg-pad">
        <button
          type="button"
          className="maze-arrow"
          aria-label="Steer left"
          disabled={phase !== "play"}
          onClick={() => steer(-1)}
        >
          <ArrowLeft size={32} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="maze-arrow"
          aria-label="Steer right"
          disabled={phase !== "play"}
          onClick={() => steer(1)}
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
