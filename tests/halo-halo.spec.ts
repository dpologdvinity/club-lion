import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

async function openFromGames(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Lola's Halo-Halo" }).click();
}

test("every halo-halo cup gets stars and pays once", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openFromGames(page);
  const serve = page.getByRole("button", { name: "Serve", exact: true });
  await expect(serve).toBeDisabled();
  await page.getByRole("button", { name: "Add Ube" }).click();
  await page.getByRole("button", { name: "Add Leche flan" }).click();
  await page.getByRole("button", { name: "Take one off" }).click();
  await page.getByRole("button", { name: "Add Ice cream" }).click();
  await expect(page.getByRole("img", { name: /2 layers/ })).toBeVisible();
  const before = await saved(page);
  await serve.click();
  await expect(page.locator(".halo-thanks")).toBeVisible();
  await expect(page.locator(".halo-stars")).toHaveAttribute(
    "data-stars",
    /[123]/,
  );
  const after = await saved(page);
  expect(after.haloHaloServed).toBe(1);
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  expect(after.stamps).toContain("halo_halo_chef");
  await expect(serve).toBeDisabled();
  await page.getByRole("button", { name: "Next cup" }).click();
  await expect(page.getByRole("img", { name: /0 layers/ })).toBeVisible();
  // Free play: any cup is a three-star cup.
  await page.getByRole("button", { name: "Make my own" }).click();
  await page.getByRole("button", { name: "Add Sweet beans" }).click();
  await serve.click();
  await expect(page.locator(".halo-stars")).toHaveAttribute("data-stars", "3");
  expect((await saved(page)).haloHaloServed).toBe(2);
  expect(errors).toEqual([]);
});

test("Lola greets and her halo-halo machine opens the game", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Lola's Kainan/ })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText("Lola's Kainan");
  await expect(
    page.getByRole("button", { name: "Say hello to Lola" }),
  ).toBeInViewport();
  await tapRoomPath(page, "Make halo-halo", true);
  await expect(
    page.getByRole("button", { name: "Serve", exact: true }),
  ).toBeVisible();
});

test("Halo-Halo passes axe and stays still under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openFromGames(page);
  await page.getByRole("button", { name: "Add Ube" }).click();
  await page.getByRole("button", { name: "Serve", exact: true }).click();
  expect(
    await page
      .locator(".halo-game [class]")
      .evaluateAll((nodes) =>
        nodes.every((node) => getComputedStyle(node).animationName === "none"),
      ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .include(".halo-game")
    .analyze();
  expect(results.violations).toEqual([]);
});
