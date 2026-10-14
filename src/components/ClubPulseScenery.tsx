import { createContext, memo, useContext, type CSSProperties } from "react";

// Rotate or scale about the local origin, like an SVG transform, instead of the fill-box.
const PIVOT: CSSProperties = { transformBox: "view-box", "--sm-origin": "0 0" };

// Delay that puts an alternate sm-* loop (from keyframe = peak) in phase with
// sin(k * seconds + phi), as a negative offset so it starts mid-cycle.
const sinePhase = (k: number, phi: number) =>
  `${-((((phi - Math.PI / 2) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / k}s`;

// Spotlights: rotate(amp * sin(k * seconds + phi)) about the lamp.
const sweep = (amp: number, k: number, phi: number): CSSProperties => ({
  ...PIVOT,
  "--sm-deg": `${amp}deg`,
  "--sm-dur": `${Math.PI / k}s`,
  // sm-sway starts at -amp, so its peak is half a cycle away.
  "--sm-delay": sinePhase(k, phi + Math.PI),
  transform: `rotate(${amp * Math.sin(phi)}deg)`,
});

// Lasers: the beam end sweeps x2 = xc + amp * sin(k * seconds + phi) along the
// floor line y2; it becomes a rotation about the emitter whose still pose
// matches seconds = 0. The beam runs on under the floor, which hides the rest.
function laser(
  x1: number,
  y1: number,
  y2: number,
  xc: number,
  amp: number,
  k: number,
  phi: number,
) {
  const angle = (x: number) => (Math.atan2(y2 - y1, x - x1) * 180) / Math.PI;
  const lo = angle(xc + amp);
  const hi = angle(xc - amp);
  const mid = (lo + hi) / 2;
  const rad = (mid * Math.PI) / 180;
  return {
    x1,
    y1,
    x2: x1 + Math.cos(rad) * 2000,
    y2: y1 + Math.sin(rad) * 2000,
    style: {
      transformBox: "view-box",
      "--sm-origin": `${x1}px ${y1}px`,
      "--sm-deg": `${(hi - lo) / 2}deg`,
      "--sm-dur": `${Math.PI / k}s`,
      // The angle falls as x2 grows, so sm-sway's -deg start is the sine peak.
      "--sm-delay": sinePhase(k, phi),
      transform: `rotate(${angle(xc + amp * Math.sin(phi)) - mid}deg)`,
    } satisfies CSSProperties,
  };
}

// The equalizer keeps React timing: each bar's height drives its bbox gradient,
// which a uniform CSS scale or slide can't reproduce. Only these bars re-render.
const Seconds = createContext(0);

function EqualizerBars() {
  const seconds = useContext(Seconds);
  const eqHeights = [
    32 + Math.sin(seconds * 9.2 + 0) * 24,
    48 + Math.sin(seconds * 11.1 + 1) * 36,
    70 + Math.sin(seconds * 8.4 + 2) * 45,
    95 + Math.sin(seconds * 12.5 + 3) * 55,
    110 + Math.sin(seconds * 10.1 + 4) * 60,
    130 + Math.sin(seconds * 13.8 + 5) * 50,
    120 + Math.sin(seconds * 9.7 + 6) * 58,
    140 + Math.sin(seconds * 14.2 + 7) * 45,
    135 + Math.sin(seconds * 11.6 + 8) * 52,
    115 + Math.sin(seconds * 8.9 + 9) * 58,
    98 + Math.sin(seconds * 13.1 + 10) * 50,
    80 + Math.sin(seconds * 10.4 + 11) * 44,
    65 + Math.sin(seconds * 12.0 + 12) * 38,
    50 + Math.sin(seconds * 9.5 + 13) * 32,
    40 + Math.sin(seconds * 11.8 + 14) * 26,
    30 + Math.sin(seconds * 8.2 + 15) * 20,
  ];
  return (
    <g transform="translate(-320 -15)">
      {eqHeights.map((h, i) => (
        <g key={`eq-${i}`} transform={`translate(${i * 42} 0)`}>
          <rect
            x="0"
            y={-h}
            width="28"
            height={h}
            rx="5"
            fill="url(#cp-eq-grad)"
            opacity="0.92"
            filter="url(#cp-neon-glow)"
          />
          {/* Peak meter floating cap */}
          <rect
            x="0"
            y={-h - 7}
            width="28"
            height="4"
            rx="2"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>
      ))}
    </g>
  );
}

