import { test } from "node:test";
import assert from "node:assert/strict";
import { FANTAGE_GAMES, isFantageGame } from "./fantage.ts";
import { STAMP_DEFINITIONS } from "../stamps/catalog.ts";
import {
  completeFantageGame,
  migratePlayerSave,
  newPlayer,
  restorePlayer,
} from "../game.ts";
import {
  makeMixupDeck,
  mixupStars,
  MIXUP_PAIRS,
} from "../utils/memoryMixup.ts";
import {
  EMPTY_BOARD,
  pipMove,
  roundPoints,
  tacResult,
  type Board,
} from "../utils/snackTacToe.ts";
import { nextHole, veggieUpMs } from "../utils/whackAVeggie.ts";
import { targetX, throwPoints } from "../utils/bullseye.ts";
import { makeMathQuestion } from "../utils/madMath.ts";
import { makeBooRound } from "../utils/typeBoo.ts";
import { CONSTELLATIONS } from "../utils/staries.ts";
import {
  CANDY_SIZE,
  areNeighbours,
  findLines,
  hasMove,
  makeCandyGrid,
  makePlayableGrid,
  settle,
} from "../utils/candySwap.ts";
import { meterLevel, shotPoints } from "../utils/buzzerBeater.ts";
import { MAZES, findCell, stepMouse } from "../utils/mouseOut.ts";
import { WINDOWS } from "../utils/stainedGlass.ts";
import { makePenguin, penguinX } from "../utils/snowDay.ts";
import {
  PEARL_COLS,
  PEARL_ROWS,
  groupAt,
  groupPoints,
  hasGroup,
  popGroup,
  type PearlBoard,
} from "../utils/pearlyPop.ts";
import {
  BRICKS_TOTAL,
  COURT_H,
  newBall,
  stepBall,
} from "../utils/bricksBreaking.ts";
import { stepGalaxy } from "../utils/galaxyHero.ts";
import {
  MAGIC_COLORS,
  bubbleY,
  makeBubble,
  wandColor,
} from "../utils/magicPop.ts";
import { boatX, dropCatch, jellyX, makeJellies } from "../utils/jellyFishin.ts";
import { boboSize, gobbled, swim } from "../utils/boboFish.ts";
import {
  BUG_COLS,
  BUG_ROWS,
  makeBugGrid,
  shoot,
  type BugGrid,
} from "../utils/bubbleBug.ts";
import { BOXY_LEVELS, isSolved, loadLevel, moveBoxy } from "../utils/boxy.ts";
import { CHESS_LEVELS, reachable } from "../utils/checkMate.ts";
import {
  KING_SIZE,
  applyMove,
  countSide,
  movesFor,
  newCheckers,
  pipChecker,
  type Checkers,
} from "../utils/kingMe.ts";
import { scrollTrack, touching } from "../utils/goCart.ts";
import { HOLES, aimAt, holeStars, inCup, rollBall } from "../utils/puttPutt.ts";
import {
  ROCKET_X,
  driftSky,
  flyRocket,
  nearRocket,
} from "../utils/rocketBoard.ts";
import {
  SPLASH_MAX_SCORE,
  jumpPoints,
  splashMeter,
} from "../utils/slideSplash.ts";
import {
  SPLASH_TARGETS,
  landingX,
  powerMeter,
  splashPoints,
} from "../utils/splashPowerUp.ts";

test("every Game Hall game has a unique id, a reachable stamp and a known stamp id", () => {
  const ids = FANTAGE_GAMES.map((game) => game.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const game of FANTAGE_GAMES) {
    assert.ok(game.stampScore <= game.maxScore, game.id);
    assert.ok(
      STAMP_DEFINITIONS.some((stamp) => stamp.id === game.stamp.id),
      game.stamp.id,
    );
  }
  assert.ok(isFantageGame("memory-mixup"));
  assert.ok(!isFantageGame("peekaboo"));
});

test("a Game Hall result saves the best once and pays the stamp at its score", () => {
  const player = migratePlayerSave(newPlayer());
  const low = completeFantageGame(player, "whack-a-veggie", 12);
  assert.equal(low.fantageBest?.["whack-a-veggie"], 12);
  assert.equal(low.gamesPlayed, player.gamesPlayed + 1);
  assert.ok(!low.stamps?.includes("veggie_whacker"));
  const high = completeFantageGame(low, "whack-a-veggie", 25);
  assert.equal(high.fantageBest?.["whack-a-veggie"], 25);
  assert.ok(high.stamps?.includes("veggie_whacker"));
  // A lower later score keeps the best; bad scores change nothing.
  assert.equal(
    completeFantageGame(high, "whack-a-veggie", 3).fantageBest?.[
      "whack-a-veggie"
    ],
    25,
  );
  for (const bad of [-1, 1.5, Number.NaN, 999])
    assert.equal(completeFantageGame(high, "whack-a-veggie", bad), high);
});

