import { memo, type CSSProperties } from "react";

const STAGE_WIDTH = 2400;
const RIVER_TOP = 440;
const RIVER_BOTTOM = 548;

// Rotate about the local origin, like an SVG rotate(), instead of the fill-box.
const PIVOT: CSSProperties = { transformBox: "view-box", "--sm-origin": "0 0" };

// Sandstone strata from the canyon rim down to the river, warmest at the bottom.
const STRATA = [
  { y: 80, color: "#e9a46a" },
  { y: 150, color: "#d9834d" },
  { y: 205, color: "#f0b47a" },
  { y: 250, color: "#c96a3d" },
  { y: 300, color: "#e0905a" },
  { y: 350, color: "#b85a34" },
  { y: 395, color: "#d47a48" },
];

// Cliff silhouettes framing the canyon; the river runs along their feet.
const WEST_WALL =
  "M0 104L70 92L150 100L210 84L300 96L380 88L470 112L560 132L590 160L640 168L690 214L730 222L770 278L810 288L840 344L880 356L920 412L960 424L990 450H0Z";
const EAST_WALL =
  "M1860 450L1900 418L1930 410L1960 356L1996 344L2030 286L2070 276L2100 214L2150 204L2190 150L2260 132L2330 122L2400 112V450Z";
const MIDDLE_WALL =
  "M900 450L930 330L1010 318L1060 296L1180 300L1210 274L1350 270L1380 292L1480 296L1520 320L1640 316L1680 290L1760 300L1800 336L1880 344L1920 450Z";

// Deterministic details so the canyon never reshuffles between renders.
const PEBBLES = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 211) % STAGE_WIDTH,
  y: 588 + ((i * 53) % 120),
  rx: 4 + (i % 4) * 2,
  fill: ["#a86a42", "#c98a5c", "#8d5a3a", "#e0b083"][i % 4],
}));
const FLOWERS = Array.from({ length: 14 }, (_, i) => ({
  x: 90 + i * 170 + ((i * 41) % 60),
  y: 640 + ((i * 37) % 60),
  fill: ["#ffd166", "#ff8fa3", "#fff3e0", "#c77dff"][i % 4],
}));
const CRACKS = [
  "M120 120l10 60l-6 50l12 70",
  "M330 110l-8 70l10 60l-6 90",
  "M520 150l6 60l-8 70",
  "M2210 160l-6 80l10 70l-8 80",
  "M2330 130l8 90l-10 80",
];

function Pine({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="2" rx="34" ry="7" fill="#7a3a20" opacity=".25" />
      <rect x="-5" y="-26" width="10" height="28" rx="2" fill="#6b4226" />
      <path d="M0-128L-30-74H30Z" fill="#2c6e49" />
      <path d="M0-104L-40-46H40Z" fill="#357d52" />
      <path d="M0-76L-48-18H48Z" fill="#40905e" />
      <path
        d="M0-128L-30-74H0Z M0-104L-40-46H0Z M0-76L-48-18H0Z"
        fill="#2a6040"
        opacity=".35"
      />
    </g>
  );
}

function Cactus({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="2" rx="26" ry="6" fill="#7a3a20" opacity=".22" />
      <rect x="-10" y="-80" width="20" height="82" rx="10" fill="#4f9a5e" />
      <path
        d="M-10-40h-12q-8 0-8-8v-18"
        fill="none"
        stroke="#4f9a5e"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M10-52h12q8 0 8-8v-14"
        fill="none"
        stroke="#4f9a5e"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path d="M-3-74V-6M3-74V-6" stroke="#3d7d4b" strokeWidth="2" />
      <circle cy="-84" r="7" fill="#ff8fa3" />
      <circle cy="-84" r="3" fill="#ffd166" />
    </g>
  );
}

function Agave({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-60, -35, -12, 12, 35, 60].map((angle, i) => (
        <path
          key={angle}
          transform={`rotate(${angle})`}
          d="M-6 0Q-4-30 0-46Q4-30 6 0Z"
          fill={i % 2 ? "#6fae8a" : "#5d9b78"}
        />
      ))}
    </g>
  );
}

