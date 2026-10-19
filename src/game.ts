import {
  calculateSledPayout,
  SLED_FINISH_DISTANCE,
  SLED_MAX_PINECONES,
  SLED_MAX_TRICKS,
  SLED_MAX_PAYOUT,
  type SledState,
} from "./utils/sledPhysics.ts";
import { isHaloLayers } from "./utils/haloHalo.ts";
import { PIN_STAMP_COUNT, isPinId, pinForDay } from "./utils/pins.ts";
import { isPetOutfit, isPetThemeId, scoreOutfit } from "./utils/dressPet.ts";
import { PEEKABOO_ROUNDS, PEEKABOO_STAMP_SCORE } from "./utils/peekaboo.ts";
import { FIREFLY_MAX_SCORE, FIREFLY_STAMP_SCORE } from "./utils/fireflies.ts";
import { ROUNDUP_MAX_SCORE, ROUNDUP_STAMP_SCORE } from "./utils/petRoundUp.ts";
import {
  BUTTERFLY_COUNT,
  BUTTERFLY_SPOTS,
  butterfliesForDay,
} from "./utils/squareFun.ts";
import { sanitizeSocialGraph } from "./utils/socialGraph.ts";
import { clampToStage } from "./utils/roomProps.ts";
import { ROOM_MANIFESTS } from "./rooms/registry.ts";
import {
  isKartColorId,
  isKartMode,
  type KartColorId,
  type KartMode,
} from "./utils/kartRace.ts";
import {
  STAMP_DEFINITIONS,
  evaluateStampUnlocks,
  isStampUnlocked,
} from "./utils/stampDefinitions.ts";
export {
  STAMP_DEFINITIONS,
  evaluateStampUnlocks,
  isStampUnlocked,
} from "./utils/stampDefinitions.ts";
import { BEE_STOP_MAX_SCORE } from "./beeStop.ts";
import { BUBBLE_POP_MAX_SCORE } from "./utils/bubblePop.ts";
import { SONG_MAX_TAPS } from "./utils/animalBand.ts";
import { SHAPE_SORTER_ROUNDS } from "./utils/shapeSorter.ts";
import { isPieceCount } from "./utils/picturePuzzle.ts";
import {
  restoreColoringBook,
  saveColoringPage,
  type ColoringBookSave,
  type PageFills,
} from "./utils/coloringBook.ts";
import {
  MAX_CAKE_PHOTOS,
  restoreCakePhoto,
  restoreCakePhotos,
  type Cake,
} from "./utils/bakery.ts";
import {
  SEEK_MAX_TIME_MS,
  SEEK_STAMPS,
  isSeekScene,
  type SeekSceneId,
} from "./utils/seekSafari.ts";
import { FISH_SPECIES } from "./utils/fishingEngine.ts";
import { DJ_BEAT_COUNT, DJ_MAX_SCORE } from "./utils/rhythmEngine.ts";
import { deserializeLayout, serializeLayout } from "./utils/condoGrid.ts";
import { calculateSpyRank, SPY_RANKS } from "./utils/spyPuzzles.ts";
import type { AvatarLook, EquipSlot, PetState } from "./types/world.ts";
import {
  DEFAULT_AVATAR_LOOK,
  STARTER_AVATAR_LOOK,
  DEFAULT_PET_STATE,
  validateAvatarLook,
  resolveHairStyle,
  CATALOG_ITEMS,
} from "./types/world.ts";
import {
  BOTTOMS,
  SHOES,
  TOPS,
  findOption,
  resolveBottomId,
  resolveShoeId,
  resolveTopId,
  type ClothingOption,
  type SalonCategory,
} from "./types/avatarOptions.ts";
import type { PetCareState, CareAction } from "./utils/petCare.ts";
import {
  PET_PROFILES,
  restorePetSpecies,
  type PetSpecies,
} from "./utils/petSpecies.ts";
import { DEFAULT_PET_CARE_STATE, performPetCare } from "./utils/petCare.ts";
import { OUTFITS } from "./components/avatar/pixelOutfits.ts";
import { SHOE_KIT } from "./components/avatar/pixelShoeKit.ts";
import { COSTUMES } from "./components/avatar/pixelCostumes.ts";
import {
  isPixelOwnedId,
  ownsPixel,
  restoreGold,
  type PixelKind,
} from "./utils/gold.ts";
import {
  FANTAGE_GAMES,
  fantageGame,
  type FantageGameId,
} from "./games/fantage.ts";

export * from "./types/world.ts";

export const SAVE_KEY = "club-lion-player-v1";
export type LionColor = "gold" | "sand" | "copper" | "rose";
export type PlaceId =
  | "square"
  | "water"
  | "cafe"
  | "arcade"
  | "den"
  | "downtown-plaza"
  | "wonder-park-entrance"
  | "wonder-park-midway"
  | "club-pulse"
  | "splash-oasis-entry"
  | "splash-oasis-river"
  | "penthouse-condo"
  | "secret-scout-base"
  | "sunset-beach"
  | "coastal-pier"
  | "mt-mist"
  | "canyon-rapids"
  | "pet-paradise"
  | "lion-speedway"
  | "lion-aquarium"
  | "snowflake-rink"
  | "kainan"
  | "dino-dig";
export type AdventureId = "neighbors" | "game" | "home";
export type PlayerBase = {
  name: string;
  color: LionColor;
  accessory: string;
  owned: string[];
  met: string[];
  visited: PlaceId[];
  gamesPlayed: number;
  beeStopBest: number;
  pawStepsBest: number;
  fruitCatchBest: number;
  sledRunBest: number;
  claimed: AdventureId[];
  decor: string[];
  mangoRunBest?: number;
  djBeatDropBest?: number;
  smoothiesServed?: number;
  cakesServed?: number;
  /** Halo-halo cups served at Lola's Kainan. */
  haloHaloServed?: number;
  /** Most fireflies caught in one Pop the Fireflies round. */
  fireflyBest?: number;
  /** Most first-try finds in one Peekaboo Animals game (out of 8). */
  peekabooBest?: number;
  /** Best score in each Game Hall mini-game. */
  fantageBest?: Partial<Record<FantageGameId, number>>;
  /** Pet fashion shows finished in Dress-the-Pet. */
  petShows?: number;
  /** Best Pet Round-Up score: pets penned, plus seconds left if all got in. */
  petRoundUpBest?: number;
  /** Photos of the newest served cakes, oldest first. */
  bakeryCakes?: Cake[];
  /** Today's Savanna Square butterfly hunt: spots found on `day` (local YYYY-MM-DD). */
  squareButterflies?: { day: string; found: number[] };
  /** Pin of the Day ids collected, one per day, oldest first. */
  pins?: string[];
  seekRounds?: number;
  /** Fastest hard Hide & Seek Safari round in milliseconds. */
  seekBestMs?: number;
  stamps?: string[];
  /** Gold from games and stamps; missing means the starting amount. */
  gold?: number;
  fishCaughtCount?: number;
  largestFishWeight?: number;
  fashionBestScore?: number;
  fashionShowsCompleted?: number;
  condoLayout?: string;
  spyRank?: number;
  spyPuzzlesSolved?: number;
  spyBadges?: string[];
  friends?: string[];
  incomingFriendRequests?: string[];
  outgoingFriendRequests?: string[];
  recentVisitors?: string[];
  riverSurfBest?: number;
  petCare?: PetCareState;
  kartRacesFinished?: number;
  kartBestLapMs?: number;
  kartColor?: KartColorId;
  kartMode?: KartMode;
  bubblePopBest?: number;
  coloringBook?: ColoringBookSave;
  /** Animal Orchestra songs that have paid out. */
  animalBandSongs?: number;
  /** Shape Sorter rounds finished. */
  shapeSorterRounds?: number;
  /** Picture Puzzle pictures finished. */
  picturePuzzles?: number;
  /** Balloon Parade rainbow arches finished. */
  balloonRainbows?: number;
  /** Carried room props left away from home, keyed `${roomId}:${propId}` (stage px). */
  propSpots?: Record<string, { x: number; y: number }>;
};

