import {
  goldOf,
  ownsPixel,
  pixelPrice,
  type PixelKind,
} from "../utils/gold.ts";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { Dialog } from "./Dialog";
import { Avatar } from "./Avatar";
import {
  CATALOG_ITEMS,
  canWearClothing,
  type AvatarLook,
  type PlayerBase,
} from "../game";
import {
  BOTTOMS,
  SHOES,
  TOPS,
  resolveBottomId,
  resolveShoeId,
  resolveTopId,
  type ClothingOption,
} from "../types/avatarOptions.ts";
import { OUTFITS } from "./avatar/pixelOutfits.ts";
import { SHOE_KIT } from "./avatar/pixelShoeKit.ts";
import { COSTUMES } from "./avatar/pixelCostumes.ts";
import { PicturePicker } from "./PicturePicker";

type Tab = "dressId" | "costumeId" | "topId" | "bottomId" | "shoesId";

const NO_COSTUME = "none";
const COSTUME_OPTIONS = [{ id: NO_COSTUME, label: "No costume" }, ...COSTUMES];

const DRESSES = Object.entries(OUTFITS).map(([id, recipe]) => ({
  id,
  label: recipe.label,
}));

const TABS: {
  id: Exclude<Tab, "dressId" | "costumeId">;
  label: string;
  options: readonly ClothingOption[];
}[] = [
  { id: "topId", label: "Tops", options: TOPS },
  { id: "bottomId", label: "Bottoms", options: BOTTOMS },
  { id: "shoesId", label: "Shoes", options: SHOES },
];

export type ClosetOutfit = {
  topId: string;
  bottomId: string;
  shoesId: string;
  /** One-piece outfit worn over the top and bottoms; unset to show them. */
  dressId?: string;
  /** Pixel shoe kit pair worn instead of `shoesId`. */
  shoeKitId?: string;
  /** Costume worn over everything; unset for none. */
  costumeId?: string;
};