// A sandstone butte carved into a smiling lion: the canyon's landmark.
function LionRock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-150 0L-136-80Q-128-96-104-96H104Q128-96 136-80L150 0Z"
        fill="#b05a35"
      />
      <path d="M-140-56H140M-146-26H146" stroke="#8e4428" strokeWidth="5" />
      {/* A darker rim behind the mane keeps the carving readable against the sky. */}
      {[44, 36].map((r) =>
        Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <circle
              key={`${r}-${i}`}
              cx={Math.cos(angle) * 96}
              cy={-170 + Math.sin(angle) * 96}
              r={r}
              fill={r === 44 ? "#9e4a28" : i % 2 ? "#dc7a40" : "#ea8f50"}
            />
          );
        }),
      )}
      <circle cy="-170" r="88" fill="#9e4a28" />
      <circle cy="-170" r="84" fill="#cc6a3e" />
      <path d="M-84-170a84 84 0 0 0 168 0" fill="#c4643c" opacity=".45" />
      <circle cx="-50" cy="-146" r="10" fill="#ff9f9f" opacity=".6" />
      <circle cx="50" cy="-146" r="10" fill="#ff9f9f" opacity=".6" />
      <ellipse cy="-140" rx="38" ry="28" fill="#ffd7a0" />
      <circle cx="-32" cy="-190" r="10" fill="#4a2418" />
      <circle cx="32" cy="-190" r="10" fill="#4a2418" />
      <circle cx="-28" cy="-194" r="3.5" fill="#fff" />
      <circle cx="36" cy="-194" r="3.5" fill="#fff" />
      <path d="M-10-158H10L0-147Z" fill="#4a2418" />
      <path
        d="M0-147V-138M-14-133Q-7-126 0-138Q7-126 14-133"
        fill="none"
        stroke="#4a2418"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Ibex({
  x,
  y,
  scale = 1,
  flip = false,
  delay,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  delay: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
    >
      <ellipse cy="1" rx="34" ry="5" fill="#5a2a14" opacity=".25" />
      {[-20, -10, 14, 24].map((lx) => (
        <path
          key={lx}
          d={`M${lx}-28L${lx + 1} 0`}
          stroke="#6b4a32"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}
      <ellipse cy="-36" rx="32" ry="16" fill="#c99a6a" />
      <ellipse cx="-2" cy="-28" rx="22" ry="7" fill="#f3e2c8" />
      <path
        d="M-30-40q-8-2-10 6"
        stroke="#8a6a4a"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Head nods as if nibbling the ledge grass. */}
      <g transform="translate(26 -46)">
        <g
          className="sm-sway"
          style={{
            ...PIVOT,
            "--sm-deg": "8deg",
            "--sm-dur": "2.6s",
            "--sm-delay": `${delay}s`,
          }}
        >
          <path
            d="M0 0L10-20"
            stroke="#c99a6a"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <ellipse
            cx="16"
            cy="-24"
            rx="12"
            ry="8"
            transform="rotate(20 16 -24)"
            fill="#c99a6a"
          />
          <path
            d="M4-30Q-6-62 -26-58Q-36-54 -30-40"
            fill="none"
            stroke="#7a5a3a"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${-2 - i * 7} ${-46 - (i % 2) * 6}l5 4`}
              stroke="#5a3e24"
              strokeWidth="2"
            />
          ))}
          <circle cx="16" cy="-28" r="2.4" fill="#2b1a10" />
          <path
            d="M22-18q2 10-3 14"
            stroke="#e9d5b5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M6-28l-8-6"
            stroke="#b38658"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      </g>
    </g>
  );
}

function Eagle({ delay }: { delay: number }) {
  return (
    <g
      className="sm-drift"
      style={{
        "--sm-dist": `${STAGE_WIDTH + 400}px`,
        "--sm-dur": "70s",
        "--sm-delay": `${delay}s`,
      }}
    >
      <g transform="translate(-200 150)">
        <g
          className="sm-bob"
          style={{ "--sm-amp": "14px", "--sm-dur": "3.2s" }}
        >
          {/* Wings tilt gently about the body while the eagle glides. */}
          {[1, -1].map((side) => (
            <path
              key={side}
              className="sm-sway"
              style={{
                ...PIVOT,
                "--sm-deg": "6deg",
                "--sm-dur": "1.6s",
                "--sm-delay": `${side * 0.4}s`,
              }}
              d={
                side === 1
                  ? "M0 0Q-30-26-74-22Q-60-12-70-4Q-50-8-42 2Q-22-2 0 6Z"
                  : "M0 0Q30-26 74-22Q60-12 70-4Q50-8 42 2Q22-2 0 6Z"
              }
              fill="#5b3a26"
            />
          ))}
          <ellipse cx="2" cy="4" rx="10" ry="16" fill="#6b4630" />
          <path d="M-6 18l8 12l8-12Z" fill="#6b4630" />
          <circle cx="2" cy="-12" r="8" fill="#fff8ee" />
          <path d="M2-10l6 4l-6 2Z" fill="#ffc857" />
          <circle cx="0" cy="-14" r="1.6" fill="#2b1a10" />
        </g>
      </g>
    </g>
  );
}

const CanyonSky = memo(function CanyonSky() {
  return (
    <>
      <rect width={STAGE_WIDTH} height="460" fill="url(#cr-sky)" />
      <circle cx="1560" cy="150" r="330" fill="url(#cr-sun-glow)" />
      <g transform="translate(1560 150)" opacity=".22">
        <g className="sm-spin" style={{ "--sm-dur": "120s" }}>
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              transform={`rotate(${i * 36})`}
              d="M-30 80L0 420L30 80Z"
              fill="#fff4cf"
            />
          ))}
        </g>
      </g>
      <circle cx="1560" cy="150" r="74" fill="#ffe7a8" />
      <circle cx="1560" cy="150" r="58" fill="#fff6d6" />
      <g
        className="sm-drift"
        style={{ "--sm-dist": `${STAGE_WIDTH}px`, "--sm-dur": "520s" }}
      >
        {[0, -STAGE_WIDTH].map((offset) => (
          <g key={offset} transform={`translate(${offset} 0)`}>
            {[
              [380, 70, 1],
              [1080, 110, 0.75],
              [1900, 60, 1.1],
            ].map(([cx, cy, s]) => (
              <g key={cx} transform={`translate(${cx} ${cy}) scale(${s})`}>
                <ellipse rx="120" ry="22" fill="#fff1d8" />
                <ellipse cx="-30" cy="-14" rx="56" ry="22" fill="#fff6e6" />
                <ellipse cx="40" cy="-10" rx="44" ry="18" fill="#fff6e6" />
                <ellipse
                  cx="10"
                  cy="10"
                  rx="100"
                  ry="8"
                  fill="#f7c79a"
                  opacity=".6"
                />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* Far mesas fading into the warm haze */}
      <path
        d="M760 330L800 250L900 246L930 270L1020 268L1050 220L1180 216L1210 250L1330 248L1350 230L1460 228L1500 262L1600 260L1640 236L1760 234L1790 270L1900 272L1920 330Z"
        fill="#eab38c"
      />
      <path
        d="M800 262H1900M820 290H1900"
        stroke="#dfa27b"
        strokeWidth="5"
        opacity=".7"
      />
    </>
  );
});

const CanyonWalls = memo(function CanyonWalls() {
  return (
    <>
      {/* Middle canyon walls, hazier with distance */}
      <g clipPath="url(#cr-mid-clip)">
        <rect x="880" y="260" width="1060" height="200" fill="#d78a5e" />
        {[300, 330, 362, 396, 428].map((y, i) => (
          <path
            key={y}
            d={`M880 ${y}Q1180 ${y - 8} 1400 ${y + 4}T1940 ${y}V${y + 16}H880Z`}
            fill={i % 2 ? "#c97a50" : "#e39a6c"}
            opacity=".85"
          />
        ))}
        <rect
          x="880"
          y="260"
          width="1060"
          height="200"
          fill="#ffd9b0"
          opacity=".18"
        />
      </g>
      <g transform="translate(1300 452) scale(.85)">
        <LionRock x={0} y={0} />
      </g>

      {/* West and east canyon walls with sunlit strata */}
      {(["cr-west-clip", "cr-east-clip"] as const).map((clip) => (
        <g key={clip} clipPath={`url(#${clip})`}>
          <rect y="60" width={STAGE_WIDTH} height="400" fill="#c56b3f" />
          {STRATA.map(({ y, color }, i) => (
            <path
              key={y}
              d={`M0 ${y}Q300 ${y - 10} 600 ${y + 2}T1200 ${y}T1800 ${y + 4}T2400 ${y}V${y + 48 - (i % 3) * 8}H0Z`}
              fill={color}
            />
          ))}
          {STRATA.map(({ y }) => (
            <path
              key={y}
              d={`M0 ${y}Q300 ${y - 10} 600 ${y + 2}T1200 ${y}T1800 ${y + 4}T2400 ${y}`}
              fill="none"
              stroke="#8e4428"
              strokeWidth="3"
              opacity=".35"
            />
          ))}
          {CRACKS.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#7a3820"
              strokeWidth="4"
              strokeLinecap="round"
              opacity=".45"
            />
          ))}
          <rect
            y="360"
            width={STAGE_WIDTH}
            height="100"
            fill="url(#cr-foot-shade)"
          />
        </g>
      ))}
      {/* The east wall faces away from the sun, so its cliff face sits in shade */}
      <path d={EAST_WALL} fill="url(#cr-east-shade)" />
      {/* Sunlit rims along the tops of both walls */}
      <path
        d="M0 104L70 92L150 100L210 84L300 96L380 88L470 112L560 132L590 160L640 168L690 214L730 222L770 278L810 288L840 344L880 356L920 412L960 424"
        fill="none"
        stroke="#ffd6a0"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M1900 418L1930 410L1960 356L1996 344L2030 286L2070 276L2100 214L2150 204L2190 150L2260 132L2330 122L2400 112"
        fill="none"
        stroke="#f2b57f"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Ledge pines and shrubs clinging to the terraces */}
      <Pine x={250} y={98} scale={0.55} />
      <Pine x={300} y={98} scale={0.7} />
      <Pine x={2270} y={130} scale={0.6} />
      {[
        [640, 170],
        [740, 224],
        [1980, 348],
        [2120, 208],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <circle r="12" fill="#5d9b5a" />
          <circle cx="12" cy="2" r="9" fill="#4f8a4d" />
        </g>
      ))}
      <Ibex x={2200} y={150} scale={0.9} flip delay={-0.6} />
      <Ibex x={2310} y={124} scale={0.6} flip delay={-1.7} />
      <Ibex x={420} y={98} scale={0.75} delay={-1.1} />
    </>
  );
});

