import { memo } from "react";
import {
  calculateBucketCycle,
  calculateWaveOffset,
} from "../utils/waterparkPhysics.ts";

const POOL = { cx: 900, cy: 520, rx: 480, ry: 96 } as const;
const DECK_TOP = 425;
// Rows widen toward the viewer so the deck reads in light perspective.
const DECK_ROWS = [436, 449, 464, 482, 503, 527, 555, 587, 623, 668] as const;
const VANISH = { x: 1400, y: -600 } as const;
const DECK_COLUMNS = Array.from({ length: 36 }, (_, i) => {
  const top = -1200 + i * 150;
  const bottom =
    VANISH.x + ((top - VANISH.x) * (720 - VANISH.y)) / (DECK_TOP - VANISH.y);
  return { top, bottom };
});

// Fixed scenery placements so nothing reshuffles between frames.
const CLOUDS = [
  { x: 260, y: 118, s: 1 },
  { x: 1020, y: 66, s: 1.3 },
  { x: 1880, y: 150, s: 0.85 },
  { x: 2560, y: 84, s: 1.1 },
] as const;
const BUSHES = Array.from({ length: 48 }, (_, i) => ({
  x: i * 60 - 10,
  y: 418 + ((i * 7) % 3) * 4,
  r: 28 + ((i * 13) % 14),
  flower: i % 3 === 0,
}));
const JUNGLE_PALMS = [140, 520, 980, 1340, 1860, 2140, 2480, 2700] as const;
const PUDDLES = [
  [1170, 652, 64, 10],
  [1560, 694, 76, 11],
  [2130, 664, 52, 8],
  [640, 702, 86, 11],
  [2560, 640, 50, 8],
] as const;
const PAW_PRINTS = Array.from({ length: 8 }, (_, i) => ({
  x: 1250 + i * 64,
  y: 646 - i * 4 + (i % 2) * 14,
}));
const POOL_SPARKLES = [
  [640, 500],
  [760, 548],
  [930, 470],
  [1060, 530],
  [1180, 488],
  [560, 556],
  [850, 590],
  [1250, 540],
] as const;
const ROPE_BUOYS = Array.from({ length: 23 }, (_, i) => {
  const t = i / 22;
  const x = 520 + t * 760;
  const y = 470 + 4 * 18 * t * (1 - t);
  return { x, y, coral: i % 2 === 0 };
});

function Cloud({ s }: { s: number }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cy="14" rx="132" ry="18" fill="#d6f1fa" />
      <ellipse rx="120" ry="32" fill="#ffffff" />
      <ellipse cx="-58" cy="-18" rx="66" ry="38" fill="#ffffff" />
      <ellipse cx="26" cy="-34" rx="78" ry="46" fill="#ffffff" />
      <ellipse cx="92" cy="-8" rx="62" ry="30" fill="#ffffff" />
    </g>
  );
}

function LionFace({ r }: { r: number }) {
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => (
        <path
          key={i}
          transform={`rotate(${i * (360 / 14)})`}
          d={`M${-r * 0.32} ${-r * 0.8}L0 ${-r * 1.28}L${r * 0.32} ${-r * 0.8}Z`}
          fill={i % 2 ? "#f08a2c" : "#e5701f"}
        />
      ))}
      <circle r={r} fill="#f4a43b" />
      <circle r={r * 0.72} fill="#ffd27a" />
      <path
        d={`M${-r * 0.36} ${-r * 0.12}q${r * 0.12} ${-r * 0.14} ${r * 0.24} 0M${r * 0.12} ${-r * 0.12}q${r * 0.12} ${-r * 0.14} ${r * 0.24} 0`}
        fill="none"
        stroke="#5b3416"
        strokeWidth={r * 0.08}
        strokeLinecap="round"
      />
      <path
        d={`M${-r * 0.12} ${r * 0.12}h${r * 0.24}l${-r * 0.12} ${r * 0.12}Z`}
        fill="#7a3f1a"
      />
      <path
        d={`M${-r * 0.24} ${r * 0.3}q${r * 0.24} ${r * 0.2} ${r * 0.48} 0`}
        fill="none"
        stroke="#7a3f1a"
        strokeWidth={r * 0.07}
        strokeLinecap="round"
      />
    </g>
  );
}

// Tube slides are drawn relative to the tower base so the tower can be reused
// as a hazy distant copy.
const TUBES = [
  {
    d: "M-65-285C-180-280-230-210-160-170S-40-100-140-70S-380-50-410-5",
    color: "#ffc93c",
    dark: "#d48a12",
  },
  {
    d: "M65-280C200-270 260-200 160-160C80-130 100-80 200-60S320-30 300-5",
    color: "#a66be0",
    dark: "#6e3fa8",
  },
  {
    d: "M-75-130C-180-120-170-50-60-45C40-40 90-20 80-5",
    color: "#ff6f59",
    dark: "#c2412f",
  },
] as const;

function SlideTower() {
  return (
    <g>
      {TUBES.map((tube) => (
        <g key={tube.color} fill="none" strokeLinecap="round">
          <path d={tube.d} stroke={tube.dark} strokeWidth="36" />
          <path d={tube.d} stroke={tube.color} strokeWidth="28" />
          <path
            d={tube.d}
            stroke={tube.dark}
            strokeWidth="30"
            strokeDasharray="5 46"
            opacity=".4"
          />
          <path
            d={tube.d}
            transform="translate(0 -7)"
            stroke="#ffffff"
            strokeWidth="5"
            opacity=".5"
          />
        </g>
      ))}
      {[-60, 60].map((x) => (
        <path
          key={x}
          d={`M${x} 0L${x * 0.82} -292`}
          stroke="#25748a"
          strokeWidth="10"
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = -i * 48;
        return (
          <path
            key={i}
            d={`M-58 ${y}L55 ${y - 48}M58 ${y}L-55 ${y - 48}`}
            stroke="#3a93a8"
            strokeWidth="4"
          />
        );
      })}
      {[-130, -290].map((y) => (
        <g key={y}>
          <rect x="-86" y={y} width="172" height="12" fill="#ffcf4a" />
          <rect x="-86" y={y + 12} width="172" height="5" fill="#d99a1f" />
          <path
            d={`M-86 ${y - 22}H86${[-66, -44, -22, 0, 22, 44, 66].map((bx) => `M${bx} ${y}V${y - 22}`).join("")}`}
            fill="none"
            stroke="#ff6f59"
            strokeWidth="4"
          />
        </g>
      ))}
      <path d="M-96-290L0-368L96-290Z" fill="url(#soe-awning)" />
      <path
        d="M-96-290L0-368L96-290Z"
        fill="none"
        stroke="#c2412f"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M0-368V-404" stroke="#25748a" strokeWidth="4" />
      <path d="M0-404L30-394L0-384Z" fill="#ffc93c" />
    </g>
  );
}

