import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_MANIFESTS } from "./registry.ts";
import { FANTAGE_GAMES } from "../games/fantage.ts";

type Box = { id: string; l: number; r: number; t: number; b: number };
const overlaps = (a: Box, b: Box) =>
  a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

test("every game cabinet stands in its room, clear of everything else", () => {
  for (const game of FANTAGE_GAMES) {
    const room = ROOM_MANIFESTS[game.room];
    assert.ok(room, game.room);
    const cabinet = room.interactives.find((i) => i.id === `fg-${game.id}`);
    assert.ok(cabinet, `${game.id} has a cabinet in ${game.room}`);
    // The cabinet plus its name caption, about as wide as the name on a phone.
    const half = Math.max(110, game.name.length * 12 + 50) / 2;
    const mine: Box = {
      id: game.id,
      l: game.spot.x - half,
      r: game.spot.x + half,
      t: game.spot.y - 170,
      b: game.spot.y + 60,
    };
    assert.ok(mine.l >= 0 && mine.r <= room.stageWidth, `${game.id} on stage`);
    assert.ok(game.spot.y <= 600, `${game.id} above the bottom bars`);
    const others: Box[] = [
      ...room.interactives
        .filter((i) => i.id !== cabinet.id)
        .map((i) => {
          if (i.object) {
            const w = Math.max(80, i.object.width);
            const h = Math.max(80, i.object.height);
            const cab = i.id.startsWith("fg-");
            const capHalf = cab
              ? Math.max(110, (i.label?.length ?? 0) * 12 + 50) / 2
              : w / 2;
            return {
              id: i.id,
              l: i.position.x - capHalf,
              r: i.position.x + capHalf,
              t: i.position.y - h,
              b: i.position.y + 60,
            };
          }
          const half = ((i.label?.length ?? 10) * 11 + 100) / 2;
          return {
            id: i.id,
            l: i.position.x - half,
            r: i.position.x + half,
            t: i.position.y - 105,
            b: i.position.y - 5,
          };
        }),
      ...(room.neighbors ?? []).map((n) => ({
        id: n.id,
        l: n.x - 46,
        r: n.x + 46,
        t: n.y - 150,
        b: n.y + 30,
      })),
      ...(room.props ?? []).map((p) => ({
        id: p.id,
        l: p.x - 50,
        r: p.x + 50,
        t: p.y - 60,
        b: p.y + 30,
      })),
      ...room.portals.map((p) => ({
        id: `exit to ${p.targetRoomId}`,
        l: p.triggerBounds.x1 - 40,
        r: p.triggerBounds.x2 + 40,
        t: p.triggerBounds.y1 - 200,
        b: p.triggerBounds.y2,
      })),
    ];
    for (const other of others)
      assert.ok(!overlaps(mine, other), `${game.id} overlaps ${other.id}`);
  }
});
