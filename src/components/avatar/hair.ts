import type { AvatarLook, HairStyle } from "../../types/world.ts";
import { resolveHairStyle } from "../../types/world.ts";
import { HAIR_CLIPS, findOption } from "../../types/avatarOptions.ts";
import { INK, MIRROR, escapeXml, inked, n } from "./shared.ts";

/* -------------------------------------------------------------
 * Hairstyles: each cut provides a back mass and a face-framing front
 * ------------------------------------------------------------- */
type HairArt = { back: string; front: string };

/** Darkens a hair mass so the front layer reads as closer and glossier. */
function shade(d: string, opacity = 0.22): string {
  return `<path d="${d}" fill="rgba(25, 10, 5, ${opacity})" />`;
}

function strands(paths: readonly string[], opacity = 0.26): string {
  return paths
    .map(
      (d) =>
        `<path d="${d}" stroke="rgba(25, 10, 5, ${opacity})" stroke-width="0.9" stroke-linecap="round" fill="none" />`,
    )
    .join("");
}

/** Glossy curved glints on wave crests, drawn on the viewer-left and mirrored. */
function glints(
  paths: readonly string[],
  mirrored = true,
  core = "#ffffff",
): string {
  const left = paths
    .map(
      (d) =>
        `<path d="${d}" stroke="rgba(255,255,255,0.4)" stroke-width="2.4" stroke-linecap="round" fill="none" />` +
        `<path d="${d}" stroke="${core}" stroke-width="0.9" stroke-linecap="round" fill="none" />`,
    )
    .join("");
  return `<g class="hair-glints">${left}${mirrored ? `<g ${MIRROR}>${left}</g>` : ""}</g>`;
}

