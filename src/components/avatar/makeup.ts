import type { AvatarLook, EyeStyle } from "../../types/world.ts";
import {
  BLUSHES,
  EYE_COLORS,
  EYESHADOWS,
  FACE_DETAILS,
  LIP_COLORS,
  findOption,
  type LipFinish,
} from "../../types/avatarOptions.ts";
import { DOLL_HEAD_PATH, INK, MIRROR, n, pt, type Point } from "./shared.ts";

/* -------------------------------------------------------------
 * Glam makeup presets per eye look
 * ------------------------------------------------------------- */
type EyeState = number | "closed";

export type GlamPreset = {
  lidLeft: EyeState;
  lidRight: EyeState;
  /** Default eyeshadow, iris, and lip colors when the look has no override. */
  shadow: string;
  iris: readonly [string, string, string];
  lips: string;
  wing: number;
  browLift: number;
  /** Steepness multiplier for the liner wing. */
  wingLift?: number;
  /** Degrees the inner brow dips toward the nose (fierce). */
  browAngle?: number;
  /** Units the gaze drifts upward (dreamy). */
  gazeUp?: number;
  /** Iris radius multiplier (doe eyes read bigger). */
  irisScale?: number;
  lowerLashes?: boolean;
  smoky?: boolean;
  /** 1 = sparkle specks, 2 = full glitter pop with a rhinestone. */
  glitter?: 1 | 2;
  graphic?: boolean;
  smirk?: boolean;
};

const IRIS_BROWN = ["#c98e5c", "#7a4523", "#28140a"] as const;
const IRIS_HAZEL = ["#d29a52", "#8c5626", "#2e1a0c"] as const;
const IRIS_AMBER = ["#f2bb57", "#a5611b", "#3a2006"] as const;

const GLAM_PRESETS: Record<EyeStyle, GlamPreset> = {
  winged_glam: {
    lidLeft: 0.14,
    lidRight: 0.14,
    shadow: "#b98ad6",
    iris: IRIS_HAZEL,
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
    glitter: 1,
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
    iris: IRIS_BROWN,
    lips: "#b8505f",
    wing: 1.1,
    browLift: 0.4,
  },
  smirk: {
    lidLeft: 0.24,
    lidRight: 0.3,
    shadow: "#c4823e",
    iris: IRIS_AMBER,
    lips: "#b8303f",
    wing: 1.2,
    browLift: 0,
    smirk: true,
  },
  doe_lash: {
    lidLeft: 0,
    lidRight: 0,
    shadow: "#e7a07f",
    iris: IRIS_BROWN,
    lips: "#d97a8a",
    wing: 0.45,
    browLift: -0.5,
    irisScale: 1.08,
    lowerLashes: true,
  },
  siren: {
    lidLeft: 0.2,
    lidRight: 0.2,
    shadow: "#8a4a3a",
    iris: IRIS_HAZEL,
    lips: "#a8404c",
    wing: 1.45,
    wingLift: 1.3,
    browLift: -0.4,
  },
  fierce: {
    lidLeft: 0.32,
    lidRight: 0.32,
    shadow: "#5a3a3a",
    iris: IRIS_AMBER,
    lips: "#8e2a3a",
    wing: 1.25,
    browLift: 0.6,
    browAngle: 7,
  },
  dreamy: {
    lidLeft: 0.38,
    lidRight: 0.38,
    shadow: "#c9a3d9",
    iris: ["#9cd4ff", "#2f74c8", "#0d2448"],
    lips: "#e08aa0",
    wing: 0.7,
    browLift: -0.9,
    gazeUp: 1.4,
  },
  graphic_liner: {
    lidLeft: 0.1,
    lidRight: 0.1,
    shadow: "#ff4fa0",
    iris: ["#c4a8ff", "#6a49b4", "#24143f"],
    lips: "#d0306a",
    wing: 1.3,
    browLift: -0.3,
    graphic: true,
  },
  glitter_pop: {
    lidLeft: 0.06,
    lidRight: 0.06,
    shadow: "#f0a8cf",
    iris: ["#e2f6ff", "#86c4e8", "#2a5878"],
    lips: "#ff6fae",
    wing: 1,
    browLift: -0.4,
    glitter: 2,
  },
  fox_eye: {
    lidLeft: 0.16,
    lidRight: 0.16,
    shadow: "#a56238",
    iris: IRIS_AMBER,
    lips: "#8c4d2e",
    wing: 1.5,
    wingLift: 1.4,
    browLift: -0.6,
    browAngle: 8,
  },
  cut_crease: {
    lidLeft: 0.1,
    lidRight: 0.1,
    shadow: "#c4823e",
    iris: IRIS_HAZEL,
    lips: "#b52b58",
    wing: 1.4,
    browLift: 0,
    graphic: true,
    glitter: 1,
  },
  double_wing: {
    lidLeft: 0.12,
    lidRight: 0.12,
    shadow: "#3a3540",
    iris: IRIS_BROWN,
    lips: "#940f26",
    wing: 1.45,
    browLift: 0.2,
    graphic: true,
  },
  kohl_sultry: {
    lidLeft: 0.22,
    lidRight: 0.22,
    shadow: "#221f24",
    iris: ["#2a2422", "#191412", "#0c0a09"],
    lips: "#9e6750",
    wing: 1.3,
    browLift: 0,
    smoky: true,
    lowerLashes: true,
  },
};

