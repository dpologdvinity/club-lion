import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SHAPES,
  SHAPE_SORTER_ROUNDS,
  SORTER_ROUNDS,
  isMatch,
  shuffled,
} from "./shapeSorter.ts";

test("each round pairs five different animals with the five shapes once each", () => {
  assert.equal(SHAPE_SORTER_ROUNDS, 3);
  for (const round of SORTER_ROUNDS) {
    assert.equal(round.length, SHAPES.length);
    assert.equal(new Set(round.map((pair) => pair.animal)).size, round.length);
    assert.deepEqual(
      [...round.map((pair) => pair.shape)].sort(),
      [...SHAPES].sort(),
    );
  }
});

test("rounds use new animal and shape pairings", () => {
  const pairings = SORTER_ROUNDS.map((round) =>
    round.map((pair) => `${pair.animal}:${pair.shape}`).join(","),
  );
  assert.equal(new Set(pairings).size, SORTER_ROUNDS.length);
});

test("a shape only fits its own animal in that round", () => {
  const [first] = SORTER_ROUNDS;
  assert.equal(isMatch(first, "lion", "circle"), true);
  assert.equal(isMatch(first, "lion", "square"), false);
  assert.equal(isMatch(first, "frog", "circle"), false);
});

test("shuffling keeps every piece and does not change the input", () => {
  const items = ["circle", "square", "star"];
  const mixed = shuffled(items, () => 0.99);
  assert.deepEqual([...mixed].sort(), [...items].sort());
  assert.deepEqual(items, ["circle", "square", "star"]);
  assert.deepEqual(
    shuffled(items, () => 0),
    ["square", "star", "circle"],
  );
});