export type Player = PlayerBase & {
  version: 1;
  look?: AvatarLook;
  pet?: PetState;
};

export const PAW_STEPS_MAX_ROUNDS = 999;

export const SHOP_ITEMS = [
  {
    id: "scarf",
    name: "Forest scarf",
    kind: "accessory",
    description: "A little cozy, a little adventurous.",
  },
  {
    id: "glasses",
    name: "Sunshine shades",
    kind: "accessory",
    description: "For the coolest cat in the savanna.",
  },
  {
    id: "hat",
    name: "Explorer hat",
    kind: "accessory",
    description: "Every adventure starts with a good hat.",
  },
  {
    id: "flower",
    name: "Daisy crown",
    kind: "accessory",
    description: "Bring a little spring wherever you go.",
  },
  {
    id: "plant",
    name: "Happy houseplant",
    kind: "decor",
    description: "A leafy new friend for your den.",
  },
  {
    id: "cushion",
    name: "Sunny cushion",
    kind: "decor",
    description: "The perfect spot for an afternoon nap.",
  },
] as const;

export const PLACES: {
  id: PlaceId;
  name: string;
  subtitle: string;
  imageClass: string;
}[] = [
  {
    id: "square",
    name: "Savanna Square",
    subtitle: "The heart of the neighborhood",
    imageClass: "scene-square",
  },
  {
    id: "water",
    name: "The watering hole",
    subtitle: "A little splash of sunshine",
    imageClass: "scene-water",
  },
  {
    id: "cafe",
    name: "Canopy café",
    subtitle: "Good sips. Great company.",
    imageClass: "scene-cafe",
  },
  {
    id: "arcade",
    name: "The arcade",
    subtitle: "Little games, big adventures",
    imageClass: "scene-arcade",
  },
  {
    id: "den",
    name: "Your cozy den",
    subtitle: "Make yourself right at home",
    imageClass: "scene-den",
  },
  {
    id: "downtown-plaza",
    name: "Downtown Plaza",
    subtitle: "Fountains, fashion & café days",
    imageClass: "scene-downtown",
  },
  {
    id: "wonder-park-entrance",
    name: "Wonder Park Entrance",
    subtitle: "A sky full of adventure",
    imageClass: "scene-park",
  },
  {
    id: "wonder-park-midway",
    name: "Carnival Midway",
    subtitle: "Round and round we roar",
    imageClass: "scene-midway",
  },
  {
    id: "club-pulse",
    name: "Club Pulse",
    subtitle: "Follow your paws to the beat",
    imageClass: "scene-pulse",
  },
  {
    id: "splash-oasis-entry",
    name: "Splash Oasis",
    subtitle: "Tsunami waves & tipping buckets",
    imageClass: "scene-oasis",
  },
  {
    id: "splash-oasis-river",
    name: "Lazy River Oasis",
    subtitle: "Drift with your pride",
    imageClass: "scene-river",
  },
  {
    id: "penthouse-condo",
    name: "Luxury Penthouse Condo",
    subtitle: "Custom isometric den with skyline views",
    imageClass: "scene-condo",
  },
  {
    id: "mt-mist",
    name: "Mt. Mist Alpine Basecamp",
    subtitle: "Snowy peaks & downhill sled stunts",
    imageClass: "scene-mtmist",
  },
  {
    id: "secret-scout-base",
    name: "The Pride HQ - Secret Scout Command Center",
    subtitle: "Shh… classified savanna business",
    imageClass: "scene-scout-base",
  },
  {
    id: "sunset-beach",
    name: "Sunset Beach",
    subtitle: "Golden dunes & ocean sunsets",
    imageClass: "scene-beach",
  },
  {
    id: "coastal-pier",
    name: "Coastal Pier & Boardwalk",
    subtitle: "Follow the lighthouse across the bay",
    imageClass: "scene-pier",
  },
  {
    id: "canyon-rapids",
    name: "Canyon Rapids",
    subtitle: "Red rock walls & whitewater thrills",
    imageClass: "scene-canyon",
  },
  {
    id: "pet-paradise",
    name: "Pet Paradise Nursery",
    subtitle: "Pamper your pride with care",
    imageClass: "scene-petparadise",
  },
  {
    id: "lion-speedway",
    name: "Lion Speedway",
    subtitle: "Start your engines & race the pride",
    imageClass: "scene-speedway",
  },
  {
    id: "lion-aquarium",
    name: "Lion Aquarium",
    subtitle: "Glass tunnel, big fish & a touch pool",
    imageClass: "scene-aquarium",
  },
  {
    id: "snowflake-rink",
    name: "Snowflake Rink",
    subtitle: "Skate under the Christmas lights",
    imageClass: "scene-rink",
  },
  {
    id: "kainan",
    name: "Lola's Kainan",
    subtitle: "Filipino home cooking",
    imageClass: "scene-kainan",
  },
  {
    id: "dino-dig",
    name: "Dino Dig",
    subtitle: "Dig up fossils & hatch an egg",
    imageClass: "scene-dinodig",
  },
];

