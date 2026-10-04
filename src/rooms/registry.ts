import type { PlaceId } from "../game.ts";
import type { RoomManifest } from "./types.ts";
import { downtownPlazaManifest } from "./manifests/downtownPlaza.ts";
import { wonderParkEntranceManifest } from "./manifests/wonderParkEntrance.ts";
import { wonderParkMidwayManifest } from "./manifests/wonderParkMidway.ts";
import { clubPulseManifest } from "./manifests/clubPulse.ts";

import { splashOasisEntryManifest } from "./manifests/splashOasisEntry.ts";
import { splashOasisRiverManifest } from "./manifests/splashOasisRiver.ts";
import { penthouseCondoManifest } from "./manifests/penthouseCondo.ts";
import { secretScoutBaseManifest } from "./manifests/secretScoutBase.ts";

import { sunsetBeachManifest } from "./manifests/sunsetBeach.ts";
import { coastalPierManifest } from "./manifests/coastalPier.ts";
import { mtMistBasecampManifest } from "./manifests/mtMistBasecamp.ts";

export const ROOM_MANIFESTS: Partial<Record<PlaceId, RoomManifest>> = {
  "mt-mist": mtMistBasecampManifest,
  "downtown-plaza": downtownPlazaManifest,
  "wonder-park-entrance": wonderParkEntranceManifest,
  "wonder-park-midway": wonderParkMidwayManifest,
  "club-pulse": clubPulseManifest,
  "splash-oasis-entry": splashOasisEntryManifest,
  "splash-oasis-river": splashOasisRiverManifest,
  "penthouse-condo": penthouseCondoManifest,
  "secret-scout-base": secretScoutBaseManifest,
  "sunset-beach": sunsetBeachManifest,
  "coastal-pier": coastalPierManifest,
};
