import type { AvatarLook, HairStyle } from "../../types/world.ts";
import { resolveHairStyle } from "../../types/world.ts";
import { MIRROR, escapeXml, n } from "./shared.ts";

/* -------------------------------------------------------------
 * Hairstyles: each cut provides a back mass and a face-framing front
 * ------------------------------------------------------------- */
type HairArt = { back: string; front: string };

/** Darkens a hair mass so the front layer reads as closer and glossier. */
function shade(d: string, opacity = 0.22): string {
  return `<path d="${d}" fill="rgba(25, 10, 5, ${opacity})" />`;
}

function strands(paths: readonly string[], opacity = 0.2): string {
  return paths
    .map(
      (d) =>
        `<path d="${d}" stroke="rgba(25, 10, 5, ${opacity})" stroke-width="0.8" stroke-linecap="round" fill="none" />`,
    )
    .join("");
}

/** Glossy shine ribbon: a soft gradient band plus a crisp specular streak. */
function shineRibbon(p: string, band: string, streak: string): string {
  return (
    `<g class="hair-highlight">` +
    `<path d="${band}" fill="url(#${p}-shine)" />` +
    `<path d="${streak}" stroke="rgba(255,255,255,0.7)" stroke-width="0.9" stroke-linecap="round" fill="none" />` +
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
    `<ellipse cx="-2.6" cy="-1.8" rx="0.9" ry="0.5" fill="#ffffff" opacity="0.7" />` +
    `<rect x="-0.45" y="-2.6" width="0.9" height="5" rx="0.45" fill="#3a2a4a" />` +
    `</g>`
  );
}

