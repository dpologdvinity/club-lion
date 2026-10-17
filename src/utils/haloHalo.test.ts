import test from "node:test";
import assert from "node:assert/strict";
import {
  HALO_INGREDIENTS,
  HALO_ORDERS,
  MAX_LAYERS,
  isHaloLayers,
  pickHaloOrder,
  scoreHaloHalo,
} from "./haloHalo.ts";

test("every order is a buildable stack of known ingredients", () => {
  assert.ok(HALO_ORDERS.length >= 4);
  for (const order of HALO_ORDERS) {
    assert.ok(order.layers.length >= 3 && order.layers.length <= MAX_LAYERS);
    assert.ok(isHaloLayers(order.layers), order.name);
  }
  assert.equal(new Set(HALO_INGREDIENTS.map((i) => i.id)).size, 6);
});

test("an exact copy earns three stars", () => {
  const order = HALO_ORDERS[0];
  assert.equal(scoreHaloHalo(order, [...order.layers]), 3);
});

test("the right treats in another order earn two stars", () => {
  const order = HALO_ORDERS[0];
  const shuffled = [...order.layers].reverse();
  assert.notDeepEqual(shuffled, order.layers);
  assert.equal(scoreHaloHalo(order, shuffled), 2);
});

test("any finished cup earns at least one star, and free play is always three", () => {
  const order = HALO_ORDERS[0];
  assert.equal(scoreHaloHalo(order, ["ice"]), 1);
  assert.equal(scoreHaloHalo(null, ["ube", "flan"]), 3);
});

test("cups must hold one to six known layers", () => {
  assert.equal(isHaloLayers([]), false);
  assert.equal(isHaloLayers(["ice", "rocks"]), false);
  assert.equal(isHaloLayers(Array(7).fill("ice")), false);
  assert.equal(isHaloLayers("ice"), false);
  assert.equal(isHaloLayers(["ice", "ube"]), true);
});

test("a new order is never the same one twice in a row", () => {
  for (const order of HALO_ORDERS)
    for (const roll of [0, 0.4, 0.99])
      assert.notEqual(pickHaloOrder(order.id, () => roll).id, order.id);
});
