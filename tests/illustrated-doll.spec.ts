import { test, expect } from "@playwright/test";

test("illustrated fitting preview loads its real layers and changes them independently", async ({
  page,
}, testInfo) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.url().includes("/avatars/illustrated/") && !response.ok())
      failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/gallery/avatars/illustrated/preview.html");
  await expect(
    page.getByRole("heading", { name: "Illustrated doll fitting" }),
  ).toBeVisible();
  await expect(page.locator("svg image")).toHaveCount(6);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          performance
            .getEntriesByType("resource")
            .filter(
              (entry) =>
                entry.name.includes("/illustrated/") &&
                entry.name.endsWith(".png"),
            ).length,
      ),
    )
    .toBe(5);
  await page.getByRole("checkbox", { name: "Halter top" }).uncheck();
  await expect(page.locator(".illustrated-top")).toHaveCount(0);
  await expect(page.locator(".illustrated-body")).toHaveCount(1);
  await expect(page.locator(".illustrated-bottom")).toHaveCount(1);
  await page.getByRole("checkbox", { name: "Halter top" }).check();
  await expect(page.locator(".illustrated-top")).toHaveCount(1);
  await page.getByRole("checkbox", { name: "Embroidered flares" }).uncheck();
  await expect(page.locator(".illustrated-body")).not.toHaveAttribute(
    "clip-path",
  );
  await page.getByRole("checkbox", { name: "Embroidered flares" }).check();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("illustrated-doll.png"),
    fullPage: true,
  });
  expect(failures).toEqual([]);
});