function braid(d: string, color: string, bead: string, end: string): string {
  const [bx, by] = end.split(" ");
  return (
    `<path d="${d}" stroke="${color}" stroke-width="2.6" stroke-linecap="round" fill="none" />` +
    `<path d="${d}" stroke="rgba(25,10,5,0.35)" stroke-width="2.6" stroke-dasharray="0.7 1.3" fill="none" />` +
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

/** Glossy ringlet curls with a spiral and a highlight on each. */
function curls(list: readonly Curl[], c: string): string {
  return list
    .map(
      ([cx, cy, r]) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" />` +
        `<path d="M${n(cx - r * 0.6)} ${n(cy + r * 0.1)} C${n(cx - r * 0.5)} ${n(cy - r * 0.7)} ${n(cx + r * 0.7)} ${n(cy - r * 0.6)} ${n(cx + r * 0.55)} ${n(cy + r * 0.2)} C${n(cx + r * 0.4)} ${n(cy + r * 0.7)} ${n(cx - r * 0.3)} ${n(cy + r * 0.5)} ${n(cx - r * 0.1)} ${n(cy)}" stroke="rgba(25,10,5,0.28)" stroke-width="0.8" fill="none" />` +
        `<path d="M${n(cx - r * 0.55)} ${n(cy - r * 0.35)} Q${n(cx - r * 0.2)} ${n(cy - r * 0.8)} ${n(cx + r * 0.3)} ${n(cy - r * 0.7)}" stroke="rgba(255,255,255,0.5)" stroke-width="0.9" stroke-linecap="round" fill="none" />`,
    )
    .join("");
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
          `<path d="M84 18 C88 30 88 44 92 58" stroke="rgba(255,255,255,0.35)" stroke-width="1.4" stroke-linecap="round" fill="none" />`,
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
      const mass =
        "M60 7 C82 7 94 22 93 42 C92 54 97 64 94.6 76 C92.6 86 97.6 96 94 108 C92 112.6 88 113 85 110 C82.4 113.6 77.6 113.6 75 110.4 C72 112.6 68 112 66 109 L54 109 C52 112 48 112.6 45 110.4 C42.4 113.6 37.6 113.6 35 110 C32 113 28 112.6 26 108 C22.4 96 27.4 86 25.4 76 C23 64 28 54 27 42 C26 22 38 7 60 7 Z";
      const cap =
        "M30.6 48 C28.6 24 42 8 60 8 C78 8 91.4 24 89.4 48 L85.8 48 C85.2 37 79.4 29 70.6 25.6 C66 24 62 23 60 21.4 C58 23 54 24 49.4 25.6 C40.6 29 34.8 37 34.2 48 Z";
      const wave =
        "M34.4 40 C32.2 50 35.8 56 33.6 64 C31.6 71 34.8 76 32.2 82.6 C30 87 26.4 87 24.6 84.6 C27.4 80.4 25 74.4 26.4 68 C28.2 60 25.4 52 27.8 44 C28.6 41 30.4 39 31.2 37.6 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          strands([
            "M28 60 C25 72 30 84 27 98 C26 104 28 108 30 110",
            "M92 60 C95 72 90 84 93 98 C94 104 92 108 90 110",
            "M34 74 C31 84 35 94 33 106",
            "M86 74 C89 84 85 94 87 106",
          ]),
        front:
          `<path d="${cap}" fill="${c}" />` +
          `<path d="${wave}" fill="${c}" />` +
          `<path d="${wave}" ${MIRROR} fill="${c}" />` +
          strands([
            "M59 16 C52 22 42 26 36 40",
            "M61 16 C68 22 78 26 84 40",
            "M31.2 46 C29.6 54 32 60 30 68 C28.6 74 30.6 78 28.6 82",
            "M88.8 46 C90.4 54 88 60 90 68 C91.4 74 89.4 78 91.4 82",
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
              "M58 17.4 C54 24 47 30 42 40",
              "M61 16 C68 21 76 25 83 36",
              "M62 17.4 C66 24 73 30 78 40",
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
          `<path d="M30.6 46 C30.4 52 31.4 57 33 61" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round" fill="none" />`,
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
        "M60 7 C82 7 93 22 92.4 40 C92 60 93 84 92.6 106 C78 109.4 42 109.4 27.4 106 C27 84 28 60 27.6 40 C27 22 38 7 60 7 Z";
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
          `<path d="M89 46 L89.4 100" stroke="rgba(255,255,255,0.3)" stroke-width="1.6" stroke-linecap="round" />`,
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
          // Glassy vertical shine down both panels
          `<path d="M30.4 54 L30.6 92" stroke="rgba(255,255,255,0.45)" stroke-width="1.1" stroke-linecap="round" />` +
          `<path d="M89.6 54 L89.4 92" stroke="rgba(255,255,255,0.45)" stroke-width="1.1" stroke-linecap="round" />` +
          shineRibbon(
            p,
            "M36 26 C44 13 76 13 84 26 C76 18.6 44 18.6 36 28 Z",
            "M43 19.4 Q52 13.6 58 13.8",
          ),
      };
    }
    case "big_curls": {
      const mass =
        "M60 4 C86 4 101 22 100 44 C99.6 60 103 74 98 86 C92 92 80 90 76 84 L44 84 C40 90 28 92 22 86 C17 74 20.4 60 20 44 C19 22 34 4 60 4 Z";
      const backCurls: readonly Curl[] = [
        [21, 50, 8],
        [20, 64, 8.4],
        [23, 78, 8],
        [31, 87, 7],
      ];
      const sideCurls: readonly Curl[] = [
        [32, 38, 6.4],
        [29.6, 50, 6.8],
        [29.6, 62, 6.8],
        [31.6, 73.4, 6.2],
      ];
      const topCurls: readonly Curl[] = [
        [36, 22, 7.4],
        [45, 13, 8],
        [57, 9, 8.2],
      ];
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          curls(backCurls, c) +
          `<g ${MIRROR}>${curls(backCurls, c)}</g>` +
          shade(mass, 0.18),
        front:
          `<path d="${SIDE_PART_CAP}" fill="${c}" />` +
          curls(topCurls, c) +
          `<g ${MIRROR}>${curls(topCurls, c)}</g>` +
          curls(sideCurls, c) +
          `<g ${MIRROR}>${curls(sideCurls, c)}</g>` +
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
          strands(["M27 50 C26 62 25 70 21 76", "M93 50 C94 62 95 70 99 76"]),
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
          ]),
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
        "M60 6 C83 6 95 22 94 42 C93 56 98 66 95.6 80 C93.6 92 99 104 96 118 C93.6 128 98 134 94 140 C88 144 82 141 79 137 C75 141 68 141 66 137 L54 137 C52 141 45 141 41 137 C38 141 32 144 26 140 C22 134 26.4 128 24 118 C21 104 26.4 92 24.4 80 C22 66 27 56 26 42 C25 22 37 6 60 6 Z";
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
    case "blowout":
    default: {
      const mass =
        "M60 5 C84 5 97 20 96 42 C95 56 98 67 103 76 C99 80.6 92 79.6 88.4 75 C87.6 79.6 82.4 82 77.6 80.4 L42.4 80.4 C37.6 82 32.4 79.6 31.6 75 C28 79.6 21 80.6 17 76 C22 67 25 56 24 42 C23 20 36 5 60 5 Z";
      const cap =
        "M31 50 C27 24 41 6.6 60 6.6 C80 6.6 93.4 24 89.4 50 C87.8 42 86 36 82.8 31.6 C78 27.4 70.4 28 64.4 26.2 C59 24.6 55 23 52 21 C48.6 25 43.6 28.6 39.4 33 C36 37.4 34.4 43 34.2 50 C33.4 47.4 32 48 31 50 Z";
      const flipLeft =
        "M34.4 40 C31.4 52 32.4 62 36 70.4 C37.4 74.6 35.6 78.8 31 79.8 C27.4 80.6 24 79 22.4 76.2 C27.2 76.8 30 75 29.4 70.4 C28.2 60 28.8 50 31.2 42 Z";
      const flipRight =
        "M85.6 36 C89 48 87.4 60 84 70.4 C82.6 74.6 84.4 78.8 89 79.8 C92.6 80.6 96 79 97.6 76.2 C92.8 76.8 90 75 90.6 70.4 C91.8 60 91.6 48 89.4 38 Z";
      return {
        back:
          `<path d="${mass}" fill="${c}" />` +
          shade(mass) +
          strands([
            "M27 50 C26 62 24 70 20 76",
            "M93 50 C94 62 96 70 100 76",
            "M32 56 C31 66 30 72 27 77.4",
            "M88 56 C89 66 90 72 93 77.4",
          ]),
        front:
          `<path d="${cap}" fill="${c}" />` +
          `<path d="${flipLeft}" fill="${c}" />` +
          `<path d="${flipRight}" fill="${c}" />` +
          strands([
            "M52 15 C60 22 72 24.4 80 30",
            "M55 11.4 C66 16 80 18 86.6 31",
            "M50 16.4 C44 22 38.6 28 35.4 38",
            "M32.2 50 C31.4 60 32.6 68 33.6 74",
            "M87.8 50 C88.6 60 87.4 68 86.4 74",
          ]) +
          shineRibbon(
            p,
            "M36 26 C44 12 76 11.4 85 24 C76 16.4 46 17 36.6 29 Z",
            "M44 18 Q52 12.4 60 11.6",
          ),
      };
    }
  }
}

