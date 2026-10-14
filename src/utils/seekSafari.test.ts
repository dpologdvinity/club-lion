import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SEEK_DECOYS_HARD,
  SEEK_SCENES,
  SEEK_TARGETS_PER_ROUND,
  getSeekScene,
  isSeekScene,
  planSeekRound,
  seekRoundCoins,
} from "./seekSafari.ts";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

test("every scene has enough critters and hiding spots for a hard round", () => {
  for (const id of SEEK_SCENES) {
    const scene = getSeekScene(id);
    const needed = SEEK_TARGETS_PER_ROUND + SEEK_DECOYS_HARD;
    assert.ok(scene.critters.length >= needed, id);
    assert.ok(scene.spots.length >= needed, id);
    assert.equal(
      new Set(scene.critters.map((c) => c.id)).size,
      scene.critters.length,
    );
  }
});

test("hiding spots stay far enough apart for 56px targets on a 334px-wide scene", () => {
  const minX = (56 / 334) * 100 - 0.5;
  const minY = (56 / (334 * 0.625)) * 100;
  for (const id of SEEK_SCENES) {
    const { spots } = getSeekScene(id);
    spots.forEach((a, i) =>
      spots.slice(i + 1).forEach((b) => {
        assert.ok(
          Math.abs(a.x - b.x) >= minX || Math.abs(a.y - b.y) >= minY,
          `${id}: ${a.x},${a.y} vs ${b.x},${b.y}`,
        );
      }),
    );
  }
});

test("rounds hide five different critters in five different spots", () => {
  for (const id of SEEK_SCENES) {
    for (let seed = 1; seed < 30; seed++) {
      const round = planSeekRound(id, seed % 2 === 0, seeded(seed));
      const all = [...round.targets, ...round.decoys];
      assert.equal(round.targets.length, SEEK_TARGETS_PER_ROUND);
      assert.equal(new Set(all.map((p) => p.critter.id)).size, all.length);
      assert.equal(new Set(all.map((p) => `${p.x},${p.y}`)).size, all.length);
      assert.ok(round.targets.every((p) => !p.decoy));
      assert.ok(round.decoys.every((p) => p.decoy));
    }
  }
});

test("easy rounds are big and decoy-free; hard rounds are smaller with decoys", () => {
  const easy = planSeekRound("savanna", false, seeded(3));
  const hard = planSeekRound("savanna", true, seeded(3));
  assert.equal(easy.decoys.length, 0);
  assert.equal(hard.decoys.length, SEEK_DECOYS_HARD);
  assert.ok(hard.targets[0].size < easy.targets[0].size);
});

test("extreme random values still produce valid rounds", () => {
  for (const value of [0, 0.999999]) {
    const round = planSeekRound("jungle", true, () => value);
    assert.ok(round.targets.every((p) => p.critter && p.cover));
  }
});

test("hard rounds pay more and scene ids are validated", () => {
  assert.ok(seekRoundCoins(true) > seekRoundCoins(false));
  assert.equal(isSeekScene("beach"), true);
  assert.equal(isSeekScene("moon"), false);
});
