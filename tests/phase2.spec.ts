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
  const ground = page.locator(".camera-viewport-ground");
  const left = () =>
    page
      .locator(".your-character")
      .evaluate((el: HTMLElement) => parseFloat(el.style.left));
  await ground.focus();
  const start = await left();
  await page.keyboard.press("ArrowRight");
  expect(await left()).toBeGreaterThan(start);
  await page
    .locator(".your-character")
    .evaluate((el) =>
      Promise.all(el.getAnimations().map((animation) => animation.finished)),
    );
  // Tap open grass left of the doll; the board glides straight there.
  const stage = (await page.locator(".camera-viewport-stage").boundingBox())!;
  const before = await left();
  const target = before - 12;
  await page.mouse.click(
    stage.x + (stage.width * target) / 100,
    // Open grass between the flower row and the square's toys.
    stage.y + (stage.height * 544) / 864,
  );
  expect(await left()).toBeCloseTo(target, 0);
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
  await page.locator(".camera-viewport-ground").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  await expect(page.locator(".sparkle-particle")).toHaveCount(0);
});