/** Glossy shine ribbon: a soft gradient band plus crisp specular streaks. */
function shineRibbon(p: string, band: string, streak: string): string {
  return (
    `<g class="hair-highlight">` +
    `<path d="${band}" fill="url(#${p}-shine)" />` +
    `<path d="${streak}" stroke="rgba(255,255,255,0.45)" stroke-width="2.8" stroke-linecap="round" fill="none" />` +
    `<path d="${streak}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
    `</g>`
  );
}

function butterflyClip(
  x: number,
  y: number,
  color: string,
  angle: number,
): string {
  return (
    `<g class="butterfly-clip" transform="translate(${x} ${y}) rotate(${angle})">` +
    `<ellipse cx="-2.3" cy="-1.3" rx="2.5" ry="1.9" fill="${color}" transform="rotate(-25 -2.3 -1.3)" />` +
    `<ellipse cx="2.3" cy="-1.3" rx="2.5" ry="1.9" fill="${color}" transform="rotate(25 2.3 -1.3)" />` +
    `<ellipse cx="-1.7" cy="1.5" rx="1.6" ry="1.3" fill="${color}" opacity="0.85" />` +
    `<ellipse cx="1.7" cy="1.5" rx="1.6" ry="1.3" fill="${color}" opacity="0.85" />` +
    `<ellipse cx="-2.6" cy="-1.8" rx="0.9" ry="0.5" fill="#ffffff" opacity="0.85" />` +
    `<ellipse cx="2.6" cy="-1.8" rx="0.9" ry="0.5" fill="#ffffff" opacity="0.85" />` +
    `<rect x="-0.45" y="-2.6" width="0.9" height="5" rx="0.45" fill="#3a2a4a" />` +
    `<circle cx="0" cy="-1.0" r="0.45" fill="#ffffff" />` +
    `</g>`
  );
}

function braid(d: string, color: string, bead: string, end: string): string {
  const [bx, by] = end.split(" ");
  return (
    `<path d="${d}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none" />` +
    `<path d="${d}" stroke="${color}" stroke-width="2.6" stroke-linecap="round" fill="none" />` +
    `<path d="${d}" stroke="rgba(25,10,5,0.35)" stroke-width="2.6" stroke-dasharray="0.7 1.3" fill="none" />` +
    // Gold cuffs spaced down the braid
    `<path d="${d}" stroke="#f4c542" stroke-width="3" stroke-dasharray="1.6 20" stroke-dashoffset="-12" fill="none" />` +
    `<circle cx="${bx}" cy="${by}" r="1.5" fill="${bead}" stroke="rgba(0,0,0,0.25)" stroke-width="0.3" />` +
    `<circle cx="${Number(bx) - 0.5}" cy="${Number(by) - 0.5}" r="0.5" fill="#ffffff" opacity="0.8" />`
  );
}

/** Middle-part crown shared by long and braided cuts. */
const MIDDLE_PART_CAP =
  "M30.6 48 C28.6 24 42 8 60 8 C78 8 91.4 24 89.4 48 L85.8 48 C85.2 37 79.4 29 70.6 25.6 C66 24 62 23 60 21.4 C58 23 54 24 49.4 25.6 C40.6 29 34.8 37 34.2 48 Z";

/** Side-part crown with a soft sweep across the forehead. */
const SIDE_PART_CAP =
  "M31 50 C27 24 41 6.6 60 6.6 C80 6.6 93.4 24 89.4 50 C87.8 42 86 36 82.8 31.6 C78 27.4 70.4 28 64.4 26.2 C59 24.6 55 23 52 21 C48.6 25 43.6 28.6 39.4 33 C36 37.4 34.4 43 34.2 50 C33.4 47.4 32 48 31 50 Z";

/** Scalloped circle for puffs, buns, and curls. */
function fluffy(
  cx: number,
  cy: number,
  r: number,
  bumps: number,
  amp: number,
): string {
  const at = (angle: number, radius: number) =>
    `${n(cx + Math.cos(angle) * radius)} ${n(cy + Math.sin(angle) * radius)}`;
  const step = (Math.PI * 2) / bumps;
  let d = `M${at(0, r)}`;
  for (let i = 0; i < bumps; i++) {
    d += ` Q${at(step * (i + 0.5), r + amp * 2)} ${at(step * (i + 1), r)}`;
  }
  return `${d} Z`;
}

type Curl = readonly [number, number, number];

/** Spirals and highlights for every curl, merged into two paths. */
function curlDetails(list: readonly Curl[]): string {
  const spirals = list
    .map(
      ([cx, cy, r]) =>
        `M${n(cx - r * 0.6)} ${n(cy + r * 0.1)} C${n(cx - r * 0.5)} ${n(cy - r * 0.7)} ${n(cx + r * 0.7)} ${n(cy - r * 0.6)} ${n(cx + r * 0.55)} ${n(cy + r * 0.2)} C${n(cx + r * 0.4)} ${n(cy + r * 0.7)} ${n(cx - r * 0.3)} ${n(cy + r * 0.5)} ${n(cx - r * 0.1)} ${n(cy)}`,
    )
    .join(" ");
  const highlights = list
    .filter((_, i) => i % 2 === 0)
    .map(
      ([cx, cy, r]) =>
        `M${n(cx - r * 0.55)} ${n(cy - r * 0.35)} Q${n(cx - r * 0.2)} ${n(cy - r * 0.8)} ${n(cx + r * 0.3)} ${n(cy - r * 0.7)}`,
    )
    .join(" ");
  return (
    `<path d="${spirals}" stroke="rgba(25,10,5,0.38)" stroke-width="0.8" fill="none" />` +
    `<path d="${highlights}" stroke="rgba(255,255,255,0.7)" stroke-width="0.9" stroke-linecap="round" fill="none" />`
  );
}

/**
 * Curls merged into one fluffy silhouette with the base shape: every
 * outline is drawn first and every fill on top, so only the outer edge is
 * inked instead of each curl reading as a separate bubble. Mirrored. The
 * discs share one path per pass to keep the node count low.
 */
function curlCloud(list: readonly Curl[], c: string, base = ""): string {
  const disc = list
    .map(
      ([cx, cy, r]) =>
        `M${n(cx - r)} ${n(cy)} a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0 a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0 Z`,
    )
    .join(" ");
  const pass = (stroke: string) =>
    (base ? `<path d="${base}" fill="${c}" ${stroke} />` : "") +
    `<path class="curl-discs" d="${disc}" fill="${c}" ${stroke} />` +
    `<path class="curl-discs" d="${disc}" ${MIRROR} fill="${c}" ${stroke} />`;
  const details = curlDetails(list);
  return (
    pass(`stroke="${INK}" stroke-width="2.2"`) +
    pass(`stroke="none"`) +
    details +
    `<g ${MIRROR}>${details}</g>`
  );
}

/** Springy ringlets: columns of small curls wobbling down from `y0` to `y1`. */
function ringlets(
  columns: readonly (readonly [number, number, number])[],
  r: number,
): Curl[] {
  return columns.flatMap(([x, y0, y1]) =>
    Array.from(
      { length: Math.floor((y1 - y0) / (r * 1.2)) + 1 },
      (_, i) => [x + (i % 2 ? 1.1 : -1.1), y0 + i * r * 1.2, r] as const,
    ),
  );
}

/** Vertical zigzag polyline used for crimped texture. */
function zigzagLine(x: number, y0: number, y1: number, amp: number): string {
  let d = `M${n(x)} ${n(y0)}`;
  for (let y = y0 + 4, i = 0; y <= y1; y += 4, i++) {
    d += ` L${n(x + (i % 2 ? -amp : amp))} ${n(y)}`;
  }
  return d;
}

/** Wide triangular crimped mane with zigzag sides down to `bottom`. */
function zigzagMane(bottom: number, amp: number): string {
  const right: string[] = [];
  const left: string[] = [];
  for (let y = 44, i = 0; y <= bottom; y += 4, i++) {
    const spread = ((y - 44) / (bottom - 44)) * 6;
    const jag = i % 2 ? -amp : amp;
    right.push(`L${n(94 + spread + jag)} ${n(y)}`);
    left.unshift(`L${n(26 - spread - jag)} ${n(y)}`);
  }
  return (
    `M60 5 C84 5 96 20 94 44 ${right.join(" ")} ` +
    `L${n(60)} ${n(bottom + 2)} ${left.join(" ")} L26 44 C24 20 36 5 60 5 Z`
  );
}

/** Swirled baby hairs laid along the hairline, viewer-left and mirrored. */
function babyHairs(
  c: string,
  spots: readonly (readonly [number, number])[],
): string {
  const swirl = spots
    .map(
      ([x, y]) =>
        `M${n(x + 2.2)} ${n(y - 1.6)} q-2.6 -0.2 -2.8 1.8 q-0.2 1.8 1.6 1.8 q1.2 0 1 -1.2`,
    )
    .join(" ");
  const left =
    `<path d="${swirl}" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" fill="none" />` +
    `<path d="${swirl}" stroke="${c}" stroke-width="0.8" stroke-linecap="round" fill="none" />`;
  return `<g class="baby-hairs">${left}<g ${MIRROR}>${left}</g></g>`;
}

/** One braid strand: inked edge, plait texture, and gold cuffs. */
function braidStroke(d: string, c: string, width = 2.6): string {
  return (
    `<path d="${d}" stroke="${INK}" stroke-width="${width + 0.9}" stroke-linecap="round" fill="none" />` +
    `<path d="${d}" stroke="${c}" stroke-width="${width}" stroke-linecap="round" fill="none" />` +
    `<path d="${d}" stroke="rgba(25,10,5,0.35)" stroke-width="${width}" stroke-dasharray="0.7 1.3" fill="none" />` +
    `<path d="${d}" stroke="#f4c542" stroke-width="${width + 0.4}" stroke-dasharray="1.6 14" stroke-dashoffset="-6" fill="none" />`
  );
}

/** Braids coiled into a round bun on the crown. */
function braidedBun(c: string): string {
  const ring = (r: number) =>
    `M${n(60 - r)} 1 a${r} ${r} 0 1 0 ${n(r * 2)} 0 a${r} ${r} 0 1 0 ${n(-r * 2)} 0`;
  return (
    `<circle cx="60" cy="1" r="11.6" fill="${c}" stroke="${INK}" stroke-width="1.1" />` +
    braidStroke(ring(9.8), c, 3) +
    braidStroke(ring(5.8), c, 3) +
    `<circle cx="60" cy="1" r="2.4" fill="${c}" stroke="${INK}" stroke-width="0.8" />` +
    `<path d="M53 -5 Q57 -9.4 63 -8.6" stroke="rgba(255,255,255,0.6)" stroke-width="1.2" stroke-linecap="round" fill="none" />`
  );
}

function hairArt(style: HairStyle, c: string, p: string): HairArt {
  switch (style) {
    case "high_pony": {
      const pony =
        "M57 11 C58 1 72 -2 80 3 C90 9 94 19 93 32 C92 48 99 62 96 78 C94.6 87 89.6 93 85 95 C87.6 85 85.6 75 82 65 C78 54 76.4 40 74 29 C72 21 66 15 60 13.6 Z";
      const cap =
        "M32.4 45 C30.4 22 43 9.6 60 9.6 C77 9.6 89.6 22 87.6 45 C86.8 38.4 85 33 82.2 29.4 C76 23.4 68 21 60 21 C52 21 44 23.4 37.8 29.4 C35 33 33.2 38.4 32.4 45 Z";
      const tendril =
        "M36.6 29 C33.2 37 37.6 43.6 34.8 51.4 C32.8 57 35.8 61.6 33.6 66.6";
      return {
        back:
          `<path d="${pony}" fill="${c}" />` +
          shade(pony, 0.2) +
          strands([
            "M78 8 C88 16 90 30 90 44 C90 58 94 70 91 84",
            "M74 14 C80 26 80 40 84 54 C87 64 89 74 88 86",
          ]) +
          glints(
            [
              "M83 12 C88 22 89 36 90.4 48 C91.4 58 93.4 66 92.6 76",
              "M77 20 C80 30 80.6 40 83 52",
            ],
            false,
          ),
        front:
          `<path d="${cap}" fill="${c}" />` +
          strands([
            "M40 28 C46 18 54 13 61 10.6",
            "M80 28 C74 18 66 13 61 10.6",
            "M49 22.4 C53 16 57 12.4 61 10.6",
            "M71 22.4 C67 16 64 12.4 61 10.6",
          ]) +
          `<path d="${tendril}" stroke="${c}" stroke-width="1.8" stroke-linecap="round" fill="none" />` +
          `<path d="${tendril}" ${MIRROR} stroke="${c}" stroke-width="1.8" stroke-linecap="round" fill="none" />` +
          // Scrunchie at the crown
          `<ellipse cx="62" cy="9.4" rx="5" ry="2.9" fill="#ff5fa2" />` +
          `<path d="M57.6 9.4 Q59 7.6 60.4 9.4 Q61.8 7.6 63.2 9.4 Q64.6 7.6 66.2 9.4" stroke="#ffb3d4" stroke-width="0.8" fill="none" />` +
          shineRibbon(
            p,
            "M39 23 C47 13.4 73 13.4 81 23 C73 17.6 47 17.6 39 25 Z",
            "M46 17.4 Q60 12.4 72 16",
          ),
      };
    }
    case "butterfly_waves": {
      // Big S-waves down both sides ending in scalloped curls
      const mass =
        "M60 7 C82 7 94 22 93 42 C96 50 100 54 98 62 C96 70 91 72 94 80 C97 88 101 92 98 100 C95 106 91 108 93 114 Q88 120 82 114 Q76 120 70 113 L50 113 Q44 120 38 114 Q32 120 27 114 C29 108 25 106 22 100 C19 92 23 88 26 80 C29 72 24 70 22 62 C20 54 24 50 27 42 C26 22 38 7 60 7 Z";
      const cap =
        "M30.6 48 C28.6 24 42 8 60 8 C78 8 91.4 24 89.4 48 L85.8 48 C85.2 37 79.4 29 70.6 25.6 C66 24 62 23 60 21.4 C58 23 54 24 49.4 25.6 C40.6 29 34.8 37 34.2 48 Z";
      const wave =
        "M34.4 40 C31 48 36 56 33 64 C30 72 35.6 78 32 86 C30 90 25.4 90.4 23.6 87.4 C27.6 84.4 26 79 27 74 C28.4 66 24.6 58 27.4 48 C28.4 44 30.4 39.6 31.2 37.6 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          strands([
            "M26 56 C22 64 28 72 26 80 C24 88 21 94 24 102 C25 106 27 108 29 112",
            "M94 56 C98 64 92 72 94 80 C96 88 99 94 96 102 C95 106 93 108 91 112",
            "M33 70 C30 80 35 88 32 96 C30 102 33 106 34 112",
            "M87 70 C90 80 85 88 88 96 C90 102 87 106 86 112",
          ]) +
          glints(["M23.4 58 Q22 62 23.6 66", "M23 94 Q21.6 98 23.2 103"]),
        front:
          `<path d="${cap}" fill="${c}" />` +
          `<path d="${wave}" fill="${c}" />` +
          `<path d="${wave}" ${MIRROR} fill="${c}" />` +
          strands([
            "M59 16 C52 22 42 26 36 40",
            "M61 16 C68 22 78 26 84 40",
            "M31.4 46 C29 54 33 60 31 68 C29 76 32.6 80 29.4 86",
            "M88.6 46 C91 54 87 60 89 68 C91 76 87.4 80 90.6 86",
          ]) +
          shineRibbon(
            p,
            "M36 26 C44 13 76 13 84 26 C76 18.6 44 18.6 36 28 Z",
            "M43 19.4 Q52 13.6 58 13.8",
          ) +
          butterflyClip(46, 19.6, "#7fd3ff", -28) +
          butterflyClip(74, 19.6, "#ff9ad5", 28) +
          butterflyClip(39.4, 27.6, "#c8f27a", -48),
      };
    }
    case "box_braids": {
      const mass =
        "M60 6 C83 6 95 22 94 42 C93 60 95 84 93.4 104 C89 107.6 84.6 106.6 80.6 104 L39.4 104 C35.4 106.6 31 107.6 26.6 104 C25 84 27 60 26 42 C25 22 37 6 60 6 Z";
      const cap =
        "M30.4 48 C28.4 24 42 7.4 60 7.4 C78 7.4 91.6 24 89.6 48 L85.8 48 C85.2 37 79.4 29 70.6 25.6 C66 24 62 23 60 21.4 C58 23 54 24 49.4 25.6 C40.6 29 34.8 37 34.2 48 Z";
      const backBraids = [
        ["M30 44 C28 70 30 90 28.6 108", "28.6 109.6"],
        ["M36 56 C34.6 78 36 94 35 108", "35 109.6"],
        ["M90 44 C92 70 90 90 91.4 108", "91.4 109.6"],
        ["M84 56 C85.4 78 84 94 85 108", "85 109.6"],
        ["M41 66 C40.4 84 41.6 96 41 108", "41 109.6"],
        ["M79 66 C79.6 84 78.4 96 79 108", "79 109.6"],
      ] as const;
      const frontBraids = [
        ["M34.6 40 C32.4 56 33.6 72 31.8 88", "31.8 89.6"],
        ["M37.4 44 C36.4 58 37.6 70 36.6 82", "36.6 83.6"],
        ["M85.4 40 C87.6 56 86.4 72 88.2 88", "88.2 89.6"],
        ["M82.6 44 C83.6 58 82.4 70 83.4 82", "83.4 83.6"],
      ] as const;
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass, 0.28) +
          backBraids
            .map(([d, end], i) =>
              braid(d, c, i % 2 ? "#f6c945" : "#e3eaf2", end),
            )
            .join(""),
        front:
          `<path d="${cap}" fill="${c}" />` +
          strands(
            [
              "M59 16 C52 21 44 25 37 36",
              "M61 16 C68 21 76 25 83 36",
              "M56 12 C48 14 40 20 35 30",
              "M64 12 C72 14 80 20 85 30",
            ],
            0.3,
          ) +
          frontBraids
            .map(([d, end], i) =>
              braid(d, c, i % 2 ? "#e3eaf2" : "#f6c945", end),
            )
            .join("") +
          shineRibbon(
            p,
            "M37 25 C45 13 75 13 83 25 C75 18 45 18 37 27 Z",
            "M44 18.4 Q52 13.4 57.6 13.2",
          ),
      };
    }
    case "blunt_bob": {
      const mass =
        "M60 7 C82 7 93 22 92 40 C91.6 50 92.6 58 93 64.4 C86 67.4 78 67 72 64.6 L48 64.6 C42 67 34 67.4 27 64.4 C27.4 58 28.4 50 28 40 C27 22 38 7 60 7 Z";
      const front =
        "M28.4 54 C26 24 40 7 60 7 C80 7 94 24 91.6 54 C91.6 58 92.4 62 93 64.6 C88 65.8 84 65.6 81.4 64.2 C83 58 84.6 50 85 42 L85.2 30.6 C70 32.4 50 32.4 34.8 30.6 L35 42 C35.4 50 37 58 38.6 64.2 C36 65.6 32 65.8 27 64.6 C27.6 62 28.4 58 28.4 54 Z";
      return {
        back: `<path d="${mass}" fill="${c}" />` + shade(mass),
        front:
          `<path d="${front}" fill="${c}" />` +
          strands([
            "M40 31.4 L41 22",
            "M48 31.8 L48.6 20",
            "M56 32 L56.2 18",
            "M64 32 L63.8 18",
            "M72 31.8 L71.4 20",
            "M80 31.4 L79 22",
            "M31 50 C31.6 56 33 61 35 64",
            "M89 50 C88.4 56 87 61 85 64",
          ]) +
          `<path d="M35 30.8 C50 32.6 70 32.6 85 30.8" stroke="rgba(25,10,5,0.25)" stroke-width="0.6" fill="none" />` +
          shineRibbon(
            p,
            "M34 21 C42 11.6 78 11.6 86 21 C78 16.6 42 16.6 34 23.4 Z",
            "M41 16.4 Q60 9.6 79 16.4",
          ) +
          glints(["M30.6 44 C30.4 51 31.4 57 33 61"]),
      };
    }
    case "space_buns": {
      const mass =
        "M60 9 C80 9 91 22 90 40 C89.6 52 92 62 90 70 C86 72 82 70 80 66 L40 66 C38 70 34 72 30 70 C28 62 30.4 52 30 40 C29 22 40 9 60 9 Z";
      const spike = (ax: number, ay: number, tx: number, ty: number) =>
        `<path d="M${ax - 1.5} ${ay} Q${(ax + tx) / 2 - 0.6} ${(ay + ty) / 2} ${tx} ${ty} Q${(ax + tx) / 2 + 0.6} ${(ay + ty) / 2} ${ax + 1.5} ${ay} Z" fill="${c}" />`;
      // Messy Y2K bun with flyaway spikes, drawn left and mirrored right
      const bun =
        spike(31.4, 9, 26.4, 3.4) +
        spike(35.6, 6, 34.4, -1) +
        spike(40, 7.4, 43.6, 1.8) +
        `<circle cx="36" cy="13" r="8.6" fill="${c}" />` +
        `<path d="M28.4 11.4 C30 5.6 40.4 4.4 43.6 10.4" stroke="rgba(25,10,5,0.25)" stroke-width="0.8" fill="none" />` +
        `<path d="M31.6 8.6 C34 6.4 38 6.4 40.4 8.2" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" stroke-linecap="round" fill="none" />`;
      const cap =
        "M31 48 C28.6 25 42 10 60 10 C78 10 91.4 25 89 48 L85.6 48 C85 37 79.6 29 71.4 25.6 C66 23.6 62 23 60 23 C58 23 54 23.6 48.6 25.6 C40.4 29 35 37 34.4 48 Z";
      const piece =
        "M38.6 26 C34.4 34 35.4 44 34.6 54 C34 60 35 64 36.4 68 C32.8 66 31 60 31.4 52 C31.8 42 32.6 32 38.6 26 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          bun +
          `<g ${MIRROR}>${bun}</g>`,
        front:
          `<path d="${cap}" fill="${c}" />` +
          // Frosted money-piece tendrils
          `<path d="${piece}" fill="${c}" />` +
          `<path d="${piece}" fill="rgba(255,240,215,0.42)" />` +
          `<path d="${piece}" ${MIRROR} fill="${c}" />` +
          `<path d="${piece}" ${MIRROR} fill="rgba(255,240,215,0.42)" />` +
          strands(["M57 22 C50 24 42 29 37 38", "M63 22 C70 24 78 29 83 38"]) +
          `<path d="M60 22.6 L58.4 19.6 L61.6 16.6 L58.4 13.6 L60.6 10.6" stroke="rgba(25,10,5,0.35)" stroke-width="0.8" stroke-linejoin="round" fill="none" />` +
          shineRibbon(
            p,
            "M38 26 C46 15 74 15 82 26 C74 20 46 20 38 28 Z",
            "M45 20 Q52 15.6 56 15.6",
          ),
      };
    }
    case "sleek_straight": {
      const mass =
        "M60 6 C83 6 94.6 21 93.8 40 C93.4 60 95 84 93.6 100 C92.6 106 88 110 82 110.6 Q71 108.4 60 110.6 Q49 108.4 38 110.6 C32 110 27.4 106 26.4 100 C25 84 26.6 60 26.2 40 C25.4 21 37 6 60 6 Z";
      const panel =
        "M34.2 40 C32.6 54 33 70 33.8 86 C34.2 93 34.6 99 35 103.4 C32.4 104.4 29.8 104.4 27.8 103.6 C27.4 92 27.4 78 27.8 62 C28.2 50 29.4 42 31.4 37 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          strands([
            "M38 66 L37.6 106",
            "M82 66 L82.4 106",
            "M46 72 L45.8 107.6",
            "M74 72 L74.2 107.6",
          ]) +
          glints(["M29.4 56 C28.8 70 29 86 30.4 100"]),
        front:
          `<path d="${MIDDLE_PART_CAP}" fill="${c}" />` +
          `<path d="${panel}" fill="${c}" />` +
          `<path d="${panel}" ${MIRROR} fill="${c}" />` +
          strands([
            "M59 22.6 C52 25 41 29 36 42",
            "M61 22.6 C68 25 79 29 84 42",
            "M31 48 L31.2 100",
            "M89 48 L88.8 100",
          ]) +
          // Glassy shine bands down both panels
          glints(["M30.6 50 C30.2 62 30.4 76 31.4 90"]) +
          shineRibbon(
            p,
            "M36 26 C44 13 76 13 84 26 C76 18.6 44 18.6 36 28 Z",
            "M43 19.4 Q52 13.6 58 13.8",
          ),
      };
    }
    case "braided_topknot": {
      const braids = hairArt("box_braids", c, p);
      const up = [
        "M44 25 C47 18 52 13 55.4 10",
        "M51.4 21.6 C53.4 16 56 12.6 58 10.6",
      ];
      const swept = up.map((d) => braidStroke(d, c, 2.2)).join("");
      return {
        back: braids.back + braidedBun(c),
        front:
          braids.front +
          swept +
          `<g ${MIRROR}>${swept}</g>` +
          babyHairs(c, [
            [46.4, 27.6],
            [39.2, 32.4],
          ]),
      };
    }
    case "big_curls": {
      const mass =
        "M60 0 C88 0 104 20 104 46 C104 70 106 96 96 116 C88 122 72 122 60 120 C48 122 32 122 24 116 C14 96 16 70 16 46 C16 20 32 0 60 0 Z";
      // Curl cloud framing the whole upper body, from the crown to the hips
      const backCurls: readonly Curl[] = [
        [54, 1, 8.6],
        [42, 5, 8.6],
        [30, 15, 8.6],
        [21, 29, 9],
        [16, 44, 9.4],
        [14.4, 60, 9.6],
        [15, 76, 9.6],
        [18, 92, 9.4],
        [24, 106, 9],
        [34, 114, 8.4],
        [46, 118, 7.8],
      ];
      const sideCurls: readonly Curl[] = [
        [32, 38, 6.4],
        [29.6, 50, 6.8],
        [29.6, 62, 6.8],
        [31.6, 73.4, 6.2],
        [31, 84.4, 6],
        [33.4, 95, 5.6],
      ];
      const topCurls: readonly Curl[] = [
        [36, 22, 7.4],
        [45, 13, 8],
        [57, 9, 8.2],
      ];
      return {
        back:
          curlCloud(backCurls, c, mass) +
          shade(mass, 0.18) +
          glints(
            [
              "M10 52 C8.4 62 8.6 72 10.4 82",
              "M14 94 C16.6 102 21 108 27 112",
              "M24 22 C28 14 34 9 41 7",
            ],
            true,
            "rgba(255,255,255,0.55)",
          ),
        front:
          curlCloud([...topCurls, ...sideCurls], c, SIDE_PART_CAP) +
          babyHairs(c, [
            [41.6, 32.6],
            [36.6, 39.4],
          ]) +
          shineRibbon(
            p,
            "M40 22 C47 14 73 14 80 22 C73 18 47 18 40 24 Z",
            "M46 16.6 Q52 13.2 57 13.4",
          ),
      };
    }
    case "afro_puffs": {
      const puff = fluffy(33, 13, 12.4, 14, 1.4);
      const cap =
        "M33.4 44 C31.6 22 44 10.6 60 10.6 C76 10.6 88.4 22 86.6 44 C86 37 84 32 81.4 28.8 C75.6 23 68 21.6 60 21.6 C52 21.6 44.4 23 38.6 28.8 C36 32 34 37 33.4 44 Z";
      const puffArt =
        `<path d="${puff}" fill="${c}" />` +
        `<path d="${puff}" fill="rgba(25,10,5,0.12)" />` +
        // Coily texture and soft crown highlight
        strands(
          [
            "M27 9 q1.4 -1.6 2.8 0 q1.4 1.6 2.8 0",
            "M30 15 q1.4 -1.6 2.8 0 q1.4 1.6 2.8 0",
            "M24.6 17.4 q1.4 -1.6 2.8 0",
            "M35 6 q1.4 -1.6 2.8 0",
            "M36.6 18 q1.4 -1.6 2.8 0",
          ],
          0.28,
        ) +
        `<path d="M26 7.6 C29 3.6 35 2.6 39 5" stroke="rgba(255,255,255,0.45)" stroke-width="1.4" stroke-linecap="round" fill="none" />`;
      return {
        back: puffArt + `<g ${MIRROR}>${puffArt}</g>`,
        front:
          `<path d="${cap}" fill="${c}" />` +
          `<path d="M60 21.6 L60 11.4" stroke="rgba(25,10,5,0.35)" stroke-width="0.7" />` +
          strands([
            "M58.6 21.6 C52 22.4 44 24.6 38.6 29",
            "M61.4 21.6 C68 22.4 76 24.6 81.4 29",
          ]) +
          // Laid baby-hair swirls at the temples
          `<path d="M38.8 29.6 Q35.8 31 37.4 33.2 Q38.8 34.8 36.8 35.8 M41.6 27.4 Q39.4 28.2 40.4 29.8" stroke="${c}" stroke-width="0.75" stroke-linecap="round" fill="none" />` +
          `<path d="M81.2 29.6 Q84.2 31 82.6 33.2 Q81.2 34.8 83.2 35.8 M78.4 27.4 Q80.6 28.2 79.6 29.8" stroke="${c}" stroke-width="0.75" stroke-linecap="round" fill="none" />` +
          // Hot pink puff ties
          `<ellipse cx="41.6" cy="20.2" rx="3.6" ry="1.8" fill="#ff5fa2" transform="rotate(48 41.6 20.2)" />` +
          `<ellipse cx="78.4" cy="20.2" rx="3.6" ry="1.8" fill="#ff5fa2" transform="rotate(-48 78.4 20.2)" />` +
          shineRibbon(
            p,
            "M42 22 C48 16 72 16 78 22 C72 19.4 48 19.4 42 24 Z",
            "M48 18 Q54 15.4 58 15.4",
          ),
      };
    }
    case "half_up": {
      const mass =
        "M60 7 C82 7 95 21 94.4 42 C94 56 97 67 101.4 76 C97.4 80.4 91 79.6 87.6 75.4 C86.6 80 81.6 82 77.4 80.4 L42.6 80.4 C38.4 82 33.4 80 32.4 75.4 C29 79.6 22.6 80.4 18.6 76 C23 67 26 56 25.6 42 C25 21 38 7 60 7 Z";
      const cap =
        "M31.6 48 C29.4 23 42.4 9.4 60 9.4 C77.6 9.4 90.6 23 88.4 48 C87.4 40 85.4 34 82.4 30 C76 24 68 21.6 60 21.6 C52 21.6 44 24 37.6 30 C34.6 34 32.6 40 31.6 48 Z";
      const flip =
        "M34.2 42 C31.6 53 32.4 62 35.6 70.4 C37 74.6 35.2 78.6 30.8 79.6 C27.4 80.4 24.2 79 22.6 76.4 C27.2 76.8 29.8 75 29.2 70.4 C28 60 28.8 50 31.2 43 Z";
      const knot = fluffy(60, 7, 6.2, 9, 0.9);
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          strands(["M27 50 C26 62 25 70 21 76", "M93 50 C94 62 95 70 99 76"]) +
          glints(["M25.4 50 C25 58 24 66 21.6 72"]),
        front:
          `<path d="${cap}" fill="${c}" />` +
          `<path d="${flip}" fill="${c}" />` +
          `<path d="${flip}" ${MIRROR} fill="${c}" />` +
          strands([
            "M40 30 C46 20 54 14 60 12",
            "M80 30 C74 20 66 14 60 12",
            "M50 22.6 C54 17 57 14 60 12.4",
            "M70 22.6 C66 17 63 14 60 12.4",
          ]) +
          // Mini top knot with a chunky scrunchie
          `<path d="${knot}" fill="${c}" />` +
          `<path d="M56.4 4.6 C58.4 2.6 62 2.6 63.8 4.4" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round" fill="none" />` +
          `<ellipse cx="60" cy="12.2" rx="5.2" ry="2.2" fill="#b48be0" />` +
          `<path d="M55.4 12.2 Q57 10.6 58.4 12.2 Q60 10.6 61.6 12.2 Q63 10.6 64.6 12.2" stroke="#e2d0ff" stroke-width="0.7" fill="none" />` +
          `<path d="M37 30 C34 38 37.6 43.6 35 51" stroke="${c}" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
          glints(["M30.6 50 Q29.8 58 31 66"]) +
          shineRibbon(
            p,
            "M39 24 C47 15.4 73 15.4 81 24 C73 19.6 47 19.6 39 26 Z",
            "M46 19 Q60 14 72 17.6",
          ),
      };
    }
    case "pigtails": {
      const shell =
        "M60 8 C80 8 91 22 90 40 C89.6 50 90 58 88 64 L32 64 C30 58 30.4 50 30 40 C29 22 40 8 60 8 Z";
      const bubbles: readonly [number, number, number, number][] = [
        [28.6, 48, 5.6, 6.8],
        [26.6, 61.6, 5.2, 6.4],
        [25.8, 74.6, 4.8, 6],
        [26.4, 86.4, 4, 5],
      ];
      const pigtail =
        bubbles
          .map(
            ([cx, cy, rx, ry]) =>
              `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" />` +
              `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${p}-shine)" opacity="0.5" />` +
              `<path d="M${n(cx - rx * 0.5)} ${n(cy - ry * 0.55)} Q${cx} ${n(cy - ry * 0.85)} ${n(cx + rx * 0.4)} ${n(cy - ry * 0.6)}" stroke="rgba(255,255,255,0.55)" stroke-width="0.9" stroke-linecap="round" fill="none" />`,
          )
          .join("") +
        bubbles
          .slice(0, 3)
          .map(
            ([cx, cy, , ry]) =>
              `<rect x="${n(cx - 3.2)}" y="${n(cy + ry - 0.9)}" width="6.4" height="1.8" rx="0.9" fill="#ff5fa2" />`,
          )
          .join("") +
        `<path d="M33.4 38 C31.6 40 30.6 42 30.4 44" stroke="${c}" stroke-width="3.4" stroke-linecap="round" />` +
        `<circle cx="32.6" cy="40.4" r="1.9" fill="#7fd3ff" />`;
      return {
        back: `<path d="${shell}" fill="${c}" />` + shade(shell),
        front:
          `<path d="${MIDDLE_PART_CAP}" fill="${c}" />` +
          pigtail +
          `<g ${MIRROR}>${pigtail}</g>` +
          strands([
            "M59 22.6 C52 25 41 29 36 42",
            "M61 22.6 C68 25 79 29 84 42",
          ]) +
          shineRibbon(
            p,
            "M36 26 C44 13 76 13 84 26 C76 18.6 44 18.6 36 28 Z",
            "M43 19.4 Q52 13.6 58 13.8",
          ),
      };
    }
    case "messy_bun": {
      const shell =
        "M60 9 C79 9 90 21 89.4 40 C89.2 48 88 54 86 58 L34 58 C32 54 30.8 48 30.6 40 C30 21 41 9 60 9 Z";
      const bun = fluffy(60, 8.6, 7.2, 11, 1.1);
      const cap =
        "M32.2 46 C30.2 22 43 9.6 60 9.6 C77 9.6 89.8 22 87.8 46 C86.8 39 85 33.6 82.2 30 C76 24 68 21.6 60 21.6 C52 21.6 44 24 37.8 30 C35 33.6 33.2 39 32.2 46 Z";
      const tendril =
        "M37 29 C33.4 36 38.4 42 35.2 49 C33 54 36.4 58 34.2 63.4";
      return {
        back:
          `<path d="${shell}" fill="${c}" />` +
          shade(shell) +
          `<path d="${bun}" fill="${c}" />` +
          strands([
            "M53.4 5.4 C56 1.6 64 1.2 67 5",
            "M54.4 10 C57 7 63.6 7 66 10",
            "M53 7.6 C55 10 58.6 10.8 61.4 9.2",
          ]) +
          // Loose flyaway loops
          `<path d="M52.4 4.4 C48.6 0.6 46.2 4 49.4 6.8 M67.8 4 C71.6 0.4 74.4 4 71 6.6" stroke="${c}" stroke-width="1" fill="none" />`,
        front:
          `<path d="${cap}" fill="${c}" />` +
          strands([
            "M40 29 C46 19 53 14 60 12",
            "M80 29 C74 19 67 14 60 12",
            "M50 22.6 C53 17 57 13.6 60 12",
          ]) +
          // Tortoiseshell claw clip gripping the bun
          `<path d="M52.4 9.6 C52 6.4 54.4 4.6 56 6 L57.6 9.6 L59 5.2 L60.6 9.6 L62.2 5.2 L63.6 9.6 L65.4 6 C67 4.6 69 6.4 68 9.6 Z" fill="#a0522d" />` +
          `<path d="M54 8.6 L56 7.6 M62 7.2 L64 8.2 M58.6 8.6 L60.4 7.8" stroke="#e8a35c" stroke-width="0.8" stroke-linecap="round" />` +
          `<rect x="52.4" y="9" width="15.6" height="2" rx="1" fill="#7b3a1a" />` +
          `<path d="${tendril}" stroke="${c}" stroke-width="1.7" stroke-linecap="round" fill="none" />` +
          `<path d="${tendril}" ${MIRROR} stroke="${c}" stroke-width="1.7" stroke-linecap="round" fill="none" />` +
          shineRibbon(
            p,
            "M39 24 C47 15.4 73 15.4 81 24 C73 19.6 47 19.6 39 26 Z",
            "M46 19 Q60 14 72 17.6",
          ),
      };
    }
    case "pixie_spikes": {
      const shell =
        "M60 9 C78 9 89 20 88.6 38 C88.4 46 87 52 85 56 L35 56 C33 52 31.6 46 31.4 38 C31 20 42 9 60 9 Z";
      const spikes =
        "M32.4 44 L28.6 33.4 L33.6 33.6 L30.8 22.6 L37.6 25.6 L37.8 14 L44.6 19.4 L48.6 7.6 L53.6 15.6 L59.6 5.4 L63.4 14.6 L70.6 7.4 L72.4 16.8 L80 12.4 L80 21.6 L87.6 20.4 L85.6 28.6 L91.4 31.6 L87.6 37.2 L88.2 44 C87 38.4 85 34.2 82 31 L77.4 30.2 L73.4 25.2 L68.6 29.4 L63.2 24.4 L57.6 29.6 L52.4 25 L47 29.8 L42.4 26.4 L38.8 31 C36 34.6 33.8 38.6 32.4 44 Z";
      const tips =
        "M37.8 14 L39.6 16.8 L36.6 17.2 Z M48.6 7.6 L49.8 11 L46.8 10.8 Z M59.6 5.4 L60.4 9 L57.6 8.4 Z M70.6 7.4 L70.6 11 L68 10 Z M80 12.4 L79.4 15.8 L77 14.4 Z M30.8 22.6 L33.2 24.6 L30.6 25.8 Z M87.6 20.4 L86 23.4 L84.2 21.4 Z";
      return {
        back: `<path d="${shell}" fill="${c}" />` + shade(shell),
        front:
          `<path d="${spikes}" fill="${c}" />` +
          // Frosted Y2K tips
          `<path d="${tips}" fill="rgba(255,244,220,0.7)" />` +
          strands([
            "M44 26 L46.6 18",
            "M52.6 25.4 L54 15.6",
            "M63.2 24.4 L63 14.6",
            "M73.4 25.2 L72 16.6",
          ]) +
          // Pointed sideburns
          `<path d="M33.6 38 L31.6 53 L35.6 45 Z" fill="${c}" />` +
          `<path d="M86.4 38 L88.4 53 L84.4 45 Z" fill="${c}" />` +
          shineRibbon(
            p,
            "M40 22 C47 14.6 73 14.6 80 22 C73 18.4 47 18.4 40 24 Z",
            "M47 17 Q60 13 72 16",
          ),
      };
    }
    case "side_swoop": {
      const mass =
        "M60 6 C83 6 95 22 94 42 C93.4 58 96 74 94 94 C88 98 82 96 79 92 L41 92 C38 96 32 98 26 94 C24 74 26.6 58 26 42 C25 22 37 6 60 6 Z";
      const cap =
        "M30.6 50 C28 24 41 7 60 7 C80 7 93 24 90.6 50 C90.4 60 92 70 95 79 C90 79 86.6 75 86 69 C85.4 61 86 53 85.6 47 C85 39 82 33.4 77 30.8 C70 28.4 61 30.2 53 27.6 C48 26 44.6 22.4 42.6 17 C40.8 23 38 30.4 35.8 38 C34.8 42 34.4 46 34.2 50 Z";
      const leftPanel =
        "M34.2 44 C32.8 58 33.4 72 35.2 88 C33 89.4 30.4 89.4 28.2 88.4 C27.4 74 27.6 60 29.4 47 C29.8 44 30.6 42 31.4 40 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          strands([
            "M29 58 C28 72 29 84 27.6 93",
            "M91 58 C92 72 91 84 92.4 93",
            "M36 70 L35.4 92",
          ]) +
          glints(["M30 54 C29.4 66 29.6 78 30.4 90"]),
        front:
          `<path d="${cap}" fill="${c}" />` +
          `<path d="${leftPanel}" fill="${c}" />` +
          strands([
            "M43.4 18.4 C48 25 60 27.4 72 28",
            "M45 14 C52 21 66 23 80 27.4",
            "M50 11 C62 15 78 18 88 30",
            "M87.6 50 C88 60 89 68 91.6 76",
            "M31.6 50 C31 62 31.4 74 32 86",
          ]) +
          `<path d="M42.6 17 L41.2 11" stroke="rgba(25,10,5,0.3)" stroke-width="0.7" />` +
          glints(["M30.8 52 C30.2 62 30.4 74 31.4 84"], false) +
          shineRibbon(
            p,
            "M46 18 C56 12 74 13 84 22 C74 17.4 58 17 48 21.4 Z",
            "M54 15 Q66 12.6 76 16",
          ),
      };
    }
    case "crimped": {
      const mass = zigzagMane(98, 1.8);
      const panel =
        "M34.2 40 L31 44 L33.6 48 L30.4 52 L33 56 L29.8 60 L32.4 64 L29.2 68 L31.8 72 L28.6 76 L31.2 80 L28 84 L30.6 88 L27.4 92 L22.6 92 L25.4 88 L22.8 84 L25.6 80 L23 76 L25.8 72 L23.4 68 L26.2 64 L23.8 60 L26.6 56 L24.4 52 L27.2 48 L25.4 44 L28.4 40 L30.6 37.6 Z";
      const crimps = [0, 1, 2, 3, 4, 5, 6, 7]
        .map((i) => zigzagLine(24 + i * 9.6, 44, 100, 1.4))
        .join(" ");
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          `<path d="${crimps}" stroke="rgba(25,10,5,0.22)" stroke-width="0.7" stroke-linejoin="round" fill="none" />` +
          `<path d="${zigzagLine(96, 50, 96, 1.4)}" stroke="rgba(255,255,255,0.35)" stroke-width="0.9" stroke-linejoin="round" fill="none" />`,
        front:
          `<path d="${MIDDLE_PART_CAP}" fill="${c}" />` +
          `<path d="${panel}" fill="${c}" />` +
          `<path d="${panel}" ${MIRROR} fill="${c}" />` +
          `<path d="${zigzagLine(28.6, 46, 88, 1.2)}" stroke="rgba(25,10,5,0.25)" stroke-width="0.6" stroke-linejoin="round" fill="none" />` +
          `<path d="${zigzagLine(91.4, 46, 88, 1.2)}" stroke="rgba(25,10,5,0.25)" stroke-width="0.6" stroke-linejoin="round" fill="none" />` +
          strands([
            "M59 22.6 C52 25 41 29 36 42",
            "M61 22.6 C68 25 79 29 84 42",
          ]) +
          shineRibbon(
            p,
            "M36 26 C44 13 76 13 84 26 C76 18.6 44 18.6 36 28 Z",
            "M43 19.4 Q52 13.6 58 13.8",
          ),
      };
    }
    case "mermaid_waves": {
      const mass =
        "M60 6 C83 6 95 22 94 42 C97 50 101 56 99 64 C97 72 92 76 95 84 C98 92 102 98 99 106 C96 114 92 118 95 126 C97 132 96 136 93 140 Q87 145 81 139 Q75 145 68 138 L52 138 Q45 145 39 139 Q33 145 27 140 C24 136 23 132 25 126 C28 118 24 114 21 106 C18 98 22 92 25 84 C28 76 23 72 21 64 C19 56 23 50 26 42 C25 22 37 6 60 6 Z";
      const wave =
        "M34.4 40 C32 50 35.8 57 33.4 66 C31.2 74 35.2 80 32.6 89 C30.4 97 34 102 31.4 110 C30 114 26.4 114.6 24.6 112 C27.4 106 24.4 100 26.4 92 C28.4 84 25 78 27 70 C29 62 25.4 54 27.8 45 C28.6 42 30.4 39 31.2 37.6 Z";
      const sparkles =
        `<path d="M30 96 l0.6 1.4 1.4 0.6 -1.4 0.6 -0.6 1.4 -0.6 -1.4 -1.4 -0.6 1.4 -0.6 Z" fill="#ffffff" opacity="0.9" />` +
        `<path d="M90 120 l0.6 1.4 1.4 0.6 -1.4 0.6 -0.6 1.4 -0.6 -1.4 -1.4 -0.6 1.4 -0.6 Z" fill="#ffffff" opacity="0.85" />` +
        `<circle cx="27" cy="126" r="0.7" fill="#ffffff" opacity="0.8" />` +
        `<circle cx="93" cy="104" r="0.6" fill="#ffffff" opacity="0.8" />`;
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass, 0.18) +
          `<path d="${mass}" fill="url(#${p}-mermaid)" />` +
          strands([
            "M28 60 C25 74 30 86 27 100 C25 112 29 124 27 136",
            "M92 60 C95 74 90 86 93 100 C95 112 91 124 93 136",
            "M34 80 C31 92 35 104 33 118 C32 126 34 132 33 137",
            "M86 80 C89 92 85 104 87 118 C88 126 86 132 87 137",
          ]) +
          glints([
            "M22.4 60 Q21 64 22.6 69",
            "M22.2 100 Q20.8 104 22.6 109",
            "M33 74 C31 82 34 90 32 98",
          ]) +
          sparkles,
        front:
          `<path d="${MIDDLE_PART_CAP}" fill="${c}" />` +
          `<path d="${wave}" fill="${c}" />` +
          `<path d="${wave}" ${MIRROR} fill="${c}" />` +
          `<path d="${wave}" fill="url(#${p}-mermaid)" />` +
          `<path d="${wave}" ${MIRROR} fill="url(#${p}-mermaid)" />` +
          strands([
            "M59 16 C52 22 42 26 36 40",
            "M61 16 C68 22 78 26 84 40",
            "M31.2 46 C29.6 56 32.4 64 30 72 C28.6 80 31.6 88 29 96",
            "M88.8 46 C90.4 56 87.6 64 90 72 C91.4 80 88.4 88 91 96",
          ]) +
          `<path d="M50 22 l0.5 1.1 1.1 0.5 -1.1 0.5 -0.5 1.1 -0.5 -1.1 -1.1 -0.5 1.1 -0.5 Z" fill="#ffffff" />` +
          shineRibbon(
            p,
            "M36 26 C44 13 76 13 84 26 C76 18.6 44 18.6 36 28 Z",
            "M43 19.4 Q52 13.6 58 13.8",
          ),
      };
    }
    case "goddess_locs": {
      const mass =
        "M60 6 C83 6 95 22 94 42 C93 60 95 86 94 108 C89 112 84 110 80 106 L40 106 C36 110 31 112 26 108 C25 86 27 60 26 42 C25 22 37 6 60 6 Z";
      const backLocs = [
        ["M28 44 C26 72 30 94 28 114", "26.5 68", "27.5 96"],
        ["M34 54 C32 78 35 98 34 114", "32.5 82", "33.5 106"],
        ["M92 44 C94 72 90 94 92 114", "90.5 68", "91.5 96"],
        ["M86 54 C88 78 85 98 86 114", "84.5 82", "85.5 106"],
      ] as const;
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass, 0.25) +
          backLocs
            .map(([d, cuff1, cuff2]) => {
              const [c1x, c1y] = cuff1.split(" ");
              const [c2x, c2y] = cuff2.split(" ");
              return (
                `<path d="${d}" stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none" />` +
                `<path d="${d}" stroke="rgba(20,8,4,0.3)" stroke-width="3" stroke-dasharray="0.8 1.4" fill="none" />` +
                `<rect x="${c1x}" y="${c1y}" width="3.2" height="2" rx="0.6" fill="#f4c542" />` +
                `<rect x="${c2x}" y="${c2y}" width="3.2" height="2" rx="0.6" fill="#f4c542" />`
              );
            })
            .join(""),
        front:
          `<path d="${MIDDLE_PART_CAP}" fill="${c}" />` +
          `<path d="M34 40 C32 58 35 76 33 96" stroke="${c}" stroke-width="2.8" stroke-linecap="round" fill="none" />` +
          `<path d="M34 40 C32 58 35 76 33 96" stroke="rgba(20,8,4,0.3)" stroke-width="2.8" stroke-dasharray="0.8 1.4" fill="none" />` +
          `<path d="M86 40 C88 58 85 76 87 96" stroke="${c}" stroke-width="2.8" stroke-linecap="round" fill="none" />` +
          `<path d="M86 40 C88 58 85 76 87 96" stroke="rgba(20,8,4,0.3)" stroke-width="2.8" stroke-dasharray="0.8 1.4" fill="none" />` +
          `<rect x="32" y="62" width="3.4" height="2.2" rx="0.6" fill="#f4c542" />` +
          `<rect x="84.6" y="62" width="3.4" height="2.2" rx="0.6" fill="#f4c542" />` +
          `<path d="M33 96 Q37 102 33 108" stroke="${c}" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
          `<path d="M87 96 Q83 102 87 108" stroke="${c}" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
          shineRibbon(
            p,
            "M36 26 C44 14 76 14 84 26 C76 18 44 18 36 28 Z",
            "M43 19 Q52 14 58 14",
          ),
      };
    }
    case "fulani_braids": {
      const mass =
        "M60 6 C83 6 95 22 94 42 C93 60 95 86 94 108 C89 112 84 110 80 106 L40 106 C36 110 31 112 26 108 C25 86 27 60 26 42 C25 22 37 6 60 6 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass, 0.28) +
          [
            ["M30 46 C28 72 30 92 28.6 110", "28.6 111"],
            ["M90 46 C92 72 90 92 91.4 110", "91.4 110"],
            ["M37 56 C35 78 37 96 36 110", "36 111"],
            ["M83 56 C85 78 83 96 84 110", "84 111"],
          ]
            .map(([d, end], i) =>
              braid(d, c, i % 2 ? "#f4c542" : "#ffffff", end),
            )
            .join(""),
        front:
          `<path d="${MIDDLE_PART_CAP}" fill="${c}" />` +
          // Center-part cornrow braid down to the forehead with cowrie bead
          `<line x1="60" y1="9" x2="60" y2="28" stroke="${c}" stroke-width="2.4" stroke-dasharray="0.8 1.1" />` +
          `<circle cx="60" cy="29" r="1.6" fill="#f4c542" stroke="#ffffff" stroke-width="0.3" />` +
          `<circle cx="59.5" cy="28.4" r="0.5" fill="#ffffff" />` +
          // Side cornrow braids with beads
          braid("M34 38 C32 54 34 72 32 88", c, "#f4c542", "32 89") +
          braid("M86 38 C88 54 86 72 88 88", c, "#f4c542", "88 89") +
          shineRibbon(
            p,
            "M37 25 C45 13 75 13 83 25 C75 18 45 18 37 27 Z",
            "M44 18 Q52 13 58 13",
          ),
      };
    }
    case "afro_puff": {
      const puff = fluffy(60, 8, 26, 18, 2.8);
      const cap =
        "M31 48 C28 24 42 12 60 12 C78 12 92 24 89 48 L85 48 C83 34 76 22 60 22 C44 22 37 34 35 48 Z";
      return {
        back:
          `<path d="${puff}" fill="${c}" />` +
          shade(puff, 0.22) +
          `<circle cx="52" cy="6" r="1.2" fill="rgba(255,255,255,0.4)" />` +
          `<circle cx="68" cy="8" r="1.4" fill="rgba(255,255,255,0.4)" />`,
        front:
          `<path d="${cap}" fill="${c}" />` +
          // Hot pink satin puff scrunchie
          `<ellipse cx="60" cy="20" rx="10" ry="3.8" fill="#ff3d9a" />` +
          `<path d="M52 20 Q56 17 60 20 Q64 17 68 20" stroke="#ffb3d4" stroke-width="0.9" fill="none" />` +
          // Swirled baby hair edges along hairline
          `<path d="M42 27 Q46 29 44 33 Q41 34 43 37" stroke="${c}" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
          `<path d="M78 27 Q74 29 76 33 Q79 34 77 37" stroke="${c}" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
          shineRibbon(
            p,
            "M36 26 C44 14 76 14 84 26 C76 18 44 18 36 28 Z",
            "M43 19 Q52 14 58 14",
          ),
      };
    }
    case "afro_halo": {
      const halo = fluffy(60, 36, 40, 24, 3.4);
      return {
        back:
          `<path d="${halo}" fill="${c}" />` +
          shade(halo, 0.2) +
          `<circle cx="36" cy="22" r="1.4" fill="rgba(255,255,255,0.35)" />` +
          `<circle cx="84" cy="22" r="1.4" fill="rgba(255,255,255,0.35)" />` +
          `<circle cx="60" cy="8" r="1.6" fill="rgba(255,255,255,0.38)" />`,
        front:
          `<path d="M33.6 42 C32 24 44 11 60 11 C76 11 88 24 86.4 42 C82 32 72 25.4 60 25.4 C48 25.4 38 32 33.6 42 Z" fill="${c}" />` +
          // Edge baby hairs
          `<path d="M44 26 Q47 28 45 32" stroke="${c}" stroke-width="1.3" stroke-linecap="round" fill="none" />` +
          `<path d="M76 26 Q73 28 75 32" stroke="${c}" stroke-width="1.3" stroke-linecap="round" fill="none" />` +
          shineRibbon(
            p,
            "M38 20 C46 10 74 10 82 20 C74 15 46 15 38 22 Z",
            "M45 15 Q60 11 71 14",
          ),
      };
    }
    case "spiral_coils": {
      const mass =
        "M60 6 C84 6 97 22 96 44 C95 58 98 70 96 86 C94 98 97 108 94 116 C90 120 84 118 80 114 L40 114 C36 118 30 120 26 116 C23 108 26 98 24 86 C22 70 25 58 24 44 C23 22 36 6 60 6 Z";
      return {
        back:
          curlCloud(
            ringlets(
              [
                [25.8, 48, 112],
                [32.6, 60, 112],
              ],
              3.8,
            ),
            c,
            mass,
          ) + shade(mass, 0.22),
        front:
          curlCloud(ringlets([[32.8, 40, 78]], 3.4), c, SIDE_PART_CAP) +
          shineRibbon(
            p,
            "M36 26 C44 13 76 13 84 26 C76 18.6 44 18.6 36 28 Z",
            "M43 19.4 Q52 13.6 58 13.8",
          ),
      };
    }
    case "topknot": {
      const bun =
        "M60 -2 C68 -2 74 3 73 11 C72 17 67 21 60 21 C53 21 48 17 47 11 C46 3 52 -2 60 -2 Z";
      const tendril = "M36.4 28 C33 38 37 48 34 58 C32 64 35 70 33 76";
      return {
        back:
          `<path d="${bun}" fill="${c}" />` +
          shade(bun, 0.25) +
          `<path d="M53 6 C56 0 64 0 67 6" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round" fill="none" />`,
        front:
          `<path d="${MIDDLE_PART_CAP}" fill="${c}" />` +
          // Gold metallic bun cuff
          `<ellipse cx="60" cy="18" rx="8" ry="3" fill="#f4c542" />` +
          `<circle cx="60" cy="18" r="0.8" fill="#ffffff" />` +
          // Two sleek face-framing tendrils
          `<path d="${tendril}" stroke="${c}" stroke-width="2.0" stroke-linecap="round" fill="none" />` +
          `<path d="${tendril}" ${MIRROR} stroke="${c}" stroke-width="2.0" stroke-linecap="round" fill="none" />` +
          shineRibbon(
            p,
            "M38 24 C46 14 74 14 82 24 C74 18 46 18 38 26 Z",
            "M45 18 Q60 13 71 17",
          ),
      };
    }
    case "blowout":
    default: {
      const mass =
        "M 60 2 C 86 2 99 18 98 40 C 97 50 98.61 58 97.98 68 C 97.26 76 96.64 84 97.89 87.6 C 98.92 90.4 101.6 89.6 103.26 87 C 104.91 84.6 107.88 85 107.88 88 C 108.08 93 104 98 98.4 101 C 92.8 104 85.6 104 79.2 104 L 40.8 104 C 34.4 104 27.2 104 21.6 101 C 16 98 11.92 93 12.12 88 C 12.12 85 15.09 84.6 16.74 87 C 18.4 89.6 21.08 90.4 22.11 87.6 C 23.36 84 22.74 76 22.02 68 C 21.39 58 23 50 22 40 C 21 18 34 2 60 2 Z";
      const cap =
        "M31 50 C27 24 41 6.6 60 6.6 C80 6.6 93.4 24 89.4 50 C87.8 42 86 36 82.8 31.6 C78 27.4 70.4 28 64.4 26.2 C59 24.6 55 23 52 21 C48.6 25 43.6 28.6 39.4 33 C36 37.4 34.4 43 34.2 50 C33.4 47.4 32 48 31 50 Z";
      const flipLeft =
        "M34.4 40 C31.6 52 32 66 30.4 78 C29.4 86 26 92 19 94 C15 95 11 94 8.6 91.6 C14 92 18.6 88.6 21 82 C24 72 27.6 58 28.2 50 C28.6 46 30 42 31.2 40 Z";
      const flipRight =
        "M85.6 40 C88.4 52 88 66 89.6 78 C90.6 86 94 92 101 94 C105 95 109 94 111.4 91.6 C106 92 101.4 88.6 99 82 C96 72 92.4 58 91.8 50 C91.4 46 90 42 88.8 40 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          strands([
            "M27 50 C25 66 22 80 14 94",
            "M93 50 C95 66 98 80 106 94",
            "M34 60 C32 74 30 88 26 101",
            "M86 60 C88 74 90 88 94 101",
          ]) +
          glints(["M24.4 48 C23.6 60 21.6 72 17.6 84"]),
        front:
          `<path d="${cap}" fill="${c}" />` +
          `<path d="${flipLeft}" fill="${c}" />` +
          `<path d="${flipRight}" fill="${c}" />` +
          strands([
            "M52 15 C60 22 72 24.4 80 30",
            "M55 11.4 C66 16 80 18 86.6 31",
            "M50 16.4 C44 22 38.6 28 35.4 38",
            "M32 50 C31 62 30 74 27 84",
            "M88 50 C89 62 90 74 93 84",
          ]) +
          glints(["M30.4 50 C29.8 58 29.4 66 28 74"]) +
          shineRibbon(
            p,
            "M36 26 C44 12 76 11.4 85 24 C76 16.4 46 17 36.6 29 Z",
            "M44 18 Q52 12.4 60 11.6",
          ),
      };
    }
  }
}

