import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import {
  MAGIC_COLORS,
  MAGIC_MAX_SCORE,
  MAGIC_ROUND_MS,
  bubbleY,
  makeBubble,
  wandColor,
  type MagicBubble,
} from "../../utils/magicPop.ts";
import type { FantageGameProps } from "./registry";
import { useGameLoop } from "./useGameLoop";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";
const SPAWN_EVERY_MS = 700;
const HEX = Object.fromEntries(MAGIC_COLORS.map((c) => [c.id, c.hex]));

/** Pop only the bubbles that match the wand's glowing colour. */
export function MagicPop({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [ms, setMs] = useState(0);
  const [bubbles, setBubbles] = useState<MagicBubble[]>([]);
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const live = useRef({
    bubbles: [] as MagicBubble[],
    next: 0,
    id: 0,
    score: 0,
  });
  const paid = useRef(false);

  useGameLoop(phase === "play", (t) => {
    const game = live.current;
    if (t >= MAGIC_ROUND_MS) {
      setPhase("done");
      if (!paid.current) {
        paid.current = true;
        const final = Math.min(game.score, MAGIC_MAX_SCORE);
        onFinish(final);
        setAnnouncement(`Magic's over! ${final} bubbles popped.`);
      }
      return;
    }
    game.bubbles = game.bubbles.filter((b) => bubbleY(b, t) < 105);
    if (t >= game.next) {
      game.bubbles = [...game.bubbles, makeBubble(game.id++, t)];
      game.next = t + SPAWN_EVERY_MS;
    }
    setMs(t);
    setBubbles(game.bubbles);
  });

  const start = () => {
    paid.current = false;
    live.current = { bubbles: [], next: 0, id: 0, score: 0 };
    setBubbles([]);
    setScore(0);
    setMs(0);
    setPhase("play");
    setAnnouncement("Pop the bubbles that match the wand!");
  };

  const wand = wandColor(ms);
  const pop = (b: MagicBubble) => {
    if (phase !== "play") return;
    if (b.color !== wand) {
      playCuteSound("boing");
      setAnnouncement(`That one is ${b.color}. The wand wants ${wand}!`);
      return;
    }
    playCuteSound("pop");
    live.current.bubbles = live.current.bubbles.filter((x) => x.id !== b.id);
    live.current.score += 1;
    setBubbles(live.current.bubbles);
    setScore(live.current.score);
  };

  const secondsLeft = Math.ceil((MAGIC_ROUND_MS - ms) / 1000);
  return (
    <div className="fg-game magic-game">
      <ol className="fg-hud">
        <li aria-label={`${secondsLeft} seconds left`}>⏱️ {secondsLeft}</li>
        <li aria-label={`The wand glows ${wand}`}>
          🪄{" "}
          <span className="magic-wand-dot" style={{ background: HEX[wand] }} />
        </li>
        <li aria-label={`${score} bubbles popped`}>🫧 {score}</li>
      </ol>
      <div className="fg-board magic-sky">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            className="magic-bubble"
            style={{
              left: `${b.x}%`,
              bottom: `${bubbleY(b, ms)}%`,
              background: `radial-gradient(circle at 35% 30%, #ffffff, ${HEX[b.color]} 60%)`,
            }}
            aria-label={`${b.color} bubble`}
            onClick={() => pop(b)}
          />
        ))}
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🫧 {score}</p>}
            <p className="fg-hint">Pop the bubbles that match the wand!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Magic Pop"}
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
