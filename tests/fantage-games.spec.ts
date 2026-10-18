import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";
import {
  CANDIES,
  CANDY_SIZE,
  areNeighbours,
  findLines,
  swapCells,
} from "../src/utils/candySwap";
import { MAZES, findCell, stepMouse, type Step } from "../src/utils/mouseOut";
import {
  PEARLS,
  PEARL_COLS,
  PEARL_ROWS,
  groupAt,
  type PearlBoard,
} from "../src/utils/pearlyPop";
import {
  BOXY_LEVELS,
  isSolved,
  loadLevel,
  moveBoxy,
  type BoxyState,
  type BoxyStep,
} from "../src/utils/boxy";
import { CHESS_LEVELS, CHESS_SIZE, reachable } from "../src/utils/checkMate";
import { KING_SIZE, movesFor, type Checkers } from "../src/utils/kingMe";

const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

async function openGame(page: Page, name: string) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: `Play ${name}` }).click();
}

test("game cabinets stand around town and open their games", async ({
  page,
}) => {
  test.setTimeout(150_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const [room, game, start] of [
    ["Canopy café", "Memory Mixup", "Start Memory Mixup"],
    ["Luxury Penthouse", "Check Mate", "Start Check Mate"],
    ["Coastal Pier", "Jelly Fishin'", "Start Jelly Fishin'"],
  ]) {
    await page
      .getByRole("button", { name: "Map", exact: true })
      .first()
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(`^${room}`) })
      .click();
    await expect(
      page.getByRole("button", { name: game, exact: true }).first(),
    ).toBeAttached();
    await tapRoomPath(page, game, true);
    await expect(page.getByRole("button", { name: start })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("Memory Mixup: matching every pair in 8 turns earns 3 stars once", async ({
  page,
}) => {
  await page.goto("/");
  await openGame(page, "Memory Mixup");
  const before = await saved(page);
  await page.getByRole("button", { name: "Start Memory Mixup" }).click();
  const snacks = await page.locator(".mixup-snack").allTextContents();
  const cards = page.locator(".mixup-card");
  const done = new Set<number>();
  for (let i = 0; i < snacks.length; i++) {
    if (done.has(i)) continue;
    const j = snacks.findIndex((s, k) => k !== i && s === snacks[i]);
    done.add(i).add(j);
    await cards.nth(i).click();
    await cards.nth(j).click();
    await expect(cards.nth(j)).toHaveClass(/is-matched/);
  }
  await expect(page.getByLabel("3 stars")).toBeVisible();
  const after = await saved(page);
  expect(after.fantageBest["memory-mixup"]).toBe(3);
  expect(after.stamps).toContain("memory_mixup_star");
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  await page.waitForTimeout(1000);
  expect((await saved(page)).gamesPlayed).toBe(after.gamesPlayed);
});

test("Snack Tac Toe: three rounds against Pip, two wins earn the stamp", async ({
  page,
}) => {
  // Pip never blocks and never takes the middle, so the moves below win.
  await page.addInitScript(() => {
    Math.random = () => 0.99;
  });
  await page.goto("/");
  await openGame(page, "Snack Tac Toe");
  await page.getByRole("button", { name: "Start Snack Tac Toe" }).click();
  const cell = (i: number) =>
    page.getByRole("button", {
      name: new RegExp(`^Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}`),
    });
  const play = async (moves: number[]) => {
    for (const i of moves) {
      await expect(cell(i)).toBeEnabled({ timeout: 5000 });
      await cell(i).click();
    }
  };
  await play([0, 1, 2]);
  await play([6, 0, 3]);
  await play([0, 1, 2]);
  await expect(page.locator(".fg-result")).toHaveText("⭐ 6", {
    timeout: 10_000,
  });
  const after = await saved(page);
  expect(after.fantageBest["snack-tac-toe"]).toBe(6);
  expect(after.stamps).toContain("snack_tac_toe_champ");
});

test("Whack A Veggie: bonks count for a 30-second round and save the best", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await openGame(page, "Whack A Veggie");
  // Freeze time so veggies only move when the test says so.
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await page.getByRole("button", { name: "Start Whack A Veggie" }).click();
  let bonked = 0;
  for (let step = 0; step < 12 && bonked < 4; step++) {
    await page.clock.runFor(700);
    const veggie = page.getByRole("button", { name: /^Bonk the/ }).first();
    if (await veggie.count()) {
      await veggie.click();
      bonked++;
    }
  }
  expect(bonked).toBeGreaterThanOrEqual(3);
  await page.clock.runFor(31_000);
  await expect(page.locator(".fg-result")).toHaveText(`🥕 ${bonked}`);
  expect((await saved(page)).fantageBest["whack-a-veggie"]).toBe(bonked);
});

test("Bullseye: ten throws on the line-up score 100 and the stamp", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await openGame(page, "Bullseye");
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await page.getByRole("button", { name: "Start Bullseye" }).click();
  // The target crosses the middle every 1.3 s.
  await page.clock.runFor(1300);
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "Throw" }).click();
    if (i < 9) await page.clock.runFor(2600);
  }
  await expect(page.locator(".fg-result")).toHaveText("⭐ 100");
  const after = await saved(page);
  expect(after.fantageBest.bullseye).toBe(100);
  expect(after.stamps).toContain("bullseye_sharpshooter");
});

