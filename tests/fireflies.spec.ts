import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

async function open(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Pop the Fireflies" }).click();
}

test("catch glowing fireflies; the night ends and saves the jar once", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Still fireflies make taps reliable; blinking still decides the catch.
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await open(page);
  await page.getByRole("button", { name: "Let's catch!" }).click();
  const jar = page.locator(".firefly-jar strong");
  // Tap a firefly the moment it glows: a slow runner's pointer click can outlast the glow.
  await expect(async () => {
    await page.evaluate(() =>
      document
        .querySelector<HTMLButtonElement>('.firefly[data-lit="true"]')
        ?.click(),
    );
    expect(Number(await jar.textContent())).toBeGreaterThan(0);
  }).toPass({ timeout: 15_000 });
  // A real pointer tap reaches the firefly: it is caught or wiggles.
  const jarBefore = Number(await jar.textContent());
  await page.locator(".firefly").first().click();
  await expect
    .poll(
      async () =>
        Number(await jar.textContent()) > jarBefore ||
        (await page.locator(".firefly-wiggle").count()) > 0,
    )
    .toBe(true);
  const before = await saved(page);
  // The night is a real 30 seconds; a fake clock made taps miss the glow.
  await expect(page.locator(".firefly-result")).toBeVisible({
    timeout: 45_000,
  });
  const after = await saved(page);
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  expect(after.fireflyBest).toBe(Number(await jar.textContent()));
  await page.waitForTimeout(1000);
  expect((await saved(page)).gamesPlayed).toBe(after.gamesPlayed);
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("the watering hole opens Pop the Fireflies", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^The watering hole/ })
    .click();
  await tapRoomPath(page, "Catch fireflies", true);
  await expect(
    page.getByRole("button", { name: "Let's catch!" }),
  ).toBeVisible();
});

test("Pop the Fireflies passes axe and holds still under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await open(page);
  await page.getByRole("button", { name: "Let's catch!" }).click();
  await expect(page.locator(".firefly").first()).toBeVisible();
  expect(
    await page
      .locator(".firefly-game [class]")
      .evaluateAll((nodes) =>
        nodes.every((node) => getComputedStyle(node).animationName === "none"),
      ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .include(".firefly-game")
    .analyze();
  expect(results.violations).toEqual([]);
});