test("saved Game Hall bests restore only known games with scores in range", () => {
  const save = {
    ...newPlayer(),
    fantageBest: { "memory-mixup": 3, "snack-tac-toe": 99, bogus: 4 },
  };
  const restored = restorePlayer(JSON.stringify(save));
  assert.deepEqual(restored.fantageBest, { "memory-mixup": 3 });
  const old = restorePlayer(JSON.stringify(newPlayer()));
  assert.equal(old.fantageBest, undefined);
});

test("Memory Mixup deals every snack twice and gives stars by turns", () => {
  const deck = makeMixupDeck(() => 0.3);
  assert.equal(deck.length, MIXUP_PAIRS * 2);
  for (const card of deck)
    assert.equal(deck.filter((c) => c.snack === card.snack).length, 2);
  assert.equal(mixupStars(8), 3);
  assert.equal(mixupStars(12), 3);
  assert.equal(mixupStars(16), 2);
  assert.equal(mixupStars(30), 1);
});

test("Snack Tac Toe finds wins, draws, and Pip takes its own win", () => {
  const row: Board = ["donut", "donut", "donut", ...EMPTY_BOARD.slice(3)];
  const result = tacResult(row);
  assert.ok(result && result !== "draw");
  assert.equal(result.winner, "donut");
  assert.equal(roundPoints(result), 2);
  const full: Board = [
    "donut",
    "cookie",
    "donut",
    "donut",
    "cookie",
    "cookie",
    "cookie",
    "donut",
    "donut",
  ];
  assert.equal(tacResult(full), "draw");
  assert.equal(roundPoints("draw"), 1);
  const pipCanWin: Board = [
    "cookie",
    "cookie",
    null,
    "donut",
    "donut",
    null,
    null,
    null,
    null,
  ];
  assert.equal(
    pipMove(pipCanWin, () => 0.9),
    2,
  );
  // With no block roll Pip leaves the child's line open.
  const blockable: Board = [
    "donut",
    "donut",
    null,
    null,
    "cookie",
    null,
    null,
    null,
    null,
  ];
  assert.notEqual(
    pipMove(blockable, () => 0.99, 0.5),
    -1,
  );
  assert.equal(
    pipMove(blockable, () => 0, 0.5),
    2,
  );
  assert.equal(pipMove(full), -1);
});

test("Whack A Veggie speeds up gently and only picks free holes", () => {
  assert.equal(veggieUpMs(0), 1500);
  assert.ok(veggieUpMs(29_000) >= 700);
  assert.ok(veggieUpMs(20_000) < veggieUpMs(0));
  const busy = [true, true, true, true, false, true, true, true, true];
  assert.equal(
    nextHole(busy, () => 0.7),
    4,
  );
  assert.equal(nextHole(Array(9).fill(true)), -1);
});

test("Bullseye scores rings by distance and glides inside the lane", () => {
  assert.equal(throwPoints(50, 50), 10);
  assert.equal(throwPoints(50, 54), 5);
  assert.equal(throwPoints(50, 57), 3);
  assert.equal(throwPoints(50, 61), 1);
  assert.equal(throwPoints(50, 80), 0);
  for (let ms = 0; ms < 5200; ms += 130) {
    const x = targetX(ms);
    assert.ok(x >= 10 && x <= 90);
  }
});

test("Mad Math and Type Boo offer distinct choices that include the answer", () => {
  let seed = 1;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 50; i++) {
    const q = makeMathQuestion(random);
    assert.ok(q.count >= 1 && q.count <= 10);
    assert.equal(new Set(q.choices).size, 3);
    assert.ok(q.choices.includes(q.count));
    assert.equal(q.choices.length, 3);
    const boo = makeBooRound(random);
    assert.equal(new Set(boo.choices).size, 4);
    assert.ok(boo.choices.includes(boo.letter));
  }
});

test("Staries pictures stay inside the sky with at least four stars", () => {
  assert.equal(CONSTELLATIONS.length, 6);
  for (const sky of CONSTELLATIONS) {
    assert.ok(sky.stars.length >= 4, sky.name);
    for (const [x, y] of sky.stars)
      assert.ok(x >= 5 && x <= 95 && y >= 5 && y <= 95, sky.name);
  }
});

