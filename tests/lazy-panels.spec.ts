import { expect, test } from "@playwright/test";

test("a game whose code fails to download offers a reload instead of a blank app", async ({
  page,
}) => {
  await page.route(/BeeStop/, (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  const retry = page.getByRole("button", { name: "Try again" });
  await expect(retry).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Games", exact: true }),
  ).toBeVisible();

  await page.unroute(/BeeStop/);
  await retry.click();
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  await expect(page.getByRole("button", { name: "Let’s play" })).toBeVisible();
});
