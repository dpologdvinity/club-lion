import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { PageFills } from "../utils/coloringBook.ts";
import type { PlayerV2 } from "../game.ts";

import { gameCards, type GameId } from "../games/catalog.ts";
import { lazyPanel } from "./lazyPanel";

// Each game's code stays out of the startup bundle.
const MemorySafari = lazyPanel(() =>
  import("./MemorySafari").then((module) => module.MemorySafari),
);
const BeeStop = lazyPanel(() =>
  import("./BeeStop").then((module) => module.BeeStop),
);
const PawSteps = lazyPanel(() =>
  import("./PawSteps").then((module) => module.PawSteps),
);
const FruitCatch = lazyPanel(() =>
  import("./FruitCatch").then((module) => module.FruitCatch),
);
const DJBeatDrop = lazyPanel(() =>
  import("./DJBeatDrop").then((module) => module.DJBeatDrop),
);
const SmoothieKitchenContent = lazyPanel(() =>
  import("./SmoothieKitchen").then((module) => module.SmoothieKitchenContent),
);
const RollerCoasterRide = lazyPanel(() =>
  import("./RollerCoasterRide").then((module) => module.RollerCoasterRide),
);
const WaterholeAngler = lazyPanel(() =>
  import("./WaterholeAngler").then((module) => module.WaterholeAngler),
);
const TopModelsRunway = lazyPanel(() =>
  import("./TopModelsRunway").then((module) => module.TopModelsRunway),
);
const InstrumentContent = lazyPanel(() =>
  import("./InstrumentModal").then((module) => module.InstrumentContent),
);
const PopTheFireflies = lazyPanel(() =>
  import("./PopTheFireflies").then((module) => module.PopTheFireflies),
);
const PeekabooAnimals = lazyPanel(() =>
  import("./PeekabooAnimals").then((module) => module.PeekabooAnimals),
);
const HaloHalo = lazyPanel(() =>
  import("./HaloHalo").then((module) => module.HaloHalo),
);
const MangoRun = lazyPanel(() =>
  import("./MangoRun").then((module) => module.MangoRun),
);
const BubblePop = lazyPanel(() =>
  import("./BubblePop").then((module) => module.BubblePop),
);
const ColoringBook = lazyPanel(() =>
  import("./ColoringBook").then((module) => module.ColoringBook),
);
const MangoBakery = lazyPanel(() =>
  import("./MangoBakery").then((module) => module.MangoBakery),
);
const HideAndSeekSafari = lazyPanel(() =>
  import("./HideAndSeekSafari").then((module) => module.HideAndSeekSafari),
);
const AnimalBand = lazyPanel(() =>
  import("./AnimalBand").then((module) => module.AnimalBand),
);
const ShapeSorter = lazyPanel(() =>
  import("./ShapeSorter").then((module) => module.ShapeSorter),
);
const PicturePuzzle = lazyPanel(() =>
  import("./PicturePuzzle").then((module) => module.PicturePuzzle),
);
const BalloonParade = lazyPanel(() =>
  import("./BalloonParade").then((module) => module.BalloonParade),
);

export type { GameId } from "../games/catalog.ts";

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
  onCompleteMangoRun,
  onColorPage,
  onServeCake,
  onCompleteSeek,
  onCompleteAnimalBand,
  onCompleteShapeSorter,
  onCompletePicturePuzzle,
  onCompleteBalloonRainbow,
  onServeHaloHalo,
  onCompletePeekaboo,
  onCompleteFireflies,
  onClose,
}: {
  player: PlayerV2;
  initialGame?: GameId | null;
  onCompleteDJ?: (score: number, combo: number) => void;
  onCompleteSmoothie?: () => void;
  onCompleteGame?: (pairs: number) => void;
  onCompleteBeeStop?: (score: number) => void;
  onCompletePawSteps?: (rounds: number) => void;
  onCompleteFruitCatch?: ComponentProps<typeof FruitCatch>["onFinish"];
  onSafariFinish?: (pairs: number) => void;
  onPawStepsFinish?: (rounds: number) => void;
  onFruitFinish?: (caught: number, hits: number, score: number) => void;
  onCompleteFishing?: (result: { speciesId: string; weight: number }) => void;
  onCompleteFashion?: (result: {
    themeId: string;
    score: number;
    stars: number;
  }) => void;
  onCompleteBubblePop?: (score: number) => void;
  onCompleteMangoRun?: (score: number) => void;
  onColorPage?: (pageId: string, fills: PageFills, finish: boolean) => void;
  onServeCake?: ComponentProps<typeof MangoBakery>["onServe"];
  onCompleteSeek?: ComponentProps<typeof HideAndSeekSafari>["onComplete"];
  onCompleteAnimalBand?: (taps: number) => void;
  onCompleteShapeSorter?: (round: number) => void;
  onCompletePicturePuzzle?: (pieces: number) => void;
  onCompleteBalloonRainbow?: () => void;
  onServeHaloHalo?: ComponentProps<typeof HaloHalo>["onServe"];
  onCompletePeekaboo?: (found: number) => void;
  onCompleteFireflies?: (score: number) => void;
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
          picked === "mango-run" ||
          picked === "coloring-book" ||
          picked === "bakery" ||
          picked === "seek" ||
          picked === "animal-band" ||
          picked === "shape-sorter" ||
          picked === "picture-puzzle" ||
          picked === "balloon-parade" ||
          picked === "halo-halo" ||
          picked === "fireflies" ||
          picked === "peekaboo") && (
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
        {picked === "mango-run" && (
          <MangoRun
            best={player.mangoRunBest ?? 0}
            onFinish={(score) => onCompleteMangoRun?.(score)}
            onClose={onClose}
          />
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
        {picked === "fireflies" && (
          <PopTheFireflies
            best={player.fireflyBest ?? 0}
            onFinish={(score) => onCompleteFireflies?.(score)}
          />
        )}
        {picked === "peekaboo" && (
          <PeekabooAnimals onFinish={(found) => onCompletePeekaboo?.(found)} />
        )}
        {picked === "halo-halo" && (
          <HaloHalo onServe={onServeHaloHalo ?? (() => {})} />
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
      {gameCards(player).map((game) => (
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
                {`${game.progressLabel} ${game.best}`}
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
          {player.pawStepsBest > 0 && (
            <span className="game-card-best">Best {player.pawStepsBest}</span>
          )}
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
        </span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
