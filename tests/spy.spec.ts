import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function pendingFrames(page: Page) {
  return page.evaluate(() =>
    (
      window as unknown as { pendingSpyFrames: () => number }
    ).pendingSpyFrames(),
  );
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let id = 0;
    const frames = new Map<number, FrameRequestCallback>();
    window.requestAnimationFrame = (callback) => {
      frames.set(++id, callback);
      return id;
    };
    window.cancelAnimationFrame = (frame) => {
      frames.delete(frame);
    };
    (window as unknown as { pendingSpyFrames: () => number }).pendingSpyFrames =
      () => frames.size;
  });
  await page.goto("/tests/fixtures/spy.html");
  await page.getByRole("button", { name: "Open spy terminal" }).click();
});

test("laser stages stay reachable, pay once, and stop their frame loop", async ({
  page,
}) => {
  for (let stage = 1; stage <= 3; stage++) {
    const steps = stage === 3 ? 6 : 5;
    for (let i = 0; i < steps; i++)
      await page.getByRole("button", { name: "Move up" }).click();
    for (let i = 0; i < steps; i++)
      await page.getByRole("button", { name: "Move right" }).click();
    await expect(page.getByLabel("Completed puzzles")).toHaveText(
      String(stage),
    );
    expect(await pendingFrames(page)).toBe(0);
    await page
      .getByRole("button", { name: "Move right" })
      .click({ force: true });
    await expect(page.getByLabel("Completed puzzles")).toHaveText(
      String(stage),
    );
    if (stage < 3) {
      const next = page.getByRole("button", { name: "Next stage" });
      await expect(next).toBeFocused();
      await next.click();
    }
  }
  await expect(page.getByLabel("Coins")).toHaveText("310");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open spy terminal" }),
  ).toBeFocused();
  expect(await pendingFrames(page)).toBe(0);
});

test("a final hint completes a cipher once, exposes answers, and advances transmission", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Classified Agent Cipher" }).click();
  expect(await pendingFrames(page)).toBe(0);
  const hint = page.getByRole("button", { name: "Reveal a hint letter" });
  // The first phrase contains 15 distinct letters.
  for (let i = 0; i < 15; i++) await hint.click();
  await expect(page.getByLabel("Completed puzzles")).toHaveText("1");
  await expect(
    page.getByRole("button", { name: /Cipher letter G, decoded as T/ }).first(),
  ).toBeVisible();
  const next = page.getByRole("button", { name: "Next transmission" });
  await expect(next).toBeFocused();
  await next.click();
  await expect(
    page.getByRole("tab", { name: "Classified Agent Cipher" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Completed puzzles")).toHaveText("1");
  await expect(
    page.getByRole("button", { name: "Reveal a hint letter" }),
  ).toBeEnabled();
  await expect(hint).toBeFocused();
});

test("held keys do not move, rapid presses accumulate, and closing cancels frames", async ({
  page,
}) => {
  const board = page.locator(".spy-grid-board");
  await board.focus();
  await board.dispatchEvent("keydown", { key: "ArrowRight", repeat: true });
  await expect(page.locator(".spy-agent").locator("..")).toHaveAttribute(
    "aria-label",
    /column 1, row 6/i,
  );
  await board.evaluate((element) => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
  });
  await expect(page.locator(".spy-agent").locator("..")).toHaveAttribute(
    "aria-label",
    /column 3, row 6/i,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Completed puzzles")).toHaveText("0");
  expect(await pendingFrames(page)).toBe(0);
});

test("laser and cipher controls pass accessibility scans and fit the viewport", async ({
  page,
}) => {
  for (const mode of ["Laser Tripwire Grid", "Classified Agent Cipher"]) {
    await page.getByRole("tab", { name: mode }).click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
