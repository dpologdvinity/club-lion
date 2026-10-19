/**
 * Pixel hair kit: full-colour hairstyles redrawn after the Fantage hair
 * sheets (inspo/fantage/hair, local only): 01–28 hair kit no. 1 (4 rows × 7),
 * 29–71 girl hair sheet 2, 72–77 the two limited hair packages.
 * Each hair is a back layer (behind head and body) and a front layer (cap,
 * bangs and accessories over the face) on the doll's 64×96 grid. Unlike the
 * grey-coded base hair these keep their own colours.
 *
 * Run: node --experimental-strip-types scripts/pixel/hairKit.mts
 * Output: public/assets/pixel/doll/hair-kit-NN-{back,front}.png
 */
import { renderAll, shade } from "./sprites.mts";
import { HAIR_KIT } from "../../src/components/avatar/pixelHairKit.ts";
import {
  NM_HAIRS,
  type HairEdge,
  type HairLength,
} from "../../src/components/avatar/pixelHairKitNM.ts";

type Pal = { o: string; d: string; m: string; b: string; l: string; s: string };
type Hair = { back: string; front: string };

const pal = (b: string): Pal => ({
  o: shade(b, -0.45),
  d: shade(b, -0.28),
  m: shade(b, -0.13),
  b,
  l: shade(b, 0.32),
  s: shade(b, 0.65),
});

const r = (n: number) => Math.round(n * 10) / 10;
const fill = (d: string, c: string) => `<path d="${d}" fill="${c}"/>`;
const line = (d: string, c: string, w = 1) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
/** Mirror left to right around the grid's centre line. */
const flip = (svg: string) => `<g transform="matrix(-1 0 0 1 64 0)">${svg}</g>`;

/** Wavy edge to (x1,y1) from (x0,y0): n bumps of ±amp px sideways. */
function wave(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  n: number,
  amp: number,
): string {
  let s = "";
  for (let i = 1; i <= n; i++) {
    const tm = (i - 0.5) / n;
    const t = i / n;
    const cx = x0 + (x1 - x0) * tm + (i % 2 ? amp : -amp);
    s += `Q${r(cx)} ${r(y0 + (y1 - y0) * tm)} ${r(x0 + (x1 - x0) * t)} ${r(y0 + (y1 - y0) * t)}`;
  }
  return s;
}

/** Hair ends to (x1,y1) from (x0,y0): n pointed or rounded tips. */
function tips(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  n: number,
  depth: number,
  pointy: boolean,
): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const tm = (i + 0.5) / n;
    const t = (i + 1) / n;
    const mx = x0 + (x1 - x0) * tm;
    const my = y0 + (y1 - y0) * tm;
    const ex = r(x0 + (x1 - x0) * t);
    const ey = r(y0 + (y1 - y0) * t);
    s += pointy
      ? `L${r(mx)} ${r(my - depth)}L${ex} ${ey}`
      : `Q${r(mx)} ${r(my + depth)} ${ex} ${ey}`;
  }
  return s;
}

type MassOpts = {
  y: number;
  ly?: number;
  spread?: number;
  n?: number;
  amp?: number;
  tipsN?: number;
  depth?: number;
  pointy?: boolean;
};

/** Long hair falling behind the shoulders, with strands and a dark nape. */
function mass(p: Pal, o: MassOpts): string {
  const s = o.spread ?? 3;
  const n = o.n ?? 3;
  const a = o.amp ?? 2;
  const ly = o.ly ?? o.y;
  const R = 52 + s;
  const L = 12 - s;
  const d =
    `M12 30Q10 3 32 3Q54 3 52 30` +
    wave(52, 30, R, o.y, n, a) +
    tips(R, o.y, L, ly, o.tipsN ?? 5, o.depth ?? 4, o.pointy ?? false) +
    wave(L, ly, 12, 30, n, -a) +
    "Z";
  return (
    hair(d, p, -4) +
    fill(`M17 36Q32 52 47 36L47 ${Math.min(o.y, ly) - 4}H17Z`, p.d) +
    line(`M50 34${wave(50, 34, R - 3, o.y - 3, n, a)}`, p.m) +
    line(`M14 34${wave(14, 34, L + 3, ly - 3, n, -a)}`, p.m) +
    line(`M53 36${wave(53, 36, R - 1, o.y - 8, n, a)}`, p.l) +
    line(`M11 36${wave(11, 36, L + 1, ly - 8, n, -a)}`, p.l)
  );
}

let uid = 0;
/** A hair shape in the base tone, shaded darker toward its lower edges. */
function hair(d: string, p: Pal, dy = -2.5): string {
  const id = `h${uid++}`;
  return (
    `<clipPath id="${id}"><path d="${d}"/></clipPath>` +
    fill(d, p.m) +
    `<g clip-path="url(#${id})"><path d="${d}" fill="${p.b}" transform="translate(0 ${dy})"/></g>`
  );
}

/** Crown dome down to both temples, closed by the bangs edge. */
const cap = (p: Pal, edge: string) =>
  hair(`M10 36Q8 3 32 3Q56 3 54 36${edge}Z`, p);

/** Glossy band and shine over the crown. */
const gloss = (p: Pal) =>
  line("M13 18Q20 9 32 8Q44 9 51 17", p.l, 2.6) +
  line("M16 14Q22 10 29 9.4", p.s, 1) +
  line("M37 9.6Q42 10 46 12.4", p.s, 1);

/* Bangs edges, from the right temple (54,36) back to the left one. */
const EDGE = {
  /** Side part on the right, bangs swept to the left. */
  sweep: "L53 44Q51 32 47 17Q42 22 34 22Q24 22 18 30L17 42Q14 46 11 42",
  /** Centre part, curtains to both sides. */
  centre: "L52 46Q48 40 49 24Q44 13 32 10Q20 13 15 24Q16 40 12 46L10 40",
  /** Straight-across fringe with small points. */
  blunt: `L52 44Q50 30 49 22${tips(49, 22, 15, 22, 7, 2, true)}Q14 30 12 44`,
  /** Peak in the middle of the forehead. */
  peak: "L52 38Q50 26 46 20Q38 18 32 24Q26 18 18 20Q14 26 12 40",
};

const sweepStrands = (p: Pal) =>
  line(
    "M46 8Q44 14 46 18M40 7Q38 16 30 20M33 6Q28 14 20 24M26 7Q20 14 15 30",
    p.d,
  );
const centreStrands = (p: Pal) =>
  line("M32 4V9M36 6Q44 12 48 26M28 6Q20 12 16 26", p.d);

/* ------------------------------------------------------- accessories */

function bow(x: number, y: number, s: number, c: string): string {
  const k = shade(c, -0.3);
  return (
    fill(
      `M${x} ${y}L${x - 2 * s} ${y - 1.4 * s}L${x - 2 * s} ${y + 1.4 * s}ZM${x} ${y}L${x + 2 * s} ${y - 1.4 * s}L${x + 2 * s} ${y + 1.4 * s}Z`,
      c,
    ) +
    fill(
      `M${x} ${y}L${x - 1.4 * s} ${y + 0.4 * s}L${x - 1.4 * s} ${y + 1.2 * s}ZM${x} ${y}L${x + 1.4 * s} ${y + 0.4 * s}L${x + 1.4 * s} ${y + 1.2 * s}Z`,
      k,
    ) +
    `<rect x="${x - 0.5 * s}" y="${y - 0.6 * s}" width="${s}" height="${1.2 * s}" fill="${shade(c, 0.25)}"/>`
  );
}

function flower(
  x: number,
  y: number,
  rad: number,
  c: string,
  mid = "#ffe14a",
): string {
  let s = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    s += `<circle cx="${r(x + Math.cos(a) * rad)}" cy="${r(y + Math.sin(a) * rad)}" r="${r(rad * 0.75)}" fill="${c}"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${r(rad * 0.45)}" fill="${mid}"/>`;
}

const heart = (x: number, y: number, c: string) =>
  fill(
    `M${x} ${y + 2.6}L${x - 2.6} ${y}Q${x - 2.6} ${y - 2} ${x - 1.2} ${y - 2}Q${x} ${y - 2} ${x} ${y - 0.8}Q${x} ${y - 2} ${x + 1.2} ${y - 2}Q${x + 2.6} ${y - 2} ${x + 2.6} ${y}Z`,
    c,
  );

/** Beads along a quadratic curve, alternating two tones. */
function beads(
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  n: number,
  rx: number,
  a: string,
  b: string,
): string {
  let s = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    s += `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${rx}" ry="${r(rx * 0.75)}" fill="${i % 2 ? a : b}"/>`;
  }
  return s;
}

/* ------------------------------------------------ spec-built hairs */

type Length = "pixie" | "bob" | "shoulder" | "long" | "waist" | MassOpts;
type Spec = {
  length: Length;
  edge: string;
  strands?: "sweep" | "centre" | "none";
  /** Extra back-layer pieces (pigtails, ponies, buns). */
  back?: (p: Pal) => string;
  /** Extra front-layer pieces (hats, bows, flowers). */
  front?: (p: Pal) => string;
  /** Mirror the front so a sweep goes the other way. */
  mirror?: true;
};

const LENGTHS: Record<string, MassOpts> = {
  shoulder: { y: 52, spread: 2, n: 2, amp: 1.6, tipsN: 5, depth: 3 },
  long: { y: 64, spread: 4, n: 4, amp: 2, tipsN: 6, depth: 3 },
  waist: { y: 74, spread: 5, n: 5, amp: 2.4, tipsN: 6, depth: 4 },
};

function backOf(p: Pal, length: Length): string {
  if (length === "pixie")
    return hair("M12 30Q10 3 32 3Q54 3 52 30L50 38H14Z", p);
  if (length === "bob")
    return (
      hair("M12 30Q10 3 32 3Q54 3 52 30Q56 44 49 48H15Q8 44 12 30Z", p) +
      line("M50 34Q53 40 49 46M14 34Q11 40 15 46", p.m)
    );
  return mass(p, typeof length === "string" ? LENGTHS[length] : length);
}

