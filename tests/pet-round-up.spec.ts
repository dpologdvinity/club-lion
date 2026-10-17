import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}"),
  );

async function open(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Pet Round-Up" }).click();
}

test("shoo and drag every pet into the pen; the round saves once", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Reduced motion: pets only move when shooed or dragged, so drags land.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await open(page);
  const before = await saved(page);
  await page.getByRole("button", { name: "Let's round up!" }).click();
  const pets = page.locator(".roundup-pet");
  await expect(pets).toHaveCount(9);

  // A tap just above a pet shoos it down, away from the finger.
  const first = pets.first();
  const start = await first.boundingBox();
  if (!start) throw new Error("no pet");
  await page.mouse.click(
    start.x + start.width / 2,
    start.y + start.height / 2 - 40,
  );
  await expect
    .poll(async () => (await first.boundingBox())?.y ?? 0)
    .toBeGreaterThan(start.y);

  const field = await page.locator(".roundup-field").boundingBox();
  if (!field) throw new Error("no field");
  const pen = {
    x: field.x + field.width * 0.8,
    y: field.y + field.height * 0.25,
  };
  for (let i = 0; i < 9; i++) {
    const pet = page.locator('.roundup-pet[data-penned="false"]').first();
    const box = await pet.boundingBox();
    if (!box) throw new Error("no pet");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(pen.x, pen.y, { steps: 8 });
    await page.mouse.up();
    if (i < 8)
      await expect(page.locator(".roundup-count strong")).toHaveText(
        String(i + 1),
      );
  }

  // All nine home ends the round early with a time bonus.
  const result = page.locator(".roundup-result");
  await expect(result).toBeVisible();
  const score = Number((await result.textContent())?.match(/\d+/)?.[0]);
  expect(score).toBeGreaterThan(9);
  const after = await saved(page);
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  expect(after.petRoundUpBest).toBe(score);
  expect(after.stamps).toContain("pet_wrangler");
  await page.waitForTimeout(1000);
  expect((await saved(page)).gamesPlayed).toBe(after.gamesPlayed);
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Pet Paradise opens Pet Round-Up", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Pet Paradise/ })
    .click();
  await tapRoomPath(page, "Round up pets", true);
  await expect(
    page.getByRole("button", { name: "Let's round up!" }),
  ).toBeVisible();
});

test("Pet Round-Up passes axe and holds still under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await open(page);
  await page.getByRole("button", { name: "Let's round up!" }).click();
  const first = page.locator(".roundup-pet").first();
  await expect(first).toBeVisible();
  const box = await first.boundingBox();
  await page.waitForTimeout(600);
  expect(await first.boundingBox()).toEqual(box);
  expect(
    await page
      .locator(".roundup-game [class]")
      .evaluateAll((nodes) =>
        nodes.every((node) => getComputedStyle(node).animationName === "none"),
      ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .include(".roundup-game")
    .analyze();
  expect(results.violations).toEqual([]);
});
