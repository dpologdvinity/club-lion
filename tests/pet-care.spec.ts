import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";

test("nursery grooming is named, keyboard accessible, persistent, and silent by default", async ({
  page,
}) => {
  const errors: string[] = [];
  const audioRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/\.(mp3|wav|ogg)(?:\?|$)/i.test(request.url()))
      audioRequests.push(request.url());
  });
  await page.addInitScript(() => {
    Object.assign(window, { petAudioCalls: 0 });
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      createOscillator() {
        (window as unknown as { petAudioCalls: number }).petAudioCalls++;
        return super.createOscillator();
      }
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Pet Paradise Nursery/ })
    .click();
  const opener = page
    .locator(".room-navigation")
    .getByRole("button", { name: "Grooming Spa", exact: true });
  await expect(opener).toBeVisible();
  const hotspot = page
    .locator(".room-hotspot")
    .filter({ hasText: "Grooming Spa" });
  await expect(hotspot).toHaveCount(1);
  await hotspot.click();
  let dialog = page.getByRole("dialog", { name: "Pet Paradise Nursery" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await opener.focus();
  await page.keyboard.press("Enter");
  dialog = page.getByRole("dialog", { name: "Pet Paradise Nursery" });
  await expect(
    dialog.getByRole("button", { name: "Sound off" }),
  ).toHaveAttribute("aria-pressed", "false");
  await dialog.getByRole("button", { name: "Wash", exact: true }).click();
  await expect(
    dialog.getByRole("progressbar", { name: "Pet cleanliness level" }),
  ).toHaveAttribute("aria-valuenow", "85");
  await dialog.getByRole("button", { name: "Brush", exact: true }).click();
  await dialog.getByRole("button", { name: "Brush", exact: true }).click();
  await expect(
    dialog.getByRole("progressbar", { name: "Pet happiness level" }),
  ).toHaveAttribute("aria-valuenow", "100");
  expect(
    await page.evaluate(
      () => (window as unknown as { petAudioCalls: number }).petAudioCalls,
    ),
  ).toBe(0);
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(
    saved.stamps.filter((id: string) => id === "pet_pampered"),
  ).toHaveLength(1);
  expect(saved.coins).toBe(250);
  expect(saved.gamesPlayed).toBe(0);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await dialog.getByRole("button", { name: "Sound off" }).click();
  await dialog.getByRole("button", { name: "Treat", exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { petAudioCalls: number }).petAudioCalls,
    ),
  ).toBe(1);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.reload();
  const reloaded = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(reloaded.petCare.happiness).toBe(100);
  expect(reloaded.petCare.hunger).toBe(90);
  expect(
    reloaded.stamps.filter((id: string) => id === "pet_pampered"),
  ).toHaveLength(1);
  expect(audioRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("nursery reduced motion and narrow layouts retain usable care controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Pet Paradise Nursery/ })
    .click();
  await page
    .locator(".room-navigation")
    .getByRole("button", { name: "Grooming Spa", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Pet Paradise Nursery" });
  await dialog.getByRole("button", { name: "Brush", exact: true }).click();
  await expect(page.locator(".effect-particles")).toBeHidden();
  await dialog.getByRole("button", { name: "Brush", exact: true }).click();
  await expect(page.locator(".heart-burst")).toBeHidden();
  await expect(dialog.getByText("Your pet is fully pampered!")).toBeVisible();
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: `/tmp/pet-care-${test.info().project.name}.png`,
  });
  await page.setViewportSize({ width: 320, height: 640 });
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await expect(
    dialog.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});
