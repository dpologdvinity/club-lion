import { memo } from "react";
import type { JSX } from "react";

const STAGE_WIDTH = 2400;

// Deterministic pines, rapids, pebbles and flowers so the canyon never reshuffles between frames.
const PINES = [
  { x: 330, scale: 0.9 },
  { x: 432, scale: 1.1 },
  { x: 1300, scale: 0.95 },
  { x: 1418, scale: 1.15 },
  { x: 2250, scale: 1 },
];
const RAPIDS = [
  { x: 640, y: 512, scale: 1 },
  { x: 1290, y: 500, scale: 1.2 },
  { x: 2200, y: 516, scale: 0.9 },
];
const PEBBLES = Array.from({ length: 30 }, (_, i) => ({
  x: (i * 317) % STAGE_WIDTH,
  y: 610 + ((i * 53) % 100),
  r: 3 + (i % 4),
}));
const FLOWERS = Array.from({ length: 10 }, (_, i) => ({
  x: 120 + i * 230 + ((i * 37) % 70),
  y: 672 + ((i * 29) % 30),
  fill: i % 2 ? "#ffd166" : "#ff8fa3",
}));

function CanyonPine({
  x,
  y,
  scale,
}: {
  x: number;
  y: number;
  scale: number;
}): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-5" y="-30" width="10" height="32" fill="#6b4a2a" />
      <path d="M0-120L-34-60H34Z" fill="#2f7a4f" />
      <path d="M0-92L-42-28H42Z" fill="#3c8a57" />
    </g>
  );
}

// Sandstone mesa carved into a lion's head: the room's memorable landmark.
function LionRock({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-130 0L-118-70Q-110-84-90-84H90Q110-84 118-70L130 0Z"
        fill="#9b4b31"
      />
      <path d="M-120-40H120" stroke="#7a3822" strokeWidth="4" />
      <path d="M-126-18H126" stroke="#7a3822" strokeWidth="4" />
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={Math.cos(angle) * 92}
            cy={-150 + Math.sin(angle) * 92}
            r="36"
            fill="#f0a062"
          />
        );
      })}
      <circle cx="0" cy="-150" r="80" fill="#d9774a" />
      <circle cx="-46" cy="-130" r="9" fill="#ff9f9f" opacity=".6" />
      <circle cx="46" cy="-130" r="9" fill="#ff9f9f" opacity=".6" />
      <ellipse cx="0" cy="-124" rx="36" ry="26" fill="#ffd7a0" />
      <circle cx="-30" cy="-168" r="9" fill="#4a2418" />
      <circle cx="30" cy="-168" r="9" fill="#4a2418" />
      <circle cx="-27" cy="-171" r="3" fill="#fff" />
      <circle cx="33" cy="-171" r="3" fill="#fff" />
      <path d="M-9-140H9L0-130Z" fill="#4a2418" />
      <path
        d="M0-130V-122M-12-118Q-6-112 0-122Q6-112 12-118"
        fill="none"
        stroke="#4a2418"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function RiverBoulder({
  x,
  y,
  scale,
}: {
  x: number;
  y: number;
  scale: number;
}): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M-46 14Q-44-22-10-26Q30-34 46 4Q44 18 20 18Z"
        fill="#8a5a3c"
        stroke="#5b3a24"
        strokeWidth="3"
      />
      <path
        d="M-30-4Q-10-14 14-8"
        fill="none"
        stroke="#c99a6d"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M-50 18Q-20 26 14 20T52 16"
        fill="none"
        stroke="#f4fbff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".9"
      />
      {[-24, 6, 26].map((sx, i) => (
        <circle
          key={sx}
          className="sm-bob"
          style={{
            "--sm-dur": "0.39s",
            "--sm-amp": "7px",
            "--sm-delay": `${-(((x + i * 2) / 4) % 0.78)}s`,
          }}
          cx={sx}
          cy={-30 - Math.abs(Math.sin(x + i * 2)) * 14}
          r="4"
          fill="#f4fbff"
          opacity=".85"
        />
      ))}
    </g>
  );
}

// Static decoration below: memoized and never given `seconds`, so the 80ms ticks skip them.

const CanyonSky = memo(function CanyonSky(): JSX.Element {
  return (
    <>
      <rect width={STAGE_WIDTH} height="400" fill="url(#cr-sky)" />
      <circle cx="620" cy="110" r="220" fill="url(#cr-sun-glow)" />
      <circle cx="620" cy="110" r="52" fill="#fff3cc" />
    </>
  );
});

