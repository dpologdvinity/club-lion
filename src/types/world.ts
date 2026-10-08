import {
  EYE_LOOKS,
  HAIR_STYLE_OPTIONS,
  type EyeStyle,
  type HairStyle,
  type TopId,
  type BottomId,
  type ShoeId,
} from "./avatarOptions.ts";

export type EquipSlot =
  | "hair_back"
  | "hair_front"
  | "headwear"
  | "eyewear"
  | "top_inner"
  | "top_outer"
  | "bottom"
  | "shoes"
  | "handheld"
  | "board";

export const EQUIP_SLOTS: readonly EquipSlot[] = [
  "hair_back",
  "hair_front",
  "headwear",
  "eyewear",
  "top_inner",
  "top_outer",
  "bottom",
  "shoes",
  "handheld",
  "board",
] as const;

export function isValidEquipSlot(slot: unknown): slot is EquipSlot {
  return typeof slot === "string" && EQUIP_SLOTS.includes(slot as EquipSlot);
}

export type SkinTone = "fair" | "tan" | "warm" | "espresso" | "bronze" | "deep";

export const SKIN_TONES: readonly SkinTone[] = [
  "fair",
  "tan",
  "warm",
  "espresso",
  "bronze",
  "deep",
] as const;

export type { EyeStyle, HairStyle } from "./avatarOptions.ts";

export const EYE_STYLES: readonly EyeStyle[] = EYE_LOOKS.map((o) => o.id);

export const HAIR_STYLES: readonly HairStyle[] = HAIR_STYLE_OPTIONS.map(
  (o) => o.id,
);

/** Hair IDs saved before the glam redesign, mapped to their closest new cut. */
export const LEGACY_HAIR_STYLES: Readonly<Record<string, HairStyle>> = {
  classic_shag: "blowout",
  long_waves: "butterfly_waves",
  beach_wave_bangs: "butterfly_waves",
  spiky_blaze: "space_buns",
  retro_bob: "blunt_bob",
};

/** Resolves any saved hair ID (current, legacy, or unknown) to a renderable style. */
export function resolveHairStyle(hairId?: string): HairStyle {
  if (hairId && (HAIR_STYLES as readonly string[]).includes(hairId)) {
    return hairId as HairStyle;
  }
  return (hairId && LEGACY_HAIR_STYLES[hairId]) || "blowout";
}

export type OutfitStyle =
  | "denim_jacket"
  | "striped_tee"
  | "cargo_pants"
  | "barista_apron"
  | "cropped_puffer";

export type ShoeStyle = ShoeId;

export type AvatarLook = {
  skinTone: SkinTone | string;
  eyeStyle: EyeStyle | string;
  hairId: HairStyle | string;
  hairColor: string;
  /** Legacy whole outfit; `topId` / `bottomId` override its pieces. */
  outfitId: OutfitStyle | string;
  shoesId: ShoeStyle | string;
  topId?: TopId | string;
  bottomId?: BottomId | string;
  eyeshadowId?: string;
  lipId?: string;
  eyeColorId?: string;
  blushId?: string;
  faceDetailId?: string;
  /** Streak dye color (hex); absent or empty means no streak. */
  hairStreak?: string;
  headwearId?: string;
  eyewearId?: string;
  boardId?: string;
  handheldId?: string;
};

export const DEFAULT_AVATAR_LOOK: AvatarLook = {
  skinTone: "warm",
  eyeStyle: "winged_glam",
  hairId: "blowout",
  hairColor: "#4a3728",
  outfitId: "denim_jacket",
  shoesId: "canvas_sneakers",
};

export function validateAvatarLook(look: unknown): look is AvatarLook {
  if (!look || typeof look !== "object") return false;

  const candidate = look as Record<string, unknown>;

  const hasValidString = (key: string): boolean =>
    typeof candidate[key] === "string" &&
    (candidate[key] as string).trim().length > 0;

  const hasOptionalString = (key: string): boolean =>
    candidate[key] === undefined ||
    (typeof candidate[key] === "string" &&
      (candidate[key] as string).trim().length > 0);

  return (
    hasValidString("skinTone") &&
    hasValidString("eyeStyle") &&
    hasValidString("hairId") &&
    hasValidString("hairColor") &&
    hasValidString("outfitId") &&
    hasValidString("shoesId") &&
    hasOptionalString("topId") &&
    hasOptionalString("bottomId") &&
    hasOptionalString("eyeshadowId") &&
    hasOptionalString("lipId") &&
    hasOptionalString("eyeColorId") &&
    hasOptionalString("blushId") &&
    hasOptionalString("faceDetailId") &&
    (candidate.hairStreak === undefined ||
      typeof candidate.hairStreak === "string") &&
    hasOptionalString("headwearId") &&
    hasOptionalString("eyewearId") &&
    hasOptionalString("boardId") &&
    hasOptionalString("handheldId")
  );
}

