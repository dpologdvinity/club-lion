/**
 * Staries rules with no React or DOM dependency: tap the numbered stars in
 * order to draw each constellation picture.
 */

export type Constellation = {
  name: string;
  emoji: string;
  /** Star positions in a 100 × 100 sky, in drawing order. */
  stars: [number, number][];
};

export const CONSTELLATIONS: Constellation[] = [
  {
    name: "Heart",
    emoji: "💖",
    stars: [
      [50, 85],
      [20, 55],
      [22, 28],
      [50, 38],
      [78, 28],
      [80, 55],
    ],
  },
  {
    name: "House",
    emoji: "🏠",
    stars: [
      [25, 85],
      [25, 50],
      [50, 22],
      [75, 50],
      [75, 85],
    ],
  },
  {
    name: "Fish",
    emoji: "🐟",
    stars: [
      [15, 50],
      [40, 30],
      [70, 45],
      [88, 28],
      [88, 72],
      [70, 55],
      [40, 70],
    ],
  },
  {
    name: "Kite",
    emoji: "🪁",
    stars: [
      [50, 12],
      [78, 42],
      [50, 72],
      [22, 42],
    ],
  },
  {
    name: "Crown",
    emoji: "👑",
    stars: [
      [15, 75],
      [20, 30],
      [35, 55],
      [50, 22],
      [65, 55],
      [80, 30],
      [85, 75],
    ],
  },
  {
    name: "Rocket",
    emoji: "🚀",
    stars: [
      [50, 10],
      [65, 40],
      [65, 75],
      [50, 88],
      [35, 75],
      [35, 40],
    ],
  },
];
