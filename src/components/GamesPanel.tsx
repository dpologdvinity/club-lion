import { useState, type ComponentProps } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MemorySafari } from "./MemorySafari";
import { BeeStop } from "./BeeStop";
import { FruitCatch } from "./FruitCatch";
import type { Player } from "../game.ts";

type GameId = "memory" | "bee" | "fruit";

export function GamesPanel({
  player,
  onCompleteGame,
  onCompleteBeeStop,
  onCompleteFruitCatch,
  onClose,
}: {
  player: Player;
  onCompleteGame: (pairs: number) => void;
  onCompleteBeeStop: (score: number) => void;
  onCompleteFruitCatch: ComponentProps<typeof FruitCatch>["onFinish"];
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<GameId | null>(null);
  if (picked)
    return (
      <>
        <button className="game-back" onClick={() => setPicked(null)}>
          <ArrowLeft size={14} /> All games
        </button>
        {picked === "memory" && (
          <MemorySafari onFinish={onCompleteGame} onClose={onClose} />
        )}
        {picked === "bee" && (
          <BeeStop
            best={player.beeStopBest}
            onFinish={onCompleteBeeStop}
            onClose={onClose}
          />
        )}
        {picked === "fruit" && (
          <FruitCatch
            best={player.fruitCatchBest}
            onFinish={onCompleteFruitCatch}
            onClose={onClose}
          />
        )}
      </>
    );
  return (
    <div className="arcade-picker">
      <button
        className="arcade-game"
        onClick={() => setPicked("memory")}
        aria-label="Play Memory Safari"
      >
        <span className="arcade-art memory-art" aria-hidden="true">
          🦁 🌴 🌼
        </span>
        <span className="arcade-copy">
          <strong>Memory Safari</strong>
          <small>Find the matching pairs. No timer, no rush.</small>
          <span className="arcade-reward">Earn up to 60 coins</span>
        </span>
        <ChevronRight size={20} />
      </button>
      <button
        className="arcade-game"
        onClick={() => setPicked("fruit")}
        aria-label="Play Fruit Catch!"
      >
        <span className="arcade-art fruit-art" aria-hidden="true">
          🍎 🧺 🍊
        </span>
        <span className="arcade-copy">
          <strong>Fruit Catch!</strong>
          <small>Catch the good stuff. Dodge the icky stuff.</small>
          <span className="arcade-reward">2 coins for every fruit caught</span>
        </span>
        <ChevronRight size={20} />
      </button>
      <button
        className="arcade-game"
        onClick={() => setPicked("bee")}
        aria-label="Play Bee Stop"
      >
        <span className="arcade-art bee-illustration" aria-hidden="true">
          🌼 🐝 🍯
        </span>
        <span className="arcade-copy">
          <strong>Bee Stop</strong>
          <small>Ten rounds of perfect timing.</small>
          <span className="arcade-reward">Earn 15–120 coins</span>
          {player.beeStopBest > 0 && (
            <span className="game-card-best">Best {player.beeStopBest}</span>
          )}
        </span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
