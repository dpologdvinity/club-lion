import {
  calculateSledPayout,
  SLED_FINISH_DISTANCE,
  SLED_MAX_PINECONES,
  SLED_MAX_TRICKS,
  SLED_MAX_PAYOUT,
  type SledState,
} from "./utils/sledPhysics.ts";
import { sanitizeSocialGraph } from "./utils/socialGraph.ts";
import { STAMP_DEFINITIONS } from "./utils/stampDefinitions.ts";
import { BEE_STOP_MAX_SCORE, coinsFor } from "./beeStop.ts";
import { MAX_SMOOTHIE_COINS } from "./utils/smoothieRecipes.ts";
import { FISH_SPECIES } from "./utils/fishingEngine.ts";
import {
  coinsForScore,
  DJ_BEAT_COUNT,
  DJ_MAX_SCORE,
} from "./utils/rhythmEngine.ts";
import { deserializeLayout, serializeLayout } from "./utils/condoGrid.ts";
import {
  calculateSpyRank,
  SPY_PUZZLE_MAX_COINS,
  SPY_RANKS,
} from "./utils/spyPuzzles.ts";
import type { AvatarLook, PetState } from "./types/world.ts";
import {
  DEFAULT_AVATAR_LOOK,
  DEFAULT_PET_STATE,
  validateAvatarLook,
  CATALOG_ITEMS,
} from "./types/world.ts";

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
  | "canyon-rapids";
export type AdventureId = "neighbors" | "game" | "home";
export type PlayerBase = {
  name: string;
  coins: number;
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
  stamps?: string[];
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
};

export type Player = PlayerBase & {
  version: 1;
  look?: AvatarLook;
  pet?: PetState;
};

export const PAW_STEPS_MAX_ROUNDS = 999;
export const PAW_STEPS_COINS_PER_ROUND = 10;

