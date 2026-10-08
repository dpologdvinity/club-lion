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
import { INK, MIRROR, n, pt, type Point } from "./shared.ts";

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
    shadow: "#b8704c",
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
const EYE_OUTER: Point = [40.6, 44.4];
const EYE_INNER: Point = [55.2, 46.4];

export function eyeGeometry(lid: EyeState) {
  const drop = lid === "closed" ? 0 : lid;
  const u1: Point = [42.4, 38.2 + drop * 9.5];
  const u2: Point = [51.4, 37.8 + drop * 9];
  const l1: Point = [52.6, 50.8];
  const l2: Point = [44.4, 50.8];
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

function lashes(points: readonly Point[], down: boolean, scale = 1): string {
  const lengths = [3.2, 3.0, 2.6, 2.2].map((len) => len * scale);
  return points
    .map(([x, y], i) => {
      const len = lengths[i] ?? 2.2;
      const dy = down ? len * 0.6 : -len;
      return `<path d="M${n(x)} ${n(y)} Q${n(x - len * 0.3)} ${n(y + dy * 0.75)} ${n(x - len * 0.85)} ${n(y + dy)}" stroke="${INK}" stroke-width="0.9" stroke-linecap="round" fill="none" />`;
    })
    .join("");
}

const BROW_PATH =
  "M55.8 35.4 C55.4 33.0 52.0 31.0 47.0 30.2 C43.6 29.8 40.6 31.4 38.6 34.2 C41.4 32.4 44.2 31.8 47.0 32.0 C50.8 32.2 53.8 33.4 55.8 35.4 Z";

const EYESHADOW_TOP = "L56.6 42.4 C52.4 33.2 43 33.4 38.8 41.2 Z";

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
    `translate(0 ${n(browLift)})` +
    (preset.browAngle ? ` rotate(${preset.browAngle} 39.4 34.4)` : "");
  const brow =
    `<path d="${BROW_PATH}" fill="rgba(42, 22, 14, 0.92)" transform="${browTransform}" />` +
    `<path d="M55.4 35.6 L55.6 33.8 M54.2 35.2 L54.5 33.2 M53.0 34.8 L53.4 32.6" stroke="rgba(35, 18, 10, 0.7)" stroke-width="0.45" stroke-linecap="round" fill="none" transform="${browTransform}" />`;
  const shadowFill = `url(#${p}-shadow)`;
  const lidSparkle =
    makeup.shadowSpecial === "holo"
      ? twinkle(45.4, 39.6, 0.9, "#ffffff") +
        `<circle cx="50.6" cy="38.6" r="0.35" fill="#ffffff" />`
      : "";

  if (lid === "closed") {
    const closedCurve = `M${pt(EYE_OUTER)} C43.6 48.6 51.4 49.4 ${pt(EYE_INNER)}`;
    const lashPoints = [0.08, 0.2, 0.34].map((t) =>
      cubicPoint(EYE_OUTER, [43.6, 48.6], [51.4, 49.4], EYE_INNER, t),
    );
    return (
      `<g class="avatar-eye eye-${side} eye-closed"${transform}>` +
      brow +
      `<path class="eye-shadow" d="${closedCurve} L55.8 44.2 C51 44.6 44 43.8 39.6 41.4 Z" fill="${makeup.shadow}" opacity="0.55" />` +
      `<path d="${closedCurve}" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" fill="none" />` +
      `<path d="M${pt(EYE_OUTER)} L37.4 43" stroke="${INK}" stroke-width="1.1" stroke-linecap="round" />` +
      lashes(lashPoints, true) +
      `</g>`
    );
  }

  const drop = lid;
  const [ox, oy] = EYE_OUTER;
  const wing = preset.wing;
  const wingTip: Point = [
    ox - 5.2 * wing,
    oy - 4.4 * wing * (preset.wingLift ?? 1) - drop * 1.5,
  ];
  const liner =
    `M55.9 46.2 C${n(geo.u2[0] + 0.4)} ${n(geo.u2[1] - 1.7)} ${n(geo.u1[0] - 0.4)} ${n(geo.u1[1] - 1.8)} ${n(ox - 0.8)} ${n(oy - 2)} ` +
    `L${pt(wingTip)} L${n(ox - 0.1)} ${n(oy + 0.7)} C${pt(geo.u1)} ${pt(geo.u2)} ${pt(EYE_INNER)} Z`;
  const lashPoints = [0.08, 0.18, 0.29, 0.42].map((t) =>
    cubicPoint(EYE_OUTER, geo.u1, geo.u2, EYE_INNER, t),
  );
  const lowerLashPoints = [0.5, 0.66, 0.82].map((t) =>
    cubicPoint(EYE_INNER, [52.6, 50.8], [44.4, 50.8], EYE_OUTER, t),
  );
  const gaze = preset.gazeUp ?? 0;
  const irisR = 4.8 * (preset.irisScale ?? 1);
  const irisY = 45.6 + drop * 1.2 - gaze;
  const glintY = 43.8 + drop * 3.2 - gaze * 0.4;

  // Graphic liner: a floating crease line plus a second parallel wing
  const graphic = preset.graphic
    ? `<path class="graphic-liner" d="M41.4 40.4 C44 35.2 51.4 34.6 55.8 40.2" stroke="${makeup.shadow}" stroke-width="0.75" stroke-linecap="round" fill="none" />` +
      `<path class="graphic-liner" d="M${n(ox - 0.4)} ${n(oy - 2.9)} L${n(wingTip[0] + 0.4)} ${n(wingTip[1] - 1.8)}" stroke="${makeup.shadow}" stroke-width="0.7" stroke-linecap="round" />`
    : "";

  // Glitter: sparkle specks (level 1) or a full glitter lid with rhinestone (level 2)
  const glitter =
    preset.glitter === 2
      ? `<g class="glitter-pop">` +
        twinkle(44, 38.8, 1.1, "#ffffff") +
        twinkle(51.8, 37.6, 0.8, "#fff4b8") +
        `<circle cx="47.6" cy="38" r="0.4" fill="#ffffff" />` +
        `<circle cx="42.2" cy="41" r="0.35" fill="#ffd6f0" />` +
        `<circle cx="54.2" cy="40.6" r="0.35" fill="#d6f4ff" />` +
        `<ellipse cx="55.3" cy="46.2" rx="0.9" ry="0.6" fill="#ffffff" opacity="0.9" />` +
        gem(wingTip[0], wingTip[1], 0.85, "#d8f3ff") +
        `</g>`
      : preset.glitter === 1
        ? twinkle(44, 39.6, 1.1, "#ffffff") +
          `<circle cx="51.4" cy="37.8" r="0.45" fill="#ffffff" />` +
          `<circle cx="55" cy="45.4" r="0.6" fill="#ffffff" opacity="0.9" />`
        : "";

  // Feline inner-corner cat eye flick pointing toward the bridge of the nose
  const innerCatFlick = `<polygon points="55.0,46.2 57.0,47.4 55.4,45.6" fill="${INK}" />`;

  // Spidery flutter doll lashes along the bottom lash line
  const spideryDollLashes = `<path d="M44.4 50.8 Q43.4 53.0 42.4 54.2 M47.8 51.2 Q47.2 53.6 46.4 55.0 M51.4 51.0 Q51.2 53.2 50.6 54.4" stroke="${INK}" stroke-width="0.7" stroke-linecap="round" fill="none" />`;

  return (
    `<g class="avatar-eye eye-${side}"${transform}>` +
    brow +
    // Pearlescent brow-bone highlight
    `<ellipse cx="48.8" cy="${n(33.6 + browLift * 0.6)}" rx="3.8" ry="1.1" fill="rgba(255,255,255,0.25)" transform="rotate(-10 48.8 ${n(33.6 + browLift * 0.6)})" />` +
    // Gradient eyeshadow up to the crease
    `<path class="eye-shadow" d="${geo.lidCurve} ${EYESHADOW_TOP}" fill="${shadowFill}" />` +
    // Metallic shimmer lid foil
    `<path d="${geo.lidCurve} C51.6 35.8 43.6 36.2 40.4 41.6 Z" fill="rgba(255,255,255,0.22)" />` +
    lidSparkle +
    (preset.smoky
      ? `<path d="M${n(ox + 0.4)} ${n(oy + 0.8)} C44 51.6 50.4 52.4 54.6 48.6 C50 50.2 44.4 50 ${n(ox + 0.4)} ${n(oy + 0.8)} Z" fill="${makeup.shadow}" opacity="0.7" />`
      : "") +
    // Crisp cut-crease socket definition
    `<path d="M40.4 41.6 C43.2 34.6 51.6 34.2 55.6 42.4" stroke="rgba(45, 18, 12, 0.55)" stroke-width="0.75" stroke-linecap="round" fill="none" />` +
    graphic +
    // Eyeball, iris, pupil, and multi-dimensional doll catchlights clipped to the almond
    `<g class="eye-blink">` +
    `<path d="${geo.sclera}" fill="#fff8f4" />` +
    `<g clip-path="url(#${p}-eye-${side})">` +
    // Base iris gradient
    `<circle cx="48.2" cy="${n(irisY)}" r="${n(irisR)}" fill="url(#${p}-iris)" />` +
    // Dark hypnotic limbal ring
    `<circle cx="48.2" cy="${n(irisY)}" r="${n(irisR)}" stroke="#120804" stroke-width="1.1" fill="none" opacity="0.9" />` +
    // Radial starburst striations
    `<circle cx="48.2" cy="${n(irisY)}" r="${n(irisR * 0.72)}" stroke="${makeup.iris[0]}" stroke-width="0.45" stroke-dasharray="0.6 0.9" fill="none" opacity="0.75" />` +
    `<circle cx="48.2" cy="${n(irisY)}" r="${n(irisR * 0.55)}" stroke="${makeup.iris[0]}" stroke-width="0.35" stroke-dasharray="0.4 0.7" fill="none" opacity="0.65" />` +
    // Luminous doll-eye bottom crescent rim glow
    `<path d="M${n(48.2 - irisR * 0.68)} ${n(irisY + irisR * 0.35)} Q48.2 ${n(irisY + irisR * 0.92)} ${n(48.2 + irisR * 0.68)} ${n(irisY + irisR * 0.35)}" stroke="${makeup.iris[0]}" stroke-width="0.85" stroke-linecap="round" fill="none" opacity="0.9" />` +
    // Deep pupil
    `<circle cx="48.2" cy="${n(irisY)}" r="${n(irisR * 0.44)}" fill="#0c0503" />` +
    // Upper lid cast shadow
    `<path d="${geo.lidCurve}" stroke="rgba(20, 8, 6, 0.48)" stroke-width="2.8" fill="none" />` +
    // Primary angled oval catchlight
    `<ellipse cx="46.5" cy="${n(glintY)}" rx="1.6" ry="1.2" fill="#ffffff" transform="rotate(-15 46.5 ${n(glintY)})" />` +
    // Secondary diamond sparkle catchlight
    `<circle cx="50.4" cy="${n(glintY + 3.2)}" r="0.75" fill="#ffffff" opacity="0.92" />` +
    // Micro glass glint
    `<circle cx="45.2" cy="${n(glintY + 2.0)}" r="0.4" fill="#ffffff" opacity="0.85" />` +
    `</g>` +
    // Lower lash line
    `<path d="M${n(ox + 0.4)} ${n(oy + 0.6)} C44.4 49.6 50 50.6 53.6 48.8" stroke="rgba(60, 30, 25, 0.6)" stroke-width="0.55" fill="none" />` +
    `<path d="M${n(ox + 1)} ${n(oy + 1.6)} L${n(ox - 0.6)} ${n(oy + 2.8)}" stroke="${INK}" stroke-width="0.6" stroke-linecap="round" />` +
    spideryDollLashes +
    (preset.lowerLashes
      ? `<g class="lower-lashes">${lashes(lowerLashPoints, true, 0.6)}</g>`
      : "") +
    // Bold winged eyeliner, inner cat flick, and curled upper lashes
    `<path d="${liner}" fill="${INK}" />` +
    innerCatFlick +
    lashes(lashPoints, false) +
    `</g>` +
    glitter +
    `</g>`
  );
}

