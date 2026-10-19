import { Check, Lock } from "lucide-react";
import { Avatar } from "./Avatar";
import type { AvatarLook } from "../types/world.ts";

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
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="picture-options">
        {options.map((option) => {
          const price = priceOf?.(option.id) ?? 0;
          const short = price > gold;
          const label =
            price > 0
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
              disabled={short}
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
              {price > 0 && (
                <span className="picture-price" aria-hidden="true">
                  {short && <Lock size={11} />} 🪙 {price}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
