import test from "node:test";
import assert from "node:assert/strict";
import { newsForDay } from "./news.ts";
import { FANTAGE_GAMES } from "../games/fantage.ts";
import { OUTFITS } from "../components/avatar/pixelOutfits.ts";

test("the Daily Roar is stable for a day and changes across days", () => {
  const today = newsForDay("2026-10-19");
  assert.deepEqual(newsForDay("2026-10-19"), today);
  assert.ok(FANTAGE_GAMES.some((g) => g.id === today.gameId));
  assert.ok(Object.hasOwn(OUTFITS, today.dressId));
  const games = new Set(
    Array.from(
      { length: 10 },
      (_, i) => newsForDay(`2026-11-${10 + i}`).gameId,
    ),
  );
  assert.ok(games.size > 3, "different days feature different games");
});
