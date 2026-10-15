import { test, expect, type Page } from "@playwright/test";
import { openHeaderSettings } from "./header";

async function travel(page: Page, name: string) {
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: new RegExp(`^${name}`) })
    .click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}

async function oscillatorCount(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      (window as unknown as { roomMusicOscillators: number })
        .roomMusicOscillators,
  );
}

async function setVisibility(page: Page, state: "hidden" | "visible") {
  await page.evaluate((next) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => next,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { roomMusicOscillators: 0 });
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      createOscillator() {
        (window as unknown as { roomMusicOscillators: number })
          .roomMusicOscillators++;
        return super.createOscillator();
      }
    };
  });
});

test("room music is silent until sound is turned on, then changes with travel and stops on mute", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-room-music", /.+/);
  expect(await oscillatorCount(page)).toBe(0);

  await page
    .getByRole("button", { name: "Turn sound on", exact: true })
    .click();
  await expect.poll(() => oscillatorCount(page)).toBeGreaterThan(0);

  await travel(page, "Club Pulse");
  await expect(html).toHaveAttribute("data-room-music", "club-pulse-groove");
  await expect(
    page.getByRole("button", { name: "Turn sound off", exact: true }),
  ).toBeVisible();
  const travelled = await oscillatorCount(page);
  await expect.poll(() => oscillatorCount(page)).toBeGreaterThan(travelled);

  await openHeaderSettings(page);
  await page.getByRole("button", { name: "Mute audio", exact: true }).click();
  await page.waitForTimeout(300);
  const muted = await oscillatorCount(page);
  await page.waitForTimeout(600);
  expect(await oscillatorCount(page)).toBe(muted);

  await page.getByRole("button", { name: "Unmute audio", exact: true }).click();
  await expect.poll(() => oscillatorCount(page)).toBeGreaterThan(muted);
  expect(errors).toEqual([]);
});

test("room music pauses while the tab is hidden and resumes when it returns", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Turn sound on", exact: true })
    .click();
  await expect.poll(() => oscillatorCount(page)).toBeGreaterThan(0);

  await setVisibility(page, "hidden");
  await page.waitForTimeout(300);
  const hidden = await oscillatorCount(page);
  await page.waitForTimeout(600);
  expect(await oscillatorCount(page)).toBe(hidden);

  await setVisibility(page, "visible");
  await expect.poll(() => oscillatorCount(page)).toBeGreaterThan(hidden);
  expect(errors).toEqual([]);
});
