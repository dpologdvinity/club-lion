/**
 * Picture Puzzle rules with no React or DOM dependency: the three pictures,
 * the grid each one is cut into, the jigsaw outline of every piece, and the
 * snap distance that decides when a dropped piece has found its slot.
 */

/** Every picture is drawn in this box; piece outlines use the same units. */
export const PUZZLE_WIDTH = 400;
export const PUZZLE_HEIGHT = 300;

export const PIECE_COUNTS = [4, 6, 9] as const;
export type PieceCount = (typeof PIECE_COUNTS)[number];

/** One picture per round, each cut into a bigger grid than the last. */
export const PICTURES = [
  { id: "savanna-lion", name: "Lion on the savanna", pieces: 4 },
  { id: "beach-day", name: "Beach day", pieces: 6 },
  { id: "ferris-wheel", name: "Ferris wheel", pieces: 9 },
] as const satisfies readonly {
  id: string;
  name: string;
  pieces: PieceCount;
}[];
export type PictureId = (typeof PICTURES)[number]["id"];

export const PICTURE_PUZZLE_ROUNDS = PICTURES.length;
/** Coins for finishing a picture, by its piece count. */
export const PICTURE_PUZZLE_COINS: Record<PieceCount, number> = {
  4: 5,
  6: 8,
  9: 12,
};
/** Finishes stop paying after this many, so replaying cannot farm coins. */
export const PICTURE_PUZZLE_MAX_PAID = 60;

export function isPieceCount(value: unknown): value is PieceCount {
  return PIECE_COUNTS.some((count) => count === value);
}

/** Columns and rows for each piece count: 2×2, 3×2 and 3×3. */
export function gridFor(pieces: PieceCount): { cols: number; rows: number } {
  if (pieces === 4) return { cols: 2, rows: 2 };
  if (pieces === 6) return { cols: 3, rows: 2 };
  return { cols: 3, rows: 3 };
}

export type Point = { x: number; y: number };

/** Knob depth as a share of the shorter cell side; the outline pads by this much. */
const KNOB_DEPTH = 0.27;

/*
 * One edge's knob: straight to 40%, out and back over the top, straight to
 * the end. Each row is [control1, control2, end] as [along, out] pairs.
 */
const KNOB = [
  [
    [0.4, 0.06],
    [0.33, 0.08],
    [0.33, 0.15],
  ],
  [
    [0.33, 0.27],
    [0.67, 0.27],
    [0.67, 0.15],
  ],
  [
    [0.67, 0.08],
    [0.6, 0.06],
    [0.6, 0],
  ],
] as const;

/**
 * Knob direction of the right and bottom edge of a cell: +1 bulges out, -1
 * notches in. The neighbour's matching edge takes the opposite sign, so the
 * two outlines interlock exactly.
 */
function knobSign(col: number, row: number, horizontal: boolean): number {
  return (col + row * 2 + (horizontal ? 1 : 0)) % 2 === 0 ? 1 : -1;
}

/** Path for one edge from `from` to `to`; `sign` 0 keeps the edge flat. */
function edgePath(from: Point, to: Point, sign: number, depth: number): string {
  if (sign === 0) return `L${to.x} ${to.y}`;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const along = { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
  // Clockwise traversal in screen space: the outward normal is the direction turned left.
  const out = { x: along.y, y: -along.x };
  const at = (u: number, v: number) =>
    `${from.x + along.x * u * length + out.x * v * depth * sign} ${
      from.y + along.y * u * length + out.y * v * depth * sign
    }`;
  let d = `L${at(0.4, 0)}`;
  for (const [first, second, end] of KNOB) {
    d += `C${at(first[0], first[1])} ${at(second[0], second[1])} ${at(end[0], end[1])}`;
  }
  return `${d}L${to.x} ${to.y}`;
}

export type PieceShape = {
  /** Board slot index, which is also the piece's correct place. */
  index: number;
  /** Closed jigsaw outline in picture units. */
  d: string;
  /** Plain cell rectangle; the knobs reach past it by `pad`. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Space the knobs need on every side of the cell rectangle. */
  pad: number;
};

/** Every slot's jigsaw outline for a piece count, in slot order. */
export function pieceShapes(pieces: PieceCount): PieceShape[] {
  const { cols, rows } = gridFor(pieces);
  const width = PUZZLE_WIDTH / cols;
  const height = PUZZLE_HEIGHT / rows;
  const depth = Math.min(width, height);
  const pad = Math.ceil(depth * (KNOB_DEPTH + 0.03));
  return Array.from({ length: pieces }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * width;
    const y = row * height;
    const topLeft = { x, y };
    const topRight = { x: x + width, y };
    const bottomRight = { x: x + width, y: y + height };
    const bottomLeft = { x, y: y + height };
    // Top and bottom borders copy the neighbour's knob, with the sign flipped.
    const top = row === 0 ? 0 : -knobSign(col, row - 1, true);
    const right = col === cols - 1 ? 0 : knobSign(col, row, false);
    const bottom = row === rows - 1 ? 0 : knobSign(col, row, true);
    const left = col === 0 ? 0 : -knobSign(col - 1, row, false);
    const d = [
      `M${topLeft.x} ${topLeft.y}`,
      edgePath(topLeft, topRight, top, depth),
      edgePath(topRight, bottomRight, right, depth),
      edgePath(bottomRight, bottomLeft, bottom, depth),
      edgePath(bottomLeft, topLeft, left, depth),
      "Z",
    ].join("");
    return { index, d, x, y, width, height, pad };
  });
}

/** Centre of a slot in picture units. */
export function slotCenter(shape: PieceShape): Point {
  return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
}

/**
 * True when a dropped point is close enough to a slot centre to snap in.
 * `slotSize` is the slot's shorter side in the same units as the points.
 */
export function isNearSlot(
  point: Point,
  center: Point,
  slotSize: number,
): boolean {
  return Math.hypot(point.x - center.x, point.y - center.y) < slotSize * 0.6;
}

/** Fisher-Yates copy of the piece indexes, so the tray never starts in order. */
export function shufflePieces(count: number, random = Math.random): number[] {
  const copy = Array.from({ length: count }, (_, index) => index);
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}
