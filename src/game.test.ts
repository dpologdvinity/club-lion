import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newPlayer,
  restorePlayer,
  buyItem,
  visitPlace,
  meetLion,
  claimReward,
  completeGame,
  completePawSteps,
  completeFruitCatch,
  SHOP_ITEMS,
} from "./game.ts";

test("a corrupt save safely starts a fresh adventure", () => {
  assert.deepEqual(restorePlayer("broken json"), newPlayer());
  assert.deepEqual(
    restorePlayer('{"coins":-900,"owned":["admin"]}'),
    newPlayer(),
  );
});

test("purchases deduct the price once and never allow a negative balance", () => {
  const item = SHOP_ITEMS.find((item) => item.id === "hat")!;
  const bought = buyItem(newPlayer(), item.id);
  assert.equal(bought.coins, newPlayer().coins - item.price);
  assert.ok(bought.owned.includes(item.id));
  assert.deepEqual(buyItem(bought, item.id), bought);
  assert.deepEqual(buyItem({ ...newPlayer(), coins: 0 }, item.id), {
    ...newPlayer(),
    coins: 0,
  });
  assert.deepEqual(buyItem(newPlayer(), "unknown"), newPlayer());
});

test("greetings count distinct neighbors, and adventures can be rewarded only once", () => {
  let player = newPlayer();
  assert.deepEqual(claimReward(player, "neighbors"), player);
  player = meetLion(player, "milo");
  player = meetLion(player, "milo");
  assert.equal(player.met.length, 1);
  player = meetLion(meetLion(player, "cleo"), "pip");
  const rewarded = claimReward(player, "neighbors");
  assert.equal(rewarded.coins, player.coins + 50);
  assert.deepEqual(claimReward(rewarded, "neighbors"), rewarded);
});

test("visiting home and finishing a game unlock their own adventures", () => {
  const visited = visitPlace(newPlayer(), "den");
  assert.ok(visited.visited.includes("den"));
  assert.equal(claimReward(visited, "home").coins, visited.coins + 50);
  const played = completeGame(newPlayer(), 6);
  assert.equal(played.gamesPlayed, 1);
  assert.equal(played.coins, newPlayer().coins + 60);
  assert.equal(claimReward(played, "game").coins, played.coins + 50);
});

test("save round trips preserve valid progress and reject invalid character choices", () => {
  const player = { ...newPlayer(), name: "Roary", color: "rose" as const };
  assert.deepEqual(restorePlayer(JSON.stringify(player)), player);
  assert.equal(
    restorePlayer(JSON.stringify({ ...player, color: "invisible" })).color,
    "gold",
  );
});

test("Paw Steps pays ten coins per finished round and counts one game", () => {
  const played = completePawSteps(newPlayer(), 5);
  assert.equal(played.coins, newPlayer().coins + 50);
  assert.equal(played.gamesPlayed, 1);
  assert.equal(played.pawStepsBest, 5);
});

test("Paw Steps keeps the highest round count across games", () => {
  const best = completePawSteps(completePawSteps(newPlayer(), 7), 3);
  assert.equal(best.pawStepsBest, 7);
  assert.equal(best.gamesPlayed, 2);
  assert.equal(best.coins, newPlayer().coins + 100);
});

test("Paw Steps rejects scores no round could produce", () => {
  const player = newPlayer();
  assert.deepEqual(completePawSteps(player, -1), player);
  assert.deepEqual(completePawSteps(player, 2.5), player);
  assert.deepEqual(completePawSteps(player, 10_000), player);
  assert.deepEqual(completePawSteps(player, Number.NaN), player);
});

test("a save without a Paw Steps record starts at zero and rejects nonsense", () => {
  const legacySave = {
    ...newPlayer(),
    name: "Roary",
    coins: 430,
    owned: ["scarf", "hat"],
    accessory: "hat",
  };
  Reflect.deleteProperty(legacySave, "pawStepsBest");
  const restoredLegacy = restorePlayer(JSON.stringify(legacySave));
  assert.deepEqual(restoredLegacy, { ...legacySave, pawStepsBest: 0 });
  assert.equal(
    restorePlayer(JSON.stringify({ ...newPlayer(), pawStepsBest: 4 }))
      .pawStepsBest,
    4,
  );
  assert.deepEqual(
    restorePlayer(JSON.stringify({ ...newPlayer(), pawStepsBest: -3 })),
    newPlayer(),
  );
  assert.deepEqual(
    restorePlayer(JSON.stringify({ ...newPlayer(), pawStepsBest: "many" })),
    newPlayer(),
  );
});

test("saves preserve Fruit Catch and Paw Steps records across either migration", () => {
  const fruitSave = { ...newPlayer(), coins: 430, fruitCatchBest: 80 };
  Reflect.deleteProperty(fruitSave, "pawStepsBest");
  assert.deepEqual(restorePlayer(JSON.stringify(fruitSave)), {
    ...fruitSave,
    pawStepsBest: 0,
  });

  const pawSave = { ...newPlayer(), pawStepsBest: 3 };
  Reflect.deleteProperty(pawSave, "fruitCatchBest");
  assert.deepEqual(restorePlayer(JSON.stringify(pawSave)), {
    ...pawSave,
    fruitCatchBest: 0,
  });
});

test("Fruit Catch awards caught fruit, tracks a best score, and restores older saves", () => {
  const first = completeFruitCatch(newPlayer(), 8, 2, 80);
  assert.equal(first.coins, 266);
  assert.equal(first.gamesPlayed, 1);
  assert.equal(first.fruitCatchBest, 80);
  assert.deepEqual(completeFruitCatch(first, 2, 0, 20), {
    ...first,
    coins: 270,
    gamesPlayed: 2,
  });
  assert.deepEqual(completeFruitCatch(first, 4, 0, 99), first);
  const { fruitCatchBest: _, ...olderSave } = newPlayer();
  assert.equal(restorePlayer(JSON.stringify(olderSave)).fruitCatchBest, 0);
});