const Waterfall = memo(function Waterfall() {
  return (
    <>
      {/* Water spills from a notch in the west rim down to the river */}
      <path d="M560 132Q580 128 600 136L606 440H556Z" fill="url(#cr-fall)" />
      <g clipPath="url(#cr-fall-clip)">
        <g transform="translate(0 132) rotate(90)">
          <g
            className="sm-drift"
            style={{ "--sm-dist": "60px", "--sm-dur": "0.6s" }}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={i}
                d={`M-60 ${-566 - i * 8}H${330}`}
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="34 26"
                opacity=".7"
              />
            ))}
          </g>
        </g>
      </g>
      <path
        d="M556 140V440M606 140V440"
        stroke="#9fdbe8"
        strokeWidth="3"
        opacity=".7"
      />
      {/* Mist, a little rainbow and splash where it meets the river */}
      <path
        d="M500 440A82 82 0 0 1 664 440"
        fill="none"
        stroke="url(#cr-rainbow)"
        strokeWidth="18"
        opacity=".55"
      />
      {[
        [560, 442, 46, 0],
        [600, 448, 40, -0.6],
        [530, 450, 30, -1.1],
        [636, 452, 28, -0.3],
      ].map(([cx, cy, r, delay]) => (
        <circle
          key={cx}
          className="sm-pulse"
          style={{
            "--sm-dur": "1.4s",
            "--sm-scale": "1.18",
            "--sm-delay": `${delay}s`,
          }}
          cx={cx}
          cy={cy}
          r={r}
          fill="#f4fbff"
          opacity=".75"
        />
      ))}
    </>
  );
});

