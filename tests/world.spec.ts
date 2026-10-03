import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";

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

async function startMangoRun(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mango Run" })).toBeVisible();
  await page.getByRole("button", { name: "Play Mango Run" }).click();
  await expect(page.getByText("Three lives.")).toBeVisible();
  await page.getByRole("button", { name: "Let’s run" }).click();
  await expect(
    page.getByRole("group", { name: /Mango Run trail/ }),
  ).toBeFocused();
}

test("Mango Run can be started, steered, and closed", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Memory Safari" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mango Run" })).toBeVisible();
  await page.getByRole("button", { name: "Play Mango Run" }).click();
  await expect(page.getByText("Three lives.")).toBeVisible();
  await page.getByRole("button", { name: "Let’s run" }).click();

  const field = page.getByRole("group", { name: /Mango Run trail/ });
  await expect(field).toBeFocused();
  const lion = page.locator(".mr-lion");
  const before = await lion.getAttribute("style");
  await page.keyboard.down("ArrowDown");
  await expect(lion).not.toHaveAttribute("style", before!);
  await page.keyboard.up("ArrowDown");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the arcade switches from Mango Run to Fruit Catch without rewarding an unfinished run", async ({
  page,
}) => {
  await startMangoRun(page);
  await page.getByRole("button", { name: "All games" }).click();
  await expect(page.locator(".mr-playfield")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Mango Run" })).toBeVisible();
  await page.getByRole("button", { name: "Play Fruit Catch!" }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await expect(page.locator(".fruit-field")).toBeVisible();
  await expect(page.locator(".wallet")).toHaveText("✦250");
});

test("a held steering key moves the lion until it is released", async ({
  page,
}) => {
  await startMangoRun(page);
  const lion = page.locator(".mr-lion");

  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(160);
  const whileHeld = await lion.getAttribute("style");
  await page.waitForTimeout(260);
  const stillHeld = await lion.getAttribute("style");
  expect(stillHeld).not.toBe(whileHeld);

  await page.keyboard.up("ArrowDown");
  await page.waitForTimeout(120);
  const released = await lion.getAttribute("style");
  await page.waitForTimeout(260);
  expect(await lion.getAttribute("style")).toBe(released);
});

test("pausing freezes the trail and resuming continues it", async ({
  page,
}) => {
  await startMangoRun(page);
  const lion = page.locator(".mr-lion");

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeFocused();

  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(400);
  const frozen = await lion.getAttribute("style");
  await page.waitForTimeout(300);
  expect(await lion.getAttribute("style")).toBe(frozen);
  await page.keyboard.up("ArrowDown");

  await page.getByRole("button", { name: "Resume" }).click();
  await expect(
    page.getByRole("group", { name: /Mango Run trail/ }),
  ).toBeFocused();
  await page.keyboard.down("ArrowDown");
  await expect(lion).not.toHaveAttribute("style", frozen!);
  await page.keyboard.up("ArrowDown");
});

test("Escape resumes a paused run instead of closing the game", async ({
  page,
}) => {
  await startMangoRun(page);
  await page.getByRole("button", { name: "Pause" }).click();

  await page.locator(".mr-paused").click({ position: { x: 4, y: 4 } });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the on-screen pad steers the lion without a keyboard", async ({
  page,
  hasTouch,
}) => {
  test.skip(!hasTouch, "touch pad is only shown on touch devices");
  await startMangoRun(page);
  const pad = page.getByRole("button", { name: "Steer down" });
  await expect(pad).toBeVisible();

  const lion = page.locator(".mr-lion");
  const before = await lion.getAttribute("style");
  await pad.dispatchEvent("pointerdown", { pointerId: 1 });
  await page.waitForTimeout(240);
  await pad.dispatchEvent("pointerup", { pointerId: 1 });
  expect(await lion.getAttribute("style")).not.toBe(before);

  const stopped = await lion.getAttribute("style");
  await page.waitForTimeout(260);
  expect(await lion.getAttribute("style")).toBe(stopped);
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`idle Mango Run ends, rewards once, and saves the best (${reducedMotion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await page.clock.install({ time: new Date("2026-10-03T12:00:00Z") });
    await startMangoRun(page);
    await page.clock.pauseAt(new Date("2026-10-03T12:01:00Z"));
    const result = page.getByRole("heading", { name: "A brand new best!" });
    for (
      let second = 0;
      second < 60 && (await result.count()) === 0;
      second++
    ) {
      await page.clock.runFor(1000);
    }
    await expect(result).toBeVisible();
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      SAVE_KEY,
    );
    expect(saved.gamesPlayed).toBe(1);
    expect(saved.mangoRunBest).toBeGreaterThan(0);
    expect(saved.coins).toBe(250 + saved.mangoRunBest);
    await page.clock.runFor(3000);
    expect(
      await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY),
    ).toBe(JSON.stringify(saved));

    await page.getByRole("button", { name: "Run again" }).click();
    await expect(page.getByRole("img", { name: "3 lives left" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.reload();
    await page.getByRole("button", { name: "Games", exact: true }).click();
    await page.getByRole("button", { name: "Play Mango Run" }).click();
    await expect(page.locator(".game-features")).toContainText(
      `${saved.mangoRunBest}`,
    );
    await expect(page.locator(".wallet")).toHaveText(`✦${saved.coins}`);
  });
}

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
