import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

const PERFECT: Record<string, Record<string, string>> = {
  "Beach day!": {
    Hats: "sun hat",
    Eyes: "sunglasses",
    Neck: "flower lei",
    Extras: "beach ball",
  },
  "Party time!": {
    Hats: "top hat",
    Eyes: "sunglasses",
    Neck: "bow",
    Extras: "balloon",
  },
  "Royal ball!": {
    Hats: "crown",
    Eyes: "glasses",
    Neck: "bow",
    Extras: "magic wand",
  },
  "Snow day!": {
    Hats: "earmuffs",
    Eyes: "snow goggles",
    Neck: "scarf",
    Extras: "snowman buddy",
  },
};

async function open(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Dress-the-Pet" }).click();
}

test("dress a pet for the theme: a perfect look gets 3 stars and the stamp", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await open(page);
  const show = page.getByRole("button", { name: "Show time!" });
  await expect(show).toBeDisabled();
  await page.getByRole("button", { name: "Bunny" }).click();
  await expect(page.locator(".dresspet-pet")).toHaveAttribute(
    "data-species",
    "bunny",
  );
  const theme =
    (await page.locator(".dresspet-theme").textContent())?.trim() ?? "";
  const look = Object.entries(PERFECT).find(([name]) => theme.endsWith(name));
  expect(look).toBeTruthy();
  for (const [slot, item] of Object.entries(look![1])) {
    await page.getByRole("button", { name: new RegExp(slot) }).click();
    await page.getByRole("button", { name: `Wear the ${item}` }).click();
  }
  await expect(page.locator(".dresspet-worn")).toHaveCount(4);
  const before = await saved(page);
  await show.click();
  await expect(page.locator(".dresspet-stars")).toHaveAttribute(
    "data-stars",
    "3",
  );
  const after = await saved(page);
  expect(after.petShows).toBe(1);
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  expect(after.stamps).toContain("pet_stylist");
  await page.getByRole("button", { name: "New theme" }).click();
  await expect(page.locator(".dresspet-worn")).toHaveCount(0);
  expect(
    (await page.locator(".dresspet-theme").textContent())?.trim(),
  ).not.toBe(theme);
  expect(errors).toEqual([]);
});

test("Pet Paradise opens Dress-the-Pet", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Pet Paradise/ })
    .click();
  await tapRoomPath(page, "Dress up a pet", true);
  await expect(page.getByRole("button", { name: "Show time!" })).toBeVisible();
});

test("Dress-the-Pet passes axe", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await open(page);
  await page.getByRole("button", { name: "Wear the crown" }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .include(".dresspet-game")
    .analyze();
  expect(results.violations).toEqual([]);
});
