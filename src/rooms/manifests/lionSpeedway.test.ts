import test from "node:test";
import assert from "node:assert/strict";
import { lionSpeedwayManifest } from "./lionSpeedway.ts";
import { downtownPlazaManifest } from "./downtownPlaza.ts";

test("lionSpeedwayManifest is structurally valid with a walkable paddock", () => {
  const manifest = lionSpeedwayManifest;
  assert.equal(manifest.id, "lion-speedway");
  assert.equal(manifest.stageWidth, 2400);
  assert.equal(manifest.stageHeight, 720);
  for (const [x, y] of manifest.walkablePolygon) {
    assert.ok(x >= 0 && x <= manifest.stageWidth);
    assert.ok(y >= 540 && y <= manifest.stageHeight);
  }
  for (const item of manifest.interactives) {
    assert.ok(item.position.x >= 0 && item.position.x <= manifest.stageWidth);
    assert.ok(item.position.y >= 0 && item.position.y <= manifest.stageHeight);
  }
  assert.deepEqual(
    manifest.interactives.map((item) => item.id),
    [
      "speedway-traffic-light",
      "speedway-tires",
      "kart-race-gate",
      "winner-podium",
      "speedway-flag",
      "fg-go-cart",
    ],
  );
});

test("Lion Speedway and Downtown Plaza link both ways onto safe spawns", () => {
  const back = lionSpeedwayManifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  );
  const there = downtownPlazaManifest.portals.find(
    (p) => p.targetRoomId === "lion-speedway",
  );
  assert.ok(back && there);
  assert.equal(there.label, "Lion Speedway");
  const outside = (spawn: { x: number; y: number }, portals: (typeof back)[]) =>
    portals.every(
      ({ triggerBounds: b }) =>
        spawn.x < b.x1 || spawn.x > b.x2 || spawn.y < b.y1 || spawn.y > b.y2,
    );
  // Arriving inside a trigger would bounce the player straight back.
  assert.ok(outside(there.targetSpawn, lionSpeedwayManifest.portals));
  assert.ok(outside(back.targetSpawn, downtownPlazaManifest.portals));
});
