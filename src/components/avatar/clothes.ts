import type { AvatarLook } from "../../types/world.ts";
import {
  LEFT_ARM_HIP,
  MIRROR,
  RIGHT_ARM_DOWN,
  handMarkup,
  resolveSkinTone,
  sleeve,
  type SleeveSpec,
} from "./shared.ts";

/* -------------------------------------------------------------
 * Layer 4: Footwear (Anchor_Feet at 60, 142) — chunky snap-on platforms
 * ------------------------------------------------------------- */
export function renderLayer4Footwear(look: AvatarLook): string {
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

export function sleeveSpecFor(outfitId?: string): SleeveSpec | null {
  const id = outfitId && outfitId in OUTFIT_SLEEVES ? outfitId : "denim_jacket";
  return OUTFIT_SLEEVES[id] ?? null;
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


export function renderLayer5Outfit(look: AvatarLook, action: string = "idle"): string {
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