export function resolveGlamPreset(eyeStyle?: string): {
  style: EyeStyle;
  preset: GlamPreset;
} {
  const style = (
    eyeStyle && eyeStyle in GLAM_PRESETS ? eyeStyle : "winged_glam"
  ) as EyeStyle;
  return { style, preset: GLAM_PRESETS[style] };
}

/** A look's eye preset combined with its eyeshadow, iris, lip, blush, and face detail picks. */
export type ResolvedMakeup = {
  style: EyeStyle;
  preset: GlamPreset;
  shadow: string;
  shadowSpecial?: "holo" | "ombre";
  iris: readonly [string, string, string];
  lips: string;
  lipFinish: LipFinish;
  /** Blush color, or null when the look wears no blush. */
  blush: string | null;
  faceDetail: string;
};

/**
 * Merges the eye-look preset with optional overrides. Colors only ever come
 * from the preset or the option registry, never from raw saved strings.
 */
export function resolveMakeup(look: AvatarLook): ResolvedMakeup {
  const { style, preset } = resolveGlamPreset(look.eyeStyle);
  const shadow = findOption(EYESHADOWS, look.eyeshadowId);
  const iris = findOption(EYE_COLORS, look.eyeColorId);
  const lip = findOption(LIP_COLORS, look.lipId);
  const blush = findOption(BLUSHES, look.blushId);
  const detail = findOption(FACE_DETAILS, look.faceDetailId);
  return {
    style,
    preset,
    shadow: shadow?.hex ?? preset.shadow,
    shadowSpecial:
      shadow && "special" in shadow
        ? (shadow.special as "holo" | "ombre")
        : undefined,
    iris: iris?.iris ?? preset.iris,
    lips: lip?.hex ?? preset.lips,
    lipFinish: lip?.finish ?? "gloss",
    blush: blush ? (blush.id === "none" ? null : blush.hex) : "#ff5f86",
    faceDetail: detail?.id ?? "none",
  };
}

/* -------------------------------------------------------------
 * Layer 3: Glam Face (eyeshadow, winged liner, lashes, brows, lips)
 * Eyes are drawn for the viewer's left and mirrored for the right.
 * ------------------------------------------------------------- */
const EYE_OUTER: Point = [34.2, 38.8];
const EYE_INNER: Point = [55.6, 47.2];
const LOWER_INNER: Point = [51.8, 48.5];
const LOWER_OUTER: Point = [39.4, 49.6];

