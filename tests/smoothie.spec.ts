import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const orders = [
  {
    name: "Mango Tango",
    scoops: ["Mango slices", "Mango slices", "Crushed Ice"],
    coins: 30,
  },
  {
    name: "Baobab Berry Blitz",
    scoops: ["Baobab Berry", "Baobab Berry", "Honey drizzle", "Crushed Ice"],
    coins: 42,
  },
  {
    name: "Savanna Sunrise",
    scoops: ["Mango slices", "Pineapple chunks", "Honey drizzle"],
    coins: 36,
  },
  {
    name: "Coconut Cloud",
    scoops: ["Coconut Milk", "Coconut Milk", "Crushed Ice", "Honey drizzle"],
    coins: 39,
  },
];

async function openKitchen(page: Page) {
  await page.clock.install({ time: new Date("2026-10-03T12:00:00Z") });
  await page.goto("/tests/fixtures/phase2.html");
  await page.clock.pauseAt(new Date("2026-10-03T13:00:00Z"));
  await page.getByRole("button", { name: "Open smoothie kitchen" }).click();
  const text = await page.locator("#dialog-subtitle").innerText();
  const order = orders.find((order) => text.includes(order.name));
  if (!order) throw new Error(`Unknown order: ${text}`);
  return order;
}

async function fillOrder(page: Page, scoops: string[]) {
  for (const name of scoops)
    await page.getByRole("button", { name, exact: true }).click();
}

test("orders show their recipe, blend accurately, and pay once even on rapid serving", async ({
  page,
}) => {
  const order = await openKitchen(page);
  await expect(
    page.getByRole("list", { name: "Recipe ingredients" }),
  ).toBeVisible();
  await fillOrder(page, order.scoops);
  await page.getByRole("button", { name: "Blend", exact: true }).click();
  await page.clock.runFor(1700);
  await expect(page.locator(".smoothie-result")).toContainText("100% match");
  const serve = page.getByRole("button", { name: "Serve & next order" });
  await expect(serve).toBeFocused();
  await expect(page.getByLabel("Smoothie rewards")).toHaveText("[]");
  await serve.evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(page.getByLabel("Smoothie rewards")).toHaveText(
    JSON.stringify([order.coins]),
  );
  await expect(
    page.getByRole("button", { name: "Mango slices", exact: true }),
  ).toBeFocused();
  await expect(page.locator("#dialog-subtitle")).not.toContainText(order.name);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open smoothie kitchen" }),
  ).toBeFocused();
});

test("unavailable audio cannot interrupt blending or create page errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", { value: undefined });
    Object.defineProperty(window, "webkitAudioContext", { value: undefined });
  });
  const order = await openKitchen(page);
  await fillOrder(page, order.scoops);
  await page.getByRole("button", { name: "Blend", exact: true }).click();
  await page.clock.runFor(1700);
  await expect(page.locator(".smoothie-result")).toContainText("100% match");
  expect(errors).toEqual([]);
});

test("reduced motion keeps the blender still, quitting pays nothing, and the kitchen is accessible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const order = await openKitchen(page);
  await fillOrder(page, order.scoops);
  await page.getByRole("button", { name: "Blend", exact: true }).click();
  await page.clock.runFor(200);
  const first = await page
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.clock.runFor(200);
  const second = await page
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  expect(second).toBe(first);
  await page.keyboard.press("Escape");
  await page.clock.runFor(2000);
  await expect(page.getByLabel("Smoothie rewards")).toHaveText("[]");
  await page.getByRole("button", { name: "Open smoothie kitchen" }).click();
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
});
