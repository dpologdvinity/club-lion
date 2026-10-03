export type Ingredient =
  | "mango_slices"
  | "pineapple_chunks"
  | "baobab_berry"
  | "coconut_milk"
  | "crushed_ice"
  | "honey_drizzle";

export const INGREDIENTS: { id: Ingredient; label: string; color: string }[] = [
  { id: "mango_slices", label: "Mango slices", color: "#f4a53a" },
  { id: "pineapple_chunks", label: "Pineapple chunks", color: "#f7d94c" },
  { id: "baobab_berry", label: "Baobab Berry", color: "#b0429e" },
  { id: "coconut_milk", label: "Coconut Milk", color: "#faf6ec" },
  { id: "crushed_ice", label: "Crushed Ice", color: "#cdeffb" },
  { id: "honey_drizzle", label: "Honey drizzle", color: "#e8a93a" },
];

export type Recipe = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  baseCoins: number;
};

export const RECIPES: Recipe[] = [
  {
    id: "mango_tango",
    name: "Mango Tango",
    ingredients: ["mango_slices", "mango_slices", "crushed_ice"],
    baseCoins: 10,
  },
  {
    id: "baobab_berry_blitz",
    name: "Baobab Berry Blitz",
    ingredients: [
      "baobab_berry",
      "baobab_berry",
      "honey_drizzle",
      "crushed_ice",
    ],
    baseCoins: 14,
  },
  {
    id: "savanna_sunrise",
    name: "Savanna Sunrise",
    ingredients: ["mango_slices", "pineapple_chunks", "honey_drizzle"],
    baseCoins: 12,
  },
  {
    id: "coconut_cloud",
    name: "Coconut Cloud",
    ingredients: [
      "coconut_milk",
      "coconut_milk",
      "crushed_ice",
      "honey_drizzle",
    ],
    baseCoins: 13,
  },
];

export type SmoothieScore = {
  accuracy: number;
  stars: 0 | 1 | 2 | 3;
  coins: number;
};

export const MAX_SMOOTHIE_COINS = Math.max(
  ...RECIPES.map((recipe) => recipe.baseCoins * 3),
);

function starsForAccuracy(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy <= 0) return 0;
  if (accuracy >= 90) return 3;
  if (accuracy >= 60) return 2;
  return 1;
}

/** Multiset-compares poured ingredients against the recipe, order-independent. */
export function scoreSmoothie(
  recipe: Recipe,
  poured: Ingredient[],
): SmoothieScore {
  const needed = new Map<Ingredient, number>();
  for (const ingredient of recipe.ingredients) {
    needed.set(ingredient, (needed.get(ingredient) ?? 0) + 1);
  }
  const have = new Map<Ingredient, number>();
  for (const ingredient of poured) {
    have.set(ingredient, (have.get(ingredient) ?? 0) + 1);
  }

  let correct = 0;
  for (const [ingredient, count] of needed) {
    correct += Math.min(count, have.get(ingredient) ?? 0);
  }
  let extra = 0;
  for (const [ingredient, count] of have) {
    const overage = count - (needed.get(ingredient) ?? 0);
    if (overage > 0) extra += overage;
  }

  const totalNeeded = recipe.ingredients.length;
  if (totalNeeded === 0 || poured.length === 0) {
    return { accuracy: 0, stars: 0, coins: 0 };
  }

  const rawAccuracy = (correct - extra) / totalNeeded;
  const accuracy = Math.max(0, Math.min(100, Math.round(rawAccuracy * 100)));
  const stars = starsForAccuracy(accuracy);
  const coins = recipe.baseCoins * stars;

  return { accuracy, stars, coins };
}
