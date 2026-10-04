import test from "node:test";
import assert from "node:assert/strict";
import {
  FASHION_THEMES,
  getItemStyleTags,
  scoreOutfit,
  type FashionTheme,
} from "./fashionScoring.ts";

test("fashion themes defines 4 distinct runway challenges", () => {
  const themes = Object.keys(FASHION_THEMES);
  assert.equal(themes.length, 4);
  assert.ok(themes.includes("savanna_chic"));
  assert.ok(themes.includes("y2k_retro"));
  assert.ok(themes.includes("neon_nightlife"));
  assert.ok(themes.includes("beach_resort"));

  for (const theme of Object.values(FASHION_THEMES)) {
    assert.ok(theme.name.length > 0);
    assert.ok(theme.description.length > 0);
    assert.ok(theme.preferredTags.length >= 2);
  }
});

test("getItemStyleTags returns appropriate style tags", () => {
  assert.deepEqual(getItemStyleTags("wreath-gold"), ["savanna", "formal"]);
  assert.deepEqual(getItemStyleTags("visor-neon"), ["retro", "neon"]);
  assert.deepEqual(getItemStyleTags("hat-pirate"), ["beach", "retro"]);
  assert.deepEqual(getItemStyleTags("unknown-item"), ["casual"]);
});

test("scoreOutfit awards 3 stars and 60 coins for perfect theme matches", () => {
  const result = scoreOutfit("savanna_chic", [
    "wreath-gold",
    "tunic-savanna",
    "crown-lion",
  ]);

  assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
  assert.equal(result.stars, 3);
  assert.equal(result.coins, 60);
  assert.match(result.feedback, /Magnificent/i);
});

test("scoreOutfit handles partially matching outfits with 2 stars", () => {
  const result = scoreOutfit("y2k_retro", [
    "visor-neon",
    "apron-barista", // non-theme accessory
  ]);

  assert.ok(result.score >= 50 && result.score < 80);
  assert.equal(result.stars, 2);
  assert.equal(result.coins, 25);
});

test("scoreOutfit handles empty or mismatched outfits gracefully", () => {
  const emptyResult = scoreOutfit("neon_nightlife", []);
  assert.equal(emptyResult.score, 10);
  assert.equal(emptyResult.stars, 1);
  assert.equal(emptyResult.coins, 5);

  const mismatchedResult = scoreOutfit("savanna_chic", ["visor-neon"]);
  assert.equal(mismatchedResult.stars, 1);
  assert.equal(mismatchedResult.coins, 10);
});

test("scoreOutfit handles unknown themes without crashing", () => {
  const result = scoreOutfit("unknown_theme" as FashionTheme, ["wreath-gold"]);
  assert.equal(result.score, 0);
  assert.equal(result.stars, 1);
});