/** Ride entrance sign: three tube swirls in the slide colours, no reading needed. */
function SlidePictureSign() {
  return (
    <g transform="translate(0 -70)">
      <rect x="-16" y="20" width="12" height="50" fill="#25748a" />
      <rect x="4" y="20" width="12" height="50" fill="#25748a" />
      <rect
        x="-92"
        y="-44"
        width="184"
        height="70"
        rx="20"
        fill="#fffdf9"
        stroke="#25748a"
        strokeWidth="6"
      />
      {TUBES.map((tube, i) => (
        <path
          key={tube.color}
          transform={`translate(${-56 + i * 56} -9)`}
          d="M-14-20C14-20 16-6 0-2S-16 14 14 18"
          fill="none"
          stroke={tube.color}
          strokeWidth="9"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

const SplashPalm = memo(function SplashPalm({
  x,
  y,
  scale = 1,
  lean = 1,
  sway,
}: {
  x: number;
  y: number;
  scale?: number;
  lean?: 1 | -1;
  /** Swing direction: -1 swings opposite to 1, like the old -sway. */
  sway: 1 | -1;
}) {
  const fronds = [-165, -128, -92, -56, -20, 16, 52];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * lean} ${scale})`}>
      <ellipse cx="30" cy="6" rx="86" ry="13" fill="#b9814a" opacity=".28" />
      <path
        d="M0 0Q14-130-4-230Q-14-280 20-300"
        fill="none"
        stroke="#6f4627"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M0 0Q14-130-4-230Q-14-280 20-300"
        fill="none"
        stroke="#a06a3d"
        strokeWidth="13"
        strokeLinecap="round"
      />
      {Array.from({ length: 10 }, (_, i) => {
        const t = i / 10;
        const py = -t * 290;
        const px = 4 + Math.sin(t * 3.4) * 6;
        return (
          <path
            key={i}
            d={`M${px - 10} ${py}q10-6 20 0`}
            fill="none"
            stroke="#5a381d"
            strokeWidth="3"
            opacity=".7"
          />
        );
      })}
      <g transform="translate(20 -300)">
        <g
          className="sm-sway"
          style={{
            "--sm-dur": `${Math.PI / 0.9}s`,
            "--sm-delay": `${-((sway === 1 ? 0 : Math.PI) + Math.PI / 2) / 0.9}s`,
            "--sm-origin": "50% 50%",
          }}
        >
          {/* Invisible ring centres the sway box on the crown. */}
          <circle r="180" fill="none" />
          {fronds.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path
                d="M0 0Q70-42 158 8Q76-12 0 0Z"
                fill={i % 2 ? "#2a9668" : "#3cb47c"}
              />
              <path
                d="M0 0Q70-42 158 8"
                fill="none"
                stroke="#1d7550"
                strokeWidth="3"
              />
              {[34, 66, 98, 128].map((fx) => (
                <path
                  key={fx}
                  d={`M${fx} ${-18 + fx * 0.13}l12 20`}
                  stroke={i % 2 ? "#3cb47c" : "#2a9668"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
            </g>
          ))}
          <circle cx="-7" cy="9" r="11" fill="#6b4424" />
          <circle cx="9" cy="12" r="10" fill="#7f5230" />
          <circle cx="1" cy="-1" r="9" fill="#5a3a1f" />
        </g>
      </g>
    </g>
  );
});

function SurfboardSign({
  x,
  y,
  width,
  text,
  board,
  stripe,
  ink,
  fontSize,
}: {
  x: number;
  y: number;
  width: number;
  text: string;
  board: string;
  stripe: string;
  ink: string;
  fontSize: number;
}) {
  const w = width / 2;
  const h = 34;
  const outline = `M${-w} 0Q${-w}${-h} ${-w + 60}${-h}H${w - 90}Q${w - 10}${-h} ${w + 30} 0Q${w - 10} ${h} ${w - 90} ${h}H${-w + 60}Q${-w} ${h} ${-w} 0Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={outline}
        transform="translate(5 7)"
        fill="#000000"
        opacity=".14"
      />
      <path d={outline} fill={board} stroke="#3d2a1a" strokeWidth="4" />
      <path
        d={`M${w - 70}${-h + 3}Q${w + 6}${-h + 6} ${w + 24}-6`}
        fill="none"
        stroke={stripe}
        strokeWidth="10"
      />
      <path
        d={`M${-w + 18}-12Q${-w + 20}${-h + 12} ${-w + 64}${-h + 10}H${w - 120}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".55"
      />
      <path d={`M${-w + 14} 22H${w - 60}`} stroke={stripe} strokeWidth="5" />
      <text
        x="-10"
        y={fontSize * 0.36}
        textAnchor="middle"
        fontSize={fontSize}
        fill={ink}
        letterSpacing="1"
      >
        {text}
      </text>
    </g>
  );
}

function ArrowSign({
  x,
  y,
  text,
  width,
  direction,
}: {
  x: number;
  y: number;
  text: string;
  width: number;
  direction: 1 | -1;
}) {
  const w = width / 2;
  const tip = direction * (w + 26);
  const back = -direction * w;
  const front = direction * w;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="4" rx="30" ry="6" fill="#9c6a3a" opacity=".3" />
      <path d="M-7 0V-108H7V0Z" fill="#7d5130" />
      <path d="M-7 0V-108H-1V0Z" fill="#94643c" />
      <path
        d={`M${back}-128H${front}L${tip}-102L${front}-76H${back}Z`}
        fill="#c98a4b"
        stroke="#6a4020"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {[-118, -100, -86].map((gy) => (
        <path
          key={gy}
          d={`M${back + 10} ${gy}q${w * 0.5}-4 ${w}0t${w * 0.8} 0`}
          fill="none"
          stroke="#a96d36"
          strokeWidth="2"
        />
      ))}
      <circle cx={back + 12 * direction} cy="-102" r="3.5" fill="#6a4020" />
      <text
        x={direction * 10}
        y="-92"
        textAnchor="middle"
        fontSize="26"
        fill="#fff3dc"
        stroke="#5a3418"
        strokeWidth="5"
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {text}
      </text>
    </g>
  );
}

function LoungeChair({
  x,
  y,
  towel,
  flip = 1,
}: {
  x: number;
  y: number;
  towel: string;
  flip?: 1 | -1;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <ellipse cx="6" cy="4" rx="74" ry="9" fill="#b07a45" opacity=".3" />
      <path
        d="M-56 0V-18M40 0V-20M-30-18L-36 0"
        stroke="#e9eef0"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M-62-22H34L64-66L56-70L28-30H-62Z" fill="#ffffff" />
      <path d="M-62-26H30L58-66" fill="none" stroke="#9ab4bc" strokeWidth="3" />
      <path d="M-54-30H24L50-64" fill="none" stroke={towel} strokeWidth="12" />
      <path
        d="M-40-30H6"
        stroke="#ffffff"
        strokeWidth="4"
        strokeDasharray="8 8"
      />
    </g>
  );
}

function Umbrella({
  x,
  y,
  colors,
  scale = 1,
}: {
  x: number;
  y: number;
  colors: readonly [string, string];
  scale?: number;
}) {
  const panels = 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="14" cy="4" rx="120" ry="14" fill="#b07a45" opacity=".22" />
      <path d="M0 0V-176" stroke="#f3eee4" strokeWidth="6" />
      {Array.from({ length: panels }, (_, i) => {
        const a = -120 + (i * 240) / panels;
        const b = -120 + ((i + 1) * 240) / panels;
        return (
          <path
            key={i}
            d={`M0-180L${a}-120Q${(a + b) / 2}-106 ${b}-120Z`}
            fill={colors[i % 2]}
            stroke="#00000018"
            strokeWidth="2"
          />
        );
      })}
      <circle cy="-184" r="7" fill={colors[0]} />
    </g>
  );
}

function PawPrint({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#d79b63" opacity=".7">
      <ellipse rx="9" ry="6" />
      {[-9, -3, 3, 9].map((tx) => (
        <ellipse
          key={tx}
          cx={tx}
          cy={-9 + Math.abs(tx) * 0.3}
          rx="3"
          ry="2.4"
        />
      ))}
    </g>
  );
}

const EntrySky = memo(function EntrySky() {
  return (
    <>
      <defs>
        <linearGradient id="soe-sky" x2="0" y2="1">
          <stop stopColor="#2fb2e6" />
          <stop offset=".55" stopColor="#8fdcf4" />
          <stop offset="1" stopColor="#e9fbf6" />
        </linearGradient>
        <radialGradient id="soe-sun-glow">
          <stop offset="0" stopColor="#fff8c8" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff2a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="soe-deck" x2="0" y2="1">
          <stop stopColor="#f6d9ab" />
          <stop offset="1" stopColor="#eab37c" />
        </linearGradient>
        <linearGradient id="soe-pool-water" x2="0" y2="1">
          <stop stopColor="#1478a8" />
          <stop offset=".35" stopColor="#25aed2" />
          <stop offset=".72" stopColor="#6fdce2" />
          <stop offset="1" stopColor="#d4f4e2" />
        </linearGradient>
        <linearGradient id="soe-stone" x2="0" y2="1">
          <stop stopColor="#f3e3c2" />
          <stop offset="1" stopColor="#d8bd8c" />
        </linearGradient>
        <linearGradient id="soe-pour" x2="0" y2="1">
          <stop stopColor="#c9f6ff" />
          <stop offset="1" stopColor="#48c3dc" />
        </linearGradient>
        <pattern
          id="soe-awning"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <rect width="14" height="28" fill="#ff6f59" />
          <rect x="14" width="14" height="28" fill="#fff7ec" />
        </pattern>
        <pattern
          id="soe-pool-tile"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <rect width="22" height="22" fill="#1b85a8" />
          <path d="M0 0H22M0 0V22" stroke="#4bb4cf" strokeWidth="2" />
        </pattern>
        <clipPath id="soe-pool-clip">
          <ellipse cx={POOL.cx} cy={POOL.cy} rx={POOL.rx} ry={POOL.ry} />
        </clipPath>
        <path id="soe-arch-curve" d="M30 268Q160 140 290 268" />
      </defs>
      <rect width="2800" height="720" fill="url(#soe-sky)" />
      <circle cx="2500" cy="96" r="190" fill="url(#soe-sun-glow)" />
      <circle cx="2500" cy="96" r="58" fill="#fff4b0" />
      <circle cx="2500" cy="96" r="46" fill="#fffbe0" />
    </>
  );
});

const EntrySkyline = memo(function EntrySkyline() {
  return (
    <>
      <path
        d="M0 360Q240 290 520 336T1080 320T1660 300T2240 320T2800 296V440H0Z"
        fill="#b5e6d4"
      />
      <path
        d="M0 392Q300 340 640 380T1300 368T1980 372T2800 360V440H0Z"
        fill="#74c9a2"
      />
      {JUNGLE_PALMS.map((px, i) => {
        const top = 300 + (i % 3) * 18;
        return (
          <g key={px} stroke="#4fae86" fill="none" strokeLinecap="round">
            <path
              d={`M${px} 400Q${px + 8} ${top + 40} ${px - 6} ${top}`}
              strokeWidth="7"
            />
            {[-150, -105, -60, -15, 30].map((a) => (
              <path
                key={a}
                transform={`translate(${px - 6} ${top}) rotate(${a})`}
                d="M0 0Q30-14 58 4"
                strokeWidth="9"
              />
            ))}
          </g>
        );
      })}
      <g transform="translate(520 404) scale(.6)" opacity=".5">
        <SlideTower />
      </g>
      <g transform="translate(1560 430)">
        <SlideTower />
        <SlidePictureSign />
      </g>
      {BUSHES.map((bush, i) => (
        <g key={i}>
          <circle
            cx={bush.x}
            cy={bush.y}
            r={bush.r}
            fill={i % 2 ? "#3aa877" : "#4fbd8a"}
          />
          <path
            d={`M${bush.x - bush.r * 0.5} ${bush.y - bush.r * 0.3}q${bush.r * 0.3}-${bush.r * 0.4} ${bush.r * 0.7}-${bush.r * 0.2}`}
            fill="none"
            stroke="#7fd8a8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {bush.flower && (
            <g transform={`translate(${bush.x + 8} ${bush.y - 6})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  transform={`rotate(${a}) translate(0 -6)`}
                  rx="4"
                  ry="6"
                  fill="#ff5f84"
                />
              ))}
              <circle r="3" fill="#ffe066" />
            </g>
          )}
        </g>
      ))}

      {/* Entrance arch with a sun-lion crest */}
      <g>
        {[30, 240].map((px) => (
          <g key={px}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect
                key={i}
                x={px}
                y={430 - i * 38}
                width="50"
                height="38"
                rx="5"
                fill={i % 2 ? "#ffd25a" : "#2aa6b8"}
                stroke="#1d6f7d"
                strokeWidth="3"
              />
            ))}
            <rect
              x={px - 8}
              y="460"
              width="66"
              height="12"
              rx="4"
              fill="#1d6f7d"
            />
          </g>
        ))}
        <path
          d="M30 268Q160 140 290 268"
          fill="none"
          stroke="#1d6f7d"
          strokeWidth="66"
        />
        <path
          d="M30 268Q160 140 290 268"
          fill="none"
          stroke="#ff7a5c"
          strokeWidth="56"
        />
        <path
          d="M30 268Q160 140 290 268"
          fill="none"
          stroke="#ffa184"
          strokeWidth="6"
          transform="translate(0 -20)"
        />
        <text fontSize="30" fill="#fff6e3" dy="10" letterSpacing="2">
          <textPath
            href="#soe-arch-curve"
            startOffset="50%"
            textAnchor="middle"
          >
            SPLASH OASIS
          </textPath>
        </text>
        <g transform="translate(160 160)">
          <LionFace r={30} />
        </g>
      </g>

      {/* Wave generator house behind the pool */}
      <g>
        <rect x="690" y="345" width="420" height="88" fill="#f3e1c1" />
        <rect x="690" y="408" width="420" height="25" fill="#e4cba0" />
        <rect x="680" y="332" width="440" height="16" rx="4" fill="#ff7a5c" />
        <path d="M680 348H1120" stroke="#c2412f" strokeWidth="3" opacity=".6" />
        {[740, 820, 900, 980, 1060].map((gx) => (
          <g key={gx}>
            <path
              d={`M${gx - 28} 433V398Q${gx - 28} 380 ${gx} 380Q${gx + 28} 380 ${gx + 28} 398V433Z`}
              fill="#245f6e"
              stroke="#c9a978"
              strokeWidth="4"
            />
            {[-14, 0, 14].map((bx) => (
              <path
                key={bx}
                d={`M${gx + bx} 384V433`}
                stroke="#f3e1c1"
                strokeWidth="3"
              />
            ))}
          </g>
        ))}
        {[700, 1100].map((fx) => (
          <g key={fx}>
            <path d={`M${fx} 332V286`} stroke="#5c6f78" strokeWidth="4" />
            <path d={`M${fx} 286L${fx + 30} 296L${fx} 306Z`} fill="#ffc93c" />
          </g>
        ))}
        <path d="M800 332V306M1000 332V306" stroke="#6a4020" strokeWidth="8" />
        <SurfboardSign
          x={900}
          y={296}
          width={430}
          text="TSUNAMI WAVE POOL"
          board="#ffd447"
          stripe="#ff6f59"
          ink="#1d5f75"
          fontSize={30}
        />
      </g>
    </>
  );
});

