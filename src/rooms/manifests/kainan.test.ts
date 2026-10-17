import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_MANIFESTS } from "../registry.ts";
import { NEIGHBORS } from "../../game.ts";
import { kainanManifest } from "./kainan.ts";
import { downtownPlazaManifest } from "./downtownPlaza.ts";
import { pointInPolygon } from "../../utils/obstacles.ts";

const kainan = kainanManifest;

test("Lola's Kainan is a registered 2400 × 720 manifest room", () => {
  assert.equal(ROOM_MANIFESTS.kainan, kainan);
  assert.equal(kainan.name, "Lola's Kainan");
  assert.equal(kainan.stageWidth, 2400);
  assert.equal(kainan.stageHeight, 720);
  for (const item of kainan.interactives) {
    assert.ok(item.position.x > 0 && item.position.x < kainan.stageWidth);
    assert.ok(item.position.y > 0 && item.position.y <= kainan.stageHeight);
  }
});

test("Lola greets on the floor by the counter", () => {
  assert.deepEqual(
    (kainan.neighbors ?? []).map((n) => n.id),
    ["lola"],
  );
  const lola = NEIGHBORS.find((n) => n.id === "lola");
  assert.ok(lola);
  assert.match(lola.greeting, /Kain tayo/);
  for (const n of kainan.neighbors ?? [])
    assert.ok(pointInPolygon(n, kainan.walkablePolygon));
});

test("the halo-halo machine opens the Halo-Halo game", () => {
  const machine = kainan.interactives.find(
    (i) => i.object?.kind === "halohalo",
  );
  assert.equal(machine?.actionData.gameId, "halo-halo");
});

test("the karaoke hums a tune so everyone dances", () => {
  const karaoke = kainan.interactives.find((i) => i.object?.kind === "karaoke");
  assert.ok(karaoke?.actionData.tune?.notes.length);
});

test("Kainan and Downtown Plaza link both ways onto safe spawns", () => {
  const back = kainan.portals.find((p) => p.targetRoomId === "downtown-plaza");
  const there = downtownPlazaManifest.portals.find(
    (p) => p.targetRoomId === "kainan",
  );
  assert.ok(back && there);
  assert.equal(there.label, "Lola's Kainan");
  const outside = (spawn: { x: number; y: number }, portals: (typeof back)[]) =>
    portals.every(
      ({ triggerBounds: b }) =>
        spawn.x < b.x1 || spawn.x > b.x2 || spawn.y < b.y1 || spawn.y > b.y2,
    );
  // Arriving inside a trigger would bounce the player straight back.
  assert.ok(outside(there.targetSpawn, kainan.portals));
  assert.ok(outside(back.targetSpawn, downtownPlazaManifest.portals));
  assert.ok(pointInPolygon(there.targetSpawn, kainan.walkablePolygon));
  assert.ok(
    pointInPolygon(back.targetSpawn, downtownPlazaManifest.walkablePolygon),
  );
});
