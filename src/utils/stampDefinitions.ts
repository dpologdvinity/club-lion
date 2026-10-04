import type { Player, PlayerV2 } from "../game.ts";
import { CATALOG_ITEMS, DEFAULT_AVATAR_LOOK } from "../types/world.ts";

export type StampCategory =
  | "world_secrets"
  | "park_thrills"
  | "fashion_style"
  | "arcade_mastery"
  | "secrets";
export type StampDefinition = {
  id: string;
  name: string;
  title?: string;
  rewardCoins?: number;
  category: StampCategory;
  description: string;
  icon: string;
  unlockHint: string;
};

export const STAMP_DEFINITIONS: StampDefinition[] = [
  {
    id: "lighthouse_foghorn",
    name: "Foghorn Mariner",
    title: "Foghorn Mariner",
    category: "secrets",
    description:
      "Sound the two-tone brass foghorn atop the coastal lighthouse.",
    icon: "📯",
    rewardCoins: 40,
    unlockHint: "Pull the brass chain at the Coastal Pier lighthouse.",
  },
  {
    id: "catalog_barista",
    name: "Canopy Barista",
    category: "world_secrets",
    description: "Found the secret barista apron.",
    icon: "☕",
    unlockHint: "Find the coffee steam secret in Le Shop.",
  },
  {
    id: "catalog_visor",
    name: "Neon Detective",
    category: "world_secrets",
    description: "Found the retro neon visor.",
    icon: "🕶️",
    unlockHint: "Find the price tag star secret in Le Shop.",
  },
  {
    id: "catalog_wreath",
    name: "Golden Discovery",
    category: "world_secrets",
    description: "Found the golden mane wreath.",
    icon: "🌿",
    unlockHint: "Find the hidden leaf secret in Le Shop.",
  },
  {
    id: "catalog_pirate",
    name: "Savanna Swashbuckler",
    category: "world_secrets",
    description: "Found the eyepatch and cutlass.",
    icon: "🏴‍☠️",
    unlockHint: "Find the beach pirate skull secret in Le Shop.",
  },
  {
    id: "lion_fountain",
    name: "Fountain Friend",
    category: "world_secrets",
    description: "Discovered the marble lion fountain.",
    icon: "⛲",
    unlockHint: "Inspect the lion fountain in Downtown Plaza.",
  },
  {
    id: "night_mode",
    name: "After Sunset",
    category: "world_secrets",
    description: "Explored the savanna after dark.",
    icon: "🌙",
    unlockHint: "Night exploration is coming in a future adventure.",
  },
  {
    id: "secret_den",
    name: "Home Sweet Den",
    category: "world_secrets",
    description: "Found a cozy corner of the savanna.",
    icon: "🏡",
    unlockHint: "Visit your cozy den.",
  },
  {
    id: "coaster_screamer",
    name: "Savanna Screamer",
    category: "park_thrills",
    description: "Completed a circuit of the Savanna Screamer.",
    icon: "🎢",
    unlockHint: "Finish a Savanna Screamer ride.",
  },
  {
    id: "ferris_panoramic",
    name: "Skyline Spotter",
    category: "park_thrills",
    description: "Watched the panoramic Ferris wheel.",
    icon: "🎡",
    unlockHint: "Inspect the Ferris wheel at Wonder Park Entrance.",
  },
  {
    id: "mango_teacups",
    name: "Mango Whirl",
    category: "park_thrills",
    description: "Discovered the spinning mango teacups.",
    icon: "🥭",
    unlockHint: "Inspect the mango teacups at Carnival Midway.",
  },
  {
    id: "golden_carousel",
    name: "Golden Roundabout",
    category: "park_thrills",
    description: "Discovered the golden carousel.",
    icon: "🎠",
    unlockHint: "Inspect the carousel at Carnival Midway.",
  },
  {
    id: "flume_splash",
    name: "Big Splash",
    category: "park_thrills",
    description: "Experienced the park flume splash.",
    icon: "💦",
    unlockHint: "Flume adventures are coming in a future update.",
  },
  {
    id: "photo_souvenir",
    name: "Picture Perfect",
    category: "park_thrills",
    description: "Kept a souvenir from the coaster loop.",
    icon: "📸",
    unlockHint: "Finish a coaster ride with a souvenir photo.",
  },
  {
    id: "wave_pool",
    name: "Making Waves",
    category: "park_thrills",
    description: "Explored the wave pool.",
    icon: "🌊",
    unlockHint: "Wave pool adventures are coming in a future update.",
  },
  {
    id: "salon_makeover",
    name: "Fresh Mane",
    category: "fashion_style",
    description: "Gave your hair a new style or color.",
    icon: "💇",
    unlockHint: "Change your hairstyle or hair color at the salon.",
  },
  {
    id: "board_equipped",
    name: "Ready to Glide",
    category: "fashion_style",
    description: "Equipped a board for savanna exploring.",
    icon: "🛹",
    unlockHint: "Equip a board from your wardrobe.",
  },
  {
    id: "wardrobe_five",
    name: "Style Starter",
    category: "fashion_style",
    description: "Collected five different wearable items.",
    icon: "👕",
    unlockHint: "Own five different wearable items.",
  },
  {
    id: "wardrobe_ten",
    name: "Savanna Stylist",
    category: "fashion_style",
    description: "Collected ten different wearable items.",
    icon: "👗",
    unlockHint: "Own ten different wearable items.",
  },
  {
    id: "custom_palette",
    name: "Color Creative",
    category: "fashion_style",
    description: "Tried a new hair color.",
    icon: "🎨",
    unlockHint: "Choose a hair color other than the starting espresso.",
  },
  {
    id: "status_quote",
    name: "Say It Your Way",
    category: "fashion_style",
    description: "Wrote a personal status quote.",
    icon: "💬",
    unlockHint: "Save your own status on your ID Card.",
  },
  {
    id: "hair_highlight",
    name: "A Streak of Style",
    category: "fashion_style",
    description: "Chose a highlight streak at the salon.",
    icon: "✨",
    unlockHint: "Confirm a salon look with a highlight streak selected.",
  },
  {
    id: "mango_run_pro",
    name: "Mango Run Pro",
    category: "arcade_mastery",
    description: "Scored at least 100 in Mango Run.",
    icon: "🏃",
    unlockHint: "Reach a Mango Run best score of 100.",
  },
  {
    id: "fruit_catch_pro",
    name: "Fruit Catch Pro",
    category: "arcade_mastery",
    description: "Scored at least 100 in Fruit Catch.",
    icon: "🍊",
    unlockHint: "Reach a Fruit Catch best score of 100.",
  },
  {
    id: "bee_stop_perfect",
    name: "Perfect Pollinator",
    category: "arcade_mastery",
    description: "Scored a perfect 1,000 in Bee Stop.",
    icon: "🐝",
    unlockHint: "Score 1,000 in one Bee Stop game.",
  },
  {
    id: "paw_steps_expert",
    name: "Paw Steps Expert",
    category: "arcade_mastery",
    description: "Finished ten rounds of Paw Steps.",
    icon: "🐾",
    unlockHint: "Complete ten rounds in one Paw Steps game.",
  },
  {
    id: "dj_beat_combo",
    name: "Combo Conductor",
    category: "arcade_mastery",
    description: "Built a sixteen-beat DJ combo.",
    icon: "🎧",
    unlockHint: "Reach a combo of 16 in DJ Beat Drop.",
  },
  {
    id: "smoothie_chef",
    name: "Smoothie Chef",
    category: "arcade_mastery",
    description: "Served five smoothie orders.",
    icon: "🥤",
    unlockHint: "Serve five orders in Smoothie Kitchen.",
  },
  {
    id: "memory_safari_master",
    name: "Memory Safari Master",
    category: "arcade_mastery",
    description: "Matched all six Memory Safari pairs.",
    icon: "🧠",
    unlockHint: "Complete all six pairs in Memory Safari.",
  },
];

