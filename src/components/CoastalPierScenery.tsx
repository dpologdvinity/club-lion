import type { JSX } from "react";
import { memo } from "react";

const STAGE_WIDTH = 2400;
const HORIZON = 330;
const DECK_TOP = 540;

type Gull = { x: number; y: number; s: number; phase: number };
type Boat = { x: number; y: number; s: number; sail: string };
type Shell = { x: number; y: number; color: string };
type Starfish = { x: number; y: number };

// Deterministic glints on the water so the sun path never reshuffles between frames.
const SUN_GLINTS = Array.from({ length: 9 }, (_, i) => ({
  x: 1040 + ((i * 137) % 620),
  y: 352 + i * 22,
  w: 40 + ((i * 53) % 110),
  opacity: 0.55 - (i % 4) * 0.08,
}));

const GULLS: readonly Gull[] = [
  { x: 420, y: 150, s: 1, phase: 0 },
  { x: 500, y: 118, s: 0.75, phase: Math.PI },
  { x: 1760, y: 96, s: 0.9, phase: 0 },
];

const BOATS: readonly Boat[] = [
  { x: 560, y: 400, s: 0.7, sail: "#fff6e4" },
  { x: 2080, y: 372, s: 0.55, sail: "#ffd9a0" },
];

const PILING_XS = Array.from({ length: 13 }, (_, i) => i * 200 + 40);
const BOLLARD_XS = [560, 1480, 2280];
const RAIL_POST_XS = Array.from({ length: 25 }, (_, i) => i * 100);
const DECK_POST_XS = Array.from({ length: 17 }, (_, i) => i * 150);

const SHELLS: readonly Shell[] = [
  { x: 520, y: 670, color: "#ffb8a8" },
  { x: 980, y: 692, color: "#fff1d9" },
  { x: 1700, y: 676, color: "#ffcf9a" },
  { x: 2240, y: 690, color: "#ffb8a8" },
];

const STARFISH: readonly Starfish[] = [
  { x: 760, y: 700 },
  { x: 2010, y: 664 },
];

