import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MINIGAME_METAS,
  calculateTier,
  getPlayerScore,
  getLeaderboardEntries,
  playLeaderboardSound,
} from "./leaderboard.ts";
import type { PlayerBase } from "../game.ts";

const createMockPlayer = (overrides: Partial<PlayerBase> = {}): PlayerBase => ({
  name: "Simba",
  coins: 500,
  color: "gold",
  accessory: "scarf",
  owned: ["scarf"],
  met: [],
  visited: ["arcade"],
  gamesPlayed: 5,
  beeStopBest: 150,
  pawStepsBest: 9,
  fruitCatchBest: 320,
  sledRunBest: 600,
  claimed: [],
  decor: [],
  djBeatDropBest: 4500,
  riverSurfBest: 2500,
  smoothiesServed: 35,
  fashionBestScore: 850,
  mangoRunBest: 25,
  ...overrides,
});

describe("Arcade Leaderboard Utility", () => {
  it("defines metadata for all 9 savanna minigames", () => {
    const minigames = [
      "dj-beat-drop",
      "river-surf",
      "extreme-sled",
      "smoothie-kitchen",
      "fashion-show",
      "mango-run",
      "fruit-catch",
      "paw-steps",
      "bee-stop",
    ] as const;

    for (const id of minigames) {
      const meta = MINIGAME_METAS[id];
      assert.ok(meta, `Metadata should exist for ${id}`);
      assert.ok(meta.name.length > 0);
      assert.ok(meta.unit.length > 0);
      assert.ok(meta.scoreLabel.length > 0);
    }
  });

  it("calculates accurate tier based on rank", () => {
    assert.equal(calculateTier(1), "grandmaster");
    assert.equal(calculateTier(2), "diamond");
    assert.equal(calculateTier(3), "diamond");
    assert.equal(calculateTier(4), "gold");
    assert.equal(calculateTier(6), "gold");
    assert.equal(calculateTier(7), "silver");
    assert.equal(calculateTier(10), "silver");
    assert.equal(calculateTier(11), "bronze");
    assert.equal(calculateTier(99), "bronze");
  });

  it("extracts correct player scores for each minigame", () => {
    const player = createMockPlayer();
    assert.equal(getPlayerScore("dj-beat-drop", player), 4500);
    assert.equal(getPlayerScore("river-surf", player), 2500);
    assert.equal(getPlayerScore("extreme-sled", player), 600);
    assert.equal(getPlayerScore("smoothie-kitchen", player), 35);
    assert.equal(getPlayerScore("fashion-show", player), 850);
    assert.equal(getPlayerScore("mango-run", player), 25);
    assert.equal(getPlayerScore("fruit-catch", player), 320);
    assert.equal(getPlayerScore("paw-steps", player), 9);
    assert.equal(getPlayerScore("bee-stop", player), 150);
  });

  it("returns 0 for undefined minigame scores", () => {
    const freshPlayer = createMockPlayer({
      djBeatDropBest: undefined,
      riverSurfBest: undefined,
    });
    assert.equal(getPlayerScore("dj-beat-drop", freshPlayer), 0);
    assert.equal(getPlayerScore("river-surf", freshPlayer), 0);
  });

  it("ranks player accurately among legends", () => {
    // DJ_Roar is 4850, VelvetLioness is 4120. Player has 4500.
    // So player should be rank 2!
    const player = createMockPlayer({ djBeatDropBest: 4500 });
    const entries = getLeaderboardEntries("dj-beat-drop", player);

    assert.equal(entries.length, 6);
    const playerEntry = entries.find((e) => e.isPlayer);
    assert.ok(playerEntry);
    assert.equal(playerEntry.rank, 2);
    assert.equal(playerEntry.name, "Simba");
    assert.equal(playerEntry.score, 4500);
    assert.equal(playerEntry.tier, "diamond");

    // Leader is rank 1
    assert.equal(entries[0].name, "DJ_Roar");
    assert.equal(entries[0].rank, 1);
    assert.equal(entries[0].tier, "grandmaster");
  });

  it("ranks player at #1 Grandmaster if beating the high score", () => {
    const godPlayer = createMockPlayer({ djBeatDropBest: 9999 });
    const entries = getLeaderboardEntries("dj-beat-drop", godPlayer);

    assert.equal(entries[0].isPlayer, true);
    assert.equal(entries[0].rank, 1);
    assert.equal(entries[0].tier, "grandmaster");
  });

  it("handles player ties in favor of player", () => {
    // VelvetLioness has 4120. Give player 4120.
    const player = createMockPlayer({ djBeatDropBest: 4120 });
    const entries = getLeaderboardEntries("dj-beat-drop", player);

    const playerEntry = entries.find((e) => e.isPlayer);
    assert.ok(playerEntry);
    const lionessEntry = entries.find((e) => e.name === "VelvetLioness");
    assert.ok(lionessEntry);
    assert.ok(playerEntry.rank <= lionessEntry.rank);
  });

  it("playLeaderboardSound safely executes without window AudioContext", () => {
    // Node environment has no window.AudioContext; must not throw
    assert.doesNotThrow(() => {
      playLeaderboardSound("tab");
      playLeaderboardSound("trophy");
      playLeaderboardSound("rank_up");
    });
  });
});
