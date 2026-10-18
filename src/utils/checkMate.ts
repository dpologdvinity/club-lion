/**
 * Check Mate rules with no React or DOM dependency: a gentle chess trainer.
 * One piece and some stars sit on a 6 × 6 board; tap a square the piece can
 * move to. Landing on a star collects it. Every move is allowed to be tried;
 * squares it cannot reach just show where it can go.
 */

export const CHESS_SIZE = 6;
export type PieceKind = "rook" | "bishop" | "knight" | "queen" | "king";
export const PIECE_EMOJI: Record<PieceKind, string> = {
  rook: "♜",
  bishop: "♝",
  knight: "♞",
  queen: "♛",
  king: "♚",
};

export type ChessLevel = {
  piece: PieceKind;
  start: [number, number];
  stars: [number, number][];
};

export const CHESS_LEVELS: ChessLevel[] = [
  {
    piece: "rook",
    start: [5, 0],
    stars: [
      [0, 0],
      [0, 5],
      [3, 5],
    ],
  },
  {
    piece: "bishop",
    start: [5, 0],
    stars: [
      [2, 3],
      [0, 5],
      [1, 4],
    ],
  },
  {
    piece: "knight",
    start: [5, 0],
    stars: [
      [3, 1],
      [1, 2],
      [2, 4],
    ],
  },
  {
    piece: "king",
    start: [3, 2],
    stars: [
      [2, 3],
      [1, 3],
      [1, 2],
    ],
  },
  {
    piece: "queen",
    start: [5, 5],
    stars: [
      [5, 0],
      [0, 5],
      [2, 2],
    ],
  },
];

/** Squares `piece` at `from` can move to on an empty board. */
export function reachable(
  piece: PieceKind,
  from: [number, number],
): [number, number][] {
  const [r, c] = from;
  const on = (rr: number, cc: number) =>
    rr >= 0 && cc >= 0 && rr < CHESS_SIZE && cc < CHESS_SIZE;
  const out: [number, number][] = [];
  const slide = (dirs: number[][]) => {
    for (const [dr, dc] of dirs)
      for (let k = 1; on(r + dr * k, c + dc * k); k++)
        out.push([r + dr * k, c + dc * k]);
  };
  const ROOK = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const BISHOP = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  if (piece === "rook") slide(ROOK);
  if (piece === "bishop") slide(BISHOP);
  if (piece === "queen") slide([...ROOK, ...BISHOP]);
  if (piece === "king")
    for (const [dr, dc] of [...ROOK, ...BISHOP])
      if (on(r + dr, c + dc)) out.push([r + dr, c + dc]);
  if (piece === "knight")
    for (const [dr, dc] of [
      [1, 2],
      [2, 1],
      [-1, 2],
      [-2, 1],
      [1, -2],
      [2, -1],
      [-1, -2],
      [-2, -1],
    ])
      if (on(r + dr, c + dc)) out.push([r + dr, c + dc]);
  return out;
}
