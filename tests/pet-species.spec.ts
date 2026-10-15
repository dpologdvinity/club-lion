import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SAVE_KEY } from "../src/game";

const SPECIES = [
  "Lion cub",
  "Bunny",
  "Puppy",
  "Kitten",
  "Duckling",
  "Panda",
  "Unicorn",
  "Dragon",
];

async function openPicker(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Pet Paradise Nursery/ })
    .click();
  await page
    .locator(".room-hotspot")
    .filter({ hasText: "Pick your pet" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Pick your pet" });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function savedPet(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).pet,
    SAVE_KEY,
  );
}

test("pick your pet: every species is a big tile, the choice sticks, and the pet follows the avatar", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const dialog = await openPicker(page);

  for (const name of SPECIES) {
    const tile = dialog.getByRole("button", { name, exact: true });
    await expect(tile).toBeVisible();
    const box = await tile.boundingBox();
    expect(box && box.width >= 88 && box.height >= 88, name).toBe(true);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  await dialog.getByRole("button", { name: "Dragon", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Dragon", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect((await savedPet(page)).species).toBe("dragon");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  const companion = page.locator(
    '.avatar-with-companion [data-species="dragon"]',
  );
  await expect(companion).toBeVisible();

  await page.reload();
  await expect(
    page.locator('.avatar-with-companion [data-species="dragon"]'),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("each species can be chosen and keeps its own care reaction", async ({
  page,
}) => {
  const dialog = await openPicker(page);
  for (const [name, species, petName] of [
    ["Bunny", "bunny", "Hop"],
    ["Puppy", "puppy", "Biscuit"],
    ["Panda", "panda", "Bamboo"],
  ] as const) {
    await dialog.getByRole("button", { name, exact: true }).click();
    await expect(
      dialog.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    const pet = await savedPet(page);
    expect(pet.species).toBe(species);
    expect(pet.name).toBe(petName);
  }
  await page.keyboard.press("Escape");

  await page
    .locator(".room-navigation")
    .getByRole("button", { name: "Grooming Spa", exact: true })
    .click();
  const care = page.getByRole("dialog", { name: "Pet Paradise Nursery" });
  await expect(
    care.locator(".pet-species-art.pet-species-panda"),
  ).toBeVisible();
  await expect(care.locator(".pet-caption")).toContainText("Bamboo");
  await care.getByRole("button", { name: "Wash", exact: true }).click();
  await expect(care.locator(".effect-particles .particle").first()).toHaveText(
    "💧",
  );
  await care.getByRole("button", { name: "Treat", exact: true }).click();
  await expect(care.locator(".effect-particles .particle").first()).toHaveText(
    "🎋",
  );
});

test("an unknown saved species falls back to the lion cub", async ({
  page,
}) => {
  const dialog = await openPicker(page);
  await dialog.getByRole("button", { name: "Unicorn", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key)!);
    save.pet = { ...save.pet, species: "wizard" };
    localStorage.setItem(key, JSON.stringify(save));
  }, SAVE_KEY);
  await page.reload();
  await expect(
    page.locator('.avatar-with-companion [data-species="lion"]'),
  ).toBeVisible();
});
