import { test, expect } from "@playwright/test";
import { SAVE_KEY, migratePlayerSave, newPlayer } from "../src/game";

test("hoverboard glides to the clicked ground and steps farther with the keyboard", async ({
  page,
}) => {
  const player = migratePlayerSave(newPlayer());
  player.look.boardId = "hover_leaf";
  await page.addInitScript(
    ({ key, player }) => {
      localStorage.setItem(key, JSON.stringify(player));
    },
    { key: SAVE_KEY, player },
  );
  await page.goto("/");
  const ground = page.getByRole("button", { name: "Walk around the village." });
  await ground.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".your-character")).toHaveCSS("left", /.+/);
  expect(
    await page
      .locator(".your-character")
      .evaluate((el: HTMLElement) => parseFloat(el.style.left)),
  ).toBe(47.5);
  const bounds = await ground.boundingBox();
  if (!bounds) throw new Error("Ground is missing");
  await ground.click({
    position: { x: bounds.width * 0.3, y: bounds.height * 0.86 },
  });
  expect(
    await page
      .locator(".your-character")
      .evaluate((el: HTMLElement) => parseFloat(el.style.left)),
  ).toBeCloseTo(30, 0);
  await expect(page.locator(".sparkle-particle").first()).toBeAttached();
  await expect(page.locator(".sparkle-particle")).toHaveCount(0, {
    timeout: 3000,
  });
});

test("reduced motion suppresses hoverboard sparkles", async ({ page }) => {
  const player = migratePlayerSave(newPlayer());
  player.look.boardId = "hover_leaf";
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    ({ key, player }) => {
      localStorage.setItem(key, JSON.stringify(player));
    },
    { key: SAVE_KEY, player },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Walk around the village." }).focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  await expect(page.locator(".sparkle-particle")).toHaveCount(0);
});
