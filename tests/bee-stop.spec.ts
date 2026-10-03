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

test("a held pointer cannot stop the following round when released", async ({
  page,
}) => {
  const track = page.locator(".bee-track");
  const box = (await track.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(800);
  await expect(page.locator(".bee-announce")).toHaveText(
    "Round 1 of 10. Stop the bee on the flower.",
  );
  await page.mouse.up();
  // Pointer activation is handled on release, so holding through the first
  // round never scores early. Releasing scores round 2 once.
  await expect(page.locator(".bee-announce")).toHaveText(
    "So close Round 2 of 10. 0 points.",
  );
  await page.waitForTimeout(900);
  await expect(page.locator(".bee-announce")).toHaveText(
    "Round 3 of 10. Stop the bee on the flower.",
  );
});

test("missed rounds keep every petal visible and pay the advertised minimum", async ({
  page,
}, testInfo) => {
  await page.getByRole("button", { name: "All games" }).click();
  await page.getByRole("button", { name: "Play Bee Stop" }).click();
  await expect(page.locator(".game-features")).toContainText(
    "Earn 15–120 coins",
  );
  await page.getByRole("button", { name: "Let’s play" }).click();
  for (let round = 1; round <= 10; round++) {
    await page
      .getByRole("button", { name: "Stop the bee" })
      .evaluate((track) => track.click());
    if (round < 10)
      await expect(page.locator(".bee-announce")).toHaveText(
        `Round ${round + 1} of 10. Stop the bee on the flower.`,
      );
  }
  await expect(page.locator(".game-win")).toContainText(
    "0 points across 10 rounds.",
  );
  await expect(page.locator(".wallet")).toHaveText("✦265");
  const petals = page.locator(".bee-bloom ellipse");
  await expect(petals).toHaveCount(10);
  expect(
    await petals.evaluateAll((els) =>
      els.every(
        (petal) =>
          petal.getAttribute("fill") !== "none" ||
          petal.getAttribute("stroke") !== "none",
      ),
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("bee-missed-rounds.png") });
});
