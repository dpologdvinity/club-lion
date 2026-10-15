import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openSorter(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Shape Sorter Safari" }).click();
  await expect(
    page.getByRole("group", { name: "Shapes to sort" }),
  ).toBeVisible();
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

const piece = (page: Page, shape: string) =>
  page.getByRole("button", { name: `${shape} piece`, exact: true });
const hole = (page: Page, animal: string) =>
  page.getByRole("button", { name: `${animal} hole`, exact: true });

// Tap-then-tap: pick a shape, then tap the animal it belongs in.
async function place(page: Page, shape: string, animal: string) {
  await piece(page, shape).click();
  await hole(page, animal).click();
  await expect(
    page.getByRole("button", { name: new RegExp(`^${animal} hole, filled`) }),
  ).toBeVisible();
}

// Drag a shape across the board and let go over the animal.
async function drag(page: Page, shape: string, animal: string) {
  const from = await piece(page, shape).boundingBox();
  const to = await hole(page, animal).boundingBox();
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

// Every control must sit inside the viewport: a toddler should not scroll.
async function expectFitsViewport(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!box || !viewport) return;
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
}

test("a wrong drop boings back for free and a right drop fills the hole", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openSorter(page);
  await checkAccessibility(page);

  await piece(page, "Square").click();
  await expect(piece(page, "Square")).toHaveAttribute("aria-pressed", "true");
  await hole(page, "Lion").click();
  await expect(page.locator(".sorter-bounce")).toHaveCount(1);
  await expect(piece(page, "Square")).toBeVisible();
  await expect(page.locator(".wallet")).toHaveText("✦250");

  await drag(page, "Circle", "Lion");
  await expect(
    page.getByRole("button", { name: "Lion hole, filled" }),
  ).toBeVisible();
  await expect(piece(page, "Circle")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the keyboard places a shape with Enter", async ({ page }) => {
  await page.goto("/");
  await openSorter(page);
  await piece(page, "Triangle").focus();
  await page.keyboard.press("Enter");
  await expect(piece(page, "Triangle")).toHaveAttribute("aria-pressed", "true");
  await hole(page, "Giraffe").focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Giraffe hole, filled" }),
  ).toBeVisible();
});

test("all three rounds pay once each, the last earns a stamp, and it persists", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await openSorter(page);

  // Round 1: lion circle, zebra square, giraffe triangle, hippo star, monkey heart.
  await drag(page, "Circle", "Lion");
  await place(page, "Square", "Zebra");
  await place(page, "Triangle", "Giraffe");
  await place(page, "Star", "Hippo");
  await place(page, "Heart", "Monkey");
  await expect(page.getByRole("button", { name: "Next round" })).toBeFocused();
  await expect(page.locator(".wallet")).toHaveText("✦255");
  await page.getByRole("button", { name: "Next round" }).click();

  // Round 2: parrot heart, bunny circle, bear star, elephant square, frog triangle.
  await place(page, "Heart", "Parrot");
  await place(page, "Circle", "Bunny");
  await place(page, "Star", "Bear");
  await place(page, "Square", "Elephant");
  await place(page, "Triangle", "Frog");
  await expect(page.locator(".wallet")).toHaveText("✦260");
  await page.getByRole("button", { name: "Next round" }).click();

  // Round 3: zebra triangle, giraffe circle, bear square, frog heart, lion star.
  await place(page, "Triangle", "Zebra");
  await place(page, "Circle", "Giraffe");
  await place(page, "Square", "Bear");
  await place(page, "Heart", "Frog");
  await place(page, "Star", "Lion");
  // 250 start, +5 a round, +15 for finishing all three rounds.
  await expect(page.locator(".wallet")).toHaveText("✦280");
  await expect(page.locator(".sorter-sticker")).toHaveText("🏆");

  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.locator(".wallet")).toHaveText("✦280");

  await page.reload();
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Shape Sorter Safari" }),
  ).toContainText("Rounds sorted 3");
  await expect(page.locator(".wallet")).toHaveText("✦280");
});

test("the sorter opens from its Downtown Plaza hotspot", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await page
    .getByLabel("Room paths and activities")
    .getByRole("button", { name: "Shape Sorter Safari", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Shapes to sort" }),
  ).toBeVisible();
});

test("the sorter fits a phone and an iPad screen without scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/");
  await openSorter(page);
  await expectFitsViewport(page, ".sorter-tray");
  await expectFitsViewport(page, ".sorter-board");
});
