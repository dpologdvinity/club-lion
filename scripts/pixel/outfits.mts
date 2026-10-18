/**
 * Outfit sprites: full Fantage-style dresses and sets drawn on the doll's
 * 64×96 grid from the recipes in src/components/avatar/pixelOutfits.ts.
 * Run: node --experimental-strip-types scripts/pixel/outfits.mts
 */
import { renderAll, shade } from "./sprites.mts";
import {
  OUTFITS,
  type OutfitRecipe,
  type Pattern,
} from "../../src/components/avatar/pixelOutfits.ts";

const TORSO = "M25 49Q32 46 39 49L40 61H24Z";

/** Lower-part outline for each cut (waist at y 60). */
const LOWER: Record<string, string> = {
  mini: "M24 59H40L43.5 70Q32 72 20.5 70Z",
  skirt: "M24 59H40L45 77Q32 79.5 19 77Z",
  tiers: "M24 59H40L46 78Q32 80.5 18 78Z",
  tutu: "M24 59H40L47 66Q48 70 44 70Q42 72 38 70.5Q35 72.5 32 71Q29 72.5 26 70.5Q22 72 20 70Q16 70 17 66Z",
  gown: "M24 59H40L49 88Q32 91 15 88Z",
  mermaid: "M24 59H40L41 76Q41 82 46 89Q32 91.5 18 89Q23 82 23 76Z",
  shorts: "M24 59H40L40.6 69H33L32 65L31 69H23.4Z",
  pants: "M24 59H40L40.8 85H33.4L32 67L30.6 85H23.2Z",
  briefs: "M24 58H40L40.4 62.5L34.5 66H29.5L23.6 62.5Z",
  swimskirt: "M24 58H40L43 65Q32 67 21 65Z",
};

/** Hem line height for cuts that take a lace or ruffle trim. */
const LOWER_HEM: Record<string, number> = {
  mini: 70.6,
  skirt: 77.8,
  tiers: 78.8,
  tutu: 70.8,
  gown: 88.8,
  mermaid: 89.4,
  swimskirt: 65.8,
};

let clipId = 0;

