import { expect, test, type Page } from "@playwright/test";

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
    await page
      .locator(".room-navigation")
      .getByRole("button", { name: game })
      .click();
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
