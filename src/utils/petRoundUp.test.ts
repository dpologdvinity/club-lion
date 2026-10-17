import test from "node:test";
import assert from "node:assert/strict";
import {
  FIELD,
  NUDGE_RADIUS,
  PEN,
  ROUNDUP_MAX_SCORE,
  ROUNDUP_PETS,
  ROUNDUP_ROUND_MS,
  ROUNDUP_STAMP_SCORE,
  dragPet,
  hopTowardPen,
  isPenned,
  makePets,
  nudgePets,
  roundUpScore,
  stepPets,
  type RoundUpPet,
} from "./petRoundUp.ts";

const pet = (over: Partial<RoundUpPet> = {}): RoundUpPet => ({
  id: 1,
  species: "bunny",
  x: 30,
  y: 60,
  vx: 0,
  vy: 0,
  ...over,
});

const inField = (p: RoundUpPet) =>
  p.x >= FIELD.x1 && p.x <= FIELD.x2 && p.y >= FIELD.y1 && p.y <= FIELD.y2;

test("a round starts with every pet out in the field, none in the pen", () => {
  for (const roll of [0, 0.5, 0.999]) {
    const pets = makePets(() => roll);
    assert.equal(pets.length, ROUNDUP_PETS);
    assert.equal(new Set(pets.map((p) => p.id)).size, ROUNDUP_PETS);
    for (const p of pets) {
      assert.ok(inField(p));
      assert.equal(isPenned(p), false);
    }
  }
  assert.ok(ROUNDUP_PETS >= 8 && ROUNDUP_PETS <= 10);
});

test("the pen is the corner zone", () => {
  assert.equal(
    isPenned(pet({ x: (PEN.x1 + PEN.x2) / 2, y: PEN.y2 - 1 })),
    true,
  );
  assert.equal(isPenned(pet({ x: PEN.x1 - 1, y: PEN.y2 - 1 })), false);
  assert.equal(isPenned(pet({ x: PEN.x2 - 1, y: PEN.y2 + 1 })), false);
});

test("pets flee from a nudge and stay inside the field", () => {
  const [moved] = nudgePets([pet({ x: 30, y: 60 })], { x: 25, y: 60 });
  assert.ok(moved.x > 30, "pushed right, away from the tap");
  assert.equal(moved.y, 60);
  const [far] = nudgePets([pet()], { x: 30 + NUDGE_RADIUS + 1, y: 60 });
  assert.equal(far.x, 30, "out of reach, it stays put");
  const [edge] = nudgePets([pet({ x: FIELD.x2 - 1, y: FIELD.y2 - 1 })], {
    x: FIELD.x2 - 4,
    y: FIELD.y2 - 4,
  });
  assert.ok(inField(edge));
  // A tap right on top still sends the pet somewhere.
  const [onTop] = nudgePets([pet()], { x: 30, y: 60 });
  assert.notDeepEqual([onTop.x, onTop.y], [30, 60]);
  assert.ok(inField(onTop));
});

test("a dragged pet goes where the finger is, clamped to the field", () => {
  const pets = [pet(), pet({ id: 2, x: 50 })];
  const dragged = dragPet(pets, 1, { x: 90, y: 10 });
  assert.deepEqual([dragged[0].x, dragged[0].y], [90, 10]);
  assert.equal(dragged[1], pets[1]);
  assert.ok(isPenned(dragged[0]));
  const outside = dragPet(pets, 1, { x: 150, y: -20 });
  assert.ok(inField(outside[0]));
});

test("a tap on a pet hops it toward the pen", () => {
  const start = pet({ x: 20, y: 80 });
  const [hopped] = hopTowardPen([start], 1);
  assert.ok(hopped.x > start.x && hopped.y < start.y);
  let walk = [start];
  for (let i = 0; i < 20; i++) walk = hopTowardPen(walk, 1);
  assert.equal(isPenned(walk[0]), true);
});

test("pets wander inside the field; penned pets stay in the pen", () => {
  let pets = [
    pet({ vx: 30, vy: 30 }),
    pet({ id: 2, x: (PEN.x1 + PEN.x2) / 2, y: PEN.y2 - 2, vx: 0, vy: 40 }),
  ];
  for (let i = 0; i < 200; i++) pets = stepPets(pets, () => 0.5);
  assert.ok(inField(pets[0]));
  assert.equal(isPenned(pets[1]), true);
});

test("with wandering off (reduced motion) pets hold still", () => {
  const pets = [pet({ vx: 30, vy: 30 })];
  const [still] = stepPets(pets, () => 0.1, false);
  assert.deepEqual([still.x, still.y], [30, 60]);
});

test("score counts penned pets, plus seconds left only when all are in", () => {
  const out = pet();
  const inPen = pet({ x: PEN.x2 - 2, y: PEN.y1 + 2 });
  assert.equal(roundUpScore([out, inPen, inPen], 20_000), 2);
  assert.equal(roundUpScore([inPen, inPen], 20_500), 2 + 21);
  assert.equal(roundUpScore([inPen, inPen], 0), 2);
  assert.ok(ROUNDUP_STAMP_SCORE <= ROUNDUP_MAX_SCORE);
  assert.equal(
    roundUpScore(Array(ROUNDUP_PETS).fill(inPen), ROUNDUP_ROUND_MS),
    ROUNDUP_MAX_SCORE,
  );
});
