import test from "node:test";
import assert from "node:assert/strict";
import { snowflakeRinkManifest } from "./snowflakeRink.ts";
import { mtMistBasecampManifest } from "./mtMistBasecamp.ts";

test("snowflakeRinkManifest is structurally valid with skate and cocoa hotspots", () => {
  const manifest = snowflakeRinkManifest;
  assert.equal(manifest.id, "snowflake-rink");
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
    ["rink-skate", "rink-hot-cocoa"],
  );
});

test("Snowflake Rink and Mt. Mist link both ways onto safe spawns", () => {
  const back = snowflakeRinkManifest.portals.find(
    (p) => p.targetRoomId === "mt-mist",
  );
  const there = mtMistBasecampManifest.portals.find(
    (p) => p.targetRoomId === "snowflake-rink",
  );
  assert.ok(back && there);
  assert.equal(there.label, "Snowflake Rink");
  const outside = (spawn: { x: number; y: number }, portals: (typeof back)[]) =>
    portals.every(
      ({ triggerBounds: b }) =>
        spawn.x < b.x1 || spawn.x > b.x2 || spawn.y < b.y1 || spawn.y > b.y2,
    );
  // Arriving inside a trigger would bounce the player straight back.
  assert.ok(outside(there.targetSpawn, snowflakeRinkManifest.portals));
  assert.ok(outside(back.targetSpawn, mtMistBasecampManifest.portals));
});
