import type { SkinTone } from "../../types/world.ts";

export const SKIN_TONE_COLORS: Record<SkinTone, string> = {
  porcelain: "#fff0ea",
  ivory: "#fce8dc",
  fair: "#ffe3d1",
  peach: "#ffd8c4",
  golden_fair: "#f8dfc2",
  almond: "#e8c49e",
  warm: "#e8b082",
  olive: "#d6ab7a",
  tan: "#dfa77b",
  honey: "#cca068",
  bronze: "#ab7143",
  caramel: "#9c6035",
  terracotta: "#8c4f2b",
  chestnut: "#6b3b1e",
  espresso: "#784421",
  deep: "#5c3826",
  ebony: "#422518",
  midnight: "#2d160e",
};

/** Doll proportions on the canvas: a big head (about a third of the height), slim torso, long legs. */
export const ANCHORS = {
  HeadCenter: { x: 60, y: 31 },
  Neck: { x: 60, y: 60 },
  Waist: { x: 60, y: 90 },
  HandRight: { x: 44, y: 101 },
  HandLeft: { x: 70, y: 91 },
  Feet: { x: 60, y: 146 },
} as const;

/** Head-and-shoulders crop of the canvas for close-up previews. */
export const PORTRAIT_VIEWBOX = "6 -16 108 108";

/** Doll face outline in head-art coordinates (see {@link RIG}). */
export const DOLL_HEAD_PATH =
  "M60 13 C76 13 87.4 23 87.8 37.6 C88.2 44.6 84.6 51 79.6 56.4 C73.8 62.8 66.6 69.4 60 69.4 C53.4 69.4 46.2 62.8 40.4 56.4 C35.4 51 31.8 44.6 32.2 37.6 C32.6 23 44 13 60 13 Z";

/**
 * Head, torso, and leg art is drawn on a shared 120×160 layout grid and
 * placed onto the doll proportions by these transforms: the head shrinks
 * slightly, the torso slims, and the legs stretch long onto chunky platforms.
 */
export const RIG = {
  // Big doll head: head art at full size, its chin (60, 69) resting at y 57.5
  head: "matrix(1 0 0 1 0 -11.5)",
  /** The head rig scaled 1.2× about the chin so faces read at small world sizes. */
  headBoost: "matrix(1.2 0 0 1.2 -12 -25.3)",
  torso: "matrix(0.8 0 0 1 12 -7.5)",
  legs: "matrix(0.8 0 0 1.38 12 -47.7)",
} as const;

/** Wraps markup in one of the {@link RIG} transforms. */
export function rig(part: keyof typeof RIG, markup: string): string {
  return markup ? `<g transform="${RIG[part]}">${markup}</g>` : "";
}

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
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Rounds a coordinate to two decimals for compact path data. */
export function n(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** Mirrors viewer-left artwork onto the viewer-right side of the 120-wide canvas. */
export const MIRROR = `transform="matrix(-1 0 0 1 120 0)"`;

export const INK = "#2a1610";

/**
 * Adds the doll's bold ink outline to solid shapes that have no stroke of
 * their own. Highlights (white, translucent, gradient, or `opacity`) and
 * tiny specks stay unlined so the cel shading reads clean.
 */
export function inked(markup: string, width: number): string {
  return markup.replace(
    /<(path|rect|ellipse|circle|polygon)\b([^>]*?)\s*\/>/g,
    (tag: string, name: string, attrs: string) =>
      /\bstroke=|\bopacity=|fill="(none|url|rgba|#fff")|fill="#ffffff"|\br="0\.|\brx="0\./.test(
        attrs,
      )
        ? tag
        : `<${name}${attrs} stroke="${INK}" stroke-width="${width}" stroke-linejoin="round" />`,
  );
}

/* -------------------------------------------------------------
 * Arms: shared by the body, sleeves, and handheld anchor
 * ------------------------------------------------------------- */
export type Point = readonly [number, number];
export type ArmPose = {
  shoulder: Point;
  elbowControl: Point;
  elbow: Point;
  wristControl: Point;
  wrist: Point;
  hand: Point;
  handAngle: number;
};

