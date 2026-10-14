import { memo } from "react";
import type { SeekCover, SeekSceneId } from "../utils/seekSafari.ts";
import "./sceneryMotion.css";

// Deterministic speckles so textures never reshuffle between renders.
const dots = (count: number, top: number, spread: number) =>
  Array.from({ length: count }, (_, i) => ({
    x: (i * 263) % 1600,
    y: top + ((i * 97) % spread),
    r: 2 + (i % 3),
  }));

function Cloud({
  x,
  y,
  s = 1,
  delay,
}: {
  x: number;
  y: number;
  s?: number;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g
        className="sm-drift"
        style={{
          "--sm-dur": "14s",
          "--sm-dist": "40px",
          "--sm-delay": `${delay}s`,
        }}
      >
        <ellipse cx="0" cy="0" rx="80" ry="26" fill="#fff" opacity=".9" />
        <circle cx="-30" cy="-16" r="30" fill="#fff" opacity=".9" />
        <circle cx="18" cy="-24" r="36" fill="#fff" opacity=".9" />
      </g>
    </g>
  );
}

function Acacia({
  x,
  y,
  s = 1,
  delay,
}: {
  x: number;
  y: number;
  s?: number;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="120" ry="14" fill="#a67c3d" opacity=".25" />
      <path
        d="M-8 0Q-4-90-40-160M2 0Q10-100 60-170M0-70Q20-110 6-170"
        fill="none"
        stroke="#6d4b2c"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <g
        className="sm-sway"
        style={{
          "--sm-deg": "1.5deg",
          "--sm-dur": "5s",
          "--sm-delay": `${delay}s`,
          "--sm-origin": "50% 100%",
        }}
      >
        <ellipse cx="10" cy="-180" rx="150" ry="34" fill="#4f7d32" />
        <ellipse cx="-50" cy="-196" rx="90" ry="26" fill="#5f9a3b" />
        <ellipse cx="70" cy="-200" rx="80" ry="22" fill="#6aa844" />
      </g>
    </g>
  );
}

