import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openColoringBook(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Coloring Book" }).click();
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

const region = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const saved = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("club-lion-player-v1")!));

test("pages fill, erase, undo and surprise, then finish once for a stamp and persist", async ({
  page,
}) => {
  // Three full-page axe scans make this the slow one.
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openColoringBook(page);
  await expect(page.getByRole("button", { name: /^Color the / })).toHaveCount(
    6,
  );
  await checkAccessibility(page);
  await page.getByRole("button", { name: "Color the lion cub" }).click();
  const done = page.getByRole("button", { name: "I'm done" });
  await expect(done).toBeDisabled();

  await page.getByRole("button", { name: "Cherry red" }).click();
  await expect(
    page.getByRole("button", { name: "Cherry red" }),
  ).toHaveAttribute("aria-pressed", "true");
  await region(page, "Sun").click();
  await expect(region(page, "Sun, cherry red")).toHaveAttribute(
    "fill",
    "#ef5350",
  );
  // Regions under other shapes are reachable from the keyboard.
  await region(page, "Mane").focus();
  await page.keyboard.press("Enter");
  await expect(region(page, "Mane, cherry red")).toBeFocused();
  await page.getByRole("button", { name: "Rainbow" }).click();
  await region(page, "Sky").focus();
  await page.keyboard.press(" ");
  await expect(region(page, "Sky, rainbow")).toHaveAttribute(
    "fill",
    /^url\(#.+-rainbow\)$/,
  );
  await page.getByRole("button", { name: "Eraser" }).click();
  await region(page, "Sun, cherry red").click();
  await expect(region(page, "Sun")).toHaveAttribute("fill", "#ffffff");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(region(page, "Sun, cherry red")).toBeVisible();

  const regions = page.locator(".cb-canvas .cb-region");
  const total = await regions.count();
  await page.getByRole("button", { name: "Surprise me" }).click();
  await expect(
    page.locator('.cb-canvas .cb-region[fill="#ffffff"]'),
  ).toHaveCount(0);
  expect(await regions.count()).toBe(total);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(region(page, "Mane, cherry red")).toBeVisible();
  await expect(region(page, "Face")).toBeVisible();
  await checkAccessibility(page);

  await done.click();
  await expect(
    page.getByRole("status").filter({ hasText: "finished" }),
  ).toHaveText("Beautiful! The lion cub is finished.");
  await checkAccessibility(page);
  await expect(
    page.getByRole("button", { name: "Keep coloring" }),
  ).toBeFocused();
  let progress = await saved(page);
  expect(progress.stamps).toContain("coloring_first_page");
  expect(progress.coloringBook.finished).toEqual(["lion-cub"]);
  await page.getByRole("button", { name: "Keep coloring" }).click();
  await done.click();
  progress = await saved(page);
  expect(
    progress.stamps.filter((id: string) => id === "coloring_first_page"),
  ).toHaveLength(1);
  expect(progress.coloringBook.finished).toEqual(["lion-cub"]);

  await page.getByRole("button", { name: "All pages" }).first().click();
  await expect(
    page.getByRole("button", { name: "Color the lion cub, finished" }),
  ).toBeVisible();
  await page.reload();
  await openColoringBook(page);
  await page
    .getByRole("button", { name: "Color the lion cub, finished" })
    .click();
  await expect(region(page, "Mane, cherry red")).toBeVisible();
  await expect(region(page, "Sky, rainbow")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("a tampered coloring save keeps valid colors and the rest of the progress", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const player = JSON.parse(localStorage.getItem("club-lion-player-v1")!);
    localStorage.setItem(
      "club-lion-player-v1",
      JSON.stringify({
        ...player,
        coloringBook: {
          pages: {
            puppy: { head: "cocoa", ball: "url(#evil)", made_up: "sunny" },
            nowhere: { sky: "sunny" },
          },
          finished: ["puppy", "nowhere", 4],
        },
      }),
    );
  });
  await page.reload();
  await openColoringBook(page);
  await page.getByRole("button", { name: "Color the puppy, finished" }).click();
  await expect(region(page, "Head, cocoa brown")).toHaveAttribute(
    "fill",
    "#a86b3c",
  );
  await expect(region(page, "Ball")).toHaveAttribute("fill", "#ffffff");
  const progress = await saved(page);
  expect(progress.coloringBook).toEqual({
    pages: { puppy: { head: "cocoa" } },
    finished: ["puppy"],
  });
  expect(progress.stamps).toContain("coloring_first_page");
});
