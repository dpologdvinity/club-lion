import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY, migratePlayerSave, newPlayer } from "../src/game";
import { INGREDIENTS, RECIPES } from "../src/utils/smoothieRecipes";

async function travel(page: Page, name: string) {
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: new RegExp(`^${name}`) })
    .click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}

async function saved(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
}

async function fits(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("map, room paths and illustrated previews share saved destinations without missing assets", async ({
  page,
}) => {
  const errors: string[] = [];
  const missing: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (response) => {
    if (response.status() >= 400) missing.push(response.url());
  });
  await page.goto("/");
  for (const name of [
    "Downtown Plaza",
    "Wonder Park Entrance",
    "Carnival Midway",
    "Club Pulse",
  ]) {
    await travel(page, name);
    await expect(
      page.locator(".camera-viewport-stage > .room-scenery"),
    ).toBeVisible();
    await fits(page);
  }
  const visits = (await saved(page)).visited;
  expect(visits).toEqual(
    expect.arrayContaining([
      "downtown-plaza",
      "wonder-park-entrance",
      "wonder-park-midway",
      "club-pulse",
    ]),
  );
  await page.reload();
  expect((await saved(page)).visited).toEqual(visits);
  await travel(page, "Downtown Plaza");
  await page
    .locator(".room-navigation")
    .getByRole("button", { name: "Wonder Park Entrance", exact: true })
    .click();
  await expect(page.locator(".your-character")).toHaveAttribute(
    "data-stage-x",
    "2500",
  );
  await page.waitForTimeout(200);
  await expect(
    page.getByRole("heading", { name: "Wonder Park Entrance", exact: true }),
  ).toBeVisible();
  await page
    .locator(".room-navigation")
    .getByRole("button", { name: "Carnival Midway", exact: true })
    .click();
  await expect(page.locator(".your-character")).toHaveAttribute(
    "data-stage-x",
    "100",
  );
  await page
    .locator(".room-navigation")
    .getByRole("button", { name: "Wonder Park Entrance", exact: true })
    .click();
  await expect(page.locator(".your-character")).toHaveAttribute(
    "data-stage-x",
    "2650",
  );
  await page.waitForTimeout(200);
  await expect(
    page.getByRole("heading", { name: "Wonder Park Entrance", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});

test("scrolled camera clicks match stage coordinates and walking enters the physical portal", async ({
  page,
}) => {
  await page.goto("/");
  await travel(page, "Wonder Park Entrance");
  const ground = page.locator(".camera-viewport-ground");
  const box = (await ground.boundingBox())!;
  const offset = Number(
    await page.locator(".camera-viewport").getAttribute("data-camera-offset"),
  );
  expect(offset).toBeGreaterThan(0);
  // Chromium delivers integer client coordinates even for fractional targets.
  // Measure the real event independently of the avatar and camera conversion.
  const deliveredClick = ground.evaluate(
    (element: HTMLButtonElement) =>
      new Promise<{ x: number; y: number; scale: number }>((resolve) => {
        element.addEventListener(
          "click",
          (event) => {
            const rect = element.getBoundingClientRect();
            resolve({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              scale: rect.height / 720,
            });
          },
          { once: true },
        );
      }),
  );
  await ground.click({
    position: { x: box.width * 0.2, y: box.height * 0.94 },
  });
  const click = await deliveredClick;
  expect(Math.abs(click.x - box.width * 0.2)).toBeLessThan(1);
  expect(Math.abs(click.y - box.height * 0.94)).toBeLessThan(1);
  expect(
    Number(await page.locator(".your-character").getAttribute("data-stage-x")),
  ).toBeCloseTo(offset + click.x / click.scale, 5);
  expect(
    Number(await page.locator(".your-character").getAttribute("data-stage-y")),
  ).toBeCloseTo(click.y / click.scale, 5);
  await ground.focus();
  await page.keyboard.press("ArrowUp");
  for (let i = 0; i < 50; i++) {
    // Stop in the entrance trigger while its navigation effect commits, so
    // the next key cannot accidentally move the newly spawned midway avatar.
    const previousX = Number(
      await page.locator(".your-character").getAttribute("data-stage-x"),
    );
    if (
      (await page.locator('[data-room-id="wonder-park-midway"]').count()) ||
      previousX <= 120
    )
      break;
    await page.keyboard.press("ArrowLeft");
    await expect
      .poll(async () =>
        Number(
          await page.locator(".your-character").getAttribute("data-stage-x"),
        ),
      )
      .not.toBe(previousX);
  }
  await expect(
    page.getByRole("heading", { name: "Carnival Midway", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".your-character")).toHaveAttribute(
    "data-stage-x",
    "100",
  );
  await expect(page.locator(".camera-viewport-ground")).toBeFocused();
  await page.waitForTimeout(200);
  await expect(
    page.locator('[data-room-id="wonder-park-midway"]'),
  ).toBeVisible();
});

test("ground keyboard activation preserves feet while arrow keys keep walking", async ({
  page,
}) => {
  await page.goto("/");
  await travel(page, "Downtown Plaza");
  const ground = page.locator(".camera-viewport-ground");
  const avatar = page.locator(".your-character");
  await ground.focus();
  const x = Number(await avatar.getAttribute("data-stage-x"));
  const y = await avatar.getAttribute("data-stage-y");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(avatar).toHaveAttribute("data-stage-x", String(x));
  await expect(avatar).toHaveAttribute("data-stage-y", y!);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.keyboard.press("ArrowRight");
  await expect(avatar).toHaveAttribute("data-stage-x", String(x + 45));
});

test("dance tiles move the actual avatar feet and keyboard footfalls light the next tile", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await travel(page, "Club Pulse");
  const tile = page.getByRole("button", {
    name: "Light tile column 5, row 4",
    exact: true,
  });
  await tile.click();
  await expect(tile).toHaveAttribute("data-lit", "true");
  await expect(page.locator(".your-character")).toHaveAttribute(
    "data-stage-x",
    "1040",
  );
  await expect(page.locator(".your-character")).toHaveAttribute(
    "data-stage-y",
    "560",
  );
  const aligned = await page.evaluate(() => {
    const avatar = document
      .querySelector(".your-character .chibi-avatar")!
      .getBoundingClientRect();
    const tile = document
      .querySelectorAll(".dance-floor-tile")[28]
      .getBoundingClientRect();
    return {
      dx: Math.abs(avatar.left + avatar.width / 2 - tile.left - tile.width / 2),
      dy: Math.abs(avatar.bottom - tile.top - tile.height / 2),
    };
  });
  expect(aligned.dx).toBeLessThan(2);
  expect(aligned.dy).toBeLessThan(2);
  await page.locator(".camera-viewport-ground").focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("button", {
      name: "Light tile column 6, row 4",
      exact: true,
    }),
  ).toHaveAttribute("data-lit", "true");
  await expect(
    page.getByRole("group", { name: "Club Pulse dance floor" }),
  ).toHaveAttribute("data-reduced-motion", "true");
  await page
    .getByRole("button", { name: "Light tile column 8, row 1", exact: true })
    .focus();
  await expect(page.locator(".your-character")).toHaveAttribute(
    "data-stage-x",
    "1520",
  );
  await expect(
    page.getByRole("button", {
      name: "Light tile column 8, row 1",
      exact: true,
    }),
  ).toBeInViewport();
  await fits(page);
});

for (const failure of ["constructor", "resume"] as const) {
  test(`dance tile movement survives optional audio ${failure} failure`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((failure) => {
      const NativeAudioContext = window.AudioContext;
      Object.defineProperty(window, "AudioContext", {
        value:
          failure === "constructor"
            ? class {
                constructor() {
                  throw new Error("Audio unavailable");
                }
              }
            : class extends NativeAudioContext {
                get state(): AudioContextState {
                  return "suspended";
                }
                resume() {
                  return Promise.reject(new Error("Audio resume unavailable"));
                }
              },
      });
    }, failure);
    await page.goto("/");
    await travel(page, "Club Pulse");
    await page
      .getByRole("button", { name: "Turn sound on", exact: true })
      .click();
    const tile = page.getByRole("button", {
      name: "Light tile column 5, row 4",
      exact: true,
    });
    await tile.click();
    await expect(tile).toHaveAttribute("data-lit", "true");
    await expect(page.locator(".your-character")).toHaveAttribute(
      "data-stage-x",
      "1040",
    );
    await expect(page.locator(".your-character")).toHaveAttribute(
      "data-stage-y",
      "560",
    );
    expect(errors).toEqual([]);
  });
}

test("direct café orders pay once and survive reload, with one modal and opener focus", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-03T12:00:00Z") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-10-03T13:00:00Z"));
  await travel(page, "Canopy café");
  const opener = page.getByRole("button", {
    name: "Blend smoothies",
    exact: true,
  });
  await opener.click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  const orderText = await page.locator("#smoothie-order").innerText();
  const order = RECIPES.find((r) => orderText.includes(r.name))!;
  const before = await saved(page);
  for (const id of order.ingredients)
    await page
      .getByRole("button", {
        name: INGREDIENTS.find((i) => i.id === id)!.label,
        exact: true,
      })
      .click();
  await page.getByRole("button", { name: "Blend", exact: true }).click();
  await page.clock.runFor(1700);
  await page
    .getByRole("button", { name: "Serve & next order" })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  expect((await saved(page)).coins).toBe(before.coins + order.baseCoins * 3);
  expect((await saved(page)).smoothiesServed).toBe(1);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.reload();
  expect((await saved(page)).smoothiesServed).toBe(1);
});