const make =
  (s: Spec) =>
  (p: Pal): Hair => {
    const strands =
      s.strands === "none"
        ? ""
        : s.strands === "centre"
          ? centreStrands(p)
          : sweepStrands(p);
    const face = cap(p, s.edge) + gloss(p) + strands;
    return {
      back: backOf(p, s.length) + (s.back?.(p) ?? ""),
      front: (s.mirror ? flip(face) : face) + (s.front?.(p) ?? ""),
    };
  };

/** Two side tails from the temples down to `y`, curled when `curl`. */
const pigtails =
  (y: number, curl = false, wide = 6) =>
  (p: Pal) =>
    [-1, 1]
      .map((d) => {
        const x = 32 + d * 22;
        const o = x + d * wide;
        return (
          hair(
            `M${x} 14Q${o + d * 4} 18 ${o} ${(14 + y) / 2}${curl ? wave(o, (14 + y) / 2, o - d * 2, y, 3, 2.4 * d) : `Q${o + d} ${y - 6} ${o - d * 2} ${y}`}L${x - d * 2} ${y - 8}Q${x} ${(14 + y) / 2} ${x - d * 4} 24Z`,
            p,
          ) +
          line(
            `M${x + d * 2} 20Q${o + d} ${(20 + y) / 2} ${o - d * 2} ${y - 4}`,
            p.m,
          )
        );
      })
      .join("");

/** Round buns on top, at `y`, of radius `rad`, spread `dx` from the centre. */
const buns =
  (y: number, rad = 7, dx = 18) =>
  (p: Pal) =>
    [-1, 1]
      .map(
        (d) =>
          hair(
            `M${32 + d * dx - rad} ${y}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0Z`,
            p,
          ) +
          line(
            `M${32 + d * dx - rad / 2} ${y - rad / 2}q${rad / 2} -1 ${rad} 0`,
            p.l,
          ),
      )
      .join("");

const topBun =
  (y = 2, rad = 7.4) =>
  (p: Pal) =>
    hair(
      `M${32 - rad} ${y}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0Z`,
      p,
    ) + line(`M${32 - rad / 2} ${y - 2}q${rad / 2} -2 ${rad} 0`, p.l);

/** A tail from the crown on side `d` (1 right, -1 left) down to `y`. */
const pony =
  (d: 1 | -1, y: number, wavy = true) =>
  (p: Pal) =>
    hair(
      `M${32 + d * 14} 6Q${32 + d * 30} 6 ${32 + d * 28} 24${wavy ? wave(32 + d * 28, 24, 32 + d * 22, y, 4, 2.6 * d) : `Q${32 + d * 30} ${y - 10} ${32 + d * 22} ${y}`}Q${32 + d * 18} ${(24 + y) / 2} ${32 + d * 20} 22Q${32 + d * 18} 14 ${32 + d * 10} 10Z`,
      p,
    ) +
    line(`M${32 + d * 26} 16Q${32 + d * 28} 30 ${32 + d * 24} ${y - 6}`, p.m);

const headband = (c: string, y = 14) =>
  line(
    `M11 ${y + 14}Q12 ${y - 8} 32 ${y - 9}Q52 ${y - 8} 53 ${y + 14}`,
    c,
    2.4,
  ) + line(`M14 ${y + 6}Q18 ${y - 5} 28 ${y - 7.6}`, shade(c, 0.4), 0.8);

/** A hat: brim at `y`, crown `h` tall, in colour `c` with a `band`. */
function hat(c: string, band: string, y = 12, h = 10, brim = 24): string {
  return (
    `<ellipse cx="32" cy="${y}" rx="${brim}" ry="4" fill="${c}"/>` +
    fill(`M18 ${y}Q18 ${y - h} 32 ${y - h}Q46 ${y - h} 46 ${y}Z`, c) +
    `<rect x="18" y="${y - 3.6}" width="28" height="3" fill="${band}"/>` +
    line(
      `M${32 - brim + 4} ${y + 1}Q32 ${y + 4} ${32 + brim - 4} ${y + 1}`,
      shade(c, -0.25),
    )
  );
}

const ribbonTail = (x: number, y: number, c: string) =>
  fill(
    `M${x} ${y}L${x - 3} ${y + 12}L${x - 1} ${y + 11}L${x + 1} ${y + 13}L${x + 2} ${y}Z`,
    c,
  );

/** Streaks of colour clipped into the back hair. */
const streaks =
  (colors: string[], end = 66) =>
  (_p: Pal) =>
    colors
      .map((c, i) =>
        line(
          `M${14 + i * 9} 30Q${10 + i * 10} ${(30 + end) / 2} ${12 + i * 10} ${end}`,
          c,
          2.2,
        ),
      )
      .join("");

/* ------------------------------------------------------------- hairs */

