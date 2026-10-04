import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createCustomServer } from "../src/utils/customServers";

const SERVER_SAVE_KEY = "club-lion-active-server-v1";

test("official worlds support keyboard tabs, joining and leaving", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  const opener = page.getByRole("button", { name: "Servers", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Worlds & lounges" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".server-card")).toHaveCount(3);
  const browse = dialog.getByRole("tab", { name: "Browse Worlds" });
  await browse.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    dialog.getByRole("tab", { name: "Host New Lounge" }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(browse).toHaveAttribute("aria-selected", "true");
  const audit = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog
    .getByRole("button", { name: "Join Savanna Prime", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".world-location h2")).toHaveText("Downtown Plaza");
  await opener.click();
  await expect(dialog.locator(".active-server-info")).toContainText(
    "Savanna Prime",
  );
  await expect(
    dialog
      .locator(".server-card")
      .filter({ hasText: "Savanna Prime" })
      .locator(".server-occupant-badge"),
  ).toHaveText("1 / 25");
  await dialog
    .getByRole("button", { name: "Join Wonderland Oasis", exact: true })
    .click();
  await opener.click();
  await expect(
    dialog
      .locator(".server-card")
      .filter({ hasText: "Savanna Prime" })
      .locator(".server-occupant-badge"),
  ).toHaveText("0 / 25");
  await dialog
    .getByRole("button", { name: "Leave world", exact: true })
    .click();
  await expect(dialog.locator(".active-server-info")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), SERVER_SAVE_KEY),
    )
    .toBeNull();
});

test("private lounges validate names, gate rejoining and persist the active room", async ({
  page,
}) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Servers", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Worlds & lounges" });
  await dialog.getByRole("tab", { name: "Host New Lounge" }).click();
  await dialog
    .getByRole("button", { name: "Create lounge", exact: true })
    .click();
  await expect(dialog.getByLabel("Lounge name", { exact: true })).toBeFocused();
  await expect(dialog.getByRole("alert")).toContainText("name");
  await dialog.getByLabel("Lounge name", { exact: true }).fill("Moonlit Pride");
  await dialog
    .getByLabel("Lounge password (optional)", { exact: true })
    .fill("secret");
  await dialog
    .getByLabel("Starting room", { exact: true })
    .selectOption("club-pulse");
  await dialog
    .getByRole("button", { name: "Create lounge", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".world-location h2")).toHaveText("Club Pulse");
  await page.reload();
  await expect(page.locator(".world-location h2")).toHaveText("Club Pulse");
  await opener.click();
  await expect(dialog.locator(".active-server-info")).toContainText(
    "Moonlit Pride",
  );
  await expect(dialog.locator(".host-crown")).toBeVisible();
  await dialog
    .getByRole("button", { name: "Join Savanna Prime", exact: true })
    .click();
  await opener.click();
  await dialog
    .getByRole("button", { name: "Join Moonlit Pride", exact: true })
    .click();
  const password = dialog.getByLabel("Password for Moonlit Pride", {
    exact: true,
  });
  await expect(password).toBeFocused();
  await password.fill("wrong");
  await dialog.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Incorrect lounge password",
  );
  await expect(dialog.locator(".active-server-info")).toContainText(
    "Savanna Prime",
  );
  await password.fill("secret");
  await dialog.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? "null")?.name,
        SERVER_SAVE_KEY,
      ),
    )
    .toBe("Moonlit Pride");
  await page.getByRole("button", { name: "My den", exact: true }).click();
  await page.reload();
  await expect(page.locator(".world-location h2")).toHaveText("Your cozy den");
});

test("unavailable storage warns while lounge creation remains playable", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error("Storage unavailable");
      write.call(this, name, value);
    };
  }, SERVER_SAVE_KEY);
  await page.goto("/");
  await page.getByRole("button", { name: "Servers", exact: true }).click();
  await page.getByRole("tab", { name: "Host New Lounge" }).click();
  await page.getByLabel("Lounge name", { exact: true }).fill("Temporary Pride");
  await page
    .getByRole("button", { name: "Create lounge", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "couldn’t save this lounge",
  );
  await page.getByRole("button", { name: "Servers", exact: true }).click();
  await expect(page.locator(".active-server-info")).toContainText(
    "Temporary Pride",
  );
});

test("hosts can mute, unmute, kick and ban real occupants", async ({
  page,
}) => {
  const lounge = {
    ...createCustomServer("local-player", "Roary", "Host Lounge"),
    occupants: ["local-player", "guest", "other"],
  };
  await page.addInitScript(
    ({ key, server }) => localStorage.setItem(key, JSON.stringify(server)),
    { key: SERVER_SAVE_KEY, server: lounge },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Servers", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Worlds & lounges" });
  await dialog.getByRole("button", { name: "Mute guest", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Unmute guest", exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Unmute guest", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Kick guest", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Kick guest", exact: true }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "Ban other", exact: true }).click();
  await expect(dialog.locator(".server-occupant-badge").last()).toHaveText(
    "1 / 25",
  );
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? "null")?.bannedPlayerIds,
        SERVER_SAVE_KEY,
      ),
    )
    .toEqual(["other"]);
});

test("guests have no moderation controls and invalid saves recover safely", async ({
  page,
}) => {
  const lounge = {
    ...createCustomServer("host", "Other host", "Guest Lounge"),
    occupants: ["host", "local-player"],
  };
  await page.addInitScript(
    ({ key, server }) => localStorage.setItem(key, JSON.stringify(server)),
    { key: SERVER_SAVE_KEY, server: lounge },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Servers", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mute host", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".host-crown")).toHaveCount(0);
  await page.evaluate(
    (key) => localStorage.setItem(key, "broken json"),
    SERVER_SAVE_KEY,
  );
  // Use a fresh page without the fixture's init script.
  const fresh = await page.context().newPage();
  await fresh.goto("/");
  await fresh.getByRole("button", { name: "Servers", exact: true }).click();
  await expect(fresh.locator(".active-server-info")).toHaveCount(0);
  await expect(fresh.locator(".server-card")).toHaveCount(3);
  expect(
    await fresh.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(fresh.viewportSize()!.width);
});
