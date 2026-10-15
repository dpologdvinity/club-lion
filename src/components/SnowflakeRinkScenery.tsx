import { memo, type CSSProperties } from "react";

const STAGE_WIDTH = 2400;
const ICE_TOP = 500;

// Rotate about the local origin, like an SVG rotate(), instead of the fill-box.
const PIVOT: CSSProperties = { transformBox: "view-box", "--sm-origin": "0 0" };

// Deterministic flakes: each starts just above the stage and falls past the bottom.
const FLAKES = Array.from({ length: 48 }, (_, i) => ({
  x: (i * 263) % STAGE_WIDTH,
  y: -30 - ((i * 37) % 70),
  r: 1.6 + (i % 4) * 0.8,
  dur: 7 + (i % 6) * 1.1,
  delay: -((i * 0.61) % 8),
}));

const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 709) % STAGE_WIDTH,
  y: 30 + ((i * 53) % 230),
  r: 1 + (i % 3) * 0.6,
}));

const LIGHT_COLORS = ["#ff6b6b", "#ffd93d", "#4d96ff", "#6bcb77", "#ff8fab"];

// Tree tiers: [top y, bottom y, half-width at the bottom] from the star down.
const TREE_TIERS: [number, number, number][] = [
  [150, 260, 70],
  [220, 330, 105],
  [290, 400, 140],
  [360, 470, 175],
];

// Lights sit along each tier's slanted edges, so the tree glows wherever it is lit.
const TREE_LIGHTS = TREE_TIERS.flatMap(([top, bottom, half], tier) =>
  Array.from({ length: 6 + tier * 2 }, (_, i) => {
    const t = (i + 0.5) / (6 + tier * 2);
    const side = i % 2 === 0 ? -1 : 1;
    return {
      x: 1180 + side * half * (0.25 + t * 0.7),
      y: top + (bottom - top) * (0.3 + t * 0.65),
      color: LIGHT_COLORS[(i + tier) % LIGHT_COLORS.length],
      delay: -((i * 0.47 + tier * 0.3) % 2.4),
    };
  }),
);

function Pine({
  x,
  y,
  s,
  shade,
}: {
  x: number;
  y: number;
  s: number;
  shade: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-7" y="-26" width="14" height="30" fill="#5b3f2a" />
      <path d="M0-190L-46-120H46Z" fill={shade} />
      <path d="M0-140L-62-64H62Z" fill={shade} />
      <path d="M0-80L-78-6H78Z" fill={shade} />
      <path d="M0-190L-18-168H18Z" fill="#f4f9ff" />
      <path d="M0-140L-26-118H26Z" fill="#f4f9ff" opacity=".85" />
      <path d="M0-80L-30-58H30Z" fill="#f4f9ff" opacity=".85" />
    </g>
  );
}

function Penguin({
  x,
  y,
  s,
  glide,
  dur,
  delay,
  flip,
}: {
  x: number;
  y: number;
  s: number;
  glide: number;
  dur: number;
  delay: number;
  flip: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="0" cy="42" rx="30" ry="6" fill="#1f4f6e" opacity=".25" />
      <g
        className="sm-glide"
        style={{
          "--sm-x": `${glide}px`,
          "--sm-y": "0px",
          "--sm-dur": `${dur}s`,
          "--sm-delay": `${delay}s`,
        }}
      >
        <g
          className="sm-sway"
          style={{
            "--sm-origin": "50% 100%",
            "--sm-deg": "5deg",
            "--sm-dur": "1.6s",
            "--sm-delay": `${delay}s`,
          }}
        >
          <path
            d="M0-40C-22-40-26-10-24 10C-22 30-12 40 0 40C12 40 22 30 24 10C26-10 22-40 0-40Z"
            fill="#1f2530"
          />
          <path
            d="M0-34C-14-34-16-8-14 10C-12 28-6 34 0 34C6 34 12 28 14 10C16-8 14-34 0-34Z"
            fill="#fff"
          />
          <path d="M-22-8C-30 6-28 20-20 26L-16 14Z" fill="#1f2530" />
          <circle cx="-7" cy="-22" r="3.2" fill="#fff" />
          <circle cx="7" cy="-22" r="3.2" fill="#fff" />
          <circle cx="-7" cy="-22" r="1.6" fill="#1d2b3a" />
          <circle cx="7" cy="-22" r="1.6" fill="#1d2b3a" />
          <path d="M-5-16L0-9L5-16Z" fill="#ffa630" />
          <path d="M-12 40L-18 46H-6Z" fill="#ffa630" />
          <path d="M12 40L6 46H18Z" fill="#ffa630" />
        </g>
      </g>
    </g>
  );
}

