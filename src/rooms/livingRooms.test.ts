import { test } from "node:test";
import assert from "node:assert/strict";
import { wateringHoleManifest } from "./manifests/wateringHole.ts";
import { canopyCafeManifest } from "./manifests/canopyCafe.ts";
import { neighborhoodArcadeManifest } from "./manifests/neighborhoodArcade.ts";
import { cozyDenManifest } from "./manifests/cozyDen.ts";

for (const room of [
  wateringHoleManifest,
  canopyCafeManifest,
  neighborhoodArcadeManifest,
  cozyDenManifest,
]) {
  test(`${room.id} keeps expandable illustrated objects and a clear arrival lane`, () => {
    assert.equal(room.backgroundAsset, "");
    assert.equal(
      new Set(room.interactives.map((item) => item.id)).size,
      room.interactives.length,
    );
    assert.ok(room.interactives.filter((item) => item.object).length >= 3);
    for (const item of room.interactives) {
      assert.ok(item.label);
      if (!item.object) continue;
      assert.ok(item.position.x - item.object.width / 2 >= 0);
      assert.ok(item.position.x + item.object.width / 2 <= room.stageWidth);
      assert.ok(item.position.y - item.object.height >= 0);
      assert.ok(item.reaction || item.actionData.gameId);
    }
    assert.equal(room.portals[0].targetRoomId, "square");
    assert.deepEqual(room.portals[0].targetSpawn, { x: 660, y: 639 });
  });
}
test("den decorations still require their saved purchases", () => {
  assert.deepEqual(
    cozyDenManifest.interactives
      .filter((item) => item.requiresDecor)
      .map((item) => item.requiresDecor),
    ["plant", "cushion"],
  );
});
