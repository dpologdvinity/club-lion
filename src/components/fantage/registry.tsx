import type { JSX } from "react";
import { lazyPanel } from "../lazyPanel";
import type { FantageGameId } from "../../games/fantage.ts";

export type FantageGameProps = {
  /** Called once per finished game with its score. */
  onFinish: (score: number) => void;
};

/** Each Game Hall game, kept out of the startup bundle until opened. */
export const FANTAGE_COMPONENTS: Record<
  FantageGameId,
  (props: FantageGameProps) => JSX.Element
> = {
  "memory-mixup": lazyPanel(() =>
    import("./MemoryMixup").then((module) => module.MemoryMixup),
  ),
  "snack-tac-toe": lazyPanel(() =>
    import("./SnackTacToe").then((module) => module.SnackTacToe),
  ),
  "whack-a-veggie": lazyPanel(() =>
    import("./WhackAVeggie").then((module) => module.WhackAVeggie),
  ),
  bullseye: lazyPanel(() =>
    import("./Bullseye").then((module) => module.Bullseye),
  ),
  "mad-math": lazyPanel(() =>
    import("./MadMath").then((module) => module.MadMath),
  ),
  staries: lazyPanel(() =>
    import("./Staries").then((module) => module.Staries),
  ),
  "type-boo": lazyPanel(() =>
    import("./TypeBoo").then((module) => module.TypeBoo),
  ),
  "candy-swap": lazyPanel(() =>
    import("./CandySwap").then((module) => module.CandySwap),
  ),
  "buzzer-beater": lazyPanel(() =>
    import("./BuzzerBeater").then((module) => module.BuzzerBeater),
  ),
  "mouse-out": lazyPanel(() =>
    import("./MouseOut").then((module) => module.MouseOut),
  ),
  "stained-glass": lazyPanel(() =>
    import("./StainedGlass").then((module) => module.StainedGlass),
  ),
  "snow-day": lazyPanel(() =>
    import("./SnowDay").then((module) => module.SnowDay),
  ),
  "bricks-breaking": lazyPanel(() =>
    import("./BricksBreaking").then((module) => module.BricksBreaking),
  ),
  "galaxy-hero": lazyPanel(() =>
    import("./GalaxyHero").then((module) => module.GalaxyHero),
  ),
  "pearly-pop": lazyPanel(() =>
    import("./PearlyPop").then((module) => module.PearlyPop),
  ),
  "magic-pop": lazyPanel(() =>
    import("./MagicPop").then((module) => module.MagicPop),
  ),
  "jelly-fishin": lazyPanel(() =>
    import("./JellyFishin").then((module) => module.JellyFishin),
  ),
  "bobo-fish": lazyPanel(() =>
    import("./BoboFish").then((module) => module.BoboFish),
  ),
  "bubble-bug": lazyPanel(() =>
    import("./BubbleBug").then((module) => module.BubbleBug),
  ),
  boxy: lazyPanel(() => import("./Boxy").then((module) => module.Boxy)),
  "check-mate": lazyPanel(() =>
    import("./CheckMate").then((module) => module.CheckMate),
  ),
  "king-me": lazyPanel(() =>
    import("./KingMe").then((module) => module.KingMe),
  ),
  "go-cart": lazyPanel(() =>
    import("./GoCart").then((module) => module.GoCart),
  ),
  "putt-putt": lazyPanel(() =>
    import("./PuttPutt").then((module) => module.PuttPutt),
  ),
  "rocket-board": lazyPanel(() =>
    import("./RocketBoard").then((module) => module.RocketBoard),
  ),
  "slide-splash": lazyPanel(() =>
    import("./SlideSplash").then((module) => module.SlideSplash),
  ),
  "splash-power-up": lazyPanel(() =>
    import("./SplashPowerUp").then((module) => module.SplashPowerUp),
  ),
};
