import test from "node:test";
import assert from "node:assert/strict";
import { sunsetBeachManifest } from "./sunsetBeach.ts";
import { ROOM_MANIFESTS } from "../registry.ts";
import { downtownPlazaManifest } from "./downtownPlaza.ts";
import { PLACES } from "../../game.ts";

test("Sunset Beach is a registered sandy coastal district", () => {
  const m = sunsetBeachManifest;
  assert.equal(m.id, "sunset-beach");
  assert.equal(m.name, "Sunset Beach");
  assert.equal(m.district, "sunset_beach");
  assert.equal(m.stageWidth, 2400);
  assert.equal(m.stageHeight, 720);
  assert.deepEqual(m.walkablePolygon, [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ]);
  assert.equal(ROOM_MANIFESTS["sunset-beach"], m);
  assert.ok(
    PLACES.some((p) => p.id === m.id && p.imageClass === "scene-beach"),
  );
  assert.equal(m.ambientAudioPreset, "ocean-surf");
});

test("the plaza, beach and pier connect with safe arrival spawns", () => {
  const plaza = downtownPlazaManifest.portals.find(
    (p) => p.targetRoomId === "sunset-beach",
  );
  assert.ok(plaza);
  assert.equal(plaza.label, "Sunset Beach");
  assert.deepEqual(plaza.triggerBounds, { x1: 100, y1: 675, x2: 240, y2: 720 });
  assert.deepEqual(
    sunsetBeachManifest.portals.map((p) => [p.targetRoomId, p.triggerBounds]),
    [
      ["downtown-plaza", { x1: 0, y1: 520, x2: 140, y2: 660 }],
      ["coastal-pier", { x1: 2260, y1: 520, x2: 2400, y2: 660 }],
    ],
  );
  for (const origin of [
    downtownPlazaManifest,
    sunsetBeachManifest,
    ROOM_MANIFESTS["coastal-pier"]!,
  ]) {
    for (const portal of origin.portals.filter((p) =>
      ["downtown-plaza", "sunset-beach", "coastal-pier"].includes(
        p.targetRoomId,
      ),
    )) {
      const target = Object.values(ROOM_MANIFESTS).find(
        (m) => m.id === portal.targetRoomId,
      )!;
      const { x, y } = portal.targetSpawn;
      assert.ok(
        x >= 0 &&
          x <= target.stageWidth &&
          y >= target.walkablePolygon[0][1] &&
          y <= target.stageHeight,
      );
      assert.ok(
        target.portals.every(
          ({ triggerBounds: b }) =>
            !(x >= b.x1 && x <= b.x2 && y >= b.y1 && y <= b.y2),
        ),
      );
    }
  }
});
