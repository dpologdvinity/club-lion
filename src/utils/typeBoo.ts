/**
 * Type Boo rules with no React or DOM dependency: a friendly ghost shows a
 * letter; tap (or type) the same letter to make it giggle and float away.
 */

export const BOO_GHOSTS = 12;
export const BOO_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type BooRound = { letter: string; choices: string[] };

/** A letter and four different letter choices, one of them right. */
export function makeBooRound(random: () => number = Math.random): BooRound {
  const pick = (n: number) => Math.min(n - 1, Math.floor(random() * n));
  const letter = BOO_LETTERS[pick(BOO_LETTERS.length)];
  const choices = [letter];
  while (choices.length < 4) {
    const other = BOO_LETTERS[pick(BOO_LETTERS.length)];
    if (!choices.includes(other)) choices.push(other);
  }
  for (let i = choices.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { letter, choices };
}
