import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { migratePlayerSave, newPlayer, SAVE_KEY } from "../src/game";

test("stamp album filters categories, supports keyboard tabs, traps focus, and fits mobile", async ({
  page,
}) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Stamp Book", exact: true });
  await opener.click();
  const album = page.getByRole("dialog", {
    name: "Savanna Stamp Book",
    exact: true,
  });
  await expect(album).toBeVisible();
  await expect(album.getByText("Stamps Collected: 0 / 28 (0%)")).toBeVisible();
  await expect(album.getByRole("progressbar")).toHaveAttribute("value", "0");
  await expect(album.getByRole("listitem")).toHaveCount(28);
  await expect(
    album.getByText("Find the coffee steam secret in Le Shop."),
  ).toBeVisible();
  await album.getByRole("tab", { name: "World Secrets", exact: true }).click();
  await expect(album.getByRole("listitem")).toHaveCount(7);
  await page.keyboard.press("ArrowRight");
  await expect(
    album.getByRole("tab", { name: "Park Thrills", exact: true }),
  ).toBeFocused();
  await expect(album.getByRole("listitem")).toHaveCount(7);
  await page.keyboard.press("End");
  await expect(
    album.getByRole("tab", { name: "Arcade Mastery", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    album.getByRole("tab", { name: "All", exact: true }),
  ).toBeFocused();
  await album.getByRole("button", { name: "Close dialog" }).focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await album.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(album).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await album.getByRole("button", { name: "Close dialog" }).click();
  await expect(opener).toBeFocused();
});

test("old saves backfill eligible stamps and preserve secret ownership through reload", async ({
  page,
}) => {
  const saved = migratePlayerSave({
    ...newPlayer(),
    owned: ["scarf", "barista_apron"],
    fruitCatchBest: 100,
    stamps: ["secret_den", "secret_den", "invalid"],
  });
  await page.addInitScript(
    ({ key, player }) => localStorage.setItem(key, JSON.stringify(player)),
    { key: SAVE_KEY, player: saved },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Stamp Book", exact: true }).click();
  const album = page.getByRole("dialog", { name: "Savanna Stamp Book" });
  await expect(album.getByText("Stamps Collected: 3 / 28 (11%)")).toBeVisible();
  await expect(album.getByText("Unlocked", { exact: true })).toHaveCount(3);
  await expect(
    album.getByText("Found the secret barista apron."),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).stamps,
        SAVE_KEY,
      ),
    )
    .toEqual(["secret_den", "catalog_barista", "fruit_catch_pro"]);
  await page.reload();
  await page.getByRole("button", { name: "Stamp Book", exact: true }).click();
  await expect(album.getByText("Stamps Collected: 3 / 28 (11%)")).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).owned,
      SAVE_KEY,
    ),
  ).toContain("barista_apron");
});

test("new progress unlocks stamps immediately and the award stays collected after reverting a status", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ID Card", exact: true }).click();
  await page
    .getByLabel("Status", { exact: true })
    .fill("Exploring the savanna!");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Stamp Book", exact: true }).click();
  await expect(page.getByText("Stamps Collected: 1 / 28 (4%)")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "ID Card", exact: true }).click();
  await page
    .getByLabel("Status", { exact: true })
    .fill("Vibing in the savanna");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Stamp Book", exact: true }).click();
  await expect(page.getByText("Stamps Collected: 1 / 28 (4%)")).toBeVisible();
});
