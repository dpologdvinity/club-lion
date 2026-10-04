export const GRID_SIZE = 16;
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export type Orientation = "N" | "E" | "S" | "W";

export type FurnitureItem = {
  id: string;
  name: string;
  width: number;
  depth: number;
  isRug?: boolean;
  category: string;
  comfortBonus: number;
};

export const FURNITURE_CATALOG: FurnitureItem[] = [
  {
    id: "velvet-sofa",
    name: "Velvet Sofa",
    width: 3,
    depth: 2,
    category: "seating",
    comfortBonus: 15,
  },
  {
    id: "grand-jukebox",
    name: "Grand Jukebox",
    width: 2,
    depth: 1,
    category: "entertainment",
    comfortBonus: 20,
  },
  {
    id: "neon-lion-crest",
    name: "Neon Lion Crest",
    width: 1,
    depth: 1,
    category: "decor",
    comfortBonus: 25,
  },
  {
    id: "baobab-bonsai",
    name: "Baobab Bonsai",
    width: 1,
    depth: 1,
    category: "decor",
    comfortBonus: 10,
  },
  {
    id: "pet-lion-cushion",
    name: "Pet Lion Cushion",
    width: 2,
    depth: 2,
    category: "pet",
    comfortBonus: 30,
  },
  {
    id: "savanna-coffee-table",
    name: "Savanna Coffee Table",
    width: 2,
    depth: 2,
    category: "tables",
    comfortBonus: 10,
  },
  {
    id: "woven-rug",
    name: "Woven Rug",
    width: 3,
    depth: 3,
    isRug: true,
    category: "rugs",
    comfortBonus: 15,
  },
];

export type PlacedFurniture = {
  id: string;
  itemId: string;
  col: number;
  row: number;
  orientation: Orientation;
};

export function gridToScreen(
  col: number,
  row: number,
  originX: number,
  originY: number,
): { x: number; y: number } {
  const halfWidth = TILE_WIDTH / 2;
  const halfHeight = TILE_HEIGHT / 2;
  return {
    x: originX + (col - row) * halfWidth,
    y: originY + (col + row) * halfHeight,
  };
}

export function screenToGrid(
  x: number,
  y: number,
  originX: number,
  originY: number,
): { col: number; row: number } {
  const halfWidth = TILE_WIDTH / 2;
  const halfHeight = TILE_HEIGHT / 2;
  const dx = x - originX;
  const dy = y - originY;
  const col = (dx / halfWidth + dy / halfHeight) / 2;
  const row = (dy / halfHeight - dx / halfWidth) / 2;
  return { col: Math.round(col), row: Math.round(row) };
}

function getFurnitureItem(itemId: string): FurnitureItem | undefined {
  return FURNITURE_CATALOG.find((item) => item.id === itemId);
}

export function getEffectiveFootprint(item: PlacedFurniture): {
  width: number;
  depth: number;
} {
  const catalogItem = getFurnitureItem(item.itemId);
  const width = catalogItem?.width ?? 1;
  const depth = catalogItem?.depth ?? 1;
  return item.orientation === "E" || item.orientation === "W"
    ? { width: depth, depth: width }
    : { width, depth };
}

function isRug(item: PlacedFurniture): boolean {
  return !!getFurnitureItem(item.itemId)?.isRug;
}

function overlaps(a: PlacedFurniture, b: PlacedFurniture): boolean {
  const aFootprint = getEffectiveFootprint(a);
  const bFootprint = getEffectiveFootprint(b);
  const aLeft = a.col;
  const aRight = a.col + aFootprint.width;
  const aTop = a.row;
  const aBottom = a.row + aFootprint.depth;
  const bLeft = b.col;
  const bRight = b.col + bFootprint.width;
  const bTop = b.row;
  const bBottom = b.row + bFootprint.depth;
  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

export function isValidPlacement(
  candidate: PlacedFurniture,
  existing: PlacedFurniture[],
  gridSize: number = GRID_SIZE,
): boolean {
  const { width, depth } = getEffectiveFootprint(candidate);
  if (
    candidate.col < 0 ||
    candidate.row < 0 ||
    candidate.col + width > gridSize ||
    candidate.row + depth > gridSize
  ) {
    return false;
  }
  if (isRug(candidate)) return true;
  return !existing.some((other) => !isRug(other) && overlaps(candidate, other));
}

const RUG_LAYER = 0;
const SOLID_LAYER = 1_000_000;

export function calculateDepthOrder(item: PlacedFurniture): number {
  const { width, depth } = getEffectiveFootprint(item);
  const corner = item.col + width - 1 + item.row + depth - 1;
  const layer = isRug(item) ? RUG_LAYER : SOLID_LAYER;
  return layer + corner * 100 + (isRug(item) ? 0 : 50);
}

export function serializeLayout(items: PlacedFurniture[]): string {
  return JSON.stringify(items);
}

function isValidOrientation(value: unknown): value is Orientation {
  return value === "N" || value === "E" || value === "S" || value === "W";
}

function isValidPlacedFurniture(value: unknown): value is PlacedFurniture {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.itemId === "string" &&
    !!getFurnitureItem(candidate.itemId) &&
    Number.isSafeInteger(candidate.col) &&
    Number.isSafeInteger(candidate.row) &&
    isValidOrientation(candidate.orientation)
  );
}

export function deserializeLayout(raw?: string | null): PlacedFurniture[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (!parsed.every(isValidPlacedFurniture)) return [];
    const candidates = parsed as PlacedFurniture[];
    const seenIds = new Set<string>();
    const accepted: PlacedFurniture[] = [];
    for (const candidate of candidates) {
      if (seenIds.has(candidate.id)) return [];
      if (!isValidPlacement(candidate, accepted)) return [];
      seenIds.add(candidate.id);
      accepted.push(candidate);
    }
    return accepted;
  } catch {
    return [];
  }
}
