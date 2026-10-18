/**
 * Candy Swap rules with no React or DOM dependency: swap two neighbouring
 * candies to line up three or more of a kind; lines pop, candies fall and
 * new ones drop in. A swap that makes no line just slides back.
 */

export const CANDY_SIZE = 6;
export const CANDY_MOVES = 20;
export const CANDY_MAX_SCORE = 600;
export const CANDIES = ["🍬", "🍭", "🍫", "🍩", "🧁"];

/** Row-major grid of candy indexes into CANDIES. */
export type CandyGrid = number[];

const pick = (random: () => number) =>
  Math.min(CANDIES.length - 1, Math.floor(random() * CANDIES.length));

/** A full grid with no ready-made lines. */
export function makeCandyGrid(random: () => number = Math.random): CandyGrid {
  const grid: CandyGrid = [];
  for (let i = 0; i < CANDY_SIZE * CANDY_SIZE; i++) {
    const row = Math.floor(i / CANDY_SIZE);
    const col = i % CANDY_SIZE;
    let candy = pick(random);
    for (let tries = 0; tries < 10; tries++) {
      const rowLine =
        col >= 2 && grid[i - 1] === candy && grid[i - 2] === candy;
      const colLine =
        row >= 2 &&
        grid[i - CANDY_SIZE] === candy &&
        grid[i - 2 * CANDY_SIZE] === candy;
      if (!rowLine && !colLine) break;
      candy = (candy + 1) % CANDIES.length;
    }
    grid.push(candy);
  }
  return grid;
}

/** Cells in any line of three or more of the same candy. */
export function findLines(grid: CandyGrid): Set<number> {
  const hit = new Set<number>();
  const n = CANDY_SIZE;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const i = r * n + c;
      if (c <= n - 3 && grid[i] === grid[i + 1] && grid[i] === grid[i + 2])
        [i, i + 1, i + 2].forEach((k) => hit.add(k));
      if (r <= n - 3 && grid[i] === grid[i + n] && grid[i] === grid[i + 2 * n])
        [i, i + n, i + 2 * n].forEach((k) => hit.add(k));
    }
  return hit;
}

export function areNeighbours(a: number, b: number): boolean {
  const n = CANDY_SIZE;
  const sameRow = Math.floor(a / n) === Math.floor(b / n);
  return (Math.abs(a - b) === 1 && sameRow) || Math.abs(a - b) === n;
}

export function swapCells(grid: CandyGrid, a: number, b: number): CandyGrid {
  const next = [...grid];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/**
 * Pops every line, lets candies fall and refills from the top, repeating
 * until the board is calm. Returns the calm grid and how many popped.
 */
export function settle(
  grid: CandyGrid,
  random: () => number = Math.random,
): { grid: CandyGrid; popped: number } {
  let current = grid;
  let popped = 0;
  for (let guard = 0; guard < 50; guard++) {
    const lines = findLines(current);
    if (!lines.size) break;
    popped += lines.size;
    const next = [...current];
    for (let c = 0; c < CANDY_SIZE; c++) {
      const kept: number[] = [];
      for (let r = CANDY_SIZE - 1; r >= 0; r--) {
        const i = r * CANDY_SIZE + c;
        if (!lines.has(i)) kept.push(current[i]);
      }
      for (let r = CANDY_SIZE - 1, k = 0; r >= 0; r--, k++)
        next[r * CANDY_SIZE + c] = k < kept.length ? kept[k] : pick(random);
    }
    current = next;
  }
  return { grid: current, popped };
}

/** Whether any neighbouring swap would make a line. */
export function hasMove(grid: CandyGrid): boolean {
  const n = CANDY_SIZE;
  for (let i = 0; i < n * n; i++)
    for (const j of [i + 1, i + n])
      if (
        j < n * n &&
        areNeighbours(i, j) &&
        findLines(swapCells(grid, i, j)).size
      )
        return true;
  return false;
}

/** A fresh playable grid: no ready-made lines and at least one move. */
export function makePlayableGrid(
  random: () => number = Math.random,
): CandyGrid {
  for (let tries = 0; tries < 20; tries++) {
    const grid = makeCandyGrid(random);
    if (hasMove(grid)) return grid;
  }
  return makeCandyGrid(random);
}