test("Candy Swap boards start calm, settle fully and always have a move", () => {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 20; i++) {
    const grid = makePlayableGrid(random);
    assert.equal(grid.length, CANDY_SIZE * CANDY_SIZE);
    assert.equal(findLines(grid).size, 0);
    assert.ok(hasMove(grid));
  }
  const lined = [0, 0, 0, ...makeCandyGrid(random).slice(3)];
  const { grid, popped } = settle(lined, random);
  assert.ok(popped >= 3);
  assert.equal(grid.length, lined.length);
  assert.equal(findLines(grid).size, 0);
  assert.ok(areNeighbours(0, 1) && areNeighbours(0, CANDY_SIZE));
  assert.ok(!areNeighbours(CANDY_SIZE - 1, CANDY_SIZE));
});

test("Buzzer Beater's meter stays 0–100 and the green zone swishes", () => {
  for (let ms = 0; ms < 3600; ms += 37) {
    const level = meterLevel(ms);
    assert.ok(level >= 0 && level <= 100);
  }
  assert.equal(shotPoints(70), 2);
  assert.equal(shotPoints(50), 1);
  assert.equal(shotPoints(20), 0);
});

test("every Mouse Out maze has one mouse, one cheese and a way through", () => {
  for (const maze of MAZES) {
    assert.equal(maze.join("").split("M").length - 1, 1);
    assert.equal(maze.join("").split("C").length - 1, 1);
    const start = findCell(maze, "M");
    const cheese = findCell(maze, "C");
    const seen = new Set([`${start.row},${start.col}`]);
    const queue = [start];
    let found = false;
    while (queue.length) {
      const at = queue.shift()!;
      if (at.row === cheese.row && at.col === cheese.col) found = true;
      for (const step of ["up", "down", "left", "right"] as const) {
        const to = stepMouse(maze, at, step);
        if (!seen.has(`${to.row},${to.col}`)) {
          seen.add(`${to.row},${to.col}`);
          queue.push(to);
        }
      }
    }
    assert.ok(found, maze.join("/"));
  }
});

test("Stained Glass has four windows of at least four panes", () => {
  assert.equal(WINDOWS.length, 4);
  for (const glass of WINDOWS) assert.ok(glass.panes.length >= 4, glass.name);
});

test("Snow Day penguins slide in from an edge and out the other side", () => {
  const p = makePenguin(1, 0, () => 0.1);
  assert.ok(p.lane >= 0 && p.lane < 3);
  const enter = penguinX(p, 0);
  assert.ok(enter < 0 || enter > 100, "starts off-lane");
  const later = penguinX(p, 3000);
  assert.ok(later > -10 && later < 110);
  assert.ok(Math.abs(penguinX(p, 20_000) - 50) > 60, "long gone");
});

test("Pearly Pop pops touching groups, drops pearls and closes columns", () => {
  const board: PearlBoard = Array.from({ length: PEARL_COLS }, (_, c) =>
    Array.from({ length: PEARL_ROWS }, (_, r) => (c + r) % 4),
  );
  // A lone pearl does nothing.
  assert.equal(popGroup(board, 0, 0).popped, 0);
  board[0][0] = 1;
  board[0][1] = 1;
  board[1][0] = 1;
  assert.equal(groupAt(board, 0, 0).length >= 3, true);
  const { board: next, popped } = popGroup(board, 0, 0);
  assert.ok(popped >= 3);
  // Pearls above fell into the gap: the bottom of column 0 is filled.
  assert.notEqual(next[0][0], null);
  assert.equal(groupPoints(2), 5);
  assert.equal(groupPoints(5), 80);
  const lonely: PearlBoard = Array.from({ length: PEARL_COLS }, (_, c) =>
    Array.from({ length: PEARL_ROWS }, (_, r) =>
      c === 0 && r === 0 ? 2 : null,
    ),
  );
  assert.ok(!hasGroup(lonely));
  const emptied = popGroup(
    [[3, 3, ...Array(PEARL_ROWS - 2).fill(null)], ...lonely.slice(1)],
    0,
    0,
  );
  assert.equal(emptied.popped, 2);
});

test("Bricks Breaking never loses the ball and breaks bricks it hits", () => {
  let ball = newBall();
  const standing = Array<boolean>(BRICKS_TOTAL).fill(true);
  let broken = 0;
  for (let i = 0; i < 600; i++) {
    const step = stepBall(ball, 1 / 60, 50, standing);
    ball = step.ball;
    for (const b of step.broke) {
      standing[b] = false;
      broken++;
    }
    assert.ok(ball.y <= COURT_H && ball.y >= 0 && ball.x >= 0 && ball.x <= 100);
  }
  assert.ok(broken > 0);
});

