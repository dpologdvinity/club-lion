import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

async function openRoom(page: Page, destination: RegExp) {
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: destination }).click();
}

async function expectAvatarOnScreen(page: Page) {
  const avatar = page.locator(".your-character");
  await expect(avatar).toBeVisible();
  const box = await avatar.boundingBox();
  const view = page.viewportSize();
  expect(box && view).toBeTruthy();
  if (box && view) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(view.width);
  }
}

async function savedStamps(page: Page): Promise<string[]> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "{}").stamps ?? [],
    SAVE_KEY,
  );
}

test("Lion Aquarium connects to Coastal Pier, and its hotspots respond", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await openRoom(page, /^Coastal Pier & Boardwalk/);
  const paths = page.getByLabel("Room paths and activities");
  await paths.getByRole("button", { name: /Lion Aquarium/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Lion Aquarium");
  await expectAvatarOnScreen(page);

  await paths.getByRole("button", { name: "Feed the fish", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Yum!");
  await expect.poll(() => savedStamps(page)).toContain("aquarium_feeder");

  await paths.getByRole("button", { name: "Touch pool", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Starfish");
  await expectAccessible(page);

  await paths.getByRole("button", { name: /Coastal Pier/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText(
    "Coastal Pier & Boardwalk",
  );
  expect(errors).toEqual([]);
});

test("Snowflake Rink connects to Mt. Mist, and skating and cocoa respond", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await openRoom(page, /^Mt\. Mist Alpine Basecamp/);
  const paths = page.getByLabel("Room paths and activities");
  await paths.getByRole("button", { name: /Snowflake Rink/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Snowflake Rink");
  await expectAvatarOnScreen(page);

  await paths.getByRole("button", { name: "Skate", exact: true }).click();
  await expect(page.locator(".your-character")).toHaveClass(/is-skating/);
  await expect.poll(() => savedStamps(page)).toContain("rink_spinner");
  await expect(page.locator(".your-character")).not.toHaveClass(/is-skating/, {
    timeout: 10_000,
  });

  await paths.getByRole("button", { name: "Hot cocoa", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Hot cocoa");
  await expectAccessible(page);

  await paths.getByRole("button", { name: /Mt\. Mist/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText(
    "Mt. Mist Alpine Basecamp",
  );
  expect(errors).toEqual([]);
});
