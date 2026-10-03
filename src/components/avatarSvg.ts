import type {
  AvatarLook,
  SkinTone,
  EyeStyle,
  EntityAction,
} from "../types/world.ts";
import { DEFAULT_AVATAR_LOOK } from "../types/world.ts";

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
    return tone;
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

/* -------------------------------------------------------------
 * Layer 0: Shadow & Board / Sparkle Trails
 * ------------------------------------------------------------- */
function renderLayer0ShadowAndBoard(look: AvatarLook, action: string): string {
  const parts: string[] = [];

  // Ground shadow
  parts.push(
    `<g class="avatar-shadow">` +
      `<ellipse cx="60" cy="148" rx="28" ry="7" fill="rgba(41, 75, 60, 0.2)" />` +
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
 * Layer 1: Hair Back
 * ------------------------------------------------------------- */
function renderLayer1HairBack(look: AvatarLook): string {
  const hairColor = look.hairColor || "#4a3728";
  const hairId = look.hairId || "classic_shag";

  if (hairId === "long_waves") {
    return (
      `<g class="avatar-hair-back hair-long-waves">` +
      // Lush long flowing hair behind head and shoulders down past waist
      `<path d="M34 38 C24 55 22 80 25 106 C28 114 36 112 40 102 C44 92 42 76 45 68 ` +
      `L75 68 C78 76 76 92 80 102 C84 112 92 114 95 106 C98 80 96 55 86 38 Z" ` +
      `fill="${hairColor}" />` +
      `<path d="M26 95 Q32 108 38 98" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" fill="none" />` +
      `<path d="M82 98 Q88 108 94 95" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" fill="none" />` +
      `</g>`
    );
  }

  if (hairId === "spiky_blaze") {
    return (
      `<g class="avatar-hair-back hair-spiky-blaze">` +
      `<path d="M30 38 L22 28 L32 30 L36 18 L46 25 L60 14 L74 25 L84 18 L88 30 L98 28 L90 38 Z" ` +
      `fill="${hairColor}" />` +
      `</g>`
    );
  }

  // classic_shag and default back tufts
  return (
    `<g class="avatar-hair-back hair-classic-shag">` +
    `<path d="M32 36 C28 46 26 58 32 66 C36 71 42 68 45 62 L75 62 C78 68 84 71 88 66 C94 58 92 46 88 36 Z" ` +
    `fill="${hairColor}" />` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 2: Body Base (Skin tones, head, neck, torso, arms, legs)
 * ------------------------------------------------------------- */
function renderLayer2BodyBase(look: AvatarLook, action: string): string {
  const skin = resolveSkinTone(look.skinTone);
  const isWaving = action === "wave";
  const isSitting = action === "sit";

  const legYOffset = isSitting ? -6 : 0;
  const legRightX = isSitting ? 70 : 66;
  const legLeftX = isSitting ? 50 : 54;

  return (
    `<g class="avatar-body">` +
    // Legs / Base feet skin
    `<g class="avatar-legs">` +
    `<rect x="${legLeftX - 4}" y="${102 + legYOffset}" width="8" height="${36 - legYOffset}" rx="4" fill="${skin}" />` +
    `<rect x="${legRightX - 4}" y="${102 + legYOffset}" width="8" height="${36 - legYOffset}" rx="4" fill="${skin}" />` +
    `</g>` +
    // Torso base
    `<path d="M46 72 Q60 70 74 72 L71 104 Q60 106 49 104 Z" fill="${skin}" />` +
    // Left Arm (player's left, viewer's right)
    `<g class="avatar-left-arm">` +
    `<path d="M72 73 Q85 82 86 92" stroke="${skin}" stroke-width="7" stroke-linecap="round" fill="none" />` +
    `<circle cx="87" cy="93" r="4.5" fill="${skin}" />` +
    `</g>` +
    // Right Arm (player's right, viewer's left: Anchor_HandRight is 32, 92)
    `<g class="avatar-right-arm ${isWaving ? "arm-wave" : ""}">` +
    (isWaving
      ? // Arm waving up near head
        `<path d="M48 73 Q36 60 32 48" stroke="${skin}" stroke-width="7" stroke-linecap="round" fill="none" />` +
        `<circle cx="31" cy="46" r="4.5" fill="${skin}" />`
      : // Normal arm at side
        `<path d="M48 73 Q35 82 34 92" stroke="${skin}" stroke-width="7" stroke-linecap="round" fill="none" />` +
        `<circle cx="33" cy="93" r="4.5" fill="${skin}" />`) +
    `</g>` +
    // Neck
    `<rect x="56" y="60" width="8" height="12" rx="3" fill="${skin}" />` +
    // Ears
    `<circle cx="33" cy="42" r="5" fill="${skin}" />` +
    `<circle cx="33" cy="42" r="3" fill="rgba(0,0,0,0.06)" />` +
    `<circle cx="87" cy="42" r="5" fill="${skin}" />` +
    `<circle cx="87" cy="42" r="3" fill="rgba(0,0,0,0.06)" />` +
    // Chibi Head Base (Anchor_HeadCenter is 60, 38)
    `<path d="M35 40 C33 22 45 16 60 16 C75 16 87 22 85 40 C85 54 75 66 60 66 C45 66 35 54 35 40 Z" fill="${skin}" />` +
    // Cute Anime Cheek Blush
    `<ellipse cx="43" cy="48" rx="4.5" ry="2.5" fill="#ff6b81" opacity="0.4" />` +
    `<ellipse cx="77" cy="48" rx="4.5" ry="2.5" fill="#ff6b81" opacity="0.4" />` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 3: Expressive Anime Face (Eyes, eyebrows, mouth)
 * ------------------------------------------------------------- */
function renderLayer3AnimeFace(look: AvatarLook): string {
  const eyeStyle = (look.eyeStyle || "sparkle") as EyeStyle;

  let eyesMarkup = "";
  let eyebrowsMarkup = "";
  let mouthMarkup = "";

  if (eyeStyle === "wink") {
    // Left eye open sparkle, right eye winking
    eyesMarkup =
      `<g class="avatar-eyes eye-wink">` +
      // Left Eye (open anime sparkle)
      `<ellipse cx="48" cy="42" rx="5.5" ry="7" fill="#1b263b" />` +
      `<circle cx="46.5" cy="39" r="2.2" fill="#ffffff" />` +
      `<circle cx="49.5" cy="44.5" r="1.1" fill="#ffffff" />` +
      `<path d="M42 36 Q48 33 54 37" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none" />` +
      // Right Eye (winking cute arc)
      `<path d="M66 42 Q72 47 78 41" stroke="#0f172a" stroke-width="2.6" stroke-linecap="round" fill="none" />` +
      `<path d="M78 41 L80 43" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />` +
      `</g>`;
    eyebrowsMarkup =
      `<path d="M43 32 Q48 30 53 33" stroke="#2c3e50" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
      `<path d="M67 33 Q72 31 77 34" stroke="#2c3e50" stroke-width="1.6" stroke-linecap="round" fill="none" />`;
    mouthMarkup = `<path d="M57 54 Q60 58 63 54" stroke="#d63031" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
  } else if (eyeStyle === "sleepy") {
    // Relaxed, sleepy droopy lids
    eyesMarkup =
      `<g class="avatar-eyes eye-sleepy">` +
      `<path d="M42 43 Q48 40 54 44" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none" />` +
      `<path d="M44 44 Q48 47 52 44" stroke="#2c3e50" stroke-width="1.2" fill="#2c3e50" />` +
      `<path d="M66 43 Q72 40 78 44" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none" />` +
      `<path d="M68 44 Q72 47 76 44" stroke="#2c3e50" stroke-width="1.2" fill="#2c3e50" />` +
      `</g>`;
    eyebrowsMarkup =
      `<path d="M43 34 Q48 35 53 36" stroke="#2c3e50" stroke-width="1.5" stroke-linecap="round" fill="none" />` +
      `<path d="M67 36 Q72 35 77 34" stroke="#2c3e50" stroke-width="1.5" stroke-linecap="round" fill="none" />`;
    mouthMarkup = `<ellipse cx="60" cy="54" rx="2" ry="1.5" fill="#e17055" />`;
  } else if (eyeStyle === "smirk") {
    // Confident, half-lidded smirk
    eyesMarkup =
      `<g class="avatar-eyes eye-smirk">` +
      `<path d="M43 38 Q48 35 53 39" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" fill="none" />` +
      `<ellipse cx="48" cy="41" rx="4.5" ry="4.5" fill="#1b263b" />` +
      `<circle cx="47" cy="39" r="1.5" fill="#ffffff" />` +
      `<path d="M67 39 Q72 35 77 38" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" fill="none" />` +
      `<ellipse cx="72" cy="41" rx="4.5" ry="4.5" fill="#1b263b" />` +
      `<circle cx="71" cy="39" r="1.5" fill="#ffffff" />` +
      `</g>`;
    eyebrowsMarkup =
      `<path d="M43 30 Q48 29 53 33" stroke="#2c3e50" stroke-width="1.8" stroke-linecap="round" fill="none" />` +
      `<path d="M67 33 Q72 29 77 30" stroke="#2c3e50" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
    mouthMarkup = `<path d="M57 53 Q62 55 64 51" stroke="#d63031" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
  } else {
    // Default: "sparkle" - Classic Fantage big glossy anime eyes
    eyesMarkup =
      `<g class="avatar-eyes eye-sparkle">` +
      // Left eye
      `<ellipse cx="48" cy="42" rx="5.8" ry="7.2" fill="#1b263b" />` +
      `<circle cx="46" cy="39" r="2.4" fill="#ffffff" />` +
      `<circle cx="50" cy="44.5" r="1.2" fill="#ffffff" />` +
      `<path d="M42 36 Q48 33 54 37" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" fill="none" />` +
      // Right eye
      `<ellipse cx="72" cy="42" rx="5.8" ry="7.2" fill="#1b263b" />` +
      `<circle cx="70" cy="39" r="2.4" fill="#ffffff" />` +
      `<circle cx="74" cy="44.5" r="1.2" fill="#ffffff" />` +
      `<path d="M66 37 Q72 33 78 36" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" fill="none" />` +
      `</g>`;
    eyebrowsMarkup =
      `<path d="M43 31 Q48 29 53 32" stroke="#2c3e50" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
      `<path d="M67 32 Q72 29 77 31" stroke="#2c3e50" stroke-width="1.6" stroke-linecap="round" fill="none" />`;
    mouthMarkup = `<path d="M57 53 Q60 57 63 53" stroke="#d63031" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
  }

  return (
    `<g class="avatar-face">` +
    eyebrowsMarkup +
    eyesMarkup +
    // Delicate anime nose dot
    `<circle cx="60" cy="48" r="0.8" fill="rgba(0,0,0,0.25)" />` +
    mouthMarkup +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 4: Footwear (Anchor_Feet at 60, 142)
 * ------------------------------------------------------------- */
function renderLayer4Footwear(look: AvatarLook): string {
  const shoesId = look.shoesId || "canvas_sneakers";

  if (shoesId === "canvas_sneakers") {
    return (
      `<g class="avatar-footwear footwear-canvas-sneakers">` +
      // Left shoe (viewer's left: 45 to 58)
      `<g class="shoe-left">` +
      `<path d="M46 135 L56 135 L56 144 L44 144 Q44 138 46 135 Z" fill="#e74c3c" />` +
      `<path d="M44 140 Q44 144 47 144 L56 144 L56 146 L43 146 Q42 144 44 140 Z" fill="#ffffff" />` +
      `<line x1="47" y1="137" x2="52" y2="137" stroke="#ffffff" stroke-width="1" />` +
      `</g>` +
      // Right shoe (viewer's right: 62 to 75)
      `<g class="shoe-right">` +
      `<path d="M64 135 L74 135 Q76 138 76 144 L64 144 Z" fill="#e74c3c" />` +
      `<path d="M64 144 L73 144 Q76 144 76 140 Q78 144 77 146 L64 146 Z" fill="#ffffff" />` +
      `<line x1="68" y1="137" x2="73" y2="137" stroke="#ffffff" stroke-width="1" />` +
      `</g>` +
      `</g>`
    );
  }

  // Generic shoes / boots fallback
  return (
    `<g class="avatar-footwear footwear-generic">` +
    `<rect x="44" y="136" width="12" height="9" rx="3" fill="#2c3e50" />` +
    `<rect x="64" y="136" width="12" height="9" rx="3" fill="#2c3e50" />` +
    `<rect x="43" y="143" width="14" height="3" rx="1.5" fill="#bdc3c7" />` +
    `<rect x="63" y="143" width="14" height="3" rx="1.5" fill="#bdc3c7" />` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 5: Outfit (Waist at 60, 98, Neck at 60, 68)
 * ------------------------------------------------------------- */
function renderLayer5Outfit(look: AvatarLook): string {
  const outfitId = look.outfitId || "denim_jacket";

  if (outfitId === "striped_tee") {
    return (
      `<g class="avatar-outfit outfit-striped-tee">` +
      // Pants
      `<path d="M48 96 L72 96 L71 135 L64 135 L60 108 L56 135 L49 135 Z" fill="#2c3e50" />` +
      // Striped Tee body
      `<path d="M46 70 L74 70 L73 98 L47 98 Z" fill="#ffffff" />` +
      `<rect x="47" y="74" width="26" height="3" fill="#2980b9" />` +
      `<rect x="47" y="81" width="26" height="3" fill="#2980b9" />` +
      `<rect x="47" y="88" width="26" height="3" fill="#2980b9" />` +
      `<rect x="47" y="95" width="26" height="3" fill="#2980b9" />` +
      // Sleeves
      `<path d="M46 70 L40 78 L44 82 L48 74 Z" fill="#ffffff" />` +
      `<path d="M74 70 L80 78 L76 82 L72 74 Z" fill="#ffffff" />` +
      `</g>`
    );
  }

  if (outfitId === "barista_apron") {
    return (
      `<g class="avatar-outfit outfit-barista-apron">` +
      // Pants
      `<path d="M48 96 L72 96 L71 135 L64 135 L60 108 L56 135 L49 135 Z" fill="#34495e" />` +
      // Inner white shirt
      `<path d="M46 70 L74 70 L73 98 L47 98 Z" fill="#f8f9fa" />` +
      // Barista Green Apron
      `<path d="M52 74 L68 74 L71 114 L49 114 Z" fill="#27ae60" />` +
      // Apron straps & neck loop
      `<path d="M52 74 L57 66 L63 66 L68 74" stroke="#1e824c" stroke-width="1.8" fill="none" />` +
      // Apron pocket
      `<rect x="54" y="92" width="12" height="10" rx="1.5" fill="#1e824c" />` +
      // Mini coffee cup patch
      `<circle cx="60" cy="84" r="2.5" fill="#f1c40f" />` +
      `</g>`
    );
  }

  if (outfitId === "cargo_pants") {
    return (
      `<g class="avatar-outfit outfit-cargo-pants">` +
      // Cargo Pants with pockets
      `<path d="M47 94 L73 94 L72 135 L64 135 L60 106 L56 135 L48 135 Z" fill="#7f8c8d" />` +
      `<rect x="46" y="106" width="5" height="8" rx="1" fill="#636e72" />` +
      `<rect x="69" y="106" width="5" height="8" rx="1" fill="#636e72" />` +
      // Basic tee
      `<path d="M46 70 L74 70 L73 96 L47 96 Z" fill="#e67e22" />` +
      `</g>`
    );
  }

  // Default: denim_jacket
  return (
    `<g class="avatar-outfit outfit-denim-jacket">` +
    // Pants (under jacket)
    `<path d="M48 96 L72 96 L71 135 L64 135 L60 108 L56 135 L49 135 Z" fill="#34495e" />` +
    // Inner shirt
    `<path d="M52 70 L68 70 L68 96 L52 96 Z" fill="#ecf0f1" />` +
    // Denim Jacket Body
    `<path d="M46 70 L74 70 L73 98 L47 98 Z" fill="#2980b9" />` +
    // Jacket center placket & bronze buttons
    `<line x1="60" y1="74" x2="60" y2="98" stroke="#1f618d" stroke-width="2" />` +
    `<circle cx="60" cy="78" r="1.2" fill="#f39c12" />` +
    `<circle cx="60" cy="85" r="1.2" fill="#f39c12" />` +
    `<circle cx="60" cy="92" r="1.2" fill="#f39c12" />` +
    // Denim collar lapels
    `<path d="M50 68 L56 75 L60 69 L64 75 L70 68 Z" fill="#1f618d" />` +
    // Sleeves
    `<path d="M46 70 L38 84 L43 86 L49 75 Z" fill="#2980b9" />` +
    `<path d="M74 70 L82 84 L77 86 L71 75 Z" fill="#2980b9" />` +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 6: Hair Front (Anchor_HeadCenter at 60, 38)
 * ------------------------------------------------------------- */
function renderLayer6HairFront(look: AvatarLook): string {
  const hairColor = look.hairColor || "#4a3728";
  const hairId = look.hairId || "classic_shag";

  // Stylized anime highlight sheen / streaks
  const highlightMarkup =
    `<g class="hair-highlight">` +
    `<path d="M42 24 Q52 19 68 21" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" stroke-linecap="round" fill="none" />` +
    `<circle cx="72" cy="22" r="1.2" fill="rgba(255,255,255,0.7)" />` +
    `<circle cx="38" cy="26" r="1" fill="rgba(255,255,255,0.6)" />` +
    `</g>`;

  if (hairId === "spiky_blaze") {
    return (
      `<g class="avatar-hair-front hair-spiky-blaze">` +
      // Dynamic anime spikes over forehead and crown
      `<path d="M30 36 L34 22 L40 30 L48 16 L54 28 L62 14 L70 28 L78 18 L82 32 L88 24 L90 38 ` +
      `C88 42 85 48 84 52 L80 44 L75 48 L70 38 L65 46 L60 38 L54 46 L48 38 L42 46 L38 42 Z" ` +
      `fill="${hairColor}" />` +
      highlightMarkup +
      `</g>`
    );
  }

  if (hairId === "long_waves") {
    return (
      `<g class="avatar-hair-front hair-long-waves">` +
      // Side bangs and face framing curls
      `<path d="M32 38 C32 20 46 14 60 14 C74 14 88 20 88 38 ` +
      `C87 48 83 60 81 64 C78 56 78 44 76 40 ` +
      `C72 40 68 44 64 42 ` +
      `C58 40 52 45 46 43 ` +
      `C42 45 40 56 39 64 C37 60 33 48 32 38 Z" ` +
      `fill="${hairColor}" />` +
      highlightMarkup +
      `</g>`
    );
  }

  // Default: classic_shag
  return (
    `<g class="avatar-hair-front hair-classic-shag">` +
    // Layered messy bangs sweeping across forehead
    `<path d="M32 36 C32 20 45 15 60 15 C75 15 88 20 88 36 ` +
    `C86 46 84 55 83 58 C80 50 80 42 76 38 ` +
    `C72 43 68 45 64 38 ` +
    `C60 44 55 45 51 39 ` +
    `C47 44 42 44 40 38 ` +
    `C38 45 37 54 35 58 C34 52 33 44 32 36 Z" ` +
    `fill="${hairColor}" />` +
    highlightMarkup +
    `</g>`
  );
}

/* -------------------------------------------------------------
 * Layer 7: Headwear & Eyewear Accessories
 * ------------------------------------------------------------- */
function renderLayer7HeadwearAndEyewear(look: AvatarLook): string {
  const parts: string[] = [];

  // Eyewear (Anchor_HeadCenter at 60, 38)
  if (look.eyewearId) {
    if (look.eyewearId === "sunshine_shades") {
      parts.push(
        `<g class="avatar-eyewear eyewear-sunshine-shades">` +
          // Cool black sunglasses frames with glare reflection
          `<path d="M40 37 L55 37 L53 47 L42 47 Z" fill="#1e272e" />` +
          `<path d="M65 37 L80 37 L78 47 L67 47 Z" fill="#1e272e" />` +
          `<line x1="55" y1="39" x2="65" y2="39" stroke="#1e272e" stroke-width="2.5" />` +
          // White diagonal glare cuts
          `<line x1="43" y1="45" x2="48" y2="39" stroke="#ffffff" stroke-width="1.2" opacity="0.8" />` +
          `<line x1="68" y1="45" x2="73" y2="39" stroke="#ffffff" stroke-width="1.2" opacity="0.8" />` +
          `</g>`,
      );
    } else {
      parts.push(
        `<g class="avatar-eyewear eyewear-generic">` +
          `<circle cx="48" cy="42" r="7" stroke="#2c3e50" stroke-width="1.5" fill="none" />` +
          `<circle cx="72" cy="42" r="7" stroke="#2c3e50" stroke-width="1.5" fill="none" />` +
          `<line x1="55" y1="42" x2="65" y2="42" stroke="#2c3e50" stroke-width="1.5" />` +
          `</g>`,
      );
    }
  }

  // Headwear (Anchor_HeadCenter at 60, 38)
  if (look.headwearId) {
    if (look.headwearId === "explorer_fedora") {
      parts.push(
        `<g class="avatar-headwear headwear-explorer-fedora">` +
          // Safari / Explorer Fedora
          `<ellipse cx="60" cy="27" rx="36" ry="7" fill="#d35400" />` +
          `<path d="M38 26 C40 10 50 8 60 8 C70 8 80 10 82 26 Z" fill="#e67e22" />` +
          `<path d="M39 25 Q60 27 81 25" stroke="#784212" stroke-width="3" fill="none" />` +
          `<circle cx="48" cy="26" r="1.8" fill="#f1c40f" />` +
          `</g>`,
      );
    } else if (look.headwearId === "retro_neon_visor") {
      parts.push(
        `<g class="avatar-headwear headwear-retro-neon-visor">` +
          // 90s neon arcade visor
          `<path d="M30 30 Q60 36 90 30 L86 25 Q60 30 34 25 Z" fill="#ff007f" />` +
          `<path d="M26 31 Q60 39 94 31 L88 36 Q60 45 32 36 Z" fill="rgba(0, 240, 255, 0.75)" stroke="#00f0ff" stroke-width="1" />` +
          `</g>`,
      );
    } else if (look.headwearId === "golden_mane_wreath") {
      parts.push(
        `<g class="avatar-headwear headwear-golden-mane-wreath">` +
          // Golden baobab leaf wreath crown
          `<path d="M32 32 Q60 26 88 32" stroke="#f39c12" stroke-width="2" fill="none" />` +
          `<circle cx="42" cy="29" r="2.5" fill="#f1c40f" />` +
          `<circle cx="51" cy="27" r="2.5" fill="#f1c40f" />` +
          `<circle cx="60" cy="26" r="3" fill="#f1c40f" />` +
          `<circle cx="69" cy="27" r="2.5" fill="#f1c40f" />` +
          `<circle cx="78" cy="29" r="2.5" fill="#f1c40f" />` +
          `</g>`,
      );
    } else {
      parts.push(
        `<g class="avatar-headwear headwear-generic">` +
          `<ellipse cx="60" cy="24" rx="32" ry="8" fill="#e74c3c" />` +
          `<path d="M38 23 C42 12 50 10 60 10 C70 10 78 12 82 23 Z" fill="#c0392b" />` +
          `</g>`,
      );
    }
  }

  return parts.join("\n");
}

/* -------------------------------------------------------------
 * Layer 8: Handheld Item (Anchor_HandRight at 32, 92)
 * ------------------------------------------------------------- */
function renderLayer8Handheld(look: AvatarLook, action: string): string {
  if (!look.handheldId) return "";

  const isWaving = action === "wave";
  // Handheld location follows right hand (32, 92) or raised (30, 48) if waving
  const originX = isWaving ? 30 : 32;
  const originY = isWaving ? 44 : 92;

  let content = "";
  if (look.handheldId === "mango_smoothie_cup") {
    content =
      `<g class="avatar-handheld handheld-mango-smoothie" transform="translate(${originX - 7}, ${originY - 14})">` +
      // Clear plastic smoothie cup
      `<path d="M3 8 L5 24 L13 24 L15 8 Z" fill="rgba(255,255,255,0.3)" stroke="#dfe6e9" stroke-width="0.8" />` +
      // Mango smoothie fill
      `<path d="M4 11 L5 23 L13 23 L14 11 Z" fill="#f39c12" />` +
      // Green straw
      `<line x1="9" y1="2" x2="9" y2="16" stroke="#27ae60" stroke-width="1.8" stroke-linecap="round" />` +
      // Mango slice on rim
      `<circle cx="5" cy="8" r="3" fill="#f1c40f" />` +
      `<circle cx="5" cy="8" r="1.5" fill="#e67e22" />` +
      `</g>`;
  } else if (look.handheldId === "eyepatch_cutlass") {
    content =
      `<g class="avatar-handheld handheld-cutlass" transform="translate(${originX - 12}, ${originY - 20})">` +
      // Swashbuckler cutlass
      `<path d="M12 18 C14 10 20 4 26 2 C22 8 18 16 14 22 Z" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="0.8" />` +
      `<line x1="8" y1="20" x2="16" y2="20" stroke="#f1c40f" stroke-width="2" />` +
      `<rect x="11" y="20" width="2" height="6" fill="#8e44ad" />` +
      `</g>`;
  } else {
    // Generic handheld accessory
    content =
      `<g class="avatar-handheld handheld-generic" transform="translate(${originX - 6}, ${originY - 8})">` +
      `<circle cx="6" cy="6" r="5" fill="#f39c12" />` +
      `</g>`;
  }

  return content;
}

export interface AvatarSvgOptions {
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Generates inner SVG layer elements for the Avatar, in strict Layer 0 to Layer 8 order.
 */
export function generateAvatarLayersString(
  look: AvatarLook = DEFAULT_AVATAR_LOOK,
  action: EntityAction | string = "idle",
): string {
  const layer0 = renderLayer0ShadowAndBoard(look, action);
  const layer1 = renderLayer1HairBack(look);
  const layer2 = renderLayer2BodyBase(look, action);
  const layer3 = renderLayer3AnimeFace(look);
  const layer4 = renderLayer4Footwear(look);
  const layer5 = renderLayer5Outfit(look);
  const layer6 = renderLayer6HairFront(look);
  const layer7 = renderLayer7HeadwearAndEyewear(look);
  const layer8 = renderLayer8Handheld(look, action);

  return [
    layer0,
    layer1,
    layer2,
    layer3,
    layer4,
    layer5,
    layer6,
    layer7,
    layer8,
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

  const innerLayers = generateAvatarLayersString(look, action);

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
