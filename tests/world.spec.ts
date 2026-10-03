import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { coinsFor, FLOWER_SPOTS } from "../src/beeStop";

test("the world loads, supports movement and chat, and has no horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Club Lion/);
  await expect(
    page.getByRole("heading", { name: "Welcome to the pride." }),
  ).toBeVisible();
  const ground = page.getByRole("button", { name: "Walk around the village." });
  await ground.focus();
  const before = await page.locator(".your-character").getAttribute("style");
  await page.keyboard.press("ArrowRight");
  expect(await page.locator(".your-character").getAttribute("style")).not.toBe(
    before,
  );
  await page
    .getByLabel("Say something in your local neighborhood")
    .fill("Hello, lions!");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".your-character .speech-bubble")).toHaveText(
    "Hello, lions!",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("map travel and unique greetings complete adventures with one reward each", async ({
  page,
}) => {
  await page.goto("/");
  for (const name of ["Milo", "Cleo", "Pip"])
    await page.getByRole("button", { name: `Say hello to ${name}` }).click();
  await page.getByRole("button", { name: "Say hello to Milo" }).click();
  await expect(page.getByRole("button", { name: "Claim 50" })).toHaveCount(1);
  await page.getByRole("button", { name: "Claim 50" }).click();
  await expect(page.locator(".wallet")).toHaveText("✦300");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("button", { name: /Your cozy den Make yourself/ })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText("Your cozy den");
  await expect(page.locator(".world-stage")).toHaveClass(/scene-den/);
  await page.getByRole("button", { name: "Claim 50" }).click();
  await expect(page.locator(".wallet")).toHaveText("✦350");
  await page.reload();
  await expect(page.locator(".wallet")).toHaveText("✦350");
  await expect(
    page.getByText("Adventure complete", { exact: true }),
  ).toHaveCount(2);
});

test("wardrobe validation, purchases, and persistent customizations work", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Style your lion", exact: true })
    .click();
  await page.getByLabel("Your lion’s name").fill("");
  await page.getByRole("button", { name: "Save my look" }).click();
  await expect(
    page.getByText("Your lion needs a name.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel("Your lion’s name")).toBeFocused();
  await page.getByLabel("Your lion’s name").fill("Roary");
  await page.getByRole("button", { name: "Rosy", exact: true }).click();
  await page.getByRole("button", { name: "Save my look" }).click();
  await expect(page.locator(".profile-details h3")).toHaveText("Roary");
  await expect(page.locator(".your-character .lion")).toHaveClass(/lion-rose/);
  await page.getByRole("button", { name: "Shop", exact: true }).click();
  const hat = page
    .locator(".shop-item")
    .filter({ has: page.getByRole("heading", { name: "Explorer hat" }) });
  await hat.getByRole("button", { name: /Make it mine/ }).click();
  await expect(hat.getByRole("button", { name: "Wearing" })).toBeDisabled();
  await expect(page.locator(".wallet")).toHaveText("✦100");
  await page.getByRole("button", { name: "For your den" }).click();
  const plant = page
    .locator(".shop-item")
    .filter({ has: page.getByRole("heading", { name: "Happy houseplant" }) });
  await plant.getByRole("button", { name: /Make it mine/ }).click();
  await expect(page.locator(".wallet")).toHaveText("✦0");
  await expect(
    page.getByRole("button", { name: /Need more coins/ }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "My den", exact: true }).click();
  await expect(page.getByLabel("Your happy houseplant")).toBeVisible();
  await page.reload();
  await expect(page.locator(".profile-details h3")).toHaveText("Roary");
  await expect(page.locator(".wallet")).toHaveText("✦0");
  await expect(page.locator(".your-character .accessory-hat")).toBeVisible();
});

test("the arcade offers both games", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Memory Safari" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Bee Stop" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  await expect(page.getByRole("heading", { name: "Bee Stop" })).toBeVisible();
  await expect(page.getByText("Best", { exact: false })).toHaveCount(0);
});

test("the arcade and Bee Stop fit the viewport without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  const fits = async () =>
    page.evaluate(() => {
      const dialog = document.querySelector<HTMLElement>("dialog");
      return (
        !!dialog &&
        dialog.scrollWidth <= dialog.clientWidth + 1 &&
        dialog.getBoundingClientRect().right <= window.innerWidth + 1
      );
    });
  expect(await fits()).toBe(true);
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  expect(await fits()).toBe(true);
  await page.getByRole("button", { name: "Let’s play" }).click();
  expect(await fits()).toBe(true);
  await expect(page.locator(".bee-track")).toBeVisible();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("Bee Stop is still completable and pays out", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Games", exact: true }).click();
    await page.getByRole("button", { name: "Play Bee Stop" }).click();
    await page.getByRole("button", { name: "Let’s play" }).click();
    for (const [index, flower] of FLOWER_SPOTS.entries()) {
      await page.waitForFunction(
        (spot) => {
          const bar = document.querySelector<HTMLElement>(".bee-track");
          const pos = bar?.dataset.beePos;
          return pos !== undefined && Math.abs(Number(pos) - spot) < 0.05;
        },
        flower,
        { timeout: 20_000 },
      );
      await page.keyboard.press("Space");
      const next = index + 1;
      if (next < FLOWER_SPOTS.length)
        await expect(page.locator(".bee-announce")).toContainText(
          `Round ${next + 1} of 10`,
        );
    }
    const summary = page.locator(".game-win p");
    await expect(summary).toContainText("points across 10 rounds");
    const score = Number(
      /(\d+) points/.exec((await summary.innerText()) ?? "")![1],
    );
    expect(score % 10).toBe(0);
    await expect(page.locator(".wallet")).toHaveText(
      `✦${250 + coinsFor(score)}`,
    );
  });
});

