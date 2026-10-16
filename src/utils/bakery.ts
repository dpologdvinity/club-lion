export const CAKE_SHAPES = ["round", "heart", "star", "tiers"] as const;
export const SPONGES = ["vanilla", "chocolate", "strawberry", "mango"] as const;
export const FROSTINGS = ["cream", "pink", "mint", "choco", "mango"] as const;
export const TOPPINGS = [
  "sprinkles",
  "mango",
  "candle",
  "gummy",
  "cherry",
  "lion",
] as const;

export type CakeShape = (typeof CAKE_SHAPES)[number];
export type Sponge = (typeof SPONGES)[number];
export type Frosting = (typeof FROSTINGS)[number];
export type ToppingKind = (typeof TOPPINGS)[number];

/** x and y are percentages of the cake stage, so a photo redraws at any size. */
export type PlacedTopping = { kind: ToppingKind; x: number; y: number };

export type Cake = {
  shape: CakeShape;
  sponge: Sponge;
  frosting: Frosting;
  toppings: PlacedTopping[];
};

export type CakeOrder = {
  shape: CakeShape;
  sponge: Sponge;
  frosting: Frosting;
  toppings: Partial<Record<ToppingKind, number>>;
};

export const MAX_TOPPINGS = 40;
export const MAX_CAKE_PHOTOS = 6;

export const SPONGE_COLORS: Record<Sponge, string> = {
  vanilla: "#f7dc9c",
  chocolate: "#8a5634",
  strawberry: "#f4a7b5",
  mango: "#f8b84a",
};

export const FROSTING_COLORS: Record<Frosting, string> = {
  cream: "#fff6e6",
  pink: "#ff9fc4",
  mint: "#a8e6c8",
  choco: "#6b3d24",
  mango: "#ffc95c",
};

export function newCake(): Cake {
  return { shape: "round", sponge: "vanilla", frosting: "cream", toppings: [] };
}

/** Adds a topping, keeping the newest MAX_TOPPINGS so the cake never grows without bound. */
export function addTopping(cake: Cake, topping: PlacedTopping): Cake {
  return {
    ...cake,
    toppings: [...cake.toppings, topping].slice(-MAX_TOPPINGS),
  };
}

// Golden-angle spiral over the frosted top, so keyboard and tray taps spread out nicely.
export function autoSpot(index: number): { x: number; y: number } {
  const angle = index * 2.39996;
  const radius = 6 + ((index * 7) % 24);
  return {
    x: Math.round(50 + Math.cos(angle) * radius),
    y: Math.round(46 + Math.sin(angle) * radius * 0.4),
  };
}

export function pickOrder(random: () => number = Math.random): CakeOrder {
  const pick = <T>(list: readonly T[]): T =>
    list[Math.min(list.length - 1, Math.floor(random() * list.length))];
  const kinds = [...TOPPINGS];
  const toppings: Partial<Record<ToppingKind, number>> = {};
  const kindCount = 2 + Math.floor(random() * 2);
  for (let i = 0; i < kindCount; i++) {
    const [kind] = kinds.splice(Math.floor(random() * kinds.length), 1);
    toppings[kind] = kind === "lion" ? 1 : 1 + Math.floor(random() * 3);
  }
  return {
    shape: pick(CAKE_SHAPES),
    sponge: pick(SPONGES),
    frosting: pick(FROSTINGS),
    toppings,
  };
}

/** Lays an order's toppings out on the spiral so the picture card shows a real cake. */
export function orderAsCake(order: CakeOrder): Cake {
  const toppings: PlacedTopping[] = [];
  for (const kind of TOPPINGS) {
    for (let i = 0; i < (order.toppings[kind] ?? 0); i++) {
      toppings.push({ kind, ...autoSpot(toppings.length) });
    }
  }
  return {
    shape: order.shape,
    sponge: order.sponge,
    frosting: order.frosting,
    toppings,
  };
}

export type CakeScore = { stars: 1 | 2 | 3 };

/**
 * Shape, sponge and frosting are a point each; toppings are worth three points,
 * with extras costing half a point each. Every served cake earns at least a star.
 */
export function scoreCake(order: CakeOrder, cake: Cake): CakeScore {
  let points =
    Number(order.shape === cake.shape) +
    Number(order.sponge === cake.sponge) +
    Number(order.frosting === cake.frosting);
  let needed = 0;
  let matched = 0;
  let extra = 0;
  for (const kind of TOPPINGS) {
    const want = order.toppings[kind] ?? 0;
    const have = cake.toppings.filter((t) => t.kind === kind).length;
    needed += want;
    matched += Math.min(want, have);
    extra += Math.max(0, have - want);
  }
  points += needed === 0 ? 3 : Math.max(0, (matched - extra / 2) / needed) * 3;
  const stars = points >= 6 ? 3 : points >= 4 ? 2 : 1;
  return { stars };
}

const isOneOf = <T extends string>(
  list: readonly T[],
  value: unknown,
): value is T => list.some((item) => item === value);

const isPercent = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100;

function restoreTopping(value: unknown): PlacedTopping | null {
  if (!value || typeof value !== "object") return null;
  const kind = "kind" in value ? value.kind : undefined;
  const x = "x" in value ? value.x : undefined;
  const y = "y" in value ? value.y : undefined;
  return isOneOf(TOPPINGS, kind) && isPercent(x) && isPercent(y)
    ? { kind, x, y }
    : null;
}

/** Validates one saved cake photo, or returns null so a bad entry is dropped. */
export function restoreCakePhoto(value: unknown): Cake | null {
  if (!value || typeof value !== "object") return null;
  const shape = "shape" in value ? value.shape : undefined;
  const sponge = "sponge" in value ? value.sponge : undefined;
  const frosting = "frosting" in value ? value.frosting : undefined;
  const toppings = "toppings" in value ? value.toppings : undefined;
  if (
    !isOneOf(CAKE_SHAPES, shape) ||
    !isOneOf(SPONGES, sponge) ||
    !isOneOf(FROSTINGS, frosting) ||
    !Array.isArray(toppings) ||
    toppings.length > MAX_TOPPINGS
  )
    return null;
  const restored = toppings.map(restoreTopping);
  if (restored.some((t) => t === null)) return null;
  return {
    shape,
    sponge,
    frosting,
    toppings: restored.filter((t): t is PlacedTopping => t !== null),
  };
}

export function restoreCakePhotos(value: unknown): Cake[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(restoreCakePhoto)
    .filter((cake): cake is Cake => cake !== null)
    .slice(-MAX_CAKE_PHOTOS);
}
