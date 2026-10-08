/**
 * Avatar customization registry: every makeup, hair, and clothing option.
 *
 * Options with a `price` are premium salon unlocks bought with coins.
 * Clothing marked `free` is always in the closet; other clothing pieces are
 * sold in Le Shop under the same ID (see CATALOG_ITEMS).
 */

export type StyleOption = {
  id: string;
  label: string;
  /** Coin price for premium salon options; absent means free. */
  price?: number;
};

export type ColorOption = StyleOption & { hex: string };

/* -------------------------------------------------------------
 * Makeup
 * ------------------------------------------------------------- */
export const EYE_LOOKS = [
  { id: "winged_glam", label: "Winged Glam" },
  { id: "smoky_cat", label: "Smoky Cat" },
  { id: "sparkle", label: "Sparkle Doll" },
  { id: "wink", label: "Flirty Wink" },
  { id: "sleepy", label: "Bedroom Eyes" },
  { id: "smirk", label: "Smirk" },
  { id: "doe_lash", label: "Doe Lashes" },
  { id: "siren", label: "Siren Flick" },
  { id: "fierce", label: "Fierce" },
  { id: "dreamy", label: "Dreamy" },
  { id: "graphic_liner", label: "Graphic Liner", price: 150 },
  { id: "glitter_pop", label: "Glitter Pop", price: 150 },
] as const satisfies readonly StyleOption[];

export type EyeStyle = (typeof EYE_LOOKS)[number]["id"];

export type ShadowOption = ColorOption & { special?: "holo" | "ombre" };

export const EYESHADOWS = [
  { id: "bronze", label: "Bronze", hex: "#b8704c" },
  { id: "smoky_lilac", label: "Smoky Lilac", hex: "#7b4f9e" },
  { id: "rose_gold", label: "Rose Gold", hex: "#e7889f" },
  { id: "peach", label: "Peach", hex: "#de8a62" },
  { id: "mauve", label: "Mauve", hex: "#a65d7a" },
  { id: "gold", label: "Gold", hex: "#c4823e" },
  { id: "plum", label: "Plum", hex: "#6a2c5c" },
  { id: "teal", label: "Teal", hex: "#2a9d9a" },
  { id: "baby_blue", label: "Baby Blue", hex: "#8ec5f0" },
  { id: "hot_pink", label: "Hot Pink", hex: "#ff4fa0" },
  { id: "emerald", label: "Emerald", hex: "#1f8a5a" },
  { id: "silver", label: "Silver", hex: "#c9ced8" },
  { id: "charcoal", label: "Charcoal", hex: "#3a3540" },
  { id: "champagne", label: "Champagne", hex: "#f0d7a8" },
  {
    id: "holo_shimmer",
    label: "Holo Shimmer",
    hex: "#b9a6ff",
    price: 120,
    special: "holo",
  },
  {
    id: "sunset_ombre",
    label: "Sunset Ombré",
    hex: "#ff7a59",
    price: 120,
    special: "ombre",
  },
] as const satisfies readonly ShadowOption[];

export type LipFinish = "gloss" | "matte" | "frost" | "glitter";
export type LipOption = ColorOption & { finish: LipFinish };

export const LIP_COLORS = [
  { id: "nude", label: "Nude Gloss", hex: "#c48a7a", finish: "gloss" },
  { id: "rose", label: "Rose Gloss", hex: "#c65a6b", finish: "gloss" },
  { id: "berry", label: "Berry", hex: "#9c2f55", finish: "gloss" },
  { id: "cherry", label: "Cherry Red", hex: "#c8102e", finish: "gloss" },
  { id: "hot_pink", label: "Hot Pink", hex: "#ff2f86", finish: "gloss" },
  { id: "bubblegum", label: "Bubblegum", hex: "#ff8fc2", finish: "gloss" },
  { id: "coral", label: "Coral", hex: "#ff6f61", finish: "gloss" },
  { id: "clear_gloss", label: "Clear Gloss", hex: "#d98c8c", finish: "gloss" },
  { id: "plum", label: "Matte Plum", hex: "#6e2346", finish: "matte" },
  { id: "mauve", label: "Matte Mauve", hex: "#b06f80", finish: "matte" },
  { id: "chocolate", label: "Chocolate", hex: "#6b3a2e", finish: "matte" },
  {
    id: "black_cherry",
    label: "Black Cherry",
    hex: "#4a0e1e",
    finish: "matte",
  },
  {
    id: "frosted_lilac",
    label: "Frosted Lilac",
    hex: "#c7a6e6",
    finish: "frost",
  },
  {
    id: "frosted_pink",
    label: "Frosted Pink",
    hex: "#f7b6d2",
    finish: "frost",
  },
  {
    id: "glitter_gloss",
    label: "Glitter Gloss",
    hex: "#ff6fae",
    finish: "glitter",
    price: 100,
  },
  {
    id: "holo_gloss",
    label: "Holo Gloss",
    hex: "#e2b4ff",
    finish: "glitter",
    price: 100,
  },
] as const satisfies readonly LipOption[];