test("Mad Math: counting every question right earns the stamp", async ({
  page,
}) => {
  await page.goto("/");
  await openGame(page, "Mad Math");
  await page.getByRole("button", { name: "Start Mad Math" }).click();
  for (let i = 0; i < 10; i++) {
    const label = await page.locator(".math-snacks").getAttribute("aria-label");
    const count = Number.parseInt(label ?? "", 10);
    await page
      .getByRole("button", { name: String(count), exact: true })
      .click();
  }
  await expect(page.locator(".fg-result")).toHaveText("⭐ 10");
  expect((await saved(page)).stamps).toContain("math_whiz");
});

test("Staries: joining every star draws all six pictures", async ({ page }) => {
  await page.goto("/");
  await openGame(page, "Staries");
  await page.getByRole("button", { name: "Start Staries" }).click();
  for (let picture = 0; picture < 6; picture++) {
    const stars = await page.locator(".staries-star").count();
    for (let i = 1; i <= stars; i++)
      await page
        .getByRole("button", { name: `Star ${i}`, exact: true })
        .click();
    await page.getByRole("button", { name: "Next picture" }).click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  const after = await saved(page);
  expect(after.fantageBest.staries).toBe(6);
  expect(after.stamps).toContain("star_gazer");
});

test("Type Boo: matching the ghost letters, by tap and by keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await openGame(page, "Type Boo");
  await page.getByRole("button", { name: "Start Type Boo" }).click();
  for (let i = 0; i < 12; i++) {
    const label = await page.locator(".boo-ghost").getAttribute("aria-label");
    const letter = (label ?? "").slice(-1);
    if (i % 2) await page.keyboard.press(letter.toLowerCase());
    else await page.getByRole("button", { name: letter, exact: true }).click();
  }
  await expect(page.locator(".fg-result")).toHaveText("👻 12");
  expect((await saved(page)).stamps).toContain("ghost_reader");
});

test("Candy Swap: twenty line-making swaps pop enough for the stamp", async ({
  page,
}) => {
  await page.goto("/");
  await openGame(page, "Candy Swap");
  await page.getByRole("button", { name: "Start Candy Swap" }).click();
  const cells = page.locator(".candy-cell");
  for (let move = 0; move < 20; move++) {
    const labels = await cells.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("aria-label") ?? ""),
    );
    const grid = labels.map((label) =>
      CANDIES.findIndex((candy) => label.endsWith(candy)),
    );
    let swap: [number, number] | null = null;
    for (let i = 0; i < grid.length && !swap; i++)
      for (const j of [i + 1, i + CANDY_SIZE])
        if (
          j < grid.length &&
          areNeighbours(i, j) &&
          findLines(swapCells(grid, i, j)).size
        ) {
          swap = [i, j];
          break;
        }
    expect(swap).not.toBeNull();
    await cells.nth(swap![0]).click();
    await cells.nth(swap![1]).click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  const after = await saved(page);
  expect(after.fantageBest["candy-swap"]).toBeGreaterThanOrEqual(60);
  expect(after.stamps).toContain("candy_crusher");
});