function Palm({
  x,
  y,
  s = 1,
  flip = 1,
  delay,
}: {
  x: number;
  y: number;
  s?: number;
  flip?: 1 | -1;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      <path
        d="M0 0Q-6-150 50-300"
        fill="none"
        stroke="#8a5d33"
        strokeWidth="22"
        strokeLinecap="round"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${-8 + i * 6} ${-i * 32}q12-6 22 0`}
          fill="none"
          stroke="#5a3d22"
          strokeWidth="3"
        />
      ))}
      <g transform="translate(50 -300)">
        <g
          className="sm-sway"
          style={{
            "--sm-deg": "3deg",
            "--sm-dur": "3.6s",
            "--sm-delay": `${delay}s`,
            "--sm-origin": "0 0",
            transformBox: "view-box",
          }}
        >
          {[-160, -120, -75, -30, 10, 40].map((angle, i) => (
            <path
              key={angle}
              transform={`rotate(${angle})`}
              d="M0 0Q70-40 160 10Q80-12 0 0"
              fill={i % 2 ? "#2f7a4f" : "#3d9460"}
            />
          ))}
          <circle cx="-6" cy="8" r="11" fill="#5d3b1d" />
          <circle cx="10" cy="10" r="10" fill="#6d4826" />
        </g>
      </g>
    </g>
  );
}

function Savanna() {
  return (
    <>
      <defs>
        <linearGradient id="seek-sav-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fcdf0" />
          <stop offset="1" stopColor="#fde7b4" />
        </linearGradient>
        <linearGradient id="seek-sav-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8c56b" />
          <stop offset="1" stopColor="#cf9d48" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#seek-sav-sky)" />
      <circle cx="1280" cy="170" r="120" fill="#fff3c4" opacity=".55" />
      <circle cx="1280" cy="170" r="78" fill="#ffd85e" />
      <Cloud x={300} y={150} delay={0} />
      <Cloud x={820} y={110} s={0.8} delay={-5} />
      <path
        d="M0 470L180 360L340 430L520 320L720 420L900 340L1100 430L1300 350L1600 440V560H0Z"
        fill="#c9a77c"
        opacity=".7"
      />
      <path
        d="M0 520Q400 470 800 510T1600 500V1000H0Z"
        fill="url(#seek-sav-ground)"
      />
      <ellipse cx="1050" cy="640" rx="210" ry="44" fill="#6cc4d9" />
      <ellipse
        cx="1050"
        cy="632"
        rx="170"
        ry="26"
        fill="#9fdcea"
        opacity=".6"
      />
      <Acacia x={250} y={560} s={1.1} delay={0} />
      <Acacia x={1420} y={540} s={0.8} delay={-2} />
      <Acacia x={760} y={500} s={0.5} delay={-1} />
      {dots(46, 580, 400).map((d, i) => (
        <path
          key={i}
          d={`M${d.x - 9} ${d.y}Q${d.x - 8} ${d.y - 14} ${d.x - 15} ${d.y - 24}Q${d.x - 3} ${d.y - 16} ${d.x} ${d.y - 6}Q${d.x + 2} ${d.y - 20} ${d.x + 10} ${d.y - 30}Q${d.x + 6} ${d.y - 12} ${d.x + 9} ${d.y}Z`}
          fill={i % 3 ? "#c79a43" : "#9cbf55"}
        />
      ))}
    </>
  );
}

function Beach() {
  return (
    <>
      <defs>
        <linearGradient id="seek-beach-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fc8f2" />
          <stop offset="1" stopColor="#fff0d2" />
        </linearGradient>
        <linearGradient id="seek-beach-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e8fc6" />
          <stop offset="1" stopColor="#5fd0e6" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#seek-beach-sky)" />
      <circle cx="260" cy="150" r="70" fill="#ffe27a" />
      <Cloud x={700} y={130} delay={-3} />
      <Cloud x={1250} y={190} s={0.7} delay={-8} />
      <rect y="300" width="1600" height="330" fill="url(#seek-beach-sea)" />
      <path d="M1080 300Q1160 240 1250 300Z" fill="#3e8a54" />
      {[360, 430, 500, 570].map((y, i) => (
        <g
          key={y}
          className="sm-bob"
          style={{
            "--sm-amp": "4px",
            "--sm-dur": "2.6s",
            "--sm-delay": `${-i * 0.6}s`,
          }}
        >
          <path
            d={`M0 ${y}${Array.from({ length: 17 }, (_, k) => `q50 -16 100 0`).join("")}`}
            fill="none"
            stroke="#c8f1fb"
            strokeWidth="5"
            opacity=".7"
          />
        </g>
      ))}
      <path
        d="M0 640Q200 600 420 625T860 615T1300 630T1600 610V1000H0Z"
        fill="#f6dca5"
      />
      <path
        d="M0 640Q200 600 420 625T860 615T1300 630T1600 610"
        fill="none"
        stroke="#fff8e8"
        strokeWidth="12"
        opacity=".8"
      />
      {dots(90, 660, 330).map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#d9b678" />
      ))}
      <g transform="translate(600 880)">
        <path d="M0 0V-220" stroke="#7a5a3a" strokeWidth="8" />
        <path d="M-150-200Q0-300 150-200Z" fill="#ff6f61" />
        <path d="M-50-232Q0-300 50-232L30-200H-30Z" fill="#fff4e0" />
        <rect
          x="-110"
          y="10"
          width="200"
          height="60"
          rx="10"
          fill="#5fc4c0"
          transform="rotate(-6)"
        />
      </g>
      <Palm x={1460} y={720} s={1.2} flip={-1} delay={0} />
      <Palm x={120} y={680} s={0.9} delay={-1.5} />
    </>
  );
}

function Jungle() {
  const leaves = [
    [80, 160, 40, "#2f7a3f"],
    [260, 90, -20, "#3b9150"],
    [520, 140, 30, "#2a6b3a"],
    [760, 80, -35, "#3b9150"],
    [1000, 150, 20, "#2f7a3f"],
    [1240, 90, -25, "#45a05a"],
    [1480, 150, 35, "#2a6b3a"],
  ] as const;
  return (
    <>
      <defs>
        <linearGradient id="seek-jungle-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe7a0" />
          <stop offset="1" stopColor="#4f9a57" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#seek-jungle-sky)" />
      {[300, 700, 1150].map((x) => (
        <path
          key={x}
          d={`M${x} 0L${x + 140} 0L${x + 360} 1000H${x + 160}Z`}
          fill="#fffbd0"
          opacity=".16"
        />
      ))}
      <path
        d="M0 420Q200 340 420 400T860 380T1300 410T1600 380V1000H0Z"
        fill="#3f8a4a"
        opacity=".55"
      />
      {[180, 640, 1120, 1450].map((x, i) => (
        <g key={x}>
          <rect
            x={x - 40}
            y="0"
            width={80 - i * 6}
            height="1000"
            fill={i % 2 ? "#6b4a2b" : "#7b5634"}
          />
          <path
            d={`M${x - 40} 300q30 20 0 60M${x + 20} 600q-30 20 0 60`}
            stroke="#4f3520"
            strokeWidth="5"
            fill="none"
          />
        </g>
      ))}
      <path
        d="M0 760Q300 700 620 750T1200 740T1600 730V1000H0Z"
        fill="#356e35"
      />
      <path d="M0 870Q400 830 800 860T1600 850V1000H0Z" fill="#2b5c2c" />
      <path
        d="M380 1000Q520 900 760 920T1240 1000Z"
        fill="#4fb3c8"
        opacity=".85"
      />
      {[120, 420, 860, 1300].map((x, i) => (
        <g
          key={x}
          className="sm-sway"
          style={{
            "--sm-deg": "4deg",
            "--sm-dur": `${3 + i * 0.4}s`,
            "--sm-origin": "50% 0%",
          }}
        >
          <path
            d={`M${x} 0Q${x + 30} 140 ${x - 10} 300`}
            fill="none"
            stroke="#3d7a2f"
            strokeWidth="7"
          />
          {[80, 160, 240].map((y) => (
            <ellipse
              key={y}
              cx={x + 8}
              cy={y}
              rx="16"
              ry="8"
              fill="#5aa845"
              transform={`rotate(-30 ${x + 8} ${y})`}
            />
          ))}
        </g>
      ))}
      {leaves.map(([x, y, angle, fill], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <g
            className="sm-sway"
            style={{
              "--sm-deg": "2deg",
              "--sm-dur": `${4 + (i % 3)}s`,
              "--sm-delay": `${-i}s`,
            }}
          >
            <path d="M-160 0Q0-110 160 0Q0 110-160 0Z" fill={fill} />
            <path d="M-150 0H150" stroke="#1f5a2c" strokeWidth="5" />
          </g>
        </g>
      ))}
      {[
        [200, 960],
        [600, 940],
        [1400, 950],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cy="-11"
              rx="7"
              ry="11"
              fill="#ff7aa8"
              transform={`rotate(${a})`}
            />
          ))}
          <circle r="6" fill="#ffd54f" />
        </g>
      ))}
    </>
  );
}

/** Full-bleed illustrated backdrop for a Hide & Seek scene. */
export const SeekSceneArt = memo(function SeekSceneArt({
  scene,
}: {
  scene: SeekSceneId;
}) {
  return (
    <svg
      className="seek-scene-art"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {scene === "savanna" ? (
        <Savanna />
      ) : scene === "beach" ? (
        <Beach />
      ) : (
        <Jungle />
      )}
    </svg>
  );
});

/** Scenery drawn over a hiding critter; `depth` is how much of it is covered. */
export function SeekCoverArt({
  cover,
  depth,
}: {
  cover: SeekCover;
  depth: number;
}) {
  const top = 100 - depth * 100;
  let art;
  switch (cover) {
    case "bush":
      art = (
        <g>
          <path
            d={`M-10 ${top + 30}Q-14 112 50 112Q114 112 110 ${top + 30}Z`}
            fill="#3f8a3c"
          />
          <circle cx="14" cy={top + 28} r="24" fill="#3f8a3c" />
          <circle cx="86" cy={top + 26} r="24" fill="#3f8a3c" />
          <circle cx="50" cy={top + 18} r="28" fill="#4fa04a" />
          <circle cx="40" cy={top + 10} r="6" fill="#7cc46a" />
          <circle cx="72" cy={top + 22} r="5" fill="#7cc46a" />
          <circle cx="22" cy={top + 34} r="4" fill="#ff8fb1" />
          <circle cx="80" cy={top + 44} r="4" fill="#fff07a" />
        </g>
      );
      break;
    case "rock":
      art = (
        <g>
          <ellipse cx="50" cy="106" rx="58" ry="9" fill="#000" opacity=".14" />
          <path
            d={`M-4 ${top + 30}Q8 ${top - 2} 46 ${top + 2}Q92 ${top} 106 ${top + 36}Q112 106 50 106Q-12 106-4 ${top + 30}Z`}
            fill="#9a958c"
          />
          <path
            d={`M60 106Q100 104 106 ${top + 36}Q104 80 70 96Z`}
            fill="#7f7a72"
          />
          <path
            d={`M14 ${top + 18}Q36 ${top + 4} 60 ${top + 8}`}
            fill="none"
            stroke="#c9c4ba"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      );
      break;
    case "leaf":
      art = (
        <g>
          <path
            d={`M-20 120Q-10 ${top} 60 ${top - 4}Q40 ${top + 50} -20 120Z`}
            fill="#2f8a45"
          />
          <path
            d={`M120 120Q110 ${top + 6} 36 ${top + 4}Q60 ${top + 56} 120 120Z`}
            fill="#3ea152"
          />
          <path
            d={`M-14 116Q20 ${top + 40} 56 ${top}M114 116Q80 ${top + 44} 40 ${top + 8}`}
            fill="none"
            stroke="#1f5a2c"
            strokeWidth="3"
          />
        </g>
      );
      break;
    case "wave":
      art = (
        <g>
          <path
            d={`M-12 ${top + 14}q15-16 31 0t31 0t31 0t31 0Q112 104 50 104Q-12 104-12 ${top + 14}Z`}
            fill="#2ea4d6"
            opacity=".94"
          />
          <path
            d={`M-12 ${top + 14}q15-16 31 0t31 0t31 0t31 0`}
            fill="none"
            stroke="#e8fbff"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="8" cy={top + 2} r="4" fill="#e8fbff" />
          <circle cx="96" cy={top + 4} r="3" fill="#e8fbff" />
        </g>
      );
      break;
    case "sand":
      art = (
        <g>
          <path
            d={`M-14 120Q0 ${top} 50 ${top - 2}Q100 ${top} 114 120Z`}
            fill="#efcd8a"
          />
          <circle cx="30" cy={top + 22} r="3" fill="#d6ad62" />
          <circle cx="66" cy={top + 30} r="3" fill="#d6ad62" />
          <circle cx="50" cy={top + 14} r="2" fill="#fff4dc" />
        </g>
      );
      break;
    case "trunk": {
      const w = 20 + depth * 70;
      art = (
        <g>
          <path d={`M-12 140L-8-120H${w - 14}L${w - 8} 140Z`} fill="#7b5634" />
          <path
            d={`M0 10q10 10 0 24M${w / 2} 60q-8 10 0 20M4-60q8 8 0 18`}
            fill="none"
            stroke="#4f3520"
            strokeWidth="3"
          />
          <ellipse cx={w / 2 - 10} cy="-128" rx="80" ry="34" fill="#4f8a3a" />
          <ellipse cx={w / 2 + 20} cy="-140" rx="56" ry="24" fill="#62a346" />
          <ellipse
            cx={w / 2 - 10}
            cy="138"
            rx="46"
            ry="12"
            fill="#000"
            opacity=".12"
          />
        </g>
      );
      break;
    }
  }
  return (
    <svg
      className="seek-cover"
      viewBox="0 0 100 100"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      {art}
    </svg>
  );
}