/** Almond doll eye: a high arched upper lid over a gentle lower lid. */
export function eyeGeometry(lid: EyeState) {
  const drop = lid === "closed" ? 0 : lid;
  // Heavy doll lid: a low, flat arch that rests over the top of the iris
  // Heavy doll lid: a long, low arch over a narrow almond
  const u1: Point = [40, 34.8 + drop * 5];
  const u2: Point = [49.8, 39.4 + drop * 5.5];
  const lidCurve = `M${pt(EYE_OUTER)} C${pt(u1)} ${pt(u2)} ${pt(EYE_INNER)}`;
  return {
    u1,
    u2,
    lidCurve,
    sclera: `${lidCurve} C${pt(LOWER_INNER)} ${pt(LOWER_OUTER)} ${pt(EYE_OUTER)} Z`,
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

/** A tapered, curled lash clump from a lid point toward (dx, dy). */
function lash([x, y]: Point, dx: number, dy: number, base: number): string {
  const tip: Point = [x + dx, y + dy];
  // The curl bows the lash outward (toward the temple) as it lifts
  const c: Point = [x + dx * 0.15 - 0.6, y + dy * 0.75];
  return `<path d="M${n(x - base)} ${n(y)} Q${pt(c)} ${pt(tip)} Q${n(c[0] + base * 0.8)} ${n(c[1] + base * 0.3)} ${n(x + base)} ${n(y)} Z" fill="${INK}" />`;
}

/** Upper lash clumps fanning out toward the outer corner. */
const UPPER_LASHES = [
  [0.01, -7, -2],
  [0.08, -6.2, -3.8],
  [0.17, -4.8, -5],
  [0.27, -3.2, -5.2],
  [0.38, -1.8, -4.6],
  [0.5, -0.6, -3.6],
  [0.62, 0.2, -2.6],
] as const;

function lashes(points: readonly Point[], down: boolean, scale = 1): string {
  return points
    .map(([x, y], i) => {
      const len = (1.6 - i * 0.25) * scale;
      return lash([x, y], -len * 0.7, down ? len : -len, 0.3);
    })
    .join("");
}

/** Thin sculpted brow with a high arch and a tapered tail. */
const BROW_PATH =
  "M56.4 36.4 C55 31.2 50.6 27.6 45.2 27.2 C40.4 26.8 36 28.6 32.4 32.2 C36.6 30 40.6 29.6 44.8 30.2 C49.8 30.8 53.8 33.2 56.4 36.4 Z";

const EYESHADOW_TOP = "L57 41.4 C54.6 31.6 41.4 30.6 33.6 38.4 Z";

/** Four-point twinkle centered on (x, y). */
function twinkle(x: number, y: number, r: number, fill: string): string {
  const q = r * 0.28;
  return `<path d="M${n(x)} ${n(y - r)} L${n(x + q)} ${n(y - q)} L${n(x + r)} ${n(y)} L${n(x + q)} ${n(y + q)} L${n(x)} ${n(y + r)} L${n(x - q)} ${n(y + q)} L${n(x - r)} ${n(y)} L${n(x - q)} ${n(y - q)} Z" fill="${fill}" />`;
}

/** Faceted rhinestone with a crisp glint. */
function gem(x: number, y: number, r: number, fill: string): string {
  return (
    `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" stroke="#ffffff" stroke-width="0.25" />` +
    `<circle cx="${n(x - r * 0.35)}" cy="${n(y - r * 0.35)}" r="${n(r * 0.35)}" fill="#ffffff" opacity="0.9" />`
  );
}

function renderEye(
  side: "l" | "r",
  lid: EyeState,
  makeup: ResolvedMakeup,
  p: string,
  browLift: number,
): string {
  const { preset } = makeup;
  const geo = eyeGeometry(lid);
  const transform = side === "r" ? ` ${MIRROR}` : "";
  const browTransform =
    `translate(0 ${n(browLift - 2.2)})` +
    (preset.browAngle ? ` rotate(${preset.browAngle} 39.4 34.4)` : "");
  const brow = `<path d="${BROW_PATH}" fill="#4a2a1a" stroke="#2a1610" stroke-width="0.4" transform="${browTransform}" />`;
  const shadowFill = `url(#${p}-shadow)`;
  const lidSparkle =
    makeup.shadowSpecial === "holo"
      ? twinkle(45.4, 38.8, 0.9, "#ffffff") +
        `<circle cx="50.6" cy="37.8" r="0.35" fill="#ffffff" />`
      : "";

  if (lid === "closed") {
    const closed: [Point, Point] = [
      [43, 48.4],
      [51.2, 49.2],
    ];
    const closedCurve = `M${pt(EYE_OUTER)} C${pt(closed[0])} ${pt(closed[1])} ${pt(EYE_INNER)}`;
    const lashPoints = [0.06, 0.18, 0.32].map((t) =>
      cubicPoint(EYE_OUTER, closed[0], closed[1], EYE_INNER, t),
    );
    return (
      `<g class="avatar-eye eye-${side} eye-closed"${transform}>` +
      brow +
      `<path class="eye-shadow" d="${closedCurve} L56 44 C51 43.4 43.6 42.4 38.8 40.6 Z" fill="${makeup.shadow}" opacity="0.55" />` +
      `<path d="${closedCurve}" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" fill="none" />` +
      `<path d="M${pt(EYE_OUTER)} L35 41.4" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" />` +
      lashes(lashPoints, true, 1.3) +
      `</g>`
    );
  }

  const drop = lid;
  const [ox, oy] = EYE_OUTER;
  const wing = preset.wing;
  const wingTip: Point = [
    ox - 7 * wing,
    oy - 4.4 * wing * (preset.wingLift ?? 1) - drop * 1.2,
  ];
  // Heavy upper liner: thin at the tear duct, thick toward the flared wing
  const liner =
    `M${n(EYE_INNER[0] + 0.5)} ${n(EYE_INNER[1] - 0.4)} C${n(geo.u2[0] + 0.4)} ${n(geo.u2[1] - 0.8)} ${n(geo.u1[0] - 0.6)} ${n(geo.u1[1] - 1.2)} ${n(ox - 1.6)} ${n(oy - 1.3)} ` +
    `L${pt(wingTip)} L${n(ox - 0.4)} ${n(oy + 0.8)} C${pt(geo.u1)} ${pt(geo.u2)} ${pt(EYE_INNER)} Z`;
  const upperLashes = UPPER_LASHES.map(([t, dx, dy]) => {
    const [x, y] = cubicPoint(EYE_OUTER, geo.u1, geo.u2, EYE_INNER, t);
    return lash([x - 0.2, y - 0.4], dx * (0.85 + wing * 0.15), dy, 0.8);
  }).join("");
  const lowerLashPoints = [0.55, 0.7, 0.84].map((t) =>
    cubicPoint(EYE_INNER, LOWER_INNER, LOWER_OUTER, EYE_OUTER, t),
  );
  const gaze = preset.gazeUp ?? 0;
  const irisR = 5.8 * (preset.irisScale ?? 1);
  const irisX = 44.8;
  const irisY = 44.2 + drop * 1.2 - gaze;
  const glintY = irisY - irisR * 0.42;

  // Graphic liner: a floating crease line plus a second parallel wing
  const graphic = preset.graphic
    ? `<path class="graphic-liner" d="M40 39.4 C43.4 33.8 51.4 33.4 55.8 39.6" stroke="${makeup.shadow}" stroke-width="0.75" stroke-linecap="round" fill="none" />` +
      `<path class="graphic-liner" d="M${n(ox - 0.6)} ${n(oy - 3.6)} L${n(wingTip[0] + 0.2)} ${n(wingTip[1] - 1.8)}" stroke="${makeup.shadow}" stroke-width="0.7" stroke-linecap="round" />`
    : "";

  // Glitter: sparkle specks (level 1) or a full glitter lid with rhinestone (level 2)
  const glitter =
    preset.glitter === 2
      ? `<g class="glitter-pop">` +
        twinkle(44, 37.6, 1.1, "#ffffff") +
        twinkle(51.8, 36.8, 0.8, "#fff4b8") +
        `<circle cx="47.6" cy="36.8" r="0.4" fill="#ffffff" />` +
        `<circle cx="41.8" cy="40" r="0.35" fill="#ffd6f0" />` +
        `<circle cx="54.2" cy="40.2" r="0.35" fill="#d6f4ff" />` +
        `<ellipse cx="55.3" cy="46.6" rx="0.9" ry="0.6" fill="#ffffff" opacity="0.9" />` +
        gem(wingTip[0], wingTip[1], 0.85, "#d8f3ff") +
        `</g>`
      : preset.glitter === 1
        ? twinkle(44, 38.4, 1.1, "#ffffff") +
          `<circle cx="51.4" cy="37" r="0.45" fill="#ffffff" />` +
          `<circle cx="55" cy="46" r="0.6" fill="#ffffff" opacity="0.9" />`
        : "";

  return (
    `<g class="avatar-eye eye-${side}"${transform}>` +
    brow +
    // Pearlescent brow-bone highlight
    `<ellipse cx="48.4" cy="${n(32.8 + browLift * 0.6)}" rx="3.8" ry="1" fill="rgba(255,255,255,0.28)" transform="rotate(-10 48.4 ${n(32.8 + browLift * 0.6)})" />` +
    // Gradient eyeshadow up to the crease
    `<path class="eye-shadow" d="${geo.lidCurve} ${EYESHADOW_TOP}" fill="${shadowFill}" />` +
    // Metallic lid: a bright foil highlight with glitter specks
    `<ellipse cx="47.4" cy="${n(37.4 + drop * 3)}" rx="4.6" ry="1.5" fill="rgba(255,255,255,0.5)" transform="rotate(-6 47.4 ${n(37.4 + drop * 3)})" />` +
    `<ellipse cx="46.6" cy="${n(37.2 + drop * 3)}" rx="1.8" ry="0.6" fill="#ffffff" opacity="0.85" transform="rotate(-6 46.6 ${n(37.2 + drop * 3)})" />` +
    `<path d="M41.6 ${n(38.8 + drop * 3)} h0.01 M52.4 ${n(37.6 + drop * 3)} h0.01 M44 ${n(35.4 + drop * 2)} h0.01" stroke="#ffffff" stroke-width="0.7" stroke-linecap="round" />` +
    lidSparkle +
    (preset.smoky
      ? `<path d="M${n(ox + 0.4)} ${n(oy + 0.8)} C43.6 51.8 50.4 52.6 54.6 49 C50 50.6 44.4 50.2 ${n(ox + 0.4)} ${n(oy + 0.8)} Z" fill="${makeup.shadow}" opacity="0.7" />`
      : "") +
    // Crease definition
    `<path d="M38 40 C42 33.2 51.6 32.8 55.8 41" stroke="rgba(45, 18, 12, 0.4)" stroke-width="0.6" stroke-linecap="round" fill="none" />` +
    graphic +
    // Eyeball, big iris, pupil, and doll catchlights clipped to the almond
    `<g class="eye-blink">` +
    `<path d="${geo.sclera}" fill="#fffaf6" />` +
    `<g clip-path="url(#${p}-eye-${side})">` +
    `<circle cx="${irisX}" cy="${n(irisY)}" r="${n(irisR)}" fill="url(#${p}-iris)" />` +
    `<circle cx="${irisX}" cy="${n(irisY)}" r="${n(irisR - 0.35)}" stroke="#120804" stroke-width="0.7" fill="none" opacity="0.85" />` +
    // Luminous lower crescent glow
    `<path d="M${n(irisX - irisR * 0.62)} ${n(irisY + irisR * 0.3)} Q${irisX} ${n(irisY + irisR * 0.9)} ${n(irisX + irisR * 0.62)} ${n(irisY + irisR * 0.3)}" stroke="${makeup.iris[0]}" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.9" />` +
    `<circle cx="${irisX}" cy="${n(irisY)}" r="${n(irisR * 0.42)}" fill="#0c0503" />` +
    // Upper lid cast shadow
    `<path d="${geo.lidCurve}" stroke="rgba(20, 8, 6, 0.5)" stroke-width="1.3" fill="none" />` +
    // Big round catchlight plus a small sparkle
    `<circle cx="${n(irisX - irisR * 0.38)}" cy="${n(glintY)}" r="${n(irisR * 0.3)}" fill="#ffffff" />` +
    `<circle cx="${n(irisX + irisR * 0.42)}" cy="${n(irisY + irisR * 0.4)}" r="${n(irisR * 0.13)}" fill="#ffffff" opacity="0.92" />` +
    `</g>` +
    // Lower lid line and outer lower lashes
    `<path d="M${n(ox + 0.2)} ${n(oy + 0.4)} C${pt(LOWER_OUTER)} ${pt(LOWER_INNER)} ${pt(EYE_INNER)}" stroke="rgba(42, 22, 16, 0.75)" stroke-width="0.55" fill="none" />` +
    `<g class="${preset.lowerLashes ? "lower-lashes" : "outer-lashes"}">` +
    lashes(
      preset.lowerLashes ? lowerLashPoints : lowerLashPoints.slice(1),
      true,
      preset.lowerLashes ? 1.15 : 0.85,
    ) +
    `</g>` +
    // Heavy winged liner and curled upper lash clumps
    `<path d="${liner}" fill="${INK}" />` +
    upperLashes +
    `</g>` +
    glitter +
    `</g>`
  );
}

const LIP_UPPER =
  "M52.4 58.2 C54.2 56.6 55.8 54.6 57.8 54.2 C58.8 54 59.6 54.8 60 55.4 C60.4 54.8 61.2 54 62.2 54.2 C64.2 54.6 65.8 56.6 67.6 58.2 C64.4 58.6 62.4 59.2 60 58.8 C57.6 59.2 55.6 58.6 52.4 58.2 Z";
const LIP_LOWER =
  "M53 58.4 C55.6 58.8 57.6 59.4 60 59 C62.4 59.4 64.4 58.8 67 58.4 C66.4 61.8 63.8 63.8 60 63.8 C56.2 63.8 53.6 61.8 53 58.4 Z";
const LIP_CONTOUR =
  "M52.4 58.2 C54.2 56.6 55.8 54.6 57.8 54.2 C58.8 54 59.6 54.8 60 55.4 C60.4 54.8 61.2 54 62.2 54.2 C64.2 54.6 65.8 56.6 67.6 58.2 C66.8 61.8 64 63.8 60 63.8 C56 63.8 53.2 61.8 52.4 58.2 Z";
const MOUTH_LINE =
  "M52.6 58.2 C55.6 58.6 57.6 59.2 60 58.8 C62.4 59.2 64.4 58.6 67.4 58.2";

function lipFinishMarkup(finish: LipFinish, p: string): string {
  const gloss =
    // Wet-look highlight band and sparkle on the full lower lip
    // Plump volume: lighter center on both lips
    `<ellipse cx="60" cy="61.2" rx="4.4" ry="1.6" fill="#ffffff" opacity="0.28" />` +
    `<ellipse cx="57.8" cy="56.6" rx="2" ry="0.9" fill="#ffffff" opacity="0.22" />` +
    `<ellipse cx="62.2" cy="56.6" rx="2" ry="0.9" fill="#ffffff" opacity="0.22" />` +
    `<path d="M56.2 61.2 Q60 62.6 63.8 61.2 Q60 61.6 56.2 61.2 Z" fill="#ffffff" opacity="0.85" />` +
    `<ellipse cx="57.4" cy="60.4" rx="1.3" ry="0.5" fill="#ffffff" opacity="0.7" transform="rotate(-8 57.4 60.4)" />` +
    // Cupid's bow shine
    `<path d="M56.4 55.6 Q57.8 54.8 59 55.6" stroke="#ffffff" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.75" />` +
    `<path d="M61.6 55.4 Q62.6 55 63.6 55.6" stroke="#ffffff" stroke-width="0.45" stroke-linecap="round" fill="none" opacity="0.6" />` +
    twinkle(64.2, 61.4, 0.9, "#ffffff");
  switch (finish) {
    case "matte":
      // Velvet finish: soft center sheen, no specular hits
      return `<ellipse cx="60" cy="61.2" rx="2.6" ry="0.8" fill="rgba(255,255,255,0.12)" />`;
    case "frost":
      return (
        `<path d="${LIP_LOWER}" fill="rgba(255, 255, 255, 0.3)" />` +
        `<path d="${LIP_UPPER}" fill="rgba(255, 255, 255, 0.2)" />` +
        `<ellipse cx="59.4" cy="61.2" rx="2.4" ry="0.6" fill="#ffffff" opacity="0.55" />` +
        `<circle cx="56.4" cy="60.2" r="0.25" fill="#ffffff" />` +
        `<circle cx="63.6" cy="60.4" r="0.25" fill="#ffffff" />`
      );
    case "glitter":
      return (
        `<path d="${LIP_LOWER}" fill="url(#${p}-gloss)" />` +
        gloss +
        `<g class="lip-glitter">` +
        `<circle cx="55.8" cy="60" r="0.3" fill="#ffffff" />` +
        `<circle cx="61.2" cy="62.4" r="0.28" fill="#fff4b8" />` +
        `<circle cx="64.6" cy="59.8" r="0.3" fill="#ffffff" />` +
        `<circle cx="59.6" cy="56.8" r="0.22" fill="#ffffff" />` +
        `<circle cx="65" cy="57.2" r="0.22" fill="#fff4b8" />` +
        twinkle(58, 62.4, 0.6, "#ffffff") +
        `</g>`
      );
    default:
      return `<path d="${LIP_LOWER}" fill="url(#${p}-gloss)" />` + gloss;
  }
}

function renderLips(makeup: ResolvedMakeup, p: string): string {
  // Overlined doll pout, scaled up around the mouth center
  const tilt = ` transform="${makeup.preset.smirk ? "rotate(-5 60 58.8) " : ""}translate(60 59.2) scale(1.1 1.3) translate(-60 -59)"`;
  return (
    `<g class="avatar-lips lip-${makeup.lipFinish}"${tilt}>` +
    `<path d="${LIP_LOWER}" fill="${makeup.lips}" />` +
    `<path d="${LIP_UPPER}" fill="${makeup.lips}" />` +
    `<path d="${LIP_UPPER}" fill="rgba(60, 10, 25, 0.22)" />` +
    // Bold liner around the pout
    `<path d="${LIP_CONTOUR}" stroke="rgba(40, 8, 14, 0.9)" stroke-width="0.9" stroke-linejoin="round" fill="none" />` +
    `<path d="${MOUTH_LINE}" stroke="rgba(35, 6, 12, 0.85)" stroke-width="0.7" stroke-linecap="round" fill="none" />` +
    // Parted glossy pout: a sliver of white between the lips
    `<path d="M58 58.95 Q60 60 62 58.95 Q60 59.35 58 58.95 Z" fill="#fffaf6" />` +
    lipFinishMarkup(makeup.lipFinish, p) +
    `</g>` +
    (makeup.preset.smirk
      ? `<path d="M67.6 55.6 Q68.6 56.6 68.2 57.8" stroke="rgba(110, 50, 30, 0.35)" stroke-width="0.5" stroke-linecap="round" fill="none" />`
      : "")
  );
}

/** Five-point star sticker. */
function star(x: number, y: number, r: number, fill: string): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    return `${n(x + Math.cos(angle) * radius)} ${n(y + Math.sin(angle) * radius)}`;
  });
  return `<path d="M${points.join(" L")} Z" fill="${fill}" stroke="#ffffff" stroke-width="0.25" stroke-linejoin="round" />`;
}

