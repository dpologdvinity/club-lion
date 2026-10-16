import { memo } from "react";

// The lazy river is one closed loop around a central island: the front channel
// flows left to right, bends past the waterfall grotto, and returns along the
// back channel. Banks, lanes and tube drift all derive from this centerline.
const yBack = (x: number) =>
  292 + 18 * Math.sin(x / 260 + 0.4) + 7 * Math.sin(x / 97);
const yFront = (x: number) =>
  505 + 15 * Math.sin(x / 300 + 2) + 6 * Math.sin(x / 113);
const LEFT_X = 470;
const RIGHT_X = 2230;

function buildCenterline() {
  const points: { x: number; y: number }[] = [];
  for (let x = LEFT_X; x < RIGHT_X; x += 40) points.push({ x, y: yFront(x) });
  const rightMid = (yBack(RIGHT_X) + yFront(RIGHT_X)) / 2;
  const rightRy = (yFront(RIGHT_X) - yBack(RIGHT_X)) / 2;
  for (let i = 0; i < 16; i++) {
    const phi = (i / 16) * Math.PI;
    points.push({
      x: RIGHT_X + 230 * Math.sin(phi),
      y: rightMid + rightRy * Math.cos(phi),
    });
  }
  for (let x = RIGHT_X; x > LEFT_X; x -= 40) points.push({ x, y: yBack(x) });
  const leftMid = (yBack(LEFT_X) + yFront(LEFT_X)) / 2;
  const leftRy = (yFront(LEFT_X) - yBack(LEFT_X)) / 2;
  for (let i = 0; i < 16; i++) {
    const phi = (i / 16) * Math.PI;
    points.push({
      x: LEFT_X - 300 * Math.sin(phi),
      y: leftMid - leftRy * Math.cos(phi),
    });
  }
  return points.map((p, i) => {
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    // Narrower channel in the distance, wider up front.
    const hw = 32 + Math.min(1, Math.max(0, (p.y - 290) / 215)) * 14;
    return {
      x: p.x,
      y: p.y,
      nx: -ty / len,
      ny: tx / len,
      hw,
      // Independent wobble per bank keeps the island and shore organic.
      outer: 9 * Math.sin(i * 0.37) + 4 * Math.sin(i * 1.1 + 1),
      inner: 8 * Math.sin(i * 0.29 + 2) + 3 * Math.sin(i * 0.9),
    };
  });
}

const CENTER = buildCenterline();
const SEGMENT_STARTS = CENTER.reduce<number[]>((acc, p, i) => {
  const prev = CENTER[(i - 1 + CENTER.length) % CENTER.length];
  acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p.x - prev.x, p.y - prev.y));
  return acc;
}, []);
const LOOP_LENGTH =
  SEGMENT_STARTS[SEGMENT_STARTS.length - 1] +
  Math.hypot(
    CENTER[0].x - CENTER[CENTER.length - 1].x,
    CENTER[0].y - CENTER[CENTER.length - 1].y,
  );

// Offset the centerline sideways: +1 is the outer bank, -1 the island bank.
function ringPath(side: 1 | -1, scale: number, extra: number, wobble = true) {
  return `${CENTER.map((p, i) => {
    const d =
      p.hw * scale + extra + (wobble ? (side === 1 ? p.outer : p.inner) : 0);
    return `${i ? "L" : "M"}${(p.x + p.nx * side * d).toFixed(1)} ${(p.y + p.ny * side * d).toFixed(1)}`;
  }).join("")}Z`;
}

function pointOnLoop(u: number) {
  const d = (((u % 1) + 1) % 1) * LOOP_LENGTH;
  let i = 0;
  while (i < SEGMENT_STARTS.length - 1 && SEGMENT_STARTS[i + 1] <= d) i++;
  const a = CENTER[i];
  const b = CENTER[(i + 1) % CENTER.length];
  const segment =
    (i + 1 < SEGMENT_STARTS.length ? SEGMENT_STARTS[i + 1] : LOOP_LENGTH) -
    SEGMENT_STARTS[i];
  const t = segment ? (d - SEGMENT_STARTS[i]) / segment : 0;
  const slope = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  const folded = slope > 90 ? slope - 180 : slope < -90 ? slope + 180 : slope;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    tilt: Math.max(-18, Math.min(18, folded)),
  };
}

const OUTER_ROCK = ringPath(1, 1, 22);
const OUTER_SAND = ringPath(1, 1, 11);
const WATER = ringPath(1, 1, 0);
const ISLAND_SAND = ringPath(-1, 1, 0);
const ISLAND_GRASS = ringPath(-1, 1, 14);
const CURRENT_LANES = [
  ringPath(1, 0, 0, false),
  ringPath(1, 0.55, 0, false),
  ringPath(-1, 0.55, 0, false),
] as const;

