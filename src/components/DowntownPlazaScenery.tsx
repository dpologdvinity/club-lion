import React from "react";

export function DowntownPlazaScenery({ seconds }: { seconds: number }) {
  // Animated timing values
  const r1 = 30 + ((seconds * 22) % 85);
  const r2 = 30 + ((seconds * 22 + 42) % 85);
  const op1 = Math.max(0, 1 - r1 / 115);
  const op2 = Math.max(0, 1 - r2 / 115);

  const neonPulse = 0.85 + Math.sin(seconds * 3.5) * 0.15;
  const marqueePhase = Math.floor(seconds * 3) % 3;
  const cloudShift1 = (seconds * 2.5) % 2400;
  const cloudShift2 = (seconds * 1.8) % 2400;
  const balloonBob = Math.sin(seconds * 0.8) * 8;

  return (
    <g className="downtown-plaza-scenery">
      <defs>
        {/* Sky Sunset & Golden Hour Gradients */}
        <linearGradient id="dt-sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#43527a" />
          <stop offset="28%" stopColor="#816087" />
          <stop offset="55%" stopColor="#d97f74" />
          <stop offset="80%" stopColor="#f7ab6b" />
          <stop offset="100%" stopColor="#ffd98c" />
        </linearGradient>

        <linearGradient id="dt-mountain-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5d496a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#966070" stopOpacity="0.85" />
        </linearGradient>

        <linearGradient id="dt-mountain-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9e6659" />
          <stop offset="100%" stopColor="#c5845c" />
        </linearGradient>

        <linearGradient id="dt-promenade-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8ab76" />
          <stop offset="35%" stopColor="#e9bf8c" />
          <stop offset="70%" stopColor="#deb27e" />
          <stop offset="100%" stopColor="#cb9e68" />
        </linearGradient>

        {/* Le Shop Luxury Facade Gradients */}
        <linearGradient id="leshop-limestone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f5e9d3" />
          <stop offset="50%" stopColor="#fffaf0" />
          <stop offset="100%" stopColor="#ece0c8" />
        </linearGradient>

        <linearGradient id="leshop-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d4944" />
          <stop offset="100%" stopColor="#222b27" />
        </linearGradient>

        <linearGradient id="leshop-awning-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e4635" />
          <stop offset="50%" stopColor="#2e644d" />
          <stop offset="100%" stopColor="#1e4635" />
        </linearGradient>

        {/* Canopy Café Warm Wood & Terracotta */}
        <linearGradient id="cafe-terracotta-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d36440" />
          <stop offset="100%" stopColor="#a34226" />
        </linearGradient>

        <linearGradient id="cafe-stucco" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f7ecd5" />
          <stop offset="50%" stopColor="#fff9ec" />
          <stop offset="100%" stopColor="#eee0c5" />
        </linearGradient>

        {/* Club Pulse Neon & Gloss Obsidian */}
        <linearGradient id="club-obsidian" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#252433" />
          <stop offset="50%" stopColor="#161522" />
          <stop offset="100%" stopColor="#0c0b14" />
        </linearGradient>

        <linearGradient id="club-neon-pink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff2a8d" />
          <stop offset="100%" stopColor="#ff70ba" />
        </linearGradient>

        <linearGradient id="club-neon-cyan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#70f3ff" />
        </linearGradient>

        {/* Marble Lion Fountain Gradients */}
        <linearGradient id="marble-carrara" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f3f1ea" />
          <stop offset="80%" stopColor="#dcd8cb" />
          <stop offset="100%" stopColor="#bcb6a4" />
        </linearGradient>

        <radialGradient id="fountain-pool-water" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e0e3" />
          <stop offset="55%" stopColor="#31b2be" />
          <stop offset="88%" stopColor="#1e818c" />
          <stop offset="100%" stopColor="#125d66" />
        </radialGradient>

        {/* Wonder Park Grand Marquee */}
        <linearGradient id="wonder-pylon-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffd868" />
          <stop offset="50%" stopColor="#fff4b8" />
          <stop offset="100%" stopColor="#e5a932" />
        </linearGradient>

        <linearGradient id="wonder-arch-crimson" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d93b3b" />
          <stop offset="100%" stopColor="#871a1a" />
        </linearGradient>

        {/* Warm Ambient Lamp Glow */}
        <radialGradient id="dt-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3b3" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#ffce52" stopOpacity="0.35" />
          <stop offset="75%" stopColor="#ffb833" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffb833" stopOpacity="0" />
        </radialGradient>

        {/* Ground Cobblestone Pattern */}
        <pattern
          id="dt-cobblestone-pattern"
          width="160"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 H160 V60 H0 Z"
            fill="none"
            stroke="#be8d58"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <path
            d="M80 0 V60 M0 30 H160"
            fill="none"
            stroke="#be8d58"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />
          <path
            d="M40 0 V30 M120 0 V30 M40 30 V60 M120 30 V60"
            fill="none"
            stroke="#be8d58"
            strokeWidth="0.8"
            strokeOpacity="0.18"
          />
        </pattern>
      </defs>

      {/* 1. Sky & Sun Glow */}
      <rect width="2400" height="540" fill="url(#dt-sky-grad)" />

      {/* Radiant Golden Setting Sun */}
      <circle cx="1680" cy="280" r="140" fill="#fff5d6" opacity="0.45" />
      <circle cx="1680" cy="280" r="95" fill="#ffefa8" opacity="0.7" />
      <circle cx="1680" cy="280" r="55" fill="#fffdf2" />

      {/* Drifting Clouds */}
      <g fill="#fff0e0" opacity="0.45">
        <path
          d={`M${180 + cloudShift1} 120 Q${240 + cloudShift1} 85 ${320 + cloudShift1} 120 Q${380 + cloudShift1} 95 ${440 + cloudShift1} 120 Q${480 + cloudShift1} 150 ${410 + cloudShift1} 165 H${200 + cloudShift1} Z`}
        />
        <path
          d={`M${1100 + cloudShift2} 90 Q${1170 + cloudShift2} 60 ${1260 + cloudShift2} 90 Q${1330 + cloudShift2} 70 ${1400 + cloudShift2} 90 Q${1450 + cloudShift2} 125 ${1380 + cloudShift2} 135 H${1120 + cloudShift2} Z`}
        />
        <path
          d={`M${2000 + cloudShift1} 140 Q${2060 + cloudShift1} 110 ${2140 + cloudShift1} 140 Q${2200 + cloudShift1} 120 ${2260 + cloudShift1} 140 Q${2300 + cloudShift1} 165 ${2230 + cloudShift1} 180 H${2020 + cloudShift1} Z`}
        />
      </g>

      {/* Distant Hot Air Balloons in the Sky */}
      <g
        transform={`translate(1380 ${130 + balloonBob}) scale(0.65)`}
        opacity="0.85"
      >
        <ellipse cx="0" cy="0" rx="26" ry="32" fill="#e85d43" />
        <path d="M-26 0 Q0 -25 26 0 Q0 25 -26 0 Z" fill="#ffd15c" />
        <path
          d="M-8 32 L-5 44 M8 32 L5 44"
          stroke="#754224"
          strokeWidth="1.5"
        />
        <rect x="-7" y="44" width="14" height="10" rx="2" fill="#9e5d32" />
      </g>
      <g
        transform={`translate(740 ${90 - balloonBob * 0.7}) scale(0.45)`}
        opacity="0.75"
      >
        <ellipse cx="0" cy="0" rx="26" ry="32" fill="#429be8" />
        <path d="M-26 0 Q0 -25 26 0 Q0 25 -26 0 Z" fill="#ffffff" />
        <path
          d="M-8 32 L-5 44 M8 32 L5 44"
          stroke="#754224"
          strokeWidth="1.5"
        />
        <rect x="-7" y="44" width="14" height="10" rx="2" fill="#9e5d32" />
      </g>

      {/* 2. Distant Horizon & Savanna Plateaus */}
      <path
        d="M0 430 Q280 320 620 400 Q980 290 1420 395 Q1840 310 2160 380 Q2310 350 2400 375 V540 H0 Z"
        fill="url(#dt-mountain-far)"
      />
      <path
        d="M0 475 Q380 405 820 460 Q1240 380 1660 455 Q2050 410 2400 465 V540 H0 Z"
        fill="url(#dt-mountain-mid)"
      />

      {/* Midground Acacia Tree Silhouettes on the Ridge */}
      {[240, 580, 890, 1140, 1580, 2040].map((tx, idx) => (
        <g
          key={idx}
          transform={`translate(${tx} 475) scale(0.55)`}
          opacity="0.6"
        >
          <path
            d="M0 0 L-2 -50 L-18 -85 M0 -50 L16 -80"
            stroke="#5e3933"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse cx="-20" cy="-90" rx="35" ry="12" fill="#54362b" />
          <ellipse cx="18" cy="-85" rx="30" ry="10" fill="#54362b" />
          <ellipse cx="0" cy="-98" rx="42" ry="14" fill="#4d3025" />
        </g>
      ))}

      {/* 3. Promenade Ground Pavement (y: 510 to 720) */}
      <rect
        y="510"
        width="2400"
        height="210"
        fill="url(#dt-promenade-ground)"
      />
      <rect
        y="510"
        width="2400"
        height="210"
        fill="url(#dt-cobblestone-pattern)"
      />

      {/* Promenade Curbing Stone Trim */}
      <path d="M0 510 H2400" stroke="#be8d58" strokeWidth="8" />
      <path d="M0 514 H2400" stroke="#fae3be" strokeWidth="2.5" />

      {/* Ground Cast Shadows beneath Buildings */}
      <ellipse
        cx="160"
        cy="535"
        rx="180"
        ry="22"
        fill="#754b23"
        opacity="0.35"
      />
      <ellipse
        cx="510"
        cy="542"
        rx="60"
        ry="14"
        fill="#754b23"
        opacity="0.35"
      />
      <ellipse
        cx="680"
        cy="538"
        rx="140"
        ry="20"
        fill="#754b23"
        opacity="0.35"
      />
      <ellipse
        cx="1200"
        cy="545"
        rx="230"
        ry="28"
        fill="#754b23"
        opacity="0.4"
      />
      <ellipse
        cx="1780"
        cy="542"
        rx="140"
        ry="20"
        fill="#754b23"
        opacity="0.35"
      />
      <ellipse
        cx="1960"
        cy="542"
        rx="48"
        ry="14"
        fill="#754b23"
        opacity="0.35"
      />
      <ellipse
        cx="2290"
        cy="535"
        rx="180"
        ry="22"
        fill="#754b23"
        opacity="0.35"
      />

      {/* ========================================================= */}
      {/* 4. LE SHOP (x=160, y=525) - Luxury Haute Couture Boutique */}
      {/* ========================================================= */}
      <g transform="translate(160 525)">
        {/* Main 2-Story Building Body */}
        <rect
          x="-140"
          y="-380"
          width="280"
          height="380"
          rx="8"
          fill="url(#leshop-limestone)"
          stroke="#8c6f52"
          strokeWidth="6"
        />

        {/* Mansard Slate Roof with Ornate Cresting */}
        <path
          d="M-155 -380 L-130 -445 L130 -445 L155 -380 Z"
          fill="url(#leshop-roof)"
          stroke="#222b27"
          strokeWidth="5"
        />
        <path d="M-130 -445 H130" stroke="#d4af37" strokeWidth="4" />
        {/* Roof Finial Accents */}
        {[-100, -50, 0, 50, 100].map((fx) => (
          <path
            key={fx}
            d={`M${fx} -445 V-458 M${fx - 4} -453 H${fx + 4}`}
            stroke="#d4af37"
            strokeWidth="3"
          />
        ))}

        {/* Cornice Molding & Quoins */}
        <rect
          x="-146"
          y="-382"
          width="292"
          height="14"
          rx="3"
          fill="#dfcfb2"
          stroke="#8c6f52"
          strokeWidth="3"
        />
        {[-340, -290, -240, -190].map((qy) => (
          <g key={qy}>
            <rect
              x="-140"
              y={qy}
              width="16"
              height="16"
              fill="#ded0b6"
              stroke="#a08264"
              strokeWidth="2"
            />
            <rect
              x="124"
              y={qy}
              width="16"
              height="16"
              fill="#ded0b6"
              stroke="#a08264"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Second Floor: French Arched Windows with Wrought-Iron Balcony */}
        {[-65, 65].map((wx) => (
          <g key={wx} transform={`translate(${wx} -315)`}>
            <rect
              x="-35"
              y="-55"
              width="70"
              height="90"
              rx="35"
              fill="#fff7e0"
              stroke="#755a40"
              strokeWidth="4"
            />
            <path
              d="M-35 -20 H35 M0 -55 V35"
              stroke="#755a40"
              strokeWidth="3"
            />
            {/* Window Glass Sheen */}
            <path
              d="M-22 -40 L20 15 L12 25 L-30 -30 Z"
              fill="#ffffff"
              opacity="0.3"
            />
            {/* Wrought Iron Balcony */}
            <rect
              x="-42"
              y="10"
              width="84"
              height="28"
              rx="4"
              fill="#24332c"
              stroke="#14211a"
              strokeWidth="2"
            />
            {[-30, -15, 0, 15, 30].map((bx) => (
              <line
                key={bx}
                x1={bx}
                y1="12"
                x2={bx}
                y2="36"
                stroke="#d4af37"
                strokeWidth="2.5"
              />
            ))}
            {/* Flower Box with Vibrant Blooms */}
            <rect x="-40" y="32" width="80" height="12" rx="3" fill="#8c5836" />
            {[-32, -20, -8, 4, 16, 28].map((fx, i) => (
              <circle
                key={fx}
                cx={fx}
                cy="30"
                r="6"
                fill={i % 2 === 0 ? "#ff2a8d" : "#ffd13b"}
              />
            ))}
          </g>
        ))}

        {/* Ground Floor Boutique Showcase Bay Windows */}
        <rect
          x="-115"
          y="-195"
          width="230"
          height="195"
          rx="6"
          fill="#1b2e25"
          stroke="#755a40"
          strokeWidth="4"
        />

        {/* Warm Golden Interior Display Light */}
        <rect
          x="-105"
          y="-185"
          width="95"
          height="135"
          rx="4"
          fill="#ffeebb"
          opacity="0.9"
        />
        <rect
          x="10"
          y="-185"
          width="95"
          height="135"
          rx="4"
          fill="#ffeebb"
          opacity="0.9"
        />

        {/* Mannequin / Fashion Silhouette in Left Window */}
        <g transform="translate(-58 -105) scale(0.85)">
          <ellipse cx="0" cy="-55" rx="8" ry="11" fill="#7a5538" />
          <path
            d="M-12 -42 C-10 -45 10 -45 12 -42 L16 -12 C10 -8 -10 -8 -16 -12 Z"
            fill="#ff2a8d"
          />
          <path d="M-15 -10 L15 -10 L20 28 L-20 28 Z" fill="#ffd15c" />
          <line
            x1="0"
            y1="28"
            x2="0"
            y2="45"
            stroke="#7a5538"
            strokeWidth="3"
          />
        </g>
        {/* Designer Bag / Display in Right Window */}
        <g transform="translate(58 -95) scale(0.9)">
          <rect
            x="-18"
            y="-14"
            width="36"
            height="26"
            rx="5"
            fill="#a83232"
            stroke="#ffd700"
            strokeWidth="2"
          />
          <path
            d="M-10 -14 C-10 -28 10 -28 10 -14"
            fill="none"
            stroke="#ffd700"
            strokeWidth="2.5"
          />
        </g>

        {/* Central Double Entrance Doors */}
        <g transform="translate(0 -5)">
          <rect
            x="-35"
            y="-145"
            width="70"
            height="150"
            fill="#3b2314"
            stroke="#d4af37"
            strokeWidth="3.5"
          />
          <line
            x1="0"
            y1="-145"
            x2="0"
            y2="5"
            stroke="#d4af37"
            strokeWidth="2.5"
          />
          {/* Brass Lion Door Knockers */}
          <circle
            cx="-16"
            cy="-70"
            r="7"
            fill="#ffd700"
            stroke="#997a00"
            strokeWidth="1.5"
          />
          <circle
            cx="16"
            cy="-70"
            r="7"
            fill="#ffd700"
            stroke="#997a00"
            strokeWidth="1.5"
          />
          <circle
            cx="-16"
            cy="-62"
            r="5"
            fill="none"
            stroke="#ffd700"
            strokeWidth="2"
          />
          <circle
            cx="16"
            cy="-62"
            r="5"
            fill="none"
            stroke="#ffd700"
            strokeWidth="2"
          />
          {/* Kickplates */}
          <rect x="-32" y="-18" width="30" height="20" fill="#c99e32" />
          <rect x="2" y="-18" width="30" height="20" fill="#c99e32" />
        </g>

        {/* Elegant Scalloped Fabric Canopy Awning */}
        <g transform="translate(0 -195)">
          <path
            d="M-135 0 L-145 42 L145 42 L135 0 Z"
            fill="url(#leshop-awning-stripe)"
            stroke="#112b20"
            strokeWidth="3"
          />
          {/* Scalloped Valance Waves */}
          {[-120, -80, -40, 0, 40, 80, 120].map((sx) => (
            <path
              key={sx}
              d={`M${sx - 20} 42 Q${sx} 56 ${sx + 20} 42`}
              fill="#ffd700"
              stroke="#112b20"
              strokeWidth="2"
            />
          ))}
          {/* Drop Shadow Under Awning */}
          <rect
            x="-125"
            y="44"
            width="250"
            height="12"
            fill="#000000"
            opacity="0.25"
          />
        </g>

        {/* Ornate Haute Couture Signboard */}
        <g transform="translate(0 -238)">
          <rect
            x="-105"
            y="-24"
            width="210"
            height="48"
            rx="8"
            fill="#1b2e25"
            stroke="#d4af37"
            strokeWidth="4"
          />
          <rect
            x="-99"
            y="-18"
            width="198"
            height="36"
            rx="4"
            fill="none"
            stroke="#d4af37"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          <text
            y="5"
            textAnchor="middle"
            fontSize="26"
            fontFamily="Lilita One, Nunito, sans-serif"
            fill="#ffd700"
            letterSpacing="3"
          >
            LE SHOP
          </text>
          <text
            y="18"
            textAnchor="middle"
            fontSize="9"
            fontFamily="Nunito, sans-serif"
            fontWeight="bold"
            fill="#fae8b4"
            letterSpacing="2"
          >
            HAUTE COUTURE
          </text>
        </g>

        {/* Wall Lantern Sconces Flanking Door */}
        {[-130, 130].map((lx) => (
          <g key={lx} transform={`translate(${lx} -130)`}>
            <circle cx="0" cy="0" r="42" fill="url(#dt-lamp-glow)" />
            <path
              d={`M0 0 L${lx < 0 ? 15 : -15} -8 V12`}
              stroke="#222"
              strokeWidth="4"
            />
            <polygon
              points="-8,-14 8,-14 6,10 -6,10"
              fill="#fff5cc"
              stroke="#333"
              strokeWidth="2"
            />
          </g>
        ))}
      </g>

      {/* ========================================================= */}
      {/* 5. PENTHOUSE ELEVATOR (x=510, y=540)                      */}
      {/* ========================================================= */}
      <g transform="translate(510 540)">
        {/* Elevator Tower Structure */}
        <rect
          x="-42"
          y="-360"
          width="84"
          height="360"
          rx="6"
          fill="#1b2426"
          stroke="#997a22"
          strokeWidth="4"
        />
        {/* Vertical Brass Fluting */}
        {[-32, -16, 0, 16, 32].map((bx) => (
          <line
            key={bx}
            x1={bx}
            y1="-350"
            x2={bx}
            y2="-10"
            stroke="#d4af37"
            strokeWidth="2"
            opacity="0.6"
          />
        ))}
        {/* Floor Dial at Top */}
        <circle
          cx="0"
          cy="-320"
          r="24"
          fill="#294b3c"
          stroke="#d4af37"
          strokeWidth="3"
        />
        <text
          y="-314"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#ffd700"
        >
          PH
        </text>
        {/* Indicator Arrow */}
        <polygon points="0,-336 -5,-324 5,-324" fill="#ff4d4d" />
        {/* Glass Viewing Elevator Shaft */}
        <rect
          x="-28"
          y="-280"
          width="56"
          height="160"
          rx="8"
          fill="#d9f6ff"
          stroke="#d4af37"
          strokeWidth="3"
          opacity="0.6"
        />
        <path
          d="M-20 -270 L20 -130 M-20 -230 L20 -170"
          stroke="#ffffff"
          strokeWidth="3"
          opacity="0.5"
        />
        {/* Art Deco Ground Entrance Doors */}
        <rect
          x="-34"
          y="-110"
          width="68"
          height="110"
          fill="#d4af37"
          stroke="#755a15"
          strokeWidth="3"
        />
        <line
          x1="0"
          y1="-110"
          x2="0"
          y2="0"
          stroke="#755a15"
          strokeWidth="2.5"
        />
        <text
          y="-120"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#d4af37"
          letterSpacing="1"
        >
          SKY ELEVATOR
        </text>
      </g>

      {/* ========================================================= */}
      {/* 6. CLUB PULSE (x=680, y=540) - Y2K VIP Lounge & Nightclub */}
      {/* ========================================================= */}
      <g transform="translate(680 540)">
        {/* Sleek Facade Body */}
        <rect
          x="-125"
          y="-320"
          width="250"
          height="320"
          rx="14"
          fill="url(#club-obsidian)"
          stroke="#4a3b63"
          strokeWidth="5"
        />

        {/* Upper Stage Beams / Wash Lights */}
        <polygon
          points="-90,-310 -150,-420 -50,-420"
          fill="#a855f7"
          opacity="0.18"
        />
        <polygon
          points="90,-310 50,-420 150,-420"
          fill="#06b6d4"
          opacity="0.18"
        />

        {/* Rooftop Neon Header */}
        <rect
          x="-135"
          y="-335"
          width="270"
          height="24"
          rx="6"
          fill="#1e1830"
          stroke="#6b21a8"
          strokeWidth="3"
        />

        {/* Vibrant Neon Sign "CLUB PULSE" */}
        <g transform="translate(0 -270)">
          {/* Back Neon Glow Filter Box */}
          <rect
            x="-105"
            y="-28"
            width="210"
            height="56"
            rx="12"
            fill="#120c1f"
            stroke="#ff2a8d"
            strokeWidth={2 + neonPulse * 2}
          />
          <text
            y="7"
            textAnchor="middle"
            fontSize="32"
            fontFamily="Lilita One, sans-serif"
            fill="#ff70ba"
            letterSpacing="3"
            filter="drop-shadow(0px 0px 8px #ff2a8d)"
          >
            CLUB PULSE
          </text>
          <text
            y="24"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#00e5ff"
            letterSpacing="4"
          >
            DJ BEAT &middot; VIP LOUNGE
          </text>
        </g>

        {/* Sound Equalizer Waves on Upper Facade */}
        {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((eqX, i) => {
          const barH = 14 + Math.sin(seconds * 5 + i * 0.9) * 12;
          return (
            <rect
              key={eqX}
              x={eqX - 5}
              y={-215 - barH}
              width="10"
              height={barH}
              rx="2"
              fill={
                i % 2 === 0 ? "url(#club-neon-pink)" : "url(#club-neon-cyan)"
              }
              opacity="0.9"
            />
          );
        })}

        {/* Smoked Tint Double Entrance Doors */}
        <rect
          x="-55"
          y="-150"
          width="110"
          height="150"
          rx="8"
          fill="#1a1c2b"
          stroke="#7e22ce"
          strokeWidth="4"
        />
        <line x1="0" y1="-150" x2="0" y2="0" stroke="#7e22ce" strokeWidth="3" />
        {/* Long Chrome Handles */}
        <line
          x1="-12"
          y1="-100"
          x2="-12"
          y2="-45"
          stroke="#e2e8f0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="-100"
          x2="12"
          y2="-45"
          stroke="#e2e8f0"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Red Carpet VIP Runner */}
        <polygon
          points="-45,0 45,0 65,30 -65,30"
          fill="#991b1b"
          stroke="#ef4444"
          strokeWidth="2"
        />

        {/* Velvet Ropes & Brass Stanchions */}
        {[-75, 75].map((sx) => (
          <g key={sx}>
            {/* Base & Post */}
            <ellipse
              cx={sx}
              cy="10"
              rx="14"
              ry="5"
              fill="#ca8a04"
              stroke="#854d0e"
              strokeWidth="2"
            />
            <line
              x1={sx}
              y1="10"
              x2={sx}
              y2="-55"
              stroke="#eab308"
              strokeWidth="5"
            />
            <circle
              cx={sx}
              cy="-58"
              r="7"
              fill="#facc15"
              stroke="#854d0e"
              strokeWidth="1.5"
            />
          </g>
        ))}
        {/* Draped Red Velvet Rope */}
        <path
          d="M-75 -52 Q-38 -30 0 -52"
          fill="none"
          stroke="#dc2626"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M0 -52 Q38 -30 75 -52"
          fill="none"
          stroke="#dc2626"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* ========================================================= */}
      {/* 7. GRAND CLASSICAL MARBLE LION FOUNTAIN (x=1200, y=520)   */}
      {/* ========================================================= */}
      <g transform="translate(1200 520)">
        {/* Outer Shadow & Fountain Base Rim */}
        <ellipse cy="38" rx="230" ry="52" fill="#754b23" opacity="0.35" />
        <ellipse
          cy="26"
          rx="215"
          ry="48"
          fill="url(#marble-carrara)"
          stroke="#8c785d"
          strokeWidth="8"
        />
        <ellipse cy="20" rx="195" ry="42" fill="#5c4d3c" />

        {/* Shimmering Turquoise Water Basin Pool */}
        <ellipse cy="16" rx="190" ry="38" fill="url(#fountain-pool-water)" />

        {/* Animated Expanding Concentric Water Ripples */}
        <ellipse
          cy="16"
          rx={r1 * 1.8}
          ry={r1 * 0.42}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          opacity={op1}
        />
        <ellipse
          cy="16"
          rx={r2 * 1.8}
          ry={r2 * 0.42}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          opacity={op2}
        />

        {/* Floating Water Lily Pads with Pink Lotus Blossoms */}
        {[-120, -70, 75, 125].map((lx, i) => (
          <g
            key={lx}
            transform={`translate(${lx} ${14 + (i % 2) * 8}) scale(0.8)`}
          >
            <ellipse
              rx="16"
              ry="7"
              fill="#2d6a4f"
              stroke="#1b4332"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="-2" r="6" fill="#ff70a6" />
            <circle cx="0" cy="-2" r="3" fill="#ffd166" />
          </g>
        ))}

        {/* Center Marble Pedestal Column */}
        <path
          d="M-40 18 L-28 -95 L28 -95 L40 18 Z"
          fill="url(#marble-carrara)"
          stroke="#75624b"
          strokeWidth="5"
        />
        <ellipse cy="18" rx="42" ry="12" fill="#b0a28f" />
        {/* Carved Acanthus Relief on Pedestal */}
        <path
          d="M-24 -40 Q0 -60 24 -40 M-20 -10 Q0 -30 20 -10"
          fill="none"
          stroke="#8c785d"
          strokeWidth="3"
        />

        {/* Upper Tier Scalloped Marble Basin */}
        <ellipse
          cy="-95"
          rx="100"
          ry="24"
          fill="url(#marble-carrara)"
          stroke="#75624b"
          strokeWidth="6"
        />
        <ellipse cy="-98" rx="90" ry="20" fill="url(#fountain-pool-water)" />

        {/* Overflowing Translucent Waterfall Cascades from Upper Bowl */}
        {[-65, -30, 0, 30, 65].map((wx) => (
          <path
            key={wx}
            d={`M${wx} -90 Q${wx + (wx > 0 ? 10 : -10)} -30 ${wx * 1.6} 16`}
            fill="none"
            stroke="#e0f7fa"
            strokeWidth="4"
            opacity="0.75"
          />
        ))}

        {/* Top Pedestal & Sculpted Golden Lion Bust */}
        <path
          d="M-22 -98 L-16 -170 L16 -170 L22 -98 Z"
          fill="url(#marble-carrara)"
          stroke="#75624b"
          strokeWidth="4"
        />

        {/* Sculpted Majestic Lion Head Statue */}
        <g transform="translate(0 -195)">
          {/* Gilded Lion Mane & Face */}
          <ellipse
            cx="0"
            cy="0"
            rx="34"
            ry="32"
            fill="#d4af37"
            stroke="#755a15"
            strokeWidth="3.5"
          />
          {/* Flared Mane Tufts */}
          {[-25, -15, 0, 15, 25].map((mx) => (
            <circle
              key={mx}
              cx={mx}
              cy="-18"
              r="10"
              fill="#e5c158"
              stroke="#755a15"
              strokeWidth="2"
            />
          ))}
          {/* Lion Ears */}
          <ellipse
            cx="-22"
            cy="-24"
            rx="8"
            ry="10"
            fill="#f59e0b"
            stroke="#755a15"
            strokeWidth="2"
          />
          <ellipse
            cx="22"
            cy="-24"
            rx="8"
            ry="10"
            fill="#f59e0b"
            stroke="#755a15"
            strokeWidth="2"
          />
          {/* Eyes & Snout */}
          <ellipse cx="-10" cy="-6" rx="5" ry="6" fill="#1a1a1a" />
          <ellipse cx="10" cy="-6" rx="5" ry="6" fill="#1a1a1a" />
          <polygon points="0,4 -6,-1 6,-1" fill="#78350f" />
          {/* Water Spout Opening in Mouth */}
          <ellipse cx="0" cy="12" rx="7" ry="5" fill="#1e3a8a" />
        </g>

        {/* Arching Water Jet Streams from Lion Spout */}
        <path
          d="M0 -183 Q-85 -245 -70 -95"
          fill="none"
          stroke="#e0f7fa"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M0 -183 Q85 -245 70 -95"
          fill="none"
          stroke="#e0f7fa"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Central High Plume */}
        <path
          d="M0 -183 Q0 -280 0 -195"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Water Spray Sparkle Dots */}
        {[-40, -15, 0, 15, 40].map((dx, i) => (
          <circle
            key={dx}
            cx={dx}
            cy={-210 + Math.sin(seconds * 6 + i) * 15}
            r="3"
            fill="#ffffff"
            opacity="0.85"
          />
        ))}

        {/* Gilded Dedicated Plaque on Fountain Rim */}
        <g transform="translate(0 50)">
          <rect
            x="-115"
            y="-14"
            width="230"
            height="28"
            rx="6"
            fill="#3b2314"
            stroke="#d4af37"
            strokeWidth="3"
          />
          <text
            y="5"
            textAnchor="middle"
            fontSize="14"
            fontFamily="Lilita One, sans-serif"
            fill="#ffd700"
            letterSpacing="2"
          >
            DOWNTOWN PLAZA
          </text>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 8. SPLASH OASIS GATEWAY (x=1420, y=530)                   */}
      {/* ========================================================= */}
      <g transform="translate(1420 530)">
        {/* Bamboo Posts */}
        <rect
          x="-55"
          y="-160"
          width="16"
          height="160"
          rx="4"
          fill="#a37844"
          stroke="#5c3f1c"
          strokeWidth="3"
        />
        <rect
          x="39"
          y="-160"
          width="16"
          height="160"
          rx="4"
          fill="#a37844"
          stroke="#5c3f1c"
          strokeWidth="3"
        />
        {/* Overhead Bamboo Crossbeam */}
        <rect
          x="-65"
          y="-175"
          width="130"
          height="20"
          rx="6"
          fill="#bfa06b"
          stroke="#5c3f1c"
          strokeWidth="3"
        />
        {/* Surfboards Flanking Gateway */}
        <ellipse
          cx="-47"
          cy="-70"
          rx="14"
          ry="60"
          fill="#06b6d4"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <path d="M-47 -130 V-10" stroke="#ffd166" strokeWidth="3" />
        <ellipse
          cx="47"
          cy="-70"
          rx="14"
          ry="60"
          fill="#ec4899"
          stroke="#db2777"
          strokeWidth="3"
        />
        <path d="M47 -130 V-10" stroke="#fef08a" strokeWidth="3" />
        {/* Tropical Sign */}
        <rect
          x="-50"
          y="-150"
          width="100"
          height="34"
          rx="6"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="3"
        />
        <text
          y="-128"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#0e7490"
        >
          SPLASH OASIS &rarr;
        </text>
      </g>

      {/* ========================================================= */}
      {/* 9. WONDER PARK ARCHWAY (x=1780, y=540) - Grand Carnival Gate */}
      {/* ========================================================= */}
      <g transform="translate(1780 540)">
        {/* View Through Gate to Theme Park Skyline */}
        <g opacity="0.6">
          <ellipse
            cx="0"
            cy="-140"
            rx="80"
            ry="110"
            fill="#fde68a"
            opacity="0.3"
          />
          <path
            d="M-50 -120 Q0 -220 50 -120"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="5"
          />
          <circle
            cx="0"
            cy="-180"
            r="30"
            fill="none"
            stroke="#ec4899"
            strokeWidth="4"
          />
        </g>

        {/* Grand Pylons Left & Right */}
        {[-95, 95].map((px) => (
          <g key={px} transform={`translate(${px} 0)`}>
            <rect
              x="-24"
              y="-310"
              width="48"
              height="310"
              rx="6"
              fill="url(#wonder-arch-crimson)"
              stroke="#6b1414"
              strokeWidth="5"
            />
            {/* Gold Leaf Bands & Moldings */}
            {[-280, -200, -120, -40].map((py) => (
              <rect
                key={py}
                x="-28"
                y={py}
                width="56"
                height="12"
                rx="3"
                fill="url(#wonder-pylon-gold)"
                stroke="#854d0e"
                strokeWidth="2"
              />
            ))}
            {/* Pylon Crown & Finials */}
            <polygon
              points="-30,-310 30,-310 0,-355"
              fill="url(#wonder-pylon-gold)"
              stroke="#854d0e"
              strokeWidth="3"
            />
            {/* Waving Gold & Red Flag */}
            <path
              d="M0 -355 V-385 M0 -385 Q18 -375 35 -385 Q18 -395 0 -400 Z"
              fill="#ef4444"
              stroke="#854d0e"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Grand Overhead Arch */}
        <path
          d="M-95 -260 Q0 -365 95 -260"
          fill="none"
          stroke="url(#wonder-arch-crimson)"
          strokeWidth="48"
          strokeLinecap="round"
        />
        <path
          d="M-95 -260 Q0 -365 95 -260"
          fill="none"
          stroke="url(#wonder-pylon-gold)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Glowing Marquee Chase Lightbulbs around Arch */}
        {Array.from({ length: 15 }, (_, i) => {
          const t = i / 14;
          const bx = -85 + t * 170;
          const by = -260 - Math.sin(t * Math.PI) * 78;
          const isLit = (i + marqueePhase) % 3 === 0;
          return (
            <circle
              key={i}
              cx={bx}
              cy={by}
              r={isLit ? 6.5 : 4.5}
              fill={isLit ? "#fffde0" : "#d97706"}
              stroke="#854d0e"
              strokeWidth="1.5"
              filter={isLit ? "drop-shadow(0px 0px 4px #ffd700)" : undefined}
            />
          );
        })}

        {/* Glowing Marquee Signboard */}
        <g transform="translate(0 -275)">
          <rect
            x="-85"
            y="-22"
            width="170"
            height="44"
            rx="10"
            fill="#871a1a"
            stroke="url(#wonder-pylon-gold)"
            strokeWidth="4"
          />
          <text
            y="7"
            textAnchor="middle"
            fontSize="20"
            fontFamily="Lilita One, sans-serif"
            fill="#fffbeb"
            letterSpacing="2"
          >
            WONDER PARK
          </text>
        </g>

        {/* Colorful Festive Bunting Strings Hanging Overhead */}
        <path
          d="M-95 -220 Q0 -195 95 -220"
          fill="none"
          stroke="#5c4d3c"
          strokeWidth="2.5"
        />
        {[-70, -45, -20, 5, 30, 55, 80].map((bx, i) => (
          <polygon
            key={bx}
            points={`${bx - 10},${-215 + Math.sin(i) * 5} ${bx + 10},${-215 + Math.sin(i) * 5} ${bx},${-195 + Math.sin(i) * 5}`}
            fill={
              ["#ef4444", "#3b82f6", "#eab308", "#10b981", "#ec4899"][i % 5]
            }
          />
        ))}
      </g>

      {/* ========================================================= */}
      {/* 10. SECRET SCOUT PHONE BOOTH (x=1960, y=540)             */}
      {/* ========================================================= */}
      <g transform="translate(1960 540)">
        <ellipse cx="0" cy="5" rx="42" ry="12" fill="#5c4d3c" opacity="0.4" />
        <rect
          x="-36"
          y="-210"
          width="72"
          height="210"
          rx="10"
          fill="#dc2626"
          stroke="#991b1b"
          strokeWidth="5"
        />
        {/* Curved Dome Roof */}
        <path
          d="M-40 -210 Q0 -245 40 -210 Z"
          fill="#b91c1c"
          stroke="#7f1d1d"
          strokeWidth="4"
        />
        <circle cx="0" cy="-225" r="5" fill="#ffd700" />
        {/* Telephone Glass Header */}
        <rect
          x="-30"
          y="-202"
          width="60"
          height="16"
          rx="3"
          fill="#ffffff"
          stroke="#7f1d1d"
          strokeWidth="1.5"
        />
        <text
          y="-190"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="#111"
          letterSpacing="1"
        >
          TELEPHONE
        </text>
        {/* Grid Glass Panes with Secret Glowing Amber Terminal Interior */}
        <rect
          x="-28"
          y="-180"
          width="56"
          height="170"
          rx="4"
          fill="#fef08a"
          opacity="0.8"
        />
        {[-140, -100, -60, -20].map((gy) => (
          <line
            key={gy}
            x1="-28"
            y1={gy}
            x2="28"
            y2={gy}
            stroke="#991b1b"
            strokeWidth="3"
          />
        ))}
        <line
          x1="0"
          y1="-180"
          x2="0"
          y2="-10"
          stroke="#991b1b"
          strokeWidth="3"
        />
      </g>

      {/* ========================================================= */}
      {/* 11. CANOPY CAFÉ (x=2290, y=530) - Mediterranean Bistro   */}
      {/* ========================================================= */}
      <g transform="translate(2290 530)">
        {/* Main Stucco Body */}
        <rect
          x="-150"
          y="-360"
          width="300"
          height="360"
          rx="10"
          fill="url(#cafe-stucco)"
          stroke="#8c6849"
          strokeWidth="6"
        />

        {/* Terracotta Tile Pitch Roof */}
        <polygon
          points="-170,-360 0,-445 170,-360"
          fill="url(#cafe-terracotta-roof)"
          stroke="#7c2d12"
          strokeWidth="5"
        />
        {/* Tile Ridges */}
        {[-120, -80, -40, 0, 40, 80, 120].map((rx) => (
          <line
            key={rx}
            x1={rx}
            y1="-360"
            x2="0"
            y2="-445"
            stroke="#f97316"
            strokeWidth="3"
            opacity="0.4"
          />
        ))}

        {/* Second Floor Round Timber Gable Window */}
        <circle
          cx="0"
          cy="-330"
          r="28"
          fill="#fff7e0"
          stroke="#78350f"
          strokeWidth="4"
        />
        <path
          d="M-28 -330 H28 M0 -358 V-302"
          stroke="#78350f"
          strokeWidth="3"
        />

        {/* Ground Floor Arched Bistro Windows with Warm Amber Glow */}
        <rect
          x="-125"
          y="-200"
          width="250"
          height="200"
          rx="6"
          fill="#451a03"
          stroke="#78350f"
          strokeWidth="4"
        />
        <rect
          x="-115"
          y="-190"
          width="105"
          height="135"
          rx="5"
          fill="#fef3c7"
          opacity="0.9"
        />
        <rect
          x="10"
          y="-190"
          width="105"
          height="135"
          rx="5"
          fill="#fef3c7"
          opacity="0.9"
        />

        {/* Window Bakery Display: Croissants & Espresso Machine */}
        <g transform="translate(-62 -110)">
          {/* Glass Vitrine Stand */}
          <rect
            x="-35"
            y="-10"
            width="70"
            height="20"
            rx="3"
            fill="#ffffff"
            opacity="0.6"
            stroke="#b45309"
            strokeWidth="1.5"
          />
          {/* Croissants */}
          <ellipse cx="-16" cy="-14" rx="12" ry="7" fill="#d97706" />
          <ellipse cx="16" cy="-14" rx="12" ry="7" fill="#d97706" />
        </g>
        <g transform="translate(62 -110)">
          {/* Espresso Machine */}
          <rect
            x="-24"
            y="-35"
            width="48"
            height="40"
            rx="4"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <rect x="-16" y="-28" width="32" height="14" fill="#e2e8f0" />
          {/* Steam Swirl */}
          <path
            d="M-5 -40 Q-10 -55 -2 -65 M5 -40 Q0 -55 8 -65"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            opacity="0.6"
            strokeLinecap="round"
          />
        </g>

        {/* Timber Entrance Door */}
        <g transform="translate(0 0)">
          <rect
            x="-35"
            y="-140"
            width="70"
            height="140"
            fill="#582f16"
            stroke="#92400e"
            strokeWidth="3.5"
          />
          <rect
            x="-25"
            y="-125"
            width="50"
            height="60"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
          />
          <circle
            cx="22"
            cy="-65"
            r="5"
            fill="#ffd700"
            stroke="#78350f"
            strokeWidth="1.5"
          />
        </g>

        {/* Apricot & Cream Striped Scalloped Awning */}
        <g transform="translate(0 -205)">
          <polygon
            points="-145,0 -155,42 155,42 145,0"
            fill="#ea580c"
            stroke="#9a3412"
            strokeWidth="3"
          />
          {/* Alternating Cream Stripes */}
          {[-110, -50, 10, 70, 130].map((ax) => (
            <polygon
              key={ax}
              points={`${ax - 20},0 ${ax - 25},42 ${ax},42 ${ax + 5},0`}
              fill="#fef08a"
            />
          ))}
          {/* Scalloped Edge */}
          {[-130, -90, -50, -10, 30, 70, 110, 150].map((sx) => (
            <path
              key={sx}
              d={`M${sx - 20} 42 Q${sx} 56 ${sx + 20} 42`}
              fill="#f97316"
              stroke="#9a3412"
              strokeWidth="2"
            />
          ))}
        </g>

        {/* Rustic Wooden Signboard: CANOPY CAFÉ */}
        <g transform="translate(0 -252)">
          <rect
            x="-110"
            y="-24"
            width="220"
            height="48"
            rx="8"
            fill="#451a03"
            stroke="#d97706"
            strokeWidth="4"
          />
          <text
            y="6"
            textAnchor="middle"
            fontSize="24"
            fontFamily="Lilita One, sans-serif"
            fill="#fef08a"
            letterSpacing="2"
          >
            CANOPY CAF&Eacute;
          </text>
          <text
            y="18"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#fdba74"
            letterSpacing="3"
          >
            BAKERY &middot; SMOOTHIES &middot; ROASTS
          </text>
        </g>

        {/* Outdoor Bistro Table & Chairs on Sidewalk */}
        <g transform="translate(-85 45)">
          <ellipse
            cx="0"
            cy="8"
            rx="28"
            ry="10"
            fill="#5c4d3c"
            opacity="0.35"
          />
          {/* Cast Iron Bistro Table */}
          <ellipse
            cx="0"
            cy="-22"
            rx="24"
            ry="9"
            fill="#fef3c7"
            stroke="#78350f"
            strokeWidth="2.5"
          />
          <line
            x1="0"
            y1="-14"
            x2="0"
            y2="8"
            stroke="#78350f"
            strokeWidth="4"
          />
          {/* Coffee Mug on Table */}
          <rect x="-6" y="-30" width="12" height="10" rx="2" fill="#ef4444" />
          <ellipse cx="0" cy="-30" rx="6" ry="2.5" fill="#451a03" />
        </g>
        {/* Chalkboard Easel Menu */}
        <g transform="translate(85 30) scale(0.9)">
          <polygon
            points="-22,-50 22,-50 28,10 -28,10"
            fill="#1e293b"
            stroke="#78350f"
            strokeWidth="3"
          />
          <line
            x1="0"
            y1="-50"
            x2="0"
            y2="12"
            stroke="#78350f"
            strokeWidth="2"
          />
          <text
            y="-32"
            textAnchor="middle"
            fontSize="8"
            fill="#fef08a"
            fontWeight="bold"
          >
            SMOOTHIES
          </text>
          <text y="-20" textAnchor="middle" fontSize="7" fill="#cbd5e1">
            &middot; MANGO &middot;
          </text>
          <text y="-9" textAnchor="middle" fontSize="7" fill="#cbd5e1">
            &middot; BERRY &middot;
          </text>
        </g>
      </g>

      {/* ========================================================= */}
      {/* 12. VICTORIAN TRIPLE-LANTERN GAS LAMPPOSTS                */}
      {/* ========================================================= */}
      {[340, 920, 1540, 2120].map((lx) => (
        <g key={lx} transform={`translate(${lx} 530)`}>
          {/* Large Warm Amber Glow Pool on Promenade Ground */}
          <ellipse cx="0" cy="5" rx="140" ry="34" fill="url(#dt-lamp-glow)" />

          {/* Cast Iron Ornate Column & Base */}
          <ellipse cx="0" cy="2" rx="22" ry="7" fill="#1e293b" />
          <path
            d="M-12 2 L-6 -260 L6 -260 L12 2 Z"
            fill="#334155"
            stroke="#0f172a"
            strokeWidth="3"
          />

          {/* Crossbars for Triple Lanterns */}
          <path
            d="M-40 -235 Q0 -250 40 -235"
            fill="none"
            stroke="#0f172a"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Center Lantern */}
          <g transform="translate(0 -265)">
            <circle cx="0" cy="0" r="32" fill="url(#dt-lamp-glow)" />
            <polygon
              points="-12,-16 12,-16 8,14 -8,14"
              fill="#fffbeb"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <polygon
              points="-16,-16 16,-16 0,-28"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
          {/* Left Lantern */}
          <g transform="translate(-40 -235)">
            <circle cx="0" cy="0" r="24" fill="url(#dt-lamp-glow)" />
            <polygon
              points="-9,-12 9,-12 6,10 -6,10"
              fill="#fffbeb"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <polygon
              points="-12,-12 12,-12 0,-22"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
          {/* Right Lantern */}
          <g transform="translate(40 -235)">
            <circle cx="0" cy="0" r="24" fill="url(#dt-lamp-glow)" />
            <polygon
              points="-9,-12 9,-12 6,10 -6,10"
              fill="#fffbeb"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <polygon
              points="-12,-12 12,-12 0,-22"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
        </g>
      ))}

      {/* ========================================================= */}
      {/* 13. PROMENADE TROPICAL TREES & PLANTERS                   */}
      {/* ========================================================= */}
      {[20, 420, 1020, 1340, 1660, 2380].map((px, i) => (
        <g
          key={px}
          transform={`translate(${px} 535) scale(${i % 2 === 0 ? 0.95 : 1.1})`}
        >
          {/* Terracotta Decorative Planter Urn */}
          <ellipse cx="0" cy="2" rx="26" ry="8" fill="#5c4d3c" opacity="0.35" />
          <polygon
            points="-22,0 -16,-34 16,-34 22,0"
            fill="#c2633d"
            stroke="#7c2d12"
            strokeWidth="3"
          />
          <ellipse cx="0" cy="-34" rx="18" ry="6" fill="#451a03" />

          {/* Lush Tropical Fan Palm & Fronds */}
          <path
            d="M0 -34 Q-35 -75 -65 -65 Q-35 -55 0 -34"
            fill="#2d6a4f"
            stroke="#1b4332"
            strokeWidth="2"
          />
          <path
            d="M0 -34 Q35 -75 65 -65 Q35 -55 0 -34"
            fill="#2d6a4f"
            stroke="#1b4332"
            strokeWidth="2"
          />
          <path
            d="M0 -34 Q-25 -95 -45 -115 Q-15 -85 0 -34"
            fill="#40916c"
            stroke="#1b4332"
            strokeWidth="2"
          />
          <path
            d="M0 -34 Q25 -95 45 -115 Q15 -85 0 -34"
            fill="#40916c"
            stroke="#1b4332"
            strokeWidth="2"
          />
          <path
            d="M0 -34 Q0 -110 0 -130 Q10 -90 0 -34"
            fill="#52b788"
            stroke="#1b4332"
            strokeWidth="2"
          />

          {/* Exotic Orange Bird-of-Paradise Blooms */}
          <polygon points="0,-85 -10,-105 5,-98" fill="#f97316" />
          <polygon points="5,-90 15,-110 0,-100" fill="#f59e0b" />
        </g>
      ))}
    </g>
  );
}

export default DowntownPlazaScenery;
