import test from "node:test";
import assert from "node:assert/strict";
import { mtMistBasecampManifest } from "./mtMistBasecamp.ts";
import { downtownPlazaManifest } from "./downtownPlaza.ts";
import { ROOM_MANIFESTS } from "../registry.ts";
import { PLACES } from "../../game.ts";

test("Mt. Mist is a registered 2400×720 canyon room with a snowy plateau", () => {
  const room = mtMistBasecampManifest;
  assert.equal(room.id, "mt-mist");
  assert.equal(room.name, "Mt. Mist Alpine Basecamp");
  assert.equal(room.district, "canyon");
  assert.equal(room.stageWidth, 2400);
  assert.equal(room.stageHeight, 720);
  assert.deepEqual(room.walkablePolygon, [
    [0, 540],
    [2400, 540],
    [2400, 720],
    [0, 720],
  ]);
  assert.equal(ROOM_MANIFESTS["mt-mist"], room);
  assert.ok(PLACES.some((place) => place.id === room.id));
  assert.deepEqual(room.interactives, [
    {
      id: "sled-run-gate",
      type: "activity",
      position: { x: 1800, y: 530 },
      actionData: {},
    },
  ]);
});

test("basecamp and plaza have reciprocal portals with safe arrival spawns", () => {
  const back = mtMistBasecampManifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  )!;
  const entry = downtownPlazaManifest.portals.find(
    (p) => p.targetRoomId === "mt-mist",
  )!;
  assert.ok(back);
  assert.ok(entry);
  assert.deepEqual(back.triggerBounds, { x1: 0, y1: 520, x2: 140, y2: 660 });
  assert.deepEqual(entry.triggerBounds, { x1: 300, y1: 675, x2: 440, y2: 720 });
  assert.equal(entry.label, "Mt. Mist Basecamp");
  for (const [room, spawn] of [
    [mtMistBasecampManifest, entry.targetSpawn],
    [downtownPlazaManifest, back.targetSpawn],
  ] as const) {
    assert.ok(
      spawn.y >= room.walkablePolygon[0][1] && spawn.y <= room.stageHeight,
    );
    for (const p of room.portals) {
      const b = p.triggerBounds;
      assert.equal(
        spawn.x >= b.x1 &&
          spawn.x <= b.x2 &&
          spawn.y >= b.y1 &&
          spawn.y <= b.y2,
        false,
      );
    }
  }
});
