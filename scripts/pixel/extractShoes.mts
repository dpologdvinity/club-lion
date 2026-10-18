/**
 * One-off, local-only: reads the Fantage shoe sheets in inspo/fantage/shoes
 * (never committed) and writes our own shoe recipes — cut and colours only —
 * to src/components/avatar/pixelShoeKit.ts. The sprites are then drawn from
 * those recipes by scripts/pixel/shoeKit.mts.
 * Run: node --experimental-strip-types scripts/pixel/extractShoes.mts <inspo dir>
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const SHEETS = [
  "fantage_girl_shoes_by_promise0x0.jpg",
  "fantage_clothes_kit_shoes_by_livinglikefab.jpg",
];
const NAMES: [string, [number, number, number]][] = [
  ["Black", [40, 40, 46]],
  ["Grey", [140, 140, 150]],
  ["White", [240, 240, 244]],
  ["Red", [220, 40, 50]],
  ["Cherry", [170, 20, 40]],
  ["Pink", [255, 120, 180]],
  ["Rose", [240, 60, 130]],
  ["Blush", [255, 190, 210]],
  ["Orange", [250, 140, 40]],
  ["Gold", [230, 180, 60]],
  ["Lemon", [250, 230, 80]],
  ["Lime", [160, 220, 60]],
  ["Green", [50, 160, 70]],
  ["Mint", [150, 230, 200]],
  ["Teal", [40, 170, 170]],
  ["Sky", [120, 200, 250]],
  ["Blue", [50, 100, 220]],
  ["Navy", [30, 40, 110]],
  ["Lilac", [200, 170, 250]],
  ["Purple", [130, 60, 190]],
  ["Brown", [130, 80, 40]],
  ["Tan", [210, 170, 120]],
  ["Cream", [250, 235, 200]],
];
const hex = (c: number[]) =>
  "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const dist = (a: number[], b: number[]) =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const nameOf = (c: number[]) =>
  NAMES.reduce((best, n) => (dist(n[1], c) < dist(best[1], c) ? n : best))[0];

type Recipe = { cut: string; color: string; sole: string; accent: string };
const out: (Recipe & { label: string })[] = [];

for (const sheet of SHEETS) {
  const { data, info } = await sharp(join(dir, sheet))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const ink = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++)
    ink[i] =
      Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) < 190 ? 1 : 0;
  // Merge the two shoes of a pair: label components on a mask grown 3px sideways, 1px up and down.
  const grow = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (ink[y * w + x])
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -3; dx <= 3; dx++) {
            const X = x + dx,
              Y = y + dy;
            if (X >= 0 && Y >= 0 && X < w && Y < h) grow[Y * w + X] = 1;
          }
  const label = new Int32Array(w * h).fill(-1);
  const boxes: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    px: number[];
  }[] = [];
  for (let s = 0; s < w * h; s++) {
    if (!grow[s] || label[s] >= 0) continue;
    const box = { x0: w, y0: h, x1: 0, y1: 0, px: [] as number[] };
    const stack = [s];
    label[s] = boxes.length;
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % w,
        y = (i / w) | 0;
      if (ink[i]) {
        box.px.push(i);
        box.x0 = Math.min(box.x0, x);
        box.x1 = Math.max(box.x1, x);
        box.y0 = Math.min(box.y0, y);
        box.y1 = Math.max(box.y1, y);
      }
      for (const n of [i - 1, i + 1, i - w, i + w])
        if (
          n >= 0 &&
          n < w * h &&
          grow[n] &&
          label[n] < 0 &&
          Math.abs((n % w) - x) <= 1
        ) {
          label[n] = boxes.length;
          stack.push(n);
        }
    }
    boxes.push(box);
  }
  const items = boxes
    .filter((b) => b.px.length > 25 && b.x1 - b.x0 > 6)
    .map((b) => ({ ...b, cy: (b.y0 + b.y1) / 2 }));
  // Reading order: rows by centre height, then left to right.
  items.sort((a, b) => a.cy - b.cy);
  const rows: (typeof items)[] = [];
  for (const it of items) {
    const row = rows.at(-1);
    if (row && Math.abs(row[0].cy - it.cy) < 12) row.push(it);
    else rows.push([it]);
  }
  if (process.env.DEBUG_BOXES) {
    const rects = items
      .map(
        (b) =>
          `<rect x="${b.x0}" y="${b.y0}" width="${b.x1 - b.x0 + 1}" height="${b.y1 - b.y0 + 1}" fill="none" stroke="red" stroke-width="1"/>`,
      )
      .join("");
    const marked = await sharp(join(dir, sheet))
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${rects}</svg>`,
          ),
        },
      ])
      .png()
      .toBuffer();
    await sharp(marked)
      .resize({ width: w * 3, kernel: "nearest" })
      .toFile(`/tmp/hk/boxes-${SHEETS.indexOf(sheet)}.png`);
  }
  for (const row of rows)
    for (const b of row.sort((a, c) => a.x0 - c.x0)) {
      const counts = new Map<string, { n: number; c: number[] }>();
      for (const i of b.px) {
        const c = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
        const lum = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
        if (lum < 45) continue; // outline ink
        const q = c.map((v) => Math.round(v / 32) * 32);
        const key = q.join();
        const e = counts.get(key) ?? { n: 0, c: [0, 0, 0] };
        e.n++;
        e.c = e.c.map((v, k) => v + c[k]);
        counts.set(key, e);
      }
      // Vivid bins win over the JPEG's muddy edge shades.
      const score = (e: { n: number; c: number[] }) =>
        e.n * (1 + (2 * (Math.max(...e.c) - Math.min(...e.c))) / 255);
      const ranked = [...counts.values()]
        .map((e) => ({ n: e.n, c: e.c.map((v) => v / e.n) }))
        .sort((a, c) => score(c) - score(a));
      const main = ranked[0]?.c ?? [40, 40, 46];
      const second = ranked.find((r) => dist(r.c, main) > 4000)?.c ?? main;
      // Bottom row brightness: light soles mean sneakers.
      let light = 0,
        total = 0;
      for (const i of b.px)
        if (((i / w) | 0) >= b.y1 - 1) {
          total++;
          if (Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) > 200)
            light++;
        }
      const bw = b.x1 - b.x0 + 1,
        bh = b.y1 - b.y0 + 1;
      const cut =
        bh / bw > 0.95
          ? "highboots"
          : bh / bw > 0.7
            ? "boots"
            : light / Math.max(1, total) > 0.4
              ? "sneakers"
              : b.px.length / (bw * bh) < 0.42
                ? "sandals"
                : out.length % 3 === 0
                  ? "heels"
                  : "flats";
      const cutName: Record<string, string> = {
        highboots: "Tall Boots",
        boots: "Boots",
        sneakers: "Sneakers",
        sandals: "Sandals",
        heels: "Heels",
        flats: "Flats",
      };
      const sole = cut === "sneakers" ? [244, 244, 248] : second;
      out.push({
        label: `${nameOf(main)} ${cutName[cut]}`,
        cut,
        color: hex(main),
        sole: hex(sole),
        accent: hex(second),
      });
    }
}
// Same name twice: number the repeats so every picture has its own label.
const seen = new Map<string, number>();
for (const r of out) {
  const n = (seen.get(r.label) ?? 0) + 1;
  seen.set(r.label, n);
  if (n > 1) r.label = `${r.label} ${n}`;
}
const body = out
  .map(
    (r, i) =>
      `  { id: "shoe_${String(i + 1).padStart(3, "0")}", label: ${JSON.stringify(r.label)}, cut: "${r.cut}", color: "${r.color}", sole: "${r.sole}", accent: "${r.accent}" },`,
  )
  .join("\n");
writeFileSync(
  join(import.meta.dirname, "../../src/components/avatar/pixelShoeKit.ts"),
  `/**
 * Pixel shoe kit: our own shoes drawn by scripts/pixel/shoeKit.mts. Cuts and
 * colours follow the Fantage shoe sheets (inspo/fantage/shoes, local only),
 * sampled by scripts/pixel/extractShoes.mts.
 */
export type ShoeKitCut =
  "flats" | "heels" | "sneakers" | "sandals" | "boots" | "highboots";

export type ShoeKitEntry = {
  id: string;
  label: string;
  cut: ShoeKitCut;
  color: string;
  sole: string;
  accent: string;
};

export const SHOE_KIT: ShoeKitEntry[] = [
${body}
];
`,
);
console.log(`${out.length} shoes`);
