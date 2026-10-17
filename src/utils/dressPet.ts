/**
 * Dress-the-Pet rules with no React or DOM dependency: wearable items by
 * slot, theme cards, outfit validation and the star score.
 */

export const PET_SLOTS = ["hat", "eyes", "neck", "extra"] as const;
export type PetSlot = (typeof PET_SLOTS)[number];

export const PET_THEMES = [
  { id: "beach", label: "Beach day", emoji: "🏖️" },
  { id: "party", label: "Party time", emoji: "🎉" },
  { id: "royal", label: "Royal ball", emoji: "🏰" },
  { id: "winter", label: "Snow day", emoji: "❄️" },
] as const;
export type PetTheme = (typeof PET_THEMES)[number];
export type PetThemeId = PetTheme["id"];

type Item = {
  id: string;
  slot: PetSlot;
  emoji: string;
  label: string;
  themes: readonly PetThemeId[];
};

export const PET_ITEMS: readonly Item[] = [
  {
    id: "sunhat",
    slot: "hat",
    emoji: "👒",
    label: "sun hat",
    themes: ["beach"],
  },
  {
    id: "tophat",
    slot: "hat",
    emoji: "🎩",
    label: "top hat",
    themes: ["party"],
  },
  { id: "crown", slot: "hat", emoji: "👑", label: "crown", themes: ["royal"] },
  {
    id: "earmuffs",
    slot: "hat",
    emoji: "🎧",
    label: "earmuffs",
    themes: ["winter"],
  },
  {
    id: "shades",
    slot: "eyes",
    emoji: "🕶️",
    label: "sunglasses",
    themes: ["beach", "party"],
  },
  {
    id: "glasses",
    slot: "eyes",
    emoji: "👓",
    label: "glasses",
    themes: ["royal"],
  },
  {
    id: "goggles",
    slot: "eyes",
    emoji: "🥽",
    label: "snow goggles",
    themes: ["winter"],
  },
  {
    id: "lei",
    slot: "neck",
    emoji: "🌺",
    label: "flower lei",
    themes: ["beach"],
  },
  {
    id: "bow",
    slot: "neck",
    emoji: "🎀",
    label: "bow",
    themes: ["party", "royal"],
  },
  {
    id: "scarf",
    slot: "neck",
    emoji: "🧣",
    label: "scarf",
    themes: ["winter"],
  },
  {
    id: "beachball",
    slot: "extra",
    emoji: "🏐",
    label: "beach ball",
    themes: ["beach"],
  },
  {
    id: "balloon",
    slot: "extra",
    emoji: "🎈",
    label: "balloon",
    themes: ["party"],
  },
  {
    id: "wand",
    slot: "extra",
    emoji: "🪄",
    label: "magic wand",
    themes: ["royal"],
  },
  {
    id: "snowman",
    slot: "extra",
    emoji: "⛄",
    label: "snowman buddy",
    themes: ["winter"],
  },
];

export type PetOutfit = Partial<Record<PetSlot, string>>;

export function isPetOutfit(value: unknown): value is PetOutfit {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return (
    entries.length > 0 &&
    entries.every(([slot, id]) =>
      PET_ITEMS.some((item) => item.slot === slot && item.id === id),
    )
  );
}

export function isPetThemeId(value: unknown): value is PetThemeId {
  return PET_THEMES.some((theme) => theme.id === value);
}

/** One star for any look, two for 2–3 theme matches, three for a full match. */
export function scoreOutfit(theme: PetThemeId, outfit: PetOutfit): 1 | 2 | 3 {
  const matches = PET_SLOTS.filter((slot) =>
    PET_ITEMS.some(
      (item) =>
        item.slot === slot &&
        item.id === outfit[slot] &&
        item.themes.includes(theme),
    ),
  ).length;
  return matches === PET_SLOTS.length ? 3 : matches >= 2 ? 2 : 1;
}

export function pickTheme(
  previous: PetThemeId | null,
  random: () => number = Math.random,
): PetTheme {
  const choices = PET_THEMES.filter((theme) => theme.id !== previous);
  return choices[
    Math.min(choices.length - 1, Math.floor(random() * choices.length))
  ];
}
