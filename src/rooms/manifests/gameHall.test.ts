import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_MANIFESTS } from "../registry.ts";
import { FANTAGE_GAMES } from "../../games/fantage.ts";
import { gameHallManifest as hall } from "./gameHall.ts";
import { pointInPolygon } from "../../utils/obstacles.ts";

test("the Game Hall has one cabinet per Game Hall game, side by side", () => {
  assert.equal(ROOM_MANIFESTS["game-hall"], hall);
  const cabinets = hall.interactives.filter(
    (item) => item.object?.kind === "cabinet",
  );
  assert.deepEqual(
    cabinets.map((item) => item.actionData.gameId),
    FANTAGE_GAMES.map((game) => game.id),
  );
  const boxes = hall.interactives
    .filter((item) => item.object)
    .map((item) => ({
      left: item.position.x - (item.object?.width ?? 0) / 2,
      right: item.position.x + (item.object?.width ?? 0) / 2,
    }))
    .sort((a, b) => a.left - b.left);
  for (let i = 1; i < boxes.length; i++)
    assert.ok(boxes[i].left >= boxes[i - 1].right);
  assert.ok(boxes.at(-1)!.right <= hall.stageWidth);
});

test("the arcade and the Game Hall lead to each other onto open floor", () => {
  const arcade = ROOM_MANIFESTS.arcade!;
  const toHall = arcade.portals.find((p) => p.targetRoomId === "game-hall");
  const back = hall.portals.find((p) => p.targetRoomId === "arcade");
  assert.ok(toHall && back);
  assert.ok(pointInPolygon(toHall.targetSpawn, hall.walkablePolygon));
  assert.ok(pointInPolygon(back.targetSpawn, arcade.walkablePolygon));
  for (const n of hall.neighbors ?? [])
    assert.ok(pointInPolygon(n, hall.walkablePolygon), n.id);
});
