import type { AvatarLook, EntityAction } from "../types/world.ts";
import { DEFAULT_AVATAR_LOOK } from "../types/world.ts";
import {
  MIRROR,
  RIGHT_ARM_DOWN,
  RIGHT_ARM_WAVE,
  LEFT_ARM_HIP,
  armMarkup,
  n,
  resolveSkinTone,
  rightArmFor,
  sleeve,
} from "./avatar/shared.ts";
import { makeupDefs, renderLayer3GlamFace } from "./avatar/makeup.ts";
import {
  hairDefs,
  renderLayer1HairBack,
  renderLayer6HairFront,
} from "./avatar/hair.ts";
import {
  renderLayer4Footwear,
  renderLayer5Outfit,
  sleeveSpecFor,
} from "./avatar/clothes.ts";

export { SKIN_TONE_COLORS, ANCHORS, resolveSkinTone } from "./avatar/shared.ts";

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
 * Layer 2: Body Base (Skin tones, head, neck, torso, arms, legs)
 * ------------------------------------------------------------- */
const HEAD_PATH =
  "M60 13 C76.4 13 86.4 23 86.2 38.4 C86 46.4 83.6 52 79.2 57 C74 62.6 66.4 67.2 60 67.2 C53.6 67.2 46 62.6 40.8 57 C36.4 52 34 46.4 33.8 38.4 C33.6 23 43.6 13 60 13 Z";

const LEG_PATH =
  "M49.4 99 L59 99 C59.2 108 58.2 118 56.6 131 L51.8 131 C50.8 118 49.2 108 49.4 99 Z";

