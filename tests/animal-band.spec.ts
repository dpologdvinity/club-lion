import { tapRoomPath } from "./room-paths";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ANIMALS = ["Lion", "Zebra", "Giraffe", "Hippo", "Monkey", "Parrot"];

async function openBand(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Animal Orchestra" }).click();
  await expect(
    page.getByRole("button", { name: "Record a new song" }),
  ).toBeVisible();
}

async function goToPetParadise(page: Page) {
  await page.goto("/");
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await tapRoomPath(page, "Pet Paradise", true);
  await expect(page.locator(".world-location h2")).toHaveText(/Pet Paradise/);
}

async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

const animal = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });

// Every control must sit inside the viewport: a toddler should not scroll.
async function expectFitsViewport(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!box || !viewport) return;
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
}

test("every animal plays and dances, and the fifth tap bursts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openBand(page);
  for (const name of ANIMALS.slice(0, 4)) await animal(page, name).click();
  await expect(page.locator(".band-art.is-dancing")).toHaveCount(1);
  await expect(page.locator(".band-burst")).toHaveCount(0);
  await animal(page, "Monkey").click();
  await expect(page.locator(".band-burst")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("a recorded song plays back and pays once, and the stamp is earned", async ({
  page,
}) => {
  await page.goto("/");
  await openBand(page);
  await page.getByRole("button", { name: "Record a new song" }).click();
  for (const name of ["Lion", "Zebra", "Parrot"])
    await animal(page, name).click();
  await expect(page.getByRole("list", { name: "Song: 3 taps" })).toBeVisible();

  const play = page.getByRole("button", { name: "Play the song" });
  await play.click();
  await expect(page.locator(".band-note.is-playing")).toHaveCount(1);
  await expect(play).toBeEnabled({ timeout: 15_000 });
  // 250 starting coins, +4 for the song, +15 for the first-song stamp.
  await expect(page.locator(".wallet")).toHaveText("✦269");

  await play.click();
  await expect(page.locator(".band-note.is-playing")).toHaveCount(1);
  await expect(play).toBeEnabled({ timeout: 15_000 });
  await expect(page.locator(".wallet")).toHaveText("✦269");

  await page.reload();
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Animal Orchestra" }),
  ).toContainText("Songs played 1");
  await expect(page.locator(".wallet")).toHaveText("✦269");
});

test("the keyboard plays the animals and the band passes axe", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openBand(page);
  await checkAccessibility(page);
  await animal(page, "Monkey").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".band-art.is-dancing")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("the band opens from the Pet Paradise room and fits the screen", async ({
  page,
}) => {
  await goToPetParadise(page);
  await tapRoomPath(page, "Animal Orchestra", true);
  await expect(
    page.getByRole("button", { name: "Record a new song" }),
  ).toBeVisible();
  await expectFitsViewport(page, ".band-controls");
  await expectFitsViewport(page, ".band-stage");
});

test("the band fits an iPad portrait screen without scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/");
  await openBand(page);
  await expectFitsViewport(page, ".band-controls");
});
