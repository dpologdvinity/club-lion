import type { JSX } from "react";
import { memo } from "react";

const STAGE_WIDTH = 2400;

type Snowflake = { x: number; y: number; r: number; speed: number };
type PineSpec = { x: number; y: number; s: number };
type GondolaSpec = { tone: string };

// Deterministic snowflakes; motion comes only from the `seconds` prop.
const SNOWFLAKES: readonly Snowflake[] = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 397) % STAGE_WIDTH,
  y: (i * 131) % 560,
  r: 2 + (i % 3),
  speed: 12 + (i % 5) * 4,
}));

// Deterministic pine row spacing, kept as data so the treeline reads evenly.
const PINES: readonly PineSpec[] = Array.from({ length: 22 }, (_, i) => ({
  x: i * 116 + 20,
  y: 500 + (i % 3) * 15,
  s: 0.65 + (i % 3) * 0.15,
}));

const GONDOLAS: readonly GondolaSpec[] = [
  { tone: "#477962" },
  { tone: "#ba744d" },
  { tone: "#477962" },
  { tone: "#ba744d" },
  { tone: "#477962" },
];

function Pine({ x, y, s }: PineSpec): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 5V35" stroke="#805e43" strokeWidth="12" />
      <path
        d="M0-155L-38-80H38ZM0-112L-54-35H54ZM0-70L-65 8H65Z"
        fill="#3d705d"
      />
      <path
        d="M0-155L-20-115H20ZM0-112L-26-73H26ZM0-70L-35-29H35Z"
        fill="#e7f2ee"
      />
    </g>
  );
}

/** Static sky, distant peaks, snow fields and treeline. Memoized so the 80ms scenery ticks skip it. */
const MtMistBackdrop = memo(function MtMistBackdrop(): JSX.Element {
  return (
    <>
      <defs>
        <linearGradient id="mm-sky" x2="0" y2="1">
          <stop stopColor="#8fbfd3" />
          <stop offset=".65" stopColor="#d6e9ec" />
          <stop offset="1" stopColor="#fbe6cf" />
        </linearGradient>
      </defs>

      <rect width={STAGE_WIDTH} height="720" fill="url(#mm-sky)" />
      <circle cx="2080" cy="120" r="48" fill="#fff3d0" />
      <g fill="#ffffff" opacity=".75">
        <ellipse cx="420" cy="110" rx="170" ry="26" />
        <ellipse cx="1340" cy="78" rx="210" ry="22" />
      </g>

      {/* Far range, cool and hazy */}
      <path
        d="M0 470L240 240L420 380L700 110L980 400L1200 230L1480 420L1740 150L2020 390L2260 210L2400 330V580H0Z"
        fill="#a9c4d1"
      />
      {/* Near range with lit and shaded faces */}
      <path
        d="M0 500L310 160L560 420L900 60L1260 420L1540 120L1840 400L2140 80L2400 450V580H0Z"
        fill="#7499aa"
      />
      <path
        d="M900 60L1040 300L900 260L840 330ZM2140 80L2270 290L2140 250L2060 330Z"
        fill="#5f8397"
      />
      <path
        d="M150 337L310 160L452 308L365 289L308 243L253 299ZM665 298L900 60L1130 292L1006 243L938 172L893 194L840 164L781 261ZM1400 285L1540 120L1708 277L1619 249L1533 184L1482 249ZM1992 260L2140 80L2290 292L2200 254L2135 160L2081 221Z"
        fill="#fffdf9"
      />

      {/* Snow fields and rolling drifts */}
      <path
        d="M0 505Q280 360 560 492Q860 335 1150 489Q1590 352 1900 485Q2220 392 2400 495V720H0Z"
        fill="#dbe9ef"
      />
      <path d="M0 560Q500 525 1100 565T2400 545V720H0Z" fill="#f1f6f4" />

      {PINES.map((p, i) => (
        <Pine key={i} x={p.x} y={p.y} s={p.s} />
      ))}
    </>
  );
});

