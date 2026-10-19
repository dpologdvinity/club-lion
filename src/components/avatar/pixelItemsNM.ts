/**
 * More tops and bottoms, redrawn from the "nons or members" tops and bottoms
 * sheets (inspo/fantage/clothes/shirts and bottoms, local only; see
 * inspo/fantage/USED.md). Ids are made from the labels (nm_ prefix).
 */
import type { BottomLook, Motif, TopLook } from "./pixelItems.ts";

type TopCut = TopLook["cut"];

const t = (
  label: string,
  cut: TopCut,
  color: string,
  accent: string,
  extra: { motif?: Motif; pattern?: TopLook["pattern"]; sleeves?: string } = {},
) => ({ label, look: { cut, color, accent, ...extra } });

const b = (
  label: string,
  cut: BottomLook["cut"],
  color: string,
  extra: { accent?: string; pattern?: BottomLook["pattern"] } = {},
) => ({ label, look: { cut, color, ...extra } });

const slug = (label: string) =>
  `nm_${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")}`;

const TOP_ROWS = [
  // n-or-m-tops-1
  t("Red Plaid Shirt", "jacket", "#d81e3a", "#ffffff", { pattern: "stripes" }),
  t("Earth Day Top", "jacket", "#c8b040", "#4cc97a", { pattern: "trim" }),
  t("Ghost Tee", "tee", "#26262e", "#ffffff", { motif: "ghost" }),
  t("Army Tank", "tank", "#3a3a3a", "#5a5a5a"),
  t("Firework Shirt", "jacket", "#2a3a8a", "#ffd84d", { pattern: "trim" }),
  t("Pink Bunny Tee", "tee", "#ffffff", "#ff8ac8", {
    motif: "bunny",
    sleeves: "#ff8ac8",
  }),
  t("Halloween Shirt", "tee", "#26262e", "#f2902a", { motif: "pumpkin" }),
  t("Purple Star Hoodie", "hoodie", "#3a2a6a", "#ffd84d", { motif: "star" }),
  t("Tree Branch Tee", "tee", "#fff0c0", "#a8642a", { motif: "leaf" }),
  t("Panda Pullover", "hoodie", "#ffffff", "#26262e", { sleeves: "#26262e" }),
  t("Adventurer Jacket", "jacket", "#a8642a", "#f2e0a0", { pattern: "trim" }),
  t("Blue Adventurer Jacket", "jacket", "#3a6ab8", "#f2e0a0", {
    pattern: "trim",
  }),
  t("Rosy Shrug Top", "jacket", "#c84a6a", "#ffd0dc", { pattern: "trim" }),
  t("Fireworks Jacket", "jacket", "#4a5a7a", "#9ad0ff", { motif: "star" }),
  t("Cat Face Shirt", "tee", "#ffd84d", "#26262e", { motif: "face" }),
  t("White Shirt with Blue Tie", "tee", "#ffffff", "#4ab8f0", { motif: "tie" }),
  t("Heart Day Shirt", "tee", "#ffffff", "#e8303a", { motif: "heart" }),
  t("Skullhead Shirt", "tee", "#26262e", "#ffffff", { motif: "skull" }),
  t("Strawberry Shirt", "tee", "#ff8a6a", "#e8303a", { motif: "berry" }),
  t("Party Year Tee", "tee", "#fff6e0", "#8a4ae0", { motif: "star" }),
  // n-or-m-tops-2
  t("Lucky Clover Shirt", "jacket", "#ffffff", "#3ac83a", { motif: "clover" }),
  t("Easter Shirt", "tee", "#ffffff", "#ff8ac8", { pattern: "stripes" }),
  t("Creepy Shirt", "tee", "#ffffff", "#26262e", { motif: "skull" }),
  t("Red Cat Face Shirt", "tee", "#d81e2a", "#26262e", { motif: "face" }),
  t("Puppy Face Shirt", "tee", "#bfd8f0", "#8a5a2a", { motif: "face" }),
  t("Peace Out Tee", "tee", "#26262e", "#ffd84d", { motif: "peace" }),
  t("Green Puppy Shirt", "tee", "#3ac83a", "#ffffff", { motif: "face" }),
  t("Pink Heart Tee", "jacket", "#3a3a6a", "#ff6fa0", { motif: "heart" }),
  t("Lovely Pet Tee", "tee", "#ffffff", "#ff4f8a", {
    motif: "heart",
    sleeves: "#ff8ac8",
  }),
  t("Heart Mom Shirt", "tee", "#26262e", "#ffffff", { motif: "heart" }),
  t("Shield Tee", "tee", "#26262e", "#ffd84d", { motif: "crown" }),
  t("Planet Tee", "tee", "#2a8a9a", "#e8603a", { motif: "planet" }),
  t("Stained Glass Tee", "tee", "#ff6fa0", "#ffd84d", { pattern: "dots" }),
  t("Earth Love Tee", "tee", "#ffffff", "#3a8ae0", { motif: "planet" }),
  t("BBQ Shirt", "tee", "#4ab8f0", "#a8642a", { motif: "burger" }),
  t("Hot Dog Shirt", "tee", "#8a3ac8", "#f2a040", { motif: "hotdog" }),
  t("Bullseye Tee", "tee", "#ffd84d", "#e8303a", { motif: "target" }),
  t("Captain Uniform", "jacket", "#2a3a6a", "#ffd84d", { pattern: "trim" }),
  t("White Polka Dot Sweater", "jacket", "#f4f0e8", "#9a9aa6", {
    pattern: "dots",
  }),
  t("Pumpkin Tee", "tee", "#f2902a", "#26262e", { motif: "pumpkin" }),
  // n-or-m-tops-3
  t("Winter Vest with Scarf", "jacket", "#4a4a58", "#ffffff", {
    pattern: "trim",
  }),
  t("Black Vest", "jacket", "#26262e", "#ffd84d", { pattern: "trim" }),
  t("Green Sweater", "jacket", "#e0f040", "#a8c020", { pattern: "stripes" }),
  t("Froggie Shirt", "jacket", "#ff6a6a", "#3ac83a", { motif: "face" }),
  t("Orange Star Top", "jacket", "#ff6a2a", "#ffd84d", { motif: "star" }),
  t("Ribbon T-Shirt", "tee", "#b05ad8", "#ff9ac8", { motif: "bow" }),
  t("Black Jacket", "jacket", "#26262e", "#d81e2a", { pattern: "trim" }),
  t("Enchanted Cape", "jacket", "#e84a6a", "#ffd0dc", { pattern: "stripes" }),
  t("Gobbles Shirt", "tee", "#ffffff", "#a8642a", { motif: "turkey" }),
  t("Babydoll Frock", "tank", "#e8303a", "#ffd84d", { pattern: "trim" }),
  t("Colorful Striped Tee", "tank", "#4cc97a", "#e8306e", {
    pattern: "stripes",
  }),
  t("Asymmetrical Peach Shirt", "tee", "#ff8a6a", "#ffd0b0", {
    pattern: "dots",
  }),
  t("Girls Heart Top", "tank", "#ff8ac8", "#ffffff", { motif: "heart" }),
  t("Pink Star Sweater", "jacket", "#e84ab0", "#ffffff", { motif: "star" }),
  t("Argyle Sweater", "jacket", "#c87ab0", "#4cc97a", { pattern: "dots" }),
  t("Yellow Sweater", "tee", "#f6c83a", "#ff6a2a", { motif: "heart" }),
  t("Number One Shirt", "jacket", "#f2c040", "#2a5ad8", {
    motif: "one",
    sleeves: "#2a5ad8",
  }),
  t("Blue Peasant Top", "tee", "#ffffff", "#4ab8f0", { pattern: "stripes" }),
  t("Thanksgiving Shirt", "tee", "#f6e0b0", "#a8642a", { motif: "turkey" }),
  t("Pink Balloon Shirt", "tee", "#ffffff", "#ff4fa0", { motif: "balloon" }),
  // n-or-m-tops-4
  t("Wrap Top", "jacket", "#8a5a3a", "#3ac8a8", { pattern: "trim" }),
  t("Autumn Leaf Shirt", "jacket", "#a8c040", "#e8603a", { motif: "leaf" }),
  t("Girls Valentine Shirt", "tee", "#ffffff", "#e8306e", { motif: "heart" }),
  t("Leather Crop Jacket", "jacket", "#26262e", "#d81e2a", { pattern: "trim" }),
  t("Valentine Heart Shirt", "tee", "#ffffff", "#ff4f6a", { motif: "heart" }),
  t("Green Clover Shirt", "tee", "#3ac83a", "#ffffff", { motif: "clover" }),
  t("Pink Clover Shirt", "tee", "#ffffff", "#e8306e", { motif: "clover" }),
  t("Earth Day Tee", "tee", "#e0f8ff", "#3ac83a", { motif: "planet" }),
  t("Winter Belle Top", "jacket", "#a81e2a", "#ffffff", { pattern: "trim" }),
  t("Orange Turkey Shirt", "tee", "#e85a2a", "#ffd84d", { motif: "turkey" }),
  t("Firework Night Shirt", "tee", "#26262e", "#ffd84d", { motif: "star" }),
  t("Fireworks Shirt", "tee", "#ffffff", "#f2c040", { motif: "star" }),
  t("Snowman Shirt", "jacket", "#9a6ae0", "#ffffff", { motif: "snow" }),
  t("Autumn Coat", "jacket", "#a8642a", "#6a3a1a", { pattern: "dots" }),
  t("Pumpkin Night Shirt", "tee", "#3a3a46", "#f2902a", { motif: "pumpkin" }),
  t("Racing Tee", "tee", "#ffffff", "#26262e", { motif: "flag" }),
  t("Dance Fever Tee", "tee", "#26262e", "#ffd84d", { motif: "arrow" }),
  t("Basic Shamrock", "tee", "#ffffff", "#3ac83a", { motif: "clover" }),
  t("Sky Turkey Shirt", "tee", "#e8f4ff", "#4ab8f0", { motif: "turkey" }),
  t("Navy Turkey Shirt", "tee", "#2a3a8a", "#e8603a", { motif: "turkey" }),
  // n-or-m-tops-5
  t("Buccaneer Coat", "jacket", "#a8502a", "#f2e0a0", { pattern: "trim" }),
  t("Spade Shirt", "tee", "#e8f8f4", "#26262e", { motif: "spade" }),
  t("Diamond Shirt", "tee", "#e8f8f4", "#e8303a", { motif: "diamond" }),
  t("Club Shirt", "tee", "#e8f8f4", "#26262e", { motif: "club" }),
  t("Card Heart Shirt", "tee", "#e8f8f4", "#e8303a", { motif: "heart" }),
  t("Rainbow Tank", "tank", "#e8303a", "#3ac83a", { pattern: "stripes" }),
  t("Light Blue Sweater", "jacket", "#9ad0f0", "#ffffff", { pattern: "trim" }),
  t("Lucky Shamrock Shirt", "tee", "#f4f4f4", "#3ac83a", { motif: "clover" }),
  t("Sailor Style Shirt", "tee", "#fff0e0", "#ff8a4a", { pattern: "trim" }),
  t("White Shirt with Pink Tie", "tee", "#ffffff", "#ff4fa0", { motif: "tie" }),
  t("White Cat Shirt", "tee", "#ffffff", "#26262e", { motif: "face" }),
  t("Red Team Tee", "jacket", "#e8303a", "#ffffff", { pattern: "trim" }),
  t("Yellow Team Tee", "jacket", "#f6d23a", "#ffffff", { pattern: "trim" }),
  t("Blue Team Tee", "jacket", "#3a8ae0", "#ffffff", { pattern: "trim" }),
  t("Green Team Tee", "jacket", "#3ac83a", "#ffffff", { pattern: "trim" }),
  t("Red Holiday Sweater", "jacket", "#a81e3a", "#ffffff", {
    pattern: "stripes",
  }),
  t("Flower Mom Shirt", "tee", "#ff9ac8", "#ff6a2a", { motif: "flower" }),
  t("Easter Bunny Shirt", "tee", "#ffffff", "#c89af0", { motif: "bunny" }),
  t("Ghoul Face Shirt", "tee", "#ffffff", "#26262e", { motif: "ghost" }),
  t("Cherry Sweater", "jacket", "#8af0c0", "#e8303a", { motif: "berry" }),
  // n-or-m-tops-6
  t("Green Turkey Shirt", "tee", "#2a8a3a", "#a8642a", { motif: "turkey" }),
  t("White and Pink Tee", "tee", "#ffffff", "#ff9ac8", { pattern: "trim" }),
  t("Clown Tee", "tee", "#ffffff", "#e8303a", { motif: "face" }),
  t("Denim Turkey Shirt", "tee", "#3a5a8a", "#f2902a", { motif: "turkey" }),
  t("Lightning Shirt", "tee", "#26262e", "#ffd84d", { motif: "bolt" }),
  t("Patterned Tee", "tee", "#ff9a3a", "#8a6ae0", { pattern: "stripes" }),
  t("Balloon Tee", "tee", "#ffffff", "#e8303a", { motif: "balloon" }),
  t("Jelly Shirt", "tee", "#c86a2a", "#e8904a", { pattern: "trim" }),
  t("Watermelon Tee", "tee", "#f4f4f4", "#3ac83a", { motif: "melon" }),
  t("Campfire Tee", "tee", "#26262e", "#f2902a", { motif: "fire" }),
  t("Pink Watermelon Tee", "tee", "#ffffff", "#e8306e", { motif: "melon" }),
  t("Burger Tee", "tee", "#e8f8f0", "#a8642a", { motif: "burger" }),
  t("Earth Heart Tee", "tee", "#e8f8ff", "#3a8ae0", { motif: "heart" }),
  t("Chocolate Tee", "jacket", "#6a3a1a", "#a8642a", { pattern: "trim" }),
  t("Crimson Top", "tee", "#d81e2a", "#ffffff", { motif: "star" }),
  t("Blue Bunny Tee", "tee", "#4ab8f0", "#ffffff", { motif: "bunny" }),
];

