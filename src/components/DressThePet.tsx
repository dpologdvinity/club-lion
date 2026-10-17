import { useState } from "react";
import { Play, Sparkles, Star } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import { speak } from "../utils/speech.ts";
import {
  PET_ITEMS,
  PET_SLOTS,
  pickTheme,
  scoreOutfit,
  type PetOutfit,
  type PetSlot,
  type PetTheme,
} from "../utils/dressPet.ts";
import {
  PET_PROFILES,
  PET_SPECIES_ORDER,
  type PetSpecies,
} from "../utils/petSpecies.ts";
import { PetPicture } from "./PetSpeciesArt";
import "./dressThePet.css";

const SLOT_LABELS: Record<PetSlot, string> = {
  hat: "Hats",
  eyes: "Eyes",
  neck: "Neck",
  extra: "Extras",
};
const SLOT_ICONS: Record<PetSlot, string> = {
  hat: "🎩",
  eyes: "🕶️",
  neck: "🎀",
  extra: "🎈",
};
const CHEERS = ["Cute!", "So stylish!", "Perfect look!"];

/** Dress any pet for a theme card, then show it off for stars. Every look gets one. */
export function DressThePet({
  species: startSpecies,
  onShow,
}: {
  species: PetSpecies;
  /** Called once per finished show. */
  onShow: (theme: PetTheme["id"], outfit: PetOutfit) => void;
}) {
  const [species, setSpecies] = useState<PetSpecies>(startSpecies);
  const [theme, setTheme] = useState<PetTheme>(() => pickTheme(null));
  const [slot, setSlot] = useState<PetSlot>("hat");
  const [outfit, setOutfit] = useState<PetOutfit>({});
  const [stars, setStars] = useState<1 | 2 | 3 | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const wear = (id: string, label: string) => {
    if (stars) return;
    playCuteSound("pop");
    setOutfit((now) => {
      const next = { ...now };
      if (next[slot] === id) delete next[slot];
      else next[slot] = id;
      return next;
    });
    setAnnouncement(`${label} ${outfit[slot] === id ? "off" : "on"}.`);
  };

  const show = () => {
    if (stars || Object.keys(outfit).length === 0) return;
    const score = scoreOutfit(theme.id, outfit);
    setStars(score);
    playCuteSound("yay");
    onShow(theme.id, outfit);
    const cheer = CHEERS[score - 1];
    setAnnouncement(`${cheer} ${score} stars.`);
    speak(cheer);
  };

  const next = () => {
    setTheme(pickTheme(theme.id));
    setOutfit({});
    setStars(null);
    setSlot("hat");
  };

  return (
    <div className="dresspet-game">
      <p className="dresspet-theme">
        <span aria-hidden="true">{theme.emoji}</span> {theme.label}!
      </p>
      <div className="dresspet-stage">
        <div className="dresspet-pet" data-species={species}>
          <PetPicture species={species} className="dresspet-art" />
          {PET_SLOTS.map((wornSlot) => {
            const item = PET_ITEMS.find((i) => i.id === outfit[wornSlot]);
            return item ? (
              <span
                key={wornSlot}
                className={`dresspet-worn dresspet-worn-${wornSlot}`}
                aria-hidden="true"
              >
                {item.emoji}
              </span>
            ) : null;
          })}
        </div>
        {stars && (
          <div className="dresspet-overlay">
            <p className="dresspet-cheer">{CHEERS[stars - 1]}</p>
            <p
              className="dresspet-stars"
              role="img"
              aria-label={`${stars} stars`}
              data-stars={stars}
            >
              {Array.from({ length: 3 }, (_, index) => (
                <Star
                  key={index}
                  size={40}
                  aria-hidden="true"
                  fill={index < stars ? "currentColor" : "none"}
                />
              ))}
            </p>
            <button
              type="button"
              className="dresspet-next"
              autoFocus
              aria-label="New theme"
              onClick={next}
            >
              <Play size={30} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div className="dresspet-species" role="group" aria-label="Pick a pet">
        {PET_SPECIES_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={species === id}
            aria-label={PET_PROFILES[id].label}
            onClick={() => setSpecies(id)}
          >
            <PetPicture species={id} className="dresspet-chip-art" />
          </button>
        ))}
      </div>
      <div className="dresspet-slots" role="group" aria-label="Clothes">
        {PET_SLOTS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={slot === id}
            onClick={() => setSlot(id)}
          >
            <span aria-hidden="true">{SLOT_ICONS[id]}</span> {SLOT_LABELS[id]}
          </button>
        ))}
      </div>
      <div
        className="dresspet-items"
        role="group"
        aria-label={SLOT_LABELS[slot]}
      >
        {PET_ITEMS.filter((item) => item.slot === slot).map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={outfit[slot] === item.id}
            aria-label={`Wear the ${item.label}`}
            onClick={() => wear(item.id, item.label)}
          >
            <span aria-hidden="true">{item.emoji}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="dresspet-show"
        disabled={Object.keys(outfit).length === 0 || stars !== null}
        onClick={show}
      >
        <Sparkles size={24} aria-hidden="true" /> Show time!
      </button>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
