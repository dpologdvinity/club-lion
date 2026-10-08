import type {
  AvatarLook,
  SkinTone,
  EyeStyle,
  HairStyle,
  EntityAction,
} from "../types/world.ts";
import { DEFAULT_AVATAR_LOOK, resolveHairStyle } from "../types/world.ts";

export const SKIN_TONE_COLORS: Record<SkinTone, string> = {
  fair: "#ffe3d1",
  tan: "#dfa77b",
  warm: "#e8b082",
  espresso: "#784421",
  bronze: "#ab7143",
  deep: "#5c3826",
};

export const ANCHORS = {
  HeadCenter: { x: 60, y: 38 },
  Neck: { x: 60, y: 68 },
  Waist: { x: 60, y: 98 },
  HandRight: { x: 32, y: 92 },
  HandLeft: { x: 88, y: 92 },
  Feet: { x: 60, y: 142 },
} as const;

export function resolveSkinTone(tone?: string): string {
  if (!tone) return SKIN_TONE_COLORS.warm;
  if (tone in SKIN_TONE_COLORS) {
    return SKIN_TONE_COLORS[tone as SkinTone];
  }
  if (tone.startsWith("#") || tone.startsWith("rgb")) {
    return escapeXml(tone);
  }
  return SKIN_TONE_COLORS.warm;
}

/**
 * Escapes characters for safe inclusion in SVG attributes/text.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Rounds a coordinate to two decimals for compact path data. */
