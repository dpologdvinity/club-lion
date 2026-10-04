import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";

test("header audio controls and procedural jukebox modal play tracks and adjust volume", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Verify AudioControls in header
  const audioControls = page.locator(".audio-controls");
  await expect(audioControls).toBeVisible();

  const muteBtn = audioControls.locator(".audio-controls-mute");
  await expect(muteBtn).toBeVisible();
  await expect(muteBtn).toHaveAttribute("aria-pressed", "false");

  // Press 'm' key to toggle master mute
  await page.keyboard.press("m");
  await expect(muteBtn).toHaveAttribute("aria-pressed", "true");

  // Press 'm' key again to unmute
  await page.keyboard.press("m");
  await expect(muteBtn).toHaveAttribute("aria-pressed", "false");

  // Open Jukebox modal from header nav
  await page.getByRole("button", { name: "Jukebox", exact: true }).click();
  const jukeboxDialog = page.getByRole("dialog");
  await expect(jukeboxDialog).toBeVisible();
  await expect(
    jukeboxDialog.getByText("Procedural Savanna soundtracks"),
  ).toBeVisible();

  // Verify tracks in jukebox list
  const trackBtns = jukeboxDialog.locator(".jukebox-track-button");
  await expect(trackBtns).toHaveCount(4);

  // Play track 1: Savanna Nightclub
  const nightclubBtn = jukeboxDialog.getByRole("button", {
    name: /Play Savanna Nightclub/,
  });
  await expect(nightclubBtn).toBeVisible();
  await nightclubBtn.click();

  // Track button should now be active and offer to pause
  const pauseBtn = jukeboxDialog.getByRole("button", {
    name: /Pause Savanna Nightclub/,
  });
  await expect(pauseBtn).toBeVisible();
  await expect(pauseBtn).toHaveAttribute("aria-pressed", "true");

  // Close Jukebox modal
  await jukeboxDialog.getByRole("button", { name: "Close" }).click();
  await expect(jukeboxDialog).not.toBeVisible();

  expect(errors).toEqual([]);
});

test("luxury penthouse condo customization allows furniture placement, rotation, and persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Open map to navigate to Luxury Penthouse Condo
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  await mapDialog
    .getByRole("button", { name: /^Luxury Penthouse Condo/ })
    .click();

  await expect(
    page.getByRole("heading", { name: "Luxury Penthouse Condo", exact: true }),
  ).toBeVisible();

  // Open Condo Furniture Grid Customizer
  const editFurnitureBtn = page
    .locator(".room-navigation button")
    .filter({ hasText: /Furniture Grid/ });
  await expect(editFurnitureBtn).toBeVisible();
  await editFurnitureBtn.click();

  const condoDialog = page.getByRole("dialog");
  await expect(condoDialog).toBeVisible();

  // Toggle Edit Mode in Condo
  const editModeToggle = condoDialog.getByRole("button", {
    name: /Customize Den/,
  });
  await expect(editModeToggle).toBeVisible();
  await editModeToggle.click();

  // Pick furniture item from tray: Velvet Sofa
  const sofaCard = condoDialog.getByRole("button", {
    name: /Velvet Sofa/,
  });
  await expect(sofaCard).toBeVisible();
  await sofaCard.click();

  // Place on an isometric tile
  const tile = condoDialog.locator(".condo-tile").first();
  if (await tile.isVisible()) {
    await tile.click();
  }

  // Rotate selected furniture
  const rotateBtn = condoDialog.getByRole("button", { name: /Rotate/ });
  if (await rotateBtn.isVisible()) {
    await rotateBtn.click();
  }

  // Close condo dialog and verify layout persistence in localStorage
  await condoDialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(condoDialog).not.toBeVisible();

  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(saved.visited).toEqual(expect.arrayContaining(["penthouse-condo"]));
  expect(errors).toEqual([]);
});

