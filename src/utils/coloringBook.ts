/**
 * Coloring Book rules with no React or DOM dependency: the palette, per-page
 * fills, the "surprise me" palette, and the validated save shape.
 */
import { COLORING_PAGES, type ColoringPage } from "./coloringPages.ts";

export const PALETTE = [
  { id: "cherry", label: "Cherry red", hex: "#ef5350" },
  { id: "mango", label: "Mango orange", hex: "#ff9f43" },
  { id: "sunny", label: "Sunny yellow", hex: "#ffd93d" },
  { id: "lime", label: "Lime green", hex: "#a5d84f" },
  { id: "leaf", label: "Leaf green", hex: "#3fa66b" },
  { id: "lagoon", label: "Lagoon teal", hex: "#2ec4b6" },
  { id: "sky", label: "Sky blue", hex: "#6cc6f0" },
  { id: "ocean", label: "Ocean blue", hex: "#4f6fd8" },
  { id: "grape", label: "Grape purple", hex: "#9b6bd6" },
  { id: "bubblegum", label: "Bubblegum pink", hex: "#ff8fc8" },
  { id: "peach", label: "Peach", hex: "#ffc9a8" },
  { id: "cocoa", label: "Cocoa brown", hex: "#a86b3c" },
  { id: "sand", label: "Sandy tan", hex: "#ecc98f" },
  { id: "cloud", label: "Cloud white", hex: "#ffffff" },
  { id: "pebble", label: "Pebble gray", hex: "#9aa3a8" },
  { id: "night", label: "Night black", hex: "#3a3546" },
] as const;
export const SPECIAL_FILLS = [
  { id: "rainbow", label: "Rainbow" },
  { id: "sparkle", label: "Sparkle" },
] as const;

export type PaletteId = (typeof PALETTE)[number]["id"];
export type Fill = PaletteId | (typeof SPECIAL_FILLS)[number]["id"];
export type PageFills = Record<string, Fill>;
export type ColoringBookSave = {
  /** Region fills for every page the player has colored. */
  pages: Record<string, PageFills>;
  /** Pages the player marked as done, in the order they finished them. */
  finished: string[];
};

const FILLS: readonly Fill[] = [
  ...PALETTE.map((color) => color.id),
  ...SPECIAL_FILLS.map((fill) => fill.id),
];

export function isFill(value: unknown): value is Fill {
  return FILLS.some((fill) => fill === value);
}

export function findPage(pageId: string): ColoringPage | undefined {
  return COLORING_PAGES.find((page) => page.id === pageId);
}

/** Fills one region, or clears it when `fill` is null. */
export function applyFill(
  fills: PageFills,
  regionId: string,
  fill: Fill | null,
): PageFills {
  const { [regionId]: _previous, ...rest } = fills;
  return fill ? { ...rest, [regionId]: fill } : rest;
}

/**
 * Colors every region from a small random set of palette colors, with a rare
 * rainbow or sparkle, so a surprise page looks planned rather than noisy.
 */
export function surpriseFills(
  page: ColoringPage,
  random: () => number = Math.random,
): PageFills {
  // White, gray and black make muddy surprises; kids can still pick them.
  const pool = PALETTE.map((color) => color.id).filter(
    (id) => id !== "cloud" && id !== "pebble" && id !== "night",
  );
  const scheme: Fill[] = [];
  while (scheme.length < 5) {
    scheme.push(...pool.splice(Math.floor(random() * pool.length), 1));
  }
  const fills: PageFills = {};
  for (const region of page.regions) {
    const roll = random();
    fills[region.id] =
      roll < 0.04
        ? "rainbow"
        : roll < 0.08
          ? "sparkle"
          : scheme[Math.floor(random() * scheme.length)];
  }
  return fills;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Keeps only known regions with valid fills. */
export function cleanPageFills(page: ColoringPage, value: unknown): PageFills {
  const fills: PageFills = {};
  if (!isRecord(value)) return fills;
  for (const region of page.regions) {
    const fill = value[region.id];
    if (isFill(fill)) fills[region.id] = fill;
  }
  return fills;
}

/**
 * Validates a saved coloring book. Unknown pages, regions and colors are
 * dropped; a missing or unusable book restores as undefined so older saves
 * load unchanged.
 */
export function restoreColoringBook(
  value: unknown,
): ColoringBookSave | undefined {
  if (!isRecord(value)) return undefined;
  const pages: Record<string, PageFills> = {};
  const saved = isRecord(value.pages) ? value.pages : {};
  for (const page of COLORING_PAGES) {
    const fills = cleanPageFills(page, saved[page.id]);
    if (Object.keys(fills).length) pages[page.id] = fills;
  }
  const finished = Array.isArray(value.finished)
    ? [
        ...new Set(
          value.finished.filter(
            (id): id is string =>
              typeof id === "string" && Object.hasOwn(pages, id),
          ),
        ),
      ]
    : [];
  return Object.keys(pages).length ? { pages, finished } : undefined;
}

/** Stores one page's fills, marking it finished when asked. Unknown pages are ignored. */
export function saveColoringPage(
  book: ColoringBookSave | undefined,
  pageId: string,
  fills: PageFills,
  finish = false,
): ColoringBookSave | undefined {
  const page = findPage(pageId);
  if (!page) return book;
  const pages = { ...book?.pages, [pageId]: cleanPageFills(page, fills) };
  const finished = book?.finished ?? [];
  return restoreColoringBook({
    pages,
    finished:
      finish && !finished.includes(pageId) ? [...finished, pageId] : finished,
  });
}