export const NEIGHBORS = [
  {
    id: "milo",
    name: "Milo",
    color: "gold" as const,
    accessory: "hat",
    x: 24,
    y: 61,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "bronze",
      hairId: "pixie_spikes",
      hairColor: "#3a2418",
      dressId: "boombox_set",
      shoeKitId: "shoe_040",
    },
    greeting: "Hey, neighbor! The café makes the best mango smoothies. ☀️",
  },
  {
    id: "cleo",
    name: "Cleo",
    color: "rose" as const,
    accessory: "flower",
    x: 75,
    y: 59,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "fair",
      hairKitId: "kit_26",
      dressId: "peach_ruffle",
      shoeKitId: "shoe_010",
    },
    greeting: "Welcome to the pride! Your mane looks absolutely lovely. 🌼",
  },
  {
    id: "pip",
    name: "Pip",
    color: "sand" as const,
    accessory: "glasses",
    x: 67,
    y: 83,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "almond",
      hairKitId: "kit_16",
      dressId: "super_tee",
      shoeKitId: "shoe_029",
    },
    greeting: "Psst… try the arcade! There are fun games to play. 🎮",
  },
  {
    id: "lola",
    name: "Lola",
    color: "copper" as const,
    accessory: "flower",
    x: 20,
    y: 85,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "honey",
      hairId: "messy_bun",
      hairColor: "#c9c9d2",
      dressId: "island_maxi",
      shoeKitId: "shoe_005",
    },
    greeting: "Kain tayo! Let's eat! Try my halo-halo. 🍧",
  },
  {
    id: "zara",
    name: "Zara",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "bronze",
      hairKitId: "kit_35",
      dressId: "forest_plaid_set",
      shoeKitId: "shoe_050",
    },
    greeting: "Hold on to your hat on the river! Wheee! 🌊",
  },
  {
    id: "kai",
    name: "Kai",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "tan",
      hairId: "pixie_spikes",
      hairColor: "#1f1a18",
      dressId: "arcade_stripes",
      shoeKitId: "shoe_031",
    },
    greeting: "I won a giant prize! Try the Bullseye booth! 🎯",
  },
  {
    id: "nia",
    name: "Nia",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "caramel",
      hairKitId: "kit_44",
      dressId: "starry_night_dress",
      shoeKitId: "shoe_012",
    },
    greeting: "Dance with me! The beat is amazing tonight! 🎶",
  },
  {
    id: "theo",
    name: "Theo",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "fair",
      hairId: "pixie_spikes",
      hairColor: "#d8a040",
      dressId: "sunset_vest",
      shoeKitId: "shoe_088",
    },
    greeting: "Want to build a sandcastle together? 🏰",
  },
  {
    id: "luna",
    name: "Luna",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "porcelain",
      hairKitId: "kit_56",
      dressId: "frost_snow_dress",
      shoeKitId: "shoe_018",
    },
    greeting: "Let's skate! I can spin like a snowflake! ❄️",
  },
  {
    id: "ava",
    name: "Ava",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "almond",
      hairKitId: "kit_33",
      dressId: "lagoon_gown",
      shoeKitId: "shoe_027",
    },
    greeting: "Did you see the whale? It waved at me! 🐳",
  },
  {
    id: "rio",
    name: "Rio",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "honey",
      hairKitId: "kit_77",
      dressId: "aqua_ruffle_tank",
      shoeKitId: "shoe_066",
    },
    greeting: "The big slide is SO fast! Come on! 💦",
  },
  {
    id: "mei",
    name: "Mei",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "ivory",
      hairKitId: "kit_60",
      dressId: "cozy_cream_sweater",
      shoeKitId: "shoe_003",
    },
    greeting: "Hot cocoa by the campfire? Yes please! ☕",
  },
  {
    id: "sol",
    name: "Sol",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "warm",
      hairKitId: "kit_46",
      dressId: "leafy_tank",
      shoeKitId: "shoe_105",
    },
    greeting: "Every pet here loves a belly rub! 🐾",
  },
  {
    id: "ivy",
    name: "Ivy",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "olive",
      hairKitId: "kit_11",
      dressId: "sailor_tutu",
      shoeKitId: "shoe_141",
    },
    greeting: "Ring the lighthouse bell with me! 🔔",
  },
  {
    id: "jay",
    name: "Jay",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "bronze",
      hairId: "pixie_spikes",
      hairColor: "#141414",
      dressId: "school_blazer",
      shoeKitId: "shoe_009",
    },
    greeting: "Psst! The spy terminal has a secret code. 🕵️",
  },
  {
    id: "bea",
    name: "Bea",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "peach",
      hairKitId: "kit_62",
      dressId: "lagoon_bikini",
      shoeKitId: "shoe_120",
    },
    greeting: "Grab a tube and float with me! 🛟",
  },
  {
    id: "max",
    name: "Max",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "tan",
      hairId: "pixie_spikes",
      hairColor: "#8a4a1a",
      dressId: "red_rebel_set",
      shoeKitId: "shoe_044",
    },
    greeting: "Vroom! Want to race me in Go Cart? 🏎️",
  },
  {
    id: "ruby",
    name: "Ruby",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "almond",
      hairKitId: "kit_70",
      dressId: "ruby_gala_gown",
      shoeKitId: "shoe_015",
    },
    greeting: "I love the view from up here! 🌃",
  },
  {
    id: "finn",
    name: "Finn",
    color: "gold" as const,
    accessory: "none",
    x: 50,
    y: 60,
    look: {
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "fair",
      hairId: "pixie_spikes",
      hairColor: "#e8c060",
      dressId: "island_maxi",
      shoeKitId: "shoe_076",
    },
    greeting: "The frogs here can sing! Listen! 🐸",
  },
];

export function newPlayer(): Player {
  return {
    version: 1,
    name: "Sunny",
    color: "gold",
    accessory: "scarf",
    owned: ["scarf"],
    met: [],
    visited: ["square"],
    gamesPlayed: 0,
    beeStopBest: 0,
    pawStepsBest: 0,
    fruitCatchBest: 0,
    sledRunBest: 0,
    claimed: [],
    decor: [],
    stamps: [],
    friends: [],
    incomingFriendRequests: [],
    outgoingFriendRequests: [],
    recentVisitors: [],
  };
}

/**
 * Best Bee Stop score. Saves written before the field existed restore as 0
 * instead of failing validation, which would throw away the whole adventure.
 */
function restoreBeeStopBest(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) return 0;
  return Math.min(value as number, BEE_STOP_MAX_SCORE);
}

function restoredRounds(value: unknown): number | null {
  if (value === undefined) return 0;
  return Number.isSafeInteger(value) &&
    (value as number) >= 0 &&
    (value as number) <= PAW_STEPS_MAX_ROUNDS
    ? (value as number)
    : null;
}

/** Saved pets keep their fields; a missing or unknown species becomes a lion cub. */
function restorePetState(value: unknown): PetState {
  const saved = value && typeof value === "object" ? value : {};
  const species = "species" in saved ? saved.species : undefined;
  return {
    ...DEFAULT_PET_STATE,
    ...saved,
    species: restorePetSpecies(species),
  };
}

function restorePetCare(value: unknown): PetCareState {
  const saved =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const stat = (key: "happiness" | "cleanliness" | "energy" | "hunger") => {
    const value = saved[key];
    return typeof value === "number" && Number.isFinite(value)
      ? Math.max(0, Math.min(100, value))
      : DEFAULT_PET_CARE_STATE[key];
  };
  return {
    happiness: stat("happiness"),
    cleanliness: stat("cleanliness"),
    energy: stat("energy"),
    hunger: stat("hunger"),
    lastCareTimestamp:
      Number.isSafeInteger(saved.lastCareTimestamp) &&
      (saved.lastCareTimestamp as number) >= 0
        ? (saved.lastCareTimestamp as number)
        : 0,
  };
}

/** Lap times outside this window cannot come from a real race. */
const KART_MIN_LAP_MS = 1000;
const KART_MAX_LAP_MS = 10 * 60 * 1000;
function isKartLapMs(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= KART_MIN_LAP_MS &&
    value <= KART_MAX_LAP_MS
  );
}

function isButterflyHunt(
  value: unknown,
): value is { day: string; found: number[] } {
  if (typeof value !== "object" || value === null) return false;
  const day: unknown = Reflect.get(value, "day");
  const found: unknown = Reflect.get(value, "found");
  return (
    typeof day === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Array.isArray(found) &&
    found.length <= BUTTERFLY_COUNT &&
    new Set(found).size === found.length &&
    found.every(
      (spot) =>
        Number.isSafeInteger(spot) &&
        spot >= 0 &&
        spot < BUTTERFLY_SPOTS.length,
    )
  );
}

