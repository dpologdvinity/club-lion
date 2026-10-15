import { expect, test, type Page } from "@playwright/test";
import { tapRoomPath } from "./room-paths";
import { PLACES } from "../src/game";

// Phone-only layout checks: the floating chrome must not hide the avatar,
// stack on itself or push game controls off a 390x844 screen.
test.skip(({ isMobile }) => !isMobile, "phone layout");

async function travel(page: Page, room: string) {
  await page.getByRole("button", { name: "Map", exact: true }).first().click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: new RegExp(`^${room}`) })
    .click();
  await expect(
    page.getByRole("heading", { name: room, exact: true }),
  ).toBeVisible();
}

type Box = { x: number; y: number; width: number; height: number };
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

async function box(page: Page, selector: string): Promise<Box> {
  const found = await page.locator(selector).first().boundingBox();
  expect(found, selector).not.toBeNull();
  return found!;
}

test("room chrome keeps the avatar, labels and bars apart with 48px targets", async ({
  page,
}) => {
  await page.goto("/");
  await travel(page, "Downtown Plaza");
  const avatar = await box(page, ".your-character .chibi-avatar");
  const label = await box(
    page,
    '.room-hotspot:has-text("Visit the lion fountain")',
  );
  expect(overlaps(label, avatar)).toBe(false);
  const bar = await box(page, ".room-navigation");
  const toolbar = await box(page, ".chat-toolbar");
  const camera = await box(page, ".camera-viewport");
  expect(overlaps(bar, toolbar)).toBe(false);
  expect(overlaps(bar, avatar)).toBe(false);
  // The bars sit below the stage, so all walkable ground stays visible.
  expect(camera.y + camera.height).toBeLessThanOrEqual(bar.y + 1);
  expect(
    overlaps(await box(page, ".world-heading"), await box(page, ".welcome")),
  ).toBe(false);
  for (const button of await page
    .locator(".room-navigation .button-secondary")
    .all())
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  expect(
    (await page
      .getByRole("button", { name: "Customize your lion" })
      .boundingBox())!.width,
  ).toBeGreaterThanOrEqual(48);
});

for (const [room, game] of [
  ["Downtown Plaza", "Mango Bakery"],
  ["Sunset Beach", "Hide & Seek Safari"],
] as const)
  test(`${game} fits a phone screen without scrolling`, async ({ page }) => {
    await page.goto("/");
    await travel(page, room);
    await tapRoomPath(page, game);
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".bakery, .seek").first()).toBeVisible();
    expect(
      await dialog.evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    ).toBe(true);
    const back = await dialog
      .getByRole("button", { name: "All games" })
      .boundingBox();
    expect(back!.height).toBeGreaterThanOrEqual(48);
  });

test("the phone room bar is a Map picture plus three exits, all 56px or more", async ({
  page,
}) => {
  await page.goto("/");
  await travel(page, "Downtown Plaza");
  const bar = page.locator(".room-navigation");
  const tiles = bar.locator(".room-nav-tile");
  expect(await tiles.count()).toBe(4);
  await expect(bar.locator(".room-nav-map")).toHaveAccessibleName("Map");
  for (const icon of await tiles.locator(".room-nav-icon").all())
    await expect(icon).toHaveAttribute("aria-hidden", "true");
  for (const tile of await tiles.all()) {
    const found = (await tile.boundingBox())!;
    expect(found.height).toBeGreaterThanOrEqual(56);
  }
  // Downtown Plaza's first exits are the room's nearest neighbours.
  await expect(bar.locator(".room-nav-tile").nth(1)).toHaveAccessibleName(
    "Sunset Beach",
  );
});

