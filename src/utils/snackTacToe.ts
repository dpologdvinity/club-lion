/**
 * Snack Tac Toe rules with no React or DOM dependency. The child plays donuts,
 * Pip plays cookies; Pip is friendly and only sometimes blocks.
 */

export type Snack = "donut" | "cookie";
export type Cell = Snack | null;
export type Board = Cell[];

export const TAC_ROUNDS = 3;
export const EMPTY_BOARD: Board = Array.from({ length: 9 }, () => null);

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

/** The winning snack and its line, "draw" when full, or null while playing. */
export function tacResult(
  board: Board,
): { winner: Snack; line: readonly number[] } | "draw" | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const first = board[a];
    if (first && first === board[b] && first === board[c])
      return { winner: first, line };
  }
  return board.every(Boolean) ? "draw" : null;
}

/** A cell that would finish a line of `snack`, if any. */
function finishing(board: Board, snack: Snack): number | undefined {
  for (const line of LINES) {
    const mine = line.filter((i) => board[i] === snack).length;
    const empty = line.filter((i) => board[i] === null);
    if (mine === 2 && empty.length === 1) return empty[0];
  }
  return undefined;
}

/**
 * Pip's move: takes a win, blocks the child only `blockChance` of the time,
 * then likes the middle, then any free cell. Returns -1 on a full board.
 */
export function pipMove(
  board: Board,
  random: () => number = Math.random,
  blockChance = 0.5,
): number {
  const free = board.flatMap((cell, i) => (cell === null ? [i] : []));
  if (!free.length) return -1;
  const win = finishing(board, "cookie");
  if (win !== undefined) return win;
  const block = finishing(board, "donut");
  if (block !== undefined && random() < blockChance) return block;
  if (board[4] === null && random() < 0.6) return 4;
  return free[Math.min(free.length - 1, Math.floor(random() * free.length))];
}

/** Match points: 2 for a win, 1 for a draw. */
export function roundPoints(result: ReturnType<typeof tacResult>): number {
  if (result === "draw") return 1;
  return result?.winner === "donut" ? 2 : 0;
}