test("Galaxy Hero shots zap meteors in their path", () => {
  const meteors = [{ id: 1, x: 50, y: 40, speed: 0 }];
  const shots = [{ id: 2, x: 50, y: 44 }];
  const stepped = stepGalaxy(meteors, shots, 0.01);
  assert.equal(stepped.hits, 1);
  assert.equal(stepped.meteors.length, 0);
  assert.equal(stepped.shots.length, 0);
  const miss = stepGalaxy([{ id: 1, x: 10, y: 40, speed: 10 }], [], 1);
  assert.equal(miss.hits, 0);
  assert.equal(miss.meteors[0].y, 50);
});

test("Magic Pop's wand cycles colours and half the bubbles match it", () => {
  assert.equal(wandColor(0), MAGIC_COLORS[0].id);
  assert.equal(wandColor(6500), MAGIC_COLORS[1].id);
  const matching = makeBubble(1, 0, () => 0.1);
  assert.equal(matching.color, wandColor(0));
  assert.equal(bubbleY(matching, 0), 0);
  assert.ok(bubbleY(matching, 2000) > 20);
});

test("Jelly Fishin' catches the jelly under the hook, gold for 3", () => {
  const jellies = makeJellies(() => 0);
  const x = jellyX(jellies[0], 0);
  const caught = dropCatch(jellies, x, 0);
  assert.equal(caught.index, 0);
  assert.equal(caught.points, jellies[0].gold ? 3 : 1);
  for (let ms = 0; ms < 8000; ms += 250) {
    const b = boatX(ms);
    assert.ok(b >= 10 && b <= 90);
  }
  assert.ok(jellies.filter((j) => j.gold).length === 1);
});

test("BoBo grows by eating smaller fish and bigger fish are never eaten", () => {
  const size = boboSize(0);
  const fish = [
    { id: 1, x: 50, y: 50, vx: 0, size: size / 2 },
    { id: 2, x: 52, y: 50, vx: 0, size: size * 2 },
  ];
  assert.deepEqual(gobbled(fish, 50, 50, size), [1]);
  assert.ok(boboSize(20) > size);
  const gone = swim([{ id: 3, x: 110, y: 50, vx: 10, size: 3 }], 1);
  assert.equal(gone.length, 0);
});

test("Bubble Bug sticks bubbles under a column and pops threes", () => {
  const grid: BugGrid = Array.from({ length: BUG_COLS }, () =>
    Array<number | null>(BUG_ROWS).fill(null),
  );
  grid[0][0] = 1;
  grid[0][1] = 1;
  const popped = shoot(grid, 0, 1);
  assert.equal(popped.popped, 3);
  assert.equal(popped.grid[0][0], null);
  const stuck = shoot(grid, 1, 2);
  assert.equal(stuck.popped, 0);
  assert.equal(stuck.grid[1][0], 2);
  const full = grid.map((c, i) => (i === 2 ? c.map(() => 3) : c));
  assert.equal(shoot(full, 2, 0).stuck, false);
  const start = makeBugGrid(() => 0.4);
  assert.equal(start[0].filter((cell) => cell !== null).length, 3);
});

/** Breadth-first search over game states; returns the shortest path length or -1. */
function bfs<S>(
  start: S,
  key: (s: S) => string,
  done: (s: S) => boolean,
  next: (s: S) => S[],
): number {
  const seen = new Set([key(start)]);
  let frontier = [start];
  for (let depth = 0; frontier.length && depth < 200; depth++) {
    const later: S[] = [];
    for (const s of frontier) {
      if (done(s)) return depth;
      for (const n of next(s))
        if (!seen.has(key(n))) {
          seen.add(key(n));
          later.push(n);
        }
    }
    frontier = later;
  }
  return -1;
}

test("every Boxy room can be solved", () => {
  for (const level of BOXY_LEVELS) {
    const steps = bfs(
      loadLevel(level),
      (s) => `${s.player}|${[...s.boxes].sort()}`,
      isSolved,
      (s) =>
        (["up", "down", "left", "right"] as const).map((d) => moveBoxy(s, d)),
    );
    assert.ok(steps > 0, level.join("/"));
  }
});

