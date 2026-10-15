import "./sceneryMotion.css";
import type { JSX } from "react";
import type { PetSpecies } from "../utils/petSpecies.ts";
import type { LionColor } from "../game.ts";
import { Lion } from "./Lion.tsx";

const INK = "#2b2140";
const CHEEK = "#ff9fb2";

type DrawnSpecies = Exclude<PetSpecies, "lion">;

/** Big round eyes that blink (CSS `pet-blink`). */
function Eyes({ y = 90 }: { y?: number }) {
  return (
    <g className="pet-blink">
      <circle cx="80" cy={y} r="9" fill={INK} />
      <circle cx="120" cy={y} r="9" fill={INK} />
      <circle cx="83" cy={y - 3} r="3.5" fill="#ffffff" />
      <circle cx="123" cy={y - 3} r="3.5" fill="#ffffff" />
    </g>
  );
}

function Cheeks({ y = 116 }: { y?: number }) {
  return (
    <>
      <circle cx="66" cy={y} r="7" fill={CHEEK} opacity="0.6" />
      <circle cx="134" cy={y} r="7" fill={CHEEK} opacity="0.6" />
    </>
  );
}

function Smile({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={INK}
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
}

/** Each drawn species, back to front: tail, body, ears, head, face. */
const DRAWN: Record<DrawnSpecies, () => JSX.Element> = {
  bunny: () => (
    <>
      <g className="sm-sway">
        <circle cx="156" cy="190" r="13" fill="#ffffff" />
      </g>
      <ellipse cx="100" cy="182" rx="58" ry="34" fill="#fff4e8" />
      <ellipse
        cx="72"
        cy="34"
        rx="15"
        ry="40"
        transform="rotate(-12 72 34)"
        fill="#fff4e8"
      />
      <ellipse
        cx="128"
        cy="34"
        rx="15"
        ry="40"
        transform="rotate(12 128 34)"
        fill="#fff4e8"
      />
      <ellipse
        cx="72"
        cy="34"
        rx="7"
        ry="30"
        transform="rotate(-12 72 34)"
        fill="#ffb3c7"
      />
      <ellipse
        cx="128"
        cy="34"
        rx="7"
        ry="30"
        transform="rotate(12 128 34)"
        fill="#ffb3c7"
      />
      <ellipse cx="100" cy="96" rx="56" ry="52" fill="#fff4e8" />
      <Eyes y={98} />
      <Cheeks y={118} />
      <path d="M96 114L104 114L100 120Z" fill="#ff8fab" />
      <rect
        x="97"
        y="124"
        width="6"
        height="9"
        rx="1"
        fill="#ffffff"
        stroke={INK}
        strokeWidth="1.5"
      />
    </>
  ),
  puppy: () => (
    <>
      <g className="sm-sway">
        <path
          d="M150 170Q180 152 170 124"
          fill="none"
          stroke="#e9b872"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </g>
      <ellipse cx="100" cy="180" rx="56" ry="36" fill="#e9b872" />
      <ellipse cx="40" cy="96" rx="22" ry="40" fill="#b97a3c" />
      <ellipse cx="160" cy="96" rx="22" ry="40" fill="#b97a3c" />
      <ellipse cx="100" cy="96" rx="56" ry="52" fill="#e9b872" />
      <ellipse cx="62" cy="66" rx="18" ry="14" fill="#c98a4b" />
      <Eyes />
      <Cheeks />
      <ellipse cx="100" cy="122" rx="30" ry="22" fill="#fff1d9" />
      <ellipse cx="100" cy="112" rx="9" ry="7" fill={INK} />
      <path d="M96 134Q100 146 104 134Z" fill="#ff8fab" />
      <Smile d="M90 128Q100 137 110 128" />
    </>
  ),
  kitten: () => (
    <>
      <g className="sm-sway">
        <path
          d="M150 176Q186 170 180 130Q176 108 164 110"
          fill="none"
          stroke="#cfd3e6"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </g>
      <ellipse cx="100" cy="180" rx="52" ry="36" fill="#cfd3e6" />
      <path d="M48 64L50 14L88 46Z" fill="#cfd3e6" />
      <path d="M152 64L150 14L112 46Z" fill="#cfd3e6" />
      <path d="M56 56L57 28L76 46Z" fill="#ffb6c8" />
      <path d="M144 56L143 28L124 46Z" fill="#ffb6c8" />
      <ellipse cx="100" cy="96" rx="56" ry="50" fill="#cfd3e6" />
      <path
        d="M100 52V64M86 54L88 64M114 54L112 64"
        stroke="#6f7594"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M50 116L24 110M50 124L24 126M150 116L176 110M150 124L176 126"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Eyes />
      <Cheeks />
      <ellipse cx="100" cy="122" rx="26" ry="18" fill="#eef0fa" />
      <path d="M96 112L104 112L100 118Z" fill="#ff8fab" />
      <Smile d="M92 126Q96 132 100 126Q104 132 108 126" />
    </>
  ),
  duckling: () => (
    <>
      <path d="M92 48Q92 18 108 14Q104 34 112 46Z" fill="#f7c12e" />
      <ellipse cx="100" cy="178" rx="60" ry="38" fill="#f7c12e" />
      <ellipse cx="42" cy="170" rx="14" ry="26" fill="#f0a81c" />
      <ellipse cx="158" cy="170" rx="14" ry="26" fill="#f0a81c" />
      <ellipse cx="80" cy="212" rx="14" ry="6" fill="#ff9f3d" />
      <ellipse cx="120" cy="212" rx="14" ry="6" fill="#ff9f3d" />
      <ellipse cx="100" cy="98" rx="56" ry="50" fill="#ffd84d" />
      <Eyes />
      <Cheeks />
      <ellipse cx="100" cy="122" rx="28" ry="12" fill="#ff9f3d" />
      <path
        d="M74 118Q100 124 126 118"
        fill="none"
        stroke="#e07e1f"
        strokeWidth="2"
      />
    </>
  ),
  panda: () => (
    <>
      <ellipse cx="100" cy="180" rx="56" ry="38" fill="#ffffff" />
      <ellipse cx="54" cy="170" rx="14" ry="26" fill={INK} />
      <ellipse cx="146" cy="170" rx="14" ry="26" fill={INK} />
      <ellipse cx="74" cy="210" rx="16" ry="9" fill={INK} />
      <ellipse cx="126" cy="210" rx="16" ry="9" fill={INK} />
      <circle cx="50" cy="50" r="22" fill={INK} />
      <circle cx="150" cy="50" r="22" fill={INK} />
      <ellipse cx="100" cy="96" rx="58" ry="52" fill="#ffffff" />
      <ellipse
        cx="78"
        cy="92"
        rx="18"
        ry="22"
        transform="rotate(-12 78 92)"
        fill={INK}
      />
      <ellipse
        cx="122"
        cy="92"
        rx="18"
        ry="22"
        transform="rotate(12 122 92)"
        fill={INK}
      />
      <g className="pet-blink">
        <circle cx="80" cy="90" r="8" fill="#ffffff" />
        <circle cx="120" cy="90" r="8" fill="#ffffff" />
        <circle cx="81" cy="91" r="4" fill={INK} />
        <circle cx="119" cy="91" r="4" fill={INK} />
      </g>
      <Cheeks y={118} />
      <ellipse cx="100" cy="124" rx="22" ry="16" fill="#f2efe8" />
      <ellipse cx="100" cy="116" rx="8" ry="6" fill={INK} />
      <Smile d="M92 130Q100 138 108 130" />
    </>
  ),
  unicorn: () => (
    <>
      <g className="sm-sway">
        <path
          d="M152 170Q196 160 184 200"
          fill="none"
          stroke="#ff9fd6"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M150 176Q190 178 176 210"
          fill="none"
          stroke="#8fe3ff"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
      <ellipse cx="100" cy="180" rx="56" ry="36" fill="#fdf0ff" />
      <circle cx="50" cy="64" r="14" fill="#ff9fd6" />
      <circle cx="68" cy="40" r="14" fill="#b78cff" />
      <circle cx="100" cy="30" r="15" fill="#ff9fd6" />
      <circle cx="132" cy="40" r="14" fill="#8fe3ff" />
      <circle cx="150" cy="64" r="14" fill="#b78cff" />
      <path d="M58 56L60 22L84 46Z" fill="#fdf0ff" />
      <path d="M142 56L140 22L116 46Z" fill="#fdf0ff" />
      <path d="M100 2L110 48L90 48Z" fill="#ffd166" />
      <path
        d="M92 30H108M93 40H107"
        stroke="#f2a93b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="100" cy="96" rx="54" ry="50" fill="#fdf0ff" />
      <Eyes />
      <Cheeks />
      <ellipse cx="100" cy="124" rx="24" ry="16" fill="#ffe3f5" />
      <Smile d="M90 128Q100 137 110 128" />
    </>
  ),
  dragon: () => (
    <>
      <path d="M58 140L14 100L22 150L8 166L58 170Z" fill="#5fb88a" />
      <path d="M142 140L186 100L178 150L192 166L142 170Z" fill="#5fb88a" />
      <g className="sm-sway">
        <path
          d="M140 186Q186 196 178 150"
          fill="none"
          stroke="#7fd6a0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path d="M172 134L190 146L172 156Z" fill="#f6d36b" />
      </g>
      <ellipse cx="100" cy="180" rx="54" ry="38" fill="#7fd6a0" />
      <ellipse cx="100" cy="186" rx="30" ry="24" fill="#e9ffd9" />
      <path d="M62 56L54 14L80 46Z" fill="#f6d36b" />
      <path d="M138 56L146 14L120 46Z" fill="#f6d36b" />
      <ellipse cx="100" cy="96" rx="56" ry="50" fill="#7fd6a0" />
      <Eyes />
      <Cheeks />
      <ellipse cx="100" cy="122" rx="26" ry="18" fill="#c9f2d4" />
      <circle cx="92" cy="116" r="2.5" fill={INK} />
      <circle cx="108" cy="116" r="2.5" fill={INK} />
      <Smile d="M90 132Q100 140 110 132" />
    </>
  ),
};

/**
 * Picture of a pet species. The lion keeps its PNG art (`PetPicture`); the
 * other species are drawn here in the same flat, big-eyed style as AnimalArt.
 */
export function PetSpeciesArt({
  species,
  className = "",
  x,
  y,
  width,
  height,
}: {
  species: DrawnSpecies;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const Draw = DRAWN[species];
  return (
    <svg
      className={`pet-species-art pet-species-${species} ${className}`}
      viewBox="0 0 200 220"
      aria-hidden="true"
      focusable="false"
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <g className="sm-bob">
        <Draw />
      </g>
    </svg>
  );
}

/** Any species at any size: the lion uses its PNG, the rest use `PetSpeciesArt`. */
export function PetPicture({
  species,
  color = "gold",
  accessory = "none",
  className = "",
}: {
  species: PetSpecies;
  color?: LionColor;
  accessory?: string;
  className?: string;
}) {
  return species === "lion" ? (
    <Lion color={color} accessory={accessory} className={className} />
  ) : (
    <PetSpeciesArt species={species} className={className} />
  );
}