export type PetMood =
  "idle" | "trotting" | "happy" | "sleep" | "sitting" | string;

export type PetState = {
  id: string;
  name: string;
  species: "lion";
  color: string;
  accessory?: string;
  position: { x: number; y: number };
  mood: PetMood;
};

export const DEFAULT_PET_STATE: PetState = {
  id: "pet_leo",
  name: "Leo",
  species: "lion",
  color: "gold",
  position: { x: 100, y: 100 },
  mood: "idle",
};

export type EntityAction =
  "idle" | "walk" | "wave" | "dance" | "sit" | "jam" | string;

export type SpeechBubble =
  | string
  | {
      text: string;
      type?: "chat" | "emote";
      createdAt?: number;
    };

export type WorldEntity = {
  id: string;
  name: string;
  look: AvatarLook;
  pet?: PetState;
  position: { x: number; y: number };
  action: EntityAction;
  bubble?: SpeechBubble;
  badgeTitle?: string;
  isLocalPlayer?: boolean;
};

export type CatalogItem = {
  id: string;
  name: string;
  price: number;
  slot: EquipSlot;
  description?: string;
  isSecret?: boolean;
  secretTriggerId?: string;
};

export const CATALOG_ITEMS: readonly CatalogItem[] = [
  // Standard catalog items
  {
    id: "classic_shag",
    name: "Y2K Blowout",
    price: 100,
    slot: "hair_front",
    description: "Big glossy volume with flipped ends.",
  },
  {
    id: "long_waves",
    name: "Butterfly Waves",
    price: 140,
    slot: "hair_back",
    description: "Middle-part waves pinned with butterfly clips.",
  },
  {
    id: "spiky_blaze",
    name: "Spiky Space Buns",
    price: 120,
    slot: "hair_front",
    description: "Twin buns with flyaway spikes and frosted pieces.",
  },
  {
    id: "explorer_fedora",
    name: "Explorer Fedora",
    price: 90,
    slot: "headwear",
    description: "Ready for an expedition.",
  },
  {
    id: "sunshine_shades",
    name: "Sunshine Shades",
    price: 110,
    slot: "eyewear",
    description: "Oversized pink-tinted shades with gold rims.",
  },
  {
    id: "striped_tee",
    name: "Striped Tee",
    price: 80,
    slot: "top_inner",
    description: "Cropped baby tee with a pleated lilac mini.",
  },
  {
    id: "denim_jacket",
    name: "Denim Jacket",
    price: 160,
    slot: "top_outer",
    description: "Cropped light-wash jacket, crop tank, and flares.",
  },
  {
    id: "cargo_pants",
    name: "Cargo Pants",
    price: 130,
    slot: "bottom",
    description: "Low-rise cargos with a halter crop and chain belt.",
  },
  {
    id: "canvas_sneakers",
    name: "Platform Sneakers",
    price: 95,
    slot: "shoes",
    description: "Chunky white platforms with bubblegum trim.",
  },
  {
    id: "hover_leaf",
    name: "Hover-Leaf Board",
    price: 300,
    slot: "board",
    description: "Glides just above the pavement with green sparkles.",
  },
  {
    id: "mango_smoothie_cup",
    name: "Mango Smoothie",
    price: 50,
    slot: "handheld",
    description: "Chilled tropical goodness in a cup.",
  },
  {
    id: "cropped_puffer",
    name: "Cropped Puffer",
    price: 220,
    slot: "top_outer",
    description: "Bubblegum puffer with faux-fur trim and flares.",
  },
  {
    id: "platform_boots",
    name: "Platform Boots",
    price: 180,
    slot: "shoes",
    description: "Glossy patent boots with chunky snap-on soles.",
  },
  {
    id: "velour_track_jacket",
    name: "Velour Track Jacket",
    price: 180,
    slot: "top_outer",
    description: "Cropped zip-up velour, rhinestone pull.",
  },
  {
    id: "fur_trim_cardigan",
    name: "Fur-Trim Cardigan",
    price: 190,
    slot: "top_outer",
    description: "Lilac knit with fluffy faux-fur trim.",
  },
  {
    id: "butterfly_halter",
    name: "Butterfly Halter",
    price: 140,
    slot: "top_outer",
    description: "Crop halter with a sky-and-pink butterfly print.",
  },
  {
    id: "mesh_top",
    name: "Mesh Long Sleeve",
    price: 130,
    slot: "top_outer",
    description: "Sheer black mesh layered over a cami.",
  },
  {
    id: "moto_jacket",
    name: "Moto Jacket",
    price: 240,
    slot: "top_outer",
    description: "Cropped black leather with silver zips.",
  },
  {
    id: "sequin_tube",
    name: "Sequin Tube Top",
    price: 200,
    slot: "top_outer",
    description: "Party-ready pink sparkle.",
  },
  {
    id: "varsity_crop",
    name: "Varsity Crop Jacket",
    price: 210,
    slot: "top_outer",
    description: "Cropped letterman with contrast sleeves.",
  },
  {
    id: "zip_crop_hoodie",
    name: "Zip Crop Hoodie",
    price: 150,
    slot: "top_outer",
    description: "Cozy cropped hoodie in baby blue.",
  },
  {
    id: "velour_track_pants",
    name: "Velour Track Pants",
    price: 160,
    slot: "bottom",
    description: "Flared velour to match the jacket.",
  },
  {
    id: "plaid_mini",
    name: "Plaid Mini",
    price: 120,
    slot: "bottom",
    description: "Pleated tartan mini skirt.",
  },
  {
    id: "leather_pants",
    name: "Leather Pants",
    price: 200,
    slot: "bottom",
    description: "Glossy black low-rise flares.",
  },
  {
    id: "tulle_skirt",
    name: "Tulle Skirt",
    price: 180,
    slot: "bottom",
    description: "Fluffy layered pink tulle.",
  },
  {
    id: "parachute_pants",
    name: "Parachute Pants",
    price: 150,
    slot: "bottom",
    description: "Swishy nylon with toggle hems.",
  },
  {
    id: "ruffle_mini",
    name: "Ruffle Mini",
    price: 140,
    slot: "bottom",
    description: "Tiered ruffles in baby blue.",
  },
  {
    id: "glitter_flares",
    name: "Glitter Flares",
    price: 220,
    slot: "bottom",
    description: "Lilac flares dusted with sparkle.",
  },
  {
    id: "strappy_heels",
    name: "Strappy Platform Heels",
    price: 200,
    slot: "shoes",
    description: "Sky-high straps on a chunky sole.",
  },
  {
    id: "moon_boots",
    name: "Fuzzy Moon Boots",
    price: 170,
    slot: "shoes",
    description: "Puffy après-ski boots with fluffy cuffs.",
  },
  {
    id: "knee_boots",
    name: "Go-Go Knee Boots",
    price: 210,
    slot: "shoes",
    description: "Glossy white knee-highs.",
  },
  {
    id: "cowgirl_boots",
    name: "Cowgirl Boots",
    price: 190,
    slot: "shoes",
    description: "Pink western boots with star stitching.",
  },
  {
    id: "glitter_heels",
    name: "Glitter Heels",
    price: 240,
    slot: "shoes",
    description: "Sparkly platforms for the runway.",
  },
  // Secret catalog items
  {
    id: "barista_apron",
    name: "Barista Apron",
    price: 0,
    slot: "top_outer",
    description: "Official Canopy Café barista gear.",
    isSecret: true,
    secretTriggerId: "coffee_steam",
  },
  {
    id: "retro_neon_visor",
    name: "Retro Neon Visor",
    price: 0,
    slot: "headwear",
    description: "Glows with 90s arcade nostalgia.",
    isSecret: true,
    secretTriggerId: "price_tag_star",
  },
  {
    id: "golden_mane_wreath",
    name: "Golden Mane Wreath",
    price: 0,
    slot: "headwear",
    description: "Woven baobab leaves with golden sheen.",
    isSecret: true,
    secretTriggerId: "hidden_leaf",
  },
  {
    id: "eyepatch_cutlass",
    name: "Eyepatch & Cutlass",
    price: 0,
    slot: "handheld",
    description: "Arr! A legendary swashbuckler's treasure.",
    isSecret: true,
    secretTriggerId: "beach_pirate_skull",
  },
] as const;

export type RoomPortal = {
  targetRoomId: string;
  targetSpawn: { x: number; y: number };
  triggerBounds: { x1: number; y1: number; x2: number; y2: number };
  label: string;
};

export type RoomInteractive = {
  id: string;
  type:
    | "ride"
    | "instrument"
    | "game_launch"
    | "secret_clickable"
    | "shop"
    | string;
  position: { x: number; y: number };
  actionData: Record<string, unknown>;
};

export type DepthLayer = {
  id: string;
  y: number;
  asset: string;
};

export type RoomManifest = {
  id: string;
  name: string;
  district: string;
  stageWidth: number;
  stageHeight: number;
  backgroundAsset: string;
  walkablePolygon: [number, number][];
  depthLayers: DepthLayer[];
  portals: RoomPortal[];
  interactives: RoomInteractive[];
  ambientAudioPreset: string;
  scriptedNpcs: WorldEntity[];
};