/** Iris gradient stops: light center, mid ring, dark rim. */
export type EyeColorOption = StyleOption & {
  iris: readonly [string, string, string];
};

export const EYE_COLORS = [
  { id: "brown", label: "Brown", iris: ["#c98e5c", "#7a4523", "#28140a"] },
  { id: "hazel", label: "Hazel", iris: ["#d29a52", "#8c5626", "#2e1a0c"] },
  { id: "amber", label: "Amber", iris: ["#f2bb57", "#a5611b", "#3a2006"] },
  { id: "honey", label: "Honey", iris: ["#f5d27a", "#c08a2a", "#4a2c08"] },
  { id: "green", label: "Green", iris: ["#9be08a", "#3f8a4f", "#14301b"] },
  { id: "emerald", label: "Emerald", iris: ["#6ff0b0", "#119a62", "#053420"] },
  { id: "blue", label: "Blue", iris: ["#9cd4ff", "#2f74c8", "#0d2448"] },
  {
    id: "ice_blue",
    label: "Ice Blue",
    iris: ["#e2f6ff", "#86c4e8", "#2a5878"],
  },
  { id: "grey", label: "Grey", iris: ["#e0e4ea", "#8a94a4", "#2e343e"] },
  { id: "violet", label: "Violet", iris: ["#c4a8ff", "#6a49b4", "#24143f"] },
  {
    id: "rose_quartz",
    label: "Rose Quartz",
    iris: ["#ffd0e6", "#e0679f", "#5a1236"],
    price: 90,
  },
  {
    id: "galaxy",
    label: "Galaxy",
    iris: ["#7ef0ff", "#7b3fd6", "#120a3a"],
    price: 90,
  },
] as const satisfies readonly EyeColorOption[];

export const BLUSHES = [
  { id: "rosy", label: "Rosy", hex: "#ff5f86" },
  { id: "peach", label: "Peach", hex: "#ff9a6a" },
  { id: "berry", label: "Berry", hex: "#d0386e" },
  { id: "bronze", label: "Bronzed", hex: "#c87a4a" },
  { id: "coral", label: "Coral", hex: "#ff6f61" },
  { id: "none", label: "No Blush", hex: "transparent" },
] as const satisfies readonly ColorOption[];

export const FACE_DETAILS = [
  { id: "none", label: "None" },
  { id: "beauty_mark", label: "Beauty Mark" },
  { id: "freckles", label: "Freckles" },
  { id: "heart_decal", label: "Heart Decal", price: 80 },
  { id: "star_stickers", label: "Star Stickers", price: 80 },
  { id: "face_gems", label: "Face Gems", price: 120 },
  { id: "butterfly_gems", label: "Butterfly Gems", price: 120 },
] as const satisfies readonly StyleOption[];

/* -------------------------------------------------------------
 * Hair
 * ------------------------------------------------------------- */
export const HAIR_STYLE_OPTIONS = [
  { id: "blowout", label: "Y2K Blowout" },
  { id: "high_pony", label: "Sleek High Pony" },
  { id: "butterfly_waves", label: "Butterfly Waves" },
  { id: "box_braids", label: "Beaded Box Braids" },
  { id: "blunt_bob", label: "Glossy Blunt Bob" },
  { id: "space_buns", label: "Spiky Space Buns" },
  { id: "sleek_straight", label: "Sleek Straight" },
  { id: "big_curls", label: "Big Glam Curls" },
  { id: "afro_puffs", label: "Afro Puffs" },
  { id: "half_up", label: "Half-Up Flip" },
  { id: "pigtails", label: "Bubble Pigtails" },
  { id: "messy_bun", label: "Messy Claw-Clip Bun" },
  { id: "pixie_spikes", label: "Spiky Pixie" },
  { id: "side_swoop", label: "Side Swoop" },
  { id: "crimped", label: "Crimped Mane", price: 200 },
  { id: "mermaid_waves", label: "Mermaid Waves", price: 200 },
] as const satisfies readonly StyleOption[];

