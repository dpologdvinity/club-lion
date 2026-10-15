import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

async function openBakery(page: Page) {
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page.getByRole("button", { name: "Play Mango Bakery" }).click();
}

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

const toppings = (page: Page) => page.locator(".bakery-stage .cake-topping");

test("free play decorates by tap, keyboard and drag, blows out candles, and serves once", async ({
  page,
}) => {
  test.slow();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openBakery(page);
  await expect(
    page.getByRole("button", { name: "Free decorating" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Heart cake" }).click();
  await expect(
    page.getByRole("button", { name: "Heart cake" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "pink frosting" }).click();

  const candle = page.getByRole("button", { name: "Add candle" });
  await candle.click();
  await candle.focus();
  await page.keyboard.press("Enter");
  // Tapping the cake places another of the last topping right there.
  const cakeBox = await page.getByTestId("cake-stage").boundingBox();
  await page.getByTestId("cake-stage").click({
    position: { x: cakeBox!.width * 0.5, y: cakeBox!.height * 0.74 },
  });
  await expect(toppings(page)).toHaveCount(3);
  await expect(page.locator(".bakery-flame")).toHaveCount(3);

  const cherry = await page
    .getByRole("button", { name: "Add cherry" })
    .boundingBox();
  const stage = await page.getByTestId("cake-stage").boundingBox();
  if (!cherry || !stage) throw new Error("bakery not laid out");
  await page.mouse.move(
    cherry.x + cherry.width / 2,
    cherry.y + cherry.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2, {
    steps: 8,
  });
  await expect(page.locator(".bakery-ghost")).toBeVisible();
  await page.mouse.up();
  await expect(page.locator(".bakery-ghost")).toHaveCount(0);
  await expect(toppings(page)).toHaveCount(4);
  await expect(page.getByText("Cherry added")).toBeAttached();

  await page.locator(".bakery-flame").first().click();
  await expect(page.locator(".bakery-flame")).toHaveCount(2);
  await page.getByRole("button", { name: "Blow out the candles" }).click();
  await expect(page.locator(".bakery-flame")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Blow out the candles" }),
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: "Serve the cake" })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await expect(page.locator(".wallet")).toHaveText("✦255");
  await expect(
    page.getByRole("button", { name: "Bake another cake" }),
  ).toBeFocused();
  await expect(
    page.getByRole("list", { name: "Cake photos" }).getByRole("img"),
  ).toHaveCount(1);
  await expectAccessible(page);

  await page.getByRole("button", { name: "Bake another cake" }).click();
  await expect(
    page.getByRole("button", { name: "Serve the cake" }),
  ).toBeFocused();
  await expect(toppings(page)).toHaveCount(0);
  await expect(page.locator(".wallet")).toHaveText("✦255");

  await page.reload();
  await expect(page.locator(".wallet")).toHaveText("✦255");
  await openBakery(page);
  await expect(
    page.getByRole("list", { name: "Cake photos" }).getByRole("img"),
  ).toHaveCount(1);
  expect(
    await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem("club-lion-player-v1")!);
      return [
        saved.cakesServed,
        saved.bakeryCakes[0].shape,
        saved.bakeryCakes[0].toppings.length,
      ];
    }),
  ).toEqual([1, "heart", 4]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("picture orders score stars from the visual recipe and pay once per order", async ({
  page,
}) => {
  await page.goto("/");
  // A constant roll makes the order a plain round cake with sprinkles and a mango slice.
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  await openBakery(page);
  await page.getByRole("button", { name: "Picture orders with stars" }).click();
  await expect(page.getByRole("img", { name: /^Order:/ })).toHaveAttribute(
    "aria-label",
    "Order: round cake, vanilla sponge, cream frosting, 1 sprinkles, 1 mango slice",
  );
  await page.getByRole("button", { name: "Add sprinkles" }).click();
  await page.getByRole("button", { name: "Add mango slice" }).click();
  await page.getByRole("button", { name: "Serve the cake" }).click();
  await expect(page.locator(".wallet")).toHaveText("✦274");
  await expect(page.locator(".bakery-reaction")).toHaveText("⭐⭐⭐");
  await expectAccessible(page);

  await page.getByRole("button", { name: "Bake another cake" }).click();
  await page.getByRole("button", { name: "Star cake" }).click();
  await page.getByRole("button", { name: "Serve the cake" }).click();
  await expect(page.locator(".bakery-reaction")).toHaveText("⭐");
  await expect(page.locator(".wallet")).toHaveText("✦282");
  await page.keyboard.press("Escape");
  await expect(page.locator(".wallet")).toHaveText("✦282");
});

test("the Downtown Plaza café window opens the bakery", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("region", { name: "Lion world", exact: true })
    .getByRole("button", { name: "Downtown Plaza", exact: true })
    .click();
  await tapRoomPath(page, "Mango Bakery", true);
  await expect(page.getByRole("group", { name: "Bakery mode" })).toBeVisible();
});

test("reduced motion keeps toppings still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openBakery(page);
  await page.getByRole("button", { name: "Add candle" }).click();
  expect(
    await page
      .locator(".bakery-stage .cake-topping")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".bakery-animal")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
