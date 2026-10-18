import { expect, test } from "@playwright/test";
import { tapRoomPath } from "./room-paths";

test("the plaza board hints today's pin; picking it up keeps it once", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Downtown Plaza/ })
    .click();
  await tapRoomPath(page, "Pin hint board", true);
  const toast = page
    .locator(".toast")
    .filter({ hasText: "Today's pin is hiding somewhere in" });
  await expect(toast).toBeVisible();
  const room = ((await toast.textContent()) ?? "")
    .split("somewhere in ")[1]
    ?.split(". Look")[0];
  expect(room).toBeTruthy();
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", {
      name: new RegExp(`^${room!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    })
    .click();
  const pin = page.locator(".day-pin");
  await expect(pin).toHaveCount(1);
  // The pin may sit outside the first camera view; tap it where it is.
  await pin.dispatchEvent("click");
  await expect(pin).toHaveCount(0);
  await expect(page.locator(".toast")).toContainText("You found today's");
  const pins = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}").pins ??
      [],
  );
  expect(pins).toHaveLength(1);
  await page.reload();
  await expect(page.locator(".day-pin")).toHaveCount(0);
  expect(errors).toEqual([]);
});
