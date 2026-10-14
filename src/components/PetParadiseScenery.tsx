import { memo } from "react";
import type { JSX } from "react";

const STAGE_WIDTH = 2400;

// Deterministic window and sparkle positions so the nursery never reshuffles between frames.
const WINDOWS = [240, 880, 1520, 2060];
const SPARKLES = [
  { x: 1090, y: 330 },
  { x: 1320, y: 350 },
  { x: 760, y: 250 },
  { x: 1660, y: 300 },
  { x: 2260, y: 250 },
];
const PANELS = Array.from({ length: 12 }, (_, i) => i * 200 + 18);
const BUBBLES = [
  { x: 1168, y: 418 },
  { x: 1200, y: 410 },
  { x: 1234, y: 418 },
];

function PawPrint({
  x,
  y,
  scale,
  fill,
  opacity = 1,
}: {
  x: number;
  y: number;
  scale: number;
  fill: string;
  opacity?: number;
}): JSX.Element {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill={fill}
      opacity={opacity}
    >
      <ellipse cx="0" cy="8" rx="26" ry="21" />
      <circle cx="-26" cy="-12" r="9" />
      <circle cx="-9" cy="-26" r="9.5" />
      <circle cx="9" cy="-26" r="9.5" />
      <circle cx="26" cy="-12" r="9" />
    </g>
  );
}

function ArchedWindow({ x }: { x: number }): JSX.Element {
  return (
    <g>
      <path
        d={`M${x - 80} 400V170A80 80 0 0 1 ${x + 80} 170V400Z`}
        fill="url(#pp-glass)"
        stroke="#fff6e0"
        strokeWidth="10"
      />
      <PawPrint x={x} y={290} scale={0.9} fill="#f29bb8" opacity={0.75} />
      <rect x={x - 96} y="400" width="192" height="14" rx="4" fill="#fff6e0" />
    </g>
  );
}

function ClawTub({
  x,
  y,
  scale = 1,
  water,
}: {
  x: number;
  y: number;
  scale?: number;
  water: string;
}): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="34" rx="104" ry="14" fill="#a8745f" opacity=".2" />
      <path
        d="M-100-40Q-100 8-70 10H70Q100 8 100-40Z"
        fill="#fefbf0"
        stroke="#d9c5b4"
        strokeWidth="4"
      />
      <ellipse
        cx="0"
        cy="-40"
        rx="100"
        ry="22"
        fill="#fefbf0"
        stroke="#d9c5b4"
        strokeWidth="4"
      />
      <ellipse cx="0" cy="-40" rx="82" ry="14" fill={water} />
      <circle cx="-62" cy="16" r="9" fill="#d4a574" />
      <circle cx="62" cy="16" r="9" fill="#d4a574" />
    </g>
  );
}

// Paw-print chandelier over the grooming spa: the room's memorable landmark.
function PawChandelier({ sway }: { sway: number }): JSX.Element {
  return (
    <g transform={`rotate(${sway} 1200 0)`}>
      <rect x="1199" y="0" width="2" height="150" fill="#c9a04e" />
      <PawPrint x={1200} y={232} scale={2} fill="url(#pp-gold)" />
      {[-44, -18, 18, 44].map((dx) => (
        <path
          key={dx}
          d={`M${1200 + dx} 292l-8 14l8 16l8-16Z`}
          fill="#fff8e8"
          stroke="#e8b957"
          strokeWidth="2"
        />
      ))}
    </g>
  );
}

function Sparkle({
  x,
  y,
  scale,
}: {
  x: number;
  y: number;
  scale: number;
}): JSX.Element {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M0-10L3-3L10 0L3 3L0 10L-3 3L-10 0L-3-3Z"
      fill="#ffe27a"
      stroke="#e8b957"
      strokeWidth="1.5"
    />
  );
}

// Static decoration below: memoized and never given `seconds`, so the 80ms ticks skip them.

const PetWall = memo(function PetWall(): JSX.Element {
  return (
    <>
      <defs>
        <linearGradient id="pp-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e6f8" />
          <stop offset="100%" stopColor="#dff5ee" />
        </linearGradient>
        <linearGradient id="pp-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9f5ea" />
          <stop offset="100%" stopColor="#9fdfe6" />
        </linearGradient>
        <linearGradient id="pp-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe49a" />
          <stop offset="100%" stopColor="#e0a84a" />
        </linearGradient>
        <radialGradient id="pp-glow">
          <stop offset="0%" stopColor="#d9fff2" stopOpacity=".9" />
          <stop offset="100%" stopColor="#9fe8d2" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="pp-floor"
          width="120"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0H120M0 30H120M0 0V30M60 0V30M30 30V60M90 30V60"
            fill="none"
            stroke="#e3bca0"
            strokeWidth="2"
            opacity=".7"
          />
        </pattern>
      </defs>
      {/* Lavender and mint walls with a wainscot */}
      <rect width={STAGE_WIDTH} height="540" fill="url(#pp-wall)" />
      {WINDOWS.map((x) => (
        <ArchedWindow key={x} x={x} />
      ))}
      <rect y="430" width={STAGE_WIDTH} height="110" fill="#cdb6e6" />
      <rect y="426" width={STAGE_WIDTH} height="8" fill="#b59bd6" />
      {PANELS.map((x) => (
        <rect
          key={x}
          x={x}
          y="452"
          width="164"
          height="66"
          rx="10"
          fill="none"
          stroke="#b59bd6"
          strokeWidth="4"
        />
      ))}
    </>
  );
});

