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
  completeMangoRun,
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

test("a mango run pays coins, counts a game, and sets the first best score", () => {
  const player = newPlayer();
  const run = completeMangoRun(player, 42);
  assert.equal(run.coins, player.coins + 42);
  assert.equal(run.gamesPlayed, player.gamesPlayed + 1);
  assert.equal(run.mangoRunBest, 42);
});

test("mango run keeps the highest score as the best", () => {
  const first = completeMangoRun(newPlayer(), 42);
  assert.equal(completeMangoRun(first, 10).mangoRunBest, 42);
  assert.equal(completeMangoRun(first, 100).mangoRunBest, 100);
});

test("mango runs are repeatable and each one pays out again", () => {
  const once = completeMangoRun(newPlayer(), 7);
  const twice = completeMangoRun(once, 5);
  assert.equal(twice.coins, once.coins + 5);
  assert.equal(twice.gamesPlayed, once.gamesPlayed + 1);
  assert.equal(twice.mangoRunBest, 7);
});

test("a mango run scoring zero still counts a play and pays nothing", () => {
  const player = newPlayer();
  const run = completeMangoRun(player, 0);
  assert.equal(run.coins, player.coins);
  assert.equal(run.gamesPlayed, player.gamesPlayed + 1);
  assert.equal(run.mangoRunBest, 0);
  assert.equal(completeMangoRun(run, 0).mangoRunBest, 0);
});

test("mango runs ignore negative and non-integer scores", () => {
  const player = newPlayer();
  assert.deepEqual(completeMangoRun(player, -5), player);
  assert.deepEqual(completeMangoRun(player, 4.5), player);
  assert.deepEqual(completeMangoRun(player, Number.NaN), player);
});

test("saving keeps a valid mango run best and drops an invalid one", () => {
  const best = { ...newPlayer(), mangoRunBest: 88 };
  assert.deepEqual(restorePlayer(JSON.stringify(best)), best);
  const missing = restorePlayer(JSON.stringify(newPlayer()));
  assert.equal(missing.mangoRunBest, undefined);
  assert.deepEqual(missing, newPlayer());
  const invalid = restorePlayer(
    JSON.stringify({ ...newPlayer(), mangoRunBest: -1 }),
  );
  assert.equal(invalid.mangoRunBest, undefined);
  assert.deepEqual(invalid, newPlayer());
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

test("arcade scores and rewards survive switching games and restoring the save", () => {
  const fruit = completeFruitCatch(newPlayer(), 8, 2, 80);
  const mango = completeMangoRun(fruit, 42);
  const replay = completeFruitCatch(mango, 2, 0, 20);
  assert.equal(replay.coins, 312);
  assert.equal(replay.gamesPlayed, 3);
  assert.equal(replay.mangoRunBest, 42);
  assert.equal(replay.fruitCatchBest, 80);
  assert.deepEqual(restorePlayer(JSON.stringify(replay)), replay);
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