export type HairStyle = (typeof HAIR_STYLE_OPTIONS)[number]["id"];

export const HAIR_COLORS = [
  { id: "espresso", label: "Espresso", hex: "#4a3728" },
  { id: "chestnut", label: "Chestnut", hex: "#784421" },
  { id: "auburn", label: "Auburn", hex: "#8e3a22" },
  { id: "caramel", label: "Caramel", hex: "#a8693a" },
  { id: "blonde", label: "Copper", hex: "#e67e22" },
  { id: "honey_blonde", label: "Honey Blonde", hex: "#e9c46a" },
  { id: "platinum", label: "Platinum", hex: "#f2ead8" },
  { id: "jet_black", label: "Jet Black", hex: "#1b1412" },
  { id: "silver", label: "Silver", hex: "#b9bcc6" },
  { id: "ruby", label: "Ruby Red", hex: "#b3122e" },
  { id: "strawberry", label: "Strawberry", hex: "#f08a7a" },
  { id: "rose_pink", label: "Rose Pink", hex: "#ff7675" },
  { id: "hot_pink", label: "Hot Pink", hex: "#ff3d9a" },
  { id: "lavender", label: "Lavender", hex: "#a29bfe" },
  { id: "purple", label: "Grape", hex: "#6c3fb5" },
  { id: "baby_blue", label: "Baby Blue", hex: "#8ecdf5" },
  { id: "teal", label: "Teal", hex: "#1f9e9a" },
  { id: "mint", label: "Mint", hex: "#8fe3c0" },
] as const satisfies readonly ColorOption[];

export const HAIR_STREAKS = [
  { id: "none", label: "None", hex: "" },
  { id: "neon_blue", label: "Neon Blue", hex: "#00f0ff" },
  { id: "sunset_orange", label: "Sunset Orange", hex: "#ff7675" },
  { id: "mint_green", label: "Mint Green", hex: "#2ecc71" },
  { id: "hot_pink", label: "Hot Pink", hex: "#ff3d9a" },
  { id: "platinum", label: "Platinum", hex: "#f7f1e1" },
  { id: "purple", label: "Purple", hex: "#9b59ff" },
  { id: "blonde", label: "Chunky Blonde", hex: "#f2cf6b" },
] as const satisfies readonly ColorOption[];

/* -------------------------------------------------------------
 * Clothing (mix & match)
 * ------------------------------------------------------------- */
export type ClothingOption = StyleOption & { free?: boolean };

export const TOPS = [
  { id: "crop_tank_pink", label: "Pink Crop Tank", free: true },
  { id: "white_baby_tee", label: "White Baby Tee", free: true },
  { id: "star_baby_tee", label: "Star Baby Tee", free: true },
  { id: "tube_top_black", label: "Black Tube Top", free: true },
  { id: "lilac_halter", label: "Lilac Halter", free: true },
  { id: "heart_halter", label: "Heart Halter", free: true },
  { id: "denim_jacket", label: "Denim Jacket" },
  { id: "striped_tee", label: "Striped Tee" },
  { id: "cropped_puffer", label: "Cropped Puffer" },
  { id: "velour_track_jacket", label: "Velour Track Jacket" },
  { id: "fur_trim_cardigan", label: "Fur-Trim Cardigan" },
  { id: "butterfly_halter", label: "Butterfly Halter" },
  { id: "mesh_top", label: "Mesh Long Sleeve" },
  { id: "moto_jacket", label: "Moto Jacket" },
  { id: "sequin_tube", label: "Sequin Tube Top" },
  { id: "varsity_crop", label: "Varsity Crop Jacket" },
  { id: "zip_crop_hoodie", label: "Zip Crop Hoodie" },
  { id: "barista_apron", label: "Barista Apron" },
] as const satisfies readonly ClothingOption[];

export type TopId = (typeof TOPS)[number]["id"];

export const BOTTOMS = [
  { id: "flares_indigo", label: "Indigo Flares", free: true },
  { id: "flares_light", label: "Light-Wash Flares", free: true },
  { id: "white_flares", label: "White Flares", free: true },
  { id: "black_flares", label: "Black Flares", free: true },
  { id: "denim_mini", label: "Denim Mini", free: true },
  { id: "pleated_lilac", label: "Lilac Pleated Mini", free: true },
  { id: "cargo_pants", label: "Cargo Pants" },
  { id: "velour_track_pants", label: "Velour Track Pants" },
  { id: "plaid_mini", label: "Plaid Mini" },
  { id: "leather_pants", label: "Leather Pants" },
  { id: "tulle_skirt", label: "Tulle Skirt" },
  { id: "parachute_pants", label: "Parachute Pants" },
  { id: "ruffle_mini", label: "Ruffle Mini" },
  { id: "glitter_flares", label: "Glitter Flares" },
] as const satisfies readonly ClothingOption[];

