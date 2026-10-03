import { test, expect } from "@playwright/test";

type FrameWindow = Window & { stepBee: (milliseconds: number) => void };

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let clock = 0;
    let id = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    performance.now = () => clock;
    window.requestAnimationFrame = (callback) => {
      callbacks.set(++id, callback);
      return id;
    };
    window.cancelAnimationFrame = (frame) => callbacks.delete(frame);
    (window as FrameWindow).stepBee = (milliseconds) => {
      clock += milliseconds;
      const queued = [...callbacks.values()];
      callbacks.clear();
      queued.forEach((callback) => callback(clock));
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  await page.getByRole("button", { name: "Let’s play" }).click();
});

test("scoring bands share the blossom center", async ({ page }) => {
  const offsets = await page.locator(".bee-track").evaluate((track) => {
    const flower = track.querySelector(".bee-flower")!.getBoundingClientRect();
    const center = flower.x + flower.width / 2;
    return [...track.querySelectorAll(".bee-zone")].map((zone) => {
      const rect = zone.getBoundingClientRect();
      return Math.abs(rect.x + rect.width / 2 - center);
    });
  });
  expect(offsets).toHaveLength(3);
  for (const offset of offsets) expect(offset).toBeLessThan(1);
});

test("reduced motion scores the visible bee when activated by a click", async ({
  page,
}) => {
  await page.evaluate(() => {
    const frames = window as FrameWindow;
    for (let index = 0; index < 7; index++) frames.stepBee(50);
    // The hidden position advances beyond perfect while the painted bee stays
    // at 0.315, beside the first flower at 0.32.
    frames.stepBee(46);
  });
  await expect(page.locator(".bee-track")).toHaveAttribute(
    "data-bee-pos",
    "0.3150",
  );
  await page.locator(".bee-track").evaluate((track) => track.click());
  await expect(page.locator(".bee-announce")).toHaveText(
    "Perfect! Round 1 of 10. 100 points.",
  );
  await expect(page.locator(".bee-announce")).toContainText("Round 2 of 10");
  await expect(page.locator(".game-stats")).toContainText("100 points");
  await expect(page.locator(".wallet")).toHaveText("✦250");
});

test("pointer and click events from one activation score the round once", async ({
  page,
}) => {
  await page.evaluate(() => {
    for (let index = 0; index < 7; index++) (window as FrameWindow).stepBee(50);
  });
  await page.locator(".bee-track").evaluate((track) => {
    track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    track.click();
    track.click();
  });
  await expect(page.locator(".bee-announce")).toHaveText(
    "Perfect! Round 1 of 10. 100 points.",
  );
  await expect(page.locator(".bee-announce")).toContainText("Round 2 of 10");
  await expect(page.locator(".game-stats")).toContainText("100 points");
});
