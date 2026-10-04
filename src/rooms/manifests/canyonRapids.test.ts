import test from "node:test";
import assert from "node:assert/strict";
import { canyonRapidsManifest } from "./canyonRapids.ts";
import { downtownPlazaManifest } from "./downtownPlaza.ts";

test("canyonRapidsManifest is structurally valid", () => {
  const manifest = canyonRapidsManifest;
  assert.equal(manifest.id, "canyon-rapids");
  assert.equal(manifest.name, "Canyon Rapids");
  assert.equal(manifest.district, "canyon");
  assert.equal(manifest.stageWidth, 2400);
  assert.equal(manifest.stageHeight, 720);
  assert.ok(manifest.walkablePolygon.length >= 3);
  for (const [x, y] of manifest.walkablePolygon) {
    assert.ok(x >= 0 && x <= manifest.stageWidth);
    assert.ok(y >= 0 && y <= manifest.stageHeight);
  }
});

test("canyonRapidsManifest has a portal back to downtown-plaza", () => {
  const manifest = canyonRapidsManifest;
  const portal = manifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  );
  assert.ok(portal, "expected portal back to downtown-plaza");
  assert.deepEqual(portal!.triggerBounds, {
    x1: 0,
    y1: 520,
    x2: 140,
    y2: 660,
  });
});

test("canyonRapidsManifest has the river-surf-dock activity interactive", () => {
  const manifest = canyonRapidsManifest;
  const dock = manifest.interactives.find((i) => i.id === "river-surf-dock");
  assert.ok(dock, "expected river-surf-dock interactive");
  assert.equal(dock!.type, "activity");
  assert.deepEqual(dock!.position, { x: 1750, y: 530 });
  for (const item of manifest.interactives) {
    assert.ok(item.position.x >= 0 && item.position.x <= manifest.stageWidth);
    assert.ok(item.position.y >= 0 && item.position.y <= manifest.stageHeight);
  }
});

test("downtownPlazaManifest has a portal to canyon-rapids", () => {
  const portal = downtownPlazaManifest.portals.find(
    (p) => p.targetRoomId === "canyon-rapids",
  );
  assert.ok(portal, "expected portal to canyon-rapids");
  assert.equal(portal!.label, "Canyon Rapids");
  assert.deepEqual(portal!.triggerBounds, {
    x1: 500,
    y1: 675,
    x2: 640,
    y2: 720,
  });
});
