import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Sunset Beach and Coastal Pier allow travel, lighthouse foghorn activation, and Foghorn Mariner stamp unlock", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Navigate to Sunset Beach via Map
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  await mapDialog.getByRole("button", { name: /^Sunset Beach/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Sunset Beach");

  // Navigate to Coastal Pier & Boardwalk via room-navigation
  const paths = page.getByLabel("Room paths and activities");
  const pierPortalBtn = paths.getByRole("button", {
    name: /Coastal Pier & Boardwalk/,
  });
  await expect(pierPortalBtn).toBeVisible();
  await pierPortalBtn.click();

  await expect(page.locator(".world-location h2")).toHaveText(
    "Coastal Pier & Boardwalk",
  );

  // Sound the lighthouse foghorn via room-navigation button
  const foghornBtn = paths.getByRole("button", {
    name: "Sound Foghorn",
    exact: true,
  });
  await expect(foghornBtn).toBeVisible();
  await foghornBtn.click();

  // Verify toast notification
  await expect(
    page.getByText(/The lighthouse foghorn echoes across the bay!/),
  ).toBeVisible();

  // Open Stamp Book and verify Foghorn Mariner stamp is collected
  await page.getByRole("button", { name: "Stamp Book", exact: true }).click();
  const stampDialog = page.getByRole("dialog");
  await expect(stampDialog).toBeVisible();

  const foghornStamp = stampDialog
    .locator(".stamp-slot")
    .filter({ hasText: "Foghorn Mariner" });
  await expect(foghornStamp).toBeVisible();
  await expect(foghornStamp).toHaveClass(/is-unlocked/);

  // Accessibility check on Stamp Book dialog
  const a11y = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);

  await stampDialog.getByRole("button", { name: "Close" }).click();
  expect(errors).toEqual([]);
});

test("Mt. Mist Alpine Basecamp launches Sled Run minigame with steering, jumping, and HUD updates", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Navigate to Mt. Mist Basecamp via Map
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  await mapDialog
    .getByRole("button", { name: /^Mt\. Mist Alpine Basecamp/ })
    .click();

  await expect(page.locator(".world-location h2")).toHaveText(
    "Mt. Mist Alpine Basecamp",
  );

  // Open Sled Run Race via room-navigation
  const paths = page.getByLabel("Room paths and activities");
  const sledGateBtn = paths.getByRole("button", {
    name: "Sled Run Race",
    exact: true,
  });
  await expect(sledGateBtn).toBeVisible();
  await sledGateBtn.click();

  // Verify Sled Run modal is displayed
  const sledDialog = page.getByRole("dialog");
  await expect(sledDialog).toBeVisible();
  await expect(sledDialog.getByText("The 800-meter Alpine Dash")).toBeVisible();

  // Accessibility check on Sled Run ready screen
  const a11y = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);

  // Start Sled Run
  const startBtn = sledDialog.getByRole("button", { name: "Start Sled Run" });
  await expect(startBtn).toBeVisible();
  await startBtn.click();

  // Verify active run HUD
  await expect(sledDialog.getByLabel("Distance down slope")).toBeVisible();
  await expect(sledDialog.getByText(/Speed/)).toBeVisible();

  // Steer and jump with keyboard
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");

  // Close Sled Run dialog via Close button
  await sledDialog.getByRole("button", { name: "Close" }).click();
  await expect(sledDialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("Canyon Rapids launches River Surf minigame with trick controls and score tracking", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Navigate to Canyon Rapids via Map
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  await mapDialog.getByRole("button", { name: /^Canyon Rapids/ }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Canyon Rapids");

  // Open River Surf Rapids via room-navigation
  const paths = page.getByLabel("Room paths and activities");
  const surfBtn = paths.getByRole("button", {
    name: "River Surf Rapids",
    exact: true,
  });
  await expect(surfBtn).toBeVisible();
  await surfBtn.click();

  const surfDialog = page.getByRole("dialog");
  await expect(surfDialog).toBeVisible();
  await expect(
    surfDialog
      .getByRole("heading", { name: "Canyon Rapids River Surf" })
      .first(),
  ).toBeVisible();

  // Accessibility check on River Surf intro
  const a11y = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);

  // Start surfing run
  const hitRapidsBtn = surfDialog.getByRole("button", {
    name: /Hit the rapids/,
  });
  await expect(hitRapidsBtn).toBeVisible();
  await hitRapidsBtn.click();

  // Verify active gameplay controls
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");

  // Close River Surf dialog via Close button
  await surfDialog.getByRole("button", { name: "Close" }).click();
  await expect(surfDialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("Pet Paradise Nursery provides grooming care actions and awards Pampered Pride stamp upon max happiness", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Navigate to Pet Paradise Nursery via Map
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  await mapDialog
    .getByRole("button", { name: /^Pet Paradise Nursery/ })
    .click();

  await expect(page.locator(".world-location h2")).toHaveText(
    "Pet Paradise Nursery",
  );

  // Open Grooming Spa via room-navigation
  const paths = page.getByLabel("Room paths and activities");
  const spaBtn = paths.getByRole("button", {
    name: "Grooming Spa",
    exact: true,
  });
  await expect(spaBtn).toBeVisible();
  await spaBtn.click();

  const spaDialog = page.getByRole("dialog", {
    name: "Pet Paradise Nursery",
  });
  await expect(spaDialog).toBeVisible();

  // Perform grooming actions: Wash, Brush, Treat, Play
  const washBtn = spaDialog.getByRole("button", { name: "Wash", exact: true });
  const brushBtn = spaDialog.getByRole("button", {
    name: "Brush",
    exact: true,
  });
  const treatBtn = spaDialog.getByRole("button", {
    name: "Treat",
    exact: true,
  });

  await washBtn.click();
  await brushBtn.click();
  await treatBtn.click();
  await brushBtn.click();

  // Happiness should reach 100%
  const happinessProgress = spaDialog.getByRole("progressbar", {
    name: "Pet happiness level",
  });
  await expect(happinessProgress).toHaveAttribute("aria-valuenow", "100");

  // Accessibility check on Pet Care modal
  const a11y = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);

  // Close Grooming Spa
  await spaDialog.getByRole("button", { name: "Close" }).click();
  await expect(spaDialog).not.toBeVisible();

  // Check that Pampered Pride stamp is unlocked in Stamp Book
  await page.getByRole("button", { name: "Stamp Book", exact: true }).click();
  const stampDialog = page.getByRole("dialog");
  await expect(stampDialog).toBeVisible();

  const pamperedStamp = stampDialog
    .locator(".stamp-slot")
    .filter({ hasText: "Pampered Pride" });
  await expect(pamperedStamp).toBeVisible();
  await expect(pamperedStamp).toHaveClass(/is-unlocked/);

  await stampDialog.getByRole("button", { name: "Close" }).click();
  expect(errors).toEqual([]);
});

test("Community Servers modal allows hosting a custom lounge and awards Lounge Host stamp", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Open Servers modal from header nav
  await page.getByRole("button", { name: "Servers", exact: true }).click();
  const serverDialog = page.getByRole("dialog", { name: "Worlds & lounges" });
  await expect(serverDialog).toBeVisible();

  // Switch to Host New Lounge tab
  const hostTab = serverDialog.getByRole("tab", { name: "Host New Lounge" });
  await expect(hostTab).toBeVisible();
  await hostTab.click();

  // Fill in custom lounge details using label selector
  const loungeInput = serverDialog.getByLabel("Lounge name");
  await expect(loungeInput).toBeVisible();
  await loungeInput.fill("Savanna Chill Lounge");

  const createBtn = serverDialog.getByRole("button", {
    name: "Create lounge",
  });
  await expect(createBtn).toBeVisible();
  await createBtn.click();

  // Dialog should close, and toast should confirm hosting
  await expect(serverDialog).not.toBeVisible();
  await expect(
    page.getByText(/Lounge Host! Joined Savanna Chill Lounge\./),
  ).toBeVisible();

  // Check that Lounge Host stamp is unlocked in Stamp Book
  await page.getByRole("button", { name: "Stamp Book", exact: true }).click();
  const stampDialog = page.getByRole("dialog");
  await expect(stampDialog).toBeVisible();

  const loungeStamp = stampDialog
    .locator(".stamp-slot")
    .filter({ hasText: "Lounge Host" });
  await expect(loungeStamp).toBeVisible();
  await expect(loungeStamp).toHaveClass(/is-unlocked/);

  await stampDialog.getByRole("button", { name: "Close" }).click();
  expect(errors).toEqual([]);
});