function waveRow(y: number, amp: number, period: number) {
  let d = `M${-STAGE_WIDTH} ${y}`;
  for (let x = -STAGE_WIDTH; x < STAGE_WIDTH; x += period)
    d += `q${period / 4} ${-amp} ${period / 2} 0t${period / 2} 0`;
  return d;
}

const River = memo(function River() {
  return (
    <>
      <rect
        y={RIVER_TOP}
        width={STAGE_WIDTH}
        height={RIVER_BOTTOM - RIVER_TOP + 8}
        fill="url(#cr-river)"
      />
      <path
        d={`M0 ${RIVER_TOP + 4}H${STAGE_WIDTH}`}
        stroke="#7a3a20"
        strokeWidth="8"
        opacity=".25"
      />
      {/* Sun glints and current lines flowing downstream */}
      {[
        { y: 458, speed: 34, opacity: 0.5, width: 3 },
        { y: 484, speed: 26, opacity: 0.6, width: 4 },
        { y: 512, speed: 20, opacity: 0.75, width: 5 },
        { y: 536, speed: 16, opacity: 0.6, width: 4 },
      ].map(({ y, speed, opacity, width }) => (
        <g
          key={y}
          className="sm-drift"
          style={{ "--sm-dist": `${STAGE_WIDTH}px`, "--sm-dur": `${speed}s` }}
        >
          <path
            d={waveRow(y, 6, 120)}
            fill="none"
            stroke="#e9fbff"
            strokeWidth={width}
            strokeDasharray="70 90"
            strokeLinecap="round"
            opacity={opacity}
          />
        </g>
      ))}
      <g
        className="sm-drift"
        style={{ "--sm-dist": `${STAGE_WIDTH}px`, "--sm-dur": "9s" }}
      >
        {[0, -STAGE_WIDTH].map((offset) => (
          <g key={offset} transform={`translate(${offset} 0)`}>
            {Array.from({ length: 22 }, (_, i) => (
              <path
                key={i}
                d={`M${(i * 109) % STAGE_WIDTH} ${452 + ((i * 37) % 84)}h${18 + (i % 3) * 10}`}
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
                opacity=".8"
              />
            ))}
          </g>
        ))}
      </g>
    </>
  );
});

