import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MemorySafari } from "./MemorySafari";
import { BeeStop } from "./BeeStop";
import { PawSteps } from "./PawSteps";
import { FruitCatch } from "./FruitCatch";
import { DJBeatDrop } from "./DJBeatDrop";
import { SmoothieKitchenContent } from "./SmoothieKitchen";
import { RollerCoasterRide } from "./RollerCoasterRide";
import { PAW_STEPS_COINS_PER_ROUND } from "../game";
import type { PlayerV2 } from "../game.ts";

export type GameId =
  "memory" | "bee" | "paw" | "fruit" | "dj-beat-drop" | "smoothie" | "coaster";

export function GamesPanel({
  player,
  initialGame = null,
  onCompleteDJ,
  onCompleteSmoothie,
  onCompleteGame,
  onCompleteBeeStop,
  onCompletePawSteps,
  onCompleteFruitCatch,
  onSafariFinish,
  onPawStepsFinish,
  onFruitFinish,
  onClose,
}: {
  player: PlayerV2;
  initialGame?: GameId | null;
  onCompleteDJ?: (score: number, combo: number) => void;
  onCompleteSmoothie?: (coins: number) => void;
  onCompleteGame?: (pairs: number) => void;
  onCompleteBeeStop?: (score: number) => void;
  onCompletePawSteps?: (rounds: number) => void;
  onCompleteFruitCatch?: ComponentProps<typeof FruitCatch>["onFinish"];
  onSafariFinish?: (pairs: number) => void;
  onPawStepsFinish?: (rounds: number) => void;
  onFruitFinish?: (caught: number, hits: number, score: number) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<GameId | null>(initialGame);
  const menuButtons = useRef<Partial<Record<GameId, HTMLButtonElement | null>>>(
    {},
  );
  const returnTo = useRef<GameId | null>(null);
  const backToMenu = () => {
    returnTo.current = picked;
    setPicked(null);
  };
  useEffect(() => {
    if (picked === null && returnTo.current) {
      menuButtons.current[returnTo.current]?.focus();
    }
  }, [picked]);

  const handleSafari = onCompleteGame || onSafariFinish || (() => {});
  const handleBeeStop = onCompleteBeeStop || (() => {});
  const handlePawSteps = onCompletePawSteps || onPawStepsFinish || (() => {});
  const handleFruitCatch = (result: {
    caught: number;
    hits: number;
    score: number;
  }) => {
    if (onCompleteFruitCatch) {
      onCompleteFruitCatch(result);
    } else if (onFruitFinish) {
      onFruitFinish(result.caught, result.hits, result.score);
    }
  };

  if (picked)
    return (
      <>
        {(picked === "dj-beat-drop" ||
          picked === "smoothie" ||
          picked === "coaster") && (
          <button className="game-back" onClick={backToMenu}>
            <ArrowLeft size={14} /> All games
          </button>
        )}
        {picked === "dj-beat-drop" && (
          <DJBeatDrop
            best={player.djBeatDropBest ?? 0}
            onFinish={(result) => onCompleteDJ?.(result.score, result.combo)}
            onClose={onClose}
          />
        )}
        {picked === "smoothie" && (
          <SmoothieKitchenContent
            onServe={onCompleteSmoothie ?? (() => {})}
            onClose={onClose}
          />
        )}
        {picked === "coaster" && (
          <RollerCoasterRide
            look={player.look}
            pet={player.pet}
            onClose={onClose}
          />
        )}
        {picked === "memory" && (
          <MemorySafari
            onFinish={handleSafari}
            onBack={backToMenu}
            onClose={onClose}
          />
        )}
        {picked === "bee" && (
          <>
            <button className="game-back" onClick={backToMenu}>
              <ArrowLeft size={14} /> All games
            </button>
            <BeeStop
              best={player.beeStopBest}
              onFinish={handleBeeStop}
              onClose={onClose}
            />
          </>
        )}
        {picked === "paw" && (
          <PawSteps
            best={player.pawStepsBest}
            onFinish={handlePawSteps}
            onBack={backToMenu}
            onClose={onClose}
          />
        )}
        {picked === "fruit" && (
          <>
            <button className="game-back" onClick={backToMenu}>
              <ArrowLeft size={14} /> All games
            </button>
            <FruitCatch
              best={player.fruitCatchBest}
              onFinish={handleFruitCatch}
              onClose={onClose}
            />
          </>
        )}
      </>
    );
  return (
    <div className="arcade-picker">
      {(
        [
          {
            id: "dj-beat-drop",
            name: "DJ Beat Drop",
            art: "🎧 🎵 🦁",
            description: "Match four lanes to the beat.",
            reward: "Earn coins for your groove",
            best: player.djBeatDropBest ?? 0,
          },
          {
            id: "smoothie",
            name: "Smoothie Kitchen",
            art: "🥭 🥥 🧊",
            description: "Follow café recipes, blend and serve.",
            reward: "Earn up to 42 coins per order",
            best: player.smoothiesServed ?? 0,
          },
          {
            id: "coaster",
            name: "Savanna Screamer",
            art: "🎢 🦁 🎡",
            description: "Ride the loop and keep a local souvenir.",
            reward: "A scenic ride · no coin payout",
            best: 0,
          },
        ] as const
      ).map((game) => (
        <button
          key={game.id}
          ref={(node) => {
            menuButtons.current[game.id] = node;
          }}
          className="arcade-game"
          aria-label={`Play ${game.name}`}
          onClick={() => setPicked(game.id)}
        >
          <span className="arcade-art phase-two-art" aria-hidden="true">
            {game.art}
          </span>
          <span className="arcade-copy">
            <strong>{game.name}</strong>
            <small>{game.description}</small>
            <span className="arcade-reward">{game.reward}</span>
            {game.best > 0 && (
              <span className="game-card-best">
                {game.id === "smoothie"
                  ? `Orders served ${game.best}`
                  : `Best ${game.best}`}
              </span>
            )}
          </span>
          <ChevronRight size={20} />
        </button>
      ))}
      <button
        ref={(node) => {
          menuButtons.current.memory = node;
        }}
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
        ref={(node) => {
          menuButtons.current.bee = node;
        }}
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
      <button
        ref={(node) => {
          menuButtons.current.paw = node;
        }}
        className="arcade-game"
        onClick={() => setPicked("paw")}
        aria-label="Play Paw Steps"
      >
        <span className="arcade-art memory-art" aria-hidden="true">
          🐾 🦁 🐾
        </span>
        <span className="arcade-copy">
          <strong>Paw Steps</strong>
          <small>Repeat the lion's paw steps. No timer, no rush.</small>
          <span className="arcade-reward">
            {PAW_STEPS_COINS_PER_ROUND} coins a round.
            {player.pawStepsBest > 0 && ` Best: ${player.pawStepsBest}.`}
          </span>
        </span>
        <ChevronRight size={20} />
      </button>
      <button
        ref={(node) => {
          menuButtons.current.fruit = node;
        }}
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
    </div>
  );
}
