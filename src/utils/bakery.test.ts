import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_CAKE_PHOTOS,
  MAX_TOPPINGS,
  addTopping,
  autoSpot,
  newCake,
  orderAsCake,
  pickOrder,
  restoreCakePhoto,
  restoreCakePhotos,
  scoreCake,
  type CakeOrder,
} from "./bakery.ts";

const order: CakeOrder = {
  shape: "heart",
  sponge: "chocolate",
  frosting: "pink",
  toppings: { cherry: 1, candle: 3 },
};

test("a cake matching the picture order earns three stars", () => {
  assert.deepEqual(scoreCake(order, orderAsCake(order)), {
    stars: 3,
    coins: 24,
  });
});

test("topping order and position never matter, only the counts", () => {
  const cake = orderAsCake(order);
  const shuffled = {
    ...cake,
    toppings: [...cake.toppings].reverse().map((t) => ({ ...t, x: 5, y: 5 })),
  };
  assert.equal(scoreCake(order, shuffled).stars, 3);
});

test("near misses earn two stars and anything served earns at least one", () => {
  const cake = orderAsCake(order);
  assert.equal(scoreCake(order, { ...cake, frosting: "mint" }).stars, 2);
  const missingCandle = { ...cake, toppings: cake.toppings.slice(0, 3) };
  assert.equal(scoreCake(order, missingCandle).stars, 2);
  assert.deepEqual(scoreCake(order, newCake()), { stars: 1, coins: 8 });
});

test("piling on extra toppings costs stars", () => {
  let cake = orderAsCake(order);
  for (let i = 0; i < 2; i++)
    cake = addTopping(cake, { kind: "gummy", x: 50, y: 40 });
  assert.equal(scoreCake(order, cake).stars, 2);
});

test("cakes keep at most the newest toppings", () => {
  let cake = newCake();
  for (let i = 0; i < MAX_TOPPINGS + 5; i++)
    cake = addTopping(cake, { kind: "sprinkles", ...autoSpot(i) });
  assert.equal(cake.toppings.length, MAX_TOPPINGS);
});

test("auto spots stay on the stage", () => {
  for (let i = 0; i < 60; i++) {
    const { x, y } = autoSpot(i);
    assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100, `${i}: ${x},${y}`);
  }
});

test("random orders ask for two or three topping kinds and one lion at most", () => {
  for (const seed of [0, 0.2, 0.5, 0.8, 0.999]) {
    const picked = pickOrder(() => seed);
    const kinds = Object.keys(picked.toppings);
    assert.ok(kinds.length >= 2 && kinds.length <= 3);
    assert.ok((picked.toppings.lion ?? 0) <= 1);
    assert.equal(scoreCake(picked, orderAsCake(picked)).stars, 3);
  }
});

test("saved cake photos are validated and capped", () => {
  const good = orderAsCake(order);
  assert.deepEqual(restoreCakePhoto(JSON.parse(JSON.stringify(good))), good);
  assert.equal(restoreCakePhoto({ ...good, shape: "cube" }), null);
  assert.equal(
    restoreCakePhoto({ ...good, toppings: [{ kind: "cherry", x: 500, y: 2 }] }),
    null,
  );
  assert.equal(restoreCakePhoto("cake"), null);
  const many = Array.from({ length: 9 }, () => good);
  assert.equal(restoreCakePhotos(many).length, MAX_CAKE_PHOTOS);
  assert.deepEqual(restoreCakePhotos([good, null, { shape: "round" }]), [good]);
  assert.deepEqual(restoreCakePhotos(undefined), []);
});