export const SHOP_ITEMS = [
  {
    id: "scarf",
    name: "Forest scarf",
    price: 80,
    kind: "accessory",
    description: "A little cozy, a little adventurous.",
  },
  {
    id: "glasses",
    name: "Sunshine shades",
    price: 120,
    kind: "accessory",
    description: "For the coolest cat in the savanna.",
  },
  {
    id: "hat",
    name: "Explorer hat",
    price: 150,
    kind: "accessory",
    description: "Every adventure starts with a good hat.",
  },
  {
    id: "flower",
    name: "Daisy crown",
    price: 100,
    kind: "accessory",
    description: "Bring a little spring wherever you go.",
  },
  {
    id: "plant",
    name: "Happy houseplant",
    price: 100,
    kind: "decor",
    description: "A leafy new friend for your den.",
  },
  {
    id: "cushion",
    name: "Sunny cushion",
    price: 180,
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
];

export const NEIGHBORS = [
  {
    id: "milo",
    name: "Milo",
    color: "gold" as const,
    accessory: "hat",
    x: 24,
    y: 61,
    greeting: "Hey, neighbor! The café makes the best mango smoothies. ☀️",
  },
  {
    id: "cleo",
    name: "Cleo",
    color: "rose" as const,
    accessory: "flower",
    x: 75,
    y: 59,
    greeting: "Welcome to the pride! Your mane looks absolutely lovely. 🌼",
  },
  {
    id: "pip",
    name: "Pip",
    color: "sand" as const,
    accessory: "glasses",
    x: 67,
    y: 83,
    greeting: "Psst… try the arcade! There are fun games and coins to win. 🎮",
  },
];

export function newPlayer(): Player {
  return {
    version: 1,
    name: "Sunny",
    coins: 250,
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

export function restorePlayer(raw: string | null): Player {
  if (!raw) return newPlayer();
  try {
    const p = JSON.parse(raw);
    if (
      p.version !== 1 ||
      !Number.isSafeInteger(p.coins) ||
      p.coins < 0 ||
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
            CATALOG_ITEMS.some((item) => item.id === id),
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
      coins: p.coins,
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
  starRank: number;
  moodQuote: string;
};

export type PlayerSave = Player | PlayerV2;

const DEFAULT_MOOD_QUOTE = "Vibing in the savanna";

function calculateStarRank(gamesPlayed: number, coins: number): number {
  return 1 + Math.floor(gamesPlayed / 5) + Math.floor(coins / 500);
}

function isPlayerV2(value: unknown): value is PlayerV2 {
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
  if (isPlayerV2(save)) {
    const v1 = restorePlayer(
      JSON.stringify({ ...(save as PlayerV2), version: 1 }),
    );
    return {
      ...v1,
      version: 2,
      look: save.look,
      pet: save.pet,
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
  const look = validateAvatarLook(raw.look)
    ? (raw.look as AvatarLook)
    : DEFAULT_AVATAR_LOOK;
  const pet =
    raw.pet && typeof raw.pet === "object"
      ? ({ ...DEFAULT_PET_STATE, ...(raw.pet as object) } as PetState)
      : DEFAULT_PET_STATE;
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
    starRank: calculateStarRank(v1.gamesPlayed, v1.coins),
    moodQuote,
  };
}

export function buyItem<T extends PlayerBase>(player: T, id: string): T {
  const item = SHOP_ITEMS.find((item) => item.id === id);
  if (!item || player.owned.includes(id) || player.coins < item.price)
    return player;
  return {
    ...player,
    coins: player.coins - item.price,
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
        coins: player.coins + 50,
        claimed: [...player.claimed, id],
      } as T);
}

export function completeGame<T extends PlayerBase>(
  player: T,
  pairs: number,
): T {
  if (!Number.isSafeInteger(pairs) || pairs < 0 || pairs > 6) return player;
  const completed = {
    ...player,
    coins: player.coins + pairs * 10,
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
  if (!Number.isSafeInteger(score) || score < 0) return player;
  return {
    ...player,
    coins: player.coins + score,
    gamesPlayed: player.gamesPlayed + 1,
    mangoRunBest: Math.max(player.mangoRunBest ?? 0, score),
  } as T;
}

export function completeBeeStop<T extends PlayerBase>(
  player: T,
  score: number,
): T {
  if (!Number.isSafeInteger(score) || score < 0 || score > BEE_STOP_MAX_SCORE)
    return player;
  return {
    ...player,
    coins: player.coins + coinsFor(score),
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
    rounds > PAW_STEPS_MAX_ROUNDS
  )
    return player;
  return {
    ...player,
    coins: player.coins + rounds * PAW_STEPS_COINS_PER_ROUND,
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
    score !== caught * 10
  )
    return player;
  const newGamesPlayed = player.gamesPlayed + 1;
  const newBest = Math.max(player.fruitCatchBest, score);
  return {
    ...player,
    coins: player.coins + caught * 2,
    gamesPlayed: newGamesPlayed,
    fruitCatchBest: newBest,
  } as T;
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
    !Number.isSafeInteger(player.coins + coinsForScore(score)) ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  const completed = {
    ...player,
    coins: player.coins + coinsForScore(score),
    gamesPlayed: player.gamesPlayed + 1,
    djBeatDropBest: Math.max(player.djBeatDropBest ?? 0, score),
  } as T;
  return combo >= 16 ? unlockStamp(completed, "dj_beat_combo") : completed;
}

export function completeSmoothieOrder<T extends PlayerBase>(
  player: T,
  coinsEarned: number,
): T {
  if (
    !Number.isSafeInteger(coinsEarned) ||
    coinsEarned < 0 ||
    coinsEarned > MAX_SMOOTHIE_COINS ||
    !Number.isSafeInteger(player.coins + coinsEarned) ||
    !Number.isSafeInteger((player.smoothiesServed ?? 0) + 1)
  )
    return player;
  return {
    ...player,
    coins: player.coins + coinsEarned,
    smoothiesServed: (player.smoothiesServed ?? 0) + 1,
  } as T;
}

export function completeSpyPuzzle<T extends PlayerBase>(
  player: T,
  puzzleType: "laser_grid" | "cipher",
  scoreOrStage: number,
  coinsEarned: number,
): T {
  if (
    (puzzleType !== "laser_grid" && puzzleType !== "cipher") ||
    !Number.isSafeInteger(scoreOrStage) ||
    scoreOrStage < 0 ||
    !Number.isSafeInteger(coinsEarned) ||
    coinsEarned < 0 ||
    coinsEarned > SPY_PUZZLE_MAX_COINS ||
    !Number.isSafeInteger(player.coins + coinsEarned) ||
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
    coins: player.coins + coinsEarned,
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
    coins: player.coins + (stamp.rewardCoins ?? 0),
    stamps: [...(player.stamps ?? []), stampId],
  };
}

export function completeFishingCatch<T extends PlayerBase>(
  player: T,
  catchResult: { speciesId: string; weight: number; coins: number },
): T {
  const { speciesId, weight, coins } = catchResult;
  const species = FISH_SPECIES.find((s) => s.id === speciesId);
  if (
    !species ||
    !Number.isFinite(weight) ||
    weight < 0 ||
    !Number.isSafeInteger(coins) ||
    coins < 0 ||
    !Number.isSafeInteger(player.coins + coins) ||
    !Number.isSafeInteger((player.fishCaughtCount ?? 0) + 1)
  )
    return player;
  return {
    ...player,
    coins: player.coins + coins,
    gamesPlayed: player.gamesPlayed + 1,
    fishCaughtCount: (player.fishCaughtCount ?? 0) + 1,
    largestFishWeight: Math.max(player.largestFishWeight ?? 0, weight),
  } as T;
}

export function recordFashionShowResult<T extends PlayerBase>(
  player: T,
  result: { score: number; coins: number },
): T {
  const { score, coins } = result;
  if (
    !Number.isFinite(score) ||
    score < 0 ||
    !Number.isSafeInteger(coins) ||
    coins < 0 ||
    !Number.isSafeInteger(player.coins + coins) ||
    !Number.isSafeInteger((player.fashionShowsCompleted ?? 0) + 1)
  )
    return player;
  return {
    ...player,
    coins: player.coins + coins,
    gamesPlayed: player.gamesPlayed + 1,
    fashionShowsCompleted: (player.fashionShowsCompleted ?? 0) + 1,
    fashionBestScore: Math.max(player.fashionBestScore ?? 0, Math.round(score)),
  } as T;
}

export type SledResult = Pick<
  SledState,
  "distance" | "coinsCollected" | "tricksCompleted" | "crashed"
>;

export function completeSledRun<T extends PlayerBase>(
  player: T,
  result: SledResult,
): T {
  const { distance, coinsCollected, tricksCompleted, crashed } = result;
  if (
    !Number.isFinite(distance) ||
    distance < 0 ||
    distance > SLED_FINISH_DISTANCE ||
    typeof crashed !== "boolean" ||
    (!crashed && distance !== SLED_FINISH_DISTANCE) ||
    !Number.isSafeInteger(coinsCollected) ||
    coinsCollected < 0 ||
    coinsCollected > SLED_MAX_PINECONES ||
    !Number.isSafeInteger(tricksCompleted) ||
    tricksCompleted < 0 ||
    tricksCompleted > SLED_MAX_TRICKS
  )
    return player;
  const coins = calculateSledPayout(
    crashed ? Math.min(distance, SLED_FINISH_DISTANCE - 1) : distance,
    coinsCollected,
    tricksCompleted,
  );
  if (
    !Number.isSafeInteger(player.coins + coins) ||
    !Number.isSafeInteger(player.gamesPlayed + 1)
  )
    return player;
  return {
    ...player,
    coins: player.coins + coins,
    gamesPlayed: player.gamesPlayed + 1,
    sledRunBest: Math.max(player.sledRunBest, coins),
  };
}

export function completeRiverSurf<T extends PlayerBase>(
  player: T,
  result: { score: number; coins: number },
): T {
  const { score, coins } = result;
  if (
    !Number.isFinite(score) ||
    score < 0 ||
    !Number.isSafeInteger(coins) ||
    coins < 0 ||
    !Number.isSafeInteger(player.coins + coins)
  )
    return player;
  return {
    ...player,
    coins: player.coins + coins,
    gamesPlayed: player.gamesPlayed + 1,
    riverSurfBest: Math.max(player.riverSurfBest ?? 0, Math.round(score)),
  } as T;
}
