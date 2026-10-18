/**
 * Jelly Fishin rules with no React or DOM dependency: the boat glides along
 * the top; dropping the hook catches the jelly drifting underneath it.
 */

export const JELLY_DROPS = 12;
export const JELLY_ROWS = 3;

/** Boat position (0–100 %) at `ms`, gliding back and forth. */
export function boatX(ms: number, periodMs = 4000): number {
  const phase = (ms % periodMs) / periodMs;
  return 10 + 80 * (phase < 0.5 ? phase * 2 : 2 - phase * 2);
}

/** A jelly drifting in a row; its x wraps around the sea. */
export type Jelly = {
  row: number;
  offset: number;
  speed: number;
  gold: boolean;
};

export function jellyX(j: Jelly, ms: number): number {
  const x = (j.offset + (ms / 1000) * j.speed) % 100;
  return x < 0 ? x + 100 : x;
}

/** Three jellies per row at even spacing; one gold jelly worth 3. */
export function makeJellies(random: () => number = Math.random): Jelly[] {
  const goldAt = Math.min(8, Math.floor(random() * 9));
  return Array.from({ length: JELLY_ROWS * 3 }, (_, i) => {
    const row = i % JELLY_ROWS;
    return {
      row,
      offset: (Math.floor(i / JELLY_ROWS) * 33 + row * 11) % 100,
      speed: (row % 2 ? -1 : 1) * (6 + row * 3),
      gold: i === goldAt,
    };
  });
}

/** Points for a drop at `hook`: the closest jelly within reach, if any. */
export function dropCatch(
  jellies: readonly Jelly[],
  hook: number,
  ms: number,
  reach = 8,
): { index: number; points: number } {
  let index = -1;
  let best = reach;
  jellies.forEach((j, i) => {
    const d = Math.abs(jellyX(j, ms) - hook);
    const off = Math.min(d, 100 - d);
    if (off <= best) {
      best = off;
      index = i;
    }
  });
  return { index, points: index < 0 ? 0 : jellies[index].gold ? 3 : 1 };
}
