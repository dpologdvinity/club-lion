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
  completeSledRun,
  completeKartRace,
  completeRiverSurf,
  setKartPrefs,
  evaluateStampUnlocks,
  completePicturePuzzle,
  completeBalloonRainbow,
  completeBeeStop,
  completePawSteps,
  completeFruitCatch,
  completeBubblePop,
  completeAnimalBand,
  completeShapeSorterRound,
  colorPage,
  completeDJBeatDrop,
  completeSmoothieOrder,
  completeBakeryServe,
  completeSeekRound,
  completeFishingCatch,
  completeSpyPuzzle,
  applyPetCareAction,
  choosePetSpecies,
  unlockSecretCatalogItem,
  unlockStamp,
  migratePlayerSave,
  SHOP_ITEMS,
  STAMP_DEFINITIONS,
  type Player,
} from "./game.ts";
import { BUBBLE_POP_MAX_SCORE } from "./utils/bubblePop.ts";
import { SHAPE_SORTER_ROUNDS } from "./utils/shapeSorter.ts";
import { MAX_CAKE_PHOTOS, newCake, type Cake } from "./utils/bakery.ts";
import {
  DEFAULT_AVATAR_LOOK,
  DEFAULT_PET_STATE,
  STARTER_AVATAR_LOOK,
} from "./types/world.ts";
import { serializeLayout, type PlacedFurniture } from "./utils/condoGrid.ts";

test("a corrupt save safely starts a fresh adventure", () => {
  assert.deepEqual(restorePlayer("broken json"), newPlayer());
  assert.deepEqual(
    restorePlayer('{"coins":-900,"owned":["admin"]}'),
    newPlayer(),
  );
});

test("bakery serves keep photos of the newest six cakes", () => {
  const player = newPlayer();
  const cake: Cake = {
    ...newCake(),
    shape: "star",
    toppings: [{ kind: "lion", x: 50, y: 40 }],
  };
  const served = completeBakeryServe(player, cake);
  assert.equal(served.cakesServed, 1);
  assert.deepEqual(served.bakeryCakes, [cake]);
  const badCake = JSON.parse(JSON.stringify({ ...cake, shape: "cube" }));
  assert.equal(completeBakeryServe(player, badCake), player);
  let busy = served;
  for (let i = 0; i < 8; i++)
    busy = completeBakeryServe(busy, { ...newCake(), sponge: "mango" });
  assert.equal(busy.bakeryCakes?.length, MAX_CAKE_PHOTOS);
  assert.equal(busy.bakeryCakes?.[0].sponge, "mango");
  assert.equal(busy.cakesServed, 9);
});

test("bakery photos survive save round trips and old saves still load", () => {
  const player = completeBakeryServe(newPlayer(), newCake());
  assert.deepEqual(restorePlayer(JSON.stringify(player)), player);
  const migrated = migratePlayerSave(player);
  assert.deepEqual(migrated.bakeryCakes, [newCake()]);
  assert.deepEqual(
    migratePlayerSave(JSON.parse(JSON.stringify(migrated))),
    migrated,
  );
  const old = restorePlayer(JSON.stringify(newPlayer()));
  assert.equal(old.bakeryCakes, undefined);
  assert.equal(old.cakesServed, undefined);
  const tampered = restorePlayer(
    JSON.stringify({
      ...player,
      cakesServed: -3,
      bakeryCakes: [newCake(), { shape: "cube" }, "cake"],
    }),
  );
  assert.equal(tampered.cakesServed, undefined);
  assert.deepEqual(tampered.bakeryCakes, [newCake()]);
});

test("seek rounds pay per round, stamp each scene once, and track the best hard time", () => {
  const player = newPlayer();
  const easy = completeSeekRound(player, {
    scene: "beach",
    hard: false,
    timeMs: 40_000,
  });
  assert.deepEqual(easy.stamps, ["seek_beach"]);
  assert.equal(easy.seekBestMs, undefined);
  const again = completeSeekRound(easy, {
    scene: "beach",
    hard: true,
    timeMs: 21_000,
  });
  assert.deepEqual(again.stamps, ["seek_beach"]);
  assert.equal(again.seekBestMs, 21_000);
  const slower = completeSeekRound(again, {
    scene: "jungle",
    hard: true,
    timeMs: 30_000,
  });
  assert.equal(slower.seekBestMs, 21_000);
  assert.equal(slower.seekRounds, 3);
  for (const timeMs of [0, -5, NaN, Infinity])
    assert.equal(
      completeSeekRound(player, { scene: "beach", hard: false, timeMs }),
      player,
    );
  assert.equal(
    completeSeekRound(player, {
      scene: JSON.parse('"moon"'),
      hard: false,
      timeMs: 10,
    }),
    player,
  );
  assert.deepEqual(restorePlayer(JSON.stringify(slower)), slower);
  assert.equal(
    restorePlayer(JSON.stringify({ ...slower, seekBestMs: -1 })).seekBestMs,
    undefined,
  );
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
    condoLayout: overlapping,
  };
  const restored = restorePlayer(JSON.stringify(player));
  assert.equal(restored.condoLayout, undefined);
  assert.equal(restored.name, "Roary");
  const migrated = migratePlayerSave(player);
  assert.equal(migrated.condoLayout, undefined);
});

test("absent condo layout data stays absent through restoration and migration", () => {
  const player = newPlayer();
  assert.equal(restorePlayer(JSON.stringify(player)).condoLayout, undefined);
  assert.equal(migratePlayerSave(player).condoLayout, undefined);
});

