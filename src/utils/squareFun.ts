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

/**
 * Hiding spots in square stage units (1536 × 864), just beside the flower
 * beds, bushes, the fountain, the tree and the paths. Each stays clear of
 * every other tap target at phone size (see squareFun.test.ts), and off the
 * open lawn below the flower row, where taps mean "walk here".
 */
export const BUTTERFLY_SPOTS: readonly { x: number; y: number }[] = [
  { x: 130, y: 430 },
  { x: 410, y: 530 },
  { x: 1110, y: 420 },
  { x: 1290, y: 530 },
  { x: 140, y: 650 },
  { x: 870, y: 660 },
  { x: 1150, y: 550 },
  { x: 1220, y: 640 },
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