function heart(x: number, y: number, s: number, fill: string): string {
  return (
    `<path d="M${n(x)} ${n(y + s * 0.9)} C${n(x - s * 1.4)} ${n(y)} ${n(x - s * 0.9)} ${n(y - s * 0.9)} ${n(x)} ${n(y - s * 0.25)} C${n(x + s * 0.9)} ${n(y - s * 0.9)} ${n(x + s * 1.4)} ${n(y)} ${n(x)} ${n(y + s * 0.9)} Z" fill="${fill}" />` +
    `<ellipse cx="${n(x - s * 0.45)}" cy="${n(y - s * 0.3)}" rx="${n(s * 0.22)}" ry="${n(s * 0.14)}" fill="#ffffff" opacity="0.75" />`
  );
}

function butterflyGem(x: number, y: number): string {
  return (
    `<ellipse cx="${n(x - 1.3)}" cy="${n(y - 0.9)}" rx="1.4" ry="1.05" fill="#c9a6ff" transform="rotate(-25 ${n(x - 1.3)} ${n(y - 0.9)})" />` +
    `<ellipse cx="${n(x + 1.3)}" cy="${n(y - 0.9)}" rx="1.4" ry="1.05" fill="#c9a6ff" transform="rotate(25 ${n(x + 1.3)} ${n(y - 0.9)})" />` +
    `<ellipse cx="${n(x - 1)}" cy="${n(y + 0.9)}" rx="0.9" ry="0.75" fill="#ff9ad5" />` +
    `<ellipse cx="${n(x + 1)}" cy="${n(y + 0.9)}" rx="0.9" ry="0.75" fill="#ff9ad5" />` +
    gem(x - 1.4, y - 1, 0.35, "#ffffff") +
    gem(x + 1.4, y - 1, 0.35, "#ffffff") +
    `<rect x="${n(x - 0.25)}" y="${n(y - 1.6)}" width="0.5" height="3" rx="0.25" fill="#6a49b4" />`
  );
}

