import React from "react";

export function WonderParkMidwayScenery({ seconds }: { seconds: number }) {
  // Kinetic timings
  const teacupOrbit = seconds * 0.35;
  const carouselBob = seconds * 2;
  const marqueePhase = Math.floor(seconds * 4) % 3;

  return (
    <g className="wonder-park-midway-scenery">
      <defs>
        {/* Twilight Carnival Sky Gradients */}
        <linearGradient id="wpm-sky-twilight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c224d" />
          <stop offset="30%" stopColor="#543769" />
          <stop offset="60%" stopColor="#a85368" />
          <stop offset="85%" stopColor="#e8855e" />
          <stop offset="100%" stopColor="#fcd37d" />
        </linearGradient>

        <linearGradient id="wpm-ground-brick" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b46a43" />
          <stop offset="35%" stopColor="#cc7b4f" />
          <stop offset="70%" stopColor="#ba6d45" />
          <stop offset="100%" stopColor="#965230" />
        </linearGradient>

        <radialGradient id="wpm-amber-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        {/* Carousel Canopy Burgundy & Cream Stripe */}
        <linearGradient id="wpm-carousel-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        {/* Teacup Glaze Gradients */}
        <linearGradient id="wpm-mango-glaze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="wpm-coral-glaze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>

        {/* Brick promenade pattern */}
        <pattern
          id="wpm-brick-pattern"
          width="60"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 H60 V15 H0 Z M30 15 H90 V30 H30 Z"
            fill="none"
            stroke="#78350f"
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />
        </pattern>
      </defs>

      {/* ========================================================= */}
      {/* 1. SKY & DISTANT CARNIVAL SKYLINE                         */}
      {/* ========================================================= */}
      <rect width="2800" height="720" fill="url(#wpm-sky-twilight)" />

      {/* Twilight Distant Roller Coaster Silhouette with LED track lights */}
      <path
        d="M0 410 Q400 180 800 380 Q1200 160 1600 390 Q2000 200 2400 380 Q2600 280 2800 400"
        fill="none"
        stroke="#4c2c4d"
        strokeWidth="6"
        opacity="0.7"
      />
      {Array.from({ length: 28 }, (_, i) => {
        const x = i * 100;
        const y = 350 + Math.sin(i * 0.8) * 80;
        return (
          <circle
            key={`skyline-led-${i}`}
            cx={x}
            cy={y}
            r="3"
            fill={i % 2 === 0 ? "#fef08a" : "#f43f5e"}
            opacity="0.8"
          />
        );
      })}

      {/* Distant Ferris wheel illuminated rim silhouette */}
      <g transform="translate(320 280) scale(0.65)" opacity="0.6">
        <circle
          cx="0"
          cy="0"
          r="140"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
        />
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`dist-spoke-${i}`}
            x1="0"
            y1="0"
            x2={Math.cos((i * Math.PI) / 4) * 140}
            y2={Math.sin((i * Math.PI) / 4) * 140}
            stroke="#fbbf24"
            strokeWidth="2"
          />
        ))}
      </g>

      {/* ========================================================= */}
      {/* 2. OVERHEAD FESTOON STRINGS & BUNTINGS                    */}
      {/* ========================================================= */}
      <path
        d="M0 80 Q700 220 1400 90"
        fill="none"
        stroke="#3e2438"
        strokeWidth="3"
      />
      <path
        d="M1400 90 Q2100 220 2800 80"
        fill="none"
        stroke="#3e2438"
        strokeWidth="3"
      />
      {Array.from({ length: 36 }, (_, i) => {
        const x = 40 + i * 76;
        const y = 80 + Math.sin((i / 35) * Math.PI) * 55;
        const isLit = (i + marqueePhase) % 3 === 0;
        return (
          <g key={`festoon-${i}`} transform={`translate(${x} ${y})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="#1c1917"
              strokeWidth="2"
            />
            <circle
              cx="0"
              cy="12"
              r={isLit ? 7 : 5}
              fill={isLit ? "#fef08a" : "#ca8a04"}
            />
            {isLit && (
              <circle
                cx="0"
                cy="12"
                r="16"
                fill="url(#wpm-amber-glow)"
                opacity="0.7"
              />
            )}
          </g>
        );
      })}

      {/* Multi-colored carnival pennants */}
      {Array.from({ length: 24 }, (_, i) => {
        const x = 60 + i * 115;
        const y = 85 + Math.sin((i / 23) * Math.PI) * 45;
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
            key={`wpm-flag-${i}`}
            points={`${x - 12},${y} ${x + 12},${y} ${x},${y + 32}`}
            fill={colors[i % colors.length]}
            stroke="#451a03"
            strokeWidth="1"
          />
        );
      })}

      {/* ========================================================= */}
      {/* 3. SPINNING MANGO TEACUPS RIDE (x=700, y=510)             */}
      {/* ========================================================= */}
      <g transform="translate(700 510)">
        {/* Tiered Decorative Ride Platform */}
        <ellipse cx="0" cy="70" rx="290" ry="62" fill="#582914" opacity="0.4" />
        <ellipse
          cx="0"
          cy="55"
          rx="280"
          ry="54"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="4"
        />
        <ellipse
          cx="0"
          cy="46"
          rx="270"
          ry="50"
          fill="#fef3c7"
          stroke="#b45309"
          strokeWidth="6"
        />

        {/* Outer Marquee Ring Bulbs on Platform */}
        {Array.from({ length: 24 }, (_, i) => {
          const rad = (i * Math.PI * 2) / 24;
          const bx = Math.cos(rad) * 258;
          const by = 46 + Math.sin(rad) * 46;
          const isBulbLit = (i + marqueePhase) % 3 === 0;
          return (
            <circle
              key={`tc-bulb-${i}`}
              cx={bx}
              cy={by}
              r="4"
              fill={isBulbLit ? "#fef08a" : "#b45309"}
            />
          );
        })}

        {/* Center Giant Sculpted Mango Centerpiece */}
        <g transform="translate(0 15)">
          {/* Ornate Gold Pedestal */}
          <polygon
            points="-40,25 40,25 24,-15 -24,-15"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="3"
          />
          {/* Giant Plump Golden Mango */}
          <ellipse
            cx="0"
            cy="-45"
            rx="36"
            ry="46"
            fill="url(#wpm-mango-glaze)"
            stroke="#b45309"
            strokeWidth="3"
          />
          <path
            d="M-15 -65 Q0 -85 25 -75"
            fill="#15803d"
            stroke="#166534"
            strokeWidth="2"
          />
          <path
            d="M12 -80 Q25 -105 40 -85 Z"
            fill="#22c55e"
            stroke="#166534"
            strokeWidth="2"
          />
          <circle cx="10" cy="-55" r="8" fill="#ffffff" opacity="0.4" />
          {/* Golden Crown on Mango */}
          <polygon
            points="-18,-90 -9,-104 0,-92 9,-104 18,-90"
            fill="#fcd34d"
            stroke="#b45309"
            strokeWidth="2"
          />
        </g>

        {/* 5 Orbiting Kinetic Teacups */}
        {[0, 1, 2, 3, 4].map((i) => {
          const orbitAngle = teacupOrbit + (i * Math.PI * 2) / 5;
          const tx = Math.cos(orbitAngle) * 195;
          const ty = 28 + Math.sin(orbitAngle) * 34;
          const spin = seconds * 2.5 + i * 1.5;
          const isWarm = i % 2 === 0;

          return (
            <g key={`teacup-${i}`} transform={`translate(${tx} ${ty})`}>
              {/* Teacup Saucer Base */}
              <ellipse
                cx="0"
                cy="22"
                rx="48"
                ry="16"
                fill="#fef08a"
                stroke="#b45309"
                strokeWidth="3"
              />

              {/* Teacup Body */}
              <g transform="translate(0 -5)">
                {/* Porcelain Curved Cup Body */}
                <path
                  d="M-36 0 Q-38 32 0 32 Q38 32 36 0 Z"
                  fill={
                    isWarm ? "url(#wpm-mango-glaze)" : "url(#wpm-coral-glaze)"
                  }
                  stroke="#78350f"
                  strokeWidth="3.5"
                />
                {/* Teacup Rim Ellipse */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="36"
                  ry="12"
                  fill="#fffbeb"
                  stroke="#78350f"
                  strokeWidth="3"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx="28"
                  ry="8"
                  fill="#d97706"
                  opacity="0.25"
                />

                {/* Looped Teacup Handle */}
                <path
                  d="M34 6 Q52 14 34 26"
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Center Spinning Brass Wheel */}
                <g transform="translate(0 2)">
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill="#f59e0b"
                    stroke="#78350f"
                    strokeWidth="2"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.cos(spin) * 10}
                    y2={Math.sin(spin) * 10}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>

                {/* Smiling Passenger Heads */}
                <g transform="translate(0 -10)">
                  <circle
                    cx="-12"
                    cy="0"
                    r="7"
                    fill="#fed7aa"
                    stroke="#c2410c"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="0"
                    r="7"
                    fill="#fbcfe8"
                    stroke="#be185d"
                    strokeWidth="1.5"
                  />
                </g>
              </g>
            </g>
          );
        })}

        {/* Ride Signboard */}
        <g transform="translate(0 120)">
          <rect
            x="-130"
            y="-18"
            width="260"
            height="36"
            rx="10"
            fill="#1e1b4b"
            stroke="#f59e0b"
            strokeWidth="4"
          />
          <text
            y="7"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            letterSpacing="3"
            fill="#fef08a"
          >
            MANGO TEACUPS
          </text>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 4. GRAND GOLDEN CAROUSEL (x=1500, y=510)                  */}
      {/* ========================================================= */}
      <g transform="translate(1500 500)">
        {/* Carousel Base Platform */}
        <ellipse
          cx="0"
          cy="65"
          rx="275"
          ry="54"
          fill="#582914"
          opacity="0.35"
        />
        <ellipse
          cx="0"
          cy="50"
          rx="265"
          ry="46"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="4"
        />
        <ellipse
          cx="0"
          cy="40"
          rx="255"
          ry="42"
          fill="#fef3c7"
          stroke="#b45309"
          strokeWidth="6"
        />

        {/* Center Mirrored Pillar & Golden Lion Reliefs */}
        <rect
          x="-45"
          y="-190"
          width="90"
          height="230"
          rx="8"
          fill="#1e293b"
          stroke="#f59e0b"
          strokeWidth="4"
        />
        <rect
          x="-35"
          y="-180"
          width="70"
          height="210"
          rx="4"
          fill="#38bdf8"
          opacity="0.4"
          stroke="#e0f2fe"
          strokeWidth="2"
        />
        {/* Center Golden Lion Shield */}
        <ellipse
          cx="0"
          cy="-70"
          rx="24"
          ry="28"
          fill="#f59e0b"
          stroke="#78350f"
          strokeWidth="3"
        />
        <polygon
          points="-8,-80 0,-92 8,-80"
          fill="#fcd34d"
          stroke="#b45309"
          strokeWidth="2"
        />

        {/* Majestic Steeds & Gazelles on Spiral Brass Poles */}
        {[-180, -90, 0, 90, 180].map((px, i) => {
          const yBob = Math.sin(carouselBob + i * 1.3) * 16;
          const isLion = i % 2 === 0;

          return (
            <g key={`carousel-mount-${px}`} transform={`translate(${px} 0)`}>
              {/* Spiral Fluted Brass Pole */}
              <line
                x1="0"
                y1="-220"
                x2="0"
                y2="40"
                stroke="#f59e0b"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <line
                x1="0"
                y1="-220"
                x2="0"
                y2="40"
                stroke="#fef08a"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Animated Carousel Steed (Rising & Falling) */}
              <g transform={`translate(0 ${-70 + yBob})`}>
                {isLion ? (
                  /* Majestic Gilded Lion Mount */
                  <g transform="scale(0.85)">
                    {/* Golden Mane & Body */}
                    <ellipse
                      cx="-5"
                      cy="0"
                      rx="34"
                      ry="20"
                      fill="#f59e0b"
                      stroke="#78350f"
                      strokeWidth="3"
                    />
                    <circle
                      cx="25"
                      cy="-14"
                      r="18"
                      fill="#d97706"
                      stroke="#78350f"
                      strokeWidth="2.5"
                    />
                    <ellipse cx="28" cy="-12" rx="14" ry="12" fill="#fbbf24" />
                    <circle cx="34" cy="-14" r="2.5" fill="#451a03" />
                    {/* Royal Saddle & Blanket */}
                    <polygon
                      points="-16,-12 10,-12 6,8 -12,8"
                      fill="#b91c1c"
                      stroke="#fef08a"
                      strokeWidth="2"
                    />
                    {/* Galloping Legs */}
                    <line
                      x1="-22"
                      y1="12"
                      x2="-32"
                      y2="28"
                      stroke="#78350f"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="-12"
                      y1="12"
                      x2="-18"
                      y2="28"
                      stroke="#78350f"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="12"
                      y1="12"
                      x2="22"
                      y2="28"
                      stroke="#78350f"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="20"
                      y1="12"
                      x2="32"
                      y2="28"
                      stroke="#78350f"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </g>
                ) : (
                  /* Elegant Savanna Gazelle Mount */
                  <g transform="scale(0.85)">
                    <ellipse
                      cx="-5"
                      cy="0"
                      rx="30"
                      ry="16"
                      fill="#fed7aa"
                      stroke="#78350f"
                      strokeWidth="3"
                    />
                    <circle
                      cx="22"
                      cy="-16"
                      r="14"
                      fill="#fbbf24"
                      stroke="#78350f"
                      strokeWidth="2"
                    />
                    {/* Gazelle Horns */}
                    <path
                      d="M18 -26 Q22 -44 28 -40"
                      fill="none"
                      stroke="#451a03"
                      strokeWidth="3"
                    />
                    <polygon
                      points="-14,-10 8,-10 5,6 -10,6"
                      fill="#0284c7"
                      stroke="#fef08a"
                      strokeWidth="2"
                    />
                    {/* Legs */}
                    <line
                      x1="-20"
                      y1="10"
                      x2="-28"
                      y2="26"
                      stroke="#78350f"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <line
                      x1="12"
                      y1="10"
                      x2="24"
                      y2="26"
                      stroke="#78350f"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            </g>
          );
        })}

        {/* Grand Victorian Conical Canopy */}
        <g transform="translate(0 -220)">
          {/* Gilded Roof Cone */}
          <polygon
            points="-280,0 0,-160 280,0"
            fill="url(#wpm-carousel-roof)"
            stroke="#451a03"
            strokeWidth="5"
          />
          <polygon points="-240,0 0,-145 240,0" fill="#dc2626" />
          <polygon points="-180,0 0,-130 180,0" fill="#fef3c7" />
          <polygon points="-120,0 0,-115 120,0" fill="#dc2626" />
          <polygon points="-60,0 0,-100 60,0" fill="#fef3c7" />

          {/* Scalloped Valence & Gold Tassels */}
          <rect
            x="-285"
            y="-5"
            width="570"
            height="26"
            rx="6"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="3"
          />
          {Array.from({ length: 22 }, (_, i) => {
            const bx = -270 + i * 25.7;
            const isLit = (i + marqueePhase) % 3 === 0;
            return (
              <circle
                key={`car-bulb-${i}`}
                cx={bx}
                cy="8"
                r="4.5"
                fill={isLit ? "#fef08a" : "#b45309"}
              />
            );
          })}

          {/* Roof Finial & Golden Lion Flag */}
          <line
            x1="0"
            y1="-160"
            x2="0"
            y2="-210"
            stroke="#f59e0b"
            strokeWidth="5"
          />
          <polygon
            points="0,-210 32,-198 0,-186"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="2"
          />
        </g>
      </g>

      {/* ========================================================= */}
      {/* 5. MIDWAY GAME BOOTH: FRUIT CATCH (x=2200, y=540)         */}
      {/* ========================================================= */}
      <g transform="translate(2200 540)">
        {/* Timber Booth Structure */}
        <rect
          x="-140"
          y="-160"
          width="280"
          height="160"
          rx="14"
          fill="#fef3c7"
          stroke="#78350f"
          strokeWidth="6"
        />

        {/* Candy-Striped Awning */}
        <g transform="translate(0 -160)">
          <polygon
            points="-160,0 -120,-50 120,-50 160,0"
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth="4"
          />
          {[-120, -60, 0, 60, 120].map((sx) => (
            <polygon
              key={`stripe-${sx}`}
              points={`${sx - 15},0 ${sx - 10},-50 ${sx + 10},-50 ${sx + 15},0`}
              fill="#ffffff"
            />
          ))}
          <path
            d="M-160 0 Q-140 16 -120 0 Q-100 16 -80 0 Q-60 16 -40 0 Q-20 16 0 0 Q20 16 40 0 Q60 16 80 0 Q100 16 120 0 Q140 16 160 0"
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth="2"
          />
        </g>

        {/* Back Wall Prize Plushies Shelf */}
        <g transform="translate(0 -105)">
          <rect
            x="-120"
            y="-20"
            width="240"
            height="34"
            rx="4"
            fill="#78350f"
            stroke="#451a03"
            strokeWidth="2"
          />
          {/* Hanging Plush Lions & Tropical Fruit Prizes */}
          {[-85, -35, 15, 65].map((px, i) => (
            <g key={`prize-${px}`} transform={`translate(${px} -5)`}>
              {i % 2 === 0 ? (
                /* Plush Lion Cub */
                <g>
                  <circle
                    cx="0"
                    cy="0"
                    r="14"
                    fill="#fbbf24"
                    stroke="#b45309"
                    strokeWidth="2"
                  />
                  <circle cx="-6" cy="-2" r="2" fill="#451a03" />
                  <circle cx="6" cy="-2" r="2" fill="#451a03" />
                  <polygon points="0,2 -2,4 2,4" fill="#ef4444" />
                </g>
              ) : (
                /* Plush Giant Mango */
                <g>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="12"
                    ry="16"
                    fill="#f97316"
                    stroke="#c2410c"
                    strokeWidth="2"
                  />
                  <path
                    d="M0 -16 Q6 -22 12 -18"
                    fill="none"
                    stroke="#15803d"
                    strokeWidth="2"
                  />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* Game Countertop & Fruit Target Baskets */}
        <rect
          x="-135"
          y="-35"
          width="270"
          height="40"
          rx="8"
          fill="#92400e"
          stroke="#451a03"
          strokeWidth="4"
        />
        {/* Ball Toss Baskets */}
        {[-80, 0, 80].map((bx) => (
          <ellipse
            key={`basket-${bx}`}
            cx={bx}
            cy="-25"
            rx="22"
            ry="9"
            fill="#1e293b"
            stroke="#fcd34d"
            strokeWidth="2"
          />
        ))}

        {/* Glowing Marquee: "FRUIT CATCH" */}
        <g transform="translate(0 -195)">
          <rect
            x="-125"
            y="-18"
            width="250"
            height="36"
            rx="10"
            fill="#1e1b4b"
            stroke="#f59e0b"
            strokeWidth="4"
          />
          <text
            y="7"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            letterSpacing="3"
            fill="#fef08a"
          >
            FRUIT CATCH
          </text>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 6. POPCORN & COTTON CANDY CART (x=1120, y=540)            */}
      {/* ========================================================= */}
      <g transform="translate(1120 540) scale(0.9)">
        {/* Striped Victorian Vendor Cart */}
        <rect
          x="-45"
          y="-70"
          width="90"
          height="50"
          rx="6"
          fill="#dc2626"
          stroke="#7f1d1d"
          strokeWidth="3"
        />
        <rect x="-35" y="-62" width="70" height="34" rx="4" fill="#ffffff" />
        <text
          y="-40"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#dc2626"
        >
          POPCORN
        </text>

        {/* Glass Warmer Dome with Glowing Popcorn */}
        <rect
          x="-40"
          y="-120"
          width="80"
          height="50"
          rx="8"
          fill="#38bdf8"
          opacity="0.35"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={`popcorn-${i}`}
            cx={-28 + (i % 4) * 18}
            cy={-80 - Math.floor(i / 4) * 10}
            r="4"
            fill="#fef08a"
          />
        ))}

        {/* Spoke Carriage Wheels */}
        <circle
          cx="-35"
          cy="-10"
          r="18"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
        />
        <circle
          cx="35"
          cy="-10"
          r="18"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
        />
      </g>

      {/* ========================================================= */}
      {/* 7. PROMENADE GROUND & GATEWAY PORTAL                      */}
      {/* ========================================================= */}
      {/* Herringbone Brick Promenade (y: 540 to 720) */}
      <rect y="540" width="2800" height="180" fill="url(#wpm-ground-brick)" />
      <rect y="540" width="2800" height="180" fill="url(#wpm-brick-pattern)" />
      <path d="M0 540 H2800" stroke="#78350f" strokeWidth="8" />

      {/* Right Portal Gateway: WONDER PARK ENTRANCE (x=2680 to 2800) */}
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
          ENTRANCE →
        </text>
      </g>

      {/* Victorian Triple Gas Lampposts */}
      {[220, 1140, 1850, 2520].map((lx) => (
        <g key={`lamp-${lx}`} transform={`translate(${lx} 540)`}>
          <ellipse cx="0" cy="5" rx="110" ry="26" fill="url(#wpm-amber-glow)" />
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
            <circle cx="0" cy="0" r="22" fill="url(#wpm-amber-glow)" />
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
            <circle cx="0" cy="0" r="16" fill="url(#wpm-amber-glow)" />
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
            <circle cx="0" cy="0" r="16" fill="url(#wpm-amber-glow)" />
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
    </g>
  );
}

export default WonderParkMidwayScenery;
