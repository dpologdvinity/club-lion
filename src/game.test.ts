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
  completePawSteps,
  completeFruitCatch,
  completeDJBeatDrop,
  completeSmoothieOrder,
  completeFishingCatch,
  completeSpyPuzzle,
  unlockSecretCatalogItem,
  unlockStamp,
  migratePlayerSave,
  SHOP_ITEMS,
  type Player,
} from "./game.ts";
import { SPY_PUZZLE_MAX_COINS } from "./utils/spyPuzzles.ts";
import { DEFAULT_AVATAR_LOOK, DEFAULT_PET_STATE } from "./types/world.ts";
import { serializeLayout, type PlacedFurniture } from "./utils/condoGrid.ts";

test("a corrupt save safely starts a fresh adventure", () => {
  assert.deepEqual(restorePlayer("broken json"), newPlayer());
  assert.deepEqual(
    restorePlayer('{"coins":-900,"owned":["admin"]}'),
    newPlayer(),
  );
});

test("smoothie orders pay bounded rewards and never overflow player progress", () => {
  const player = newPlayer();
  const served = completeSmoothieOrder(player, 42);
  assert.equal(served.coins, 292);
  assert.equal(served.smoothiesServed, 1);
  assert.equal(completeSmoothieOrder(served, 0).smoothiesServed, 2);
  for (const coins of [-1, 0.5, NaN, 43, Number.MAX_SAFE_INTEGER]) {
    assert.equal(completeSmoothieOrder(player, coins), player);
  }
  const fullWallet = { ...player, coins: Number.MAX_SAFE_INTEGER };
  assert.equal(completeSmoothieOrder(fullWallet, 30), fullWallet);
  const fullCounter = { ...player, smoothiesServed: Number.MAX_SAFE_INTEGER };
  assert.equal(completeSmoothieOrder(fullCounter, 0), fullCounter);
});

test("a valid condo layout round trips through v1 restoration and v2 migration", () => {
  const layout: PlacedFurniture[] = [
    { id: "rug", itemId: "woven-rug", col: 0, row: 0, orientation: "N" },
    { id: "sofa", itemId: "velvet-sofa", col: 0, row: 0, orientation: "N" },
  ];
  const player = { ...newPlayer(), condoLayout: serializeLayout(layout) };
  const restored = restorePlayer(JSON.stringify(player));
  assert.equal(restored.condoLayout, serializeLayout(layout));
  const migrated = migratePlayerSave(player);
  assert.equal(migrated.condoLayout, serializeLayout(layout));
  assert.deepEqual(
    migratePlayerSave(JSON.parse(JSON.stringify(migrated))).condoLayout,
    serializeLayout(layout),
  );
});

test("invalid condo layout data is dropped without discarding the rest of the save", () => {
  const overlapping = JSON.stringify([
    {
      id: "a",
      itemId: "savanna-coffee-table",
      col: 2,
      row: 2,
      orientation: "N",
    },
    { id: "b", itemId: "pet-lion-cushion", col: 3, row: 3, orientation: "N" },
  ]);
  const player = {
    ...newPlayer(),
    name: "Roary",
    coins: 500,
    condoLayout: overlapping,
  };
  const restored = restorePlayer(JSON.stringify(player));
  assert.equal(restored.condoLayout, undefined);
  assert.equal(restored.name, "Roary");
  assert.equal(restored.coins, 500);
  const migrated = migratePlayerSave(player);
  assert.equal(migrated.condoLayout, undefined);
  assert.equal(migrated.coins, 500);
});

test("absent condo layout data stays absent through restoration and migration", () => {
  const player = newPlayer();
  assert.equal(restorePlayer(JSON.stringify(player)).condoLayout, undefined);
  assert.equal(migratePlayerSave(player).condoLayout, undefined);
});

test("smoothie and DJ progress round trips together through v1 and v2 saves", () => {
  const player = completeSmoothieOrder(
    completeDJBeatDrop(newPlayer(), 400, 12),
    30,
  );
  assert.deepEqual(restorePlayer(JSON.stringify(player)), player);
  const migrated = migratePlayerSave(player);
  assert.equal(migrated.coins, 300);
  assert.equal(migrated.smoothiesServed, 1);
  assert.equal(migrated.djBeatDropBest, 400);
  assert.deepEqual(
    migratePlayerSave(JSON.parse(JSON.stringify(migrated))),
    migrated,
  );
  assert.equal(migratePlayerSave(newPlayer()).smoothiesServed, undefined);
  assert.equal(
    restorePlayer(JSON.stringify({ ...player, smoothiesServed: -1 }))
      .smoothiesServed,
    undefined,
  );
});

