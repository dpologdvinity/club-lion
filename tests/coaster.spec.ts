import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// A controlled RAF queue advances real production physics without a minute-long wait.
// No test seam in the ride, and no changes to performance.now or browser event timing.
async function installFrames(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    let nextId = 1;
    let now = 0;
    const frames = new Map<number, FrameRequestCallback>();
    const fixture = window as unknown as {
      advanceRideFrames: (count: number, deltaMs?: number) => void;
      pendingRideFrames: () => number;
      livePhotoUrls: Set<string>;
    };
    window.requestAnimationFrame = (callback) => {
      const id = nextId++;
      frames.set(id, callback);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      frames.delete(id);
    };
    fixture.advanceRideFrames = (count, deltaMs = 1000 / 60) => {
      for (let i = 0; i < count; i++) {
        now += deltaMs;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(now));
      }
    };
    fixture.pendingRideFrames = () => frames.size;
    fixture.livePhotoUrls = new Set();
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      fixture.livePhotoUrls.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      fixture.livePhotoUrls.delete(url);
      revoke(url);
    };
  });
}

async function advance(
  page: import("@playwright/test").Page,
  count: number,
  deltaMs?: number,
) {
  await page.evaluate(
    ({ count, deltaMs }) => {
      (
        window as unknown as {
          advanceRideFrames: (count: number, deltaMs?: number) => void;
        }
      ).advanceRideFrames(count, deltaMs);
    },
    { count, deltaMs },
  );
}

test.beforeEach(async ({ page }) => {
  await installFrames(page);
  await page.goto("/tests/fixtures/coaster.html");
  await page.getByRole("button", { name: "Open coaster" }).click();
});

test("start, finish, photo download, replay and exit use the shared dialog", async ({
  page,
}) => {
  await expect(page.getByRole("button", { name: "Start ride" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Back to arcade" }),
  ).toBeFocused();
  await advance(page, 60 * 120);
  await expect(page.getByLabel("Completed rides")).toHaveText("1");
  await expect(page.getByRole("button", { name: "Ride again" })).toBeFocused();
  await expect(page.getByLabel("Ride progress")).toContainText("100%");
  await page.getByRole("button", { name: "View souvenir photo" }).click();
  const photo = page.getByRole("img", {
    name: "Passenger souvenir at the loop exit with Leo",
  });
  await expect(photo).toBeVisible();
  await expect
    .poll(() => photo.evaluate((img) => (img as HTMLImageElement).naturalWidth))
    .toBe(900);
  const svg = await photo.evaluate(async (img) =>
    (await fetch((img as HTMLImageElement).src)).text(),
  );
  expect(svg).toContain("Leo");
  expect(svg).toContain("chibi-avatar");
  expect(svg).toContain("pet-companion");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download photo" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "savanna-screamer-souvenir.svg",
  );
  await advance(page, 300);
  await expect(page.getByLabel("Completed rides")).toHaveText("1");
  await page.getByRole("button", { name: "Ride again" }).click();
  await expect(photo).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { livePhotoUrls: Set<string> }).livePhotoUrls
          .size,
    ),
  ).toBe(0);
  await advance(page, 60 * 120);
  await expect(page.getByLabel("Completed rides")).toHaveText("2");
  await page.getByRole("button", { name: "Back to arcade" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open coaster" }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { livePhotoUrls: Set<string> }).livePhotoUrls
          .size,
    ),
  ).toBe(0);
});

test("large deltas and an early Escape never complete a ride", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Start ride" }).click();
  await advance(page, 2, 900_000);
  await expect(page.getByLabel("Completed rides")).toHaveText("0");
  await expect(page.getByRole("button", { name: "Ride again" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await advance(page, 60 * 120);
  await expect(page.getByLabel("Completed rides")).toHaveText("0");
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { pendingRideFrames: () => number }
      ).pendingRideFrames(),
    ),
  ).toBe(0);
});

test("hidden frames pause simulated time and returning stays on the current section", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Start ride" }).click();
  await advance(page, 120);
  const before = await page.getByLabel("Ride progress").textContent();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await advance(page, 60 * 120, 900_000);
  await expect(page.getByLabel("Ride progress")).toHaveText(before!);
  await expect(page.getByLabel("Completed rides")).toHaveText("0");
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await advance(page, 1, 900_000);
  await expect(page.getByLabel("Completed rides")).toHaveText("0");
  await advance(page, 60 * 120);
  await expect(page.getByLabel("Completed rides")).toHaveText("1");
});

test("audio failure leaves the ride usable and reduced motion selects gentle view", async ({
  page,
}) => {
  // Remount under the media preference; opening initializes the gentle-view control.
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    window.AudioContext = class {
      constructor() {
        throw new Error("Audio unavailable");
      }
    } as unknown as typeof AudioContext;
  });
  await page.getByRole("button", { name: "Open coaster" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Gentle view" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Start ride" }).click();
  await advance(page, 60 * 120);
  await expect(page.getByLabel("Completed rides")).toHaveText("1");
  await expect(
    page.getByRole("button", { name: "View souvenir photo" }),
  ).toBeVisible();
});

test("controls fit a narrow viewport and pass the accessibility scan", async ({
  page,
}) => {
  const viewport = page.viewportSize()!;
  const box = await page.getByRole("dialog").boundingBox();
  expect(box!.width).toBeLessThanOrEqual(viewport.width);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
