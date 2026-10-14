import React from "react";
import { RideQueueGate } from "./RideQueueGate";
import {
  computeCoasterTrackPosition,
  computeFerrisWheelCabin,
} from "../utils/kineticRides.ts";

const COASTER_LINE = Array.from({ length: 260 }, (_, i) => {
  const p = computeCoasterTrackPosition(i / 259);
  return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
}).join(" ");

// Chase bulbs light for one 0.25s slot in three, like the old
// floor(seconds * 4) % 3 chase. The lit cap steps between the bulb and two
// spots 3000px and 6000px off the scene; a cap that starts unlit is drawn
// 6000px left so it steps onto the bulb in its own slot.
function ChaseCap({ i, children }: { i: number; children: React.ReactNode }) {
  const slot = (3 - (i % 3)) % 3;
  return (
    <g
      className="sm-drift"
      style={{
        "--sm-dur": "0.75s",
        "--sm-dist": "6000px",
        "--sm-delay": `${slot === 0 ? 0 : -(2 - slot) * 0.25}s`,
        animationTimingFunction: "steps(3, jump-none)",
      }}
    >
      <g transform={slot === 0 ? undefined : "translate(-6000 0)"}>
        {children}
      </g>
    </g>
  );
}

// Phase offsets turn the old Math.sin(seconds * k + phase) curves into CSS
// animation delays: delay = -(phase + PI/2) / k lines the cycles back up.
const WonderParkBelowTrain = React.memo(function WonderParkBelowTrain() {
  return (
    <>
      <defs>
        {/* Sky Sunset & Carnival Atmosphere Gradients */}
        <linearGradient id="wp-sky-sunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#403866" />
          <stop offset="25%" stopColor="#76527e" />
          <stop offset="50%" stopColor="#c56c71" />
          <stop offset="75%" stopColor="#f59e6c" />
          <stop offset="100%" stopColor="#fed289" />
        </linearGradient>

        <linearGradient id="wp-ground-brick" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c2774d" />
          <stop offset="35%" stopColor="#d9895c" />
          <stop offset="70%" stopColor="#c77b50" />
          <stop offset="100%" stopColor="#a35f39" />
        </linearGradient>

        <linearGradient id="wp-coaster-rail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>

        <linearGradient id="wp-water-flume" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <radialGradient id="wp-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        {/* Herringbone Brick Promenade Pattern */}
        <pattern
          id="wp-brick-pattern"
          width="60"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 H60 V15 H0 Z M30 15 H90 V30 H30 Z"
            fill="none"
            stroke="#854d2e"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        </pattern>
      </defs>

      {/* ========================================================= */}
      {/* 1. SKY & DISTANT SAVANNA HORIZON                          */}
      {/* ========================================================= */}
      <rect width="2800" height="720" fill="url(#wp-sky-sunset)" />

      {/* Golden Sunset Sun */}
      <circle cx="2100" cy="180" r="75" fill="#fef08a" opacity="0.85" />
      <circle cx="2100" cy="180" r="130" fill="#fed7aa" opacity="0.3" />

      {/* Distant Mountain Ridges */}
      <path
        d="M0 380 Q350 260 700 350 Q1150 240 1600 360 Q2100 250 2500 340 Q2650 310 2800 370 V540 H0 Z"
        fill="#7c4d68"
        opacity="0.6"
      />
      <path
        d="M0 430 Q450 330 950 420 Q1450 320 1950 410 Q2400 330 2800 420 V540 H0 Z"
        fill="#9d5c58"
        opacity="0.8"
      />

      {/* Distant Hot Air Balloons */}
      {/* Balloons creep right (2800px wrap, like the old seconds % 2800) and bob. */}
      <g
        className="sm-drift"
        style={{ "--sm-dur": "1400s", "--sm-dist": "2800px" }}
      >
        <g
          className="sm-bob"
          style={{
            "--sm-dur": `${Math.PI / 0.8}s`,
            "--sm-delay": `${-Math.PI / 2 / 0.8}s`,
            "--sm-amp": "8px",
          }}
        >
          <g transform="translate(480 110) scale(0.65)">
            <ellipse
              cx="0"
              cy="0"
              rx="26"
              ry="34"
              fill="#ef4444"
              stroke="#7f1d1d"
              strokeWidth="2"
            />
            <path d="M-26 0 Q0 15 26 0 Q0 -15 -26 0" fill="#facc15" />
            <polygon
              points="-12,30 12,30 6,42 -6,42"
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="1"
            />
            <line
              x1="-10"
              y1="30"
              x2="-6"
              y2="42"
              stroke="#451a03"
              strokeWidth="1"
            />
            <line
              x1="10"
              y1="30"
              x2="6"
              y2="42"
              stroke="#451a03"
              strokeWidth="1"
            />
          </g>
        </g>
      </g>
      <g
        className="sm-drift"
        style={{ "--sm-dur": `${2800 / 1.5}s`, "--sm-dist": "2800px" }}
      >
        <g
          className="sm-bob"
          style={{
            "--sm-dur": `${Math.PI / 0.7}s`,
            "--sm-delay": `${-(2 + Math.PI / 2) / 0.7}s`,
            "--sm-amp": "6px",
          }}
        >
          <g transform="translate(1350 90) scale(0.5)">
            <ellipse
              cx="0"
              cy="0"
              rx="24"
              ry="32"
              fill="#06b6d4"
              stroke="#0e7490"
              strokeWidth="2"
            />
            <path d="M-24 0 Q0 12 24 0 Q0 -12 -24 0" fill="#f43f5e" />
            <polygon points="-10,28 10,28 5,38 -5,38" fill="#78350f" />
          </g>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 2. FESTIVE CARNIVAL PENNANTS & STRING BULBS               */}
      {/* ========================================================= */}
      {/* Pennant Swag 1 */}
      <path
        d="M50 70 Q700 190 1350 80"
        fill="none"
        stroke="#523d29"
        strokeWidth="3"
      />
      {Array.from({ length: 18 }, (_, i) => {
        const t = (i + 1) / 19;
        const x = 50 + t * 1300;
        const y = 70 + Math.sin(t * Math.PI) * 110;
        const colors = [
          "#ef4444",
          "#f59e0b",
          "#10b981",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
        ];
        return (
          <polygon
            key={`pennant-1-${i}`}
            points={`${x - 14},${y} ${x + 14},${y} ${x},${y + 36}`}
            fill={colors[i % colors.length]}
            stroke="#451a03"
            strokeWidth="1"
          />
        );
      })}

      {/* Pennant Swag 2 */}
      <path
        d="M1400 80 Q2100 200 2750 90"
        fill="none"
        stroke="#523d29"
        strokeWidth="3"
      />
      {Array.from({ length: 18 }, (_, i) => {
        const t = (i + 1) / 19;
        const x = 1400 + t * 1350;
        const y = 80 + Math.sin(t * Math.PI) * 110;
        const colors = [
          "#ec4899",
          "#8b5cf6",
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ];
        return (
          <polygon
            key={`pennant-2-${i}`}
            points={`${x - 14},${y} ${x + 14},${y} ${x},${y + 36}`}
            fill={colors[i % colors.length]}
            stroke="#451a03"
            strokeWidth="1"
          />
        );
      })}

      {/* Glowing Warm Incandescent Bulbs strung along catenary lines */}
      {Array.from({ length: 36 }, (_, i) => {
        const x = 80 + i * 75;
        const y = 65 + Math.sin((i / 35) * Math.PI) * 35;
        return (
          <g key={`bulb-${i}`} transform={`translate(${x} ${y})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="#1c1917"
              strokeWidth="2"
            />
            <circle cx="0" cy="12" r="5" fill="#ca8a04" />
            <ChaseCap i={i}>
              <circle cx="0" cy="12" r="7" fill="#fef08a" />
              <circle
                cx="0"
                cy="12"
                r="16"
                fill="url(#wp-lamp-glow)"
                opacity="0.6"
              />
            </ChaseCap>
          </g>
        );
      })}

      {/* ========================================================= */}
      {/* 3. SAVANNA SCREAMER ROLLER COASTER TRESTLES & TRACK       */}
      {/* ========================================================= */}
      {/* Heavy Timber Support Trestles */}
      {[280, 480, 680, 880, 1080, 1260, 1420].map((tx) => (
        <g key={`trestle-${tx}`}>
          {/* Main vertical posts */}
          <line
            x1={tx - 24}
            y1={540}
            x2={tx - 12}
            y2={180}
            stroke="#78350f"
            strokeWidth="9"
          />
          <line
            x1={tx + 24}
            y1={540}
            x2={tx + 12}
            y2={180}
            stroke="#78350f"
            strokeWidth="9"
          />
          {/* Cross braces */}
          <line
            x1={tx - 24}
            y1={500}
            x2={tx + 24}
            y2={420}
            stroke="#92400e"
            strokeWidth="4"
          />
          <line
            x1={tx + 24}
            y1={500}
            x2={tx - 24}
            y2={420}
            stroke="#92400e"
            strokeWidth="4"
          />
          <line
            x1={tx - 20}
            y1={420}
            x2={tx + 20}
            y2={340}
            stroke="#92400e"
            strokeWidth="4"
          />
          <line
            x1={tx + 20}
            y1={420}
            x2={tx - 20}
            y2={340}
            stroke="#92400e"
            strokeWidth="4"
          />
          <line
            x1={tx - 16}
            y1={340}
            x2={tx + 16}
            y2={260}
            stroke="#92400e"
            strokeWidth="4"
          />
          <line
            x1={tx + 16}
            y1={340}
            x2={tx - 16}
            y2={260}
            stroke="#92400e"
            strokeWidth="4"
          />
          {/* Horizontal crossbeams */}
          <line
            x1={tx - 25}
            y1={500}
            x2={tx + 25}
            y2={500}
            stroke="#b45309"
            strokeWidth="6"
          />
          <line
            x1={tx - 22}
            y1={420}
            x2={tx + 22}
            y2={420}
            stroke="#b45309"
            strokeWidth="5"
          />
          <line
            x1={tx - 18}
            y1={340}
            x2={tx + 18}
            y2={340}
            stroke="#b45309"
            strokeWidth="5"
          />
          <line
            x1={tx - 14}
            y1={260}
            x2={tx + 14}
            y2={260}
            stroke="#b45309"
            strokeWidth="5"
          />
        </g>
      ))}

      {/* Coaster Vertical Loop Support Structure (Center x=1260, y=540) */}
      <g transform="translate(1260 540)">
        <ellipse
          cx="0"
          cy="-110"
          rx="130"
          ry="130"
          fill="none"
          stroke="#78350f"
          strokeWidth="12"
        />
        <ellipse
          cx="0"
          cy="-110"
          rx="90"
          ry="90"
          fill="none"
          stroke="#92400e"
          strokeWidth="8"
        />
        {/* Loop radial structural spokes */}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`loop-spoke-${i}`}
            x1="0"
            y1="-110"
            x2={Math.cos((i * Math.PI) / 4) * 110}
            y2={-110 + Math.sin((i * Math.PI) / 4) * 110}
            stroke="#b45309"
            strokeWidth="4"
          />
        ))}
      </g>

      {/* Main Coaster Steel Spine & Ties */}
      <path
        d={COASTER_LINE}
        fill="none"
        stroke="#78350f"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d={COASTER_LINE}
        fill="none"
        stroke="#92400e"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d={COASTER_LINE}
        fill="none"
        stroke="#fef08a"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.9"
      />
    </>
  );
});

const WonderParkAboveTrain = React.memo(function WonderParkAboveTrain() {
  return (
    <>
      {/* ========================================================= */}
      {/* 4. SAVANNA SCREAMER STATION PAVILION (x=900, y=555)       */}
      {/* ========================================================= */}
      <g transform="translate(900 550)">
        {/* Timber Foundation & Stone Pilings */}
        <rect
          x="-190"
          y="-12"
          width="380"
          height="24"
          rx="6"
          fill="#451a03"
          stroke="#290d02"
          strokeWidth="3"
        />

        {/* Victorian Station Facade */}
        <rect
          x="-175"
          y="-195"
          width="350"
          height="185"
          rx="18"
          fill="#fef3c7"
          stroke="#b45309"
          strokeWidth="6"
        />

        {/* Ornate Cedar Lap Siding Panels */}
        <rect
          x="-160"
          y="-140"
          width="320"
          height="120"
          rx="8"
          fill="#d97706"
          opacity="0.15"
        />

        {/* Arched Ticket Gates & Turnstiles */}
        {[-95, 0, 95].map((gx) => (
          <g key={`gate-${gx}`} transform={`translate(${gx} -40)`}>
            <rect
              x="-35"
              y="-55"
              width="70"
              height="85"
              rx="14"
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="3"
            />
            <path
              d="M-30 -15 H30 M-30 0 H30 M-30 15 H30"
              stroke="#fcd34d"
              strokeWidth="2"
            />
            <text
              y="-25"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#fef08a"
            >
              GATE
            </text>
          </g>
        ))}

        {/* Victorian Gabled Cedar Roof with Verdigris Finial */}
        <polygon
          points="-210,-190 0,-280 210,-190"
          fill="#b91c1c"
          stroke="#7f1d1d"
          strokeWidth="5"
        />
        <polygon points="-180,-190 0,-270 180,-190" fill="#dc2626" />
        <polygon points="-140,-190 0,-255 140,-190" fill="#f59e0b" />
        {/* Brass Roof Cresting & Weather Vane */}
        <line
          x1="0"
          y1="-280"
          x2="0"
          y2="-320"
          stroke="#f59e0b"
          strokeWidth="5"
        />
        <polygon
          points="0,-320 18,-312 0,-304"
          fill="#fbbf24"
          stroke="#b45309"
          strokeWidth="2"
        />

        {/* Glowing Illuminated Marquee Sign: "SAVANNA SCREAMER" */}
        <g transform="translate(0 -205)">
          <rect
            x="-165"
            y="-28"
            width="330"
            height="56"
            rx="16"
            fill="#1e1b4b"
            stroke="#f59e0b"
            strokeWidth="5"
          />
          {/* Marquee Chase Bulbs around perimeter */}
          {Array.from({ length: 18 }, (_, i) => {
            const bx = -150 + i * 17.6;
            return (
              <g key={`mq-top-${i}`}>
                <circle cx={bx} cy="-21" r="3.5" fill="#ca8a04" />
                <ChaseCap i={i}>
                  <circle cx={bx} cy="-21" r="3.5" fill="#fef08a" />
                </ChaseCap>
              </g>
            );
          })}
          {Array.from({ length: 18 }, (_, i) => {
            const bx = -150 + i * 17.6;
            return (
              <g key={`mq-bot-${i}`}>
                <circle cx={bx} cy="21" r="3.5" fill="#ca8a04" />
                <ChaseCap i={i}>
                  <circle cx={bx} cy="21" r="3.5" fill="#fef08a" />
                </ChaseCap>
              </g>
            );
          })}
          {/* Signboard Text */}
          <text
            y="7"
            textAnchor="middle"
            fontSize="21"
            fontWeight="900"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            letterSpacing="3"
            fill="#fef08a"
          >
            SAVANNA SCREAMER
          </text>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 5. GIANT SOLAR LION FERRIS WHEEL (x=1700, y=360)          */}
      {/* ========================================================= */}
      <g transform="translate(1700 360)">
        {/* Massive Dual A-Frame Structural Lattice Legs */}
        <polygon
          points="-160,200 -120,200 -20,-10 20,-10 120,200 160,200 0,-30"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="4"
        />
        <polygon
          points="-140,200 -105,200 -15,0 15,0 105,200 140,200 0,-15"
          fill="#b45309"
        />
        {/* Concrete Foundation Footings */}
        <rect
          x="-180"
          y="180"
          width="70"
          height="25"
          rx="6"
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="3"
        />
        <rect
          x="110"
          y="180"
          width="70"
          height="25"
          rx="6"
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="3"
        />

        {/* Outer Wheel Rim (R=215) with Jewel Bulbs */}
        <circle
          cx="0"
          cy="0"
          r="215"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="16"
        />
        <circle
          cx="0"
          cy="0"
          r="215"
          fill="none"
          stroke="#fef08a"
          strokeWidth="6"
        />
        <circle
          cx="0"
          cy="0"
          r="175"
          fill="none"
          stroke="#d97706"
          strokeWidth="8"
        />

        {/* 12 Filigree Radial Spokes & Rotating Gondolas: the wheel turns
            anticlockwise at 5deg/s and each cabin counter-spins to hang level. */}
        <g
          className="sm-spin"
          style={{ "--sm-dur": "72s", animationDirection: "reverse" }}
        >
          {/* Invisible ring centres the spin box on the hub. */}
          <circle r="300" fill="none" />
          {Array.from({ length: 12 }, (_, i) => {
            const deg = i * 30;
            const p = computeFerrisWheelCabin(deg, 215, { x: 0, y: 0 });
            const rad = (deg * Math.PI) / 180;
            const colors = [
              "#ef4444",
              "#3b82f6",
              "#10b981",
              "#f59e0b",
              "#ec4899",
              "#8b5cf6",
            ];
            const gondolaColor = colors[i % colors.length];

            return (
              <g key={`ferris-spoke-${i}`}>
                {/* Filigree Spoke Truss */}
                <line
                  x1="0"
                  y1="0"
                  x2={p.x}
                  y2={p.y}
                  stroke="#d97706"
                  strokeWidth="5"
                />
                <line
                  x1="0"
                  y1="0"
                  x2={Math.cos(rad) * 175}
                  y2={-Math.sin(rad) * 175}
                  stroke="#fef08a"
                  strokeWidth="2.5"
                />

                {/* Self-Righting Gondola Cabin (Always stays upright!) */}
                <g transform={`translate(${p.x} ${p.y})`}>
                  <g className="sm-spin" style={{ "--sm-dur": "72s" }}>
                    {/* Invisible ring centres the counter-spin on the hanger. */}
                    <circle r="60" fill="none" />
                    {/* Brass Suspension Arm */}
                    <line
                      x1="0"
                      y1="-14"
                      x2="0"
                      y2="0"
                      stroke="#f59e0b"
                      strokeWidth="4"
                    />
                    {/* Curved Victorian Gondola Canopy */}
                    <path
                      d="M-28 -4 Q0 -22 28 -4 Z"
                      fill={gondolaColor}
                      stroke="#451a03"
                      strokeWidth="2.5"
                    />
                    {/* Cabin Enclosure & Glass Windows */}
                    <rect
                      x="-26"
                      y="-4"
                      width="52"
                      height="38"
                      rx="8"
                      fill="#fffbeb"
                      stroke="#b45309"
                      strokeWidth="3"
                    />
                    {/* Frosted Arched Windows */}
                    <rect
                      x="-20"
                      y="2"
                      width="16"
                      height="18"
                      rx="4"
                      fill="#38bdf8"
                      opacity="0.6"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <rect
                      x="4"
                      y="2"
                      width="16"
                      height="18"
                      rx="4"
                      fill="#38bdf8"
                      opacity="0.6"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    {/* Decorative Lower Filigree Trim */}
                    <path
                      d="M-26 26 Q0 36 26 26"
                      fill={gondolaColor}
                      stroke="#451a03"
                      strokeWidth="2"
                    />
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* Center Golden Sunburst Lion Medallion */}
        <g transform="translate(0 0)">
          {/* Radiating Sun Rays */}
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={`sunray-${i}`}
              x1="0"
              y1="0"
              x2={Math.cos((i * Math.PI) / 8) * 55}
              y2={Math.sin((i * Math.PI) / 8) * 55}
              stroke="#fbbf24"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ))}
          {/* Golden Center Hub Disk */}
          <circle
            cx="0"
            cy="0"
            r="36"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="4"
          />
          <circle cx="0" cy="0" r="28" fill="#fef08a" />
          {/* Smiling Lion Emblem Silhouette */}
          <ellipse cx="0" cy="2" rx="14" ry="12" fill="#d97706" />
          <circle cx="-5" cy="-2" r="2" fill="#451a03" />
          <circle cx="5" cy="-2" r="2" fill="#451a03" />
          <polygon points="0,3 -3,6 3,6" fill="#b91c1c" />
          <path
            d="M-4 9 Q0 13 4 9"
            fill="none"
            stroke="#451a03"
            strokeWidth="2"
          />
        </g>

        {/* Boarding Platform at base */}
        <g transform="translate(0 180)">
          <rect
            x="-140"
            y="0"
            width="280"
            height="25"
            rx="6"
            fill="#78350f"
            stroke="#451a03"
            strokeWidth="3"
          />
          <text
            y="17"
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            letterSpacing="4"
            fill="#fef08a"
          >
            &bull; GIANT FERRIS WHEEL &bull;
          </text>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 6. PARK MAP KIOSK & TOPIARIES (x=1400, y=555)             */}
      {/* ========================================================= */}
      <g transform="translate(1400 550)">
        {/* Hexagonal Victorian Kiosk Pavilion */}
        <rect
          x="-70"
          y="-120"
          width="140"
          height="120"
          rx="12"
          fill="#fffbeb"
          stroke="#78350f"
          strokeWidth="6"
        />
        {/* Bell-shaped Verdigris Copper Roof */}
        <path
          d="M-85 -120 Q0 -195 85 -120 Z"
          fill="#0d9488"
          stroke="#115e59"
          strokeWidth="4"
        />
        <line
          x1="0"
          y1="-175"
          x2="0"
          y2="-210"
          stroke="#f59e0b"
          strokeWidth="4"
        />
        <circle
          cx="0"
          cy="-210"
          r="6"
          fill="#fbbf24"
          stroke="#b45309"
          strokeWidth="2"
        />

        {/* Illuminated Park Map Blueprint Graphic */}
        <rect
          x="-52"
          y="-105"
          width="104"
          height="75"
          rx="6"
          fill="#0369a1"
          stroke="#38bdf8"
          strokeWidth="2.5"
        />
        <path
          d="M-40 -90 L-10 -70 L20 -95 L40 -60"
          fill="none"
          stroke="#fef08a"
          strokeWidth="3"
          strokeDasharray="4 2"
        />
        <circle
          cx="-10"
          cy="-70"
          r="5"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <circle
          cx="20"
          cy="-95"
          r="5"
          fill="#22c55e"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <text
          y="-40"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#ffffff"
          letterSpacing="1"
        >
          PARK MAP
        </text>

        {/* Counter & Brass Stanchions */}
        <rect
          x="-60"
          y="-20"
          width="120"
          height="20"
          rx="4"
          fill="#92400e"
          stroke="#451a03"
          strokeWidth="2"
        />
      </g>

      {/* Sculpted Floral Lion Topiaries */}
      {[1230, 1570].map((tx) => (
        <g key={`topiary-${tx}`} transform={`translate(${tx} 540)`}>
          {/* Terracotta Decorative Urn */}
          <polygon
            points="-24,0 -16,-34 16,-34 24,0"
            fill="#c2410c"
            stroke="#7c2d12"
            strokeWidth="3"
          />
          <ellipse cx="0" cy="-34" rx="18" ry="6" fill="#451a03" />
          {/* Manicured Boxwood Spheres */}
          <circle
            cx="0"
            cy="-60"
            r="26"
            fill="#15803d"
            stroke="#166534"
            strokeWidth="2"
          />
          <circle
            cx="0"
            cy="-100"
            r="20"
            fill="#16a34a"
            stroke="#15803d"
            strokeWidth="2"
          />
          {/* Cute Topiary Lion Ears */}
          <circle
            cx="-14"
            cy="-114"
            r="7"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="1.5"
          />
          <circle
            cx="14"
            cy="-114"
            r="7"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="1.5"
          />
          {/* Blooming Yellow Marigolds */}
          <circle cx="-6" cy="-60" r="4" fill="#facc15" />
          <circle cx="8" cy="-55" r="4" fill="#f97316" />
          <circle cx="2" cy="-98" r="4" fill="#facc15" />
        </g>
      ))}

      {/* ========================================================= */}
      {/* 7. SUNSHINE FLUME WATER RIDE SPLASHDOWN (x=2350, y=455)   */}
      {/* ========================================================= */}
      <g transform="translate(2350 455)">
        {/* Massive Timber & Canyon Rock Slide */}
        <path
          d="M-190 -260 H-80 L40 -20 H210"
          fill="none"
          stroke="#78350f"
          strokeWidth="54"
          strokeLinecap="round"
        />
        <path
          d="M-190 -260 H-80 L40 -20 H210"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="36"
          strokeLinecap="round"
        />
        <path
          d="M-190 -260 H-80 L40 -20 H210"
          fill="none"
          stroke="#f0f9ff"
          strokeWidth="10"
          strokeDasharray="14 10"
        />

        {/* Crystal Turquoise Splash Pool */}
        <ellipse
          cx="130"
          cy="55"
          rx="190"
          ry="46"
          fill="url(#wp-water-flume)"
          stroke="#bae6fd"
          strokeWidth="5"
        />
        {/* Splash Ripples */}
        <ellipse
          cx="130"
          cy="55"
          rx="140"
          ry="32"
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="3"
          opacity="0.8"
        />
        <ellipse
          className="sm-pulse"
          cx="130"
          cy="55"
          rx="82"
          ry="17.6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          opacity="0.9"
          style={{
            "--sm-dur": `${Math.PI / 4}s`,
            "--sm-delay": `${-Math.PI / 2 / 4}s`,
            "--sm-scale": 98 / 82,
          }}
        />

        {/* Natural Cedar Log Flume Boat Bobbing */}
        <g transform="translate(45 -6)">
          <g
            className="sm-bob"
            style={{
              "--sm-dur": `${Math.PI / 2.5}s`,
              "--sm-delay": `${-Math.PI / 2 / 2.5}s`,
              "--sm-amp": "4px",
            }}
          >
            {/* Turned a quarter so sm-bob's swing runs left and right. */}
            <g transform="rotate(-90)">
              <g
                className="sm-bob"
                style={{
                  "--sm-dur": `${Math.PI / 1.5}s`,
                  "--sm-delay": `${-Math.PI / 2 / 1.5}s`,
                  "--sm-amp": "16px",
                }}
              >
                <g transform="rotate(90)">
                  {/* Carved Log Hollow Hull */}
                  <rect
                    x="-35"
                    y="-12"
                    width="70"
                    height="28"
                    rx="12"
                    fill="#78350f"
                    stroke="#451a03"
                    strokeWidth="3"
                  />
                  <ellipse
                    cx="28"
                    cy="2"
                    rx="7"
                    ry="12"
                    fill="#b45309"
                    stroke="#451a03"
                    strokeWidth="2"
                  />
                  <rect
                    x="-24"
                    y="-8"
                    width="48"
                    height="18"
                    rx="6"
                    fill="#1e293b"
                  />
                  {/* Water Splash Foam at Log Bow */}
                  <path
                    d="M25 8 Q38 2 30 18 Q20 12 25 8"
                    fill="#ffffff"
                    opacity="0.9"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 8. PROMENADE GROUND & EXIT PORTAL GATES                   */}
      {/* ========================================================= */}
      {/* Herringbone Paved Promenade (y: 540 to 720) */}
      <rect y="540" width="2800" height="180" fill="url(#wp-ground-brick)" />
      <rect y="540" width="2800" height="180" fill="url(#wp-brick-pattern)" />
      <path d="M0 540 H2800" stroke="#854d2e" strokeWidth="8" />

      {/* Left Gateway: CARNIVAL MIDWAY (x=0 to 120) */}
      <g transform="translate(60 540)">
        <polygon
          points="-30,0 -30,-120 30,-120 30,0"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="3"
        />
        <path
          d="M-40 -120 Q0 -160 40 -120 Z"
          fill="#b91c1c"
          stroke="#7f1d1d"
          strokeWidth="2"
        />
        <rect
          x="-55"
          y="-145"
          width="110"
          height="32"
          rx="8"
          fill="#1e1b4b"
          stroke="#f59e0b"
          strokeWidth="3"
        />
        <text
          y="-124"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="1"
          fill="#fef08a"
        >
          ← MIDWAY
        </text>
      </g>

      {/* Right Gateway: DOWNTOWN PLAZA (x=2680 to 2800) */}
      <g transform="translate(2740 540)">
        <polygon
          points="-30,0 -30,-120 30,-120 30,0"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="3"
        />
        <path
          d="M-40 -120 Q0 -160 40 -120 Z"
          fill="#b91c1c"
          stroke="#7f1d1d"
          strokeWidth="2"
        />
        <rect
          x="-55"
          y="-145"
          width="110"
          height="32"
          rx="8"
          fill="#1e1b4b"
          stroke="#f59e0b"
          strokeWidth="3"
        />
        <text
          y="-124"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="1"
          fill="#fef08a"
        >
          PLAZA →
        </text>
      </g>

      {/* Victorian Triple-Lantern Lampposts with Ground Amber Glow */}
      {[360, 1140, 1960, 2520].map((lx) => (
        <g key={`lamp-${lx}`} transform={`translate(${lx} 540)`}>
          <ellipse cx="0" cy="5" rx="110" ry="26" fill="url(#wp-lamp-glow)" />
          <ellipse cx="0" cy="2" rx="16" ry="5" fill="#1e293b" />
          <line
            x1="0"
            y1="2"
            x2="0"
            y2="-190"
            stroke="#334155"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M-26 -170 Q0 -185 26 -170"
            fill="none"
            stroke="#0f172a"
            strokeWidth="4"
          />
          {/* Center Lantern */}
          <g transform="translate(0 -200)">
            <circle cx="0" cy="0" r="22" fill="url(#wp-lamp-glow)" />
            <polygon
              points="-8,-12 8,-12 5,10 -5,10"
              fill="#fef08a"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <polygon points="-11,-12 11,-12 0,-20" fill="#1e293b" />
          </g>
          {/* Left Lantern */}
          <g transform="translate(-26 -170)">
            <circle cx="0" cy="0" r="16" fill="url(#wp-lamp-glow)" />
            <polygon
              points="-6,-9 6,-9 4,7 -4,7"
              fill="#fef08a"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            <polygon points="-8,-9 8,-9 0,-15" fill="#1e293b" />
          </g>
          {/* Right Lantern */}
          <g transform="translate(26 -170)">
            <circle cx="0" cy="0" r="16" fill="url(#wp-lamp-glow)" />
            <polygon
              points="-6,-9 6,-9 4,7 -4,7"
              fill="#fef08a"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            <polygon points="-8,-9 8,-9 0,-15" fill="#1e293b" />
          </g>
        </g>
      ))}

      <RideQueueGate x={1560} y={572} icon="ferris" />
      <RideQueueGate x={2440} y={580} icon="flume" />
    </>
  );
});

export function WonderParkEntranceScenery({ seconds }: { seconds: number }) {
  // The coaster train rides a curved track at varying speed, so it stays on
  // seconds; the rest of the park loops in CSS.
  const cart = computeCoasterTrackPosition(seconds / 28);
  const cartAngle = cart.angle ?? 0;

  return (
    <g className="wonder-park-entrance-scenery">
      <WonderParkBelowTrain />
      {/* Kinetic Roller Coaster Train */}
      <g
        transform={`translate(${cart.x} ${cart.y}) rotate(${cartAngle})`}
        style={{ transition: "none" }}
      >
        {/* Front Engine Car */}
        <g transform="translate(0 -16)">
          {/* Wheel Bogie Assemblies */}
          <rect x="-30" y="8" width="60" height="12" rx="4" fill="#1e293b" />
          <circle
            cx="-22"
            cy="14"
            r="7"
            fill="#64748b"
            stroke="#f8fafc"
            strokeWidth="2"
          />
          <circle
            cx="22"
            cy="14"
            r="7"
            fill="#64748b"
            stroke="#f8fafc"
            strokeWidth="2"
          />

          {/* Sleek Crimson Coaster Car Shell */}
          <polygon
            points="-34,8 34,8 44,-14 26,-22 -30,-22 -34,8"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="3"
          />
          <path d="M-30 -22 L26 -22 L40 -12 L-30 -12 Z" fill="#ef4444" />

          {/* Fierce Carved Golden Lion Mascot Figurehead on front */}
          <g transform="translate(36 -12) scale(0.85)">
            <ellipse
              cx="0"
              cy="0"
              rx="14"
              ry="12"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="2"
            />
            <polygon points="4,-6 10,-2 4,2" fill="#fef08a" />
            <circle cx="2" cy="-4" r="2.5" fill="#451a03" />
            <polygon points="-8,-12 -2,-18 4,-12" fill="#fbbf24" />
          </g>

          {/* Animated Screaming Passengers with raised hands */}
          <g transform="translate(-10 -24)">
            {/* Passenger 1 */}
            <circle
              cx="-12"
              cy="0"
              r="7"
              fill="#fbcfe8"
              stroke="#be185d"
              strokeWidth="1.5"
            />
            <line
              x1="-16"
              y1="0"
              x2="-22"
              y2="-12"
              stroke="#be185d"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="-8"
              y1="0"
              x2="-2"
              y2="-12"
              stroke="#be185d"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Passenger 2 */}
            <circle
              cx="10"
              cy="0"
              r="7"
              fill="#fed7aa"
              stroke="#c2410c"
              strokeWidth="1.5"
            />
            <line
              x1="6"
              y1="0"
              x2="0"
              y2="-12"
              stroke="#c2410c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="14"
              y1="0"
              x2="20"
              y2="-12"
              stroke="#c2410c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Safety Lap Bar */}
          <path
            d="M-26 -14 H24"
            stroke="#e2e8f0"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </g>

      <WonderParkAboveTrain />
    </g>
  );
}

export default WonderParkEntranceScenery;
