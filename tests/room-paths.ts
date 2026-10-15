import type { Locator, Page } from "@playwright/test";

// Phones and tablets keep three exits in the room bar; the Map sheet lists every
// destination and this room's activities. Returns the element that was tapped.
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
  const sheetButton = page
    .getByRole("dialog")
    .getByRole("button", { name, exact });
  await sheetButton.click();
  return sheetButton;
}
