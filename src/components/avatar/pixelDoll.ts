/**
 * Pixel doll markup: stacks the 64×96 sprite layers from
 * public/assets/pixel/doll like a Fantage paper doll. Skin, eyes and hair are
 * grey-coded sprites; an SVG filter maps their six grey levels to the
 * player's colours, so one sprite serves every colour.
 */
import type { AvatarLook } from "../../types/world.ts";
import {
  BANGS_OPTIONS,
  EYE_COLORS,
  resolveBottomId,
  resolveShoeId,
  resolveTopId,
} from "../../types/avatarOptions.ts";
import {
  BOTTOM_LOOKS,
  HAIR_LOOKS,
  SHOE_LOOKS,
  TOP_LOOKS,
} from "./pixelItems.ts";
import { HAIR_KIT } from "./pixelHairKit.ts";
import { OUTFITS } from "./pixelOutfits.ts";
import { SHOE_KIT } from "./pixelShoeKit.ts";
import { COSTUMES } from "./pixelCostumes.ts";
import { resolveSkinTone } from "./shared.ts";

/** Full figure on a 3:4 canvas so callers' 120×160 sizing still fits. */
export const PIXEL_VIEWBOX = "-4 0 72 96";
export const PIXEL_PORTRAIT_VIEWBOX = "6 0 52 52";
/** Neck to hem, 3:4 like the full figure, for closet thumbnails. */
export const PIXEL_OUTFIT_VIEWBOX = "11 42 42 56";
/** Knees down, 3:4, for shoe thumbnails. */
export const PIXEL_FEET_VIEWBOX = "21 72 22 29.33";

const BASE = `${import.meta.env?.BASE_URL ?? "/"}assets/pixel/doll/`;
const dashed = (id: string) => id.replace(/_/g, "-");

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0x888888;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex: string, amount: number): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const ch = (v: number) => v + (target - v) * t;
  return [ch(r), ch(g), ch(b)];
}

/** A filter mapping the six sprite grey levels to six colours (dark to light). */
function levelFilter(id: string, colors: [number, number, number][]): string {
  const table = (c: number) =>
    colors.map((rgb) => (rgb[c] / 255).toFixed(3)).join(" ");
  return (
    `<filter id="${id}" color-interpolation-filters="sRGB">` +
    `<feComponentTransfer>` +
    `<feFuncR type="discrete" tableValues="${table(0)}"/>` +
    `<feFuncG type="discrete" tableValues="${table(1)}"/>` +
    `<feFuncB type="discrete" tableValues="${table(2)}"/>` +
    `</feComponentTransfer></filter>`
  );
}

function sprite(name: string, filter?: string): string {
  return `<image href="${BASE}${name}.png" x="0" y="0" width="64" height="96" style="image-rendering:pixelated"${
    filter ? ` filter="url(#${filter})"` : ""
  }/>`;
}

export function renderPixelDoll(
  look: AvatarLook,
  action: string,
  idPrefix: string,
): string {
  const skin = resolveSkinTone(look.skinTone);
  const hair = /^#[0-9a-f]{6}$/i.test(String(look.hairColor ?? ""))
    ? String(look.hairColor)
    : "#6b4226";
  const iris =
    EYE_COLORS.find((option) => option.id === look.eyeColorId)?.iris ??
    EYE_COLORS[0].iris;
  const shape = HAIR_LOOKS[look.hairId] ?? "wavy";
  const topId = resolveTopId(look);
  const bottomId = resolveBottomId(look);
  const shoesId = resolveShoeId(look);
  const kit = HAIR_KIT.find((entry) => entry.id === look.hairKitId);
  const kitSprite = kit && `hair-kit-${kit.id.slice(4)}`;
  const dress =
    look.dressId && Object.hasOwn(OUTFITS, look.dressId)
      ? look.dressId
      : undefined;
  const shoeKit = SHOE_KIT.find((entry) => entry.id === look.shoeKitId);
  const costume = COSTUMES.find((entry) => entry.id === look.costumeId);
  const showHair = !costume?.hidesHair;
  const bangs = BANGS_OPTIONS.find((option) => option.id === look.bangsId)?.id;
  const streak = /^#[0-9a-f]{6}$/i.test(look.hairStreak ?? "")
    ? String(look.hairStreak)
    : undefined;
  const p = idPrefix;
  const defs =
    levelFilter(`${p}-skin`, [
      mix(skin, -0.62),
      mix(skin, -0.35),
      mix(skin, -0.14),
      hexToRgb(skin),
      mix(skin, 0.3),
      [255, 255, 255],
    ]) +
    levelFilter(`${p}-hair`, [
      mix(hair, -0.62),
      mix(hair, -0.42),
      mix(hair, -0.22),
      hexToRgb(hair),
      mix(hair, 0.32),
      mix(hair, 0.62),
    ]) +
    (streak
      ? levelFilter(`${p}-streak`, [
          mix(streak, -0.5),
          mix(streak, -0.3),
          mix(streak, -0.15),
          hexToRgb(streak),
          hexToRgb(streak),
          mix(streak, 0.4),
        ])
      : "") +
    levelFilter(`${p}-eyes`, [
      [26, 15, 10],
      hexToRgb(iris[2]),
      hexToRgb(iris[1]),
      hexToRgb(iris[1]),
      hexToRgb(iris[0]),
      [255, 255, 255],
    ]);
  const legacy =
    !look.topId && !look.bottomId && look.outfitId
      ? ` outfit-${dashed(look.outfitId)}`
      : "";
  return (
    `<defs>${defs}</defs>` +
    (action === "sit" ? "" : sprite("board")) +
    `<g class="avatar-hair-back hair-${dashed(String(look.hairId))}">${
      !showHair
        ? ""
        : kitSprite
          ? sprite(`${kitSprite}-back`)
          : sprite(`hair-back-${shape}`, `${p}-hair`)
    }</g>` +
    sprite("body", `${p}-skin`) +
    `<g class="avatar-footwear footwear-${dashed(shoesId)}">${
      shoeKit
        ? sprite(`shoe-kit-${shoeKit.id.slice(5)}`)
        : SHOE_LOOKS[shoesId]
          ? sprite(`shoes-${shoesId}`)
          : ""
    }</g>` +
    (dress
      ? `<g class="avatar-outfit dress-${dashed(dress)}">${sprite(`outfit-${dress}`)}</g>`
      : `<g class="avatar-outfit${legacy} top-${dashed(topId)} bottom-${dashed(bottomId)}">${
          BOTTOM_LOOKS[bottomId] ? sprite(`bottom-${bottomId}`) : ""
        }${TOP_LOOKS[topId] ? sprite(`top-${topId}`) : ""}</g>`) +
    sprite("face") +
    `<g class="avatar-eyes eye-${dashed(String(look.eyeStyle || "winged_glam"))}">${sprite("eyes", `${p}-eyes`)}</g>` +
    `<g class="avatar-hair-front">${
      !showHair
        ? ""
        : kitSprite
          ? sprite(`${kitSprite}-front`)
          : sprite(
              bangs ? `hair-bangs-${bangs}` : `hair-front-${shape}`,
              `${p}-hair`,
            ) + (streak ? sprite("hair-streak", `${p}-streak`) : "")
    }</g>` +
    (costume
      ? `<g class="avatar-costume costume-${dashed(costume.id)}">${sprite(`costume-${costume.id}`)}</g>`
      : "")
  );
}
