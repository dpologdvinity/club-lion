import { expect, test, type Page } from "@playwright/test";
import { tapRoomPath } from "./room-paths";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";

const RIDES = [
  ["Wonder Park Entrance", "Ride the Ferris wheel", "Sunshine Ferris Wheel"],
  ["Wonder Park Entrance", "Ride the Log Flume", "Sunshine Flume"],
  ["Carnival Midway", "Ride Mango Teacups", "Mango Teacups"],
  ["Carnival Midway", "Ride Golden Carousel", "Golden Carousel"],
  ["Carnival Midway", "Ride Lion Leap Tower", "Lion Leap Tower"],
] as const;

// Five full-screen rides (and fast-forwarded ride clocks) outlast the default.
test.describe.configure({ timeout: 180_000 });

async function openRide(page: Page, room: string, hotspot: string) {
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: new RegExp(`^${room}`) })
    .click();
  await expect(
    page.getByRole("heading", { name: room, exact: true }),
  ).toBeVisible();
  await tapRoomPath(page, hotspot);
}

test("every park ride opens from its hotspot, cheers on taps and exits", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const [room, hotspot, name] of RIDES) {
    await openRide(page, room, hotspot);
    const dialog = page.getByRole("dialog", { name });
    await expect(dialog).toBeVisible();
    const cheer = dialog.getByRole("button", { name: /^Cheer/ });
    await expect(cheer).toBeFocused();
    await cheer.click({ position: { x: 60, y: 60 } });
    await expect(dialog.locator(".pr-burst b").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await dialog.getByRole("button", { name: "Close dialog" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("finishing a ride unlocks its stamp once and offers ride again or exit", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await openRide(page, "Carnival Midway", "Ride Mango Teacups");
  const dialog = page.getByRole("dialog", { name: "Mango Teacups" });
  await expect(dialog).toBeVisible();
  await page.clock.fastForward(25_000);
  const again = dialog.getByRole("button", { name: "Ride again" });
  await expect(again).toBeFocused();
  const results = await new AxeBuilder({ page })
    .include(".dialog-ride")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
        SAVE_KEY,
      ),
    )
    .toMatchObject({
      stamps: expect.arrayContaining(["mango_teacups"]),
    });
  await again.click();
  await expect(again).toHaveCount(0);
  await page.clock.fastForward(25_000);
  await expect(
    dialog.getByRole("button", { name: "Ride again" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key) ?? "{}").stamps.filter(
          (id: string) => id === "mango_teacups",
        ).length,
      SAVE_KEY,
    ),
  ).toBe(1);
  await dialog.getByRole("button", { name: "Exit ride" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
