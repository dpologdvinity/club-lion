import { test, expect } from "@playwright/test";

test("the game is installable and keeps working offline after one visit", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Lion world", exact: true }),
  ).toBeVisible();

  const manifestHref = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  const manifest = await (await page.request.get(manifestHref!)).json();
  expect(manifest).toMatchObject({ name: "Club Lion", display: "standalone" });
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
    expect.arrayContaining(["192x192", "512x512"]),
  );

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Lion world", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".your-character")).toBeVisible();
  await context.setOffline(false);
});
