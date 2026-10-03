import { useState } from "react";
import { ArrowRight, Gamepad2, Sparkles } from "lucide-react";
import { MemorySafari } from "./MemorySafari";
import { BeeStop } from "./BeeStop";
import type { Player } from "../game.ts";

type GameId = "memory" | "bee";

export function GamesPanel({
  player,
  onCompleteGame,
  onCompleteBeeStop,
  onClose,
}: {
  player: Player;
  onCompleteGame: (pairs: number) => void;
  onCompleteBeeStop: (score: number) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<GameId | null>(null);
  if (picked === "memory")
    return <MemorySafari onFinish={onCompleteGame} onClose={onClose} />;
  if (picked === "bee")
    return (
      <BeeStop
        best={player.beeStopBest}
        onFinish={onCompleteBeeStop}
        onClose={onClose}
      />
    );
  return (
    <div className="games-panel">
      <button
        className="game-card"
        onClick={() => setPicked("memory")}
        aria-label="Play Memory Safari"
      >
        <span className="game-card-art" aria-hidden="true">
          🃏
        </span>
        <span className="game-card-body">
          <strong>Memory Safari</strong>
          <span className="game-card-note">
            Six pairs, no timer. Easy does it.
          </span>
        </span>
        <span className="destination-arrow">
          <ArrowRight size={19} />
        </span>
      </button>
      <button
        className="game-card"
        onClick={() => setPicked("bee")}
        aria-label="Play Bee Stop"
      >
        <span className="game-card-art" aria-hidden="true">
          🐝
        </span>
        <span className="game-card-body">
          <strong>Bee Stop</strong>
          <span className="game-card-note">Ten rounds of perfect timing.</span>
          {player.beeStopBest > 0 && (
            <span className="game-card-best">Best {player.beeStopBest}</span>
          )}
        </span>
        <span className="destination-arrow">
          <ArrowRight size={19} />
        </span>
      </button>
      <p className="game-panel-note">
        <Gamepad2 size={13} /> Coins earned here buy treats in the shop.{" "}
        <Sparkles size={13} /> Both games can be replayed as often as you like.
      </p>
    </div>
  );
}