// Boulders in the rapids with foam collars and splashing spray.
const RAPIDS = [
  { x: 360, y: 498, scale: 0.9 },
  { x: 760, y: 520, scale: 1.1 },
  { x: 1150, y: 488, scale: 0.8 },
  { x: 1430, y: 516, scale: 1.2 },
  { x: 2080, y: 500, scale: 1 },
  { x: 2300, y: 526, scale: 0.85 },
];

const Rapids = memo(function Rapids() {
  return (
    <>
      {RAPIDS.map(({ x, y, scale }, i) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${scale})`}>
          <g
            className="sm-pulse"
            style={{
              "--sm-dur": "0.8s",
              "--sm-scale": "1.12",
              "--sm-delay": `${-i * 0.23}s`,
            }}
          >
            <ellipse
              cx="-6"
              cy="12"
              rx="64"
              ry="14"
              fill="#f4fbff"
              opacity=".85"
            />
          </g>
          <path
            d="M-44 12Q-46-20-14-28Q24-36 44 0Q46 14 22 14Z"
            fill="#8a5a3c"
          />
          <path d="M-44 12Q-46-20-14-28Q-30-6-20 14Z" fill="#6b4430" />
          <path
            d="M-22-14Q0-24 20-14"
            fill="none"
            stroke="#c99a6d"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M-70 16q20-10 40 0t40 0t40 0"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {[-30, 0, 28].map((sx, j) => (
            <circle
              key={sx}
              className="sm-bob"
              style={{
                "--sm-dur": "0.42s",
                "--sm-amp": "8px",
                "--sm-delay": `${-((i + j) * 0.13)}s`,
              }}
              cx={sx}
              cy={-34 - (j % 2) * 10}
              r={4 + (j % 2)}
              fill="#f4fbff"
              opacity=".9"
            />
          ))}
        </g>
      ))}
    </>
  );
});

const RopeBridge = memo(function RopeBridge() {
  const from = { x: 780, y: 284 };
  const to = { x: 1990, y: 346 };
  const planks = 46;
  const sag = 90;
  const at = (t: number) => ({
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t + sag * 4 * t * (1 - t),
  });
  return (
    <g>
      <g
        className="sm-sway"
        style={{
          "--sm-origin": "50% 0%",
          "--sm-deg": "0.4deg",
          "--sm-dur": "4.2s",
        }}
      >
        <path
          d={`M${from.x} ${from.y - 34}Q${(from.x + to.x) / 2} ${(from.y + to.y) / 2 + sag * 2 - 34} ${to.x} ${to.y - 34}`}
          fill="none"
          stroke="#e8d2a8"
          strokeWidth="4"
        />
        {Array.from({ length: planks + 1 }, (_, i) => {
          const p = at(i / planks);
          return (
            <path
              key={`h${i}`}
              d={`M${p.x} ${p.y - 34}V${p.y}`}
              stroke="#d9bf8f"
              strokeWidth="2"
              opacity={i % 2 ? 0.8 : 0}
            />
          );
        })}
        {Array.from({ length: planks }, (_, i) => {
          const p = at((i + 0.5) / planks);
          return (
            <rect
              key={`p${i}`}
              x={p.x - 11}
              y={p.y - 4}
              width="22"
              height="9"
              rx="2"
              fill={i % 3 ? "#8a5a34" : "#a06a3e"}
            />
          );
        })}
        <path
          d={`M${from.x} ${from.y}Q${(from.x + to.x) / 2} ${(from.y + to.y) / 2 + sag * 2} ${to.x} ${to.y}`}
          fill="none"
          stroke="#e8d2a8"
          strokeWidth="3"
        />
      </g>
      {[from, to].map((p) => (
        <g key={p.x}>
          <rect
            x={p.x - 6}
            y={p.y - 48}
            width="12"
            height="56"
            rx="3"
            fill="#6b4226"
          />
          <circle cx={p.x} cy={p.y - 50} r="6" fill="#8a5a34" />
        </g>
      ))}
    </g>
  );
});

const Bank = memo(function Bank() {
  return (
    <>
      <path
        d={`M0 ${RIVER_BOTTOM}Q300 ${RIVER_BOTTOM - 10} 600 ${RIVER_BOTTOM + 2}T1200 ${RIVER_BOTTOM}T1800 ${RIVER_BOTTOM - 4}T2400 ${RIVER_BOTTOM}V720H0Z`}
        fill="url(#cr-bank)"
      />
      <path
        d={`M0 ${RIVER_BOTTOM}Q300 ${RIVER_BOTTOM - 10} 600 ${RIVER_BOTTOM + 2}T1200 ${RIVER_BOTTOM}T1800 ${RIVER_BOTTOM - 4}T2400 ${RIVER_BOTTOM}`}
        fill="none"
        stroke="#f4fbff"
        strokeWidth="7"
        opacity=".85"
      />
      <path
        d={`M0 ${RIVER_BOTTOM + 14}Q300 ${RIVER_BOTTOM + 4} 600 ${RIVER_BOTTOM + 16}T1200 ${RIVER_BOTTOM + 14}T1800 ${RIVER_BOTTOM + 10}T2400 ${RIVER_BOTTOM + 14}`}
        fill="none"
        stroke="#9a5530"
        strokeWidth="10"
        opacity=".35"
      />
      {PEBBLES.map((p) => (
        <ellipse
          key={`${p.x}-${p.y}`}
          cx={p.x}
          cy={p.y}
          rx={p.rx}
          ry={p.rx * 0.6}
          fill={p.fill}
        />
      ))}
      {FLOWERS.map((f) => (
        <g key={f.x} transform={`translate(${f.x} ${f.y})`}>
          <path d="M0 0V-12" stroke="#4f8a4d" strokeWidth="2" />
          <circle cy="-14" r="5" fill={f.fill} />
          <circle cy="-14" r="2" fill="#fff6d6" />
        </g>
      ))}
      <Pine x={300} y={600} scale={1.05} />
      <Pine x={400} y={584} scale={0.85} />
      <Pine x={2260} y={598} scale={1.1} />
      <Cactus x={980} y={612} />
      <Cactus x={2050} y={640} scale={0.8} />
      <Agave x={1180} y={640} />
      <Agave x={1560} y={668} />
      <Agave x={620} y={690} />
      <g transform="translate(860 700)">
        <path d="M-60 0Q-50-44 0-48Q50-44 60 0Z" fill="#a8613c" />
        <path
          d="M-40-26Q0-40 36-28"
          fill="none"
          stroke="#d29468"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* River Surf dock: the room's activity hotspot at x 1750 */}
      <g transform="translate(1750 530)">
        {[-62, 0, 62].map((px) => (
          <rect
            key={px}
            x={px - 5}
            y="4"
            width="10"
            height="56"
            fill="#5b3a22"
          />
        ))}
        <rect x="-84" y="-10" width="172" height="22" rx="4" fill="#c58a52" />
        {[-84, -41, 2, 45].map((px) => (
          <path
            key={px}
            d={`M${px + 43} -10V12`}
            stroke="#9b6a3a"
            strokeWidth="3"
          />
        ))}
        <rect x="-84" y="8" width="172" height="5" fill="#8a5a34" />
        <ellipse
          cx="54"
          cy="-42"
          rx="11"
          ry="44"
          transform="rotate(16 54 -42)"
          fill="#ffc857"
          stroke="#b5762a"
          strokeWidth="3"
        />
        <path
          d="M47-64L60-20"
          stroke="#ff7a59"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <ellipse
          cx="-40"
          cy="-30"
          rx="9"
          ry="36"
          transform="rotate(-12 -40 -30)"
          fill="#4cc9f0"
          stroke="#1f7f9a"
          strokeWidth="3"
        />
        <circle
          cx="-74"
          cy="-22"
          r="16"
          fill="none"
          stroke="#ff7a59"
          strokeWidth="8"
        />
        <circle
          cx="-74"
          cy="-22"
          r="16"
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          strokeDasharray="10 15"
        />
        <rect x="82" y="-110" width="5" height="120" fill="#6b4a2a" />
        <g transform="translate(87 -108)">
          <g
            className="sm-sway"
            style={{ ...PIVOT, "--sm-deg": "7deg", "--sm-dur": "1.2s" }}
          >
            <path d="M0 0L42 11L0 22Z" fill="#ff7a59" />
          </g>
        </g>
      </g>
    </>
  );
});

export function CanyonRapidsScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <CanyonRapidsStage />;
}

const CanyonRapidsStage = memo(function CanyonRapidsStage() {
  return (
    <g className="canyon-rapids-scenery">
      <defs>
        <linearGradient id="cr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59a6b" />
          <stop offset="45%" stopColor="#ffc28a" />
          <stop offset="100%" stopColor="#ffe6bf" />
        </linearGradient>
        <radialGradient id="cr-sun-glow">
          <stop offset="0%" stopColor="#fff3cc" stopOpacity=".95" />
          <stop offset="100%" stopColor="#ffc27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cr-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#62cfd6" />
          <stop offset="55%" stopColor="#2ea3b8" />
          <stop offset="100%" stopColor="#1d7690" />
        </linearGradient>
        <linearGradient id="cr-fall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9f0f7" />
          <stop offset="50%" stopColor="#f4fbff" />
          <stop offset="100%" stopColor="#a8e1ee" />
        </linearGradient>
        <linearGradient id="cr-bank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d99760" />
          <stop offset="100%" stopColor="#b56a3c" />
        </linearGradient>
        <linearGradient id="cr-east-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a2010" stopOpacity=".35" />
          <stop offset="60%" stopColor="#5a2010" stopOpacity=".12" />
          <stop offset="100%" stopColor="#5a2010" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cr-foot-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a2010" stopOpacity="0" />
          <stop offset="100%" stopColor="#5a2010" stopOpacity=".32" />
        </linearGradient>
        <linearGradient id="cr-rainbow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8fa3" />
          <stop offset="35%" stopColor="#ffd166" />
          <stop offset="65%" stopColor="#7ed957" />
          <stop offset="100%" stopColor="#4cc9f0" />
        </linearGradient>
        <radialGradient id="cr-glow">
          <stop offset="0%" stopColor="#fff0b8" stopOpacity=".9" />
          <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="cr-west-clip">
          <path d={WEST_WALL} />
        </clipPath>
        <clipPath id="cr-east-clip">
          <path d={EAST_WALL} />
        </clipPath>
        <clipPath id="cr-mid-clip">
          <path d={MIDDLE_WALL} />
        </clipPath>
        <clipPath id="cr-fall-clip">
          <path d="M560 132Q580 128 600 136L606 440H556Z" />
        </clipPath>
      </defs>

      <CanyonSky />
      <Eagle delay={-20} />
      <Eagle delay={-55} />
      <CanyonWalls />
      <River />
      <Waterfall />
      <Rapids />
      <RopeBridge />
      <Bank />

      {/* Portal to Downtown Plaza: glowing trail sign pointing west */}
      <circle
        className="sm-pulse"
        style={{ "--sm-dur": "1.43s", "--sm-scale": "1.19" }}
        cx="44"
        cy="600"
        r="70"
        fill="url(#cr-glow)"
      />
      <rect x="26" y="540" width="9" height="120" rx="3" fill="#6b4a2a" />
      <path
        d="M36 548L56 530H112V566H56Z"
        fill="#ffc857"
        stroke="#7a4a22"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M100 548H66M78 538L66 548L78 558"
        fill="none"
        stroke="#7a4a22"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>
  );
});
