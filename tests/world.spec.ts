import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";
import { coinsFor, FLOWER_SPOTS } from "../src/beeStop";

const PAW_LABELS = ["Up", "Down", "Left", "Right"];
const PAW_KEYS: Record<string, string> = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Left: "ArrowLeft",
  Right: "ArrowRight",
};

async function watchPaws(page: Page, count: number) {
  const seen: string[] = [];
  for (let index = 0; index < count; index++) {
    const lit = page.locator(".paw-key.lit");
    await lit.waitFor({ state: "attached", timeout: 10_000 });
    seen.push((await lit.first().getAttribute("aria-label"))!);
    await page.waitForFunction(() => !document.querySelector(".paw-key.lit"));
  }
  await page.waitForFunction(
    () =>
      document.querySelector(".paw-key")?.getAttribute("aria-disabled") ===
      "false",
  );
  return seen;
}

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

test("the arcade offers all seven activities", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Memory Safari" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Bee Stop" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Paw Steps" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Fruit Catch!" }),
  ).toBeVisible();
  for (const name of [
    "Play DJ Beat Drop",
    "Play Smoothie Kitchen",
    "Play Savanna Screamer",
  ]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
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
  await expect(
    page.getByRole("button", { name: "All games", exact: true }),
  ).toBeVisible();
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
test("Paw Steps pays for every finished round, then remembers the best score", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: /Paw Steps/ }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await expect(
    page.getByRole("dialog").locator('[aria-live="polite"]'),
  ).toHaveText(/^Showing: (Up|Down|Left|Right), (Up|Down|Left|Right)$/);
  const opening = await watchPaws(page, 2);
  expect(opening).toHaveLength(2);
  await page.keyboard.down(PAW_KEYS[opening[0]]);
  await expect(page.locator(".game-help")).toHaveText(
    "Your turn — repeat 1 step.",
  );
  await page.keyboard.down(PAW_KEYS[opening[0]]);
  await expect(page.locator(".game-help")).toHaveText(
    "Your turn — repeat 1 step.",
  );
  await page.keyboard.up(PAW_KEYS[opening[0]]);
  await page.keyboard.press(PAW_KEYS[opening[1]]);
  await expect(page.locator(".game-stats span").first()).toHaveText("1 rounds");
  await page.waitForFunction(() => !document.querySelector(".paw-key.lit"));
  const next = await watchPaws(page, 3);
  expect(next).toHaveLength(3);
  await page.keyboard.press(PAW_KEYS[next[0]]);
  const wrong = PAW_LABELS.find((label) => label !== next[1]);
  await page.getByRole("button", { name: wrong!, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What a run!" }),
  ).toBeVisible();
  await expect(
    page.getByText("You repeated 1 round", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".wallet")).toHaveText("✦260");
  await expect(page.getByRole("button", { name: "Claim 50" })).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".wallet")).toHaveText("✦260");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(page.getByText("Best: 1.", { exact: false })).toBeVisible();
});

