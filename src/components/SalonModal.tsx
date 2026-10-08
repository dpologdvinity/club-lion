import { useState } from "react";
import { Check } from "lucide-react";
import { Dialog } from "./Dialog";
import type { AvatarLook } from "../game";
import { resolveHairStyle } from "../types/world.ts";

const HAIR_STYLES = [
  { id: "blowout", label: "Y2K Blowout" },
  { id: "high_pony", label: "Sleek High Pony" },
  { id: "butterfly_waves", label: "Butterfly Waves" },
  { id: "box_braids", label: "Beaded Box Braids" },
  { id: "blunt_bob", label: "Glossy Blunt Bob" },
  { id: "space_buns", label: "Spiky Space Buns" },
];

const HAIR_COLORS = [
  { id: "espresso", label: "Espresso", hex: "#4a3728" },
  { id: "blonde", label: "Blonde", hex: "#e67e22" },
  { id: "rose_pink", label: "Rose Pink", hex: "#ff7675" },
  { id: "lavender", label: "Lavender", hex: "#a29bfe" },
  { id: "chestnut", label: "Chestnut", hex: "#784421" },
];

const STREAK_DYES = [
  { id: "neon_blue", label: "Neon Blue", hex: "#00f0ff" },
  { id: "sunset_orange", label: "Sunset Orange", hex: "#ff7675" },
  { id: "mint_green", label: "Mint Green", hex: "#2ecc71" },
  { id: "none", label: "None", hex: "" },
];

export function SalonModal({
  look,
  onClose,
  onSave,
}: {
  look: AvatarLook;
  onClose: () => void;
  onSave: (hairId: string, hairColor: string, streakDye: string) => void;
}) {
  const [hairId, setHairId] = useState<string>(resolveHairStyle(look.hairId));
  const [hairColor, setHairColor] = useState(
    HAIR_COLORS.find((c) => c.hex === look.hairColor)?.id ?? "espresso",
  );
  const [streakDye, setStreakDye] = useState("none");

  return (
    <Dialog
      title="Stella's Salon"
      subtitle="Pick a style, a color, and a streak."
      onClose={onClose}
    >
      <div className="salon">
        <fieldset>
          <legend>Hairstyle</legend>
          <div className="salon-options">
            {HAIR_STYLES.map((style) => (
              <button
                type="button"
                key={style.id}
                className={hairId === style.id ? "selected" : ""}
                aria-pressed={hairId === style.id}
                onClick={() => setHairId(style.id)}
              >
                {hairId === style.id && <Check size={15} />} {style.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Base color</legend>
          <div className="color-options">
            {HAIR_COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`color-option ${hairColor === c.id ? "selected" : ""}`}
                aria-pressed={hairColor === c.id}
                onClick={() => setHairColor(c.id)}
              >
                <span style={{ background: c.hex }}>
                  {hairColor === c.id && <Check size={17} />}
                </span>
                <small>{c.label}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Highlight streak</legend>
          <div className="color-options">
            {STREAK_DYES.map((d) => (
              <button
                type="button"
                key={d.id}
                className={`color-option ${streakDye === d.id ? "selected" : ""}`}
                aria-pressed={streakDye === d.id}
                onClick={() => setStreakDye(d.id)}
              >
                <span style={{ background: d.hex || "transparent" }}>
                  {streakDye === d.id && <Check size={17} />}
                </span>
                <small>{d.label}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            const hex =
              HAIR_COLORS.find((c) => c.id === hairColor)?.hex ??
              look.hairColor;
            onSave(hairId, hex, streakDye);
          }}
        >
          <Check size={17} /> Confirm new look
        </button>
      </div>
    </Dialog>
  );
}
