export type FishRarity = "common" | "uncommon" | "rare" | "epic";

export type FishSpecies = {
  id: string;
  name: string;
  rarity: FishRarity;
  minWeight: number;
  maxWeight: number;
  coins: number;
  description: string;
};

export const FISH_SPECIES: readonly FishSpecies[] = [
  {
    id: "river_minnow",
    name: "River minnow",
    rarity: "common",
    minWeight: 0.2,
    maxWeight: 0.5,
    coins: 3,
    description: "A tiny, quick-darting minnow.",
  },
  {
    id: "striped_tilapia",
    name: "Striped tilapia",
    rarity: "common",
    minWeight: 0.8,
    maxWeight: 2.0,
    coins: 5,
    description: "A handsome, striped tilapia.",
  },
  {
    id: "old_boot",
    name: "Old boot",
    rarity: "common",
    minWeight: 0.5,
    maxWeight: 1.0,
    coins: 1,
    description: "A waterlogged boot! Somebody lost their shoe.",
  },
  {
    id: "baobab_perch",
    name: "Baobab perch",
    rarity: "uncommon",
    minWeight: 2.5,
    maxWeight: 5.0,
    coins: 12,
    description: "A sturdy perch that lurks near baobab roots.",
  },
  {
    id: "spotted_catfish",
    name: "Spotted catfish",
    rarity: "uncommon",
    minWeight: 3.0,
    maxWeight: 7.0,
    coins: 15,
    description: "A whiskered catfish with speckled scales.",
  },
  {
    id: "golden_catfish",
    name: "Golden catfish",
    rarity: "rare",
    minWeight: 6.0,
    maxWeight: 12.0,
    coins: 50,
    description: "A rare catfish that gleams like gold.",
  },
  {
    id: "savanna_eel",
    name: "Savanna eel",
    rarity: "epic",
    minWeight: 4.0,
    maxWeight: 9.0,
    coins: 80,
    description: "A legendary eel said to haunt the deepest pools.",
  },
];

const RARITY_WEIGHT: Readonly<Record<FishRarity, number>> = {
  common: 60,
  uncommon: 28,
  rare: 10,
  epic: 2,
};

const TOTAL_WEIGHT = FISH_SPECIES.reduce(
  (sum, species) => sum + RARITY_WEIGHT[species.rarity],
  0,
);

/** Mulberry32: small, deterministic PRNG so a seed reproduces the same catch. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getRandomCatch(randomSeed?: number): {
  species: FishSpecies;
  weight: number;
  coins: number;
} {
  const random =
    randomSeed === undefined ? Math.random : mulberry32(randomSeed);

  let roll = random() * TOTAL_WEIGHT;
  let species = FISH_SPECIES[0];
  for (const candidate of FISH_SPECIES) {
    roll -= RARITY_WEIGHT[candidate.rarity];
    if (roll <= 0) {
      species = candidate;
      break;
    }
  }

  const rawWeight =
    species.minWeight + random() * (species.maxWeight - species.minWeight);
  const weight = Math.round(rawWeight * 10) / 10;

  return { species, weight, coins: species.coins };
}

export function isWithinBiteWindow(
  elapsedMs: number,
  biteStartMs: number,
  windowDurationMs = 1000,
): boolean {
  const reaction = elapsedMs - biteStartMs;
  return reaction >= 0 && reaction <= windowDurationMs;
}

const TENSION_MIN = 0;
const TENSION_MAX = 100;
const REEL_RATE_PER_SECOND = 40;
const PULL_RATE_PER_SECOND = 40;

export function updateReelTension(
  currentTension: number,
  isReeling: boolean,
  deltaMs: number,
  fishPullPower: number,
): number {
  const seconds = deltaMs / 1000;
  const reelDelta = isReeling ? REEL_RATE_PER_SECOND * seconds : 0;
  const pullDelta = (PULL_RATE_PER_SECOND * seconds * fishPullPower) / 100;
  const next = currentTension + reelDelta - pullDelta;
  return Math.min(TENSION_MAX, Math.max(TENSION_MIN, next));
}

export const REEL_SWEET_SPOT = { min: 25, max: 75 } as const;
