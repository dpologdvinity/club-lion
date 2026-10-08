import type { AvatarLook, EyeStyle } from "../../types/world.ts";
import { INK, MIRROR, n, pt, type Point } from "./shared.ts";

/* -------------------------------------------------------------
 * Glam makeup presets per eye style
 * ------------------------------------------------------------- */
type EyeState = number | "closed";

export type GlamPreset = {
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

export function resolveGlamPreset(eyeStyle?: string): {
  style: EyeStyle;
  preset: GlamPreset;
} {
  const style = (
    eyeStyle && eyeStyle in GLAM_PRESETS ? eyeStyle : "winged_glam"
  ) as EyeStyle;
  return { style, preset: GLAM_PRESETS[style] };
}


/* -------------------------------------------------------------
 * Layer 3: Glam Face (eyeshadow, winged liner, lashes, brows, lips)
 * Eyes are drawn for the viewer's left and mirrored for the right.
 * ------------------------------------------------------------- */
const EYE_OUTER: Point = [40.6, 44.4];
const EYE_INNER: Point = [55.2, 46.4];

export function eyeGeometry(lid: EyeState) {
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

export function renderLayer3GlamFace(look: AvatarLook, p: string): string {
  const { style, preset } = resolveGlamPreset(look.eyeStyle);
  return (
    `<g class="avatar-face">` +
    renderCheeks(p) +
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


/** Gradients and clip paths for eyes, eyeshadow, blush, and lip gloss. */
export function makeupDefs(p: string, look: AvatarLook): string {
  const { preset } = resolveGlamPreset(look.eyeStyle);
  const [irisLight, irisMid, irisDark] = preset.iris;
  return (
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
function renderCheeks(p: string): string {
  return (
    `<path d="M37.6 50 Q41 57.4 47.4 61.6" stroke="rgba(110, 50, 30, 0.07)" stroke-width="3.2" stroke-linecap="round" fill="none" />` +
    `<path d="M82.4 50 Q79 57.4 72.6 61.6" stroke="rgba(110, 50, 30, 0.07)" stroke-width="3.2" stroke-linecap="round" fill="none" />` +
    `<ellipse cx="44.6" cy="53" rx="6.2" ry="3.6" fill="url(#${p}-blush)" />` +
    `<ellipse cx="75.4" cy="53" rx="6.2" ry="3.6" fill="url(#${p}-blush)" />` +
    `<ellipse cx="42.4" cy="50.6" rx="2.6" ry="1" fill="rgba(255,255,255,0.16)" transform="rotate(-20 42.4 50.6)" />` +
    `<ellipse cx="77.6" cy="50.6" rx="2.6" ry="1" fill="rgba(255,255,255,0.16)" transform="rotate(20 77.6 50.6)" />`
  );
}