test("the real DJ booth saves its scored reward once and returns to arcade and room triggers", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-03T12:00:00Z") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-10-03T13:00:00Z"));
  await travel(page, "Club Pulse");
  const opener = page
    .locator(".room-navigation")
    .getByRole("button", { name: "DJ Booth · DJ Beat Drop", exact: true });
  await opener.click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  const before = await saved(page);
  const feetBefore = await page
    .locator(".your-character")
    .getAttribute("style");
  await page
    .getByRole("button", { name: "Drop the beat", exact: true })
    .click();
  await page.clock.runFor(500);
  await page.getByRole("button", { name: "Hit lane D", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  expect(await page.locator(".your-character").getAttribute("style")).toBe(
    feetBefore,
  );
  await page.clock.runFor(18500);
  const after = await saved(page);
  expect(after.djBeatDropBest).toBe(100);
  expect(after.coins).toBe(before.coins + 5);
  expect(after.gamesPlayed).toBe(before.gamesPlayed + 1);
  await page.clock.runFor(2000);
  expect(await saved(page)).toEqual(after);
  await page.getByRole("button", { name: "All games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play DJ Beat Drop", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.reload();
  expect((await saved(page)).djBeatDropBest).toBe(100);
});

test("coaster launches from the park and arcade without paying an unfinished ride", async ({
  page,
}) => {
  await page.goto("/");
  await travel(page, "Wonder Park Entrance");
  const opener = page
    .locator(".room-navigation")
    .getByRole("button", { name: "Ride Savanna Screamer", exact: true });
  const before = await saved(page);
  await opener.click();
  await expect(
    page.getByRole("button", { name: "Start ride", exact: true }),
  ).toBeVisible();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.getByRole("button", { name: "Start ride", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  expect(await saved(page)).toEqual(before);
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page
    .getByRole("button", { name: "Play Savanna Screamer", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Start ride", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All games", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play Savanna Screamer", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Play Smoothie Kitchen", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Smoothie Kitchen", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Games", exact: true }),
  ).toBeFocused();
  await fits(page);
});

test("panoramas, dance floor and activity dialogs retain accessibility and reduced motion", async ({
  page,
}) => {
  const player = migratePlayerSave(newPlayer());
  player.look.boardId = "hover_leaf";
  await page.addInitScript(
    ({ key, player }) => localStorage.setItem(key, JSON.stringify(player)),
    { key: SAVE_KEY, player },
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const name of [
    "Wonder Park Entrance",
    "Carnival Midway",
    "Club Pulse",
  ]) {
    await travel(page, name);
    await page.locator(".camera-viewport-ground").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".sparkle-particle")).toHaveCount(0);
    const stage = page.locator(".room-scenery").first();
    const first = await stage.innerHTML();
    await page.waitForTimeout(120);
    expect(await stage.innerHTML()).toBe(first);
    await fits(page);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await page
    .locator(".room-navigation")
    .getByRole("button", { name: "DJ Booth · DJ Beat Drop", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await travel(page, "Canopy café");
  await page
    .getByRole("button", { name: "Blend smoothies", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("panoramic hoverboard speed, drawn trails and mango canvas share the logical stage", async ({
  page,
}) => {
  const player = migratePlayerSave(newPlayer());
  player.look.boardId = "hover_leaf";
  await page.addInitScript(
    ({ key, player }) => localStorage.setItem(key, JSON.stringify(player)),
    { key: SAVE_KEY, player },
  );
  await page.goto("/");
  await travel(page, "Wonder Park Entrance");
  await page.locator(".camera-viewport-ground").focus();
  const start = Number(
    await page.locator(".your-character").getAttribute("data-stage-x"),
  );
  await page.keyboard.press("ArrowRight");
  expect(
    Number(await page.locator(".your-character").getAttribute("data-stage-x")),
  ).toBe(start + 67.5);
  await expect(page.locator(".sparkle-particle").last()).toBeAttached();
  const aligned = await page.evaluate(() => {
    const avatar = document
      .querySelector(".your-character .chibi-avatar")!
      .getBoundingClientRect();
    const sparkles = document.querySelectorAll(".sparkle-particle");
    const last = sparkles[sparkles.length - 1].getBoundingClientRect();
    return Math.hypot(
      avatar.left + avatar.width / 2 - last.left - last.width / 2,
      avatar.bottom - last.top - last.height / 2,
    );
  });
  expect(aligned).toBeLessThan(2);
  await page.getByRole("button", { name: "Action wheel", exact: true }).click();
  await page.getByRole("button", { name: "Toss mango", exact: true }).click();
  const ground = page.locator(".camera-viewport-ground");
  const box = (await ground.boundingBox())!;
  await ground.click({
    position: { x: box.width * 0.2, y: box.height * 0.94 },
  });
  await expect(page.locator(".mango-toss")).toBeAttached();
  expect(
    await page
      .locator(".mango-toss")
      .evaluate((canvas: HTMLCanvasElement) => canvas.width / devicePixelRatio),
  ).toBe(2800);
  await expect(page.locator(".toast")).toContainText("Mango landed!");
});
