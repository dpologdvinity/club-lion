/**
 * More outfits, redrawn from the "nons or members" outfit sheets
 * (inspo/fantage/clothes/outfits, local only; see inspo/fantage/USED.md).
 * Compact rows: label, bodice, lower, colour, then optional extras.
 */
import type { Bodice, Lower, OutfitRecipe, Pattern } from "./pixelOutfits.ts";

type Extra = Partial<
  Pick<
    OutfitRecipe,
    | "bottom"
    | "sleeves"
    | "accent"
    | "belt"
    | "bow"
    | "trim"
    | "collar"
    | "tie"
    | "flower"
    | "fur"
  >
> & { tp?: Pattern; bp?: Pattern; p?: Pattern };

const o = (
  label: string,
  bodice: Bodice,
  lower: Lower,
  top: string,
  { tp, bp, p, ...extra }: Extra = {},
): OutfitRecipe => ({
  label,
  bodice,
  lower,
  top,
  ...extra,
  ...((tp ?? p) ? { topPattern: tp ?? p } : {}),
  ...((bp ?? p) ? { bottomPattern: bp ?? p } : {}),
});

/** Rows in sheet order; ids are made from the labels (nm_ prefix). */
export const NM_OUTFIT_ROWS: OutfitRecipe[] = [
  // n-or-m-outfits-1
  o("Sparkling Violet Gown", "halter", "mermaid", "#8a4ae0", {
    p: "sparkle",
    accent: "#d8c0ff",
  }),
  o("Pink Prom Dress", "tube", "tiers", "#d84a6a", { trim: "#ffb0c8" }),
  o("Feather Dress", "tube", "gown", "#8ad0f0", {
    bp: "stripes",
    accent: "#f8e070",
  }),
  o("Checkered Dress", "tube", "tutu", "#26262e", {
    p: "checks",
    accent: "#ffffff",
    belt: "#ff6fa0",
  }),
  o("Fancy Dress", "tube", "tutu", "#f6e6b8", { trim: "#fff6dc" }),
  o("Lovely Set", "tee", "mini", "#ff6fb0", { bottom: "#4cc97a" }),
  o("Block Party Outfit", "long", "mini", "#26262e", {
    p: "plaid",
    accent: "#9a9aa6",
  }),
  o("Aqua Swirl Dress", "halter", "skirt", "#4fd0e8", { trim: "#bff0ff" }),
  o("Stylish Outfit", "tee", "mini", "#e8303a", {
    tp: "stripes",
    accent: "#ffd84d",
  }),
  o("Sparkle Dress", "offshoulder", "mermaid", "#d81e2a", {
    p: "stripes",
    accent: "#ffffff",
  }),
  o("Dazzling Red Gown", "halter", "mermaid", "#c8141e", {
    p: "sparkle",
    accent: "#ff8a8a",
  }),
  o("Purple Elegance", "offshoulder", "gown", "#6a3ab8", { bottom: "#4a8ae0" }),
  o("Golden Bliss Gown", "tube", "gown", "#e8c878", {
    p: "sparkle",
    accent: "#fff2c0",
  }),
  o("Sparkling White Ball Gown", "offshoulder", "gown", "#f4f4fa", {
    p: "sparkle",
    accent: "#c9cbe0",
  }),
  o("Phantom Dress", "tube", "mini", "#2a3a8a", { belt: "#d81e2a" }),
  o("Fiery Red Dress", "halter", "gown", "#d81e2a", { trim: "#ff6a4a" }),
  o("Golden Princess Gown", "puff", "gown", "#e8d090", { trim: "#fff2c0" }),
  o("Autumn Princess Dress", "offshoulder", "gown", "#f08a5a", {
    trim: "#ffb08a",
  }),
  o("White Dress", "tube", "tutu", "#f4f4fa", { trim: "#d8dce8" }),
  o("Witch Outfit", "long", "skirt", "#2a2a5a", {
    accent: "#ffd84d",
    belt: "#ffd84d",
  }),
  // n-or-m-outfits-2
  o("Flower Power Outfit", "puff", "mini", "#f6e6b8", {
    p: "flowers",
    accent: "#ff6fa0",
  }),
  o("Magical Fairy Dress", "halter", "tutu", "#3ab8e0", {
    bottom: "#4cc97a",
    flower: "#ff4f6a",
  }),
  o("Caterpillar Outfit", "vest", "mini", "#6a4a2a", {
    accent: "#4cc97a",
    bottom: "#4cc97a",
  }),
  o("Firework Dress", "halter", "mermaid", "#2a3a8a", {
    p: "sparkle",
    accent: "#ffd84d",
  }),
  o("Navy Flower Dress", "tank", "mini", "#2a3a6a", {
    p: "flowers",
    accent: "#ffffff",
  }),
  o("Sweet Spring Outfit", "offshoulder", "tiers", "#ff9a6a", {
    trim: "#ffd0b0",
  }),
  o("Fun Party Dress", "tube", "tutu", "#26262e", {
    p: "checks",
    accent: "#ffffff",
  }),
  o("Fancy Violet Dress", "puff", "tutu", "#b8a0f0", { trim: "#e0d0ff" }),
  o("Autumn Dress", "offshoulder", "gown", "#f2c040", { trim: "#d8402a" }),
  o("Basketball Dress", "tank", "skirt", "#ffffff", {
    p: "stripes",
    accent: "#4a8ae0",
  }),
  o("Awesome Outfit", "long", "mini", "#ff6fa0", {
    p: "checks",
    accent: "#ffffff",
  }),
  o("Lovely Dress", "puff", "tiers", "#a8642a", { trim: "#f2c08a" }),
  o("Blue Party Dress", "offshoulder", "tutu", "#9ad0f0", {
    p: "flowers",
    accent: "#2a5ab8",
  }),
  o("Fishing Suit", "vest", "shorts", "#4cc97a", {
    accent: "#26262e",
    bottom: "#26262e",
  }),
  o("Flower Power Dress", "long", "skirt", "#8af0b0", {
    p: "flowers",
    accent: "#ff9ac8",
  }),
  o("Badminton Outfit", "tee", "skirt", "#ffffff", {
    p: "stripes",
    accent: "#ff8ab8",
  }),
  o("Speedster Girl", "halter", "shorts", "#d81e2a", { bottom: "#9a9aa6" }),
  o("Nature Spirit Ensemble", "vest", "mini", "#ff6f4a", {
    accent: "#8a4a2a",
    bottom: "#8a4a2a",
  }),
  o("Cool Cat Outfit", "tank", "mini", "#8a2a8a", { bottom: "#ff9ac8" }),
  o("Flowing Blue Gown", "long", "gown", "#2a8ad8", {
    p: "sparkle",
    accent: "#9ad0ff",
  }),
  // n-or-m-outfits-3
  o("Perfect Purple Dress", "offshoulder", "tutu", "#c040d0", {
    trim: "#ff9af0",
  }),
  o("Purple Sparkling Dress", "halter", "mermaid", "#8a6ae0", {
    p: "sparkle",
    accent: "#e0d0ff",
  }),
  o("Yin Yang Outfit", "tee", "shorts", "#4cc97a", { bottom: "#26262e" }),
  o("Perfect Party Outfit", "tube", "mini", "#26262e", {
    p: "checks",
    accent: "#ff6fa0",
  }),
  o("Purple Dotty Dress", "tank", "mermaid", "#8a4a9a", {
    p: "dots",
    accent: "#ffffff",
  }),
  o("Comfy Pajamas", "long", "pants", "#ff7ab0", { flower: "#ffd84d" }),
  o("Elegant Gown", "tube", "gown", "#f6e070", {
    p: "checks",
    accent: "#26262e",
  }),
  o("Wonderland Dress", "puff", "tutu", "#9ad8f0", {
    trim: "#ffffff",
    bow: "#ff6fa0",
  }),
  o("Polka Dot Outfit", "tee", "shorts", "#26262e", {
    p: "dots",
    accent: "#4fc0e8",
  }),
  o("Rainbow Pastel Dress", "tube", "skirt", "#ffe0f0", { bp: "rainbow" }),
  o("Glamorous Red Dress", "tube", "mermaid", "#a81a2a", {
    p: "sparkle",
    accent: "#ff6a6a",
  }),
  o("Lovely Rare Dress", "long", "skirt", "#f2902a", { trim: "#ffd06a" }),
  o("Fancy Yellow Dress", "tube", "tutu", "#f6e070", { bottom: "#9a9aa6" }),
  o("Rare Golden Prom Dress", "halter", "gown", "#9a4ae0", {
    bottom: "#f2c040",
  }),
  o("Fifties Outfit", "tee", "skirt", "#ffffff", {
    bottom: "#f2702a",
    collar: "#d81e2a",
  }),
  o("Desert Queen Dress", "tube", "gown", "#ffffff", {
    belt: "#f2c040",
    collar: "#2a5ab8",
  }),
  o("Poodle Skirt", "tee", "skirt", "#ffffff", {
    bottom: "#4ab8f0",
    collar: "#2a3a5a",
  }),
  o("Swagger Dress", "long", "mini", "#c8a8f0"),
  o("Adorable Blouse and Skirt", "puff", "mini", "#f4f4fa", {
    bottom: "#ff8ab8",
  }),
  o("Valentine Dress", "puff", "tutu", "#ff9ac8", { trim: "#ffffff" }),
  // n-or-m-outfits-4
  o("Lucky Green Outfit", "long", "mini", "#a8e070", {
    p: "stripes",
    accent: "#ffffff",
  }),
  o("Fancy Medieval Dress", "long", "gown", "#8a4a2a", { bottom: "#d8302a" }),
  o("Green Tiered Dress", "tube", "tiers", "#6cc248", { trim: "#ffffff" }),
  o("Medieval Style Gown", "puff", "gown", "#ff8ac8", { bottom: "#e8306e" }),
  o("Canoe Prize Blue", "tee", "skirt", "#9af0e0"),
  o("Canoe Prize Red", "halter", "mini", "#e8303a", { bottom: "#ffd84d" }),
  o("Royal Jester Outfit", "long", "skirt", "#d8202a", {
    bottom: "#2a5ab8",
    belt: "#ffd84d",
  }),
  o("Masquerade Dress", "halter", "gown", "#6a3ab8", {
    p: "diagonal",
    accent: "#f2c040",
  }),
  o("Wonderland Blue Dress", "puff", "tutu", "#3a8ae0", { trim: "#ffffff" }),
  o("Tea Party Hatter Outfit", "long", "gown", "#8a4ae0", { belt: "#ff6fa0" }),
  o("Superhero Dress", "tank", "mini", "#6a2a9a", {
    belt: "#ffd84d",
    bottom: "#ffd84d",
  }),
  o("Earthy Archer Dress", "halter", "tiers", "#2a8a3a", { trim: "#ff6a4a" }),
  o("Earth Day Dress", "offshoulder", "gown", "#2a9a4a", {
    p: "leaves",
    accent: "#8af07a",
  }),
  o("Classic Clover Dress", "tube", "tutu", "#2a6a3a", { trim: "#ffffff" }),
  o("Green Archer Outfit", "vest", "mini", "#4a8a2a", { accent: "#f2c040" }),
  o("Red Archer Outfit", "vest", "mini", "#d8402a", { accent: "#f2c040" }),
  o("Belly Dancer Outfit", "halter", "mermaid", "#ff8a4a", {
    p: "sparkle",
    accent: "#ffd84d",
  }),
  o("Magician Suit", "long", "pants", "#26262e", {
    collar: "#ffffff",
    tie: "#d8202a",
  }),
  o("Easter Egg Dress", "tube", "tutu", "#ffe0a0", {
    p: "zebra",
    accent: "#f2a040",
  }),
  o("Pretty Blue Dress", "puff", "tutu", "#9ad8f0", { trim: "#ffffff" }),
  // n-or-m-outfits-5
  o("White Party Dress", "tank", "tutu", "#f4f4fa", {
    p: "checks",
    accent: "#26262e",
  }),
  o("Cherry Knit Dress", "long", "mini", "#a81e3a"),
  o("Sky Blue Dress", "tube", "skirt", "#bfe6ff", {
    bp: "plaid",
    accent: "#4ab8f0",
  }),
  o("Pink Princess Dress", "puff", "tutu", "#ff9ac8", { trim: "#ffffff" }),
  o("Sweet Summer Outfit", "tank", "mini", "#f2702a"),
  o("Ice Outfit", "halter", "skirt", "#bff0e0"),
  o("VIP Dress", "halter", "mermaid", "#ffffff", { belt: "#d81e2a" }),
  o("Playful Dress", "tee", "tutu", "#4a8ae0", {
    bottom: "#ffffff",
    belt: "#d81e2a",
  }),
  o("Rookie Gown", "offshoulder", "gown", "#2a3ab8"),
  o("Pink Ribbon Dress", "puff", "tutu", "#ffd0dc", {
    p: "dots",
    accent: "#e8303a",
  }),
  o("School Girl Outfit", "vest", "mini", "#2a5ab8", {
    accent: "#f2702a",
    bottom: "#f2702a",
  }),
  o("Graceful Clutch Dress", "tube", "mini", "#26262e", {
    p: "dots",
    accent: "#ffffff",
  }),
  o("Beach Dress", "halter", "gown", "#4ab8f0"),
  o("Summer White Dress", "tank", "tiers", "#ffffff", { trim: "#ffd0dc" }),
  o("Blue Overalls", "vest", "pants", "#3a6ad8", {
    accent: "#ffffff",
    sleeves: "#ffffff",
  }),
  o("Deep Violet Dress", "tube", "skirt", "#6a2ab8"),
  o("Black Luxury Dress", "long", "mermaid", "#26262e", { trim: "#9a9aa6" }),
  o("Blue Sweater Dress", "long", "mini", "#3a7ae0", { bottom: "#d81e2a" }),
  o("Sari", "halter", "gown", "#c8308a", { bp: "diagonal", accent: "#f2c040" }),
  o("Senorita Dress", "offshoulder", "tiers", "#26262e", { bp: "rainbow" }),
  // n-or-m-outfits-7
  o("Giraffe Print Dress", "tank", "mini", "#e8c070", {
    p: "dots",
    accent: "#8a5a2a",
  }),
  o("Tiger Print Dress", "tube", "mini", "#f29a2a", {
    p: "zebra",
    accent: "#26262e",
  }),
  o("Painter Splash Outfit", "tee", "pants", "#ffffff", {
    p: "dots",
    accent: "#e8303a",
    bottom: "#2a5ad8",
  }),
  o("Blue Ball Gown", "halter", "gown", "#2ab8d8", { trim: "#9af0ff" }),
  o("Schoolgirl Uniform", "tee", "skirt", "#ffffff", {
    bottom: "#2a5ad8",
    tie: "#d81e2a",
  }),
  o("Purple Striped Dress", "tank", "mini", "#b88af0", {
    p: "stripes",
    accent: "#ffe14a",
  }),
  o("Pink Jumpsuit", "long", "pants", "#ff8ac0"),
  o("Romantic Era Dress", "offshoulder", "skirt", "#26262e", {
    bottom: "#e8406a",
  }),
  o("Shiny Turquoise Dress", "halter", "skirt", "#2ab8a8", {
    p: "sparkle",
    accent: "#9af0e0",
  }),
  o("Electric Pink Jumpsuit", "long", "pants", "#d81e5a"),
  o("Waitress Outfit", "vest", "skirt", "#26262e", {
    accent: "#ffffff",
    sleeves: "#ffffff",
  }),
  o("Jazz Outfit", "long", "mini", "#d81e2a", { bottom: "#26262e" }),
  o("Marie Costume", "puff", "gown", "#9ab8f0", {
    p: "flowers",
    accent: "#2a5ad8",
  }),
  o("Green Sparkles", "tube", "mini", "#2ac83a", {
    p: "sparkle",
    accent: "#b0ffa0",
  }),
  o("Purple Sparkles", "halter", "tutu", "#6a3ad8", {
    p: "sparkle",
    accent: "#d0c0ff",
  }),
  o("Golden Dress", "tube", "skirt", "#f2c040", {
    p: "sparkle",
    accent: "#fff2a0",
  }),
  o("Rainbow Dress", "tube", "mini", "#ff9a3a", { p: "rainbow" }),
  o("Blissful Spring Dress", "halter", "skirt", "#c8f070", {
    p: "flowers",
    accent: "#ff6fa0",
  }),
  o("Peacoat", "long", "mini", "#26262e", { collar: "#ffffff" }),
  o("Victorian Dress", "puff", "gown", "#f08ab0", { trim: "#ffd0e0" }),
  // n-or-m-outfits-8
  o("Holiday Suit", "long", "pants", "#d81e2a", { fur: true, belt: "#26262e" }),
  o("Fashionable Pink", "long", "mini", "#3a2a3a", { bottom: "#ff8ab8" }),
  o("Snowy White Dress", "puff", "tutu", "#e8f6ff", { fur: true }),
  o("Snowy Red Dress", "long", "tutu", "#e8303a", {
    p: "flowers",
    accent: "#ffffff",
    fur: true,
  }),
  o("Holiday Dress", "tube", "tutu", "#d81e2a", { fur: true, belt: "#f2c040" }),
  o("Red Winter Dress", "long", "tiers", "#c81e2a", { trim: "#f2c040" }),
  o("Red Coat with Scarf", "long", "mini", "#d83a2a", { collar: "#f2a040" }),
  o("New Year Suit", "vest", "pants", "#26262e", {
    accent: "#ffffff",
    tie: "#26262e",
  }),
  o("Red Floral Dress", "tube", "skirt", "#e84a6a", {
    p: "flowers",
    accent: "#ffd0dc",
  }),
  o("Snowman Dress", "offshoulder", "tutu", "#ffffff", {
    belt: "#d81e2a",
    trim: "#26262e",
  }),
  o("Flower Garden Gown", "offshoulder", "gown", "#6a4ad8", {
    p: "flowers",
    accent: "#ff6fa0",
  }),
  o("Purple Fairy Dress", "halter", "tutu", "#9a3ad8", {
    bottom: "#c060f0",
    trim: "#ffb0ff",
  }),
  o("Party Dress", "tube", "skirt", "#e85a7a", {
    bp: "diagonal",
    accent: "#ffffff",
  }),
  o("Mini Ribbon Dress", "tube", "tutu", "#ffd0dc", { bow: "#d81e5a" }),
  o("Playful Outfit", "long", "mini", "#2a7ac8", { bottom: "#26262e" }),
  o("Sophia Dress", "long", "skirt", "#8a6aa8", { trim: "#d8c8e8" }),
  o("Blue Bear Dress", "tank", "skirt", "#4fd0f0"),
  o("Pink Stripes", "tank", "mini", "#ff8ad8", {
    p: "diagonal",
    accent: "#ffffff",
  }),
  o("Fairy Dress", "tank", "tutu", "#e8306e", {
    bottom: "#ffd84d",
    trim: "#ff6a3a",
  }),
  o("Pink Smock", "tank", "mini", "#e8506a", {
    p: "stripes",
    accent: "#ff9ab0",
  }),
  // n-or-m-outfits-9
  o("Blue Gown", "tube", "tutu", "#1a3a8a", {
    p: "sparkle",
    accent: "#4a8ae0",
  }),
  o("Adorable Pastel Dress", "puff", "tutu", "#c8b0f0", {
    bottom: "#ff9ac8",
    trim: "#bff0ff",
  }),
  o("Yellow Bow Dress", "halter", "skirt", "#4ab8f0", {
    bow: "#ffe14a",
    bottom: "#ffe14a",
  }),
  o("Purple Renaissance", "puff", "skirt", "#6a3ab8", { trim: "#ffd84d" }),
  o("Punk Schoolgirl", "long", "mini", "#26262e", {
    bottom: "#e8306e",
    bp: "plaid",
    accent: "#26262e",
  }),
  o("Barrel Outfit", "tube", "mini", "#8a5a2a", {
    p: "stripes",
    accent: "#5a3a1a",
  }),
  o("Elegant White Gown", "offshoulder", "gown", "#f0f0f8", {
    p: "sparkle",
    accent: "#c9cbe0",
    trim: "#ffffff",
  }),
  o("Polka Dot Party Dress", "puff", "tutu", "#ffb0c8", {
    p: "dots",
    accent: "#ffffff",
    bow: "#e8306e",
  }),
  o("Lovely Lady Dress", "long", "skirt", "#c8a8f0", {
    p: "dots",
    accent: "#ffffff",
  }),
  o("Colorful Heart Dress", "tank", "mini", "#ffd0e0", { p: "rainbow" }),
  o("Fairy Tale Dress", "puff", "gown", "#9ad8f0", { trim: "#ffffff" }),
  o("Cozy Holiday Dress", "puff", "tutu", "#d81e2a", { fur: true }),
  o("Snazzy Zebra Dress", "halter", "tiers", "#f4f4f4", {
    p: "zebra",
    accent: "#26262e",
  }),
  o("Tropical Flora Dress", "halter", "skirt", "#ff4fa0", {
    p: "leaves",
    accent: "#4cc97a",
  }),
  o("Fashionable Yellow Dress", "puff", "skirt", "#f6c83a", {
    bottom: "#d81e2a",
  }),
  o("Red Rose Gown", "tube", "gown", "#ffffff", {
    bottom: "#c81e2a",
    flower: "#c81e2a",
  }),
  o("Hipster Dress", "long", "mini", "#f4f4fa", { bottom: "#e8306e" }),
  o("Long Vibrant Dress", "halter", "gown", "#f2702a", {
    bp: "ombre",
    accent: "#d81e5a",
  }),
  o("Polka Dotted Summer Dress", "puff", "skirt", "#d81e2a", {
    p: "dots",
    accent: "#ffffff",
  }),
  o("Exquisite Dress", "puff", "tutu", "#e8f0ff", { trim: "#9ab8f0" }),
  // n-or-m-outfits-10
  o("Fancy Black Dress", "offshoulder", "tiers", "#26262e", {
    trim: "#9a9aa6",
  }),
  o("Purple Dress", "halter", "skirt", "#6a4ad8"),
  o("Gymnast Outfit", "long", "briefs", "#c81e7a", {
    p: "diagonal",
    accent: "#ffd84d",
  }),
  o("Popstar Dress", "long", "mini", "#2a5ad8", {
    p: "sparkle",
    accent: "#9ad0ff",
  }),
  o("Princess Dress", "puff", "gown", "#c8c0f0", { trim: "#ffffff" }),
  o("Movie Star Dress", "halter", "mermaid", "#2ab86a", {
    p: "sparkle",
    accent: "#b0ffd0",
  }),
  o("Peacock Dress", "halter", "skirt", "#2ac8a8", {
    p: "leaves",
    accent: "#2a5ad8",
  }),
  o("Popstar Purple", "tube", "mini", "#9a8ac8", {
    p: "sparkle",
    accent: "#e0d8ff",
  }),
  o("Lovely Green Dress", "tank", "gown", "#a8e070", {
    p: "sparkle",
    accent: "#e8ffc0",
  }),
  o("Fashionable Gown", "long", "gown", "#3a2a6a", { trim: "#8a7ac8" }),
  o("Star Queen Dress", "offshoulder", "tutu", "#8a6ac8", {
    p: "sparkle",
    accent: "#ffffff",
  }),
  o("Luxurious Blue Gown", "halter", "mermaid", "#2a5ad8", { trim: "#9ad0ff" }),
  o("Earthy Green Dress", "tank", "skirt", "#b8e070", { trim: "#e8ffc0" }),
  o("Yellow Ball Dress", "puff", "gown", "#f6e6a0", { trim: "#ffffff" }),
  o("Amazing Purple Gown", "tube", "mermaid", "#b030c8", { trim: "#ff8ae8" }),
  o("Sparkling Blue Dress", "offshoulder", "gown", "#2a5ad8", {
    p: "dots",
    accent: "#bfe6ff",
  }),
  o("Black Dress", "tube", "tutu", "#26262e", { trim: "#5a5a6a" }),
  o("Beautiful Green Dress", "tee", "tiers", "#2ab86a", {
    p: "stripes",
    accent: "#26262e",
  }),
  o("Black and White Gown", "halter", "mermaid", "#f4f4f4", {
    p: "stripes",
    accent: "#26262e",
  }),
  o("Green Summer Outfit", "tee", "shorts", "#4cc97a", { bottom: "#6a3ad8" }),
  // n-or-m-outfits-11
  o("Pink Lady Dress", "long", "tutu", "#ff8ac8", {
    p: "dots",
    accent: "#ffffff",
    collar: "#4ab8f0",
  }),
  o("Shimmering Black Gown", "tube", "tutu", "#26262e", {
    p: "sparkle",
    accent: "#9a9aa6",
  }),
  o("Cheerleader Outfit", "tank", "mini", "#d81e2a", {
    bp: "stripes",
    accent: "#ffffff",
  }),
  o("Flower Girl Dress", "long", "tiers", "#26262e", {
    bottom: "#d81e2a",
    trim: "#ff8ab8",
  }),
  o("Shiny Black Dress", "long", "mini", "#3a3a46", {
    p: "sparkle",
    accent: "#c9cbe0",
  }),
  o("Purple Party Dress", "puff", "tutu", "#7a3ad8", { belt: "#ff6fa0" }),
  o("Spring Dress", "puff", "skirt", "#bfe6ff", {
    bow: "#ff4f8a",
    trim: "#ffd0e0",
  }),
  o("Springtime Look", "halter", "gown", "#f6e04a", {
    bottom: "#4cc97a",
    flower: "#ff6fa0",
  }),
  o("Polka Dot Dress", "puff", "tutu", "#d81e2a", {
    p: "dots",
    accent: "#ffffff",
  }),
  o("Lovely Angel Dress", "puff", "gown", "#fbeec8", { trim: "#f2d890" }),
  o("Luxurious Outfit", "puff", "tutu", "#ff8ac8", {
    p: "dots",
    accent: "#ffd0e8",
    trim: "#ff4fa0",
  }),
  o("Cute Pink Overalls", "vest", "pants", "#ff8ab8", {
    accent: "#ffffff",
    sleeves: "#ffffff",
  }),
  o("Lovely Pink Dress", "tube", "tiers", "#ff7a8a", { flower: "#ffd84d" }),
  o("Absolutely Fabulous Pink", "tank", "skirt", "#e8306e", {
    trim: "#ff9ac8",
  }),
  o("Chic Black Dress", "tube", "mini", "#3a3a46", {
    p: "dots",
    accent: "#9a9aa6",
  }),
  o("Funky Green Dress", "tube", "tutu", "#3ac83a", {
    bottom: "#e8306e",
    trim: "#ffd84d",
  }),
  o("Purple Power Dress", "puff", "mini", "#6a4ad8", { bottom: "#9a9aa6" }),
  o("Navy Blue Top", "long", "mini", "#2a3a8a", {
    accent: "#4ab8f0",
    collar: "#ffffff",
  }),
  o("Oh So Stylish Dress", "halter", "skirt", "#4a4a58", {
    p: "zebra",
    accent: "#26262e",
  }),
  o("Sweet and Pink", "tube", "skirt", "#ffd0dc", {
    bottom: "#e84a7a",
    bp: "stripes",
    accent: "#ffffff",
  }),
  // n-or-m-outfits-12
  o("Waist Bow Dress", "tube", "tutu", "#2a2a5a", {
    p: "dots",
    accent: "#ff6fa0",
    bow: "#ff6fa0",
  }),
  o("Puffy Green Dress", "tube", "tutu", "#2ad8a0", { trim: "#b0ffe0" }),
  o("Flowing Yellow Gown", "tube", "gown", "#26262e", {
    bottom: "#f2c040",
    flower: "#f2c040",
  }),
  o("Easter Party Dress", "halter", "tutu", "#2ac8b8", { bottom: "#ff6fa0" }),
  o("Striped Punk Outfit", "tank", "mini", "#26262e", {
    p: "stripes",
    accent: "#ff4fa0",
  }),
  o("Peaches and Cream", "offshoulder", "tiers", "#f6b04a", {
    trim: "#fff2d0",
  }),
  o("Pink Lace Gown", "tube", "gown", "#26262e", {
    bottom: "#ffb0c8",
    trim: "#26262e",
  }),
  o("Fancy Blue Gown", "halter", "mermaid", "#4a8ae0", {
    p: "sparkle",
    accent: "#bfe0ff",
  }),
  o("Purple Skating Outfit", "halter", "tutu", "#e04ae0", { trim: "#ffb0ff" }),
  o("Silver Queen Dress", "tube", "tutu", "#26262e", {
    p: "checks",
    accent: "#ffffff",
  }),
  o("Rocker Wear", "long", "mini", "#3a3a5a", { bottom: "#2a8ad8" }),
  o("Pink Ruffles Outfit", "puff", "tiers", "#4ab8f0", {
    bottom: "#ff8ac8",
    trim: "#ffd0e8",
  }),
  o("Pink Ruffles Dress", "puff", "tiers", "#ff9ac8", { trim: "#ffffff" }),
  o("Red Qipao", "tube", "mermaid", "#d81e2a", { collar: "#f2c040" }),
  o("Hot Pink Party Dress", "tank", "tutu", "#e8206e", { bottom: "#26262e" }),
  o("Hanbok", "long", "gown", "#3ab84a", { bottom: "#d81e2a", tie: "#ffd84d" }),
  o("Purple Gown", "halter", "tutu", "#c88af0", { trim: "#ffd0ff" }),
  o("Beige Sweater Outfit", "long", "pants", "#f2e0a0", { bottom: "#3a3a46" }),
  o("Denim Star Outfit", "long", "pants", "#4a6ab8", {
    tp: "sparkle",
    accent: "#ffd84d",
  }),
  o("Fancy Sweater Outfit", "long", "mini", "#e8c890", {
    belt: "#6a4220",
    bottom: "#6a4220",
  }),
  // n-or-m-outfits-13
  o("Purple Sweater Dress", "long", "mini", "#8a2a6a", { bottom: "#c040a0" }),
  o("Peach Ball Gown", "halter", "gown", "#ffc8a8", { trim: "#ffe8d8" }),
  o("Clown Dress", "puff", "tutu", "#f4f0ff", {
    p: "dots",
    accent: "#4cc97a",
    collar: "#ff6fa0",
  }),
  o("Bright Green Dress", "tube", "tiers", "#2ab86a", {
    p: "stripes",
    accent: "#26262e",
  }),
  o("Fancy Teal Dress", "tube", "tutu", "#2ab8a8", {
    p: "checks",
    accent: "#26262e",
  }),
  o("Funky Outfit", "tee", "mini", "#e8306e", { bottom: "#4a4a58" }),
  o("Casual Outfit", "tee", "mini", "#26262e", {
    p: "stripes",
    accent: "#ffffff",
    bottom: "#4a6ab8",
  }),
  o("Polka Dotted Dress", "puff", "tutu", "#9ab8f0", {
    p: "dots",
    accent: "#2a5ad8",
  }),
  o("Cutie Pie Outfit", "tank", "mini", "#f4f4f4", {
    p: "plaid",
    accent: "#9a9aa6",
  }),
  o("Magenta Party Dress", "tank", "tutu", "#e8306e", {
    bp: "stripes",
    accent: "#2a5ad8",
  }),
  o("Yellow Prom Dress", "tube", "skirt", "#f6e070", { trim: "#fff6c0" }),
  o("Purple Prom Dress", "tube", "tiers", "#c060f0", { trim: "#e8b0ff" }),
  o("Bright Prom Dress", "tube", "tutu", "#9ab8f0", {
    bottom: "#ff9ac8",
    trim: "#ffffff",
  }),
  o("Black and White Dress", "tank", "mini", "#f4f4f4", {
    p: "dots",
    accent: "#26262e",
  }),
  o("Worker Outfit", "vest", "pants", "#4a6ab8", {
    accent: "#f2c040",
    sleeves: "#f2c040",
  }),
  o("Fancy Striped Outfit", "long", "pants", "#f4f4f4", {
    p: "stripes",
    accent: "#26262e",
  }),
  o("Glowing Dress", "long", "mini", "#ffd0f0", { trim: "#ff8ae0" }),
  o("Black Dress with Gloves", "offshoulder", "mini", "#26262e", {
    p: "dots",
    accent: "#4a4a58",
  }),
  o("Dark Red Outfit", "long", "pants", "#a81e3a", { bottom: "#3a3a5a" }),
  o("Hawaiian Style Dress", "tank", "mini", "#f4f0e0", {
    p: "leaves",
    accent: "#2a8a3a",
  }),
  // n-or-m-outfits-14
  o("Picnic Outfit", "tank", "mini", "#d83a8a", {
    p: "plaid",
    accent: "#4cc97a",
  }),
  o("Ice Cream Attendant", "tee", "skirt", "#ffffff", {
    bottom: "#26262e",
    collar: "#d81e5a",
  }),
  o("Puffy Gray Dress", "long", "mini", "#9a9aa6", { trim: "#c9cbd6" }),
  o("Harvest Outfit", "long", "mini", "#8a2a2a", { collar: "#ffffff" }),
  o("Goth Princess", "tube", "tiers", "#26262e", { trim: "#d81e2a" }),
  o("Winterwear", "long", "pants", "#ff7ab0", {
    collar: "#4cc97a",
    bottom: "#ffffff",
  }),
  o("Holiday Party Dress", "tube", "tutu", "#d81e2a", {
    fur: true,
    bp: "flowers",
    accent: "#ffffff",
  }),
  o("Festive Harvest Dress", "offshoulder", "skirt", "#2a8a3a", {
    bp: "stripes",
    accent: "#e8303a",
  }),
  o("Snazzy Prom Dress", "tube", "tutu", "#ff6fa0", {
    p: "dots",
    accent: "#ffffff",
  }),
  o("Summer Dress", "tank", "skirt", "#4ab8f0", {
    p: "flowers",
    accent: "#ff9ac8",
  }),
  o("Warm Fuzzy Ensemble", "long", "pants", "#c8a878", {
    p: "plaid",
    accent: "#6a4a2a",
  }),
  o("Warm and Cozy", "long", "pants", "#2a8a3a", { bottom: "#4cc97a" }),
  o("Fancy Party Outfit", "long", "skirt", "#9a9aa6", { bottom: "#f6e6a0" }),
  o("Warm Winter Ensemble", "long", "pants", "#c8302a", { bottom: "#f2e0c0" }),
  o("Kitty Outfit", "long", "pants", "#a81e4a", { collar: "#ffffff" }),
  o("Cool Blue Prom Dress", "halter", "gown", "#bfe6ff", {
    bottom: "#2a5ad8",
    trim: "#ffffff",
  }),
  o("Basketball Jersey", "tank", "shorts", "#e8303a", {
    tp: "stripes",
    accent: "#ffffff",
  }),
  o("Ace of Hearts Outfit", "tube", "mini", "#ffffff", {
    flower: "#e8303a",
    trim: "#e8303a",
  }),
  o("Sassy Spring Outfit", "halter", "mini", "#a8e040", { bottom: "#7a3ad8" }),
  o("Cute Kitty Dress", "puff", "skirt", "#f2a040", {
    p: "flowers",
    accent: "#2a8ad8",
  }),
  // n-or-m-outfits-15
  o("Black Bathing Suit", "tank", "briefs", "#26262e"),
  o("Adorable Bathing Suit", "bikini", "swimskirt", "#ff7ab0", {
    p: "dots",
    accent: "#ffd84d",
    trim: "#ffd84d",
  }),
  o("Checkered Punk Swimsuit", "tank", "briefs", "#f4f4f4", {
    p: "checks",
    accent: "#26262e",
  }),
  o("Stylish Swimsuit", "bikini", "briefs", "#f6d23a", {
    p: "stripes",
    accent: "#2ab8d8",
  }),
  o("Mermaid Princess Outfit", "bikini", "mermaid", "#ff9ab8", {
    bp: "sparkle",
    accent: "#ffd0e0",
    flower: "#ff4f8a",
  }),
  o("Elegant Blue Dress", "halter", "mini", "#4ad0f0"),
  o("Sporty Purple Dress", "tank", "tutu", "#8a4ae0", { trim: "#c99aff" }),
  o("Purple Shades Dress", "halter", "tutu", "#e8b0f0", {
    bp: "ombre",
    accent: "#9ab8f0",
  }),
  o("Sarong Swimsuit", "bikini", "swimskirt", "#c81e9a", {
    bp: "flowers",
    accent: "#ffffff",
  }),
  o("Heart Swimsuit", "tank", "briefs", "#4fc0e8", { flower: "#e8303a" }),
  o("Heart Balloon Swimsuit", "tank", "briefs", "#3ac83a", {
    flower: "#e8303a",
  }),
  o("Polka Dot Swimsuit", "bikini", "briefs", "#2ab8a8", {
    p: "dots",
    accent: "#2a5ad8",
  }),
  o("One Piece Swimsuit", "tank", "briefs", "#2a6ad8", {
    p: "diagonal",
    accent: "#9ad0ff",
  }),
  o("Sunny Spring Outfit", "tee", "shorts", "#4ab8f0", {
    flower: "#ffd84d",
    bottom: "#ffd84d",
  }),
  o("Sparkling Teal Gown", "halter", "gown", "#2ab8a8", {
    p: "dots",
    accent: "#9af0e0",
  }),
  o("Pink Frill Dress", "puff", "tutu", "#ff8ac8", {
    p: "flowers",
    accent: "#ffffff",
  }),
  o("Earthy Lime Dress", "tank", "skirt", "#c8f040", {
    p: "stripes",
    accent: "#a8d020",
  }),
  o("Cute Blue Dress", "tank", "skirt", "#4a9ae8"),
  o("Pink Spring Outfit", "tank", "shorts", "#ff6fb0", { bottom: "#2a5ad8" }),
  o("Formal Green Dress", "tube", "tutu", "#3ac86a", {
    p: "dots",
    accent: "#b0ffd0",
  }),
  // n-or-m-outfits-17
  o("Winter Lemon Dress", "puff", "tiers", "#f6e070", { trim: "#fff6c0" }),
  o("Elegant Autumn Gown", "long", "gown", "#c8402a", { bottom: "#f2a040" }),
  o("Lovely Poncho", "long", "pants", "#c8b070", { bottom: "#2a3a8a" }),
  o("Wonderland Outfit", "puff", "tiers", "#8a6ac8", { trim: "#ffffff" }),
  o("Cherry Red Dress", "offshoulder", "skirt", "#e85a3a", { trim: "#ffd84d" }),
  o("Lavish Dress", "offshoulder", "gown", "#8a1e3a", { trim: "#c84a6a" }),
  o("Limegreen Onepiece", "puff", "tutu", "#c8f080", { trim: "#ffffff" }),
  o("Kitty Party Outfit", "puff", "tiers", "#c89af0", {
    p: "dots",
    accent: "#ff6fa0",
  }),
  o("Galactic Dress", "tube", "tutu", "#26262e", {
    p: "dots",
    accent: "#e8603a",
  }),
  o("Flowery Princess Dress", "puff", "tiers", "#ff7ab0", {
    p: "dots",
    accent: "#ffffff",
  }),
  o("Midnight Blue Outfit", "long", "skirt", "#2a3a6a", { bottom: "#5a8ae0" }),
  o("Sand Outfit", "tube", "mermaid", "#f2d060", { trim: "#fff2b0" }),
  o("Violet Dress", "long", "gown", "#8a7ae8", { trim: "#c8c0ff" }),
  o("Pink Leopard Outfit", "tank", "mini", "#ff6fb0", {
    p: "dots",
    accent: "#7a1e5a",
  }),
  o("Pale Blue Dress", "tube", "gown", "#bfd8f0", { trim: "#e8f4ff" }),
  o("Lady in Red", "tube", "mermaid", "#26262e", {
    p: "diagonal",
    accent: "#d81e2a",
  }),
  o("Purple Dress Deluxe", "puff", "mini", "#7a3ad8", { bottom: "#ffffff" }),
  o("Moonlight Wolf Dress", "long", "tiers", "#5a6ab8", { trim: "#c9cbe0" }),
  o("Kitten Dress", "tube", "tutu", "#3a3a46", { flower: "#ff8ab8" }),
  o("Green Easter Dress", "tank", "tutu", "#a8e070", {
    bow: "#ff6fa0",
    trim: "#ffd84d",
  }),
];
