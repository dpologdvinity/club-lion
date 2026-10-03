import type { JSX } from "react";
import type { PetState } from "../utils/petFollower";

const COLOR_FUR: Record<PetState["color"], string> = {
  gold: "#E8A93C",
  sand: "#DDC29A",
  copper: "#C4713B",
  rose: "#E6A3A3",
};

const COLOR_MANE: Record<PetState["color"], string> = {
  gold: "#B8762A",
  sand: "#B89968",
  copper: "#8F4D26",
  rose: "#C06E7A",
};

export function PetCompanion({
  pet,
  isTrotting,
  heading = "right",
}: {
  pet: PetState;
  isTrotting: boolean;
  heading?: "left" | "right";
}): JSX.Element {
  const fur = COLOR_FUR[pet.color];
  const mane = COLOR_MANE[pet.color];
  const flip = heading === "left";

  return (
    <svg
      viewBox="0 0 64 64"
      width="40"
      height="40"
      role="img"
      aria-label={`${pet.name} the pet lion`}
      className={`pet-companion pet-companion-${pet.color}${isTrotting ? " is-trotting" : " is-resting"}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {/* tail */}
      <path
        d="M 48 36 Q 60 34 58 24"
        stroke={mane}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="pet-tail"
      />
      <circle cx="58" cy="23" r="3.5" fill={mane} className="pet-tail-tuft" />

      {/* body */}
      <ellipse cx="32" cy="42" rx="16" ry="12" fill={fur} />

      {/* legs */}
      <rect x="20" y="48" width="5" height="10" rx="2" fill={fur} />
      <rect x="40" y="48" width="5" height="10" rx="2" fill={fur} />

      {/* mane */}
      <circle cx="18" cy="30" r="13" fill={mane} />

      {/* head */}
      <circle cx="18" cy="30" r="9" fill={fur} />

      {/* ears */}
      <circle cx="11" cy="22" r="3" fill={mane} />
      <circle cx="24" cy="22" r="3" fill={mane} />

      {/* face */}
      <circle cx="14" cy="29" r="1.4" fill="#2A2018" />
      <circle cx="20" cy="29" r="1.4" fill="#2A2018" />
      <ellipse cx="17" cy="33" rx="2" ry="1.4" fill="#2A2018" />

      {pet.accessory === "scarf" && (
        <path
          d="M 10 36 Q 18 40 26 36 L 26 40 Q 18 44 10 40 Z"
          fill="#D1495B"
        />
      )}
      {pet.accessory === "bandana" && (
        <path d="M 9 26 L 27 26 L 18 33 Z" fill="#3C6E71" />
      )}
      {pet.accessory === "bell_collar" && (
        <>
          <ellipse
            cx="18"
            cy="37"
            rx="8"
            ry="2.4"
            fill="none"
            stroke="#C9A227"
            strokeWidth="2"
          />
          <circle cx="18" cy="40" r="2" fill="#F4D35E" />
        </>
      )}
      {pet.accessory === "flower" && (
        <g transform="translate(26 20)">
          <circle cx="0" cy="-3" r="2" fill="#F6BD60" />
          <circle cx="2.8" cy="-1" r="2" fill="#F28482" />
          <circle cx="1.8" cy="2" r="2" fill="#F28482" />
          <circle cx="-1.8" cy="2" r="2" fill="#F28482" />
          <circle cx="-2.8" cy="-1" r="2" fill="#F28482" />
          <circle cx="0" cy="0" r="1.6" fill="#F6BD60" />
        </g>
      )}
    </svg>
  );
}
