/**
 * King Me rules with no React or DOM dependency: checkers on a 6 × 6 board.
 * The child plays red from the bottom, Pip plays black from the top. Pieces
 * move diagonally forward, jump to capture, and become kings on the far row.
 * Jumps are encouraged but never forced, to keep it gentle.
 */

export const KING_SIZE = 6;
export type Side = "red" | "black";
export type Piece = { side: Side; king: boolean };
export type Checkers = (Piece | null)[];
export type Move = { from: number; to: number; jumped: number | null };

const at = (r: number, c: number) => r * KING_SIZE + c;

export function newCheckers(): Checkers {
  return Array.from({ length: KING_SIZE * KING_SIZE }, (_, i) => {
    const r = Math.floor(i / KING_SIZE);
    const c = i % KING_SIZE;
    if ((r + c) % 2 === 0) return null;
    if (r < 2) return { side: "black", king: false };
    if (r >= KING_SIZE - 2) return { side: "red", king: false };
    return null;
  });
}

/** Every legal move for `side`, jumps included. */
export function movesFor(board: Checkers, side: Side): Move[] {
  const out: Move[] = [];
  board.forEach((piece, i) => {
    if (piece?.side !== side) return;
    const r = Math.floor(i / KING_SIZE);
    const c = i % KING_SIZE;
    const forward = side === "red" ? -1 : 1;
    const dirs = piece.king ? [-1, 1] : [forward];
    for (const dr of dirs)
      for (const dc of [-1, 1]) {
        const r1 = r + dr;
        const c1 = c + dc;
        if (r1 < 0 || c1 < 0 || r1 >= KING_SIZE || c1 >= KING_SIZE) continue;
        const next = board[at(r1, c1)];
        if (!next) out.push({ from: i, to: at(r1, c1), jumped: null });
        else if (next.side !== side) {
          const r2 = r1 + dr;
          const c2 = c1 + dc;
          if (
            r2 >= 0 &&
            c2 >= 0 &&
            r2 < KING_SIZE &&
            c2 < KING_SIZE &&
            !board[at(r2, c2)]
          )
            out.push({ from: i, to: at(r2, c2), jumped: at(r1, c1) });
        }
      }
  });
  return out;
}

export function applyMove(board: Checkers, move: Move): Checkers {
  const next = [...board];
  const piece = next[move.from];
  if (!piece) return board;
  next[move.from] = null;
  if (move.jumped !== null) next[move.jumped] = null;
  const row = Math.floor(move.to / KING_SIZE);
  const crowned =
    (piece.side === "red" && row === 0) ||
    (piece.side === "black" && row === KING_SIZE - 1);
  next[move.to] = { ...piece, king: piece.king || crowned };
  return next;
}

/** Pip prefers a jump, otherwise any move; returns null when stuck. */
export function pipChecker(
  board: Checkers,
  random: () => number = Math.random,
): Move | null {
  const moves = movesFor(board, "black");
  if (!moves.length) return null;
  const jumps = moves.filter((m) => m.jumped !== null);
  const pool = jumps.length && random() < 0.7 ? jumps : moves;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}

export function countSide(board: Checkers, side: Side): number {
  return board.filter((p) => p?.side === side).length;
}
