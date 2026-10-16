/**
 * Balloon Parade rules with no React or DOM dependency: the rainbow colour
 * order, the step that builds the arch, the surprise inside each balloon, and
 * a finished arch.
 */
import { SORTER_ANIMALS, type SorterAnimal } from "./shapeSorter.ts";

export const BALLOON_COLORS = [
  { id: "red", label: "Red", hex: "#ff5a5f" },
  { id: "orange", label: "Orange", hex: "#ff9f43" },
  { id: "yellow", label: "Yellow", hex: "#ffd84d" },
  { id: "green", label: "Green", hex: "#4cc97a" },
  { id: "blue", label: "Blue", hex: "#4aa8ff" },
  { id: "purple", label: "Purple", hex: "#a77bff" },
] as const;
export type BalloonColor = (typeof BALLOON_COLORS)[number]["id"];

/** The arch is built in this order, from the outside in. */
export const RAINBOW_ORDER: readonly BalloonColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
];

/** A balloon's surprise is an animal friend or a music note. */
export type Surprise = SorterAnimal | "note";
export const SURPRISES: readonly Surprise[] = [...SORTER_ANIMALS, "note"];

export function isBalloonColor(value: unknown): value is BalloonColor {
  return BALLOON_COLORS.some((color) => color.id === value);
}

/** How many arch stripes are already built, from 0 to the full six. */
export function rainbowProgress(progress: number, color: BalloonColor): number {
  return RAINBOW_ORDER[progress] === color ? progress + 1 : progress;
}

export function isRainbowFinished(progress: number): boolean {
  return progress >= RAINBOW_ORDER.length;
}

/**
 * Colour for a new balloon. In rainbow mode the next needed colour turns up
 * about half the time, so the arch fills without a long wait.
 */
export function spawnColor(
  mode: "pop" | "rainbow",
  progress: number,
  random = Math.random,
): BalloonColor {
  if (mode === "rainbow" && !isRainbowFinished(progress) && random() < 0.5)
    return RAINBOW_ORDER[progress];
  return BALLOON_COLORS[Math.floor(random() * BALLOON_COLORS.length)].id;
}

export function pickSurprise(random = Math.random): Surprise {
  return SURPRISES[Math.floor(random() * SURPRISES.length)];
}
