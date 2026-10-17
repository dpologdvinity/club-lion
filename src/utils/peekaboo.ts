/**
 * Peekaboo Animals rules with no React or DOM dependency: animals hide in
 * bushes, peek out one by one, then the child finds the one called by picture.
 */

export const PEEKABOO_ROUNDS = 8;
export const PEEKABOO_SPOTS = 6;
export const PEEKABOO_STAMP_SCORE = 6;

export const PEEKABOO_ANIMALS = [
  { id: "elephant", emoji: "🐘", label: "elephant" },
  { id: "giraffe", emoji: "🦒", label: "giraffe" },
  { id: "zebra", emoji: "🦓", label: "zebra" },
  { id: "monkey", emoji: "🐒", label: "monkey" },
  { id: "hippo", emoji: "🦛", label: "hippo" },
  { id: "bunny", emoji: "🐰", label: "bunny" },
  { id: "bear", emoji: "🐻", label: "bear" },
  { id: "frog", emoji: "🐸", label: "frog" },
  { id: "parrot", emoji: "🦜", label: "parrot" },
  { id: "turtle", emoji: "🐢", label: "turtle" },
] as const;
export type PeekabooAnimal = (typeof PEEKABOO_ANIMALS)[number]["id"];

export type PeekabooRound = {
  /** Which animal hides in each bush, left to right. */
  spots: PeekabooAnimal[];
  /** Index of the bush the child must find. */
  target: number;
};

/** How long each animal peeks out; quicker every round, never a blink. */
export function peekMsFor(round: number): number {
  return Math.max(350, 900 - round * 75);
}

export function makePeekabooRound(
  random: () => number = Math.random,
): PeekabooRound {
  const pool: PeekabooAnimal[] = PEEKABOO_ANIMALS.map((animal) => animal.id);
  const spots: PeekabooAnimal[] = [];
  while (spots.length < PEEKABOO_SPOTS) {
    const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
    spots.push(pool.splice(index, 1)[0]);
  }
  const target = Math.min(
    PEEKABOO_SPOTS - 1,
    Math.floor(random() * PEEKABOO_SPOTS),
  );
  return { spots, target };
}
