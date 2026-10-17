/**
 * Savanna Square play rules with no React or DOM dependency: the weather
 * toy's cycle and where today's five butterflies hide.
 */

export type Weather = "sunny" | "rain" | "rainbow" | "snow";

export const WEATHER_CYCLE: readonly Weather[] = [
  "sunny",
  "rain",
  "rainbow",
  "snow",
];

export function nextWeather(current: Weather): Weather {
  const index = WEATHER_CYCLE.indexOf(current);
  return WEATHER_CYCLE[(index + 1) % WEATHER_CYCLE.length];
}

export const BUTTERFLY_COUNT = 5;

/** Hiding spots in square stage units (1536 × 864): flower beds, bushes, the fountain rim, the tree and the paths. */
export const BUTTERFLY_SPOTS: readonly { x: number; y: number }[] = [
  { x: 210, y: 520 },
  { x: 420, y: 470 },
  { x: 640, y: 430 },
  { x: 900, y: 430 },
  { x: 1120, y: 470 },
  { x: 1330, y: 530 },
  { x: 160, y: 640 },
  { x: 470, y: 640 },
  { x: 770, y: 560 },
  { x: 1060, y: 640 },
  { x: 1380, y: 660 },
  { x: 880, y: 640 },
];

/** The child's local calendar day, so the hunt resets at their midnight. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Today's five hiding spots: the same all day, different on most days. */
export function butterfliesForDay(day: string): number[] {
  let seed = 2166136261;
  for (const char of day) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  const picked: number[] = [];
  while (picked.length < BUTTERFLY_COUNT) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const spot = seed % BUTTERFLY_SPOTS.length;
    if (!picked.includes(spot)) picked.push(spot);
  }
  return picked;
}
