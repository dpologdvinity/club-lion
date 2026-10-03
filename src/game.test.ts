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
