/**
 * Pixel-art doll sprites in the Fantage paper-doll style, drawn as simple
 * vector shapes on a 64×96 grid and rasterised to crisp, transparent PNGs:
 * hard alpha edges, colours snapped to the shapes' own palette and a 1px
 * outer outline. Recolourable layers (skin, eyes, hair) are drawn in six grey
 * levels; the game maps those levels to any colour with an SVG filter.
 *
 * Run: node --experimental-strip-types scripts/pixel/sprites.mts
 * Output: public/assets/pixel/doll/*.png
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export const W = 64;
export const H = 96;
const OUT = join(import.meta.dirname, "../../public/assets/pixel/doll");

/** The six grey levels a recolourable sprite may use (centres of 6 bins). */
export const G = {
  ink: "#151515",
  deep: "#404040",
  shade: "#6a6a6a",
  base: "#959595",
  light: "#bfbfbf",
  white: "#eaeaea",
} as const;
const GREYS = Object.values(G);

type Sprite = {
  name: string;
  svg: string;
  grey?: boolean;
  outline?: false;
  /** Fantage-style volume: lit left edge, shadowed right side of each run. */
  shading?: true;
};

function tint(px: Uint8ClampedArray, i: number, amount: number): void {
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  for (let c = 0; c < 3; c++)
    px[i + c] = Math.round(px[i + c] + (target - px[i + c]) * t);
}

/** Per row, light the left of each opaque run and shade its right third. */
function shadeRuns(px: Uint8ClampedArray): void {
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      if (px[(y * W + x) * 4 + 3] !== 255) {
        x++;
        continue;
      }
      const start = x;
      while (x < W && px[(y * W + x) * 4 + 3] === 255) x++;
      const len = x - start;
      for (let k = 0; k < len; k++) {
        const i = (y * W + start + k) * 4;
        if (len >= 4 && k === 1) tint(px, i, 0.28);
        else if (k >= len - Math.max(1, Math.round(len * 0.3)))
          tint(px, i, k === len - 1 ? -0.28 : -0.16);
      }
    }
  }
  // Hems and folds: the pixel above a transparent gap gets a soft shadow.
  for (let y = 0; y < H - 1; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (px[i + 3] === 255 && px[i + W * 4 + 3] !== 255) tint(px, i, -0.14);
    }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const ch = (v: number) =>
    Math.round(v + (target - v) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

/** Every #rrggbb the markup uses: the palette pixels snap to. */
function paletteOf(svg: string): [number, number, number][] {
  const found = new Set(svg.match(/#[0-9a-f]{6}\b/gi) ?? []);
  return [...found].map((hex) => hexToRgb(hex.toLowerCase()));
}

async function render(sprite: Sprite): Promise<void> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${sprite.svg}</svg>`;
  const { data } = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const palette = sprite.grey ? GREYS.map(hexToRgb) : paletteOf(sprite.svg);
  const px = new Uint8ClampedArray(W * H * 4);
  // Hard edges and palette snap: no anti-aliased in-between colours.
  for (let i = 0; i < W * H; i++) {
    const a = data[i * 4 + 3];
    if (a < 128) continue;
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    let best = palette[0];
    let bestD = Infinity;
    for (const p of palette) {
      const d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    px.set([best[0], best[1], best[2], 255], i * 4);
  }
  if (sprite.shading) shadeRuns(px);
  // 1px outer outline in a darkened neighbour colour (or the ink grey).
  const out = new Uint8ClampedArray(px);
  const at = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < W && y < H && px[(y * W + x) * 4 + 3] === 255
      ? (y * W + x) * 4
      : -1;
  for (let y = 0; sprite.outline !== false && y < H; y++)
    for (let x = 0; x < W; x++) {
      if (px[(y * W + x) * 4 + 3] === 255) continue;
      const n = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].find(
        (i) => i >= 0,
      );
      if (n === undefined) continue;
      const ink = sprite.grey
        ? hexToRgb(G.ink)
        : hexToRgb(
            shade(
              `#${[px[n], px[n + 1], px[n + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
              -0.6,
            ),
          );
      out.set([ink[0], ink[1], ink[2], 255], (y * W + x) * 4);
    }
  await sharp(Buffer.from(out), { raw: { width: W, height: H, channels: 4 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(OUT, `${sprite.name}.png`));
}

export async function renderAll(sprites: Sprite[]): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  for (const sprite of sprites) await render(sprite);
}
