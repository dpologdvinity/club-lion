import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/actions-ballistics.html");
});

test("wheel stays hidden when closed and restores focus after Escape", async ({
  page,
}) => {
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open actions" }).click();
  await expect(
    page.getByRole("dialog", { name: "Quick chat & emotes" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Meet me at the café!");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open actions" }),
  ).toBeFocused();
});

test("every emote and action selects its ID once and closes the wheel", async ({
  page,
}) => {
  const choices = [
    ["Heart", "emote:heart"],
    ["Star", "emote:star"],
    ["Laugh", "emote:laugh"],
    ["Shock", "emote:shock"],
    ["Sleep", "emote:sleep"],
    ["Dance", "action:dance"],
    ["Wave", "action:wave"],
    ["Sit", "action:sit"],
    ["Jam", "action:jam"],
    ["Toss mango", "action:toss"],
  ];
  const selected: string[] = [];
  for (const [label, value] of choices) {
    await page.getByRole("button", { name: "Open actions" }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
    selected.push(value);
    await expect(page.getByLabel("Selections")).toHaveText(
      JSON.stringify(selected),
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("quick phrases send their full text with keyboard activation", async ({
  page,
}) => {
  const phrases = [
    "Meet me at the café!",
    "Let's ride the roller coaster!",
    "Waterpark race!",
    "Love your outfit!",
    "Check out my den!",
    "AFK getting a smoothie 🥭",
  ];
  const selected: string[] = [];
  for (const phrase of phrases) {
    await page.getByRole("button", { name: "Open actions" }).click();
    await page.getByRole("button", { name: phrase, exact: true }).focus();
    await page.keyboard.press("Enter");
    selected.push(`phrase:${phrase}`);
    await expect(page.getByLabel("Selections")).toHaveText(
      JSON.stringify(selected),
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("wheel fits the viewport and passes accessibility checks", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open actions" }).click();
  const dialog = page.getByRole("dialog");
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  const audit = await new AxeBuilder({ page }).include("dialog").analyze();
  expect(audit.violations).toEqual([]);
});

test("wheel has no horizontal scrolling at the minimum supported width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.getByRole("button", { name: "Open actions" }).click();
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
});

test("toss lands at the clicked point once, survives rerenders, and clears splash", async ({
  page,
}) => {
  await page.clock.install();
  await page
    .getByRole("button", { name: "Toss here", exact: true })
    .click({ position: { x: 220, y: 180 } });
  await expect(page.getByLabel("Impacts")).toHaveText("[]");
  await page.getByRole("button", { name: "Rerender", exact: true }).click();
  await page.clock.runFor(750);
  await expect(page.getByLabel("Impacts")).toHaveText('["220,180:v1"]');
  const canvas = page.locator("canvas");
  expect(
    await canvas.evaluate((el: HTMLCanvasElement) =>
      el
        .getContext("2d")!
        .getImageData(0, 0, el.width, el.height)
        .data.some((value, index) => index % 4 === 3 && value > 0),
    ),
  ).toBe(true);
  await page.clock.runFor(1500);
  await expect(page.getByLabel("Impacts")).toHaveText('["220,180:v1"]');
  expect(
    await canvas.evaluate((el: HTMLCanvasElement) =>
      el
        .getContext("2d")!
        .getImageData(0, 0, el.width, el.height)
        .data.every((value, index) => index % 4 !== 3 || value === 0),
    ),
  ).toBe(true);
});

test("unmount cancels impact and changing target cancels the previous flight", async ({
  page,
}) => {
  await page.clock.install();
  await page
    .getByRole("button", { name: "Toss here", exact: true })
    .click({ position: { x: 220, y: 180 } });
  await page.getByRole("button", { name: "Cancel toss" }).click();
  await page.clock.runFor(1500);
  await expect(page.getByLabel("Impacts")).toHaveText("[]");
  await page
    .getByRole("button", { name: "Toss here", exact: true })
    .click({ position: { x: 220, y: 180 } });
  await page.getByRole("button", { name: "Retarget" }).click();
  await page.clock.runFor(1500);
  await expect(page.getByLabel("Impacts")).toHaveText('["80,100:v0"]');
});

test("reduced motion still reports one impact", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page
    .getByRole("button", { name: "Toss here", exact: true })
    .click({ position: { x: 220, y: 180 } });
  await page.clock.runFor(1500);
  await expect(page.getByLabel("Impacts")).toHaveText('["220,180:v0"]');
});
