import type { Player, PlayerV2 } from "../game.ts";
import {
  CATALOG_ITEMS,
  DEFAULT_AVATAR_LOOK,
  resolveHairStyle,
} from "../types/world.ts";

import { STAMP_DEFINITIONS } from "../stamps/catalog.ts";
export { STAMP_DEFINITIONS } from "../stamps/catalog.ts";
export type { StampCategory, StampDefinition } from "../stamps/catalog.ts";

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
      !!look &&
      (resolveHairStyle(look.hairId) !==
        resolveHairStyle(DEFAULT_AVATAR_LOOK.hairId) ||
        customHairColor),
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
    coloring_first_page: (player.coloringBook?.finished.length ?? 0) > 0,
    bee_stop_perfect: player.beeStopBest === 1000,
    paw_steps_expert: player.pawStepsBest >= 10,
    smoothie_chef: (player.smoothiesServed ?? 0) >= 5,
    sled_champion: (player.sledRunBest ?? 0) >= 50,
    river_surf_pro: (player.riverSurfBest ?? 0) >= 30,
    kart_first_race: (player.kartRacesFinished ?? 0) >= 1,
  };
  return STAMP_DEFINITIONS.filter(
    (stamp) => eligible[stamp.id] && !isStampUnlocked(player, stamp.id),
  ).map((stamp) => stamp.id);
}
