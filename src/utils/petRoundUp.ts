/**
 * Pet Round-Up rules with no React or DOM dependency: pets wander a field and
 * flee from a nudge; herd them into the pen in the top-right corner. The
 * simulation moves in fixed steps so tests can play it out exactly.
 */
import { PET_SPECIES_ORDER, type PetSpecies } from "./petSpecies.ts";

export const ROUNDUP_ROUND_MS = 60_000;
export const ROUNDUP_STEP_MS = 100;
export const ROUNDUP_PETS = 9;
/** Every pet penned earns the stamp, however long it took. */
export const ROUNDUP_STAMP_SCORE = ROUNDUP_PETS;
/** All pets in on the very first second: no real round scores more. */
export const ROUNDUP_MAX_SCORE = ROUNDUP_PETS + ROUNDUP_ROUND_MS / 1000;

/** Percent of the field width and height that pets may stand in. */
export const FIELD = { x1: 6, y1: 10, x2: 94, y2: 90 } as const;
export const PEN = { x1: 68, y1: 10, x2: 94, y2: 40 } as const;
const PEN_CENTER = { x: (PEN.x1 + PEN.x2) / 2, y: (PEN.y1 + PEN.y2) / 2 };
/** Pets closer than this (percent) to a nudge run away from it. */
export const NUDGE_RADIUS = 20;
const NUDGE_PUSH = 6;
const HOP = 10;
/** Percent per second: a slow, toddler-friendly amble. */
const WANDER_SPEED = 5;
const TURN_CHANCE = 0.03;

export type RoundUpPet = {
  id: number;
  species: PetSpecies;
  /** Percent of the field width and height. */
  x: number;
  y: number;
  /** Wander velocity in percent per second. */
  vx: number;
  vy: number;
};

type Point = { x: number; y: number };
type Box = { x1: number; y1: number; x2: number; y2: number };

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

const clampTo = (box: Box, p: Point): Point => ({
  x: clamp(p.x, box.x1, box.x2),
  y: clamp(p.y, box.y1, box.y2),
});

export function isPenned(pet: Point): boolean {
  return (
    pet.x >= PEN.x1 && pet.x <= PEN.x2 && pet.y >= PEN.y1 && pet.y <= PEN.y2
  );
}

function heading(random: () => number): { vx: number; vy: number } {
  const angle = random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * WANDER_SPEED,
    vy: Math.sin(angle) * WANDER_SPEED,
  };
}

/** One pet per cell of a 3-wide grid on the left of the field, away from the pen. */
export function makePets(random: () => number = Math.random): RoundUpPet[] {
  return Array.from({ length: ROUNDUP_PETS }, (_, i) => ({
    id: i + 1,
    species: PET_SPECIES_ORDER[i % PET_SPECIES_ORDER.length],
    x: 10 + (i % 3) * 18 + random() * 10,
    y: 20 + Math.floor(i / 3) * 24 + random() * 14,
    ...heading(random),
  }));
}

/** One fixed step of wandering. Penned pets amble inside the pen and stay. */
export function stepPets(
  pets: readonly RoundUpPet[],
  random: () => number = Math.random,
  wander = true,
): RoundUpPet[] {
  if (!wander) return [...pets];
  const dt = ROUNDUP_STEP_MS / 1000;
  return pets.map((pet) => {
    const box = isPenned(pet) ? PEN : FIELD;
    let { vx, vy } = random() < TURN_CHANCE ? heading(random) : pet;
    let x = pet.x + vx * dt;
    let y = pet.y + vy * dt;
    // Bounce off the edges instead of sticking to them.
    if (x < box.x1 || x > box.x2) vx = -vx;
    if (y < box.y1 || y > box.y2) vy = -vy;
    ({ x, y } = clampTo(box, { x, y }));
    return { ...pet, x, y, vx, vy };
  });
}

/** Pets near the point run away from it; nearer pets jump further. */
export function nudgePets(
  pets: readonly RoundUpPet[],
  at: Point,
): RoundUpPet[] {
  return pets.map((pet) => {
    const dx = pet.x - at.x;
    const dy = pet.y - at.y;
    const distance = Math.hypot(dx, dy);
    if (distance > NUDGE_RADIUS) return pet;
    // A tap right on top sends the pet toward the pen.
    const [ux, uy] =
      distance < 0.01
        ? unit(PEN_CENTER.x - pet.x, PEN_CENTER.y - pet.y)
        : [dx / distance, dy / distance];
    const push = NUDGE_PUSH * (1 - distance / NUDGE_RADIUS) + 1;
    return {
      ...pet,
      ...clampTo(FIELD, { x: pet.x + ux * push, y: pet.y + uy * push }),
      vx: ux * WANDER_SPEED,
      vy: uy * WANDER_SPEED,
    };
  });
}

function unit(dx: number, dy: number): [number, number] {
  const length = Math.hypot(dx, dy);
  return length < 0.01 ? [0, -1] : [dx / length, dy / length];
}

export function dragPet(
  pets: readonly RoundUpPet[],
  id: number,
  to: Point,
): RoundUpPet[] {
  return pets.map((pet) =>
    pet.id === id ? { ...pet, ...clampTo(FIELD, to) } : pet,
  );
}

/** A tap (or Enter) on a pet hops it one step toward the pen. */
export function hopTowardPen(
  pets: readonly RoundUpPet[],
  id: number,
): RoundUpPet[] {
  return pets.map((pet) => {
    if (pet.id !== id) return pet;
    const dx = PEN_CENTER.x - pet.x;
    const dy = PEN_CENTER.y - pet.y;
    const step = Math.min(HOP, Math.hypot(dx, dy));
    const [ux, uy] = unit(dx, dy);
    return { ...pet, x: pet.x + ux * step, y: pet.y + uy * step };
  });
}

export function roundUpScore(
  pets: readonly RoundUpPet[],
  msLeft: number,
): number {
  const penned = pets.filter(isPenned).length;
  return penned === pets.length
    ? penned + Math.ceil(Math.max(0, msLeft) / 1000)
    : penned;
}
