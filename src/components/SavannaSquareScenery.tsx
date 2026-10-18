import { memo } from "react";

/**
 * Savanna Square in the flat, outlined Fantage style: bright sky and hills,
 * the café on the left, the treehouse at the back, the shop hut on the right,
 * stone paths, a lawn and the lily pond. Interactive things (fountain, tree,
 * bushes, doors, flowers) draw themselves on top as room objects, so the
 * buildings stand where their doors are (café 230, shop 1300, park 1460).
 */
export function SavannaSquareScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <SquareStage />;
}

const INK = "#4a3424";
const line = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" } as const;

/** A round, flat cartoon tree. */
function Tree({
  x,
  y,
  r,
  tone,
}: {
  x: number;
  y: number;
  r: number;
  tone: string;
}) {
  return (
    <g>
      <path
        d={`M${x - 8} ${y}V${y - r * 0.9}H${x + 8}V${y}Z`}
        fill="#9a6a3a"
        {...line}
      />
      <circle cx={x} cy={y - r * 1.3} r={r} fill={tone} {...line} />
      <circle
        cx={x - r * 0.35}
        cy={y - r * 1.55}
        r={r * 0.35}
        fill="#ffffff44"
      />
    </g>
  );
}

const SquareStage = memo(function SquareStage() {
  return (
    <g>
      <defs>
        <linearGradient id="sq-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6cc4ff" />
          <stop offset="1" stopColor="#c9ecff" />
        </linearGradient>
        <linearGradient id="sq-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fdc5a" />
          <stop offset="1" stopColor="#6cc248" />
        </linearGradient>
        <pattern
          id="sq-stones"
          width="60"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <rect width="60" height="40" fill="#f2deb0" />
          <path
            d="M0 20H60M30 0V20M10 20V40M50 20V40"
            stroke="#d8bf88"
            strokeWidth="3"
          />
        </pattern>
      </defs>

      {/* Sky, clouds and hills */}
      <rect width="1536" height="864" fill="url(#sq-sky)" />
      <g fill="#ffffff" {...line} strokeWidth={3}>
        <path
          className="sm-drift"
          d="M180 70a28 28 0 0 1 50 -14a34 34 0 0 1 62 8a24 24 0 0 1 -6 44H186a22 22 0 0 1 -6 -38Z"
        />
        <path
          className="sm-drift"
          style={{ "--sm-delay": "-6s" }}
          d="M1180 50a26 26 0 0 1 46 -12a32 32 0 0 1 58 8a22 22 0 0 1 -6 40H1186a20 20 0 0 1 -6 -36Z"
        />
      </g>
      <path
        d="M0 200Q180 120 360 190T760 170T1160 180T1536 160V300H0Z"
        fill="#a8e070"
        {...line}
      />
      <path
        d="M0 250Q260 190 520 240T1040 230T1536 220V320H0Z"
        fill="#7fd05a"
        {...line}
      />
      <Tree x={540} y={260} r={42} tone="#5cc04a" />
      <Tree x={1060} y={250} r={38} tone="#4fb044" />

      {/* Lawn and stone paths */}
      <path d="M0 280H1536V864H0Z" fill="url(#sq-grass)" />
      <path
        d="M120 470Q420 420 620 440Q760 455 900 440Q1130 420 1420 450L1430 520Q1130 500 920 520Q760 535 600 520Q400 505 130 545Z"
        fill="url(#sq-stones)"
        {...line}
      />
      <path
        d="M700 520Q690 660 760 864H900Q860 660 880 520Z"
        fill="url(#sq-stones)"
        {...line}
      />
      <path
        d="M760 300Q770 380 740 440H900Q880 380 860 300Z"
        fill="url(#sq-stones)"
        {...line}
      />
      {/* Grass tufts */}
      <g fill="#5cb83e">
        {[
          [260, 600],
          [470, 780],
          [620, 640],
          [1040, 780],
          [980, 600],
          [180, 760],
        ].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y}l8 -18l6 18l8 -14l4 14Z`} />
        ))}
      </g>

      {/* Treehouse at the back */}
      <g>
        <path
          d="M690 250V90Q700 60 730 52H870Q900 60 910 90V250Z"
          fill="#b07a46"
          {...line}
        />
        <path d="M650 96Q800 -30 950 96Z" fill="#e8673a" {...line} />
        <rect
          x="725"
          y="120"
          width="54"
          height="60"
          rx="26"
          fill="#7cd0f0"
          {...line}
        />
        <rect
          x="821"
          y="120"
          width="54"
          height="60"
          rx="26"
          fill="#7cd0f0"
          {...line}
        />
        <path d="M772 250V200H828V250" fill="#6a4220" {...line} />
      </g>

      {/* The fountain in the middle of the square */}
      <g>
        <ellipse cx="790" cy="400" rx="170" ry="52" fill="#e8d8b8" {...line} />
        <ellipse cx="790" cy="392" rx="140" ry="38" fill="#4fc0e8" {...line} />
        <path d="M760 392V320H820V392" fill="#e8d8b8" {...line} />
        <ellipse cx="790" cy="320" rx="70" ry="18" fill="#e8d8b8" {...line} />
        <ellipse cx="790" cy="316" rx="54" ry="11" fill="#4fc0e8" />
        <path
          d="M780 316V280H800V316"
          fill="#e8d8b8"
          {...line}
          strokeWidth={3}
        />
        <g
          className="sm-pulse"
          fill="none"
          stroke="#bff0ff"
          strokeWidth="5"
          strokeLinecap="round"
        >
          <path d="M790 276Q750 280 742 316" />
          <path d="M790 276Q830 280 838 316" />
          <path d="M790 276V256" />
        </g>
        <ellipse cx="740" cy="392" rx="22" ry="7" fill="#4fb044" />
        <ellipse cx="850" cy="398" rx="18" ry="6" fill="#4fb044" />
      </g>

      {/* Café on the left */}
      <g>
        <path d="M40 410V170H420V410Z" fill="#fff4dc" {...line} />
        <path d="M20 180L230 70L440 180Z" fill="#e8673a" {...line} />
        <path d="M30 250H430L410 290H50Z" fill="#4fb044" {...line} />
        <path
          d="M70 250V290M130 250V290M190 250V290M250 250V290M310 250V290M370 250V290"
          stroke="#ffffff"
          strokeWidth="10"
        />
        <rect
          x="70"
          y="190"
          width="80"
          height="50"
          rx="8"
          fill="#7cd0f0"
          {...line}
        />
        <rect
          x="300"
          y="190"
          width="80"
          height="50"
          rx="8"
          fill="#7cd0f0"
          {...line}
        />
        <rect
          x="150"
          y="96"
          width="160"
          height="44"
          rx="12"
          fill="#ffffff"
          {...line}
        />
        <text
          x="230"
          y="128"
          fontSize="28"
          fontWeight="900"
          fill="#e8673a"
          textAnchor="middle"
        >
          CAFÉ
        </text>
        <circle cx="110" cy="360" r="34" fill="#ff9a3a" {...line} />
        <path d="M110 360V410" stroke={INK} strokeWidth="5" />
      </g>

      {/* Shop hut on the right */}
      <g>
        <path d="M1110 400V200H1490V400Z" fill="#ffe0a8" {...line} />
        <path d="M1080 210Q1300 40 1520 210Z" fill="#f2c040" {...line} />
        <path d="M1110 260H1490L1470 296H1130Z" fill="#ff7a8a" {...line} />
        <path
          d="M1150 260V296M1210 260V296M1270 260V296M1330 260V296M1390 260V296M1450 260V296"
          stroke="#ffffff"
          strokeWidth="10"
        />
        <rect
          x="1210"
          y="140"
          width="180"
          height="44"
          rx="12"
          fill="#ffffff"
          {...line}
        />
        <text
          x="1300"
          y="172"
          fontSize="28"
          fontWeight="900"
          fill="#ff5a8a"
          textAnchor="middle"
        >
          LE SHOP
        </text>
        <path
          d="M1140 320h50v60h-50Z M1420 320h50v60h-50Z"
          fill="#c99aff"
          {...line}
        />
      </g>

      {/* Lily pond, bottom right */}
      <g>
        <ellipse
          cx="1300"
          cy="640"
          rx="200"
          ry="110"
          fill="#d8c8a8"
          {...line}
        />
        <ellipse cx="1300" cy="640" rx="170" ry="84" fill="#4fc0e8" {...line} />
        <ellipse
          className="sm-pulse"
          cx="1260"
          cy="630"
          rx="40"
          ry="10"
          fill="none"
          stroke="#bff0ff"
          strokeWidth="4"
        />
        {[
          [1220, 660],
          [1360, 610],
          [1330, 690],
        ].map(([x, y]) => (
          <path
            key={x}
            d={`M${x} ${y}a18 10 0 1 0 1 0Z`}
            fill="#4fb044"
            {...line}
            strokeWidth={3}
          />
        ))}
        {[
          [1110, 600],
          [1480, 640],
          [1170, 730],
          [1440, 720],
        ].map(([x, y]) => (
          <ellipse
            key={x}
            cx={x}
            cy={y}
            rx="34"
            ry="22"
            fill="#c8c0b8"
            {...line}
          />
        ))}
      </g>

      {/* Notice board, bottom left */}
      <g>
        <path d="M40 690V600H220V690" fill="#b07a46" {...line} />
        <rect
          x="56"
          y="612"
          width="148"
          height="66"
          rx="6"
          fill="#fff4dc"
          {...line}
          strokeWidth={3}
        />
        <path
          d="M70 630H190M70 646H170M70 662H150"
          stroke="#c8a878"
          strokeWidth="4"
        />
      </g>
    </g>
  );
});