export function restorePlayer(raw: string | null): Player {
  if (!raw) return newPlayer();
  try {
    const p = JSON.parse(raw);
    if (
      p.version !== 1 ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      !Array.isArray(p.owned) ||
      !Array.isArray(p.visited) ||
      !Array.isArray(p.met) ||
      !Array.isArray(p.claimed) ||
      !Array.isArray(p.decor) ||
      !Number.isSafeInteger(p.gamesPlayed) ||
      p.gamesPlayed < 0
    )
      return newPlayer();
    const pawStepsBest = restoredRounds(p.pawStepsBest);
    if (pawStepsBest === null) return newPlayer();
    const owned = [
      ...new Set<string>(
        p.owned.filter(
          (id: unknown) =>
            SHOP_ITEMS.some((item) => item.id === id) ||
            CATALOG_ITEMS.some((item) => item.id === id) ||
            isPixelOwnedId(id),
        ),
      ),
    ];
    const social = sanitizeSocialGraph({
      friends: p.friends,
      pendingIncoming: p.incomingFriendRequests,
      pendingOutgoing: p.outgoingFriendRequests,
      recentVisitors: p.recentVisitors,
    });
    return {
      friends: social.friends,
      incomingFriendRequests: social.pendingIncoming,
      outgoingFriendRequests: social.pendingOutgoing,
      recentVisitors: social.recentVisitors,
      version: 1,
      name: p.name.trim().slice(0, 16),
      color: ["gold", "sand", "copper", "rose"].includes(p.color)
        ? p.color
        : "gold",
      accessory:
        p.accessory === "none" || owned.includes(p.accessory)
          ? p.accessory
          : "none",
      owned,
      met: [
        ...new Set<string>(
          p.met.filter((id: unknown) =>
            NEIGHBORS.some((lion) => lion.id === id),
          ),
        ),
      ],
      visited: [
        ...new Set<PlaceId>(
          p.visited.filter((id: unknown) =>
            PLACES.some((place) => place.id === id),
          ),
        ),
      ],
      stamps: Array.isArray(p.stamps)
        ? [
            ...new Set<string>(
              p.stamps.filter(
                (id: unknown) =>
                  typeof id === "string" &&
                  STAMP_DEFINITIONS.some((stamp) => stamp.id === id),
              ),
            ),
          ]
        : [],
      ...(p.petCare === undefined
        ? {}
        : { petCare: restorePetCare(p.petCare) }),
      gamesPlayed: p.gamesPlayed,
      beeStopBest: restoreBeeStopBest(p.beeStopBest),
      pawStepsBest,
      sledRunBest:
        Number.isSafeInteger(p.sledRunBest) &&
        p.sledRunBest >= 0 &&
        p.sledRunBest <= SLED_MAX_PAYOUT
          ? p.sledRunBest
          : 0,
      fruitCatchBest:
        Number.isSafeInteger(p.fruitCatchBest) && p.fruitCatchBest >= 0
          ? p.fruitCatchBest
          : 0,
      claimed: [
        ...new Set<AdventureId>(
          p.claimed.filter((id: unknown) =>
            ["neighbors", "game", "home"].includes(String(id)),
          ),
        ),
      ],
      decor: [
        ...new Set<string>(
          p.decor.filter(
            (id: unknown) =>
              owned.includes(String(id)) &&
              SHOP_ITEMS.some(
                (item) => item.id === id && item.kind === "decor",
              ),
          ),
        ),
      ],
      ...(Number.isSafeInteger(p.kartRacesFinished) && p.kartRacesFinished > 0
        ? { kartRacesFinished: p.kartRacesFinished }
        : {}),
      ...(Number.isSafeInteger(p.riverSurfBest) && p.riverSurfBest >= 0
        ? { riverSurfBest: p.riverSurfBest }
        : {}),
      ...(isKartColorId(p.kartColor) ? { kartColor: p.kartColor } : {}),
      ...(isKartMode(p.kartMode) ? { kartMode: p.kartMode } : {}),
      ...(isKartLapMs(p.kartBestLapMs)
        ? { kartBestLapMs: p.kartBestLapMs }
        : {}),
      ...(Number.isSafeInteger(p.bubblePopBest) &&
      p.bubblePopBest > 0 &&
      p.bubblePopBest <= BUBBLE_POP_MAX_SCORE
        ? { bubblePopBest: p.bubblePopBest }
        : {}),
      ...(() => {
        const coloringBook = restoreColoringBook(p.coloringBook);
        return coloringBook ? { coloringBook } : {};
      })(),
      ...(Number.isSafeInteger(p.animalBandSongs) && p.animalBandSongs >= 0
        ? { animalBandSongs: p.animalBandSongs }
        : {}),
      ...(Number.isSafeInteger(p.shapeSorterRounds) && p.shapeSorterRounds >= 0
        ? { shapeSorterRounds: p.shapeSorterRounds }
        : {}),
      ...(Number.isSafeInteger(p.picturePuzzles) && p.picturePuzzles >= 0
        ? { picturePuzzles: p.picturePuzzles }
        : {}),
      ...(Number.isSafeInteger(p.balloonRainbows) && p.balloonRainbows >= 0
        ? { balloonRainbows: p.balloonRainbows }
        : {}),
      ...(p.mangoRunBest === undefined
        ? {}
        : Number.isSafeInteger(p.mangoRunBest) && p.mangoRunBest >= 0
          ? { mangoRunBest: p.mangoRunBest as number }
          : {}),
      ...(p.djBeatDropBest === undefined
        ? {}
        : Number.isSafeInteger(p.djBeatDropBest) &&
            p.djBeatDropBest >= 0 &&
            p.djBeatDropBest <= DJ_MAX_SCORE
          ? { djBeatDropBest: p.djBeatDropBest as number }
          : {}),
      ...(p.smoothiesServed === undefined
        ? {}
        : Number.isSafeInteger(p.smoothiesServed) && p.smoothiesServed >= 0
          ? { smoothiesServed: p.smoothiesServed as number }
          : {}),
      ...(p.cakesServed === undefined
        ? {}
        : Number.isSafeInteger(p.cakesServed) && p.cakesServed >= 0
          ? { cakesServed: p.cakesServed }
          : {}),
      ...(Number.isSafeInteger(p.haloHaloServed) && p.haloHaloServed >= 0
        ? { haloHaloServed: p.haloHaloServed }
        : {}),
      ...(Number.isSafeInteger(p.fireflyBest) &&
      p.fireflyBest >= 0 &&
      p.fireflyBest <= FIREFLY_MAX_SCORE
        ? { fireflyBest: p.fireflyBest }
        : {}),
      ...(Number.isSafeInteger(p.peekabooBest) &&
      p.peekabooBest >= 0 &&
      p.peekabooBest <= PEEKABOO_ROUNDS
        ? { peekabooBest: p.peekabooBest }
        : {}),
      ...(restoreGold(p.gold) === undefined
        ? {}
        : { gold: restoreGold(p.gold) }),
      ...(p.fantageBest === undefined
        ? {}
        : { fantageBest: restoreFantageBest(p.fantageBest) }),
      ...(Number.isSafeInteger(p.petShows) && p.petShows >= 0
        ? { petShows: p.petShows }
        : {}),
      ...(Number.isSafeInteger(p.petRoundUpBest) &&
      p.petRoundUpBest >= 0 &&
      p.petRoundUpBest <= ROUNDUP_MAX_SCORE
        ? { petRoundUpBest: p.petRoundUpBest }
        : {}),
      ...(p.bakeryCakes === undefined
        ? {}
        : { bakeryCakes: restoreCakePhotos(p.bakeryCakes) }),
      ...(p.propSpots === undefined
        ? {}
        : { propSpots: restorePropSpots(p.propSpots) }),
      ...(Array.isArray(p.pins)
        ? { pins: [...new Set<string>(p.pins.filter(isPinId))] }
        : {}),
      ...(isButterflyHunt(p.squareButterflies)
        ? {
            squareButterflies: {
              day: p.squareButterflies.day,
              found: [...p.squareButterflies.found],
            },
          }
        : {}),
      ...(p.seekRounds === undefined
        ? {}
        : Number.isSafeInteger(p.seekRounds) && p.seekRounds >= 0
          ? { seekRounds: p.seekRounds }
          : {}),
      ...(p.seekBestMs === undefined
        ? {}
        : Number.isSafeInteger(p.seekBestMs) &&
            p.seekBestMs > 0 &&
            p.seekBestMs <= SEEK_MAX_TIME_MS
          ? { seekBestMs: p.seekBestMs }
          : {}),
      ...(p.fishCaughtCount === undefined
        ? {}
        : Number.isSafeInteger(p.fishCaughtCount) && p.fishCaughtCount >= 0
          ? { fishCaughtCount: p.fishCaughtCount as number }
          : {}),
      ...(p.largestFishWeight === undefined
        ? {}
        : typeof p.largestFishWeight === "number" &&
            Number.isFinite(p.largestFishWeight) &&
            p.largestFishWeight >= 0
          ? { largestFishWeight: p.largestFishWeight as number }
          : {}),
      ...(p.fashionBestScore === undefined
        ? {}
        : Number.isSafeInteger(p.fashionBestScore) && p.fashionBestScore >= 0
          ? { fashionBestScore: p.fashionBestScore as number }
          : {}),
      ...(p.fashionShowsCompleted === undefined
        ? {}
        : Number.isSafeInteger(p.fashionShowsCompleted) &&
            p.fashionShowsCompleted >= 0
          ? { fashionShowsCompleted: p.fashionShowsCompleted as number }
          : {}),
      ...(() => {
        const layout =
          typeof p.condoLayout === "string"
            ? deserializeLayout(p.condoLayout)
            : [];
        return layout.length > 0
          ? { condoLayout: serializeLayout(layout) }
          : {};
      })(),
      ...(p.spyPuzzlesSolved === undefined &&
      p.spyRank === undefined &&
      p.spyBadges === undefined
        ? {}
        : {
            spyPuzzlesSolved:
              Number.isSafeInteger(p.spyPuzzlesSolved) &&
              p.spyPuzzlesSolved >= 0
                ? (p.spyPuzzlesSolved as number)
                : 0,
            spyRank:
              Number.isSafeInteger(p.spyRank) &&
              SPY_RANKS.some((r) => r.rank === p.spyRank)
                ? (p.spyRank as number)
                : 0,
            spyBadges: Array.isArray(p.spyBadges)
              ? [
                  ...new Set<string>(
                    p.spyBadges.filter(
                      (badge: unknown) =>
                        typeof badge === "string" &&
                        SPY_RANKS.some((r) => r.badge === badge),
                    ),
                  ),
                ]
              : [],
          }),
    };
  } catch {
    return newPlayer();
  }
}

