import { NM_BOTTOMS, NM_TOPS } from "./pixelItemsNM.ts";
/**
 * Pixel doll item looks, shared by the sprite generator
 * (scripts/pixel/doll.mts) and the game. Each wearable id maps to the cut,
 * colours and pattern its sprite is drawn with.
 */

export type HairShape =
  | "long"
  | "wavy"
  | "bob"
  | "pony"
  | "sidepony"
  | "pigtails"
  | "buns"
  | "topknot"
  | "braids"
  | "curly"
  | "pixie";

export const HAIR_LOOKS: Record<string, HairShape> = {
  blowout: "wavy",
  high_pony: "pony",
  butterfly_waves: "wavy",
  box_braids: "braids",
  goddess_locs: "braids",
  fulani_braids: "braids",
  afro_puff: "topknot",
  afro_halo: "curly",
  afro_puffs: "buns",
  blunt_bob: "bob",
  space_buns: "buns",
  sleek_straight: "long",
  big_curls: "curly",
  spiral_coils: "curly",
  half_up: "sidepony",
  pigtails: "pigtails",
  topknot: "topknot",
  braided_topknot: "topknot",
  messy_bun: "topknot",
  pixie_spikes: "pixie",
  side_swoop: "sidepony",
  crimped: "wavy",
  mermaid_waves: "long",
};

/** Little pictures printed on the chest of graphic tees. */
export type Motif =
  | "ghost"
  | "pumpkin"
  | "star"
  | "leaf"
  | "bunny"
  | "face"
  | "tie"
  | "heart"
  | "skull"
  | "berry"
  | "clover"
  | "peace"
  | "crown"
  | "planet"
  | "burger"
  | "hotdog"
  | "target"
  | "bow"
  | "turkey"
  | "one"
  | "balloon"
  | "snow"
  | "flag"
  | "arrow"
  | "spade"
  | "diamond"
  | "club"
  | "flower"
  | "bolt"
  | "melon"
  | "fire";

export type TopLook = {
  cut: "tee" | "tank" | "halter" | "tube" | "jacket" | "hoodie";
  color: string;
  accent: string;
  pattern?: "stripes" | "star" | "heart" | "dots" | "trim";
  motif?: Motif;
  /** Sleeve colour when it differs from the body (raglan). */
  sleeves?: string;
};

const BASE_TOP_LOOKS: Record<string, TopLook> = {
  crop_tank_pink: { cut: "tank", color: "#ff8fc0", accent: "#ffffff" },
  white_baby_tee: { cut: "tee", color: "#fbfbff", accent: "#ff8fc0" },
  star_baby_tee: {
    cut: "tee",
    color: "#bfe3ff",
    accent: "#ffd84d",
    pattern: "star",
  },
  tube_top_black: { cut: "tube", color: "#2b2b33", accent: "#ff8fc0" },
  lilac_halter: { cut: "halter", color: "#c9a7f0", accent: "#ffffff" },
  heart_halter: {
    cut: "halter",
    color: "#ff6f91",
    accent: "#ffffff",
    pattern: "heart",
  },
  holo_halter: {
    cut: "halter",
    color: "#b8f0ec",
    accent: "#f7b7ff",
    pattern: "dots",
  },
  denim_jacket: { cut: "jacket", color: "#5f8fd0", accent: "#ffd84d" },
  striped_tee: {
    cut: "tee",
    color: "#ffffff",
    accent: "#5f8fd0",
    pattern: "stripes",
  },
  cropped_puffer: {
    cut: "jacket",
    color: "#ff9f43",
    accent: "#ffffff",
    pattern: "stripes",
  },
  velour_track_jacket: {
    cut: "jacket",
    color: "#d16ba5",
    accent: "#ffffff",
    pattern: "trim",
  },
  fur_trim_cardigan: {
    cut: "jacket",
    color: "#f6c6dd",
    accent: "#ffffff",
    pattern: "trim",
  },
  butterfly_halter: {
    cut: "halter",
    color: "#ffd84d",
    accent: "#ff8fc0",
    pattern: "dots",
  },
  mesh_top: {
    cut: "jacket",
    color: "#4a4a58",
    accent: "#9b9bb0",
    pattern: "dots",
  },
  moto_jacket: { cut: "jacket", color: "#2b2b33", accent: "#c0c0c8" },
  sequin_tube: {
    cut: "tube",
    color: "#ffd1f0",
    accent: "#ffffff",
    pattern: "dots",
  },
  varsity_crop: {
    cut: "jacket",
    color: "#e94b3c",
    accent: "#ffffff",
    pattern: "trim",
  },
  zip_crop_hoodie: { cut: "hoodie", color: "#9cd67a", accent: "#ffffff" },
  barista_apron: {
    cut: "tee",
    color: "#8a5a30",
    accent: "#ffffff",
    pattern: "trim",
  },
  pink_fur_jacket: {
    cut: "jacket",
    color: "#ff8fc0",
    accent: "#ffffff",
    pattern: "trim",
  },
};

