/**
 * Bubble Bug rules with no React or DOM dependency: bubbles hang from the
 * top of six columns. The bug shoots a bubble up a column; it sticks under
 * the lowest bubble there, and three or more touching of one colour pop.
 */

export const BUG_COLS = 6;
export const BUG_ROWS = 9;
export const BUG_SHOTS = 30;
export const BUG_MAX_SCORE = 400;
export const BUG_COLORS = ["🔴", "🟡", "🔵", "🟢"];

/** grid[col][row], row 0 at the top; null is empty. */
export type BugGrid = (number | null)[][];

export function makeBugGrid(
  random: () => number = Math.random,
  filledRows = 3,
): BugGrid {
  return Array.from({ length: BUG_COLS }, () =>
    Array.from({ length: BUG_ROWS }, (_, row) =>
      row < filledRows
        ? Math.min(
            BUG_COLORS.length - 1,
            Math.floor(random() * BUG_COLORS.length),
          )
        : null,
    ),
  );
}

/** Same-colour group touching (col, row), as [col, row] pairs. */
function group(grid: BugGrid, col: number, row: number): [number, number][] {
  const color = grid[col]?.[row];
  if (color === null || color === undefined) return [];
  const seen = new Set([`${col},${row}`]);
  const stack: [number, number][] = [[col, row]];
  const out: [number, number][] = [];
  while (stack.length) {
    const [c, r] = stack.pop()!;
    out.push([c, r]);
    for (const [nc, nr] of [
      [c + 1, r],
      [c - 1, r],
      [c, r + 1],
      [c, r - 1],
    ])
      if (grid[nc]?.[nr] === color && !seen.has(`${nc},${nr}`)) {
        seen.add(`${nc},${nr}`);
        stack.push([nc, nr]);
      }
  }
  return out;
}

/**
 * Shoots `color` up column `col`: it sticks below the column's lowest
 * bubble; a group of 3+ pops and the column closes upward. Returns the new
 * grid and how many popped. A full column returns the grid unchanged.
 */
export function shoot(
  grid: BugGrid,
  col: number,
  color: number,
): { grid: BugGrid; popped: number; stuck: boolean } {
  const column = grid[col];
  if (!column) return { grid, popped: 0, stuck: false };
  const row = column.findIndex((cell) => cell === null);
  if (row < 0) return { grid, popped: 0, stuck: false };
  const placed = grid.map((c, i) =>
    i === col ? c.map((cell, r) => (r === row ? color : cell)) : c,
  );
  const hit = group(placed, col, row);
  if (hit.length < 3) return { grid: placed, popped: 0, stuck: true };
  const gone = new Set(hit.map(([c, r]) => `${c},${r}`));
  const next = placed.map((c, ci) => {
    const kept = c.filter(
      (cell, r) => cell !== null && !gone.has(`${ci},${r}`),
    );
    return Array.from({ length: BUG_ROWS }, (_, r) => kept[r] ?? null);
  });
  return { grid: next, popped: hit.length, stuck: true };
}
