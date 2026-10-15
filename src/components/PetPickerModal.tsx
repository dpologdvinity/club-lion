import type { LionColor } from "../game.ts";
import {
  PET_PROFILES,
  PET_SPECIES_ORDER,
  type PetSpecies,
} from "../utils/petSpecies.ts";
import { Dialog } from "./Dialog.tsx";
import { PetPicture } from "./PetSpeciesArt.tsx";

export function PetPickerModal({
  species,
  color,
  onPick,
  onClose,
}: {
  species: PetSpecies;
  color: LionColor;
  onPick: (species: PetSpecies) => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      title="Pick your pet"
      subtitle="Tap a friend to follow you around"
      onClose={onClose}
      wide
    >
      <div className="pet-picker" role="group" aria-label="Pet species">
        {PET_SPECIES_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className="pet-tile"
            aria-pressed={id === species}
            onClick={() => onPick(id)}
          >
            <span className="pet-tile-art" aria-hidden="true">
              <PetPicture species={id} color={color} />
            </span>
            <span className="pet-tile-label">{PET_PROFILES[id].label}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