const CanyonWalls = memo(function CanyonWalls(): JSX.Element {
  return (
    <>
      <path
        d="M0 380L0 250L220 200L380 260L560 150L760 240L900 190L1100 280L1300 180L1520 250L1700 160L1900 240L2100 170L2400 250L2400 380Z"
        fill="#e7a57e"
      />
      <path
        d="M0 430L0 330L260 300L500 350L760 310L1000 360L1260 320L1500 370L1760 330L2000 360L2240 300L2400 340L2400 440Z"
        fill="#c8714b"
      />
      <path
        d="M0 430L0 380L300 360L620 400L1000 372L1400 404L1800 366L2200 404L2400 384L2400 440Z"
        fill="#9b4b31"
        opacity=".45"
      />
      {/* Rock ledge that closes the gap between the wall and the river */}
      <rect y="428" width={STAGE_WIDTH} height="40" fill="#b8643f" />
      {/* Waterfall spilling from the west wall into the plunge pool */}
      <rect
        x="226"
        y="300"
        width="40"
        height="176"
        rx="20"
        fill="url(#cr-fall)"
      />
      <rect
        x="226"
        y="300"
        width="40"
        height="176"
        rx="20"
        fill="url(#cr-fall-lines)"
      />
      <ellipse cx="246" cy="478" rx="60" ry="14" fill="#f4fbff" opacity=".85" />
      {PINES.map((pine) => (
        <CanyonPine key={pine.x} x={pine.x} y={440} scale={pine.scale} />
      ))}
      <LionRock x={1990} y={430} />
    </>
  );
});

const CanyonRiver = memo(function CanyonRiver(): JSX.Element {
  return (
    <>
      <rect y="462" width={STAGE_WIDTH} height="96" fill="url(#cr-river)" />
      <rect
        className="sm-drift"
        style={{ "--sm-dist": "60px", "--sm-dur": "0.27s" }}
        x="-60"
        y="462"
        width={STAGE_WIDTH + 60}
        height="96"
        fill="url(#cr-foam)"
      />
    </>
  );
});

