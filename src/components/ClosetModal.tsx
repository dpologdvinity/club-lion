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

type Tab = "topId" | "bottomId" | "shoesId";

const TABS: { id: Tab; label: string; options: readonly ClothingOption[] }[] = [
  { id: "topId", label: "Tops", options: TOPS },
  { id: "bottomId", label: "Bottoms", options: BOTTOMS },
  { id: "shoesId", label: "Shoes", options: SHOES },
];

export type ClosetOutfit = { topId: string; bottomId: string; shoesId: string };

/** Mix-and-match closet: free basics plus anything bought in Le Shop. */
export function ClosetModal({
  player,
  onClose,
  onSave,
  onShop,
}: {
  player: PlayerBase & { look: AvatarLook };
  onClose: () => void;
  onSave: (outfit: ClosetOutfit) => void;
  onShop: () => void;
}) {
  const [tab, setTab] = useState<Tab>("topId");
  const [outfit, setOutfit] = useState<ClosetOutfit>({
    topId: resolveTopId(player.look),
    bottomId: resolveBottomId(player.look),
    shoesId: resolveShoeId(player.look),
  });
  const worn = {
    topId: resolveTopId(player.look),
    bottomId: resolveBottomId(player.look),
    shoesId: resolveShoeId(player.look),
  };
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <Dialog
      title="My Closet"
      subtitle="Mix and match tops, bottoms, and shoes."
      onClose={onClose}
      wide
    >
      <div className="salon closet">
        <div className="salon-preview" aria-hidden="true">
          <Avatar look={{ ...player.look, ...outfit }} size={132} />
        </div>
        <div className="salon-controls">
          <div
            className="catalog-tabs"
            role="group"
            aria-label="Closet section"
          >
            {TABS.map((t) => (
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
                    worn[tab] === option.id,
                )
                .map((option) => {
                  const wearable =
                    canWearClothing(player, option) || worn[tab] === option.id;
                  const selected = outfit[tab] === option.id;
                  const price = CATALOG_ITEMS.find(
                    (item) => item.id === option.id,
                  )?.price;
                  return (
                    <button
                      type="button"
                      key={option.id}
                      className={selected ? "selected" : ""}
                      aria-pressed={selected}
                      disabled={!wearable}
                      onClick={() =>
                        setOutfit((o) => ({ ...o, [tab]: option.id }))
                      }
                    >
                      {selected && <Check size={15} />}
                      {!wearable && <Lock size={13} aria-hidden="true" />}{" "}
                      {option.label}
                      {!wearable && price !== undefined && (
                        <span className="salon-price">
                          <span className="sr-only"> — in Le Shop for</span> ✦
                          {price}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </fieldset>

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