function Steam({ x, delay }: { x: number; delay: number }) {
  return (
    <path
      d={`M${x} 0C${x - 10} -10 ${x + 10} -20 ${x} -30S${x - 8} -48 ${x} -58`}
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      className="sm-travel"
      style={{
        "--sm-dist": "-34px",
        "--sm-dur": "2.4s",
        "--sm-delay": `${delay}s`,
      }}
    />
  );
}

export function SnowflakeRinkScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <SnowflakeRinkStage />;
}

const SnowflakeRinkStage = memo(function SnowflakeRinkStage() {
  const penguins = [
    { x: 340, y: 640, s: 1.15, glide: 240, dur: 7, delay: 0, flip: false },
    { x: 1560, y: 690, s: 0.95, glide: -200, dur: 9, delay: -3, flip: true },
    { x: 2010, y: 610, s: 0.8, glide: 150, dur: 6, delay: -1.5, flip: false },
    { x: 900, y: 700, s: 0.85, glide: 120, dur: 5, delay: -2.4, flip: false },
  ];
  const pinesBack = [60, 190, 330, 470, 610, 750, 880, 1010, 1640, 1790, 2330];
  const pinesFront = [
    { x: 40, s: 1.5 },
    { x: 2360, s: 1.6 },
  ];

  return (
    <g className="snowflake-rink-scenery">
      <defs>
        <linearGradient id="sr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f2d5a" />
          <stop offset="40%" stopColor="#4a679c" />
          <stop offset="75%" stopColor="#b9d2e8" />
          <stop offset="100%" stopColor="#eaf4fb" />
        </linearGradient>
        <linearGradient id="sr-ice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef9ff" />
          <stop offset="45%" stopColor="#c6e8f7" />
          <stop offset="100%" stopColor="#9ed0ea" />
        </linearGradient>
        <radialGradient id="sr-tree-glow">
          <stop offset="0%" stopColor="#ffe9a6" stopOpacity=".7" />
          <stop offset="100%" stopColor="#ffe9a6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sr-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f5f86" />
          <stop offset="100%" stopColor="#343f61" />
        </linearGradient>
      </defs>

      <rect width={STAGE_WIDTH} height="720" fill="url(#sr-sky)" />
      {STARS.map((star) => (
        <circle
          key={`${star.x}-${star.y}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#fff"
          className="sm-twinkle"
          style={{
            "--sm-dur": "2.6s",
            "--sm-delay": `${-((star.x % 7) * 0.4)}s`,
          }}
        />
      ))}
      <circle cx="330" cy="130" r="50" fill="#fff8e0" opacity=".9" />
      <circle cx="350" cy="122" r="46" fill="#1f2d5a" opacity=".12" />

      {/* Snowy mountain ridges */}
      <path
        d="M0 420L180 250L330 360L520 200L700 350L880 230L1080 380L1260 210L1460 340L1640 190L1860 350L2040 240L2240 360L2400 280V480H0Z"
        fill="#8fa8cc"
      />
      <path
        d="M180 250L210 280L195 282L180 268L160 282ZM520 200L556 236L530 232L520 224L500 236ZM1260 210L1296 246L1270 242L1260 234L1240 246ZM1640 190L1678 230L1650 226L1640 216L1618 230ZM2240 360L2268 384L2246 380L2240 374L2222 384Z"
        fill="#f4f9ff"
      />
      <path
        d="M0 460L140 380L300 440L470 360L650 450L820 380L1000 460L1200 390L1400 450L1600 370L1800 450L2000 380L2200 455L2400 390V500H0Z"
        fill="#5f7aa6"
      />

      {/* Glow behind the tree and lodge */}
      <ellipse
        cx="1180"
        cy="330"
        rx="260"
        ry="210"
        fill="url(#sr-tree-glow)"
        className="sm-pulse"
        style={{
          ...PIVOT,
          "--sm-origin": "50% 50%",
          "--sm-scale": "1.06",
          "--sm-dur": "3.2s",
        }}
      />

      {/* Back row of snowy pines */}
      {pinesBack.map((x, i) => (
        <Pine
          key={x}
          x={x}
          y={ICE_TOP - 20}
          s={0.9 + (i % 3) * 0.12}
          shade={i % 2 ? "#23583f" : "#2c6b4c"}
        />
      ))}

      {/* Lodge with a chimney */}
      <g>
        <rect x="1900" y="392" width="300" height="118" fill="#8b5e3c" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M1900 ${412 + i * 18}H2200`}
            stroke="#6e4628"
            strokeWidth="3"
          />
        ))}
        <path d="M1870 402L2050 290L2230 402Z" fill="url(#sr-roof)" />
        <path
          d="M1880 404L2050 300L2220 404L2220 392L2050 292L1880 392Z"
          fill="#f4f9ff"
        />
        <rect x="2140" y="300" width="22" height="60" fill="#5a3b2a" />
        <path
          d="M1985 500V448Q1985 430 2010 430H2100Q2125 430 2125 448V500Z"
          fill="#3d2818"
        />
        <path d="M1995 480H2115" stroke="#7b4e2c" strokeWidth="3" />
        <rect
          x="1930"
          y="430"
          width="36"
          height="32"
          rx="3"
          fill="#ffd27a"
          className="sm-flicker"
          style={{ "--sm-dur": "1.6s" }}
        />
        <rect
          x="2160"
          y="430"
          width="36"
          height="32"
          rx="3"
          fill="#ffd27a"
          className="sm-flicker"
          style={{ "--sm-dur": "2.2s" }}
        />
        <path
          d="M2146 300Q2132 286 2146 272T2146 244"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          opacity=".55"
          className="sm-travel"
          style={{ "--sm-dist": "-60px", "--sm-dur": "5s" }}
        />
        <circle
          cx="2151"
          cy="290"
          r="8"
          fill="#fff"
          opacity=".6"
          className="sm-travel"
          style={{
            "--sm-dist": "-120px",
            "--sm-dur": "6s",
            "--sm-delay": "-2s",
          }}
        />
        {[1915, 2040, 2195].map((x) => (
          <circle
            key={x}
            cx={x}
            cy="402"
            r="4.5"
            fill="#ffe9a6"
            className="sm-twinkle"
            style={{ "--sm-dur": "1.9s", "--sm-delay": `${-x / 800}s` }}
          />
        ))}
      </g>

      {/* Christmas-lights tree */}
      <g>
        <rect x="1168" y="450" width="24" height="60" fill="#5a3b2a" />
        {TREE_TIERS.map(([top, bottom, half], tier) => (
          <path
            key={tier}
            d={`M1180 ${top}L${1180 - half} ${bottom}H${1180 + half}Z`}
            fill={tier % 2 ? "#2f7d4f" : "#2a7049"}
            stroke="#1c5235"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ))}
        {TREE_TIERS.map(([, bottom, half], tier) => (
          <path
            key={`garland-${tier}`}
            d={`M${1180 - half * 0.9} ${bottom - 40}Q1180 ${bottom - 4} ${1180 + half * 0.9} ${bottom - 40}`}
            fill="none"
            stroke="#ffd27a"
            strokeWidth="3"
            strokeDasharray="6 6"
            opacity=".85"
          />
        ))}
        <path
          d="M1180 124L1196 144L1218 146L1200 160L1206 182L1180 170L1154 182L1160 160L1142 146L1164 144Z"
          fill="#ffd93d"
          stroke="#d9a21b"
          strokeWidth="2"
          className="sm-pulse"
          style={{
            ...PIVOT,
            "--sm-origin": "50% 50%",
            "--sm-scale": "1.12",
            "--sm-dur": "1.4s",
          }}
        />
        {TREE_LIGHTS.map((light) => (
          <circle
            key={`${light.x}-${light.y}`}
            cx={light.x}
            cy={light.y}
            r="5.5"
            fill={light.color}
            stroke="#fff"
            strokeWidth="1.5"
            className="sm-twinkle"
            style={{
              "--sm-dur": "1.6s",
              "--sm-delay": `${light.delay}s`,
            }}
          />
        ))}
        <circle cx="1140" cy="420" r="5" fill="#ff8fab" />
        <circle cx="1222" cy="392" r="5" fill="#4d96ff" />
        <circle cx="1196" cy="300" r="4.5" fill="#6bcb77" />
      </g>

      {/* Ice */}
      <rect
        x="0"
        y={ICE_TOP}
        width={STAGE_WIDTH}
        height={720 - ICE_TOP}
        fill="url(#sr-ice)"
      />
      <path
        d="M0 610H2400"
        stroke="#3b6fd8"
        strokeWidth="6"
        strokeOpacity=".22"
      />
      <path
        d="M1200 510V720"
        stroke="#d2435a"
        strokeWidth="6"
        strokeOpacity=".3"
      />
      <path
        d="M90 600Q400 560 760 616M1480 640Q1800 596 2200 650M600 690Q900 660 1300 700"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeOpacity=".8"
        strokeLinecap="round"
      />

      {/* Boards and snow piles behind the walkway */}
      <rect x="0" y="494" width={STAGE_WIDTH} height="18" fill="#7a4a2e" />
      <rect
        x="0"
        y="490"
        width={STAGE_WIDTH}
        height="6"
        rx="3"
        fill="#f4f9ff"
      />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse
          key={i}
          cx={(i * 197) % STAGE_WIDTH}
          cy="496"
          rx={30 + (i % 3) * 12}
          ry="8"
          fill="#f4f9ff"
          opacity=".9"
        />
      ))}

      {/* Front pines framing the rink */}
      {pinesFront.map((pine) => (
        <Pine key={pine.x} x={pine.x} y={720} s={pine.s} shade="#1f4f3a" />
      ))}

      {/* Hot cocoa stand */}
      <g>
        <rect x="560" y="450" width="10" height="92" fill="#8a5a33" />
        <rect x="716" y="450" width="10" height="92" fill="#8a5a33" />
        <path d="M548 452H738L728 428H558Z" fill="#d2435a" />
        <path
          d="M566 428L578 452M610 428L622 452M654 428L666 452M698 428L710 452"
          stroke="#fff"
          strokeWidth="8"
        />
        <rect x="552" y="500" width="196" height="40" rx="6" fill="#a3643b" />
        <rect x="552" y="500" width="196" height="8" rx="4" fill="#c97f4f" />
        <path d="M600 520H700" stroke="#7a4a2e" strokeWidth="3" />
        <path
          d="M640 486H676V506Q676 516 658 516Q640 516 640 506Z"
          fill="#fff8ee"
          stroke="#c7a27a"
          strokeWidth="2"
        />
        <path
          d="M640 486H676"
          stroke="#6e4628"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="658" cy="486" rx="20" ry="4" fill="#7a4a2e" />
        <circle cx="644" cy="478" r="8" fill="#fff" />
        <circle cx="662" cy="472" r="9" fill="#fff" />
        <circle cx="676" cy="480" r="7" fill="#fff" />
        <g transform="translate(658 462)">
          <Steam x={-8} delay={0} />
          <Steam x={6} delay={-0.9} />
          <Steam x={0} delay={-1.6} />
        </g>
      </g>

      {/* Skate rental sign at the rink edge */}
      <g>
        <rect x="1274" y="478" width="8" height="62" fill="#6e4628" />
        <rect
          x="1236"
          y="438"
          width="92"
          height="46"
          rx="8"
          fill="#2c6b9a"
          stroke="#fff"
          strokeWidth="3"
        />
        <path
          d="M1262 466L1292 450L1298 462L1268 474Z"
          fill="#e8f3ff"
          stroke="#8fb6d6"
          strokeWidth="2"
        />
        <path
          d="M1262 474L1300 458"
          stroke="#5a7fa3"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M1300 448L1313 470"
          stroke="#e8f3ff"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Penguins sliding on the ice */}
      {penguins.map((p) => (
        <Penguin key={p.x} {...p} />
      ))}

      {/* Falling snow */}
      {FLAKES.map((flake) => (
        <circle
          key={flake.x}
          cx={flake.x}
          cy={flake.y}
          r={flake.r}
          fill="#fff"
          opacity=".9"
          className="sm-travel"
          style={{
            "--sm-dist": "760px",
            "--sm-dur": `${flake.dur}s`,
            "--sm-delay": `${flake.delay}s`,
          }}
        />
      ))}
    </g>
  );
});
