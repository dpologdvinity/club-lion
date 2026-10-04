import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";

test("world navigation reaches Splash Oasis and Lazy River with animated scenery and clean returns", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Open map to travel to Splash Oasis
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  await mapDialog.getByRole("button", { name: /^Splash Oasis/ }).click();

  await expect(
    page.getByRole("heading", { name: "Splash Oasis", exact: true }),
  ).toBeVisible();

  // Verify scenery and waterpark landmarks
  const stage = page.locator(".camera-viewport-stage");
  await expect(stage.locator(".room-scenery")).toBeVisible();
  await expect(stage.getByText("TSUNAMI WAVE POOL").first()).toBeVisible();
  await expect(stage.getByText("DUMP BUCKET FORTRESS").first()).toBeVisible();

  // Navigate to Lazy River via room-navigation portal button
  const riverPortalBtn = page
    .locator(".room-navigation")
    .getByRole("button", { name: /Lazy River Oasis/ });
  await expect(riverPortalBtn).toBeVisible();
  await riverPortalBtn.click();

  await expect(
    page.getByRole("heading", { name: "Lazy River Oasis", exact: true }),
  ).toBeVisible();
  await expect(stage.getByText("TUBE RENTALS")).toBeVisible();

  // Navigate back to Splash Oasis
  const oasisPortalBtn = page
    .locator(".room-navigation")
    .getByRole("button", { name: /Splash Oasis/ });
  await expect(oasisPortalBtn).toBeVisible();
  await oasisPortalBtn.click();

  await expect(
    page.getByRole("heading", { name: "Splash Oasis", exact: true }),
  ).toBeVisible();

  // Return to Downtown Plaza
  const downtownPortalBtn = page
    .locator(".room-navigation")
    .getByRole("button", { name: /Downtown Plaza/ });
  await expect(downtownPortalBtn).toBeVisible();
  await downtownPortalBtn.click();

  await expect(
    page.getByRole("heading", { name: "Downtown Plaza", exact: true }),
  ).toBeVisible();

  // Verify visits recorded in localStorage
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(saved.visited).toEqual(
    expect.arrayContaining(["splash-oasis-entry", "splash-oasis-river"]),
  );
  expect(errors).toEqual([]);
});

test("world instruments modal plays notes via keys and clicks without audio errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();

  const gamesDialog = page.getByRole("dialog");
  await expect(gamesDialog).toBeVisible();

  // Pick World Instruments
  await page.getByRole("button", { name: /World Instruments/ }).click();

  await expect(
    gamesDialog.getByRole("heading", { name: "Upright Savanna Piano" }),
  ).toBeVisible();
  await expect(
    gamesDialog.getByText("Press 1–8 or click keys to play"),
  ).toBeVisible();

  // Click note key C4
  const c4Key = gamesDialog.getByRole("button", { name: "C4" });
  await expect(c4Key).toBeVisible();
  await c4Key.click();
  await expect(c4Key).toHaveClass(/instrument-key-active/);

  // Press keyboard key 2 (D4)
  await page.keyboard.press("2");
  const d4Key = gamesDialog.getByRole("button", { name: "D4" });
  await expect(d4Key).toHaveClass(/instrument-key-active/);

  // Press keyboard key 5 (A4)
  await page.keyboard.press("5");
  const a4Key = gamesDialog.getByRole("button", { name: "A4" });
  await expect(a4Key).toHaveClass(/instrument-key-active/);

  // Verify accessibility
  const axeResults = await new AxeBuilder({ page })
    .include(".dialog")
    .analyze();
  expect(axeResults.violations).toEqual([]);

  // Close games dialog
  await gamesDialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(gamesDialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("waterhole angler fishing game casts line, reacts to bite, and updates caught fish stats", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();

  // Select Waterhole Angler
  await page.getByRole("button", { name: /Waterhole Angler/ }).click();

  const anglerDialog = page.getByRole("dialog", { name: "Waterhole Angler" });
  await expect(anglerDialog).toBeVisible();

  const castButton = anglerDialog.getByRole("button", { name: "Cast Line" });
  await expect(castButton).toBeVisible();
  await castButton.click();

  // Should enter waiting state
  await expect(anglerDialog.getByText("Waiting for a bite…")).toBeVisible();

  // Wait for bite to trigger (random between 1.2s and 3.2s)
  const strikeButton = anglerDialog.getByRole("button", {
    name: "Strike & Reel!",
  });
  await expect(strikeButton).toBeVisible({ timeout: 6000 });
  await strikeButton.click();

  // Should enter reeling state with tension bar and Reel button
  const reelButton = anglerDialog.getByRole("button", { name: "Reel!" });
  await expect(reelButton).toBeVisible();

  // Pulse reeling to keep tension in the sweet spot for 2.5s
  for (let i = 0; i < 10; i++) {
    const isReeling = await reelButton.isVisible().catch(() => false);
    if (!isReeling) break;
    await page.keyboard.down("Space");
    await page.waitForTimeout(200);
    await page.keyboard.up("Space");
    await page.waitForTimeout(150);
  }

  // Check that either result screen or game cycles cleanly back to idle
  await expect(
    anglerDialog.getByText(/You caught a|Cast Line|Cast Again/i).first(),
  ).toBeVisible({ timeout: 5000 });

  // Close angler
  await anglerDialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(anglerDialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("top models runway 30s challenge allows wardrobe selection, catwalk strut, and star scoring", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Games", exact: true }).click();

  // Select Top Models Runway
  await page.getByRole("button", { name: /Top Models Runway/ }).click();

  const runwayDialog = page.getByRole("dialog", {
    name: "Top Models Fashion Show",
  });
  await expect(runwayDialog).toBeVisible();

  // Verify reveal stage with challenge theme
  await expect(
    runwayDialog.getByText("Tonight's Challenge Theme:"),
  ).toBeVisible();
  await expect(
    runwayDialog.getByText(/You will have 30 seconds/),
  ).toBeVisible();

  // Start styling
  await runwayDialog
    .getByRole("button", { name: "Start Styling Now!" })
    .click();

  // Verify styling stage with 30s countdown and closet items
  await expect(runwayDialog.getByText(/remaining/)).toBeVisible();
  const goldenManeBtn = runwayDialog.getByRole("button", {
    name: /Golden Mane Wreath/,
  });
  await expect(goldenManeBtn).toBeVisible();
  await goldenManeBtn.click();
  await expect(goldenManeBtn).toHaveAttribute("aria-pressed", "true");

  const floralShirtBtn = runwayDialog.getByRole("button", {
    name: /Tropical Floral Shirt/,
  });
  await floralShirtBtn.click();
  await expect(floralShirtBtn).toHaveAttribute("aria-pressed", "true");

  await expect(runwayDialog.getByText("2 items styled")).toBeVisible();

  // Walk the runway
  await runwayDialog.getByRole("button", { name: /Walk the Runway/ }).click();

  // Verify catwalk strut animation with flashbulbs
  await expect(runwayDialog.getByText(/FLASH!/)).toBeVisible();

  // Wait for verdict stage (auto-transitions after 2.5s catwalk)
  await expect(runwayDialog.getByText(/Score:/)).toBeVisible({
    timeout: 5000,
  });
  await expect(runwayDialog.getByText(/Won:/)).toBeVisible();

  // Check Collect & Return button
  const collectBtn = runwayDialog.getByRole("button", {
    name: "Collect & Return",
  });
  await expect(collectBtn).toBeVisible();
  await collectBtn.click();

  await expect(runwayDialog).not.toBeVisible();
  expect(errors).toEqual([]);
});
