import test from "node:test";
import assert from "node:assert/strict";
import {
  BUTTERFLY_COUNT,
  BUTTERFLY_SPOTS,
  WEATHER_CYCLE,
  butterfliesForDay,
  dayKey,
  nextWeather,
} from "./squareFun.ts";

test("weather cycles sunny, rain, rainbow, snow, sunny", () => {
  const seen = [WEATHER_CYCLE[0]];
  for (let i = 0; i < 4; i++) seen.push(nextWeather(seen[seen.length - 1]));
  assert.deepEqual(seen, ["sunny", "rain", "rainbow", "snow", "sunny"]);
});

test("butterflies are five distinct spots and stable for a day", () => {
  const spots = butterfliesForDay("2026-10-16");
  assert.equal(spots.length, BUTTERFLY_COUNT);
  assert.equal(new Set(spots).size, BUTTERFLY_COUNT);
  for (const spot of spots) {
    assert.ok(Number.isSafeInteger(spot) && spot >= 0);
    assert.ok(spot < BUTTERFLY_SPOTS.length);
  }
  assert.deepEqual(butterfliesForDay("2026-10-16"), spots);
});

test("different days usually hide butterflies in different spots", () => {
  const today = butterfliesForDay("2026-10-16").join();
  let different = 0;
  for (let day = 1; day <= 10; day++) {
    const key = `2026-10-${String(day).padStart(2, "0")}`;
    if (butterfliesForDay(key).join() !== today) different++;
  }
  assert.ok(different >= 5, `only ${different} days differed`);
});

test("dayKey uses the local calendar day", () => {
  assert.equal(dayKey(new Date(2026, 9, 6, 23, 59)), "2026-10-06");
});

test("every butterfly hides above the room and chat bars", () => {
  // The bars cover stage y beyond ~700; a 64-unit butterfly centred at y reaches y + 32.
  for (const spot of BUTTERFLY_SPOTS)
    assert.ok(spot.y + 32 <= 700, `${spot.x},${spot.y}`);
});
