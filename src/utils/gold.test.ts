import test from "node:test";
import assert from "node:assert/strict";
import {
  STARTING_GOLD,
  buyPixel,
  giftPixel,
  goldOf,
  isPixelOwnedId,
  ownsPixel,
  payGold,
  pixelPrice,
  restoreGold,
} from "./gold.ts";

const base: {
  owned: string[];
  gamesPlayed: number;
  stamps: string[];
  gold?: number;
} = { owned: [], gamesPlayed: 0, stamps: [] };

test("basics are free, the rest has a price", () => {
  assert.equal(pixelPrice("dress", "spring_sprite"), 0);
  assert.ok(pixelPrice("costume", "teddy_bear") > 0);
  assert.equal(pixelPrice("dress", "nope"), -1);
  assert.ok(ownsPixel(base, "hair", "kit_01"));
  assert.ok(!ownsPixel(base, "costume", "teddy_bear"));
});

test("buying spends gold once and only with enough gold", () => {
  assert.equal(goldOf(base), STARTING_GOLD);
  const bought = buyPixel(base, "costume", "teddy_bear");
  assert.ok(ownsPixel(bought, "costume", "teddy_bear"));
  assert.equal(goldOf(bought), STARTING_GOLD - 120);
  assert.equal(buyPixel(bought, "costume", "teddy_bear"), bought);
  const broke = { ...base, gold: 10 };
  assert.equal(buyPixel(broke, "costume", "teddy_bear"), broke);
  assert.equal(buyPixel(base, "dress", "spring_sprite"), base, "free: no-op");
  assert.ok(isPixelOwnedId("px:costume:teddy_bear"));
  assert.ok(!isPixelOwnedId("px:costume:nope"));
  assert.ok(!isPixelOwnedId("teddy_bear"));
});

test("games and stamps pay gold; gifts are free", () => {
  const next = { ...base, gamesPlayed: 2, stamps: ["a"] };
  assert.equal(goldOf(payGold(base, next)), STARTING_GOLD + 2 * 10 + 25);
  assert.equal(payGold(base, base), base);
  const gift = giftPixel(base, "costume", "ufo");
  assert.ok(ownsPixel(gift, "costume", "ufo"));
  assert.equal(goldOf(gift), STARTING_GOLD);
});

test("saved gold restores only sane numbers", () => {
  assert.equal(restoreGold(55), 55);
  for (const bad of [-1, 1.5, "9", Number.NaN, 10_000_000, undefined])
    assert.equal(restoreGold(bad), undefined);
});