export function isStampUnlocked(
  player: Player | PlayerV2,
  stampId: string,
): boolean {
  return (
    STAMP_DEFINITIONS.some((stamp) => stamp.id === stampId) &&
    (player.stamps?.includes(stampId) ?? false)
  );
}

/** Returns newly eligible stamps. Event-only achievements must use unlockStamp. */
export function evaluateStampUnlocks(player: Player | PlayerV2): string[] {
  const wearableIds = new Set([
    "scarf",
    "hat",
    "glasses",
    "flower",
    ...CATALOG_ITEMS.map((item) => item.id),
  ]);
  const wardrobeSize = new Set(player.owned.filter((id) => wearableIds.has(id)))
    .size;
  const look = player.look;
  const customHairColor =
    !!look &&
    look.hairColor.toLowerCase() !==
      DEFAULT_AVATAR_LOOK.hairColor.toLowerCase();
  const eligible: Record<string, boolean> = {
    catalog_barista: player.owned.includes("barista_apron"),
    catalog_visor: player.owned.includes("retro_neon_visor"),
    catalog_wreath: player.owned.includes("golden_mane_wreath"),
    catalog_pirate: player.owned.includes("eyepatch_cutlass"),
    secret_den: player.visited.includes("den"),
    salon_makeover:
      !!look && (look.hairId !== DEFAULT_AVATAR_LOOK.hairId || customHairColor),
    board_equipped: !!look?.boardId,
    wardrobe_five: wardrobeSize >= 5,
    wardrobe_ten: wardrobeSize >= 10,
    custom_palette: customHairColor,
    status_quote:
      "moodQuote" in player &&
      !!player.moodQuote.trim() &&
      player.moodQuote.trim() !== "Vibing in the savanna",
    mango_run_pro: (player.mangoRunBest ?? 0) >= 100,
    fruit_catch_pro: player.fruitCatchBest >= 100,
    bee_stop_perfect: player.beeStopBest === 1000,
    paw_steps_expert: player.pawStepsBest >= 10,
    smoothie_chef: (player.smoothiesServed ?? 0) >= 5,
  };
  return STAMP_DEFINITIONS.filter(
    (stamp) => eligible[stamp.id] && !isStampUnlocked(player, stamp.id),
  ).map((stamp) => stamp.id);
}
