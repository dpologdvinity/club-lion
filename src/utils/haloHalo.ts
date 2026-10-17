/**
 * Halo-Halo Builder rules with no React or DOM dependency: the ingredients,
 * picture orders, cup validation and the star score (every cup earns one).
 */

export const MAX_LAYERS = 6;

export const HALO_INGREDIENTS = [
  { id: "ice", label: "Shaved ice", emoji: "🧊", color: "#e8f7ff" },
  { id: "ube", label: "Ube", emoji: "🟣", color: "#8a5cc7" },
  { id: "flan", label: "Leche flan", emoji: "🍮", color: "#f2b84b" },
  { id: "beans", label: "Sweet beans", emoji: "🫘", color: "#a4523a" },
  { id: "jelly", label: "Coconut jelly", emoji: "🥥", color: "#f4f1e6" },
  { id: "icecream", label: "Ice cream", emoji: "🍨", color: "#c9a7f0" },
] as const;
export type HaloIngredient = (typeof HALO_INGREDIENTS)[number]["id"];

export type HaloOrder = {
  id: string;
  name: string;
  /** Bottom of the glass first. */
  layers: HaloIngredient[];
};

export const HALO_ORDERS: readonly HaloOrder[] = [
  {
    id: "classic",
    name: "Classic halo-halo",
    layers: ["beans", "jelly", "ice", "ube", "flan", "icecream"],
  },
  { id: "ube-cloud", name: "Ube cloud", layers: ["ice", "ube", "icecream"] },
  { id: "flan-tower", name: "Flan tower", layers: ["jelly", "ice", "flan"] },
  {
    id: "rainbow",
    name: "Fiesta cup",
    layers: ["beans", "ice", "jelly", "ube", "icecream"],
  },
];

export function isHaloLayers(value: unknown): value is HaloIngredient[] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= MAX_LAYERS &&
    value.every((layer) => HALO_INGREDIENTS.some((i) => i.id === layer))
  );
}

/** Three stars for an exact copy, two for the right treats in any order, one for any cup; free play is always three. */
export function scoreHaloHalo(
  order: HaloOrder | null,
  cup: readonly HaloIngredient[],
): 1 | 2 | 3 {
  if (!order) return 3;
  if (
    cup.length === order.layers.length &&
    cup.every((layer, i) => layer === order.layers[i])
  )
    return 3;
  const sorted = (layers: readonly string[]) => [...layers].sort().join();
  return sorted(cup) === sorted(order.layers) ? 2 : 1;
}

export function pickHaloOrder(
  previousId: string | null,
  random: () => number = Math.random,
): HaloOrder {
  const choices = HALO_ORDERS.filter((order) => order.id !== previousId);
  return choices[
    Math.min(choices.length - 1, Math.floor(random() * choices.length))
  ];
}