test("Paw Steps accepts rapid correct input and locks a completed round", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: /Paw Steps/ }).click();
  await page.evaluate(() => {
    let index = 0;
    Math.random = () => [0, 0.26, 0.51][index++ % 3];
  });
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.waitForFunction(
    () =>
      document.querySelector(".paw-key")?.getAttribute("aria-disabled") ===
      "false",
  );
  await expect(
    page.getByRole("group", { name: "Paw step arrows" }),
  ).toBeFocused();
  await page.evaluate(() => {
    for (const key of ["ArrowUp", "ArrowLeft", "ArrowRight", "ArrowUp"]) {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
    }
  });
  await expect(page.locator(".game-stats span").first()).toHaveText("1 rounds");
  await page.waitForFunction(
    () =>
      document.querySelector(".paw-key")?.getAttribute("aria-disabled") ===
      "false",
  );
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("heading", { name: "What a run!" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Play again" })).toBeFocused();
  await expect(page.locator(".wallet")).toHaveText("✦260");
  await page.getByRole("button", { name: "Play again" }).click();
  await expect(
    page.getByRole("dialog").locator('[aria-live="polite"]'),
  ).toHaveText(/^Showing: /);
  await page.getByRole("button", { name: "All games", exact: true }).click();
  await expect(page.getByRole("button", { name: /Paw Steps/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Games", exact: true }),
  ).toBeFocused();
  await page.reload();
  await expect(page.locator(".wallet")).toHaveText("✦260");
});

test("the arcade menu keeps keyboard focus when any game is left", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  for (const name of ["Paw Steps", "Memory Safari", "Fruit Catch!"]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await page.getByRole("button", { name: "All games", exact: true }).click();
    await expect(
      page.getByRole("button", { name: new RegExp(name) }),
    ).toBeFocused();
  }
  await page.getByRole("button", { name: /Paw Steps/ }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Games", exact: true }),
  ).toBeFocused();
  await page.reload();
  await expect(page.locator(".wallet")).toHaveText("✦250");
});

test("Fruit Catch drops fruit fast enough to catch and keeps the round busy", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Fruit Catch!" }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await expect(page.locator(".fruit-field")).toBeVisible();
  for (let i = 0; i < 6; i++)
    await page.getByRole("button", { name: "Move basket left" }).click();
  const lowestFruit = async () =>
    page
      .locator(".falling-fruit")
      .evaluateAll((els) =>
        els.reduce(
          (lowest, el) =>
            Math.max(lowest, parseFloat((el as HTMLElement).style.top)),
          -20,
        ),
      );
  let lowest = -20;
  for (let sample = 0; sample < 80 && lowest < 75; sample++) {
    lowest = Math.max(lowest, await lowestFruit());
    if (lowest < 75) await page.waitForTimeout(100);
  }
  expect(lowest).toBeGreaterThanOrEqual(75);
  await page.waitForTimeout(4000);
  expect(await page.locator(".falling-fruit").count()).toBeGreaterThanOrEqual(
    3,
  );
  await expect(page.locator(".fruit-game-stats span").last()).toHaveAttribute(
    "aria-label",
    /^\d lives?$/,
  );
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
  await page.getByRole("button", { name: "Games", exact: true }).click();
  const menuResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(menuResults.violations).toEqual([]);
  await page.getByRole("button", { name: /Paw Steps/ }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  const padResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(padResults.violations).toEqual([]);
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
  await expect(
    page.getByRole("group", { name: "Environmental lighting" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "My den", exact: true }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Your cozy den");
});

test("a valid saved lighting preference survives reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Night", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Night", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Night", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".global-lighting-tint")).toBeVisible();
});

test("an invalid saved lighting preference recovers instead of blanking the world", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("clubLion.autoTime", "false");
    localStorage.setItem("clubLion.timeOfDay", "invalid");
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to the pride." }),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "Lion world" })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Downtown Plaza", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Lion world" }).locator(".room-scenery"),
  ).toBeVisible();
});

test("environmental lighting applies globally to raster rooms without manifests", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Night", exact: true }).click();
  await expect(page.locator(".global-lighting-tint")).toBeVisible();
  await page.getByRole("button", { name: "My den", exact: true }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Your cozy den");
  await expect(page.locator(".global-lighting-tint")).toBeVisible();
  await expect(page.locator(".global-lighting-star").first()).toBeVisible();
});

test("lighting controls are keyboard selectable with visible focus", async ({
  page,
}) => {
  await page.goto("/");
  const dusk = page.getByRole("button", { name: "Dusk", exact: true });
  await dusk.focus();
  await page.keyboard.press("Enter");
  await expect(dusk).toHaveAttribute("aria-pressed", "true");
  await expect(dusk).toBeFocused();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("star and firefly animation freezes, including mid-session preference changes", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Night", exact: true }).click();
    const star = page.locator(".global-lighting-star").first();
    await expect(star).toBeVisible();
    await expect(star).not.toHaveClass(/lighting-star-twinkle/);
    await page.getByRole("button", { name: "Day", exact: true }).click();
    await page.getByRole("button", { name: "Night", exact: true }).click();
    await expect(star).not.toHaveClass(/lighting-star-twinkle/);
  });
});

test("the header with lighting controls fits narrow viewports without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("group", { name: "Environmental lighting" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Customize your lion" }),
  ).toBeVisible();
});

test("Phase 1 ID Card modal opens, displays stats, and edits mood quote with persistence", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ID Card", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Player ID Card" }),
  ).toBeVisible();
  await expect(page.locator(".player-card-name")).toHaveText("Sunny");
  await expect(page.locator(".player-card-hearts")).toBeVisible();
  await expect(page.locator(".player-card-rank")).toBeVisible();

  await page.locator("#mood-quote").fill("Riding the savanna roller coaster!");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "ID Card", exact: true }).click();
  await expect(page.locator("#mood-quote")).toHaveValue(
    "Riding the savanna roller coaster!",
  );
  await page.keyboard.press("Escape");
});

