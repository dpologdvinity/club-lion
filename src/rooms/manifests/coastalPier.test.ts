import test from "node:test";
import assert from "node:assert/strict";
import { coastalPierManifest } from "./coastalPier.ts";
import { ROOM_MANIFESTS } from "../registry.ts";
import { PLACES } from "../../game.ts";

test("Coastal Pier is a registered boardwalk in the coastal district", () => {
  const m = coastalPierManifest;
  assert.equal(m.id, "coastal-pier");
  assert.equal(m.name, "Coastal Pier & Boardwalk");
  assert.equal(m.district, "sunset_beach");
  assert.equal(m.stageWidth, 2400);
  assert.equal(m.stageHeight, 720);
  assert.deepEqual(m.walkablePolygon, [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ]);
  assert.equal(ROOM_MANIFESTS["coastal-pier"], m);
  assert.ok(PLACES.some((p) => p.id === m.id && p.imageClass === "scene-pier"));
  assert.equal(m.portals.length, 1);
  assert.equal(m.portals[0].targetRoomId, "sunset-beach");
  assert.deepEqual(m.portals[0].triggerBounds, {
    x1: 0,
    y1: 520,
    x2: 140,
    y2: 660,
  });
});

test("the lighthouse exposes the foghorn instrument", () => {
  assert.deepEqual(coastalPierManifest.interactives, [
    {
      id: "lighthouse-foghorn",
      type: "instrument",
      position: { x: 1950, y: 520 },
      actionData: {},
    },
  ]);
});
