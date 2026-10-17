import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

test("the fountain splashes, then gushes, then shows a rainbow, then rests", async ({
  page,
}) => {
  await page.goto("/");
  const fountain = page.locator(".object-fountain");
  for (const step of ["1", "2", "3", "0"]) {
    await tapRoomPath(page, "Splash the fountain", true);
    await expect(fountain).toHaveAttribute("data-object-step", step);
  }
});

test("a picture door says where it goes and travels there", async ({
  page,
}) => {
  await page.goto("/");
  await tapRoomPath(page, "Go to the café", true);
  await expect(page.locator(".world-location h2")).toHaveText("Canopy café");
});

const flowers = ["red", "orange", "yellow", "green", "blue", "purple"];

test("flowers play notes and the neighbors dance", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install();
  await page.goto("/");
  for (const color of flowers)
    await tapRoomPath(page, `Play the ${color} flower`, true);
  await expect(page.locator(".neighbor.is-dancing")).toHaveCount(3);
  await page.clock.runFor(3500);
  await expect(page.locator(".neighbor.is-dancing")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the fountain's rainbow hums a tune and starts the dance", async ({
  page,
}) => {
  await page.goto("/");
  for (let tap = 0; tap < 3; tap++)
    await tapRoomPath(page, "Splash the fountain", true);
  await expect(page.locator(".neighbor.is-dancing")).toHaveCount(3);
});

test("tapping the doll twirls her", async ({ page }) => {
  await page.goto("/");
  await page.locator(".your-character").click();
  await expect(page.locator(".your-character")).toHaveClass(/is-twirling/);
});

test("the weather toy cycles rain, rainbow, snow and sun", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const toy = page.getByRole("button", { name: "Change the weather" });
  const sky = page.locator(".square-weather");
  await expect(sky).toHaveClass(/weather-sunny/);
  for (const weather of ["rain", "rainbow", "snow", "sunny"]) {
    await toy.click();
    await expect(sky).toHaveClass(new RegExp(`weather-${weather}`));
  }
  expect(errors).toEqual([]);
});

test("finding all five butterflies earns the stamp once and survives reload", async ({
  page,
}) => {
  await page.goto("/");
  const butterflies = page.locator(".square-butterfly");
  await expect(butterflies).toHaveCount(5);
  for (let found = 1; found <= 5; found++) {
    await butterflies.first().dispatchEvent("click");
    await expect(page.locator(".square-jar")).toContainText(`${found}/5`);
  }
  await expect(page.locator(".toast")).toContainText(
    "New stamp: Butterfly Catcher!",
  );
  const stamps = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("club-lion-player-v1") ?? "{}").stamps,
  );
  expect(
    stamps.filter((id: string) => id === "square_butterflies"),
  ).toHaveLength(1);
  await page.reload();
  await expect(page.locator(".square-butterfly")).toHaveCount(0);
  await expect(page.locator(".square-jar")).toContainText("5/5");
});

test("square tap targets are at least 48px on a phone", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".square-butterfly").first()).toBeAttached();
  // Poll: the camera settles its first zoom just after load.
  const smallButtons = () =>
    page.locator(".camera-viewport button").evaluateAll((buttons) =>
      buttons
        .map((button) => {
          const box = button.getBoundingClientRect();
          return {
            name: button.getAttribute("aria-label") ?? button.className,
            size: Math.min(box.width, box.height),
          };
        })
        .filter(({ size }) => size > 0 && size < 47.5),
    );
  await expect.poll(smallButtons).toEqual([]);
});

test("the square is still under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Change the weather" }).click();
  await tapRoomPath(page, "Splash the fountain", true);
  await tapRoomPath(page, "Play the red flower", true);
  const moving = await page
    .locator(".camera-viewport [class]")
    .evaluateAll((nodes) =>
      nodes
        .filter((node) => {
          const name = getComputedStyle(node).animationName;
          return name !== "none" && name !== "";
        })
        .map((node) => node.getAttribute("class")),
    );
  expect(moving).toEqual([]);
});

test("the square passes axe", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".square-butterfly").first()).toBeAttached();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("confetti celebrates the fifth butterfly once and never sticks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const butterflies = page.locator(".square-butterfly");
  for (let found = 0; found < 5; found++)
    await butterflies.first().dispatchEvent("click");
  await expect(page.locator(".square-confetti")).toBeHidden();
  await page.reload();
  await expect(page.locator(".square-jar")).toContainText("5/5");
  await expect(page.locator(".square-confetti")).toHaveCount(0);
});

test("the butterfly jar never blocks a tap", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".square-jar")).toHaveCSS("pointer-events", "none");
});

test("a picture door wiggles before it travels", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-03T12:00:00Z") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-10-03T13:00:00Z"));
  await page
    .locator('.room-object[aria-label="Go to the café"]')
    .dispatchEvent("click");
  await expect(page.locator(".object-door.object-active")).toHaveCount(1);
  await expect(page.locator(".world-location h2")).toHaveText("Savanna Square");
  await page.clock.runFor(500);
  await expect(page.locator(".world-location h2")).toHaveText("Canopy café");
});
