/**
 * Gold, like Fantage: playing games and earning stamps pays gold, and gold
 * buys the pixel outfits, costumes, hairstyles and shoes. Basics stay free,
 * so nobody is ever stuck. Pure rules, no React or DOM.
 */
import { OUTFITS } from "../components/avatar/pixelOutfits.ts";
import { COSTUMES } from "../components/avatar/pixelCostumes.ts";
import { HAIR_KIT } from "../components/avatar/pixelHairKit.ts";
import { SHOE_KIT } from "../components/avatar/pixelShoeKit.ts";

export const STARTING_GOLD = 200;
export const GAME_GOLD = 10;
export const STAMP_GOLD = 25;
export const MAX_GOLD = 999_999;

export type PixelKind = "dress" | "costume" | "hair" | "shoe";

const IDS: Record<PixelKind, string[]> = {
  dress: Object.keys(OUTFITS),
  costume: COSTUMES.map((c) => c.id),
  hair: HAIR_KIT.map((h) => h.id),
  shoe: SHOE_KIT.map((s) => s.id),
};
/** How many of each kind are free, from the start of the list. */
const FREE: Record<PixelKind, number> = {
  dress: 16,
  costume: 0,
  hair: 12,
  shoe: 30,
};
const PRICE: Record<PixelKind, number> = {
  dress: 60,
  costume: 120,
  hair: 50,
  shoe: 25,
};

type Wallet = {
  owned: string[];
  gold?: number;
  gamesPlayed: number;
  stamps?: string[];
};

export const pixelKey = (kind: PixelKind, id: string) => `px:${kind}:${id}`;

/** Whether `id` is a saved ownership key for a real pixel item. */
export function isPixelOwnedId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const [px, kind, ...rest] = value.split(":");
  return (
    px === "px" &&
    Object.hasOwn(IDS, kind) &&
    IDS[kind as PixelKind].includes(rest.join(":"))
  );
}

/** Gold a piece costs; 0 when it is free. -1 for unknown ids. */
export function pixelPrice(kind: PixelKind, id: string): number {
  const index = IDS[kind].indexOf(id);
  if (index < 0) return -1;
  return index < FREE[kind] ? 0 : PRICE[kind];
}

export function goldOf(player: { gold?: number }): number {
  return player.gold ?? STARTING_GOLD;
}

export function ownsPixel(
  player: Pick<Wallet, "owned">,
  kind: PixelKind,
  id: string,
): boolean {
  return (
    pixelPrice(kind, id) === 0 || player.owned.includes(pixelKey(kind, id))
  );
}

/** Buys a piece once if the player has the gold; otherwise unchanged. */
export function buyPixel<T extends Wallet>(
  player: T,
  kind: PixelKind,
  id: string,
): T {
  const price = pixelPrice(kind, id);
  if (price <= 0 || ownsPixel(player, kind, id)) return player;
  const gold = goldOf(player);
  if (gold < price) return player;
  return {
    ...player,
    gold: gold - price,
    owned: [...player.owned, pixelKey(kind, id)],
  };
}

/** Gives a piece for free (today's outfit in the newspaper). */
export function giftPixel<T extends Wallet>(
  player: T,
  kind: PixelKind,
  id: string,
): T {
  if (pixelPrice(kind, id) < 0 || ownsPixel(player, kind, id)) return player;
  return { ...player, owned: [...player.owned, pixelKey(kind, id)] };
}

/** Pays for games finished and stamps earned between two save states. */
export function payGold<T extends Wallet>(previous: T, next: T): T {
  const games = Math.max(0, next.gamesPlayed - previous.gamesPlayed);
  const stamps = Math.max(
    0,
    (next.stamps?.length ?? 0) - (previous.stamps?.length ?? 0),
  );
  if (!games && !stamps) return next;
  return {
    ...next,
    gold: Math.min(
      MAX_GOLD,
      goldOf(next) + games * GAME_GOLD + stamps * STAMP_GOLD,
    ),
  };
}

/** A saved balance, or undefined when missing or broken (start fresh). */
export function restoreGold(value: unknown): number | undefined {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= MAX_GOLD
    ? value
    : undefined;
}
