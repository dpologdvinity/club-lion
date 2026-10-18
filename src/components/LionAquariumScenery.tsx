import { mat } from "./MaterialDefs";
import { memo, type CSSProperties } from "react";

const STAGE_WIDTH = 2400;
const FLOOR_Y = 540;
// The glass tunnel is a half-ellipse rising from the sand: 1200 wide, 360 tall.
const TUNNEL = { cx: 1200, rx: 1200, ry: 360, base: FLOOR_Y + 20 };

// Rotate about the local origin, like an SVG rotate(), instead of the fill-box.
const PIVOT: CSSProperties = { transformBox: "view-box", "--sm-origin": "0 0" };

// Deterministic bubble column so the water never reshuffles between frames.
// Bubbles start below the stage and rise through it, so each trip is seamless.
const BUBBLES = Array.from({ length: 22 }, (_, i) => ({
  x: 90 + ((i * 431) % (STAGE_WIDTH - 180)),
  y: 716 + (i % 3),
  r: 3 + (i % 4) * 1.6,
  dur: 6 + (i % 5) * 1.1,
  delay: -((i * 0.73) % 6),
}));

// Ribs of the tunnel: each one stands on the sand and meets the arch.
const RIBS = Array.from({ length: 9 }, (_, i) => {
  const x = 200 + i * 250;
  const dx = (x - TUNNEL.cx) / TUNNEL.rx;
  return {
    x,
    top: TUNNEL.base - TUNNEL.ry * Math.sqrt(1 - dx * dx),
  };
});

const STARFISH_POINTS = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 26 : 11;
  const a = (i * Math.PI) / 5 - Math.PI / 2;
  return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
}).join(" ");

const BIG_FISH = [
  {
    x: 560,
    y: 330,
    s: 0.95,
    body: "#ff8a3d",
    fin: "#e0662b",
    stripe: "#fff6e6",
    flip: false,
    glide: 260,
    dur: 7,
    delay: -1,
  },
  {
    x: 1000,
    y: 262,
    s: 1.1,
    body: "#2ec4b6",
    fin: "#1f7f8a",
    stripe: null,
    flip: true,
    glide: -240,
    dur: 8.5,
    delay: -3,
  },
  {
    x: 1720,
    y: 392,
    s: 1.0,
    body: "#ffd23f",
    fin: "#2d6fb3",
    stripe: null,
    flip: false,
    glide: 200,
    dur: 6,
    delay: -2,
  },
  {
    x: 2060,
    y: 300,
    s: 0.85,
    body: "#b57bff",
    fin: "#7a4fd1",
    stripe: "#f6e9ff",
    flip: true,
    glide: -200,
    dur: 9,
    delay: -5,
  },
];

