import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openDJ(page: Page) {
  await page.clock.install({ time: new Date("2026-10-03T12:00:00Z") });
  await page.goto("/tests/fixtures/phase2.html");
  await page.clock.pauseAt(new Date("2026-10-03T13:00:00Z"));
  await page.getByRole("button", { name: "Open DJ booth" }).click();
  await page.getByRole("button", { name: "Drop the beat" }).click();
}

test("missed beats reset the streak while the completed result preserves the peak and pays once", async ({
  page,
}) => {
  await openDJ(page);
  await page.clock.runFor(500);
  await page.getByRole("button", { name: "Hit lane D" }).click();
  await expect(page.locator(".dj-combo-banner")).toContainText("1 combo");
  await page.clock.runFor(1200);
  await expect(page.locator(".dj-combo-banner")).toContainText("0 combo");
  await page.clock.runFor(17000);
  await expect(page.getByLabel("DJ rewards")).toHaveText(
    '[{"score":100,"combo":1,"coins":5}]',
  );
  await expect(page.getByRole("button", { name: "Play again" })).toBeFocused();
  await page.clock.runFor(2000);
  await expect(page.getByLabel("DJ rewards")).toHaveText(
    '[{"score":100,"combo":1,"coins":5}]',
  );
  await page.getByRole("button", { name: "Play again" }).click();
  await page.clock.runFor(500);
  await page.getByRole("button", { name: "Hit lane D" }).click();
  await page.clock.runFor(18000);
  await expect(page.getByLabel("DJ rewards")).toHaveText(
    '[{"score":100,"combo":1,"coins":5},{"score":100,"combo":1,"coins":5}]',
  );
});

test("a held key cannot score another beat", async ({ page }) => {
  await openDJ(page);
  await page.clock.runFor(500);
  await page.evaluate(() =>
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "d", repeat: true, bubbles: true }),
    ),
  );
  await expect(page.locator(".fruit-game-stats span").first()).toHaveText(
    "0 pts",
  );
});

test("audio initialization failure still permits scoring and completion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", {
      value: class {
        constructor() {
          throw new Error("Audio unavailable");
        }
      },
    });
  });
  await openDJ(page);
  await page.clock.runFor(500);
  await page.getByRole("button", { name: "Hit lane D" }).click();
  await expect(page.locator(".fruit-game-stats")).toContainText("100 pts");
  await page.clock.runFor(18000);
  await expect(page.getByLabel("DJ rewards")).toHaveText(
    '[{"score":100,"combo":1,"coins":5}]',
  );
  expect(errors).toEqual([]);
});

test("DJ lanes receive focus, align with the hit line, and pass accessibility checks", async ({
  page,
}) => {
  await openDJ(page);
  await expect(page.getByRole("button", { name: "Hit lane D" })).toBeFocused();
  await page.clock.runFor(500);
  const centers = await page
    .locator(".dj-lane")
    .first()
    .evaluate((lane) => {
      const note = lane.querySelector(".dj-note")!.getBoundingClientRect();
      const line = lane.querySelector(".dj-hit-line")!.getBoundingClientRect();
      return { note: note.y + note.height / 2, line: line.y + line.height / 2 };
    });
  expect(Math.abs(centers.note - centers.line)).toBeLessThan(3);
  await page.clock.resume();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open DJ booth" }),
  ).toBeFocused();
  await expect(page.getByLabel("DJ rewards")).toHaveText("[]");
});
