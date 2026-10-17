import test from "node:test";
import assert from "node:assert/strict";
import { migratePlayerSave, newPlayer } from "../../game.ts";
import { gameCards } from "../../games/catalog.ts";
import { neighborhoodArcadeManifest as arcade } from "./neighborhoodArcade.ts";

const ALL_GAMES = [
  ...gameCards(migratePlayerSave(newPlayer())).map((card) => card.id),
  "memory",
  "bee",
  "paw",
  "fruit",
  "sled-run",
];

test("the big arcade has a cabinet for every game", () => {
  assert.ok(arcade.stageWidth >= 5000);
  const cabinets = arcade.interactives.filter(
    (item) => item.object?.kind === "cabinet",
  );
  assert.deepEqual(
    cabinets.map((item) => item.actionData.gameId).sort(),
    [...ALL_GAMES].sort(),
  );
  for (const item of cabinets)
    assert.equal(item.id, `arcade-${item.actionData.gameId}`);
});

test("cabinets stand side by side without overlapping", () => {
  const boxes = arcade.interactives
    .filter((item) => item.object && item.position.y > 400)
    .map((item) => ({
      id: item.id,
      left: item.position.x - (item.object?.width ?? 0) / 2,
      right: item.position.x + (item.object?.width ?? 0) / 2,
    }))
    .sort((a, b) => a.left - b.left);
  for (let i = 1; i < boxes.length; i++)
    assert.ok(
      boxes[i].left >= boxes[i - 1].right,
      `${boxes[i - 1].id} / ${boxes[i].id}`,
    );
});

test("a friend waits at the door and mid-hall; props wait by the door", () => {
  const xs = (arcade.neighbors ?? []).map((n) => n.x);
  assert.ok(
    xs.some((x) => x < 1000),
    "someone by the entrance",
  );
  assert.ok(
    xs.some((x) => Math.abs(x - arcade.stageWidth / 2) < 400),
    "someone mid-hall",
  );
  for (const p of arcade.props ?? []) assert.ok(p.x < 1100);
});
