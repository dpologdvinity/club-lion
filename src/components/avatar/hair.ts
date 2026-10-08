import type { AvatarLook, HairStyle } from "../../types/world.ts";
import { resolveHairStyle } from "../../types/world.ts";
import { MIRROR, escapeXml } from "./shared.ts";

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
 * Layer 6: Hair Front (Anchor_HeadCenter at 60, 38)
 * ------------------------------------------------------------- */
export function renderLayer6HairFront(look: AvatarLook, p: string): string {
  const hairColor = escapeXml(look.hairColor || "#4a3728");
  const style = resolveHairStyle(look.hairId);
  const cls = style.replace(/_/g, "-");
  return (
    `<g class="avatar-hair-front hair-${cls}">` +
    hairArt(style, hairColor, p).front +
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
    `</linearGradient>`
  );
}