test("fishing catches pay coins and track games played and fish caught", () => {
  const player = newPlayer();
  const caught = completeFishingCatch(player, {
    speciesId: "golden_catfish",
    weight: 8.4,
    coins: 50,
  });
  assert.equal(caught.coins, 300);
  assert.equal(caught.gamesPlayed, 1);
  assert.equal(caught.fishCaughtCount, 1);
  assert.equal(caught.largestFishWeight, 8.4);
});

test("fishing catches keep the largest fish weight seen so far", () => {
  const player = completeFishingCatch(newPlayer(), {
    speciesId: "golden_catfish",
    weight: 8.4,
    coins: 50,
  });
  const smaller = completeFishingCatch(player, {
    speciesId: "river_minnow",
    weight: 0.3,
    coins: 3,
  });
  assert.equal(smaller.largestFishWeight, 8.4);
  const bigger = completeFishingCatch(smaller, {
    speciesId: "savanna_eel",
    weight: 9.0,
    coins: 80,
  });
  assert.equal(bigger.largestFishWeight, 9.0);
  assert.equal(bigger.fishCaughtCount, 3);
});

test("fishing catches reject invalid inputs and never overflow player progress", () => {
  const player = newPlayer();
  const badCases = [
    { speciesId: "golden_catfish", weight: -1, coins: 50 },
    { speciesId: "golden_catfish", weight: NaN, coins: 50 },
    { speciesId: "golden_catfish", weight: 8.4, coins: -5 },
    { speciesId: "golden_catfish", weight: 8.4, coins: NaN },
    { speciesId: "not_a_fish", weight: 8.4, coins: 50 },
  ];
  for (const catchResult of badCases) {
    assert.equal(completeFishingCatch(player, catchResult), player);
  }
  const fullWallet = { ...player, coins: Number.MAX_SAFE_INTEGER };
  assert.equal(
    completeFishingCatch(fullWallet, {
      speciesId: "golden_catfish",
      weight: 8.4,
      coins: 50,
    }),
    fullWallet,
  );
});