const FRECKLES: readonly Point[] = [
  [52.6, 50.4],
  [54.4, 51.6],
  [51, 52.2],
  [55.8, 50],
  [53.2, 53.2],
  [49.4, 51],
  [67.4, 50.4],
  [65.6, 51.6],
  [69, 52.2],
  [64.2, 50],
  [66.8, 53.2],
  [70.6, 51],
  [58.6, 49.8],
  [61.4, 49.6],
];

function renderFaceDetail(detail: string): string {
  let art = "";
  switch (detail) {
    case "beauty_mark":
      art = `<circle cx="67.6" cy="55.6" r="0.6" fill="#3a2016" />`;
      break;
    case "freckles":
      art = FRECKLES.map(
        ([x, y], i) =>
          `<circle cx="${n(x)}" cy="${n(y)}" r="${i % 3 === 0 ? 0.42 : 0.32}" fill="rgba(130, 70, 40, 0.42)" />`,
      ).join("");
      break;
    case "beauty_mark_eye":
      art = `<circle cx="39.8" cy="46.8" r="0.6" fill="#3a2016" />`;
      break;
    case "sun_freckles":
      art = [
        ...FRECKLES,
        [50, 49] as Point,
        [70, 49] as Point,
        [57, 51] as Point,
        [63, 51] as Point,
        [48, 53] as Point,
        [72, 53] as Point,
      ]
        .map(
          ([x, y], i) =>
            `<circle cx="${n(x)}" cy="${n(y)}" r="${i % 2 === 0 ? 0.45 : 0.35}" fill="rgba(140, 75, 40, 0.48)" />`,
        )
        .join("");
      break;
    case "bridge_freckles":
      art = [
        [57.6, 50.8],
        [58.8, 51.4],
        [60, 50.6],
        [61.2, 51.4],
        [62.4, 50.8],
      ]
        .map(
          ([x, y]) =>
            `<circle cx="${x}" cy="${y}" r="0.38" fill="rgba(140, 70, 38, 0.5)" />`,
        )
        .join("");
      break;
    case "glitter_freckles":
      art = [
        [52, 51],
        [55, 52],
        [65, 52],
        [68, 51],
        [58, 51],
        [62, 51],
      ]
        .map(([x, y], i) =>
          i % 2 === 0
            ? twinkle(x, y, 0.9, "#ffffff")
            : gem(x, y, 0.45, "#ffd8ef"),
        )
        .join("");
      break;
    case "heart_decal":
      art = heart(42.4, 55.2, 1.9, "#ff3d8a");
      break;
    case "star_stickers":
      art =
        star(79.2, 50.2, 1.6, "#ffd34d") +
        star(77, 53.6, 1.1, "#d9e2ee") +
        star(79.6, 55, 0.8, "#ff9ad5");
      break;
    case "face_gems":
      art = [
        [41.4, 48.6, 0.75],
        [42.6, 50.6, 0.6],
        [44.4, 51.8, 0.48],
        [78.6, 48.6, 0.75],
        [77.4, 50.6, 0.6],
        [75.6, 51.8, 0.48],
      ]
        .map(([x, y, r]) => gem(x, y, r, "#bfeaff"))
        .join("");
      break;
    case "butterfly_gems":
      art =
        butterflyGem(79.2, 50) +
        gem(77, 53.4, 0.45, "#ffd6f0") +
        gem(78.6, 54.8, 0.35, "#e2d4ff");
      break;
    default:
      return "";
  }
  return `<g class="face-detail face-${detail.replace(/_/g, "-")}">${art}</g>`;
}