const HAIRS: ((p: Pal) => Hair)[] = [
  // 01 berry layered side sweep, gold clip
  (p) => ({
    back: mass(p, {
      y: 64,
      spread: 3,
      n: 3,
      amp: 1.5,
      tipsN: 5,
      depth: 7,
      pointy: true,
    }),
    front:
      cap(
        p,
        "L53 44Q51 32 47 17Q42 22 34 22Q24 22 18 30L18 40L16 46L14 40L12 47L10 40",
      ) +
      gloss(p) +
      sweepStrands(p) +
      line("M40 8L47 11", "#f8d048", 1.6),
  }),
  // 02 yellow high pony on the right, red ribbon, tail swept down-left
  (p) => ({
    back:
      hair("M12 30Q10 3 32 3Q54 3 52 30L50 40H14Z", p) +
      hair(
        "M44 8Q58 8 60 22Q62 38 50 46Q36 54 20 56Q10 58 3 62Q8 56 16 52Q32 46 44 40Q52 32 50 20Q48 14 42 12Z",
        p,
      ) +
      line("M54 14Q58 26 52 38Q42 48 24 52", p.m) +
      line("M57 22Q57 32 50 40", p.l),
    front:
      cap(
        p,
        "L53 34Q51 24 48 16Q40 21 30 22Q18 24 3 30Q10 23 13 19Q11 28 11 36",
      ) +
      gloss(p) +
      line("M44 7Q36 16 24 22M36 6Q28 14 12 24", p.d) +
      fill("M48 12L54 30L51 31L46 14ZM50 12L58 26L55 28L48 14Z", "#d81c30") +
      bow(49, 10, 2.6, "#e8283a"),
  }),
  // 03 honey long waves, centre part, little bun clip on top
  (p) => ({
    back: mass(p, { y: 66, spread: 4, n: 5, amp: 2.2, tipsN: 6, depth: 3 }),
    front:
      cap(
        p,
        `${wave(54, 36, 54, 50, 3, 2)}L50 49${wave(50, 49, 49, 24, 3, 1.6)}Q44 13 32 10Q20 13 15 24${wave(15, 24, 14, 49, 3, 1.6)}L10 50${wave(10, 50, 10, 36, 3, 2)}`,
      ) +
      gloss(p) +
      centreStrands(p) +
      line(
        `M52 30${wave(52, 30, 52, 47, 3, 1.6)}M12 30${wave(12, 30, 12, 47, 3, -1.6)}`,
        p.d,
      ) +
      `<ellipse cx="35" cy="4" rx="4" ry="2.6" fill="#8a4a1c"/><rect x="33" y="3" width="3" height="1" fill="#c07a3c"/>`,
  }),
  // 04 caramel long waves, side sweep, polka bow on the right
  (p) => ({
    back: mass(p, { y: 68, spread: 6, n: 5, amp: 2.6, tipsN: 6, depth: 3 }),
    front:
      cap(p, EDGE.sweep) +
      gloss(p) +
      sweepStrands(p) +
      bow(50, 24, 3, "#e8325a") +
      `<g fill="#ffffff"><rect x="45" y="22" width="1" height="1"/><rect x="54" y="25" width="1" height="1"/><rect x="46" y="26" width="1" height="1"/><rect x="54" y="21.6" width="1" height="1"/></g>`,
  }),
  // 05 cocoa peaked fringe, big flower right, low curl on the left
  (p) => ({
    back:
      hair("M12 30Q10 3 32 3Q54 3 52 30Q53 38 48 40H16Q11 38 12 30Z", p) +
      hair(
        "M15 30Q6 36 8 46Q4 52 8 58Q10 62 6 68Q15 66 14 58Q18 52 14 46Q19 40 19 32Z",
        p,
      ) +
      line("M12 36Q8 42 11 48Q8 54 11 60", p.d) +
      flower(13, 42, 2.2, "#f0506a"),
    front:
      cap(p, EDGE.peak) +
      gloss(p) +
      line("M32 4V22M24 6Q20 12 18 20M40 6Q44 12 46 20", p.d) +
      flower(50, 22, 3.4, "#f0405e"),
  }),
  // 06 mocha low side pony, swept right
  (p) => ({
    back:
      hair("M12 30Q10 3 32 3Q54 3 52 30Q53 38 48 40H16Q11 38 12 30Z", p) +
      hair(
        "M46 32Q55 34 54 42Q58 50 54 58Q58 66 54 72Q56 78 51 82Q50 74 50 68Q46 60 50 52Q46 44 45 38Z",
        p,
      ) +
      line("M51 42Q54 50 51 56Q55 64 52 72", p.d) +
      line("M53 46Q55 52 53 56", p.l) +
      `<rect x="47" y="36" width="5" height="3" fill="#d8d8e4"/><rect x="48" y="36" width="2" height="1" fill="#ffffff"/>`,
    front: flip(
      cap(p, "L52 36Q50 26 46 18Q38 18 30 20Q20 22 16 30Q14 34 12 38") +
        gloss(p) +
        line("M44 6Q36 12 24 22M36 5Q28 12 18 26", p.d),
    ),
  }),
  // 07 platinum ringlets under a green clover top hat
  (p) => ({
    back: mass(p, { y: 60, spread: 6, n: 7, amp: 3.6, tipsN: 6, depth: 3.5 }),
    front:
      cap(
        p,
        "L54 42Q57 38 53 34Q56 30 52 26Q54 22 48 18Q40 20 36 16Q30 20 24 17Q18 20 15 24Q10 28 13 32Q8 36 12 40Q8 44 10 42",
      ) +
      line("M12 30q-2 2 0 4M52 30q2 2 0 4M14 38q-2 2 0 4", p.m) +
      `<g transform="rotate(7 33 12)">` +
      `<ellipse cx="33" cy="14" rx="22" ry="3.8" fill="#2fae3a"/>` +
      fill("M19 14L20 -1H46L47 14Z", "#3cc048") +
      `<rect x="21" y="0" width="4" height="12" fill="#6ad870"/>` +
      `<rect x="19.6" y="9" width="27" height="3.6" fill="#16642a"/>` +
      `<rect x="28" y="7.6" width="7" height="6.4" fill="#f4c430"/><rect x="30" y="9.4" width="3" height="2.6" fill="#16642a"/>` +
      `<circle cx="40.4" cy="4.8" r="1.8" fill="#1c7a2c"/><circle cx="43.6" cy="4.8" r="1.8" fill="#1c7a2c"/><circle cx="42" cy="2.4" r="1.8" fill="#1c7a2c"/><rect x="41.6" y="5.6" width="1" height="3" fill="#1c7a2c"/>` +
      `</g>`,
  }),
  // 08 tangerine waves, side sweep, silver clip
  (p) => ({
    back: mass(p, {
      y: 64,
      ly: 68,
      spread: 5,
      n: 4,
      amp: 2.6,
      tipsN: 6,
      depth: 6,
      pointy: true,
    }),
    front:
      cap(
        p,
        "L53 44Q51 32 47 17Q42 22 34 22Q24 22 18 30Q19 36 16 42Q16 46 13 46Q14 42 10 40",
      ) +
      gloss(p) +
      sweepStrands(p) +
      `<ellipse cx="45" cy="9" rx="4.4" ry="3" fill="#5a5a6c"/><ellipse cx="45" cy="9" rx="3.4" ry="2" fill="#f4f4fa"/><rect x="42.6" y="8.6" width="5" height="1" fill="#8a8a9c"/>`,
  }),
  // 09 peach waves, wavy bangs, gingham bow headband
  (p) => ({
    back: mass(p, { y: 64, spread: 5, n: 5, amp: 2.4, tipsN: 6, depth: 3 }),
    front:
      cap(
        p,
        `L54 44Q56 38 52 34Q54 28 49 22${tips(49, 22, 15, 22, 5, 2.5, false)}Q10 28 12 34Q8 38 10 44`,
      ) +
      gloss(p) +
      line("M24 8Q22 16 24 22M32 7V22M40 8Q42 16 40 22", p.d) +
      line("M11 26Q12 8 32 6Q48 7 54 20", "#d82840", 2.4) +
      `<g fill="#ffffff"><rect x="14" y="14" width="1" height="1"/><rect x="24" y="7.6" width="1" height="1"/><rect x="34" y="6" width="1" height="1"/><rect x="44" y="8" width="1" height="1"/><rect x="51" y="14" width="1" height="1"/></g>` +
      bow(16, 7, 3.8, "#d82840") +
      `<g fill="#ffffff"><rect x="12" y="5" width="1" height="1"/><rect x="21" y="8" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="20" y="4" width="1" height="1"/></g>`,
  }),
  // 10 marigold shoulder bob swept right, blue ribbon on the left
  (p) => ({
    back: mass(p, {
      y: 58,
      spread: 3,
      n: 1,
      amp: 0.6,
      tipsN: 4,
      depth: 5,
      pointy: true,
    }),
    front:
      flip(
        cap(p, "L53 46Q51 32 47 17Q42 22 34 22Q24 22 18 30L17 42Q14 46 11 42") +
          gloss(p) +
          sweepStrands(p),
      ) +
      bow(14, 16, 2.2, "#5ab8f0") +
      line("M13 17L10 30M15 17L16 28", "#3a90d8", 1),
  }),
  // 11 rosy fringe with a long mermaid sweep to the right and down
  (p) => ({
    back:
      hair(
        "M12 30Q10 3 32 3Q54 3 54 22Q63 32 61 46Q58 58 46 64Q30 70 20 76Q12 82 5 86Q10 78 17 70Q28 62 40 56Q50 48 48 40L16 40Q11 38 12 30Z",
        p,
      ) +
      line("M56 26Q60 38 56 50Q48 60 30 66Q20 72 12 80", p.d) +
      line("M58 34Q58 46 52 54", p.l) +
      line("M52 30Q54 44 46 52Q36 60 24 66", p.m),
    front:
      cap(
        p,
        `L53 40Q51 28 49 22${tips(49, 22, 16, 22, 6, 3, true)}Q12 24 5 29Q10 31 12 40`,
      ) +
      gloss(p) +
      line("M26 7Q24 14 25 22M33 6V22M40 7Q42 14 42 22M20 10Q16 18 15 26", p.d),
  }),
  // 12 lemon low pony on the right with a purple orchid
  (p) => ({
    back:
      hair(
        "M12 30Q10 3 32 3Q54 3 52 30Q53 38 48 40L18 44L15 48L14 42L11 46Z",
        p,
      ) +
      hair(
        "M46 28Q57 32 55 44Q59 54 53 62Q56 70 50 76Q48 68 48 62Q45 52 47 44Q44 36 44 32Z",
        p,
      ) +
      line("M51 36Q54 46 51 54Q55 62 51 70", p.d) +
      line("M53 42Q55 48 53 52", p.l),
    front:
      cap(
        p,
        "L53 34Q51 26 47 17Q42 22 34 22Q24 22 18 30L18 40L16 44L14 38L11 44",
      ) +
      gloss(p) +
      sweepStrands(p) +
      flower(50, 28, 3.6, "#b070e0", "#fff6d0"),
  }),
  // 13 vanilla high curly pony, big swoop, green ribbon
  (p) => ({
    back:
      hair("M12 30Q10 3 32 3Q54 3 52 30Q53 38 48 42H16Q11 38 12 30Z", p) +
      hair(
        "M38 4Q48 -2 58 4Q64 12 62 26Q60 40 58 46Q56 52 60 56Q63 62 57 65Q51 66 52 60Q55 57 53 52Q51 44 53 34Q55 20 50 12Q46 8 40 8Z",
        p,
      ) +
      line("M52 4Q60 12 58 28Q56 40 55 48", p.d) +
      line("M60 12Q61 20 59 28", p.s) +
      line("M47 2Q54 2 57 6", p.l),
    front:
      cap(p, "L53 40Q51 28 48 20Q40 25 30 23Q20 22 14 30Q12 36 11 40") +
      gloss(p) +
      line("M46 6Q38 14 26 20M36 5Q26 12 16 26", p.d) +
      line(
        "M40 4Q36 -1 33.5 2.5Q36 5 40 4Q44 -1 46.5 2.5Q44 5 40 4",
        "#78d048",
        1.3,
      ),
  }),
  // 14 mocha updo with blue headband, loose wisps, ribbon at the back
  (p) => ({
    back:
      hair("M12 30Q10 3 32 3Q54 3 52 30Q53 38 48 40H16Q11 38 12 30Z", p) +
      `<circle cx="47" cy="14" r="9" fill="${p.b}"/>` +
      line("M41 9Q47 6 53 12M42 16Q47 13 52 18", p.d) +
      line(
        "M14 30Q11 40 13 48Q11 52 12 56M50 30Q53 40 51 48Q53 52 52 56",
        p.b,
        1.4,
      ) +
      bow(52, 42, 2.4, "#8aa6f4") +
      line("M51 43L50 54M53 43L55 52", "#6a86e8", 1),
    front:
      cap(p, "L52 34Q51 22 44 16Q32 13 20 16Q13 22 12 34") +
      gloss(p) +
      line("M24 6Q20 12 18 18M32 5V14M40 6Q44 12 46 18", p.d) +
      line(
        "M15 18Q12 30 14 40Q12 44 13 48M49 18Q52 30 50 40Q52 44 51 48",
        p.m,
        1.3,
      ) +
      line("M12 26Q13 8 32 7Q50 8 52 26", "#6a8af0", 1.6),
  }),
  // 15 golden waves under an olive cadet cap
  (p) => ({
    back: mass(p, { y: 66, spread: 5, n: 4, amp: 2.6, tipsN: 6, depth: 3 }),
    front:
      cap(p, "L54 46Q57 40 52 34Q54 28 48 22L16 22Q10 28 12 34Q8 40 10 46") +
      fill("M10 17Q10 1 30 0Q51 0 53 13L53 18L10 18Z", "#6e7a22") +
      `<rect x="10" y="14" width="43" height="4" fill="#545e18"/>` +
      fill("M18 4Q26 1.5 34 2", "#8e9a34") +
      line("M18 5Q26 2 36 2.4", "#8e9a34", 1.4) +
      fill("M3 18Q16 14 30 17L30 20Q16 18 3 21Z", "#3e4612") +
      `<rect x="40" y="9" width="2" height="2" fill="#f0c840"/><rect x="45" y="8" width="2" height="2" fill="#f0c840"/>`,
  }),
  // 16 pale pink streaked hair with heart shades and heart clips
  (p) => ({
    back:
      mass(p, {
        y: 54,
        spread: 2,
        n: 1,
        amp: 0.5,
        tipsN: 6,
        depth: 5,
        pointy: true,
      }) + line("M51 34L54 52M13 34L10 52", "#f05068", 1.2),
    front:
      cap(
        p,
        "L53 46Q51 32 47 17L46 22L42 20L40 24L35 21L32 25L28 21L24 25L21 24Q17 30 17 40L15 46L13 40L11 46",
      ) +
      line("M44 7L46 20M36 6Q32 14 32 24M28 6Q24 14 22 24", "#f05068", 1.2) +
      line("M40 6L40 22M20 12Q15 22 15 40", "#ffffff", 1.2) +
      fill("M11 5H53V7H11Z", "#e8308c") +
      `<rect x="12" y="4" width="14" height="7" rx="2" fill="#e8308c"/><rect x="38" y="4" width="14" height="7" rx="2" fill="#e8308c"/>` +
      `<rect x="13.5" y="5.5" width="11" height="4" rx="1" fill="#ff8ccc"/><rect x="39.5" y="5.5" width="11" height="4" rx="1" fill="#ff8ccc"/>` +
      `<rect x="15" y="6" width="3" height="1" fill="#ffffff"/><rect x="41" y="6" width="3" height="1" fill="#ffffff"/>` +
      heart(50, 27, "#3aa8f0") +
      heart(48.5, 34, "#f8d030"),
  }),
  // 17 copper curls, straight fringe, braid crown
  (p) => ({
    back: mass(p, { y: 62, spread: 6, n: 7, amp: 3, tipsN: 7, depth: 3 }),
    front:
      cap(
        p,
        `L54 44Q57 40 53 36Q56 32 52 28Q53 24 49 21${tips(49, 21, 15, 21, 8, 1.6, true)}Q11 24 12 28Q8 32 11 36Q7 40 10 44`,
      ) +
      line("M22 10Q20 16 21 21M28 9V21M34 9V21M40 9Q42 16 42 21", p.d) +
      beads(12, 21, 14, 3, 32, 4, 9, 2.4, p.m, p.l) +
      beads(32, 4, 50, 3, 52, 21, 9, 2.4, p.l, p.m),
  }),
  // 18 auburn roll swept right with a cream feather clip
  (p) => ({
    back:
      hair(
        "M12 30Q10 3 32 3Q54 3 52 30Q54 38 50 42L18 44Q10 46 5 54Q3 46 8 40Q6 34 12 30Z",
        p,
      ) + line("M10 40Q6 46 7 50", p.d),
    front:
      cap(
        p,
        "L52 34Q50 24 46 20Q36 18 26 24Q18 30 16 38Q12 44 7 47Q10 40 11 34",
      ) +
      gloss(p) +
      line("M46 8Q36 12 26 18Q18 24 14 34M38 5Q30 8 22 14", p.d) +
      line("M44 16Q34 14 24 20", p.l, 1.2) +
      fill("M42 9Q48 0 63 1Q57 4 61 6Q52 6 56 9Q49 9 42 9Z", "#f4ecd0") +
      line("M44 8Q52 4 60 3", "#c8b890") +
      `<circle cx="43" cy="9" r="1.8" fill="#c89838"/>`,
  }),
  // 19 golden straight hair with a deep red headband bow
  (p) => ({
    back: mass(p, {
      y: 66,
      spread: 3,
      n: 1,
      amp: 0.8,
      tipsN: 5,
      depth: 4,
      pointy: true,
    }),
    front:
      cap(p, "L53 44Q51 32 47 17Q42 22 34 22Q24 22 18 30L17 42Q14 46 11 42") +
      gloss(p) +
      sweepStrands(p) +
      line("M11 30Q12 8 32 7Q50 8 52 24", "#a8202c", 2) +
      bow(52, 26, 2.4, "#b82434") +
      line("M51 27L50 36M53 27L55 34", "#8a1820", 1),
  }),
  // 20 pale blonde waves swept right with a red rose
  (p) => ({
    back: mass(p, {
      y: 70,
      ly: 66,
      spread: 5,
      n: 5,
      amp: 3,
      tipsN: 6,
      depth: 3,
    }),
    front:
      flip(
        cap(
          p,
          "L53 44Q57 38 52 32Q51 24 47 17Q42 22 34 22Q24 22 18 30Q20 36 17 42Q14 46 11 42",
        ) +
          gloss(p) +
          sweepStrands(p),
      ) +
      fill("M10 9L6 5L13 7ZM19 10L23 14L16 12Z", "#3cae44") +
      `<circle cx="14.5" cy="8.5" r="3.6" fill="#e83050"/>` +
      line("M13 8.5Q14.5 6.5 16 8.5Q14.5 11 12.6 9.6", "#a01830"),
  }),
  // 21 golden waves with a tiny tilted top hat
  (p) => ({
    back: mass(p, { y: 70, spread: 5, n: 6, amp: 2.6, tipsN: 6, depth: 3 }),
    front:
      flip(
        cap(
          p,
          "L54 44Q57 38 52 32Q51 24 47 17Q42 22 34 22Q24 22 18 30Q20 36 17 42Q14 46 11 42",
        ) +
          gloss(p) +
          sweepStrands(p),
      ) +
      `<g transform="rotate(18 50 10) translate(50 9) scale(1.25) translate(-50 -9)"><rect x="40" y="10" width="20" height="2.6" fill="#28224a"/><rect x="44" y="-2" width="12" height="12" fill="#2e2856"/><rect x="45" y="-1" width="2" height="10" fill="#4a4280"/><rect x="44" y="7" width="12" height="2" fill="#e02030"/></g>`,
  }),
  // 22 very long golden layers, centre part
  (p) => ({
    back: mass(p, {
      y: 80,
      ly: 84,
      spread: 8,
      n: 5,
      amp: 3,
      tipsN: 6,
      depth: 8,
      pointy: true,
    }),
    front:
      cap(
        p,
        "L54 50Q50 42 51 34Q47 30 49 24Q44 13 32 10Q20 13 15 24Q17 30 13 34Q14 42 10 50",
      ) +
      gloss(p) +
      centreStrands(p),
  }),
  // 23 brown waves under a wide straw sunhat with orange flowers
  (p) => ({
    back: mass(p, { y: 62, spread: 4, n: 5, amp: 2.4, tipsN: 6, depth: 3 }),
    front:
      cap(p, "L54 44Q57 38 52 32Q53 26 48 20L16 20Q11 26 12 32Q7 38 10 44") +
      `<ellipse cx="32" cy="15" rx="31" ry="5" fill="#f2c89a" transform="rotate(-8 32 15)"/>` +
      `<ellipse cx="32" cy="15" rx="24" ry="3" fill="none" stroke="#dca06a" stroke-width="1" transform="rotate(-8 32 15)"/>` +
      fill("M17 15Q17 2 32 1Q47 1 47 11Z", "#f6d4aa") +
      line("M20 6Q32 3 44 4", "#dca06a") +
      fill("M17 12L47 8L47 11.5L17 15.5Z", "#8a5020") +
      flower(43, 6, 3, "#f8862a") +
      flower(50, 9, 3, "#f04a20", "#ffd84a"),
  }),
  // 24 short yellow shag swept left with flicks
  (p) => ({
    back: hair(
      "M12 30Q10 3 32 3Q54 3 52 30Q55 40 50 46L47 42L44 46H20Q12 46 6 40Q10 38 12 30Z",
      p,
    ),
    front:
      cap(
        p,
        "L52 40Q50 28 46 16Q42 22 34 20Q26 24 18 24Q10 26 2 34Q7 28 8 24Q10 32 11 38",
      ) +
      gloss(p) +
      line("M46 8Q40 14 30 20M38 6Q30 12 16 24M28 6Q20 14 8 26", p.d) +
      line("M52 34L56 32", p.b, 2),
  }),
  // 25 apricot swept right, long cascade on the right, lime flower
  (p) => ({
    back:
      hair(
        "M12 30Q10 3 32 3Q54 3 52 30Q60 38 56 48Q62 58 56 66Q60 74 54 82Q50 74 50 66Q46 56 48 48L16 50Q8 50 8 42Q8 36 12 30Z",
        p,
      ) +
      line("M53 36Q58 44 54 52Q58 60 54 68Q56 74 54 78", p.d) +
      line("M55 46Q57 52 55 56", p.l),
    front:
      flip(
        cap(
          p,
          "L54 44Q58 38 53 32Q51 24 47 17Q42 22 34 22Q24 22 18 30Q16 36 17 40Q14 46 11 42",
        ) +
          gloss(p) +
          sweepStrands(p),
      ) + flower(50, 26, 4, "#b4ec2c", "#fff07a"),
  }),
  // 26 pink high pigtails with blue bows
  (p) => ({
    back:
      hair("M12 30Q10 3 32 3Q54 3 52 30Q53 38 48 40H16Q11 38 12 30Z", p) +
      hair(
        "M16 10Q4 12 4 28Q2 40 7 50Q4 62 9 74Q12 64 11 56Q15 46 12 36Q14 22 20 14Z",
        p,
      ) +
      hair(
        "M48 10Q60 12 60 28Q62 40 57 50Q60 62 55 74Q52 64 53 56Q49 46 52 36Q50 22 44 14Z",
        p,
      ) +
      line("M8 20Q5 34 9 46Q7 58 10 68M56 20Q59 34 55 46Q57 58 54 68", p.d) +
      line("M6 26Q5 32 7 38M58 26Q59 32 57 38", p.l),
    front:
      cap(
        p,
        `L52 38Q50 28 49 22${tips(49, 22, 15, 22, 6, 3, true)}Q14 28 12 38`,
      ) +
      gloss(p) +
      line("M26 7Q24 14 25 22M33 6V22M40 7Q42 14 42 22", p.d) +
      bow(11, 11, 2.8, "#5ab4f0") +
      bow(53, 11, 2.8, "#5ab4f0"),
  }),
  // 27 plum bob with blunt fringe and low pigtails
  (p) => ({
    back:
      hair("M12 30Q10 3 32 3Q54 3 52 30Q53 40 50 46H14Q11 40 12 30Z", p) +
      hair("M16 42Q8 46 9 56Q7 64 12 72Q16 64 16 56Q20 48 20 44Z", p) +
      hair("M48 42Q56 46 55 56Q57 64 52 72Q48 64 48 56Q44 48 44 44Z", p) +
      line("M12 50Q10 58 12 66M52 50Q54 58 52 66", p.d) +
      `<rect x="13" y="43" width="5" height="3" fill="#f070a8"/><rect x="46" y="43" width="5" height="3" fill="#f070a8"/>`,
    front:
      cap(
        p,
        `L54 44L50 46Q49 32 48 22${tips(48, 22, 16, 22, 8, 1.4, true)}Q15 32 14 46L10 44`,
      ) +
      gloss(p) +
      line("M24 8Q22 14 22 21M32 6V21M40 8Q42 14 42 21", p.d),
  }),
  // 28 lemon long straight sweep with red jewel pins
  (p) => ({
    back:
      hair(
        "M12 30Q10 3 32 3Q54 3 52 30L57 72L52 69L50 74L47 60L20 60Q14 70 3 82Q8 70 10 60Q9 44 12 30Z",
        p,
      ) +
      line("M53 34L55 66M50 36L51 60", p.m) +
      line("M14 40Q12 56 8 70", p.d),
    front:
      cap(
        p,
        `L53 44Q51 30 49 23${tips(49, 23, 15, 22, 7, 2.4, true)}Q13 28 11 40`,
      ) +
      gloss(p) +
      line("M22 8Q19 15 20 22M28 6Q26 14 27 22M35 6V22M42 7Q44 14 44 22", p.d) +
      line("M46 10Q50 16 51 26", "#e8b830") +
      `<circle cx="46" cy="11" r="1.5" fill="#e02040"/><circle cx="49" cy="17" r="1.5" fill="#e02040"/><circle cx="51" cy="24" r="1.5" fill="#e02040"/>`,
  }),
  // 29 blonde updo with a starfish clip
  make({
    length: "pixie",
    edge: EDGE.sweep,
    back: topBun(4, 8),
    front: () => flower(44, 10, 2.4, "#4ab8f0", "#ffe14a"),
  }),
  // 30 ginger bob with a pearl clip
  make({
    length: "bob",
    edge: EDGE.sweep,
    mirror: true,
    front: () => beads(14, 14, 18, 8, 24, 6, 5, 1.4, "#ffffff", "#bfe6ff"),
  }),
  // 31 caramel waves under a ribbon bow band
  make({
    length: "long",
    edge: EDGE.centre,
    strands: "centre",
    front: () => headband("#6a3a1e") + bow(32, 5, 2.6, "#8a5a2a"),
  }),
  // 32 auburn short bob
  make({ length: "bob", edge: EDGE.peak, strands: "centre" }),
  // 33 teal mermaid curls with a pink bow
  make({
    length: { y: 76, spread: 6, n: 7, amp: 3.6, tipsN: 6, depth: 3 },
    edge: EDGE.sweep,
    mirror: true,
    front: () => bow(46, 10, 3, "#ff4f9a") + ribbonTail(48, 12, "#ff4f9a"),
  }),
  // 34 sandy waves under a tartan hat
  make({
    length: "long",
    edge: EDGE.centre,
    strands: "centre",
    front: () => hat("#26262e", "#d8202a", 12, 9, 25),
  }),
  // 35 cocoa curls with purple bows
  make({
    length: { y: 58, spread: 6, n: 6, amp: 3.2, tipsN: 5, depth: 3 },
    edge: EDGE.peak,
    front: () => bow(14, 20, 2, "#9a5ae0") + bow(50, 20, 2, "#9a5ae0"),
  }),
  // 36 espresso bun with aviator goggles
  make({
    length: "pixie",
    edge: EDGE.blunt,
    strands: "none",
    back: topBun(3, 7),
    front: () =>
      line("M11 20Q32 10 53 20", "#4a3a2a", 2.4) +
      `<circle cx="22" cy="14" r="3.4" fill="#e8a020"/><circle cx="42" cy="14" r="3.4" fill="#e8a020"/><circle cx="22" cy="14" r="2" fill="#9ad8f0"/><circle cx="42" cy="14" r="2" fill="#9ad8f0"/>`,
  }),
  // 37 latte blunt bob with a red bow
  make({
    length: "bob",
    edge: EDGE.blunt,
    strands: "none",
    front: () => bow(16, 12, 2.4, "#e8283a"),
  }),
  // 38 candy-streak bob with blue bows
  make({
    length: "bob",
    edge: EDGE.blunt,
    strands: "none",
    back: streaks(["#ff6fae", "#4ab8f0", "#ffb03a", "#ff6fae"], 44),
    front: () => bow(12, 22, 1.8, "#2a5ad8") + bow(52, 22, 1.8, "#2a5ad8"),
  }),
  // 39 ginger long waves
  make({ length: "waist", edge: EDGE.sweep }),
  // 40 platinum wild mane with cat ears
  make({
    length: {
      y: 70,
      spread: 8,
      n: 4,
      amp: 3,
      tipsN: 7,
      depth: 7,
      pointy: true,
    },
    edge: `L53 44Q51 30 48 20${tips(48, 20, 16, 20, 5, 4, true)}Q13 30 11 44`,
    strands: "none",
    front: (p) =>
      fill("M14 10L12 -2L22 6Z", p.b) +
      fill("M50 10L52 -2L42 6Z", p.b) +
      fill("M15 7L14 1L19 5Z", "#ffb0c8") +
      fill("M49 7L50 1L45 5Z", "#ffb0c8"),
  }),
  // 41 jester curls in a harlequin hat
  make({
    length: "long",
    edge: EDGE.blunt,
    strands: "none",
    back: streaks(["#9a5ae0", "#3cc048", "#ffd84d", "#9a5ae0"]),
    front: () =>
      fill("M12 18Q14 0 32 2Q50 0 52 18Z", "#3cc048") +
      fill("M32 2L44 -4L52 18Z", "#9a5ae0") +
      fill("M32 2L20 -4L12 18Z", "#ffd84d") +
      `<circle cx="20" cy="-3" r="2" fill="#ffd84d"/><circle cx="44" cy="-3" r="2" fill="#ffd84d"/>`,
  }),
  // 42 lilac curls under a cream sun hat
  make({
    length: { y: 62, spread: 7, n: 7, amp: 3.6, tipsN: 5, depth: 3 },
    edge: EDGE.centre,
    strands: "none",
    front: () => hat("#f6ecc8", "#c99aff", 13, 9, 26),
  }),
  // 43 rainbow-streak sweep
  make({
    length: "long",
    edge: EDGE.sweep,
    back: streaks(["#ff5a5f", "#ffd84d", "#4cc97a", "#4aa8ff"]),
  }),
  // 44 blonde under an aviator cap
  make({
    length: "shoulder",
    edge: EDGE.blunt,
    strands: "none",
    front: () =>
      fill(
        "M11 26Q9 2 32 2Q55 2 53 26L49 24Q48 10 32 9Q16 10 15 24Z",
        "#6a4a2a",
      ) +
      `<rect x="9" y="22" width="6" height="12" rx="2" fill="#6a4a2a"/><rect x="49" y="22" width="6" height="12" rx="2" fill="#6a4a2a"/>` +
      line("M14 8Q32 2 50 8", "#c8a070", 1),
  }),
  // 45 cocoa flip with a blue bow band
  make({
    length: { y: 50, spread: 6, n: 1, amp: 0, tipsN: 2, depth: -4 },
    edge: EDGE.sweep,
    front: () => headband("#2a8ad8") + bow(20, 8, 2.2, "#4ab8f0"),
  }),
  // 46 olive pigtails with pink bows
  make({
    length: "pixie",
    edge: EDGE.centre,
    strands: "centre",
    back: pigtails(58),
    front: () => bow(10, 14, 2, "#ff8ac8") + bow(54, 14, 2, "#ff8ac8"),
  }),
  // 47 sea-green spiky crop
  make({
    length: "pixie",
    edge: `L53 40Q51 28 49 21${tips(49, 21, 15, 21, 8, 5, true)}Q14 30 11 40`,
    strands: "none",
  }),
  // 48 golden updo with a red rose
  make({
    length: "pixie",
    edge: EDGE.peak,
    back: topBun(2, 9),
    front: () => flower(40, 4, 2.6, "#d8202a", "#3cc048"),
  }),
  // 49 brown flip-out bob
  make({
    length: { y: 48, spread: 7, n: 1, amp: 0, tipsN: 2, depth: -5 },
    edge: EDGE.sweep,
    mirror: true,
  }),
  // 50 copper waves under a straw hat with a green band
  make({
    length: "long",
    edge: EDGE.centre,
    strands: "none",
    front: () => hat("#e8c878", "#2a9a4a", 12, 8, 25),
  }),
  // 51 latte ringlets
  make({
    length: { y: 66, spread: 8, n: 8, amp: 3.6, tipsN: 6, depth: 3 },
    edge: EDGE.centre,
    strands: "centre",
  }),
  // 52 honey waves with a blue flower band
  make({
    length: "long",
    edge: EDGE.sweep,
    front: () =>
      headband("#4ab8f0") +
      flower(22, 6, 1.8, "#ffffff", "#4ab8f0") +
      flower(42, 6, 1.8, "#ffffff", "#4ab8f0"),
  }),
  // 53 golden ringlets with a red feather
  make({
    length: { y: 62, spread: 7, n: 7, amp: 3.4, tipsN: 5, depth: 3 },
    edge: EDGE.sweep,
    front: () => fill("M40 8Q52 -4 58 2Q50 4 42 12Z", "#e8283a"),
  }),
  // 54 blonde braid crown with a rose
  make({
    length: "shoulder",
    edge: EDGE.centre,
    strands: "centre",
    front: (p) =>
      beads(12, 22, 32, 0, 52, 22, 10, 2, p.b, p.l) +
      flower(48, 14, 2, "#ff5a7a"),
  }),
  // 55 mint pigtail tufts with flowers
  make({
    length: "pixie",
    edge: EDGE.blunt,
    strands: "none",
    back: pigtails(40, false, 10),
    front: () =>
      flower(12, 16, 2, "#ffe14a", "#3cc048") +
      flower(52, 16, 2, "#ffe14a", "#3cc048"),
  }),
  // 56 blonde braided updo with a beaded band and muffs
  make({
    length: "pixie",
    edge: EDGE.blunt,
    back: topBun(3, 8),
    front: () =>
      headband("#2a5ad8") +
      beads(14, 14, 32, 4, 50, 14, 8, 1, "#ffffff", "#ffd84d") +
      `<circle cx="11" cy="32" r="4" fill="#26262e"/><circle cx="53" cy="32" r="4" fill="#26262e"/><circle cx="11" cy="32" r="2" fill="#ffffff"/><circle cx="53" cy="32" r="2" fill="#ffffff"/>`,
  }),
  // 57 butter high pony with a pink bow
  make({
    length: "pixie",
    edge: EDGE.sweep,
    back: pony(1, 60),
    front: () => bow(46, 6, 2.4, "#ff8ab8"),
  }),
  // 58 ginger curls with a green mini top hat
  make({
    length: { y: 56, spread: 7, n: 6, amp: 3.6, tipsN: 5, depth: 3 },
    edge: EDGE.peak,
    front: () =>
      fill("M14 14L16 4H26L28 14Z", "#2a8a3a") +
      `<ellipse cx="21" cy="14" rx="9" ry="2" fill="#1e6a2a"/><rect x="16" y="9" width="12" height="2" fill="#ffd84d"/>`,
  }),
  // 59 blonde short bob, swept
  make({ length: "bob", edge: EDGE.sweep }),
  // 60 purple corkscrew pigtails
  make({
    length: "pixie",
    edge: EDGE.centre,
    strands: "centre",
    back: pigtails(66, true, 5),
    front: () =>
      `<circle cx="10" cy="22" r="2" fill="#ffd84d"/><circle cx="54" cy="22" r="2" fill="#ffd84d"/>`,
  }),
  // 61 mint shaggy crop
  make({
    length: {
      y: 46,
      spread: 4,
      n: 2,
      amp: 2,
      tipsN: 6,
      depth: 5,
      pointy: true,
    },
    edge: `L53 44Q51 30 49 22${tips(49, 22, 15, 22, 6, 6, true)}Q14 30 11 44`,
    strands: "none",
  }),
  // 62 butter low buns
  make({
    length: "pixie",
    edge: EDGE.centre,
    strands: "centre",
    back: buns(40, 6, 20),
  }),
  // 63 cocoa waves under a sun hat with orange blossoms
  make({
    length: "long",
    edge: EDGE.centre,
    strands: "none",
    front: () =>
      hat("#f2d8a0", "#a8642a", 12, 8, 27) +
      flower(44, 8, 2.4, "#ff8a2a") +
      flower(50, 11, 2, "#ffb03a"),
  }),
  // 64 brown tousled long
  make({
    length: {
      y: 66,
      spread: 6,
      n: 4,
      amp: 3,
      tipsN: 6,
      depth: 6,
      pointy: true,
    },
    edge: EDGE.peak,
  }),
  // 65 latte side braid with a little bow
  make({
    length: "pixie",
    edge: EDGE.sweep,
    back: (p) => beads(50, 30, 54, 50, 48, 70, 8, 2.6, p.b, p.m),
    front: () => bow(48, 72, 1.6, "#e8283a"),
  }),
  // 66 pastel rainbow pony
  make({
    length: "pixie",
    edge: EDGE.sweep,
    mirror: true,
    back: (p) =>
      pony(-1, 62)(p) +
      line("M10 30Q6 46 12 60", "#9ad8ff", 2) +
      line("M8 26Q4 40 8 52", "#ffb0d8", 2),
  }),
  // 67 pink spiky crop
  make({
    length: "pixie",
    edge: `L53 40Q51 28 49 21${tips(49, 21, 15, 21, 7, 6, true)}Q14 30 11 40`,
    strands: "none",
  }),
  // 68 sky crop with a unicorn horn
  make({
    length: "shoulder",
    edge: EDGE.blunt,
    strands: "none",
    front: () =>
      fill("M29 6L32 -8L35 6Z", "#f6f0ff") +
      line("M30 2L34 0M30.6 -2L33.6 -4", "#c99aff"),
  }),
  // 69 pink buns with polka bows
  make({
    length: "pixie",
    edge: EDGE.blunt,
    strands: "none",
    back: buns(8, 7, 20),
    front: () => bow(12, 4, 2, "#26262e") + bow(52, 4, 2, "#26262e"),
  }),
  // 70 inky waves with a feathered steampunk hat
  make({
    length: "long",
    edge: EDGE.sweep,
    front: () =>
      fill("M18 12L20 0H44L46 12Z", "#3a2a1e") +
      `<ellipse cx="32" cy="12" rx="18" ry="3" fill="#2a1e14"/>` +
      `<circle cx="26" cy="8" r="2.6" fill="#c89a3a"/><circle cx="34" cy="8" r="2.6" fill="#c89a3a"/>` +
      fill("M42 2Q54 -6 60 0Q52 2 44 8Z", "#f4f4f8"),
  }),
  // 71 flame-orange wild hair
  make({
    length: {
      y: 56,
      spread: 9,
      n: 3,
      amp: 3,
      tipsN: 7,
      depth: 7,
      pointy: true,
    },
    edge: `L53 42Q51 30 48 20${tips(48, 20, 16, 20, 5, 4, true)}Q13 30 11 42`,
  }),
  // 72 sunny side sweep with a rose band
  make({
    length: "pixie",
    edge: EDGE.sweep,
    back: pony(1, 52),
    front: () => headband("#26262e") + flower(22, 6, 2.6, "#ff8ac8", "#ffffff"),
  }),
  // 73 chestnut windswept with blue bows
  make({
    length: {
      y: 60,
      spread: 10,
      n: 3,
      amp: 3,
      tipsN: 6,
      depth: 7,
      pointy: true,
    },
    edge: EDGE.sweep,
    front: () => bow(22, 6, 2, "#9ad8ff") + bow(42, 6, 2, "#9ad8ff"),
  }),
  // 74 cream side updo with a teal flower
  make({
    length: "pixie",
    edge: EDGE.sweep,
    mirror: true,
    back: (p) => hair("M14 24Q4 30 8 42Q12 50 20 46Q14 40 18 30Z", p),
    front: () => flower(14, 30, 2.6, "#2ab8b8"),
  }),
  // 75 golden windblown pony with a red ribbon
  make({
    length: "pixie",
    edge: EDGE.sweep,
    back: (p) =>
      hair("M44 8Q62 4 62 18Q60 30 46 34Q56 26 52 16Q48 12 42 12Z", p) +
      hair("M12 34Q4 40 2 52Q10 46 16 42Z", p),
    front: () => bow(48, 8, 2.6, "#d81c30") + ribbonTail(50, 10, "#d81c30"),
  }),
  // 76 bubblegum pigtails with blue bows
  make({
    length: "pixie",
    edge: EDGE.blunt,
    strands: "none",
    back: pigtails(64, true, 7),
    front: () => bow(10, 14, 2.4, "#4ab8f0") + bow(54, 14, 2.4, "#4ab8f0"),
  }),
  // 77 golden shag
  make({
    length: {
      y: 50,
      spread: 4,
      n: 2,
      amp: 2,
      tipsN: 6,
      depth: 5,
      pointy: true,
    },
    edge: EDGE.sweep,
  }),
];