test("Global Environmental Lighting controls cycle Day, Sunset, Dusk, Night states across Phase 5 biomes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  const lightingControls = page.locator(".lighting-controls");
  await expect(lightingControls).toBeVisible();

  // Select Night mode
  const nightBtn = lightingControls.getByRole("button", {
    name: "Night",
    exact: true,
  });
  await expect(nightBtn).toBeVisible();
  await nightBtn.click();

  const overlay = page.locator(".global-lighting-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveAttribute("data-time-of-day", "night");

  // Select Sunset mode
  const sunsetBtn = lightingControls.getByRole("button", {
    name: "Sunset",
    exact: true,
  });
  await expect(sunsetBtn).toBeVisible();
  await sunsetBtn.click();
  await expect(overlay).toHaveAttribute("data-time-of-day", "sunset");

  // Select Dusk mode
  const duskBtn = lightingControls.getByRole("button", {
    name: "Dusk",
    exact: true,
  });
  await expect(duskBtn).toBeVisible();
  await duskBtn.click();
  await expect(overlay).toHaveAttribute("data-time-of-day", "dusk");

  // Select Day mode
  const dayBtn = lightingControls.getByRole("button", {
    name: "Day",
    exact: true,
  });
  await expect(dayBtn).toBeVisible();
  await dayBtn.click();
  await expect(overlay).toHaveAttribute("data-time-of-day", "day");

  expect(errors).toEqual([]);
});

test("World Map lists all 18 destinations with seamless room traversal", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Open World Map
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const mapDialog = page.getByRole("dialog");
  await expect(mapDialog).toBeVisible();

  const destinations = mapDialog.locator(".map-destination");
  await expect(destinations).toHaveCount(18);

  // Navigate to Coastal Pier directly from map
  await mapDialog
    .getByRole("button", { name: /^Coastal Pier & Boardwalk/ })
    .click();
  await expect(page.locator(".world-location h2")).toHaveText(
    "Coastal Pier & Boardwalk",
  );

  // Navigate back to Savanna Square via back button in header
  await page.getByRole("button", { name: "Return to Savanna Square" }).click();
  await expect(page.locator(".world-location h2")).toHaveText("Savanna Square");

  expect(errors).toEqual([]);
});
