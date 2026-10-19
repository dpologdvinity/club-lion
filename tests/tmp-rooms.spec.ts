import { test } from "@playwright/test";
const ROOMS = ["Canopy café", "Lola's Kainan", "Pet Paradise", "Wonder Park", "Carnival Midway", "The Pride HQ", "Canyon", "Mt. Mist", "Club Pulse", "Luxury Penthouse", "Snowflake", "Dino Dig", "Lion Aquarium", "Coastal Pier", "The watering hole", "Lion Speedway", "Sunset Beach", "Splash Oasis", "Lazy River"];
test("rooms", async ({ page }) => {
  test.setTimeout(1_200_000);
  await page.setViewportSize({ width: 4000, height: 1000 });
  await page.goto("/");
  for (const [i, room] of ROOMS.entries()) {
    await page.getByRole("button", { name: "Map", exact: true }).click({ timeout: 120_000 });
    await page.getByRole("dialog").getByRole("button", { name: new RegExp(`^${room.replace("'", "'")}`) }).first().click({ timeout: 120_000 });
    await page.waitForTimeout(9800);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `/tmp/hk/room-${String(i).padStart(2, "0")}.png` });
  }
});
