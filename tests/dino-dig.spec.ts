import { expect, test } from "@playwright/test";
import { tapRoomPath } from "./room-paths";
import { roomToys } from "./room-objects";

test("digging up every fossil at Dino Dig earns the Fossil Finder stamp once", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Dino Dig/ })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText("Dino Dig");
  // Game machines stand in many rooms; count the room's own toys.
  await expect.poll(() => roomToys(page)).toBe(8);
  for (const find of ["skull", "leg bone", "shell fossil", "giant tooth"]) {
    await tapRoomPath(page, `Dig for a ${find}`, true);
    await tapRoomPath(page, `Dig for a ${find}`, true);
  }
  await expect(
    page.locator('.object-digspot[data-object-step="2"]'),
  ).toHaveCount(4);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}")
            .stamps ?? [],
      ),
    )
    .toContain("fossil_finder");
  expect(errors).toEqual([]);
});
