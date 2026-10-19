import { useState } from "react";
import { Check, ChevronDown, Lock } from "lucide-react";
import { Avatar } from "./Avatar";
import type { AvatarLook } from "../types/world.ts";

const PAGE = 48;

/** Picture-first picker: each choice shows the doll wearing it. */
export function PicturePicker({
  legend,
  options,
  selected,
  pick,
  preview,
  framing = "full",
  priceOf,
  gold = 0,
  onBuy,
  locked,
}: {
  legend: string;
  options: readonly { id: string; label: string }[];
  selected: string | undefined;
  pick: (id: string) => void;
  preview: (id: string) => AvatarLook;
  framing?: "full" | "portrait" | "outfit" | "feet";
  /** Gold still needed for a choice: 0 when free or already owned. */
  priceOf?: (id: string) => number;
  gold?: number;
  /** Buys a priced choice; called before it is picked. */
  onBuy?: (id: string) => void;
  /** Choices found elsewhere (Le Shop): shown locked, not picked here. */
  locked?: (id: string) => boolean;
}) {
  // Hundreds of doll tiles are slow on tablets: show a page at a time
  const [shown, setShown] = useState(PAGE);
  const count = Math.max(
    shown,
    options.findIndex((option) => option.id === selected) + 1,
  );
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="picture-options">
        {options.slice(0, count).map((option) => {
          const price = priceOf?.(option.id) ?? 0;
          const short = price > gold;
          const shopOnly = locked?.(option.id) ?? false;
          const label = shopOnly
            ? `${option.label} — find it in Le Shop`
            : price > 0
              ? short
                ? `${option.label}, costs ${price} gold`
                : `Buy ${option.label} for ${price} gold`
              : option.label;
          return (
            <button
              type="button"
              key={option.id}
              className={`${selected === option.id ? "selected" : ""}${price > 0 ? " is-priced" : ""}`}
              aria-pressed={selected === option.id}
              aria-label={label}
              title={label}
              disabled={short || shopOnly}
              onClick={() => {
                if (price > 0) onBuy?.(option.id);
                pick(option.id);
              }}
            >
              <Avatar
                look={preview(option.id)}
                size={framing === "portrait" ? 64 : 54}
                framing={framing}
                aria-hidden="true"
              />
              {selected === option.id && (
                <Check className="picture-check" size={16} />
              )}
              {shopOnly && (
                <span className="picture-price" aria-hidden="true">
                  <Lock size={11} /> Shop
                </span>
              )}
              {price > 0 && (
                <span className="picture-price" aria-hidden="true">
                  {short && <Lock size={11} />} 🪙 {price}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {count < options.length && (
        <button
          type="button"
          className="button button-secondary picture-more"
          onClick={() => setShown(count + PAGE)}
        >
          <ChevronDown size={18} aria-hidden="true" /> More{" "}
          {legend.toLowerCase()}
        </button>
      )}
    </fieldset>
  );
}
