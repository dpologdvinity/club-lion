import test from "node:test";
import assert from "node:assert/strict";
import { penthouseCondoManifest } from "./penthouseCondo.ts";

test("penthouseCondoManifest is structurally valid", () => {
  const manifest = penthouseCondoManifest;
  assert.equal(manifest.id, "penthouse-condo");
  assert.equal(manifest.name, "Luxury Penthouse Condo");
  assert.equal(manifest.district, "uptown");
  assert.equal(manifest.stageWidth, 1920);
  assert.equal(manifest.stageHeight, 720);
  assert.equal(manifest.ambientAudioPreset, "penthouse-lofi-chill");
  assert.ok(manifest.walkablePolygon.length >= 3);
  for (const [x, y] of manifest.walkablePolygon) {
    assert.ok(x >= 0 && x <= manifest.stageWidth);
    assert.ok(y >= 0 && y <= manifest.stageHeight);
  }
});

test("penthouseCondoManifest has a portal back to downtown-plaza at safe coordinates", () => {
  const manifest = penthouseCondoManifest;
  const portal = manifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  );
  assert.ok(portal, "expected portal back to downtown-plaza");
  assert.ok(
    portal!.targetSpawn.x >= 0 && portal!.targetSpawn.x <= 2400,
    "spawn x must be within downtown-plaza stage bounds",
  );
  assert.ok(
    portal!.targetSpawn.y >= 0 && portal!.targetSpawn.y <= 720,
    "spawn y must be within downtown-plaza stage bounds",
  );
});
