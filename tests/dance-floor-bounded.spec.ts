import { test, expect, type Locator, type Page } from "@playwright/test";

const FIXTURE = "/tests/fixtures/dance-floor-bounded.html";

/** Must stay in sync with CLUB_PULSE_DANCE_FLOOR_BOUNDS and the 8x6 grid. */
const BOUNDS = { x: 320, y: 420, width: 1280, height: 240 };
const COLUMNS = 8;
const ROWS = 6;
const TILE_WIDTH = BOUNDS.width / COLUMNS;
const TILE_HEIGHT = BOUNDS.height / ROWS;

function floor(page: Page) {
  return page.getByRole("group", { name: "Club Pulse dance floor" });
}

function tile(page: Page, column: number, row: number) {
  return page.getByRole("button", {
    name: `Light tile column ${column + 1}, row ${row + 1}`,
  });
}

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("element has no layout box");
  return rect;
}

test("a bounded floor renders exactly its stage bounds", async ({ page }) => {
  await page.goto(FIXTURE);
  const grid = floor(page);
  await expect(grid).toHaveAttribute("data-bounds", "320,420,1280,240");
  const stageBox = await box(page.getByTestId("stage"));
  const floorBox = await box(grid);
  expect(floorBox.width).toBeCloseTo(BOUNDS.width, 0);
  expect(floorBox.height).toBeCloseTo(BOUNDS.height, 0);
  // The floor owns its placement, so it sits at the bounds' x/y in the stage.
  expect(floorBox.x - stageBox.x).toBeCloseTo(BOUNDS.x, 0);
  expect(floorBox.y - stageBox.y).toBeCloseTo(BOUNDS.y, 0);
});

test("bounded tile rows and columns tile the bounds without gaps", async ({
  page,
}) => {
  await page.goto(FIXTURE);
  const floorBox = await box(floor(page));
  const corners = [
    { column: 0, row: 0 },
    { column: COLUMNS - 1, row: 0 },
    { column: 0, row: ROWS - 1 },
    { column: COLUMNS - 1, row: ROWS - 1 },
    { column: 3, row: 2 },
  ];
  for (const corner of corners) {
    const tileBox = await box(tile(page, corner.column, corner.row));
    expect(tileBox.width).toBeCloseTo(TILE_WIDTH, 0);
    expect(tileBox.height).toBeCloseTo(TILE_HEIGHT, 0);
    expect(tileBox.x - floorBox.x).toBeCloseTo(corner.column * TILE_WIDTH, 0);
    expect(tileBox.y - floorBox.y).toBeCloseTo(corner.row * TILE_HEIGHT, 0);
  }
});

const STEPS = [
  { label: "top left", column: 0, row: 0 },
  { label: "bottom right", column: COLUMNS - 1, row: ROWS - 1 },
  { label: "middle", column: 3, row: 2 },
];

for (const step of STEPS) {
  test(`stepping to the ${step.label} tile centre lights the tile drawn there`, async ({
    page,
  }) => {
    await page.goto(FIXTURE);
    const floorBox = await box(floor(page));
    await page.getByRole("button", { name: `Step to ${step.label}` }).click();

    const expectedTile = tile(page, step.column, step.row);
    await expect(expectedTile).toHaveAttribute("data-lit", "true");
    const index = step.row * COLUMNS + step.column;
    await expect(page.locator('output[aria-label="Lit tiles"]')).toHaveText(
      `[${index}]`,
    );

    // The stage point the footfall used must fall inside the lit tile's rect.
    const pointX = floorBox.x + (step.column + 0.5) * TILE_WIDTH;
    const pointY = floorBox.y + (step.row + 0.5) * TILE_HEIGHT;
    const tileBox = await box(expectedTile);
    expect(pointX).toBeGreaterThanOrEqual(tileBox.x);
    expect(pointX).toBeLessThanOrEqual(tileBox.x + tileBox.width);
    expect(pointY).toBeGreaterThanOrEqual(tileBox.y);
    expect(pointY).toBeLessThanOrEqual(tileBox.y + tileBox.height);

    await expect(expectedTile).toHaveAttribute("data-lit", "false", {
      timeout: 3000,
    });
  });
}
