import type { AvatarLook } from "../../types/world.ts";
import { BRACELETS, NECKLACES, findOption } from "../../types/avatarOptions.ts";
import {
  INK,
  LEFT_ARM_HIP,
  inked,
  n,
  rig,
  rightArmFor,
  type ArmPose,
} from "./shared.ts";

/* -------------------------------------------------------------
 * Necklaces: drawn on the torso rig, where the neck spans x 56–64
 * ------------------------------------------------------------- */
function beads(
  count: number,
  r: number,
  fill: string,
  y: (t: number) => number,
): string {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const x = 56 + t * 8;
    return (
      `<circle cx="${n(x)}" cy="${n(y(t))}" r="${r}" fill="${fill}" />` +
      `<circle cx="${n(x - r * 0.3)}" cy="${n(y(t) - r * 0.3)}" r="${n(r * 0.35)}" fill="#ffffff" opacity="0.9" />`
    );
  }).join("");
}

/** Gentle U drop from neck edge to neck edge. */
const choker = (t: number) => 68.6 + Math.sin(t * Math.PI) * 1.6;

function chain(d: string, color: string): string {
  return (
    `<path d="${d}" stroke="${INK}" stroke-width="1.5" fill="none" />` +
    `<path d="${d}" stroke="${color}" stroke-width="0.9" stroke-dasharray="1.1 0.5" fill="none" />`
  );
}

const NECKLACE_ART: Record<string, () => string> = {
  diamond_choker: () =>
    `<path d="M56 68.6 Q60 72.2 64 68.6" stroke="${INK}" stroke-width="2.4" fill="none" />` +
    `<path d="M56 68.6 Q60 72.2 64 68.6" stroke="#dfe7f2" stroke-width="1.6" fill="none" />` +
    beads(6, 0.7, "#f4f8ff", choker),
  pearl_choker: () =>
    `<path d="M56 68.6 Q60 72.2 64 68.6" stroke="${INK}" stroke-width="2.2" fill="none" />` +
    beads(7, 0.8, "#fff6ea", choker),
  cross_chain: () =>
    chain("M55.6 69.4 Q60 79 64.4 69.4", "#dfe6ee") +
    `<path d="M59.2 76.2 h1.6 v1.4 h1.4 v1.4 h-1.4 v3.4 h-1.6 v-3.4 h-1.4 v-1.4 h1.4 Z" fill="#e8eef6" />`,
  heart_chain: () =>
    chain("M55.6 69.4 Q60 78.4 64.4 69.4", "#f4c542") +
    `<path d="M60 80 C57 77.6 57.4 75.2 59 75.2 C59.6 75.2 60 75.8 60 76.2 C60 75.8 60.4 75.2 61 75.2 C62.6 75.2 63 77.6 60 80 Z" fill="#ff5fa2" />` +
    `<circle cx="59" cy="76.2" r="0.4" fill="#ffffff" />`,
  gold_coin_layers: () =>
    chain("M56.2 68.6 Q60 71.4 63.8 68.6", "#f4c542") +
    chain("M55.6 70 Q60 76 64.4 70", "#f4c542") +
    [57.2, 60, 62.8]
      .map(
        (x, i) =>
          `<circle cx="${x}" cy="${i === 1 ? 74.4 : 72.8}" r="1" fill="#f4c542" />`,
      )
      .join(""),
};

export function renderNecklace(look: AvatarLook): string {
  const id = findOption(NECKLACES, look.necklaceId)?.id;
  if (!id || id === "none") return "";
  return rig(
    "torso",
    `<g class="avatar-necklace necklace-${id.replace(/_/g, "-")}">${inked(NECKLACE_ART[id](), 0.5)}</g>`,
  );
}

/* -------------------------------------------------------------
 * Bangles: stacked rings across each wrist (final coordinates)
 * ------------------------------------------------------------- */
function bangleStack(arm: ArmPose, colors: readonly string[]): string {
  const [wx, wy] = arm.wrist;
  const [cx, cy] = arm.wristControl;
  // Rings sit across the forearm, so tilt them perpendicular to it
  const angle = (Math.atan2(wy - cy, wx - cx) * 180) / Math.PI + 90;
  return colors
    .map((color, i) => {
      const along = -1.2 + i * 1;
      const x = wx - ((wx - cx) / 8) * along;
      const y = wy - ((wy - cy) / 8) * along;
      return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="2.6" ry="0.75" fill="none" stroke="${INK}" stroke-width="1.5" transform="rotate(${n(angle)} ${n(x)} ${n(y)})" /><ellipse cx="${n(x)}" cy="${n(y)}" rx="2.6" ry="0.75" fill="none" stroke="${color}" stroke-width="0.8" transform="rotate(${n(angle)} ${n(x)} ${n(y)})" />`;
    })
    .join("");
}

const BANGLE_COLORS: Record<string, readonly string[]> = {
  gold_bangles: ["#f4c542", "#ffe08a", "#f4c542"],
  rainbow_bangles: ["#ff5fa2", "#7fd3ff", "#b48be0"],
};

export function renderBangles(look: AvatarLook, action: string): string {
  const id = findOption(BRACELETS, look.braceletId)?.id;
  if (!id || id === "none") return "";
  const colors = BANGLE_COLORS[id];
  return (
    `<g class="avatar-bangles bangles-${id.replace(/_/g, "-")}">` +
    // The right stack rides along with the waving arm animation
    `<g class="avatar-right-bangles">${bangleStack(rightArmFor(action), colors)}</g>` +
    bangleStack(LEFT_ARM_HIP, colors) +
    `</g>`
  );
}
