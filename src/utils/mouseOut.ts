/**
 * Mouse Out rules with no React or DOM dependency: steer the mouse through a
 * little maze to the cheese. Walls just stop the mouse; there is no timer.
 */

/** Each maze: `#` wall, `.` path, `M` mouse start, `C` cheese. */
export const MAZES: string[][] = [
  ["M..#...", "##.#.#.", "...#.#.", ".###.#.", "...#.#.", "#.....#", "####..C"],
  ["M.....#", "#####.#", "#.....#", "#.#####", "#.....#", "#####..", "C......"],
  ["M#.....", ".#.###.", ".#...#.", ".###.#.", ".....#.", "####.#.", "C....#."],
  ["M..#..C", ".#.#.#.", ".#...#.", ".#####.", ".......", "######.", "......."],
  ["M......", "######.", ".......", ".######", ".......", "######.", "C......"],
];

export type Spot = { row: number; col: number };
export type Step = "up" | "down" | "left" | "right";

const DELTA: Record<Step, Spot> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

export function findCell(maze: string[], mark: string): Spot {
  const row = maze.findIndex((line) => line.includes(mark));
  return { row, col: maze[row]?.indexOf(mark) ?? -1 };
}

/** The mouse's next spot; it stays put against a wall or the edge. */
export function stepMouse(maze: string[], at: Spot, step: Step): Spot {
  const row = at.row + DELTA[step].row;
  const col = at.col + DELTA[step].col;
  const cell = maze[row]?.[col];
  return cell === undefined || cell === "#" ? at : { row, col };
}
