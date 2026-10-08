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
  shoulder: [49.4, 74.6],
  elbowControl: [45, 79.4],
  elbow: [43.6, 86.2],
  wristControl: [42.2, 92.4],
  wrist: [39.4, 96.4],
  hand: [38.2, 98.4],
  handAngle: 30,
};

export const RIGHT_ARM_WAVE: ArmPose = {
  shoulder: [49.4, 74.6],
  elbowControl: [39.4, 75],
  elbow: [32.6, 68.4],
  wristControl: [27.6, 62.6],
  wrist: [26.8, 55.4],
  hand: [26.8, 52.6],
  handAngle: -5,
};

export const LEFT_ARM_HIP: ArmPose = {
  shoulder: [70.6, 74.6],
  elbowControl: [78.4, 78.6],
  elbow: [80.8, 85.2],
  wristControl: [79.6, 91.6],
  wrist: [74.2, 95.6],
  hand: [72.4, 96.8],
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
    `<ellipse cx="${n(hx)}" cy="${n(hy)}" rx="2.3" ry="3" fill="${skin}" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />` +
    // Sculpted acrylic manicured nails with gloss highlight
    `<ellipse cx="${n(hx)}" cy="${n(hy + 2.1)}" rx="1.4" ry="0.95" fill="#ff4f94" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />` +
    `<ellipse cx="${n(hx - 0.3)}" cy="${n(hy + 1.9)}" rx="0.5" ry="0.3" fill="#ffffff" opacity="0.75" transform="rotate(${arm.handAngle} ${n(hx)} ${n(hy)})" />`
  );
}

export function armMarkup(arm: ArmPose, skin: string): string {
  return (
    `<path d="${armPath(arm)}" stroke="${skin}" stroke-width="4.4" stroke-linecap="round" fill="none" />` +
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
  return (
    `<path d="${d}" stroke="${spec.color}" stroke-width="${spec.width}" stroke-linecap="round" fill="none" />` +
    (spec.detail
      ? `<path d="${d}" stroke="${spec.detail}" stroke-width="0.5" fill="none" />`
      : "")
  );
}
