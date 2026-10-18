import { Check } from "lucide-react";
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
}: {
  legend: string;
  options: readonly { id: string; label: string }[];
  selected: string | undefined;
  pick: (id: string) => void;
  preview: (id: string) => AvatarLook;
  framing?: "full" | "portrait" | "outfit" | "feet";
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="picture-options">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={selected === option.id ? "selected" : ""}
            aria-pressed={selected === option.id}
            aria-label={option.label}
            title={option.label}
            onClick={() => pick(option.id)}
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
          </button>
        ))}
      </div>
    </fieldset>
  );
}