test("Check Mate pieces move like chess and every level can be cleared", () => {
  assert.equal(reachable("knight", [5, 0]).length, 2);
  assert.equal(reachable("rook", [0, 0]).length, 10);
  assert.equal(reachable("king", [3, 3]).length, 8);
  for (const level of CHESS_LEVELS) {
    const all = (1 << level.stars.length) - 1;
    const steps = bfs(
      { at: level.start, got: 0 },
      (s) => `${s.at}|${s.got}`,
      (s) => s.got === all,
      (s) =>
        reachable(level.piece, s.at).map((to) => ({
          at: to,
          got: level.stars.reduce(
            (g, [r, c], j) => (r === to[0] && c === to[1] ? g | (1 << j) : g),
            s.got,
          ),
        })),
    );
    assert.ok(steps > 0, level.piece);
  }
});

test("King Me starts six a side, jumps capture and the far row crowns", () => {
  const board = newCheckers();
  assert.equal(countSide(board, "red"), 6);
  assert.equal(countSide(board, "black"), 6);
  assert.ok(movesFor(board, "red").length > 0);
  const empty: Checkers = Array(KING_SIZE * KING_SIZE).fill(null);
  empty[3 * KING_SIZE + 2] = { side: "red", king: false };
  empty[2 * KING_SIZE + 3] = { side: "black", king: false };
  const jump = movesFor(empty, "red").find((m) => m.jumped !== null);
  assert.ok(jump);
  const after = applyMove(empty, jump);
  assert.equal(countSide(after, "black"), 0);
  const crown: Checkers = Array(KING_SIZE * KING_SIZE).fill(null);
  crown[1 * KING_SIZE + 0] = { side: "red", king: false };
  const crowned = applyMove(crown, { from: KING_SIZE, to: 1, jumped: null });
  assert.equal(crowned[1]?.king, true);
  assert.equal(pipChecker(Array(KING_SIZE * KING_SIZE).fill(null)), null);
});

test("Go Cart scrolls things down and only the kart's lane touches", () => {
  const things = [
    { id: 1, lane: 0, y: 80, coin: true },
    { id: 2, lane: 1, y: 80, coin: false },
  ];
  assert.deepEqual(
    touching(things, 0).map((t) => t.id),
    [1],
  );
  assert.equal(scrollTrack(things, 1, 40).length, 0);
  assert.equal(scrollTrack(things, 0.1, 40)[0].y, 84);
});

test("Putt Putt rolls to the aimed spot, bounces off blocks and scores stars", () => {
  const hole = HOLES[0];
  let ball = aimAt(
    { x: hole.tee[0], y: hole.tee[1], vx: 0, vy: 0 },
    ...hole.cup,
  );
  let sunk = false;
  for (let i = 0; i < 600 && !sunk; i++) {
    ball = rollBall(ball, 1 / 60, hole);
    sunk = inCup(ball, hole);
  }
  assert.ok(sunk, "a straight putt on hole 1 drops");
  // A block between tee and cup turns the ball back.
  const blocked = HOLES[2];
  let b = aimAt({ x: 50, y: 125, vx: 0, vy: 0 }, 50, 20);
  let minY = 125;
  for (let i = 0; i < 600; i++) {
    b = rollBall(b, 1 / 60, blocked);
    minY = Math.min(minY, b.y);
  }
  assert.ok(minY > 60, "the block stops it");
  assert.equal(holeStars(1, 2), 3);
  assert.equal(holeStars(3, 2), 2);
  assert.equal(holeStars(6, 2), 1);
});

test("Rocket Board climbs while boosting, floats down and stays in the sky", () => {
  assert.ok(flyRocket(50, true, 0.1) < 50);
  assert.ok(flyRocket(50, false, 0.1) > 50);
  assert.equal(flyRocket(7, true, 1), 6);
  assert.equal(flyRocket(93, false, 1), 94);
  const things = [{ id: 1, x: ROCKET_X, y: 50, star: true }];
  assert.equal(nearRocket(things, 52).length, 1);
  assert.equal(nearRocket(things, 80).length, 0);
  assert.equal(driftSky([{ id: 2, x: -9, y: 5, star: false }], 1).length, 0);
});

test("Slide n Splash jump points follow the meter", () => {
  assert.equal(jumpPoints(0), 1);
  assert.equal(jumpPoints(100), 5);
  assert.equal(jumpPoints(55), 3);
  assert.equal(splashMeter(400), 50);
  assert.equal(SPLASH_MAX_SCORE, 40);
});

test("Splash Power-Up can reach every target and scores its points", () => {
  for (const target of SPLASH_TARGETS) {
    const reachableTarget = [30, 45, 60].some((deg) =>
      Array.from({ length: 101 }, (_, p) => landingX(deg, p)).some(
        (x) => splashPoints(x) === target.points,
      ),
    );
    assert.ok(reachableTarget, target.emoji);
  }
  assert.equal(splashPoints(2), 0);
  assert.equal(powerMeter(500), 50);
});
