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
