import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

const HOTSPOTS = [
  {
    room: "Downtown Plaza",
    name: "Bubble Pop",
    opened: (page: Page) =>
      page.getByRole("button", { name: "Challenge mode" }),
  },
  {
    room: "Downtown Plaza",
    name: "Coloring Book",
    opened: (page: Page) => page.getByRole("list", { name: "Coloring pages" }),
  },
  {
    room: "Sunset Beach",
    name: "Hide & Seek Safari",
    opened: (page: Page) =>
      page.getByRole("button", { name: "Play in the savanna" }),
  },
];

const paths = (page: Page) => page.getByLabel("Room paths and activities");

async function goTo(page: Page, room: string) {
  await page.goto("/");
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  if (room !== "Downtown Plaza") await tapRoomPath(page, room, true);
  await expect(page.locator(".world-location h2")).toHaveText(room);
}

async function expectGameThenClose(
  page: Page,
  opener: Locator,
  opened: Locator,
) {
  await expect(opened).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
}

for (const { room, name, opened } of HOTSPOTS) {
  test(`${name} opens from its ${room} hotspot and closing returns focus`, async ({
    page,
    isMobile,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await goTo(page, room);

    // The picture-first label on the scene is a 48px target.
    const stageHotspot = page
      .locator(".room-hotspot")
      .filter({ hasText: name });
    await expect(stageHotspot.locator(".hotspot-icon")).toBeAttached();
    await expect
      .poll(async () => (await stageHotspot.boundingBox())?.height ?? 0)
      .toBeGreaterThanOrEqual(47.5);

    // Keyboard and screen reader path: the room activity list, or on phones
    // the label on the stage (the bar keeps only three exits there).
    const compact = (page.viewportSize()?.width ?? 1440) < 1280;
    const listed = compact
      ? stageHotspot
      : paths(page).getByRole("button", { name, exact: true });
    await listed.focus();
    await page.keyboard.press("Enter");
    await expectGameThenClose(page, listed, opened(page));

    // Pointer path: the hotspot drawn in the scene, when it is on screen.
    const inView = await stageHotspot.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      return !!hit && el.contains(hit);
    });
    // Bubble Pop and Hide & Seek sit near where you arrive on a laptop.
    if (!isMobile && name !== "Coloring Book") expect(inView).toBe(true);
    if (inView) {
      await stageHotspot.click();
      await expectGameThenClose(page, stageHotspot, opened(page));
    }
    expect(errors).toEqual([]);
  });
}

test("room hotspots stay accessible", async ({ page }) => {
  await goTo(page, "Sunset Beach");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
