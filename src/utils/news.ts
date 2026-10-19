/**
 * The Daily Roar, our newspaper: today's pin hint, a featured game and an
 * outfit of the day, the same all day and different most days. Pure rules.
 */
import { FANTAGE_GAMES, type FantageGameId } from "../games/fantage.ts";
import { OUTFITS } from "../components/avatar/pixelOutfits.ts";
import { pinForDay } from "./pins.ts";

/** A small stable hash of the day key, so each day picks its own stories. */
function dayNumber(day: string): number {
  let n = 0;
  for (const ch of day) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return n;
}

export function newsForDay(day: string): {
  pin: ReturnType<typeof pinForDay>;
  gameId: FantageGameId;
  dressId: string;
} {
  const n = dayNumber(day);
  const dresses = Object.keys(OUTFITS);
  return {
    pin: pinForDay(day),
    gameId: FANTAGE_GAMES[n % FANTAGE_GAMES.length].id,
    dressId: dresses[(n >>> 5) % dresses.length],
  };
}