/** Long and curly cuts whose back hair puffs out wide like the doll art. */
const BIG_VOLUME: ReadonlySet<HairStyle> = new Set([
  "butterfly_waves",
  "sleek_straight",
  "side_swoop",
  "half_up",
  "mermaid_waves",
  "big_curls",
  "spiral_coils",
  "crimped",
  "box_braids",
  "braided_topknot",
  "goddess_locs",
  "fulani_braids",
  "afro_halo",
]);

/* -------------------------------------------------------------
 * Layer 1: Hair Back
 * ------------------------------------------------------------- */
export function renderLayer1HairBack(look: AvatarLook, p: string): string {
  const hairColor = escapeXml(look.hairColor || "#4a3728");
  const style = resolveHairStyle(look.hairId);
  const cls = style.replace(/_/g, "-");
  return (
    `<g class="avatar-hair-back hair-${cls}">` +
    // Puffed out past the front pieces: long cuts get big doll volume
    `<g transform="translate(60 26) scale(${BIG_VOLUME.has(style) ? "1.1 1.05" : "1.04 1.02"}) translate(-60 -26)">` +
    inked(hairArt(style, hairColor, p).back, 1.1) +
    `</g>` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Streak dye: chunky Y2K face-framing pieces (viewer-left, mirrored)
 * ------------------------------------------------------------- */
/** Band hugging the hairline from the part down to the temple. */
const STREAK_BAND =
  "M58.6 20.2 C56 21.6 52.4 22.8 48.4 24.2 C39.4 27.8 33.6 36 33 48 L27.6 48 C27.4 31 35 19.6 45.6 15 C50.6 12.8 54.6 10.6 57.4 8.6 Z";

/** Stripe down a long face-framing panel. */
const STREAK_PANEL =
  "M33 44 C31.4 54 33.6 60 32 68 C30.6 75 32.6 79 30.6 86 L26 85 C28 79 26.4 73 27.6 66 C29 58 26.8 52 28 44 Z";

const STREAK_FLIP =
  "M33 44 C31.4 54 31.6 66 30.2 78 C29.4 85 26.6 90.4 20.6 92.4 L18 90.6 C22.4 88.6 25 84 26.2 78 C27.6 66 27.8 54 28.6 44 Z";

const STREAK_TENDRIL =
  "M36.6 29 C33.2 37 37.6 43.6 34.8 51.4 C32.8 57 35.8 61.6 33.6 66.6";

/** Viewer-left streak markup for a style; mirrored for the right side. */
function streakPieces(style: HairStyle, color: string): string {
  const fill = (d: string) => `<path d="${d}" fill="${color}" />`;
  switch (style) {
    case "high_pony":
    case "messy_bun":
      return (
        fill(
          "M37.8 29.4 C35 33 33.2 38.4 32.4 45 L34.6 45 C35.2 39 36.8 34 39.8 30.6 Z",
        ) +
        `<path d="${STREAK_TENDRIL}" stroke="${color}" stroke-width="1.8" stroke-linecap="round" fill="none" />`
      );
    case "pixie_spikes":
      return fill("M42.4 26.4 L47 29.8 L52.4 25 L50.6 17.4 L44.6 19.4 Z");
    case "space_buns":
      return fill(
        "M38.6 26 C34.4 34 35.4 44 34.6 54 C34 60 35 64 36.4 68 C32.8 66 31 60 31.4 52 C31.8 42 32.6 32 38.6 26 Z",
      );
    case "blowout":
    case "half_up":
      return fill(STREAK_BAND) + fill(STREAK_FLIP);
    case "blunt_bob":
      return (
        fill("M40.2 31 L41 17 L46.6 15 L47.4 31.6 Z") +
        fill("M30.4 46 C30.2 52 31.2 58 33.4 63 L36 64 C34 58 33 52 33 46 Z")
      );
    case "butterfly_waves":
    case "sleek_straight":
    case "crimped":
    case "mermaid_waves":
    case "side_swoop":
      return fill(STREAK_BAND) + fill(STREAK_PANEL);
    default:
      return fill(STREAK_BAND);
  }
}

function renderHairStreak(style: HairStyle, streak?: string): string {
  if (!streak || !streak.trim()) return "";
  const color = escapeXml(streak.trim());
  const left = streakPieces(style, color);
  return `<g class="hair-streak">` + left + `<g ${MIRROR}>${left}</g>` + `</g>`;
}

export function renderBangs(look: AvatarLook, c: string): string {
  const bangs = look.bangsId ?? "none";
  if (!bangs || bangs === "none") return "";
  let art = "";
  switch (bangs) {
    case "curtain_bangs":
      art =
        `<path d="M48 24 Q53 32 50 42 C48 38 46 32 46 26 Z" fill="${c}" />` +
        `<path d="M72 24 Q67 32 70 42 C72 38 74 32 74 26 Z" fill="${c}" />` +
        `<path d="M49 26 Q52 33 49 40" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none" />` +
        `<path d="M71 26 Q68 33 71 40" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none" />`;
      break;
    case "blunt_bangs":
      art =
        `<path d="M36 30 C46 32 74 32 84 30 L83 38 C74 40 46 40 37 38 Z" fill="${c}" />` +
        `<path d="M40 32 L40 37 M50 33 L50 38 M60 33 L60 38 M70 33 L70 38 M80 32 L80 37" stroke="rgba(25,10,5,0.3)" stroke-width="0.7" />` +
        `<path d="M42 34 Q60 36 78 34" stroke="rgba(255,255,255,0.4)" stroke-width="0.9" fill="none" />`;
      break;
    case "wispy_tendrils":
      art =
        `<path d="M37 30 C33 42 36 54 34 66" stroke="${c}" stroke-width="1.9" stroke-linecap="round" fill="none" />` +
        `<path d="M83 30 C87 42 84 54 86 66" stroke="${c}" stroke-width="1.9" stroke-linecap="round" fill="none" />` +
        `<path d="M37 32 C34 42 36 52 34 64" stroke="rgba(255,255,255,0.45)" stroke-width="0.7" stroke-linecap="round" fill="none" />` +
        `<path d="M83 32 C86 42 84 52 86 64" stroke="rgba(255,255,255,0.45)" stroke-width="0.7" stroke-linecap="round" fill="none" />`;
      break;
    case "baby_edges":
      art =
        `<path d="M40 26 Q45 28 43 32 Q40 34 42 37" stroke="${c}" stroke-width="1.4" stroke-linecap="round" fill="none" />` +
        `<path d="M80 26 Q75 28 77 32 Q80 34 78 37" stroke="${c}" stroke-width="1.4" stroke-linecap="round" fill="none" />` +
        `<path d="M50 22 Q54 24 52 27" stroke="${c}" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
        `<path d="M70 22 Q66 24 68 27" stroke="${c}" stroke-width="1.2" stroke-linecap="round" fill="none" />`;
      break;
    case "side_sweep":
      art =
        `<path d="M33 26 C48 28 68 36 78 44 C68 36 48 31 33 29 Z" fill="${c}" />` +
        `<path d="M38 28 C50 31 66 37 74 42" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" fill="none" />`;
      break;
  }
  return `<g class="avatar-bangs bangs-${bangs.replace(/_/g, "-")}">${art}</g>`;
}

/* -------------------------------------------------------------
 * Layer 6: Hair Front (Anchor_HeadCenter at 60, 38)
 * ------------------------------------------------------------- */
export function renderLayer6HairFront(look: AvatarLook, p: string): string {
  const hairColor = escapeXml(look.hairColor || "#4a3728");
  const style = resolveHairStyle(look.hairId);
  const cls = style.replace(/_/g, "-");
  return (
    `<g class="avatar-hair-front hair-${cls}">` +
    inked(hairArt(style, hairColor, p).front, 1.1) +
    renderHairStreak(style, look.hairStreak) +
    inked(renderBangs(look, hairColor), 1.1) +
    renderHairClips(look) +
    `</g>`
  );
}

/** Clip spots along the part and hairline, viewer-left side (mirrored). */
const CLIP_SPOTS = [
  [53.2, 13.4, -15],
  [43.6, 18.6, -35],
  [35.8, 27.4, -60],
] as const;

const CLIP_COLORS = ["#c9a6ff", "#7fd3ff", "#ff9ad5"] as const;

function star(x: number, y: number, r: number, fill: string): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 ? r * 0.45 : r;
    return `${n(x + Math.cos(a) * radius)} ${n(y + Math.sin(a) * radius)}`;
  });
  return `<path d="M${points.join(" L")} Z" fill="${fill}" stroke="#2a1610" stroke-width="0.5" stroke-linejoin="round" />`;
}

