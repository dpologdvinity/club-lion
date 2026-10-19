import { expect, test, type Page } from "@playwright/test";
import { SAVE_KEY, migratePlayerSave, newPlayer } from "../src/game";

const saved = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
    SAVE_KEY,
  );

test("gold buys a costume in the closet; too little gold locks it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "200 gold" })).toBeVisible();
  await page.getByRole("button", { name: "Closet", exact: true }).click();
  const closet = page.getByRole("dialog", { name: "My Closet" });
  await closet.getByRole("button", { name: "Costumes", exact: true }).click();
  await closet
    .getByRole("button", { name: "Buy Teddy Bear Suit for 120 gold" })
    .click();
  await expect(page.getByRole("status", { name: "80 gold" })).toBeVisible();
  // 80 gold left is not enough for another 120-gold costume.
  await expect(
    closet.getByRole("button", { name: "Big Heart Suit, costs 120 gold" }),
  ).toBeDisabled();
  await closet.getByRole("button", { name: "Wear this look" }).click();
  const after = await saved(page);
  expect(after.gold).toBe(80);
  expect(after.owned).toContain("px:costume:teddy_bear");
  expect(after.look.costumeId).toBe("teddy_bear");
});

test("finishing a game pays gold", async ({ page }) => {
  const player = { ...migratePlayerSave(newPlayer()), gold: 5 };
  await page.addInitScript(
    ({ key, player }) => localStorage.setItem(key, JSON.stringify(player)),
    { key: SAVE_KEY, player },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Staries" }).click();
  await page.getByRole("button", { name: "Start Staries" }).click();
  for (let picture = 0; picture < 6; picture++) {
    const stars = await page.locator(".staries-star").count();
    for (let i = 1; i <= stars; i++)
      await page
        .getByRole("button", { name: `Star ${i}`, exact: true })
        .click();
    await page.getByRole("button", { name: "Next picture" }).click();
  }
  // 10 for the game, 25 for the Star Gazer stamp.
  await expect.poll(async () => (await saved(page)).gold).toBe(40);
});