const PetSpa = memo(function PetSpa(): JSX.Element {
  return <ClawTub x={1200} y={470} scale={1.25} water="#8fd7e6" />;
});

const PetFloor = memo(function PetFloor(): JSX.Element {
  return (
    <>
      <rect y="540" width={STAGE_WIDTH} height="180" fill="#f3d7c0" />
      <rect y="540" width={STAGE_WIDTH} height="180" fill="url(#pp-floor)" />
      <ellipse
        cx="1200"
        cy="650"
        rx="560"
        ry="48"
        fill="#f6b7cf"
        opacity=".9"
      />
      <ellipse
        cx="1200"
        cy="650"
        rx="520"
        ry="38"
        fill="none"
        stroke="#fff3f8"
        strokeWidth="4"
        strokeDasharray="14 10"
      />
    </>
  );
});

const PetProps = memo(function PetProps(): JSX.Element {
  return (
    <>
      <ClawTub x={420} y={470} water="#bdeedd" />
      <ClawTub x={2180} y={470} water="#bdeedd" />
      <g transform="translate(640 528)">
        <ellipse cx="0" cy="14" rx="112" ry="26" fill="#a98ad0" />
        <ellipse cx="0" cy="8" rx="100" ry="22" fill="#d9c2f2" />
        <ellipse cx="-8" cy="2" rx="60" ry="14" fill="#f3e9ff" />
        <PawPrint x={-8} y={2} scale={0.5} fill="#c9a7e0" />
      </g>
      <g transform="translate(1880 520)">
        <rect
          x="-130"
          y="-70"
          width="260"
          height="70"
          rx="35"
          fill="#ffb3c6"
          stroke="#c96a8a"
          strokeWidth="5"
        />
        {[-60, 0, 60].map((dx) => (
          <rect
            key={dx}
            x={dx - 6}
            y="-66"
            width="12"
            height="62"
            fill="#ffd0dc"
          />
        ))}
        <ellipse cx="-130" cy="-35" rx="16" ry="30" fill="#5b3a58" />
        <ellipse cx="130" cy="-35" rx="16" ry="30" fill="#5b3a58" />
      </g>
    </>
  );
});

const PetPortalDoor = memo(function PetPortalDoor(): JSX.Element {
  return (
    <>
      <path
        d="M28 560V476Q28 440 64 440Q100 440 100 476V560Z"
        fill="#7b4f7a"
        stroke="#f2c879"
        strokeWidth="6"
      />
      <PawPrint x={64} y={500} scale={0.5} fill="#f2c879" opacity={0.85} />
    </>
  );
});

function SpaEffects({ seconds }: { seconds: number }): JSX.Element {
  const bubbles = BUBBLES.map((bubble, i) => {
    const rise = (seconds * 26 + i * 21) % 60;
    return { ...bubble, y: bubble.y - rise, r: 5 + (i % 2) * 2, rise };
  });
  return (
    <>
      {bubbles.map((bubble, i) => (
        <circle
          key={i}
          cx={bubble.x}
          cy={bubble.y}
          r={bubble.r}
          fill="#ffffff"
          opacity={0.85 - bubble.rise / 90}
        />
      ))}
      {SPARKLES.map((sparkle, i) => (
        <Sparkle
          key={i}
          x={sparkle.x}
          y={sparkle.y}
          scale={0.8 + 0.25 * Math.sin(seconds * 3 + i)}
        />
      ))}
    </>
  );
}

export function PetParadiseScenery({
  seconds,
}: {
  seconds: number;
}): JSX.Element {
  const sway = Math.sin(seconds * 0.8) * 2;
  const glowPulse = Math.sin(seconds * 2.2);

  return (
    <g className="pet-paradise-scenery">
      <PetWall />
      <PawChandelier sway={sway} />
      <PetSpa />
      <SpaEffects seconds={seconds} />
      <PetFloor />
      <PetProps />

      {/* Portal to Downtown Plaza: glowing arched paw door on the left */}
      <circle cx="64" cy="500" r={72 + glowPulse * 6} fill="url(#pp-glow)" />
      <PetPortalDoor />
    </g>
  );
}
