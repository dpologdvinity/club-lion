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
