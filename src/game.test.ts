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
  completeBeeStop,
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

test("finishing Bee Stop pays its score band once and keeps the best result", () => {
  const start = newPlayer();
  const sloppy = completeBeeStop(start, 460);
  assert.equal(sloppy.coins, start.coins + 60);
  assert.equal(sloppy.gamesPlayed, 1);
  assert.equal(sloppy.beeStopBest, 460);
  const perfect = completeBeeStop(sloppy, 1000);
  assert.equal(perfect.coins, sloppy.coins + 120);
  assert.equal(perfect.gamesPlayed, 2);
  assert.equal(perfect.beeStopBest, 1000);
  const worse = completeBeeStop(perfect, 120);
  assert.equal(worse.beeStopBest, 1000);
  assert.equal(worse.coins, perfect.coins + 15);
});

test("Bee Stop rejects impossible scores instead of paying out", () => {
  const start = newPlayer();
  for (const score of [-1, 1001, 12.5, Number.NaN, Number.POSITIVE_INFINITY])
    assert.deepEqual(completeBeeStop(start, score), start);
});

test("a save from before Bee Stop existed keeps its progress and reports no best score", () => {
  const { beeStopBest: _omitted, ...legacy } = newPlayer();
  const restored = restorePlayer(
    JSON.stringify({ ...legacy, coins: 999, name: "Roary" }),
  );
  assert.equal(restored.beeStopBest, 0);
  assert.equal(restored.coins, 999);
  assert.equal(restored.name, "Roary");
  assert.equal(
    restorePlayer(JSON.stringify({ ...legacy, beeStopBest: 5000 })).beeStopBest,
    1000,
  );
  assert.equal(
    restorePlayer(JSON.stringify({ ...legacy, beeStopBest: -7 })).beeStopBest,
    0,
  );
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

test("arcade saves preserve both game records and migrate each older format", () => {
  const played = completeBeeStop(
    completeFruitCatch(newPlayer(), 8, 2, 80),
    700,
  );
  assert.deepEqual(restorePlayer(JSON.stringify(played)), played);
  const { beeStopBest: _bee, ...fruitSave } = played;
  const fromFruit = restorePlayer(JSON.stringify(fruitSave));
  assert.equal(fromFruit.fruitCatchBest, 80);
  assert.equal(fromFruit.beeStopBest, 0);
  assert.equal(fromFruit.coins, played.coins);
  const { fruitCatchBest: _fruit, ...beeSave } = played;
  const fromBee = restorePlayer(JSON.stringify(beeSave));
  assert.equal(fromBee.beeStopBest, 700);
  assert.equal(fromBee.fruitCatchBest, 0);
  assert.equal(fromBee.gamesPlayed, 2);
});
