import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_MANIFESTS } from "../rooms/registry.ts";
import { PINS, PIN_STAMP_COUNT, pinForDay } from "./pins.ts";

test("every pin hides in a real room, clear of objects and labels", () => {
  assert.equal(new Set(PINS.map((pin) => pin.id)).size, PINS.length);
  for (const pin of PINS) {
    const room = ROOM_MANIFESTS[pin.room];
    assert.ok(room, pin.id);
    assert.ok(pin.x > 60 && pin.x < room.stageWidth - 60, pin.id);
    for (const item of room.interactives) {
      const near = item.object
        ? pin.x > item.position.x - item.object.width / 2 - 40 &&
          pin.x < item.position.x + item.object.width / 2 + 40 &&
          pin.y > item.position.y - item.object.height - 40 &&
          pin.y < item.position.y + 40
        : Math.abs(pin.x - item.position.x) < 140 &&
          Math.abs(pin.y - item.position.y) < 70;
      assert.ok(!near, `${pin.id} overlaps ${item.id}`);
    }
  }
});

test("the daily pin is the same all day and changes day to day", () => {
  assert.equal(pinForDay("2026-10-17").id, pinForDay("2026-10-17").id);
  const week = ["01", "02", "03", "04", "05", "06", "07"].map(
    (d) => pinForDay(`2026-11-${d}`).id,
  );
  assert.ok(new Set(week).size >= 5);
  for (let i = 1; i < week.length; i++) assert.notEqual(week[i], week[i - 1]);
});

test("a full collection takes more than a week and the stamp less", () => {
  assert.ok(PINS.length >= 10);
  assert.ok(PIN_STAMP_COUNT <= PINS.length);
});