export type BottomLook = {
  cut: "pants" | "flares" | "shorts" | "mini" | "skirt";
  color: string;
  accent?: string;
  pattern?: "stripes" | "dots" | "trim" | "pleats";
};

const BASE_BOTTOM_LOOKS: Record<string, BottomLook> = {
  flares_indigo: { cut: "flares", color: "#3f5fa8" },
  flares_light: { cut: "flares", color: "#8ab4e8" },
  white_flares: { cut: "flares", color: "#f4f4f8" },
  black_flares: { cut: "flares", color: "#2b2b33" },
  denim_mini: { cut: "mini", color: "#5f8fd0" },
  pleated_lilac: { cut: "mini", color: "#c9a7f0" },
  cargo_pants: { cut: "pants", color: "#8a8f5a" },
  velour_track_pants: { cut: "pants", color: "#d16ba5" },
  plaid_mini: { cut: "mini", color: "#e94b3c" },
  leather_pants: { cut: "pants", color: "#2b2b33" },
  tulle_skirt: { cut: "skirt", color: "#ffc2dd" },
  parachute_pants: { cut: "pants", color: "#b0b8c4" },
  ruffle_mini: { cut: "skirt", color: "#ff8fc0" },
  glitter_flares: { cut: "flares", color: "#b7a6ff" },
};

export type ShoeLook = {
  cut: "sneakers" | "flats" | "boots" | "heels";
  color: string;
  sole?: string;
};

export const SHOE_LOOKS: Record<string, ShoeLook> = {
  canvas_sneakers: { cut: "sneakers", color: "#ff6f91" },
  jelly_sandals: { cut: "flats", color: "#ff8fc0" },
  platform_mary_janes: { cut: "flats", color: "#2b2b33" },
  skate_shoes: { cut: "sneakers", color: "#4a4a58" },
  platform_boots: { cut: "boots", color: "#2b2b33" },
  strappy_heels: { cut: "heels", color: "#e94b3c", sole: "#8a2318" },
  moon_boots: { cut: "boots", color: "#f4f4f8" },
  knee_boots: { cut: "boots", color: "#ffffff" },
  cowgirl_boots: { cut: "boots", color: "#a8662f" },
  glitter_heels: { cut: "heels", color: "#d9b8ff", sole: "#7a5ab8" },
};

export const TOP_LOOKS: Record<string, TopLook> = {
  ...BASE_TOP_LOOKS,
  ...Object.fromEntries(NM_TOPS.map((top) => [top.id, top.look])),
};

export const BOTTOM_LOOKS: Record<string, BottomLook> = {
  ...BASE_BOTTOM_LOOKS,
  ...Object.fromEntries(NM_BOTTOMS.map((bottom) => [bottom.id, bottom.look])),
};
