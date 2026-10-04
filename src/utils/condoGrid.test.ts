import test from "node:test";
import assert from "node:assert/strict";
import {
  GRID_SIZE,
  TILE_WIDTH,
  TILE_HEIGHT,
  gridToScreen,
  screenToGrid,
  getEffectiveFootprint,
  isValidPlacement,
  calculateDepthOrder,
  serializeLayout,
  deserializeLayout,
  FURNITURE_CATALOG,
  type PlacedFurniture,
} from "./condoGrid.ts";

test("GRID_SIZE and tile dimensions match 2:1 isometric spec", () => {
  assert.equal(GRID_SIZE, 16);
  assert.equal(TILE_WIDTH, 64);
  assert.equal(TILE_HEIGHT, 32);
});

test("gridToScreen and screenToGrid round-trip for interior tiles", () => {
  const originX = 500;
  const originY = 100;
  for (let col = 0; col < GRID_SIZE; col += 1) {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      const screen = gridToScreen(col, row, originX, originY);
      const back = screenToGrid(screen.x, screen.y, originX, originY);
      assert.equal(back.col, col, `col mismatch at (${col},${row})`);
      assert.equal(back.row, row, `row mismatch at (${col},${row})`);
    }
  }
});

test("gridToScreen places origin tile (0,0) at the origin point", () => {
  const screen = gridToScreen(0, 0, 500, 100);
  assert.deepEqual(screen, { x: 500, y: 100 });
});

test("gridToScreen moves right and down for increasing col and row", () => {
  const origin = gridToScreen(0, 0, 0, 0);
  const colStep = gridToScreen(1, 0, 0, 0);
  const rowStep = gridToScreen(0, 1, 0, 0);
  assert.ok(colStep.x > origin.x);
  assert.ok(rowStep.x < origin.x);
  assert.ok(colStep.y > origin.y);
  assert.ok(rowStep.y > origin.y);
});

test("getEffectiveFootprint keeps footprint for N and S orientation", () => {
  const item: PlacedFurniture = {
    id: "a",
    itemId: "velvet-sofa",
    col: 0,
    row: 0,
    orientation: "N",
  };
  assert.deepEqual(getEffectiveFootprint(item), { width: 3, depth: 2 });
  assert.deepEqual(getEffectiveFootprint({ ...item, orientation: "S" }), {
    width: 3,
    depth: 2,
  });
});

test("getEffectiveFootprint swaps width and depth for E and W orientation", () => {
  const item: PlacedFurniture = {
    id: "a",
    itemId: "velvet-sofa",
    col: 0,
    row: 0,
    orientation: "E",
  };
  assert.deepEqual(getEffectiveFootprint(item), { width: 2, depth: 3 });
  assert.deepEqual(getEffectiveFootprint({ ...item, orientation: "W" }), {
    width: 2,
    depth: 3,
  });
});

test("isValidPlacement accepts a furniture item fully inside the grid", () => {
  const candidate: PlacedFurniture = {
    id: "a",
    itemId: "neon-lion-crest",
    col: 0,
    row: 0,
    orientation: "N",
  };
  assert.equal(isValidPlacement(candidate, []), true);
});

test("isValidPlacement accepts placement flush against the far edge", () => {
  const candidate: PlacedFurniture = {
    id: "a",
    itemId: "neon-lion-crest",
    col: GRID_SIZE - 1,
    row: GRID_SIZE - 1,
    orientation: "N",
  };
  assert.equal(isValidPlacement(candidate, []), true);
});

test("isValidPlacement rejects placement extending past the grid bounds", () => {
  const candidate: PlacedFurniture = {
    id: "a",
    itemId: "velvet-sofa",
    col: GRID_SIZE - 1,
    row: GRID_SIZE - 1,
    orientation: "N",
  };
  assert.equal(isValidPlacement(candidate, []), false);
});

test("isValidPlacement rejects negative coordinates", () => {
  const candidate: PlacedFurniture = {
    id: "a",
    itemId: "neon-lion-crest",
    col: -1,
    row: 0,
    orientation: "N",
  };
  assert.equal(isValidPlacement(candidate, []), false);
});

test("isValidPlacement rejects overlapping solid furniture", () => {
  const existing: PlacedFurniture = {
    id: "existing",
    itemId: "savanna-coffee-table",
    col: 2,
    row: 2,
    orientation: "N",
  };
  const candidate: PlacedFurniture = {
    id: "new",
    itemId: "pet-lion-cushion",
    col: 3,
    row: 3,
    orientation: "N",
  };
  assert.equal(isValidPlacement(candidate, [existing]), false);
});

