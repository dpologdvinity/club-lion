import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

async function open(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Peekaboo Animals" }).click();
}

/** The bush hiding the called animal, read from the hidden emoji. */
async function bushes(page: Page) {
  await expect(page.locator(".peekaboo-target")).toBeVisible({
    timeout: 15_000,
  });
  const target = await page.locator(".peekaboo-target").textContent();
  const animals = await page.locator(".peekaboo-animal").allTextContents();
  const right = animals.findIndex((emoji) => emoji === target);
  return { right, wrong: right === 0 ? 1 : 0 };
}

test("find the called animal for 8 rounds; first tries count and save once", async ({
  page,
}) => {
  test.setTimeout(150_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await open(page);
  const before = await saved(page);
  await page.getByRole("button", { name: "Start peekaboo" }).click();
  for (let round = 0; round < 8; round++) {
    const { right, wrong } = await bushes(page);
    const bush = page.locator(".peekaboo-bush");
    // One wrong guess in the first round: it only shows who is there.
    if (round === 0) {
      await bush.nth(wrong).click();
      await expect(bush.nth(wrong)).toHaveClass(/is-out/);
    }
    await bush.nth(right).click();
    await expect(bush.nth(right)).toHaveClass(/is-out/);
  }
  await expect(page.locator(".peekaboo-result")).toHaveText(/7 \/ 8/, {
    timeout: 10_000,
  });
  const after = await saved(page);
  expect(after.peekabooBest).toBe(7);
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  expect(after.stamps).toContain("peekaboo_pro");
  await page.waitForTimeout(1500);
  expect((await saved(page)).gamesPlayed).toBe(after.gamesPlayed);
  expect(errors).toEqual([]);
});

test("Pet Paradise opens Peekaboo Animals", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Pet Paradise/ })
    .click();
  await tapRoomPath(page, "Play peekaboo", true);
  await expect(
    page.getByRole("button", { name: "Start peekaboo" }),
  ).toBeVisible();
});

test("Peekaboo Animals passes axe", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await open(page);
  await page.getByRole("button", { name: "Start peekaboo" }).click();
  await expect(page.locator(".peekaboo-target")).toBeVisible({
    timeout: 15_000,
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .include(".peekaboo-game")
    .analyze();
  expect(results.violations).toEqual([]);
});