/** Pattern pixels clipped to a shape. */
function patterned(
  shape: string,
  pattern: Pattern | undefined,
  base: string,
  accent: string,
): string {
  if (!pattern) return "";
  const id = `c${clipId++}`;
  const marks: string[] = [];
  const dark = shade(base, -0.25);
  for (let y = 44; y < 92; y++)
    for (let x = 14; x < 50; x++) {
      const on =
        pattern === "dots"
          ? x % 4 === 1 && y % 4 === 1 && ((x + y) / 4) % 2 < 1
          : pattern === "stripes"
            ? y % 4 < 2
            : pattern === "diagonal"
              ? (x + y) % 6 < 2
              : pattern === "sparkle"
                ? (x * 7 + y * 13) % 17 === 0
                : pattern === "plaid"
                  ? x % 5 === 0 || y % 5 === 0
                  : pattern === "checks"
                    ? (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0
                    : pattern === "zebra"
                      ? (y + Math.round(Math.sin(x / 2) * 1.5)) % 5 < 2
                      : pattern === "flowers"
                        ? (x * 3 + y * 5) % 23 === 0
                        : pattern === "leaves"
                          ? (x * 5 + y * 3) % 19 === 0
                          : false;
      if (on) {
        const fill =
          pattern === "plaid" && (x % 5 === 0) !== (y % 5 === 0)
            ? dark
            : accent;
        marks.push(
          `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`,
        );
        if (pattern === "flowers")
          marks.push(
            `<rect x="${x - 1}" y="${y}" width="3" height="1" fill="${accent}"/><rect x="${x}" y="${y - 1}" width="1" height="3" fill="${accent}"/><rect x="${x}" y="${y}" width="1" height="1" fill="#ffe06a"/>`,
          );
        if (pattern === "leaves")
          marks.push(
            `<rect x="${x}" y="${y}" width="2" height="2" fill="${accent}"/>`,
          );
      }
    }
  if (pattern === "ombre")
    marks.push(
      `<rect x="14" y="44" width="36" height="7" fill="${base}"/>`,
      `<rect x="14" y="51" width="36" height="5" fill="${shade(base, 0.25)}"/>`,
      `<rect x="14" y="56" width="36" height="40" fill="${accent}"/>`,
    );
  if (pattern === "rainbow")
    ["#ff5a5f", "#ff9f43", "#ffd84d", "#4cc97a", "#4aa8ff", "#a77bff"].forEach(
      (c, i) =>
        marks.push(
          `<rect x="14" y="${50 + i * 2}" width="36" height="1.4" fill="${c}"/>`,
        ),
    );
  return `<clipPath id="${id}"><path d="${shape}"/></clipPath><g clip-path="url(#${id})">${marks.join("")}</g>`;
}

function sleeves(r: OutfitRecipe): string {
  const f = r.sleeves ?? r.top;
  switch (r.bodice) {
    case "tee":
      return `<path d="M25 49L22 51.4L21.4 57L24.6 57.4L25.2 53Z" fill="${f}"/><path d="M39 49L42 51.4L42.6 57L39.4 57.4L38.8 53Z" fill="${f}"/>`;
    case "puff":
      return `<circle cx="23.6" cy="51.8" r="3.4" fill="${f}"/><circle cx="40.4" cy="51.8" r="3.4" fill="${f}"/>`;
    case "long":
    case "vest":
      return `<path d="M25 49L22.2 52.2L21.4 63.4L24.6 63.6L25.4 55Z" fill="${f}"/><path d="M39 49L41.8 52.2L42.6 63.4L39.4 63.6L38.6 55Z" fill="${f}"/>`;
    case "offshoulder":
      return `<path d="M23.4 52L21.6 55L21.2 62L24.4 62.4L25 57Z" fill="${f}"/><path d="M40.6 52L42.4 55L42.8 62L39.6 62.4L39 57Z" fill="${f}"/>`;
    default:
      return "";
  }
}

function bodice(r: OutfitRecipe): string {
  const f = r.top;
  const shapes: Record<string, string> = {
    tee: TORSO,
    puff: TORSO,
    long: TORSO,
    vest: TORSO,
    tank: "M25 51Q32 49 39 51L40 61H24Z",
    halter: "M25 51Q32 49 39 51L40 61H24Z",
    tube: "M24.6 53H39.4L40 61H24Z",
    offshoulder: "M23 52Q32 50.5 41 52L40 61H24Z",
    bikini:
      "M24.8 51.5Q28 50.6 31.4 51.8L31 55.4H24.6ZM32.6 51.8Q36 50.6 39.2 51.5L39.4 55.4H33Z",
  };
  const shape = shapes[r.bodice];
  const parts = [
    `<path d="${shape}" fill="${f}"/>`,
    patterned(shape, r.topPattern, f, r.accent ?? "#ffffff"),
  ];
  if (r.bodice === "tank" || r.bodice === "bikini")
    parts.push(
      `<path d="M27 51V48M37 51V48" stroke="${f}" stroke-width="1.6"/>`,
    );
  if (r.bodice === "halter")
    parts.push(
      `<path d="M27 51L31 46H33L37 51" fill="none" stroke="${f}" stroke-width="1.6"/>`,
    );
  if (r.bodice === "vest" && r.accent)
    parts.push(`<path d="M30 47.6H34L34.4 61H29.6Z" fill="${r.accent}"/>`);
  if (r.bodice === "offshoulder")
    parts.push(
      `<path d="M23 52Q32 50.5 41 52V53.4Q32 52 23 53.4Z" fill="${shade(f, 0.3)}"/>`,
    );
  return parts.join("") + sleeves(r);
}

function lower(r: OutfitRecipe): string {
  if (r.lower === "none") return "";
  const f = r.bottom ?? r.top;
  const shape = LOWER[r.lower];
  const parts = [
    `<path d="${shape}" fill="${f}"/>`,
    patterned(shape, r.bottomPattern, f, r.accent ?? "#ffffff"),
  ];
  const dark = shade(f, -0.22);
  if (r.lower === "tiers")
    parts.push(
      `<path d="M22 66Q32 68 42 66M20 72Q32 74.4 44 72" fill="none" stroke="${r.trim ?? dark}" stroke-width="1.6"/>`,
    );
  if (r.lower === "skirt" || r.lower === "gown")
    parts.push(
      `<path d="M28 63L26 ${r.lower === "gown" ? 87 : 77}M32 63V${r.lower === "gown" ? 89 : 78}M36 63L38 ${r.lower === "gown" ? 87 : 77}" stroke="${dark}" stroke-width="1"/>`,
    );
  if (r.lower === "tutu")
    parts.push(
      `<path d="M20 67Q32 69 44 67" fill="none" stroke="${shade(f, 0.35)}" stroke-width="1.4"/>`,
    );
  if (r.trim && LOWER_HEM[r.lower]) {
    const y = LOWER_HEM[r.lower];
    const id = `c${clipId++}`;
    parts.push(
      `<clipPath id="${id}"><path d="${shape}"/></clipPath><path clip-path="url(#${id})" d="M15 ${y - 1}Q32 ${y + 1.6} 49 ${y - 1}" fill="none" stroke="${r.trim}" stroke-width="2.4" stroke-dasharray="2 1"/>`,
    );
  }
  return parts.join("");
}

function trims(r: OutfitRecipe): string {
  const parts: string[] = [];
  if (r.belt)
    parts.push(
      `<rect x="24" y="58.4" width="16" height="2.4" fill="${r.belt}"/><rect x="30.6" y="58" width="2.8" height="3.2" fill="${shade(r.belt, 0.4)}"/>`,
    );
  if (r.fur)
    parts.push(
      `<path d="M23.6 52.6Q32 51 40.4 52.6" fill="none" stroke="#ffffff" stroke-width="2.4"/>`,
      r.lower !== "none"
        ? `<path d="M19.6 70Q32 72.4 44.4 70" fill="none" stroke="#ffffff" stroke-width="2.2"/>`
        : "",
    );
  if (r.collar)
    parts.push(
      `<path d="M27 47.4L32 52L37 47.4L35 47Q32 49.4 29 47Z" fill="${r.collar}"/>`,
    );
  if (r.tie)
    parts.push(
      `<path d="M31.2 50H32.8L33.6 58L32 59.6L30.4 58Z" fill="${r.tie}"/>`,
    );
  if (r.bow)
    parts.push(
      `<path d="M32 55L27.6 52.6V57.4ZM32 55L36.4 52.6V57.4Z" fill="${r.bow}"/><rect x="31" y="54" width="2" height="2" fill="${shade(r.bow, -0.2)}"/>`,
    );
  if (r.flower)
    parts.push(
      `<g fill="${r.flower}"><rect x="35" y="51" width="3" height="1"/><rect x="36" y="50" width="1" height="3"/></g><rect x="36" y="51" width="1" height="1" fill="#ffffff"/>`,
    );
  return parts.join("");
}

function outfit(r: OutfitRecipe): string {
  clipId = 0;
  return lower(r) + bodice(r) + trims(r);
}

await renderAll(
  Object.entries(OUTFITS).map(([id, recipe]) => ({
    name: `outfit-${id}`,
    svg: outfit(recipe),
    shading: true as const,
  })),
);
console.log(`${Object.keys(OUTFITS).length} outfit sprites written`);