const BASES = [
  "#c8286a",
  "#f8d020",
  "#e0a828",
  "#e2b478",
  "#8e4420",
  "#9a7048",
  "#f2e2a8",
  "#f07a18",
  "#f4c08c",
  "#f4a810",
  "#e8285a",
  "#f4d828",
  "#f8eeb0",
  "#a07850",
  "#e2b038",
  "#f8c8d0",
  "#d0601c",
  "#c4401a",
  "#f4c020",
  "#f4e098",
  "#f4d070",
  "#f0d080",
  "#8a4a1a",
  "#f8d038",
  "#f4a020",
  "#f0609a",
  "#5a2070",
  "#f8d838",
  "#f2d070",
  "#e0782a",
  "#c08a4a",
  "#a8401a",
  "#2ac0c0",
  "#c8a060",
  "#8a4a1e",
  "#3a2418",
  "#c8a078",
  "#f0e0b0",
  "#d8641e",
  "#f4ecc0",
  "#f4c020",
  "#9a6ae0",
  "#f4d860",
  "#f4d060",
  "#7a4a20",
  "#5a6a4a",
  "#5aa898",
  "#e8b030",
  "#6a3a1a",
  "#c0501a",
  "#c89868",
  "#a8743a",
  "#f0c040",
  "#f0d070",
  "#6ae0b8",
  "#f4d070",
  "#f8e070",
  "#d8641e",
  "#f4d878",
  "#7a4ad8",
  "#8ae0c8",
  "#f4e090",
  "#7a4a20",
  "#8a5a2a",
  "#c8a070",
  "#ffd0e8",
  "#ff7ab0",
  "#7ac8f0",
  "#ff8ab8",
  "#26222a",
  "#f4781e",
  "#f4d040",
  "#7a3a1a",
  "#f4eab0",
  "#f4c828",
  "#ff6fa8",
  "#f0c838",
];

