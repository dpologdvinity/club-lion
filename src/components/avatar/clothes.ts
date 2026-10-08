import type { AvatarLook } from "../../types/world.ts";
import {
  OUTFIT_PRESETS,
  resolveBottomId,
  resolveShoeId,
  resolveTopId,
  type BottomId,
  type ShoeId,
  type TopId,
} from "../../types/avatarOptions.ts";
import {
  LEFT_ARM_HIP,
  MIRROR,
  RIGHT_ARM_DOWN,
  handMarkup,
  n,
  resolveSkinTone,
  sleeve,
  type SleeveSpec,
} from "./shared.ts";

/** Class-safe form of a registry ID (`flares_indigo` → `flares-indigo`). */
function dashed(id: string): string {
  return id.replace(/_/g, "-");
}

/* -------------------------------------------------------------
 * Layer 4: Footwear (Anchor_Feet at 60, 142) — chunky snap-on platforms
 * Each shoe is drawn on the viewer-left foot and mirrored to the right.
 * ------------------------------------------------------------- */
const FOOT =
  "M51.8 129 L56.6 129 C57.8 132.4 59.6 135.4 60 139.2 L48 139.2 C48.6 135.4 50.6 132.4 51.8 129 Z";

/** Sparkle specks for glitter finishes. */
function glitter(points: readonly (readonly [number, number])[]): string {
  return points
    .map(
      ([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 0.55 : 0.35}" fill="#ffffff" opacity="${i % 2 ? 0.95 : 0.6}" />`,
    )
    .join("");
}

function platformSole(color: string, stripe?: string, height = 6.6): string {
  const treads = [48, 51, 54, 57]
    .map(
      (tx) =>
        `<rect x="${tx}" y="${n(139 + height - 1.2)}" width="1.6" height="1.2" rx="0.4" fill="rgba(0,0,0,0.35)" />`,
    )
    .join("");
  return (
    `<rect x="46.4" y="139" width="15.2" height="${height}" rx="2.2" fill="${color}" stroke="rgba(60,30,50,0.22)" stroke-width="0.4" />` +
    `<path d="M47.2 140.2 L60.8 140.2" stroke="rgba(255,255,255,0.4)" stroke-width="0.6" stroke-linecap="round" />` +
    (stripe
      ? `<rect x="46.6" y="${n(139 + height * 0.42)}" width="14.8" height="1.2" fill="${stripe}" />`
      : "") +
    treads
  );
}

const SHOE_ART: Record<ShoeId, (skin: string) => string> = {
  canvas_sneakers: () =>
    `<path d="M48.4 132 C48.4 128.6 51 127.2 54 127.2 C57 127.2 59.6 128.6 59.6 132 L60 139.4 L48 139.4 Z" fill="#fff6fb" stroke="rgba(80,40,60,0.2)" stroke-width="0.5" />` +
    `<path d="M48.2 135.2 C50.4 133.2 57.6 133.2 59.8 135.2 L60 139.4 L48 139.4 Z" fill="#ff5fa2" />` +
    `<path d="M51.4 129.6 L56.6 129.6 M51.2 131.4 L56.8 131.4" stroke="#ff5fa2" stroke-width="0.6" stroke-linecap="round" />` +
    platformSole("#ffffff", "#ff9fcb"),
  jelly_sandals: (skin) =>
    `<path d="${FOOT}" fill="${skin}" />` +
    `<path d="M50.2 138.6 Q51.6 137.6 53 138.6 M53.4 138.8 Q54.8 137.8 56.2 138.8" stroke="#ff8fbf" stroke-width="0.7" fill="none" />` +
    `<path d="M51.2 130.6 Q54.2 132 57.2 130.6" stroke="rgba(255,110,185,0.8)" stroke-width="1.3" stroke-linecap="round" fill="none" />` +
    `<path d="M49.6 135.6 L58.6 132.6 M49.2 132.8 L58.8 136" stroke="rgba(255,110,185,0.75)" stroke-width="1.6" stroke-linecap="round" />` +
    `<path d="M48.6 138.4 Q54 136.6 59.4 138.4" stroke="rgba(255,110,185,0.8)" stroke-width="1.4" fill="none" />` +
    `<rect x="47" y="139" width="14" height="5.4" rx="2" fill="rgba(255,140,200,0.78)" />` +
    `<path d="M48.4 140.4 L59.6 140.4" stroke="rgba(255,255,255,0.7)" stroke-width="0.7" stroke-linecap="round" />`,
  platform_mary_janes: () =>
    `<path d="M51.2 123.6 L57 123.6 L57.6 131 L50.8 131 Z" fill="#ffffff" />` +
    `<path d="M50.8 124 q0.7 -1.4 1.45 0 q0.7 -1.4 1.45 0 q0.7 -1.4 1.45 0 q0.7 -1.4 1.45 0" stroke="#f6c8dc" stroke-width="0.7" fill="none" />` +
    `<path d="M48.4 132.6 C48.4 129.6 51 128.4 54 128.4 C57 128.4 59.6 129.6 59.6 132.6 L60 139.4 L48 139.4 Z" fill="#1c1620" />` +
    `<path d="M50 133.8 Q51.6 131 54.6 130.6" stroke="rgba(255,255,255,0.45)" stroke-width="0.9" stroke-linecap="round" fill="none" />` +
    `<path d="M49 131.4 L59 131.4" stroke="#ff5fa2" stroke-width="1.3" stroke-linecap="round" />` +
    `<circle cx="57.6" cy="131.4" r="0.8" fill="#f4c542" />` +
    platformSole("#16121a", "#ff5fa2"),
  skate_shoes: () =>
    `<path d="M51.6 127.4 Q54 124 56.4 127.4 Z" fill="#3a3f4a" />` +
    `<path d="M47.6 133 C47 128.6 50.4 126.8 54 126.8 C57.6 126.8 61 128.6 60.4 133 L60.8 139.6 L47.2 139.6 Z" fill="#c9ced8" stroke="rgba(30,30,40,0.3)" stroke-width="0.5" />` +
    `<path d="M47.4 135.4 C50 133.6 58 133.6 60.6 135.4 L60.8 139.6 L47.2 139.6 Z" fill="#3a3f4a" />` +
    `<path d="M48.6 133.6 Q53 131 58.4 134.4" stroke="#4aa3ff" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
    `<path d="M51.6 129 L56.4 129 M51.4 130.8 L56.6 130.8" stroke="#ffffff" stroke-width="0.7" stroke-linecap="round" />` +
    platformSole("#ffffff", "#9aa3b2", 6),
  platform_boots: () =>
    `<path d="M50.6 112 L57.8 112 C58 120 58.6 126 59.8 131 L60.2 139.6 L47.8 139.6 L48.2 131 C49.6 126 50.4 120 50.6 112 Z" fill="#1d1722" />` +
    `<path d="M52 114 C52 122 51.4 128 50.4 134" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" fill="none" />` +
    `<rect x="46.4" y="139" width="15.2" height="7" rx="2" fill="#0f0c12" />` +
    `<path d="M47 142.6 L61 142.6" stroke="rgba(255,255,255,0.18)" stroke-width="0.6" />` +
    `<rect x="50" y="112" width="8" height="1.6" rx="0.8" fill="#c9d1db" />`,
  strappy_heels: (skin) =>
    `<path d="${FOOT}" fill="${skin}" />` +
    `<path d="M51 130.4 L57.4 130.4" stroke="#b28cff" stroke-width="1.1" stroke-linecap="round" />` +
    `<path d="M50.2 133 L58.2 133 M49.2 135.8 L59 135.8" stroke="#b28cff" stroke-width="1.2" stroke-linecap="round" />` +
    `<circle cx="57.4" cy="130.4" r="0.7" fill="#f4c542" />` +
    `<rect x="47" y="138.8" width="14" height="6.8" rx="1.8" fill="#9b6fff" />` +
    `<path d="M48 140.2 L60 140.2" stroke="rgba(255,255,255,0.55)" stroke-width="0.7" stroke-linecap="round" />`,
  moon_boots: () => {
    const fluff = [117, 121, 125, 129, 133, 137]
      .map(
        (y, i) =>
          `<circle cx="${n(47.8 - i * 0.12)}" cy="${y}" r="1.2" fill="#fff5fb" />` +
          `<circle cx="${n(59.8 + i * 0.12)}" cy="${y}" r="1.2" fill="#fff5fb" />`,
      )
      .join("");
    return (
      `<path d="M48 117 L59.6 117 C60 124 60.4 132 60.6 139.6 L47 139.6 C47.2 132 47.6 124 48 117 Z" fill="#fff5fb" />` +
      fluff +
      `<path d="M50 121 Q51 128 50.4 136 M54 120 Q55 128 54.4 137 M58 121 Q58.6 128 58.2 136" stroke="rgba(220,150,190,0.35)" stroke-width="0.7" fill="none" />` +
      [48, 50.3, 52.6, 54.9, 57.2, 59.5]
        .map((x) => `<circle cx="${x}" cy="117" r="1.7" fill="#ffc4e1" />`)
        .join("") +
      `<circle cx="48.6" cy="114.8" r="1.6" fill="#ff8fc2" />` +
      platformSole("#e9e4ef", "#ffc4e1", 6)
    );
  },
  knee_boots: () =>
    `<path d="M50.4 110 L58 110 C58.2 118 58.8 125 59.8 131 L60.2 139.6 L47.8 139.6 L48.2 131 C49.6 124 50.2 118 50.4 110 Z" fill="#fbfbfd" stroke="rgba(40,30,60,0.18)" stroke-width="0.5" />` +
    `<path d="M51.8 112.4 C51.8 120 51.4 127 50.4 134" stroke="#d9dbe6" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
    `<path d="M52.4 113 C52.4 119 52 125 51.2 131" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" />` +
    `<rect x="50.2" y="110" width="8" height="1.6" rx="0.8" fill="#d9dbe6" />` +
    platformSole("#e6e8f0", "#c9cbd8"),
  cowgirl_boots: () =>
    `<path d="M49.8 116 L58.6 116 C58.8 122 59.2 127 60 131.6 L61 139.4 L47.6 139.4 L48.6 131.6 C49.4 127 49.6 122 49.8 116 Z" fill="#ff8fc2" />` +
    `<path d="M49.8 116 L52.2 118.4 L54.2 116.6 L56.2 118.4 L58.6 116 Z" fill="#e0609c" />` +
    `<path d="M51.6 121 q2.6 2 0 4.4 q-2.4 2.4 0.4 4.4 M56.6 121 q-2.6 2 0 4.4 q2.4 2.4 -0.4 4.4" stroke="#ffffff" stroke-width="0.5" stroke-dasharray="0.8 0.5" fill="none" />` +
    `<path d="M54.2 131.6 l0.6 1.2 1.3 0.2 -0.95 0.9 0.25 1.3 -1.2 -0.6 -1.2 0.6 0.25 -1.3 -0.95 -0.9 1.3 -0.2 Z" fill="#f4c542" />` +
    `<rect x="47" y="139" width="14.6" height="5.6" rx="1.4" fill="#8a4a2a" />` +
    `<path d="M47.6 140.4 L61 140.4" stroke="rgba(255,255,255,0.25)" stroke-width="0.6" />`,
  glitter_heels: (skin) =>
    `<path d="${FOOT}" fill="${skin}" />` +
    `<path d="M48.4 134 C49.4 132.2 51.6 131.4 54 131.4 C56.4 131.4 58.6 132.2 59.6 134 L60 139.4 L48 139.4 Z" fill="#d8dbe6" />` +
    `<path d="M48.4 134 C49.4 132.2 51.6 131.4 54 131.4 C56.4 131.4 58.6 132.2 59.6 134" stroke="#b9bccb" stroke-width="0.6" fill="none" />` +
    glitter([
      [50, 135.2],
      [52.2, 133.6],
      [54.6, 135.8],
      [57, 134],
      [58.6, 137],
      [51.2, 137.8],
      [55.6, 138.2],
    ]) +
    `<rect x="46.8" y="139" width="14.4" height="6.4" rx="1.8" fill="#c3c7d6" />` +
    glitter([
      [48.6, 141],
      [51.4, 143.6],
      [54.2, 141.4],
      [57.2, 143.4],
      [59.8, 141.2],
    ]),
};

export function renderLayer4Footwear(look: AvatarLook): string {
  const shoesId = resolveShoeId(look);
  const shoe = SHOE_ART[shoesId](resolveSkinTone(look.skinTone));
  return (
    `<g class="avatar-footwear footwear-${dashed(shoesId)}">` +
    `<g class="shoe-left">${shoe}</g>` +
    `<g class="shoe-right" ${MIRROR}>${shoe}</g>` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 5: Outfit — a bottom, then a top, then the hand on the hip
 * (Waist at 60, 98, Neck at 60, 68)
 * ------------------------------------------------------------- */
const FLARES =
  "M49.2 98.6 L70.8 98.6 C71.4 108 70.4 118 70.6 126 C71 132 73.6 137 75.6 141 L64.6 141 C64.4 134 63.2 126 62.6 118 L61.2 104.6 L58.8 104.6 L57.4 118 C56.8 126 55.6 134 55.4 141 L44.4 141 C46.4 137 49 132 49.4 126 C49.6 118 48.6 108 49.2 98.6 Z";

const STRAIGHT_LEG =
  "M49.2 98.6 L70.8 98.6 C71.4 110 70.6 124 71.4 140.8 L62.8 140.8 C62.4 128 61.6 116 61 104.8 L59 104.8 C58.4 116 57.6 128 57.2 140.8 L48.6 140.8 C49.4 124 48.6 110 49.2 98.6 Z";

function flares(color: string, seam: string): string {
  return (
    `<path d="${FLARES}" fill="${color}" />` +
    `<path d="M53.4 104 L52.8 124 C52.6 130 50 136 48 141 M66.6 104 L67.2 124 C67.4 130 70 136 72 141" stroke="${seam}" stroke-width="0.5" stroke-dasharray="1 0.8" fill="none" />` +
    `<path d="M50.4 101.6 Q53.4 103.8 56 101.6 M64 101.6 Q66.6 103.8 69.6 101.6" stroke="${seam}" stroke-width="0.5" fill="none" />` +
    `<path d="M44.6 140.2 L55.4 140.2 M64.6 140.2 L75.4 140.2" stroke="rgba(255,255,255,0.35)" stroke-width="0.8" />`
  );
}

function chainBelt(): string {
  return (
    `<path d="M49.4 100.2 Q60 103 70.6 100.2" stroke="#dfe6ee" stroke-width="1.1" stroke-dasharray="1.3 0.7" fill="none" />` +
    `<path d="M66 101.8 Q67 106 65.4 108.4" stroke="#dfe6ee" stroke-width="0.8" stroke-dasharray="1 0.6" fill="none" />` +
    `<circle cx="65.3" cy="109" r="1.1" fill="#f4c542" />` +
    `<circle cx="65.3" cy="109" r="0.4" fill="#ffffff" />`
  );
}

/** A-line skirt from the low-rise waist (y 98.4) down to `hemY`. */
function skirtPath(hemY: number, flare: number): string {
  return `M49 98.4 L71 98.4 L${n(71 + flare)} ${n(hemY)} Q60 ${n(hemY + 1.4)} ${n(49 - flare)} ${n(hemY)} Z`;
}

/** Scalloped hem path running right to left across a skirt. */
function scallopedSkirt(
  topY: number,
  topHalf: number,
  hemY: number,
  hemHalf: number,
  scallops: number,
): string {
  const step = (hemHalf * 2) / scallops;
  let hem = "";
  for (let i = 0; i < scallops; i++) {
    const x0 = 60 + hemHalf - i * step;
    hem += ` Q${n(x0 - step / 2)} ${n(hemY + 2.2)} ${n(x0 - step)} ${n(hemY)}`;
  }
  return `M${n(60 - topHalf)} ${n(topY)} L${n(60 + topHalf)} ${n(topY)} L${n(60 + hemHalf)} ${n(hemY)}${hem} Z`;
}

/** Pleat lines fanning from the waist to the hem of an A-line skirt. */
function pleats(hemY: number, flare: number, stroke: string): string {
  return [52, 56, 60, 64, 68]
    .map((x) => {
      const bottom = 60 + (x - 60) * ((11 + flare) / 11);
      return `M${x} 99 L${n(bottom)} ${n(hemY)}`;
    })
    .map((d) => `<path d="${d}" stroke="${stroke}" stroke-width="0.6" />`)
    .join("");
}

const LEFT_LEG_GLITTER = [
  [51, 101],
  [54.4, 103.4],
  [52.2, 107.6],
  [56, 110.4],
  [50.6, 113.4],
  [54.2, 117],
  [51.6, 121.4],
  [55, 124.6],
  [50.2, 128.4],
  [53.4, 131.2],
  [48.8, 135],
  [52.2, 137.6],
  [47, 139.4],
] as const;

const BOTTOM_ART: Record<BottomId, () => string> = {
  flares_indigo: () => flares("#3f5f9e", "#f3c46b") + chainBelt(),
  flares_light: () => flares("#8fb4e6", "#5f86c0") + chainBelt(),
  white_flares: () =>
    flares("#f6f3ee", "rgba(150,140,130,0.55)") +
    `<path d="M49.4 100.2 Q60 103 70.6 100.2" stroke="#ff5fa2" stroke-width="1.4" fill="none" />` +
    `<rect x="58.4" y="100.4" width="3.2" height="2.2" rx="0.6" fill="#f4c542" />`,
  black_flares: () => flares("#26222b", "rgba(255,255,255,0.18)"),
  denim_mini: () =>
    `<path d="${skirtPath(112.4, 2.4)}" fill="#6f95d0" />` +
    `<path d="M60 99 L60 107" stroke="#4a6fa8" stroke-width="0.6" />` +
    `<path d="M50.4 101.6 Q53.4 103.8 56 101.6 M64 101.6 Q66.6 103.8 69.6 101.6" stroke="#f3c46b" stroke-width="0.5" fill="none" />` +
    `<path d="M47 111.6 L73 111.6" stroke="#dbe7f7" stroke-width="0.7" stroke-dasharray="0.6 0.5" />` +
    chainBelt(),
  pleated_lilac: () =>
    `<path d="${skirtPath(113, 4)}" fill="#b48be0" />` +
    pleats(113, 4, "rgba(60,30,90,0.3)") +
    `<path d="M49 98.4 L71 98.4 L71.2 100.6 L48.8 100.6 Z" fill="#9a6fd0" />` +
    chainBelt(),
  cargo_pants: () =>
    `<path d="M49.2 98.6 L70.8 98.6 C71.6 112 71.4 126 72.4 140.6 L62.4 140.6 L61 104.8 L59 104.8 L57.6 140.6 L47.6 140.6 C48.6 126 48.4 112 49.2 98.6 Z" fill="#8f8763" />` +
    `<rect x="46.6" y="114" width="5" height="8" rx="1" fill="#7b7453" />` +
    `<rect x="68.4" y="114" width="5" height="8" rx="1" fill="#7b7453" />` +
    `<path d="M46.8 116 L51.4 116 M68.6 116 L73.2 116" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />` +
    chainBelt(),
  velour_track_pants: () =>
    `<path d="${FLARES}" fill="#e86aa8" />` +
    `<path d="M49.6 100.4 C50 110 49.4 118 49.8 126 C50.2 132 47.8 137 45.8 140.8" stroke="#ffffff" stroke-width="0.9" fill="none" />` +
    `<path d="M70.4 100.4 C70 110 70.6 118 70.2 126 C69.8 132 72.2 137 74.2 140.8" stroke="#ffffff" stroke-width="0.9" fill="none" />` +
    `<path d="M49.2 98.6 L70.8 98.6 L70.9 100.8 L49.1 100.8 Z" fill="#d4579a" />` +
    `<path d="M59 100.8 Q58.4 103.4 57.6 104.6 M61 100.8 Q61.6 103.4 62.4 104.6" stroke="#ffffff" stroke-width="0.5" fill="none" />` +
    `<path d="M53 106 Q54.4 112 53.6 120 M67 106 Q65.6 112 66.4 120" stroke="rgba(255,255,255,0.22)" stroke-width="1.4" stroke-linecap="round" fill="none" />`,
  plaid_mini: () => {
    const hem = 112.6;
    const flare = 3.6;
    const across = [102, 105.6, 109.2]
      .map((y) => {
        const t = (y - 98.4) / (hem - 98.4);
        const half = 11 + flare * t;
        return `<path d="M${n(60 - half)} ${y} L${n(60 + half)} ${y}" stroke="rgba(25,25,70,0.5)" stroke-width="1.3" />`;
      })
      .join("");
    return (
      `<path d="${skirtPath(hem, flare)}" fill="#d0394a" />` +
      pleats(hem, flare, "rgba(25,25,70,0.45)") +
      across +
      `<path d="M50.6 104 L69.4 104 M49.6 111 L70.4 111" stroke="rgba(255,226,120,0.7)" stroke-width="0.4" />` +
      `<path d="M49 98.4 L71 98.4 L71.2 100.4 L48.8 100.4 Z" fill="#2a2a5a" />`
    );
  },
  leather_pants: () =>
    `<path d="${STRAIGHT_LEG}" fill="#1c181f" />` +
    `<path d="M52.6 103 C53.4 110 53 118 52.6 126 M67.4 103 C66.6 110 67 118 67.4 126" stroke="rgba(255,255,255,0.32)" stroke-width="1.1" stroke-linecap="round" fill="none" />` +
    `<path d="M51.6 130 L51.4 138 M68.4 130 L68.6 138" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" stroke-linecap="round" />` +
    `<path d="M49.2 98.6 L70.8 98.6 L70.9 100.6 L49.1 100.6 Z" fill="#2c2630" />` +
    `<rect x="58.6" y="98.9" width="2.8" height="1.4" rx="0.4" fill="#c9d1db" />`,
  tulle_skirt: () =>
    `<path d="${scallopedSkirt(98.4, 11, 118, 19.6, 8)}" fill="rgba(255,170,210,0.7)" />` +
    `<path d="${scallopedSkirt(98.4, 11, 115.6, 17.6, 7)}" fill="rgba(255,140,195,0.75)" />` +
    `<path d="${scallopedSkirt(98.4, 11, 112.6, 15, 6)}" fill="#ff8fc2" />` +
    `<path d="M49 98.4 L71 98.4 L71.2 100.8 L48.8 100.8 Z" fill="#ff5fa2" />` +
    glitter([
      [52, 106],
      [57, 110],
      [63, 107],
      [68, 112],
      [45, 115],
      [74, 116],
      [60, 114.6],
    ]),
  parachute_pants: () => {
    const leg =
      "M49.2 98.6 L60 98.6 L60.2 104.6 L59.8 108 C60.8 118 60.6 128 58.8 134.6 L49.4 134.6 C46.4 128 45 118 46.6 108 C47.6 104 48.6 101 49.2 98.6 Z";
    const details =
      `<path d="M47.6 114 Q52 113 55.4 115 M48.6 124 Q53 123 57.2 125" stroke="rgba(80,70,120,0.35)" stroke-width="0.6" fill="none" />` +
      `<path d="M50.4 110 Q51.4 118 50.6 128" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round" fill="none" />` +
      `<rect x="49.2" y="133.6" width="9.8" height="2.4" rx="1" fill="#a49fc4" />` +
      `<path d="M52.6 136 L52 139.6 M55.6 136 L56.2 139.6" stroke="#ff5fa2" stroke-width="0.6" stroke-linecap="round" />` +
      `<circle cx="52" cy="139.8" r="0.6" fill="#ff5fa2" /><circle cx="56.2" cy="139.8" r="0.6" fill="#ff5fa2" />`;
    return (
      `<path d="${leg}" fill="#c9c4e0" />` +
      details +
      `<g ${MIRROR}><path d="${leg}" fill="#c9c4e0" />${details}</g>` +
      `<path d="M49.2 98.6 L70.8 98.6 L70.9 100.8 L49.1 100.8 Z" fill="#a49fc4" />`
    );
  },
  ruffle_mini: () =>
    `<path d="${scallopedSkirt(108.6, 13.6, 114, 15.6, 7)}" fill="#9ed4f5" />` +
    `<path d="M44.6 114.4 Q60 116.8 75.4 114.4" stroke="#ffffff" stroke-width="0.6" fill="none" />` +
    `<path d="${scallopedSkirt(103.4, 12, 109.6, 14, 6)}" fill="#b7e0f8" />` +
    `<path d="${scallopedSkirt(98.4, 11, 104.6, 12.4, 5)}" fill="#cdeafb" />` +
    `<path d="M49 98.4 L71 98.4 L71.1 100.4 L48.9 100.4 Z" fill="#7fc3ef" />`,
  glitter_flares: () =>
    flares("#cf9be6", "rgba(255,255,255,0.4)") +
    glitter(LEFT_LEG_GLITTER) +
    `<g ${MIRROR}>${glitter(LEFT_LEG_GLITTER)}</g>` +
    chainBelt(),
};

/* Tops: body shapes reused across pieces */
const TEE_BODY =
  "M48.4 73 C52 71.2 68 71.2 71.6 73 C72.4 78 70.6 83 69 88 C63 89.2 57 89.2 51 88 C49.4 83 47.6 78 48.4 73 Z";
const TUBE_BODY =
  "M50 76.6 C55 75.4 65 75.4 70 76.6 C70.6 80.2 69.8 84 68.8 87.4 C63 88.6 57 88.6 51.2 87.4 C50.2 84 49.4 80.2 50 76.6 Z";
const JACKET_PANEL =
  "M47 73.4 C50 71.4 54 71.4 56.4 72.6 L55.2 87.6 C52 88 49.4 87.4 48 86.6 C46.4 82 46 77.8 47 73.4 Z";
const LONG_PANEL =
  "M47 73.4 C50 71.4 54 71.4 56.4 72.6 L55.8 92.2 C52.4 92.6 49.8 91.8 48.4 90.8 C46.4 85 46 78 47 73.4 Z";

function cropTank(color: string): string {
  return (
    `<path d="M51.6 76.4 L52 71.8 M68.4 76.4 L68 71.8" stroke="${color}" stroke-width="1" stroke-linecap="round" />` +
    `<path d="M50.4 76.4 C53 74.6 67 74.6 69.6 76.4 C70.6 80 69.8 84 68.6 87.4 C63 88.6 57 88.6 51.4 87.4 C50.2 84 49.4 80 50.4 76.4 Z" fill="${color}" />` +
    `<path d="M51.4 87.4 C57 88.6 63 88.6 68.6 87.4" stroke="rgba(0,0,0,0.12)" stroke-width="0.6" fill="none" />`
  );
}

/** Left jacket panel plus its mirror, so jackets hang open over a top. */
function panels(d: string, fill: string, extra = ""): string {
  return (
    `<path d="${d}" fill="${fill}" />${extra}` +
    `<g ${MIRROR}><path d="${d}" fill="${fill}" />${extra}</g>`
  );
}

function sparkleDots(
  rows: readonly number[],
  x0: number,
  x1: number,
  step: number,
): string {
  let dots = "";
  rows.forEach((y, row) => {
    for (let x = x0 + (row % 2) * (step / 2); x <= x1; x += step) {
      dots += `<circle cx="${n(x)}" cy="${y}" r="0.55" fill="#ffffff" opacity="${(row + Math.round(x)) % 3 === 0 ? 0.9 : 0.45}" />`;
    }
  });
  return dots;
}

type TopArt = { markup: () => string; sleeve: SleeveSpec | null };

const cap = (color: string, width = 6.2): SleeveSpec => ({
  color,
  width,
  upperOnly: true,
});
const full = (color: string, width: number, detail?: string): SleeveSpec => ({
  color,
  width,
  upperOnly: false,
  ...(detail ? { detail } : {}),
});

const TOP_ART: Record<TopId, TopArt> = {
  crop_tank_pink: {
    sleeve: null,
    markup: () =>
      cropTank("#ff5fa2") +
      `<path d="M58.6 80.6 a0.8 0.8 0 0 1 1.4 -0.6 a0.8 0.8 0 0 1 1.4 0.6 L60 82.4 Z" fill="#ffffff" opacity="0.9" />`,
  },
  white_baby_tee: {
    sleeve: cap("#fdfbf7"),
    markup: () =>
      `<path d="${TEE_BODY}" fill="#fdfbf7" />` +
      `<path d="M55.6 71.8 Q60 75.4 64.4 71.8" stroke="#f2a6c6" stroke-width="1.1" fill="none" />` +
      `<path d="M51 87.6 C57 88.8 63 88.8 69 87.6" stroke="#f2a6c6" stroke-width="0.9" fill="none" />`,
  },
  star_baby_tee: {
    sleeve: cap("#9fd3f7"),
    markup: () =>
      `<path d="${TEE_BODY}" fill="#9fd3f7" />` +
      `<path d="M55.6 71.8 Q60 75.4 64.4 71.8" stroke="#ff5fa2" stroke-width="1" fill="none" />` +
      `<path d="M60 76.6 l1.1 2.3 2.5 0.35 -1.8 1.75 0.45 2.5 -2.25 -1.2 -2.25 1.2 0.45 -2.5 -1.8 -1.75 2.5 -0.35 Z" fill="#ff5fa2" />`,
  },
  tube_top_black: {
    sleeve: null,
    markup: () =>
      `<path d="${TUBE_BODY}" fill="#1f1b24" />` +
      `<path d="M52 78.4 Q60 77 68 78.4" stroke="rgba(255,255,255,0.28)" stroke-width="0.9" stroke-linecap="round" fill="none" />`,
  },
  lilac_halter: {
    sleeve: null,
    markup: () =>
      `<path d="M54.2 76.8 L57.6 71.2 M65.8 76.8 L62.4 71.2" stroke="#c4a3f0" stroke-width="1.3" stroke-linecap="round" />` +
      `<path d="M53.2 76.4 C55.6 75.4 64.4 75.4 66.8 76.4 C68.8 80 69.4 84 68.6 87.4 C63 88.6 57 88.6 51.4 87.4 C50.6 84 51.2 80 53.2 76.4 Z" fill="#c4a3f0" />` +
      `<path d="M58.6 77.2 L60 78.4 L61.4 77.2 L61.4 79.6 L60 78.4 L58.6 79.6 Z" fill="#9a74d6" />`,
  },
  heart_halter: {
    sleeve: null,
    markup: () =>
      `<path d="M55.2 71 L60 76.4 L64.8 71" stroke="#1f1b24" stroke-width="1.2" fill="none" />` +
      `<path d="M51 77.4 C54 75 57.6 76.4 60 78.4 C62.4 76.4 66 75 69 77.4 C70 81 69.4 84.4 68.4 87.6 C63 88.8 57 88.8 51.6 87.6 C50.6 84.4 50 81 51 77.4 Z" fill="#1f1b24" />` +
      `<path d="M58 82.4 a1.1 1.1 0 0 1 2 -0.8 a1.1 1.1 0 0 1 2 0.8 L60 85 Z" fill="#ffd6f0" />`,
  },
  denim_jacket: {
    sleeve: full("#7ea6dc", 6.4, "rgba(40,70,130,0.45)"),
    markup: () =>
      cropTank("#ff5fa2") +
      panels(
        JACKET_PANEL,
        "#7ea6dc",
        `<path d="M48 86.6 C50 87.6 53 88 55.2 87.6" stroke="#f3c46b" stroke-width="0.5" stroke-dasharray="0.9 0.6" fill="none" />` +
          `<path d="M49 79 L54.6 79" stroke="rgba(40,70,130,0.45)" stroke-width="0.5" />` +
          `<circle cx="54" cy="81" r="0.6" fill="#dfe6ee" />` +
          `<path d="M50.4 72.2 L56.4 72.6 L55.4 77.4 Z" fill="#5f86c0" />`,
      ),
  },
  striped_tee: {
    sleeve: cap("#ffffff"),
    markup: () =>
      `<path d="${TEE_BODY}" fill="#ffffff" />` +
      `<path d="M49 77 L71 77 M49.6 81 L70.4 81 M50.4 85 L69.6 85" stroke="#ff5fa2" stroke-width="1.6" />` +
      `<path d="M55.6 71.8 Q60 75.4 64.4 71.8" stroke="#ff5fa2" stroke-width="1" fill="none" />` +
      `<path d="M57.4 79.6 l1.3 -1.2 1.3 1.2 1.3 -1.2 1.3 1.2 -2.6 2.6 Z" fill="#ff2f86" />`,
  },
  cropped_puffer: {
    sleeve: full("#f7a8d0", 7.6, "rgba(170,60,120,0.35)"),
    markup: () =>
      cropTank("#ffffff") +
      panels(
        "M47 73.4 C50 71.4 54 71.4 56.6 72.4 L55.4 88.4 C52 88.8 49.6 88.2 48 87.4 C46.4 82.6 46 77.8 47 73.4 Z",
        "#f7a8d0",
        `<path d="M47.2 79 Q51 80.2 55.8 79 M47 84 Q51 85.2 55.6 84" stroke="rgba(170,60,120,0.35)" stroke-width="0.6" fill="none" />` +
          `<path d="M49.6 75 Q51 73.2 53 74" stroke="rgba(255,255,255,0.55)" stroke-width="0.9" stroke-linecap="round" fill="none" />` +
          `<path d="M47.4 74.2 q1.4 -2.6 3 -1.4 q1 -2.4 3 -1.4 q1.2 -2 3.4 -0.6 q0.6 1.6 -0.6 2.8 q-2 1.6 -4.4 1.6 q-2.6 0.6 -4.4 -1 Z" fill="#fffaf5" />`,
      ),
  },
  velour_track_jacket: {
    sleeve: full("#e86aa8", 6.4, "rgba(255,255,255,0.75)"),
    markup: () =>
      `<path d="M48.4 73 C52 71.2 68 71.2 71.6 73 C72.4 78 70.8 83.4 69.4 88.6 C63 89.8 57 89.8 50.6 88.6 C49.2 83.4 47.6 78 48.4 73 Z" fill="#e86aa8" />` +
      `<path d="M50.4 86.6 C57 87.8 63 87.8 69.6 86.6 L69.4 88.6 C63 89.8 57 89.8 50.6 88.6 Z" fill="#d4579a" />` +
      `<path d="M55.4 71.4 L55.8 74.4 Q60 75.6 64.2 74.4 L64.6 71.4 Q60 72.6 55.4 71.4 Z" fill="#d4579a" />` +
      `<path d="M60 74.8 L60 89.4" stroke="#e9edf3" stroke-width="0.7" />` +
      `<rect x="59.3" y="76" width="1.4" height="2.2" rx="0.5" fill="#e9edf3" />` +
      `<path d="M52 77 Q53.6 82 52.6 86 M68 77 Q66.4 82 67.4 86" stroke="rgba(255,255,255,0.22)" stroke-width="1.4" stroke-linecap="round" fill="none" />` +
      `<circle cx="64" cy="80.4" r="0.45" fill="#ffffff" /><circle cx="65.4" cy="80.8" r="0.45" fill="#ffffff" /><circle cx="66.8" cy="80.4" r="0.45" fill="#ffffff" />`,
  },
  fur_trim_cardigan: {
    sleeve: full("#c9a7f0", 6.2, "rgba(120,80,170,0.4)"),
    markup: () =>
      cropTank("#ffffff") +
      panels(
        LONG_PANEL,
        "#c9a7f0",
        `<path d="M56.4 72.6 L55.8 92.2" stroke="#fffaf5" stroke-width="2.6" stroke-linecap="round" />` +
          [74, 77, 80, 83, 86, 89, 92]
            .map(
              (y) =>
                `<circle cx="${n(56.4 - (y - 72.6) * 0.03)}" cy="${y}" r="1.5" fill="#fffaf5" />`,
            )
            .join("") +
          `<path d="M48.4 91 C51 92.2 53.6 92.6 55.8 92.2" stroke="#fffaf5" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
          `<path d="M47.4 73.6 q1.6 -2.4 3.4 -1.2 q1.4 -2 3.4 -0.8 q1.6 0 2.2 1.2" stroke="#fffaf5" stroke-width="2" stroke-linecap="round" fill="none" />`,
      ) +
      `<circle cx="54.4" cy="81" r="0.8" fill="#ff8fc2" />`,
  },
  butterfly_halter: {
    sleeve: null,
    markup: () => {
      const wings =
        `<path d="M60 79.4 C56 73.8 50.4 74.4 50.4 78.6 C50.4 82.2 55 83.6 60 82.2 Z" fill="#7fd3ff" stroke="#3a6fb0" stroke-width="0.5" />` +
        `<path d="M60 82.2 C55.6 82.8 51.6 85.2 52.6 87.8 C54 89.6 58 88.2 60 84.8 Z" fill="#ff9ad5" stroke="#3a6fb0" stroke-width="0.5" />` +
        `<circle cx="53.6" cy="78.2" r="1" fill="#ffffff" opacity="0.8" />` +
        `<circle cx="55.6" cy="86.2" r="0.7" fill="#ffffff" opacity="0.8" />` +
        `<path d="M56.8 71.4 L57.8 76.8" stroke="#3a6fb0" stroke-width="0.8" stroke-linecap="round" />`;
      return (
        // Pale crop halter backing so the butterfly reads as a print, not a bikini
        `<path d="M55.2 71 L60 76.4 L64.8 71" stroke="#eaf6ff" stroke-width="1.2" fill="none" />` +
        `<path d="M50.6 76.6 C54 74.8 57.6 75.8 60 77.4 C62.4 75.8 66 74.8 69.4 76.6 C70.4 80.6 69.8 84.6 68.8 88.2 C63 89.4 57 89.4 51.2 88.2 C50.2 84.6 49.6 80.6 50.6 76.6 Z" fill="#eaf6ff" />` +
        `<g transform="translate(60 81.6) scale(1.16) translate(-60 -81.6)">` +
        wings +
        `<g ${MIRROR}>${wings}</g>` +
        `</g>` +
        `<path d="M60 77.8 L60 87.4" stroke="#2a3f70" stroke-width="1.2" stroke-linecap="round" />`
      );
    },
  },
  mesh_top: {
    sleeve: full("rgba(30,24,36,0.55)", 5.4, "rgba(30,24,36,0.7)"),
    markup: () => {
      const mesh = [74, 77, 80, 83, 86]
        .map((y) => `M48.6 ${y} L71.4 ${y}`)
        .concat(
          [50, 53, 56, 59, 62, 65, 68, 71].map((x) => `M${x} 72 L${x - 1} 89`),
        )
        .join(" ");
      return (
        cropTank("#ff8fc2") +
        `<path d="${TEE_BODY}" fill="rgba(30,24,36,0.42)" />` +
        `<path d="${mesh}" stroke="rgba(15,10,20,0.45)" stroke-width="0.35" fill="none" />` +
        `<path d="M55.6 71.8 Q60 74.8 64.4 71.8" stroke="#1e1824" stroke-width="0.9" fill="none" />`
      );
    },
  },
  moto_jacket: {
    sleeve: full("#231d27", 6.6, "rgba(255,255,255,0.3)"),
    markup: () =>
      `<path d="${TEE_BODY}" fill="#231d27" />` +
      `<path d="M56.2 71.6 L60 76.6 L63.8 71.6 Z" fill="#fdfbf7" />` +
      `<path d="M51.4 72.2 L56.8 72.6 L55 80.4 Z M68.6 72.2 L63.2 72.6 L65 80.4 Z" fill="#342d3a" />` +
      `<path d="M66 73.6 L57 88.8" stroke="#c9d1db" stroke-width="0.8" />` +
      `<circle cx="64.4" cy="76.4" r="0.6" fill="#c9d1db" />` +
      `<path d="M50.6 85.8 C57 87 63 87 69.4 85.8 L69 88 C63 89.2 57 89.2 51 88 Z" fill="#1a151d" />` +
      `<rect x="58.8" y="86.4" width="2.4" height="1.6" rx="0.3" fill="none" stroke="#c9d1db" stroke-width="0.4" />` +
      `<path d="M50.8 76 Q52.4 80 51.8 85 M69.2 76 Q67.6 80 68.2 85" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-linecap="round" fill="none" />`,
  },
  sequin_tube: {
    sleeve: null,
    markup: () =>
      `<path d="${TUBE_BODY}" fill="#e9a3d8" />` +
      sparkleDots([78, 80.4, 82.8, 85.2], 51.6, 68.4, 2) +
      `<path d="M50.6 76.8 C55 75.6 65 75.6 69.4 76.8" stroke="#f9d6ef" stroke-width="0.8" fill="none" />`,
  },
  varsity_crop: {
    sleeve: full("#fff2df", 6.6, "rgba(255,95,162,0.7)"),
    markup: () =>
      `<path d="${TEE_BODY}" fill="#fdfbf7" />` +
      panels(
        JACKET_PANEL,
        "#ff7eb6",
        `<path d="M48 85 C50 86 53 86.4 55.3 86 L55.2 87.6 C52 88 49.4 87.4 48 86.6 Z" fill="#fff2df" />` +
          `<path d="M48.2 86 C50.4 86.8 53 87.2 55.2 86.8" stroke="#ff5fa2" stroke-width="0.4" fill="none" />` +
          `<path d="M50.2 72 Q53 71.2 56.4 72.6" stroke="#fff2df" stroke-width="1.4" stroke-linecap="round" fill="none" />`,
      ) +
      `<rect x="49.6" y="76.8" width="4.4" height="4.8" rx="0.8" fill="#fff2df" />` +
      `<path d="M51.2 77.8 L51.2 80.6 L53 80.6" stroke="#ff5fa2" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  },
  zip_crop_hoodie: {
    sleeve: full("#a9d4f5", 6.8, "rgba(40,90,140,0.35)"),
    markup: () =>
      `<path d="M48.4 73 C52 71.2 68 71.2 71.6 73 C72.4 78 70.8 83.4 69.4 88.8 C63 90 57 90 50.6 88.8 C49.2 83.4 47.6 78 48.4 73 Z" fill="#a9d4f5" />` +
      `<path d="M51.2 73 Q60 79.2 68.8 73" stroke="#8cbde6" stroke-width="2.6" stroke-linecap="round" fill="none" />` +
      `<path d="M60 76.2 L60 89.6" stroke="#e9edf3" stroke-width="0.7" />` +
      `<path d="M57.4 76 L57 81.6 M62.6 76 L63 81.6" stroke="#ffffff" stroke-width="0.6" stroke-linecap="round" />` +
      `<circle cx="57" cy="82" r="0.6" fill="#ff5fa2" /><circle cx="63" cy="82" r="0.6" fill="#ff5fa2" />` +
      `<path d="M50.4 87 C57 88.2 63 88.2 69.6 87 L69.4 88.8 C63 90 57 90 50.6 88.8 Z" fill="#8cbde6" />`,
  },
  barista_apron: {
    sleeve: cap("#26222b", 6),
    markup: () =>
      `<path d="M48.4 73 C52 71.2 68 71.2 71.6 73 C72.4 78 70.6 83 69 88.4 C63 89.6 57 89.6 51 88.4 C49.4 83 47.6 78 48.4 73 Z" fill="#26222b" />` +
      `<path d="M50 99.6 L70 99.6 L71.4 116 Q60 118.6 48.6 116 Z" fill="#27ae60" />` +
      `<path d="M49.4 99.6 L70.6 99.6" stroke="#1e824c" stroke-width="1.6" />` +
      `<rect x="54.6" y="104.4" width="10.8" height="6.4" rx="1.4" fill="#1e824c" />` +
      `<circle cx="60" cy="107.6" r="1.8" fill="#f1c40f" />`,
  },
};

/** Sleeve of the worn top, or null for sleeveless tops. */
export function sleeveSpecFor(look: AvatarLook): SleeveSpec | null {
  return TOP_ART[resolveTopId(look)].sleeve;
}

/** Both sleeves, except a waving sleeve, which is drawn above the hair. */
function sleeves(look: AvatarLook, action: string): string {
  const spec = sleeveSpecFor(look);
  if (!spec) return "";
  return (
    (action === "wave"
      ? ""
      : `<g class="avatar-right-sleeve">${sleeve(RIGHT_ARM_DOWN, spec)}</g>`) +
    sleeve(LEFT_ARM_HIP, spec)
  );
}

export function renderLayer5Outfit(
  look: AvatarLook,
  action: string = "idle",
): string {
  const topId = resolveTopId(look);
  const bottomId = resolveBottomId(look);
  const skin = resolveSkinTone(look.skinTone);
  const legacy =
    !look.topId &&
    !look.bottomId &&
    look.outfitId &&
    Object.prototype.hasOwnProperty.call(OUTFIT_PRESETS, look.outfitId)
      ? ` outfit-${dashed(look.outfitId)}`
      : "";
  // The hand on the hip rests on top of any clothing
  const hipHand = `<g class="avatar-hip-hand">${handMarkup(LEFT_ARM_HIP, skin)}</g>`;

  return (
    `<g class="avatar-outfit${legacy} top-${dashed(topId)} bottom-${dashed(bottomId)}">` +
    BOTTOM_ART[bottomId]() +
    TOP_ART[topId].markup() +
    sleeves(look, action) +
    hipHand +
    `</g>`
  );
}
