import { useState } from "react";
import { Check } from "lucide-react";
import { Dialog } from "./Dialog";
import { Avatar } from "./Avatar";
import { Coin } from "./Lion";
import {
  premiumIdsForLook,
  salonLookCost,
  type AvatarLook,
  type PlayerBase,
} from "../game";
import { resolveHairStyle } from "../types/world.ts";
import {
  BLUSHES,
  EYE_COLORS,
  EYE_LOOKS,
  EYESHADOWS,
  FACE_DETAILS,
  HAIR_COLORS,
  HAIR_STREAKS,
  HAIR_STYLE_OPTIONS,
  LIP_COLORS,
  premiumId,
  type SalonCategory,
  type StyleOption,
} from "../types/avatarOptions.ts";

type Tab = "hair" | "makeup";

type Swatch = StyleOption & { hex?: string; iris?: readonly string[] };

export function SalonModal({
  player,
  onClose,
  onSave,
}: {
  player: PlayerBase & { look: AvatarLook };
  onClose: () => void;
  onSave: (look: AvatarLook) => void;
}) {
  const [tab, setTab] = useState<Tab>("hair");
  const [draft, setDraft] = useState<AvatarLook>({
    ...player.look,
    hairId: resolveHairStyle(player.look.hairId),
  });
  const cost = salonLookCost(player, draft);
  const affordable = player.coins >= cost;
  const newUnlocks = premiumIdsForLook(draft).filter(
    (id) => !player.owned.includes(id),
  ).length;

  const update = (patch: Partial<AvatarLook>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const priceTag = (category: SalonCategory, option: StyleOption) =>
    option.price !== undefined &&
    !player.owned.includes(premiumId(category, option.id)) ? (
      <span className="salon-price">
        <span className="sr-only"> premium, </span>✦{option.price}
        <span className="sr-only"> coins</span>
      </span>
    ) : null;

  const pills = (
    legend: string,
    category: SalonCategory | null,
    options: readonly StyleOption[],
    selected: string | undefined,
    pick: (id: string) => void,
  ) => (
    <fieldset>
      <legend>{legend}</legend>
      <div className="salon-options">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={selected === option.id ? "selected" : ""}
            aria-pressed={selected === option.id}
            onClick={() => pick(option.id)}
          >
            {selected === option.id && <Check size={15} />} {option.label}
            {category && priceTag(category, option)}
          </button>
        ))}
      </div>
    </fieldset>
  );

  const swatches = (
    legend: string,
    category: SalonCategory | null,
    options: readonly Swatch[],
    selected: string | undefined,
    pick: (id: string) => void,
  ) => (
    <fieldset>
      <legend>{legend}</legend>
      <div className="color-options salon-swatches">
        {options.map((option) => {
          const fill = option.iris
            ? `radial-gradient(circle, ${option.iris[0]}, ${option.iris[1]} 55%, ${option.iris[2]})`
            : option.hex || "transparent";
          return (
            <button
              type="button"
              key={option.id}
              className={`color-option ${selected === option.id ? "selected" : ""}`}
              aria-pressed={selected === option.id}
              onClick={() => pick(option.id)}
            >
              <span style={{ background: fill }}>
                {selected === option.id && <Check size={17} />}
              </span>
              <small>{option.label}</small>
              {category && priceTag(category, option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  const hairColorId = HAIR_COLORS.find(
    (c) => c.hex.toLowerCase() === draft.hairColor.toLowerCase(),
  )?.id;
  const streakId =
    HAIR_STREAKS.find((s) => s.hex && s.hex === draft.hairStreak)?.id ?? "none";

  return (
    <Dialog
      title="Stella's Salon"
      subtitle="Glam up your hair and makeup. Premium looks unlock with coins."
      onClose={onClose}
      wide
    >
      <div className="salon">
        <div className="salon-preview" aria-hidden="true">
          <Avatar look={draft} size={132} />
        </div>
        <div className="salon-controls">
          <div className="catalog-tabs" role="group" aria-label="Salon menu">
            <button
              type="button"
              className={tab === "hair" ? "selected" : ""}
              aria-pressed={tab === "hair"}
              onClick={() => setTab("hair")}
            >
              Hair
            </button>
            <button
              type="button"
              className={tab === "makeup" ? "selected" : ""}
              aria-pressed={tab === "makeup"}
              onClick={() => setTab("makeup")}
            >
              Makeup
            </button>
          </div>

          {tab === "hair" ? (
            <>
              {pills(
                "Hairstyle",
                "hair",
                HAIR_STYLE_OPTIONS,
                draft.hairId,
                (hairId) => update({ hairId }),
              )}
              {swatches("Base color", null, HAIR_COLORS, hairColorId, (id) =>
                update({
                  hairColor:
                    HAIR_COLORS.find((c) => c.id === id)?.hex ??
                    draft.hairColor,
                }),
              )}
              {swatches(
                "Highlight streak",
                null,
                HAIR_STREAKS,
                streakId,
                (id) =>
                  update({
                    hairStreak:
                      HAIR_STREAKS.find((s) => s.id === id)?.hex || undefined,
                  }),
              )}
            </>
          ) : (
            <>
              {pills("Eye look", "eye", EYE_LOOKS, draft.eyeStyle, (eyeStyle) =>
                update({ eyeStyle }),
              )}
              {swatches(
                "Eyeshadow",
                "shadow",
                EYESHADOWS,
                draft.eyeshadowId,
                (eyeshadowId) => update({ eyeshadowId }),
              )}
              {swatches(
                "Eye color",
                "iris",
                EYE_COLORS,
                draft.eyeColorId,
                (eyeColorId) => update({ eyeColorId }),
              )}
              {swatches("Lips", "lip", LIP_COLORS, draft.lipId, (lipId) =>
                update({ lipId }),
              )}
              {swatches("Blush", null, BLUSHES, draft.blushId, (blushId) =>
                update({ blushId }),
              )}
              {pills(
                "Face sparkle",
                "face",
                FACE_DETAILS,
                draft.faceDetailId ?? "none",
                (faceDetailId) => update({ faceDetailId }),
              )}
            </>
          )}

          {cost > 0 && (
            <p className="salon-cost" role="status">
              {newUnlocks === 1
                ? "1 premium look"
                : `${newUnlocks} premium looks`}{" "}
              to unlock: <Coin amount={cost} />
              {!affordable && " (not enough coins yet)"}
            </p>
          )}

          <button
            type="button"
            className="button button-primary"
            disabled={!affordable}
            onClick={() => onSave(draft)}
          >
            <Check size={17} /> Confirm new look
          </button>
        </div>
      </div>
    </Dialog>
  );
}
