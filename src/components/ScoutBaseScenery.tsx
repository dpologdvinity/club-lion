import React from "react";

const PILLAR_XS: readonly number[] = [0, 480, 960, 1440, 1900];
const RIVET_YS: readonly number[] = [60, 140, 220, 300, 380, 460];
const BANK_XS: readonly number[] = [160, 1760];
const BLIPS: readonly { x: number; y: number; color: string }[] = [
  { x: 45, y: -60, color: "#2ecc71" },
  { x: -75, y: 35, color: "#e74c3c" },
  { x: -30, y: -80, color: "#f39c12" },
  { x: 80, y: 70, color: "#2ecc71" },
];
// Emitters on the laser console fan out across the floor.
const LASER_BEAMS: readonly { x1: number; x2: number }[] = [
  { x1: 812, x2: 640 },
  { x1: 948, x2: 900 },
  { x1: 1108, x2: 1280 },
];

// Phase offsets turn the old Math.sin(seconds * k + phase) curves into CSS
// animation delays: delay = -(phase + PI/2) / k lines the cycles back up.
const RadarSweep = React.memo(function RadarSweep() {
  return (
    <g transform="translate(960 270)">
      <g className="sm-spin" style={{ "--sm-dur": "4.5s" }}>
        {/* Invisible ring centres the spin box on the radar hub. */}
        <circle r="150" fill="none" />
        <line x1="0" y1="0" x2="0" y2="-140" stroke="#00f5d4" strokeWidth="3" />
        <path
          d="M0 0 L-40 -140 A140 140 0 0 1 0 -140 Z"
          fill="url(#ssb-radar-sweep)"
        />
      </g>
    </g>
  );
});

const RadarBlips = React.memo(function RadarBlips() {
  return (
    <g transform="translate(960 270)">
      {BLIPS.map((blip, i) => (
        <circle
          key={`${blip.x}-${blip.y}`}
          className="sm-twinkle"
          cx={blip.x}
          cy={blip.y}
          r="4.5"
          fill={blip.color}
          opacity={0.4 + Math.sin(i * 1.5) * 0.6}
          style={{
            "--sm-dur": `${Math.PI / 4}s`,
            "--sm-delay": `${-(i * 1.5 + Math.PI / 2) / 4}s`,
            "--sm-min": 0,
          }}
        />
      ))}
    </g>
  );
});

// One extra wavelength of trace slides left under a clip, like the old
// sin(seconds * 5 + x * 0.05) wave travelling at 100px/s.
const WAVE_LENGTH = (2 * Math.PI) / 0.05;
const WAVE_POINTS = Array.from({ length: 49 }, (_, i) => {
  const x = (i * WAVE_LENGTH) / 16;
  return `${-120 + x} ${-20 + Math.sin(x * 0.05) * 22}`;
}).join(" L ");

const TelemetryWave = React.memo(function TelemetryWave() {
  return (
    <g transform="translate(560 240)">
      <clipPath id="ssb-wave-clip">
        <rect x="-120" y="-60" width="230" height="80" />
      </clipPath>
      <g clipPath="url(#ssb-wave-clip)">
        <path
          className="sm-drift"
          d={`M ${WAVE_POINTS}`}
          fill="none"
          stroke="#00f5d4"
          strokeWidth="2.5"
          style={{
            "--sm-dur": `${WAVE_LENGTH / 100}s`,
            "--sm-dist": `${-WAVE_LENGTH}px`,
          }}
        />
      </g>
    </g>
  );
});

function CipherRows({ seconds }: { seconds: number }) {
  return (
    <g transform="translate(1360 240)">
      {Array.from({ length: 5 }, (_, r) => (
        <text
          key={r}
          x="-120"
          y={-40 + r * 24}
          fill="#a8dadc"
          fontSize="11"
          fontFamily="monospace"
          opacity="0.85"
        >
          {`0x${((Math.floor(seconds * 10) + r * 1337) % 0xffff).toString(16).toUpperCase().padStart(4, "0")}  //  SIG-${104 + r}  //  OK`}
        </text>
      ))}
    </g>
  );
}