const LIP_UPPER =
  "M53.4 57.6 C55.2 56.4 57.2 54.8 58.8 55.2 C59.5 55.5 59.8 55.9 60 55.9 C60.2 55.9 60.5 55.5 61.2 55.2 C62.8 54.8 64.8 56.4 66.6 57.6 C64.0 58.3 62.0 58.6 60 58.6 C58.0 58.6 56.0 58.3 53.4 57.6 Z";
const LIP_LOWER =
  "M54.0 57.8 C56.2 58.5 58.0 58.7 60 58.7 C62.0 58.7 63.8 58.5 66.0 57.8 C65.2 60.8 63.0 62.4 60 62.4 C57.0 62.4 54.8 60.8 54.0 57.8 Z";
const LIP_CONTOUR =
  "M53.4 57.6 C55.2 56.4 57.2 54.8 58.8 55.2 C59.5 55.5 59.8 55.9 60 55.9 C60.2 55.9 60.5 55.5 61.2 55.2 C62.8 54.8 64.8 56.4 66.6 57.6 C65.4 60.8 63.2 62.4 60 62.4 C56.8 62.4 54.6 60.8 53.4 57.6 Z";

function lipFinishMarkup(finish: LipFinish, p: string): string {
  const gloss =
    // Dual pillowy cushion reflections on lower lip
    `<ellipse cx="58.2" cy="60.4" rx="1.8" ry="0.85" fill="#ffffff" opacity="0.65" transform="rotate(-6 58.2 60.4)" />` +
    `<ellipse cx="61.8" cy="60.4" rx="1.8" ry="0.85" fill="#ffffff" opacity="0.55" transform="rotate(6 61.8 60.4)" />` +
    // Cupid's bow specular crest highlights
    `<path d="M57.4 55.8 Q58.6 55.2 59.4 56.1" stroke="#ffffff" stroke-width="0.55" stroke-linecap="round" fill="none" opacity="0.65" />` +
    `<path d="M62.6 55.8 Q61.4 55.2 60.6 56.1" stroke="#ffffff" stroke-width="0.55" stroke-linecap="round" fill="none" opacity="0.65" />` +
    // Wet-look glass glint dots
    `<circle cx="57.8" cy="60.8" r="0.4" fill="#ffffff" opacity="0.9" />` +
    `<circle cx="61.6" cy="60.9" r="0.28" fill="#ffffff" opacity="0.85" />` +
    `<circle cx="59.8" cy="57.2" r="0.25" fill="#ffffff" opacity="0.75" />;`;
  switch (finish) {
    case "matte":
      // Velvet finish: soft center sheen, no specular hits
      return `<ellipse cx="60" cy="60.2" rx="2.4" ry="0.8" fill="rgba(255,255,255,0.1)" />`;
    case "frost":
      return (
        `<path d="${LIP_LOWER}" fill="rgba(255, 255, 255, 0.3)" />` +
        `<path d="${LIP_UPPER}" fill="rgba(255, 255, 255, 0.2)" />` +
        `<ellipse cx="59.4" cy="60.1" rx="2.2" ry="0.6" fill="#ffffff" opacity="0.5" />` +
        `<circle cx="56.6" cy="59.2" r="0.25" fill="#ffffff" />` +
        `<circle cx="63.2" cy="59.4" r="0.25" fill="#ffffff" />`
      );
    case "glitter":
      return (
        `<path d="${LIP_LOWER}" fill="url(#${p}-gloss)" />` +
        gloss +
        `<g class="lip-glitter">` +
        `<circle cx="56.4" cy="59.2" r="0.3" fill="#ffffff" />` +
        `<circle cx="61.2" cy="61" r="0.28" fill="#fff4b8" />` +
        `<circle cx="63.8" cy="59" r="0.3" fill="#ffffff" />` +
        `<circle cx="59.6" cy="57.6" r="0.22" fill="#ffffff" />` +
        `<circle cx="64.4" cy="57.6" r="0.22" fill="#fff4b8" />` +
        twinkle(58, 61, 0.6, "#ffffff") +
        `</g>`
      );
    default:
      return `<path d="${LIP_LOWER}" fill="url(#${p}-gloss)" />` + gloss;
  }
}

