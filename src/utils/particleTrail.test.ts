import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSparkleStep, type SparkleParticle } from "./particleTrail.ts";

test("not moving and no previous particles yields no particles", () => {
  const result = generateSparkleStep(
    [],
    { x: 50, y: 50 },
    false,
    undefined,
    16,
  );
  assert.deepEqual(result, []);
});

test("moving spawns at least one new particle at the current position", () => {
  const result = generateSparkleStep(
    [],
    { x: 50, y: 50 },
    true,
    "hover_leaf",
    16,
  );
  assert.ok(result.length > 0);
  const spawned = result[result.length - 1];
  assert.ok(Math.abs(spawned.x - 50) < 1);
  assert.ok(Math.abs(spawned.y - 50) < 1);
});

test("hover_leaf board uses emerald/lime green palette", () => {
  const result = generateSparkleStep(
    [],
    { x: 10, y: 10 },
    true,
    "hover_leaf",
    16,
  );
  const palette = ["#4ade80", "#22c55e", "#86efac"];
  for (const p of result) {
    assert.ok(palette.includes(p.color));
  }
});

test("star_cruiser board uses solar gold/amber palette", () => {
  const result = generateSparkleStep(
    [],
    { x: 10, y: 10 },
    true,
    "star_cruiser",
    16,
  );
  const palette = ["#fbbf24", "#f59e0b", "#fef08a"];
  for (const p of result) {
    assert.ok(palette.includes(p.color));
  }
});

test("neon_pulse board uses cyan/electric blue palette", () => {
  const result = generateSparkleStep(
    [],
    { x: 10, y: 10 },
    true,
    "neon_pulse",
    16,
  );
  const palette = ["#22d3ee", "#06b6d4", "#67e8f9"];
  for (const p of result) {
    assert.ok(palette.includes(p.color));
  }
});

test("unknown/default board uses magical lavender palette", () => {
  const result = generateSparkleStep([], { x: 10, y: 10 }, true, undefined, 16);
  const palette = ["#c084fc", "#a855f7"];
  for (const p of result) {
    assert.ok(palette.includes(p.color));
  }
});

test("particles decay life over time and are removed once expired", () => {
  const seed: SparkleParticle[] = [
    {
      id: "p1",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: "#c084fc",
      size: 4,
      alpha: 1,
      life: 10,
      maxLife: 500,
    },
  ];
  const result = generateSparkleStep(
    seed,
    { x: 0, y: 0 },
    false,
    undefined,
    20,
  );
  assert.equal(
    result.find((p) => p.id === "p1"),
    undefined,
  );
});

test("particle life decreases by deltaMs and alpha fades accordingly", () => {
  const seed: SparkleParticle[] = [
    {
      id: "p1",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: "#c084fc",
      size: 4,
      alpha: 1,
      life: 500,
      maxLife: 500,
    },
  ];
  const result = generateSparkleStep(
    seed,
    { x: 0, y: 0 },
    false,
    undefined,
    100,
  );
  const updated = result.find((p) => p.id === "p1")!;
  assert.equal(updated.life, 400);
  assert.ok(Math.abs(updated.alpha - 0.8) < 1e-6);
});

test("existing particles drift by velocity each step", () => {
  const seed: SparkleParticle[] = [
    {
      id: "p1",
      x: 10,
      y: 10,
      vx: 2,
      vy: -1,
      color: "#c084fc",
      size: 4,
      alpha: 1,
      life: 300,
      maxLife: 500,
    },
  ];
  const result = generateSparkleStep(
    seed,
    { x: 10, y: 10 },
    false,
    undefined,
    16,
  );
  const updated = result.find((p) => p.id === "p1")!;
  assert.ok(
    Math.abs(updated.x - (10 + 2 * (16 / 1000) * 60)) < 5 || updated.x > 10,
  );
  assert.ok(updated.y < 10);
});

test("spawned particle lifespan falls within the 400-600ms range", () => {
  const result = generateSparkleStep(
    [],
    { x: 0, y: 0 },
    true,
    "neon_pulse",
    16,
  );
  for (const p of result) {
    assert.ok(p.maxLife >= 400 && p.maxLife <= 600);
    assert.equal(p.life, p.maxLife);
  }
});

test("each spawned particle has a unique id", () => {
  let particles: SparkleParticle[] = [];
  particles = generateSparkleStep(
    particles,
    { x: 0, y: 0 },
    true,
    "hover_leaf",
    16,
  );
  particles = generateSparkleStep(
    particles,
    { x: 1, y: 1 },
    true,
    "hover_leaf",
    16,
  );
  const ids = particles.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});
