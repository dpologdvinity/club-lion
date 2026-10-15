import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const RAINBOW = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];

async function openParade(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Balloon Parade" }).click();
  await expect(
    page.getByRole("group", { name: "Balloons floating up" }),
  ).toBeVisible();
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

/** Taps a balloon of this colour (any colour when omitted) that is rising inside the stage. */
async function tapBalloon(page: Page, color?: string): Promise<boolean> {
  const stage = await page.locator(".bp-stage").boundingBox();
  if (!stage) return false;
  const name = color ? `${color} balloon` : /balloon$/;
  const balloons = page.getByRole("button", { name });
  for (const handle of await balloons.elementHandles()) {
    const box = await handle.boundingBox();
    if (!box) continue;
    const midY = box.y + box.height / 2;
    if (midY < stage.y || midY > stage.y + stage.height) continue;
    await handle.click();
    return true;
  }
  return false;
}

async function expectFitsViewport(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!box || !viewport) return;
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
}

test("popping a balloon bursts it with a surprise, and there is no timer", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openParade(page);
  await checkAccessibility(page);

  await page.getByRole("button", { name: "Pop mode" }).click();
  await expect.poll(() => tapBalloon(page)).toBe(true);
  await expect(page.locator(".bp-pop")).toHaveCount(1);
  await expect(page.locator(".bp-pop .bp-surprise")).toBeAttached();
  expect(errors).toEqual([]);
});

test("a wrong colour wiggles in rainbow order, and the full arch pays once and earns a stamp", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await page.goto("/");
  await openParade(page);
  await page.getByRole("button", { name: "Rainbow mode" }).click();

  // The first stripe is red, so tapping purple only wiggles and nothing is lost.
  await expect.poll(() => tapBalloon(page, "Purple")).toBe(true);
  await expect(page.locator(".bp-wiggle")).toHaveCount(1);
  await expect(page.locator(".bp-arc.is-built")).toHaveCount(0);

  for (const [stripe, color] of RAINBOW.entries()) {
    await expect
      .poll(() => tapBalloon(page, color), { timeout: 60_000 })
      .toBe(true);
    await expect(page.locator(".bp-arc.is-built")).toHaveCount(stripe + 1);
  }
  await expect(page.locator(".bp-sticker")).toHaveText("🌈");
  await expect(page.locator(".wallet")).toHaveText("✦275");

  await page.getByRole("button", { name: "Make another rainbow" }).click();
  await expect(page.locator(".bp-arc.is-built")).toHaveCount(0);
  await expect(page.locator(".wallet")).toHaveText("✦275");

  await page.reload();
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Balloon Parade" }),
  ).toContainText("Rainbows built 1");
});

test("the parade is reachable from its Wonder Park Midway hotspot", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await page
    .getByLabel("Room paths and activities")
    .getByRole("button", { name: "Carnival Midway", exact: true })
    .click();
  await page
    .getByLabel("Room paths and activities")
    .getByRole("button", { name: "Balloon Parade", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Balloons floating up" }),
  ).toBeVisible();
});

test("the parade fits a phone and an iPad screen without scrolling", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await openParade(page);
    await expectFitsViewport(page, ".bp-stage");
    await expectFitsViewport(page, ".bp-modes");
  }
});