export type PlayerV2 = PlayerBase & {
  version: 2;
  look: AvatarLook;
  pet: PetState;
  petCare: PetCareState;
  starRank: number;
  moodQuote: string;
};

export type PlayerSave = Player | PlayerV2;

const DEFAULT_MOOD_QUOTE = "Vibing in the savanna";

function calculateStarRank(gamesPlayed: number): number {
  return 1 + Math.floor(gamesPlayed / 5);
}

function isPlayerV2(
  value: unknown,
): value is Omit<PlayerV2, "petCare"> & { petCare?: unknown } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.version === 2 &&
    Number.isSafeInteger(candidate.starRank) &&
    typeof candidate.moodQuote === "string" &&
    validateAvatarLook(candidate.look) &&
    !!candidate.pet &&
    typeof candidate.pet === "object"
  );
}

export function migratePlayerSave(save: unknown): PlayerV2 {
  if (typeof save === "string") {
    try {
      return migratePlayerSave(JSON.parse(save));
    } catch {
      return migratePlayerSave(null);
    }
  }
  if (isPlayerV2(save)) {
    const v1 = restorePlayer(JSON.stringify({ ...save, version: 1 }));
    return {
      ...v1,
      version: 2,
      look: save.look,
      pet: restorePetState(save.pet),
      petCare: restorePetCare(save.petCare),
      starRank: save.starRank,
      moodQuote: save.moodQuote,
    };
  }
  const v1Save = save;
  const v1 = restorePlayer(
    typeof v1Save === "string" ? v1Save : JSON.stringify(v1Save ?? null),
  );
  const raw =
    v1Save && typeof v1Save === "object"
      ? (v1Save as Record<string, unknown>)
      : {};
  // A fresh copy: callers may edit the look, never the shared starter.
  const look = validateAvatarLook(raw.look)
    ? (raw.look as AvatarLook)
    : { ...STARTER_AVATAR_LOOK };
  const pet = restorePetState(raw.pet);
  const petCare = restorePetCare(v1.petCare);
  const moodQuote =
    typeof raw.moodQuote === "string" && raw.moodQuote.trim()
      ? raw.moodQuote.trim().slice(0, 60)
      : DEFAULT_MOOD_QUOTE;
  const { version: _version, ...rest } = v1;
  return {
    ...rest,
    version: 2,
    look,
    pet,
    petCare,
    starRank: calculateStarRank(v1.gamesPlayed),
    moodQuote,
  };
}

export function buyItem<T extends PlayerBase>(player: T, id: string): T {
  const item = SHOP_ITEMS.find((item) => item.id === id);
  if (!item || player.owned.includes(id)) return player;
  return {
    ...player,
    owned: [...player.owned, id],
    ...(item.kind === "accessory"
      ? { accessory: id }
      : { decor: [...player.decor, id] }),
  } as T;
}

export function visitPlace<T extends PlayerBase>(player: T, id: PlaceId): T {
  return player.visited.includes(id)
    ? player
    : ({ ...player, visited: [...player.visited, id] } as T);
}

export function meetLion<T extends PlayerBase>(player: T, id: string): T {
  return player.met.includes(id) || !NEIGHBORS.some((lion) => lion.id === id)
    ? player
    : ({ ...player, met: [...player.met, id] } as T);
}

export function isAdventureComplete(
  player: PlayerBase,
  id: AdventureId,
): boolean {
  return id === "neighbors"
    ? player.met.length >= 3
    : id === "game"
      ? player.gamesPlayed >= 1
      : player.visited.includes("den");
}

export function claimReward<T extends PlayerBase>(
  player: T,
  id: AdventureId,
): T {
  return player.claimed.includes(id) || !isAdventureComplete(player, id)
    ? player
    : ({
        ...player,
        claimed: [...player.claimed, id],
      } as T);
}

export function completeGame<T extends PlayerBase>(
  player: T,
  pairs: number,
): T {
  if (
    !Number.isSafeInteger(pairs) ||
    pairs < 0 ||
    pairs > 6 ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const completed = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
  } as T;
  return pairs === 6
    ? unlockStamp(completed, "memory_safari_master")
    : completed;
}

export function completeMangoRun<T extends PlayerBase>(
  player: T,
  score: number,
): T {
  if (
    !Number.isSafeInteger(score) ||
    score < 0 ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    mangoRunBest: Math.max(player.mangoRunBest ?? 0, score),
  } as T;
}

export function completeBeeStop<T extends PlayerBase>(
  player: T,
  score: number,
): T {
  if (
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > BEE_STOP_MAX_SCORE ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    beeStopBest: Math.max(player.beeStopBest, score),
  } as T;
}

export function completePawSteps<T extends PlayerBase>(
  player: T,
  rounds: number,
): T {
  if (
    !Number.isSafeInteger(rounds) ||
    rounds < 0 ||
    rounds > PAW_STEPS_MAX_ROUNDS ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    pawStepsBest: Math.max(player.pawStepsBest, rounds),
  } as T;
}

