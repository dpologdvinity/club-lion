/**
 * Magic Pop rules with no React or DOM dependency: magic bubbles float up;
 * the wand glows one colour at a time and only bubbles of that colour pop.
 * Other bubbles just bounce off the wand's sparkle. No penalties.
 */

export const MAGIC_ROUND_MS = 40_000;
export const MAGIC_MAX_SCORE = 300;
export const MAGIC_COLORS = [
  { id: "pink", hex: "#ff6fae" },
  { id: "blue", hex: "#4aa8ff" },
  { id: "green", hex: "#4cc97a" },
  { id: "gold", hex: "#ffc83a" },
] as const;
export type MagicColor = (typeof MAGIC_COLORS)[number]["id"];

/** The wand's colour at `ms`: changes every 6 seconds. */
export function wandColor(ms: number): MagicColor {
  return MAGIC_COLORS[Math.floor(ms / 6000) % MAGIC_COLORS.length].id;
}

export type MagicBubble = {
  id: number;
  color: MagicColor;
  x: number;
  start: number;
  /** Rise speed in % of the field per second. */
  speed: number;
};

/** Height above the bottom (0–110 %) at `ms`; above 105 it has floated away. */
export function bubbleY(b: MagicBubble, ms: number): number {
  return ((ms - b.start) / 1000) * b.speed;
}

export function makeBubble(
  id: number,
  ms: number,
  random: () => number = Math.random,
): MagicBubble {
  // Half the bubbles match the wand, so there is always something to pop.
  const color =
    random() < 0.5
      ? wandColor(ms)
      : MAGIC_COLORS[Math.min(3, Math.floor(random() * 4))].id;
  return {
    id,
    color,
    x: 8 + random() * 84,
    start: ms,
    speed: 12 + random() * 8,
  };
}