const BOTTOM_ROWS = [
  // n-or-m-bottoms-1
  b("Black and White Shorts", "shorts", "#f4f4f4", {
    pattern: "stripes",
    accent: "#26262e",
  }),
  b("Red Gym Shorts", "shorts", "#e8303a", {
    pattern: "trim",
    accent: "#ffffff",
  }),
  b("Pink Pleated Skirt", "mini", "#c8305a", {
    pattern: "pleats",
    accent: "#a81e44",
  }),
  b("Navy Rock Pants", "pants", "#3a3a6a", {
    pattern: "trim",
    accent: "#9a9aff",
  }),
  b("White Stretch Leggings", "pants", "#f4f4fa"),
  b("Stylish Black Jeans", "pants", "#26262e"),
  b("Earth Day Pants", "pants", "#2e2e34", {
    pattern: "trim",
    accent: "#4cc97a",
  }),
  b("Dark Skinny Jeans", "pants", "#2a3a6a"),
  b("Seafarer Shorts", "shorts", "#6a3a1a"),
  b("Red Hot Jeans", "pants", "#a81e3a"),
  b("Denim Skirt with Gold", "mini", "#4a3aa8", {
    pattern: "trim",
    accent: "#f2c040",
  }),
  b("Dark Red Skirt", "mini", "#c8302a", {
    pattern: "pleats",
    accent: "#8a1e1a",
  }),
  // n-or-m-bottoms-2
  b("Black and Red Skirt", "skirt", "#26262e", {
    pattern: "trim",
    accent: "#d81e2a",
  }),
  b("Camo Pants", "pants", "#6a7a3a", { pattern: "dots", accent: "#4a5a2a" }),
  b("Dark Blue Shorts", "shorts", "#2a4a9a"),
  b("Yin Yang Skirt", "mini", "#6a3ab8", {
    pattern: "trim",
    accent: "#ffffff",
  }),
  b("Blue Hot Jeans", "pants", "#2a8ad8"),
  b("Bright Blue Shorts", "shorts", "#4a9ae8"),
  b("Panda Pants", "pants", "#ffffff", { pattern: "trim", accent: "#26262e" }),
  b("Pink Ruffled Skirt", "skirt", "#ff4fa0", {
    pattern: "trim",
    accent: "#ffffff",
  }),
  b("Green Dotted Skirt", "mini", "#c8e040", {
    pattern: "dots",
    accent: "#8aa020",
  }),
  b("Pleated Blue Skirt", "mini", "#2a3a5a", {
    pattern: "pleats",
    accent: "#ffffff",
  }),
];

export const NM_TOPS = TOP_ROWS.map((row) => ({ id: slug(row.label), ...row }));
export const NM_BOTTOMS = BOTTOM_ROWS.map((row) => ({
  id: slug(row.label),
  ...row,
}));
