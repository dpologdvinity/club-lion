import type { Page } from "@playwright/test";

// Compact layouts tuck lighting, audio and help behind the header Settings button.
export async function openHeaderSettings(page: Page) {
  const toggle = page.getByRole("button", { name: "Settings", exact: true });
  if (
    (await toggle.isVisible()) &&
    (await toggle.getAttribute("aria-expanded")) !== "true"
  )
    await toggle.click();
}

// Compact layouts start with the adventures drawer closed.
export async function openAdventures(page: Page) {
  const toggle = page.getByRole("button", { name: "Show adventures sidebar" });
  if (await toggle.isVisible()) await toggle.click();
}

export async function closeAdventures(page: Page) {
  const close = page.getByRole("button", { name: "Close adventures sidebar" });
  if (await page.evaluate(() => matchMedia("(max-width: 590px)").matches))
    await close.click();
}
