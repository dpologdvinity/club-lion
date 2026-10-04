import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const FIXTURE = "/tests/fixtures/phase2.html";

function floor(page: Page) {
  return page.getByRole("group", { name: "Club Pulse dance floor" });
}

test("the dance floor renders 48 named, keyboard-reachable tiles", async ({
  page,
}) => {
  await page.goto(FIXTURE);
  await expect(floor(page).getByRole("button")).toHaveCount(48);
  await expect(
    page.getByRole("button", { name: "Light tile column 1, row 1" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Light tile column 8, row 6" }),
  ).toBeVisible();
});

test("pressing a tile lights it and reports the step, then it fades", async ({
  page,
}) => {
  await page.goto(FIXTURE);
  const tile = page.getByRole("button", { name: "Light tile column 3, row 2" });
  await tile.click();
  await expect(tile).toHaveAttribute("data-lit", "true");
  // Column 3, row 2 is flat index 1 * 8 + 2.
  await expect(page.locator('output[aria-label="Lit tiles"]')).toHaveText(
    "[10]",
  );
  await expect(tile).toHaveAttribute("data-lit", "false", { timeout: 3000 });
});

test("tiles are operable with the keyboard", async ({ page }) => {
  await page.goto(FIXTURE);
  const tile = page.getByRole("button", { name: "Light tile column 1, row 1" });
  await tile.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('output[aria-label="Lit tiles"]')).toHaveText(
    "[0]",
  );
});

test("reduced motion holds a steady floor glow instead of pulsing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(FIXTURE);
  const grid = floor(page);
  await expect(grid).toHaveAttribute("data-reduced-motion", "true");
  const pulse = await grid.evaluate((el) =>
    el.style.getPropertyValue("--floor-pulse"),
  );
  expect(pulse).toBe("0.35");
  await page.waitForTimeout(600);
  expect(
    await grid.evaluate((el) => el.style.getPropertyValue("--floor-pulse")),
  ).toBe(pulse);
});

test("the dance floor has no detectable accessibility violations", async ({
  page,
}) => {
  await page.goto(FIXTURE);
  await expect(floor(page)).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include(".dance-floor-stage")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
