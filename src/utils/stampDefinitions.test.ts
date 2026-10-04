import { test } from "node:test";
import assert from "node:assert/strict";
import { newPlayer, migratePlayerSave } from "../game.ts";
import { DEFAULT_AVATAR_LOOK, CATALOG_ITEMS } from "../types/world.ts";
import {
  STAMP_DEFINITIONS,
  isStampUnlocked,
  evaluateStampUnlocks,
} from "./stampDefinitions.ts";

const required = {
  world_secrets: [
    "catalog_barista",
    "catalog_visor",
    "catalog_wreath",
    "catalog_pirate",
    "lion_fountain",
    "night_mode",
    "secret_den",
  ],
  park_thrills: [
    "coaster_screamer",
    "ferris_panoramic",
    "mango_teacups",
    "golden_carousel",
    "flume_splash",
    "photo_souvenir",
    "wave_pool",
  ],
  fashion_style: [
    "salon_makeover",
    "board_equipped",
    "wardrobe_five",
    "wardrobe_ten",
    "custom_palette",
    "status_quote",
    "hair_highlight",
  ],
  arcade_mastery: [
    "mango_run_pro",
    "fruit_catch_pro",
    "bee_stop_perfect",
    "paw_steps_expert",
    "dj_beat_combo",
    "smoothie_chef",
    "memory_safari_master",
  ],
};

test("the album defines at least 26 unique, fully described stamps across four categories", () => {
  assert.ok(STAMP_DEFINITIONS.length >= 26);
  assert.equal(
    new Set(STAMP_DEFINITIONS.map((stamp) => stamp.id)).size,
    STAMP_DEFINITIONS.length,
  );
  for (const [category, ids] of Object.entries(required)) {
    const categoryStamps = STAMP_DEFINITIONS.filter(
      (stamp) => stamp.category === category,
    );
    assert.ok(categoryStamps.length >= 6);
    for (const id of ids)
      assert.ok(
        categoryStamps.some((stamp) => stamp.id === id),
        id,
      );
  }
  for (const stamp of STAMP_DEFINITIONS) {
    for (const value of [
      stamp.name,
      stamp.description,
      stamp.icon,
      stamp.unlockHint,
    ])
      assert.ok(value.trim());
  }
});

test("unlock checks read permanent collection membership and reject unknown IDs", () => {
  const player = { ...newPlayer(), stamps: ["secret_den", "invalid"] };
  assert.equal(isStampUnlocked(player, "secret_den"), true);
  assert.equal(isStampUnlocked(player, "catalog_barista"), false);
  assert.equal(isStampUnlocked(player, "invalid"), false);
  const { stamps: _stamps, ...legacy } = newPlayer();
  assert.equal(isStampUnlocked(legacy, "secret_den"), false);
});

test("fresh players qualify for no stamps and evaluation never mutates progress", () => {
  const player = newPlayer();
  const before = structuredClone(player);
  assert.deepEqual(evaluateStampUnlocks(player), []);
  assert.deepEqual(evaluateStampUnlocks(migratePlayerSave(player)), []);
  assert.deepEqual(player, before);
});

test("evaluation recognizes catalog secrets and den visits without mistaking scenery visits for completed rides", () => {
  const player = {
    ...newPlayer(),
    owned: [
      "scarf",
      "barista_apron",
      "retro_neon_visor",
      "golden_mane_wreath",
      "eyepatch_cutlass",
    ],
    visited: ["den", "wonder-park-entrance"] as const,
  };
  const earned = evaluateStampUnlocks({
    ...player,
    visited: [...player.visited],
  });
  assert.deepEqual(earned, [
    "catalog_barista",
    "catalog_visor",
    "catalog_wreath",
    "catalog_pirate",
    "secret_den",
    "wardrobe_five",
  ]);
});

test("wardrobe milestones count distinct wearable items and exclude decor or unknown IDs", () => {
  assert.deepEqual(
    evaluateStampUnlocks({
      ...newPlayer(),
      owned: ["scarf", "scarf", "plant", "cushion", "unknown"],
    }),
    [],
  );
  const five = ["scarf", "hat", "glasses", "flower", "classic_shag"];
  assert.deepEqual(evaluateStampUnlocks({ ...newPlayer(), owned: five }), [
    "wardrobe_five",
  ]);
  const ten = CATALOG_ITEMS.filter((item) => !item.isSecret)
    .slice(0, 10)
    .map((item) => item.id);
  assert.deepEqual(evaluateStampUnlocks({ ...newPlayer(), owned: ten }), [
    "wardrobe_five",
    "wardrobe_ten",
  ]);
});

test("look and status evaluation supports v2 players and suppresses already collected stamps", () => {
  const player = {
    ...migratePlayerSave(newPlayer()),
    look: {
      ...DEFAULT_AVATAR_LOOK,
      hairId: "long_waves",
      hairColor: "#ff7675",
      boardId: "hover_leaf",
    },
    moodQuote: "Ready to explore!",
    stamps: ["salon_makeover"],
  };
  const before = structuredClone(player);
  assert.deepEqual(evaluateStampUnlocks(player), [
    "board_equipped",
    "custom_palette",
    "status_quote",
  ]);
  assert.deepEqual(player, before);
  assert.deepEqual(
    evaluateStampUnlocks({
      ...migratePlayerSave(newPlayer()),
      moodQuote: "  ",
    }),
    [],
  );
});

test("arcade milestones require their own score thresholds rather than total plays", () => {
  const player = {
    ...newPlayer(),
    gamesPlayed: 100,
    mangoRunBest: 99,
    fruitCatchBest: 99,
    beeStopBest: 999,
    pawStepsBest: 9,
    smoothiesServed: 4,
    djBeatDropBest: 6800,
  };
  assert.deepEqual(evaluateStampUnlocks(player), []);
  assert.deepEqual(
    evaluateStampUnlocks({
      ...player,
      mangoRunBest: 100,
      fruitCatchBest: 100,
      beeStopBest: 1000,
      pawStepsBest: 10,
      smoothiesServed: 5,
    }),
    [
      "mango_run_pro",
      "fruit_catch_pro",
      "bee_stop_perfect",
      "paw_steps_expert",
      "smoothie_chef",
    ],
  );
  assert.deepEqual(
    evaluateStampUnlocks({
      ...player,
      beeStopBest: 1000,
      stamps: ["bee_stop_perfect"],
    }),
    [],
  );
});
