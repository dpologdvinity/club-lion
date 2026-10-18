/**
 * Memory Mixup rules with no React or DOM dependency: eight pairs of snack
 * cards face down; flip two at a time; stars come from how few turns it took.
 */

export const MIXUP_SNACKS = ["🍓", "🍩", "🧁", "🍪", "🍉", "🍕", "🍦", "🍌"];
export const MIXUP_PAIRS = MIXUP_SNACKS.length;

export type MixupCard = { id: number; snack: string };

/** A shuffled deck holding every snack twice. */
export function makeMixupDeck(random: () => number = Math.random): MixupCard[] {
  const cards = MIXUP_SNACKS.flatMap((snack) => [snack, snack]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.map((snack, id) => ({ id, snack }));
}

/** 3 stars for 12 turns or fewer, 2 for 16 or fewer, otherwise 1. */
export function mixupStars(turns: number): number {
  return turns <= 12 ? 3 : turns <= 16 ? 2 : 1;
}