export function unlockSecretCatalogItem<T extends PlayerBase>(
  player: T,
  secretId: string,
): T {
  const item = CATALOG_ITEMS.find(
    (item) =>
      item.isSecret &&
      (item.id === secretId || item.secretTriggerId === secretId),
  );
  if (!item || player.owned.includes(item.id)) return player;
  return { ...player, owned: [...player.owned, item.id] } as T;
}

/** Collects a non-secret Le Shop catalog item once. */
export function buyCatalogItem<T extends PlayerBase>(player: T, id: string): T {
  const item = CATALOG_ITEMS.find((item) => item.id === id && !item.isSecret);
  if (!item || player.owned.includes(id)) return player;
  return { ...player, owned: [...player.owned, id] } as T;
}

const LOOK_FIELD_FOR_SLOT: Partial<Record<EquipSlot, keyof AvatarLook>> = {
  hair_back: "hairId",
  hair_front: "hairId",
  headwear: "headwearId",
  eyewear: "eyewearId",
  top_inner: "topId",
  top_outer: "topId",
  bottom: "bottomId",
  shoes: "shoesId",
  handheld: "handheldId",
  board: "boardId",
};

/** Puts an owned catalog item on the avatar in the field matching its slot. */
export function equipCatalogItem<T extends PlayerBase & { look?: AvatarLook }>(
  player: T,
  id: string,
): T {
  const item = CATALOG_ITEMS.find((item) => item.id === id);
  const field = item && LOOK_FIELD_FOR_SLOT[item.slot];
  if (!item || !field || !player.owned.includes(id)) return player;
  const look = player.look ?? DEFAULT_AVATAR_LOOK;
  return { ...player, look: { ...look, [field]: id } } as T;
}

/** Saves a salon makeover. Invalid looks leave the player unchanged. */
export function applySalonLook<T extends PlayerBase>(
  player: T,
  look: AvatarLook,
): T {
  if (!validateAvatarLook(look)) return player;
  const worn = (player as { look?: AvatarLook }).look;
  if (
    look.hairKitId &&
    look.hairKitId !== worn?.hairKitId &&
    !ownsPixel(player, "hair", look.hairKitId)
  )
    return player;
  return { ...player, look } as T;
}

/** Whether a clothing piece is in the closet: free basics or owned shop items. */
export function canWearClothing(
  player: PlayerBase,
  option: ClothingOption,
): boolean {
  return option.free === true || player.owned.includes(option.id);
}

/**
 * Dresses the avatar from the closet. Each piece must be free, owned, or
 * already worn; otherwise the player is returned unchanged.
 */
export function dressAvatar<T extends PlayerBase & { look?: AvatarLook }>(
  player: T,
  outfit: {
    topId: string;
    bottomId: string;
    shoesId: string;
    dressId?: string;
    shoeKitId?: string;
    costumeId?: string;
  },
): T {
  const look = player.look ?? DEFAULT_AVATAR_LOOK;
  if (outfit.dressId !== undefined && !Object.hasOwn(OUTFITS, outfit.dressId))
    return player;
  if (
    outfit.shoeKitId !== undefined &&
    !SHOE_KIT.some((entry) => entry.id === outfit.shoeKitId)
  )
    return player;
  if (
    outfit.costumeId !== undefined &&
    !COSTUMES.some((entry) => entry.id === outfit.costumeId)
  )
    return player;
  const allowed = (
    options: readonly ClothingOption[],
    id: string,
    worn: string,
  ) => {
    const option = findOption(options, id);
    return !!option && (id === worn || canWearClothing(player, option));
  };
  if (
    !allowed(TOPS, outfit.topId, resolveTopId(look)) ||
    !allowed(BOTTOMS, outfit.bottomId, resolveBottomId(look)) ||
    !allowed(SHOES, outfit.shoesId, resolveShoeId(look))
  )
    return player;
  // Pixel pieces must be free, bought, or already worn.
  const allowedPixel = (
    kind: PixelKind,
    id: string | undefined,
    worn: string | undefined,
  ) => id === undefined || id === worn || ownsPixel(player, kind, id);
  if (
    !allowedPixel("dress", outfit.dressId, look.dressId) ||
    !allowedPixel("shoe", outfit.shoeKitId, look.shoeKitId) ||
    !allowedPixel("costume", outfit.costumeId, look.costumeId)
  )
    return player;
  return {
    ...player,
    look: {
      ...look,
      topId: outfit.topId,
      bottomId: outfit.bottomId,
      shoesId: outfit.shoesId,
      dressId: outfit.dressId,
      shoeKitId: outfit.shoeKitId,
      costumeId: outfit.costumeId,
    },
  } as T;
}

export function completeFruitCatch<T extends PlayerBase>(
  player: T,
  caught: number,
  hits: number,
  score: number,
): T {
  if (
    !Number.isSafeInteger(caught) ||
    caught < 0 ||
    !Number.isSafeInteger(hits) ||
    hits < 0 ||
    !Number.isSafeInteger(score) ||
    score !== caught * 10 ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const newGamesPlayed = player.gamesPlayed + 1;
  const newBest = Math.max(player.fruitCatchBest, score);
  return {
    ...player,
    gamesPlayed: newGamesPlayed,
    fruitCatchBest: newBest,
  } as T;
}

/** Counts a finished Bubble Pop challenge once and keeps the best score. */
export function completeBubblePop<T extends PlayerBase>(
  player: T,
  score: number,
): T {
  if (!Number.isSafeInteger(score) || score < 0 || score > BUBBLE_POP_MAX_SCORE)
    return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    bubblePopBest: Math.max(player.bubblePopBest ?? 0, score),
  };
}

/** Counts a recorded Animal Orchestra song once; the first song earns a stamp. */
export function completeAnimalBand<T extends PlayerBase>(
  player: T,
  taps: number,
): T {
  const songs = player.animalBandSongs ?? 0;
  if (
    !Number.isSafeInteger(taps) ||
    taps < 1 ||
    taps > SONG_MAX_TAPS ||
    !Number.isSafeInteger(songs + 1)
  )
    return player;
  return unlockStamp(
    {
      ...player,
      gamesPlayed: player.gamesPlayed + 1,
      animalBandSongs: songs + 1,
    },
    "animal_band_maestro",
  );
}

/** Counts a finished Shape Sorter round once; the last round also earns its stamp. */
export function completeShapeSorterRound<T extends PlayerBase>(
  player: T,
  round: number,
): T {
  if (
    !Number.isSafeInteger(round) ||
    round < 1 ||
    round > SHAPE_SORTER_ROUNDS ||
    round <= (player.shapeSorterRounds ?? 0)
  )
    return player;
  const paid = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    shapeSorterRounds: round,
  };
  return round === SHAPE_SORTER_ROUNDS
    ? unlockStamp(paid, "shape_sorter_star")
    : paid;
}

/** Counts a finished Picture Puzzle once; the nine-piece picture also earns its stamp. */
export function completePicturePuzzle<T extends PlayerBase>(
  player: T,
  pieces: number,
): T {
  const finished = player.picturePuzzles ?? 0;
  if (!isPieceCount(pieces) || !Number.isSafeInteger(finished + 1))
    return player;
  const paid = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    picturePuzzles: finished + 1,
  };
  return pieces === 9 ? unlockStamp(paid, "picture_puzzle_star") : paid;
}

/** Counts a finished rainbow arch once; the first arch also earns its stamp. */
export function completeBalloonRainbow<T extends PlayerBase>(player: T): T {
  const rainbows = player.balloonRainbows ?? 0;
  if (!Number.isSafeInteger(rainbows + 1)) return player;
  return unlockStamp(
    {
      ...player,
      gamesPlayed: player.gamesPlayed + 1,
      balloonRainbows: rainbows + 1,
    },
    "balloon_rainbow",
  );
}