const BANK_ROCKS = CENTER.filter((_, i) => i % 7 === 3).map((p, i) => {
  const side = i % 2 ? 1 : -1;
  const d = p.hw + 8 + (side === 1 ? p.outer : p.inner) + (i % 3) * 3;
  return {
    x: p.x + p.nx * side * d,
    y: p.y + p.ny * side * d,
    r: 11 + ((i * 5) % 9),
  };
});
const LILY_PADS = CENTER.filter((_, i) => i % 11 === 5).map((p, i) => {
  const side = i % 2 ? 1 : -1;
  const d = p.hw * 0.72;
  return {
    x: p.x + p.nx * side * d,
    y: p.y + p.ny * side * d,
    r: 9 + (i % 3) * 2,
    bloom: i % 3 === 0,
  };
});
const TUBES = [
  { color: "#ff6053", rider: true },
  { color: "#ffba3b", rider: false },
  { color: "#4cdb83", rider: true },
  { color: "#bb5fe6", rider: false },
  { color: "#3bb8ff", rider: true },
  { color: "#ff8ac2", rider: false },
  { color: "#ffd447", rider: true },
  { color: "#2fd1b5", rider: false },
] as const;
const CANOPY_FAR = Array.from({ length: 30 }, (_, i) => ({
  x: i * 100 - 20,
  y: 190 + ((i * 53) % 50),
  r: 70 + ((i * 37) % 36),
}));
const CANOPY_MID = Array.from({ length: 22 }, (_, i) => ({
  x: i * 136 + 30,
  y: 120 + ((i * 41) % 60),
  r: 80 + ((i * 29) % 40),
}));
const CANOPY_TOP = Array.from({ length: 34 }, (_, i) => ({
  x: i * 86 - 20,
  y: -10 + ((i * 31) % 40),
  r: 54 + ((i * 23) % 30),
}));
const VINES = [
  { x: 140, len: 230 },
  { x: 420, len: 150 },
  { x: 880, len: 200 },
  { x: 1560, len: 130 },
  { x: 1980, len: 210 },
  { x: 2360, len: 120 },
  { x: 2720, len: 240 },
] as const;
const FERNS = Array.from({ length: 22 }, (_, i) => ({
  x: 60 + i * 128 + ((i * 37) % 40),
  y: 252 + ((i * 17) % 22),
  s: 0.7 + ((i * 7) % 5) * 0.08,
}));
const BOARD_ROWS = [560, 578, 598, 621, 647, 676, 708, 720] as const;
const BRIDGE_PLANKS = Array.from({ length: 15 }, (_, i) => {
  const t = (i + 0.5) / 15;
  return { x: 700 + t * 560, y: 214 + 4 * 34 * t * (1 - t) };
});

function TubeRing({ color, rider }: { color: string; rider: boolean }) {
  return (
    <g>
      <ellipse cy="10" rx="44" ry="12" fill="#0f6f7d" opacity=".3" />
      <ellipse rx="40" ry="18" fill={color} />
      <ellipse rx="16" ry="7" cy="-1" fill="#1d8e9e" />
      {rider && (
        <g transform="translate(0 -16)">
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              transform={`rotate(${i * 36})`}
              d="M-5-11L0-18L5-11Z"
              fill="#e5701f"
            />
          ))}
          <circle r="13" fill="#f29a32" />
          <circle cx="-9" cy="-10" r="4" fill="#f29a32" />
          <circle cx="9" cy="-10" r="4" fill="#f29a32" />
          <circle r="9" fill="#ffd27a" />
          <circle cx="-3.5" cy="-2" r="1.6" fill="#4a2a12" />
          <circle cx="3.5" cy="-2" r="1.6" fill="#4a2a12" />
          <path
            d="M-3 3Q0 6 3 3"
            fill="none"
            stroke="#7a3f1a"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      )}
      <path d="M-40 0A40 18 0 0 0 40 0L16-1A16 7 0 0 1-16-1Z" fill={color} />
      <path
        d="M-30-8Q0-20 30-8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".6"
      />
    </g>
  );
}