/** Lodge sign at x 940 and sled gate at x 1800, the room's landmark and activity. Static, so memoized. */
const MtMistLandmarks = memo(function MtMistLandmarks(): JSX.Element {
  return (
    <>
      <g transform="translate(70 0)">
        <path d="M-46 540V420M46 540V420" stroke="#846042" strokeWidth="10" />
        <rect
          x="-78"
          y="380"
          width="156"
          height="46"
          rx="8"
          fill="#f3dfb2"
          stroke="#846042"
          strokeWidth="4"
        />
        <text
          y="411"
          textAnchor="middle"
          fill="#294b3c"
          fontSize="16"
          fontWeight="900"
        >
          DOWNTOWN
        </text>
      </g>

      <g transform="translate(940 540)">
        <ellipse cy="6" rx="300" ry="20" fill="#5d7e8c" opacity=".3" />
        <rect
          x="-255"
          y="-220"
          width="510"
          height="235"
          rx="10"
          fill="#a77750"
          stroke="#654b35"
          strokeWidth="7"
        />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M-250 ${-207 + i * 28}H250`}
            stroke="#805737"
            strokeWidth="7"
          />
        ))}
        <path
          d="M-310-210L0-380L310-210Z"
          fill="#76533d"
          stroke="#563f30"
          strokeWidth="7"
        />
        <path
          d="M-310-210L0-380L310-210L264-205L0-345L-269-197Z"
          fill="#fffdf9"
        />
        <rect x="172" y="-359" width="40" height="110" fill="#8b8178" />
        <path d="M165-359H220" stroke="#fffdf9" strokeWidth="12" />
        {[-160, 160].map((x) => (
          <g key={x} transform={`translate(${x} -140)`}>
            <rect
              x="-42"
              y="-45"
              width="84"
              height="90"
              rx="6"
              fill="#f9d993"
              stroke="#644b37"
              strokeWidth="8"
            />
            <path d="M0-42V42M-39 0H39" stroke="#644b37" strokeWidth="5" />
          </g>
        ))}
        <rect
          x="-49"
          y="-108"
          width="98"
          height="123"
          rx="6"
          fill="#634d3a"
          stroke="#edc987"
          strokeWidth="5"
        />
        <circle cx="26" cy="-44" r="5" fill="#edc987" />
        <rect
          x="-175"
          y="-258"
          width="350"
          height="48"
          rx="10"
          fill="#fff1d4"
          stroke="#674c34"
          strokeWidth="4"
        />
        <text
          y="-225"
          textAnchor="middle"
          fill="#294b3c"
          fontSize="27"
          fontWeight="900"
        >
          MT. MIST BASECAMP
        </text>
      </g>

      <g transform="translate(1800 540)">
        <path d="M-130 15V-135M130 15V-135" stroke="#846042" strokeWidth="14" />
        <path d="M-156-140H156" stroke="#f3f7f5" strokeWidth="20" />
        <rect
          x="-145"
          y="-130"
          width="290"
          height="56"
          rx="8"
          fill="#f3dfb2"
          stroke="#846042"
          strokeWidth="5"
        />
        <text
          y="-92"
          textAnchor="middle"
          fill="#294b3c"
          fontSize="29"
          fontWeight="900"
        >
          SLED RUN
        </text>
        <path
          d="M-64 0H64M-69 13H69M-50-10V13M50-10V13"
          stroke="#846042"
          strokeWidth="8"
        />
        <path
          d="M0 38Q120 30 210 12Q260 0 320-10"
          fill="none"
          stroke="#b7ccd1"
          strokeWidth="8"
          strokeDasharray="14 16"
        />
      </g>

      {/* Ski lift cable */}
      <g stroke="#617982" fill="none" strokeWidth="9">
        <path d="M340 465V150M2040 450V150M300 158H380M2000 158H2080" />
        <path d="M0 130Q1200 190 2400 130" strokeWidth="5" />
      </g>
    </>
  );
});

/** Chimney smoke drifts above the lodge, so it is animated and sits outside the memoized group. */
function ChimneySmoke({ seconds }: { seconds: number }): JSX.Element {
  const puff = Math.sin(seconds * 1.4);
  return (
    <g transform="translate(940 540)">
      <path
        d={`M192-372Q${176 + puff * 6} -398 ${194 - puff * 4} -420Q${210 + puff * 5} -440 196 -460`}
        fill="none"
        stroke="#e9eef0"
        strokeWidth="10"
        strokeLinecap="round"
        opacity=".8"
      />
    </g>
  );
}

function Gondolas({ seconds }: { seconds: number }): JSX.Element {
  return (
    <>
      {GONDOLAS.map((g, i) => {
        const x = ((i * 520 + seconds * 70) % 2600) - 100;
        const y = 130 + 120 * (x / 2400) * (1 - x / 2400);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0V35" stroke="#526b74" strokeWidth="6" />
            <rect
              x="-42"
              y="32"
              width="84"
              height="77"
              rx="17"
              fill={g.tone}
              stroke="#fff0d2"
              strokeWidth="5"
            />
            <rect x="-30" y="44" width="60" height="35" rx="7" fill="#d7edf0" />
            <path d="M0 45V78" stroke="#fff0d2" strokeWidth="4" />
            <path d="M-38 98H38" stroke="#fff0d2" strokeWidth="4" />
          </g>
        );
      })}
    </>
  );
}

function Snow({ seconds }: { seconds: number }): JSX.Element {
  return (
    <>
      {SNOWFLAKES.map((f, i) => {
        const y = (f.y + seconds * f.speed) % 600;
        const x = f.x + Math.sin(seconds + i) * 10;
        return (
          <circle key={i} cx={x} cy={y} r={f.r} fill="#ffffff" opacity=".8" />
        );
      })}
    </>
  );
}

export function MtMistScenery({ seconds }: { seconds: number }): JSX.Element {
  return (
    <>
      <MtMistBackdrop />
      <MtMistLandmarks />
      <ChimneySmoke seconds={seconds} />
      <Gondolas seconds={seconds} />
      <Snow seconds={seconds} />
    </>
  );
}