/** Saves a coloring page; finishing one unlocks its stamp through evaluateStampUnlocks. */
export function colorPage<T extends PlayerBase>(
  player: T,
  pageId: string,
  fills: PageFills,
  finish = false,
): T {
  return {
    ...player,
    coloringBook: saveColoringPage(player.coloringBook, pageId, fills, finish),
  };
}

export function completeDJBeatDrop<T extends PlayerBase>(
  player: T,
  score: number,
  combo: number,
): T {
  if (
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > DJ_MAX_SCORE ||
    !Number.isSafeInteger(combo) ||
    combo < 0 ||
    combo > DJ_BEAT_COUNT ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const completed = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    djBeatDropBest: Math.max(player.djBeatDropBest ?? 0, score),
  } as T;
  return combo >= 16 ? unlockStamp(completed, "dj_beat_combo") : completed;
}

export function completeSmoothieOrder<T extends PlayerBase>(player: T): T {
  if (!Number.isSafeInteger((player.smoothiesServed ?? 0) + 1)) return player;
  return {
    ...player,
    smoothiesServed: (player.smoothiesServed ?? 0) + 1,
  } as T;
}

/** Serves a cake once and keeps its photo. */
export function completeBakeryServe<T extends PlayerBase>(
  player: T,
  cake: Cake,
): T {
  const photo = restoreCakePhoto(cake);
  if (!photo || !Number.isSafeInteger((player.cakesServed ?? 0) + 1))
    return player;
  return {
    ...player,
    cakesServed: (player.cakesServed ?? 0) + 1,
    bakeryCakes: [...(player.bakeryCakes ?? []), photo].slice(-MAX_CAKE_PHOTOS),
  };
}

/** Counts a finished Hide & Seek Safari round and stamps its scene once. */
export function completeSeekRound<T extends PlayerBase>(
  player: T,
  round: { scene: SeekSceneId; hard: boolean; timeMs: number },
): T {
  const timeMs = Math.round(round.timeMs);
  if (
    !isSeekScene(round.scene) ||
    !Number.isSafeInteger(timeMs) ||
    timeMs <= 0 ||
    !Number.isSafeInteger((player.seekRounds ?? 0) + 1)
  )
    return player;
  const best =
    round.hard && timeMs <= SEEK_MAX_TIME_MS
      ? Math.min(player.seekBestMs ?? timeMs, timeMs)
      : player.seekBestMs;
  return unlockStamp(
    {
      ...player,
      gamesPlayed: player.gamesPlayed + 1,
      seekRounds: (player.seekRounds ?? 0) + 1,
      ...(best === undefined ? {} : { seekBestMs: best }),
    },
    SEEK_STAMPS[round.scene],
  );
}

/** Picking a species renames the pet to that species' default name. */
export function choosePetSpecies<T extends { pet: PetState }>(
  player: T,
  species: PetSpecies,
): T {
  if (player.pet.species === species) return player;
  return {
    ...player,
    pet: { ...player.pet, species, name: PET_PROFILES[species].petName },
  };
}

export function applyPetCareAction<T extends PlayerBase>(
  player: T,
  action: CareAction,
): T {
  const { nextState } = performPetCare(
    player.petCare ?? DEFAULT_PET_CARE_STATE,
    action,
  );
  const cared = { ...player, petCare: nextState } as T;
  return nextState.happiness >= 100
    ? unlockStamp(cared, "pet_pampered")
    : cared;
}

export function completeSpyPuzzle<T extends PlayerBase>(
  player: T,
  puzzleType: "laser_grid" | "cipher",
  scoreOrStage: number,
): T {
  if (
    (puzzleType !== "laser_grid" && puzzleType !== "cipher") ||
    !Number.isSafeInteger(scoreOrStage) ||
    scoreOrStage < 0 ||
    !Number.isSafeInteger((player.spyPuzzlesSolved ?? 0) + 1)
  )
    return player;
  const spyPuzzlesSolved = (player.spyPuzzlesSolved ?? 0) + 1;
  const nextRank = calculateSpyRank(spyPuzzlesSolved);
  const spyBadges = player.spyBadges?.includes(nextRank.badge)
    ? player.spyBadges
    : [...(player.spyBadges ?? []), nextRank.badge];
  return {
    ...player,
    spyPuzzlesSolved,
    spyRank: nextRank.rank,
    spyBadges,
  } as T;
}

export function unlockStamp<T extends PlayerBase>(
  player: T,
  stampId: string,
): T {
  const stamp = STAMP_DEFINITIONS.find((stamp) => stamp.id === stampId);
  if (!stamp || player.stamps?.includes(stampId)) return player;
  return {
    ...player,
    stamps: [...(player.stamps ?? []), stampId],
  };
}

export function completeFishingCatch<T extends PlayerBase>(
  player: T,
  catchResult: { speciesId: string; weight: number },
): T {
  const { speciesId, weight } = catchResult;
  const species = FISH_SPECIES.find((s) => s.id === speciesId);
  if (
    !species ||
    !Number.isFinite(weight) ||
    weight < 0 ||
    !Number.isSafeInteger((player.fishCaughtCount ?? 0) + 1)
  )
    return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    fishCaughtCount: (player.fishCaughtCount ?? 0) + 1,
    largestFishWeight: Math.max(player.largestFishWeight ?? 0, weight),
  } as T;
}

export function recordFashionShowResult<T extends PlayerBase>(
  player: T,
  result: { score: number },
): T {
  const { score } = result;
  if (
    !Number.isFinite(score) ||
    score < 0 ||
    !Number.isSafeInteger((player.fashionShowsCompleted ?? 0) + 1)
  )
    return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    fashionShowsCompleted: (player.fashionShowsCompleted ?? 0) + 1,
    fashionBestScore: Math.max(player.fashionBestScore ?? 0, Math.round(score)),
  } as T;
}

export type SledResult = Pick<
  SledState,
  "distance" | "pineconesCollected" | "tricksCompleted" | "crashed"
>;

export function completeSledRun<T extends PlayerBase>(
  player: T,
  result: SledResult,
): T {
  const { distance, pineconesCollected, tricksCompleted, crashed } = result;
  if (
    !Number.isFinite(distance) ||
    distance < 0 ||
    distance > SLED_FINISH_DISTANCE ||
    typeof crashed !== "boolean" ||
    (!crashed && distance !== SLED_FINISH_DISTANCE) ||
    !Number.isSafeInteger(pineconesCollected) ||
    pineconesCollected < 0 ||
    pineconesCollected > SLED_MAX_PINECONES ||
    !Number.isSafeInteger(tricksCompleted) ||
    tricksCompleted < 0 ||
    tricksCompleted > SLED_MAX_TRICKS
  )
    return player;
  const score = calculateSledPayout(
    crashed ? Math.min(distance, SLED_FINISH_DISTANCE - 1) : distance,
    pineconesCollected,
    tricksCompleted,
  );
  if (!Number.isSafeInteger(player.gamesPlayed + 1)) return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    sledRunBest: Math.max(player.sledRunBest, score),
  };
}

export function completeRiverSurf<T extends PlayerBase>(
  player: T,
  result: { score: number },
): T {
  const { score } = result;
  if (!Number.isFinite(score) || score < 0) return player;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    riverSurfBest: Math.max(player.riverSurfBest ?? 0, Math.round(score)),
  } as T;
}

export type KartRaceResult = {
  /** Which race this is for the player: kartRacesFinished + 1 when it started. */
  raceNumber: number;
  place: number;
  bestLapMs: number | null;
};

