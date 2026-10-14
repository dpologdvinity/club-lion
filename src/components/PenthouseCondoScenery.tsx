import React from "react";

// Dusk skyline seen through the den's arched window. Lights are positioned
// inside the buildings drawn in CondoRoomBackdrop.
const CITY_LIGHTS: readonly { x: number; y: number }[] = [
  { x: 244, y: 250 },
  { x: 296, y: 210 },
  { x: 318, y: 236 },
  { x: 296, y: 262 },
  { x: 356, y: 268 },
  { x: 404, y: 190 },
  { x: 424, y: 214 },
  { x: 404, y: 238 },
  { x: 424, y: 262 },
  { x: 408, y: 290 },
  { x: 476, y: 232 },
  { x: 498, y: 256 },
  { x: 530, y: 262 },
  { x: 576, y: 200 },
  { x: 600, y: 224 },
  { x: 576, y: 252 },
  { x: 600, y: 276 },
  { x: 640, y: 250 },
];

const WINDOW_STARS: readonly { x: number; y: number; r: number }[] = [
  { x: 290, y: 110, r: 1.6 },
  { x: 360, y: 60, r: 2 },
  { x: 470, y: 42, r: 1.5 },
  { x: 560, y: 70, r: 1.8 },
  { x: 250, y: 190, r: 1.4 },
  { x: 540, y: 130, r: 1.2 },
];

const EQ_BARS = [0, 1, 2, 3, 4];

function WindowStars({ seconds }: { seconds: number }) {
  return (
    <g>
      {WINDOW_STARS.map((star, i) => (
        <circle
          key={`${star.x}-${star.y}`}
          cx={star.x}
          cy={star.y}
          r={star.r * (1 + Math.sin(seconds * 2 + i) * 0.25)}
          fill="#fff5d0"
          opacity={0.6 + Math.sin(seconds * 1.5 + i) * 0.3}
        />
      ))}
    </g>
  );
}

function CityLights({ seconds }: { seconds: number }) {
  const palette = ["#ffd166", "#70d6ff", "#ff9770"];
  return (
    <g>
      {CITY_LIGHTS.map((light, i) => (
        <rect
          key={`${light.x}-${light.y}`}
          x={light.x}
          y={light.y}
          width="7"
          height="10"
          rx="1"
          fill={palette[i % palette.length]}
          opacity={0.7 + Math.sin(seconds * 3 + i) * 0.3}
        />
      ))}
    </g>
  );
}

function ChandelierGlow({ seconds }: { seconds: number }) {
  return (
    <circle
      cx="960"
      cy="150"
      r="180"
      fill="url(#pc-chandelier-glow)"
      opacity={0.8 + Math.sin(seconds * 1.1) * 0.15}
    />
  );
}

function LampGlow({ seconds }: { seconds: number }) {
  return (
    <circle
      cx="420"
      cy="282"
      r="130"
      fill="url(#pc-lamp-glow)"
      opacity={0.75 + Math.sin(seconds * 0.9 + 1) * 0.12}
    />
  );
}

function JukeboxEqualizer({ seconds }: { seconds: number }) {
  return (
    <g>
      {EQ_BARS.map((i) => {
        const height = 8 + Math.abs(Math.sin(seconds * 5 + i * 1.3)) * 38;
        return (
          <rect
            key={i}
            x={772 + i * 12}
            y={330 - height}
            width="8"
            height={height}
            rx="2"
            fill="#d64558"
          />
        );
      })}
    </g>
  );
}

