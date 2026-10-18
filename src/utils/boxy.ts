/**
 * Boxy rules with no React or DOM dependency: push every box onto a goal.
 * Boxy can push one box at a time and never pull; Reset is always there.
 */

/** Levels: `#` wall, `.` floor, `B` box, `G` goal, `*` box on goal, `P` Boxy. */
export const BOXY_LEVELS: string[][] = [
  ["#######", "#P.B.G#", "#######"],
  ["######", "#P...#", "#.B..#", "#..BG#", "#...G#", "######"],
  ["#######", "#..G..#", "#..B..#", "#GBPBG#", "#..B..#", "#..G..#", "#######"],
  ["######", "#G..G#", "#.BB.#", "#..P.#", "#....#", "######"],
  ["#######", "#P....#", "#.B.B.#", "#.#.#.#", "#G...G#", "#######"],
];

export type BoxyState = {
  walls: Set<string>;
  goals: Set<string>;
  boxes: Set<string>;
  player: [number, number];
};

const key = (r: number, c: number) => `${r},${c}`;

export function loadLevel(level: string[]): BoxyState {
  const state: BoxyState = {
    walls: new Set(),
    goals: new Set(),
    boxes: new Set(),
    player: [0, 0],
  };
  level.forEach((line, r) =>
    [...line].forEach((ch, c) => {
      if (ch === "#") state.walls.add(key(r, c));
      if (ch === "G" || ch === "*") state.goals.add(key(r, c));
      if (ch === "B" || ch === "*") state.boxes.add(key(r, c));
      if (ch === "P") state.player = [r, c];
    }),
  );
  return state;
}

const DELTA = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
} as const;
export type BoxyStep = keyof typeof DELTA;

/** One step: walk, or push a box if the cell beyond it is free. */
export function moveBoxy(state: BoxyState, step: BoxyStep): BoxyState {
  const [dr, dc] = DELTA[step];
  const [r, c] = state.player;
  const next = key(r + dr, c + dc);
  if (state.walls.has(next)) return state;
  if (!state.boxes.has(next)) return { ...state, player: [r + dr, c + dc] };
  const beyond = key(r + 2 * dr, c + 2 * dc);
  if (state.walls.has(beyond) || state.boxes.has(beyond)) return state;
  const boxes = new Set(state.boxes);
  boxes.delete(next);
  boxes.add(beyond);
  return { ...state, boxes, player: [r + dr, c + dc] };
}

export function isSolved(state: BoxyState): boolean {
  return [...state.boxes].every((b) => state.goals.has(b));
}
