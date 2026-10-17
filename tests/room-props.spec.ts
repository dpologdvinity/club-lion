import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function goKainan(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Lola's Kainan/ })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText("Lola's Kainan");
  // The camera glides on arrival; drag only once the stage holds still.
  const stage = page.locator(".camera-viewport-stage");
  let last = "";
  await expect
    .poll(async () => {
      const now = JSON.stringify(await stage.boundingBox());
      const still = now === last;
      last = now;
      return still;
    })
    .toBe(true);
}

async function dragTo(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 5 });
  await page.mouse.move(to.x, to.y, { steps: 5 });
  await page.mouse.up();
}

const center = async (page: Page, selector: string) => {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
};

test("drag a snack anywhere, then give it to Lola for a thank you", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const spoken: string[] = [];
    Object.assign(window, { spoken });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel() {},
        speak(utterance: SpeechSynthesisUtterance) {
          spoken.push(utterance.text);
        },
      },
    });
  });
  await goKainan(page);
  const banana = page.getByRole("button", { name: "Pick up the banana" });
  await expect(banana).toBeInViewport();
  const start = await center(page, '[data-prop="banana"]');
  await dragTo(page, start, { x: start.x + 60, y: start.y - 20 });
  const moved = await center(page, '[data-prop="banana"]');
  expect(moved.x).toBeGreaterThan(start.x + 30);
  const lola = page.getByRole("button", { name: "Say hello to Lola" });
  const feet = await lola.boundingBox();
  if (!feet) throw new Error("Lola is not on screen");
  await dragTo(page, moved, {
    x: feet.x + feet.width / 2,
    y: feet.y + feet.height - 10,
  });
  await expect(lola.locator(".speech-bubble")).toHaveText(
    "🍌 Yum yum! Thank you!",
  );
  await expect(banana).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "spoken")))
    .toContain("Yum yum! Thank you!");
  // A fresh banana comes back to its spot.
  await expect(banana).toBeVisible();
  expect(errors).toEqual([]);
});

test("props carry with the keyboard and pass axe", async ({ page }) => {
  await goKainan(page);
  const yoyo = page.getByRole("button", { name: "Pick up the yo-yo" });
  const before = await yoyo.getAttribute("style");
  await yoyo.focus();
  await page.keyboard.press("Enter");
  await expect(yoyo).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  expect(await yoyo.getAttribute("style")).not.toBe(before);
  await page.keyboard.press("Enter");
  await expect(yoyo).toHaveAttribute("aria-pressed", "false");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .include(".room-prop")
    .analyze();
  expect(results.violations).toEqual([]);
});
