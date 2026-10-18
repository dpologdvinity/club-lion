/**
 * Galaxy Hero rules with no React or DOM dependency: the ship slides along
 * the bottom and fires on its own; meteors drift down. Hits score; meteors
 * that slip past simply float away.
 */

export const GALAXY_ROUND_MS = 45_000;
export const GALAXY_MAX_SCORE = 300;
export const SHOT_EVERY_MS = 350;
export const SHOT_SPEED = 120;
export const SHIP_Y = 90;

export type Meteor = { id: number; x: number; y: number; speed: number };
export type Shot = { id: number; x: number; y: number };

/** Moves meteors and shots `dt` seconds; returns survivors and hit count. */
export function stepGalaxy(
  meteors: Meteor[],
  shots: Shot[],
  dt: number,
): { meteors: Meteor[]; shots: Shot[]; hits: number } {
  const moved = meteors
    .map((m) => ({ ...m, y: m.y + m.speed * dt }))
    .filter((m) => m.y < 110);
  const flying = shots
    .map((s) => ({ ...s, y: s.y - SHOT_SPEED * dt }))
    .filter((s) => s.y > -5);
  const hitMeteors = new Set<number>();
  const usedShots = new Set<number>();
  for (const s of flying)
    for (const m of moved)
      if (
        !hitMeteors.has(m.id) &&
        !usedShots.has(s.id) &&
        Math.abs(s.x - m.x) < 7 &&
        Math.abs(s.y - m.y) < 7
      ) {
        hitMeteors.add(m.id);
        usedShots.add(s.id);
      }
  return {
    meteors: moved.filter((m) => !hitMeteors.has(m.id)),
    shots: flying.filter((s) => !usedShots.has(s.id)),
    hits: hitMeteors.size,
  };
}

export function makeMeteor(
  id: number,
  random: () => number = Math.random,
): Meteor {
  return { id, x: 8 + random() * 84, y: -6, speed: 14 + random() * 10 };
}