export function ClubPulseScenery({ seconds }: { seconds: number }) {
  // Everything but the equalizer moves in CSS, so the memoized stage skips the ticks.
  return (
    <Seconds.Provider value={seconds}>
      <ClubPulseStage />
    </Seconds.Provider>
  );
}

const ClubPulseStage = memo(function ClubPulseStage() {
  return (
    <g className="club-pulse-scenery">
      <defs>
        {/* Wall & Room Ambient Gradients */}
        <linearGradient id="cp-wall-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0814" />
          <stop offset="35%" stopColor="#151126" />
          <stop offset="70%" stopColor="#1a142e" />
          <stop offset="100%" stopColor="#110d1f" />
        </linearGradient>

        <linearGradient id="cp-floor-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141122" />
          <stop offset="25%" stopColor="#1a162d" />
          <stop offset="70%" stopColor="#161226" />
          <stop offset="100%" stopColor="#0d0a17" />
        </linearGradient>

        {/* Laser & Spotlight Beams */}
        <linearGradient id="cp-beam-cyan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#00c8ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0090ff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="cp-beam-magenta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff1493" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#e01282" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#b30066" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="cp-beam-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#ffaa00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ff8800" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="cp-beam-lime" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#39ff14" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#10cc00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#009900" stopOpacity="0" />
        </linearGradient>

        {/* Neon Light Filter Glow */}
        <filter id="cp-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur1" />
          <feGaussianBlur stdDeviation="14" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* DJ Stage Metallic & Glow Gradients */}
        <linearGradient id="cp-booth-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#252433" />
          <stop offset="25%" stopColor="#3c3b52" />
          <stop offset="50%" stopColor="#4f4e6b" />
          <stop offset="75%" stopColor="#3c3b52" />
          <stop offset="100%" stopColor="#252433" />
        </linearGradient>

        <linearGradient id="cp-eq-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="45%" stopColor="#ff007f" />
          <stop offset="80%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#ff3d00" />
        </linearGradient>

        <linearGradient id="cp-speaker-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e222a" />
          <stop offset="50%" stopColor="#0b0d10" />
          <stop offset="100%" stopColor="#2b313d" />
        </linearGradient>

        <radialGradient id="cp-speaker-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3d4454" />
          <stop offset="70%" stopColor="#1c2027" />
          <stop offset="100%" stopColor="#4a5366" />
        </radialGradient>

        <linearGradient id="cp-vip-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#80d4ff" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#40a0ff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#a0e8ff" stopOpacity="0.35" />
        </linearGradient>

        {/* Acoustic Hex Wall Tile Pattern */}
        <pattern
          id="cp-hex-pattern"
          width="60"
          height="104"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M30 0 L60 17.3 L60 52 L30 69.3 L0 52 L0 17.3 Z M30 104 L60 86.7 L60 52 L30 69.3 L0 52 L0 86.7 Z"
            fill="none"
            stroke="#26223d"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        </pattern>
      </defs>

      {/* ========================================================= */}
      {/* 1. ROOM BACKGROUND: WALLS & ACOUSTIC TILES                */}
      {/* ========================================================= */}
      <rect width="1920" height="720" fill="url(#cp-wall-grad)" />
      <rect
        x="0"
        y="40"
        width="1920"
        height="380"
        fill="url(#cp-hex-pattern)"
        opacity="0.85"
      />

      {/* Ambient Neon Wall Washes */}
      <ellipse
        cx="280"
        cy="220"
        rx="260"
        ry="160"
        fill="#9d174d"
        opacity="0.18"
      />
      <ellipse
        cx="960"
        cy="180"
        rx="420"
        ry="200"
        fill="#4338ca"
        opacity="0.25"
      />
      <ellipse
        cx="1640"
        cy="220"
        rx="260"
        ry="160"
        fill="#0369a1"
        opacity="0.18"
      />

      {/* ========================================================= */}
      {/* 2. INDUSTRIAL CEILING TRUSSES & CABLE RIGS               */}
      {/* ========================================================= */}
      {/* Upper Steel Truss Beam */}
      <rect x="0" y="0" width="1920" height="42" fill="#0f1118" />
      <path
        d="M0 40 L1920 40 M0 20 L1920 20"
        stroke="#272d3b"
        strokeWidth="4"
      />
      {/* Truss cross lattice */}
      {Array.from({ length: 32 }, (_, i) => (
        <line
          key={`truss-${i}`}
          x1={i * 60}
          y1={0}
          x2={(i + 1) * 60}
          y2={40}
          stroke="#1e232e"
          strokeWidth="3"
        />
      ))}
      {Array.from({ length: 32 }, (_, i) => (
        <line
          key={`truss-cross-${i}`}
          x1={(i + 1) * 60}
          y1={0}
          x2={i * 60}
          y2={40}
          stroke="#1e232e"
          strokeWidth="3"
        />
      ))}

      {/* Lower Mid-Ceiling Rig at y=95 */}
      <line
        x1="80"
        y1="95"
        x2="1840"
        y2="95"
        stroke="#1c202a"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="92"
        x2="1840"
        y2="92"
        stroke="#384154"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ========================================================= */}
      {/* 3. VIP MEZZANINE (2nd Floor Balcony, y: 140 to 240)       */}
      {/* ========================================================= */}
      <g className="vip-mezzanine-balcony">
        {/* Mezzanine Upper Deck Floor */}
        <polygon points="120,190 1800,190 1820,215 100,215" fill="#1b172a" />
        <line
          x1="100"
          y1="215"
          x2="1820"
          y2="215"
          stroke="#ff007f"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Velvet Banquettes & VIP Guests Silhouettes */}
        {[300, 520, 1400, 1620].map((bx) => (
          <g key={`vip-booth-${bx}`} transform={`translate(${bx} 185)`}>
            {/* Curved Tufted Velvet Sofa Back */}
            <path
              d="M-60 0 C-60 -45 60 -45 60 0 Z"
              fill="#4c0519"
              stroke="#be123c"
              strokeWidth="2"
            />
            <path
              d="M-40 0 C-40 -35 40 -35 40 0"
              fill="none"
              stroke="#fb7185"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* VIP Cocktail Table */}
            <ellipse
              cx="0"
              cy="5"
              rx="20"
              ry="7"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="2"
            />
            {/* Champagne Bottle in Ice Bucket */}
            <polygon
              points="-5,5 5,5 4,-8 -4,-8"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="-8"
              x2="0"
              y2="-16"
              stroke="#15803d"
              strokeWidth="3"
            />
            <circle cx="0" cy="-16" r="2" fill="#fbbf24" />
          </g>
        ))}

        {/* Illuminated VIP Tempered Glass Railing */}
        <rect
          x="100"
          y="165"
          width="1720"
          height="45"
          fill="url(#cp-vip-glass)"
        />
        <rect
          x="100"
          y="162"
          width="1720"
          height="5"
          fill="#00e5ff"
          opacity="0.9"
        />
        {/* Glass vertical stanchions */}
        {Array.from({ length: 19 }, (_, i) => (
          <line
            key={`stanchion-${i}`}
            x1={100 + i * 95}
            y1={162}
            x2={100 + i * 95}
            y2={210}
            stroke="#e0f2fe"
            strokeWidth="3"
            opacity="0.75"
          />
        ))}
        {/* Neon Under-glow Railing Strip */}
        <line
          x1="100"
          y1="210"
          x2="1820"
          y2="210"
          stroke="#00f0ff"
          strokeWidth="3"
          filter="url(#cp-neon-glow)"
        />
      </g>

      {/* ========================================================= */}
      {/* 4. VOLUMETRIC STAGE SPOTLIGHTS & LASER BEAMS              */}
      {/* ========================================================= */}
      {/* Spotlight 1: Left Cyan */}
      <g transform="translate(420 95)">
        <g className="sm-sway" style={sweep(26, 1.2, 0)}>
          <polygon
            points="-24,0 24,0 180,620 -180,620"
            fill="url(#cp-beam-cyan)"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="14"
            ry="7"
            fill="#00e5ff"
            filter="url(#cp-neon-glow)"
          />
        </g>
      </g>

      {/* Spotlight 2: Center-Left Magenta */}
      <g transform="translate(740 95)">
        <g className="sm-sway" style={sweep(26, 1.2, 2.1 + Math.PI)}>
          <polygon
            points="-24,0 24,0 190,620 -190,620"
            fill="url(#cp-beam-magenta)"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="14"
            ry="7"
            fill="#ff1493"
            filter="url(#cp-neon-glow)"
          />
        </g>
      </g>

      {/* Spotlight 3: Center-Right Gold */}
      <g transform="translate(1180 95)">
        <g className="sm-sway" style={sweep(32, 0.9, 1.1)}>
          <polygon
            points="-24,0 24,0 190,620 -190,620"
            fill="url(#cp-beam-gold)"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="14"
            ry="7"
            fill="#ffd700"
            filter="url(#cp-neon-glow)"
          />
        </g>
      </g>

      {/* Spotlight 4: Right Lime */}
      <g transform="translate(1500 95)">
        <g className="sm-sway" style={sweep(32, 0.9, 3.4 + Math.PI)}>
          <polygon
            points="-24,0 24,0 180,620 -180,620"
            fill="url(#cp-beam-lime)"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="14"
            ry="7"
            fill="#39ff14"
            filter="url(#cp-neon-glow)"
          />
        </g>
      </g>

      {/* High-Energy Overhead Laser Beams */}
      <line
        className="sm-sway"
        {...laser(200, 95, 520, 1300, 450, 3.5, 0)}
        stroke="#00ffff"
        strokeWidth="3.5"
        opacity="0.8"
        filter="url(#cp-neon-glow)"
      />
      <line
        className="sm-sway"
        {...laser(1720, 95, 520, 620, 450, 3.5, Math.PI / 2)}
        stroke="#ff007f"
        strokeWidth="3.5"
        opacity="0.8"
        filter="url(#cp-neon-glow)"
      />
      <line
        className="sm-sway"
        {...laser(960, 95, 540, 380, 350, 2.8, 0)}
        stroke="#a855f7"
        strokeWidth="3"
        opacity="0.75"
        filter="url(#cp-neon-glow)"
      />
      <line
        className="sm-sway"
        {...laser(960, 95, 540, 1540, 350, 2.8, Math.PI / 2)}
        stroke="#39ff14"
        strokeWidth="3"
        opacity="0.75"
        filter="url(#cp-neon-glow)"
      />

      {/* ========================================================= */}
      {/* 5. SPARKLING CENTER MIRROR / DISCO BALL                   */}
      {/* ========================================================= */}
      <g transform="translate(960 95)">
        {/* Suspension Cable */}
        <line x1="0" y1="0" x2="0" y2="45" stroke="#94a3b8" strokeWidth="2.5" />
        {/* Disco Ball Sphere */}
        <g transform="translate(0 75)">
          <circle
            cx="0"
            cy="0"
            r="34"
            fill="#cbd5e1"
            stroke="#f8fafc"
            strokeWidth="2"
          />
          {/* Mirrored Facets Simulation */}
          <path
            d="M-34 0 A34 34 0 0 0 34 0 A34 34 0 0 0 -34 0"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <path
            d="M-28 -15 Q0 5 28 -15 M-28 15 Q0 -5 28 15"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1.5"
          />
          {/* Glinting Specular Star Highlights */}
          <g className="sm-spin" style={{ "--sm-dur": "18s" }}>
            <g transform="scale(0.7)">
              {/* Twinkles between 0.4x and 1x of the star's size. */}
              <polygon
                className="sm-pulse"
                style={{ "--sm-dur": "0.63s", "--sm-scale": String(1 / 0.7) }}
                points="0,-18 3,-4 18,0 3,4 0,18 -3,4 -18,0 -3,-4"
                fill="#ffffff"
              />
            </g>
          </g>
          <g transform="translate(12, 10)">
            <polygon
              className="sm-spin"
              style={{ "--sm-dur": "12s", animationDirection: "reverse" }}
              points="0,-12 2,-3 12,0 2,3 0,12 -2,3 -12,0 -2,-3"
              fill="#67e8f9"
            />
          </g>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 6. CLUB FLOOR SURROUND & DANCE FLOOR BORDER               */}
      {/* ========================================================= */}
      {/* Dark Glossy Obsidian Surround */}
      <rect
        x="0"
        y="415"
        width="1920"
        height="305"
        fill="url(#cp-floor-grad)"
      />

      {/* Recessed Glowing Neon Frame for Dance Floor (320 to 1600, 420 to 660) */}
      <rect
        x="314"
        y="414"
        width="1292"
        height="252"
        rx="14"
        fill="none"
        stroke="#ff007f"
        strokeWidth="6"
        opacity="0.85"
        filter="url(#cp-neon-glow)"
      />
      <rect
        x="316"
        y="416"
        width="1288"
        height="248"
        rx="12"
        fill="none"
        stroke="#00f0ff"
        strokeWidth="3"
        opacity="0.95"
      />

      {/* Floor Light Reflections */}
      <ellipse
        cx="960"
        cy="425"
        rx="380"
        ry="25"
        fill="#ec4899"
        opacity="0.18"
      />
      <ellipse
        cx="600"
        cy="425"
        rx="180"
        ry="18"
        fill="#06b6d4"
        opacity="0.15"
      />
      <ellipse
        cx="1320"
        cy="425"
        rx="180"
        ry="18"
        fill="#eab308"
        opacity="0.15"
      />

      {/* ========================================================= */}
      {/* 7. CONCERT SUBWOOFER & SPEAKER STACKS (L: 220, R: 1700)   */}
      {/* ========================================================= */}
      {/* Left Tower Stack */}
      <g transform={`translate(220 380)`}>
        {/* Speaker Cabinet Enclosure */}
        <rect
          x="-95"
          y="-225"
          width="190"
          height="235"
          rx="14"
          fill="#0c0e14"
          stroke="#334155"
          strokeWidth="6"
        />
        {/* Metal Corner Protectors */}
        <polygon points="-95,-225 -65,-225 -95,-195" fill="#64748b" />
        <polygon points="95,-225 65,-225 95,-195" fill="#64748b" />
        <polygon points="-95,10 -65,10 -95,-20" fill="#64748b" />
        <polygon points="95,10 65,10 95,-20" fill="#64748b" />

        {/* High Frequency Horn Tweeter */}
        <rect
          x="-65"
          y="-205"
          width="130"
          height="48"
          rx="6"
          fill="#1e2430"
          stroke="#475569"
          strokeWidth="2"
        />
        <ellipse cx="0" cy="-181" rx="42" ry="14" fill="#0f172a" />
        <path
          d="M-30 -181 Q0 -192 30 -181 Q0 -170 -30 -181"
          fill="#38bdf8"
          opacity="0.7"
        />

        {/* Mid-Range Woofer (Pulsing) */}
        <g transform="translate(0 -115)">
          <g
            className="sm-pulse"
            style={{ ...PIVOT, "--sm-dur": "0.25s", "--sm-scale": "1.06" }}
          >
            <circle
              cx="0"
              cy="0"
              r="38"
              fill="url(#cp-speaker-ring)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            <circle cx="0" cy="0" r="28" fill="url(#cp-speaker-cone)" />
            <circle
              cx="0"
              cy="0"
              r="12"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="2"
            />
          </g>
        </g>

        {/* Low Bass Subwoofer (Heavy Pulse) */}
        <g transform="translate(0 -35)">
          <g
            className="sm-pulse"
            style={{ ...PIVOT, "--sm-dur": "0.25s", "--sm-scale": "1.06" }}
          >
            <circle
              cx="0"
              cy="0"
              r="44"
              fill="url(#cp-speaker-ring)"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            <circle cx="0" cy="0" r="34" fill="url(#cp-speaker-cone)" />
            <circle
              cx="0"
              cy="0"
              r="15"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="2"
            />
          </g>
        </g>

        {/* Acoustic Bass Reflex Ports */}
        <circle cx="-60" cy="0" r="9" fill="#020617" />
        <circle cx="60" cy="0" r="9" fill="#020617" />
      </g>

      {/* Right Tower Stack */}
      <g transform={`translate(1700 380)`}>
        {/* Speaker Cabinet Enclosure */}
        <rect
          x="-95"
          y="-225"
          width="190"
          height="235"
          rx="14"
          fill="#0c0e14"
          stroke="#334155"
          strokeWidth="6"
        />
        {/* Metal Corner Protectors */}
        <polygon points="-95,-225 -65,-225 -95,-195" fill="#64748b" />
        <polygon points="95,-225 65,-225 95,-195" fill="#64748b" />
        <polygon points="-95,10 -65,10 -95,-20" fill="#64748b" />
        <polygon points="95,10 65,10 95,-20" fill="#64748b" />

        {/* High Frequency Horn Tweeter */}
        <rect
          x="-65"
          y="-205"
          width="130"
          height="48"
          rx="6"
          fill="#1e2430"
          stroke="#475569"
          strokeWidth="2"
        />
        <ellipse cx="0" cy="-181" rx="42" ry="14" fill="#0f172a" />
        <path
          d="M-30 -181 Q0 -192 30 -181 Q0 -170 -30 -181"
          fill="#38bdf8"
          opacity="0.7"
        />

        {/* Mid-Range Woofer (Pulsing) */}
        <g transform="translate(0 -115)">
          <g
            className="sm-pulse"
            style={{ ...PIVOT, "--sm-dur": "0.25s", "--sm-scale": "1.06" }}
          >
            <circle
              cx="0"
              cy="0"
              r="38"
              fill="url(#cp-speaker-ring)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            <circle cx="0" cy="0" r="28" fill="url(#cp-speaker-cone)" />
            <circle
              cx="0"
              cy="0"
              r="12"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="2"
            />
          </g>
        </g>

        {/* Low Bass Subwoofer (Heavy Pulse) */}
        <g transform="translate(0 -35)">
          <g
            className="sm-pulse"
            style={{ ...PIVOT, "--sm-dur": "0.25s", "--sm-scale": "1.06" }}
          >
            <circle
              cx="0"
              cy="0"
              r="44"
              fill="url(#cp-speaker-ring)"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            <circle cx="0" cy="0" r="34" fill="url(#cp-speaker-cone)" />
            <circle
              cx="0"
              cy="0"
              r="15"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="2"
            />
          </g>
        </g>

        {/* Acoustic Bass Reflex Ports */}
        <circle cx="-60" cy="0" r="9" fill="#020617" />
        <circle cx="60" cy="0" r="9" fill="#020617" />
      </g>

      {/* ========================================================= */}
      {/* 8. CENTER DJ BOOTH & STAGE (x=960, y: 220 to 415)         */}
      {/* ========================================================= */}
      <g transform="translate(960 380)">
        {/* Elevated Stage Risers */}
        <polygon
          points="-450,35 450,35 420,-10 -420,-10"
          fill="#181528"
          stroke="#3730a3"
          strokeWidth="3"
        />
        <line
          x1="-450"
          y1="35"
          x2="450"
          y2="35"
          stroke="#ec4899"
          strokeWidth="4"
          filter="url(#cp-neon-glow)"
        />

        {/* DJ Backdrop Acoustic Structure */}
        <rect
          x="-380"
          y="-200"
          width="760"
          height="190"
          rx="24"
          fill="#110e20"
          stroke="#4f46e5"
          strokeWidth="6"
        />

        {/* Dynamic 16-Bar Audio Equalizer Visualizer */}
        <EqualizerBars />

        {/* Backlit Golden Lion Crown Medallion */}
        <g transform="translate(0 -140)">
          {/* Radial Aura Glow */}
          <circle
            cx="0"
            cy="0"
            r="46"
            fill="#fbbf24"
            opacity="0.25"
            filter="url(#cp-neon-glow)"
          />
          {/* Outer Gold Ring */}
          <circle
            cx="0"
            cy="0"
            r="38"
            fill="#1e1833"
            stroke="#f59e0b"
            strokeWidth="4"
          />
          {/* Stylized Lion Face Silhouette */}
          <path
            d="M-18 -8 Q-24 12 0 24 Q24 12 18 -8 Q10 -16 0 -10 Q-10 -16 -18 -8 Z"
            fill="#fbbf24"
          />
          {/* Royal Crown on Lion */}
          <polygon
            points="-16,-12 -8,-25 0,-15 8,-25 16,-12"
            fill="#fcd34d"
            stroke="#b45309"
            strokeWidth="1.5"
          />
          <circle cx="-8" cy="-25" r="2.5" fill="#ef4444" />
          <circle cx="0" cy="-15" r="2.5" fill="#3b82f6" />
          <circle cx="8" cy="-25" r="2.5" fill="#10b981" />
        </g>

        {/* Giant Neon "CLUB PULSE" Marquee Sign */}
        <g transform="translate(0 -78)">
          {/* Glow Shadow Pass */}
          <text
            y="0"
            textAnchor="middle"
            fontSize="46"
            fontWeight="900"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            letterSpacing="6"
            fill="#f43f5e"
            filter="url(#cp-neon-glow)"
            opacity="0.9"
          >
            CLUB PULSE
          </text>
          {/* Crisp Fore Text */}
          <text
            y="0"
            textAnchor="middle"
            fontSize="46"
            fontWeight="900"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            letterSpacing="6"
            fill="#fff1f2"
          >
            CLUB PULSE
          </text>
          {/* Subtext */}
          <text
            y="22"
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            fontFamily="'Arial', sans-serif"
            letterSpacing="9"
            fill="#38bdf8"
          >
            VIP BEAT LOUNGE
          </text>
        </g>

        {/* Foreground DJ Table Console (Where DJ Hotspot clicks) */}
        <g transform="translate(0 2)">
          {/* Console Table Surface */}
          <rect
            x="-280"
            y="-30"
            width="560"
            height="55"
            rx="14"
            fill="url(#cp-booth-metal)"
            stroke="#6366f1"
            strokeWidth="4"
          />
          {/* Front Illuminated Acrylic Panel */}
          <rect
            x="-260"
            y="-6"
            width="520"
            height="26"
            rx="8"
            fill="#1e1b4b"
            stroke="#a855f7"
            strokeWidth="2"
          />
          <text
            y="12"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            letterSpacing="4"
            fill="#c084fc"
          >
            &bull; DJ BOOTH &bull; DROP THE BEAT &bull;
          </text>

          {/* Turntable 1 (Left Player) */}
          <g transform="translate(-160 -12)">
            <rect
              x="-50"
              y="-18"
              width="100"
              height="34"
              rx="6"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Spinning Jog Wheel */}
            <circle
              cx="0"
              cy="-1"
              r="16"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <circle cx="0" cy="-1" r="8" fill="#020617" />
            <line
              className="sm-spin"
              style={{
                transformBox: "view-box",
                "--sm-origin": "0px -1px",
                "--sm-dur": "1.05s",
              }}
              x1="0"
              y1="-1"
              x2={14}
              y2="-1"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Pitch Fader Slider */}
            <line
              x1="34"
              y1="-12"
              x2="34"
              y2="10"
              stroke="#64748b"
              strokeWidth="2"
            />
            <rect x="30" y="-4" width="8" height="6" rx="1" fill="#f8fafc" />
          </g>

          {/* Central DJ Mixer */}
          <g transform="translate(0 -12)">
            <rect
              x="-42"
              y="-18"
              width="84"
              height="34"
              rx="4"
              fill="#090d16"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Volume Channel Knobs */}
            <circle cx="-24" cy="-10" r="4" fill="#ef4444" />
            <circle cx="-8" cy="-10" r="4" fill="#3b82f6" />
            <circle cx="8" cy="-10" r="4" fill="#3b82f6" />
            <circle cx="24" cy="-10" r="4" fill="#ef4444" />
            {/* Dual Master VU Meters */}
            <line
              x1="-12"
              y1="-2"
              x2="-12"
              y2="8"
              stroke="#22c55e"
              strokeWidth="3"
            />
            <line
              x1="-12"
              y1="8"
              x2="-12"
              y2="12"
              stroke="#eab308"
              strokeWidth="3"
            />
            <line
              x1="-12"
              y1="12"
              x2="-12"
              y2="15"
              stroke="#ef4444"
              strokeWidth="3"
            />
            <line
              x1="12"
              y1="-2"
              x2="12"
              y2="8"
              stroke="#22c55e"
              strokeWidth="3"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
              stroke="#eab308"
              strokeWidth="3"
            />
            <line
              x1="12"
              y1="12"
              x2="12"
              y2="15"
              stroke="#ef4444"
              strokeWidth="3"
            />
            {/* Horizontal Crossfader */}
            <line
              x1="-20"
              y1="12"
              x2="20"
              y2="12"
              stroke="#64748b"
              strokeWidth="2"
            />
            <rect
              className="sm-glide"
              style={{
                "--sm-x": "24px",
                "--sm-dur": "1.26s",
                "--sm-delay": sinePhase(2.5, Math.PI),
                transform: "translateX(12px)",
              }}
              x={-16}
              y="9"
              width="8"
              height="6"
              rx="1"
              fill="#fbbf24"
            />
          </g>

          {/* Turntable 2 (Right Player) */}
          <g transform="translate(160 -12)">
            <rect
              x="-50"
              y="-18"
              width="100"
              height="34"
              rx="6"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Spinning Jog Wheel */}
            <circle
              cx="0"
              cy="-1"
              r="16"
              fill="#1e293b"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            <circle cx="0" cy="-1" r="8" fill="#020617" />
            <line
              className="sm-spin"
              style={{
                transformBox: "view-box",
                "--sm-origin": "0px -1px",
                "--sm-dur": "1.05s",
              }}
              x1="0"
              y1="-1"
              x2={Math.cos(1.8) * 14}
              y2={-1 + Math.sin(1.8) * 14}
              stroke="#f43f5e"
              strokeWidth="2"
            />
            {/* Pitch Fader Slider */}
            <line
              x1="34"
              y1="-12"
              x2="34"
              y2="10"
              stroke="#64748b"
              strokeWidth="2"
            />
            <rect x="30" y="2" width="8" height="6" rx="1" fill="#f8fafc" />
          </g>

          {/* Pro Audio Headphones resting on table */}
          <g transform="translate(80 20)">
            <path
              d="M-10 0 C-10 -15 10 -15 10 0"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="3"
            />
            <rect
              x="-14"
              y="-3"
              width="7"
              height="12"
              rx="3"
              fill="#1e293b"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <rect
              x="7"
              y="-3"
              width="7"
              height="12"
              rx="3"
              fill="#1e293b"
              stroke="#94a3b8"
              strokeWidth="1"
            />
          </g>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 9. LEFT EXIT PORTAL TO DOWNTOWN PLAZA (x: 40 to 220)      */}
      {/* ========================================================= */}
      <g transform="translate(120 535)">
        {/* Illuminated Velvet Stanchion Gate */}
        <line
          x1="-50"
          y1="0"
          x2="-50"
          y2="-90"
          stroke="#eab308"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          cx="-50"
          cy="-94"
          r="8"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="2"
        />
        <line
          x1="50"
          y1="0"
          x2="50"
          y2="-90"
          stroke="#eab308"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="-94"
          r="8"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="2"
        />

        {/* Draped Red Velvet Rope */}
        <path
          d="M-50 -80 Q0 -45 50 -80"
          fill="none"
          stroke="#dc2626"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M-50 -80 Q0 -45 50 -80"
          fill="none"
          stroke="#f87171"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Glowing Exit Backlit Portal Sign */}
        <g transform="translate(0 -130)">
          <rect
            x="-70"
            y="-22"
            width="140"
            height="44"
            rx="10"
            fill="#0f172a"
            stroke="#22c55e"
            strokeWidth="3"
            filter="url(#cp-neon-glow)"
          />
          <text
            y="6"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            letterSpacing="2"
            fill="#4ade80"
          >
            ← PLAZA
          </text>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 10. RIGHT VIP BAR & BOTTLE SERVICE (x: 1720 to 1880)      */}
      {/* ========================================================= */}
      <g transform="translate(1820 480)">
        {/* Backlit Tiered Glass Bottle Shelf */}
        <rect
          x="-90"
          y="-130"
          width="160"
          height="120"
          rx="12"
          fill="#110d24"
          stroke="#00f0ff"
          strokeWidth="3"
        />
        {/* Backlight Bar Glow */}
        <rect
          x="-85"
          y="-125"
          width="150"
          height="110"
          rx="8"
          fill="#4338ca"
          opacity="0.35"
        />

        {/* Shelf Tier 1 (y = -85) */}
        <line
          x1="-80"
          y1="-75"
          x2="60"
          y2="-75"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        {/* Tier 1 Glowing Crystal Bottles */}
        {[-65, -45, -25, -5, 15, 35].map((bx, i) => {
          const colors = [
            "#06b6d4",
            "#ec4899",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
            "#f43f5e",
          ];
          return (
            <g key={`b1-${bx}`} transform={`translate(${bx} -77)`}>
              <rect
                x="-6"
                y="-22"
                width="12"
                height="22"
                rx="2"
                fill={colors[i]}
                opacity="0.9"
              />
              <rect x="-3" y="-30" width="6" height="8" rx="1" fill="#e2e8f0" />
            </g>
          );
        })}

        {/* Shelf Tier 2 (y = -35) */}
        <line
          x1="-80"
          y1="-25"
          x2="60"
          y2="-25"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        {/* Tier 2 Bottles */}
        {[-60, -38, -16, 6, 28, 48].map((bx, i) => {
          const colors = [
            "#f43f5e",
            "#a855f7",
            "#06b6d4",
            "#eab308",
            "#10b981",
            "#ec4899",
          ];
          return (
            <g key={`b2-${bx}`} transform={`translate(${bx} -27)`}>
              <rect
                x="-7"
                y="-24"
                width="14"
                height="24"
                rx="2"
                fill={colors[i]}
                opacity="0.9"
              />
              <rect x="-3" y="-32" width="6" height="8" rx="1" fill="#e2e8f0" />
            </g>
          );
        })}

        {/* Polished Onyx Bar Counter */}
        <polygon
          points="-90,10 70,10 80,45 -100,45"
          fill="#090a12"
          stroke="#475569"
          strokeWidth="2"
        />
        <line
          x1="-100"
          y1="45"
          x2="80"
          y2="45"
          stroke="#ec4899"
          strokeWidth="3"
          filter="url(#cp-neon-glow)"
        />

        {/* Glowing Neon Martini Glass Sign on Bar */}
        <g transform="translate(-10 -155)">
          <polygon
            points="-18,-18 18,-18 0,0"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2.5"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="16"
            stroke="#00f0ff"
            strokeWidth="2.5"
          />
          <ellipse
            cx="0"
            cy="16"
            rx="10"
            ry="3"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2.5"
          />
          {/* Green Olive & Toothpick */}
          <line
            x1="-8"
            y1="-24"
            x2="10"
            y2="-6"
            stroke="#f43f5e"
            strokeWidth="2"
          />
          <circle cx="2" cy="-14" r="4" fill="#22c55e" />
        </g>
      </g>
    </g>
  );
});

export default ClubPulseScenery;
