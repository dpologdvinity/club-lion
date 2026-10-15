/**
 * Pet species the player can pick. Lion is the original companion; the rest
 * are drawn in src/components/PetSpeciesArt.tsx.
 */
import type { CareAction } from "./petCare.ts";

export const PET_SPECIES_ORDER = [
  "lion",
  "bunny",
  "puppy",
  "kitten",
  "duckling",
  "panda",
  "unicorn",
  "dragon",
] as const;

export type PetSpecies = (typeof PET_SPECIES_ORDER)[number];

export type PetProfile = {
  label: string;
  /** Default pet name for the species; picking a species renames the pet. */
  petName: string;
  /** Emoji that pops up after each care action. */
  reactions: Record<CareAction, string>;
};

export const PET_PROFILES: Record<PetSpecies, PetProfile> = {
  lion: {
    label: "Lion cub",
    petName: "Leo",
    reactions: { wash: "🫧", brush: "✨", feed: "😋", play: "🎉" },
  },
  bunny: {
    label: "Bunny",
    petName: "Hop",
    reactions: { wash: "🫧", brush: "✨", feed: "🥕", play: "🌟" },
  },
  puppy: {
    label: "Puppy",
    petName: "Biscuit",
    reactions: { wash: "🫧", brush: "✨", feed: "🦴", play: "🎾" },
  },
  kitten: {
    label: "Kitten",
    petName: "Mochi",
    reactions: { wash: "🫧", brush: "✨", feed: "🐟", play: "🧶" },
  },
  duckling: {
    label: "Duckling",
    petName: "Waddles",
    reactions: { wash: "💦", brush: "🌼", feed: "🍞", play: "🎈" },
  },
  panda: {
    label: "Panda",
    petName: "Bamboo",
    reactions: { wash: "💧", brush: "✨", feed: "🎋", play: "🧸" },
  },
  unicorn: {
    label: "Unicorn",
    petName: "Sparkle",
    reactions: { wash: "🫧", brush: "🌈", feed: "🍎", play: "⭐" },
  },
  dragon: {
    label: "Dragon",
    petName: "Ember",
    reactions: { wash: "💨", brush: "✨", feed: "🍖", play: "🔥" },
  },
};

export function isPetSpecies(value: unknown): value is PetSpecies {
  return PET_SPECIES_ORDER.some((species) => species === value);
}

/** Saved species that is missing or unknown falls back to the lion cub. */
export function restorePetSpecies(value: unknown): PetSpecies {
  return isPetSpecies(value) ? value : "lion";
}
