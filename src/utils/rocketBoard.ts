/**
 * Rocket Board rules with no React or DOM dependency: hold Boost to climb,
 * let go to drift down. Stars and clouds float in from the right; stars add
 * up and clouds give a soft bump. Nothing ends the flight early.
 */

export const ROCKET_ROUND_MS = 40_000;
export const ROCKET_MAX_SCORE = 300;
export const ROCKET_X = 20;
const LIFT = 70;
const FALL = 45;

/** New height (0 top – 100 bottom) after `dt` seconds of boosting or not. */
export function flyRocket(y: number, boosting: boolean, dt: number): number {
  return Math.max(6, Math.min(94, y + (boosting ? -LIFT : FALL) * dt));
}

export type SkyThing = { id: number; x: number; y: number; star: boolean };

export function driftSky(
  things: SkyThing[],
  dt: number,
  speed = 30,
): SkyThing[] {
  return things
    .map((t) => ({ ...t, x: t.x - speed * dt }))
    .filter((t) => t.x > -10);
}

export function nearRocket(things: readonly SkyThing[], y: number): SkyThing[] {
  return things.filter(
    (t) => Math.abs(t.x - ROCKET_X) < 6 && Math.abs(t.y - y) < 8,
  );
}

export function makeSkyThing(
  id: number,
  random: () => number = Math.random,
): SkyThing {
  return { id, x: 108, y: 10 + random() * 80, star: random() < 0.7 };
}