const RiverPalm = memo(function RiverPalm({
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
  const fronds = [-160, -122, -86, -50, -14, 22, 58];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * lean} ${scale})`}>
      <ellipse cx="20" cy="6" rx="80" ry="12" fill="#2f6e44" opacity=".35" />
      <path
        d="M0 0Q-12-120 8-210Q16-250-10-280"
        fill="none"
        stroke="#6a4426"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M0 0Q-12-120 8-210Q16-250-10-280"
        fill="none"
        stroke="#956239"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {Array.from({ length: 9 }, (_, i) => {
        const t = i / 9;
        return (
          <path
            key={i}
            d={`M${-11 + Math.sin(t * 3) * 6} ${-t * 270}q10-6 20 0`}
            fill="none"
            stroke="#55361b"
            strokeWidth="3"
            opacity=".7"
          />
        );
      })}
      <g transform="translate(-10 -280)">
        <g
          className="sm-sway"
          style={{
            "--sm-dur": `${Math.PI / 0.9}s`,
            "--sm-delay": `${-((sway === 1 ? 0 : Math.PI) + Math.PI / 2) / 0.9}s`,
            "--sm-origin": "50% 50%",
          }}
        >
          {/* Invisible ring centres the sway box on the crown. */}
          <circle r="170" fill="none" />
          {fronds.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path
                d="M0 0Q66-40 148 8Q72-12 0 0Z"
                fill={i % 2 ? "#23805c" : "#2f9c6c"}
              />
              <path
                d="M0 0Q66-40 148 8"
                fill="none"
                stroke="#17603f"
                strokeWidth="3"
              />
              {[32, 62, 92, 120].map((fx) => (
                <path
                  key={fx}
                  d={`M${fx} ${-17 + fx * 0.13}l11 20`}
                  stroke={i % 2 ? "#2f9c6c" : "#23805c"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
            </g>
          ))}
          <circle cx="-6" cy="8" r="10" fill="#5b3a20" />
          <circle cx="8" cy="10" r="9" fill="#6d4826" />
        </g>
      </g>
    </g>
  );
});

function Fern({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="none"
      strokeLinecap="round"
    >
      {[-70, -40, -12, 16, 44, 72].map((a, i) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 0Q6-30 0-62"
          stroke={i % 2 ? "#2c8455" : "#3b9c66"}
          strokeWidth="9"
        />
      ))}
    </g>
  );
}

function Hibiscus({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          transform={`rotate(${a}) translate(0 -7)`}
          rx="5"
          ry="8"
          fill={color}
        />
      ))}
      <circle r="3.5" fill="#ffe066" />
    </g>
  );
}

const RiverBackdrop = memo(function RiverBackdrop() {
  return (
    <>
      <defs>
        <linearGradient id="sor-sky" x2="0" y2="1">
          <stop stopColor="#b8ece4" />
          <stop offset="1" stopColor="#effbe6" />
        </linearGradient>
        <linearGradient id="sor-water" x2="0" y2="1">
          <stop offset=".3" stopColor="#1c96ad" />
          <stop offset=".6" stopColor="#2fb8c8" />
          <stop offset="1" stopColor="#5fd4d4" />
        </linearGradient>
        <linearGradient id="sor-fall" x2="0" y2="1">
          <stop stopColor="#e9fdff" />
          <stop offset="1" stopColor="#8fe2ee" />
        </linearGradient>
        <linearGradient id="sor-cave" x2="0" y2="1">
          <stop stopColor="#14302d" />
          <stop offset="1" stopColor="#2a5a52" />
        </linearGradient>
        <linearGradient id="sor-thatch" x2="0" y2="1">
          <stop stopColor="#e5bd6c" />
          <stop offset="1" stopColor="#a8783c" />
        </linearGradient>
        <linearGradient id="sor-boards" x2="0" y2="1">
          <stop stopColor="#c9915a" />
          <stop offset="1" stopColor="#b07641" />
        </linearGradient>
      </defs>
      <rect width="2800" height="720" fill="url(#sor-sky)" />
      {CANOPY_FAR.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={c.r}
          fill={i % 2 ? "#8fcfb0" : "#9fd8b9"}
        />
      ))}
      {[260, 1050, 1720, 2120].map((tx) => (
        <path
          key={tx}
          d={`M${tx - 14} 300L${tx - 8} 90H${tx + 8}L${tx + 14} 300Z`}
          fill="#6c5a44"
          opacity=".7"
        />
      ))}
      {CANOPY_MID.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={c.r}
          fill={i % 2 ? "#3d9c74" : "#4aab80"}
        />
      ))}
      <path
        d="M0 250Q300 222 640 246T1300 240T1960 236T2800 248V560H0Z"
        fill="#469f6c"
      />
      {FERNS.map((f) => (
        <Fern key={f.x} x={f.x} y={f.y} s={f.s} />
      ))}

      {/* Canopy walk: rope bridge strung between two giant trees */}
      {[680, 1280].map((tx) => (
        <g key={tx}>
          <path
            d={`M${tx - 30} 300Q${tx - 20} 200 ${tx - 16} 60H${tx + 16}Q${tx + 20} 200 ${tx + 30} 300Z`}
            fill="#6b4a2e"
          />
          <path
            d={`M${tx - 6} 290Q${tx - 2} 200 ${tx} 70`}
            stroke="#8a6440"
            strokeWidth="6"
            fill="none"
          />
          <rect
            x={tx - 44}
            y="206"
            width="88"
            height="12"
            rx="3"
            fill="#a0703f"
          />
          <circle cx={tx} cy="40" r="90" fill="#2f8a62" />
          <circle cx={tx - 60} cy="70" r="56" fill="#3a9a6e" />
          <circle cx={tx + 64} cy="64" r="60" fill="#36946a" />
        </g>
      ))}
      <path
        d="M712 206Q980 264 1248 206"
        fill="none"
        stroke="#6a4020"
        strokeWidth="3"
      />
      {BRIDGE_PLANKS.map((p) => (
        <rect
          key={p.x}
          x={p.x - 14}
          y={p.y - 2}
          width="28"
          height="8"
          rx="2"
          fill="#c48a52"
          stroke="#6a4020"
          strokeWidth="1.5"
        />
      ))}
      <path
        d="M712 172Q980 236 1248 172"
        fill="none"
        stroke="#8a5a32"
        strokeWidth="4"
      />
      {BRIDGE_PLANKS.filter((_, i) => i % 2 === 0).map((p) => (
        <path
          key={p.x}
          d={`M${p.x} ${p.y}V${p.y - 32}`}
          stroke="#8a5a32"
          strokeWidth="2"
        />
      ))}
      {/* Toucan on the bridge tree */}
      <g transform="translate(1306 202)">
        <path d="M-6 0Q-16-24 0-34Q14-24 8 0Z" fill="#1f2a2e" />
        <ellipse cx="2" cy="-22" rx="7" ry="8" fill="#fff5d6" />
        <path d="M6-28Q30-30 34-20Q22-18 6-20Z" fill="#ff9a2e" />
        <path d="M6-24Q24-24 34-20" stroke="#e5521f" strokeWidth="2" />
        <circle cx="3" cy="-27" r="2" fill="#1f2a2e" />
        <path d="M-2 0V8M4 0V8" stroke="#6b4a2e" strokeWidth="2" />
      </g>

      {/* Waterfall grotto */}
      <path
        d="M2250 470Q2240 300 2300 220Q2330 120 2440 96Q2560 40 2680 80Q2800 90 2800 160V470Z"
        fill="#76857a"
      />
      <path
        d="M2290 470Q2290 330 2350 250Q2400 170 2480 160Q2600 140 2700 180Q2790 200 2800 260V470Z"
        fill="#8d9b8f"
      />
      <path
        d="M2360 440V330Q2360 236 2470 236Q2580 236 2580 330V440Z"
        fill="url(#sor-cave)"
      />
      <path
        d="M2360 330Q2360 236 2470 236Q2580 236 2580 330"
        fill="none"
        stroke="#5d6b61"
        strokeWidth="14"
      />
      {[
        [2310, 300, 40],
        [2620, 260, 54],
        [2740, 330, 46],
        [2420, 150, 36],
        [2560, 120, 44],
      ].map(([rx, ry, r]) => (
        <g key={rx}>
          <ellipse cx={rx} cy={ry} rx={r} ry={r * 0.7} fill="#9aa89b" />
          <ellipse
            cx={rx - r * 0.2}
            cy={ry - r * 0.3}
            rx={r * 0.5}
            ry={r * 0.25}
            fill="#b3c0b2"
          />
        </g>
      ))}
      <path
        d="M2290 160Q2400 70 2520 90Q2640 50 2760 110Q2700 130 2620 120Q2520 140 2420 130Q2340 150 2290 160Z"
        fill="#4f9a5a"
      />
      {[2330, 2400, 2610, 2690].map((fx, i) => (
        <path
          key={fx}
          d={`M${fx} 130Q${fx + 6} ${180 + i * 12} ${fx - 4} ${220 + i * 16}`}
          stroke="#3f8a4c"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  );
});

const RiverBed = memo(function RiverBed() {
  return (
    <>
      <path d={OUTER_ROCK} fill="#7f6e52" />
      <path d={OUTER_SAND} fill="#d3b17a" />
      <path d={WATER} fill="url(#sor-water)" stroke="#a7efe6" strokeWidth="6" />
      {BANK_ROCKS.map((r) => (
        <g key={`${r.x}-${r.y}`}>
          <ellipse
            cx={r.x}
            cy={r.y + r.r * 0.3}
            rx={r.r * 1.2}
            ry={r.r * 0.5}
            fill="#0f6f7d"
            opacity=".25"
          />
          <ellipse
            cx={r.x}
            cy={r.y}
            rx={r.r * 1.1}
            ry={r.r * 0.75}
            fill="#8f9a8c"
          />
          <ellipse
            cx={r.x - r.r * 0.3}
            cy={r.y - r.r * 0.3}
            rx={r.r * 0.5}
            ry={r.r * 0.25}
            fill="#b9c3b4"
          />
        </g>
      ))}
      <path d={ISLAND_SAND} fill="#e6c891" />
      <path d={ISLAND_GRASS} fill="#5fb86c" />
      <path
        d="M700 400Q900 360 1150 392T1650 384T2050 400"
        fill="none"
        stroke="#79cc7e"
        strokeWidth="26"
        strokeLinecap="round"
        opacity=".6"
      />
      {LILY_PADS.map((pad) => (
        <g key={`${pad.x}-${pad.y}`}>
          <path
            d={`M${pad.x} ${pad.y}L${pad.x + pad.r} ${pad.y - 2}A${pad.r} ${pad.r * 0.5} 0 1 1 ${pad.x + pad.r} ${pad.y + 2}Z`}
            fill="#4caf5e"
            stroke="#2f8a44"
            strokeWidth="2"
          />
          {pad.bloom && (
            <g transform={`translate(${pad.x - 3} ${pad.y - 4})`}>
              {[-50, -18, 18, 50].map((a) => (
                <ellipse
                  key={a}
                  transform={`rotate(${a}) translate(0 -5)`}
                  rx="3"
                  ry="6"
                  fill="#ff9cc4"
                />
              ))}
              <circle r="2.5" fill="#ffe066" />
            </g>
          )}
        </g>
      ))}

      {/* Island: boulders, tiki totem, flowers and the launch dock */}
      <g transform="translate(1660 404)">
        <ellipse cy="14" rx="90" ry="14" fill="#2f6e44" opacity=".3" />
        <path d="M-80 12Q-84-30-40-42Q0-70 40-44Q86-36 84 12Z" fill="#8f9a8c" />
        <path
          d="M-52-30Q-10-60 30-40"
          fill="none"
          stroke="#b9c3b4"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d="M-60-34Q-20-58 40-42Q10-48-20-40Z" fill="#5aa65e" />
      </g>
      <g transform="translate(1010 446)">
        <ellipse cy="4" rx="26" ry="6" fill="#2f6e44" opacity=".35" />
        <rect x="-18" y="-96" width="36" height="96" rx="6" fill="#9b6a3a" />
        <rect x="-22" y="-104" width="44" height="14" rx="4" fill="#7a4f2a" />
        <path
          d="M-10-76h6M4-76h6"
          stroke="#fff3dc"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M-10-52Q0-42 10-52"
          fill="none"
          stroke="#fff3dc"
          strokeWidth="4"
        />
        <path d="M-18-30H18M-18-20H18" stroke="#ff6f59" strokeWidth="4" />
        <path d="M-18-104L0-122L18-104Z" fill="#4caf5e" />
      </g>
      {(
        [
          [620, 430, "#ff5f84"],
          [880, 408, "#ffb43b"],
          [1240, 432, "#ff5f84"],
          [1520, 420, "#ff7a5c"],
          [1880, 436, "#ffb43b"],
          [2060, 410, "#ff5f84"],
        ] as const
      ).map(([hx, hy, color]) => (
        <g key={hx}>
          <circle cx={hx} cy={hy} r="20" fill="#3c9a58" />
          <circle cx={hx + 18} cy={hy + 4} r="15" fill="#4caf5e" />
          <Hibiscus x={hx - 4} y={hy - 6} color={color} />
          <Hibiscus x={hx + 16} y={hy + 2} color={color} />
        </g>
      ))}
      <g transform="translate(1400 452)">
        <path
          d="M-60 0H60L66 26H-66Z"
          fill="#b07641"
          stroke="#6a4020"
          strokeWidth="3"
        />
        {[-40, -20, 0, 20, 40].map((px) => (
          <path
            key={px}
            d={`M${px} 0L${px * 1.1} 26`}
            stroke="#8a5a32"
            strokeWidth="2"
          />
        ))}
        <path d="M-62 26V40M62 26V40" stroke="#6a4020" strokeWidth="6" />
      </g>
      <g transform="translate(1400 400)">
        <path d="M-80 46V-40M80 46V-40" stroke="#7d5130" strokeWidth="10" />
        <path
          d="M-130-58Q-130-74-114-74H114Q130-74 130-58V-22Q130-6 114-6H-114Q-130-6-130-22Z"
          fill="#c98a4b"
          stroke="#6a4020"
          strokeWidth="4"
        />
        <path
          d="M-116-60q60-4 120 0t110 0M-116-20q70-4 130 0t100 0"
          fill="none"
          stroke="#a96d36"
          strokeWidth="2"
        />
        <text
          y="-31"
          textAnchor="middle"
          fontSize="26"
          fill="#fff3dc"
          stroke="#5a3418"
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          LAZY CURRENT
        </text>
        <path
          d="M-70-92Q-30-112 10-92T80-92"
          fill="none"
          stroke="#2fb8c8"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d="M76-104L96-90L74-80Z" fill="#2fb8c8" />
        {/* A little tube riding the current: the picture says "float here". */}
        <ellipse
          cx="-96"
          cy="-98"
          rx="24"
          ry="10"
          fill="none"
          stroke="#ffc93c"
          strokeWidth="10"
        />
      </g>
    </>
  );
});

const Boardwalk = memo(function Boardwalk() {
  return (
    <>
      <rect y="556" width="2800" height="164" fill="url(#sor-boards)" />
      <rect y="548" width="2800" height="14" fill="#8a5a32" />
      <rect y="548" width="2800" height="4" fill="#a9733f" />
      {BOARD_ROWS.slice(0, -1).map((y, row) => {
        const next = BOARD_ROWS[row + 1];
        const plank = 180 + row * 30;
        const shift = (row * 97) % plank;
        return (
          <g key={y}>
            <path
              d={`M0 ${y}H2800`}
              stroke="#8a5a32"
              strokeWidth={1.5 + row * 0.4}
            />
            <path
              d={`M0 ${y + 3}H2800`}
              stroke="#ddb07a"
              strokeWidth="1.5"
              opacity=".6"
            />
            {Array.from({ length: Math.ceil(2800 / plank) + 1 }, (_, i) => {
              const x = i * plank - shift;
              return (
                <g key={i}>
                  <path
                    d={`M${x} ${y}V${next}`}
                    stroke="#8a5a32"
                    strokeWidth="2"
                  />
                  <circle
                    cx={x + 8}
                    cy={(y + next) / 2}
                    r="1.8"
                    fill="#6a4020"
                  />
                  <circle
                    cx={x - 8}
                    cy={(y + next) / 2}
                    r="1.8"
                    fill="#6a4020"
                  />
                </g>
              );
            })}
          </g>
        );
      })}
      {Array.from({ length: 15 }, (_, i) => {
        const x = 90 + i * 200;
        return (
          <g key={x}>
            <rect
              x={x - 7}
              y="522"
              width="14"
              height="40"
              rx="3"
              fill="#7a4f2a"
            />
            <ellipse cx={x} cy="522" rx="7" ry="3" fill="#a9733f" />
          </g>
        );
      })}
      <path
        d={Array.from(
          { length: 14 },
          (_, i) =>
            `${i ? "" : "M90 530"}Q${190 + i * 200} 548 ${290 + i * 200} 530`,
        ).join("")}
        fill="none"
        stroke="#d9b98a"
        strokeWidth="4"
      />
      {[
        [520, 650, 70],
        [1180, 690, 90],
        [2380, 640, 64],
      ].map(([px, py, prx]) => (
        <g key={px}>
          <ellipse
            cx={px}
            cy={py}
            rx={prx}
            ry="9"
            fill="#8a5a32"
            opacity=".35"
          />
          <ellipse
            cx={px - 10}
            cy={py - 2}
            rx={prx * 0.4}
            ry="3"
            fill="#bfeef0"
            opacity=".6"
          />
        </g>
      ))}

      {/* Tube Rentals tiki hut */}
      <g transform="translate(2050 562)">
        <ellipse cy="4" rx="200" ry="16" fill="#6a4020" opacity=".3" />
        {[-130, 130].map((px) => (
          <path key={px} d={`M${px - 8} 0V-236H${px + 8}V0Z`} fill="#b88a4a" />
        ))}
        <rect x="-118" y="-118" width="236" height="118" fill="#d9a85f" />
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d={`M${-108 + i * 20} -118V0`}
            stroke="#b07e3c"
            strokeWidth="4"
          />
        ))}
        {[-80, -40].map((by) => (
          <path
            key={by}
            d={`M-118 ${by}H118`}
            stroke="#8d6a3c"
            strokeWidth="3"
            opacity=".6"
          />
        ))}
        <rect x="-132" y="-130" width="264" height="16" rx="4" fill="#8a5a32" />
        <rect x="-132" y="-118" width="264" height="5" fill="#6a4020" />
        <path
          d="M-180-220Q-90-300 0-322Q90-300 180-220Z"
          fill="url(#sor-thatch)"
          stroke="#7d5428"
          strokeWidth="5"
        />
        <path
          d={`M-186-220${Array.from(
            { length: 19 },
            (_, i) =>
              `L${-186 + i * 19.6 + 9.8} ${-190 + (i % 2) * 6}L${-186 + (i + 1) * 19.6} -220`,
          ).join("")}Z`}
          fill="#c99a52"
          stroke="#7d5428"
          strokeWidth="3"
        />
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            d={`M0-318Q${-90 + i * 30}-270 ${-160 + i * 53}-226`}
            fill="none"
            stroke="#f0cf86"
            strokeWidth="4"
            opacity=".6"
          />
        ))}
        <rect
          x="-112"
          y="-106"
          width="224"
          height="42"
          rx="8"
          fill="#fff3dc"
          stroke="#6a4020"
          strokeWidth="4"
        />
        <text y="-76" textAnchor="middle" fontSize="25" fill="#2c7f95">
          TUBE RENTALS
        </text>
        <g transform="translate(-60 -136)">
          <TubeRing color="#ffba3b" rider={false} />
        </g>
        <g transform="translate(40 -136) scale(.8)">
          <TubeRing color="#3bb8ff" rider={false} />
        </g>
        {["#ff6053", "#4cdb83", "#bb5fe6", "#ffba3b", "#3bb8ff"].map(
          (color, i) => (
            <g
              key={color}
              transform={`translate(${190 + (i % 2) * 4} ${-14 - i * 26})`}
            >
              <TubeRing color={color} rider={false} />
            </g>
          ),
        )}
      </g>
    </>
  );
});

const ForegroundLeaves = memo(function ForegroundLeaves() {
  const leaves = [
    [2810, 740, 210, 1.15],
    [2730, 750, 190, 0.9],
    [-30, 760, -30, 0.8],
  ] as const;
  return (
    <>
      {CANOPY_TOP.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={c.r}
          fill={i % 2 ? "#1f6b4f" : "#2a7d5a"}
        />
      ))}
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

function ArrowSign({
  x,
  y,
  text,
  width,
}: {
  x: number;
  y: number;
  text: string;
  width: number;
}) {
  const w = width / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="4" rx="30" ry="6" fill="#6a4020" opacity=".3" />
      <path d="M-7 0V-108H7V0Z" fill="#7d5130" />
      <path
        d={`M${w}-128H${-w}L${-w - 26}-102L${-w}-76H${w}Z`}
        fill="#c98a4b"
        stroke="#6a4020"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d={`M${w - 10}-116q${-w * 0.6}-4 ${-w} 0t${-w * 0.8} 0M${w - 10}-88q${-w * 0.5}-4 ${-w} 0t${-w * 0.8} 0`}
        fill="none"
        stroke="#a96d36"
        strokeWidth="2"
      />
      <text
        x="-10"
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

// Phase offsets turn the old Math.sin(seconds * k + phase) curves into CSS
// animation delays: delay = -(phase + PI/2) / k lines the cycles back up.
const RiverForeground = memo(function RiverForeground() {
  return (
    <>
      {/* Waterfall spilling over the grotto mouth; tubes drift behind it */}
      <path
        d="M2408 138Q2470 128 2532 138L2548 412Q2470 424 2392 412Z"
        fill="url(#sor-fall)"
        opacity=".78"
      />
      {/* Each streak is turned to run along +x, carries one spare dash
          period before its top, and slides down 44px every 0.2s under a clip:
          the old dash offset of seconds * 220. */}
      <clipPath id="sor-fall-streak-clip">
        <rect x="0" y="-4" width="268.12" height="8" />
      </clipPath>
      {[2420, 2445, 2470, 2495, 2520].map((wx, i) => (
        <g
          key={wx}
          transform={`translate(${wx} 142) rotate(${(Math.atan2(268, (i - 2) * 4) * 180) / Math.PI})`}
          clipPath="url(#sor-fall-streak-clip)"
        >
          <path
            className="sm-drift"
            d="M-44 0H268.12"
            stroke="#ffffff"
            strokeWidth="4"
            strokeDasharray="26 18"
            strokeDashoffset={-i * 9}
            opacity=".85"
            style={{ "--sm-dur": "0.2s", "--sm-dist": "44px" }}
          />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <g
          key={i}
          className="sm-bob"
          style={{
            "--sm-dur": `${Math.PI / 4}s`,
            "--sm-delay": `${-(i / 2 + Math.PI / 4)}s`,
            "--sm-amp": "4px",
          }}
        >
          <circle
            className="sm-pulse"
            cx={2390 + i * 40}
            cy="408"
            r={8 + (i % 2) * 5}
            fill="#ffffff"
            opacity=".45"
            style={{
              "--sm-dur": `${Math.PI / 1.6}s`,
              "--sm-delay": `${-(i + Math.PI / 2) / 1.6}s`,
              "--sm-scale": (12 + (i % 2) * 5) / (8 + (i % 2) * 5),
            }}
          />
        </g>
      ))}

      <RiverPalm x={760} y={424} scale={0.78} sway={1} />
      <RiverPalm x={1880} y={418} scale={0.84} lean={-1} sway={-1} />
      <RiverPalm x={1160} y={396} scale={0.58} sway={-1} />

      <Boardwalk />

      <RiverPalm x={300} y={640} scale={1.1} sway={1} />
      <RiverPalm x={2770} y={668} scale={1.2} lean={-1} sway={-1} />

      <ArrowSign x={120} y={612} width={250} text="← SPLASH OASIS" />

      <ForegroundLeaves />
      {/* Hanging vines swaying from the canopy */}
      {VINES.map((vine, i) => {
        // Vines swing from their anchor so the tip travels about 14px.
        const endX = vine.x;
        const midX = vine.x + 10;
        return (
          <g
            key={vine.x}
            className="sm-sway"
            style={{
              "--sm-dur": `${Math.PI / 0.8}s`,
              "--sm-delay": `${-(i * 1.1 + (3 * Math.PI) / 2) / 0.8}s`,
              "--sm-deg": `${(Math.atan(14 / (vine.len - 30)) * 180) / Math.PI}deg`,
              "--sm-origin": "50% 50%",
            }}
          >
            {/* Invisible ring centres the sway box on the anchor. */}
            <circle cx={vine.x} cy="30" r={vine.len} fill="none" />
            <path
              d={`M${vine.x} 30Q${midX} ${vine.len * 0.6} ${endX} ${vine.len}`}
              fill="none"
              stroke="#2f6e3f"
              strokeWidth="4"
            />
            {[0.3, 0.5, 0.7, 0.9].map((t, j) => {
              const lx =
                (1 - t) ** 2 * vine.x + 2 * (1 - t) * t * midX + t * t * endX;
              const ly =
                (1 - t) ** 2 * 30 +
                2 * (1 - t) * t * vine.len * 0.6 +
                t * t * vine.len;
              return (
                <ellipse
                  key={t}
                  cx={lx + (j % 2 ? 8 : -8)}
                  cy={ly}
                  rx="9"
                  ry="5"
                  transform={`rotate(${j % 2 ? 30 : -30} ${lx} ${ly})`}
                  fill={j % 2 ? "#3b9c66" : "#4caf5e"}
                />
              );
            })}
          </g>
        );
      })}
      {[0, 1].map((i) => {
        const flap = {
          "--sm-dur": `${Math.PI / 18}s`,
          "--sm-delay": `${-(Math.PI + 2 * i) / 18}s`,
          "--sm-scale": "0.4, 1",
        };
        return (
          <g key={i} transform={`translate(${900 + i * 900} ${300 + i * 40})`}>
            <g
              className="sm-bob"
              style={{
                "--sm-dur": `${Math.PI / 1.3}s`,
                "--sm-delay": `${-(i + Math.PI / 2) / 1.3}s`,
                "--sm-amp": "30px",
              }}
            >
              {/* Turned a quarter so sm-bob's swing runs left and right. */}
              <g transform="rotate(-90)">
                <g
                  className="sm-bob"
                  style={{
                    "--sm-dur": `${Math.PI / 0.5}s`,
                    "--sm-delay": `${-(i * 3 + Math.PI / 2) / 0.5}s`,
                    "--sm-amp": "120px",
                  }}
                >
                  <g transform="rotate(90)">
                    <ellipse
                      className="sm-pulse"
                      cx="-6"
                      rx="8"
                      ry="6"
                      fill={i ? "#ffb43b" : "#ff7fb0"}
                      style={flap}
                    />
                    <ellipse
                      className="sm-pulse"
                      cx="6"
                      rx="8"
                      ry="6"
                      fill={i ? "#ffb43b" : "#ff7fb0"}
                      style={flap}
                    />
                    <path d="M0-5V5" stroke="#3a2a1a" strokeWidth="2" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        );
      })}
    </>
  );
});

export function SplashOasisRiverScenery({ seconds }: { seconds: number }) {
  // Current dashes crawl along curved loops and tubes follow the river
  // centerline, so both stay on seconds; the rest loops in CSS.
  const flow = seconds * 36;
  return (
    <>
      <RiverBackdrop />

      <RiverBed />

      {/* Current lanes drifting around the loop */}
      {CURRENT_LANES.map((lane, i) => (
        <path
          key={i}
          d={lane}
          fill="none"
          stroke="#d4fbf8"
          strokeWidth={i ? 3 : 5}
          strokeDasharray={i ? "18 60" : "36 54"}
          strokeDashoffset={-flow * (i ? 1.2 : 1)}
          strokeLinecap="round"
          opacity=".55"
        />
      ))}

      {/* Inner tubes float on the water, drifting with the current */}
      {TUBES.map((tube, i) => {
        const p = pointOnLoop(seconds / 90 + i / TUBES.length);
        const depth = Math.min(1, Math.max(0, (p.y - 270) / 260));
        const bob = Math.sin(seconds * 2 + i * 1.3) * 2;
        return (
          <g
            key={tube.color}
            transform={`translate(${p.x.toFixed(1)} ${(p.y + bob).toFixed(1)}) rotate(${(p.tilt * 0.5).toFixed(1)}) scale(${(0.62 + depth * 0.42).toFixed(3)})`}
          >
            <TubeRing color={tube.color} rider={tube.rider} />
          </g>
        );
      })}

      <RiverForeground />
    </>
  );
}
