import { useEffect, useState, type ComponentType } from "react";
import type { PlaceId } from "../game.ts";
import "./sceneryMotion.css";
import { DowntownPlazaScenery } from "./DowntownPlazaScenery.tsx";
import { ClubPulseScenery } from "./ClubPulseScenery.tsx";
import { WonderParkEntranceScenery } from "./WonderParkEntranceScenery.tsx";
import { WonderParkMidwayScenery } from "./WonderParkMidwayScenery.tsx";
import { SunsetBeachScenery } from "./SunsetBeachScenery.tsx";
import { CoastalPierScenery } from "./CoastalPierScenery.tsx";
import { MtMistScenery } from "./MtMistScenery.tsx";
import { CanyonRapidsScenery } from "./CanyonRapidsScenery.tsx";
import { PetParadiseScenery } from "./PetParadiseScenery.tsx";
import { PenthouseCondoScenery } from "./PenthouseCondoScenery.tsx";
import { ScoutBaseScenery } from "./ScoutBaseScenery.tsx";
import { SplashOasisEntryScenery } from "./SplashOasisEntryScenery.tsx";
import { SplashOasisRiverScenery } from "./SplashOasisRiverScenery.tsx";
import { LionSpeedwayScenery } from "./LionSpeedwayScenery.tsx";

type Scene = {
  width: number;
  Scenery: ComponentType<{ seconds: number }>;
  /** Some motion still follows game logic (paths, physics, text) and needs the shared clock. */
  clock?: true;
};

/** Each room's illustrated scenery and the stage width its viewBox spans. */
const ROOM_SCENERY: Partial<Record<PlaceId, Scene>> = {
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
  const { width, Scenery } = scene;
  return (
    <svg
      className={preview ? "room-scenery room-scenery-preview" : "room-scenery"}
      viewBox={`0 0 ${width} 720`}
      preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
      aria-hidden="true"
    >
      <Scenery seconds={seconds} />
    </svg>
  );
}
