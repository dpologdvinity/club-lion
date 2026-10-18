import { memo } from "react";

/**
 * Surface materials shared by every room and object. Each is a see-through
 * detail pattern laid over a surface's own colour, so one material works on
 * any base colour: `<rect … fill={mat("wood")} />` on top of the coloured rect.
 */
export type Material =
  | "wood"
  | "planks"
  | "tile"
  | "brick"
  | "stone"
  | "rock"
  | "grass"
  | "sand"
  | "water"
  | "metal"
  | "glass"
  | "fabric"
  | "carpet"
  | "plaster"
  | "snow"
  | "ice"
  | "leaves"
  | "bamboo";

export const mat = (kind: Material) => `url(#mat-${kind})`;

const DARK = "#2a1a0e";
const LIGHT = "#ffffff";

export const MaterialDefs = memo(function MaterialDefs() {
  return (
    <svg className="material-defs" aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id="mat-wood"
          width="140"
          height="44"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={DARK} strokeOpacity="0.16" strokeWidth="2">
            <path d="M0 8Q35 4 70 9T140 8" />
            <path d="M0 20Q40 25 80 19T140 21" />
            <path d="M0 33Q30 29 65 34T140 32" />
          </g>
          <ellipse
            cx="96"
            cy="26"
            rx="9"
            ry="4"
            fill="none"
            stroke={DARK}
            strokeOpacity="0.22"
            strokeWidth="2"
          />
          <path
            d="M0 14H140"
            stroke={LIGHT}
            strokeOpacity="0.1"
            strokeWidth="2"
          />
        </pattern>
        <pattern
          id="mat-planks"
          width="180"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <rect width="180" height="60" fill="url(#mat-wood)" />
          <path
            d="M0 59H180M0 29H180"
            stroke={DARK}
            strokeOpacity="0.28"
            strokeWidth="3"
          />
          <path
            d="M60 0V29M150 29V60"
            stroke={DARK}
            strokeOpacity="0.28"
            strokeWidth="3"
          />
          <path
            d="M0 2H180M0 32H180"
            stroke={LIGHT}
            strokeOpacity="0.14"
            strokeWidth="2"
          />
        </pattern>
        <pattern
          id="mat-tile"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0H80V80"
            fill="none"
            stroke={LIGHT}
            strokeOpacity="0.45"
            strokeWidth="4"
          />
          <path
            d="M12 26L26 12M14 40L40 14"
            stroke={LIGHT}
            strokeOpacity="0.16"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </pattern>
        <pattern
          id="mat-brick"
          width="96"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={LIGHT} strokeOpacity="0.38" strokeWidth="3">
            <path d="M0 0H96M0 24H96" />
            <path d="M48 0V24M0 24V48M96 24V48" />
          </g>
          <g fill={DARK} fillOpacity="0.1">
            <circle cx="20" cy="10" r="2" />
            <circle cx="70" cy="36" r="2.5" />
            <circle cx="34" cy="38" r="1.5" />
          </g>
        </pattern>
        <pattern
          id="mat-stone"
          width="130"
          height="96"
          patternUnits="userSpaceOnUse"
        >
          <g
            fill={LIGHT}
            fillOpacity="0.08"
            stroke={DARK}
            strokeOpacity="0.22"
            strokeWidth="3"
          >
            <path d="M4 6Q30 0 58 8L62 40Q34 48 6 42Z" />
            <path d="M70 4Q100 0 126 10L122 44Q96 50 72 42Z" />
            <path d="M30 52Q60 46 92 54L88 90Q58 96 32 88Z" />
            <path d="M100 54Q118 50 130 58V92Q114 96 102 90Z" />
            <path d="M0 54Q12 50 22 56L20 90Q10 94 0 90Z" />
          </g>
        </pattern>
        <pattern
          id="mat-rock"
          width="220"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={DARK} strokeOpacity="0.18" strokeWidth="3">
            <path d="M0 12Q55 6 110 13T220 11" />
            <path d="M0 34Q60 40 120 32T220 35" />
          </g>
          <path
            d="M0 22Q70 18 140 24T220 22"
            stroke={LIGHT}
            strokeOpacity="0.14"
            strokeWidth="2"
            fill="none"
          />
        </pattern>
        <pattern
          id="mat-grass"
          width="44"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" strokeLinecap="round" strokeWidth="2.5">
            <path
              d="M6 30Q8 20 4 12M20 30Q19 22 24 15M34 30Q36 21 31 13"
              stroke={DARK}
              strokeOpacity="0.18"
            />
            <path
              d="M13 31Q15 24 12 18M28 31Q27 25 30 19M40 31Q41 26 39 21"
              stroke={LIGHT}
              strokeOpacity="0.2"
            />
          </g>
        </pattern>
        <pattern
          id="mat-sand"
          width="34"
          height="34"
          patternUnits="userSpaceOnUse"
        >
          <g fill={DARK} fillOpacity="0.14">
            <circle cx="5" cy="7" r="1.6" />
            <circle cx="22" cy="4" r="1.2" />
            <circle cx="14" cy="20" r="1.8" />
            <circle cx="29" cy="27" r="1.4" />
          </g>
          <g fill={LIGHT} fillOpacity="0.28">
            <circle cx="10" cy="29" r="1.4" />
            <circle cx="27" cy="14" r="1.2" />
          </g>
        </pattern>
        <pattern
          id="mat-water"
          width="170"
          height="46"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={LIGHT} strokeLinecap="round" strokeWidth="3">
            <path d="M8 12Q24 4 40 12T72 12" strokeOpacity="0.35" />
            <path d="M95 32Q111 24 127 32T159 32" strokeOpacity="0.28" />
          </g>
          <path
            d="M50 38Q60 34 70 38"
            fill="none"
            stroke={DARK}
            strokeOpacity="0.12"
            strokeWidth="2"
          />
        </pattern>
        <pattern
          id="mat-metal"
          width="60"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 2H60"
            stroke={LIGHT}
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <path d="M0 7H60" stroke={DARK} strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
        <pattern
          id="mat-glass"
          width="70"
          height="70"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M8 40L40 8M18 48L48 18"
            stroke={LIGHT}
            strokeOpacity="0.4"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </pattern>
        <pattern
          id="mat-fabric"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 2H8M0 6H8"
            stroke={DARK}
            strokeOpacity="0.1"
            strokeWidth="1"
          />
          <path
            d="M2 0V8M6 0V8"
            stroke={LIGHT}
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        </pattern>
        <pattern
          id="mat-plaster"
          width="160"
          height="140"
          patternUnits="userSpaceOnUse"
        >
          <g fill={DARK} fillOpacity="0.035">
            <path d="M10 20Q30 6 52 18T70 44Q46 54 24 46T10 20Z" />
            <path d="M96 78Q118 66 140 80T150 110Q124 122 104 110T96 78Z" />
            <path d="M40 100Q56 92 70 102T66 126Q50 132 40 120Z" />
          </g>
          <g fill={LIGHT} fillOpacity="0.07">
            <path d="M92 10Q112 2 130 14T126 40Q106 46 94 34Z" />
            <path d="M6 76Q20 70 32 80T26 100Q12 104 6 92Z" />
          </g>
          <g fill={DARK} fillOpacity="0.09">
            <circle cx="60" cy="70" r="1.2" />
            <circle cx="120" cy="54" r="1" />
            <circle cx="30" cy="130" r="1.1" />
            <circle cx="150" cy="20" r="0.9" />
          </g>
        </pattern>
        <pattern
          id="mat-snow"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <g fill={LIGHT} fillOpacity="0.8">
            <circle cx="10" cy="12" r="1.8" />
            <circle cx="42" cy="30" r="1.4" />
            <circle cx="24" cy="50" r="2" />
          </g>
          <path
            d="M0 40Q15 36 30 40T60 40"
            fill="none"
            stroke="#9cc3e6"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
        </pattern>
        <pattern
          id="mat-ice"
          width="220"
          height="130"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={LIGHT} strokeOpacity="0.45" strokeWidth="2">
            <path d="M10 20L60 50L55 90M60 50L120 40" />
            <path d="M140 80L180 110M180 110L210 95" />
          </g>
          <path
            d="M150 20L190 10"
            stroke={LIGHT}
            strokeOpacity="0.3"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </pattern>
        <pattern
          id="mat-leaves"
          width="48"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <g fill={DARK} fillOpacity="0.14">
            <path d="M8 18Q16 6 24 18Q16 26 8 18Z" />
            <path d="M30 34Q38 22 46 34Q38 42 30 34Z" />
          </g>
          <path
            d="M28 10Q34 2 40 10Q34 16 28 10Z"
            fill={LIGHT}
            fillOpacity="0.16"
          />
        </pattern>
        <pattern
          id="mat-bamboo"
          width="40"
          height="70"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M4 0V70M36 0V70"
            stroke={DARK}
            strokeOpacity="0.16"
            strokeWidth="3"
          />
          <path
            d="M0 34H40"
            stroke={DARK}
            strokeOpacity="0.26"
            strokeWidth="4"
          />
          <path
            d="M12 0V70"
            stroke={LIGHT}
            strokeOpacity="0.2"
            strokeWidth="4"
          />
        </pattern>
      </defs>
    </svg>
  );
});
