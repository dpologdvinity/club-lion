/**
 * Stained Glass rules with no React or DOM dependency: pick a colour and tap
 * each pane of a window to fill it. Any colour is right; a window is done
 * when every pane has one.
 */

export const GLASS_COLORS = [
  { id: "ruby", hex: "#e8333a", label: "red" },
  { id: "amber", hex: "#ffb52e", label: "orange" },
  { id: "lemon", hex: "#ffe14a", label: "yellow" },
  { id: "leaf", hex: "#4cc97a", label: "green" },
  { id: "sky", hex: "#4aa8ff", label: "blue" },
  { id: "grape", hex: "#a77bff", label: "purple" },
  { id: "rose", hex: "#ff7ab0", label: "pink" },
] as const;

/**
 * Each window: a name and its panes as SVG paths in a 100 × 120 frame. Panes
 * are at least ~14 units across so each is a full finger-sized target.
 */
export const WINDOWS: { name: string; panes: string[] }[] = [
  {
    name: "Flower",
    panes: [
      "M50 15a15 15 0 1 1 0 30a15 15 0 1 1 0 -30Z",
      "M30 35a15 15 0 1 1 0 30a15 15 0 1 1 0 -30Z",
      "M70 35a15 15 0 1 1 0 30a15 15 0 1 1 0 -30Z",
      "M50 55a15 15 0 1 1 0 30a15 15 0 1 1 0 -30Z",
      "M50 40a10 10 0 1 1 0 20a10 10 0 1 1 0 -20Z",
      "M43 86H57V116H43Z",
      "M57 100Q70 82 90 90Q78 110 57 106Z",
    ],
  },
  {
    name: "Rainbow",
    panes: [
      "M6 104A44 44 0 0 1 94 104H80A30 30 0 0 0 20 104Z",
      "M20 104A30 30 0 0 1 80 104H66A16 16 0 0 0 34 104Z",
      "M34 104A16 16 0 0 1 66 104Z",
      "M10 30a10 10 0 0 1 18 -4a10 10 0 0 1 16 8a8 8 0 0 1 -2 14H12a8 8 0 0 1 -2 -18Z",
      "M58 20a10 10 0 0 1 18 -4a10 10 0 0 1 16 8a8 8 0 0 1 -2 14H60a8 8 0 0 1 -2 -18Z",
    ],
  },
  {
    name: "Butterfly",
    panes: [
      "M43 40Q18 8 8 32Q4 58 43 58Z",
      "M57 40Q82 8 92 32Q96 58 57 58Z",
      "M43 62Q12 62 18 90Q30 104 43 78Z",
      "M57 62Q88 62 82 90Q70 104 57 78Z",
      "M43 30H57V96H43Z",
    ],
  },
  {
    name: "Sun",
    panes: [
      "M50 38a22 22 0 1 1 0 44a22 22 0 1 1 0 -44Z",
      "M41 10H59L50 34Z",
      "M41 112H59L50 86Z",
      "M6 51V69L28 60Z",
      "M94 51V69L72 60Z",
      "M14 20L28 12L36 40Z",
      "M86 100L72 108L64 80Z",
    ],
  },
];
