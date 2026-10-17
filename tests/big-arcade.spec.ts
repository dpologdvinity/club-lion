import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

test("the big arcade has a cabinet for every game and each one opens", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^The arcade/ })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText("The arcade");
  await expect(page.locator(".object-cabinet")).toHaveCount(23);
  // Wherever you arrive, a friend is in view.
  await expect
    .poll(() =>
      page.locator(".world-character.neighbor").evaluateAll((nodes) =>
        nodes.some((node) => {
          const box = node.getBoundingClientRect();
          return box.right > 0 && box.left < innerWidth;
        }),
      ),
    )
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath("arcade.png") });
  await tapRoomPath(page, "Lola's Halo-Halo", true);
  await expect(
    page.getByRole("button", { name: "Serve", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("the big arcade passes axe", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^The arcade/ })
    .click();
  await expect(page.locator(".object-cabinet")).toHaveCount(23);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .include(".camera-viewport")
    .analyze();
  expect(results.violations).toEqual([]);
});
