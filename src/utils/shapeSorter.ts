/**
 * Shape Sorter Safari rules with no React or DOM dependency: the three
 * rounds of animal holes, the shape each hole takes, and the round payout.
 */

export const SHAPES = [
  "circle",
  "square",
  "triangle",
  "star",
  "heart",
] as const;
export type ShapeId = (typeof SHAPES)[number];

export const SHAPE_LABELS: Record<ShapeId, string> = {
  circle: "Circle",
  square: "Square",
  triangle: "Triangle",
  star: "Star",
  heart: "Heart",
};

/** Every animal that has a sorter hole drawing. */
export const SORTER_ANIMALS = [
  "lion",
  "zebra",
  "giraffe",
  "hippo",
  "monkey",
  "parrot",
  "bunny",
  "bear",
  "elephant",
  "frog",
] as const;
export type SorterAnimal = (typeof SORTER_ANIMALS)[number];

export type SorterPair = { animal: SorterAnimal; shape: ShapeId };

/** Each round is a new set of animals and shapes; every shape appears once. */
export const SORTER_ROUNDS: readonly (readonly SorterPair[])[] = [
  [
    { animal: "lion", shape: "circle" },
    { animal: "zebra", shape: "square" },
    { animal: "giraffe", shape: "triangle" },
    { animal: "hippo", shape: "star" },
    { animal: "monkey", shape: "heart" },
  ],
  [
    { animal: "parrot", shape: "heart" },
    { animal: "bunny", shape: "circle" },
    { animal: "bear", shape: "star" },
    { animal: "elephant", shape: "square" },
    { animal: "frog", shape: "triangle" },
  ],
  [
    { animal: "zebra", shape: "triangle" },
    { animal: "giraffe", shape: "circle" },
    { animal: "bear", shape: "square" },
    { animal: "frog", shape: "heart" },
    { animal: "lion", shape: "star" },
  ],
];

export const SHAPE_SORTER_ROUNDS = SORTER_ROUNDS.length;

/** True when the shape belongs in that animal's hole this round. */
export function isMatch(
  round: readonly SorterPair[],
  animal: SorterAnimal,
  shape: ShapeId,
): boolean {
  return round.some((pair) => pair.animal === animal && pair.shape === shape);
}

/** Fisher-Yates copy, so the piece tray does not start in hole order. */
export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}
