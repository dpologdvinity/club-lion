import test from "node:test";
import assert from "node:assert/strict";
import { secretScoutBaseManifest } from "./secretScoutBase.ts";

test("secretScoutBaseManifest is structurally valid", () => {
  const manifest = secretScoutBaseManifest;
  assert.equal(manifest.id, "secret-scout-base");
  assert.equal(manifest.name, "The Pride HQ - Secret Scout Command Center");
  assert.equal(manifest.district, "underground");
  assert.equal(manifest.stageWidth, 1920);
  assert.equal(manifest.stageHeight, 720);
  assert.ok(manifest.walkablePolygon.length >= 3);
  for (const [x, y] of manifest.walkablePolygon) {
    assert.ok(x >= 0 && x <= manifest.stageWidth);
    assert.ok(y >= 0 && y <= manifest.stageHeight);
  }
  assert.ok(manifest.depthLayers.length > 0);
});

test("secretScoutBaseManifest has a portal back to downtown-plaza at safe coordinates", () => {
  const manifest = secretScoutBaseManifest;
  const portal = manifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  );
  assert.ok(portal, "expected portal back to downtown-plaza");
  assert.equal(portal!.targetSpawn.x, 250);
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

test("secretScoutBaseManifest has a spy-terminal game_launch interactive", () => {
  const manifest = secretScoutBaseManifest;
  const terminal = manifest.interactives.find((i) => i.id === "spy-terminal");
  assert.ok(terminal, "expected spy-terminal interactive");
  assert.equal(terminal!.type, "game_launch");
  assert.deepEqual(terminal!.position, { x: 960, y: 520 });
  assert.equal(terminal!.actionData.game, "spy-terminal");
});

test("secretScoutBaseManifest has a non-empty set of interactives including an ambient one", () => {
  const manifest = secretScoutBaseManifest;
  assert.ok(manifest.interactives.length >= 2);
  const ambient = manifest.interactives.find((i) => i.id !== "spy-terminal");
  assert.ok(ambient, "expected an additional ambient interactive");
  for (const item of manifest.interactives) {
    assert.ok(item.position.x >= 0 && item.position.x <= manifest.stageWidth);
    assert.ok(item.position.y >= 0 && item.position.y <= manifest.stageHeight);
  }
});