/** Records a finished race once; replaying the same result is a no-op. */
export function completeKartRace<T extends PlayerBase>(
  player: T,
  result: KartRaceResult,
): T {
  const finished = player.kartRacesFinished ?? 0;
  if (
    result.raceNumber !== finished + 1 ||
    !Number.isSafeInteger(result.place) ||
    result.place < 1 ||
    result.place > 4 ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const lap = isKartLapMs(result.bestLapMs) ? result.bestLapMs : null;
  const best = player.kartBestLapMs;
  return {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    kartRacesFinished: finished + 1,
    ...(lap !== null && (best === undefined || lap < best)
      ? { kartBestLapMs: lap }
      : {}),
  };
}

/** Remembers the kart colour and Fast mode picked in the garage. */
export function setKartPrefs<T extends PlayerBase>(
  player: T,
  prefs: { color: string; mode: string },
): T {
  const { color, mode } = prefs;
  if (!isKartColorId(color) || !isKartMode(mode)) return player;
  return player.kartColor === color && player.kartMode === mode
    ? player
    : { ...player, kartColor: color, kartMode: mode };
}

/** A known room prop's spot clamped inside its stage, or null for anything else. */
function propSpot(
  key: string,
  point: unknown,
): { x: number; y: number } | null {
  if (typeof point !== "object" || point === null) return null;
  const x: unknown = Reflect.get(point, "x");
  const y: unknown = Reflect.get(point, "y");
  if (typeof x !== "number" || typeof y !== "number") return null;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const [roomId, propId] = key.split(":");
  const room = Object.values(ROOM_MANIFESTS).find((r) => r?.id === roomId);
  if (!room?.props?.some((prop) => prop.id === propId)) return null;
  return clampToStage(
    { x, y },
    { width: room.stageWidth, height: room.stageHeight },
  );
}

/** Keeps only known room props; the key check also caps the size. */
function restorePropSpots(
  raw: unknown,
): Record<string, { x: number; y: number }> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).flatMap(([key, point]) => {
      const spot = propSpot(key, point);
      return spot ? [[key, spot]] : [];
    }),
  );
}

/** Saves where a carried prop was put down; null sends it back home. */
export function movePropSpot<T extends PlayerBase>(
  player: T,
  roomId: string,
  propId: string,
  point: { x: number; y: number } | null,
): T {
  const key = `${roomId}:${propId}`;
  const { [key]: _old, ...rest } = player.propSpots ?? {};
  if (!point) return { ...player, propSpots: rest };
  const spot = propSpot(key, point);
  return spot ? { ...player, propSpots: { ...rest, [key]: spot } } : player;
}

/** Records one butterfly found in the square today; the fifth earns its stamp once. */
export function findSquareButterfly<T extends PlayerBase>(
  player: T,
  day: string,
  spot: number,
): T {
  if (!butterfliesForDay(day).includes(spot)) return player;
  const hunt = player.squareButterflies;
  const found = hunt?.day === day ? hunt.found : [];
  if (found.includes(spot)) return player;
  const next = {
    ...player,
    squareButterflies: { day, found: [...found, spot] },
  };
  return next.squareButterflies.found.length === BUTTERFLY_COUNT
    ? unlockStamp(next, "square_butterflies")
    : next;
}

/** Keeps today's pin once; the fifth different pin earns the Pin Collector stamp. */
export function collectPin<T extends PlayerBase>(
  player: T,
  day: string,
  pinId: string,
): T {
  const pins = player.pins ?? [];
  if (pinForDay(day).id !== pinId || pins.includes(pinId)) return player;
  const next = { ...player, pins: [...pins, pinId] };
  return next.pins.length >= PIN_STAMP_COUNT
    ? unlockStamp(next, "pin_collector")
    : next;
}

/** Counts one served halo-halo cup; the first cup earns the Halo-Halo Chef stamp. */
export function completeHaloHalo<T extends PlayerBase>(
  player: T,
  layers: unknown,
): T {
  const served = player.haloHaloServed ?? 0;
  if (
    !isHaloLayers(layers) ||
    !Number.isSafeInteger(served + 1) ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  return unlockStamp(
    {
      ...player,
      gamesPlayed: player.gamesPlayed + 1,
      haloHaloServed: served + 1,
    },
    "halo_halo_chef",
  );
}

/** Records a finished firefly round; a jar of 15 or more earns the Firefly Catcher stamp. */
export function completeFireflies<T extends PlayerBase>(
  player: T,
  score: number,
): T {
  if (
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > FIREFLY_MAX_SCORE ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const next = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    fireflyBest: Math.max(player.fireflyBest ?? 0, score),
  };
  return score >= FIREFLY_STAMP_SCORE
    ? unlockStamp(next, "firefly_catcher")
    : next;
}

/** Keeps only known Game Hall games with whole scores inside their range. */
function restoreFantageBest(
  raw: unknown,
): Partial<Record<FantageGameId, number>> {
  if (!raw || typeof raw !== "object") return {};
  const best: Partial<Record<FantageGameId, number>> = {};
  for (const game of FANTAGE_GAMES) {
    const score: unknown = Reflect.get(raw, game.id);
    if (
      typeof score === "number" &&
      Number.isSafeInteger(score) &&
      score >= 0 &&
      score <= game.maxScore
    )
      best[game.id] = score;
  }
  return best;
}

/** Records a finished Game Hall game: best score, games played, stamp once. */
export function completeFantageGame<T extends PlayerBase>(
  player: T,
  id: FantageGameId,
  score: number,
): T {
  const game = fantageGame(id);
  if (
    game.id !== id ||
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > game.maxScore ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const next = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    fantageBest: {
      ...player.fantageBest,
      [id]: Math.max(player.fantageBest?.[id] ?? 0, score),
    },
  };
  return score >= game.stampScore ? unlockStamp(next, game.stamp.id) : next;
}

/** Records a finished Peekaboo game; 6+ first-try finds earn the Peekaboo Pro stamp. */
export function completePeekaboo<T extends PlayerBase>(
  player: T,
  found: number,
): T {
  if (
    !Number.isSafeInteger(found) ||
    found < 0 ||
    found > PEEKABOO_ROUNDS ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const next = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    peekabooBest: Math.max(player.peekabooBest ?? 0, found),
  };
  return found >= PEEKABOO_STAMP_SCORE
    ? unlockStamp(next, "peekaboo_pro")
    : next;
}

/** Counts one Dress-the-Pet show; a 3-star look earns the Pet Stylist stamp. */
export function completeDressPet<T extends PlayerBase>(
  player: T,
  theme: unknown,
  outfit: unknown,
): T {
  const shows = player.petShows ?? 0;
  if (
    !isPetThemeId(theme) ||
    !isPetOutfit(outfit) ||
    !Number.isSafeInteger(shows + 1) ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const next = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    petShows: shows + 1,
  };
  return scoreOutfit(theme, outfit) === 3
    ? unlockStamp(next, "pet_stylist")
    : next;
}

/** Records a finished Pet Round-Up; penning every pet earns the Pet Wrangler stamp. */
export function completePetRoundUp<T extends PlayerBase>(
  player: T,
  score: number,
): T {
  if (
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > ROUNDUP_MAX_SCORE ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const next = {
    ...player,
    gamesPlayed: player.gamesPlayed + 1,
    petRoundUpBest: Math.max(player.petRoundUpBest ?? 0, score),
  };
  return score >= ROUNDUP_STAMP_SCORE
    ? unlockStamp(next, "pet_wrangler")
    : next;
}
