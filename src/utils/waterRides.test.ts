import test from "node:test";
import assert from "node:assert/strict";
import {
  BIG_WAVE_FIRST,
  bigWaveBoost,
  bucketDumpStarted,
  bucketFrame,
  JUMP_HEIGHT,
  JUMP_SECONDS,
  jumpLift,
  RIVER_CRITTERS,
  RIVER_RIDER_X,
  RIVER_WATERFALL_X,
  riverDistance,
  slideFrame,
  WATER_RIDE_SECONDS,
  WATER_RIDE_STAMPS,
  waterfallSoak,
  waveSurface,
} from "./waterRides.ts";
import { STAMP_DEFINITIONS } from "./stampDefinitions.ts";
import { newPlayer, unlockStamp } from "../game.ts";

test("every water ride lasts 20 to 40 seconds", () => {
  for (const seconds of Object.values(WATER_RIDE_SECONDS)) {
    assert.ok(seconds >= 20 && seconds <= 40, String(seconds));
  }
});

test("each ride's first finish pays its stamp coins exactly once", () => {
  for (const id of Object.values(WATER_RIDE_STAMPS)) {
    const stamp = STAMP_DEFINITIONS.find((s) => s.id === id);
    assert.ok(stamp, id);
    assert.equal(stamp.category, "park_thrills");
    assert.ok((stamp.rewardCoins ?? 0) > 0, id);
    const first = unlockStamp(newPlayer(), id);
    assert.equal(first.coins, newPlayer().coins + (stamp.rewardCoins ?? 0));
    assert.equal(unlockStamp(first, id), first);
  }
});

test("the slide launches, alternates tunnels and daylight, drops, then splashes still", () => {
  const sections: string[] = [];
  for (let t = 0; t < WATER_RIDE_SECONDS.slides; t += 0.25) {
    const { section } = slideFrame(t);
    if (sections.at(-1) !== section) sections.push(section);
  }
  assert.deepEqual(sections, [
    "launch",
    "tunnel",
    "daylight",
    "tunnel",
    "daylight",
    "drop",
    "splash",
  ]);
  assert.ok(slideFrame(0).speed < slideFrame(2).speed);
  assert.deepEqual(slideFrame(22), { section: "splash", twist: 0, speed: 0 });
  assert.equal(slideFrame(0).twist, 0);
});

test("the river passes every critter and the waterfall within the ride", () => {
  const end = riverDistance(WATER_RIDE_SECONDS.river) + RIVER_RIDER_X;
  for (const critter of RIVER_CRITTERS) assert.ok(critter.x < end, critter.id);
  assert.equal(waterfallSoak(RIVER_WATERFALL_X - RIVER_RIDER_X), 1);
  assert.equal(waterfallSoak(0), 0);
  assert.ok(waterfallSoak(RIVER_WATERFALL_X - RIVER_RIDER_X + 80) > 0);
  assert.equal(riverDistance(-3), 0);
});

test("big waves start calm, peak smoothly and repeat during the wave pool ride", () => {
  assert.equal(bigWaveBoost(BIG_WAVE_FIRST - 1), 0);
  assert.ok(bigWaveBoost(BIG_WAVE_FIRST + 1.7) > 0.99);
  assert.ok(bigWaveBoost(BIG_WAVE_FIRST + 11.7) > 0.99);
  assert.equal(bigWaveBoost(BIG_WAVE_FIRST + 5), 0);
  const calm = Math.max(
    ...Array.from({ length: 60 }, (_, i) => Math.abs(waveSurface(i / 10, 800))),
  );
  const big = Math.abs(waveSurface(BIG_WAVE_FIRST + 1.7, 0));
  assert.ok(calm <= 16.001);
  assert.ok(big <= 90.001);
});

test("a tap jump rises to its peak and lands back on the water", () => {
  assert.equal(jumpLift(-0.1), 0);
  assert.equal(jumpLift(0), 0);
  assert.equal(jumpLift(JUMP_SECONDS / 2), JUMP_HEIGHT);
  assert.equal(jumpLift(JUMP_SECONDS), 0);
});

test("the bucket fills, then tips exactly twice in one ride", () => {
  assert.equal(bucketFrame(0).fillPercent, 0);
  assert.ok(bucketFrame(5).fillPercent > 40);
  let dumps = 0;
  for (let frame = 1; frame <= WATER_RIDE_SECONDS.bucket * 60; frame++) {
    if (bucketDumpStarted((frame - 1) / 60, frame / 60)) dumps++;
  }
  assert.equal(dumps, 2);
});