test("smoothie and DJ progress round trips together through v1 and v2 saves", () => {
  const player = completeSmoothieOrder(
    completeDJBeatDrop(newPlayer(), 400, 12),
  );
  assert.deepEqual(restorePlayer(JSON.stringify(player)), player);
  const migrated = migratePlayerSave(player);
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

test("fishing catches track games played and fish caught", () => {
  const player = newPlayer();
  const caught = completeFishingCatch(player, {
    speciesId: "golden_catfish",
    weight: 8.4,
  });
  assert.equal(caught.gamesPlayed, 1);
  assert.equal(caught.fishCaughtCount, 1);
  assert.equal(caught.largestFishWeight, 8.4);
});

test("fishing catches keep the largest fish weight seen so far", () => {
  const player = completeFishingCatch(newPlayer(), {
    speciesId: "golden_catfish",
    weight: 8.4,
  });
  const smaller = completeFishingCatch(player, {
    speciesId: "river_minnow",
    weight: 0.3,
  });
  assert.equal(smaller.largestFishWeight, 8.4);
  const bigger = completeFishingCatch(smaller, {
    speciesId: "savanna_eel",
    weight: 9.0,
  });
  assert.equal(bigger.largestFishWeight, 9.0);
  assert.equal(bigger.fishCaughtCount, 3);
});

test("fishing progress round trips through v1 saves and migrates to v2", () => {
  const player = completeFishingCatch(newPlayer(), {
    speciesId: "golden_catfish",
    weight: 8.4,
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

test("shop items are free to collect, once", () => {
  const item = SHOP_ITEMS.find((item) => item.id === "hat")!;
  const bought = buyItem(newPlayer(), item.id);
  assert.ok(bought.owned.includes(item.id));
  assert.equal(bought.accessory, item.id);
  assert.deepEqual(buyItem(bought, item.id), bought);
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
  assert.deepEqual(claimReward(rewarded, "neighbors"), rewarded);
});

test("visiting home and finishing a game unlock their own adventures", () => {
  const visited = visitPlace(newPlayer(), "den");
  assert.ok(visited.visited.includes("den"));
  const played = completeGame(newPlayer(), 6);
  assert.equal(played.gamesPlayed, 1);
});

test("save round trips preserve valid progress and reject invalid character choices", () => {
  const player = { ...newPlayer(), name: "Roary", color: "rose" as const };
  assert.deepEqual(restorePlayer(JSON.stringify(player)), player);
  assert.equal(
    restorePlayer(JSON.stringify({ ...player, color: "invisible" })).color,
    "gold",
  );
});

test("a mango run counts a game, and sets the first best score", () => {
  const player = newPlayer();
  const run = completeMangoRun(player, 42);
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
  assert.equal(twice.gamesPlayed, once.gamesPlayed + 1);
  assert.equal(twice.mangoRunBest, 7);
});

test("a mango run scoring zero still counts a play and pays nothing", () => {
  const player = newPlayer();
  const run = completeMangoRun(player, 0);
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

test("a DJ Beat Drop run counts a game, and sets the first best score", () => {
  const player = newPlayer();
  const run = completeDJBeatDrop(player, 400, 12);
  assert.equal(run.gamesPlayed, player.gamesPlayed + 1);
  assert.equal(run.djBeatDropBest, 400);
});

test("DJ Beat Drop keeps the highest score as the best", () => {
  const first = completeDJBeatDrop(newPlayer(), 400, 12);
  assert.equal(completeDJBeatDrop(first, 100, 3).djBeatDropBest, 400);
  assert.equal(completeDJBeatDrop(first, 900, 30).djBeatDropBest, 900);
});

test("DJ Beat Drop progress survives both save migrations", () => {
  const v1 = completeDJBeatDrop(newPlayer(), 400, 12);
  const v2 = migratePlayerSave(v1);
  assert.equal(v2.djBeatDropBest, 400);
  assert.deepEqual(migratePlayerSave(JSON.parse(JSON.stringify(v2))), v2);
});

test("DJ Beat Drop runs are repeatable and each one pays out again", () => {
  const once = completeDJBeatDrop(newPlayer(), 100, 3);
  const twice = completeDJBeatDrop(once, 60, 2);
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
  assert.equal(sloppy.gamesPlayed, 1);
  assert.equal(sloppy.beeStopBest, 460);
  const perfect = completeBeeStop(sloppy, 1000);
  assert.equal(perfect.gamesPlayed, 2);
  assert.equal(perfect.beeStopBest, 1000);
  const worse = completeBeeStop(perfect, 120);
  assert.equal(worse.beeStopBest, 1000);
});

test("Bee Stop rejects impossible scores instead of paying out", () => {
  const start = newPlayer();
  for (const score of [-1, 1001, 12.5, Number.NaN, Number.POSITIVE_INFINITY])
    assert.deepEqual(completeBeeStop(start, score), start);
});

test("a save from before Bee Stop existed keeps its progress and reports no best score", () => {
  const { beeStopBest: _omitted, ...legacy } = newPlayer();
  const restored = restorePlayer(JSON.stringify({ ...legacy, name: "Roary" }));
  assert.equal(restored.beeStopBest, 0);
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

test("Paw Steps counts one game and keeps the best round", () => {
  const played = completePawSteps(newPlayer(), 5);
  assert.equal(played.gamesPlayed, 1);
  assert.equal(played.pawStepsBest, 5);
});

test("Paw Steps keeps the highest round count across games", () => {
  const best = completePawSteps(completePawSteps(newPlayer(), 7), 3);
  assert.equal(best.pawStepsBest, 7);
  assert.equal(best.gamesPlayed, 2);
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
  const fruitSave = { ...newPlayer(), fruitCatchBest: 80 };
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
  assert.equal(first.gamesPlayed, 1);
  assert.equal(first.fruitCatchBest, 80);
  assert.deepEqual(completeFruitCatch(first, 2, 0, 20), {
    ...first,
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
});

test("unlocking a secret catalog item via its trigger id adds it to owned items", () => {
  const player = newPlayer();
  const unlocked = unlockSecretCatalogItem(player, "coffee_steam");
  assert.ok(unlocked.owned.includes("barista_apron"));
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

test("migratePlayerSave cleanly upgrades v1 save to v2 without losing items", () => {
  const v1 = {
    ...newPlayer(),
    name: "Roary",
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
  // Players who never styled their avatar start in the doll look
  assert.deepEqual(v2.look, STARTER_AVATAR_LOOK);
  assert.equal(v2.look.outfitId, DEFAULT_AVATAR_LOOK.outfitId);
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

test("migratePlayerSave computes a higher starRank for more games played", () => {
  const low = migratePlayerSave({ ...newPlayer(), gamesPlayed: 0 });
  const high = migratePlayerSave({
    ...newPlayer(),
    gamesPlayed: 50,
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

test("unlockStamp is immutable, preserves generic player fields, ", () => {
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
  const player = newPlayer();
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

test("completing a spy puzzle counts a puzzle solved, and sets rank 1", () => {
  const player = newPlayer();
  const next = completeSpyPuzzle(player, "laser_grid", 1);
  assert.equal(next.spyPuzzlesSolved, 1);
  assert.equal(next.spyRank, 1);
  assert.deepEqual(next.spyBadges, ["🥉"]);
});

test("completing enough spy puzzles promotes spy rank and grants its badge once", () => {
  let player = newPlayer();
  for (let i = 0; i < 3; i++) {
    player = completeSpyPuzzle(player, "cipher", 1);
  }
  assert.equal(player.spyPuzzlesSolved, 3);
  assert.equal(player.spyRank, 2);
  assert.deepEqual(player.spyBadges, ["🥉", "🥈"]);
});

test("completeSpyPuzzle rejects an invalid puzzle type or non-integer stage", () => {
  const player = newPlayer();
  assert.equal(completeSpyPuzzle(player, "not_a_puzzle" as never, 1), player);
  assert.equal(completeSpyPuzzle(player, "laser_grid", -1), player);
  assert.equal(completeSpyPuzzle(player, "laser_grid", 1.5), player);
});

test("spy progression survives a save round trip and rejects a corrupted save", () => {
  let player = newPlayer();
  player = completeSpyPuzzle(player, "laser_grid", 1);
  player = completeSpyPuzzle(player, "cipher", 1);
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
  const legacy = newPlayer();
  for (const key of [
    "friends",
    "incomingFriendRequests",
    "outgoingFriendRequests",
    "recentVisitors",
  ] as const)
    delete legacy[key];
  const restored = restorePlayer(JSON.stringify(legacy));
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

test("sled best and Mt. Mist visits survive V1/V2 saves and legacy defaults", () => {
  const legacy = newPlayer();
  delete (legacy as Partial<Player>).sledRunBest;
  assert.equal(restorePlayer(JSON.stringify(legacy)).sledRunBest, 0);
  assert.equal(migratePlayerSave(legacy).sledRunBest, 0);
  const saved = visitPlace({ ...newPlayer(), sledRunBest: 135 }, "mt-mist");
  assert.equal(restorePlayer(JSON.stringify(saved)).sledRunBest, 135);
  const v2 = migratePlayerSave(saved);
  assert.equal(migratePlayerSave(v2).sledRunBest, 135);
  assert.ok(migratePlayerSave(v2).visited.includes("mt-mist"));
  for (const value of [-1, 0.5, "100", null, Number.MAX_VALUE]) {
    const restored = restorePlayer(
      JSON.stringify({ ...legacy, sledRunBest: value }),
    );
    assert.equal(restored.sledRunBest, 0);
  }
});

test("legacy V2 saves without pet care preserve progress and profile", () => {
  const current = {
    ...migratePlayerSave(newPlayer()),
    gamesPlayed: 12,
    starRank: 9,
    moodQuote: "Ready for the nursery",
    visited: ["pet-paradise" as const],
  };
  const { petCare: _care, ...legacy } = current;
  for (const raw of [legacy, JSON.stringify(legacy)]) {
    const restored = migratePlayerSave(raw);
    assert.equal(restored.gamesPlayed, 12);
    assert.equal(restored.starRank, 9);
    assert.equal(restored.moodQuote, legacy.moodQuote);
    assert.deepEqual(restored.visited, legacy.visited);
    assert.equal(restored.petCare.happiness, 60);
  }
});

test("pet care survives V1 and V2 round trips without mutating the player", () => {
  for (const original of [newPlayer(), migratePlayerSave(newPlayer())]) {
    const before = structuredClone(original);
    const cared = applyPetCareAction(original, "wash");
    assert.deepEqual(original, before);
    if (cared.version === 1) {
      assert.deepEqual(
        restorePlayer(JSON.stringify(cared)).petCare,
        cared.petCare,
      );
    }
    assert.deepEqual(migratePlayerSave(cared).petCare, cared.petCare);
    assert.deepEqual(
      migratePlayerSave(JSON.stringify(cared)).petCare,
      cared.petCare,
    );
  }
});

test("invalid pet stats recover safely without discarding other progress", () => {
  const saved = {
    ...migratePlayerSave(newPlayer()),
    petCare: {
      happiness: "100",
      cleanliness: -20,
      energy: 200,
      hunger: null,
      lastCareTimestamp: -1,
      unexpected: "discard",
    },
  };
  for (const version of [1, 2]) {
    const restored = migratePlayerSave({ ...saved, version });
    assert.deepEqual(restored.petCare, {
      happiness: 60,
      cleanliness: 0,
      energy: 100,
      hunger: 60,
      lastCareTimestamp: 0,
    });
  }
});

test("pet care grants Pampered Pride atomically and once without coin rewards", () => {
  const player = migratePlayerSave(newPlayer());
  const first = applyPetCareAction(player, "brush");
  assert.equal(first.stamps?.includes("pet_pampered"), false);
  const pampered = applyPetCareAction(first, "brush");
  assert.equal(pampered.petCare.happiness, 100);
  assert.deepEqual(pampered.stamps, ["pet_pampered"]);
  const replay = applyPetCareAction(pampered, "play");
  assert.deepEqual(replay.stamps, ["pet_pampered"]);
  assert.equal(replay.gamesPlayed, player.gamesPlayed);
  assert.deepEqual(
    migratePlayerSave(JSON.stringify(replay)).stamps,
    replay.stamps,
  );
});

test("buyCatalogItem collects shop pieces once and refuses secrets", async () => {
  const { buyCatalogItem } = await import("./game.ts");
  const player = newPlayer();
  const bought = buyCatalogItem(player, "cropped_puffer");
  assert.ok(bought.owned.includes("cropped_puffer"));
  assert.equal(buyCatalogItem(bought, "cropped_puffer"), bought);
  assert.equal(buyCatalogItem(player, "barista_apron"), player);
  assert.equal(buyCatalogItem(player, "nope"), player);
});

test("equipCatalogItem writes owned items to the look field for their slot", async () => {
  const { equipCatalogItem, migratePlayerSave } = await import("./game.ts");
  const player = {
    ...migratePlayerSave(newPlayer()),
    owned: ["long_waves", "sunshine_shades", "cargo_pants", "platform_boots"],
  };
  let dressed = equipCatalogItem(player, "long_waves");
  dressed = equipCatalogItem(dressed, "sunshine_shades");
  dressed = equipCatalogItem(dressed, "cargo_pants");
  dressed = equipCatalogItem(dressed, "platform_boots");
  assert.equal(dressed.look.hairId, "long_waves");
  assert.equal(dressed.look.eyewearId, "sunshine_shades");
  assert.equal(dressed.look.bottomId, "cargo_pants");
  assert.equal(dressed.look.shoesId, "platform_boots");
  assert.equal(dressed.look.outfitId, DEFAULT_AVATAR_LOOK.outfitId);
  assert.equal(equipCatalogItem(player, "cropped_puffer"), player);
});

test("applySalonLook saves any valid look for free and rejects invalid ones", async () => {
  const { applySalonLook, migratePlayerSave } = await import("./game.ts");
  const player = migratePlayerSave(newPlayer());
  const glam = {
    ...player.look,
    eyeStyle: "glitter_pop",
    lipId: "glitter_gloss",
    hairId: "mermaid_waves",
    eyeshadowId: "bronze",
  };
  const styled = applySalonLook(player, glam);
  assert.equal(styled.look.hairId, "mermaid_waves");
  assert.equal(styled.look.eyeStyle, "glitter_pop");
  assert.deepEqual(styled.owned, player.owned);
  assert.equal(
    applySalonLook(player, { ...player.look, hairId: "" }),
    player,
    "invalid looks are rejected",
  );
});

test("dressAvatar allows free, owned, or already-worn pieces only", async () => {
  const { dressAvatar, migratePlayerSave } = await import("./game.ts");
  const player = migratePlayerSave(newPlayer());
  const free = dressAvatar(player, {
    topId: "star_baby_tee",
    bottomId: "denim_mini",
    shoesId: "jelly_sandals",
  });
  assert.equal(free.look.topId, "star_baby_tee");
  assert.equal(free.look.bottomId, "denim_mini");
  assert.equal(free.look.shoesId, "jelly_sandals");

  // The legacy default denim jacket stays wearable for players still in it
  const worn = dressAvatar(
    { ...player, look: DEFAULT_AVATAR_LOOK },
    {
      topId: "denim_jacket",
      bottomId: "flares_indigo",
      shoesId: "canvas_sneakers",
    },
  );
  assert.equal(
    worn.look.topId,
    "denim_jacket",
    "default outfit stays wearable",
  );

  const locked = {
    topId: "moto_jacket",
    bottomId: "denim_mini",
    shoesId: "jelly_sandals",
  };
  assert.equal(dressAvatar(player, locked), player);
  const owner = { ...player, owned: [...player.owned, "moto_jacket"] };
  assert.equal(dressAvatar(owner, locked).look.topId, "moto_jacket");
  assert.equal(
    dressAvatar(player, { ...locked, topId: "unknown_top" }),
    player,
  );
});

test("each migrated save gets its own starter look", async () => {
  const { migratePlayerSave, STARTER_AVATAR_LOOK } = await import("./game.ts");
  const first = migratePlayerSave(newPlayer());
  first.look.boardId = "hover_leaf";
  assert.equal(STARTER_AVATAR_LOOK.boardId, undefined);
  assert.equal(migratePlayerSave(newPlayer()).look.boardId, undefined);
});

test("dressAvatar wears pixel outfits and old saves load without them", async () => {
  const { dressAvatar, migratePlayerSave, validateAvatarLook } =
    await import("./game.ts");
  const player = migratePlayerSave(newPlayer());
  const outfit = {
    topId: "star_baby_tee",
    bottomId: "denim_mini",
    shoesId: "jelly_sandals",
  };
  const dressed = dressAvatar(player, { ...outfit, dressId: "spring_sprite" });
  assert.equal(dressed.look.dressId, "spring_sprite");
  assert.equal(dressAvatar(player, { ...outfit, dressId: "bogus" }), player);
  assert.equal(
    dressAvatar(player, { ...outfit, shoeKitId: "shoe_001" }).look.shoeKitId,
    "shoe_001",
  );
  assert.equal(dressAvatar(player, { ...outfit, shoeKitId: "nope" }), player);
  // Costumes cost gold: not worn until bought.
  assert.equal(
    dressAvatar(player, { ...outfit, costumeId: "teddy_bear" }),
    player,
  );
  const buyer = {
    ...player,
    owned: [...player.owned, "px:costume:teddy_bear"],
  };
  assert.equal(
    dressAvatar(buyer, { ...outfit, costumeId: "teddy_bear" }).look.costumeId,
    "teddy_bear",
  );
  assert.equal(dressAvatar(player, { ...outfit, costumeId: "nope" }), player);
  assert.equal(dressAvatar(dressed, outfit).look.dressId, undefined);

  const restored = migratePlayerSave(
    JSON.parse(
      JSON.stringify({
        ...dressed,
        look: { ...dressed.look, hairKitId: "kit_07" },
      }),
    ),
  );
  assert.equal(restored.look.dressId, "spring_sprite");
  assert.equal(restored.look.hairKitId, "kit_07");
  assert.ok(validateAvatarLook(DEFAULT_AVATAR_LOOK), "old looks still load");
  assert.ok(!validateAvatarLook({ ...DEFAULT_AVATAR_LOOK, dressId: 7 }));
});

test("saves keep the new look fields and drop retired premium unlock ids", async () => {
  const { migratePlayerSave } = await import("./game.ts");
  const save = {
    ...migratePlayerSave(newPlayer()),
    owned: ["scarf", "eye:glitter_pop", "bogus:item"],
    look: {
      ...DEFAULT_AVATAR_LOOK,
      topId: "star_baby_tee",
      bottomId: "denim_mini",
      lipId: "cherry",
      faceDetailId: "freckles",
      hairStreak: "#ff3d9a",
    },
  };
  const restored = migratePlayerSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(restored.owned, ["scarf"]);
  assert.equal(restored.look.topId, "star_baby_tee");
  assert.equal(restored.look.lipId, "cherry");
  assert.equal(restored.look.hairStreak, "#ff3d9a");
});

test("the first finished kart race earns the Speedway Rookie stamp", () => {
  const player = newPlayer();
  assert.ok(!evaluateStampUnlocks(player).includes("kart_first_race"));
  const raced = completeKartRace(player, {
    raceNumber: 1,
    place: 4,
    bestLapMs: null,
  });
  assert.ok(evaluateStampUnlocks(raced).includes("kart_first_race"));
  const stamped = unlockStamp(raced, "kart_first_race");
  assert.ok(!evaluateStampUnlocks(stamped).includes("kart_first_race"));
});

test("kart race progress survives saves, and old or bad saves still load", () => {
  const raced = visitPlace(
    completeKartRace(newPlayer(), { raceNumber: 1, place: 1, bestLapMs: 6800 }),
    "lion-speedway",
  );
  const restored = restorePlayer(JSON.stringify(raced));
  assert.equal(restored.kartRacesFinished, 1);
  assert.equal(restored.kartBestLapMs, 6800);
  assert.ok(restored.visited.includes("lion-speedway"));
  const v2 = migratePlayerSave(raced);
  assert.equal(migratePlayerSave(JSON.stringify(v2)).kartBestLapMs, 6800);
  assert.equal(migratePlayerSave(JSON.stringify(v2)).kartRacesFinished, 1);
  const legacy = newPlayer();
  const old = restorePlayer(JSON.stringify(legacy));
  assert.equal(old.kartRacesFinished, undefined);
  assert.equal(old.kartBestLapMs, undefined);
  for (const [races, lap] of [
    [-1, 0],
    [1.5, 999],
    ["3", "7000"],
    [null, 60 * 60 * 1000],
  ]) {
    const bad = restorePlayer(
      JSON.stringify({
        ...legacy,
        kartRacesFinished: races,
        kartBestLapMs: lap,
      }),
    );
    assert.equal(bad.kartRacesFinished, undefined);
    assert.equal(bad.kartBestLapMs, undefined);
  }
});
test("a finished Bubble Pop challenge pays once by score and keeps the best", () => {
  const first = completeBubblePop(newPlayer(), 1_000);
  assert.equal(first.gamesPlayed, 1);
  assert.equal(first.bubblePopBest, 1_000);
  const lower = completeBubblePop(first, 120);
  assert.equal(lower.bubblePopBest, 1_000);
  const maxed = completeBubblePop(newPlayer(), BUBBLE_POP_MAX_SCORE);
  for (const bad of [-1, 10.5, Number.NaN, BUBBLE_POP_MAX_SCORE + 1]) {
    assert.equal(completeBubblePop(first, bad), first);
  }
});

test("Bubble Pop bests survive a save round trip and tampered bests are dropped", () => {
  const played = completeBubblePop(newPlayer(), 640);
  assert.equal(restorePlayer(JSON.stringify(played)).bubblePopBest, 640);
  for (const bad of [-5, "640", BUBBLE_POP_MAX_SCORE + 10]) {
    const restored = restorePlayer(
      JSON.stringify({ ...played, bubblePopBest: bad }),
    );
    assert.equal(restored.bubblePopBest, undefined);
  }
});

test("coloring pages persist, restore, and finishing one earns the stamp", () => {
  const started = colorPage(newPlayer(), "lion-cub", { mane: "mango" });
  assert.deepEqual(started.coloringBook, {
    pages: { "lion-cub": { mane: "mango" } },
    finished: [],
  });
  assert.deepEqual(evaluateStampUnlocks(started), []);
  const done = colorPage(started, "lion-cub", { mane: "rainbow" }, true);
  assert.deepEqual(evaluateStampUnlocks(done), ["coloring_first_page"]);
  const restored = migratePlayerSave(JSON.stringify(done));
  assert.deepEqual(restored.coloringBook, done.coloringBook);
  assert.equal(
    colorPage(done, "nowhere", { mane: "cocoa" }).coloringBook,
    done.coloringBook,
  );
});

test("saves from before the coloring book and Bubble Pop still load", () => {
  const {
    coloringBook: _book,
    bubblePopBest: _best,
    ...older
  } = {
    ...newPlayer(),
  };
  const restored = restorePlayer(JSON.stringify(older));
  assert.equal(restored.coloringBook, undefined);
  assert.equal(restored.bubblePopBest, undefined);
  const tampered = restorePlayer(
    JSON.stringify({ ...older, coloringBook: { pages: "crayons" } }),
  );
  assert.equal(tampered.coloringBook, undefined);
});

test("River Surf best score survives V1/V2 saves and bad values are dropped", () => {
  const surfed = completeRiverSurf(newPlayer(), { score: 42 });
  assert.equal(surfed.riverSurfBest, 42);
  assert.equal(restorePlayer(JSON.stringify(surfed)).riverSurfBest, 42);
  const v2 = migratePlayerSave(surfed);
  assert.equal(v2.riverSurfBest, 42);
  assert.equal(migratePlayerSave(JSON.stringify(v2)).riverSurfBest, 42);
  const legacy = newPlayer();
  assert.equal(restorePlayer(JSON.stringify(legacy)).riverSurfBest, undefined);
  for (const value of [-1, 2.5, "42", null, Number.MAX_VALUE]) {
    const restored = restorePlayer(
      JSON.stringify({ ...legacy, riverSurfBest: value }),
    );
    assert.equal(restored.riverSurfBest, undefined);
  }
});

test("kart colour and Fast mode are remembered, validated, and optional", () => {
  const player = newPlayer();
  const chosen = setKartPrefs(player, { color: "sky", mode: "fast" });
  assert.equal(chosen.kartColor, "sky");
  assert.equal(chosen.kartMode, "fast");
  assert.equal(setKartPrefs(chosen, { color: "gold", mode: "fast" }), chosen);
  assert.equal(setKartPrefs(chosen, { color: "sky", mode: "turbo" }), chosen);
  const restored = restorePlayer(JSON.stringify(chosen));
  assert.equal(restored.kartColor, "sky");
  assert.equal(restored.kartMode, "fast");
  const v2 = migratePlayerSave(chosen);
  assert.equal(migratePlayerSave(JSON.stringify(v2)).kartColor, "sky");
  assert.equal(migratePlayerSave(JSON.stringify(v2)).kartMode, "fast");
  const legacy = newPlayer();
  const old = restorePlayer(JSON.stringify(legacy));
  assert.equal(old.kartColor, undefined);
  assert.equal(old.kartMode, undefined);
  for (const [color, mode] of [
    ["purple", "slow"],
    [3, true],
    [null, "FAST"],
  ]) {
    const bad = restorePlayer(
      JSON.stringify({ ...legacy, kartColor: color, kartMode: mode }),
    );
    assert.equal(bad.kartColor, undefined);
    assert.equal(bad.kartMode, undefined);
  }
});

test("an Animal Orchestra song counts once per song, stamps the first, and never overflows", () => {
  const first = completeAnimalBand(newPlayer(), 6);
  assert.equal(first.animalBandSongs, 1);
  assert.equal(first.gamesPlayed, 1);
  assert.deepEqual(first.stamps, ["animal_band_maestro"]);
  const second = completeAnimalBand(first, 10);
  assert.equal(second.animalBandSongs, 2);
  assert.deepEqual(second.stamps, ["animal_band_maestro"]);
  for (const bad of [0, 11, 2.5, Number.NaN]) {
    assert.equal(completeAnimalBand(first, bad), first);
  }
  const full = {
    ...first,
    animalBandSongs: Number.MAX_SAFE_INTEGER,
  };
  assert.equal(completeAnimalBand(full, 4), full);
});

test("a Shape Sorter round counts once and only the last round earns the stamp", () => {
  const round1 = completeShapeSorterRound(newPlayer(), 1);
  assert.equal(round1.shapeSorterRounds, 1);
  assert.equal(completeShapeSorterRound(round1, 1), round1);
  assert.equal(round1.stamps?.length ?? 0, 0);
  const round3 = completeShapeSorterRound(
    completeShapeSorterRound(round1, 2),
    3,
  );
  assert.equal(round3.shapeSorterRounds, 3);
  assert.deepEqual(round3.stamps, ["shape_sorter_star"]);
  for (const bad of [0, 4, 1.5, Number.NaN]) {
    assert.equal(completeShapeSorterRound(round1, bad), round1);
  }
  const completed = { ...round3, shapeSorterRounds: SHAPE_SORTER_ROUNDS };
  assert.equal(completeShapeSorterRound(completed, 3), completed);
});

test("animal band and shape sorter progress survives a save and bad values are dropped", () => {
  const played = completeShapeSorterRound(
    completeAnimalBand(newPlayer(), 3),
    1,
  );
  const restored = restorePlayer(JSON.stringify(played));
  assert.equal(restored.animalBandSongs, 1);
  assert.equal(restored.shapeSorterRounds, 1);
  const tampered = restorePlayer(
    JSON.stringify({
      ...played,
      animalBandSongs: 2.5,
      shapeSorterRounds: -2,
    }),
  );
  assert.equal(tampered.animalBandSongs, undefined);
  assert.equal(tampered.shapeSorterRounds, undefined);
});

test("pet species survives V1 and V2 saves and unknown values fall back to lion", () => {
  const bunny = {
    ...DEFAULT_PET_STATE,
    species: "bunny" as const,
    name: "Hop",
  };
  const v2 = migratePlayerSave({ ...newPlayer(), pet: bunny });
  assert.equal(v2.pet.species, "bunny");
  assert.equal(migratePlayerSave(JSON.stringify(v2)).pet.species, "bunny");
  const legacy = {
    ...newPlayer(),
    pet: { ...DEFAULT_PET_STATE, species: "wizard" },
  };
  assert.equal(migratePlayerSave(legacy).pet.species, "lion");
  const { species: _species, ...unlabeled } = DEFAULT_PET_STATE;
  assert.equal(
    migratePlayerSave({ ...newPlayer(), pet: unlabeled }).pet.species,
    "lion",
  );
  assert.equal(migratePlayerSave(newPlayer()).pet.species, "lion");
});

test("a V2 save with an unknown pet species restores as a lion cub", () => {
  const current = migratePlayerSave(newPlayer());
  const tampered = { ...current, pet: { ...current.pet, species: "dinosaur" } };
  assert.equal(migratePlayerSave(tampered).pet.species, "lion");
  assert.equal(migratePlayerSave(tampered).pet.name, "Leo");
});

test("choosePetSpecies swaps species, renames the pet and keeps its position", () => {
  const player = migratePlayerSave(newPlayer());
  const dragon = choosePetSpecies(player, "dragon");
  assert.equal(dragon.pet.species, "dragon");
  assert.equal(dragon.pet.name, "Ember");
  assert.deepEqual(dragon.pet.position, player.pet.position);
  assert.equal(choosePetSpecies(dragon, "dragon"), dragon);
  assert.equal(choosePetSpecies(dragon, "lion").pet.name, "Leo");
  assert.equal(player.pet.species, "lion");
});

test("a Picture Puzzle pays once per finish and only the nine-piece picture earns the stamp", () => {
  const four = completePicturePuzzle(newPlayer(), 4);
  assert.equal(four.picturePuzzles, 1);
  assert.equal(four.stamps?.length ?? 0, 0);
  const nine = completePicturePuzzle(completePicturePuzzle(four, 6), 9);
  assert.equal(nine.picturePuzzles, 3);
  assert.deepEqual(nine.stamps, ["picture_puzzle_star"]);
  for (const bad of [0, 5, 9.5, Number.NaN]) {
    assert.equal(completePicturePuzzle(four, bad), four);
  }
  const capped = { ...four, picturePuzzles: Number.MAX_SAFE_INTEGER };
  assert.equal(completePicturePuzzle(capped, 4), capped);
});

test("a Balloon Parade rainbow counts once and the first arch earns its stamp", () => {
  const first = completeBalloonRainbow(newPlayer());
  assert.equal(first.balloonRainbows, 1);
  assert.deepEqual(first.stamps, ["balloon_rainbow"]);
  const second = completeBalloonRainbow(first);
  assert.equal(second.balloonRainbows, 2);
  assert.deepEqual(second.stamps, ["balloon_rainbow"]);
  const capped = { ...first, balloonRainbows: Number.MAX_SAFE_INTEGER };
  assert.equal(completeBalloonRainbow(capped), capped);
});

test("picture puzzle and balloon progress survives a save and bad values are dropped", () => {
  const played = completeBalloonRainbow(completePicturePuzzle(newPlayer(), 6));
  const restored = restorePlayer(JSON.stringify(played));
  assert.equal(restored.picturePuzzles, 1);
  assert.equal(restored.balloonRainbows, 1);
  const tampered = restorePlayer(
    JSON.stringify({
      ...played,
      picturePuzzles: 2.5,
      balloonRainbows: -1,
    }),
  );
  assert.equal(tampered.picturePuzzles, undefined);
  assert.equal(tampered.balloonRainbows, undefined);
});

test("a save from before these games loads with no progress for them", () => {
  const old = restorePlayer(
    JSON.stringify({ ...newPlayer(), picturePuzzles: undefined }),
  );
  assert.equal(old.picturePuzzles, undefined);
  assert.equal(old.balloonRainbows, undefined);
});

test("saves written when coins existed still load and drop the old balance", () => {
  const legacy = { ...newPlayer(), coins: 777 };
  const restored = restorePlayer(JSON.stringify(legacy));
  assert.equal(restored.name, legacy.name);
  assert.deepEqual(restored.owned, legacy.owned);
  assert.equal(Reflect.has(restored, "coins"), false);
  const migrated = migratePlayerSave(legacy);
  assert.equal(Reflect.has(migrated, "coins"), false);
});

test("smoothie orders count once each and never overflow the counter", () => {
  const player = newPlayer();
  const served = completeSmoothieOrder(player);
  assert.equal(served.smoothiesServed, 1);
  assert.equal(completeSmoothieOrder(served).smoothiesServed, 2);
  const fullCounter = { ...player, smoothiesServed: Number.MAX_SAFE_INTEGER };
  assert.equal(completeSmoothieOrder(fullCounter), fullCounter);
});

test("fishing catches reject invalid inputs", () => {
  const player = newPlayer();
  const badCases = [
    { speciesId: "golden_catfish", weight: -1 },
    { speciesId: "golden_catfish", weight: NaN },
    { speciesId: "not_a_fish", weight: 8.4 },
  ];
  for (const catchResult of badCases) {
    assert.equal(completeFishingCatch(player, catchResult), player);
  }
});

test("DJ Beat Drop rejects impossible runs", () => {
  const player = newPlayer();
  assert.equal(completeDJBeatDrop(player, 6801, 32), player);
  assert.equal(completeDJBeatDrop(player, 100, 33), player);
  assert.equal(completeDJBeatDrop(player, 6800, 32).gamesPlayed, 1);
  const invalidBest = restorePlayer(
    JSON.stringify({ ...player, djBeatDropBest: 6801 }),
  );
  assert.equal(invalidBest.djBeatDropBest, undefined);
});

test("arcade completions reject overflowing play counters", () => {
  const completions = [
    completeGame,
    completeMangoRun,
    completeBeeStop,
    completePawSteps,
  ];
  for (const complete of completions) {
    const counter = { ...newPlayer(), gamesPlayed: Number.MAX_SAFE_INTEGER };
    assert.equal(complete(counter, 0), counter);
    const played = complete(newPlayer(), 1);
    assert.equal(played.gamesPlayed, 1);
    assert.deepEqual(restorePlayer(JSON.stringify(played)), played);
  }
});

test("Fruit Catch rejects an overflowing play counter", () => {
  const counter = { ...newPlayer(), gamesPlayed: Number.MAX_SAFE_INTEGER };
  assert.equal(completeFruitCatch(counter, 0, 0, 0), counter);
  const completed = completeFruitCatch(newPlayer(), 1, 0, 10);
  assert.deepEqual(restorePlayer(JSON.stringify(completed)), completed);
});

test("foghorn stamp unlocks once and persists alongside coastal visits", () => {
  const player = migratePlayerSave(newPlayer());
  const before = structuredClone(player);
  const unlocked = unlockStamp(player, "lighthouse_foghorn");
  assert.deepEqual(unlocked.stamps, ["lighthouse_foghorn"]);
  assert.deepEqual(player, before);
  assert.equal(unlockStamp(unlocked, "lighthouse_foghorn"), unlocked);
  const visited = visitPlace(
    visitPlace(unlocked, "sunset-beach"),
    "coastal-pier",
  );
  const restored = migratePlayerSave(JSON.parse(JSON.stringify(visited)));
  assert.deepEqual(restored.stamps, unlocked.stamps);
  assert.ok(restored.visited.includes("sunset-beach"));
  assert.ok(restored.visited.includes("coastal-pier"));
  assert.equal(unlockStamp(restored, "lighthouse_foghorn"), restored);
});

test("sled completion raises best and rejects invalid results", () => {
  const player = newPlayer();
  const result = {
    distance: 800,
    pineconesCollected: 3,
    tricksCompleted: 2,
    crashed: false,
  };
  const completed = completeSledRun(player, result);
  assert.equal(completed.sledRunBest, 75);
  assert.equal(completed.gamesPlayed, 1);
  const crashed = completeSledRun(completed, {
    ...result,
    distance: 200,
    crashed: true,
    pineconesCollected: 0,
    tricksCompleted: 0,
  });
  assert.equal(crashed.sledRunBest, 75);
  assert.equal(crashed.gamesPlayed, 2);
  for (const invalid of [
    { ...result, distance: 400 },
    { ...result, distance: NaN },
    { ...result, distance: 801 },
    { ...result, pineconesCollected: -1 },
    { ...result, pineconesCollected: 10000 },
    { ...result, tricksCompleted: 0.5 },
    { ...result, tricksCompleted: 10000 },
  ])
    assert.equal(completeSledRun(player, invalid), player);
});

test("kart races count once per race and keep the best lap", () => {
  const player = newPlayer();
  const first = completeKartRace(player, {
    raceNumber: 1,
    place: 2,
    bestLapMs: 7400,
  });
  assert.equal(first.kartRacesFinished, 1);
  assert.equal(first.kartBestLapMs, 7400);
  assert.equal(first.gamesPlayed, player.gamesPlayed + 1);
  // The same finished race reported again (double tap, re-render) counts nothing.
  assert.equal(
    completeKartRace(first, { raceNumber: 1, place: 2, bestLapMs: 7400 }),
    first,
  );
  const second = completeKartRace(first, {
    raceNumber: 2,
    place: 4,
    bestLapMs: 9100,
  });
  assert.equal(second.kartRacesFinished, 2);
  assert.equal(second.kartBestLapMs, 7400);
  const third = completeKartRace(second, {
    raceNumber: 3,
    place: 1,
    bestLapMs: 6200,
  });
  assert.equal(third.kartBestLapMs, 6200);
  for (const bad of [
    { raceNumber: 3, place: 1, bestLapMs: 6000 },
    { raceNumber: 5, place: 1, bestLapMs: 6000 },
    { raceNumber: 4, place: 0, bestLapMs: 6000 },
    { raceNumber: 4, place: 5, bestLapMs: 6000 },
    { raceNumber: 4, place: 1.5, bestLapMs: 6000 },
  ])
    assert.equal(completeKartRace(third, bad), third);
  const noLap = completeKartRace(third, {
    raceNumber: 4,
    place: 3,
    bestLapMs: -5,
  });
  assert.equal(noLap.kartRacesFinished, 4);
  assert.equal(noLap.kartBestLapMs, 6200);
});

test("songs, puzzles and rainbows keep counting past the old payout caps", () => {
  const busy = {
    ...newPlayer(),
    animalBandSongs: 25,
    picturePuzzles: 60,
    balloonRainbows: 30,
  };
  assert.equal(completeAnimalBand(busy, 4).animalBandSongs, 26);
  assert.equal(completePicturePuzzle(busy, 4).picturePuzzles, 61);
  assert.equal(completeBalloonRainbow(busy).balloonRainbows, 31);
  const restored = restorePlayer(
    JSON.stringify({ ...busy, animalBandSongs: 99, picturePuzzles: 99 }),
  );
  assert.equal(restored.animalBandSongs, 99);
  assert.equal(restored.picturePuzzles, 99);
});

const HUNT_DAY = "2026-10-16";

test("finding five square butterflies earns Butterfly Catcher once", async () => {
  const { findSquareButterfly } = await import("./game.ts");
  const { butterfliesForDay } = await import("./utils/squareFun.ts");
  let player = newPlayer();
  for (const spot of butterfliesForDay(HUNT_DAY))
    player = findSquareButterfly(player, HUNT_DAY, spot);
  assert.equal(player.squareButterflies?.found.length, 5);
  assert.deepEqual(
    player.stamps?.filter((id) => id === "square_butterflies"),
    ["square_butterflies"],
  );
});

test("findSquareButterfly ignores a repeat find", async () => {
  const { findSquareButterfly } = await import("./game.ts");
  const { butterfliesForDay } = await import("./utils/squareFun.ts");
  const spot = butterfliesForDay(HUNT_DAY)[0];
  const once = findSquareButterfly(newPlayer(), HUNT_DAY, spot);
  assert.equal(findSquareButterfly(once, HUNT_DAY, spot), once);
});

test("findSquareButterfly ignores a spot that is not hiding a butterfly today", async () => {
  const { findSquareButterfly } = await import("./game.ts");
  const { butterfliesForDay, BUTTERFLY_SPOTS } =
    await import("./utils/squareFun.ts");
  const hidden = butterfliesForDay(HUNT_DAY);
  const empty = BUTTERFLY_SPOTS.findIndex((_, i) => !hidden.includes(i));
  const player = newPlayer();
  assert.equal(findSquareButterfly(player, HUNT_DAY, empty), player);
  assert.equal(findSquareButterfly(player, HUNT_DAY, -1), player);
});

test("a new day starts a fresh hunt", async () => {
  const { findSquareButterfly } = await import("./game.ts");
  const { butterfliesForDay } = await import("./utils/squareFun.ts");
  const [a, b] = butterfliesForDay(HUNT_DAY);
  const yesterday = findSquareButterfly(
    findSquareButterfly(newPlayer(), HUNT_DAY, a),
    HUNT_DAY,
    b,
  );
  const next = "2026-10-17";
  const spot = butterfliesForDay(next)[0];
  assert.deepEqual(
    findSquareButterfly(yesterday, next, spot).squareButterflies,
    { day: next, found: [spot] },
  );
});

test("restorePlayer drops a malformed butterfly hunt", () => {
  for (const squareButterflies of [
    { day: 5 },
    { day: HUNT_DAY, found: [99] },
    { day: "x", found: [] },
    { day: HUNT_DAY, found: [1, 1] },
  ]) {
    const restored = restorePlayer(
      JSON.stringify({ ...newPlayer(), name: "Roary", squareButterflies }),
    );
    assert.equal(restored.squareButterflies, undefined);
    assert.equal(restored.name, "Roary");
  }
});

test("saves without a butterfly hunt still load", () => {
  assert.deepEqual(restorePlayer(JSON.stringify(newPlayer())), newPlayer());
});

test("serving a halo-halo counts once per cup and the first cup earns its stamp", async () => {
  const { completeHaloHalo } = await import("./game.ts");
  const first = completeHaloHalo(newPlayer(), ["ice", "ube", "icecream"]);
  assert.equal(first.haloHaloServed, 1);
  assert.equal(first.gamesPlayed, 1);
  assert.deepEqual(first.stamps, ["halo_halo_chef"]);
  const second = completeHaloHalo(first, ["flan"]);
  assert.equal(second.haloHaloServed, 2);
  assert.deepEqual(second.stamps, ["halo_halo_chef"]);
  for (const bad of [[], ["rocks"], Array(7).fill("ice")])
    assert.equal(completeHaloHalo(first, bad), first);
  const full = { ...first, haloHaloServed: Number.MAX_SAFE_INTEGER };
  assert.equal(completeHaloHalo(full, ["ice"]), full);
});

test("halo-halo progress survives a save and bad counts are dropped", async () => {
  const { completeHaloHalo } = await import("./game.ts");
  const played = completeHaloHalo(newPlayer(), ["ice"]);
  assert.equal(restorePlayer(JSON.stringify(played)).haloHaloServed, 1);
  const tampered = restorePlayer(
    JSON.stringify({ ...played, haloHaloServed: -3 }),
  );
  assert.equal(tampered.haloHaloServed, undefined);
  assert.equal(migratePlayerSave(played).haloHaloServed, 1);
});

test("a firefly round saves the best jar once and the catcher stamp at 15", async () => {
  const { completeFireflies } = await import("./game.ts");
  const start = newPlayer();
  const low = completeFireflies(start, 9);
  assert.equal(low.fireflyBest, 9);
  assert.equal(low.gamesPlayed, start.gamesPlayed + 1);
  assert.ok(!(low.stamps ?? []).includes("firefly_catcher"));
  const high = completeFireflies(low, 16);
  assert.equal(high.fireflyBest, 16);
  assert.ok((high.stamps ?? []).includes("firefly_catcher"));
  assert.equal(completeFireflies(high, 4).fireflyBest, 16);
  assert.equal(completeFireflies(high, -1), high);
  assert.equal(completeFireflies(high, 1.5), high);
  assert.equal(completeFireflies(high, 100000), high);
  assert.equal(restorePlayer(JSON.stringify(high)).fireflyBest, 16);
  assert.equal(migratePlayerSave(high).fireflyBest, 16);
  const tampered = restorePlayer(
    JSON.stringify({ ...high, fireflyBest: "lots" }),
  );
  assert.equal(tampered.fireflyBest, undefined);
});

test("peekaboo saves the best first-try finds and the stamp at 6", async () => {
  const { completePeekaboo } = await import("./game.ts");
  const start = newPlayer();
  const some = completePeekaboo(start, 4);
  assert.equal(some.peekabooBest, 4);
  assert.equal(some.gamesPlayed, start.gamesPlayed + 1);
  assert.ok(!(some.stamps ?? []).includes("peekaboo_pro"));
  const great = completePeekaboo(some, 7);
  assert.ok((great.stamps ?? []).includes("peekaboo_pro"));
  assert.equal(completePeekaboo(great, 2).peekabooBest, 7);
  assert.equal(completePeekaboo(great, 9), great);
  assert.equal(completePeekaboo(great, -1), great);
  assert.equal(restorePlayer(JSON.stringify(great)).peekabooBest, 7);
  assert.equal(
    restorePlayer(JSON.stringify({ ...great, peekabooBest: 99 })).peekabooBest,
    undefined,
  );
});

test("a pet show counts once; a 3-star show earns the Pet Stylist stamp", async () => {
  const { completeDressPet } = await import("./game.ts");
  const start = newPlayer();
  const shown = completeDressPet(start, "beach", { hat: "crown" });
  assert.equal(shown.petShows, 1);
  assert.equal(shown.gamesPlayed, start.gamesPlayed + 1);
  assert.ok(!(shown.stamps ?? []).includes("pet_stylist"));
  const perfect = completeDressPet(shown, "beach", {
    hat: "sunhat",
    eyes: "shades",
    neck: "lei",
    extra: "beachball",
  });
  assert.equal(perfect.petShows, 2);
  assert.ok((perfect.stamps ?? []).includes("pet_stylist"));
  assert.equal(completeDressPet(perfect, "beach", {}), perfect);
  assert.equal(completeDressPet(perfect, "moon", { hat: "crown" }), perfect);
  assert.equal(restorePlayer(JSON.stringify(perfect)).petShows, 2);
  assert.equal(
    restorePlayer(JSON.stringify({ ...perfect, petShows: -2 })).petShows,
    undefined,
  );
});

test("a pet round-up saves the best score once and the stamp when all are in", async () => {
  const { completePetRoundUp } = await import("./game.ts");
  const start = newPlayer();
  assert.equal(restorePlayer(JSON.stringify(start)).petRoundUpBest, undefined);
  const low = completePetRoundUp(start, 5);
  assert.equal(low.petRoundUpBest, 5);
  assert.equal(low.gamesPlayed, start.gamesPlayed + 1);
  assert.ok(!(low.stamps ?? []).includes("pet_wrangler"));
  const high = completePetRoundUp(low, 40);
  assert.equal(high.petRoundUpBest, 40);
  assert.ok((high.stamps ?? []).includes("pet_wrangler"));
  assert.equal(completePetRoundUp(high, 3).petRoundUpBest, 40);
  assert.equal(completePetRoundUp(high, -1), high);
  assert.equal(completePetRoundUp(high, 2.5), high);
  assert.equal(completePetRoundUp(high, 100000), high);
  assert.equal(restorePlayer(JSON.stringify(high)).petRoundUpBest, 40);
  assert.equal(migratePlayerSave(high).petRoundUpBest, 40);
  assert.equal(
    restorePlayer(JSON.stringify({ ...high, petRoundUpBest: "lots" }))
      .petRoundUpBest,
    undefined,
  );
  assert.equal(
    restorePlayer(JSON.stringify({ ...high, petRoundUpBest: 100000 }))
      .petRoundUpBest,
    undefined,
  );
});

test("movePropSpot keeps a moved prop inside the stage and resets it when null", async () => {
  const { movePropSpot } = await import("./game.ts");
  const moved = movePropSpot(newPlayer(), "kainan", "banana", {
    x: 5000,
    y: 300,
  });
  assert.deepEqual(moved.propSpots, { "kainan:banana": { x: 2360, y: 300 } });
  const home = movePropSpot(moved, "kainan", "banana", null);
  assert.deepEqual(home.propSpots, {});
});

test("movePropSpot ignores unknown rooms, unknown props and bad numbers", async () => {
  const { movePropSpot } = await import("./game.ts");
  const player = newPlayer();
  assert.equal(movePropSpot(player, "kainan", "piano", { x: 1, y: 1 }), player);
  assert.equal(
    movePropSpot(player, "nowhere", "banana", { x: 1, y: 1 }),
    player,
  );
  assert.equal(
    movePropSpot(player, "kainan", "banana", { x: Number.NaN, y: 1 }),
    player,
  );
});

test("saved prop spots restore clamped, and junk or unknown keys are dropped", () => {
  const save = JSON.stringify({
    ...newPlayer(),
    propSpots: {
      "kainan:banana": { x: 900, y: 9000 },
      "kainan:piano": { x: 1, y: 1 },
      "kainan:rice": { x: "1", y: 2 },
      "nowhere:banana": { x: 1, y: 1 },
    },
  });
  assert.deepEqual(restorePlayer(save).propSpots, {
    "kainan:banana": { x: 900, y: 700 },
  });
  assert.deepEqual(
    restorePlayer(JSON.stringify({ ...newPlayer(), propSpots: [1] })).propSpots,
    {},
  );
  assert.equal(restorePlayer(JSON.stringify(newPlayer())).propSpots, undefined);
});

test("collecting today's pin keeps it once; five pins earn the Pin Collector stamp", async () => {
  const { collectPin } = await import("./game.ts");
  const { pinForDay } = await import("./utils/pins.ts");
  const days = [
    "2026-11-01",
    "2026-11-02",
    "2026-11-03",
    "2026-11-04",
    "2026-11-05",
    "2026-11-06",
    "2026-11-07",
    "2026-11-08",
    "2026-11-09",
  ];
  let player = newPlayer();
  const today = pinForDay(days[0]);
  player = collectPin(player, days[0], today.id);
  assert.deepEqual(player.pins, [today.id]);
  assert.equal(collectPin(player, days[0], today.id), player);
  const wrong = days
    .map((d) => pinForDay(d).id)
    .find((id) => id !== pinForDay(days[1]).id);
  assert.equal(collectPin(player, days[1], wrong ?? "nope"), player);
  for (const day of days) player = collectPin(player, day, pinForDay(day).id);
  assert.ok((player.pins ?? []).length >= 5);
  assert.ok((player.stamps ?? []).includes("pin_collector"));
  assert.deepEqual(restorePlayer(JSON.stringify(player)).pins, player.pins);
  assert.deepEqual(
    restorePlayer(
      JSON.stringify({ ...player, pins: ["fake", today.id, today.id, 3] }),
    ).pins,
    [today.id],
  );
});

test("gold and bought pixel pieces survive a reload; old saves start with gold", async () => {
  const { restorePlayer } = await import("./game.ts");
  const { goldOf, STARTING_GOLD } = await import("./utils/gold.ts");
  const old = restorePlayer(JSON.stringify(newPlayer()));
  assert.equal(goldOf(old), STARTING_GOLD);
  const save = {
    ...newPlayer(),
    gold: 75,
    owned: ["scarf", "px:costume:ufo", "px:costume:bogus"],
  };
  const restored = restorePlayer(JSON.stringify(save));
  assert.equal(restored.gold, 75);
  assert.deepEqual(restored.owned, ["scarf", "px:costume:ufo"]);
  assert.equal(
    restorePlayer(JSON.stringify({ ...save, gold: -5 })).gold,
    undefined,
  );
});
