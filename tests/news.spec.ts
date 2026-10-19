import { expect, test } from "@playwright/test";
import { newsForDay } from "../src/utils/news";
import { fantageGame } from "../src/games/fantage";

const saved = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

test("the Daily Roar puts on the outfit of the day and opens the game of the day", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 9, 19, 10, 0, 0));
  await page.goto("/");
  const news = newsForDay("2026-10-19");
  await page.getByRole("button", { name: "News", exact: true }).click();
  const paper = page.getByRole("dialog", { name: "The Daily Roar" });
  await expect(paper).toBeVisible();
  await paper.getByRole("button", { name: "Wear it" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect
    .poll(async () => (await saved(page)).look?.dressId)
    .toBe(news.dressId);
  await page.getByRole("button", { name: "News", exact: true }).click();
  const game = fantageGame(news.gameId);
  await page.getByRole("button", { name: `Play ${game.name}` }).click();
  await expect(
    page.getByRole("button", { name: `Start ${game.name}` }),
  ).toBeVisible();
});