test("Buzzer Beater: ten swishes in the green score 20", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await openGame(page, "Buzzer Beater");
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await page.getByRole("button", { name: "Start Buzzer Beater" }).click();
  // The meter reads 70 at 630 ms into each 1.8 s swing.
  await page.clock.runFor(630);
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "Shoot" }).click();
    if (i < 9) await page.clock.runFor(1800);
  }
  await expect(page.locator(".fg-result")).toHaveText("⭐ 20");
  expect((await saved(page)).stamps).toContain("hoop_star");
});

test("Mouse Out: the arrows lead the mouse through all five mazes", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await page.goto("/");
  await openGame(page, "Mouse Out");
  await page.getByRole("button", { name: "Start Mouse Out" }).click();
  const label = { up: "Up", down: "Down", left: "Left", right: "Right" };
  const keys = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  };
  for (const maze of MAZES) {
    // Shortest path by breadth-first search over the maze.
    const start = findCell(maze, "M");
    const goal = findCell(maze, "C");
    const key = (s: { row: number; col: number }) => `${s.row},${s.col}`;
    const from = new Map<string, [string, Step]>();
    const queue = [start];
    const seen = new Set([key(start)]);
    while (queue.length) {
      const at = queue.shift()!;
      for (const step of ["up", "down", "left", "right"] as const) {
        const to = stepMouse(maze, at, step);
        if (seen.has(key(to))) continue;
        seen.add(key(to));
        from.set(key(to), [key(at), step]);
        queue.push(to);
      }
    }
    const steps: Step[] = [];
    for (let at = key(goal); at !== key(start);) {
      const [prev, step] = from.get(at)!;
      steps.unshift(step);
      at = prev;
    }
    const grid = page.locator(".maze-grid");
    let at = start;
    for (const step of steps) {
      at = stepMouse(maze, at, step);
      // Tap the on-screen arrows in the first maze, then use the keyboard.
      if (maze === MAZES[0])
        await page
          .getByRole("button", { name: label[step], exact: true })
          .click();
      else await page.keyboard.press(keys[step]);
      // Wait for the mouse to arrive before the next tap.
      await expect(grid).toHaveAttribute(
        "aria-label",
        `The mouse is at row ${at.row + 1}, column ${at.col + 1}`,
      );
    }
    await page.getByRole("button", { name: "Next maze" }).click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  expect((await saved(page)).stamps).toContain("maze_mouse");
});

test("Stained Glass: filling every pane of four windows earns the stamp", async ({
  page,
}) => {
  await page.goto("/");
  await openGame(page, "Stained Glass");
  await page.getByRole("button", { name: "Start Stained Glass" }).click();
  const colors = ["red", "yellow", "blue", "green"];
  for (let w = 0; w < 4; w++) {
    await page.getByRole("button", { name: colors[w], exact: true }).click();
    const panes = await page.locator(".glass-pane").count();
    for (let i = 1; i <= panes; i++)
      await page
        .getByRole("button", { name: new RegExp(`^Pane ${i}(,|$)`) })
        .press("Enter");
    await page.getByRole("button", { name: "Window done" }).click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  expect((await saved(page)).stamps).toContain("glass_artist");
});

/** Starts a timed game on a frozen clock so the test sets the pace. */
async function startFrozen(page: Page, name: string) {
  await page.clock.install();
  await page.goto("/");
  await openGame(page, name);
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await page.getByRole("button", { name: `Start ${name}` }).click();
}

test("Snow Day: snowballs land on penguins and the round saves", async ({
  page,
}) => {
  await startFrozen(page, "Snow Day");
  let landed = 0;
  for (let step = 0; step < 30 && landed < 4; step++) {
    await page.clock.runFor(500);
    // Only a penguin well inside its lane can be tapped.
    const inside = await page.locator(".snow-penguin").evaluateAll((nodes) =>
      nodes.findIndex((node) => {
        const left = Number.parseFloat(
          node.getAttribute("style")?.split("left:")[1] ?? "",
        );
        return left > 12 && left < 88;
      }),
    );
    const penguin = page.locator(".snow-penguin").nth(Math.max(0, inside));
    if (inside >= 0) {
      await penguin.click();
      landed++;
    }
  }
  expect(landed).toBeGreaterThanOrEqual(3);
  await page.clock.runFor(31_000);
  await expect(page.locator(".fg-result")).toHaveText(`❄️ ${landed}`);
  expect((await saved(page)).fantageBest["snow-day"]).toBe(landed);
});

test("Bricks Breaking: the ball keeps bouncing and the round saves", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await startFrozen(page, "Bricks Breaking");
  await page.getByRole("button", { name: "Paddle left" }).click();
  for (let i = 0; i < 46; i++) await page.clock.runFor(2000);
  await expect(page.locator(".fg-result")).toBeVisible();
  const best = (await saved(page)).fantageBest["bricks-breaking"];
  expect(best).toBeGreaterThan(0);
  await expect(page.locator(".fg-result")).toHaveText(`🧱 ${best}`);
});

