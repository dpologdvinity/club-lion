import type { Locator, Page } from "@playwright/test";

// Phones and tablets keep three exits in the room bar; the Map sheet lists every
// destination and this room's activities. Returns the activity's focus-return target.
export async function tapRoomPath(
  page: Page,
  name: string | RegExp,
  exact = false,
): Promise<Locator> {
  const barButton = page
    .locator(".room-navigation")
    .getByRole("button", { name, exact });
  if (
    (page.viewportSize()?.width ?? 1440) >= 1280 ||
    (await barButton.count())
  ) {
    await barButton.click();
    return barButton;
  }
  await page.getByRole("button", { name: "Map", exact: true }).first().click();
  const sheetName =
    typeof name === "string" && exact
      ? new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
      : name;
  const sheetButton = page
    .getByRole("dialog")
    .getByRole("button", { name: sheetName });
  await sheetButton.click();
  // Closing a map-launched activity restores focus to the persistent ground.
  return page.locator(".world-ground");
}