test("isValidPlacement allows non-overlapping solid furniture", () => {
  const existing: PlacedFurniture = {
    id: "existing",
    itemId: "savanna-coffee-table",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const candidate: PlacedFurniture = {
    id: "new",
    itemId: "pet-lion-cushion",
    col: 5,
    row: 5,
    orientation: "N",
  };
  assert.equal(isValidPlacement(candidate, [existing]), true);
});

test("isValidPlacement allows a solid item on top of a rug", () => {
  const rug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const candidate: PlacedFurniture = {
    id: "sofa",
    itemId: "velvet-sofa",
    col: 0,
    row: 0,
    orientation: "N",
  };
  assert.equal(isValidPlacement(candidate, [rug]), true);
});

test("isValidPlacement allows a rug underneath an existing solid item", () => {
  const sofa: PlacedFurniture = {
    id: "sofa",
    itemId: "velvet-sofa",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const rug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 0,
    row: 0,
    orientation: "N",
  };
  assert.equal(isValidPlacement(rug, [sofa]), true);
});

test("isValidPlacement rejects overlapping rugs against other rugs sharing cells with solids", () => {
  const sofa: PlacedFurniture = {
    id: "sofa",
    itemId: "velvet-sofa",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const overlappingSolid: PlacedFurniture = {
    id: "crest",
    itemId: "neon-lion-crest",
    col: 2,
    row: 1,
    orientation: "N",
  };
  assert.equal(isValidPlacement(overlappingSolid, [sofa]), false);
});

test("calculateDepthOrder increases with col and row and adds solid bonus", () => {
  const nearRug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const farSolid: PlacedFurniture = {
    id: "crest",
    itemId: "neon-lion-crest",
    col: 10,
    row: 10,
    orientation: "N",
  };
  assert.ok(calculateDepthOrder(farSolid) > calculateDepthOrder(nearRug));
});

test("calculateDepthOrder matches the specified formula within the solid layer", () => {
  const item: PlacedFurniture = {
    id: "sofa",
    itemId: "velvet-sofa",
    col: 1,
    row: 2,
    orientation: "N",
  };
  const { width, depth } = getEffectiveFootprint(item);
  const corner = 1 + width - 1 + 2 + depth - 1;
  const expectedWithinLayer = corner * 100 + 50;
  const actualWithinLayer = calculateDepthOrder(item) % 1_000_000;
  assert.equal(actualWithinLayer, expectedWithinLayer);
});

test("calculateDepthOrder gives rugs a lower tiebreaker than solids at the same corner", () => {
  const rug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 2,
    row: 2,
    orientation: "N",
  };
  const crest: PlacedFurniture = {
    id: "crest",
    itemId: "neon-lion-crest",
    col: 4,
    row: 4,
    orientation: "N",
  };
  assert.equal(calculateDepthOrder(rug) % 100, 0);
  assert.equal(calculateDepthOrder(crest) % 100, 50);
});

test("calculateDepthOrder keeps every rug below every solid regardless of corner depth", () => {
  const nearRug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const farCrest: PlacedFurniture = {
    id: "crest",
    itemId: "neon-lion-crest",
    col: 1,
    row: 1,
    orientation: "N",
  };
  assert.ok(
    calculateDepthOrder(nearRug) < calculateDepthOrder(farCrest),
    "rug sharing the far crest's anchor tile must still render beneath it",
  );
});

test("calculateDepthOrder keeps a rug below a solid centered on the same tile", () => {
  const rug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const crest: PlacedFurniture = {
    id: "crest",
    itemId: "neon-lion-crest",
    col: 1,
    row: 1,
    orientation: "N",
  };
  assert.ok(calculateDepthOrder(rug) < calculateDepthOrder(crest));
});

test("calculateDepthOrder keeps a rug below a solid only partially overlapping it", () => {
  const rug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const crest: PlacedFurniture = {
    id: "crest",
    itemId: "neon-lion-crest",
    col: 2,
    row: 2,
    orientation: "N",
  };
  assert.ok(calculateDepthOrder(rug) < calculateDepthOrder(crest));
});

test("calculateDepthOrder orders rug-then-solid the same regardless of insertion order", () => {
  const rug: PlacedFurniture = {
    id: "rug",
    itemId: "woven-rug",
    col: 0,
    row: 0,
    orientation: "N",
  };
  const crest: PlacedFurniture = {
    id: "crest",
    itemId: "neon-lion-crest",
    col: 1,
    row: 1,
    orientation: "N",
  };
  const forward = [rug, crest].sort(
    (a, b) => calculateDepthOrder(a) - calculateDepthOrder(b),
  );
  const backward = [crest, rug].sort(
    (a, b) => calculateDepthOrder(a) - calculateDepthOrder(b),
  );
  assert.deepEqual(
    forward.map((item) => item.id),
    ["rug", "crest"],
  );
  assert.deepEqual(
    backward.map((item) => item.id),
    ["rug", "crest"],
  );
});

test("serializeLayout then deserializeLayout round-trips placed furniture", () => {
  const layout: PlacedFurniture[] = [
    { id: "a", itemId: "velvet-sofa", col: 1, row: 2, orientation: "E" },
    { id: "b", itemId: "woven-rug", col: 0, row: 0, orientation: "N" },
  ];
  const serialized = serializeLayout(layout);
  assert.equal(typeof serialized, "string");
  const restored = deserializeLayout(serialized);
  assert.deepEqual(restored, layout);
});

test("deserializeLayout falls back to an empty array for null or undefined", () => {
  assert.deepEqual(deserializeLayout(null), []);
  assert.deepEqual(deserializeLayout(undefined), []);
});

test("deserializeLayout falls back to an empty array for corrupted JSON", () => {
  assert.deepEqual(deserializeLayout("{not valid json"), []);
});

test("deserializeLayout falls back to an empty array for well-formed JSON that is not a furniture array", () => {
  assert.deepEqual(deserializeLayout("{}"), []);
  assert.deepEqual(deserializeLayout("[1,2,3]"), []);
  assert.deepEqual(
    deserializeLayout(
      JSON.stringify([
        { id: "a", itemId: "unknown-item", col: 0, row: 0, orientation: "N" },
      ]),
    ),
    [],
  );
});

test("deserializeLayout rejects placements with negative coordinates", () => {
  assert.deepEqual(
    deserializeLayout(
      JSON.stringify([
        {
          id: "a",
          itemId: "neon-lion-crest",
          col: -1,
          row: 0,
          orientation: "N",
        },
      ]),
    ),
    [],
  );
});

test("deserializeLayout rejects placements whose footprint extends past the grid", () => {
  assert.deepEqual(
    deserializeLayout(
      JSON.stringify([
        {
          id: "a",
          itemId: "velvet-sofa",
          col: GRID_SIZE - 1,
          row: GRID_SIZE - 1,
          orientation: "N",
        },
      ]),
    ),
    [],
  );
});

test("deserializeLayout rejects overlapping solid furniture", () => {
  assert.deepEqual(
    deserializeLayout(
      JSON.stringify([
        {
          id: "a",
          itemId: "savanna-coffee-table",
          col: 2,
          row: 2,
          orientation: "N",
        },
        {
          id: "b",
          itemId: "pet-lion-cushion",
          col: 3,
          row: 3,
          orientation: "N",
        },
      ]),
    ),
    [],
  );
});

test("deserializeLayout rejects duplicate furniture ids", () => {
  assert.deepEqual(
    deserializeLayout(
      JSON.stringify([
        {
          id: "dup",
          itemId: "neon-lion-crest",
          col: 0,
          row: 0,
          orientation: "N",
        },
        {
          id: "dup",
          itemId: "baobab-bonsai",
          col: 5,
          row: 5,
          orientation: "N",
        },
      ]),
    ),
    [],
  );
});

test("deserializeLayout accepts a legal rug underneath a solid at the same anchor", () => {
  const layout = [
    {
      id: "rug",
      itemId: "woven-rug",
      col: 0,
      row: 0,
      orientation: "N" as const,
    },
    {
      id: "sofa",
      itemId: "velvet-sofa",
      col: 0,
      row: 0,
      orientation: "N" as const,
    },
  ];
  assert.deepEqual(deserializeLayout(JSON.stringify(layout)), layout);
});

test("deserializeLayout accepts all four orientations when the footprint stays in bounds", () => {
  for (const orientation of ["N", "E", "S", "W"] as const) {
    const layout = [
      { id: "sofa", itemId: "velvet-sofa", col: 5, row: 5, orientation },
    ];
    assert.deepEqual(deserializeLayout(JSON.stringify(layout)), layout);
  }
});

test("FURNITURE_CATALOG defines all seven required items with correct footprints", () => {
  const expected: Record<
    string,
    { width: number; depth: number; comfortBonus: number; isRug?: boolean }
  > = {
    "velvet-sofa": { width: 3, depth: 2, comfortBonus: 15 },
    "grand-jukebox": { width: 2, depth: 1, comfortBonus: 20 },
    "neon-lion-crest": { width: 1, depth: 1, comfortBonus: 25 },
    "baobab-bonsai": { width: 1, depth: 1, comfortBonus: 10 },
    "pet-lion-cushion": { width: 2, depth: 2, comfortBonus: 30 },
    "savanna-coffee-table": { width: 2, depth: 2, comfortBonus: 10 },
    "woven-rug": { width: 3, depth: 3, comfortBonus: 15, isRug: true },
  };
  for (const [id, spec] of Object.entries(expected)) {
    const item = FURNITURE_CATALOG.find((entry) => entry.id === id);
    assert.ok(item, `missing catalog item ${id}`);
    assert.equal(item!.width, spec.width);
    assert.equal(item!.depth, spec.depth);
    assert.equal(item!.comfortBonus, spec.comfortBonus);
    assert.equal(!!item!.isRug, !!spec.isRug);
  }
});