function Fish({
  body,
  fin,
  stripe,
  flip,
}: {
  body: string;
  fin: string;
  stripe: string | null;
  flip: boolean;
}) {
  return (
    <g transform={flip ? "scale(-1 1)" : undefined}>
      <path d="M128 0L176-30Q168 0 176 30Z" fill={fin} />
      <path d="M46-30Q70-58 98-28Z" fill={fin} />
      <path d="M0 0C30-38 110-40 138 0C110 40 30 38 0 0Z" fill={body} />
      {stripe && (
        <>
          <path
            d="M52-33Q60 0 52 33"
            fill="none"
            stroke={stripe}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M100-26Q106 0 100 26"
            fill="none"
            stroke={stripe}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}
      <circle cx="26" cy="-6" r="7" fill="#fff" />
      <circle cx="28" cy="-6" r="3.6" fill="#1d2b3a" />
      <path
        d="M4 12Q10 16 16 12"
        fill="none"
        stroke="#1d2b3a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function Ray({
  x,
  y,
  s,
  flip,
  glide,
  dur,
}: {
  x: number;
  y: number;
  s: number;
  flip: boolean;
  glide: number;
  dur: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g
        className="sm-glide"
        style={{
          "--sm-x": `${glide}px`,
          "--sm-y": "-14px",
          "--sm-dur": `${dur}s`,
        }}
      >
        <path
          d="M0 0C40-44 120-50 170-6C120 14 40 16 0 0Z"
          fill="#2e5c86"
          stroke="#7fb6dc"
          strokeWidth="2"
        />
        <path
          d="M170-6L230 0"
          fill="none"
          stroke="#2e5c86"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="30" cy="0" r="2.4" fill="#e7f7ff" />
        <circle cx="46" cy="0" r="2.4" fill="#e7f7ff" />
      </g>
    </g>
  );
}

function Jellyfish({
  x,
  y,
  s,
  delay,
}: {
  x: number;
  y: number;
  s: number;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g
        className="sm-bob"
        style={{
          "--sm-amp": "9px",
          "--sm-dur": "3.4s",
          "--sm-delay": `${delay}s`,
        }}
      >
        <g
          className="sm-pulse"
          style={{
            ...PIVOT,
            "--sm-origin": "50% 0",
            "--sm-scale": "1.08",
            "--sm-dur": "1.7s",
            "--sm-delay": `${delay}s`,
          }}
        >
          <path
            d="M-46 0Q-46-56 0-56Q46-56 46 0Q24 14 0 2Q-24 14-46 0Z"
            fill="#ffd1f5"
            fillOpacity=".78"
            stroke="#fff"
            strokeWidth="2"
          />
          <ellipse cx="-12" cy="-30" rx="10" ry="14" fill="#fff" opacity=".5" />
        </g>
        {[-26, -9, 9, 26].map((dx, i) => (
          <path
            key={dx}
            d={`M${dx} 4Q${dx + (i % 2 ? 9 : -9)} 40 ${dx} 70T${dx} 120`}
            fill="none"
            stroke="#ffd1f5"
            strokeOpacity=".7"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </g>
    </g>
  );
}

function Turtle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className="sm-glide"
        style={{ "--sm-x": "-260px", "--sm-y": "0px", "--sm-dur": "10s" }}
      >
        <ellipse cx="0" cy="-6" rx="58" ry="10" fill="#000" opacity=".12" />
        <ellipse
          cx="34"
          cy="-12"
          rx="22"
          ry="8"
          fill="#8cc063"
          transform="rotate(-18 34 -12)"
        />
        <ellipse
          cx="-26"
          cy="-14"
          rx="20"
          ry="7"
          fill="#8cc063"
          transform="rotate(16 -26 -14)"
        />
        <circle cx="66" cy="-18" r="16" fill="#9fd06f" />
        <circle cx="71" cy="-22" r="2.6" fill="#1d2b3a" />
        <path
          d="M-54-18C-54-44 54-44 54-18C30 4-30 4-54-18Z"
          fill="#5f9b4a"
          stroke="#3c6b30"
          strokeWidth="2"
        />
        <path d="M-30-22L-10-30L10-30L30-22L14-12L-14-12Z" fill="#7fb864" />
      </g>
    </g>
  );
}

function Coral({
  x,
  y,
  h,
  color,
}: {
  x: number;
  y: number;
  h: number;
  color: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" strokeLinecap="round">
      <path
        d={`M0 0L-12 ${-h * 0.5}M0 0L14 ${-h * 0.55}`}
        stroke={color}
        strokeWidth="14"
      />
      <path
        d={`M-12 ${-h * 0.5}L-34 ${-h * 0.8}M-12 ${-h * 0.5}L-6 ${-h}`}
        stroke={color}
        strokeWidth="10"
      />
      <path
        d={`M14 ${-h * 0.55}L36 ${-h * 0.9}M14 ${-h * 0.55}L22 ${-h * 1.02}`}
        stroke={color}
        strokeWidth="10"
      />
    </g>
  );
}

function SeaFan({
  x,
  y,
  s,
  delay,
}: {
  x: number;
  y: number;
  s: number;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g
        className="sm-sway"
        style={{
          "--sm-origin": "50% 100%",
          "--sm-deg": "4deg",
          "--sm-dur": "3.6s",
          "--sm-delay": `${delay}s`,
        }}
      >
        <path
          d="M0 0C-50-30-60-80-40-110C-20-130 20-130 40-110C60-80 50-30 0 0Z"
          fill="#d9557a"
          opacity=".9"
        />
        {[-30, -10, 10, 30].map((dx) => (
          <path
            key={dx}
            d={`M0 0L${dx} -110`}
            stroke="#f48aa8"
            strokeWidth="2"
          />
        ))}
      </g>
    </g>
  );
}

function Kelp({ x, delay, h }: { x: number; delay: number; h: number }) {
  return (
    <g
      className="sm-sway"
      style={{
        "--sm-origin": "50% 100%",
        "--sm-deg": "5deg",
        "--sm-dur": "4.2s",
        "--sm-delay": `${delay}s`,
      }}
    >
      <path
        d={`M${x} ${FLOOR_Y + 40}C${x + 16} ${FLOOR_Y - h * 0.3} ${x - 16} ${FLOOR_Y - h * 0.6} ${x + 6} ${FLOOR_Y - h}`}
        fill="none"
        stroke="#2f9e6a"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <ellipse
        cx={x + 12}
        cy={FLOOR_Y - h * 0.45}
        rx="10"
        ry="18"
        fill="#4fc07f"
      />
      <ellipse
        cx={x - 8}
        cy={FLOOR_Y - h * 0.8}
        rx="9"
        ry="16"
        fill="#4fc07f"
      />
    </g>
  );
}

function StarfishAndCrab() {
  return (
    <g>
      <g transform="translate(1482 606)">
        <g
          className="sm-sway"
          style={{
            "--sm-deg": "10deg",
            "--sm-dur": "0.9s",
            "--sm-delay": "-0.3s",
          }}
        >
          <polygon
            points={STARFISH_POINTS}
            fill="#ff8a3d"
            stroke="#c2561a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle r="4" fill="#ffd0a0" />
        </g>
      </g>
      <g transform="translate(1636 612) rotate(-12)">
        <g
          className="sm-pulse"
          style={{
            "--sm-scale": "1.12",
            "--sm-dur": "1.3s",
            "--sm-delay": "-0.6s",
          }}
        >
          <polygon
            points={STARFISH_POINTS}
            fill="#ffb347"
            stroke="#c2561a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <g transform="translate(1560 650)">
        <g
          className="sm-sway"
          style={{
            "--sm-origin": "50% 100%",
            "--sm-deg": "6deg",
            "--sm-dur": "0.7s",
          }}
        >
          <ellipse
            rx="30"
            ry="18"
            fill="#ff6b5b"
            stroke="#a83a2e"
            strokeWidth="2"
          />
          <circle
            cx="-22"
            cy="-22"
            r="5"
            fill="#ff6b5b"
            stroke="#a83a2e"
            strokeWidth="2"
          />
          <circle
            cx="22"
            cy="-22"
            r="5"
            fill="#ff6b5b"
            stroke="#a83a2e"
            strokeWidth="2"
          />
          <circle cx="-9" cy="-8" r="3.2" fill="#fff" />
          <circle cx="9" cy="-8" r="3.2" fill="#fff" />
          <circle cx="-9" cy="-8" r="1.6" fill="#1d2b3a" />
          <circle cx="9" cy="-8" r="1.6" fill="#1d2b3a" />
          <path
            d="M-30-2L-52-18M-30 6L-54 8M30-2L52-18M30 6L54 8"
            stroke="#a83a2e"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="-54"
            cy="-22"
            r="10"
            fill="#ff6b5b"
            stroke="#a83a2e"
            strokeWidth="2"
          />
          <circle
            cx="54"
            cy="-22"
            r="10"
            fill="#ff6b5b"
            stroke="#a83a2e"
            strokeWidth="2"
          />
        </g>
      </g>
    </g>
  );
}

function FeedingStation() {
  return (
    <g>
      <rect x="752" y="470" width="16" height="130" rx="6" fill="#8a5a33" />
      <ellipse cx="760" cy="604" rx="58" ry="12" fill="#000" opacity=".15" />
      <rect x="700" y="570" width="120" height="44" rx="10" fill="#c86b3c" />
      <rect x="700" y="570" width="120" height="10" rx="5" fill="#e28a58" />
      <path d="M704 586H816M704 600H816" stroke="#8c4420" strokeWidth="3" />
      <ellipse
        cx="760"
        cy="520"
        rx="48"
        ry="12"
        fill="#2b8fb6"
        stroke="#fff"
        strokeWidth="3"
      />
      <g fill="#ffd27a" stroke="#c2561a" strokeWidth="1.5">
        <circle cx="742" cy="517" r="4" />
        <circle cx="758" cy="513" r="4" />
        <circle cx="772" cy="519" r="4" />
        <circle cx="750" cy="524" r="3.5" />
      </g>
    </g>
  );
}

export function LionAquariumScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <LionAquariumStage />;
}

const LionAquariumStage = memo(function LionAquariumStage() {
  const rays = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: 180 + i * 390,
    w: 120 + (i % 3) * 40,
    deg: 2 + (i % 2),
    delay: -i * 1.1,
  }));
  const schoolFish = Array.from({ length: 7 }, (_, i) => ({
    x: 1300 + i * 34,
    y: 430 + Math.sin(i * 1.7) * 18,
  }));
  const caustics = Array.from({ length: 6 }, (_, i) => ({
    x: 240 + i * 380,
    rx: 90 + (i % 3) * 30,
  }));
  const kelpX = [330, 1180, 1990, 2280];

  return (
    <g className="lion-aquarium-scenery">
      <defs>
        <linearGradient id="la-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fe3f2" />
          <stop offset="30%" stopColor="#2c9dc4" />
          <stop offset="70%" stopColor="#15678f" />
          <stop offset="100%" stopColor="#0c3f63" />
        </linearGradient>
        <linearGradient id="la-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6fbff" stopOpacity=".42" />
          <stop offset="100%" stopColor="#bdeeff" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id="la-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1d29c" />
          <stop offset="60%" stopColor="#dcae72" />
          <stop offset="100%" stopColor="#b9864c" />
        </linearGradient>
        <radialGradient id="la-glow">
          <stop offset="0%" stopColor="#d6fbff" stopOpacity=".7" />
          <stop offset="100%" stopColor="#7fe3f2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="la-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2feff" stopOpacity=".55" />
          <stop offset="100%" stopColor="#f2feff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={STAGE_WIDTH} height="720" fill="url(#la-water)" />
      <ellipse
        cx="1200"
        cy="0"
        rx="1300"
        ry="340"
        fill="url(#la-glow)"
        className="sm-pulse"
        style={{
          ...PIVOT,
          "--sm-origin": "50% 0",
          "--sm-scale": "1.05",
          "--sm-dur": "5s",
        }}
      />

      {/* Light shafts from the surface */}
      {rays.map((ray) => (
        <path
          key={ray.x}
          className="sm-sway"
          style={{
            ...PIVOT,
            "--sm-origin": "50% 0",
            "--sm-deg": `${ray.deg}deg`,
            "--sm-dur": "7s",
            "--sm-delay": `${ray.delay}s`,
          }}
          d={`M${ray.x} 0L${ray.x + ray.w} 0L${ray.x + ray.w + 180} 560L${ray.x + 60} 560Z`}
          fill="url(#la-ray)"
          opacity=".5"
        />
      ))}

      {/* Distant whale silhouette behind the glass */}
      <g transform="translate(1520 150) scale(1.3)">
        <g
          className="sm-glide"
          style={{ "--sm-x": "160px", "--sm-y": "0px", "--sm-dur": "24s" }}
        >
          <path
            d="M0 40C40-10 150-20 230 10C280 30 300 0 330-20C350-40 380-40 380-30C370 0 380 30 340 50C290 60 240 60 180 50C110 55 40 70 0 40Z"
            fill="#0b4a72"
            opacity=".55"
          />
          <path
            d="M40 40C110 26 180 30 230 14"
            fill="none"
            stroke="#9fdcf0"
            strokeOpacity=".35"
            strokeWidth="3"
          />
        </g>
      </g>

      {/* Glass tunnel */}
      <path
        d={`M0 ${TUNNEL.base}A${TUNNEL.rx} ${TUNNEL.ry} 0 0 1 ${STAGE_WIDTH} ${TUNNEL.base}Z`}
        fill="url(#la-glass)"
      />
      <path
        d={`M0 ${TUNNEL.base}A${TUNNEL.rx} ${TUNNEL.ry} 0 0 1 ${STAGE_WIDTH} ${TUNNEL.base}Z`}
        fill={mat("glass")}
      />
      <path
        d={`M0 ${TUNNEL.base}A${TUNNEL.rx} ${TUNNEL.ry} 0 0 1 ${STAGE_WIDTH} ${TUNNEL.base}`}
        fill="none"
        stroke="#0a3550"
        strokeWidth="16"
      />
      <path
        d={`M0 ${TUNNEL.base}A${TUNNEL.rx} ${TUNNEL.ry} 0 0 1 ${STAGE_WIDTH} ${TUNNEL.base}`}
        fill="none"
        stroke="#cdf4ff"
        strokeOpacity=".7"
        strokeWidth="3"
        transform="translate(0 -10)"
      />
      {RIBS.map((rib) => (
        <path
          key={rib.x}
          d={`M${rib.x} ${TUNNEL.base}V${rib.top.toFixed(1)}`}
          stroke="#0a3550"
          strokeOpacity=".5"
          strokeWidth="8"
        />
      ))}

      {/* Sea life inside the tunnel */}
      <Jellyfish x={380} y={250} s={1} delay={-1} />
      <Jellyfish x={1500} y={230} s={0.85} delay={-2.4} />
      <Jellyfish x={2180} y={330} s={0.7} delay={-0.6} />

      <Ray x={420} y={430} s={2.2} flip={false} glide={300} dur={11} />
      <Ray x={1900} y={470} s={1.6} flip glide={-260} dur={13} />

      {BIG_FISH.map((fish) => (
        <g
          key={fish.x}
          transform={`translate(${fish.x} ${fish.y}) scale(${fish.s})`}
        >
          <g
            className="sm-glide"
            style={{
              "--sm-x": `${fish.glide}px`,
              "--sm-y": "-10px",
              "--sm-dur": `${fish.dur}s`,
              "--sm-delay": `${fish.delay}s`,
            }}
          >
            <Fish
              body={fish.body}
              fin={fish.fin}
              stripe={fish.stripe}
              flip={fish.flip}
            />
          </g>
        </g>
      ))}

      <g>
        {schoolFish.map((fish, i) => (
          <g key={fish.x} transform={`translate(${fish.x} ${fish.y})`}>
            <g
              className="sm-glide"
              style={{
                "--sm-x": "110px",
                "--sm-y": "0px",
                "--sm-dur": "3.6s",
                "--sm-delay": `${-i * 0.4}s`,
              }}
            >
              <g transform="scale(0.5)">
                <Fish body="#9fe7ff" fin="#4fb6d9" stripe={null} flip={false} />
              </g>
            </g>
          </g>
        ))}
      </g>

      {/* Turtle gliding past the glass */}
      <Turtle x={1960} y={500} />

      {/* Sand floor, the walkway */}
      <path
        d={`M0 ${FLOOR_Y}Q600 ${FLOOR_Y - 14} 1200 ${FLOOR_Y}T2400 ${FLOOR_Y}V720H0Z`}
        fill="url(#la-sand)"
      />
      <path
        d={`M0 ${FLOOR_Y}Q600 ${FLOOR_Y - 14} 1200 ${FLOOR_Y}T2400 ${FLOOR_Y}V720H0Z`}
        fill={mat("sand")}
      />
      <path
        d={`M0 ${FLOOR_Y}Q600 ${FLOOR_Y - 14} 1200 ${FLOOR_Y}T2400 ${FLOOR_Y}`}
        fill="none"
        stroke="#fff2d6"
        strokeWidth="4"
        strokeOpacity=".7"
      />
      {caustics.map((c) => (
        <ellipse
          key={c.x}
          cx={c.x}
          cy="566"
          rx={c.rx}
          ry="10"
          fill="none"
          stroke="#fffbe8"
          strokeWidth="3"
          className="sm-twinkle"
          style={{ "--sm-dur": "3.1s" }}
        />
      ))}
      {Array.from({ length: 36 }, (_, i) => (
        <ellipse
          key={i}
          cx={(i * 281) % STAGE_WIDTH}
          cy={600 + ((i * 97) % 110)}
          rx={3 + (i % 3)}
          ry={2 + (i % 2)}
          fill={i % 2 ? "#b9864c" : "#fff2d6"}
          opacity=".6"
        />
      ))}

      {/* Reef along the floor */}
      <Coral x={120} y={650} h={170} color="#ff7f7a" />
      <Coral x={300} y={690} h={120} color="#ffb36b" />
      <Coral x={2000} y={690} h={150} color="#c77dff" />
      <Coral x={2250} y={650} h={200} color="#ff7f7a" />
      <SeaFan x={520} y={680} s={1.2} delay={-1} />
      <SeaFan x={1340} y={700} s={1} delay={-2} />
      <SeaFan x={2130} y={690} s={1.4} delay={-0.5} />
      {kelpX.map((x, i) => (
        <Kelp key={x} x={x} delay={-i * 0.9} h={190 + (i % 2) * 40} />
      ))}

      {/* Touch pool: a rock rim around shallow water */}
      <ellipse cx="1560" cy="610" rx="200" ry="42" fill="#6b5a4a" />
      <ellipse cx="1560" cy="610" rx="200" ry="42" fill={mat("rock")} />
      <ellipse
        cx="1560"
        cy="606"
        rx="182"
        ry="34"
        fill="#3aa6cf"
        stroke="#8ad9ef"
        strokeWidth="3"
      />
      <ellipse cx="1520" cy="596" rx="60" ry="8" fill="#e8fbff" opacity=".5" />
      <StarfishAndCrab />

      <FeedingStation />

      {/* Rising bubbles */}
      {BUBBLES.map((b) => (
        <circle
          key={`${b.x}-${b.y}`}
          cx={b.x}
          cy={b.y}
          r={b.r}
          fill="none"
          stroke="#e6fbff"
          strokeOpacity=".8"
          strokeWidth="1.6"
          className="sm-travel"
          style={{
            "--sm-dist": "-760px",
            "--sm-dur": `${b.dur}s`,
            "--sm-delay": `${b.delay}s`,
          }}
        />
      ))}
    </g>
  );
});
