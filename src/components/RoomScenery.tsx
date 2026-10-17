import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import type { PlaceId } from "../game.ts";
import "./sceneryMotion.css";

// Scenery loads when a room is first shown, so startup skips every room's artwork.
const CozyDenScenery = lazy(() =>
  import("./CozyDenScenery.tsx").then((module) => ({
    default: module.CozyDenScenery,
  })),
);
const NeighborhoodArcadeScenery = lazy(() =>
  import("./NeighborhoodArcadeScenery.tsx").then((module) => ({
    default: module.NeighborhoodArcadeScenery,
  })),
);
const CanopyCafeScenery = lazy(() =>
  import("./CanopyCafeScenery.tsx").then((module) => ({
    default: module.CanopyCafeScenery,
  })),
);
const SavannaSquareScenery = lazy(() =>
  import("./SavannaSquareScenery.tsx").then((module) => ({
    default: module.SavannaSquareScenery,
  })),
);
const WateringHoleScenery = lazy(() =>
  import("./WateringHoleScenery.tsx").then((module) => ({
    default: module.WateringHoleScenery,
  })),
);
const DowntownPlazaScenery = lazy(() =>
  import("./DowntownPlazaScenery.tsx").then((module) => ({
    default: module.DowntownPlazaScenery,
  })),
);
const ClubPulseScenery = lazy(() =>
  import("./ClubPulseScenery.tsx").then((module) => ({
    default: module.ClubPulseScenery,
  })),
);
const WonderParkEntranceScenery = lazy(() =>
  import("./WonderParkEntranceScenery.tsx").then((module) => ({
    default: module.WonderParkEntranceScenery,
  })),
);
const WonderParkMidwayScenery = lazy(() =>
  import("./WonderParkMidwayScenery.tsx").then((module) => ({
    default: module.WonderParkMidwayScenery,
  })),
);
const SunsetBeachScenery = lazy(() =>
  import("./SunsetBeachScenery.tsx").then((module) => ({
    default: module.SunsetBeachScenery,
  })),
);
const CoastalPierScenery = lazy(() =>
  import("./CoastalPierScenery.tsx").then((module) => ({
    default: module.CoastalPierScenery,
  })),
);
const MtMistScenery = lazy(() =>
  import("./MtMistScenery.tsx").then((module) => ({
    default: module.MtMistScenery,
  })),
);
const CanyonRapidsScenery = lazy(() =>
  import("./CanyonRapidsScenery.tsx").then((module) => ({
    default: module.CanyonRapidsScenery,
  })),
);
const PetParadiseScenery = lazy(() =>
  import("./PetParadiseScenery.tsx").then((module) => ({
    default: module.PetParadiseScenery,
  })),
);
const PenthouseCondoScenery = lazy(() =>
  import("./PenthouseCondoScenery.tsx").then((module) => ({
    default: module.PenthouseCondoScenery,
  })),
);
const ScoutBaseScenery = lazy(() =>
  import("./ScoutBaseScenery.tsx").then((module) => ({
    default: module.ScoutBaseScenery,
  })),
);
const SplashOasisEntryScenery = lazy(() =>
  import("./SplashOasisEntryScenery.tsx").then((module) => ({
    default: module.SplashOasisEntryScenery,
  })),
);
const SplashOasisRiverScenery = lazy(() =>
  import("./SplashOasisRiverScenery.tsx").then((module) => ({
    default: module.SplashOasisRiverScenery,
  })),
);
const LionSpeedwayScenery = lazy(() =>
  import("./LionSpeedwayScenery.tsx").then((module) => ({
    default: module.LionSpeedwayScenery,
  })),
);
const LionAquariumScenery = lazy(() =>
  import("./LionAquariumScenery.tsx").then((module) => ({
    default: module.LionAquariumScenery,
  })),
);
const SnowflakeRinkScenery = lazy(() =>
  import("./SnowflakeRinkScenery.tsx").then((module) => ({
    default: module.SnowflakeRinkScenery,
  })),
);

const KainanScenery = lazy(() =>
  import("./KainanScenery.tsx").then((module) => ({
    default: module.KainanScenery,
  })),
);

type Scene = {
  width: number;
  /** Stage height in scene units; most rooms are 720. */
  height?: number;
  Scenery: LazyExoticComponent<ComponentType<{ seconds: number }>>;
  /** Some motion still follows game logic (paths, physics, text) and needs the shared clock. */
  clock?: true;
};

/** Each room's illustrated scenery and the stage width its viewBox spans. */
const ROOM_SCENERY: Partial<Record<PlaceId, Scene>> = {
  square: { width: 1536, height: 864, Scenery: SavannaSquareScenery },
  water: { width: 1920, Scenery: WateringHoleScenery },
  cafe: { width: 1920, Scenery: CanopyCafeScenery },
  arcade: { width: 1920, Scenery: NeighborhoodArcadeScenery },
  den: { width: 1920, Scenery: CozyDenScenery },
  "downtown-plaza": { width: 2400, Scenery: DowntownPlazaScenery },
  "club-pulse": { width: 1920, Scenery: ClubPulseScenery, clock: true },
  "wonder-park-entrance": {
    width: 2800,
    Scenery: WonderParkEntranceScenery,
    clock: true,
  },
  "wonder-park-midway": { width: 2800, Scenery: WonderParkMidwayScenery },
  "sunset-beach": { width: 2400, Scenery: SunsetBeachScenery },
  "coastal-pier": { width: 2400, Scenery: CoastalPierScenery },
  "mt-mist": { width: 2400, Scenery: MtMistScenery },
  "canyon-rapids": { width: 2400, Scenery: CanyonRapidsScenery },
  "pet-paradise": { width: 2400, Scenery: PetParadiseScenery },
  "lion-speedway": { width: 2400, Scenery: LionSpeedwayScenery },
  "lion-aquarium": { width: 2400, Scenery: LionAquariumScenery },
  "snowflake-rink": { width: 2400, Scenery: SnowflakeRinkScenery },
  kainan: { width: 2400, Scenery: KainanScenery },
  "penthouse-condo": { width: 1920, Scenery: PenthouseCondoScenery },
  "secret-scout-base": { width: 1920, Scenery: ScoutBaseScenery, clock: true },
  "splash-oasis-entry": {
    width: 2800,
    Scenery: SplashOasisEntryScenery,
    clock: true,
  },
  "splash-oasis-river": {
    width: 2800,
    Scenery: SplashOasisRiverScenery,
    clock: true,
  },
};

export function RoomScenery({
  place,
  preview = false,
}: {
  place: PlaceId;
  preview?: boolean;
}) {
  const [seconds, setSeconds] = useState(0);
  const scene = ROOM_SCENERY[place];
  const clock = !preview && scene?.clock === true;
  useEffect(() => {
    if (!clock) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let start = performance.now();
    const tick = (now: number) => {
      if (now - last >= 80) {
        setSeconds((now - start) / 1000);
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    // Reduced motion keeps seconds at 0 so every scene renders its still frame.
    const update = () => {
      cancelAnimationFrame(frame);
      setSeconds(0);
      start = performance.now();
      if (!query.matches) frame = requestAnimationFrame(tick);
    };
    update();
    query.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", update);
    };
  }, [clock]);
  if (!scene) return null;
  const { width, height = 720, Scenery } = scene;
  return (
    <svg
      className={preview ? "room-scenery room-scenery-preview" : "room-scenery"}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Scenery seconds={seconds} />
      </Suspense>
    </svg>
  );
}
