import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACES } from "../game.ts";
import { ROOM_MANIFESTS } from "./registry.ts";
import { PLACE_ICONS, SHOP_ICON, isPlaceId, portalIcon } from "./placeIcons.ts";

test("every destination and room manifest has a picture badge", () => {
  for (const place of PLACES) assert.ok(PLACE_ICONS[place.id], place.id);
  for (const id of Object.keys(ROOM_MANIFESTS))
    assert.ok(isPlaceId(id) && PLACE_ICONS[id], id);
});

test("portal targets resolve to a room badge, the shop or a door", () => {
  assert.equal(portalIcon("le-shop"), SHOP_ICON);
  assert.equal(portalIcon("wonder-park-entrance"), "🎡");
  assert.equal(portalIcon("not-a-room"), "🚪");
});