export function renderPiercings(look: AvatarLook): string {
  const piercing = look.piercingId ?? "none";
  if (!piercing || piercing === "none") return "";
  let art = "";
  switch (piercing) {
    case "diamond_nose_stud":
      art =
        gem(58.2, 52.0, 0.55, "#ffffff") +
        `<circle cx="58.2" cy="52.0" r="0.25" fill="#ffffff" />`;
      break;
    case "gold_nose_hoop":
      art =
        `<path d="M57.6 51.4 C56.8 52.2 56.8 53.0 57.8 53.6" stroke="#f4c542" stroke-width="0.7" fill="none" />` +
        `<circle cx="57.2" cy="52.4" r="0.3" fill="#ffffff" />`;
      break;
    case "septum_ring":
      art =
        `<path d="M59.2 53.4 C59.2 54.8 60.8 54.8 60.8 53.4" stroke="#e0e4ee" stroke-width="0.8" fill="none" />` +
        `<circle cx="60.0" cy="54.4" r="0.4" fill="#ffffff" />`;
      break;
    case "lip_ring":
      art =
        `<path d="M56.2 60.2 L56.2 62.6" stroke="#e0e4ee" stroke-width="0.85" stroke-linecap="round" fill="none" />` +
        `<circle cx="56.2" cy="62.2" r="0.35" fill="#ffffff" />`;
      break;
    case "eyebrow_piercing":
      art =
        `<circle cx="47.2" cy="29.6" r="0.65" fill="#e0e4ee" stroke="#ffffff" stroke-width="0.2" />` +
        `<circle cx="47.6" cy="32.8" r="0.65" fill="#e0e4ee" stroke="#ffffff" stroke-width="0.2" />` +
        `<line x1="47.2" y1="29.6" x2="47.6" y2="32.8" stroke="#a0a8b8" stroke-width="0.4" />`;
      break;
    case "double_nostril":
      art = gem(58.2, 52.0, 0.5, "#ffffff") + gem(61.8, 52.0, 0.5, "#ffffff");
      break;
  }
  return `<g class="avatar-piercing piercing-${piercing.replace(/_/g, "-")}">${art}</g>`;
}