const EntryDeck = memo(function EntryDeck() {
  const { cx, cy, rx, ry } = POOL;
  return (
    <>
      <rect
        y={DECK_TOP}
        width="2800"
        height={720 - DECK_TOP}
        fill="url(#soe-deck)"
      />
      <rect y={DECK_TOP - 5} width="2800" height="9" fill="#fff4e0" />
      {DECK_ROWS.map((ry2, i) => (
        <g key={ry2}>
          <path
            d={`M0 ${ry2}H2800`}
            stroke="#d39a63"
            strokeWidth={1.5 + i * 0.25}
            opacity=".6"
          />
          <path
            d={`M0 ${ry2 + 2 + i * 0.2}H2800`}
            stroke="#fff3dc"
            strokeWidth="1.5"
            opacity=".5"
          />
        </g>
      ))}
      {DECK_COLUMNS.map((col) => (
        <path
          key={col.top}
          d={`M${col.top} ${DECK_TOP}L${col.bottom} 720`}
          stroke="#d39a63"
          strokeWidth="2"
          opacity=".45"
        />
      ))}
      {/* Wet sheen around the pool */}
      <ellipse
        cx={cx}
        cy={cy + 118}
        rx="560"
        ry="34"
        fill="#d9a06b"
        opacity=".35"
      />
      <ellipse
        cx={cx - 80}
        cy={cy + 120}
        rx="300"
        ry="9"
        fill="#ffffff"
        opacity=".25"
      />

      {/* Wave pool: coping, back wall, beach-entry water */}
      <ellipse
        cx={cx}
        cy={cy + 6}
        rx={rx + 30}
        ry={ry + 20}
        fill="#fff7ea"
        stroke="#e0ad78"
        strokeWidth="4"
      />
      <ellipse cx={cx} cy={cy + 2} rx={rx + 10} ry={ry + 6} fill="#e5d2b0" />
      <g clipPath="url(#soe-pool-clip)">
        <rect
          x={cx - rx}
          y={cy - ry}
          width={rx * 2}
          height={ry * 2}
          fill="url(#soe-pool-tile)"
        />
        <ellipse
          cx={cx}
          cy={cy + 22}
          rx={rx + 6}
          ry={ry}
          fill="url(#soe-pool-water)"
        />
        <ellipse
          cx={cx + 40}
          cy={cy + 96}
          rx="380"
          ry="44"
          fill="#f6e6bd"
          opacity=".45"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M${cx - 380 + i * 130} ${cy + 10 + (i % 3) * 18}q20-10 40 0t40 0t40 0`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            opacity=".25"
          />
        ))}
      </g>
      <path
        d={`M${cx - rx} ${cy}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`}
        fill="none"
        stroke="#0f5f80"
        strokeWidth="4"
        opacity=".5"
      />
      <path
        d="M520 470Q900 506 1280 470"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
      />
      {ROPE_BUOYS.map((b) => (
        <g key={b.x}>
          <ellipse
            cx={b.x}
            cy={b.y}
            rx="8"
            ry="6"
            fill={b.coral ? "#ff5a48" : "#ffffff"}
            stroke="#00000022"
          />
          <ellipse
            cx={b.x - 2}
            cy={b.y - 2}
            rx="3"
            ry="1.5"
            fill="#ffffff"
            opacity=".7"
          />
        </g>
      ))}
      {/* Chrome pool ladder */}
      <g fill="none" stroke="#c9d6dc" strokeWidth="5" strokeLinecap="round">
        <path d="M1220 448V418Q1220 404 1234 404Q1246 404 1246 416" />
        <path d="M1250 452V422Q1250 408 1264 408Q1276 408 1276 420" />
      </g>

      {/* Lion-head fountain on a tiled pillar */}
      <g transform="translate(395 450)">
        <ellipse cy="4" rx="46" ry="9" fill="#b07a45" opacity=".3" />
        <rect x="-32" y="-96" width="64" height="96" fill="url(#soe-stone)" />
        <rect x="-32" y="-60" width="64" height="18" fill="#2aa6b8" />
        <path
          d="M-32-60H32M-32-42H32M-16-60V-42M0-60V-42M16-60V-42"
          stroke="#1d6f7d"
          strokeWidth="2"
        />
        <rect x="-40" y="-108" width="80" height="14" rx="4" fill="#e8d2a6" />
        <g transform="translate(4 -136)">
          <LionFace r={30} />
          <ellipse cx="24" cy="14" rx="9" ry="7" fill="#7a3f1a" />
        </g>
      </g>
    </>
  );
});

const EntryProps = memo(function EntryProps() {
  return (
    <>
      {PUDDLES.map(([px, py, prx, pry]) => (
        <g key={px}>
          <ellipse
            cx={px}
            cy={py}
            rx={prx}
            ry={pry}
            fill="#9fdde6"
            opacity=".7"
          />
          <ellipse
            cx={px - prx * 0.25}
            cy={py - pry * 0.3}
            rx={prx * 0.4}
            ry={pry * 0.25}
            fill="#ffffff"
            opacity=".7"
          />
        </g>
      ))}
      {PAW_PRINTS.map((p) => (
        <PawPrint key={p.x} x={p.x} y={p.y} />
      ))}

      <Umbrella x={1590} y={474} colors={["#ff6f59", "#fff7ec"]} scale={0.9} />
      <LoungeChair x={1560} y={480} towel="#2fb3c6" />

      {/* Lifeguard chair */}
      <g transform="translate(1400 598)">
        <ellipse cx="0" cy="4" rx="70" ry="10" fill="#b07a45" opacity=".3" />
        <path
          d="M-42 0L-24-150M42 0L24-150M-36-50H36M-30-100H30"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M-42 0L-24-150M42 0L24-150"
          stroke="#c7d3d8"
          strokeWidth="3"
          transform="translate(3 0)"
        />
        <rect x="-34" y="-162" width="68" height="14" rx="4" fill="#ff5a48" />
        <path
          d="M-30-162V-206H30V-162"
          fill="none"
          stroke="#ff5a48"
          strokeWidth="8"
        />
        <path d="M0-206V-250" stroke="#e9eef0" strokeWidth="4" />
        <path
          d="M-56-236Q0-282 56-236Z"
          fill="#ffc93c"
          stroke="#d48a12"
          strokeWidth="3"
        />
        <g transform="translate(0 -76)">
          <circle r="18" fill="none" stroke="#ff5a48" strokeWidth="9" />
          <circle
            r="18"
            fill="none"
            stroke="#ffffff"
            strokeWidth="9"
            strokeDasharray="14 14"
          />
        </g>
      </g>

      {/* Foot shower post */}
      <g transform="translate(250 606)">
        <ellipse rx="34" ry="8" fill="#8fd2dc" opacity=".8" />
        <path
          d="M-14 0H14"
          stroke="#7f8f96"
          strokeWidth="4"
          strokeDasharray="3 3"
        />
        <path
          d="M0 0V-150Q0-166 18-166H34"
          fill="none"
          stroke="#c9d6dc"
          strokeWidth="9"
        />
        <path
          d="M0 0V-150Q0-166 18-166H34"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <ellipse cx="38" cy="-160" rx="14" ry="6" fill="#9aa9b0" />
        <rect x="-8" y="-94" width="16" height="10" rx="3" fill="#2fb3c6" />
      </g>

      {/* Cabana with striped canvas roof */}
      <g transform="translate(2400 528)">
        <ellipse cy="6" rx="170" ry="18" fill="#b07a45" opacity=".28" />
        <rect x="-140" y="-14" width="280" height="16" rx="3" fill="#c48a52" />
        <rect x="-140" y="-2" width="280" height="6" fill="#9a6538" />
        <rect x="-96" y="-66" width="192" height="52" rx="10" fill="#ffffff" />
        <rect x="-96" y="-38" width="192" height="24" rx="6" fill="#e8f1f2" />
        <ellipse cx="-62" cy="-66" rx="26" ry="14" fill="#ff6f59" />
        <ellipse cx="62" cy="-66" rx="26" ry="14" fill="#ffc93c" />
        <path d="M-20-52H40V-36H-20Z" fill="#2fb3c6" />
        {[-122, 122].map((px) => (
          <g key={px}>
            <path d={`M${px} -14V-196`} stroke="#c9a26a" strokeWidth="10" />
            {[-50, -100, -150].map((by) => (
              <path
                key={by}
                d={`M${px - 6} ${by}h12`}
                stroke="#8d6a3c"
                strokeWidth="3"
              />
            ))}
          </g>
        ))}
        <path
          d="M-122-190Q-96-120-118-40Q-90-110-96-190Z"
          fill="#2fb3c6"
          opacity=".9"
        />
        <path
          d="M122-190Q96-120 118-40Q90-110 96-190Z"
          fill="#2fb3c6"
          opacity=".9"
        />
        <path d="M-160-190L0-262L160-190Z" fill="url(#soe-awning)" />
        <path
          d="M-160-190L0-262L160-190Z"
          fill="none"
          stroke="#c2412f"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d={`M${-160 + i * 32}-190q16 22 32 0Z`}
            fill={i % 2 ? "#fff7ec" : "#ff6f59"}
            stroke="#c2412f"
            strokeWidth="2"
          />
        ))}
        <rect
          x="-58"
          y="-234"
          width="116"
          height="34"
          rx="6"
          fill="#fff3dc"
          stroke="#6a4020"
          strokeWidth="3"
        />
        <text y="-208" textAnchor="middle" fontSize="24" fill="#8a4f22">
          CABANA
        </text>
      </g>

      <ArrowSign x={130} y={560} width={190} text="← DOWNTOWN" direction={-1} />
      <ArrowSign
        x={2700}
        y={560}
        width={176}
        text="LAZY RIVER →"
        direction={1}
      />
    </>
  );
});

const FortressFrame = memo(function FortressFrame() {
  const posts = [-150, -55, 55, 150] as const;
  return (
    <g>
      <ellipse cy="8" rx="230" ry="30" fill="#b07a45" opacity=".3" />
      <ellipse
        rx="214"
        ry="30"
        fill="#8fe3ec"
        stroke="#4fc0d2"
        strokeWidth="4"
      />
      <ellipse
        rx="150"
        ry="20"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        opacity=".6"
      />
      <ellipse
        rx="70"
        ry="10"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        opacity=".6"
      />
      {posts.map((px) => (
        <rect
          key={`b${px}`}
          x={px + 14}
          y="-312"
          width="12"
          height="300"
          fill="#56b5c4"
        />
      ))}
      {/* Mini slide off the first deck */}
      <g fill="none" strokeLinecap="round">
        <path
          d="M150-124C230-120 250-40 312-10"
          stroke="#c48311"
          strokeWidth="40"
        />
        <path
          d="M150-124C230-120 250-40 312-10"
          stroke="#ffc93c"
          strokeWidth="32"
        />
        <path
          d="M150-124C230-120 250-40 312-10"
          stroke="#ffe08a"
          strokeWidth="12"
        />
      </g>
      {posts.map((px) => (
        <g key={px}>
          <rect x={px - 8} y="-310" width="16" height="310" fill="#1d8a9e" />
          <rect x={px + 2} y="-310" width="6" height="310" fill="#156c7d" />
          {[-60, -180, -270].map((by) => (
            <rect
              key={by}
              x={px - 9}
              y={by}
              width="18"
              height="8"
              fill="#ffc93c"
            />
          ))}
        </g>
      ))}
      {[-120, -230, -300].map((py) => (
        <g key={py}>
          <rect
            x="-172"
            y={py - 10}
            width="344"
            height="14"
            rx="3"
            fill="#ffc93c"
          />
          <rect x="-172" y={py + 4} width="344" height="7" fill="#d48a12" />
        </g>
      ))}
      {[-120, -230].map((py) => (
        <g key={`r${py}`}>
          {Array.from({ length: 17 }, (_, i) => (
            <path
              key={i}
              d={`M${-160 + i * 20} ${py - 10}V${py - 40}`}
              stroke="#ffffff"
              strokeWidth="4"
            />
          ))}
          <rect
            x="-172"
            y={py - 46}
            width="344"
            height="9"
            rx="4"
            fill="#ff6f59"
          />
        </g>
      ))}
      {/* Ladders */}
      <g stroke="#ff6f59" strokeWidth="6" strokeLinecap="round">
        <path d="M-214 0V-124M-184 0V-124" />
        {[-20, -44, -68, -92, -116].map((ly) => (
          <path key={ly} d={`M-214 ${ly}H-184`} strokeWidth="4" />
        ))}
        <path d="M-120-120V-234M-94-120V-234" />
        {[-142, -164, -186, -208].map((ly) => (
          <path key={ly} d={`M-120 ${ly}H-94`} strokeWidth="4" />
        ))}
      </g>
      {/* Turret roofs at the top corners */}
      {[-150, 150].map((tx) => (
        <g key={tx}>
          <path
            d={`M${tx - 46}-310L${tx}-372L${tx + 46}-310Z`}
            fill="url(#soe-awning)"
          />
          <path
            d={`M${tx - 46}-310L${tx}-372L${tx + 46}-310Z`}
            fill="none"
            stroke="#c2412f"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d={`M${tx}-372V-400`} stroke="#1d6f7d" strokeWidth="4" />
        </g>
      ))}
      {/* Bucket gantry */}
      <path d="M-70-300V-420M70-300V-420" stroke="#c2412f" strokeWidth="12" />
      <path
        d="M-76-420H76"
        stroke="#c2412f"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="-70" cy="-400" r="8" fill="#ffc93c" />
      <circle cx="70" cy="-400" r="8" fill="#ffc93c" />
      {/* Spray nozzles under the first deck and water cannons on the second */}
      {[-110, -36, 36, 110].map((nx) => (
        <rect
          key={nx}
          x={nx - 6}
          y="-108"
          width="12"
          height="14"
          rx="3"
          fill="#ff6f59"
        />
      ))}
      {[-1, 1].map((side) => (
        <g
          key={side}
          transform={`translate(${side * 160} -262) scale(${side} 1)`}
        >
          <circle r="11" fill="#156c7d" />
          <path
            d="M0-6L38-18L42-6L4 6Z"
            fill="#ffc93c"
            stroke="#c48311"
            strokeWidth="3"
          />
        </g>
      ))}
      {/* Hanging plank sign */}
      <path d="M-120-220V-196M120-220V-196" stroke="#6a4020" strokeWidth="3" />
      <rect
        x="-158"
        y="-200"
        width="316"
        height="46"
        rx="8"
        fill="#c98a4b"
        stroke="#6a4020"
        strokeWidth="4"
      />
      <path
        d="M-146-186q80-4 150 0t140 0M-146-168q90-4 170 0t120 0"
        fill="none"
        stroke="#a96d36"
        strokeWidth="2"
      />
      <text
        y="-168"
        textAnchor="middle"
        fontSize="23"
        fill="#fff3dc"
        stroke="#5a3418"
        strokeWidth="5"
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        DUMP BUCKET FORTRESS
      </text>
    </g>
  );
});

const ForegroundLeaves = memo(function ForegroundLeaves() {
  const leaves = [
    [-20, 730, -40, 1.1],
    [60, 740, -12, 0.9],
    [2810, 730, 220, 1.1],
    [2740, 744, 196, 0.9],
  ] as const;
  return (
    <>
      {leaves.map(([lx, ly, angle, s]) => (
        <g
          key={lx}
          transform={`translate(${lx} ${ly}) rotate(${angle}) scale(${s})`}
        >
          <path d="M0 0Q60-120 190-110Q140 10 0 0Z" fill="#23885a" />
          <path
            d="M0 0Q90-60 190-110"
            fill="none"
            stroke="#17633f"
            strokeWidth="4"
          />
          {[50, 90, 130].map((vx) => (
            <path
              key={vx}
              d={`M${vx} ${-vx * 0.55}l-6 30`}
              stroke="#2ea36c"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
    </>
  );
});

// Phase offsets turn the old Math.sin(seconds * k + phase) curves into CSS
// animation delays: delay = -(phase + PI/2) / k lines the cycles back up.

// Clouds creep right and wrap every 3200px; a second copy one wrap to the
// left keeps the sky filled when the first slides off.
const DriftingClouds = memo(function DriftingClouds() {
  return (
    <g
      className="sm-drift"
      style={{ "--sm-dur": `${3200 / 6}s`, "--sm-dist": "3200px" }}
    >
      {CLOUDS.flatMap((cloud) =>
        [0, -3200].map((wrap) => (
          <g
            key={`${cloud.x}${wrap}`}
            transform={`translate(${cloud.x - 200 + wrap} ${cloud.y})`}
            opacity=".92"
          >
            <Cloud s={cloud.s} />
          </g>
        )),
      )}
    </g>
  );
});

const PoolBobbers = memo(function PoolBobbers() {
  return (
    <>
      {(
        [
          [700, 548, "#ff7fb0"],
          [1090, 506, "#ffc93c"],
        ] as const
      ).map(([fx, fy, color], i) => {
        const phase = {
          "--sm-dur": `${Math.PI / 1.6}s`,
          "--sm-delay": `${-(i * 2 + Math.PI / 2) / 1.6}s`,
        };
        return (
          <g key={color} transform={`translate(${fx} ${fy})`}>
            <g className="sm-bob" style={{ ...phase, "--sm-amp": "4px" }}>
              <g
                className="sm-sway"
                style={{
                  ...phase,
                  "--sm-deg": "8deg",
                  "--sm-origin": "50% 50%",
                }}
              >
                {/* Invisible ring centres the rock on the float's middle. */}
                <circle r="40" fill="none" />
                <ellipse cy="6" rx="34" ry="12" fill="#0f5f80" opacity=".25" />
                <ellipse rx="32" ry="14" fill={color} />
                <ellipse rx="13" ry="5" fill="#2bb0d2" />
                <path
                  d="M-24-6Q0-14 24-6"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  opacity=".7"
                />
              </g>
            </g>
          </g>
        );
      })}
      {/* Sparkles pulse between half and full size. */}
      {POOL_SPARKLES.map(([sx, sy], i) => (
        <g key={sx} transform={`translate(${sx} ${sy})`}>
          <path
            className="sm-pulse"
            d="M0-5L1-1L5 0L1 1L0 5L-1 1L-5 0L-1-1Z"
            fill="#ffffff"
            style={{
              "--sm-dur": `${Math.PI / 5.2}s`,
              "--sm-delay": `${(-i * 1.7) / 2.6}s`,
              "--sm-scale": 2,
            }}
          />
        </g>
      ))}
    </>
  );
});

const SplashPadGeysers = memo(function SplashPadGeysers() {
  // Columns stretch between 20 and 56 tall with their droplets riding on top.
  return (
    <>
      {[-90, 0, 90].map((gx, i) => {
        const phase = {
          "--sm-dur": `${Math.PI / 3}s`,
          "--sm-delay": `${-(i * 2 + (3 * Math.PI) / 2) / 3}s`,
        };
        return (
          <g key={gx}>
            <path
              className="sm-pulse"
              d={`M${gx - 6} -2Q${gx} ${-56 * 1.1} ${gx + 6} -2Z`}
              fill="#c9f6ff"
              opacity=".85"
              style={{
                ...phase,
                "--sm-scale": `1, ${20 / 56}`,
                "--sm-origin": "50% 100%",
              }}
            />
            <g className="sm-glide" style={{ ...phase, "--sm-y": "36px" }}>
              <circle cx={gx - 8} cy={-56} r="4" fill="#c9f6ff" />
              <circle cx={gx + 9} cy={-56 + 8} r="3" fill="#c9f6ff" />
            </g>
          </g>
        );
      })}
    </>
  );
});

export function SplashOasisEntryScenery({ seconds }: { seconds: number }) {
  const timeMs = seconds * 1000;
  const bucket = calculateBucketCycle(timeMs);
  const pour = bucket.isDumping ? 0.9 : (bucket.splashRadius / 180) * 0.7;
  // Dashes crawling along curved streams and the rolling wave crests, which
  // change shape as they travel, stay on seconds with the bucket cycle.
  const flow = seconds * 70;
  const { cx, cy, rx, ry } = POOL;

  return (
    <>
      <EntrySky />
      <DriftingClouds />
      <EntrySkyline />
      <EntryDeck />

      {/* Rolling wave crests, floats and sparkles inside the pool */}
      <g clipPath="url(#soe-pool-clip)">
        {[0, 1, 2].map((i) => {
          const p = (seconds * 0.12 + i / 3) % 1;
          const y = cy - ry + 30 + p * (ry * 2 - 40);
          const half =
            rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)) * 0.94;
          const bob = calculateWaveOffset(timeMs, 900 + i * 300) * 0.35;
          const lift = 6 + p * 10;
          return (
            <g key={i} opacity={1 - p * 0.5}>
              <path
                d={`M${cx - half} ${y + bob}Q${cx - half / 2} ${y - lift + bob} ${cx} ${y}T${cx + half} ${y - bob}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth={6 + p * 8}
                strokeLinecap="round"
              />
              <path
                d={`M${cx - half * 0.9} ${y + 8 + bob}Q${cx - half / 2} ${y + 2 + bob} ${cx} ${y + 8}T${cx + half * 0.9} ${y + 8 - bob}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="18 14"
                opacity=".55"
              />
            </g>
          );
        })}
        <PoolBobbers />
      </g>

      {/* Lion fountain arc into the pool */}
      <path
        d="M424 324Q480 290 524 486"
        fill="none"
        stroke="#9fe8f6"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".9"
      />
      <path
        d="M424 324Q480 290 524 486"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeDasharray="12 10"
        strokeDashoffset={-flow}
        strokeLinecap="round"
      />
      <ellipse
        className="sm-pulse"
        cx="524"
        cy="488"
        rx="12"
        ry="5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        style={{
          "--sm-dur": `${Math.PI / 5}s`,
          "--sm-delay": `${-Math.PI / 2 / 5}s`,
          "--sm-scale": `${20 / 12}, 1`,
        }}
      />

      <EntryProps />

      {/* Foot shower drips */}
      {/* Turned a quarter so sm-drift's travel falls 148px, then repeats. */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${288 + (i - 1) * 6} 452) rotate(90)`}>
          <circle
            className="sm-drift"
            r="3"
            fill="#7fd7e6"
            style={{
              "--sm-dur": `${148 / 140}s`,
              "--sm-delay": `${-(i * 50) / 140}s`,
              "--sm-dist": "148px",
            }}
          />
        </g>
      ))}

      <g transform="translate(1900 580)">
        <FortressFrame />
        {/* Ground geysers on the splash pad */}
        <SplashPadGeysers />
        {/* Spray curtains under the first deck */}
        {[-110, -36, 36, 110].map((nx) => (
          <path
            key={nx}
            d={`M${nx - 4} -94L${nx - 22} -6M${nx} -94V-6M${nx + 4} -94L${nx + 22} -6`}
            stroke="#c9f6ff"
            strokeWidth="3"
            strokeDasharray="8 10"
            strokeDashoffset={-flow}
            opacity=".85"
          />
        ))}
        {/* Water cannon streams */}
        {[-1, 1].map((side) => {
          const arc = `M${side * 202} -282Q${side * 300} -320 ${side * 262} -6`;
          return (
            <g key={side} fill="none" strokeLinecap="round">
              <path d={arc} stroke="#bdf1fa" strokeWidth="9" opacity=".85" />
              <path
                d={arc}
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="14 12"
                strokeDashoffset={-flow}
              />
              <ellipse
                className="sm-pulse"
                cx={side * 262}
                cy="-4"
                rx="9"
                ry="4"
                stroke="#ffffff"
                strokeWidth="3"
                style={{
                  "--sm-dur": `${Math.PI / 5}s`,
                  "--sm-delay": `${-(side + Math.PI / 2) / 5}s`,
                  "--sm-scale": `${15 / 9}, 1`,
                }}
              />
            </g>
          );
        })}
        {/* Slide water */}
        <path
          d="M150-124C230-120 250-40 312-10"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeDasharray="10 16"
          strokeDashoffset={-flow}
          opacity=".8"
        />
        <ellipse
          className="sm-pulse"
          cx="318"
          cy="-6"
          rx="16"
          ry="6"
          fill="#c9f6ff"
          style={{
            "--sm-dur": `${Math.PI / 4}s`,
            "--sm-delay": `${-Math.PI / 2 / 4}s`,
            "--sm-scale": "1.5, 1",
          }}
        />
        {/* Turret pennants */}
        {/* Pennants flap on their poles. */}
        {[-150, 150].map((tx, i) => (
          <path
            key={tx}
            className="sm-sway"
            d={`M${tx}-400Q${tx + 16}-400 ${tx + 32}-392Q${tx + 16}-388 ${tx}-384Z`}
            fill={i ? "#ffc93c" : "#2fb3c6"}
            style={{
              "--sm-dur": `${Math.PI / 3.4}s`,
              "--sm-delay": `${-(i + Math.PI / 2) / 3.4}s`,
              "--sm-deg": "6deg",
              "--sm-origin": "0% 50%",
            }}
          />
        ))}

        {/* Water cascade when the bucket tips */}
        {pour > 0.02 && (
          <g opacity={pour}>
            <path
              d="M48-412Q150-404 168-306H220Q200-410 64-436Z"
              fill="url(#soe-pour)"
            />
            <path d="M164-304H232V-6H160Z" fill="url(#soe-pour)" opacity=".7" />
            {[172, 188, 204, 220].map((wx) => (
              <path
                key={wx}
                d={`M${wx} -300V-10`}
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="22 16"
                strokeDashoffset={-seconds * 260}
                opacity=".8"
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={160 + i * 16}
                cy={-300 - ((seconds * 90 + i * 13) % 40)}
                r={5 - (i % 2)}
                fill="#e8fdff"
              />
            ))}
          </g>
        )}
        {bucket.splashRadius > 0 && (
          <ellipse
            cx="80"
            cy="0"
            rx={bucket.splashRadius}
            ry={bucket.splashRadius * 0.22}
            fill="#c9f6ff"
            opacity={0.25 + pour * 0.4}
            stroke="#ffffff"
            strokeWidth="4"
          />
        )}

        {/* Refill pipe over the bucket */}
        <path
          d="M70-420V-500Q70-512 58-512H0V-492"
          fill="none"
          stroke="#1d8a9e"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        {bucket.tipAngleDeg === 0 && (
          <path
            d="M0-488V-458"
            stroke="#9fe8f6"
            strokeWidth="8"
            strokeDasharray="8 5"
            strokeDashoffset={-flow}
          />
        )}
        {/* Giant tipping bucket */}
        <g transform={`translate(0 -400) rotate(${bucket.tipAngleDeg})`}>
          <path
            d="M-62-56H62L48 46H-48Z"
            fill="#ffb52e"
            stroke="#a8620f"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M-58-30H58M-52 16H52" stroke="#ff6f59" strokeWidth="10" />
          <ellipse
            cy="-56"
            rx="62"
            ry="14"
            fill="#ffd470"
            stroke="#a8620f"
            strokeWidth="4"
          />
          <ellipse
            cy="-55"
            rx="50"
            ry="9"
            fill={bucket.fillPercent > 8 ? "#5fd0e4" : "#d48a12"}
          />
          <PawPrintBadge />
          <circle r="9" fill="#c2412f" />
        </g>
      </g>

      <SplashPalm x={1265} y={436} scale={0.62} sway={1} />
      <SplashPalm x={575} y={432} scale={0.58} lean={-1} sway={-1} />
      <SplashPalm x={2190} y={444} scale={0.6} lean={-1} sway={-1} />
      <ForegroundLeaves />
    </>
  );
}

function PawPrintBadge() {
  return (
    <g transform="translate(0 -4)" fill="#fff3dc">
      <ellipse cy="6" rx="14" ry="10" />
      {[-14, -5, 5, 14].map((tx) => (
        <ellipse key={tx} cx={tx} cy={-10 + Math.abs(tx) * 0.4} rx="5" ry="4" />
      ))}
    </g>
  );
}
