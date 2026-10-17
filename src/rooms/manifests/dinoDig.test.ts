import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_MANIFESTS } from "../registry.ts";
import { dinoDigManifest as dig, foundAllFossils } from "./dinoDig.ts";
import { downtownPlazaManifest } from "./downtownPlaza.ts";
import { pointInPolygon } from "../../utils/obstacles.ts";

test("Dino Dig is a registered 2400 × 720 room with four fossil spots", () => {
  assert.equal(ROOM_MANIFESTS["dino-dig"], dig);
  assert.equal(dig.stageWidth, 2400);
  const fossils = dig.interactives.filter((item) => item.actionData.fossil);
  assert.equal(fossils.length, 4);
  for (const item of fossils) assert.equal(item.object?.steps, 3);
});

test("finding every fossil needs each spot dug all the way once", () => {
  const items = dig.interactives;
  const ids = items.filter((i) => i.actionData.fossil).map((i) => i.id);
  const all = Object.fromEntries(ids.map((id) => [id, 2]));
  assert.equal(foundAllFossils(all, items), true);
  assert.equal(foundAllFossils({ ...all, [ids[0]]: 1 }, items), false);
  // Tapping past the fossil wraps the look but it was still found.
  assert.equal(foundAllFossils({ ...all, [ids[1]]: 4 }, items), true);
  assert.equal(foundAllFossils({}, items), false);
});

test("Dino Dig and Downtown Plaza link both ways onto safe spawns", () => {
  const back = dig.portals.find((p) => p.targetRoomId === "downtown-plaza");
  const there = downtownPlazaManifest.portals.find(
    (p) => p.targetRoomId === "dino-dig",
  );
  assert.ok(back && there);
  const outside = (spawn: { x: number; y: number }, portals: (typeof back)[]) =>
    portals.every(
      ({ triggerBounds: b }) =>
        spawn.x < b.x1 || spawn.x > b.x2 || spawn.y < b.y1 || spawn.y > b.y2,
    );
  assert.ok(outside(there.targetSpawn, dig.portals));
  assert.ok(outside(back.targetSpawn, downtownPlazaManifest.portals));
  assert.ok(pointInPolygon(there.targetSpawn, dig.walkablePolygon));
  assert.ok(
    pointInPolygon(back.targetSpawn, downtownPlazaManifest.walkablePolygon),
  );
});

test("a friend waits by the door and one mid-site", () => {
  const xs = (dig.neighbors ?? []).map((n) => n.x);
  assert.ok(xs.some((x) => x < 500));
  assert.ok(xs.some((x) => Math.abs(x - dig.stageWidth / 2) < 300));
});
