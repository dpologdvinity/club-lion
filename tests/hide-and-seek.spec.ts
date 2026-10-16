import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openSeek(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Hide & Seek Safari" }).click();
}

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

const scene = (page: Page) => page.getByTestId("seek-scene");

/** Reads the picture card and taps the matching critter. */
async function findCurrent(page: Page, viaKeyboard = false) {
  const label = await page.locator(".seek-card").getAttribute("aria-label");
  const name = label!.replace("Find the ", "");
  const critter = scene(page).getByRole("button", {
    name: new RegExp(`^${name}$`, "i"),
  });
  if (viaKeyboard) {
    await critter.focus();
    await page.keyboard.press("Enter");
  } else await critter.click();
  return name;
}

test("an easy round hints, forgives wrong taps, pays and stamps once, and persists", async ({
  page,
}) => {
  test.slow();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto("/");
  await openSeek(page);
  await expect(
    page.getByRole("button", { name: "Play in the savanna" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Play in the savanna" }).click();
  await expect(page.locator(".seek-item")).toHaveCount(5);
  await expect(page.locator(".seek-timer")).toHaveCount(0);

  await expect(page.locator(".seek-item.is-hint")).toHaveCount(0);
  await page.clock.runFor(5200);
  await expect(page.locator(".seek-item.is-hint")).toHaveCount(1);

  // A tap on empty sky and a tap on the wrong animal only boing.
  await scene(page).click({ position: { x: 8, y: 8 } });
  await expect(page.locator(".seek-miss")).toHaveCount(1);
  const wrong = page.locator(".seek-item:not(.is-hint) .seek-critter").first();
  await wrong.click();
  await expect(page.locator(".seek-progress .is-found")).toHaveCount(0);

  await findCurrent(page, true);
  await expect(page.locator(".seek-progress .is-found")).toHaveCount(1);
  await expect(page.locator(".seek-item.is-hint")).toHaveCount(0);
  // axe waits on real timers, so let the page clock run from here on.
  await page.clock.resume();
  await expectAccessible(page);
  for (let i = 0; i < 4; i++) await findCurrent(page);
  await expect(page.locator(".seek-progress .is-found")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Play again" })).toBeFocused();

  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.locator(".seek-progress .is-found")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.reload();
  expect(
    await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem("club-lion-player-v1")!);
      return [saved.seekRounds, saved.stamps];
    }),
  ).toEqual([1, ["seek_savanna"]]);
  expect(errors).toEqual([]);
});

test("tricky rounds add decoys and a timer and remember the best time", async ({
  page,
}) => {
  test.slow();
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto("/");
  await openSeek(page);
  const tricky = page.getByRole("button", { name: /Tricky mode/ });
  await tricky.click();
  await expect(tricky).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Play in the beach" }).click();
  await expect(page.locator(".seek-item")).toHaveCount(9);
  await expect(page.locator(".seek-timer")).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.clock.runFor(2000);
    await findCurrent(page);
  }
  await expect(page.locator(".seek-win-time")).toContainText("10s");
  await expect(page.getByLabel("New best time")).toBeVisible();
  await page.clock.resume();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Pick a new place" }).click();
  await expect(page.getByLabel("Best tricky time 10s")).toBeVisible();
  await expectAccessible(page);
  await page.reload();
  await openSeek(page);
  await expect(page.getByLabel("Best tricky time 10s")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("reduced motion swaps the hint wiggle for a still ring", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto("/");
  await openSeek(page);
  await page.getByRole("button", { name: "Play in the jungle" }).click();
  await page.clock.runFor(5200);
  const hinted = page.locator(".seek-item.is-hint .seek-critter > span");
  expect(
    await hinted.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".seek-item.is-hint")
      .evaluate((el) => getComputedStyle(el, "::before").borderTopStyle),
  ).toBe("solid");
});
