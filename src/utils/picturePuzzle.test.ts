import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PICTURES,
  PUZZLE_HEIGHT,
  PUZZLE_WIDTH,
  gridFor,
  isNearSlot,
  isPieceCount,
  pieceShapes,
  shufflePieces,
  type PieceCount,
} from "./picturePuzzle.ts";

/** Every x/y pair in a path string, in order. */
function pointsOf(d: string): [number, number][] {
  const out: [number, number][] = [];
  for (const [, , args] of d.matchAll(/([MLCZ])([^MLCZ]*)/g)) {
    const numbers = args.trim().split(/\s+/).filter(Boolean).map(Number);
    for (let index = 0; index + 1 < numbers.length; index += 2)
      out.push([numbers[index], numbers[index + 1]]);
  }
  return out;
}

const key = ([x, y]: [number, number]) => `${x.toFixed(3)},${y.toFixed(3)}`;

test("the three pictures are cut into 4, 6 and 9 pieces in that order", () => {
  assert.deepEqual(
    PICTURES.map((picture) => picture.pieces),
    [4, 6, 9],
  );
  assert.equal(new Set(PICTURES.map((picture) => picture.id)).size, 3);
  for (const pieces of [4, 6, 9] as const) {
    const { cols, rows } = gridFor(pieces);
    assert.equal(cols * rows, pieces);
    assert.equal(pieceShapes(pieces).length, pieces);
  }
});

test("only 4, 6 and 9 are accepted as piece counts", () => {
  for (const value of [4, 6, 9]) assert.equal(isPieceCount(value), true);
  for (const value of [0, 1, 5, 8, 12, 4.5, "4", null, undefined])
    assert.equal(isPieceCount(value), false, String(value));
});

test("every piece sits on its own cell and the cells tile the picture", () => {
  for (const pieces of [4, 6, 9] as const) {
    const { cols, rows } = gridFor(pieces);
    const shapes = pieceShapes(pieces);
    assert.deepEqual(
      shapes.map((shape) => shape.index),
      shapes.map((_, index) => index),
    );
    const areas = shapes.reduce(
      (sum, shape) => sum + shape.width * shape.height,
      0,
    );
    assert.equal(Math.round(areas), PUZZLE_WIDTH * PUZZLE_HEIGHT);
    assert.equal(shapes[cols * rows - 1].x + shapes[0].width, PUZZLE_WIDTH);
    assert.equal(shapes[cols * rows - 1].y + shapes[0].height, PUZZLE_HEIGHT);
  }
});

test("neighbouring outlines share the same knob points on their common edge", () => {
  const [topLeft, topRight, bottomLeft] = pieceShapes(4).map((shape) =>
    pointsOf(shape.d),
  );
  // Left and right pieces: each knob sits within 40 units of the x = 200 seam.
  const seamA = topLeft.filter(
    ([x, y]) => Math.abs(x - 200) < 40 && y > 0 && y < 150,
  );
  const seamB = topRight.filter(
    ([x, y]) => Math.abs(x - 200) < 40 && y > 0 && y < 150,
  );
  assert.ok(seamA.length > 3);
  assert.deepEqual(seamA.map(key).sort(), seamB.map(key).sort());
  // Top and bottom pieces: each knob sits within 40 units of the y = 150 seam.
  const shareA = topLeft.filter(
    ([x, y]) => Math.abs(y - 150) < 40 && x > 0 && x < 200,
  );
  const shareB = bottomLeft.filter(
    ([x, y]) => Math.abs(y - 150) < 40 && x > 0 && x < 200,
  );
  assert.ok(shareA.length > 3);
  assert.deepEqual(shareA.map(key).sort(), shareB.map(key).sort());
});

test("each internal edge gives one knob and one notch, three curves each", () => {
  for (const pieces of [4, 6, 9] as const) {
    const { cols, rows } = gridFor(pieces);
    const internal = cols * (rows - 1) + rows * (cols - 1);
    const curves = pieceShapes(pieces).reduce(
      (sum, shape) => sum + (shape.d.match(/C/g)?.length ?? 0),
      0,
    );
    assert.equal(curves, internal * 2 * 3);
  }
});

test("outlines are closed paths and the padding covers the knobs", () => {
  for (const pieces of [4, 6, 9] as PieceCount[]) {
    for (const shape of pieceShapes(pieces)) {
      assert.ok(shape.d.startsWith("M") && shape.d.endsWith("Z"));
      for (const [x, y] of pointsOf(shape.d)) {
        assert.ok(
          x >= shape.x - shape.pad && x <= shape.x + shape.width + shape.pad,
        );
        assert.ok(
          y >= shape.y - shape.pad && y <= shape.y + shape.height + shape.pad,
        );
      }
    }
  }
});

test("a drop snaps only when it lands close to the slot centre", () => {
  const center = { x: 100, y: 75 };
  assert.equal(isNearSlot({ x: 110, y: 80 }, center, 150), true);
  assert.equal(isNearSlot({ x: 100, y: 75 }, center, 150), true);
  assert.equal(isNearSlot({ x: 190, y: 75 }, center, 150), false);
  assert.equal(isNearSlot({ x: 100, y: 200 }, center, 100), false);
});

test("the tray order is a shuffled permutation of the pieces", () => {
  const order = shufflePieces(9, () => 0.3);
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.notDeepEqual(
    shufflePieces(9, () => 0.3),
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.deepEqual(
    shufflePieces(4, () => 0),
    [1, 2, 3, 0],
  );
});
