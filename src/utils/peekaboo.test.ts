import test from "node:test";
import assert from "node:assert/strict";
import {
  PEEKABOO_ANIMALS,
  PEEKABOO_ROUNDS,
  PEEKABOO_SPOTS,
  makePeekabooRound,
  peekMsFor,
} from "./peekaboo.ts";

const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test("a round hides different animals in every bush and picks one to find", () => {
  for (let round = 0; round < 5; round++) {
    const made = makePeekabooRound(seq([0.1, 0.7, 0.3, 0.9, 0.5]));
    assert.equal(made.spots.length, PEEKABOO_SPOTS);
    assert.equal(new Set(made.spots).size, PEEKABOO_SPOTS);
    for (const id of made.spots)
      assert.ok(PEEKABOO_ANIMALS.some((animal) => animal.id === id));
    assert.ok(made.target >= 0 && made.target < PEEKABOO_SPOTS);
  }
});

test("peeks get quicker each round but never too quick to see", () => {
  assert.ok(peekMsFor(0) > peekMsFor(4));
  assert.ok(peekMsFor(PEEKABOO_ROUNDS - 1) >= 350);
  assert.ok(peekMsFor(0) <= 1000);
});