/** Mix-and-match closet: free basics plus anything bought in Le Shop. */
export function ClosetModal({
  player,
  onClose,
  onSave,
  onShop,
  onBuy,
}: {
  player: PlayerBase & { look: AvatarLook };
  onClose: () => void;
  onSave: (outfit: ClosetOutfit) => void;
  onShop: () => void;
  /** Spends gold on a pixel piece. */
  onBuy?: (kind: PixelKind, id: string) => void;
}) {
  const gold = goldOf(player);
  const priceFor =
    (kind: PixelKind, worn: string | undefined) => (id: string) =>
      id === worn || ownsPixel(player, kind, id)
        ? 0
        : Math.max(0, pixelPrice(kind, id));
  const [tab, setTab] = useState<Tab>("dressId");
  const [outfit, setOutfit] = useState<ClosetOutfit>({
    topId: resolveTopId(player.look),
    bottomId: resolveBottomId(player.look),
    shoesId: resolveShoeId(player.look),
    dressId: player.look.dressId,
    shoeKitId: player.look.shoeKitId,
    costumeId: player.look.costumeId,
  });
  const worn = {
    topId: resolveTopId(player.look),
    bottomId: resolveBottomId(player.look),
    shoesId: resolveShoeId(player.look),
  };
  const current = TABS.find((t) => t.id === tab);

  return (
    <Dialog
      title="My Closet"
      subtitle="Pick an outfit, or mix and match tops, bottoms, and shoes."
      onClose={onClose}
      wide
    >
      <div className="salon closet">
        <div className="salon-preview closet-preview" aria-hidden="true">
          <Avatar
            look={{ ...player.look, ...outfit }}
            size={160}
            framing="portrait"
          />
          <Avatar look={{ ...player.look, ...outfit }} size={84} />
        </div>
        <div className="salon-controls">
          <div
            className="catalog-tabs"
            role="group"
            aria-label="Closet section"
          >
            {[
              { id: "dressId" as const, label: "Outfits" },
              { id: "costumeId" as const, label: "Costumes" },
              ...TABS,
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                className={tab === t.id ? "selected" : ""}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "costumeId" && (
            <PicturePicker
              legend="Costumes"
              gold={gold}
              priceOf={(id) =>
                id === "none"
                  ? 0
                  : priceFor("costume", player.look.costumeId)(id)
              }
              onBuy={(id) => onBuy?.("costume", id)}
              options={COSTUME_OPTIONS}
              selected={outfit.costumeId ?? NO_COSTUME}
              pick={(id) =>
                setOutfit((o) => ({
                  ...o,
                  costumeId: id === NO_COSTUME ? undefined : id,
                }))
              }
              preview={(id) => ({
                ...player.look,
                ...outfit,
                costumeId: id === NO_COSTUME ? undefined : id,
              })}
            />
          )}

          {tab === "dressId" && (
            <PicturePicker
              legend="Outfits"
              gold={gold}
              priceOf={(id) =>
                id === "none" ? 0 : priceFor("dress", player.look.dressId)(id)
              }
              onBuy={(id) => onBuy?.("dress", id)}
              options={DRESSES}
              selected={outfit.dressId}
              pick={(dressId) => setOutfit((o) => ({ ...o, dressId }))}
              preview={(dressId) => ({ ...player.look, ...outfit, dressId })}
              framing="outfit"
            />
          )}

          {current?.id === "shoesId" && (
            <PicturePicker
              legend="Shoe rack"
              gold={gold}
              priceOf={(id) =>
                id === "none" ? 0 : priceFor("shoe", player.look.shoeKitId)(id)
              }
              onBuy={(id) => onBuy?.("shoe", id)}
              options={SHOE_KIT}
              selected={outfit.shoeKitId}
              pick={(shoeKitId) => setOutfit((o) => ({ ...o, shoeKitId }))}
              preview={(shoeKitId) => ({
                ...player.look,
                // Bare legs so long trousers never hide the shoes
                dressId: undefined,
                bottomId: "denim_mini",
                shoeKitId,
              })}
              framing="feet"
            />
          )}

          {current && current.id !== "shoesId" && (
            <PicturePicker
              legend={current.label}
              options={current.options.filter(
                // Secret pieces stay hidden until discovered or worn
                (option) =>
                  !CATALOG_ITEMS.some(
                    (item) => item.id === option.id && item.isSecret,
                  ) ||
                  player.owned.includes(option.id) ||
                  worn[current.id] === option.id,
              )}
              selected={outfit.dressId ? undefined : outfit[current.id]}
              locked={(id) => {
                const option = current.options.find((o) => o.id === id);
                return (
                  !!option &&
                  !canWearClothing(player, option) &&
                  worn[current.id] !== id
                );
              }}
              // A top or bottoms takes the one-piece off
              pick={(id) =>
                setOutfit((o) => ({
                  ...o,
                  [current.id]: id,
                  dressId: undefined,
                }))
              }
              preview={(id) => ({
                ...player.look,
                ...outfit,
                dressId: undefined,
                costumeId: undefined,
                [current.id]: id,
              })}
              framing="outfit"
            />
          )}

          {current?.id === "shoesId" && (
            <fieldset>
              <legend>{current.label}</legend>
              <div className="salon-options">
                {current.options
                  .filter(
                    // Secret pieces stay hidden until discovered or worn
                    (option) =>
                      !CATALOG_ITEMS.some(
                        (item) => item.id === option.id && item.isSecret,
                      ) ||
                      player.owned.includes(option.id) ||
                      worn[current.id] === option.id,
                  )
                  .map((option) => {
                    const wearable =
                      canWearClothing(player, option) ||
                      worn[current.id] === option.id;
                    const selected =
                      outfit[current.id] === option.id &&
                      !(current.id === "shoesId" && outfit.shoeKitId);
                    return (
                      <button
                        type="button"
                        key={option.id}
                        className={selected ? "selected" : ""}
                        aria-pressed={selected}
                        disabled={!wearable}
                        onClick={() =>
                          // A top or bottoms takes the one-piece off; shoes the kit pair
                          setOutfit((o) =>
                            current.id === "shoesId"
                              ? {
                                  ...o,
                                  shoesId: option.id,
                                  shoeKitId: undefined,
                                }
                              : {
                                  ...o,
                                  [current.id]: option.id,
                                  dressId: undefined,
                                },
                          )
                        }
                      >
                        {selected && <Check size={15} />}
                        {!wearable && (
                          <Lock size={13} aria-hidden="true" />
                        )}{" "}
                        {option.label}
                        {!wearable && (
                          <span className="sr-only"> — find it in Le Shop</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </fieldset>
          )}

          <div className="closet-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onShop}
            >
              Shop for more
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => onSave(outfit)}
            >
              <Check size={17} /> Wear this look
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
