import type { PlaceId } from "../game.ts";
import type { RoomManifest } from "./types.ts";
import { downtownPlazaManifest } from "./manifests/downtownPlaza.ts";
import { wonderParkEntranceManifest } from "./manifests/wonderParkEntrance.ts";
import { wonderParkMidwayManifest } from "./manifests/wonderParkMidway.ts";
import { clubPulseManifest } from "./manifests/clubPulse.ts";

import { splashOasisEntryManifest } from "./manifests/splashOasisEntry.ts";
import { splashOasisRiverManifest } from "./manifests/splashOasisRiver.ts";

export const ROOM_MANIFESTS: Partial<Record<PlaceId, RoomManifest>> = {
  "downtown-plaza": downtownPlazaManifest,
  "wonder-park-entrance": wonderParkEntranceManifest,
  "wonder-park-midway": wonderParkMidwayManifest,
  "club-pulse": clubPulseManifest,
  "splash-oasis-entry": splashOasisEntryManifest,
  "splash-oasis-river": splashOasisRiverManifest,
};
