import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPuzzle(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Picture Puzzle" }).click();
  await expect(
    page.getByRole("group", { name: "Puzzle pieces" }),
  ).toBeVisible();
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

const piece = (page: Page, number: number) =>
  page.getByRole("button", { name: `Piece ${number}`, exact: true });
const spot = (page: Page, number: number, count: number) =>
  page.getByRole("button", { name: `Spot ${number} of ${count}`, exact: true });

// Tap-then-tap: pick a piece, then tap the spot it belongs in.
async function place(page: Page, number: number, count: number) {
  await piece(page, number).click();
  await spot(page, number, count).click();
  await expect(
    page.getByRole("button", { name: `Spot ${number} of ${count}, filled` }),
  ).toBeVisible();
}

// Drag a piece across the picture and let go over its spot.
async function drag(page: Page, number: number, count: number) {
  const from = await piece(page, number).boundingBox();
  const to = await spot(page, number, count).boundingBox();
  expect(from).not.toBeNull();
  expect(to).not.toBeNull();
  if (!from || !to) return;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
    steps: 12,
  });
  await page.mouse.up();
}

async function expectFitsViewport(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!box || !viewport) return;
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
}

test("a wrong spot boings and keeps the piece, and the right spot fills", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openPuzzle(page);
  await checkAccessibility(page);

  await piece(page, 2).click();
  await expect(piece(page, 2)).toHaveAttribute("aria-pressed", "true");
  await spot(page, 1, 4).click();
  await expect(page.locator(".pp-spot.is-missed")).toHaveCount(1);
  await expect(piece(page, 2)).toBeVisible();
  await expect(page.locator(".wallet")).toHaveText("✦250");

  await place(page, 2, 4);
  expect(errors).toEqual([]);
});

test("dragging a piece near its spot snaps it into place", async ({ page }) => {
  await page.goto("/");
  await openPuzzle(page);
  await drag(page, 3, 4);
  await expect(
    page.getByRole("button", { name: "Spot 3 of 4, filled" }),
  ).toBeVisible();
  await expect(piece(page, 3)).toHaveCount(0);
});

test("an idle board hints the next spot after eight seconds", async ({
  page,
}) => {
  await page.goto("/");
  await openPuzzle(page);
  await expect(page.locator(".pp-spot.is-hint")).toHaveCount(1, {
    timeout: 12_000,
  });
});

test("a picture pays once, the nine-piece picture earns the stamp, and progress persists", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await page.goto("/");
  await openPuzzle(page);

  // Picture 1: four pieces.
  for (const number of [1, 2, 3, 4]) await place(page, number, 4);
  await expect(page.locator(".pp-sticker")).toHaveText("🌟");
  await expect(page.locator(".wallet")).toHaveText("✦255");
  await page.getByRole("button", { name: "Next picture" }).click();

  // Picture 2: six pieces.
  for (const number of [1, 2, 3, 4, 5, 6]) await place(page, number, 6);
  await expect(page.locator(".wallet")).toHaveText("✦263");
  await page.getByRole("button", { name: "Next picture" }).click();

  // Picture 3: nine pieces, then the stamp.
  for (const number of [1, 2, 3, 4, 5, 6, 7, 8, 9])
    await place(page, number, 9);
  await expect(page.locator(".pp-sticker")).toHaveText("🏆");
  await expect(page.locator(".wallet")).toHaveText("✦290");
  await expect(page.getByRole("button", { name: "Play again" })).toBeFocused();

  await page.reload();
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Picture Puzzle" }),
  ).toContainText("Pictures finished 3");
  await expect(page.locator(".wallet")).toHaveText("✦290");
});

test("the puzzle is reachable from its Downtown Plaza hotspot", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await page
    .getByLabel("Room paths and activities")
    .getByRole("button", { name: "Picture Puzzle", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Puzzle pieces" }),
  ).toBeVisible();
});

test("the puzzle fits a phone and an iPad screen without scrolling", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await openPuzzle(page);
    await expectFitsViewport(page, ".pp-board");
    await expectFitsViewport(page, ".pp-tray");
  }
});