export type BottomId = (typeof BOTTOMS)[number]["id"];

export const SHOES = [
  { id: "canvas_sneakers", label: "Platform Sneakers", free: true },
  { id: "jelly_sandals", label: "Jelly Sandals", free: true },
  { id: "platform_mary_janes", label: "Platform Mary Janes", free: true },
  { id: "skate_shoes", label: "Chunky Skate Shoes", free: true },
  { id: "platform_boots", label: "Platform Boots" },
  { id: "strappy_heels", label: "Strappy Platform Heels" },
  { id: "moon_boots", label: "Fuzzy Moon Boots" },
  { id: "knee_boots", label: "Go-Go Knee Boots" },
  { id: "cowgirl_boots", label: "Cowgirl Boots" },
  { id: "glitter_heels", label: "Glitter Heels" },
] as const satisfies readonly ClothingOption[];

export type ShoeId = (typeof SHOES)[number]["id"];

/** Whole outfits saved before mix & match, split into a top and a bottom. */
export const OUTFIT_PRESETS: Readonly<
  Record<string, { top: TopId; bottom: BottomId }>
> = {
  denim_jacket: { top: "denim_jacket", bottom: "flares_indigo" },
  striped_tee: { top: "striped_tee", bottom: "pleated_lilac" },
  cargo_pants: { top: "heart_halter", bottom: "cargo_pants" },
  barista_apron: { top: "barista_apron", bottom: "black_flares" },
  cropped_puffer: { top: "cropped_puffer", bottom: "flares_light" },
};

/* -------------------------------------------------------------
 * Lookups
 * ------------------------------------------------------------- */
export function findOption<T extends StyleOption>(
  options: readonly T[],
  id: string | undefined,
): T | undefined {
  return id === undefined ? undefined : options.find((o) => o.id === id);
}

export type SalonCategory = "eye" | "shadow" | "lip" | "iris" | "face" | "hair";

export const SALON_CATEGORY_OPTIONS: Readonly<
  Record<SalonCategory, readonly StyleOption[]>
> = {
  eye: EYE_LOOKS,
  shadow: EYESHADOWS,
  lip: LIP_COLORS,
  iris: EYE_COLORS,
  face: FACE_DETAILS,
  hair: HAIR_STYLE_OPTIONS,
};

/**
 * Owned-list ID for a premium salon option. Namespaced so a lip and an
 * eyeshadow sharing a name never collide with each other or shop items.
 */
export function premiumId(category: SalonCategory, id: string): string {
  return `${category}:${id}`;
}

/** Every premium salon unlock, keyed by its namespaced owned-list ID. */
export const PREMIUM_SALON_OPTIONS: readonly {
  id: string;
  label: string;
  price: number;
}[] = (
  Object.entries(SALON_CATEGORY_OPTIONS) as [
    SalonCategory,
    readonly StyleOption[],
  ][]
).flatMap(([category, options]) =>
  options.flatMap((o) =>
    typeof o.price === "number"
      ? [{ id: premiumId(category, o.id), label: o.label, price: o.price }]
      : [],
  ),
);

/* -------------------------------------------------------------
 * Clothing resolution (shared by the renderer and the closet)
 * ------------------------------------------------------------- */
type ClothingFields = {
  outfitId?: string;
  topId?: string;
  bottomId?: string;
  shoesId?: string;
};

/** Worn top: explicit `topId`, else the legacy outfit's top, else the default. */
export function resolveTopId(look: ClothingFields): TopId {
  return (
    findOption(TOPS, look.topId)?.id ??
    (look.outfitId ? OUTFIT_PRESETS[look.outfitId]?.top : undefined) ??
    "denim_jacket"
  );
}

/** Worn bottom: explicit `bottomId`, else the legacy outfit's bottom, else the default. */
export function resolveBottomId(look: ClothingFields): BottomId {
  return (
    findOption(BOTTOMS, look.bottomId)?.id ??
    (look.outfitId ? OUTFIT_PRESETS[look.outfitId]?.bottom : undefined) ??
    "flares_indigo"
  );
}

/** Worn shoes; unknown IDs fall back to platform sneakers. */
export function resolveShoeId(look: ClothingFields): ShoeId {
  return findOption(SHOES, look.shoesId)?.id ?? "canvas_sneakers";
}
