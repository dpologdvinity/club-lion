/**
 * Mad Math rules with no React or DOM dependency: count the snacks, then tap
 * the right number. Wrong taps just wiggle; first tries earn stars.
 */

export const MATH_QUESTIONS = 10;
export const MATH_SNACKS = ["🍎", "🍓", "🍪", "🍩", "🧁", "🍌", "🍇", "🥕"];

export type MathQuestion = { snack: string; count: number; choices: number[] };

/** Counts from 1 to `max`, with three different choices in random order. */
export function makeMathQuestion(
  random: () => number = Math.random,
  max = 10,
): MathQuestion {
  const pick = (n: number) => Math.min(n - 1, Math.floor(random() * n));
  const count = 1 + pick(max);
  const choices = [count];
  while (choices.length < 3) {
    const other = 1 + pick(max);
    if (!choices.includes(other)) choices.push(other);
  }
  for (let i = choices.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { snack: MATH_SNACKS[pick(MATH_SNACKS.length)], count, choices };
}
