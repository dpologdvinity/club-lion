import { useEffect, useId, useState } from "react";
import type { PlaceId } from "../game.ts";
import {
  computeCoasterTrackPosition,
  computeFerrisWheelCabin,
} from "../utils/kineticRides.ts";
import {
  calculateWaveOffset,
  calculateBucketCycle,
  calculateRiverDrift,
} from "../utils/waterparkPhysics.ts";

const COASTER_LINE = Array.from({ length: 260 }, (_, i) => {
  const p = computeCoasterTrackPosition(i / 259);
  return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
}).join(" ");

function PalmTree({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0Q15 -80 5 -160Q-5 -210 20 -260"
        fill="none"
        stroke="#8b6540"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <g transform="translate(20 -260)">
        <path d="M0 0Q-60 -40 -110 -15Q-60 10 0 0" fill="#4d9b62" />
        <path d="M0 0Q60 -50 120 -25Q70 15 0 0" fill="#58ad6f" />
        <path d="M0 0Q-40 -80 -70 -120Q-20 -60 0 0" fill="#3f8452" />
        <path d="M0 0Q40 -85 75 -125Q30 -60 0 0" fill="#4d9b62" />
        <path d="M0 0Q-10 -70 5 -135Q10 -65 0 0" fill="#5dbd76" />
        <circle cx="-6" cy="-2" r="8" fill="#664627" />
        <circle cx="8" cy="2" r="7" fill="#5a3d21" />
      </g>
    </g>
  );
}

function InnerTube({
  x,
  y,
  angle = 0,
  color = "#ff725c",
  scale = 1,
}: {
  x: number;
  y: number;
  angle?: number;
  color?: string;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <ellipse rx="36" ry="24" fill={color} stroke="#ffffff" strokeWidth="4" />
      <ellipse rx="16" ry="10" fill="#36969e" opacity="0.8" />
    </g>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-12 0L-8-145H12L18 0" fill="#926241" />
      <path
        d="M0-65Q-60-85-55-115M8-80Q65-95 62-130"
        fill="none"
        stroke="#926241"
        strokeWidth="12"
      />
      <ellipse cy="-158" rx="98" ry="48" fill="#468567" />
      <ellipse cx="-55" cy="-148" rx="72" ry="38" fill="#72a86d" />
      <ellipse cx="45" cy="-175" rx="64" ry="34" fill="#8abb78" />
    </g>
  );
}
function Tent({
  x,
  y,
  color,
  name,
}: {
  x: number;
  y: number;
  color: string;
  name: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-130"
        y="-190"
        width="260"
        height="190"
        rx="12"
        fill="#fff0d3"
        stroke="#975f47"
        strokeWidth="5"
      />
      <path d="M-160-180L0-305L160-180Z" fill={color} />
      <path
        d="M-90-180L0-305L90-180M-160-180H160"
        fill="none"
        stroke="#ffe4a5"
        strokeWidth="18"
      />
      <rect x="-110" y="-120" width="220" height="100" rx="14" fill="#456b59" />
      <rect
        x="-125"
        y="-205"
        width="250"
        height="65"
        rx="14"
        fill="#fff9e9"
        stroke="#b7764c"
        strokeWidth="5"
      />
      <text y="-161" textAnchor="middle" fontSize="27" fill="#593d2b">
        {name}
      </text>
      <path d="M-145-185V0M145-185V0" stroke="#a77349" strokeWidth="10" />
      <path
        d="M0-305V-345L60-325L0-315"
        fill="#e9a43e"
        stroke="#a77349"
        strokeWidth="5"
      />
    </g>
  );
}

function PenthouseElevator({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="penthouse-elevator-scenery"
    >
      <ellipse cx="0" cy="5" rx="60" ry="14" fill="#3a3028" opacity="0.35" />
      <rect
        x="-55"
        y="-220"
        width="110"
        height="220"
        rx="14"
        fill="#e5e0d3"
        stroke="#9a8c78"
        strokeWidth="5"
      />
      <path
        d="M-65 -220 Q 0 -255 65 -220 Z"
        fill="#c99e52"
        stroke="#846429"
        strokeWidth="4"
      />
      <rect
        x="-46"
        y="-214"
        width="92"
        height="22"
        rx="6"
        fill="#294b3c"
        stroke="#c99e52"
        strokeWidth="2"
      />
      <text
        y="-199"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill="#ffeaaf"
        letterSpacing="1"
      >
        PENTHOUSE
      </text>
      <rect
        x="-42"
        y="-185"
        width="40"
        height="185"
        fill="#d4af37"
        stroke="#997a22"
        strokeWidth="3"
      />
      <rect
        x="2"
        y="-185"
        width="40"
        height="185"
        fill="#d4af37"
        stroke="#997a22"
        strokeWidth="3"
      />
      <path
        d="M-22 -140 L-2 -100 L-22 -60 L-42 -100 Z M22 -140 L42 -100 L22 -60 L2 -100 Z"
        fill="none"
        stroke="#b8932b"
        strokeWidth="2"
      />
      <circle
        cx="0"
        cy="-172"
        r="10"
        fill="#294b3c"
        stroke="#c99e52"
        strokeWidth="2"
      />
      <path d="M0 -178 L-5 -168 L5 -168 Z" fill="#ffd700" />
    </g>
  );
}

function PhoneBoothEntrance({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="phone-booth-scenery">
      <ellipse cx="0" cy="5" rx="45" ry="12" fill="#3a3028" opacity="0.4" />
      <rect
        x="-40"
        y="-220"
        width="80"
        height="220"
        rx="12"
        fill="#b83228"
        stroke="#781d16"
        strokeWidth="5"
      />
      <path
        d="M-45 -220 Q 0 -255 45 -220 Z"
        fill="#98251c"
        stroke="#781d16"
        strokeWidth="4"
      />
      <circle
        cx="0"
        cy="-232"
        r="6"
        fill="#ffd700"
        stroke="#a68500"
        strokeWidth="1.5"
      />
      <rect
        x="-34"
        y="-214"
        width="68"
        height="18"
        rx="4"
        fill="#ffffff"
        stroke="#781d16"
        strokeWidth="2"
      />
      <text
        y="-201"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#111111"
        letterSpacing="1"
      >
        TELEPHONE
      </text>
      <rect
        x="-32"
        y="-190"
        width="64"
        height="180"
        rx="4"
        fill="#ffeab0"
        opacity="0.85"
      />
      <line
        x1="-32"
        y1="-140"
        x2="32"
        y2="-140"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="-32"
        y1="-90"
        x2="32"
        y2="-90"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="-32"
        y1="-40"
        x2="32"
        y2="-40"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="-11"
        y1="-190"
        x2="-11"
        y2="-10"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="11"
        y1="-190"
        x2="11"
        y2="-10"
        stroke="#781d16"
        strokeWidth="3"
      />
      <rect x="-8" y="-135" width="16" height="24" rx="3" fill="#222222" />
      <path
        d="M-5 -138 Q 0 -144 5 -138 L4 -128 Q 0 -132 -4 -128 Z"
        fill="#111111"
      />
      <circle cx="20" cy="-115" r="3" fill="#2ef060" />
    </g>
  );
}