/* ------------------------------------------------ data-driven rows */

const ROW_LENGTHS: Record<HairLength, Length> = {
  pixie: "pixie",
  bob: "bob",
  shoulder: "shoulder",
  long: "long",
  waist: "waist",
  curly: { y: 62, spread: 7, n: 7, amp: 3.6, tipsN: 6, depth: 3 },
  curlyshort: { y: 50, spread: 6, n: 4, amp: 3, tipsN: 5, depth: 3 },
  wavy: { y: 66, spread: 5, n: 5, amp: 2.4, tipsN: 6, depth: 3 },
  wild: { y: 64, spread: 8, n: 4, amp: 3, tipsN: 7, depth: 7, pointy: true },
  flip: { y: 50, spread: 6, n: 1, amp: 0, tipsN: 2, depth: -4 },
  updo: "pixie",
};

const ROW_EDGES: Record<HairEdge, string> = {
  sweep: EDGE.sweep,
  centre: EDGE.centre,
  blunt: EDGE.blunt,
  peak: EDGE.peak,
  spiky: `L53 40Q51 28 49 21${tips(49, 21, 15, 21, 7, 6, true)}Q14 30 11 40`,
  wispy: `L53 44Q51 30 49 22${tips(49, 22, 15, 22, 6, 6, true)}Q14 30 11 44`,
};

