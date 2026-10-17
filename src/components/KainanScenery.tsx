import { memo, type CSSProperties } from "react";

const FLOOR_TOP = 540;

const FLAG_COLORS = ["#ff5a5f", "#ffd84d", "#4aa8ff", "#4cc97a", "#ff8fab"];

// Banderitas: little triangle flags strung in swags across the ceiling.
const FLAGS = Array.from({ length: 40 }, (_, i) => {
  const x = 30 + i * 60;
  const swag = Math.sin(((i % 10) / 10) * Math.PI) * 34;
  return { x, y: 40 + swag, color: FLAG_COLORS[i % FLAG_COLORS.length] };
});

const TILES = Array.from({ length: 4 * 30 }, (_, i) => ({
  x: (i % 30) * 80,
  y: FLOOR_TOP + Math.floor(i / 30) * 45,
  dark: (i + Math.floor(i / 30)) % 2 === 0,
}));

function CapizWindow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="220" height="190" rx="8" fill="#8a5a30" />
      {Array.from({ length: 5 * 4 }, (_, i) => (
        <rect
          key={i}
          x={12 + (i % 5) * 40}
          y={12 + Math.floor(i / 5) * 42}
          width="36"
          height="38"
          fill="#fdf6e6"
          stroke="#e2d2b0"
          strokeWidth="2"
        />
      ))}
      <rect x="106" y="0" width="8" height="190" fill="#6e4628" />
    </g>
  );
}

function Lamp({ x, delay }: { x: number; delay: string }) {
  const sway: CSSProperties = {
    transformBox: "view-box",
    transformOrigin: `${x}px 0px`,
    "--sm-delay": delay,
  };
  return (
    <g className="sm-sway" style={sway}>
      <path d={`M${x} 0V120`} stroke="#6e4628" strokeWidth="4" />
      <path
        d={`M${x - 46} 170Q${x} 100 ${x + 46} 170Z`}
        fill="#fff3d6"
        stroke="#e2c58f"
        strokeWidth="4"
      />
      <circle cx={x} cy="168" r="12" fill="#ffe08a" className="sm-pulse" />
    </g>
  );
}

function Table({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-8" y="0" width="16" height="44" fill="#6e4628" />
      <ellipse cx="0" cy="0" rx="90" ry="22" fill="#ff8fab" />
      <path
        d="M-90 0Q-80 30 -60 20Q-40 34 -20 22Q0 36 20 22Q40 34 60 20Q80 30 90 0Z"
        fill="#ff6f96"
      />
      <ellipse cx="-36" cy="-6" rx="22" ry="8" fill="#fff" />
      <ellipse cx="36" cy="-6" rx="22" ry="8" fill="#fff" />
      <text x="0" y="-6" fontSize="26" textAnchor="middle">
        🥢
      </text>
    </g>
  );
}

export function KainanScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <KainanStage />;
}

const KainanStage = memo(function KainanStage() {
  return (
    <g>
      {/* Warm painted wall and bamboo wainscot */}
      <rect x="0" y="0" width="2400" height={FLOOR_TOP} fill="#f6d58a" />
      <rect x="0" y="0" width="2400" height="24" fill="#c98a4a" />
      {Array.from({ length: 60 }, (_, i) => (
        <rect
          key={i}
          x={i * 40}
          y="430"
          width="36"
          height={FLOOR_TOP - 430}
          rx="6"
          fill={i % 2 === 0 ? "#d9b46a" : "#cfa65a"}
        />
      ))}
      <rect x="0" y="424" width="2400" height="10" fill="#8a5a30" />

      {/* Doorway back to the plaza */}
      <path
        d="M90 540V300Q90 250 170 250Q250 250 250 300V540Z"
        fill="#7a4a24"
      />
      <path
        d="M110 540V310Q110 270 170 270Q230 270 230 310V540Z"
        fill="#bfe6ff"
      />

      <CapizWindow x={300} y={110} />
      <CapizWindow x={2130} y={110} />

      {/* Sign over the turo-turo counter */}
      <rect
        x="860"
        y="250"
        width="520"
        height="80"
        rx="20"
        fill="#e94b3c"
        stroke="#fff"
        strokeWidth="6"
      />
      <text
        x="1120"
        y="304"
        fontSize="44"
        fontWeight="900"
        fill="#fff8ec"
        textAnchor="middle"
      >
        {"LOLA'S KAINAN"}
      </text>

      {/* Turo-turo counter: point at the food you want */}
      <rect x="640" y="510" width="960" height="24" rx="8" fill="#8a5a30" />
      <rect x="650" y="534" width="940" height="76" fill="#b07a46" />
      <rect
        x="670"
        y="546"
        width="900"
        height="50"
        rx="8"
        fill="#e8f7ff"
        fillOpacity="0.7"
      />
      {[720, 860, 1000, 1140, 1280, 1420].map((x, i) => (
        <text key={x} x={x + 40} y="584" fontSize="30" textAnchor="middle">
          {["🍗", "🍤", "🥟", "🍢", "🍳", "🍌"][i]}
        </text>
      ))}

      {/* Banderitas */}
      <path
        d={`M0 40${FLAGS.map((f) => `L${f.x} ${f.y}`).join("")}L2400 40`}
        fill="none"
        stroke="#8a5a30"
        strokeWidth="3"
      />
      {FLAGS.map((f, i) => (
        <path
          key={f.x}
          className="sm-sway"
          style={{
            transformBox: "view-box",
            transformOrigin: `${f.x}px ${f.y}px`,
            "--sm-delay": `${-(i % 7) * 0.3}s`,
          }}
          d={`M${f.x - 18} ${f.y}H${f.x + 18}L${f.x} ${f.y + 36}Z`}
          fill={f.color}
        />
      ))}

      <Lamp x={620} delay="0s" />
      <Lamp x={1640} delay="-1.2s" />

      {/* Floor tiles */}
      {TILES.map((t) => (
        <rect
          key={`${t.x}-${t.y}`}
          x={t.x}
          y={t.y}
          width="80"
          height="45"
          fill={t.dark ? "#c96f4a" : "#e8a27a"}
        />
      ))}

      <Table x={880} y={660} />
      <Table x={1640} y={670} />

      {/* Potted plants */}
      <g fontSize="70" textAnchor="middle">
        <text x="600" y="540">
          🪴
        </text>
        <text x="1900" y="540">
          🪴
        </text>
      </g>
    </g>
  );
});
