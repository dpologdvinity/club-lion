import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

const saved = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

async function openFromGames(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Mango Run" }).click();
}

test("Mango Run never ends on a bump; All done saves the best once", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install();
  await page.goto("/");
  await openFromGames(page);
  await expect(page.getByText(/lives/i)).toHaveCount(0);
  await page.getByRole("button", { name: /Let’s run/ }).click();
  // Run long enough to meet rocks: the run keeps going.
  await page.clock.runFor(30_000);
  await expect(page.getByRole("button", { name: "All done!" })).toBeVisible();
  const before = await saved(page);
  await page.getByRole("button", { name: "All done!" }).click();
  await expect(page.locator(".game-win")).toBeVisible();
  const after = await saved(page);
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  expect(after.mangoRunBest).toBeGreaterThan(0);
  await page.clock.runFor(2000);
  expect((await saved(page)).gamesPlayed).toBe(after.gamesPlayed);
  await page.reload();
  expect((await saved(page)).mangoRunBest).toBe(after.mangoRunBest);
  expect(errors).toEqual([]);
});

test("the arcade room launches Mango Run", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^The arcade/ })
    .click();
  await tapRoomPath(page, "Run for mangoes", true);
  await expect(page.getByRole("button", { name: /Let’s run/ })).toBeVisible();
});

test("Mango Run passes axe and stays still under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openFromGames(page);
  await page.getByRole("button", { name: /Let’s run/ }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
