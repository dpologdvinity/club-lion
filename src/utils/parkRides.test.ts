import { test } from "node:test";
import assert from "node:assert/strict";
import { newPlayer, unlockStamp } from "../game.ts";
import { STAMP_DEFINITIONS } from "./stampDefinitions.ts";
import {
  PARK_RIDES,
  RIDE_HOTSPOTS,
  TEACUP_BASE_SPEED,
  TEACUP_MAX_SPEED,
  rideBeatAt,
  spinTeacup,
  teacupDizziness,
  type ParkRideId,
} from "./parkRides.ts";

const rideIds = Object.keys(PARK_RIDES) as ParkRideId[];

test("every ride is a short loop whose beats start at zero and stay in order", () => {
  assert.equal(rideIds.length, 5);
  for (const id of rideIds) {
    const ride = PARK_RIDES[id];
    assert.ok(ride.seconds >= 20 && ride.seconds <= 40, id);
    assert.equal(ride.beats[0].at, 0, id);
    for (let i = 1; i < ride.beats.length; i++)
      assert.ok(ride.beats[i].at > ride.beats[i - 1].at, id);
    assert.ok(ride.beats[ride.beats.length - 1].at < ride.seconds, id);
  }
});

test("beat lookup returns the latest beat and clamps outside the ride", () => {
  const flume = PARK_RIDES.flume;
  assert.equal(rideBeatAt("flume", -5), flume.beats[0]);
  assert.equal(rideBeatAt("flume", 0), flume.beats[0]);
  const splash = flume.beats.find((beat) => beat.cue === "splash");
  assert.ok(splash);
  assert.equal(rideBeatAt("flume", splash.at + 0.01), splash);
  assert.equal(rideBeatAt("flume", 999), flume.beats[flume.beats.length - 1]);
  assert.equal(rideBeatAt("ferris", Number.NaN), PARK_RIDES.ferris.beats[0]);
});

test("each ride has a thrill moment and every scenery hotspot opens a ride", () => {
  assert.ok(PARK_RIDES.ferris.beats.some((beat) => beat.cue === "top"));
  assert.ok(PARK_RIDES.flume.beats.some((beat) => beat.cue === "splash"));
  assert.ok(PARK_RIDES["drop-tower"].beats.some((beat) => beat.cue === "drop"));
  assert.deepEqual(new Set(Object.values(RIDE_HOTSPOTS)), new Set(rideIds));
});

test("holding the teacup spins it faster up to a cap, letting go settles it", () => {
  let cup = { angle: 0, speed: TEACUP_BASE_SPEED };
  let last = cup.speed;
  for (let i = 0; i < 120; i++) {
    cup = spinTeacup(cup, 1 / 60, true);
    assert.ok(cup.speed >= last);
    assert.ok(cup.speed <= TEACUP_MAX_SPEED);
    assert.ok(cup.angle >= 0 && cup.angle < 360);
    last = cup.speed;
  }
  assert.ok(teacupDizziness(cup.speed) > 0.8);
  for (let i = 0; i < 600; i++) cup = spinTeacup(cup, 1 / 60, false);
  assert.ok(Math.abs(cup.speed - TEACUP_BASE_SPEED) < 1);
  assert.ok(teacupDizziness(cup.speed) < 0.01);
});

test("a huge or invalid frame gap never teleports the teacup", () => {
  const cup = { angle: 10, speed: TEACUP_BASE_SPEED };
  const jumped = spinTeacup(cup, 900, true);
  assert.ok(jumped.speed <= TEACUP_MAX_SPEED);
  assert.ok(jumped.angle - cup.angle <= TEACUP_MAX_SPEED * 0.1);
  assert.deepEqual(spinTeacup(cup, Number.NaN, true), cup);
  assert.deepEqual(spinTeacup(cup, -1, true), cup);
});

test("the first ride on each attraction unlocks its stamp exactly once", () => {
  for (const id of rideIds) {
    const stamp = STAMP_DEFINITIONS.find(
      (item) => item.id === PARK_RIDES[id].stampId,
    );
    assert.ok(stamp, id);
    assert.equal(stamp.category, "park_thrills");
    const first = unlockStamp(newPlayer(), stamp.id);
    assert.deepEqual(first.stamps, [stamp.id]);
    const again = unlockStamp(first, stamp.id);
    assert.equal(again, first);
  }
});