export const RIGHT_ARM_DOWN: ArmPose = {
  shoulder: [51.2, 66.6],
  elbowControl: [47.6, 73.4],
  elbow: [46.8, 82.6],
  wristControl: [46, 92],
  wrist: [44.8, 98.8],
  hand: [44.2, 101.2],
  handAngle: 16,
};

export const RIGHT_ARM_WAVE: ArmPose = {
  shoulder: [51.2, 66.6],
  elbowControl: [43.4, 67.6],
  elbow: [38.6, 61.2],
  wristControl: [34.6, 55.4],
  wrist: [34.2, 48.4],
  hand: [34.2, 45.8],
  handAngle: -5,
};

export const LEFT_ARM_HIP: ArmPose = {
  shoulder: [68.8, 66.6],
  elbowControl: [74.6, 71.6],
  elbow: [76.8, 79.6],
  wristControl: [76.4, 87],
  wrist: [71.4, 90.2],
  hand: [69.8, 91],
  handAngle: -60,
};

export function pt([x, y]: Point): string {
  return `${n(x)} ${n(y)}`;
}

export function armPath(arm: ArmPose): string {
  return `M${pt(arm.shoulder)} Q${pt(arm.elbowControl)} ${pt(arm.elbow)} Q${pt(arm.wristControl)} ${pt(arm.wrist)}`;
}

/** Upper-arm portion of a pose, split at `t` along the shoulder-to-elbow curve. */
export function upperArmPath(arm: ArmPose, t: number): string {
  const [x0, y0] = arm.shoulder;
  const [cx, cy] = arm.elbowControl;
  const [x1, y1] = arm.elbow;
  const q0: Point = [x0 + (cx - x0) * t, y0 + (cy - y0) * t];
  const q1: Point = [cx + (x1 - cx) * t, cy + (y1 - cy) * t];
  const end: Point = [q0[0] + (q1[0] - q0[0]) * t, q0[1] + (q1[1] - q0[1]) * t];
  return `M${pt(arm.shoulder)} Q${pt(q0)} ${pt(end)}`;
}

export function handMarkup(arm: ArmPose, skin: string): string {
  const [hx, hy] = arm.hand;
  return (
    `<ellipse cx="${n(hx)}" cy="${n(hy)}" rx="1.9" ry="2.6" fill="${skin}" stroke="${INK}" stroke-width="0.7" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />` +
    // Sculpted acrylic manicured nails with gloss highlight
    `<ellipse cx="${n(hx)}" cy="${n(hy + 2.1)}" rx="1.4" ry="0.95" fill="#ff4f94" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />` +
    `<ellipse cx="${n(hx - 0.3)}" cy="${n(hy + 1.9)}" rx="0.5" ry="0.3" fill="#ffffff" opacity="0.75" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />`
  );
}

/** Slim doll arm width; the ink outline adds 0.7 on each side. */
const ARM_WIDTH = 3.3;

export function armMarkup(arm: ArmPose, skin: string): string {
  const d = armPath(arm);
  return (
    `<path d="${d}" stroke="${INK}" stroke-width="${ARM_WIDTH + 1.4}" stroke-linecap="round" fill="none" />` +
    `<path d="${d}" stroke="${skin}" stroke-width="${ARM_WIDTH}" stroke-linecap="round" fill="none" />` +
    handMarkup(arm, skin)
  );
}

export function rightArmFor(action: string): ArmPose {
  return action === "wave" ? RIGHT_ARM_WAVE : RIGHT_ARM_DOWN;
}

export type SleeveSpec = {
  color: string;
  width: number;
  upperOnly: boolean;
  detail?: string;
};

/** Sleeve following an arm pose; cap sleeves cover only the upper arm. */
export function sleeve(arm: ArmPose, spec: SleeveSpec): string {
  const d = spec.upperOnly ? upperArmPath(arm, 0.5) : armPath(arm);
  // Sleeve widths were tuned for a thicker arm; slim them to the doll arm
  const width = spec.width * 0.8;
  return (
    `<path d="${d}" stroke="${INK}" stroke-width="${n(width + 1.2)}" stroke-linecap="round" fill="none" />` +
    `<path d="${d}" stroke="${spec.color}" stroke-width="${n(width)}" stroke-linecap="round" fill="none" />` +
    (spec.detail
      ? `<path d="${d}" stroke="${spec.detail}" stroke-width="0.5" fill="none" />`
      : "")
  );
}
