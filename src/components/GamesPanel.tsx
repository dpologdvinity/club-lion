import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MemorySafari } from "./MemorySafari";
import { BeeStop } from "./BeeStop";
import { PawSteps } from "./PawSteps";
import { FruitCatch } from "./FruitCatch";
import { DJBeatDrop } from "./DJBeatDrop";
import { SmoothieKitchenContent } from "./SmoothieKitchen";
import { RollerCoasterRide } from "./RollerCoasterRide";
import { WaterholeAngler } from "./WaterholeAngler";
import { TopModelsRunway } from "./TopModelsRunway";
import { InstrumentContent } from "./InstrumentModal";
import { BubblePop } from "./BubblePop";
import { ColoringBook } from "./ColoringBook";
import type { PageFills } from "../utils/coloringBook.ts";
import { MangoBakery } from "./MangoBakery";
import { HideAndSeekSafari } from "./HideAndSeekSafari";
import { AnimalBand } from "./AnimalBand";
import { ShapeSorter } from "./ShapeSorter";
import { PicturePuzzle } from "./PicturePuzzle";
import { BalloonParade } from "./BalloonParade";
import { PAW_STEPS_COINS_PER_ROUND } from "../game";
import type { PlayerV2 } from "../game.ts";

export type GameId =
  | "memory"
  | "bee"
  | "paw"
  | "fruit"
  | "dj-beat-drop"
  | "smoothie"
  | "coaster"
  | "fishing"
  | "runway"
  | "instrument"
  | "sled-run"
  | "bubble-pop"
  | "coloring-book"
  | "bakery"
  | "seek"
  | "animal-band"
  | "shape-sorter"
  | "picture-puzzle"
  | "balloon-parade";

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
  onCompleteFishing,
  onCompleteFashion,
  onCompleteBubblePop,
  onColorPage,
  onServeCake,
  onCompleteSeek,
  onCompleteAnimalBand,
  onCompleteShapeSorter,
  onCompletePicturePuzzle,
  onCompleteBalloonRainbow,
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
  onCompleteFishing?: (result: {
    speciesId: string;
    weight: number;
    coins: number;
  }) => void;
  onCompleteFashion?: (result: {
    themeId: string;
    score: number;
    stars: number;
    coins: number;
  }) => void;
  onCompleteBubblePop?: (score: number) => void;
  onColorPage?: (pageId: string, fills: PageFills, finish: boolean) => void;
  onServeCake?: ComponentProps<typeof MangoBakery>["onServe"];
  onCompleteSeek?: ComponentProps<typeof HideAndSeekSafari>["onComplete"];
  onCompleteAnimalBand?: (taps: number) => void;
  onCompleteShapeSorter?: (round: number) => void;
  onCompletePicturePuzzle?: (pieces: number) => void;
  onCompleteBalloonRainbow?: () => void;
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
          picked === "coaster" ||
          picked === "fishing" ||
          picked === "runway" ||
          picked === "instrument" ||
          picked === "bubble-pop" ||
          picked === "coloring-book" ||
          picked === "bakery" ||
          picked === "seek" ||
          picked === "animal-band" ||
          picked === "shape-sorter" ||
          picked === "picture-puzzle" ||
          picked === "balloon-parade") && (
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
        {picked === "fishing" && (
          <WaterholeAngler
            onCatch={(res) => onCompleteFishing?.(res)}
            onClose={onClose}
          />
        )}
        {picked === "runway" && (
          <TopModelsRunway
            ownedItems={player.owned}
            onComplete={(res) => onCompleteFashion?.(res)}
            onClose={onClose}
          />
        )}
        {picked === "instrument" && (
          <div className="instrument-panel-container">
            <div className="game-lead">
              <h3>Upright Savanna Piano</h3>
              <p>Play musical notes with your paws</p>
            </div>
            <InstrumentContent instrument="piano" onClose={onClose} />
          </div>
        )}
        {picked === "bubble-pop" && (
          <BubblePop
            best={player.bubblePopBest ?? 0}
            onFinish={(score) => onCompleteBubblePop?.(score)}
          />
        )}
        {picked === "coloring-book" && (
          <ColoringBook
            book={player.coloringBook}
            onColor={(pageId, fills, finish) =>
              onColorPage?.(pageId, fills, finish)
            }
          />
        )}
        {picked === "bakery" && (
          <MangoBakery
            photos={player.bakeryCakes ?? []}
            onServe={onServeCake ?? (() => {})}
          />
        )}
        {picked === "seek" && (
          <HideAndSeekSafari
            bestMs={player.seekBestMs}
            onComplete={onCompleteSeek ?? (() => {})}
          />
        )}
        {picked === "animal-band" && (
          <AnimalBand onFinish={(taps) => onCompleteAnimalBand?.(taps)} />
        )}
        {picked === "shape-sorter" && (
          <ShapeSorter
            onRoundDone={(round) => onCompleteShapeSorter?.(round)}
          />
        )}
        {picked === "picture-puzzle" && (
          <PicturePuzzle
            onPictureDone={(pieces) => onCompletePicturePuzzle?.(pieces)}
          />
        )}
        {picked === "balloon-parade" && (
          <BalloonParade onRainbowDone={() => onCompleteBalloonRainbow?.()} />
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
            id: "bubble-pop",
            name: "Bubble Pop",
            art: "🫧 🦁 ⭐",
            description: "Pop floating bubbles to free the surprises inside.",
            reward: "Challenge mode pays up to 60 coins",
            best: player.bubblePopBest ?? 0,
          },
          {
            id: "coloring-book",
            name: "Coloring Book",
            art: "🖍️ 🐉 🎡",
            description: "Tap to fill six pages. There is no wrong color.",
            reward: "Finish a page for a stamp",
            best: 0,
          },
          {
            id: "bakery",
            name: "Mango Bakery",
            art: "🎂 🥭 🕯️",
            description: "Bake, decorate and serve cakes to animal friends.",
            reward: "Earn up to 24 coins per cake",
            best: player.cakesServed ?? 0,
          },
          {
            id: "seek",
            name: "Hide & Seek Safari",
            art: "🔍 🦓 🌿",
            description: "Spot the animals hiding in the scene.",
            reward: "Earn 10–20 coins and a stamp per place",
            best: player.seekRounds ?? 0,
          },
          {
            id: "animal-band",
            name: "Animal Orchestra",
            art: "🦁 🦓 🦒",
            description: "Tap an animal to play its sound. Record a tiny song.",
            reward: "Earn 4 coins the first time you play a song back",
            best: player.animalBandSongs ?? 0,
          },
          {
            id: "shape-sorter",
            name: "Shape Sorter Safari",
            art: "🔺 ⭕ 🟦",
            description: "Drop each shape into the animal it fits.",
            reward: "Earn 5 coins a round and a star stamp",
            best: player.shapeSorterRounds ?? 0,
          },
          {
            id: "picture-puzzle",
            name: "Picture Puzzle",
            art: "🧩 🦁 🎡",
            description:
              "Drag each piece to its spot. Big pictures, big pieces.",
            reward: "Earn 5–12 coins a picture and a star stamp",
            best: player.picturePuzzles ?? 0,
          },
          {
            id: "balloon-parade",
            name: "Balloon Parade",
            art: "🎈 🌈 🎈",
            description:
              "Pop the balloons. Pop them in rainbow order for an arch.",
            reward: "Earn 10 coins for each rainbow arch",
            best: player.balloonRainbows ?? 0,
          },
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
          {
            id: "fishing",
            name: "Waterhole Angler",
            art: "🎣 🐟 🌊",
            description: "Cast your line, reel in exotic fish.",
            reward: "Earn coins based on catch rarity",
            best: player.fishCaughtCount ?? 0,
          },
          {
            id: "runway",
            name: "Top Models Runway",
            art: "💃 📸 👑",
            description: "30s styling challenge on the catwalk.",
            reward: "Earn up to 60 coins for 3 stars",
            best: player.fashionBestScore ?? 0,
          },
          {
            id: "instrument",
            name: "World Instruments",
            art: "🎹 🥁 🎶",
            description: "Play procedural piano, marimba, and drums.",
            reward: "Harmonic jam mode · procedural audio",
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
                {game.id === "smoothie" || game.id === "bakery"
                  ? `Orders served ${game.best}`
                  : game.id === "seek"
                    ? `Rounds found ${game.best}`
                    : game.id === "animal-band"
                      ? `Songs played ${game.best}`
                      : game.id === "shape-sorter"
                        ? `Rounds sorted ${game.best}`
                        : game.id === "picture-puzzle"
                          ? `Pictures finished ${game.best}`
                          : game.id === "balloon-parade"
                            ? `Rainbows built ${game.best}`
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
