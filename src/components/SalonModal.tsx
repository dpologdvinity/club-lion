import { goldOf, ownsPixel, pixelPrice } from "../utils/gold.ts";
import { useState } from "react";
import { Check } from "lucide-react";
import { PicturePicker } from "./PicturePicker";
import { HAIR_KIT } from "./avatar/pixelHairKit.ts";
import { Dialog } from "./Dialog";
import { Avatar } from "./Avatar";
import { type AvatarLook, type PlayerBase } from "../game";
import { resolveHairStyle } from "../types/world.ts";
import {
  BANGS_OPTIONS,
  BLUSHES,
  EYE_COLORS,
  EYE_LOOKS,
  EYESHADOWS,
  FACE_DETAILS,
  HAIR_COLORS,
  HAIR_STREAKS,
  HAIR_STYLE_OPTIONS,
  JEWELRY,
  NECKLACES,
  HAIR_CLIPS,
  BRACELETS,
  BAGS,
  LIP_COLORS,
  PIERCINGS,
  SKIN_TONE_OPTIONS,
  type SalonCategory,
  type StyleOption,
} from "../types/avatarOptions.ts";

type Tab = "hair" | "face" | "bling";

type Swatch = StyleOption & { hex?: string; iris?: readonly string[] };

export function SalonModal({
  player,
  onBuy,
  onClose,
  onSave,
}: {
  player: PlayerBase & { look: AvatarLook };
  onClose: () => void;
  onSave: (look: AvatarLook) => void;
  /** Spends gold on a hairstyle. */
  onBuy?: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("hair");
  const [draft, setDraft] = useState<AvatarLook>({
    ...player.look,
    hairId: resolveHairStyle(player.look.hairId),
  });
  const update = (patch: Partial<AvatarLook>) =>
    setDraft((current) => ({ ...current, ...patch }));

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
      subtitle="Glam up your hair, makeup, piercings, and bling. Inclusive looks for everyone!"
      onClose={onClose}
      wide
    >
      <div className="salon">
        <div className="salon-preview" aria-hidden="true">
          <Avatar look={draft} size={160} framing="portrait" />
        </div>
        <div className="salon-controls">
          <div className="catalog-tabs" role="group" aria-label="Salon menu">
            <button
              type="button"
              className={tab === "hair" ? "selected" : ""}
              aria-pressed={tab === "hair"}
              onClick={() => setTab("hair")}
            >
              Hair & Bangs
            </button>
            <button
              type="button"
              className={tab === "face" ? "selected" : ""}
              aria-pressed={tab === "face"}
              onClick={() => setTab("face")}
            >
              Face & Makeup
            </button>
            <button
              type="button"
              className={tab === "bling" ? "selected" : ""}
              aria-pressed={tab === "bling"}
              onClick={() => setTab("bling")}
            >
              Bling & Piercings
            </button>
          </div>

          {tab === "hair" && (
            <>
              <PicturePicker
                legend="Hairstyle"
                options={HAIR_KIT}
                selected={draft.hairKitId}
                pick={(hairKitId) => update({ hairKitId })}
                gold={goldOf(player)}
                priceOf={(id) =>
                  id === player.look.hairKitId || ownsPixel(player, "hair", id)
                    ? 0
                    : Math.max(0, pixelPrice("hair", id))
                }
                onBuy={(id) => onBuy?.(id)}
                preview={(hairKitId) => ({ ...draft, hairKitId })}
                framing="portrait"
              />
              {pills(
                "Dye-it-yourself styles",
                "hair",
                HAIR_STYLE_OPTIONS,
                draft.hairKitId ? undefined : draft.hairId,
                (hairId) => update({ hairId, hairKitId: undefined }),
              )}
              {!draft.hairKitId &&
                pills(
                  "Bangs & Fringe",
                  "bangs",
                  BANGS_OPTIONS,
                  draft.bangsId ?? "none",
                  (bangsId) => update({ bangsId }),
                )}
              {!draft.hairKitId &&
                swatches("Base color", null, HAIR_COLORS, hairColorId, (id) =>
                  update({
                    hairColor:
                      HAIR_COLORS.find((c) => c.id === id)?.hex ??
                      draft.hairColor,
                  }),
                )}
              {!draft.hairKitId &&
                swatches(
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
          )}

          {tab === "face" && (
            <>
              {swatches(
                "Skin tone",
                "skin",
                SKIN_TONE_OPTIONS,
                draft.skinTone,
                (skinTone) => update({ skinTone }),
              )}
              {pills(
                "Eye look & Eyeliner",
                "eye",
                EYE_LOOKS,
                draft.eyeStyle,
                (eyeStyle) => update({ eyeStyle }),
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
              {swatches(
                "Lips & Gloss",
                "lip",
                LIP_COLORS,
                draft.lipId,
                (lipId) => update({ lipId }),
              )}
              {swatches("Blush", null, BLUSHES, draft.blushId, (blushId) =>
                update({ blushId }),
              )}
              {pills(
                "Freckles & Beauty Marks",
                "face",
                FACE_DETAILS,
                draft.faceDetailId ?? "none",
                (faceDetailId) => update({ faceDetailId }),
              )}
            </>
          )}

          {tab === "bling" && (
            <>
              {pills(
                "Piercings",
                "piercing",
                PIERCINGS,
                draft.piercingId ?? "none",
                (piercingId) => update({ piercingId }),
              )}
              {pills(
                "Jewelry & Earrings",
                "jewelry",
                JEWELRY,
                draft.jewelryId ?? "oversized_gold_hoops",
                (jewelryId) => update({ jewelryId }),
              )}
              {pills(
                "Necklaces & Chokers",
                "necklace",
                NECKLACES,
                draft.necklaceId ?? "none",
                (necklaceId) => update({ necklaceId }),
              )}
              {pills(
                "Hair Clips",
                "clips",
                HAIR_CLIPS,
                draft.hairClipId ?? "none",
                (hairClipId) => update({ hairClipId }),
              )}
              {pills(
                "Bangles",
                "bracelet",
                BRACELETS,
                draft.braceletId ?? "none",
                (braceletId) => update({ braceletId }),
              )}
              {pills("Bags", "bag", BAGS, draft.bagId ?? "none", (bagId) =>
                update({ bagId }),
              )}
            </>
          )}

          <button
            type="button"
            className="button button-primary"
            onClick={() => onSave(draft)}
          >
            <Check size={17} /> Confirm new look
          </button>
        </div>
      </div>
    </Dialog>
  );
}