test("Galaxy Hero: the ship zaps meteors over a 45-second flight", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await startFrozen(page, "Galaxy Hero");
  await page.getByRole("button", { name: "Ship right" }).click();
  for (let i = 0; i < 24; i++) await page.clock.runFor(2000);
  await expect(page.locator(".fg-result")).toBeVisible();
  const best = (await saved(page)).fantageBest["galaxy-hero"];
  expect(best).toBeGreaterThanOrEqual(0);
  await expect(page.locator(".fg-result")).toHaveText(`☄️ ${best}`);
});

test("Pearly Pop: popping groups until none are left saves the score", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await page.goto("/");
  await openGame(page, "Pearly Pop");
  await page.getByRole("button", { name: "Start Pearly Pop" }).click();
  for (let turn = 0; turn < 60; turn++) {
    if (await page.getByRole("button", { name: "Play again" }).count()) break;
    const labels = await page
      .locator(".pearl")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("aria-label") ?? ""),
      );
    const board: PearlBoard = Array.from({ length: PEARL_COLS }, () =>
      Array<number | null>(PEARL_ROWS).fill(null),
    );
    for (const label of labels) {
      const m = /column (\d+) row (\d+), (.+)$/u.exec(label);
      if (m) board[+m[1] - 1][+m[2] - 1] = PEARLS.indexOf(m[3]);
    }
    let target: [number, number] | null = null;
    for (let c = 0; c < PEARL_COLS && !target; c++)
      for (let r = 0; r < PEARL_ROWS && !target; r++)
        if (board[c][r] !== null && groupAt(board, c, r).length >= 2)
          target = [c, r];
    expect(target).not.toBeNull();
    await page
      .getByRole("button", {
        name: new RegExp(
          `^Pearl column ${target![0] + 1} row ${target![1] + 1},`,
        ),
      })
      .click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  const best = (await saved(page)).fantageBest["pearly-pop"];
  expect(best).toBeGreaterThan(0);
  await expect(page.locator(".fg-result")).toHaveText(`🫧 ${best}`);
});

test("Magic Pop: only bubbles matching the wand pop", async ({ page }) => {
  test.setTimeout(150_000);
  await startFrozen(page, "Magic Pop");
  let popped = 0;
  for (let step = 0; step < 40 && popped < 3; step++) {
    await page.clock.runFor(400);
    const wand = (
      (await page.getByLabel(/^The wand glows/).getAttribute("aria-label")) ??
      ""
    ).split(" ")[3];
    const index = await page.locator(".magic-bubble").evaluateAll(
      (nodes, color) =>
        nodes.findIndex((node) => {
          const bottom = Number.parseFloat((node as HTMLElement).style.bottom);
          const left = Number.parseFloat((node as HTMLElement).style.left);
          // Well inside the field, clear of its clipped edges on a phone.
          return (
            node.getAttribute("aria-label") === `${color} bubble` &&
            bottom > 10 &&
            bottom < 70 &&
            left > 15 &&
            left < 85
          );
        }),
      wand,
    );
    if (index < 0) continue;
    const hit = await page
      .locator(".magic-bubble")
      .nth(index)
      .click({ timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    if (hit) popped++;
  }
  expect(popped).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < 21; i++) await page.clock.runFor(2000);
  await expect(page.locator(".fg-result")).toHaveText(`🫧 ${popped}`);
  expect((await saved(page)).fantageBest["magic-pop"]).toBe(popped);
});

test("Jelly Fishin': twelve drops end the trip and save the catch", async ({
  page,
}) => {
  await startFrozen(page, "Jelly Fishin'");
  for (let i = 0; i < 12; i++) {
    await page.clock.runFor(333);
    await page.getByRole("button", { name: "Drop the hook" }).click();
  }
  await expect(page.locator(".fg-result")).toBeVisible();
  const best = (await saved(page)).fantageBest["jelly-fishin"];
  await expect(page.locator(".fg-result")).toHaveText(`🪼 ${best}`);
});

test("BoBo Fish: a 45-second swim saves how many fish BoBo gobbled", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await startFrozen(page, "BoBo Fish");
  await page.getByRole("button", { name: "Swim down" }).click();
  for (let i = 0; i < 24; i++) await page.clock.runFor(2000);
  await expect(page.locator(".fg-result")).toBeVisible();
  const best = (await saved(page)).fantageBest["bobo-fish"];
  await expect(page.locator(".fg-result")).toHaveText(`🐟 ${best}`);
});