const LedBanks = React.memo(function LedBanks() {
  // Each lit LED sits over its dark socket and blinks off for about a third
  // of a 0.75s cycle, like the old floor(seconds * 4 + offset) % 3 pattern.
  return (
    <g>
      {BANK_XS.map((rx, bankIdx) => (
        <g key={rx} transform={`translate(${rx} 280)`}>
          {Array.from({ length: 6 }, (_, unit) => (
            <g key={unit} transform={`translate(0 ${-130 + unit * 36})`}>
              {Array.from({ length: 6 }, (_, led) => {
                const phase = (bankIdx * 3 + unit * 2 + led) % 3;
                const ledColor =
                  led === 0 ? "#e74c3c" : led % 2 === 0 ? "#2ecc71" : "#f1c40f";
                return (
                  <g key={led}>
                    <circle
                      cx={-45 + led * 18}
                      cy="15"
                      r="4"
                      fill="#2c3e50"
                      opacity={0.3}
                    />
                    <circle
                      className="sm-flicker"
                      cx={-45 + led * 18}
                      cy="15"
                      r="4"
                      fill={ledColor}
                      opacity={phase === 0 ? 0 : 1}
                      style={{
                        "--sm-dur": "0.75s",
                        "--sm-delay": `${-(0.525 + phase / 4)}s`,
                        "--sm-min": 0,
                      }}
                    />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
      ))}
    </g>
  );
});

const ConsoleScreen = React.memo(function ConsoleScreen() {
  // Bars step through widths 40, 65, 90 and 115: a 115-wide bar slides right
  // in four steps from behind the screen's left edge.
  return (
    <g>
      <clipPath id="ssb-console-clip">
        <rect x="892" y="500" width="130" height="40" />
      </clipPath>
      <g clipPath="url(#ssb-console-clip)">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            className="sm-drift"
            x="817"
            y={508 + i * 5}
            width="115"
            height="3"
            fill="#20c997"
            style={{
              "--sm-dur": `${4 / 3}s`,
              "--sm-delay": `${-((i * 2) % 4) / 3}s`,
              "--sm-dist": "100px",
              animationTimingFunction: "steps(4, end)",
            }}
          />
        ))}
      </g>
    </g>
  );
});

const ConsoleLasers = React.memo(function ConsoleLasers() {
  // Beams rested at 0.25 opacity and pulsed to 0.7; the group caps the peak.
  return (
    <g opacity={0.7}>
      {LASER_BEAMS.map((beam, i) => (
        <line
          key={beam.x1}
          className="sm-twinkle"
          x1={beam.x1}
          y1="486"
          x2={beam.x2}
          y2="720"
          stroke="#e67e22"
          strokeWidth="2"
          opacity={(0.25 + Math.max(0, Math.sin(i * 2)) * 0.45) / 0.7}
          style={{
            "--sm-dur": `${Math.PI / 3}s`,
            "--sm-delay": `${-(i * 2 + Math.PI / 2) / 3}s`,
            "--sm-min": 0.25 / 0.7,
          }}
        />
      ))}
    </g>
  );
});

const HOLO_PULSE = {
  "--sm-dur": `${Math.PI / 2}s`,
  "--sm-delay": `${-Math.PI / 2 / 2}s`,
};

const HoloProjection = React.memo(function HoloProjection() {
  // Pulse swung 0.25 to 0.75; the groups cap each shape's peak.
  return (
    <g>
      <g opacity={0.175}>
        <polygon
          className="sm-twinkle"
          points="1494,480 1440,330 1560,330 1506,480"
          fill="#00bbf9"
          opacity={0.15 / 0.175}
          style={{ ...HOLO_PULSE, "--sm-min": 0.125 / 0.175 }}
        />
      </g>
      <g opacity={0.75}>
        <ellipse
          className="sm-twinkle"
          cx="1500"
          cy="330"
          rx="60"
          ry="12"
          fill="none"
          stroke="#00bbf9"
          strokeWidth="2"
          opacity={0.5 / 0.75}
          style={{ ...HOLO_PULSE, "--sm-min": 1 / 3 }}
        />
      </g>
      {/* Turned a quarter so sm-bob's vertical swing runs left and right. */}
      <g transform="rotate(-90 1500 400)">
        <circle
          className="sm-bob"
          cx="1500"
          cy="400"
          r="5"
          fill="#00f5d4"
          style={{
            "--sm-dur": `${Math.PI}s`,
            "--sm-delay": `${-Math.PI / 2}s`,
            "--sm-amp": "40px",
          }}
        />
      </g>
    </g>
  );
});

const LaserScan = React.memo(function LaserScan() {
  // Turned a quarter so sm-drift's sideways travel sweeps 220px down the floor.
  return (
    <g transform="translate(0 500) rotate(90)">
      <rect
        className="sm-drift"
        x="0"
        y="-1920"
        width="3"
        height="1920"
        fill="#00f5d4"
        opacity="0.35"
        style={{ "--sm-dur": `${220 / 60}s`, "--sm-dist": "220px" }}
      />
    </g>
  );
});

const ScoutHQStatic = React.memo(function ScoutHQStatic() {
  return (
    <g>
      <defs>
        <linearGradient id="ssb-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10181b" />
          <stop offset="50%" stopColor="#192428" />
          <stop offset="100%" stopColor="#131b1d" />
        </linearGradient>
        <linearGradient id="ssb-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1214" />
          <stop offset="100%" stopColor="#1a2326" />
        </linearGradient>
        <radialGradient id="ssb-radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#00bbf9" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#00bbf9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ssb-radar-sweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00f5d4" stopOpacity="0" />
        </linearGradient>
        <pattern
          id="ssb-hazard"
          width="40"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="20" height="20" fill="#f39c12" />
          <rect x="20" width="20" height="20" fill="#1c2321" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="1920" height="500" fill="url(#ssb-wall)" />
      <rect x="0" y="500" width="1920" height="220" fill="url(#ssb-floor)" />

      {PILLAR_XS.map((x) => (
        <g key={x}>
          <rect
            x={x - 20}
            y="30"
            width="40"
            height="470"
            fill="#1a2529"
            stroke="#2c3e44"
            strokeWidth="3"
          />
          {RIVET_YS.map((y) => (
            <circle
              key={y}
              cx={x}
              cy={y}
              r="4"
              fill="#3e525a"
              stroke="#101618"
              strokeWidth="1.5"
            />
          ))}
        </g>
      ))}

      <path
        d="M0 65 Q480 85 960 65 Q1440 85 1920 65"
        fill="none"
        stroke="#2d3748"
        strokeWidth="12"
      />
      <path
        d="M0 75 Q480 95 960 75 Q1440 95 1920 75"
        fill="none"
        stroke="#e67e22"
        strokeWidth="4"
      />
      <path
        d="M0 82 Q480 102 960 82 Q1440 102 1920 82"
        fill="none"
        stroke="#00bbf9"
        strokeWidth="3"
      />

      <rect x="0" y="30" width="1920" height="12" fill="url(#ssb-hazard)" />
      <rect x="0" y="490" width="1920" height="14" fill="url(#ssb-hazard)" />

      <g transform="translate(960 270)">
        <circle r="140" fill="#0d1f1f" stroke="#1f4040" strokeWidth="8" />
        <circle r="140" fill="url(#ssb-radar-glow)" />
        {[35, 70, 105].map((r) => (
          <circle
            key={r}
            r={r}
            fill="none"
            stroke="#00f5d4"
            strokeWidth="1.5"
            opacity="0.4"
          />
        ))}
        <circle
          r="140"
          fill="none"
          stroke="#00f5d4"
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="-140"
          y1="0"
          x2="140"
          y2="0"
          stroke="#00f5d4"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <line
          x1="0"
          y1="-140"
          x2="0"
          y2="140"
          stroke="#00f5d4"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <circle r="16" fill="#143636" stroke="#00f5d4" strokeWidth="2" />
        <text
          y="5"
          textAnchor="middle"
          fill="#00f5d4"
          fontSize="13"
          fontWeight="bold"
        >
          HQ
        </text>
      </g>

      <g transform="translate(560 240)">
        <rect
          x="-140"
          y="-100"
          width="280"
          height="190"
          rx="10"
          fill="#0a1215"
          stroke="#243b42"
          strokeWidth="6"
        />
        <text
          x="-120"
          y="-75"
          fill="#38d9a9"
          fontSize="12"
          fontWeight="bold"
          letterSpacing="1"
        >
          GRID TELEMETRY // SECTOR 7
        </text>
        {Array.from({ length: 4 }, (_, i) => (
          <rect
            key={i}
            x="-120"
            y={20 + i * 16}
            width={80 + ((i * 37) % 120)}
            height="8"
            rx="2"
            fill="#20c997"
            opacity="0.6"
          />
        ))}
      </g>

      <g transform="translate(1360 240)">
        <rect
          x="-140"
          y="-100"
          width="280"
          height="190"
          rx="10"
          fill="#0a1215"
          stroke="#243b42"
          strokeWidth="6"
        />
        <text
          x="-120"
          y="-75"
          fill="#f39c12"
          fontSize="12"
          fontWeight="bold"
          letterSpacing="1"
        >
          CIPHER CODE STREAM // ENC
        </text>
      </g>

      {BANK_XS.map((rx) => (
        <g key={rx} transform={`translate(${rx} 280)`}>
          <rect
            x="-70"
            y="-150"
            width="140"
            height="230"
            rx="8"
            fill="#141c1f"
            stroke="#2c3e44"
            strokeWidth="5"
          />
          {Array.from({ length: 6 }, (_, unit) => (
            <rect
              key={unit}
              x="-60"
              y={-130 + unit * 36}
              width="120"
              height="30"
              rx="4"
              fill="#1b2528"
              stroke="#364950"
              strokeWidth="2"
            />
          ))}
        </g>
      ))}

      <path d="M-0 500H1920" stroke="#00f5d4" strokeWidth="3" opacity="0.4" />
      {Array.from({ length: 16 }, (_, i) => (
        <line
          key={i}
          x1={i * 120}
          y1="500"
          x2={i * 120 + 30}
          y2="720"
          stroke="#1f2c30"
          strokeWidth="3"
          opacity="0.8"
        />
      ))}

      <g transform="translate(960 452)">
        <rect
          x="-180"
          y="-16"
          width="360"
          height="32"
          rx="6"
          fill="#10181b"
          stroke="#e67e22"
          strokeWidth="2.5"
        />
        <text
          y="5"
          textAnchor="middle"
          fill="#f39c12"
          fontSize="15"
          fontWeight="bold"
          letterSpacing="3"
        >
          TOP SECRET // PRIDE RECON BASE
        </text>
      </g>

      <g transform="translate(960 500)">
        <rect x="-170" y="-14" width="340" height="14" rx="3" fill="#2c3e44" />
        <rect
          x="-160"
          y="0"
          width="320"
          height="40"
          rx="6"
          fill="#141c1f"
          stroke="#2c3e44"
          strokeWidth="3"
        />
        <rect
          x="-80"
          y="-6"
          width="160"
          height="30"
          rx="4"
          fill="#0a1215"
          stroke="#e67e22"
          strokeWidth="2"
        />
      </g>

      <g transform="translate(1500 500)">
        <ellipse cx="0" cy="8" rx="60" ry="12" fill="#0a1215" />
        <rect x="-10" y="-20" width="20" height="28" fill="#1f2c30" />
        <ellipse
          cx="0"
          cy="-20"
          rx="70"
          ry="14"
          fill="#143636"
          stroke="#00f5d4"
          strokeWidth="2"
        />
      </g>
    </g>
  );
});

export function ScoutBaseScenery({
  seconds,
}: {
  seconds: number;
}): React.JSX.Element {
  return (
    <g className="scout-base-scenery">
      <ScoutHQStatic />
      <LaserScan />
      <ConsoleLasers />
      <ConsoleScreen />
      <RadarSweep />
      <RadarBlips />
      <TelemetryWave />
      {/* The ticking hex counter is text, which CSS cannot animate. */}
      <CipherRows seconds={seconds} />
      <LedBanks />
      <HoloProjection />
    </g>
  );
}
