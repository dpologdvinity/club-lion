import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";
import { tapRoomPath } from "./room-paths";

// A controlled RAF queue plays a 30-second ride in a moment, like coaster.spec.ts.
async function installFrames(page: Page) {
  await page.addInitScript(() => {
    let nextId = 1;
    let now = 0;
    const frames = new Map<number, FrameRequestCallback>();
    window.requestAnimationFrame = (callback) => {
      const id = nextId++;
      frames.set(id, callback);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      frames.delete(id);
    };
    (
      window as unknown as { advanceRideFrames: (count: number) => void }
    ).advanceRideFrames = (count) => {
      for (let i = 0; i < count; i++) {
        now += 100;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(now));
      }
    };
  });
}

const advance = (page: Page, seconds: number) =>
  page.evaluate(
    (count) =>
      (
        window as unknown as { advanceRideFrames: (count: number) => void }
      ).advanceRideFrames(count),
    seconds * 10,
  );

const RIDES = [
  {
    name: "Speed Slides",
    hotspot: "Ride the Speed Slides",
    river: false,
    stamp: "speed_slider",
    actions: ["Wheee!"],
  },
  {
    name: "Tsunami Wave Pool",
    hotspot: "Ride the Wave Pool",
    river: false,
    stamp: "wave_pool",
    actions: ["Jump the wave"],
  },
  {
    name: "Dump Bucket Splash",
    hotspot: "Splash under the Bucket",
    river: false,
    stamp: "bucket_drench",
    actions: ["Squirt the water cannons"],
  },
  {
    name: "Lazy River Float",
    hotspot: "Float the Lazy River",
    river: true,
    stamp: "lazy_floater",
    actions: ["Splash", "Spin the tube", "Wave at the animals"],
  },
] as const;

for (const ride of RIDES) {
  test(`${ride.name} opens from its hotspot, reacts to taps, finishes and exits`, async ({
    page,
  }) => {
    test.slow(); // each test plays a whole ride
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await installFrames(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Map", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /^Splash Oasis/ })
      .click();
    if (ride.river) await tapRoomPath(page, /Lazy River Oasis/);
    await tapRoomPath(page, ride.hotspot);

    const dialog = page.getByRole("dialog", { name: `${ride.name} ride` });
    await expect(dialog).toBeVisible();
    if (ride.name === "Speed Slides") {
      const first = dialog.getByRole("button", {
        name: "Ride the Sunny yellow slide",
      });
      await expect(first).toBeFocused();
      await dialog
        .getByRole("button", { name: "Ride the Grape purple slide" })
        .click();
    }
    await expect(
      dialog.getByRole("button", { name: "Exit ride" }),
    ).toBeFocused();

    await advance(page, 8);
    for (const action of ride.actions)
      await dialog.getByRole("button", { name: action }).click();
    await advance(page, 1);
    // Splashes live one real second, so tap last and look straight away.
    const box = page.viewportSize();
    await page.mouse.click(
      (box?.width ?? 800) / 2,
      (box?.height ?? 600) * 0.75,
    );
    await expect(dialog.locator(".wr-splash").first()).toBeAttached();
    expect(
      (
        await new AxeBuilder({ page }).include(".water-ride").analyze()
      ).violations.map((v) => v.id),
    ).toEqual([]);

    await advance(page, 40);
    const again = dialog.getByRole("button", { name: "Ride again" });
    await expect(again).toBeFocused();
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      SAVE_KEY,
    );
    expect(saved.stamps).toContain(ride.stamp);

    await dialog.getByRole("button", { name: "Exit ride" }).click();
    await expect(dialog).toBeHidden();
    expect(errors).toEqual([]);
  });
}