test("Bubble Bug: thirty shots up the columns end the game and save", async ({
  page,
}) => {
  await page.goto("/");
  await openGame(page, "Bubble Bug");
  await page.getByRole("button", { name: "Start Bubble Bug" }).click();
  for (let i = 0; i < 30; i++)
    await page
      .getByRole("button", { name: `Shoot up column ${(i % 6) + 1}` })
      .click();
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  const best = (await saved(page)).fantageBest["bubble-bug"];
  await expect(page.locator(".fg-result")).toHaveText(`⭐ ${best}`);
});

const ARROWS: Record<BoxyStep, string> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

test("Boxy: every box pushed home in all five rooms", async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto("/");
  await openGame(page, "Boxy");
  await page.getByRole("button", { name: "Start Boxy" }).click();
  for (const level of BOXY_LEVELS) {
    // Shortest push sequence by breadth-first search.
    const key = (s: BoxyState) => `${s.player}|${[...s.boxes].sort()}`;
    const start = loadLevel(level);
    const from = new Map<string, [string, BoxyStep]>();
    const states = new Map([[key(start), start]]);
    const queue = [start];
    let goal: BoxyState | null = null;
    while (queue.length && !goal) {
      const s = queue.shift()!;
      if (isSolved(s)) goal = s;
      for (const step of ["up", "down", "left", "right"] as const) {
        const n = moveBoxy(s, step);
        if (states.has(key(n))) continue;
        states.set(key(n), n);
        from.set(key(n), [key(s), step]);
        queue.push(n);
      }
    }
    const steps: BoxyStep[] = [];
    for (let at = key(goal!); at !== key(start);) {
      const [prev, step] = from.get(at)!;
      steps.unshift(step);
      at = prev;
    }
    for (const step of steps) await page.keyboard.press(ARROWS[step]);
    await page.getByRole("button", { name: "Next room" }).click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  expect((await saved(page)).stamps).toContain("box_pusher");
});

test("Check Mate: each piece collects its stars on legal squares", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await page.goto("/");
  await openGame(page, "Check Mate");
  await page.getByRole("button", { name: "Start Check Mate" }).click();
  const square = (r: number, c: number) =>
    page.getByRole("button", {
      name: new RegExp(`^${"abcdef"[c]}${CHESS_SIZE - r}(,|$)`),
    });
  for (const level of CHESS_LEVELS) {
    let at = level.start;
    let left = [...level.stars];
    while (left.length) {
      // Head for a star the piece can reach now, else any square that can.
      const moves = reachable(level.piece, at);
      const star = moves.find(([r, c]) =>
        left.some(([sr, sc]) => sr === r && sc === c),
      );
      const via = moves.find(([r, c]) =>
        reachable(level.piece, [r, c]).some(([nr, nc]) =>
          left.some(([sr, sc]) => sr === nr && sc === nc),
        ),
      );
      const to = star ?? via ?? moves[0];
      await square(to[0], to[1]).click();
      at = to;
      left = left.filter(([sr, sc]) => sr !== to[0] || sc !== to[1]);
    }
    await page.getByRole("button", { name: "Next piece" }).click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  expect((await saved(page)).stamps).toContain("chess_starter");
});