test("fishing progress round trips through v1 saves and migrates to v2", () => {
  const player = completeFishingCatch(newPlayer(), {
    speciesId: "golden_catfish",
    weight: 8.4,
    coins: 50,
  });
  assert.deepEqual(restorePlayer(JSON.stringify(player)), player);
  const migrated = migratePlayerSave(player);
  assert.equal(migrated.fishCaughtCount, 1);
  assert.equal(migrated.largestFishWeight, 8.4);
  assert.deepEqual(
    migratePlayerSave(JSON.parse(JSON.stringify(migrated))),
    migrated,
  );
  assert.equal(migratePlayerSave(newPlayer()).fishCaughtCount, undefined);
  assert.equal(
    restorePlayer(JSON.stringify({ ...player, fishCaughtCount: -1 }))
      .fishCaughtCount,
    undefined,
  );
  assert.equal(
    restorePlayer(JSON.stringify({ ...player, largestFishWeight: -1 }))
      .largestFishWeight,
    undefined,
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

test("a DJ Beat Drop run pays coins, counts a game, and sets the first best score", () => {
  const player = newPlayer();
  const run = completeDJBeatDrop(player, 400, 12);
  assert.equal(run.coins, player.coins + 20);
  assert.equal(run.gamesPlayed, player.gamesPlayed + 1);
  assert.equal(run.djBeatDropBest, 400);
});

test("DJ Beat Drop keeps the highest score as the best", () => {
  const first = completeDJBeatDrop(newPlayer(), 400, 12);
  assert.equal(completeDJBeatDrop(first, 100, 3).djBeatDropBest, 400);
  assert.equal(completeDJBeatDrop(first, 900, 30).djBeatDropBest, 900);
});

test("DJ Beat Drop rejects impossible runs and prevents reward overflow", () => {
  const player = newPlayer();
  assert.equal(completeDJBeatDrop(player, 6801, 32), player);
  assert.equal(completeDJBeatDrop(player, 100, 33), player);
  const fullWallet = { ...player, coins: Number.MAX_SAFE_INTEGER };
  assert.equal(completeDJBeatDrop(fullWallet, 100, 1), fullWallet);
  assert.equal(completeDJBeatDrop(player, 6800, 32).coins, 590);
  const invalidBest = restorePlayer(
    JSON.stringify({ ...player, djBeatDropBest: 6801 }),
  );
  assert.equal(invalidBest.djBeatDropBest, undefined);
});

test("DJ Beat Drop progress survives both save migrations", () => {
  const v1 = completeDJBeatDrop(newPlayer(), 400, 12);
  const v2 = migratePlayerSave(v1);
  assert.equal(v2.djBeatDropBest, 400);
  assert.equal(v2.coins, 270);
  assert.deepEqual(migratePlayerSave(JSON.parse(JSON.stringify(v2))), v2);
});

test("DJ Beat Drop runs are repeatable and each one pays out again", () => {
  const once = completeDJBeatDrop(newPlayer(), 100, 3);
  const twice = completeDJBeatDrop(once, 60, 2);
  assert.equal(twice.coins, once.coins + 3);
  assert.equal(twice.gamesPlayed, once.gamesPlayed + 1);
  assert.equal(twice.djBeatDropBest, 100);
});

test("DJ Beat Drop ignores negative, non-integer, or NaN scores and combos", () => {
  const player = newPlayer();
  assert.deepEqual(completeDJBeatDrop(player, -5, 0), player);
  assert.deepEqual(completeDJBeatDrop(player, 4.5, 0), player);
  assert.deepEqual(completeDJBeatDrop(player, Number.NaN, 0), player);
  assert.deepEqual(completeDJBeatDrop(player, 100, -1), player);
});

test("saving keeps a valid DJ Beat Drop best and drops an invalid one", () => {
  const best = { ...newPlayer(), djBeatDropBest: 650 };
  assert.deepEqual(restorePlayer(JSON.stringify(best)), best);
  const missing = restorePlayer(JSON.stringify(newPlayer()));
  assert.equal(missing.djBeatDropBest, undefined);
  assert.deepEqual(missing, newPlayer());
  const invalid = restorePlayer(
    JSON.stringify({ ...newPlayer(), djBeatDropBest: -1 }),
  );
  assert.equal(invalid.djBeatDropBest, undefined);
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

test("unlocking a secret catalog item adds it to owned items", () => {
  const player = newPlayer();
  const unlocked = unlockSecretCatalogItem(player, "barista_apron");
  assert.ok(unlocked.owned.includes("barista_apron"));
  assert.equal(unlocked.coins, player.coins);
});

test("unlocking a secret catalog item via its trigger id adds it to owned items", () => {
  const player = newPlayer();
  const unlocked = unlockSecretCatalogItem(player, "coffee_steam");
  assert.ok(unlocked.owned.includes("barista_apron"));
  assert.equal(unlocked.coins, player.coins);
});

test("unlocking the same secret item twice does not duplicate it", () => {
  const player = newPlayer();
  const once = unlockSecretCatalogItem(player, "retro_neon_visor");
  const twice = unlockSecretCatalogItem(once, "retro_neon_visor");
  assert.deepEqual(twice, once);
  assert.equal(twice.owned.filter((id) => id === "retro_neon_visor").length, 1);
});

test("unlocking an unknown secret id leaves the player unchanged", () => {
  const player = newPlayer();
  assert.deepEqual(
    unlockSecretCatalogItem(player, "not_a_real_secret"),
    player,
  );
});

test("migratePlayerSave cleanly upgrades v1 save to v2 without losing coins or items", () => {
  const v1 = {
    ...newPlayer(),
    name: "Roary",
    coins: 999,
    owned: ["scarf", "hat", "plant"],
    accessory: "hat",
    decor: ["plant"],
    visited: ["square", "den"],
    met: ["milo"],
    gamesPlayed: 12,
    beeStopBest: 700,
    pawStepsBest: 20,
    fruitCatchBest: 80,
    claimed: ["home"],
  };
  const v2 = migratePlayerSave(v1);
  assert.equal(v2.version, 2);
  assert.equal(v2.coins, 999);
  assert.deepEqual(v2.owned, ["scarf", "hat", "plant"]);
  assert.equal(v2.accessory, "hat");
  assert.deepEqual(v2.decor, ["plant"]);
  assert.deepEqual(v2.visited, ["square", "den"]);
  assert.deepEqual(v2.met, ["milo"]);
  assert.equal(v2.gamesPlayed, 12);
  assert.equal(v2.beeStopBest, 700);
  assert.equal(v2.pawStepsBest, 20);
  assert.equal(v2.fruitCatchBest, 80);
  assert.deepEqual(v2.claimed, ["home"]);
  assert.deepEqual(v2.look, DEFAULT_AVATAR_LOOK);
  assert.deepEqual(v2.pet, DEFAULT_PET_STATE);
  assert.equal(typeof v2.starRank, "number");
  assert.ok(v2.starRank >= 1);
  assert.equal(typeof v2.moodQuote, "string");
  assert.ok(v2.moodQuote.length > 0);
});

test("migratePlayerSave keeps an existing look and pet instead of overwriting them", () => {
  const customLook = { ...DEFAULT_AVATAR_LOOK, hairColor: "#000000" };
  const customPet = { ...DEFAULT_PET_STATE, name: "Biscuit" };
  const v1 = { ...newPlayer(), look: customLook, pet: customPet };
  const v2 = migratePlayerSave(v1);
  assert.deepEqual(v2.look, customLook);
  assert.deepEqual(v2.pet, customPet);
});

test("migratePlayerSave computes a higher starRank for more games played and coins earned", () => {
  const low = migratePlayerSave({ ...newPlayer(), gamesPlayed: 0, coins: 0 });
  const high = migratePlayerSave({
    ...newPlayer(),
    gamesPlayed: 50,
    coins: 5000,
  });
  assert.ok(high.starRank > low.starRank);
});

test("migratePlayerSave falls back cleanly to a default v2 player for corrupt saves", () => {
  const fallback = migratePlayerSave(newPlayer());
  assert.deepEqual(migratePlayerSave("not an object"), fallback);
  assert.deepEqual(migratePlayerSave(null), fallback);
  assert.deepEqual(
    migratePlayerSave({ coins: -900, owned: ["admin"] }),
    fallback,
  );
  assert.equal(fallback.version, 2);
});

test("Phase 2 destinations deduplicate visits and survive both save versions", () => {
  for (const destination of [
    "downtown-plaza",
    "wonder-park-entrance",
    "wonder-park-midway",
    "club-pulse",
  ] as const) {
    const player = visitPlace(newPlayer(), destination);
    assert.equal(player.visited.includes(destination), true);
    assert.deepEqual(visitPlace(player, destination).visited, player.visited);
    assert.equal(
      restorePlayer(JSON.stringify(player)).visited.includes(destination),
      true,
    );
    assert.equal(
      migratePlayerSave({
        ...player,
        version: 2,
        look: DEFAULT_AVATAR_LOOK,
        pet: DEFAULT_PET_STATE,
        starRank: 1,
        moodQuote: "Hello",
      }).visited.includes(destination),
      true,
    );
  }
});

test("new players and legacy saves start with an empty stamp collection", () => {
  assert.deepEqual(newPlayer().stamps, []);
  const { stamps: _stamps, ...legacy } = newPlayer();
  assert.deepEqual(restorePlayer(JSON.stringify(legacy)).stamps, []);
  assert.deepEqual(migratePlayerSave(legacy).stamps, []);
});

test("unlockStamp is immutable, preserves generic player fields, and grants no coins", () => {
  const player = migratePlayerSave(newPlayer());
  const before = structuredClone(player);
  const unlocked = unlockStamp(player, "catalog_barista");
  assert.notEqual(unlocked, player);
  assert.deepEqual(player, before);
  assert.deepEqual(unlocked, { ...player, stamps: ["catalog_barista"] });
  assert.equal(unlockStamp(unlocked, "catalog_barista"), unlocked);
  assert.equal(unlockStamp(player, "unknown"), player);
  const { stamps: _stamps, ...legacy } = newPlayer();
  assert.deepEqual(unlockStamp<Player>(legacy, "secret_den").stamps, [
    "secret_den",
  ]);
});

test("stamp restoration filters malformed and unknown IDs and removes duplicates", () => {
  const player = { ...newPlayer(), coins: 430 };
  const restored = restorePlayer(
    JSON.stringify({
      ...player,
      stamps: [
        "secret_den",
        42,
        null,
        "unknown",
        "secret_den",
        "catalog_barista",
        {},
      ],
    }),
  );
  assert.deepEqual(restored, {
    ...player,
    stamps: ["secret_den", "catalog_barista"],
  });
  for (const stamps of [null, "secret_den", {}, 42]) {
    assert.deepEqual(
      restorePlayer(JSON.stringify({ ...player, stamps })),
      player,
    );
  }
});

test("stamps and secret catalog ownership survive v1 and v2 save round trips", () => {
  const player = unlockStamp(
    unlockSecretCatalogItem(newPlayer(), "barista_apron"),
    "catalog_barista",
  );
  assert.deepEqual(restorePlayer(JSON.stringify(player)), player);
  const migrated = migratePlayerSave(player);
  assert.deepEqual(migrated.stamps, ["catalog_barista"]);
  assert.deepEqual(migrated.owned, ["scarf", "barista_apron"]);
  assert.deepEqual(
    migratePlayerSave(JSON.parse(JSON.stringify(migrated))),
    migrated,
  );
  assert.deepEqual(migratePlayerSave(JSON.stringify(player)), migrated);
  const dirty = {
    ...migrated,
    stamps: ["secret_den", "bad", false, "secret_den"],
  };
  assert.deepEqual(migratePlayerSave(dirty).stamps, ["secret_den"]);
});

test("only a fully completed Memory Safari earns its mastery stamp", () => {
  const player = newPlayer();
  assert.deepEqual(completeGame(player, 5).stamps, []);
  const mastered = completeGame(player, 6);
  assert.deepEqual(mastered.stamps, ["memory_safari_master"]);
  assert.deepEqual(completeGame(mastered, 6).stamps, ["memory_safari_master"]);
  assert.equal(completeGame(player, 7), player);
});

test("DJ combos award a stamp from the actual combo without inferring it from score", () => {
  const player = newPlayer();
  assert.deepEqual(completeDJBeatDrop(player, 3200, 15).stamps, []);
  assert.deepEqual(completeDJBeatDrop(player, 500, 16).stamps, [
    "dj_beat_combo",
  ]);
  assert.equal(completeDJBeatDrop(player, 500, 33), player);
});

test("completing a spy puzzle pays coins, counts a puzzle solved, and sets rank 1", () => {
  const player = newPlayer();
  const next = completeSpyPuzzle(player, "laser_grid", 1, 20);
  assert.equal(next.coins, player.coins + 20);
  assert.equal(next.spyPuzzlesSolved, 1);
  assert.equal(next.spyRank, 1);
  assert.deepEqual(next.spyBadges, ["🥉"]);
});

test("completing enough spy puzzles promotes spy rank and grants its badge once", () => {
  let player = newPlayer();
  for (let i = 0; i < 3; i++) {
    player = completeSpyPuzzle(player, "cipher", 1, 10);
  }
  assert.equal(player.spyPuzzlesSolved, 3);
  assert.equal(player.spyRank, 2);
  assert.deepEqual(player.spyBadges, ["🥉", "🥈"]);
});

test("completeSpyPuzzle rejects negative, non-integer, or over-cap coin rewards", () => {
  const player = newPlayer();
  assert.equal(completeSpyPuzzle(player, "laser_grid", 1, -5), player);
  assert.equal(completeSpyPuzzle(player, "laser_grid", 1, 1.5), player);
  assert.equal(
    completeSpyPuzzle(player, "laser_grid", 1, SPY_PUZZLE_MAX_COINS + 1),
    player,
  );
});

test("completeSpyPuzzle rejects an invalid puzzle type or non-integer stage", () => {
  const player = newPlayer();
  assert.equal(
    completeSpyPuzzle(player, "not_a_puzzle" as never, 1, 10),
    player,
  );
  assert.equal(completeSpyPuzzle(player, "laser_grid", -1, 10), player);
  assert.equal(completeSpyPuzzle(player, "laser_grid", 1.5, 10), player);
});

test("spy progression survives a save round trip and rejects a corrupted save", () => {
  let player = newPlayer();
  player = completeSpyPuzzle(player, "laser_grid", 1, 15);
  player = completeSpyPuzzle(player, "cipher", 1, 15);
  const restored = restorePlayer(JSON.stringify(player));
  assert.equal(restored.spyPuzzlesSolved, 2);
  assert.equal(restored.spyRank, 1);
  assert.deepEqual(restored.spyBadges, ["🥉"]);

  const dirty = JSON.parse(JSON.stringify(player));
  dirty.spyPuzzlesSolved = -3;
  dirty.spyRank = 999;
  dirty.spyBadges = ["🥉", "not-a-real-badge", 42];
  const restoredDirty = restorePlayer(JSON.stringify(dirty));
  assert.equal(restoredDirty.spyPuzzlesSolved, 0);
  assert.equal(restoredDirty.spyRank, 0);
  assert.deepEqual(restoredDirty.spyBadges, ["🥉"]);
});

test("a save from before spy progression existed restores without spy fields", () => {
  const player = newPlayer();
  const restored = restorePlayer(JSON.stringify(player));
  assert.equal(restored.spyPuzzlesSolved, undefined);
  assert.equal(restored.spyRank, undefined);
  assert.equal(restored.spyBadges, undefined);
});

test("legacy saves restore empty social arrays and preserve progress", () => {
  const legacy = { ...newPlayer(), coins: 789 };
  for (const key of [
    "friends",
    "incomingFriendRequests",
    "outgoingFriendRequests",
    "recentVisitors",
  ] as const)
    delete legacy[key];
  const restored = restorePlayer(JSON.stringify(legacy));
  assert.equal(restored.coins, 789);
  for (const key of [
    "friends",
    "incomingFriendRequests",
    "outgoingFriendRequests",
    "recentVisitors",
  ] as const) {
    assert.deepEqual(restored[key], []);
  }
});

test("social save arrays validate IDs, deduplicate, resolve conflicts and bound size", () => {
  const ids = Array.from({ length: 130 }, (_, i) => `lion-${i}`);
  const restored = restorePlayer(
    JSON.stringify({
      ...newPlayer(),
      friends: [null, 10, {}, "", " ", "x".repeat(33), "cleo", "cleo", ...ids],
      incomingFriendRequests: [
        "cleo",
        "pip",
        "pip",
        ...ids.map((id) => `incoming-${id}`),
      ],
      outgoingFriendRequests: [
        "cleo",
        "pip",
        "milo",
        "milo",
        ...ids.map((id) => `outgoing-${id}`),
      ],
      recentVisitors: [false, "cleo", "cleo", ...ids],
    }),
  );
  assert.equal(restored.friends?.length, 100);
  assert.equal(restored.friends?.[0], "cleo");
  assert.equal(restored.incomingFriendRequests?.length, 100);
  assert.equal(restored.incomingFriendRequests?.[0], "pip");
  assert.equal(restored.outgoingFriendRequests?.length, 100);
  assert.equal(restored.outgoingFriendRequests?.[0], "milo");
  assert.equal(restored.recentVisitors?.length, 15);
  const malformed = restorePlayer(
    JSON.stringify({
      ...newPlayer(),
      friends: "cleo",
      incomingFriendRequests: {},
      outgoingFriendRequests: null,
      recentVisitors: 15,
    }),
  );
  assert.deepEqual(malformed.friends, []);
  assert.deepEqual(malformed.incomingFriendRequests, []);
  assert.deepEqual(malformed.outgoingFriendRequests, []);
  assert.deepEqual(malformed.recentVisitors, []);
});

test("social arrays round trip through V1 and V2 migration without persisting presence", () => {
  const save = {
    ...newPlayer(),
    friends: ["cleo"],
    incomingFriendRequests: ["pip"],
    outgoingFriendRequests: ["milo"],
    recentVisitors: ["cleo", "pip"],
  };
  const migrated = migratePlayerSave(save);
  const reloaded = migratePlayerSave(JSON.parse(JSON.stringify(migrated)));
  for (const key of [
    "friends",
    "incomingFriendRequests",
    "outgoingFriendRequests",
    "recentVisitors",
  ] as const) {
    assert.deepEqual(restorePlayer(JSON.stringify(save))[key], save[key]);
    assert.deepEqual(migrated[key], save[key]);
    assert.deepEqual(reloaded[key], save[key]);
  }
  assert.equal("isOnline" in reloaded, false);
});