const CanyonBridge = memo(function CanyonBridge(): JSX.Element {
  return (
    <g>
      <rect x="744" y="400" width="12" height="70" fill="#6b4a2a" />
      <rect x="1444" y="400" width="12" height="70" fill="#6b4a2a" />
      <path
        d="M750 412Q1100 470 1450 412"
        fill="none"
        stroke="#e9d7b3"
        strokeWidth="3"
      />
      <path
        d="M750 452Q1100 490 1450 452"
        fill="none"
        stroke="#8b6540"
        strokeWidth="12"
      />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 760 + i * 63;
        const t = (x - 750) / 700;
        const y = 452 + 19 * Math.sin(Math.PI * t);
        return (
          <path
            key={i}
            d={`M${x} ${y - 7}h18`}
            stroke="#6b4a2a"
            strokeWidth="5"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
});

const CanyonBank = memo(function CanyonBank(): JSX.Element {
  return (
    <>
      <path
        d="M0 552Q380 530 760 556T1520 548T2280 552Q2360 552 2400 546V720H0Z"
        fill="url(#cr-bank)"
      />
      <path
        d="M0 640Q600 618 1200 650T2400 632V720H0Z"
        fill="#b06a3e"
        opacity=".6"
      />
      {PEBBLES.map((pebble, i) => (
        <circle
          key={i}
          cx={pebble.x}
          cy={pebble.y}
          r={pebble.r}
          fill="#a86038"
          opacity=".6"
        />
      ))}
      {FLOWERS.map((flower) => (
        <circle
          key={`${flower.x}-${flower.y}`}
          cx={flower.x}
          cy={flower.y}
          r="5"
          fill={flower.fill}
        />
      ))}
      {/* River Surf dock: the room's activity hotspot at x 1750 */}
      <g transform="translate(1750 530)">
        <rect
          x="-70"
          y="-6"
          width="150"
          height="26"
          rx="4"
          fill="#c58a52"
          stroke="#7a4a22"
          strokeWidth="3"
        />
        <path d="M-60 2H70M-60 12H70" stroke="#9b6a3a" strokeWidth="3" />
        <rect x="-60" y="20" width="8" height="40" fill="#6b4a2a" />
        <rect x="60" y="20" width="8" height="40" fill="#6b4a2a" />
        <ellipse
          cx="46"
          cy="-34"
          rx="10"
          ry="40"
          transform="rotate(18 46 -34)"
          fill="#ffc857"
          stroke="#b5762a"
          strokeWidth="3"
        />
        <path
          d="M40-54L52-14"
          stroke="#ff7a59"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="80" y="-96" width="4" height="92" fill="#6b4a2a" />
        <path d="M84-96L120-86L84-76Z" fill="#ff7a59" />
      </g>
    </>
  );
});

const CanyonPortalSign = memo(function CanyonPortalSign(): JSX.Element {
  return (
    <>
      <rect x="24" y="536" width="8" height="120" fill="#6b4a2a" />
      <g transform="translate(34 552)">
        <path
          d="M0 0L18-16H60V16H18Z"
          fill="#ffc857"
          stroke="#7a4a22"
          strokeWidth="3"
        />
      </g>
    </>
  );
});

const CanyonClouds = memo(function CanyonClouds(): JSX.Element {
  return (
    <>
      <g
        className="sm-drift"
        style={{ "--sm-dist": `${STAGE_WIDTH}px`, "--sm-dur": "480s" }}
      >
        {[0, -STAGE_WIDTH].map((offset) => (
          <g
            key={offset}
            transform={`translate(${offset} 0)`}
            fill="#fff4e0"
            opacity=".8"
          >
            <ellipse cx="380" cy="120" rx="160" ry="30" />
            <ellipse cx="1500" cy="70" rx="210" ry="26" />
            <ellipse cx="2080" cy="160" rx="140" ry="28" />
          </g>
        ))}
      </g>
      {[0, 1].map((i) => (
        <g
          key={i}
          className="sm-bob"
          style={{
            "--sm-dur": "2.42s",
            "--sm-amp": "6px",
            "--sm-delay": `${-(i + Math.PI / 2) / 1.3}s`,
          }}
        >
          <g
            className="sm-drift"
            style={{
              "--sm-dist": `${STAGE_WIDTH + 200}px`,
              "--sm-dur": `${(STAGE_WIDTH + 200) / (18 + i * 5)}s`,
            }}
          >
            {[0, -(STAGE_WIDTH + 200)].map((offset) => (
              <path
                key={offset}
                transform={`translate(${100 + i * 260 + offset} ${170 + i * 40 + Math.sin(i) * 6})`}
                d="M-12 0q6-7 12 0q6-7 12 0"
                fill="none"
                stroke="#7a3b26"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
      ))}
    </>
  );
});

const RapidBoulders = memo(function RapidBoulders(): JSX.Element {
  return (
    <>
      {RAPIDS.map((rock) => (
        <RiverBoulder key={rock.x} x={rock.x} y={rock.y} scale={rock.scale} />
      ))}
    </>
  );
});

export function CanyonRapidsScenery({
  seconds,
}: {
  seconds: number;
}): JSX.Element {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)

  return (
    <g className="canyon-rapids-scenery">
      <defs>
        <linearGradient id="cr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb878" />
          <stop offset="55%" stopColor="#ffd9a0" />
          <stop offset="100%" stopColor="#ffeccc" />
        </linearGradient>
        <radialGradient id="cr-sun-glow">
          <stop offset="0%" stopColor="#fff3cc" stopOpacity=".85" />
          <stop offset="100%" stopColor="#ffc27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cr-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fd0d8" />
          <stop offset="100%" stopColor="#1f7f9a" />
        </linearGradient>
        <linearGradient id="cr-fall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f4fbff" />
          <stop offset="100%" stopColor="#bfe9f2" />
        </linearGradient>
        <linearGradient id="cr-bank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6935c" />
          <stop offset="100%" stopColor="#a86038" />
        </linearGradient>
        <radialGradient id="cr-glow">
          <stop offset="0%" stopColor="#fff0b8" stopOpacity=".9" />
          <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="cr-foam"
          width="60"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 12Q15 0 30 12Q45 24 60 12"
            fill="none"
            stroke="#f4fbff"
            strokeWidth="4"
            opacity=".7"
          />
        </pattern>
        <pattern
          id="cr-fall-lines"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M6 0V40M26 0V40"
            stroke="#ffffff"
            strokeWidth="3"
            opacity=".55"
          />
        </pattern>
      </defs>

      <CanyonSky />
      <CanyonClouds />
      <CanyonWalls />
      <CanyonRiver />
      <RapidBoulders />
      <CanyonBridge />
      <CanyonBank />

      {/* Portal to Downtown Plaza: glowing trail sign pointing west */}
      <circle
        className="sm-pulse"
        style={{ "--sm-dur": "1.43s", "--sm-scale": "1.19" }}
        cx="40"
        cy="600"
        r="64"
        fill="url(#cr-glow)"
      />
      <CanyonPortalSign />
    </g>
  );
}
