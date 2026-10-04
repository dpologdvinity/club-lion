import test from "node:test";
import assert from "node:assert/strict";
import { petParadiseManifest } from "./petParadise.ts";

test("petParadiseManifest is structurally valid", () => {
  const manifest = petParadiseManifest;
  assert.equal(manifest.id, "pet-paradise");
  assert.equal(manifest.name, "Pet Paradise Nursery");
  assert.equal(manifest.district, "uptown");
  assert.equal(manifest.stageWidth, 2400);
  assert.equal(manifest.stageHeight, 720);
  assert.ok(manifest.walkablePolygon.length >= 3);
  for (const [x, y] of manifest.walkablePolygon) {
    assert.ok(x >= 0 && x <= manifest.stageWidth);
    assert.ok(y >= 0 && y <= manifest.stageHeight);
  }
  assert.ok(manifest.depthLayers.length > 0);
});

test("petParadiseManifest has a portal back to downtown-plaza at safe coordinates", () => {
  const manifest = petParadiseManifest;
  const portal = manifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  );
  assert.ok(portal, "expected portal back to downtown-plaza");
  assert.equal(portal!.targetSpawn.x, 780);
  assert.equal(portal!.targetSpawn.y, 600);
  // Safe spawn: outside this room's own trigger zones.
  for (const p of manifest.portals) {
    const inside: boolean =
      portal!.targetSpawn.x >= p.triggerBounds.x1 &&
      portal!.targetSpawn.x <= p.triggerBounds.x2 &&
      portal!.targetSpawn.y >= p.triggerBounds.y1 &&
      portal!.targetSpawn.y <= p.triggerBounds.y2;
    assert.equal(inside, false);
  }
});

test("petParadiseManifest has a pet-grooming-station interactive", () => {
  const manifest = petParadiseManifest;
  const station = manifest.interactives.find(
    (i) => i.id === "pet-grooming-station",
  );
  assert.ok(station, "expected pet-grooming-station interactive");
  assert.equal(station!.type, "secret_clickable");
  assert.deepEqual(station!.position, { x: 1200, y: 400 });
});

test("petParadiseManifest interactives are within bounds", () => {
  const manifest = petParadiseManifest;
  for (const item of manifest.interactives) {
    assert.ok(item.position.x >= 0 && item.position.x <= manifest.stageWidth);
    assert.ok(item.position.y >= 0 && item.position.y <= manifest.stageHeight);
  }
});