function renderLayer2BodyBase(look: AvatarLook, action: string): string {
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
    // Belly button with sparkling rhinestone navel gem
    `<ellipse cx="60" cy="95.4" rx="0.55" ry="0.75" fill="rgba(90, 40, 20, 0.45)" />` +
    `<circle cx="60" cy="94.6" r="0.65" fill="#f4c542" />` +
    `<circle cx="60" cy="94.6" r="0.35" fill="#ffffff" />` +
    // Left arm, hand on hip (player's left, viewer's right)
    `<g class="avatar-left-arm">` +
    armMarkup(LEFT_ARM_HIP, skin) +
    `</g>` +
    // Right arm (player's right, viewer's left)
    (isWaving
      ? ""
      : `<g class="avatar-right-arm">${armMarkup(RIGHT_ARM_DOWN, skin)}</g>`) +
    // Graceful slender neck with chin shadow and collarbones
    `<path d="M56.4 58 L63.6 58 L64.0 73 L56.0 73 Z" fill="${skin}" />` +
    `<path d="M56.2 63.4 Q60 68.6 63.8 63.4 L63.9 67.8 Q60 70.8 56.1 67.8 Z" fill="${contour}" />` +
    `<path d="M53.4 73.4 Q56 74.6 58.2 74" stroke="${contour}" stroke-width="0.6" stroke-linecap="round" fill="none" />` +
    `<path d="M66.6 73.4 Q64 74.6 61.8 74" stroke="${contour}" stroke-width="0.6" stroke-linecap="round" fill="none" />` +
    `<path d="M53.6 73.0 Q56 74.2 58.0 73.6" stroke="rgba(255,255,255,0.32)" stroke-width="0.5" stroke-linecap="round" fill="none" />` +
    // Ears
    `<ellipse cx="34.6" cy="45" rx="3" ry="4.4" fill="${skin}" />` +
    `<ellipse cx="85.4" cy="45" rx="3" ry="4.4" fill="${skin}" />` +
    // Sculpted head: wide cheekbones tapering to a graceful chin
    `<path d="${HEAD_PATH}" fill="${skin}" />` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 6b: Raised waving arm, drawn over the hair so the hand shows
 * ------------------------------------------------------------- */
function renderRaisedArm(look: AvatarLook, action: string): string {
  if (action !== "wave") return "";
  const spec = sleeveSpecFor(look);
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
 * Layer 7b: Jewelry (Earrings & Necklaces)
 * ------------------------------------------------------------- */
export function renderJewelry(look: AvatarLook): string {
  const jewelry = look.jewelryId ?? "oversized_gold_hoops";
  if (!jewelry || jewelry === "none") return "";
  let art = "";
  switch (jewelry) {
    case "oversized_gold_hoops":
      art =
        `<g class="jewelry-hoops">` +
        `<circle cx="34.4" cy="53" r="4.6" stroke="#f4c542" stroke-width="1.2" fill="none" />` +
        `<circle cx="85.6" cy="53" r="4.6" stroke="#f4c542" stroke-width="1.2" fill="none" />` +
        `<path d="M32 49.5 A4.6 4.6 0 0 1 36.8 49.5" stroke="#fff8d4" stroke-width="0.8" fill="none" />` +
        `<path d="M83.2 49.5 A4.6 4.6 0 0 1 88 49.5" stroke="#fff8d4" stroke-width="0.8" fill="none" />` +
        `<polygon points="34.4,57 35.1,57.9 34.4,58.8 33.7,57.9" fill="#ffffff" />` +
        `<polygon points="85.6,57 86.3,57.9 85.6,58.8 84.9,57.9" fill="#ffffff" />` +
        `</g>`;
      break;
    case "silver_bamboo_hoops":
      art =
        `<g class="jewelry-bamboo-hoops">` +
        `<circle cx="34.4" cy="53" r="4.8" stroke="#d5dde8" stroke-width="1.4" fill="none" />` +
        `<circle cx="85.6" cy="53" r="4.8" stroke="#d5dde8" stroke-width="1.4" fill="none" />` +
        `<circle cx="34.4" cy="57.8" r="0.9" fill="#ffffff" stroke="#9aa8b8" stroke-width="0.3" />` +
        `<circle cx="85.6" cy="57.8" r="0.9" fill="#ffffff" stroke="#9aa8b8" stroke-width="0.3" />` +
        `<circle cx="29.6" cy="53" r="0.8" fill="#ffffff" stroke="#9aa8b8" stroke-width="0.3" />` +
        `<circle cx="90.4" cy="53" r="0.8" fill="#ffffff" stroke="#9aa8b8" stroke-width="0.3" />` +
        `</g>`;
      break;
    case "diamond_studs":
      art =
        `<g class="jewelry-studs">` +
        `<circle cx="34.6" cy="48" r="1.3" fill="#ffffff" stroke="#b0c0d8" stroke-width="0.3" />` +
        `<circle cx="85.4" cy="48" r="1.3" fill="#ffffff" stroke="#b0c0d8" stroke-width="0.3" />` +
        `<polygon points="34.6,45.8 35.1,48 36.8,48 35.3,49 35.8,50.8 34.6,49.6 33.4,50.8 33.9,49 32.4,48 34.1,48" fill="#e8f4ff" />` +
        `<polygon points="85.4,45.8 85.9,48 87.6,48 86.1,49 86.6,50.8 85.4,49.6 84.2,50.8 84.7,49 83.2,48 84.9,48" fill="#e8f4ff" />` +
        `</g>`;
      break;
    case "pearl_drops":
      art =
        `<g class="jewelry-pearl-drops">` +
        `<line x1="34.6" y1="46" x2="34.6" y2="52" stroke="#f4c542" stroke-width="0.6" />` +
        `<line x1="85.4" y1="46" x2="85.4" y2="52" stroke="#f4c542" stroke-width="0.6" />` +
        `<ellipse cx="34.6" cy="54.2" rx="1.6" ry="2.2" fill="#fff5ea" stroke="#e0d0c4" stroke-width="0.3" />` +
        `<circle cx="34.2" cy="53.4" r="0.6" fill="#ffffff" />` +
        `<ellipse cx="85.4" cy="54.2" rx="1.6" ry="2.2" fill="#fff5ea" stroke="#e0d0c4" stroke-width="0.3" />` +
        `<circle cx="85.0" cy="53.4" r="0.6" fill="#ffffff" />` +
        `</g>`;
      break;
    case "rhinestone_choker":
      art =
        `<g class="jewelry-rhinestone-choker">` +
        `<path d="M56.2 68.4 Q60 70.4 63.8 68.4" stroke="#d0d8e4" stroke-width="1.6" stroke-dasharray="0.9 0.7" fill="none" />` +
        `<path d="M56.2 68.4 Q60 70.4 63.8 68.4" stroke="#ffffff" stroke-width="0.8" fill="none" />` +
        `<circle cx="60" cy="70.2" r="0.9" fill="#ffffff" stroke="#b0c0d8" stroke-width="0.3" />` +
        `</g>`;
      break;
    case "layered_chains":
      art =
        `<g class="jewelry-layered-chains">` +
        `<path d="M56.4 67.8 Q60 69.4 63.6 67.8" stroke="#f4c542" stroke-width="1.0" fill="none" />` +
        `<path d="M55.8 70.4 Q60 73.2 64.2 70.4" stroke="#f4c542" stroke-width="1.1" fill="none" />` +
        `<rect x="59.3" y="72.6" width="1.4" height="1.8" rx="0.3" fill="#f4c542" />` +
        `<path d="M59.6 72.6 L59.6 71.8 Q60 71.3 60.4 71.8 L60.4 72.6" stroke="#f4c542" stroke-width="0.4" fill="none" />` +
        `</g>`;
      break;
    case "butterfly_choker":
      art =
        `<g class="jewelry-butterfly-choker">` +
        `<path d="M56.2 68.8 Q60 70.6 63.8 68.8" stroke="#1c1622" stroke-width="1.2" fill="none" />` +
        `<path d="M58.8 69.4 C58.2 68.6 57.8 69.8 59.4 70.4 Z" fill="#ff70b0" />` +
        `<path d="M61.2 69.4 C61.8 68.6 62.2 69.8 60.6 70.4 Z" fill="#ff70b0" />` +
        `<ellipse cx="58.6" cy="71.0" rx="0.8" ry="0.6" fill="#7fe3ff" />` +
        `<ellipse cx="61.4" cy="71.0" rx="0.8" ry="0.6" fill="#7fe3ff" />` +
        `<circle cx="60" cy="70.2" r="0.5" fill="#ffffff" />` +
        `</g>`;
      break;
  }
  return `<g class="avatar-jewelry jewelry-${jewelry.replace(/_/g, "-")}">${art}</g>`;
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

  return [
    `<defs>${makeupDefs(p, look)}${hairDefs(p)}</defs>`,
    renderLayer0ShadowAndBoard(look, act),
    renderLayer1HairBack(look, p),
    renderLayer2BodyBase(look, act),
    renderLayer3GlamFace(look, p),
    renderLayer4Footwear(look),
    renderLayer5Outfit(look, act),
    renderLayer6HairFront(look, p),
    renderRaisedArm(look, act),
    renderJewelry(look),
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
