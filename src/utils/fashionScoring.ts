export type FashionTheme =
  "savanna_chic" | "y2k_retro" | "neon_nightlife" | "beach_resort";

export type StyleTag =
  "savanna" | "retro" | "neon" | "formal" | "beach" | "casual";

export type ThemeDefinition = {
  id: FashionTheme;
  name: string;
  description: string;
  preferredTags: StyleTag[];
};

export const FASHION_THEMES: Record<FashionTheme, ThemeDefinition> = {
  savanna_chic: {
    id: "savanna_chic",
    name: "Savanna Chic",
    description:
      "Earthy tones, golden wreaths, safari elegance, and warm sunlit textures.",
    preferredTags: ["savanna", "formal"],
  },
  y2k_retro: {
    id: "y2k_retro",
    name: "Y2K Retro",
    description:
      "Futuristic neon visors, retro hair streaks, and high-energy millennium style.",
    preferredTags: ["retro", "neon"],
  },
  neon_nightlife: {
    id: "neon_nightlife",
    name: "Neon Nightlife",
    description:
      "Vibrant cyber glitz, electric blue boards, and VIP club fashion.",
    preferredTags: ["neon", "casual"],
  },
  beach_resort: {
    id: "beach_resort",
    name: "Beach Resort",
    description:
      "Tropical florals, pirate hats, airy linen, and splash-ready leisure.",
    preferredTags: ["beach", "casual"],
  },
};

const ITEM_STYLE_TAGS: Record<string, StyleTag[]> = {
  // Headwear & Hair
  "wreath-gold": ["savanna", "formal"],
  "visor-neon": ["retro", "neon"],
  "hat-pirate": ["beach", "retro"],
  "beret-classic": ["formal", "casual"],
  "crown-lion": ["savanna", "formal"],
  "shades-cool": ["retro", "casual"],
  "hair-streaks-y2k": ["retro", "neon"],
  "hair-curly-lion": ["savanna", "casual"],

  // Tops & Outfits
  "apron-barista": ["casual", "retro"],
  "jacket-leather": ["neon", "casual"],
  "tunic-savanna": ["savanna", "formal"],
  "vest-safari": ["savanna", "casual"],
  "hoodie-neon": ["neon", "casual"],
  "shirt-floral": ["beach", "casual"],

  // Accessories & Handheld
  "cutlass-steel": ["beach", "retro"],
  "smoothie-mango": ["beach", "casual"],
  "camera-vintage": ["retro", "casual"],

  // Boards
  "board-leaf": ["savanna", "casual"],
  "board-star": ["formal", "neon"],
  "board-pulse": ["neon", "retro"],
};

export function getItemStyleTags(itemId: string): StyleTag[] {
  return ITEM_STYLE_TAGS[itemId] ?? ["casual"];
}

export type ScoredOutfit = {
  score: number; // 0 to 100
  stars: number; // 1, 2, or 3
  feedback: string;
  coins: number;
};

export function scoreOutfit(
  themeId: FashionTheme,
  equippedItemIds: string[],
): ScoredOutfit {
  const theme = FASHION_THEMES[themeId];
  if (!theme) {
    return { score: 0, stars: 1, feedback: "Unknown fashion theme.", coins: 5 };
  }

  const validItems = equippedItemIds.filter(
    (id) => typeof id === "string" && id.trim().length > 0,
  );

  if (validItems.length === 0) {
    return {
      score: 10,
      stars: 1,
      feedback:
        "Bare runway! Put on some stylish pieces to impress the judges.",
      coins: 5,
    };
  }

  let tagMatches = 0;
  const uniqueItems = Array.from(new Set(validItems));

  for (const itemId of uniqueItems) {
    const tags = getItemStyleTags(itemId);
    const hasMatch = tags.some((tag) => theme.preferredTags.includes(tag));
    if (hasMatch) {
      tagMatches += 1;
    }
  }

  // Base score from outfit size + bonus for matching theme tags
  const varietyBonus = Math.min(uniqueItems.length * 12, 36); // up to 36 pts
  const matchBonus = Math.min(tagMatches * 22, 64); // up to 64 pts
  const rawScore = Math.min(100, Math.max(10, varietyBonus + matchBonus));

  let stars = 1;
  let coins = 10;
  let feedback = "Nice effort! Try combining more themed pieces next time.";

  if (rawScore >= 80) {
    stars = 3;
    coins = 60;
    feedback = "Magnificent! A flawless interpretation of the runway theme!";
  } else if (rawScore >= 50) {
    stars = 2;
    coins = 25;
    feedback =
      "Great runway presence! The judges appreciated your style direction.";
  }

  return {
    score: rawScore,
    stars,
    feedback,
    coins,
  };
}