function renderLips(makeup: ResolvedMakeup, p: string): string {
  const tilt = makeup.preset.smirk
    ? ` transform="rotate(-5 60 58.6) translate(60 58.6) scale(1.06) translate(-60 -58.6)"`
    : ` transform="translate(60 58.6) scale(1.06) translate(-60 -58.6)"`;
  return (
    `<g class="avatar-lips lip-${makeup.lipFinish}"${tilt}>` +
    `<path d="${LIP_LOWER}" fill="${makeup.lips}" />` +
    `<path d="${LIP_UPPER}" fill="${makeup.lips}" />` +
    `<path d="${LIP_UPPER}" fill="rgba(60, 10, 25, 0.22)" />` +
    // Iconic 90s/Y2K deep ombré lip liner
    `<path d="${LIP_CONTOUR}" stroke="rgba(55, 12, 18, 0.55)" stroke-width="0.85" fill="none" />` +
    // Center mouth parting line
    `<path d="M53.6 57.6 C56.4 58.4 58.4 58.6 60 58.6 C61.6 58.6 63.6 58.4 66.4 57.6" stroke="rgba(35, 6, 12, 0.8)" stroke-width="0.75" stroke-linecap="round" fill="none" />` +
    // Mouth corner indents
    `<circle cx="53.4" cy="57.6" r="0.55" fill="rgba(45, 8, 15, 0.55)" />` +
    `<circle cx="66.6" cy="57.6" r="0.55" fill="rgba(45, 8, 15, 0.55)" />` +
    lipFinishMarkup(makeup.lipFinish, p) +
    `</g>` +
    (makeup.preset.smirk
      ? `<path d="M66.6 55.6 Q67.6 56.6 67.2 57.8" stroke="rgba(110, 50, 30, 0.35)" stroke-width="0.5" stroke-linecap="round" fill="none" />`
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
    // Sculpted chic button nose
    `<path d="M59.2 46.0 L59.3 50.4" stroke="rgba(95, 40, 20, 0.16)" stroke-width="0.7" stroke-linecap="round" fill="none" />` +
    `<path d="M60.7 46.0 L60.7 50.4" stroke="rgba(255, 255, 255, 0.38)" stroke-width="0.8" stroke-linecap="round" fill="none" />` +
    `<path d="M58.4 52.4 Q60 53.8 61.6 52.4" stroke="rgba(95, 38, 22, 0.55)" stroke-width="0.8" stroke-linecap="round" fill="none" />` +
    `<ellipse cx="60" cy="51.3" rx="1.2" ry="0.9" fill="rgba(255, 255, 255, 0.45)" />` +
    `<circle cx="60" cy="51.1" r="0.55" fill="#ffffff" opacity="0.88" />` +
    `<ellipse cx="58.2" cy="52.3" rx="0.5" ry="0.32" fill="rgba(75, 30, 16, 0.35)" />` +
    `<ellipse cx="61.8" cy="52.3" rx="0.5" ry="0.32" fill="rgba(75, 30, 16, 0.35)" />` +
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
  return (
    stop(0, makeup.shadow, 0.95) +
    stop(0.55, makeup.shadow, 0.55) +
    stop(1, makeup.shadow, 0)
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
        `<stop offset="0" stop-color="${makeup.blush}" stop-opacity="0.5" />` +
        `<stop offset="1" stop-color="${makeup.blush}" stop-opacity="0" />` +
        `</radialGradient>`
      : "") +
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
  return (
    // Cheekbone hollow contour
    `<path d="M36.8 49.6 Q40.6 57.6 47.4 61.8" stroke="rgba(90, 35, 18, 0.12)" stroke-width="3.4" stroke-linecap="round" fill="none" />` +
    `<path d="M83.2 49.6 Q79.4 57.6 72.6 61.8" stroke="rgba(90, 35, 18, 0.12)" stroke-width="3.4" stroke-linecap="round" fill="none" />` +
    (withBlush
      ? `<g class="avatar-blush">` +
        `<ellipse cx="44.2" cy="52.6" rx="6.8" ry="4.0" fill="url(#${p}-blush)" />` +
        `<ellipse cx="75.8" cy="52.6" rx="6.8" ry="4.0" fill="url(#${p}-blush)" />` +
        `</g>`
      : "") +
    // High cheekbone strobing highlighter
    `<ellipse cx="41.6" cy="49.8" rx="3.4" ry="1.2" fill="rgba(255,255,255,0.32)" transform="rotate(-22 41.6 49.8)" />` +
    `<ellipse cx="41.2" cy="49.6" rx="1.6" ry="0.6" fill="#ffffff" opacity="0.65" transform="rotate(-22 41.2 49.6)" />` +
    `<ellipse cx="78.4" cy="49.8" rx="3.4" ry="1.2" fill="rgba(255,255,255,0.32)" transform="rotate(22 78.4 49.8)" />` +
    `<ellipse cx="78.8" cy="49.6" rx="1.6" ry="0.6" fill="#ffffff" opacity="0.65" transform="rotate(22 78.8 49.6)" />`
  );
}
