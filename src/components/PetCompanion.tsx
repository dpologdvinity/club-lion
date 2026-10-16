import type { JSX } from "react";
import type { PetState } from "../types/world.ts";
import type { LionColor } from "../game.ts";

const LION_COLORS: readonly LionColor[] = ["gold", "sand", "copper", "rose"];
import { PET_PROFILES, restorePetSpecies } from "../utils/petSpecies.ts";
import { PetPicture } from "./PetSpeciesArt.tsx";

export function PetCompanion({
  pet,
  isTrotting,
  heading = "right",
  side = "right",
}: {
  pet: PetState;
  isTrotting: boolean;
  heading?: "left" | "right";
  /** Which side of the avatar the pet trails on; flips away from scenery. */
  side?: "left" | "right";
}): JSX.Element {
  const flip = heading === "left";
  const species = restorePetSpecies(pet.species);
  const validColor = LION_COLORS.find((color) => color === pet.color) ?? "gold";

  return (
    <div
      role="img"
      aria-label={`${pet.name} the pet ${PET_PROFILES[species].label.toLowerCase()}`}
      data-species={species}
      className={`pet-companion pet-companion-${pet.color} ${isTrotting ? "is-trotting" : "is-resting"}${side === "left" ? " pet-on-left" : ""}`}
      style={{
        width: 44,
        height: 44,
        display: "inline-block",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <PetPicture
        species={species}
        color={validColor}
        accessory={pet.accessory}
      />
    </div>
  );
}
