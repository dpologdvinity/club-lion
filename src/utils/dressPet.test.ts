import test from "node:test";
import assert from "node:assert/strict";
import {
  PET_ITEMS,
  PET_THEMES,
  isPetOutfit,
  pickTheme,
  scoreOutfit,
} from "./dressPet.ts";

test("every theme can be dressed for perfectly, one item per slot", () => {
  for (const theme of PET_THEMES) {
    for (const slot of ["hat", "eyes", "neck", "extra"] as const)
      assert.ok(
        PET_ITEMS.some(
          (item) =>
            item.slot === slot && item.themes.some((t) => t === theme.id),
        ),
        `${theme.id} ${slot}`,
      );
  }
});

test("matching items earn stars; any outfit gets at least one", () => {
  assert.equal(scoreOutfit("beach", { hat: "sunhat" }), 1);
  assert.equal(scoreOutfit("beach", { hat: "crown" }), 1);
  assert.equal(scoreOutfit("beach", { hat: "sunhat", eyes: "shades" }), 2);
  assert.equal(
    scoreOutfit("beach", {
      hat: "sunhat",
      eyes: "shades",
      neck: "lei",
      extra: "beachball",
    }),
    3,
  );
});

test("only real items in their own slot make an outfit", () => {
  assert.equal(isPetOutfit({ hat: "crown" }), true);
  assert.equal(isPetOutfit({}), false);
  assert.equal(isPetOutfit({ hat: "shades" }), false);
  assert.equal(isPetOutfit({ hat: "laser" }), false);
  assert.equal(isPetOutfit({ cape: "crown" }), false);
  assert.equal(isPetOutfit(null), false);
  assert.equal(isPetOutfit("crown"), false);
});

test("the next theme is never the same as the last", () => {
  for (const theme of PET_THEMES)
    assert.notEqual(pickTheme(theme.id, () => 0).id, theme.id);
});
