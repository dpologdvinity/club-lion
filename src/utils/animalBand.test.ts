import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANIMALS,
  BURST_EVERY,
  SONG_MAX_TAPS,
  addToSong,
  isBurstTap,
  type AnimalId,
} from "./animalBand.ts";

test("six distinct animals make up the orchestra", () => {
  assert.equal(ANIMALS.length, 6);
  assert.equal(new Set(ANIMALS.map((animal) => animal.id)).size, 6);
});

test("a song grows one tap at a time and stops at the cap", () => {
  let song: AnimalId[] = [];
  for (let tap = 0; tap < SONG_MAX_TAPS + 3; tap++)
    song = addToSong(song, "zebra");
  assert.equal(song.length, SONG_MAX_TAPS);
  assert.deepEqual(addToSong(["lion"], "parrot"), ["lion", "parrot"]);
});

test("adding a tap never changes the song it was given", () => {
  const song: AnimalId[] = ["hippo"];
  const next = addToSong(song, "monkey");
  assert.deepEqual(song, ["hippo"]);
  assert.notEqual(next, song);
});

test("every fifth tap bursts and no other tap does", () => {
  const bursts = Array.from({ length: 20 }, (_, index) =>
    isBurstTap(index + 1),
  );
  assert.equal(BURST_EVERY, 5);
  assert.deepEqual(
    bursts.flatMap((burst, index) => (burst ? [index + 1] : [])),
    [5, 10, 15, 20],
  );
  assert.equal(isBurstTap(0), false);
});