export function renderLayer3GlamFace(look: AvatarLook, p: string): string {
  const makeup = resolveMakeup(look);
  const { style, preset } = makeup;
  return (
    `<g class="avatar-face">` +
    renderCheeks(p, makeup.blush !== null) +
    `<g class="avatar-eyes eye-${style.replace(/_/g, "-")}">` +
    renderEye("l", preset.lidLeft, makeup, p, preset.browLift) +
    renderEye(
      "r",
      preset.lidRight,
      makeup,
      p,
      preset.browLift - (preset.smirk ? 1.4 : 0),
    ) +
    `</g>` +
    // Tiny button nose with a glossy tip
    `<path d="M58.2 51.6 Q58.6 52.8 60 52.8 Q61.4 52.8 61.8 51.6" stroke="rgba(80, 32, 18, 0.6)" stroke-width="0.7" stroke-linecap="round" fill="none" />` +
    `<ellipse cx="58.8" cy="52.1" rx="0.45" ry="0.3" fill="rgba(75, 30, 16, 0.4)" />` +
    `<ellipse cx="61.2" cy="52.1" rx="0.45" ry="0.3" fill="rgba(75, 30, 16, 0.4)" />` +
    `<ellipse cx="60" cy="51" rx="0.8" ry="0.55" fill="#ffffff" opacity="0.8" />` +
    renderLips(makeup, p) +
    renderFaceDetail(makeup.faceDetail) +
    renderPiercings(look) +
    `</g>`
  );
}

function shadowStops(makeup: ResolvedMakeup): string {
  const stop = (offset: number, color: string, opacity: number) =>
    `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}" />`;
  if (makeup.shadowSpecial === "holo") {
    return (
      stop(0, "#ff9ad5", 0.95) +
      stop(0.35, "#b9a6ff", 0.85) +
      stop(0.65, "#7fe3ff", 0.55) +
      stop(1, "#a3ffd6", 0)
    );
  }
  if (makeup.shadowSpecial === "ombre") {
    return (
      stop(0, "#ff4f6d", 0.95) +
      stop(0.45, "#ff9a3c", 0.75) +
      stop(1, "#ffd36e", 0)
    );
  }
  // Metallic doll lid: rich color across the whole lid, softening at the brow
  return (
    stop(0, makeup.shadow, 1) +
    stop(0.6, makeup.shadow, 0.85) +
    stop(1, makeup.shadow, 0.15)
  );
}

