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
  // The bars cover stage y beyond ~700; a phone-size (80-unit) butterfly centred at y reaches y + 40.
  for (const spot of BUTTERFLY_SPOTS)
    assert.ok(spot.y + 40 <= 700, `${spot.x},${spot.y}`);
});

test("butterfly spots stay clear of the square's objects and neighbours", async () => {
  const { savannaSquareManifest: square } =
    await import("../rooms/manifests/savannaSquare.ts");
  type Box = { id: string; l: number; r: number; t: number; b: number };
  // Objects and neighbours stand on their point. On a phone every target
  // grows to 48 screen px, about 80 stage units, butterflies included.
  const MIN = 80;
  const boxes: Box[] = [
    ...square.interactives.flatMap((item) => {
      if (!item.object) return [];
      const w = Math.max(MIN, item.object.width);
      const h = Math.max(MIN, item.object.height);
      return [
        {
          id: item.id,
          l: item.position.x - w / 2,
          r: item.position.x + w / 2,
          t: item.position.y - h,
          b: item.position.y,
        },
      ];
    }),
    // The weather toy, 96 units, centred on (640, 650).
    { id: "weather-toy", l: 592, r: 688, t: 602, b: 698 },
    // Open lawn below the flower row: taps there walk the doll.
    { id: "open lawn", l: 540, r: 1000, t: 500, b: 620 },
    ...(square.neighbors ?? []).map((n) => ({
      id: n.id,
      l: n.x - 46,
      r: n.x + 46,
      t: n.y - 150,
      b: n.y,
    })),
  ];
  for (const spot of BUTTERFLY_SPOTS)
    for (const box of boxes)
      assert.ok(
        spot.x + 40 <= box.l ||
          spot.x - 40 >= box.r ||
          spot.y + 40 <= box.t ||
          spot.y - 40 >= box.b,
        `butterfly at ${spot.x},${spot.y} overlaps ${box.id}`,
      );
  for (const a of BUTTERFLY_SPOTS)
    for (const b of BUTTERFLY_SPOTS)
      assert.ok(
        a === b || Math.abs(a.x - b.x) >= MIN || Math.abs(a.y - b.y) >= MIN,
        `butterflies at ${a.x},${a.y} and ${b.x},${b.y} overlap`,
      );
});