test("King Me: a full game against Pip ends and saves the captures", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.goto("/");
  await openGame(page, "King Me");
  await page.getByRole("button", { name: "Start King Me" }).click();
  for (let turn = 0; turn < 40; turn++) {
    if (await page.getByRole("button", { name: "Play again" }).count()) break;
    await expect(page.getByLabel("Your turn"))
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
    if (await page.getByRole("button", { name: "Play again" }).count()) break;
    const labels = await page
      .locator(".kingme-cell")
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("aria-label") ?? ""),
      );
    const board: Checkers = labels.map((label) =>
      /, red/.test(label)
        ? { side: "red", king: /king/.test(label) }
        : /, black/.test(label)
          ? { side: "black", king: /king/.test(label) }
          : null,
    );
    const moves = movesFor(board, "red");
    if (!moves.length) break;
    const move = moves.find((m) => m.jumped !== null) ?? moves[0];
    const cell = (i: number) => page.locator(".kingme-cell").nth(i);
    await cell(move.from).click();
    await cell(move.to).click();
    await page.waitForTimeout(900);
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible({
    timeout: 60_000,
  });
  const best = (await saved(page)).fantageBest["king-me"];
  expect(best).toBeGreaterThanOrEqual(0);
  await expect(page.locator(".fg-result")).toHaveText(`👑 ${best}`);
});

test("Go Cart: a 40-second race saves the coins", async ({ page }) => {
  test.setTimeout(150_000);
  await startFrozen(page, "Go Cart");
  for (let i = 0; i < 21; i++) {
    await page.clock.runFor(2000);
    if (i === 3) await page.getByRole("button", { name: "Steer left" }).click();
  }
  await expect(page.locator(".fg-result")).toBeVisible();
  const best = (await saved(page)).fantageBest["go-cart"];
  await expect(page.locator(".fg-result")).toHaveText(`🪙 ${best}`);
});

test("Putt Putt Revolution: six holes played and the stars saved", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await startFrozen(page, "Putt Putt Revolution");
  for (let hole = 0; hole < 6; hole++) {
    for (let stroke = 0; stroke < 6; stroke++) {
      await page.getByRole("button", { name: "Putt toward the cup" }).click();
      await page.clock.runFor(4000);
      if (await page.getByRole("button", { name: "Next hole" }).count()) break;
    }
    await page.getByRole("button", { name: "Next hole" }).click();
  }
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  const best = (await saved(page)).fantageBest["putt-putt"];
  expect(best).toBeGreaterThanOrEqual(6);
  await expect(page.locator(".fg-result")).toHaveText(`⭐ ${best}`);
});

test("Rocket Board: a boosted flight saves the stars", async ({ page }) => {
  test.setTimeout(150_000);
  await startFrozen(page, "Rocket Board");
  for (let i = 0; i < 21; i++) {
    if (i % 2) await page.keyboard.down(" ");
    else await page.keyboard.up(" ");
    await page.clock.runFor(2000);
  }
  await page.keyboard.up(" ");
  await expect(page.locator(".fg-result")).toBeVisible();
  const best = (await saved(page)).fantageBest["rocket-board"];
  await expect(page.locator(".fg-result")).toHaveText(`⭐ ${best}`);
});

test("Slide n Splash: five full-power dives with every trick score 40", async ({
  page,
}) => {
  await startFrozen(page, "Slide n Splash");
  for (let dive = 0; dive < 5; dive++) {
    // The meter tops out 800 ms into each slide.
    await page.clock.runFor(800);
    await page.getByRole("button", { name: "Jump" }).click();
    for (const trick of ["Spin", "Flip", "Star pose"])
      await page.getByRole("button", { name: trick }).click();
    await page.clock.runFor(1700);
    await page.clock.runFor(1200);
  }
  await expect(page.locator(".fg-result")).toHaveText("💦 40");
  expect((await saved(page)).stamps).toContain("splash_star");
});

test("Splash Power-Up: ten balloons on the whale score 30", async ({
  page,
}) => {
  await startFrozen(page, "Splash Power-Up");
  await page.getByRole("button", { name: "Middle", exact: true }).click();
  for (let i = 0; i < 10; i++) {
    // At 45 degrees, 976 ms of power lands on the whale.
    await page.clock.runFor(976);
    await page.getByRole("button", { name: "Launch" }).click();
    await page.clock.runFor(1000);
  }
  await expect(page.locator(".fg-result")).toHaveText("💦 30");
  expect((await saved(page)).stamps).toContain("balloon_launcher");
});
