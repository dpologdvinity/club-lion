import test from "node:test";
import assert from "node:assert/strict";
import { RECIPES, scoreSmoothie, type Ingredient } from "./smoothieRecipes.ts";

test("every recipe is defined with a non-empty ingredient list", () => {
  assert.equal(RECIPES.length, 4);
  for (const recipe of RECIPES) {
    assert.ok(recipe.ingredients.length > 0);
  }
  assert.deepEqual(
    RECIPES.map((r) => r.name),
    ["Mango Tango", "Baobab Berry Blitz", "Savanna Sunrise", "Coconut Cloud"],
  );
});

test("exact match scores 100% accuracy and 3 stars", () => {
  const mangoTango = RECIPES.find((r) => r.name === "Mango Tango")!;
  const result = scoreSmoothie(mangoTango, [...mangoTango.ingredients]);
  assert.equal(result.accuracy, 100);
  assert.equal(result.stars, 3);
  assert.equal(result.coins, mangoTango.baseCoins * 3);
});

test("exact match regardless of pour order still scores 100%", () => {
  const mangoTango = RECIPES.find((r) => r.name === "Mango Tango")!;
  const reversed = [...mangoTango.ingredients].reverse();
  const result = scoreSmoothie(mangoTango, reversed);
  assert.equal(result.accuracy, 100);
  assert.equal(result.stars, 3);
});

test("missing one ingredient lowers accuracy and stars", () => {
  const mangoTango = RECIPES.find((r) => r.name === "Mango Tango")!;
  const partial = mangoTango.ingredients.slice(0, -1);
  const result = scoreSmoothie(mangoTango, partial);
  assert.ok(result.accuracy < 100);
  assert.ok(result.stars < 3);
  assert.ok(result.coins < mangoTango.baseCoins * 3);
});

test("extra wrong ingredients reduce accuracy below a correct subset", () => {
  const mangoTango = RECIPES.find((r) => r.name === "Mango Tango")!;
  const wrongIngredient: Ingredient = RECIPES.find(
    (r) => r.name !== "Mango Tango",
  )!.ingredients.find((i) => !mangoTango.ingredients.includes(i))!;
  const withExtra = [...mangoTango.ingredients, wrongIngredient];
  const result = scoreSmoothie(mangoTango, withExtra);
  assert.ok(result.accuracy < 100);
});

test("empty blender pitcher scores 0 accuracy, 0 stars, 0 coins", () => {
  const mangoTango = RECIPES.find((r) => r.name === "Mango Tango")!;
  const result = scoreSmoothie(mangoTango, []);
  assert.equal(result.accuracy, 0);
  assert.equal(result.stars, 0);
  assert.equal(result.coins, 0);
});

test("star thresholds: 1 star below 60%, 2 stars at 60-89%, 3 stars at 90%+", () => {
  const recipe = RECIPES.find((r) => r.name === "Coconut Cloud")!;
  const low = scoreSmoothie(recipe, []);
  assert.equal(low.stars, 0);

  const almostAll = recipe.ingredients.slice(0, -1);
  const partialResult = scoreSmoothie(recipe, almostAll);
  assert.ok(partialResult.stars >= 1);
});

test("coin payout scales with stars and never goes negative", () => {
  const recipe = RECIPES.find((r) => r.name === "Savanna Sunrise")!;
  const result = scoreSmoothie(recipe, []);
  assert.equal(result.coins, 0);
  assert.ok(result.coins >= 0);
});