/** Gradients and clip paths for eyes, eyeshadow, blush, and lip gloss. */
export function makeupDefs(p: string, look: AvatarLook): string {
  const makeup = resolveMakeup(look);
  const { preset } = makeup;
  const [irisLight, irisMid, irisDark] = makeup.iris;
  // Holo shadow sweeps diagonally so the colors shift across the lid
  const shadowAxis =
    makeup.shadowSpecial === "holo"
      ? `x1="0" y1="1" x2="0.6" y2="0"`
      : `x1="0" y1="1" x2="0" y2="0"`;
  return (
    `<radialGradient id="${p}-iris" cx="50%" cy="62%" r="58%">` +
    `<stop offset="0" stop-color="${irisLight}" />` +
    `<stop offset="0.55" stop-color="${irisMid}" />` +
    `<stop offset="1" stop-color="${irisDark}" />` +
    `</radialGradient>` +
    `<linearGradient id="${p}-shadow" ${shadowAxis}>` +
    shadowStops(makeup) +
    `</linearGradient>` +
    (makeup.blush
      ? `<radialGradient id="${p}-blush" cx="50%" cy="50%" r="50%">` +
        `<stop offset="0" stop-color="${makeup.blush}" stop-opacity="0.7" />` +
        `<stop offset="0.55" stop-color="${makeup.blush}" stop-opacity="0.45" />` +
        `<stop offset="1" stop-color="${makeup.blush}" stop-opacity="0" />` +
        `</radialGradient>`
      : "") +
    `<radialGradient id="${p}-skin-light">` +
    `<stop offset="0" stop-color="#fff6e8" stop-opacity="0.5" />` +
    `<stop offset="1" stop-color="#fff6e8" stop-opacity="0" />` +
    `</radialGradient>` +
    `<radialGradient id="${p}-skin" cx="50%" cy="40%" r="62%">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.2" />` +
    `<stop offset="0.45" stop-color="#ffffff" stop-opacity="0" />` +
    `<stop offset="0.78" stop-color="#6e2814" stop-opacity="0" />` +
    `<stop offset="1" stop-color="#6e2814" stop-opacity="0.4" />` +
    `</radialGradient>` +
    `<linearGradient id="${p}-gloss" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.5" />` +
    `<stop offset="0.6" stop-color="#ffffff" stop-opacity="0.12" />` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0" />` +
    `</linearGradient>` +
    `<clipPath id="${p}-eye-l"><path d="${eyeGeometry(preset.lidLeft).sclera}" /></clipPath>` +
    `<clipPath id="${p}-eye-r"><path d="${eyeGeometry(preset.lidRight).sclera}" /></clipPath>`
  );
}

/** Cheek blush, sculpting contour, and highlight drawn over the bare face. */
function renderCheeks(p: string, withBlush: boolean): string {
  const shade = "rgba(110, 45, 22, 0.1)";
  return (
    // Airbrushed skin: soft rim shading, bright forehead and nose, contoured cheeks
    `<path d="${DOLL_HEAD_PATH}" fill="url(#${p}-skin)" />` +
    `<ellipse cx="60" cy="25" rx="9" ry="5" fill="url(#${p}-skin-light)" />` +
    `<path d="M35.6 50.4 Q40 58.6 48 63" stroke="rgba(90, 35, 18, 0.14)" stroke-width="3.6" stroke-linecap="round" fill="none" />` +
    `<path d="M84.4 50.4 Q80 58.6 72 63" stroke="rgba(90, 35, 18, 0.14)" stroke-width="3.6" stroke-linecap="round" fill="none" />` +
    `<path d="M57.8 44.4 Q56.5 48 57.8 50.8" stroke="${shade}" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
    `<path d="M62.2 44.4 Q63.5 48 62.2 50.8" stroke="${shade}" stroke-width="1.2" stroke-linecap="round" fill="none" />` +
    `<ellipse cx="60" cy="65.6" rx="4" ry="1.8" fill="url(#${p}-skin-light)" />` +
    (withBlush
      ? `<g class="avatar-blush">` +
        `<ellipse cx="42" cy="54" rx="7.4" ry="5.6" fill="url(#${p}-blush)" />` +
        `<ellipse cx="78" cy="54" rx="7.4" ry="5.6" fill="url(#${p}-blush)" />` +
        `</g>`
      : "") +
    // High cheekbone strobing highlighter with tiny sparkle dots
    `<ellipse cx="40.6" cy="50" rx="3.8" ry="1.3" fill="rgba(255,255,255,0.36)" transform="rotate(-22 40.6 50)" />` +
    `<ellipse cx="79.4" cy="50" rx="3.8" ry="1.3" fill="rgba(255,255,255,0.36)" transform="rotate(22 79.4 50)" />` +
    `<path d="M40 51 h0.01 M42.2 52.2 h0.01 M80 51 h0.01 M77.8 52.2 h0.01" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="0.9" />`
  );
}
