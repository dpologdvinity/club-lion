import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openFruitCatch(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: /Fruit Catch!/ }).click();
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("Fruit Catch rewards once, celebrates records, resets, and persists", async ({
  page,
  isMobile,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto("/");
  // Keep fruit ripe and centered so the test verifies rewards without luck.
  await page.evaluate(() => {
    Math.random = () => 0.5;
  });
  await openFruitCatch(page);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("fruit-intro.png") });
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".fruit-basket")).toHaveAttribute(
    "style",
    "left: 57%;",
  );
  await page.keyboard.press("a");
  await expect(page.locator(".fruit-basket")).toHaveAttribute(
    "style",
    "left: 50%;",
  );
  const left = page.getByRole("button", { name: "Move basket left" });
  const right = page.getByRole("button", { name: "Move basket right" });
  if (isMobile) {
    await left.tap();
    await right.tap();
  } else {
    await left.click();
    await right.click();
  }
  await expect(page.locator(".fruit-basket")).toHaveAttribute(
    "style",
    "left: 50%;",
  );
  await page.clock.runFor(3200);
  await expect(page.locator(".fruit-game-stats")).toContainText("10 points");
  await expect(page.locator(".wallet")).toHaveText("✦250");
  await page.screenshot({ path: testInfo.outputPath("fruit-playing.png") });
  await page.getByRole("button", { name: "All games" }).click();
  await page.clock.runFor(30_000);
  await expect(page.locator(".wallet")).toHaveText("✦250");
  await page.getByRole("button", { name: /Fruit Catch!/ }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.clock.runFor(30_100);
  await expect(page.locator(".fruit-result")).toBeVisible();
  const score = Number(
    await page
      .locator(".fruit-score")
      .evaluate((el) => el.firstChild?.textContent),
  );
  expect(score).toBeGreaterThan(0);
  const coins = 250 + score / 5;
  await expect(page.locator(".wallet")).toHaveText(`✦${coins}`);
  await expect(page.locator(".fruit-best")).toHaveText(
    "A new personal best! 🏆",
  );
  await page.screenshot({ path: testInfo.outputPath("fruit-result.png") });
  await page.clock.runFor(5000);
  await expect(page.locator(".wallet")).toHaveText(`✦${coins}`);
  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.locator(".fruit-game-stats")).toContainText("0 points");
  await expect(page.locator(".fruit-game-stats")).toContainText("30s");
  await expect(page.getByLabel("3 lives", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.clock.runFor(30_000);
  await expect(page.locator(".wallet")).toHaveText(`✦${coins}`);
  await page.reload();
  await openFruitCatch(page);
  await expect(page.locator(".fruit-best")).toHaveText(
    `Personal best: ${score}`,
  );
  expect(errors).toEqual([]);
});

test("three rotten catches end the round and a lower replay keeps the record", async ({
  page,
}) => {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto("/");
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("club-lion-player-v1")!);
    localStorage.setItem(
      "club-lion-player-v1",
      JSON.stringify({ ...saved, fruitCatchBest: 100 }),
    );
  });
  await page.reload();
  // Alternate center position with rotten ripeness, after app initialization.
  await page.evaluate(() => {
    let calls = 0;
    Math.random = () => (++calls % 2 ? 0.5 : 0.99);
  });
  await openFruitCatch(page);
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.clock.runFor(3200);
  await expect(page.getByLabel("2 lives", { exact: true })).toBeVisible();
  await page.clock.runFor(2000);
  await expect(page.locator(".fruit-result")).toContainText(
    "3 rotten pieces landed in your basket and cost you 3 hearts.",
  );
  await expect(page.locator(".fruit-best")).toHaveText("Personal best: 100");
  await expect(page.locator(".wallet")).toHaveText("✦250");
  await page.getByRole("button", { name: "Back to the pride" }).click();
  await expect(page.getByRole("button", { name: "Claim 50" })).toHaveCount(1);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1")!),
  );
  expect(saved.gamesPlayed).toBe(1);
  expect(saved.fruitCatchBest).toBe(100);
});

test("arcade and Fruit Catch states are accessible and fit the viewport", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await checkAccessibility(page);
  await page.getByRole("button", { name: /Fruit Catch!/ }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await checkAccessibility(page);
  await page.screenshot({ path: testInfo.outputPath("fruit-intro.png") });
  await page.evaluate(() => {
    let calls = 0;
    Math.random = () => (++calls % 2 ? 0.5 : 0.99);
  });
  await page.getByRole("button", { name: "Let’s play" }).click();
  await checkAccessibility(page);
  await page.screenshot({ path: testInfo.outputPath("fruit-playing.png") });
  await expect(page.locator(".fruit-result")).toBeVisible({ timeout: 10_000 });
  await checkAccessibility(page);
  await page.screenshot({ path: testInfo.outputPath("fruit-result.png") });
});
