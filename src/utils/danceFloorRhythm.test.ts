import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_BPM,
  FLOOR_COLUMNS,
  FLOOR_ROWS,
  FLOOR_TILE_COUNT,
  TILE_GLOW_MS,
  TILE_PALETTE,
  beatAt,
  beatPhase,
  detectFootfall,
  msPerBeat,
  pulseStrength,
  quantizeToBeat,
  registerFootfall,
  tileColor,
  tileCoord,
  tileFromPosition,
  tileGlow,
  tileIndex,
  type FloorBounds,
  type TileFootfall,
} from "./danceFloorRhythm.ts";

const FLOOR: FloorBounds = { x: 100, y: 200, width: 800, height: 600 };

test("the floor is an 8 by 6 grid with a non-empty palette", () => {
  assert.equal(FLOOR_COLUMNS, 8);
  assert.equal(FLOOR_ROWS, 6);
  assert.equal(FLOOR_TILE_COUNT, 48);
  assert.ok(TILE_PALETTE.length > 1);
});

test("msPerBeat converts BPM and falls back on invalid tempos", () => {
  assert.equal(msPerBeat(120), 500);
  assert.equal(msPerBeat(60), 1000);
  assert.equal(msPerBeat(0), msPerBeat(DEFAULT_BPM));
  assert.equal(msPerBeat(-90), msPerBeat(DEFAULT_BPM));
  assert.equal(msPerBeat(Number.NaN), msPerBeat(DEFAULT_BPM));
});

test("beatAt counts whole beats and never goes negative", () => {
  assert.equal(beatAt(0, 120), 0);
  assert.equal(beatAt(499, 120), 0);
  assert.equal(beatAt(500, 120), 1);
  assert.equal(beatAt(1750, 120), 3);
  assert.equal(beatAt(-400, 120), 0);
  assert.equal(beatAt(Number.NaN, 120), 0);
});

test("quantizeToBeat snaps a time to the nearest beat boundary", () => {
  assert.equal(quantizeToBeat(0, 120), 0);
  assert.equal(quantizeToBeat(240, 120), 0);
  assert.equal(quantizeToBeat(260, 120), 500);
  assert.equal(quantizeToBeat(760, 120), 1000);
  assert.equal(quantizeToBeat(-50, 120), 0);
});

test("beatPhase reports progress through the current beat", () => {
  assert.equal(beatPhase(0, 120), 0);
  assert.equal(beatPhase(250, 120), 0.5);
  assert.equal(beatPhase(500, 120), 0);
  assert.equal(beatPhase(-10, 120), 0);
});

test("pulseStrength peaks on the beat and decays before the next one", () => {
  assert.equal(pulseStrength(0, 120), 1);
  assert.equal(pulseStrength(250, 120), 0.5);
  assert.equal(pulseStrength(500, 120), 1);
  assert.ok(pulseStrength(499, 120) < 0.05);
  assert.ok(pulseStrength(100, 120) > pulseStrength(400, 120));
});

test("tileIndex and tileCoord round trip every tile and reject off-grid input", () => {
  for (let index = 0; index < FLOOR_TILE_COUNT; index++) {
    const coord = tileCoord(index);
    assert.ok(coord);
    assert.equal(tileIndex(coord.column, coord.row), index);
  }
  assert.equal(tileIndex(8, 0), -1);
  assert.equal(tileIndex(0, 6), -1);
  assert.equal(tileIndex(-1, 0), -1);
  assert.equal(tileIndex(1.5, 0), -1);
  assert.equal(tileCoord(-1), null);
  assert.equal(tileCoord(FLOOR_TILE_COUNT), null);
});

test("tile colors cycle through the palette as beats advance", () => {
  const first = tileColor(0, 0);
  assert.equal(first, TILE_PALETTE[0]);
  assert.equal(tileColor(0, TILE_PALETTE.length), first);
  assert.notEqual(tileColor(0, 1), first);
  // Neighbouring tiles differ so the floor reads as a diagonal colour wave.
  assert.notEqual(tileColor(tileIndex(1, 0), 0), tileColor(tileIndex(0, 0), 0));
  assert.notEqual(tileColor(tileIndex(0, 1), 0), tileColor(tileIndex(0, 0), 0));
  // A tile one beat later shows the colour its diagonal neighbour just had.
  assert.equal(tileColor(tileIndex(0, 0), 1), tileColor(tileIndex(1, 0), 0));
  assert.equal(tileColor(-1, 0), TILE_PALETTE[0]);
});

test("tileFromPosition maps stage coordinates onto the grid", () => {
  assert.equal(tileFromPosition({ x: 100, y: 200 }, FLOOR), tileIndex(0, 0));
  assert.equal(tileFromPosition({ x: 899, y: 799 }, FLOOR), tileIndex(7, 5));
  assert.equal(tileFromPosition({ x: 500, y: 500 }, FLOOR), tileIndex(4, 3));
  assert.equal(tileFromPosition({ x: 99, y: 500 }, FLOOR), -1);
  assert.equal(tileFromPosition({ x: 500, y: 800 }, FLOOR), -1);
  assert.equal(tileFromPosition({ x: 900, y: 500 }, FLOOR), -1);
});

test("detectFootfall only fires when the avatar crosses into a new tile", () => {
  const start = { x: 150, y: 250 };
  assert.equal(detectFootfall(null, start, FLOOR), tileIndex(0, 0));
  assert.equal(detectFootfall(start, { x: 180, y: 260 }, FLOOR), null);
  assert.equal(
    detectFootfall(start, { x: 250, y: 250 }, FLOOR),
    tileIndex(1, 0),
  );
  // Stepping off the floor lights nothing, and stepping back on lights again.
  assert.equal(detectFootfall(start, { x: 50, y: 250 }, FLOOR), null);
  assert.equal(
    detectFootfall({ x: 50, y: 250 }, start, FLOOR),
    tileIndex(0, 0),
  );
});

test("registerFootfall keeps the newest hit per tile and prunes faded ones", () => {
  const first = registerFootfall([], 3, 1000);
  assert.deepEqual(first, [{ tile: 3, atMs: 1000 }]);

  const second = registerFootfall(first, 9, 1100);
  assert.deepEqual(second.map((hit) => hit.tile).sort(), [3, 9]);

  const relit = registerFootfall(second, 3, 1200);
  assert.equal(relit.filter((hit) => hit.tile === 3).length, 1);
  assert.equal(relit.find((hit) => hit.tile === 3)?.atMs, 1200);

  const later = registerFootfall(relit, 12, 1200 + TILE_GLOW_MS + 1);
  assert.deepEqual(
    later.map((hit) => hit.tile),
    [12],
  );

  assert.deepEqual(registerFootfall([], -1, 1000), []);
});

test("tileGlow fades a footfall from full to zero over the glow window", () => {
  const hits: TileFootfall[] = [{ tile: 5, atMs: 1000 }];
  assert.equal(tileGlow(hits, 5, 1000), 1);
  assert.equal(tileGlow(hits, 5, 1000 + TILE_GLOW_MS / 2), 0.5);
  assert.equal(tileGlow(hits, 5, 1000 + TILE_GLOW_MS), 0);
  assert.equal(tileGlow(hits, 5, 5000), 0);
  assert.equal(tileGlow(hits, 4, 1000), 0);
  assert.equal(tileGlow(hits, 5, 900), 0);
});
