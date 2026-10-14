import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// A controlled RAF queue drives the real race loop without a 30-second wait.
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
      window as unknown as { advanceRaceFrames: (count: number) => void }
    ).advanceRaceFrames = (count) => {
      for (let i = 0; i < count; i++) {
        now += 1000 / 60;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(now));
      }
    };
  });
}

async function advance(page: Page, count: number) {
  // Small batches let React commit between frames, like a real browser.
  for (let done = 0; done < count; done += 60)
    await page.evaluate(
      (n) =>
        (
          window as unknown as { advanceRaceFrames: (count: number) => void }
        ).advanceRaceFrames(n),
      Math.min(60, count - done),
    );
}

const saved = (page: Page) =>
  page.evaluate(() => {
    const save = JSON.parse(
      localStorage.getItem("club-lion-player-v1") ?? "{}",
    );
    return {
      coins: Number(save.coins),
      races: save.kartRacesFinished,
      stamps: Array.isArray(save.stamps) ? save.stamps : [],
    };
  });

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("race round Lion Speedway, reach the podium and get paid exactly once", async ({
  page,
}) => {
  // A whole 3-lap race plus three axe scans; generous for busy CI machines.
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await installFrames(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Lion Speedway/ })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText("Lion Speedway");
  const before = await saved(page);

  await page
    .getByLabel("Room paths and activities")
    .getByRole("button", { name: "Race karts", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Lion Speedway" });
  await expect(
    dialog.getByRole("button", { name: "Start race" }),
  ).toBeVisible();
  await expectNoAxeViolations(page);

  const cherry = dialog.getByRole("button", { name: "Cherry kart" });
  await cherry.click();
  await expect(cherry).toHaveAttribute("aria-pressed", "true");
  const fast = dialog.getByRole("button", { name: "Fast mode" });
  await expect(fast).toHaveAttribute("aria-pressed", "false");

  await dialog.getByRole("button", { name: "Start race" }).click();
  await expect(dialog.locator(".kart-lights")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Boost" })).toBeDisabled();
  await advance(page, 60 * 5);
  await expect(dialog.locator(".kart-lights")).toBeHidden();
  await expect(
    dialog.getByRole("button", { name: "Steer left" }),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Boost" })).toBeEnabled();
  await expectNoAxeViolations(page);

  await page.keyboard.down("ArrowUp");
  await page.keyboard.press("Space");
  const again = dialog.getByRole("button", { name: "Race again" });
  for (
    let i = 0;
    i < 40 && !(await dialog.locator(".kart-finish-flag").count());
    i++
  )
    await advance(page, 180);
  await page.keyboard.up("ArrowUp");
  await expect(again).toBeFocused();

  const status = await dialog.getByRole("status").textContent();
  const match = /place (\d) of 4 and earned (\d+) coins/.exec(status ?? "");
  expect(match).not.toBeNull();
  const earned = Number(match?.[2]);
  expect([40, 30, 25, 20]).toContain(earned);
  // Placing coins plus the 25-coin Speedway Rookie stamp, paid once.
  const after = await saved(page);
  expect(after.coins).toBe(before.coins + earned + 25);
  expect(after.races).toBe(1);
  expect(after.stamps).toContain("kart_first_race");
  await expectNoAxeViolations(page);

  await advance(page, 120);
  await page.waitForTimeout(300);
  expect((await saved(page)).coins).toBe(after.coins);

  await dialog.getByRole("button", { name: "Back to the speedway" }).click();
  await expect(dialog).toBeHidden();

  await page.reload();
  const reloaded = await saved(page);
  expect(reloaded.coins).toBe(after.coins);
  expect(reloaded.races).toBe(1);
  // The garage remembers the kart colour picked before the race.
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Lion Speedway/ })
    .click();
  await page
    .getByLabel("Room paths and activities")
    .getByRole("button", { name: "Race karts", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cherry kart" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("Downtown Plaza and Lion Speedway connect, and the podium strikes a pose", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Downtown Plaza/ })
    .click();
  const paths = page.getByLabel("Room paths and activities");
  await paths.getByRole("button", { name: /Lion Speedway/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Lion Speedway");
  await paths.getByRole("button", { name: "Podium", exact: true }).click();
  await expect(page.locator(".your-character .speech-bubble")).toContainText(
    "🏆",
  );
  await paths.getByRole("button", { name: /Downtown Plaza/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Downtown Plaza");
});
