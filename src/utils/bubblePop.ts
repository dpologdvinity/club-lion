/**
 * Bubble Pop rules with no React or DOM dependency: bubble generation, the
 * challenge combo scoring.
 */

export const BUBBLE_COLORS = [
  { id: "pink", label: "Pink" },
  { id: "sky", label: "Blue" },
  { id: "mint", label: "Green" },
  { id: "sun", label: "Yellow" },
  { id: "lilac", label: "Purple" },
] as const;
export type BubbleColor = (typeof BUBBLE_COLORS)[number]["id"];

export const BUBBLE_SURPRISES = [
  { id: "cub", emoji: "🦁", label: "a lion cub" },
  { id: "mango", emoji: "🥭", label: "a mango" },
  { id: "star", emoji: "⭐", label: "a star" },
  { id: "bunny", emoji: "🐰", label: "a bunny" },
  { id: "chick", emoji: "🐥", label: "a chick" },
  { id: "fish", emoji: "🐠", label: "a fish" },
] as const;
export type BubbleSurprise = (typeof BUBBLE_SURPRISES)[number];

export type Bubble = {
  id: number;
  color: BubbleColor;
  golden: boolean;
  surprise: BubbleSurprise | null;
  /** Horizontal center, percent of the field width. */
  x: number;
  /** Resting height used when motion is reduced, percent of the field height. */
  y: number;
  /** Diameter in CSS pixels. */
  size: number;
  /** Milliseconds to float from the bottom of the field to the top. */
  riseMs: number;
};

export const CHALLENGE_MS = 60_000;
export const CHALLENGE_SPAWN_MS = 550;
export const RELAX_SPAWN_MS = 1_100;
export const START_BUBBLES = 5;
export const BASE_POINTS = 10;
export const GOLDEN_POINTS = 50;
export const MAX_MULTIPLIER = 5;
/** No challenge can spawn more bubbles than this, so no real score exceeds the cap. */
export const CHALLENGE_MAX_BUBBLES =
  START_BUBBLES + Math.ceil(CHALLENGE_MS / CHALLENGE_SPAWN_MS);
export const BUBBLE_POP_MAX_SCORE =
  CHALLENGE_MAX_BUBBLES * GOLDEN_POINTS * MAX_MULTIPLIER;

const pick = <T>(items: readonly T[], roll: number): T =>
  items[Math.min(items.length - 1, Math.floor(roll * items.length))];

/** A new bubble. Relaxed bubbles are bigger and slower; golden ones only appear in challenges. */
export function makeBubble(
  id: number,
  challenge: boolean,
  random: () => number = Math.random,
): Bubble {
  const golden = challenge && random() < 0.08;
  const surprise =
    random() < (challenge ? 0.25 : 0.5)
      ? pick(BUBBLE_SURPRISES, random())
      : null;
  return {
    id,
    color: pick(BUBBLE_COLORS, random()).id,
    golden,
    surprise,
    x: 10 + random() * 80,
    y: 14 + random() * 62,
    size: Math.round(
      challenge ? 66 + random() * 30 : golden ? 110 : 92 + random() * 34,
    ),
    riseMs: Math.round(
      challenge ? 5_200 + random() * 2_600 : 9_000 + random() * 4_000,
    ),
  };
}

export type ChallengeScore = {
  score: number;
  /** Current chain length; same-color pops and golden bubbles extend it. */
  combo: number;
  bestCombo: number;
  lastColor: BubbleColor | null;
};

export const START_SCORE: ChallengeScore = {
  score: 0,
  combo: 0,
  bestCombo: 0,
  lastColor: null,
};

/** Points multiply with the chain, capped at five times. */
export function multiplierFor(combo: number): number {
  return Math.max(1, Math.min(MAX_MULTIPLIER, combo));
}

/**
 * Scores one pop. A bubble the same color as the previous pop extends the
 * chain; a golden bubble extends any chain without changing its color.
 */
export function scorePop(
  state: ChallengeScore,
  bubble: Pick<Bubble, "color" | "golden">,
): { state: ChallengeScore; points: number } {
  const combo =
    bubble.golden || bubble.color === state.lastColor ? state.combo + 1 : 1;
  const points =
    (bubble.golden ? GOLDEN_POINTS : BASE_POINTS) * multiplierFor(combo);
  return {
    points,
    state: {
      score: state.score + points,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      lastColor: bubble.golden
        ? (state.lastColor ?? bubble.color)
        : bubble.color,
    },
  };
}
