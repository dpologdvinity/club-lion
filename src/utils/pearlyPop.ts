/**
 * Pearly Pop rules with no React or DOM dependency: tap a group of two or
 * more touching pearls of one colour to pop them; the rest fall down and
 * slide together. Bigger groups score more. The game ends when no group is
 * left.
 */

export const PEARL_COLS = 6;
export const PEARL_ROWS = 7;
export const PEARLS = ["🔴", "🟡", "🔵", "🟢"];
export const PEARL_MAX_SCORE = 20_000;

/** Column-major board: board[col][row], row 0 at the bottom; null is empty. */
export type PearlBoard = (number | null)[][];

export function makePearlBoard(random: () => number = Math.random): PearlBoard {
  return Array.from({ length: PEARL_COLS }, () =>
    Array.from({ length: PEARL_ROWS }, () =>
      Math.min(PEARLS.length - 1, Math.floor(random() * PEARLS.length)),
    ),
  );
}

/** Every cell in the same-colour group touching (col, row). */
export function groupAt(
  board: PearlBoard,
  col: number,
  row: number,
): [number, number][] {
  const color = board[col]?.[row];
  if (color === null || color === undefined) return [];
  const seen = new Set([`${col},${row}`]);
  const stack: [number, number][] = [[col, row]];
  const group: [number, number][] = [];
  while (stack.length) {
    const [c, r] = stack.pop()!;
    group.push([c, r]);
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nc = c + dc;
      const nr = r + dr;
      if (board[nc]?.[nr] === color && !seen.has(`${nc},${nr}`)) {
        seen.add(`${nc},${nr}`);
        stack.push([nc, nr]);
      }
    }
  }
  return group;
}

/** Points for a group: grows with its size squared. */
export function groupPoints(size: number): number {
  return size < 2 ? 0 : (size - 1) * (size - 1) * 5;
}

/** Pops a group of 2+; pearls fall and empty columns close up. */
export function popGroup(
  board: PearlBoard,
  col: number,
  row: number,
): { board: PearlBoard; popped: number } {
  const group = groupAt(board, col, row);
  if (group.length < 2) return { board, popped: 0 };
  const gone = new Set(group.map(([c, r]) => `${c},${r}`));
  const columns = board
    .map((column, c) =>
      column.filter((cell, r) => cell !== null && !gone.has(`${c},${r}`)),
    )
    .filter((column) => column.length > 0);
  const next: PearlBoard = Array.from({ length: PEARL_COLS }, (_, c) =>
    Array.from({ length: PEARL_ROWS }, (_, r) => columns[c]?.[r] ?? null),
  );
  return { board: next, popped: group.length };
}

/** Whether any group of two or more is left to pop. */
export function hasGroup(board: PearlBoard): boolean {
  return board.some((column, c) =>
    column.some((cell, r) => {
      if (cell === null) return false;
      return board[c + 1]?.[r] === cell || column[r + 1] === cell;
    }),
  );
}
