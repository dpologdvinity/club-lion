import type { PlaceId } from "../game.ts";

// Picture badges for room travel. Pre-readers pick a room by its icon;
// the name stays as the button's text and accessible name.
export const PLACE_ICONS: Record<PlaceId, string> = {
  square: "🦁",
  water: "💧",
  cafe: "☕",
  arcade: "🕹️",
  den: "🛋️",
  "downtown-plaza": "⛲",
  "wonder-park-entrance": "🎡",
  "wonder-park-midway": "🎠",
  "club-pulse": "🎧",
  "splash-oasis-entry": "🌊",
  "splash-oasis-river": "🛶",
  "penthouse-condo": "🏙️",
  "secret-scout-base": "🕵️",
  "sunset-beach": "🌅",
  "coastal-pier": "🐚",
  "mt-mist": "🏔️",
  "canyon-rapids": "🏞️",
  "pet-paradise": "🐾",
  "lion-speedway": "🏁",
  "lion-aquarium": "🐠",
  "snowflake-rink": "⛸️",
};

export const SHOP_ICON = "🛍️";

export function isPlaceId(id: string): id is PlaceId {
  return Object.hasOwn(PLACE_ICONS, id);
}

// Portals to Le Shop open the catalog rather than a room.
export function portalIcon(targetRoomId: string): string {
  if (targetRoomId === "le-shop") return SHOP_ICON;
  return isPlaceId(targetRoomId) ? PLACE_ICONS[targetRoomId] : "🚪";
}
