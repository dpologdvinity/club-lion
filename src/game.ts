export const SAVE_KEY = "club-lion-player-v1";
export type LionColor = "gold" | "sand" | "copper" | "rose";
export type PlaceId = "square" | "water" | "cafe" | "arcade" | "den";
export type AdventureId = "neighbors" | "game" | "home";
export type Player = {
  version: 1;
  name: string;
  coins: number;
  color: LionColor;
  accessory: string;
  owned: string[];
  met: string[];
  visited: PlaceId[];
  gamesPlayed: number;
  claimed: AdventureId[];
  decor: string[];
  fruitCatchBest: number;
};

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
    greeting:
      "Psst… try the arcade! You can earn coins playing Memory Safari. 🎮",
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
    claimed: [],
    decor: [],
    fruitCatchBest: 0,
  };
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
    const owned = [
      ...new Set<string>(
        p.owned.filter((id: unknown) =>
          SHOP_ITEMS.some((item) => item.id === id),
        ),
      ),
    ];
    return {
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
      gamesPlayed: p.gamesPlayed,
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
    };
  } catch {
    return newPlayer();
  }
}

export function buyItem(player: Player, id: string): Player {
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
  };
}

export function visitPlace(player: Player, id: PlaceId): Player {
  return player.visited.includes(id)
    ? player
    : { ...player, visited: [...player.visited, id] };
}

export function meetLion(player: Player, id: string): Player {
  return player.met.includes(id) || !NEIGHBORS.some((lion) => lion.id === id)
    ? player
    : { ...player, met: [...player.met, id] };
}

export function isAdventureComplete(player: Player, id: AdventureId): boolean {
  return id === "neighbors"
    ? player.met.length >= 3
    : id === "game"
      ? player.gamesPlayed >= 1
      : player.visited.includes("den");
}

export function claimReward(player: Player, id: AdventureId): Player {
  return player.claimed.includes(id) || !isAdventureComplete(player, id)
    ? player
    : { ...player, coins: player.coins + 50, claimed: [...player.claimed, id] };
}

export function completeGame(player: Player, pairs: number): Player {
  if (!Number.isSafeInteger(pairs) || pairs < 0 || pairs > 6) return player;
  return {
    ...player,
    coins: player.coins + pairs * 10,
    gamesPlayed: player.gamesPlayed + 1,
  };
}

export function completeFruitCatch(
  player: Player,
  caught: number,
  hits: number,
  score: number,
): Player {
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
  };
}