/** Butterfly, star, or rhinestone clips pinned along the hairline. */
export function renderHairClips(look: AvatarLook): string {
  const id = findOption(HAIR_CLIPS, look.hairClipId)?.id;
  if (!id || id === "none") return "";
  if (id === "tiara") {
    // Crystal tiara resting on the crown in front of the hair
    const peaks = [
      [46, 15.4, 3.4],
      [53, 11.6, 4.6],
      [60, 10.2, 6.2],
      [67, 11.6, 4.6],
      [74, 15.4, 3.4],
    ] as const;
    return (
      `<g class="avatar-hair-clips clips-tiara">` +
      `<path d="M41 19.6 Q60 10.4 79 19.6 L78.4 21.8 Q60 12.8 41.6 21.8 Z" fill="#f4c542" stroke="${INK}" stroke-width="0.6" stroke-linejoin="round" />` +
      peaks
        .map(
          ([x, y, h]) =>
            `<path d="M${n(x - 1.8)} ${n(y + 1.6)} L${x} ${n(y - h)} L${n(x + 1.8)} ${n(y + 1.6)} Z" fill="#f4c542" stroke="${INK}" stroke-width="0.6" stroke-linejoin="round" />` +
            `<circle cx="${x}" cy="${n(y - h * 0.3)}" r="${x === 60 ? 1.6 : 0.9}" fill="${x === 60 ? "#ff5fa2" : "#e6f4ff"}" stroke="${INK}" stroke-width="0.4" />`,
        )
        .join("") +
      `<path d="M47 16.8 Q53 13.8 58 13" stroke="#fff4b8" stroke-width="0.7" stroke-linecap="round" fill="none" />` +
      `</g>`
    );
  }
  const side = CLIP_SPOTS.map(([x, y, angle], i) => {
    switch (id) {
      case "butterfly_clips":
        return butterflyClip(x, y, CLIP_COLORS[i], angle);
      case "star_clips":
        return star(x, y, 2.2, i % 2 ? "#fff1a8" : "#ffd34d");
      default:
        return (
          `<rect x="${n(x - 2.6)}" y="${n(y - 0.8)}" width="5.2" height="1.6" rx="0.8" fill="#e6ecf5" stroke="#2a1610" stroke-width="0.5" transform="rotate(${angle} ${x} ${y})" />` +
          `<circle cx="${n(x - 1.2)}" cy="${y}" r="0.45" fill="#ffffff" /><circle cx="${n(x + 0.6)}" cy="${y}" r="0.45" fill="#ffffff" />`
        );
    }
  }).join("");
  const inkedSide = inked(side, 0.45);
  return `<g class="avatar-hair-clips clips-${id.replace(/_/g, "-")}">${inkedSide}<g ${MIRROR}>${inkedSide}</g></g>`;
}

/** Shared gradient for glossy hair shine ribbons. */
export function hairDefs(p: string): string {
  return (
    `<linearGradient id="${p}-shine" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0" />` +
    `<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.75" />` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0" />` +
    `</linearGradient>` +
    `<linearGradient id="${p}-mermaid" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#ff9ad5" stop-opacity="0.2" />` +
    `<stop offset="0.5" stop-color="#7fe9ff" stop-opacity="0.14" />` +
    `<stop offset="1" stop-color="#b48be0" stop-opacity="0.22" />` +
    `</linearGradient>`
  );
}