const CondoRoomBackdrop = React.memo(function CondoRoomBackdrop() {
  return (
    <g>
      <defs>
        <linearGradient id="pc-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1d42" />
          <stop offset="100%" stopColor="#3b2a56" />
        </linearGradient>
        <linearGradient id="pc-floor-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0c14" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#1a0c14" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pc-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#140f2e" />
          <stop offset="60%" stopColor="#3c2559" />
          <stop offset="85%" stopColor="#a04f70" />
          <stop offset="100%" stopColor="#f29a7b" />
        </linearGradient>
        <radialGradient id="pc-chandelier-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe89e" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffd269" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffd269" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pc-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="pc-trellis"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0L80 40L40 80L0 40Z"
            fill="none"
            stroke="#c9a227"
            strokeWidth="1.5"
            opacity="0.14"
          />
          <circle cx="40" cy="40" r="3" fill="#e8a0a8" opacity="0.18" />
        </pattern>
        <pattern
          id="pc-planks"
          width="220"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <rect width="220" height="60" fill="#7a4a2b" />
          <path
            d="M0 0H220M0 30H220M55 0V30M165 30V60"
            stroke="#4e2c18"
            strokeWidth="2"
            opacity="0.6"
          />
          <path d="M0 2H220" stroke="#a06a40" strokeWidth="2" opacity="0.25" />
        </pattern>
        <clipPath id="pc-window-clip">
          <path d="M220 330V160A220 140 0 0 1 660 160V330Z" />
        </clipPath>
      </defs>

      <rect x="0" y="0" width="1920" height="500" fill="url(#pc-wall)" />
      <rect x="0" y="0" width="1920" height="500" fill="url(#pc-trellis)" />

      <g clipPath="url(#pc-window-clip)">
        <rect x="200" y="20" width="480" height="320" fill="url(#pc-dusk)" />
        <circle cx="600" cy="90" r="22" fill="#fff2b2" />
        <circle cx="610" cy="84" r="20" fill="#2a1d4f" />
        {[
          { x: 232, y: 230, w: 50 },
          { x: 284, y: 190, w: 60 },
          { x: 346, y: 250, w: 44 },
          { x: 392, y: 170, w: 70 },
          { x: 464, y: 210, w: 56 },
          { x: 522, y: 240, w: 40 },
          { x: 564, y: 180, w: 64 },
          { x: 630, y: 230, w: 40 },
        ].map((b) => (
          <rect
            key={b.x}
            x={b.x}
            y={b.y}
            width={b.w}
            height={330 - b.y}
            fill="#1a1333"
          />
        ))}
        <rect x="425" y="120" width="4" height="50" fill="#1a1333" />
        <circle cx="427" cy="118" r="3" fill="#ff6f91" />
      </g>

      <path
        d="M220 330V160A220 140 0 0 1 660 160V330Z"
        fill="none"
        stroke="#4a2f2a"
        strokeWidth="14"
      />
      <path d="M440 20V330M220 250H660" stroke="#4a2f2a" strokeWidth="8" />
      <rect x="200" y="330" width="480" height="16" rx="4" fill="#8b5a34" />

      <path
        d="M160 40H236Q218 200 232 350Q196 362 160 350Z"
        fill="#e8a0a8"
        stroke="#b8677a"
        strokeWidth="4"
      />
      <path
        d="M720 40H644Q662 200 648 350Q684 362 720 350Z"
        fill="#e8a0a8"
        stroke="#b8677a"
        strokeWidth="4"
      />
      <path
        d="M186 60Q200 180 190 330M694 60Q680 180 690 330"
        fill="none"
        stroke="#c97a8e"
        strokeWidth="3"
        opacity="0.6"
      />
      <path
        d="M140 36H740"
        stroke="#c9a227"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="138" cy="36" r="8" fill="#c9a227" />
      <circle cx="742" cy="36" r="8" fill="#c9a227" />

      <g>
        <line
          x1="960"
          y1="58"
          x2="960"
          y2="90"
          stroke="#c9a227"
          strokeWidth="6"
        />
        <g transform="translate(960 90)">
          <polygon
            points="-80,0 80,0 60,30 -60,30"
            fill="#d4af37"
            stroke="#997715"
            strokeWidth="2"
          />
          <polygon
            points="-120,30 120,30 100,60 -100,60"
            fill="#e6c65e"
            stroke="#997715"
            strokeWidth="2"
          />
          {[-90, -60, -30, 0, 30, 60, 90].map((cx) => (
            <g key={cx} transform={`translate(${cx} 60)`}>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="25"
                stroke="#ffeaa7"
                strokeWidth="2"
              />
              <polygon
                points="-5,25 5,25 0,40"
                fill="#fff9db"
                stroke="#ffd43b"
                strokeWidth="1"
              />
            </g>
          ))}
        </g>
      </g>

      <g transform="translate(960 38)">
        <rect
          x="-180"
          y="-18"
          width="360"
          height="36"
          rx="8"
          fill="#1d1527"
          stroke="#d4af37"
          strokeWidth="3"
        />
        <text
          y="6"
          textAnchor="middle"
          fill="#f7d97b"
          fontSize="17"
          fontWeight="bold"
          letterSpacing="4"
        >
          LUXURY PENTHOUSE DEN
        </text>
      </g>

      {[
        { x: 60, y: 220 },
        { x: 1860, y: 220 },
      ].map((sconce) => (
        <g key={sconce.x} transform={`translate(${sconce.x} ${sconce.y})`}>
          <path
            d="M-20 -40 L20 -40 L10 20 L-10 20 Z"
            fill="#d4af37"
            stroke="#876800"
            strokeWidth="2"
          />
          <polygon points="-35,-40 35,-40 0,-90" fill="#ffeaa7" opacity="0.4" />
          <circle cx="0" cy="-35" r="14" fill="#fff9db" />
        </g>
      ))}

      <g transform="translate(1220 320)">
        <rect
          x="-70"
          y="-90"
          width="140"
          height="170"
          rx="6"
          fill="#6b4a33"
          stroke="#c9a227"
          strokeWidth="6"
        />
        <rect x="-50" y="-68" width="40" height="40" rx="3" fill="#e8a0a8" />
        <rect x="2" y="-68" width="40" height="40" rx="3" fill="#f6c565" />
        <rect x="-50" y="-16" width="40" height="40" rx="3" fill="#3d9c9c" />
        <rect x="2" y="-16" width="40" height="40" rx="3" fill="#2a1d4f" />
        <rect x="-18" y="40" width="36" height="22" rx="2" fill="#fff3d6" />
        <path d="M-12 48H12M-12 55H6" stroke="#b8677a" strokeWidth="2" />
        <circle cx="0" cy="-84" r="3" fill="#ff6f91" />
      </g>

      <g transform="translate(800 0)">
        <ellipse
          cx="0"
          cy="492"
          rx="80"
          ry="10"
          fill="#1a0c14"
          opacity="0.35"
        />
        <rect
          x="-58"
          y="440"
          width="116"
          height="42"
          rx="6"
          fill="#8c2238"
          stroke="#5d1426"
          strokeWidth="4"
        />
        <rect
          x="-48"
          y="250"
          width="96"
          height="190"
          rx="14"
          fill="#d64558"
          stroke="#7a1f30"
          strokeWidth="5"
        />
        <path
          d="M-56 256Q0 196 56 256Z"
          fill="#e8566a"
          stroke="#7a1f30"
          strokeWidth="4"
        />
        <rect
          x="-56"
          y="250"
          width="112"
          height="12"
          rx="4"
          fill="#f6c565"
          stroke="#7a1f30"
          strokeWidth="2"
        />
        <rect
          x="-34"
          y="276"
          width="68"
          height="58"
          rx="6"
          fill="#ffe7a3"
          stroke="#7a1f30"
          strokeWidth="3"
        />
        {[352, 362, 372, 382, 392, 402].map((y) => (
          <line
            key={y}
            x1="-34"
            y1={y}
            x2="34"
            y2={y}
            stroke="#7a1f30"
            strokeWidth="3"
          />
        ))}
        <rect x="-10" y="420" width="20" height="6" rx="2" fill="#222222" />
      </g>

      <g>
        <rect x="0" y="496" width="1920" height="14" fill="#f2e3c6" />
        <line
          x1="0"
          y1="510"
          x2="1920"
          y2="510"
          stroke="#c9a878"
          strokeWidth="3"
        />
      </g>

      <rect x="0" y="500" width="1920" height="220" fill="url(#pc-planks)" />
      <rect
        x="0"
        y="500"
        width="1920"
        height="220"
        fill="url(#pc-floor-shade)"
      />

      <g>
        <rect
          x="560"
          y="575"
          width="800"
          height="90"
          rx="30"
          fill="#7d3a4c"
          stroke="#e0a96d"
          strokeWidth="6"
        />
        <rect
          x="600"
          y="592"
          width="720"
          height="56"
          rx="18"
          fill="none"
          stroke="#e0a96d"
          strokeWidth="2"
          opacity="0.5"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1={572 + i * 13}
            y1="665"
            x2={572 + i * 13}
            y2="676"
            stroke="#e0a96d"
            strokeWidth="2"
          />
        ))}
      </g>

      <g>
        <rect
          x="1458"
          y="430"
          width="244"
          height="80"
          rx="22"
          fill="#d98b97"
          stroke="#a85e6d"
          strokeWidth="4"
        />
        <rect
          x="1432"
          y="480"
          width="36"
          height="80"
          rx="16"
          fill="#e8a0a8"
          stroke="#a85e6d"
          strokeWidth="3"
        />
        <rect
          x="1692"
          y="480"
          width="36"
          height="80"
          rx="16"
          fill="#e8a0a8"
          stroke="#a85e6d"
          strokeWidth="3"
        />
        <rect
          x="1462"
          y="500"
          width="236"
          height="46"
          rx="10"
          fill="#e8a0a8"
          stroke="#a85e6d"
          strokeWidth="3"
        />
        <path d="M1540 504V544M1620 504V544" stroke="#c97a8e" strokeWidth="3" />
        <rect
          x="1476"
          y="462"
          width="40"
          height="34"
          rx="8"
          fill="#f6c565"
          stroke="#b8862b"
          strokeWidth="2"
          transform="rotate(-8 1496 479)"
        />
        <rect x="1440" y="546" width="8" height="14" fill="#4a2f2a" />
        <rect x="1704" y="546" width="8" height="14" fill="#4a2f2a" />
      </g>

      <g transform="translate(1830 0)">
        <path
          d="M-30 520H30L22 580H-22Z"
          fill="#b5653f"
          stroke="#7a3e22"
          strokeWidth="3"
        />
        <path
          d="M0 520Q-4 480 0 440"
          fill="none"
          stroke="#4f8f6b"
          strokeWidth="4"
        />
        {[-28, 0, 28].map((rot, i) => (
          <ellipse
            key={rot}
            cx="0"
            cy={448 + i * 6}
            rx="18"
            ry="46"
            fill={i === 1 ? "#5fa37c" : "#4f8f6b"}
            transform={`rotate(${rot} 0 520)`}
          />
        ))}
      </g>

      <g>
        <ellipse
          cx="420"
          cy="562"
          rx="34"
          ry="8"
          fill="#1a0c14"
          opacity="0.4"
        />
        <rect x="417" y="300" width="6" height="262" fill="#c9a227" />
        <path
          d="M380 300H460L448 254H392Z"
          fill="#f6c565"
          stroke="#b8862b"
          strokeWidth="3"
        />
      </g>
    </g>
  );
});

export function PenthouseCondoScenery({
  seconds,
}: {
  seconds: number;
}): React.JSX.Element {
  return (
    <g className="penthouse-condo-scenery">
      <CondoRoomBackdrop />
      <g clipPath="url(#pc-window-clip)">
        <WindowStars seconds={seconds} />
        <CityLights seconds={seconds} />
      </g>
      <ChandelierGlow seconds={seconds} />
      <LampGlow seconds={seconds} />
      <JukeboxEqualizer seconds={seconds} />
    </g>
  );
}