for (const [name, width, height] of [
  ["phone", 390, 844],
  ["tablet", 820, 1180],
] as const)
  test(`${name} room bar never covers the avatar or ground hotspots`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await travel(page, "Downtown Plaza");
    const avatar = await box(page, ".your-character .chibi-avatar");
    const bar = await box(page, ".room-navigation");
    const camera = await box(page, ".camera-viewport");
    expect(camera.y + camera.height).toBeLessThanOrEqual(bar.y + 1);
    expect(overlaps(bar, avatar)).toBe(false);
    for (const hotspot of await page.locator(".room-hotspot").all()) {
      const found = await hotspot.boundingBox();
      if (found) expect(overlaps(bar, found)).toBe(false);
    }
  });

for (const [name, width, height] of [
  ["phone", 390, 844],
  ["tablet", 820, 1180],
] as const)
  test(`${name}: every destination is one Map tap away in a picture grid`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await travel(page, "Downtown Plaza");
    await page.getByRole("button", { name: "Map", exact: true }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toHaveClass(/map-sheet/);
    const tiles = sheet.locator(".map-destination");
    await expect(tiles).toHaveCount(PLACES.length);
    await expect(sheet.locator(".map-destination.selected")).toContainText(
      "Downtown Plaza",
    );
    const frame = (await sheet.boundingBox())!;
    for (const tile of await tiles.all()) {
      await tile.evaluate((el) => el.scrollIntoView({ block: "nearest" }));
      const found = (await tile.boundingBox())!;
      expect(found.width).toBeGreaterThanOrEqual(88);
      expect(found.height).toBeGreaterThanOrEqual(88);
      expect(found.x).toBeGreaterThanOrEqual(frame.x - 1);
      expect(found.x + found.width).toBeLessThanOrEqual(
        frame.x + frame.width + 1,
      );
      expect(found.y).toBeGreaterThanOrEqual(frame.y - 1);
      expect(found.y + found.height).toBeLessThanOrEqual(
        frame.y + frame.height + 1,
      );
    }
    for (const icon of await tiles.locator(".map-icon").all())
      await expect(icon).toHaveAttribute("aria-hidden", "true");
    // This room's activities sit under the destinations, one tap away too.
    const activities = sheet.locator(".map-activity");
    expect(await activities.count()).toBeGreaterThan(0);
    for (const tile of await activities.all()) {
      await tile.evaluate((el) => el.scrollIntoView({ block: "nearest" }));
      const found = (await tile.boundingBox())!;
      expect(found.width).toBeGreaterThanOrEqual(88);
      expect(found.height).toBeGreaterThanOrEqual(88);
    }
  });

test("the Map sheet closes with Escape and returns focus to the Map button", async ({
  page,
}) => {
  await page.goto("/");
  await travel(page, "Downtown Plaza");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".room-navigation .room-nav-map")).toBeFocused();
});

for (const [name, width, height] of [
  ["phone", 390, 844],
  ["tablet", 820, 1180],
] as const)
  test(`${name}: ground labels stay inside the stage and clear of the avatar`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await travel(page, "Downtown Plaza");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const avatar = document
            .querySelector(".your-character .chibi-avatar")
            ?.getBoundingClientRect();
          const camera = document
            .querySelector(".camera-viewport")
            ?.getBoundingClientRect();
          if (!avatar || !camera) return ["Room is not ready"];
          const labels = [...document.querySelectorAll(".room-hotspot")].filter(
            (label) => {
              const r = label.getBoundingClientRect();
              return (
                r.x + r.width / 2 > camera.x &&
                r.x + r.width / 2 < camera.right &&
                r.y + r.height / 2 > camera.y &&
                r.y + r.height / 2 < camera.bottom
              );
            },
          );
          if (!labels.length) return ["No on-stage hotspots"];
          return labels
            .filter((label) => {
              const r = label.getBoundingClientRect();
              return (
                r.left < avatar.right &&
                r.right > avatar.left &&
                r.top < avatar.bottom &&
                r.bottom > avatar.top
              );
            })
            .map((label) => label.textContent);
        }),
      )
      .toEqual([]);
  });
