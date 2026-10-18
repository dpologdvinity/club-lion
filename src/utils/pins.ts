/**
 * Pin of the Day: one collectible pin hides somewhere in the world each day.
 * Pure rules, no React or DOM.
 */
import type { PlaceId } from "../game.ts";

export const PIN_STAMP_COUNT = 5;

type Pin = {
  id: string;
  emoji: string;
  label: string;
  room: PlaceId;
  /** Stage px, high on a wall or in the sky so it never hides an object. */
  x: number;
  y: number;
};

export const PINS: readonly Pin[] = [
  { id: "mango", emoji: "🥭", label: "mango", room: "kainan", x: 600, y: 250 },
  { id: "dino", emoji: "🦖", label: "dino", room: "dino-dig", x: 650, y: 250 },
  {
    id: "anchor",
    emoji: "⚓",
    label: "anchor",
    room: "coastal-pier",
    x: 1600,
    y: 250,
  },
  {
    id: "starfish",
    emoji: "⭐",
    label: "starfish",
    room: "lion-aquarium",
    x: 1300,
    y: 250,
  },
  {
    id: "pine",
    emoji: "🌲",
    label: "pine tree",
    room: "mt-mist",
    x: 600,
    y: 250,
  },
  {
    id: "canoe",
    emoji: "🛶",
    label: "canoe",
    room: "canyon-rapids",
    x: 1400,
    y: 250,
  },
  {
    id: "trophy",
    emoji: "🏆",
    label: "trophy",
    room: "lion-speedway",
    x: 900,
    y: 250,
  },
  {
    id: "paw",
    emoji: "🐾",
    label: "paw",
    room: "pet-paradise",
    x: 1700,
    y: 250,
  },
  {
    id: "sun",
    emoji: "🌞",
    label: "sun",
    room: "sunset-beach",
    x: 1800,
    y: 250,
  },
  {
    id: "fountain",
    emoji: "⛲",
    label: "fountain",
    room: "downtown-plaza",
    x: 1800,
    y: 250,
  },
  {
    id: "ferris",
    emoji: "🎡",
    label: "Ferris wheel",
    room: "wonder-park-entrance",
    x: 1200,
    y: 250,
  },
  {
    id: "snowflake",
    emoji: "❄️",
    label: "snowflake",
    room: "snowflake-rink",
    x: 600,
    y: 250,
  },
  { id: "cup", emoji: "☕", label: "teacup", room: "cafe", x: 300, y: 250 },
  { id: "frog", emoji: "🐸", label: "frog", room: "water", x: 1200, y: 250 },
];

/** Whole days since 1970-01-01 for a local `YYYY-MM-DD` key. */
function dayNumber(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Today's pin: walks the list in a shuffled order so neighbours differ. */
export function pinForDay(day: string): Pin {
  const n = Math.abs(dayNumber(day));
  // 5 and 14 share no factor, so stepping by 5 visits every pin before repeating.
  return PINS[(n * 5) % PINS.length];
}

export function isPinId(value: unknown): value is string {
  return PINS.some((pin) => pin.id === value);
}