test("Memory Safari can be completed and awards exactly 60 coins", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Memory Safari" }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  const cards = page.locator(".memory-card");
  const known = new Map<number, string>();
  const matched = new Set<number>();
  for (let turn = 0; turn < 30 && matched.size < 12; turn++) {
    const available = Array.from({ length: 12 }, (_, i) => i).filter(
      (i) => !matched.has(i),
    );
    let first =
      available.find((i) =>
        available.some(
          (j) => i !== j && known.has(i) && known.get(i) === known.get(j),
        ),
      ) ??
      available.find((i) => !known.has(i)) ??
      available[0];
    await cards.nth(first).click();
    const firstSymbol = await cards.nth(first).innerText();
    known.set(first, firstSymbol);
    const second =
      available.find((i) => i !== first && known.get(i) === firstSymbol) ??
      available.find((i) => i !== first && !known.has(i)) ??
      available.find((i) => i !== first)!;
    await cards.nth(second).click();
    const secondSymbol = await cards.nth(second).innerText();
    known.set(second, secondSymbol);
    if (firstSymbol === secondSymbol) {
      matched.add(first);
      matched.add(second);
      if (matched.size < 12) await expect(cards.nth(first)).toBeDisabled();
    } else
      await expect(cards.nth(first)).toHaveAttribute("aria-pressed", "false");
  }
  await expect(
    page.getByRole("heading", { name: "That’s a roaring success!" }),
  ).toBeVisible();
  await expect(page.locator(".wallet")).toHaveText("✦310");
  await page.getByRole("button", { name: "Back to the pride" }).click();
  await page.getByRole("button", { name: "Claim 50" }).click();
  await expect(page.locator(".wallet")).toHaveText("✦360");
});

test("Bee Stop runs ten rounds, pays its score band, and remembers the best", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  const track = page.locator(".bee-track");
  await expect(track).toBeFocused();
  for (const [index, flower] of FLOWER_SPOTS.entries()) {
    // The bee only reports a position once per painted frame, and a slow
    // browser paints roughly 0.05 * speed apart. Wait wider than that gap so
    // a frame can never step clean over the flower.
    await page.waitForFunction(
      (spot) => {
        const bar = document.querySelector<HTMLElement>(".bee-track");
        const pos = bar?.dataset.beePos;
        return pos !== undefined && Math.abs(Number(pos) - spot) < 0.05;
      },
      flower,
      { timeout: 20_000 },
    );
    await page.keyboard.press("Space");
    const next = index + 1;
    if (next < FLOWER_SPOTS.length)
      await expect(page.locator(".bee-announce")).toContainText(
        `Round ${next + 1} of 10`,
      );
  }
  const summary = page.locator(".game-win p");
  await expect(summary).toContainText("points across 10 rounds");
  const score = Number(
    /(\d+) points/.exec((await summary.innerText()) ?? "")![1],
  );
  expect(score % 10).toBe(0);
  expect(score).toBeGreaterThan(0);
  await expect(page.locator(".wallet")).toHaveText(`✦${250 + coinsFor(score)}`);
  await expect(page.locator(".bee-bloom")).toBeVisible();
  await page.getByRole("button", { name: "Back to the pride" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Bee Stop" }),
  ).toContainText(`Best ${score}`);
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.keyboard.press("Enter");
  await expect(page.locator(".bee-announce")).toContainText("Round 2 of 10");
  await expect(page.locator(".wallet")).toHaveText(`✦${250 + coinsFor(score)}`);
  expect(errors).toEqual([]);
});

test("the arcade and Bee Stop have no WCAG AA accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Games", exact: true }).click();
  const menuResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(menuResults.violations).toEqual([]);
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.waitForFunction(
    () => document.querySelector<HTMLElement>(".bee-track")?.dataset.beePos,
  );
  const playResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(playResults.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Games", exact: true }),
  ).toBeFocused();
});

test("the main world and dialogs have no WCAG AA accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const mainResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(mainResults.violations).toEqual([]);
  await page.getByRole("button", { name: "Style your lion" }).click();
  const dialogResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(dialogResults.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Style your lion" }),
  ).toBeFocused();
});

test("unavailable browser storage preserves a playable world with an honest warning", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Your browser couldn’t save",
  );
  await page.getByRole("button", { name: "My den", exact: true }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Your cozy den");
});