function CondoScenery({ seconds, width }: { seconds: number; width: number }) {
  return (
    <g className="condo-scenery">
      <defs>
        <linearGradient id="penthouse-twilight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0b1f" />
          <stop offset="45%" stopColor="#1e183a" />
          <stop offset="75%" stopColor="#432c4a" />
          <stop offset="100%" stopColor="#964e56" />
        </linearGradient>
        <linearGradient id="penthouse-window-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
        <radialGradient id="chandelier-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe89e" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffd269" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffd269" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect
        x="120"
        y="40"
        width="1680"
        height="380"
        rx="16"
        fill="url(#penthouse-twilight)"
      />

      {[
        { x: 180, y: 70, r: 2 },
        { x: 320, y: 95, r: 1.5 },
        { x: 450, y: 65, r: 2.2 },
        { x: 620, y: 110, r: 1.8 },
        { x: 790, y: 75, r: 2 },
        { x: 1020, y: 85, r: 2.5 },
        { x: 1200, y: 60, r: 1.5 },
        { x: 1360, y: 105, r: 2 },
        { x: 1540, y: 70, r: 1.8 },
        { x: 1680, y: 90, r: 2.2 },
        { x: 260, y: 140, r: 1.5 },
        { x: 880, y: 135, r: 1.6 },
        { x: 1440, y: 130, r: 2.2 },
      ].map((star, i) => (
        <circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.r * (1 + Math.sin(seconds * 2 + i) * 0.25)}
          fill="#fff5d0"
          opacity={0.6 + Math.sin(seconds * 1.5 + i) * 0.3}
        />
      ))}

      <g transform="translate(1580 90)">
        <circle cx="0" cy="0" r="28" fill="#fff2b2" />
        <circle cx="10" cy="-6" r="24" fill="#1e183a" />
      </g>

      <g opacity="0.85">
        <rect x="180" y="240" width="90" height="180" fill="#141124" />
        <rect x="290" y="200" width="110" height="220" fill="#19152b" />
        <polygon points="345,160 330,200 360,200" fill="#19152b" />
        <rect x="420" y="260" width="80" height="160" fill="#120e20" />
        <rect x="520" y="180" width="130" height="240" fill="#1d1830" />
        <polygon points="585,130 575,180 595,180" fill="#d4af37" />
        <rect x="670" y="230" width="95" height="190" fill="#161226" />
        <rect x="790" y="270" width="120" height="150" fill="#130f22" />
        <rect x="930" y="195" width="140" height="225" fill="#1a152e" />
        <rect x="1090" y="250" width="100" height="170" fill="#151124" />
        <rect x="1210" y="170" width="115" height="250" fill="#1d1830" />
        <polygon points="1267,120 1255,170 1280,170" fill="#1d1830" />
        <rect x="1345" y="220" width="90" height="200" fill="#171329" />
        <rect x="1455" y="260" width="120" height="160" fill="#130f22" />
        <rect x="1595" y="210" width="110" height="210" fill="#1a152e" />
        <polygon points="1650,170 1640,210 1660,210" fill="#d4af37" />

        {[
          [310, 220],
          [330, 250],
          [360, 230],
          [350, 280],
          [540, 200],
          [570, 220],
          [600, 200],
          [550, 250],
          [590, 270],
          [610, 310],
          [950, 220],
          [980, 240],
          [1020, 220],
          [960, 270],
          [1000, 290],
          [1030, 270],
          [1230, 190],
          [1260, 210],
          [1280, 240],
          [1240, 270],
          [1270, 290],
          [1615, 230],
          [1645, 250],
          [1675, 230],
          [1630, 280],
        ].map(([wx, wy], idx) => (
          <rect
            key={idx}
            x={wx}
            y={wy}
            width="8"
            height="12"
            rx="1"
            fill={
              idx % 3 === 0 ? "#ffd166" : idx % 3 === 1 ? "#70d6ff" : "#ff9770"
            }
            opacity={0.75 + Math.sin(seconds * 3 + idx) * 0.25}
          />
        ))}
      </g>

      <rect
        x="120"
        y="40"
        width="1680"
        height="380"
        rx="16"
        fill="url(#penthouse-window-sheen)"
      />
      <rect
        x="120"
        y="40"
        width="1680"
        height="380"
        rx="16"
        fill="none"
        stroke="#2b2038"
        strokeWidth="12"
      />
      {[400, 680, 960, 1240, 1520].map((x) => (
        <line
          key={x}
          x1={x}
          y1="40"
          x2={x}
          y2="420"
          stroke="#2b2038"
          strokeWidth="8"
        />
      ))}
      <line
        x1="120"
        y1="230"
        x2="1800"
        y2="230"
        stroke="#2b2038"
        strokeWidth="6"
      />

      <line
        x1="130"
        y1="370"
        x2="1790"
        y2="370"
        stroke="#9080a0"
        strokeWidth="6"
      />
      {Array.from({ length: 30 }, (_, i) => (
        <line
          key={i}
          x1={150 + i * 55}
          y1="370"
          x2={150 + i * 55}
          y2="420"
          stroke="#554466"
          strokeWidth="3"
        />
      ))}

      <circle cx="960" cy="150" r="180" fill="url(#chandelier-glow)" />
      <line x1="960" y1="0" x2="960" y2="80" stroke="#c9a227" strokeWidth="6" />
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
        {[-90, -60, -30, 0, 30, 60, 90].map((cx, i) => (
          <g key={i} transform={`translate(${cx} 60)`}>
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

      {[
        { x: 60, y: 220 },
        { x: 1860, y: 220 },
      ].map((sconce, i) => (
        <g key={i} transform={`translate(${sconce.x} ${sconce.y})`}>
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

      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={420 + i * 40}
            x2={width}
            y2={420 + i * 40}
            stroke="#3a2216"
            strokeWidth="3"
            opacity="0.8"
          />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <line
            key={i}
            x1={i * 145}
            y1="420"
            x2={i * 145 + 50}
            y2="720"
            stroke="#2e190f"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
      </g>

      <g transform="translate(960 415)">
        <rect
          x="-190"
          y="-18"
          width="380"
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
    </g>
  );
}

function PetParadiseScenery({
  seconds: _seconds,
  width,
}: {
  seconds: number;
  width: number;
}) {
  return (
    <g className="scene-petparadise">
      {/* Clawfoot tubs row */}
      {[200, 600, 1000, 1400, 1800, 2200].map((x, i) => (
        <g key={`tub-${i}`} transform={`translate(${x} 450)`}>
          {/* Tub base */}
          <ellipse cx="0" cy="0" rx="80" ry="30" fill="#d4a574" />
          {/* Tub body */}
          <rect x="-70" y="-40" width="140" height="50" rx="8" fill="#fefbf0" />
          {/* Claw feet */}
          {[-50, 50].map((fx, fi) => (
            <g key={`foot-${fi}`}>
              <circle cx={fx} cy="15" r="6" fill="#d4a574" />
            </g>
          ))}
          {/* Water bubbles */}
          {[...Array(3)].map((_, bi) => (
            <circle
              key={`bubble-${bi}`}
              cx={-40 + bi * 40}
              cy={-15 + Math.sin(i + bi) * 5}
              r="4"
              fill="#a8d8ea"
              opacity="0.6"
            />
          ))}
        </g>
      ))}

      {/* Plush velvet cushions */}
      {[400, 1000, 1600, 2000].map((x, i) => (
        <g key={`cushion-${i}`} transform={`translate(${x} 550)`}>
          {/* Cushion shape */}
          <ellipse cx="0" cy="0" rx="60" ry="50" fill="#d8b4d8" />
          {/* Texture lines */}
          {[...Array(4)].map((_, ti) => (
            <line
              key={`line-${ti}`}
              x1="-50"
              y1={-25 + ti * 15}
              x2="50"
              y2={-25 + ti * 15}
              stroke="#c8a4c8"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}
        </g>
      ))}

      {/* Colorful agility tunnels */}
      {[300, 1200, 2100].map((x, i) => (
        <g key={`tunnel-${i}`} transform={`translate(${x} 480)`}>
          {/* Tunnel barrel */}
          <ellipse
            cx="0"
            cy="0"
            rx="90"
            ry="45"
            fill={["#ffb3ba", "#ffdfba", "#ffffba"][i]}
            opacity="0.8"
          />
          {/* Tunnel opening */}
          <ellipse
            cx="0"
            cy="0"
            rx="75"
            ry="35"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          />
          {/* Rings */}
          {[...Array(3)].map((_, ri) => (
            <circle
              key={`ring-${ri}`}
              cx={-60 + ri * 60}
              cy="0"
              r="5"
              fill={["#ffb3ba", "#ffdfba", "#ffffba"][i]}
              opacity="0.6"
            />
          ))}
        </g>
      ))}

      {/* Paw-print chandeliers hanging from above */}
      {[600, 1200, 1800].map((x, i) => (
        <g key={`chandelier-${i}`} transform={`translate(${x} 250)`}>
          {/* Hanging chain */}
          <line x1="0" y1="0" x2="0" y2="80" stroke="#d4a574" strokeWidth="2" />
          {/* Main paw center pad */}
          <circle cx="0" cy="80" r="15" fill="#f4c430" />
          {/* Toe pads arranged in paw pattern */}
          {[
            { x: -20, y: 50 },
            { x: 20, y: 50 },
            { x: -10, y: 30 },
            { x: 10, y: 30 },
          ].map((pos, pi) => (
            <circle
              key={`toe-${pi}`}
              cx={pos.x}
              cy={pos.y}
              r="8"
              fill="#f4c430"
            />
          ))}
          {/* Light glow */}
          <circle cx="0" cy="80" r="20" fill="#ffd700" opacity="0.2" />
        </g>
      ))}
    </g>
  );
}

function ScoutBaseScenery({
  seconds,
  width,
}: {
  seconds: number;
  width: number;
}) {
  const radarAngle = (seconds * 80) % 360;
  return (
    <g className="scout-base-scenery">
      <defs>
        <linearGradient id="scout-metal-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10181b" />
          <stop offset="50%" stopColor="#192428" />
          <stop offset="100%" stopColor="#131b1d" />
        </linearGradient>
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#00bbf9" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#00bbf9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="radar-sweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00f5d4" stopOpacity="0" />
        </linearGradient>
        <pattern
          id="hazard-tape"
          width="40"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="20" height="20" fill="#f39c12" />
          <rect x="20" width="20" height="20" fill="#1c2321" />
        </pattern>
      </defs>

      <rect
        x="0"
        y="30"
        width={width}
        height="480"
        fill="url(#scout-metal-wall)"
      />

      {[0, 480, 960, 1440, 1900].map((x) => (
        <g key={x}>
          <rect
            x={x - 20}
            y="30"
            width="40"
            height="480"
            fill="#1a2529"
            stroke="#2c3e44"
            strokeWidth="3"
          />
          {[60, 140, 220, 300, 380, 460].map((y) => (
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

      <rect x="0" y="30" width={width} height="12" fill="url(#hazard-tape)" />
      <rect x="0" y="490" width={width} height="14" fill="url(#hazard-tape)" />

      <g transform="translate(960 270)">
        <circle r="140" fill="#0d1f1f" stroke="#1f4040" strokeWidth="8" />
        <circle r="140" fill="url(#radar-glow)" />
        <circle
          r="35"
          fill="none"
          stroke="#00f5d4"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <circle
          r="70"
          fill="none"
          stroke="#00f5d4"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <circle
          r="105"
          fill="none"
          stroke="#00f5d4"
          strokeWidth="1.5"
          opacity="0.4"
        />
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
        <g transform={`rotate(${radarAngle})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-140"
            stroke="#00f5d4"
            strokeWidth="3"
          />
          <path
            d="M0 0 L-40 -140 A140 140 0 0 1 0 -140 Z"
            fill="url(#radar-sweep)"
          />
        </g>
        {[
          { x: 45, y: -60, color: "#2ecc71" },
          { x: -75, y: 35, color: "#e74c3c" },
          { x: -30, y: -80, color: "#f39c12" },
          { x: 80, y: 70, color: "#2ecc71" },
        ].map((blip, i) => (
          <circle
            key={i}
            cx={blip.x}
            cy={blip.y}
            r="4.5"
            fill={blip.color}
            opacity={0.4 + Math.sin(seconds * 4 + i * 1.5) * 0.6}
          />
        ))}
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
        <path
          d={`M -120 -20 ${Array.from({ length: 24 }, (_, i) => `L ${-120 + i * 10} ${-20 + Math.sin(seconds * 5 + i * 0.5) * 22}`).join(" ")}`}
          fill="none"
          stroke="#00f5d4"
          strokeWidth="2.5"
        />
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

      {[160, 1760].map((rx, bankIdx) => (
        <g key={bankIdx} transform={`translate(${rx} 280)`}>
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
            <g key={unit} transform={`translate(0 ${-130 + unit * 36})`}>
              <rect
                x="-60"
                y="0"
                width="120"
                height="30"
                rx="4"
                fill="#1b2528"
                stroke="#364950"
                strokeWidth="2"
              />
              {Array.from({ length: 6 }, (_, led) => {
                const active =
                  Math.floor(seconds * 4 + bankIdx * 3 + unit * 2 + led) % 3 !==
                  0;
                const ledColor =
                  led === 0 ? "#e74c3c" : led % 2 === 0 ? "#2ecc71" : "#f1c40f";
                return (
                  <circle
                    key={led}
                    cx={-45 + led * 18}
                    cy="15"
                    r="4"
                    fill={active ? ledColor : "#2c3e50"}
                    opacity={active ? 1 : 0.3}
                  />
                );
              })}
            </g>
          ))}
        </g>
      ))}

      <g>
        <line
          x1="0"
          y1="500"
          x2={width}
          y2="500"
          stroke="#00f5d4"
          strokeWidth="3"
          opacity="0.4"
        />
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
      </g>

      <g transform="translate(960 495)">
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
    </g>
  );
}

function CoastalOcean({ seconds }: { seconds: number }) {
  const id = useId();
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sunset`} x2="0" y2="1">
          <stop stopColor="#d79291" />
          <stop offset=".6" stopColor="#f7c78b" />
          <stop offset="1" stopColor="#ffe3ae" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x2="0" y2="1">
          <stop stopColor="#80b5b8" />
          <stop offset="1" stopColor="#397d8e" />
        </linearGradient>
      </defs>
      <rect width="2400" height="720" fill={`url(#${id}-sunset)`} />
      <circle cx="1350" cy="265" r="100" fill="#ffecb1" />
      <g fill="#fff1cf" opacity=".5">
        <ellipse cx="480" cy="150" rx="180" ry="24" />
        <ellipse cx="1850" cy="110" rx="220" ry="20" />
      </g>
      <rect y="310" width="2400" height="410" fill={`url(#${id}-water)`} />
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          d={`M${1240 - i * 26} ${328 + i * 24}h${220 + i * 52}`}
          stroke="#ffe1a0"
          strokeWidth="8"
          opacity={0.5 - i * 0.05}
          strokeLinecap="round"
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 210 - 50} ${390 + (i % 3) * 43 + Math.sin(seconds * 0.7 + i) * 8}q60 -13 120 0t120 0`}
          fill="none"
          stroke="#c7e1d9"
          strokeWidth="5"
          opacity=".65"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M470 255q18 -20 36 0q18 -20 36 0M720 210q14 -16 28 0q14 -16 28 0"
        fill="none"
        stroke="#6a6762"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  );
}

function SunsetBeachScenery({ seconds }: { seconds: number }) {
  return (
    <g>
      <CoastalOcean seconds={seconds} />
      <path
        d="M0 515Q430 450 870 515T1670 515T2400 495V720H0Z"
        fill="#e8ba78"
      />
      <path
        d="M0 553Q440 505 940 556T1800 550T2400 544V720H0Z"
        fill="#f3d298"
      />
      <path
        d="M0 519Q430 454 870 519T1670 519T2400 499"
        fill="none"
        stroke="#fff3d2"
        strokeWidth="9"
      />
      <path
        d="M0 670Q350 594 780 644T1450 667T2400 637V720H0Z"
        fill="#eac28a"
      />
      {[230, 430, 2140, 2290].map((x, i) => (
        <PalmTree key={x} x={x} y={550} scale={i % 2 ? 0.85 : 1.15} />
      ))}
      <g transform="translate(930 540)">
        <ellipse cy="15" rx="250" ry="36" fill="#bd8f59" opacity=".35" />
        <path d="M-175 0V-125M175 0V-125" stroke="#916741" strokeWidth="13" />
        <path
          d="M-230-120Q-140-200 0-240Q140-200 230-120Z"
          fill="#b48a4b"
          stroke="#8e693d"
          strokeWidth="5"
        />
        {[-180, -120, -60, 0, 60, 120, 180].map((x) => (
          <path
            key={x}
            d={`M0-240L${x}-120l-15 28`}
            fill="none"
            stroke="#e1bd72"
            strokeWidth="12"
          />
        ))}
        <rect
          x="-170"
          y="-40"
          width="340"
          height="55"
          rx="16"
          fill="#ffecd0"
          stroke="#a8794b"
          strokeWidth="5"
        />
        <rect x="-156" y="-29" width="140" height="24" rx="8" fill="#d77f61" />
        <rect x="16" y="-29" width="140" height="24" rx="8" fill="#76a99a" />
        <text y="-92" textAnchor="middle" fontSize="25" fill="#634c32">
          SUNSET CABANA
        </text>
      </g>
      <g transform="translate(1590 570)">
        <path d="M0 0V-175" stroke="#8e6845" strokeWidth="8" />
        <path
          d="M-140-165Q-60-255 0-245Q60-255 140-165Z"
          fill="#de8a64"
          stroke="#aa604c"
          strokeWidth="4"
        />
        <path d="M0-245Q-40-205-50-165H50Q40-205 0-245" fill="#fff0c8" />
        <path
          d="M-90 15L-30-45H65L35 15Z"
          fill="#fff0c8"
          stroke="#a68059"
          strokeWidth="5"
        />
      </g>
      {[550, 1320, 1850].map((x) => (
        <g key={x} transform={`translate(${x} 654)`}>
          <path
            d="M-16 0Q0-30 16 0Z"
            fill="#ffe7cb"
            stroke="#c18d60"
            strokeWidth="3"
          />
          <path
            d="M0-13V0M-7-9L-4 0M7-9L4 0"
            stroke="#d8ae88"
            strokeWidth="2"
          />
        </g>
      ))}
    </g>
  );
}

function CoastalPierScenery({ seconds }: { seconds: number }) {
  const planksId = useId();
  return (
    <g>
      <CoastalOcean seconds={seconds} />
      <defs>
        <pattern
          id={planksId}
          width="160"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          <rect width="160" height="36" fill="#b38e6a" />
          <path
            d="M0 0H160M0 36H160M80 0V36"
            stroke="#755e4a"
            strokeWidth="3"
          />
          <path
            d="M10 12h53M90 24h45"
            stroke="#d4b692"
            strokeWidth="2"
            opacity=".6"
          />
          <circle cx="8" cy="7" r="2" fill="#675a4c" />
          <circle cx="150" cy="29" r="2" fill="#675a4c" />
        </pattern>
      </defs>
      {Array.from({ length: 13 }, (_, i) => (
        <g key={i} transform={`translate(${i * 200} 480)`}>
          <path d="M-12-10V70H12V-10" fill="#79614b" />
          <ellipse cy="65" rx="35" ry="6" fill="#c2dbcf" opacity=".5" />
        </g>
      ))}
      <path d="M0 475H2400V510H0Z" fill="#745d48" />
      <path d="M0 475H2400" stroke="#d8b78c" strokeWidth="9" />
      <rect y="540" width="2400" height="180" fill={`url(#${planksId})`} />
      {Array.from({ length: 17 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 150} 540V455`}
          stroke="#8e7358"
          strokeWidth="12"
          strokeLinecap="round"
        />
      ))}
      <path d="M0 460H2400M0 500H2400" stroke="#e1c39b" strokeWidth="8" />
      <g transform="translate(1950 540)">
        <ellipse cy="4" rx="160" ry="26" fill="#624f42" opacity=".35" />
        <path
          d="M-105 0L-65-300H65L105 0Z"
          fill="#fff5dc"
          stroke="#8d6552"
          strokeWidth="6"
        />
        <path
          d="M-91-95H91L82-160H-82ZM-74-220H74L65-285H-65Z"
          fill="#c46757"
        />
        <path
          d="M-44 0V-65Q0-110 44-65V0"
          fill="#5c594d"
          stroke="#ae8260"
          strokeWidth="6"
        />
        <rect
          x="-72"
          y="-360"
          width="144"
          height="62"
          rx="6"
          fill="#f5dfa5"
          stroke="#6a5d51"
          strokeWidth="7"
        />
        <path
          d="M-45-360V-300M0-360V-300M45-360V-300"
          stroke="#6a5d51"
          strokeWidth="5"
        />
        <path
          d="M-98-365L0-425L98-365Z"
          fill="#b4574a"
          stroke="#854c40"
          strokeWidth="5"
        />
        <path
          d="M-95-298H95M-105-318V-288M105-318V-288"
          fill="none"
          stroke="#695a4c"
          strokeWidth="7"
        />
        <circle cy="-330" r="16" fill="#fff4c2" />
        <g transform="translate(80 -265)">
          <path
            d="M-20-10H20L65-30V30L20 10H-20Z"
            fill="#d9ae50"
            stroke="#946b32"
            strokeWidth="4"
          />
          <ellipse cx="65" rx="9" ry="30" fill="#a47a34" />
          <path
            d="M0 12V218"
            fill="none"
            stroke="#caa54d"
            strokeWidth="6"
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
          <ellipse
            cy="222"
            rx="9"
            ry="14"
            fill="none"
            stroke="#d9ae50"
            strokeWidth="5"
          />
        </g>
        <rect
          x="-145"
          y="30"
          width="290"
          height="40"
          rx="8"
          fill="#fff0cf"
          stroke="#987650"
          strokeWidth="4"
        />
        <text y="57" textAnchor="middle" fontSize="24" fill="#674f3e">
          HISTORIC LIGHTHOUSE
        </text>
      </g>
      <g transform="translate(820 533)">
        <rect
          x="-125"
          y="-100"
          width="250"
          height="38"
          rx="7"
          fill="#c59b6e"
          stroke="#795e43"
          strokeWidth="4"
        />
        <path
          d="M-140-48H140M-105-48V0M105-48V0"
          stroke="#795e43"
          strokeWidth="12"
        />
        <path d="M-110-80V-48M110-80V-48" stroke="#795e43" strokeWidth="8" />
      </g>
      <g fill="#617a72" opacity=".6">
        <path d="M270 337l70-75 4 75Z" />
        <path d="M350 340l-6-95 85 95Z" />
        <path d="M265 350h170l-30 23H300Z" />
      </g>
    </g>
  );
}

/** Original vector scenery. Manifest asset names describe layers, never requests. */
function MtMistScenery({ seconds }: { seconds: number }) {
  return (
    <g className="mtmist-scenery">
      <path
        d="M0 500L310 160L560 420L900 60L1260 420L1540 120L1840 400L2140 80L2400 450V580H0Z"
        fill="#7499aa"
      />
      <path
        d="M150 337L310 160L452 308L365 289L308 243L253 299ZM665 298L900 60L1130 292L1006 243L938 172L893 194L840 164L781 261ZM1400 285L1540 120L1708 277L1619 249L1533 184L1482 249ZM1992 260L2140 80L2290 292L2200 254L2135 160L2081 221Z"
        fill="#fffdf9"
      />
      <path
        d="M0 505Q280 360 560 492Q860 335 1150 489Q1590 352 1900 485Q2220 392 2400 495V720H0Z"
        fill="#c4dbe1"
      />
      <path d="M0 560Q500 525 1100 565T2400 545V720H0Z" fill="#f1f6f4" />
      {Array.from({ length: 22 }, (_, i) => (
        <g
          key={i}
          transform={`translate(${i * 116 + 20} ${500 + (i % 3) * 15}) scale(${0.65 + (i % 3) * 0.15})`}
        >
          <path
            d="M0-155L-38-80H38ZM0-112L-54-35H54ZM0-70L-65 8H65Z"
            fill="#3d705d"
          />
          <path
            d="M0-155L-20-115H20ZM0-112L-26-73H26ZM0-70L-35-29H35Z"
            fill="#e7f2ee"
          />
          <path d="M0 5V35" stroke="#805e43" strokeWidth="12" />
        </g>
      ))}
      <g transform="translate(940 540)">
        <rect
          x="-255"
          y="-220"
          width="510"
          height="235"
          rx="10"
          fill="#a77750"
          stroke="#654b35"
          strokeWidth="7"
        />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M-250 ${-207 + i * 28}H250`}
            stroke="#805737"
            strokeWidth="7"
          />
        ))}
        <path
          d="M-310-210L0-380L310-210Z"
          fill="#76533d"
          stroke="#563f30"
          strokeWidth="7"
        />
        <path
          d="M-310-210L0-380L310-210L264-205L0-345L-269-197Z"
          fill="#fffdf9"
        />
        <rect x="172" y="-359" width="40" height="110" fill="#8b8178" />
        <path d="M165-359H220" stroke="#fffdf9" strokeWidth="12" />
        {[-160, 160].map((x) => (
          <g key={x} transform={`translate(${x} -140)`}>
            <rect
              x="-42"
              y="-45"
              width="84"
              height="90"
              rx="6"
              fill="#f9d993"
              stroke="#644b37"
              strokeWidth="8"
            />
            <path d="M0-42V42M-39 0H39" stroke="#644b37" strokeWidth="5" />
          </g>
        ))}
        <rect
          x="-49"
          y="-108"
          width="98"
          height="123"
          rx="6"
          fill="#634d3a"
          stroke="#edc987"
          strokeWidth="5"
        />
        <circle cx="26" cy="-44" r="5" fill="#edc987" />
        <rect
          x="-175"
          y="-258"
          width="350"
          height="48"
          rx="10"
          fill="#fff1d4"
          stroke="#674c34"
          strokeWidth="4"
        />
        <text
          y="-225"
          textAnchor="middle"
          fill="#294b3c"
          fontSize="27"
          fontWeight="900"
        >
          MT. MIST BASECAMP
        </text>
      </g>
      <g stroke="#617982" fill="none" strokeWidth="9">
        <path d="M340 465V150M2040 450V150M300 158H380M2000 158H2080" />
        <path d="M0 130Q1200 250 2400 130" strokeWidth="5" />
      </g>
      {Array.from({ length: 5 }, (_, i) => {
        const x = ((i * 520 + seconds * 70) % 2600) - 100;
        const y = 130 + 240 * (x / 2400) * (1 - x / 2400);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0V35" stroke="#526b74" strokeWidth="6" />
            <rect
              x="-42"
              y="32"
              width="84"
              height="77"
              rx="17"
              fill={i % 2 ? "#ba744d" : "#477962"}
              stroke="#fff0d2"
              strokeWidth="5"
            />
            <rect x="-30" y="44" width="60" height="35" rx="7" fill="#d7edf0" />
            <path d="M0 45V78" stroke="#fff0d2" strokeWidth="4" />
            <path d="M-38 98H38" stroke="#fff0d2" strokeWidth="4" />
          </g>
        );
      })}
      <g transform="translate(1800 540)">
        <path d="M-130 15V-135M130 15V-135" stroke="#846042" strokeWidth="14" />
        <path d="M-156-140H156" stroke="#f3f7f5" strokeWidth="20" />
        <rect
          x="-145"
          y="-130"
          width="290"
          height="56"
          rx="8"
          fill="#f3dfb2"
          stroke="#846042"
          strokeWidth="5"
        />
        <text
          y="-92"
          textAnchor="middle"
          fill="#294b3c"
          fontSize="29"
          fontWeight="900"
        >
          SLED RUN
        </text>
        <path
          d="M-64 0H64M-69 13H69M-50-10V13M50-10V13"
          stroke="#846042"
          strokeWidth="8"
        />
        <path
          d="M0 38Q120 30 210 12Q260 0 320-10"
          fill="none"
          stroke="#b7ccd1"
          strokeWidth="8"
          strokeDasharray="14 16"
        />
      </g>
    </g>
  );
}

function CanyonRapidsScenery({
  seconds,
  width,
}: {
  seconds: number;
  width: number;
}) {
  const foamOffset = (seconds * 220) % 60;
  return (
    <g className="canyon-rapids-scenery">
      <defs>
        <linearGradient id="canyon-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c1613f" />
          <stop offset="55%" stopColor="#9c4a30" />
          <stop offset="100%" stopColor="#7a3620" />
        </linearGradient>
        <linearGradient id="canyon-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fa7c9" />
          <stop offset="100%" stopColor="#2c7496" />
        </linearGradient>
        <pattern
          id="canyon-foam"
          width="60"
          height="24"
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${foamOffset} 0)`}
        >
          <path
            d="M0 12Q15 0 30 12Q45 24 60 12"
            fill="none"
            stroke="#eaf6fb"
            strokeWidth="4"
            opacity="0.65"
          />
        </pattern>
      </defs>

      <rect x="0" y="40" width={width} height="420" fill="url(#canyon-wall)" />
      {[260, 820, 1380, 1940].map((x, i) => (
        <path
          key={x}
          d={`M${x} 40 L${x + 90} 40 L${x + 150} 460 L${x - 60} 460 Z`}
          fill={i % 2 === 0 ? "#b2572f" : "#a24f2b"}
          opacity="0.85"
        />
      ))}
      {[400, 1000, 1600, 2150].map((x) => (
        <g key={x} transform={`translate(${x} 470)`}>
          <path
            d="M0 0 L-10 -90 L10 -90 Z"
            fill="#2f5d3a"
            transform="translate(0 -20) scale(1.6)"
          />
          <path
            d="M0 0 L-8 -60 L8 -60 Z"
            fill="#3c7a48"
            transform="translate(0 -10)"
          />
          <rect x="-4" y="-4" width="8" height="24" fill="#5a3d21" />
        </g>
      ))}

      <path
        d="M0 420 Q480 390 960 425 Q1440 395 1920 425 Q2160 395 2400 420 V720H0Z"
        fill="#8a4a2e"
      />

      <rect y="500" width={width} height="150" fill="url(#canyon-river)" />
      <rect
        y="500"
        width={width}
        height="150"
        fill="url(#canyon-foam)"
        opacity="0.5"
      />

      <g transform="translate(1100 440)">
        <path
          d="M-260 0 Q-130 30 0 5 Q130 -20 260 10"
          fill="none"
          stroke="#8b6540"
          strokeWidth="10"
        />
        {Array.from({ length: 9 }, (_, i) => {
          const x = -240 + i * 60;
          const y = 5 + Math.sin(i * 0.8) * 12;
          return (
            <line
              key={i}
              x1={x}
              y1={y - 12}
              x2={x}
              y2={y + 22}
              stroke="#6b4a2a"
              strokeWidth="6"
            />
          );
        })}
      </g>
    </g>
  );
}

export function RoomScenery({
  place,
  preview = false,
}: {
  place: PlaceId;
  preview?: boolean;
}) {
  const [seconds, setSeconds] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (preview) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let start = performance.now();
    const tick = (now: number) => {
      if (now - last >= 80) {
        setSeconds((now - start) / 1000);
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      setSeconds(0);
      start = performance.now();
      setReducedMotion(query.matches);
      if (!query.matches) frame = requestAnimationFrame(tick);
    };
    update();
    query.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", update);
    };
  }, [preview]);
  if (place === "sunset-beach" || place === "coastal-pier") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        {place === "sunset-beach" ? (
          <SunsetBeachScenery seconds={seconds} />
        ) : (
          <CoastalPierScenery seconds={seconds} />
        )}
      </svg>
    );
  }
  const club = place === "club-pulse";
  const downtown = place === "downtown-plaza";
  const midway = place === "wonder-park-midway";
  const isSplashEntry = place === "splash-oasis-entry";
  const isSplashRiver = place === "splash-oasis-river";
  const isCondo = place === "penthouse-condo";
  const isScoutBase = place === "secret-scout-base";
  const isMtMist = place === "mt-mist";
  const isCanyonRapids = place === "canyon-rapids";
  const isPetParadise = place === "pet-paradise";
  const width =
    club || isCondo || isScoutBase
      ? 1920
      : downtown || isMtMist || isCanyonRapids || isPetParadise
        ? 2400
        : 2800;
  const cart = computeCoasterTrackPosition(seconds / 28);
  return (
    <svg
      className="room-scenery"
      viewBox={`0 0 ${width} 720`}
      preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${place}`} x2="0" y2="1">
          <stop
            stopColor={
              club
                ? "#294050"
                : isCondo
                  ? "#100d24"
                  : isScoutBase
                    ? "#0e1517"
                    : isCanyonRapids
                      ? "#cf9a64"
                      : isPetParadise
                        ? "#f5e6f0"
                        : isSplashEntry || isSplashRiver
                          ? "#58b5be"
                          : "#91cfc9"
            }
          />
          <stop
            offset="1"
            stopColor={
              club
                ? "#58687a"
                : isCondo
                  ? "#2d1a38"
                  : isScoutBase
                    ? "#192529"
                    : isCanyonRapids
                      ? "#f6ddb0"
                      : isPetParadise
                        ? "#d0f0e8"
                        : isSplashEntry || isSplashRiver
                          ? "#e3f3db"
                          : "#f7e4aa"
            }
          />
        </linearGradient>
        <pattern
          id={`pavers-${place}`}
          width="130"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0H130V48H0ZM65 0V48"
            fill="none"
            stroke={
              club
                ? "#687985"
                : isCondo
                  ? "#3e2723"
                  : isScoutBase
                    ? "#2c3e50"
                    : "#bd9d78"
            }
            strokeWidth="2"
            opacity={isCondo || isScoutBase ? ".1" : ".25"}
          />
        </pattern>
      </defs>
      <rect width={width} height="720" fill={`url(#sky-${place})`} />
      {!club && !isCondo && !isScoutBase && !isMtMist && (
        <>
          <circle cx={width - 360} cy="100" r="57" fill="#ffedbb" />
          <g fill="#fff8df" opacity=".7">
            <ellipse cx="380" cy="116" rx="160" ry="36" />
            <ellipse cx="1250" cy="80" rx="210" ry="28" />
            <ellipse cx="2140" cy="165" rx="150" ry="36" />
          </g>
          <path
            d={`M0 400Q200 215 480 365Q720 140 1050 375Q1400 180 1800 360Q2200 170 ${width} 340V580H0Z`}
            fill="#97b88a"
          />
          <path
            d={`M0 470Q500 330 970 440Q1700 300 ${width} 470V590H0Z`}
            fill="#6e9a73"
          />
        </>
      )}
      <rect
        y={club || isCondo ? 420 : isScoutBase ? 500 : 540}
        width={width}
        height="300"
        fill={
          club
            ? "#425566"
            : isCondo
              ? "#1e140f"
              : isScoutBase
                ? "#12181a"
                : isSplashEntry
                  ? "#dfca99"
                  : isSplashRiver
                    ? "#d6be8e"
                    : isCanyonRapids
                      ? "#b5693f"
                      : "#e7c794"
        }
      />
      <rect
        y={club || isCondo ? 420 : isScoutBase ? 500 : 540}
        width={width}
        height="300"
        fill={`url(#pavers-${place})`}
      />
      {isMtMist ? (
        <MtMistScenery seconds={seconds} />
      ) : isCondo ? (
        <CondoScenery seconds={seconds} width={width} />
      ) : isScoutBase ? (
        <ScoutBaseScenery seconds={seconds} width={width} />
      ) : isCanyonRapids ? (
        <CanyonRapidsScenery seconds={seconds} width={width} />
      ) : isPetParadise ? (
        <PetParadiseScenery seconds={seconds} width={width} />
      ) : isSplashEntry ? (
        <>
          <g transform="translate(900 500)">
            <ellipse rx="460" ry="110" fill="#2c818f" opacity="0.4" />
            <path
              d="M-440 0 C-300 -60, 300 -60, 440 0 C300 70, -300 70, -440 0 Z"
              fill="#42a8b8"
            />
            {[-300, -150, 0, 150, 300].map((wx, i) => {
              const waveY = calculateWaveOffset(seconds * 1000, 900 + wx);
              return (
                <path
                  key={i}
                  d={`M${wx - 60} ${waveY} Q${wx} ${waveY - 14} ${wx + 60} ${waveY}`}
                  fill="none"
                  stroke="#def8f8"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              );
            })}
            <text
              y="75"
              textAnchor="middle"
              fontSize="28"
              fill="#1b4d54"
              fontWeight="bold"
            >
              TSUNAMI WAVE POOL
            </text>
          </g>

          {(() => {
            const bucket = calculateBucketCycle(seconds * 1000);
            return (
              <g transform="translate(1900 480)">
                <path
                  d="M-80 60 L-50 -180 L50 -180 L80 60"
                  stroke="#d48a37"
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d="M-65 -40 L65 -40 M-60 -110 L60 -110"
                  stroke="#d48a37"
                  strokeWidth="6"
                />
                <g
                  transform={`translate(0 -180) rotate(${bucket.tipAngleDeg})`}
                >
                  <path
                    d="M-36 -45 L36 -45 L26 30 L-26 30 Z"
                    fill="#ffb43b"
                    stroke="#aa681a"
                    strokeWidth="4"
                  />
                  <rect
                    x="-22"
                    y={30 - (bucket.fillPercent / 100) * 65}
                    width="44"
                    height={(bucket.fillPercent / 100) * 65}
                    fill="#3dbbd4"
                    opacity="0.85"
                  />
                  <ellipse
                    cy="-45"
                    rx="36"
                    ry="10"
                    fill="#ffd470"
                    stroke="#aa681a"
                    strokeWidth="3"
                  />
                </g>
                {bucket.isDumping && (
                  <g>
                    <path
                      d="M-20 -150 Q-30 0 -50 60 L50 60 Q30 0 20 -150 Z"
                      fill="#72d8eb"
                      opacity="0.75"
                    />
                    <ellipse
                      cy="60"
                      rx={bucket.splashRadius}
                      ry={bucket.splashRadius * 0.35}
                      fill="#baf0fa"
                      opacity="0.7"
                    />
                  </g>
                )}
                <text
                  y="90"
                  textAnchor="middle"
                  fontSize="28"
                  fill="#3b4b52"
                  fontWeight="bold"
                >
                  DUMP BUCKET FORTRESS
                </text>
              </g>
            );
          })()}

          <g transform="translate(2400 520)">
            <rect
              x="-80"
              y="-120"
              width="160"
              height="120"
              rx="8"
              fill="#ffeec9"
              stroke="#9e724a"
              strokeWidth="4"
            />
            <path d="M-100 -120 L0 -180 L100 -120 Z" fill="#52a882" />
            <text y="-50" textAnchor="middle" fontSize="20" fill="#5a452d">
              CABANA
            </text>
          </g>

          {[160, 520, 1420, 2250, 2680].map((x, i) => (
            <PalmTree key={x} x={x} y={530} scale={i % 2 === 0 ? 0.9 : 1.1} />
          ))}

          <text
            x="80"
            y="550"
            textAnchor="middle"
            fill="#54412c"
            fontSize="26"
            fontWeight="bold"
          >
            ← DOWNTOWN
          </text>
          <text
            x="2720"
            y="550"
            textAnchor="middle"
            fill="#54412c"
            fontSize="26"
            fontWeight="bold"
          >
            LAZY RIVER →
          </text>
        </>
      ) : isSplashRiver ? (
        <>
          <g>
            <path
              d="M100 360 C 100 150, 2700 150, 2700 360 C 2700 570, 100 570, 100 360 Z"
              fill="none"
              stroke="#3caebd"
              strokeWidth="90"
              opacity="0.85"
            />
            <path
              d="M100 360 C 100 150, 2700 150, 2700 360 C 2700 570, 100 570, 100 360 Z"
              fill="none"
              stroke="#96e7f2"
              strokeWidth="10"
              strokeDasharray="40 60"
              opacity="0.6"
            />
            {[0, 0.2, 0.4, 0.6, 0.8].map((offset, i) => {
              const drift = calculateRiverDrift((seconds / 25 + offset) % 1);
              const colors = [
                "#ff6053",
                "#ffba3b",
                "#4cdb83",
                "#bb5fe6",
                "#3bb8ff",
              ];
              return (
                <InnerTube
                  key={i}
                  x={drift.x}
                  y={drift.y}
                  angle={drift.angle}
                  color={colors[i]}
                  scale={0.9}
                />
              );
            })}
          </g>

          <path d="M0 540 H2800" stroke="#875d36" strokeWidth="8" />
          {Array.from({ length: 29 }, (_, i) => (
            <line
              key={i}
              x1={i * 100}
              y1={540}
              x2={i * 100}
              y2={565}
              stroke="#875d36"
              strokeWidth="6"
            />
          ))}

          <g transform="translate(1400 520)">
            <rect
              x="-100"
              y="-120"
              width="200"
              height="120"
              rx="10"
              fill="#fcf0d4"
              stroke="#9e724a"
              strokeWidth="5"
            />
            <path d="M-115 -120 L0 -175 L115 -120 Z" fill="#e66847" />
            <text
              y="-55"
              textAnchor="middle"
              fontSize="22"
              fill="#543c25"
              fontWeight="bold"
            >
              TUBE RENTALS
            </text>
            <InnerTube
              x={-60}
              y={-10}
              angle={-15}
              color="#ffba3b"
              scale={0.7}
            />
            <InnerTube x={60} y={-10} angle={15} color="#4cdb83" scale={0.7} />
          </g>

          {[200, 750, 1950, 2550].map((x, i) => (
            <PalmTree key={x} x={x} y={535} scale={i % 2 === 0 ? 0.95 : 1.15} />
          ))}

          <text
            x="80"
            y="550"
            textAnchor="middle"
            fill="#54412c"
            fontSize="26"
            fontWeight="bold"
          >
            ← SPLASH OASIS
          </text>
        </>
      ) : downtown ? (
        <>
          <g transform="translate(160 525)">
            <rect
              x="-110"
              y="-345"
              width="270"
              height="345"
              rx="20"
              fill="#eec38b"
              stroke="#986849"
              strokeWidth="6"
            />
            <path d="M-145-330L25-415L190-330" fill="#8c725c" />
            <rect
              x="-55"
              y="-200"
              width="160"
              height="160"
              rx="15"
              fill="#527360"
            />
            <path d="M-105-220H155L175-140H-125Z" fill="#7ba889" />
            <text
              x="25"
              y="-250"
              textAnchor="middle"
              fontSize="37"
              fill="#4b5137"
            >
              LE SHOP
            </text>
          </g>
          <g transform="translate(2290 530)">
            <rect
              x="-170"
              y="-330"
              width="300"
              height="330"
              rx="22"
              fill="#f4dba5"
              stroke="#a2744f"
              strokeWidth="6"
            />
            <path d="M-210-310L-20-420L180-310" fill="#c17b55" />
            <path d="M-160-215H120L160-135H-200Z" fill="#729b6d" />
            <rect
              x="-100"
              y="-125"
              width="155"
              height="125"
              rx="15"
              fill="#48695d"
            />
            <text
              x="-20"
              y="-250"
              textAnchor="middle"
              fontSize="31"
              fill="#594c34"
            >
              CANOPY CAFÉ
            </text>
          </g>
          <g transform="translate(1200 515)">
            <ellipse cy="32" rx="185" ry="42" fill="#a77d57" />
            <ellipse
              rx="170"
              ry="36"
              fill="#8bd0ce"
              stroke="#efdbb8"
              strokeWidth="16"
            />
            <path d="M-15 0L-30-110H30L15 0" fill="#efd7b0" />
            <ellipse
              cy="-110"
              rx="85"
              ry="18"
              fill="#acdad3"
              stroke="#efd7b0"
              strokeWidth="10"
            />
            <path
              d="M0-115Q-60-220-30-250M0-115Q60-220 30-250"
              stroke="#bdece3"
              fill="none"
              strokeWidth="9"
            />
            <circle cy="-200" r="32" fill="#e4bf81" />
            <circle cy="-203" r="19" fill="#f5d9a4" />
            <text y="100" textAnchor="middle" fontSize="30" fill="#674e38">
              DOWNTOWN PLAZA
            </text>
          </g>
          <PenthouseElevator x={510} y={540} />
          <Tent x={680} y={540} color="#758c98" name="CLUB PULSE" />
          <Tent x={1780} y={540} color="#bd764f" name="WONDER PARK" />
          <PhoneBoothEntrance x={1960} y={540} />
          {[380, 950, 1510, 2080].map((x, i) => (
            <Tree key={x} x={x} y={530} scale={i % 2 ? 0.8 : 1} />
          ))}
          {[330, 1450, 2140].map((x) => (
            <g key={x} transform={`translate(${x} 530)`}>
              <path d="M0 0V-230M-28-230H28" stroke="#5b6755" strokeWidth="9" />
              <rect
                x="-21"
                y="-274"
                width="42"
                height="45"
                rx="12"
                fill="#ffe3a2"
                stroke="#5b6755"
                strokeWidth="6"
              />
            </g>
          ))}
        </>
      ) : club ? (
        <>
          <rect x="0" y="50" width="1920" height="340" fill="#354959" />
          <path d="M0 165H1920M0 280H1920" stroke="#798174" strokeWidth="8" />
          {[160, 460, 1460, 1760].map((x) => (
            <g key={x}>
              <rect
                x={x - 70}
                y="80"
                width="140"
                height="250"
                rx="65"
                fill="#83a29c"
                opacity=".23"
              />
              <path
                d={`M${x - 80} 100L${x - 190} 430H${x + 180}L${x + 80} 100Z`}
                fill="#e0ca88"
                opacity=".08"
              />
            </g>
          ))}
          <g transform="translate(960 350)">
            <rect
              x="-370"
              y="-160"
              width="740"
              height="170"
              rx="28"
              fill="#9ab0a2"
              stroke="#d9d6ac"
              strokeWidth="8"
            />
            <rect
              x="-280"
              y="-135"
              width="560"
              height="115"
              rx="15"
              fill="#314e55"
            />
            <text y="-61" textAnchor="middle" fontSize="64" fill="#f6d992">
              CLUB PULSE
            </text>
            <rect
              x="-235"
              y="10"
              width="470"
              height="65"
              rx="13"
              fill="#c29467"
            />
            <circle cx="-120" cy="40" r="21" fill="#455c60" />
            <circle cx="120" cy="40" r="21" fill="#455c60" />
            <path d="M-60 35H60M-40 45H40" stroke="#f7d797" strokeWidth="5" />
          </g>
          {[250, 1670].map((x) => (
            <g key={x} transform={`translate(${x} 405)`}>
              <rect
                x="-65"
                y="-190"
                width="130"
                height="190"
                rx="15"
                fill="#2e424d"
                stroke="#a09c7b"
                strokeWidth="6"
              />
              <circle
                cy="-125"
                r="37"
                fill="#5c7379"
                stroke="#8ea2a3"
                strokeWidth="6"
              />
              <circle
                cy="-50"
                r="37"
                fill="#5c7379"
                stroke="#8ea2a3"
                strokeWidth="6"
              />
            </g>
          ))}
          <g fill="#d6bc89">
            <circle cx="420" cy="360" r="12" />
            <circle cx="1490" cy="360" r="12" />
          </g>
          <path
            d="M0 400H270M1650 400H1920"
            stroke="#be9b76"
            strokeWidth="25"
          />
          <text
            x="125"
            y="545"
            textAnchor="middle"
            fill="#efe0bd"
            fontSize="28"
          >
            PLAZA ←
          </text>
        </>
      ) : midway ? (
        <>
          <path
            d="M0 100Q1400 350 2800 100"
            stroke="#735e48"
            strokeWidth="4"
            fill="none"
          />
          {Array.from({ length: 23 }, (_, i) => (
            <g
              key={i}
              transform={`translate(${i * 125} ${100 + Math.sin((i / 22) * Math.PI) * 120})`}
            >
              <path d="M0 0L22 42L44 0" fill={i % 2 ? "#e9a53e" : "#c57567"} />
            </g>
          ))}
          <g transform="translate(700 465)">
            <ellipse cy="65" rx="260" ry="50" fill="#b59473" />
            <ellipse
              cy="48"
              rx="250"
              ry="45"
              fill="#f1d29b"
              stroke="#ad7653"
              strokeWidth="8"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <g
                key={i}
                transform={`translate(${Math.cos(seconds * 0.28 + i * 1.256) * 185} ${Math.sin(seconds * 0.28 + i * 1.256) * 28})`}
              >
                <ellipse
                  cy="-15"
                  rx="56"
                  ry="17"
                  fill="#fff4ce"
                  stroke="#a97b53"
                  strokeWidth="5"
                />
                <path
                  d="M-55-15Q-55 65 0 55Q55 65 55-15"
                  fill={i % 2 ? "#da9b49" : "#b77e69"}
                />
                <path
                  d="M55 0Q90-5 78 25Q72 40 55 25"
                  fill="none"
                  stroke="#ffe6b8"
                  strokeWidth="8"
                />
              </g>
            ))}
            <text y="125" textAnchor="middle" fill="#65492d" fontSize="29">
              MANGO TEACUPS
            </text>
          </g>
          <g transform="translate(1500 475)">
            <ellipse cy="60" rx="245" ry="42" fill="#bd8c61" />
            <ellipse cy="45" rx="235" ry="38" fill="#eed59d" />
            <path d="M-260-230L0-385L260-230Z" fill="#b98062" />
            <path d="M-140-230L0-385L140-230" fill="#efd593" />
            <rect
              x="-265"
              y="-235"
              width="530"
              height="42"
              rx="12"
              fill="#e2ba77"
            />
            {[-180, -90, 0, 90, 180].map((x, i) => (
              <g
                key={x}
                transform={`translate(${x} ${Math.sin(seconds * 1.4 + i) * 12})`}
              >
                <path d="M0-195V30" stroke="#c5a25e" strokeWidth="10" />
                <path
                  d="M-32-65Q-75-135-35-135Q0-130 15-100L45-105L32-60Z"
                  fill="#fff0cb"
                  stroke="#a4754c"
                  strokeWidth="5"
                />
              </g>
            ))}
            <text y="123" textAnchor="middle" fill="#65492d" fontSize="29">
              GOLDEN CAROUSEL
            </text>
          </g>
          <Tent x={2200} y={555} color="#91a476" name="FRUIT CATCH" />
          <Tent x={420} y={490} color="#c48761" name="HONEY & MANGO" />
          {[100, 1100, 2500].map((x) => (
            <Tree key={x} x={x} y={550} scale={0.7} />
          ))}
        </>
      ) : (
        <>
          <g transform="translate(60 90) scale(.55)">
            <path
              d={COASTER_LINE}
              fill="none"
              stroke="#82714c"
              strokeWidth="16"
            />
            <path
              d={COASTER_LINE}
              fill="none"
              stroke="#e6c581"
              strokeWidth="6"
            />
            {[320, 650, 980, 1260, 1500, 1740, 2100, 2440].map((x) => (
              <path
                key={x}
                d={`M${x} 650V260`}
                stroke="#866b47"
                strokeWidth="8"
                opacity=".55"
              />
            ))}
            <g
              transform={`translate(${cart.x} ${cart.y}) rotate(${cart.angle})`}
            >
              <rect
                x="-45"
                y="-38"
                width="90"
                height="35"
                rx="10"
                fill="#d27c55"
                stroke="#573e2c"
                strokeWidth="6"
              />
              <circle cx="-25" cy="0" r="9" fill="#4b5144" />
              <circle cx="25" cy="0" r="9" fill="#4b5144" />
            </g>
          </g>
          <g transform="translate(1700 310)">
            <path
              d="M-130 235L0 0L130 235"
              fill="none"
              stroke="#a8744e"
              strokeWidth="20"
            />
            <circle
              r="215"
              fill="#dce5bd"
              fillOpacity=".2"
              stroke="#eaca87"
              strokeWidth="16"
            />
            {Array.from({ length: 12 }, (_, i) => {
              const p = computeFerrisWheelCabin(seconds * 5 + i * 30, 215, {
                x: 0,
                y: 0,
              });
              return (
                <g key={i}>
                  <path
                    d={`M0 0L${p.x} ${p.y}`}
                    stroke="#b69b65"
                    strokeWidth="5"
                  />
                  <g transform={`translate(${p.x} ${p.y})`}>
                    <rect
                      x="-27"
                      y="-12"
                      width="54"
                      height="55"
                      rx="12"
                      fill={i % 2 ? "#c77d59" : "#82a287"}
                      stroke="#fff0c3"
                      strokeWidth="5"
                    />
                    <path d="M-18 5H18" stroke="#fff0c3" strokeWidth="17" />
                  </g>
                </g>
              );
            })}
            <circle r="28" fill="#ebca81" />
          </g>
          <g transform="translate(2350 455)">
            <path
              d="M-160-240H-70L35-20H190"
              fill="none"
              stroke="#977b51"
              strokeWidth="48"
            />
            <path
              d="M-160-240H-70L35-20H190"
              fill="none"
              stroke="#9ccdc4"
              strokeWidth="30"
            />
            <ellipse cx="125" cy="55" rx="175" ry="40" fill="#76bcb4" />
            <path
              d="M35 40Q95-20 125 30Q170-10 190 50"
              fill="none"
              stroke="#e0f0db"
              strokeWidth="9"
            />
            <rect
              x={10 + Math.sin(seconds) * 15}
              y="-8"
              width="60"
              height="25"
              rx="8"
              fill="#b78355"
            />
            <text
              x="80"
              y="128"
              textAnchor="middle"
              fill="#674e38"
              fontSize="29"
            >
              SUNSHINE FLUME
            </text>
          </g>
          <Tent x={900} y={555} color="#bd7a52" name="SAVANNA SCREAMER" />
          <g transform="translate(1400 555)">
            <rect
              x="-70"
              y="-100"
              width="140"
              height="110"
              rx="12"
              fill="#f2deb5"
              stroke="#977751"
              strokeWidth="6"
            />
            <path d="M-70-110L0-155L70-110" fill="#75997a" />
            <path
              d="M-35-70L10-45L-20-20L35-5"
              fill="none"
              stroke="#91b294"
              strokeWidth="7"
            />
          </g>
          {[220, 1950, 2600].map((x) => (
            <Tree key={x} x={x} y={550} scale={0.7} />
          ))}
          <path
            d="M300 60Q1300 155 2700 60"
            stroke="#806549"
            fill="none"
            strokeWidth="4"
          />
          {Array.from({ length: 20 }, (_, i) => (
            <path
              key={i}
              d={`M${300 + i * 120} ${60 + Math.sin((i / 19) * Math.PI) * 48}l30 50 30-50`}
              fill={i % 2 ? "#d29454" : "#91ac7a"}
            />
          ))}
        </>
      )}
      {!club && !isCondo && !isScoutBase && !isMtMist && (
        <>
          <path d={`M0 690H${width}`} stroke="#d3ae7c" strokeWidth="4" />
          {Array.from({ length: Math.floor(width / 170) }, (_, i) => (
            <g key={i} transform={`translate(${i * 170 + 30} 685)`}>
              <ellipse rx="25" ry="7" fill="#9c9a67" opacity=".4" />
              <path
                d="M0 0L-10-15M0 0L15-22"
                stroke="#91a46c"
                strokeWidth="5"
              />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}