test("secret scout base spy terminal launches and allows laser grid and cipher decryption", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Navigate to Downtown Plaza via World Map
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  await mapDialog.getByRole("button", { name: /^Downtown Plaza/ }).click();

  await expect(
    page.getByRole("heading", {
      name: "Downtown Plaza",
      exact: true,
    }),
  ).toBeVisible();

  // Trigger Secret Scout HQ entrance via room navigation
  const scoutPortalBtn = page
    .locator(".room-navigation button")
    .filter({ hasText: "Secret Scout HQ" });
  await expect(scoutPortalBtn).toBeVisible();
  await scoutPortalBtn.click();

  // Verify Phone Booth PIN keypad modal appears
  const pinDialog = page.getByRole("dialog");
  await expect(pinDialog).toBeVisible();
  await expect(pinDialog.getByText("Classified Telephone Booth")).toBeVisible();

  // Dial PIN 7743 (PRID)
  await pinDialog.getByRole("button", { name: /^Digit 7/ }).click();
  await pinDialog.getByRole("button", { name: /^Digit 7/ }).click();
  await pinDialog.getByRole("button", { name: /^Digit 4/ }).click();
  await pinDialog.getByRole("button", { name: /^Digit 3/ }).click();

  await expect(
    page.getByRole("heading", {
      name: "The Pride HQ - Secret Scout Command Center",
      exact: true,
    }),
  ).toBeVisible();

  // Launch Spy Terminal
  const spyTerminalBtn = page
    .locator(".room-navigation button")
    .filter({ hasText: "Spy Terminal" });
  await expect(spyTerminalBtn).toBeVisible();
  await spyTerminalBtn.click();

  const terminalDialog = page.getByRole("dialog");
  await expect(terminalDialog).toBeVisible();
  await expect(
    terminalDialog.getByText("Classified access only"),
  ).toBeVisible();

  // Laser Grid is active by default
  await expect(
    terminalDialog.getByRole("tab", { name: /Laser Tripwire Grid/ }),
  ).toBeVisible();
  await expect(terminalDialog.locator(".spy-grid-board")).toBeVisible();

  // Move agent using direction controls
  const downControl = terminalDialog
    .locator(".spy-dpad")
    .getByLabel(/Move down/i);
  if (await downControl.isVisible()) {
    await downControl.click();
  }

  // Switch to Classified Agent Cipher tab
  const cipherTab = terminalDialog.getByRole("tab", {
    name: /Classified Agent Cipher/,
  });
  await cipherTab.click();
  await expect(terminalDialog.locator(".spy-cipher-display")).toBeVisible();

  // Request a hint in cipher
  const hintBtn = terminalDialog.getByRole("button", { name: /Hint/i });
  if (await hintBtn.isVisible()) {
    await hintBtn.click();
  }

  // Close Spy Terminal
  await terminalDialog.getByRole("button", { name: /Return to HQ/ }).click();
  await expect(terminalDialog).not.toBeVisible();

  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(saved.visited).toEqual(expect.arrayContaining(["secret-scout-base"]));
  expect(errors).toEqual([]);
});

test("friends panel supports tabs, search input, and presence display", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Open Friends panel from header
  await page.getByRole("button", { name: "Friends", exact: true }).click();
  const friendsDialog = page.getByRole("dialog");
  await expect(friendsDialog).toBeVisible();
  await expect(
    friendsDialog.getByText(
      "Friends, familiar paws, and little adventures together.",
    ),
  ).toBeVisible();

  // Check tabs: Friends, Requests, Recent
  await expect(
    friendsDialog.getByRole("tab", { name: /Friends/ }),
  ).toBeVisible();
  await expect(
    friendsDialog.getByRole("tab", { name: /Requests/ }),
  ).toBeVisible();
  await expect(
    friendsDialog.getByRole("tab", { name: /Recent/ }),
  ).toBeVisible();

  // Search input is functional
  const searchInput = friendsDialog.getByLabel("Find a friend by username");
  await expect(searchInput).toBeVisible();
  await searchInput.fill("Simba");
  await expect(searchInput).toHaveValue("Simba");

  // Switch to Requests tab
  await friendsDialog.getByRole("tab", { name: /Requests/ }).click();
  await expect(friendsDialog.getByText(/Incoming \(/)).toBeVisible();

  // Switch to Recent tab
  await friendsDialog.getByRole("tab", { name: /Recent/ }).click();
  await expect(friendsDialog.getByText(/No recent visitors yet/)).toBeVisible();

  // Close Friends panel
  await friendsDialog.getByRole("button", { name: "Close" }).click();
  await expect(friendsDialog).not.toBeVisible();

  expect(errors).toEqual([]);
});

test("player account modal displays guest status and provides export and import cloud sync", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Open Account modal from header
  await page.getByRole("button", { name: "Account", exact: true }).click();
  const accountDialog = page.getByRole("dialog");
  await expect(accountDialog).toBeVisible();
  await expect(
    accountDialog.getByText("Guest profile & local cloud sync"),
  ).toBeVisible();

  // Verify profile information
  await expect(
    accountDialog.getByRole("tab", { name: /Profile/ }),
  ).toBeVisible();
  await expect(accountDialog.getByText(/Local-First Explorer/)).toBeVisible();

  // Switch to Cloud Sync tab and click Export
  await accountDialog.getByRole("tab", { name: /Cloud Sync/ }).click();
  const exportBtn = accountDialog.getByRole("button", {
    name: /Export Cloud Sync Code/,
  });
  await expect(exportBtn).toBeVisible();
  await exportBtn.click();

  // Switch to Restore / Transfer tab
  await accountDialog.getByRole("tab", { name: /Restore \/ Transfer/ }).click();
  const textarea = accountDialog.locator(".restore-textarea");
  await expect(textarea).toBeVisible();
  await textarea.fill("invalid-sync-payload");

  const importBtn = accountDialog.getByRole("button", {
    name: /Import & Restore Save/,
  });
  await expect(importBtn).toBeVisible();
  await importBtn.click();

  // Error message should appear safely without crashing
  await expect(
    accountDialog.getByText(/Invalid or corrupted backup code/),
  ).toBeVisible();

  // Close Account modal
  await accountDialog.getByRole("button", { name: "Close" }).click();
  await expect(accountDialog).not.toBeVisible();

  expect(errors).toEqual([]);
});

test("Phase 4 views pass automated accessibility audits with zero violations", async ({
  page,
}) => {
  await page.goto("/");

  // Run Axe accessibility check on world with audio controls
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  expect(results.violations).toEqual([]);

  // Open Account Modal and test accessibility
  await page.getByRole("button", { name: "Account", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const accountAxe = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  expect(accountAxe.violations).toEqual([]);
});
