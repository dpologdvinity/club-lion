import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { newPlayer, SAVE_KEY } from "../src/game";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/friends.html");
  await page.getByRole("button", { name: "Open friends" }).click();
});

test("presence, search, emote cooldown and safe room jumps work", async ({
  page,
}) => {
  const dialog = page.getByRole("dialog", { name: "Your pride" });
  await expect(dialog.getByText("3 / 100 friends")).toBeVisible();
  await expect(dialog.getByText("📍 Downtown Plaza")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Jump to Sleepy Paws" }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: "Jump to missing" }),
  ).toBeDisabled();
  await dialog.getByLabel("Find a friend by username").fill("sunny");
  await expect(dialog.getByRole("listitem")).toHaveCount(1);
  await dialog.getByRole("button", { name: "High-five Sunny Paws" }).click();
  await expect(page.getByLabel("Emotes", { exact: true })).toHaveText(
    '["online:high_five"]',
  );
  await expect(
    dialog.getByRole("button", { name: "Tandem groove with Sunny Paws" }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: "Tandem groove with Sunny Paws" }),
  ).toBeEnabled();
  await dialog
    .getByRole("button", { name: "Tandem groove with Sunny Paws" })
    .click();
  await expect(page.getByLabel("Emotes", { exact: true })).toHaveText(
    '["online:high_five","online:tandem_groove"]',
  );
  await dialog.getByRole("button", { name: "Jump to Sunny Paws" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel("Jump destination")).toHaveText(
    "downtown-plaza",
  );
  await expect(page.locator(".your-character")).toHaveAttribute(
    "style",
    /left: 50%; top: 88\.888/,
  );
  // Repeat a jump within the same room after moving away from the landing spot.
  const ground = page.getByRole("button", {
    name: "Walk around Downtown Plaza. Use arrow keys or click the ground.",
  });
  await ground.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".your-character")).not.toHaveAttribute(
    "style",
    /left: 50%;/,
  );
  await page.getByRole("button", { name: "Open friends" }).click();
  await page.getByRole("button", { name: "Jump to Sunny Paws" }).click();
  await expect(page.locator(".your-character")).toHaveAttribute(
    "style",
    /left: 50%;/,
  );
});

test("requests, recent visitors, removal and username lookup update the graph", async ({
  page,
}) => {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("tab", { name: /Requests/ }).click();
  await dialog.getByRole("button", { name: "Accept Amber" }).click();
  await dialog.getByRole("button", { name: "Decline Cleo" }).click();
  await dialog.getByRole("button", { name: "Cancel request to Pip" }).click();
  await expect(page.getByLabel("Social graph")).toHaveText(
    '{"friends":["online","offline","missing","incoming"],"pendingIncoming":[],"pendingOutgoing":[],"recentVisitors":["recent","online"]}',
  );
  await dialog.getByRole("tab", { name: "Recent", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Add Sunny Paws as a friend" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Add Roary as a friend" }).click();
  await expect(
    dialog.getByRole("button", { name: "Add Roary as a friend" }),
  ).toHaveText("Request pending");
  await dialog.getByLabel("Find a friend by username").fill("pIp");
  await dialog.getByRole("button", { name: "Add Friend", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Friend request added for Pip.",
  );
  await dialog.getByLabel("Find a friend by username").fill("unknown");
  await dialog.getByRole("button", { name: "Add Friend", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("No known player");
  await dialog.getByLabel("Find a friend by username").fill("Myself");
  await dialog.getByRole("button", { name: "Add Friend", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("That’s you");
  await dialog.getByLabel("Find a friend by username").fill("");
  await dialog.getByRole("tab", { name: "Friends", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Remove Amber from friends" })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Jump to Amber" }),
  ).toHaveCount(0);
});

test("modal traps focus, supports keyboard tabs, restores focus and meets contrast requirements", async ({
  page,
}, testInfo) => {
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close dialog" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  const last = dialog.getByRole("button", {
    name: "Remove missing from friends",
  });
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  const friends = dialog.getByRole("tab", { name: "Friends", exact: true });
  await friends.focus();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("tab", { name: /Requests/ })).toBeFocused();
  await expect(dialog.getByRole("tab", { name: /Requests/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("End");
  await expect(
    dialog.getByRole("tab", { name: "Recent", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(friends).toBeFocused();
  await dialog
    .getByRole("button", { name: "Remove missing from friends" })
    .focus();
  await page.keyboard.press("Space");
  await expect(
    dialog.getByRole("button", { name: "Remove missing from friends" }),
  ).toHaveCount(0);
  await dialog.getByLabel("Find a friend by username").fill("Pip");
  await page.keyboard.press("Enter");
  await expect(dialog.getByRole("status")).toContainText("pending request");
  await dialog.getByLabel("Find a friend by username").fill("");
  expect(
    (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `/tmp/club-lion-friends-${testInfo.project.name}.png`,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open friends" }),
  ).toBeFocused();
});

test("the app exposes persisted local social state without inventing online presence", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    {
      key: SAVE_KEY,
      save: {
        ...newPlayer(),
        friends: ["old-friend"],
        incomingFriendRequests: ["request"],
        recentVisitors: ["visitor"],
      },
    },
  );
  await page.reload();
  await page.getByRole("button", { name: "Friends", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Jump to old-friend" }),
  ).toBeDisabled();
  await dialog
    .getByRole("button", { name: "Remove old-friend from friends" })
    .click();
  await dialog.getByRole("tab", { name: /Requests/ }).click();
  await dialog.getByRole("button", { name: "Accept request" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Friends", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Jump to request" }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: "Jump to old-friend" }),
  ).toHaveCount(0);
});