/* -------------------------------------------------------------
 * Layer 1: Hair Back
 * ------------------------------------------------------------- */
export function renderLayer1HairBack(look: AvatarLook, p: string): string {
  const hairColor = escapeXml(look.hairColor || "#4a3728");
  const style = resolveHairStyle(look.hairId);
  const cls = style.replace(/_/g, "-");
  return (
    `<g class="avatar-hair-back hair-${cls}">` +
    hairArt(style, hairColor, p).back +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Streak dye: chunky Y2K face-framing pieces (viewer-left, mirrored)
 * ------------------------------------------------------------- */
/** Band hugging the hairline from the part down to the temple. */
const STREAK_BAND =
  "M58.6 20.2 C56 21.6 52.4 22.8 48.4 24.2 C39.4 27.8 33.6 36 33 48 L30.4 48 C31 34.6 37.6 25.4 47.4 21.6 C51.6 20 55 18.6 57.2 17 Z";

/** Stripe down a long face-framing panel. */
const STREAK_PANEL =
  "M32.6 44 C31.4 54 33.6 60 32 68 C30.6 75 32.6 79 30.6 84 L28.4 83 C30 78 28.6 73 30 66 C31.4 58 29 52 30.4 44 Z";

const STREAK_FLIP =
  "M33 44 C31 54 31.6 63 34.4 71 C35.4 74.4 34 77.8 30.4 78.6 C29 78.8 27.6 78.6 26.6 78 C29.6 77 31 75 30.6 71 C29.6 62 29.6 52 31 44 Z";

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

/* -------------------------------------------------------------
 * Layer 6: Hair Front (Anchor_HeadCenter at 60, 38)
 * ------------------------------------------------------------- */
export function renderLayer6HairFront(look: AvatarLook, p: string): string {
  const hairColor = escapeXml(look.hairColor || "#4a3728");
  const style = resolveHairStyle(look.hairId);
  const cls = style.replace(/_/g, "-");
  return (
    `<g class="avatar-hair-front hair-${cls}">` +
    hairArt(style, hairColor, p).front +
    renderHairStreak(style, look.hairStreak) +
    `</g>`
  );
}

/** Shared gradient for glossy hair shine ribbons. */
export function hairDefs(p: string): string {
  return (
    `<linearGradient id="${p}-shine" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0" />` +
    `<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.62" />` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0" />` +
    `</linearGradient>` +
    `<linearGradient id="${p}-mermaid" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#ff9ad5" stop-opacity="0.28" />` +
    `<stop offset="0.5" stop-color="#7fe9ff" stop-opacity="0.22" />` +
    `<stop offset="1" stop-color="#b48be0" stop-opacity="0.3" />` +
    `</linearGradient>`
  );
}
