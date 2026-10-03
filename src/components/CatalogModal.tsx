import { useRef, useState } from "react";
import { Check, Coffee, Leaf, Star } from "lucide-react";
import { Dialog } from "./Dialog";
import { Coin } from "./Lion";
import { CATALOG_ITEMS, type EquipSlot, type PlayerBase } from "../game";

const SLOT_TABS: { id: EquipSlot; label: string }[] = [
  { id: "top_outer", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "shoes", label: "Shoes" },
  { id: "headwear", label: "Headwear" },
  { id: "board", label: "Boards" },
  { id: "handheld", label: "Handheld" },
];

function playChime() {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioContextClass();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

export function CatalogModal({
  player,
  onClose,
  onBuy,
  onEquip,
  onUnlockSecret,
}: {
  player: PlayerBase;
  onClose: () => void;
  onBuy: (id: string) => void;
  onEquip: (id: string, slot: EquipSlot) => void;
  onUnlockSecret: (secretId: string) => void;
}) {
  const [slot, setSlot] = useState<EquipSlot>("top_outer");
  const triggered = useRef<Set<string>>(new Set());

  const fireSecret = (secretId: string) => {
    if (triggered.current.has(secretId)) return;
    triggered.current.add(secretId);
    playChime();
    onUnlockSecret(secretId);
  };

  const items = CATALOG_ITEMS.filter(
    (item) =>
      item.slot === slot && (!item.isSecret || player.owned.includes(item.id)),
  );

  return (
    <Dialog
      title="Le Shop Catalog"
      subtitle="Flip through the latest fashion drops."
      onClose={onClose}
      wide
    >
      <div className="catalog">
        <div
          className="catalog-tabs"
          role="group"
          aria-label="Catalog category"
        >
          {SLOT_TABS.map((t) => (
            <button
              key={t.id}
              className={slot === t.id ? "selected" : ""}
              aria-pressed={slot === t.id}
              onClick={() => setSlot(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="catalog-page">
          <div className="catalog-secret-hotspots" aria-hidden="false">
            <button
              type="button"
              className="catalog-hotspot catalog-hotspot-steam"
              aria-label="A wisp of coffee steam"
              onClick={() => fireSecret("coffee_steam")}
            >
              <Coffee size={14} />
            </button>
            <button
              type="button"
              className="catalog-hotspot catalog-hotspot-star"
              aria-label="A sparkly star on a price tag"
              onClick={() => fireSecret("price_tag_star")}
            >
              <Star size={14} />
            </button>
            <button
              type="button"
              className="catalog-hotspot catalog-hotspot-leaf"
              aria-label="A hidden baobab leaf tucked in the corner"
              onClick={() => fireSecret("hidden_leaf")}
            >
              <Leaf size={14} />
            </button>
          </div>

          <div className="catalog-grid">
            {items.map((item) => {
              const owned = player.owned.includes(item.id);
              return (
                <article className="catalog-item" key={item.id}>
                  <h3>{item.name}</h3>
                  <p className="catalog-item-slot">{item.slot}</p>
                  {item.description && <p>{item.description}</p>}
                  {owned && (
                    <span className="owned-badge">
                      <Check size={11} /> Yours
                    </span>
                  )}
                  <button
                    className={`button ${owned ? "button-secondary" : "button-primary"}`}
                    disabled={!owned && player.coins < item.price}
                    onClick={() =>
                      owned ? onEquip(item.id, item.slot) : onBuy(item.id)
                    }
                  >
                    {owned ? (
                      "Equip"
                    ) : item.price === 0 ? (
                      "Claim it"
                    ) : (
                      <>
                        <Coin amount={item.price} /> Buy
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