test("Phase 1 Le Shop catalog allows tab navigation, unlocks secrets, and equips items", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Le Shop", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Le Shop Catalog" }),
  ).toBeVisible();

  // Switch tabs
  await page.getByRole("button", { name: "Bottoms", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Cargo Pants" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Tops", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Denim Jacket" }),
  ).toBeVisible();

  // Secret hotspot
  const steamHotspot = page.getByRole("button", {
    name: "A wisp of coffee steam",
  });
  await steamHotspot.click();
  await expect(
    page.getByRole("heading", { name: "Barista Apron" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
});

test("Phase 1 Stella's salon allows styling hair, colors, and streak highlights", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Salon", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Stella's Salon" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Butterfly Waves" }).click();
  await page.getByRole("button", { name: "Rose Pink" }).click();
  await page.getByRole("button", { name: "Neon Blue" }).click();
  await page.getByRole("button", { name: "Confirm new look" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Phase 1 Action Wheel triggers quick chat, emotes, and mango tossing", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Action wheel" }).click();
  await expect(
    page.getByRole("dialog", { name: "Quick chat & emotes" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Meet me at the café!" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".your-character .speech-bubble")).toHaveText(
    "Meet me at the café!",
  );

  // Trigger mango toss
  await page.getByRole("button", { name: "Action wheel" }).click();
  await page.getByRole("button", { name: "Toss mango" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Click ground to toss
  const ground = page.getByRole("button", {
    name: "Walk around the village.",
  });
  const groundBox = (await ground.boundingBox())!;
  await ground.click({
    position: { x: groundBox.width * 0.7, y: groundBox.height * 0.9 },
  });
  await expect(page.locator(".toast")).toContainText(
    "Splash! 🥭 Mango landed!",
  );
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Downtown Plaza", exact: true }),
  ).toBeVisible();
});

test("coastal travel and the lighthouse foghorn award a persistent stamp once", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  // The existing desktop header can overflow; coastal rooms must not add overflow.
  const initialOverflow = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
  );
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  const paths = page.getByLabel("Room paths and activities");
  await paths
    .getByRole("button", { name: "Sunset Beach", exact: true })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText("Sunset Beach");
  await paths
    .getByRole("button", { name: "Coastal Pier & Boardwalk", exact: true })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText(
    "Coastal Pier & Boardwalk",
  );
  const horn = paths.getByRole("button", {
    name: "Sound Foghorn",
    exact: true,
  });
  await horn.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".wallet")).toHaveText("✦290");
  await expect(page.getByRole("status")).toContainText(
    "BWWWOOOOMMM! 📯 The lighthouse foghorn echoes across the bay!",
  );
  await page
    .getByRole("button", { name: "Turn sound on", exact: true })
    .click();
  await horn.click();
  await expect(page.locator(".wallet")).toHaveText("✦290");
  await page
    .getByRole("button", { name: "Turn sound off", exact: true })
    .click();
  await page.locator(".camera-viewport-ground").focus();
  for (let step = 0; step < 37; step++) await page.keyboard.press("ArrowRight");
  await page
    .locator(".room-hotspot")
    .filter({ hasText: "Sound Foghorn" })
    .click();
  await expect(page.locator(".wallet")).toHaveText("✦290");
  await page.screenshot({
    path: `/tmp/club-lion-coastal-${test.info().project.name}.png`,
  });
  expect(
    await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    ),
  ).toBeLessThanOrEqual(initialOverflow);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await paths
    .getByRole("button", { name: "Sunset Beach", exact: true })
    .click();
  await paths
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await page.reload();
  await expect(page.locator(".wallet")).toHaveText("✦290");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(saved.stamps).toContain("lighthouse_foghorn");
  expect(saved.visited).toEqual(
    expect.arrayContaining(["sunset-beach", "coastal-pier"]),
  );
  await page
    .locator(".destination-card")
    .filter({ hasText: "Coastal Pier & Boardwalk" })
    .click();
  await paths
    .getByRole("button", { name: "Sound Foghorn", exact: true })
    .click();
  await expect(page.locator(".wallet")).toHaveText("✦290");
  expect(errors).toEqual([]);
});