function n(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** Mirrors viewer-left artwork onto the viewer-right side of the 120-wide canvas. */
const MIRROR = `transform="matrix(-1 0 0 1 120 0)"`;

const INK = "#2a1610";

/* -------------------------------------------------------------
 * Glam makeup presets per eye style
 * ------------------------------------------------------------- */
type EyeState = number | "closed";

type GlamPreset = {
  lidLeft: EyeState;
  lidRight: EyeState;
  shadow: string;
  iris: readonly [string, string, string];
  lips: string;
  wing: number;
  browLift: number;
  smoky?: boolean;
  glitter?: boolean;
  smirk?: boolean;
};

const GLAM_PRESETS: Record<EyeStyle, GlamPreset> = {
  winged_glam: {
    lidLeft: 0.14,
    lidRight: 0.14,
    shadow: "#b8704c",
    iris: ["#d29a52", "#8c5626", "#2e1a0c"],
    lips: "#c65a6b",
    wing: 1,
    browLift: 0,
  },
  smoky_cat: {
    lidLeft: 0.3,
    lidRight: 0.3,
    shadow: "#7b4f9e",
    iris: ["#9be08a", "#3f8a4f", "#14301b"],
    lips: "#9c2f55",
    wing: 1.35,
    browLift: 0,
    smoky: true,
  },
  sparkle: {
    lidLeft: 0,
    lidRight: 0,
    shadow: "#e7889f",
    iris: ["#c4a8ff", "#6a49b4", "#24143f"],
    lips: "#e46f92",
    wing: 0.8,
    browLift: -0.6,
    glitter: true,
  },
  wink: {
    lidLeft: 0.08,
    lidRight: "closed",
    shadow: "#de8a62",
    iris: ["#e0ab5c", "#93592a", "#2f190b"],
    lips: "#d2506a",
    wing: 1,
    browLift: 0,
    smirk: true,
  },
  sleepy: {
    lidLeft: 0.46,
    lidRight: 0.46,
    shadow: "#a65d7a",
    iris: ["#c98e5c", "#7a4523", "#28140a"],
    lips: "#b8505f",
    wing: 1.1,
    browLift: 0.4,
  },
  smirk: {
    lidLeft: 0.24,
    lidRight: 0.3,
    shadow: "#c4823e",
    iris: ["#f2bb57", "#a5611b", "#3a2006"],
    lips: "#b8303f",
    wing: 1.2,
    browLift: 0,
    smirk: true,
  },
};

function resolveGlamPreset(eyeStyle?: string): {
  style: EyeStyle;
  preset: GlamPreset;
} {
  const style = (
    eyeStyle && eyeStyle in GLAM_PRESETS ? eyeStyle : "winged_glam"
  ) as EyeStyle;
  return { style, preset: GLAM_PRESETS[style] };
}

/* -------------------------------------------------------------
 * Shared gradients & clip paths (IDs are prefixed per avatar)
 * ------------------------------------------------------------- */
function hashLook(look: AvatarLook): string {
  const source = JSON.stringify(look);
  let hash = 5381;
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) + hash + source.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function sanitizeIdPrefix(prefix: string): string {
  const clean = prefix.replace(/[^A-Za-z0-9_-]/g, "");
  return /^[A-Za-z]/.test(clean) ? clean : `av${clean}`;
}

function renderDefs(p: string, preset: GlamPreset): string {
  const [irisLight, irisMid, irisDark] = preset.iris;
  return (
    `<defs>` +
    `<radialGradient id="${p}-iris" cx="50%" cy="62%" r="58%">` +
    `<stop offset="0" stop-color="${irisLight}" />` +
    `<stop offset="0.55" stop-color="${irisMid}" />` +
    `<stop offset="1" stop-color="${irisDark}" />` +
    `</radialGradient>` +
    `<linearGradient id="${p}-shadow" x1="0" y1="1" x2="0" y2="0">` +
    `<stop offset="0" stop-color="${preset.shadow}" stop-opacity="0.95" />` +
    `<stop offset="0.55" stop-color="${preset.shadow}" stop-opacity="0.55" />` +
    `<stop offset="1" stop-color="${preset.shadow}" stop-opacity="0" />` +
    `</linearGradient>` +
    `<radialGradient id="${p}-blush" cx="50%" cy="50%" r="50%">` +
    `<stop offset="0" stop-color="#ff5f86" stop-opacity="0.5" />` +
    `<stop offset="1" stop-color="#ff5f86" stop-opacity="0" />` +
    `</radialGradient>` +
    `<linearGradient id="${p}-shine" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0" />` +
    `<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.62" />` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0" />` +
    `</linearGradient>` +
    `<linearGradient id="${p}-gloss" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.5" />` +
    `<stop offset="0.6" stop-color="#ffffff" stop-opacity="0.12" />` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0" />` +
    `</linearGradient>` +
    `<clipPath id="${p}-eye-l"><path d="${eyeGeometry(preset.lidLeft).sclera}" /></clipPath>` +
    `<clipPath id="${p}-eye-r"><path d="${eyeGeometry(preset.lidRight).sclera}" /></clipPath>` +
    `</defs>`
  );
}

/* -------------------------------------------------------------
 * Layer 0: Shadow & Board / Sparkle Trails
 * ------------------------------------------------------------- */
function renderLayer0ShadowAndBoard(look: AvatarLook, action: string): string {
  const parts: string[] = [];

  // Ground shadow
  parts.push(
    `<g class="avatar-shadow">` +
      `<ellipse cx="60" cy="147" rx="24" ry="5.5" fill="rgba(41, 75, 60, 0.22)" />` +
      `</g>`,
  );

  // Board item if equipped (e.g. hover_leaf)
  if (look.boardId) {
    const isMoving = action === "walk" || action === "dance";
    const sparkleMarkup =
      `<g class="sparkle-trail">` +
      `<path d="M42 148 L44 144 L46 148 L50 150 L46 152 L44 156 L42 152 L38 150 Z" fill="#2ecc71" opacity="0.8" />` +
      `<circle cx="78" cy="147" r="2" fill="#a3f7b5" opacity="0.75" />` +
      `<circle cx="34" cy="145" r="1.5" fill="#f1c40f" opacity="0.9" />` +
      `<path d="M74 151 L75 149 L76 151 L78 152 L76 153 L75 155 L74 153 L72 152 Z" fill="#2ecc71" opacity="0.85" />` +
      (isMoving
        ? `<circle cx="26" cy="149" r="1.8" fill="#58d68d" opacity="0.7" />` +
          `<circle cx="88" cy="149" r="1.8" fill="#58d68d" opacity="0.7" />`
        : "") +
      `</g>`;

    let boardContent = "";
    if (look.boardId === "hover_leaf") {
      boardContent =
        `<g class="avatar-board hover-leaf" transform="translate(0, 4)">` +
        sparkleMarkup +
        // Glowing hover leaf deck
        `<ellipse cx="60" cy="144" rx="38" ry="9" fill="rgba(46, 204, 113, 0.25)" filter="blur(2px)" />` +
        `<path d="M22 144 C22 138 60 137 98 144 C98 149 60 151 22 144 Z" fill="#2ecc71" stroke="#27ae60" stroke-width="1.5" />` +
        `<path d="M26 144 Q60 142 94 144" stroke="#a3f7b5" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
        `<path d="M45 143 Q52 140 56 144" stroke="#a3f7b5" stroke-width="0.8" fill="none" />` +
        `<path d="M64 144 Q68 140 75 143" stroke="#a3f7b5" stroke-width="0.8" fill="none" />` +
        `<circle cx="98" cy="144" r="2" fill="#f1c40f" />` +
        `</g>`;
    } else {
      // Generic skateboard / deck
      boardContent =
        `<g class="avatar-board generic-board" transform="translate(0, 4)">` +
        sparkleMarkup +
        `<rect x="24" y="141" width="72" height="7" rx="3.5" fill="#e67e22" stroke="#d35400" stroke-width="1.2" />` +
        `<circle cx="36" cy="148" r="3" fill="#2c3e50" />` +
        `<circle cx="84" cy="148" r="3" fill="#2c3e50" />` +
        `</g>`;
    }

    parts.push(boardContent);
  }

  return parts.join("\n");
}

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
function renderLayer1HairBack(look: AvatarLook, p: string): string {
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
 * Arms: shared by the body, sleeves, and handheld anchor
 * ------------------------------------------------------------- */
type Point = readonly [number, number];
type ArmPose = {
  shoulder: Point;
  elbowControl: Point;
  elbow: Point;
  wristControl: Point;
  wrist: Point;
  hand: Point;
  handAngle: number;
};

const RIGHT_ARM_DOWN: ArmPose = {
  shoulder: [49.4, 74.6],
  elbowControl: [45, 79.4],
  elbow: [43.6, 86.2],
  wristControl: [42.2, 92.4],
  wrist: [39.4, 96.4],
  hand: [38.2, 98.4],
  handAngle: 30,
};

const RIGHT_ARM_WAVE: ArmPose = {
  shoulder: [49.4, 74.6],
  elbowControl: [39.4, 75],
  elbow: [32.6, 68.4],
  wristControl: [27.6, 62.6],
  wrist: [26.8, 55.4],
  hand: [26.8, 52.6],
  handAngle: -5,
};

const LEFT_ARM_HIP: ArmPose = {
  shoulder: [70.6, 74.6],
  elbowControl: [78.4, 78.6],
  elbow: [80.8, 85.2],
  wristControl: [79.6, 91.6],
  wrist: [74.2, 95.6],
  hand: [72.4, 96.8],
  handAngle: -60,
};

function pt([x, y]: Point): string {
  return `${n(x)} ${n(y)}`;
}

function armPath(arm: ArmPose): string {
  return `M${pt(arm.shoulder)} Q${pt(arm.elbowControl)} ${pt(arm.elbow)} Q${pt(arm.wristControl)} ${pt(arm.wrist)}`;
}

/** Upper-arm portion of a pose, split at `t` along the shoulder-to-elbow curve. */
function upperArmPath(arm: ArmPose, t: number): string {
  const [x0, y0] = arm.shoulder;
  const [cx, cy] = arm.elbowControl;
  const [x1, y1] = arm.elbow;
  const q0: Point = [x0 + (cx - x0) * t, y0 + (cy - y0) * t];
  const q1: Point = [cx + (x1 - cx) * t, cy + (y1 - cy) * t];
  const end: Point = [q0[0] + (q1[0] - q0[0]) * t, q0[1] + (q1[1] - q0[1]) * t];
  return `M${pt(arm.shoulder)} Q${pt(q0)} ${pt(end)}`;
}

function handMarkup(arm: ArmPose, skin: string): string {
  const [hx, hy] = arm.hand;
  return (
    `<ellipse cx="${n(hx)}" cy="${n(hy)}" rx="2.3" ry="3" fill="${skin}" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />` +
    `<ellipse cx="${n(hx)}" cy="${n(hy + 2)}" rx="1.3" ry="0.8" fill="#ff5f9e" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />`
  );
}

function armMarkup(arm: ArmPose, skin: string): string {
  return (
    `<path d="${armPath(arm)}" stroke="${skin}" stroke-width="4.4" stroke-linecap="round" fill="none" />` +
    handMarkup(arm, skin)
  );
}

function rightArmFor(action: string): ArmPose {
  return action === "wave" ? RIGHT_ARM_WAVE : RIGHT_ARM_DOWN;
}

/* -------------------------------------------------------------
 * Layer 2: Body Base (Skin tones, head, neck, torso, arms, legs)
 * ------------------------------------------------------------- */
const HEAD_PATH =
  "M60 13 C76.4 13 86.4 23 86.2 38.4 C86 46.4 83.6 52 79.2 57 C74 62.6 66.4 67.2 60 67.2 C53.6 67.2 46 62.6 40.8 57 C36.4 52 34 46.4 33.8 38.4 C33.6 23 43.6 13 60 13 Z";

const LEG_PATH =
  "M49.4 99 L59 99 C59.2 108 58.2 118 56.6 131 L51.8 131 C50.8 118 49.2 108 49.4 99 Z";

function renderLayer2BodyBase(
  look: AvatarLook,
  action: string,
  p: string,
): string {
  const skin = resolveSkinTone(look.skinTone);
  const isWaving = action === "wave";
  const contour = "rgba(110, 50, 30, 0.16)";

  return (
    `<g class="avatar-body">` +
    // Long slender legs
    `<g class="avatar-legs">` +
    `<path d="${LEG_PATH}" fill="${skin}" />` +
    `<path d="${LEG_PATH}" ${MIRROR} fill="${skin}" />` +
    `<path d="M52.4 116 Q54 117 55.8 116" stroke="${contour}" stroke-width="0.6" fill="none" />` +
    `<path d="M64.2 116 Q66 117 67.6 116" stroke="${contour}" stroke-width="0.6" fill="none" />` +
    `</g>` +
    // Slim torso with defined waist
    `<path d="M48 72.4 C52 70.6 68 70.6 72 72.4 C73.2 78 70.8 84 67.8 91 C68.2 95 70.6 98.6 70.8 102 L49.2 102 C49.4 98.6 51.8 95 52.2 91 C49.2 84 46.8 78 48 72.4 Z" fill="${skin}" />` +
    `<path d="M57.6 96.4 Q60 97.4 62.4 96.4" stroke="${contour}" stroke-width="0.5" fill="none" />` +
    // Left arm, hand on hip (player's left, viewer's right)
    `<g class="avatar-left-arm">` +
    armMarkup(LEFT_ARM_HIP, skin) +
    `</g>` +
    // Right arm (player's right, viewer's left)
    (isWaving
      ? ""
      : `<g class="avatar-right-arm">${armMarkup(RIGHT_ARM_DOWN, skin)}</g>`) +
    // Graceful neck with chin shadow
    `<path d="M56.6 58 L63.4 58 L63.8 73 L56.2 73 Z" fill="${skin}" />` +
    `<path d="M56.4 63.4 Q60 68.6 63.6 63.4 L63.7 67.6 Q60 70.4 56.3 67.6 Z" fill="${contour}" />` +
    `<path d="M53.4 73.4 Q56 74.6 58.2 74" stroke="${contour}" stroke-width="0.5" fill="none" />` +
    `<path d="M66.6 73.4 Q64 74.6 61.8 74" stroke="${contour}" stroke-width="0.5" fill="none" />` +
    // Ears with gold hoops
    `<ellipse cx="34.6" cy="45" rx="3" ry="4.4" fill="${skin}" />` +
    `<ellipse cx="85.4" cy="45" rx="3" ry="4.4" fill="${skin}" />` +
    `<circle class="avatar-hoop" cx="34.4" cy="53" r="3.6" stroke="#f4c542" stroke-width="0.9" fill="none" />` +
    `<circle class="avatar-hoop" cx="85.6" cy="53" r="3.6" stroke="#f4c542" stroke-width="0.9" fill="none" />` +
    // Sculpted head: wide cheekbones tapering to a graceful chin
    `<path d="${HEAD_PATH}" fill="${skin}" />` +
    // Cheekbone contour, highlight, and blush
    `<path d="M37.6 50 Q41 57.4 47.4 61.6" stroke="rgba(110, 50, 30, 0.07)" stroke-width="3.2" stroke-linecap="round" fill="none" />` +
    `<path d="M82.4 50 Q79 57.4 72.6 61.6" stroke="rgba(110, 50, 30, 0.07)" stroke-width="3.2" stroke-linecap="round" fill="none" />` +
    `<ellipse cx="44.6" cy="53" rx="6.2" ry="3.6" fill="url(#${p}-blush)" />` +
    `<ellipse cx="75.4" cy="53" rx="6.2" ry="3.6" fill="url(#${p}-blush)" />` +
    `<ellipse cx="42.4" cy="50.6" rx="2.6" ry="1" fill="rgba(255,255,255,0.16)" transform="rotate(-20 42.4 50.6)" />` +
    `<ellipse cx="77.6" cy="50.6" rx="2.6" ry="1" fill="rgba(255,255,255,0.16)" transform="rotate(20 77.6 50.6)" />` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 3: Glam Face (eyeshadow, winged liner, lashes, brows, lips)
 * Eyes are drawn for the viewer's left and mirrored for the right.
 * ------------------------------------------------------------- */
const EYE_OUTER: Point = [40.6, 44.4];
const EYE_INNER: Point = [55.2, 46.4];

function eyeGeometry(lid: EyeState) {
  const drop = lid === "closed" ? 0 : lid;
  const u1: Point = [42.6, 38.6 + drop * 9.5];
  const u2: Point = [51.4, 38 + drop * 9];
  const l1: Point = [52.6, 50.6];
  const l2: Point = [44.4, 50.6];
  const lidCurve = `M${pt(EYE_OUTER)} C${pt(u1)} ${pt(u2)} ${pt(EYE_INNER)}`;
  return {
    u1,
    u2,
    lidCurve,
    sclera: `${lidCurve} C${pt(l1)} ${pt(l2)} ${pt(EYE_OUTER)} Z`,
  };
}

function cubicPoint(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

function lashes(points: readonly Point[], down: boolean): string {
  const lengths = [3, 2.8, 2.4, 2];
  return points
    .map(([x, y], i) => {
      const len = lengths[i] ?? 2;
      const dy = down ? len * 0.55 : -len;
      return `<path d="M${n(x)} ${n(y)} Q${n(x - len * 0.25)} ${n(y + dy * 0.75)} ${n(x - len * 0.75)} ${n(y + dy)}" stroke="${INK}" stroke-width="0.85" stroke-linecap="round" fill="none" />`;
    })
    .join("");
}

const BROW_PATH =
  "M55.8 35.4 C55.4 33.2 52 31.4 47.4 30.8 C44 30.4 41.2 31.8 39.4 34.4 C42 32.8 44.6 32.2 47.4 32.4 C51 32.6 54 33.6 55.8 35.4 Z";

const EYESHADOW_TOP = "L56.6 42.4 C52.4 33.2 43 33.4 38.8 41.2 Z";

function renderEye(
  side: "l" | "r",
  lid: EyeState,
  preset: GlamPreset,
  p: string,
  browLift: number,
): string {
  const geo = eyeGeometry(lid);
  const transform = side === "r" ? ` ${MIRROR}` : "";
  const brow = `<path d="${BROW_PATH}" fill="rgba(48, 26, 16, 0.88)" transform="translate(0 ${n(browLift)})" />`;
  const shadowFill = `url(#${p}-shadow)`;

  if (lid === "closed") {
    const closedCurve = `M${pt(EYE_OUTER)} C43.6 48.6 51.4 49.4 ${pt(EYE_INNER)}`;
    const lashPoints = [0.08, 0.2, 0.34].map((t) =>
      cubicPoint(EYE_OUTER, [43.6, 48.6], [51.4, 49.4], EYE_INNER, t),
    );
    return (
      `<g class="avatar-eye eye-${side} eye-closed"${transform}>` +
      brow +
      `<path d="${closedCurve} L55.8 44.2 C51 44.6 44 43.8 39.6 41.4 Z" fill="${preset.shadow}" opacity="0.55" />` +
      `<path d="${closedCurve}" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" fill="none" />` +
      `<path d="M${pt(EYE_OUTER)} L37.4 43" stroke="${INK}" stroke-width="1.1" stroke-linecap="round" />` +
      lashes(lashPoints, true) +
      `</g>`
    );
  }

  const drop = lid;
  const [ox, oy] = EYE_OUTER;
  const wing = preset.wing;
  const wingTip: Point = [ox - 4.6 * wing, oy - 4.2 * wing - drop * 1.5];
  const liner =
    `M55.9 46.2 C${n(geo.u2[0] + 0.4)} ${n(geo.u2[1] - 1.7)} ${n(geo.u1[0] - 0.4)} ${n(geo.u1[1] - 1.8)} ${n(ox - 0.8)} ${n(oy - 2)} ` +
    `L${pt(wingTip)} L${n(ox - 0.1)} ${n(oy + 0.7)} C${pt(geo.u1)} ${pt(geo.u2)} ${pt(EYE_INNER)} Z`;
  const lashPoints = [0.1, 0.2, 0.31, 0.43].map((t) =>
    cubicPoint(EYE_OUTER, geo.u1, geo.u2, EYE_INNER, t),
  );
  const irisY = 45.6 + drop * 1.2;
  const glintY = 43.8 + drop * 3.2;

  return (
    `<g class="avatar-eye eye-${side}"${transform}>` +
    brow +
    // Gradient eyeshadow up to the crease
    `<path d="${geo.lidCurve} ${EYESHADOW_TOP}" fill="${shadowFill}" />` +
    (preset.smoky
      ? `<path d="M${n(ox + 0.4)} ${n(oy + 0.8)} C44 51.6 50.4 52.4 54.6 48.6 C50 50.2 44.4 50 ${n(ox + 0.4)} ${n(oy + 0.8)} Z" fill="${preset.shadow}" opacity="0.7" />`
      : "") +
    `<path d="M41.4 41 C43.6 35.4 51.2 34.8 55.8 42.6" stroke="rgba(90, 45, 35, 0.35)" stroke-width="0.5" fill="none" />` +
    // Eyeball, iris, pupil, and catchlights clipped to the almond
    `<g class="eye-blink">` +
    `<path d="${geo.sclera}" fill="#fff8f4" />` +
    `<g clip-path="url(#${p}-eye-${side})">` +
    `<circle cx="48.2" cy="${n(irisY)}" r="4.8" fill="url(#${p}-iris)" />` +
    `<circle cx="48.2" cy="${n(irisY)}" r="4.8" stroke="rgba(20,10,5,0.55)" stroke-width="0.5" fill="none" />` +
    `<circle cx="48.2" cy="${n(irisY)}" r="2.2" fill="#140b08" />` +
    `<path d="${geo.lidCurve}" stroke="rgba(70, 35, 25, 0.35)" stroke-width="2.6" fill="none" />` +
    `<circle cx="46.6" cy="${n(glintY)}" r="1.4" fill="#ffffff" />` +
    `<circle cx="50.2" cy="${n(glintY + 3.6)}" r="0.65" fill="#ffffff" opacity="0.85" />` +
    `</g>` +
    // Lower lash line
    `<path d="M${n(ox + 0.4)} ${n(oy + 0.6)} C44.4 49.6 50 50.6 53.6 48.8" stroke="rgba(60, 30, 25, 0.6)" stroke-width="0.55" fill="none" />` +
    `<path d="M${n(ox + 1)} ${n(oy + 1.6)} L${n(ox - 0.6)} ${n(oy + 2.8)}" stroke="${INK}" stroke-width="0.6" stroke-linecap="round" />` +
    // Dramatic winged liner and curled lashes
    `<path d="${liner}" fill="${INK}" />` +
    lashes(lashPoints, false) +
    `</g>` +
    (preset.glitter
      ? `<path d="M44 38.6 l0.5 1.1 1.1 0.5 -1.1 0.5 -0.5 1.1 -0.5 -1.1 -1.1 -0.5 1.1 -0.5 Z" fill="#ffffff" />` +
        `<circle cx="51.4" cy="37.8" r="0.45" fill="#ffffff" />` +
        `<circle cx="55" cy="45.4" r="0.6" fill="#ffffff" opacity="0.9" />`
      : "") +
    `</g>`
  );
}

function renderLips(preset: GlamPreset, p: string): string {
  const upper =
    "M53.8 57.6 C55.6 56.6 57.4 55.2 58.9 55.6 C59.5 55.8 59.8 56.1 60 56.1 C60.2 56.1 60.5 55.8 61.1 55.6 C62.6 55.2 64.4 56.6 66.2 57.6 C63.6 58.2 61.6 58.4 60 58.4 C58.4 58.4 56.4 58.2 53.8 57.6 Z";
  const lower =
    "M54.6 57.8 C56.6 58.4 58.2 58.6 60 58.6 C61.8 58.6 63.4 58.4 65.4 57.8 C64.4 60.6 62.4 61.8 60 61.8 C57.6 61.8 55.6 60.6 54.6 57.8 Z";
  const tilt = preset.smirk
    ? ` transform="rotate(-5 60 58.6) translate(60 58.6) scale(1.06) translate(-60 -58.6)"`
    : ` transform="translate(60 58.6) scale(1.06) translate(-60 -58.6)"`;
  return (
    `<g class="avatar-lips"${tilt}>` +
    `<path d="${lower}" fill="${preset.lips}" />` +
    `<path d="${lower}" fill="url(#${p}-gloss)" />` +
    `<path d="${upper}" fill="${preset.lips}" />` +
    `<path d="${upper}" fill="rgba(60, 10, 25, 0.18)" />` +
    `<path d="M53.8 57.6 C56.4 58.4 58.4 58.5 60 58.5 C61.6 58.5 63.6 58.4 66.2 57.6" stroke="rgba(70, 15, 30, 0.55)" stroke-width="0.5" stroke-linecap="round" fill="none" />` +
    // Glossy specular shine
    `<ellipse cx="58.8" cy="60.2" rx="1.7" ry="0.6" fill="#ffffff" opacity="0.6" />` +
    `<ellipse cx="62" cy="60.4" rx="0.6" ry="0.3" fill="#ffffff" opacity="0.5" />` +
    `<ellipse cx="57.4" cy="56.7" rx="1" ry="0.35" fill="#ffffff" opacity="0.45" />` +
    `</g>` +
    (preset.smirk
      ? `<path d="M66.6 55.6 Q67.6 56.6 67.2 57.8" stroke="rgba(110, 50, 30, 0.35)" stroke-width="0.5" stroke-linecap="round" fill="none" />`
      : "")
  );
}

function renderLayer3GlamFace(look: AvatarLook, p: string): string {
  const { style, preset } = resolveGlamPreset(look.eyeStyle);
  return (
    `<g class="avatar-face">` +
    `<g class="avatar-eyes eye-${style.replace(/_/g, "-")}">` +
    renderEye("l", preset.lidLeft, preset, p, 0) +
    renderEye(
      "r",
      preset.lidRight,
      preset,
      p,
      preset.browLift - (preset.smirk ? 1.4 : 0),
    ) +
    `</g>` +
    // Minimal chic nose
    `<path d="M60.6 46.6 L60.8 50.6" stroke="rgba(255,255,255,0.28)" stroke-width="0.9" stroke-linecap="round" />` +
    `<path d="M61.8 48.6 Q62.6 51 61.6 52.2" stroke="rgba(110, 55, 40, 0.2)" stroke-width="0.6" fill="none" />` +
    `<path d="M58.4 52.6 Q60 53.8 61.8 52.4" stroke="rgba(110, 55, 40, 0.45)" stroke-width="0.7" stroke-linecap="round" fill="none" />` +
    renderLips(preset, p) +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 4: Footwear (Anchor_Feet at 60, 142) — chunky snap-on platforms
 * ------------------------------------------------------------- */
function renderLayer4Footwear(look: AvatarLook): string {
  const shoesId = look.shoesId || "canvas_sneakers";

  if (shoesId === "platform_boots") {
    const boot =
      `<path d="M50.6 112 L57.8 112 C58 120 58.6 126 59.8 131 L60.2 139.6 L47.8 139.6 L48.2 131 C49.6 126 50.4 120 50.6 112 Z" fill="#1d1722" />` +
      `<path d="M52 114 C52 122 51.4 128 50.4 134" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" fill="none" />` +
      `<rect x="46.4" y="139" width="15.2" height="7" rx="2" fill="#0f0c12" />` +
      `<path d="M47 142.6 L61 142.6" stroke="rgba(255,255,255,0.18)" stroke-width="0.6" />` +
      `<rect x="50" y="112" width="8" height="1.6" rx="0.8" fill="#c9d1db" />`;
    return (
      `<g class="avatar-footwear footwear-platform-boots">` +
      `<g class="shoe-left">${boot}</g>` +
      `<g class="shoe-right" ${MIRROR}>${boot}</g>` +
      `</g>`
    );
  }

  // canvas_sneakers and any unknown shoe render as Y2K platform sneakers
  const sneaker =
    `<path d="M48.4 132 C48.4 128.6 51 127.2 54 127.2 C57 127.2 59.6 128.6 59.6 132 L60 139.4 L48 139.4 Z" fill="#fff6fb" stroke="rgba(80,40,60,0.2)" stroke-width="0.5" />` +
    `<path d="M48.2 135.2 C50.4 133.2 57.6 133.2 59.8 135.2 L60 139.4 L48 139.4 Z" fill="#ff5fa2" />` +
    `<path d="M51.4 129.6 L56.6 129.6 M51.2 131.4 L56.8 131.4" stroke="#ff5fa2" stroke-width="0.6" stroke-linecap="round" />` +
    `<rect x="46.6" y="139" width="14.8" height="6.6" rx="2.4" fill="#ffffff" stroke="#e8d6e2" stroke-width="0.5" />` +
    `<rect x="46.8" y="141.6" width="14.4" height="1.2" fill="#ff9fcb" />`;
  return (
    `<g class="avatar-footwear footwear-platform-sneakers">` +
    `<g class="shoe-left">${sneaker}</g>` +
    `<g class="shoe-right" ${MIRROR}>${sneaker}</g>` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 5: Outfit (Waist at 60, 98, Neck at 60, 68)
 * ------------------------------------------------------------- */
const FLARES =
  "M49.2 98.6 L70.8 98.6 C71.4 108 70.4 118 70.6 126 C71 132 73.6 137 75.6 141 L64.6 141 C64.4 134 63.2 126 62.6 118 L61.2 104.6 L58.8 104.6 L57.4 118 C56.8 126 55.6 134 55.4 141 L44.4 141 C46.4 137 49 132 49.4 126 C49.6 118 48.6 108 49.2 98.6 Z";

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
    `<circle cx="65.3" cy="109" r="0.9" fill="#f4c542" />`
  );
}

function cropTank(color: string): string {
  return (
    `<path d="M51.6 76.4 L52 71.8 M68.4 76.4 L68 71.8" stroke="${color}" stroke-width="1" stroke-linecap="round" />` +
    `<path d="M50.4 76.4 C53 74.6 67 74.6 69.6 76.4 C70.6 80 69.8 84 68.6 87.4 C63 88.6 57 88.6 51.4 87.4 C50.2 84 49.4 80 50.4 76.4 Z" fill="${color}" />` +
    `<path d="M51.4 87.4 C57 88.6 63 88.6 68.6 87.4" stroke="rgba(0,0,0,0.12)" stroke-width="0.6" fill="none" />`
  );
}

type SleeveSpec = {
  color: string;
  width: number;
  upperOnly: boolean;
  detail?: string;
};

const OUTFIT_SLEEVES: Record<string, SleeveSpec | null> = {
  denim_jacket: {
    color: "#7ea6dc",
    width: 6.4,
    upperOnly: false,
    detail: "rgba(40,70,130,0.45)",
  },
  striped_tee: { color: "#ffffff", width: 6.2, upperOnly: true },
  barista_apron: { color: "#26222b", width: 6, upperOnly: true },
  cargo_pants: null,
  cropped_puffer: {
    color: "#f7a8d0",
    width: 7.6,
    upperOnly: false,
    detail: "rgba(170,60,120,0.35)",
  },
};

function sleeveSpecFor(outfitId?: string): SleeveSpec | null {
  const id = outfitId && outfitId in OUTFIT_SLEEVES ? outfitId : "denim_jacket";
  return OUTFIT_SLEEVES[id] ?? null;
}

/** Sleeve following an arm pose; cap sleeves cover only the upper arm. */
function sleeve(arm: ArmPose, spec: SleeveSpec): string {
  const d = spec.upperOnly ? upperArmPath(arm, 0.5) : armPath(arm);
  return (
    `<path d="${d}" stroke="${spec.color}" stroke-width="${spec.width}" stroke-linecap="round" fill="none" />` +
    (spec.detail
      ? `<path d="${d}" stroke="${spec.detail}" stroke-width="0.5" fill="none" />`
      : "")
  );
}

/** Both sleeves, except a waving sleeve, which is drawn above the hair. */
function sleeves(look: AvatarLook, action: string): string {
  const spec = sleeveSpecFor(look.outfitId);
  if (!spec) return "";
  return (
    (action === "wave"
      ? ""
      : `<g class="avatar-right-sleeve">${sleeve(RIGHT_ARM_DOWN, spec)}</g>`) +
    sleeve(LEFT_ARM_HIP, spec)
  );
}

/* -------------------------------------------------------------
 * Layer 6b: Raised waving arm, drawn over the hair so the hand shows
 * ------------------------------------------------------------- */
function renderRaisedArm(look: AvatarLook, action: string): string {
  if (action !== "wave") return "";
  const spec = sleeveSpecFor(look.outfitId);
  return (
    `<g class="avatar-raised-arm">` +
    `<g class="avatar-right-arm arm-wave">` +
    armMarkup(RIGHT_ARM_WAVE, resolveSkinTone(look.skinTone)) +
    `</g>` +
    (spec
      ? `<g class="avatar-right-sleeve">${sleeve(RIGHT_ARM_WAVE, spec)}</g>`
      : "") +
    `</g>`
  );
}

function renderLayer5Outfit(look: AvatarLook, action: string = "idle"): string {
  const outfitId = look.outfitId || "denim_jacket";
  const skin = resolveSkinTone(look.skinTone);
  // The hand on the hip rests on top of any clothing
  const hipHand = `<g class="avatar-hip-hand">${handMarkup(LEFT_ARM_HIP, skin)}</g>`;

  if (outfitId === "striped_tee") {
    // Cropped baby tee with hot pink stripes and a pleated lilac mini
    return (
      `<g class="avatar-outfit outfit-striped-tee">` +
      `<path d="M49 98.4 L71 98.4 L75 113 L45 113 Z" fill="#b48be0" />` +
      `<path d="M52 99 L50 113 M56 99 L55.4 113 M60 99 L60 113 M64 99 L64.6 113 M68 99 L70 113" stroke="rgba(60,30,90,0.3)" stroke-width="0.6" />` +
      `<path d="M49 98.4 L71 98.4 L71.2 100.6 L48.8 100.6 Z" fill="#9a6fd0" />` +
      `<path d="M48.4 73 C52 71.2 68 71.2 71.6 73 C72.4 78 70.6 83 69 88 C63 89.2 57 89.2 51 88 C49.4 83 47.6 78 48.4 73 Z" fill="#ffffff" />` +
      `<path d="M49 77 L71 77 M49.6 81 L70.4 81 M50.4 85 L69.6 85" stroke="#ff5fa2" stroke-width="1.6" />` +
      `<path d="M55.6 71.8 Q60 75.4 64.4 71.8" stroke="#ff5fa2" stroke-width="1" fill="none" />` +
      `<path d="M57.4 79.6 l1.3 -1.2 1.3 1.2 1.3 -1.2 1.3 1.2 -2.6 2.6 Z" fill="#ff2f86" />` +
      sleeves(look, action) +
      chainBelt() +
      hipHand +
      `</g>`
    );
  }

  if (outfitId === "barista_apron") {
    // Chic café crew: black crop tee, waist apron, and black flares
    return (
      `<g class="avatar-outfit outfit-barista-apron">` +
      flares("#26222b", "rgba(255,255,255,0.18)") +
      `<path d="M48.4 73 C52 71.2 68 71.2 71.6 73 C72.4 78 70.6 83 69 88.4 C63 89.6 57 89.6 51 88.4 C49.4 83 47.6 78 48.4 73 Z" fill="#26222b" />` +
      sleeves(look, action) +
      `<path d="M50 99.6 L70 99.6 L71.4 116 Q60 118.6 48.6 116 Z" fill="#27ae60" />` +
      `<path d="M49.4 99.6 L70.6 99.6" stroke="#1e824c" stroke-width="1.6" />` +
      `<rect x="54.6" y="104.4" width="10.8" height="6.4" rx="1.4" fill="#1e824c" />` +
      `<circle cx="60" cy="107.6" r="1.8" fill="#f1c40f" />` +
      hipHand +
      `</g>`
    );
  }

  if (outfitId === "cargo_pants") {
    // Black halter crop with a rhinestone heart and low-rise cargos
    return (
      `<g class="avatar-outfit outfit-cargo-pants">` +
      `<path d="M49.2 98.6 L70.8 98.6 C71.6 112 71.4 126 72.4 140.6 L62.4 140.6 L61 104.8 L59 104.8 L57.6 140.6 L47.6 140.6 C48.6 126 48.4 112 49.2 98.6 Z" fill="#8f8763" />` +
      `<rect x="46.6" y="114" width="5" height="8" rx="1" fill="#7b7453" />` +
      `<rect x="68.4" y="114" width="5" height="8" rx="1" fill="#7b7453" />` +
      `<path d="M46.8 116 L51.4 116 M68.6 116 L73.2 116" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />` +
      `<path d="M55.2 71 L60 76.4 L64.8 71" stroke="#1f1b24" stroke-width="1.2" fill="none" />` +
      `<path d="M51 77.4 C54 75 57.6 76.4 60 78.4 C62.4 76.4 66 75 69 77.4 C70 81 69.4 84.4 68.4 87.6 C63 88.8 57 88.8 51.6 87.6 C50.6 84.4 50 81 51 77.4 Z" fill="#1f1b24" />` +
      `<path d="M58 82.4 a1.1 1.1 0 0 1 2 -0.8 a1.1 1.1 0 0 1 2 0.8 L60 85 Z" fill="#ffd6f0" />` +
      chainBelt() +
      hipHand +
      `</g>`
    );
  }

  if (outfitId === "cropped_puffer") {
    // Bubblegum cropped puffer with faux-fur trim over a crop tank and flares
    return (
      `<g class="avatar-outfit outfit-cropped-puffer">` +
      flares("#8fb4e6", "#5f86c0") +
      chainBelt() +
      cropTank("#ffffff") +
      sleeves(look, action) +
      `<path d="M47 73.4 C50 71.4 54 71.4 56.6 72.4 L55.4 88.4 C52 88.8 49.6 88.2 48 87.4 C46.4 82.6 46 77.8 47 73.4 Z" fill="#f7a8d0" />` +
      `<path d="M73 73.4 C70 71.4 66 71.4 63.4 72.4 L64.6 88.4 C68 88.8 70.4 88.2 72 87.4 C73.6 82.6 74 77.8 73 73.4 Z" fill="#f7a8d0" />` +
      `<path d="M47.2 79 Q51 80.2 55.8 79 M47 84 Q51 85.2 55.6 84 M72.8 79 Q69 80.2 64.2 79 M73 84 Q69 85.2 64.4 84" stroke="rgba(170,60,120,0.35)" stroke-width="0.6" fill="none" />` +
      `<path d="M49.6 75 Q51 73.2 53 74" stroke="rgba(255,255,255,0.55)" stroke-width="0.9" stroke-linecap="round" fill="none" />` +
      // Fluffy faux-fur collar
      `<path d="M47.4 74.2 q1.4 -2.6 3 -1.4 q1 -2.4 3 -1.4 q1.2 -2 3.4 -0.6 q0.6 1.6 -0.6 2.8 q-2 1.6 -4.4 1.6 q-2.6 0.6 -4.4 -1 Z" fill="#fffaf5" />` +
      `<path d="M72.6 74.2 q-1.4 -2.6 -3 -1.4 q-1 -2.4 -3 -1.4 q-1.2 -2 -3.4 -0.6 q-0.6 1.6 0.6 2.8 q2 1.6 4.4 1.6 q2.6 0.6 4.4 -1 Z" fill="#fffaf5" />` +
      hipHand +
      `</g>`
    );
  }

  // Default: denim_jacket — cropped denim jacket, hot pink crop tank, flares
  return (
    `<g class="avatar-outfit outfit-denim-jacket">` +
    flares("#3f5f9e", "#f3c46b") +
    chainBelt() +
    cropTank("#ff5fa2") +
    sleeves(look, action) +
    `<path d="M47 73.4 C50 71.4 54 71.4 56.4 72.6 L55.2 87.6 C52 88 49.4 87.4 48 86.6 C46.4 82 46 77.8 47 73.4 Z" fill="#7ea6dc" />` +
    `<path d="M73 73.4 C70 71.4 66 71.4 63.6 72.6 L64.8 87.6 C68 88 70.6 87.4 72 86.6 C73.6 82 74 77.8 73 73.4 Z" fill="#7ea6dc" />` +
    `<path d="M48 86.6 C50 87.6 53 88 55.2 87.6 M72 86.6 C70 87.6 67 88 64.8 87.6" stroke="#f3c46b" stroke-width="0.5" stroke-dasharray="0.9 0.6" fill="none" />` +
    `<path d="M49 79 L54.6 79 M71 79 L65.4 79" stroke="rgba(40,70,130,0.45)" stroke-width="0.5" />` +
    `<circle cx="54" cy="81" r="0.6" fill="#dfe6ee" />` +
    `<circle cx="66" cy="81" r="0.6" fill="#dfe6ee" />` +
    // Collar points
    `<path d="M50.4 72.2 L56.4 72.6 L55.4 77.4 Z M69.6 72.2 L63.6 72.6 L64.6 77.4 Z" fill="#5f86c0" />` +
    hipHand +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 6: Hair Front (Anchor_HeadCenter at 60, 38)
 * ------------------------------------------------------------- */
function renderLayer6HairFront(look: AvatarLook, p: string): string {
  const hairColor = escapeXml(look.hairColor || "#4a3728");
  const style = resolveHairStyle(look.hairId);
  const cls = style.replace(/_/g, "-");
  return (
    `<g class="avatar-hair-front hair-${cls}">` +
    hairArt(style, hairColor, p).front +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 7: Headwear & Eyewear Accessories
 * ------------------------------------------------------------- */
function renderLayer7HeadwearAndEyewear(look: AvatarLook): string {
  const parts: string[] = [];

  // Eyewear (eyes centered at 48 / 72, y 45)
  if (look.eyewearId) {
    if (look.eyewearId === "sunshine_shades") {
      parts.push(
        `<g class="avatar-eyewear eyewear-sunshine-shades">` +
          // Oversized Y2K tinted shades with gold rims
          `<path d="M35.6 38.6 C40 36.8 52 37 56.4 39.4 C56.6 45 54 51.6 47.4 51.6 C40.6 51.6 36 46.6 35.6 38.6 Z" fill="rgba(255, 95, 162, 0.72)" stroke="#f4c542" stroke-width="0.8" />` +
          `<path d="M84.4 38.6 C80 36.8 68 37 63.6 39.4 C63.4 45 66 51.6 72.6 51.6 C79.4 51.6 84 46.6 84.4 38.6 Z" fill="rgba(255, 95, 162, 0.72)" stroke="#f4c542" stroke-width="0.8" />` +
          `<path d="M56.4 40.6 Q60 38.6 63.6 40.6" stroke="#f4c542" stroke-width="1" fill="none" />` +
          `<path d="M38.6 41 L44.4 39.8 M66 41.4 L70.8 40" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.75" />` +
          `<path d="M40 46 L48 40.2" stroke="#ffffff" stroke-width="0.6" stroke-linecap="round" opacity="0.5" />` +
          `</g>`,
      );
    } else {
      parts.push(
        `<g class="avatar-eyewear eyewear-generic">` +
          `<circle cx="48" cy="45" r="7.4" stroke="#2c3e50" stroke-width="1.2" fill="rgba(255,255,255,0.08)" />` +
          `<circle cx="72" cy="45" r="7.4" stroke="#2c3e50" stroke-width="1.2" fill="rgba(255,255,255,0.08)" />` +
          `<line x1="55.4" y1="44" x2="64.6" y2="44" stroke="#2c3e50" stroke-width="1.2" />` +
          `</g>`,
      );
    }
  }

  // Headwear sits on top of the voluminous hair
  if (look.headwearId) {
    if (look.headwearId === "explorer_fedora") {
      parts.push(
        `<g class="avatar-headwear headwear-explorer-fedora">` +
          `<ellipse cx="60" cy="17" rx="38" ry="6.4" fill="#c56a2c" />` +
          `<path d="M39 16 C41 0 50 -2 60 -2 C70 -2 79 0 81 16 Z" fill="#e08a46" />` +
          `<path d="M39.6 14 Q60 17.4 80.4 14" stroke="#5a2f12" stroke-width="3" fill="none" />` +
          `<circle cx="47" cy="14.6" r="1.8" fill="#f4c542" />` +
          `</g>`,
      );
    } else if (look.headwearId === "retro_neon_visor") {
      parts.push(
        `<g class="avatar-headwear headwear-retro-neon-visor">` +
          `<path d="M30 25 Q60 30 90 25 L86 19.6 Q60 24.4 34 19.6 Z" fill="#ff007f" />` +
          `<path d="M26 26 Q60 33 94 26 L88 31 Q60 39 32 31 Z" fill="rgba(0, 240, 255, 0.75)" stroke="#00f0ff" stroke-width="1" />` +
          `</g>`,
      );
    } else if (look.headwearId === "golden_mane_wreath") {
      parts.push(
        `<g class="avatar-headwear headwear-golden-mane-wreath">` +
          `<path d="M30 22 Q60 12 90 22" stroke="#f39c12" stroke-width="2" fill="none" />` +
          `<circle cx="38" cy="18.6" r="2.6" fill="#f1c40f" />` +
          `<circle cx="48.4" cy="15.4" r="2.6" fill="#f1c40f" />` +
          `<circle cx="60" cy="14" r="3.1" fill="#f1c40f" />` +
          `<circle cx="71.6" cy="15.4" r="2.6" fill="#f1c40f" />` +
          `<circle cx="82" cy="18.6" r="2.6" fill="#f1c40f" />` +
          `</g>`,
      );
    } else {
      parts.push(
        `<g class="avatar-headwear headwear-generic">` +
          `<ellipse cx="60" cy="15" rx="34" ry="7" fill="#e74c3c" />` +
          `<path d="M38 14 C42 2 50 0 60 0 C70 0 78 2 82 14 Z" fill="#c0392b" />` +
          `</g>`,
      );
    }
  }

  return parts.join("\n");
}

/* -------------------------------------------------------------
 * Layer 8: Handheld Item (follows the right hand)
 * ------------------------------------------------------------- */
function renderLayer8Handheld(look: AvatarLook, action: string): string {
  if (!look.handheldId) return "";

  const [originX, originY] = rightArmFor(action).hand;

  let content = "";
  if (look.handheldId === "mango_smoothie_cup") {
    content =
      `<g class="avatar-handheld handheld-mango-smoothie"><g transform="translate(${n(originX - 9)}, ${n(originY - 16)})">` +
      // Clear plastic smoothie cup
      `<path d="M3 8 L5 24 L13 24 L15 8 Z" fill="rgba(255,255,255,0.3)" stroke="#dfe6e9" stroke-width="0.8" />` +
      // Mango smoothie fill
      `<path d="M4 11 L5 23 L13 23 L14 11 Z" fill="#f39c12" />` +
      // Green straw
      `<line x1="9" y1="2" x2="9" y2="16" stroke="#27ae60" stroke-width="1.8" stroke-linecap="round" />` +
      // Mango slice on rim
      `<circle cx="5" cy="8" r="3" fill="#f1c40f" />` +
      `<circle cx="5" cy="8" r="1.5" fill="#e67e22" />` +
      `</g></g>`;
  } else if (look.handheldId === "eyepatch_cutlass") {
    content =
      `<g class="avatar-handheld handheld-cutlass"><g transform="translate(${n(originX - 12)}, ${n(originY - 22)})">` +
      // Swashbuckler cutlass
      `<path d="M12 18 C14 10 20 4 26 2 C22 8 18 16 14 22 Z" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="0.8" />` +
      `<line x1="8" y1="20" x2="16" y2="20" stroke="#f1c40f" stroke-width="2" />` +
      `<rect x="11" y="20" width="2" height="6" fill="#8e44ad" />` +
      `</g></g>`;
  } else {
    // Generic handheld accessory
    content =
      `<g class="avatar-handheld handheld-generic"><g transform="translate(${n(originX - 6)}, ${n(originY - 8)})">` +
      `<circle cx="6" cy="6" r="5" fill="#f39c12" />` +
      `</g></g>`;
  }

  return content;
}

export interface AvatarSvgOptions {
  width?: number;
  height?: number;
  className?: string;
  /** Unique prefix for gradient/clip IDs when several avatars share a page. */
  idPrefix?: string;
}

/**
 * Generates inner SVG layer elements for the Avatar, in strict Layer 0 to Layer 8 order.
 */
export function generateAvatarLayersString(
  look: AvatarLook = DEFAULT_AVATAR_LOOK,
  action: EntityAction | string = "idle",
  idPrefix?: string,
): string {
  const act = typeof action === "string" ? action : "idle";
  const p = sanitizeIdPrefix(idPrefix ?? `av${hashLook(look)}`);
  const { preset } = resolveGlamPreset(look.eyeStyle);

  return [
    renderDefs(p, preset),
    renderLayer0ShadowAndBoard(look, act),
    renderLayer1HairBack(look, p),
    renderLayer2BodyBase(look, act, p),
    renderLayer3GlamFace(look, p),
    renderLayer4Footwear(look),
    renderLayer5Outfit(look, act),
    renderLayer6HairFront(look, p),
    renderRaisedArm(look, act),
    renderLayer7HeadwearAndEyewear(look),
    renderLayer8Handheld(look, act),
  ]
    .filter((layer) => layer.length > 0)
    .join("\n");
}

/**
 * Generates a complete standalone SVG element string for the Avatar.
 */
export function generateAvatarSvgString(
  look: AvatarLook = DEFAULT_AVATAR_LOOK,
  action: EntityAction | string = "idle",
  options?: AvatarSvgOptions,
): string {
  const width = options?.width ?? 120;
  const height = options?.height ?? 160;
  const customClass = options?.className ? ` ${options.className}` : "";
  const actionClass = action ? ` action-${action}` : "";

  const innerLayers = generateAvatarLayersString(
    look,
    action,
    options?.idPrefix,
  );

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="0 0 120 160" ` +
    `width="${width}" ` +
    `height="${height}" ` +
    `class="chibi-avatar${actionClass}${customClass}">\n` +
    innerLayers +
    `\n</svg>`
  );
}
