import type { JSX } from "react";
import type { PetState } from "../types/world.ts";
import type { LionColor } from "../game.ts";
import { Lion } from "./Lion.tsx";

export function PetCompanion({
  pet,
  isTrotting,
  heading = "right",
}: {
  pet: PetState;
  isTrotting: boolean;
  heading?: "left" | "right";
}): JSX.Element {
  const flip = heading === "left";
  const validColor: LionColor = ["gold", "sand", "copper", "rose"].includes(
    pet.color,
  )
    ? (pet.color as LionColor)
    : "gold";

  return (
    <div
      role="img"
      aria-label={`${pet.name} the pet lion`}
      className={`pet-companion pet-companion-${pet.color} ${isTrotting ? "is-trotting" : "is-resting"}`}
      style={{
        width: 44,
        height: 44,
        display: "inline-block",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <Lion color={validColor} accessory={pet.accessory} />
    </div>
  );
}
