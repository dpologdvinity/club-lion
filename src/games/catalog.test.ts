import { test } from "node:test";
import assert from "node:assert/strict";
import { migratePlayerSave, newPlayer } from "../game.ts";
import { ROOM_MANIFESTS } from "../rooms/registry.ts";
import { gameCards } from "./catalog.ts";

test("arcade metadata preserves card order and reads current save progress", () => {
  const player = migratePlayerSave(newPlayer());
  const cards = gameCards(player);
  assert.deepEqual(
    cards.map((card) => card.id),
    [
      "mango-run",
      "bubble-pop",
      "coloring-book",
      "bakery",
      "halo-halo",
      "fireflies",
      "peekaboo",
      "dress-pet",
      "seek",
      "animal-band",
      "shape-sorter",
      "picture-puzzle",
      "balloon-parade",
      "dj-beat-drop",
      "smoothie",
      "coaster",
      "fishing",
      "runway",
      "instrument",
    ],
  );
  assert.ok(cards.every((card) => card.best === 0));
  const progressed = gameCards({
    ...player,
    cakesServed: 3,
    picturePuzzles: 2,
  });
  assert.equal(progressed.find((card) => card.id === "bakery")?.best, 3);
  assert.equal(
    progressed.find((card) => card.id === "bakery")?.progressLabel,
    "Orders served",
  );
  assert.equal(
    progressed.find((card) => card.id === "picture-puzzle")?.best,
    2,
  );
  assert.equal(
    progressed.find((card) => card.id === "picture-puzzle")?.progressLabel,
    "Pictures finished",
  );
  const served = gameCards({ ...player, haloHaloServed: 4 });
  assert.equal(served.find((card) => card.id === "halo-halo")?.best, 4);
  assert.ok(
    cards.every((card) => card.best === 0),
    "previous card values are unchanged",
  );
});

test("room manifests own picture labels and preserve every arcade launch", () => {
  const interactives = Object.values(ROOM_MANIFESTS).flatMap(
    (room) => room?.interactives ?? [],
  );
  for (const item of interactives) {
    assert.ok(item.label?.trim(), `${item.id} needs a label`);
    assert.ok(item.icon?.trim(), `${item.id} needs a picture`);
  }
  const launches = Object.fromEntries(
    interactives
      .filter((item) => item.actionData.gameId)
      .map((item) => [item.id, item.actionData.gameId]),
  );
  assert.deepEqual(launches, {
    "arcade-bee": "bee",
    "arcade-fruit": "fruit",
    "arcade-mango-run": "mango-run",
    "arcade-bubble-pop": "bubble-pop",
    "arcade-coloring-book": "coloring-book",
    "arcade-bakery": "bakery",
    "arcade-halo-halo": "halo-halo",
    "arcade-seek": "seek",
    "arcade-animal-band": "animal-band",
    "arcade-shape-sorter": "shape-sorter",
    "arcade-picture-puzzle": "picture-puzzle",
    "arcade-balloon-parade": "balloon-parade",
    "arcade-dj-beat-drop": "dj-beat-drop",
    "arcade-smoothie": "smoothie",
    "arcade-coaster": "coaster",
    "arcade-fishing": "fishing",
    "arcade-runway": "runway",
    "arcade-instrument": "instrument",
    "arcade-sled-run": "sled-run",
    "arcade-memory": "memory",
    "arcade-paw": "paw",
    "cafe-cake": "bakery",
    "cafe-smoothies": "smoothie",
    "lagoon-bubbles": "bubble-pop",
    "sled-run-gate": "sled-run",
    "coaster-ticket-gate": "coaster",
    "club-pulse-dj-booth": "dj-beat-drop",
    "midway-game-booth": "fruit",
    "cafe-bakery-window": "bakery",
    "plaza-bubble-cart": "bubble-pop",
    "plaza-coloring-easel": "coloring-book",
    "beach-seek-lookout": "seek",
    "pet-animal-band": "animal-band",
    "plaza-shape-sorter": "shape-sorter",
    "plaza-picture-puzzle": "picture-puzzle",
    "midway-balloon-parade": "balloon-parade",
    "kainan-halo-halo": "halo-halo",
    "arcade-fireflies": "fireflies",
    "water-fireflies": "fireflies",
    "arcade-peekaboo": "peekaboo",
    "pet-peekaboo": "peekaboo",
    "arcade-dress-pet": "dress-pet",
    "pet-dress-up": "dress-pet",
  });
});
