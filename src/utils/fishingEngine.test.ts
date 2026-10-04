import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FISH_SPECIES,
  getRandomCatch,
  isWithinBiteWindow,
  updateReelTension,
} from "./fishingEngine.ts";

test("fish species table has at least 7 catches with valid weight ranges", () => {
  assert.ok(FISH_SPECIES.length >= 7);
  for (const species of FISH_SPECIES) {
    assert.ok(species.minWeight > 0);
    assert.ok(species.maxWeight >= species.minWeight);
    assert.ok(species.coins > 0);
    assert.ok(["common", "uncommon", "rare", "epic"].includes(species.rarity));
  }
  const ids = FISH_SPECIES.map((s) => s.id);
  assert.deepEqual(
    [...new Set(ids)].sort(),
    [
      "baobab_perch",
      "golden_catfish",
      "old_boot",
      "river_minnow",
      "savanna_eel",
      "spotted_catfish",
      "striped_tilapia",
    ].sort(),
  );
});

test("expected catches match the design spec", () => {
  const byId = (id: string) => FISH_SPECIES.find((s) => s.id === id)!;
  assert.deepEqual(byId("river_minnow").rarity, "common");
  assert.equal(byId("river_minnow").coins, 3);
  assert.equal(byId("striped_tilapia").coins, 5);
  assert.equal(byId("old_boot").coins, 1);
  assert.equal(byId("old_boot").rarity, "common");
  assert.equal(byId("baobab_perch").rarity, "uncommon");
  assert.equal(byId("spotted_catfish").rarity, "uncommon");
  assert.equal(byId("golden_catfish").rarity, "rare");
  assert.equal(byId("golden_catfish").coins, 50);
  assert.equal(byId("savanna_eel").rarity, "epic");
  assert.equal(byId("savanna_eel").coins, 80);
});

test("getRandomCatch returns a valid species with weight in range and matching coins", () => {
  for (let seed = 0; seed < 50; seed += 1) {
    const result = getRandomCatch(seed);
    const species = FISH_SPECIES.find((s) => s.id === result.species.id);
    assert.ok(species, `unknown species for seed ${seed}`);
    assert.ok(result.weight >= species!.minWeight);
    assert.ok(result.weight <= species!.maxWeight);
    assert.equal(result.coins, species!.coins);
    // Rounded to 1 decimal place.
    assert.equal(Math.round(result.weight * 10) / 10, result.weight);
  }
});

test("getRandomCatch is deterministic for a given seed", () => {
  const a = getRandomCatch(42);
  const b = getRandomCatch(42);
  assert.deepEqual(a, b);
});

test("getRandomCatch without a seed still returns a valid catch", () => {
  const result = getRandomCatch();
  assert.ok(FISH_SPECIES.some((s) => s.id === result.species.id));
});

test("isWithinBiteWindow tests reaction time against the default 1000ms window", () => {
  assert.equal(isWithinBiteWindow(500, 0), true);
  assert.equal(isWithinBiteWindow(1000, 0), true);
  assert.equal(isWithinBiteWindow(1001, 0), false);
  assert.equal(isWithinBiteWindow(1500, 500), true);
  assert.equal(isWithinBiteWindow(1501, 500), false);
});

test("isWithinBiteWindow respects a custom window duration", () => {
  assert.equal(isWithinBiteWindow(300, 0, 250), false);
  assert.equal(isWithinBiteWindow(250, 0, 250), true);
});

test("isWithinBiteWindow rejects reaction times before the bite started", () => {
  assert.equal(isWithinBiteWindow(100, 500), false);
});

test("updateReelTension clamps between 0 and 100", () => {
  assert.equal(updateReelTension(0, false, 1000, 50), 0);
  assert.equal(updateReelTension(100, true, 1000, 0), 100);
});

test("reeling increases tension and fish pull decreases it", () => {
  const reeled = updateReelTension(50, true, 100, 0);
  assert.ok(reeled > 50);
  const pulled = updateReelTension(50, false, 100, 50);
  assert.ok(pulled < 50);
});

test("reeling against fish pull nets the difference", () => {
  const withPull = updateReelTension(50, true, 100, 20);
  const withoutPull = updateReelTension(50, true, 100, 0);
  assert.ok(withPull < withoutPull);
});