/** One add-on token from a hair row, as back or front layer markup. */
function addOn(token: string, p: Pal): { back?: string; front?: string } {
  const [kind, ...a] = token.trim().split(/\s+/);
  const n = (i: number, d = 0) => (a[i] === undefined ? d : Number(a[i]));
  switch (kind) {
    case "bow":
      return { front: bow(n(0), n(1), n(2, 2.4), a[3]) };
    case "flower":
      return { front: flower(n(0), n(1), n(2, 2.2), a[3], a[4]) };
    case "heart":
      return { front: heart(n(0), n(1), a[2]) };
    case "ribbon":
      return { front: ribbonTail(n(0), n(1), a[2]) };
    case "clip":
      return {
        front: `<rect x="${n(0) - 2.5}" y="${n(1) - 1}" width="5" height="2" fill="${a[2]}"/><rect x="${n(0) - 1.5}" y="${n(1) - 1}" width="1.4" height="0.8" fill="#ffffff"/>`,
      };
    case "feather":
      return {
        front: fill(
          `M${n(0)} ${n(1)}Q${n(0) + 12} ${n(1) - 12} ${n(0) + 18} ${n(1) - 6}Q${n(0) + 10} ${n(1) - 4} ${n(0) + 2} ${n(1) + 4}Z`,
          a[2],
        ),
      };
    case "headband":
      return { front: headband(a[0], n(1, 14)) };
    case "hat":
      return { front: hat(a[0], a[1], n(2, 12), n(3, 10), n(4, 24)) };
    case "crown":
      return {
        front:
          fill("M20 12L22 2L27 8L32 0L37 8L42 2L44 12Z", a[0]) +
          `<circle cx="32" cy="7" r="1.4" fill="#e8303a"/>`,
      };
    case "tiara":
      return {
        front:
          fill("M20 13Q32 6 44 13L42 15Q32 9 22 15Z", a[0]) +
          fill("M29 10L32 4L35 10Z", a[0]) +
          `<circle cx="32" cy="9" r="1.2" fill="#8af0ff"/>`,
      };
    case "ears":
      return {
        front:
          fill("M14 12L13 1L22 6Z", a[0] ?? p.b) +
          fill("M50 12L51 1L42 6Z", a[0] ?? p.b) +
          fill("M15 8L14 2L19 6Z", "#ffb0c8") +
          fill("M49 8L50 2L45 6Z", "#ffb0c8"),
      };
    case "flowercrown":
      return {
        front: [14, 22, 32, 42, 50]
          .map((x, i) =>
            flower(x, i % 2 ? 6 : 9, 1.8, i % 2 ? "#ffffff" : a[0]),
          )
          .join(""),
      };
    // Buns high on the head sit in front of the hair cap so they show.
    case "topbun":
      return { front: topBun(Math.max(7, n(0, 3) + 4), n(1, 7.4))(p) };
    case "buns": {
      const art = buns(n(0, 8), n(1, 7), n(2, 18))(p);
      return n(0, 8) < 20 ? { front: art } : { back: art };
    }
    case "pony": {
      const side = n(0, 1) < 0 ? -1 : 1;
      return { back: pony(side, n(1, 60))(p) };
    }
    case "pigtails":
      return { back: pigtails(n(0, 60), n(1) === 1, n(2, 6))(p) };
    case "braid": {
      const d = n(0, 1) < 0 ? -1 : 1;
      return {
        back: beads(
          32 + d * 18,
          30,
          32 + d * 22,
          50,
          32 + d * 16,
          70,
          8,
          2.6,
          p.b,
          p.m,
        ),
      };
    }
    case "streaks": {
      // Coloured locks through the fringe, and down the back on long hair.
      const colors = a[0].split(",");
      const front = colors
        .map((c, i) => line(`M${20 + i * 9} 4Q${18 + i * 9} 14 ${15 + i * 9} 24`, c, 2.2))
        .join("");
      return { back: streaks(colors, n(1, 66))(p), front };
    }
    case "shades":
      return {
        front: `<rect x="20" y="9" width="10" height="5" rx="2" fill="${a[0]}"/><rect x="34" y="9" width="10" height="5" rx="2" fill="${a[0]}"/><path d="M30 11H34" stroke="${a[0]}" stroke-width="1.2"/>`,
      };
    case "visor":
      return {
        front: fill("M12 18Q32 6 52 18L54 22Q32 12 10 22Z", a[0]),
      };
    case "cap":
      return {
        front:
          fill("M12 20Q12 2 32 2Q52 2 52 20Z", a[0]) +
          fill("M10 20H40L42 24H8Z", shade(a[0], -0.2)) +
          heart(36, 10, "#ffe14a"),
      };
    case "beanie":
      return {
        front:
          fill("M11 22Q10 0 32 0Q54 0 53 22Z", a[0]) +
          `<rect x="10" y="18" width="44" height="6" rx="2" fill="${shade(a[0], -0.15)}"/>` +
          line("M18 4V18M26 1V18M38 1V18M46 4V18", shade(a[0], -0.2)) +
          `<circle cx="32" cy="2" r="3" fill="${a[0]}"/>`,
      };
    case "cathat":
      return {
        front:
          fill("M10 28Q8 2 32 2Q56 2 54 28L52 30Q32 18 12 30Z", a[0]) +
          fill("M13 10L12 0L24 4Z", a[0]) +
          fill("M51 10L52 0L40 4Z", a[0]) +
          `<rect x="24" y="12" width="3" height="3" fill="#26262e"/><rect x="37" y="12" width="3" height="3" fill="#26262e"/>` +
          fill("M31 17H33L32 19Z", "#ff8ab8") +
          line("M18 18H26M38 18H46", shade(a[0], -0.4)),
      };
    case "jester":
      return {
        front:
          fill("M12 22Q12 6 32 6Q52 6 52 22Z", a[0]) +
          fill("M14 12Q4 6 6 1Q16 4 24 8Z", a[1]) +
          fill("M50 12Q60 6 58 1Q48 4 40 8Z", a[0]) +
          fill("M28 8Q32 0 40 1Q36 4 36 8Z", a[1]) +
          `<circle cx="6" cy="2" r="2" fill="#ffd84d"/><circle cx="58" cy="2" r="2" fill="#ffd84d"/><circle cx="40" cy="2" r="2" fill="#ffd84d"/>`,
      };
    case "bag":
      return {
        front:
          `<rect x="10" y="1" width="44" height="42" fill="${a[0]}"/>` +
          `<rect x="10" y="1" width="44" height="3" fill="${shade(a[0], -0.25)}"/>` +
          `<circle cx="24" cy="22" r="4" fill="#ffffff"/><circle cx="40" cy="22" r="4" fill="#ffffff"/>` +
          line("M26 32Q32 34 38 32", "#6a3a1a", 1.6),
      };
    case "bucket":
      return {
        front:
          fill("M12 18Q12 2 32 2Q52 2 52 18Z", a[0]) +
          `<ellipse cx="32" cy="19" rx="24" ry="4" fill="${a[0]}"/>` +
          `<g fill="${a[1]}"><circle cx="22" cy="9" r="1.6"/><circle cx="34" cy="6" r="1.6"/><circle cx="44" cy="11" r="1.6"/><circle cx="28" cy="14" r="1.4"/><circle cx="18" cy="17" r="1.2"/><circle cx="46" cy="18" r="1.2"/></g>`,
      };
    case "beret":
      return {
        front:
          `<ellipse cx="34" cy="10" rx="20" ry="8" fill="${a[0]}"/>` +
          `<rect x="14" y="13" width="36" height="3" rx="1.5" fill="${shade(a[0], -0.25)}"/>` +
          `<rect x="33" y="1" width="2" height="2" fill="${a[0]}"/>`,
      };
    case "tophat":
      return {
        front:
          `<rect x="${n(2, 44) - 5}" y="${n(3, 6) - 8}" width="10" height="8" fill="${a[0]}"/>` +
          `<rect x="${n(2, 44) - 8}" y="${n(3, 6)}" width="16" height="2" fill="${a[0]}"/>` +
          `<rect x="${n(2, 44) - 5}" y="${n(3, 6) - 3}" width="10" height="2" fill="${a[1]}"/>`,
      };
    case "halo":
      return {
        front: `<ellipse cx="32" cy="3" rx="12" ry="2.6" fill="none" stroke="${a[0]}" stroke-width="2"/>`,
      };
    case "cowboy":
      return {
        front:
          `<ellipse cx="32" cy="16" rx="27" ry="4.4" fill="${a[0]}"/>` +
          fill("M18 16Q18 2 26 4Q32 7 38 4Q46 2 46 16Z", a[0]) +
          `<rect x="18" y="12" width="28" height="2.4" fill="${a[1]}"/>` +
          fill("M32 6L33.2 8.4L36 8.6L34 10.4L34.6 13L32 11.6L29.4 13L30 10.4L28 8.6L30.8 8.4Z", a[1]),
      };
    case "helmet":
      return {
        front:
          fill("M9 28Q8 2 32 2Q56 2 55 28L50 26Q48 12 32 11Q16 12 14 26Z", a[0]) +
          line("M14 8Q32 0 50 8", shade(a[0], 0.4), 1.6) +
          `<rect x="9" y="24" width="6" height="8" rx="2" fill="${shade(a[0], -0.2)}"/><rect x="49" y="24" width="6" height="8" rx="2" fill="${shade(a[0], -0.2)}"/>`,
      };
    case "goggles":
      return {
        front: `<rect x="17" y="6" width="12" height="7" rx="3" fill="${a[0]}" stroke="#26262e" stroke-width="1"/><rect x="35" y="6" width="12" height="7" rx="3" fill="${a[0]}" stroke="#26262e" stroke-width="1"/>`,
      };
    case "hood": {
      const c = a[0];
      const ears =
        a[1] === "bunny"
          ? fill("M20 6Q16 -2 20 0Q26 2 26 8Z", c) + fill("M44 6Q48 -2 44 0Q38 2 38 8Z", c)
          : a[1] === "chick"
            ? fill("M30 4Q32 -2 34 4Z", "#f2902a") + `<path d="M29 18L32 22L35 18Z" fill="#f2902a"/><rect x="24" y="12" width="3" height="3" fill="#26262e"/><rect x="37" y="12" width="3" height="3" fill="#26262e"/>`
            : `<circle cx="15" cy="7" r="5" fill="${c}"/><circle cx="49" cy="7" r="5" fill="${c}"/><circle cx="15" cy="7" r="2.4" fill="#ffb0c8"/><circle cx="49" cy="7" r="2.4" fill="#ffb0c8"/>`;
      return {
        front:
          fill("M9 30Q7 3 32 3Q57 3 55 30L51 28Q50 13 32 12Q14 13 13 28Z", c) +
          ears,
      };
    }
    case "horn":
      return {
        front:
          fill("M29 10L32 -0.5L35 10Z", a[0]) +
          line("M30 7L34 6M30.6 3.6L33.4 3", "#ffffff"),
      };
    case "furhat":
      return {
        front:
          fill("M10 22Q8 2 32 2Q56 2 54 22Z", a[0]) +
          line("M14 8L16 4M22 6L23 2M30 5L30 1M38 5L39 1M46 7L48 3", shade(a[0], -0.3)) +
          `<rect x="48" y="16" width="6" height="22" rx="3" fill="${a[0]}"/>` +
          line("M48 22H54M48 28H54M48 34H54", "#3a2a1a", 1.4),
      };
    case "mask":
      return {
        front:
          `<rect x="14" y="10" width="36" height="9" rx="4" fill="${a[0]}" stroke="#26262e" stroke-width="1"/>` +
          `<rect x="17" y="12" width="30" height="5" rx="2.4" fill="#bff0ff"/>` +
          `<rect x="50" y="2" width="3" height="20" rx="1.5" fill="#ffd84d"/><circle cx="51.5" cy="1.5" r="1.5" fill="#bff0ff"/>`,
      };
    case "santa":
      return {
        front:
          fill("M11 20Q10 2 32 3Q48 3 56 14L60 26L54 16Q48 8 52 20Z", a[0]) +
          `<rect x="9" y="17" width="44" height="5" rx="2.5" fill="#ffffff"/>` +
          `<circle cx="59" cy="26" r="3" fill="#ffffff"/>`,
      };
    case "witch":
      return {
        front:
          `<ellipse cx="32" cy="15" rx="28" ry="4.6" fill="${a[0]}"/>` +
          fill("M18 15L34 0L50 6L46 8L46 15Z", a[0]) +
          `<rect x="18" y="11" width="28" height="3" fill="${a[1]}"/>`,
      };
    case "fan":
      return {
        back: a[0]
          .split(",")
          .map((c, i, all) => {
            const t = (i + 0.5) / all.length;
            const ang = Math.PI * (1 + t);
            const x = 32 + Math.cos(ang) * 30;
            const y = 30 + Math.sin(ang) * 30;
            return (
              line(`M32 30L${r(x)} ${r(y)}`, "#3a8a2a", 1.4) +
              `<ellipse cx="${r(x)}" cy="${r(Math.max(4, y))}" rx="5" ry="6" fill="${c}"/>` +
              `<circle cx="${r(x)}" cy="${r(Math.max(4, y))}" r="2" fill="#2a5ad8"/>`
            );
          })
          .join(""),
      };
    case "earmuffs":
      return {
        front:
          line("M10 30Q10 4 32 4Q54 4 54 30", "#9a9aa6", 2) +
          `<circle cx="10" cy="32" r="5.4" fill="${a[0]}"/><circle cx="54" cy="32" r="5.4" fill="${a[0]}"/>`,
      };
    case "bunnyears":
      return {
        front:
          fill("M20 10Q14 0 18 0Q24 0 26 8Z", a[0]) +
          fill("M44 10Q50 0 46 0Q40 0 38 8Z", a[0]) +
          fill("M20 8Q17 2 19 2Q22 2 24 7Z", "#ffb0c8") +
          fill("M44 8Q47 2 45 2Q42 2 40 7Z", "#ffb0c8"),
      };
    case "monster":
      return {
        front:
          fill("M9 26Q6 1 32 1Q58 1 55 26L50 24Q48 12 32 11Q16 12 14 24Z", a[0]) +
          line("M12 6L10 1M20 3L19 0M44 3L45 0M52 6L54 1", a[0], 2) +
          `<circle cx="22" cy="7" r="3.4" fill="#ffffff"/><circle cx="42" cy="7" r="3.4" fill="#ffffff"/><circle cx="22" cy="7" r="1.6" fill="#26262e"/><circle cx="42" cy="7" r="1.6" fill="#26262e"/>`,
      };
    case "pumpkinhead":
      return {
        front:
          `<ellipse cx="32" cy="24" rx="23" ry="21" fill="#f2902a"/>` +
          line("M24 6Q22 24 24 44M40 6Q42 24 40 44M32 4V45", "#c8681a") +
          `<rect x="30.5" y="0" width="3" height="5" fill="#3a8a2a"/>` +
          fill("M20 20L26 20L23 15Z", "#3a2a1a") +
          fill("M38 20L44 20L41 15Z", "#3a2a1a") +
          fill("M21 30H43L40 36L36 33L32 37L28 33L24 36Z", "#3a2a1a"),
      };
    case "skullhead":
      return {
        front:
          `<ellipse cx="32" cy="22" rx="22" ry="20" fill="#f4f4f0"/>` +
          `<rect x="24" y="36" width="16" height="8" rx="2" fill="#f4f4f0"/>` +
          `<ellipse cx="24" cy="24" rx="5" ry="6" fill="#26262e"/><ellipse cx="40" cy="24" rx="5" ry="6" fill="#26262e"/>` +
          fill("M32 30L30 34H34Z", "#26262e") +
          line("M28 38V44M32 38V44M36 38V44", "#9a9aa6"),
      };
    case "jar":
      return {
        front:
          `<rect x="12" y="2" width="40" height="30" rx="8" fill="#bfe8f8" opacity="1"/>` +
          `<rect x="12" y="2" width="40" height="6" rx="3" fill="#e8303a"/>` +
          `<path d="M18 22Q24 12 32 18Q40 12 46 22Q40 28 32 24Q24 28 18 22Z" fill="#ff8ab8"/>` +
          line("M22 20Q26 16 30 20M34 20Q38 16 42 20", "#d84a7a") +
          `<rect x="16" y="10" width="3" height="16" fill="#ffffff"/>`,
      };
    case "pineapple":
      return {
        front:
          `<ellipse cx="32" cy="22" rx="22" ry="18" fill="#f2c840"/>` +
          line("M14 14L50 34M14 30L50 10M22 6L46 38M42 6L18 38", "#c89a20") +
          fill("M24 6L20 -0.5L28 4L32 0L36 4L44 -0.5L40 6Z", "#3ac83a"),
      };
    case "globe":
      return {
        front:
          `<circle cx="32" cy="24" r="22" fill="#2a6ad8"/>` +
          fill("M18 12Q26 8 30 14Q28 22 20 22Q14 18 18 12Z", "#3ac83a") +
          fill("M36 26Q46 22 48 32Q42 40 36 36Z", "#3ac83a") +
          `<circle cx="32" cy="24" r="22" fill="none" stroke="#f2c040" stroke-width="2"/>`,
      };
    case "glasses":
      return {
        front: `<circle cx="25.6" cy="31" r="6" fill="none" stroke="${a[0]}" stroke-width="1.4"/><circle cx="38.4" cy="31" r="6" fill="none" stroke="${a[0]}" stroke-width="1.4"/><path d="M31.6 31H32.4" stroke="${a[0]}" stroke-width="1.4"/>`,
      };
    case "turkeyhat":
      return {
        front:
          [0, 1, 2, 3, 4]
            .map((i) => `<ellipse cx="${20 + i * 6}" cy="${6 - Math.abs(i - 2)}" rx="3.4" ry="6" fill="${["#e8303a", "#f2902a", "#ffd84d", "#f2902a", "#e8303a"][i]}"/>`)
            .join("") +
          `<ellipse cx="32" cy="14" rx="18" ry="8" fill="#a8642a"/>` +
          `<circle cx="20" cy="10" r="3.4" fill="#a8642a"/><rect x="18" y="9" width="1.6" height="1.6" fill="#26262e"/>` +
          fill("M15 11L12 12L15 13Z", "#f2c040"),
      };
    case "icecream":
      return {
        front:
          fill("M10 26Q8 4 32 4Q56 4 54 26Q50 22 46 28Q42 22 38 28Q34 22 30 28Q26 22 22 28Q18 22 14 28Z", "#ffb0c8") +
          fill("M27 7L32 0L37 7Z", "#e8a85a") +
          line("M29 4L35 3", "#b8783a"),
      };
    default:
      throw new Error(`hair add-on "${kind}" is unknown`);
  }
}

for (const row of NM_HAIRS) {
  const parts = (row.add ?? []).map((token) => (p: Pal) => addOn(token, p));
  HAIRS.push(
    make({
      length: ROW_LENGTHS[row.len],
      edge: ROW_EDGES[row.edge],
      strands:
        row.edge === "centre"
          ? "centre"
          : row.edge === "spiky" || row.edge === "wispy"
            ? "none"
            : "sweep",
      mirror: row.mirror,
      back: (p) => parts.map((part) => part(p).back ?? "").join(""),
      front: (p) => parts.map((part) => part(p).front ?? "").join(""),
    }),
  );
  BASES.push(row.color);
}

if (HAIRS.length !== HAIR_KIT.length || BASES.length !== HAIR_KIT.length)
  throw new Error("hair kit: one drawing and one colour per kit entry");

await renderAll(
  HAIR_KIT.flatMap((entry, i) => {
    const nn = entry.id.slice(4);
    const hair = HAIRS[i](pal(BASES[i]));
    return [
      { name: `hair-kit-${nn}-back`, svg: hair.back },
      { name: `hair-kit-${nn}-front`, svg: hair.front },
    ];
  }),
);
console.log(`hair kit: ${HAIR_KIT.length * 2} sprites written`);