function Gulls({ seconds }: { seconds: number }): JSX.Element {
  return (
    <>
      {GULLS.map((g, i) => {
        const wing = 6 + ((Math.sin(seconds * 3 + g.phase) + 1) / 2) * 5;
        return (
          <path
            key={i}
            transform={`translate(${g.x} ${g.y}) scale(${g.s})`}
            d={`M-16 ${-wing}Q-8 ${-wing - 6} 0 0Q8 ${-wing - 6} 16 ${-wing}`}
            fill="none"
            stroke="#6f4a4d"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

function Waves({ seconds }: { seconds: number }): JSX.Element {
  const sway = Math.sin(seconds * 0.7);
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 240 - 50 + sway * 6} ${392 + (i % 3) * 40}q60 -12 120 0t120 0`}
          fill="none"
          stroke="#c7e1d9"
          strokeWidth="4"
          opacity=".55"
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

function LanternGlow({ seconds }: { seconds: number }): JSX.Element {
  const glow = (Math.sin(seconds * 1.6) + 1) / 2;
  return (
    <g transform="translate(1950 540)">
      <circle cy="-322" r={92 + glow * 8} fill="url(#cp-lantern)" />
    </g>
  );
}

/** Static sky, sun, headland and water. Memoized so the 80ms scenery ticks skip it. */
const CoastalPierBackdrop = memo(function CoastalPierBackdrop(): JSX.Element {
  return (
    <>
      <defs>
        <linearGradient id="cp-sky" x2="0" y2="1">
          <stop stopColor="#d79291" />
          <stop offset=".6" stopColor="#f7c78b" />
          <stop offset="1" stopColor="#ffe3ae" />
        </linearGradient>
        <linearGradient id="cp-water" x2="0" y2="1">
          <stop stopColor="#80b5b8" />
          <stop offset="1" stopColor="#397d8e" />
        </linearGradient>
        <radialGradient id="cp-lantern">
          <stop stopColor="#fff4c2" stopOpacity=".95" />
          <stop offset="1" stopColor="#ffd56f" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="cp-planks"
          width="160"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          <rect width="160" height="36" fill="#b38e6a" />
          <path
            d="M0 0H160M0 36H160M80 0V36"
            stroke="#755e4a"
            strokeWidth="3"
          />
          <path
            d="M10 12h53M90 24h45"
            stroke="#d4b692"
            strokeWidth="2"
            opacity=".6"
          />
          <circle cx="8" cy="7" r="2" fill="#675a4c" />
          <circle cx="150" cy="29" r="2" fill="#675a4c" />
        </pattern>
      </defs>

      {/* Golden-hour sky, matching Sunset Beach so the two rooms read as one walk */}
      <rect width={STAGE_WIDTH} height="720" fill="url(#cp-sky)" />
      <circle cx="1350" cy="265" r="100" fill="#ffecb1" />
      <circle cx="1350" cy="265" r="150" fill="#ffecb1" opacity=".18" />
      <g fill="#fff1cf" opacity=".5">
        <ellipse cx="480" cy="150" rx="180" ry="24" />
        <ellipse cx="1850" cy="110" rx="220" ry="20" />
      </g>

      {/* Distant headland and dunes on the horizon */}
      <path
        d={`M0 ${HORIZON}Q180 260 420 ${HORIZON}Q560 300 760 ${HORIZON}V360H0Z`}
        fill="#c98f8e"
      />
      <path
        d={`M1700 ${HORIZON}Q1900 286 2140 ${HORIZON}Q2290 300 2400 ${HORIZON - 10}V360H1700Z`}
        fill="#c07f85"
      />

      <rect
        y={HORIZON}
        width={STAGE_WIDTH}
        height={DECK_TOP - HORIZON}
        fill="url(#cp-water)"
      />
      {SUN_GLINTS.map((g, i) => (
        <path
          key={i}
          d={`M${g.x} ${g.y}h${g.w}`}
          stroke="#ffe1a0"
          strokeWidth="6"
          strokeLinecap="round"
          opacity={g.opacity}
        />
      ))}
    </>
  );
});

function SunsetBeachSign(): JSX.Element {
  return (
    <g transform="translate(70 0)">
      <path d="M-46 540V420M46 540V420" stroke="#7b5a2c" strokeWidth="10" />
      <path d="M-62 440H62" stroke="#7b5a2c" strokeWidth="7" />
      <rect
        x="-78"
        y="380"
        width="156"
        height="46"
        rx="8"
        fill="#fff0cf"
        stroke="#987650"
        strokeWidth="4"
      />
      <text y="412" x="0" textAnchor="middle" fontSize="16" fill="#674f3e">
        SUNSET BEACH
      </text>
    </g>
  );
}

/** Lighthouse body at x 1950 is the room's interactive landmark (lighthouse-foghorn). Keep it there. */
function LighthouseBody(): JSX.Element {
  return (
    <g transform="translate(1950 540)">
      <ellipse cy="4" rx="170" ry="26" fill="#624f42" opacity=".3" />
      <path
        d="M-105 0L-65-300H65L105 0Z"
        fill="#fff5dc"
        stroke="#8d6552"
        strokeWidth="6"
      />
      <path d="M-91-95H91L82-160H-82ZM-74-220H74L65-285H-65Z" fill="#c46757" />
      <path
        d="M-44 0V-65Q0-110 44-65V0"
        fill="#5c594d"
        stroke="#ae8260"
        strokeWidth="6"
      />
      <rect
        x="-72"
        y="-360"
        width="144"
        height="62"
        rx="6"
        fill="#f5dfa5"
        stroke="#6a5d51"
        strokeWidth="7"
      />
      <path
        d="M-45-360V-300M0-360V-300M45-360V-300"
        stroke="#6a5d51"
        strokeWidth="5"
      />
      <path
        d="M-98-365L0-425L98-365Z"
        fill="#b4574a"
        stroke="#854c40"
        strokeWidth="5"
      />
      <path
        d="M-95-298H95M-105-318V-288M105-318V-288"
        fill="none"
        stroke="#695a4c"
        strokeWidth="7"
      />
      <circle cy="-330" r="16" fill="#fff4c2" />
      <rect
        x="-145"
        y="30"
        width="290"
        height="40"
        rx="8"
        fill="#fff0cf"
        stroke="#987650"
        strokeWidth="4"
      />
      <text y="57" textAnchor="middle" fontSize="24" fill="#674f3e">
        HISTORIC LIGHTHOUSE
      </text>
    </g>
  );
}

/** Boats, pier deck, pilings and props. Static, so memoized. */
const CoastalPierFront = memo(function CoastalPierFront(): JSX.Element {
  return (
    <>
      {BOATS.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          <path d="M0 0V-70" stroke="#6b5340" strokeWidth="4" />
          <path d="M4-68Q40-40 40-6H4Z" fill={b.sail} />
          <path d="M-4-52Q-22-30 -26-8H-4Z" fill="#fff6e4" />
          <path
            d="M-40 4H50L38 22H-30Z"
            fill="#c46757"
            stroke="#8d4a40"
            strokeWidth="3"
          />
        </g>
      ))}

      {PILING_XS.map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <path d="M-11 470V560H11V470Z" fill="#6b5340" />
          <path d="M-11 470H11" stroke="#8a6b52" strokeWidth="4" />
          <ellipse cy="562" rx="22" ry="5" fill="#3f7682" opacity=".5" />
        </g>
      ))}
      <path
        d={`M0 ${DECK_TOP - 65}H2400M0 ${DECK_TOP - 20}H2400`}
        stroke="#e1c39b"
        strokeWidth="6"
      />
      {RAIL_POST_XS.map((x) => (
        <path
          key={x}
          d={`M${x} ${DECK_TOP - 65}V${DECK_TOP - 20}`}
          stroke="#8e7358"
          strokeWidth="5"
        />
      ))}
      <path d={`M0 ${DECK_TOP - 5}H2400`} stroke="#d8b78c" strokeWidth="9" />
      <rect
        y={DECK_TOP}
        width={STAGE_WIDTH}
        height="180"
        fill="url(#cp-planks)"
      />
      {DECK_POST_XS.map((x) => (
        <path
          key={x}
          d={`M${x} ${DECK_TOP}V${DECK_TOP - 85}`}
          stroke="#8e7358"
          strokeWidth="12"
          strokeLinecap="round"
        />
      ))}

      <SunsetBeachSign />
      <LighthouseBody />

      {/* Bench on the deck */}
      <g transform="translate(760 533)">
        <rect
          x="-125"
          y="-100"
          width="250"
          height="38"
          rx="7"
          fill="#c59b6e"
          stroke="#795e43"
          strokeWidth="4"
        />
        <path
          d="M-140-48H140M-105-48V0M105-48V0"
          stroke="#795e43"
          strokeWidth="12"
        />
        <path d="M-110-80V-48M110-80V-48" stroke="#795e43" strokeWidth="8" />
      </g>
      {BOLLARD_XS.map((x) => (
        <g key={x} transform={`translate(${x} ${DECK_TOP + 40})`}>
          <ellipse cy="26" rx="34" ry="8" fill="#624f42" opacity=".3" />
          <rect
            x="-26"
            y="-22"
            width="52"
            height="44"
            rx="14"
            fill="#4f5d63"
            stroke="#2f383c"
            strokeWidth="4"
          />
          <path d="M-26-6H26M-26 10H26" stroke="#2f383c" strokeWidth="3" />
        </g>
      ))}

      {/* Fishing rod leaning over a crate */}
      <g transform="translate(1180 540)">
        <path
          d="M0 0L60-170"
          stroke="#7b5a2c"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M60-170Q90-100 70 0"
          fill="none"
          stroke="#f0e8d8"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
        <rect
          x="-70"
          y="-44"
          width="70"
          height="44"
          fill="#c99a5e"
          stroke="#795e43"
          strokeWidth="4"
        />
        <path d="M-70-22H0M-35-44V0" stroke="#795e43" strokeWidth="3" />
      </g>

      {SHELLS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <path
            d="M-16 0Q0-30 16 0Z"
            fill={s.color}
            stroke="#c18d60"
            strokeWidth="3"
          />
          <path
            d="M0-13V0M-7-9L-4 0M7-9L4 0"
            stroke="#c18d60"
            strokeWidth="2"
          />
        </g>
      ))}
      {STARFISH.map((s) => (
        <path
          key={s.x}
          transform={`translate(${s.x} ${s.y}) rotate(${s.x % 40})`}
          d="M0-16L5-5L17-4L8 4L11 16L0 9L-11 16L-8 4L-17-4L-5-5Z"
          fill="#ff8a65"
          stroke="#c9563b"
          strokeWidth="2"
        />
      ))}
    </>
  );
});

export function CoastalPierScenery({
  seconds,
}: {
  seconds: number;
}): JSX.Element {
  return (
    <>
      <CoastalPierBackdrop />
      <Waves seconds={seconds} />
      <CoastalPierFront />
      <LanternGlow seconds={seconds} />
      <Gulls seconds={seconds} />
    </>
  );
}
