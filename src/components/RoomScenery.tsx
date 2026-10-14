import { useEffect, useId, useState } from "react";
import type { PlaceId } from "../game.ts";
import {
  calculateWaveOffset,
  calculateBucketCycle,
  calculateRiverDrift,
} from "../utils/waterparkPhysics.ts";
import { DowntownPlazaScenery } from "./DowntownPlazaScenery.tsx";
import { ClubPulseScenery } from "./ClubPulseScenery.tsx";
import { WonderParkEntranceScenery } from "./WonderParkEntranceScenery.tsx";
import { WonderParkMidwayScenery } from "./WonderParkMidwayScenery.tsx";
import { SunsetBeachScenery } from "./SunsetBeachScenery.tsx";
import { CoastalPierScenery } from "./CoastalPierScenery.tsx";
import { MtMistScenery } from "./MtMistScenery.tsx";

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
  if (place === "sunset-beach") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <SunsetBeachScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "coastal-pier") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <CoastalPierScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "mt-mist") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <MtMistScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "downtown-plaza") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <DowntownPlazaScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "club-pulse") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 1920 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <ClubPulseScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "wonder-park-entrance") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2800 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <WonderParkEntranceScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "wonder-park-midway") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2800 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <WonderParkMidwayScenery seconds={seconds} />
      </svg>
    );
  }
  const club = false;
  const isSplashEntry = place === "splash-oasis-entry";
  const isSplashRiver = place === "splash-oasis-river";
  const isCondo = place === "penthouse-condo";
  const isScoutBase = place === "secret-scout-base";
  const isCanyonRapids = place === "canyon-rapids";
  const isPetParadise = place === "pet-paradise";
  const width =
    isCondo || isScoutBase
      ? 1920
      : isCanyonRapids || isPetParadise
        ? 2400
        : 2800;
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
      {!club && !isCondo && !isScoutBase && (
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
      {isCondo ? (
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
      ) : null}
      {!club && !isCondo && !isScoutBase && (
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
