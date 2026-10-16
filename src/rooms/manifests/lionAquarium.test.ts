import test from "node:test";
import assert from "node:assert/strict";
import { lionAquariumManifest } from "./lionAquarium.ts";
import { coastalPierManifest } from "./coastalPier.ts";

test("lionAquariumManifest is structurally valid with feeding and touch hotspots", () => {
  const manifest = lionAquariumManifest;
  assert.equal(manifest.id, "lion-aquarium");
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
      "aquarium-feed-fish",
      "aquarium-touch-pool",
      "aquarium-jellyfish",
      "aquarium-treasure",
    ],
  );
});

test("Lion Aquarium and Coastal Pier link both ways onto safe spawns", () => {
  const back = lionAquariumManifest.portals.find(
    (p) => p.targetRoomId === "coastal-pier",
  );
  const there = coastalPierManifest.portals.find(
    (p) => p.targetRoomId === "lion-aquarium",
  );
  assert.ok(back && there);
  assert.equal(there.label, "Lion Aquarium");
  const outside = (spawn: { x: number; y: number }, portals: (typeof back)[]) =>
    portals.every(
      ({ triggerBounds: b }) =>
        spawn.x < b.x1 || spawn.x > b.x2 || spawn.y < b.y1 || spawn.y > b.y2,
    );
  // Arriving inside a trigger would bounce the player straight back.
  assert.ok(outside(there.targetSpawn, lionAquariumManifest.portals));
  assert.ok(outside(back.targetSpawn, coastalPierManifest.portals));
});
