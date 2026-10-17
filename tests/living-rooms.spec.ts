import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tapRoomPath } from "./room-paths";

for (const room of [
  {
    name: "The watering hole",
    action: "Bounce the lily pads",
    kind: "lily",
    objects: 4,
  },
  {
    name: "Canopy café",
    action: "Bake a sunny pastry",
    kind: "oven",
    objects: 4,
  },
  {
    name: "The arcade",
    action: "Drop a surprise ball",
    kind: "prizes",
    objects: 23,
  },
  {
    name: "Sunset Beach",
    action: "Build a sandcastle",
    kind: "sandcastle",
    objects: 3,
    exit: "Downtown Plaza",
  },
  {
    name: "Lion Aquarium",
    action: "Wake the jellyfish",
    kind: "jellyfish",
    objects: 2,
    exit: "Coastal Pier & Boardwalk",
  },
  {
    name: "Snowflake Rink",
    action: "Dress the snowman",
    kind: "snowman",
    objects: 2,
    exit: "Mt. Mist Alpine Basecamp",
  },
  {
    name: "Mt. Mist Alpine Basecamp",
    action: "Warm up at the campfire",
    kind: "campfire",
    objects: 2,
    exit: "Snowflake Rink",
  },
  {
    name: "Pet Paradise Nursery",
    action: "Roll the yarn ball",
    kind: "yarn",
    objects: 2,
    exit: "Downtown Plaza",
  },
  {
    name: "Carnival Midway",
    action: "Pop some popcorn",
    kind: "popcorn",
    objects: 1,
    exit: "Wonder Park Entrance",
  },
  {
    name: "Wonder Park Entrance",
    action: "Float the balloons",
    kind: "balloons",
    objects: 1,
    exit: "Carnival Midway",
  },
  {
    name: "Coastal Pier & Boardwalk",
    action: "Cast the fishing rod",
    kind: "fishing",
    objects: 2,
    exit: "Sunset Beach",
  },
  {
    name: "Lion Speedway",
    action: "Wave the checkered flag",
    kind: "flag",
    objects: 1,
    exit: "Downtown Plaza",
  },
  {
    name: "Splash Oasis",
    action: "Squeeze the rubber duck",
    kind: "duck",
    objects: 2,
    exit: "Downtown Plaza",
  },
  {
    name: "Canyon Rapids",
    action: "Paddle the kayak",
    kind: "kayak",
    objects: 1,
    exit: "Downtown Plaza",
  },
  {
    name: "Savanna Square",
    action: "Dig in the sandbox",
    kind: "sandbox",
    objects: 22,
    exit: "Downtown Plaza",
  },
  {
    name: "Lola's Kainan",
    action: "Turn the lechon",
    kind: "lechon",
    objects: 9,
    exit: "Downtown Plaza",
  },
  {
    name: "Your cozy den",
    action: "Switch the reading lamp",
    kind: "lamp",
    objects: 3,
  },
]) {
  test(`${room.name} is an illustrated living room with working objects`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.getByRole("button", { name: "Map", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(room.name) })
      .click();
    await expect(page.locator(".world-location h2")).toHaveText(room.name);
    await expect(page.locator(".camera-viewport .room-scenery")).toHaveCount(1);
    await expect(page.locator(".room-object")).toHaveCount(room.objects);
    const object = page.locator(`.object-${room.kind}`);
    await expect(object).toHaveAttribute("data-object-state", "0");
    await tapRoomPath(page, room.action, true);
    await expect(object).toHaveAttribute("data-object-state", "1");
    await expect(object).toHaveAttribute("aria-pressed", "true");
    await tapRoomPath(page, room.action, true);
    await expect(object).toHaveAttribute("data-object-state", "2");
    await expect(object).toBeInViewport();
    await object.click();
    await expect(object).toHaveAttribute("data-object-state", "3");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(
      await page
        .locator(".room-object [class]")
        .evaluateAll((nodes) =>
          nodes.every(
            (node) => getComputedStyle(node).animationName === "none",
          ),
        ),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${room.kind}.png`) });
    const exit = "exit" in room ? room.exit : "Savanna Square";
    await tapRoomPath(page, exit, true);
    await expect(page.locator(".world-location h2")).toHaveText(exit);
    expect(errors).toEqual([]);
  });
}

test("greetings and room reactions are read aloud for children who cannot read yet", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    Object.assign(window, { spoken });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel() {},
        speak(utterance: SpeechSynthesisUtterance) {
          spoken.push(utterance.text);
        },
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Say hello to Milo" }).click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "spoken").length))
    .toBe(1);
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Sunset Beach/ })
    .click();
  await tapRoomPath(page, "Build a sandcastle", true);
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "spoken")))
    .toContain("Pat pat pat! A tall castle with a flag.");
});
