import { mat } from "./MaterialDefs";
import { memo } from "react";

const FLOOR_TOP = 540;
const FLAG_COLORS = ["#ff5a5f", "#ffd84d", "#4aa8ff", "#4cc97a"];

const PEBBLES = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 397) % 2400,
  y: FLOOR_TOP + 20 + ((i * 61) % 170),
  r: 3 + (i % 4),
}));

function Cactus({ x, s }: { x: number; s: number }) {
  return (
    <g transform={`translate(${x} ${FLOOR_TOP}) scale(${s})`} fill="#4f9a5a">
      <rect x="-14" y="-150" width="28" height="150" rx="14" />
      <rect x="-50" y="-110" width="22" height="60" rx="11" />
      <rect x="-50" y="-62" width="44" height="18" rx="9" />
      <rect x="28" y="-125" width="22" height="70" rx="11" />
      <rect x="8" y="-70" width="42" height="18" rx="9" />
    </g>
  );
}

/** A big dinosaur skeleton on show behind the dig. */
function Skeleton({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} 250)`}
      fill="none"
      stroke="#fdf6e6"
      strokeWidth="10"
      strokeLinecap="round"
    >
      <path d="M0 140Q120 40 260 80Q340 100 400 60" />
      <path d="M400 60Q430 30 460 40Q480 50 470 70Q450 80 420 75" />
      {[40, 80, 120, 160, 200, 240].map((rib) => (
        <path key={rib} d={`M${rib} ${110 - rib * 0.15}q10 50 0 80`} />
      ))}
      <path d="M120 130V230M220 120V230M100 230H140M200 230H240" />
      <path d="M0 140Q-60 170 -120 160" />
      <circle cx="450" cy="52" r="5" fill="#5e3a22" stroke="none" />
    </g>
  );
}

export function DinoDigScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <DinoDigStage />;
}

const DinoDigStage = memo(function DinoDigStage() {
  return (
    <g>
      <defs>
        <linearGradient id="dino-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd0f2" />
          <stop offset="1" stopColor="#ffe3b0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="2400" height={FLOOR_TOP} fill="url(#dino-sky)" />
      <circle cx="2050" cy="110" r="60" fill="#fff3b0" className="sm-pulse" />
      <g className="sm-drift" fill="#ffffff" opacity="0.85">
        <ellipse cx="400" cy="90" rx="90" ry="24" />
        <ellipse cx="1400" cy="70" rx="110" ry="26" />
      </g>
      {/* Mesas */}
      <path
        d="M0 420L120 300H420L520 420ZM1500 430L1620 280H1980L2100 430ZM700 440L780 360H1000L1080 440Z"
        fill="#c9773f"
      />
      <path
        d="M0 420L120 300H420L520 420ZM1500 430L1620 280H1980L2100 430ZM700 440L780 360H1000L1080 440Z"
        fill={mat("rock")}
      />
      <path
        d="M120 300H420L430 320H110ZM1620 280H1980L1990 300H1610Z"
        fill="#a85e2c"
      />
      <rect
        x="0"
        y="420"
        width="2400"
        height={FLOOR_TOP - 420}
        fill="#e0a45e"
      />
      <rect
        x="0"
        y="420"
        width="2400"
        height={FLOOR_TOP - 420}
        fill={mat("sand")}
      />
      <Skeleton x={760} />
      {/* Dig tent with flags */}
      <g transform="translate(1900 300)">
        <path
          d="M0 240L120 40L240 240Z"
          fill="#f2e6c8"
          stroke="#b8ad84"
          strokeWidth="6"
        />
        <path d="M0 240L120 40L240 240Z" fill={mat("fabric")} />
        <path d="M100 240L120 120L140 240Z" fill="#8a5a30" />
        <path d="M120 40V0" stroke="#6e4628" strokeWidth="6" />
        <path
          className="sm-sway"
          d="M120 0H170L160 14L170 28H120Z"
          fill="#ff5a5f"
        />
      </g>
      {/* Rope fence with little flags */}
      <path
        d="M300 535Q600 515 900 535Q1200 515 1500 535Q1800 515 2100 535"
        stroke="#8a5a30"
        strokeWidth="5"
        fill="none"
      />
      {Array.from({ length: 24 }, (_, i) => 320 + i * 75).map((x, i) => (
        <path
          key={x}
          d={`M${x - 12} 526H${x + 12}L${x} 548Z`}
          fill={FLAG_COLORS[i % FLAG_COLORS.length]}
        />
      ))}
      <Cactus x={330} s={0.9} />
      <Cactus x={2200} s={1.1} />
      {/* Sandy floor */}
      <rect
        x="0"
        y={FLOOR_TOP}
        width="2400"
        height={720 - FLOOR_TOP}
        fill="#e8b26a"
      />
      <rect
        x="0"
        y={FLOOR_TOP}
        width="2400"
        height={720 - FLOOR_TOP}
        fill={mat("sand")}
      />
      {PEBBLES.map((p) => (
        <circle
          key={`${p.x}-${p.y}`}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill="#c98d4a"
        />
      ))}
      {/* Doorway back to the plaza */}
      <path
        d="M90 540V320Q90 270 170 270Q250 270 250 320V540Z"
        fill="#a85e2c"
      />
      <path
        d="M90 540V320Q90 270 170 270Q250 270 250 320V540Z"
        fill={mat("wood")}
      />
      <path
        d="M110 540V330Q110 290 170 290Q230 290 230 330V540Z"
        fill="#bfe6ff"
      />
    </g>
  );
});
