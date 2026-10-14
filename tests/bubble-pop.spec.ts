import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openBubblePop(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Bubble Pop" }).click();
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

const bubbles = (page: Page) => page.getByRole("button", { name: /^Pop the / });

// Still bubbles rest in fixed slots, and a fixed roll makes every bubble a
// pink one holding a lion cub, so taps and combos are deterministic.
async function setUp(page: Page, paused = true) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: 0 });
  if (paused) await page.clock.pauseAt(1000);
  await page.goto("/");
  await page.evaluate(() => {
    Math.random = () => 0.1;
  });
}

test("relaxed bubbles pop by touch or keyboard, reveal surprises, and pay nothing", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await setUp(page);
  await openBubblePop(page);
  await expect(bubbles(page)).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Challenge mode" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("list", { name: "Surprises found: none yet" }),
  ).toBeVisible();

  await bubbles(page).first().click();
  await expect(bubbles(page)).toHaveCount(4);
  await expect(
    page.getByRole("list", { name: "Surprises found: a lion cub" }),
  ).toBeVisible();
  await expect(page.locator(".burst-surprise")).toHaveText("🦁");

  await bubbles(page).first().focus();
  await page.keyboard.press("Enter");
  await expect(bubbles(page)).toHaveCount(3);
  // Focus moves to the next bubble instead of falling out of the game.
  await expect(bubbles(page).first()).toBeFocused();

  await page.clock.runFor(1_200);
  await expect(bubbles(page)).toHaveCount(4);
  await page.getByRole("button", { name: "Go to the beach" }).click();
  await expect(page.locator(".bubble-field")).toHaveClass(/bubble-beach/);
  await expect(page.locator(".wallet")).toHaveText("✦250");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("a finished challenge pays once by score, keeps the best, and persists", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await setUp(page);
  await openBubblePop(page);
  const toggle = page.getByRole("button", { name: "Challenge mode" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(bubbles(page)).toHaveCount(0);
  await page
    .getByRole("button", { name: "Start the 60 second challenge" })
    .click();
  await expect(bubbles(page)).toHaveCount(5);
  for (let index = 0; index < 5; index++) await bubbles(page).first().click();
  await expect(page.getByRole("img", { name: "Score 150" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Combo times 5" })).toBeVisible();

  await page.clock.runFor(60_000);
  await expect(
    page.getByRole("img", { name: "Final score 150" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "3 coins earned" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "New best score!" }),
  ).toBeVisible();
  await expect(page.locator(".wallet")).toHaveText("✦253");
  await page.clock.runFor(5_000);
  await expect(page.locator(".wallet")).toHaveText("✦253");

  // An abandoned replay pays nothing.
  await page.getByRole("button", { name: "Play the challenge again" }).click();
  await expect(
    page.getByRole("img", { name: "60 seconds left" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.clock.runFor(61_000);
  await expect(page.locator(".wallet")).toHaveText("✦253");

  await page.reload();
  await openBubblePop(page);
  await page.getByRole("button", { name: "Challenge mode" }).click();
  await expect(page.getByRole("img", { name: "Best 150" })).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1")!),
  );
  expect(saved.bubblePopBest).toBe(150);
  expect(saved.gamesPlayed).toBe(1);
});

// axe needs running timers, so the paused game clock resumes for each scan.
test("relaxed, ready, playing and finished states pass accessibility checks", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const scan = async () => {
    await page.clock.resume();
    await checkAccessibility(page);
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1_000));
  };
  await setUp(page);
  await openBubblePop(page);
  await scan();
  await page.getByRole("button", { name: "Challenge mode" }).click();
  await scan();
  await page
    .getByRole("button", { name: "Start the 60 second challenge" })
    .click();
  await bubbles(page).first().click();
  await scan();
  await page.clock.runFor(61_000);
  await expect(page.getByRole("img", { name: /^Final score/ })).toBeVisible();
  await scan();
});
