/**
 * Pure dance floor rules for Club Pulse: beat quantization, LED tile colour
 * cycling, and avatar footfall detection. No React or DOM dependency, so the
 * floor's behaviour is testable without a browser.
 */

export const FLOOR_COLUMNS = 8;
export const FLOOR_ROWS = 6;
export const FLOOR_TILE_COUNT = FLOOR_COLUMNS * FLOOR_ROWS;

/** Default club tempo, matching the DJ Beat Drop chart so both stay in sync. */
export const DEFAULT_BPM = 120;

/** How long one footfall keeps a tile lit before it fades back to idle. */
export const TILE_GLOW_MS = 420;

/** Six LED hues so the diagonal colour wave repeats on a non-grid period. */
export const TILE_PALETTE = [
  "#ff4fa3",
  "#ffcf5c",
  "#5ef2c4",
  "#4fa8ff",
  "#b388ff",
  "#ff8a5c",
] as const;

export type TileCoord = { column: number; row: number };

export type FloorBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FloorPoint = { x: number; y: number };

export type TileFootfall = { tile: number; atMs: number };

function isFiniteNumber(value: number): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

/** Milliseconds per quarter note, falling back to the club tempo. */
export function msPerBeat(bpm: number): number {
  if (!isFiniteNumber(bpm) || bpm <= 0) return 60000 / DEFAULT_BPM;
  return 60000 / bpm;
}

/** Whole beats elapsed since the floor started pulsing. */
export function beatAt(elapsedMs: number, bpm = DEFAULT_BPM): number {
  if (!isFiniteNumber(elapsedMs) || elapsedMs <= 0) return 0;
  return Math.floor(elapsedMs / msPerBeat(bpm));
}

/** Snaps a time to the nearest beat boundary so lights land on the grid. */
export function quantizeToBeat(timeMs: number, bpm = DEFAULT_BPM): number {
  if (!isFiniteNumber(timeMs) || timeMs <= 0) return 0;
  const beat = msPerBeat(bpm);
  return Math.round(timeMs / beat) * beat;
}

/** Progress through the current beat, from 0 on the beat to just under 1. */
export function beatPhase(elapsedMs: number, bpm = DEFAULT_BPM): number {
  if (!isFiniteNumber(elapsedMs) || elapsedMs <= 0) return 0;
  const beat = msPerBeat(bpm);
  return (elapsedMs % beat) / beat;
}

/** Floor brightness envelope: full on the beat, decaying linearly until the next. */
export function pulseStrength(elapsedMs: number, bpm = DEFAULT_BPM): number {
  return 1 - beatPhase(elapsedMs, bpm);
}

/** Flat tile index for a column and row, or -1 when the cell is off the grid. */
export function tileIndex(column: number, row: number): number {
  if (!Number.isInteger(column) || !Number.isInteger(row)) return -1;
  if (column < 0 || column >= FLOOR_COLUMNS) return -1;
  if (row < 0 || row >= FLOOR_ROWS) return -1;
  return row * FLOOR_COLUMNS + column;
}

/** Column and row for a tile index, or null when the index is off the grid. */
export function tileCoord(index: number): TileCoord | null {
  if (!Number.isInteger(index) || index < 0 || index >= FLOOR_TILE_COUNT) {
    return null;
  }
  return {
    column: index % FLOOR_COLUMNS,
    row: Math.floor(index / FLOOR_COLUMNS),
  };
}

/**
 * Colour for a tile on a given beat. Column plus row offsets the palette so
 * the lit colours sweep diagonally across the floor one step per beat.
 */
export function tileColor(index: number, beat: number): string {
  const coord = tileCoord(index);
  const safeBeat = Number.isInteger(beat) ? beat : 0;
  const offset = coord ? coord.column + coord.row : 0;
  const size = TILE_PALETTE.length;
  return TILE_PALETTE[(((offset + safeBeat) % size) + size) % size];
}

/** Tile under a stage position, or -1 when the position is off the floor. */
export function tileFromPosition(
  point: FloorPoint,
  bounds: FloorBounds,
): number {
  if (!isFiniteNumber(point?.x) || !isFiniteNumber(point?.y)) return -1;
  if (bounds.width <= 0 || bounds.height <= 0) return -1;
  const localX = point.x - bounds.x;
  const localY = point.y - bounds.y;
  if (localX < 0 || localY < 0) return -1;
  if (localX >= bounds.width || localY >= bounds.height) return -1;
  const column = Math.floor((localX / bounds.width) * FLOOR_COLUMNS);
  const row = Math.floor((localY / bounds.height) * FLOOR_ROWS);
  return tileIndex(column, row);
}

/**
 * The tile a moving avatar just stepped onto, or null when it stayed in the
 * same tile or is not over the floor. Walking is what lights the LEDs, so a
 * fresh arrival is the only event worth reporting.
 */
export function detectFootfall(
  previous: FloorPoint | null,
  current: FloorPoint,
  bounds: FloorBounds,
): number | null {
  const tile = tileFromPosition(current, bounds);
  if (tile < 0) return null;
  if (!previous) return tile;
  return tileFromPosition(previous, bounds) === tile ? null : tile;
}

/**
 * Records a footfall, replacing any earlier hit on the same tile and dropping
 * hits that have already faded, so the list stays bounded by the grid size.
 */
export function registerFootfall(
  footfalls: readonly TileFootfall[],
  tile: number,
  atMs: number,
): TileFootfall[] {
  if (!Number.isInteger(tile) || tile < 0 || tile >= FLOOR_TILE_COUNT) {
    return footfalls.filter((hit) => atMs - hit.atMs < TILE_GLOW_MS);
  }
  const kept = footfalls.filter(
    (hit) => hit.tile !== tile && atMs - hit.atMs < TILE_GLOW_MS,
  );
  return [...kept, { tile, atMs }];
}

/** Footfall brightness for a tile, from 1 on contact down to 0 when faded. */
export function tileGlow(
  footfalls: readonly TileFootfall[],
  tile: number,
  nowMs: number,
): number {
  const hit = footfalls.find((entry) => entry.tile === tile);
  if (!hit) return 0;
  const age = nowMs - hit.atMs;
  if (age < 0 || age >= TILE_GLOW_MS) return 0;
  return 1 - age / TILE_GLOW_MS;
}
