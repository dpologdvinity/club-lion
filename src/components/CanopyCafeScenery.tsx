import { mat } from "./MaterialDefs";
import { memo } from "react";

export const CanopyCafeScenery = memo(function CanopyCafeScenery() {
  return (
    <>
      <path fill="#b9d5a2" d="M0 0H1920V720H0Z" />
      <path
        d="M0 160Q250 15 480 130T1000 100T1500 110T1920 60V540H0Z"
        fill="#71976b"
      />
      <path
        d="M0 160Q250 15 480 130T1000 100T1500 110T1920 60V540H0Z"
        fill={mat("leaves")}
      />
      {[80, 380, 1510, 1820].map((x) => (
        <g key={x}>
          <path
            d={`M${x - 40} 530Q${x + 20} 280 ${x - 30} 0H${x + 75}Q${x + 40} 280 ${x + 90} 530Z`}
            fill="#6b6540"
          />
          <g className="sm-sway" fill="#41694c">
            <ellipse cx={x} cy="45" rx="220" ry="110" />
          </g>
        </g>
      ))}
      <path d="M90 175H1840V540H90Z" fill="#e6c991" />
      <path d="M90 175H1840V540H90Z" fill={mat("wood")} />
      <path d="M120 200H1810V500H120Z" fill="#f4dfb5" />
      <path d="M120 200H1810V500H120Z" fill={mat("plaster")} />
      {[220, 710, 1450].map((x) => (
        <g key={x}>
          <path
            d={`M${x} 240h230v170H${x}Z`}
            fill="#91b98a"
            stroke="#a0794c"
            strokeWidth="14"
          />
          <path
            d={`M${x + 115} 240v170M${x} 325h230`}
            stroke="#c4a16c"
            strokeWidth="8"
          />
          <path
            d={`M${x + 10} 390q90-100 210-70v80H${x + 10}Z`}
            fill="#638956"
          />
        </g>
      ))}
      <path d="M30 205L220 60H1700L1900 205Z" fill="#355f49" />
      <path d="M30 205L220 60H1700L1900 205Z" fill={mat("planks")} />
      <path
        d="M30 205H1900V232Q1860 260 1820 232Q1780 260 1740 232Q1700 260 1660 232H270Q225 260 180 232Q130 260 80 232H30Z"
        fill="#5b8c5b"
      />
      <path
        d="M30 205H1900V232Q1860 260 1820 232Q1780 260 1740 232Q1700 260 1660 232H270Q225 260 180 232Q130 260 80 232H30Z"
        fill={mat("fabric")}
      />
      <rect
        x="710"
        y="100"
        width="500"
        height="95"
        rx="24"
        fill="#e5b368"
        stroke="#263f30"
        strokeWidth="6"
      />
      <rect
        x="710"
        y="100"
        width="500"
        height="95"
        rx="24"
        fill={mat("wood")}
      />
      <text x="960" y="163" textAnchor="middle" fontSize="49" fill="#334d36">
        CANOPY CAFÉ
      </text>
      <path d="M0 525H1920V720H0Z" fill="#bb8c58" />
      <path d="M0 525H1920V720H0Z" fill={mat("planks")} />
      {[545, 590, 640, 695].map((y) => (
        <path key={y} d={`M0 ${y}H1920`} stroke="#997044" strokeWidth="4" />
      ))}
      {[180, 520, 860, 1200, 1540, 1880].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${i % 2 ? 545 : 590}v${i % 2 ? 95 : 105}`}
          stroke="#997044"
          strokeWidth="4"
        />
      ))}
      <path d="M350 450H1450V545H350Z" fill="#855a3d" />
      <path d="M350 450H1450V545H350Z" fill={mat("wood")} />
      <path d="M330 442H1470V465H330Z" fill="#f1be78" />
      <path d="M330 442H1470V465H330Z" fill={mat("wood")} />
      {[405, 680, 1060, 1390].map((x) => (
        <path key={x} d={`M${x} 480v48`} stroke="#b78250" strokeWidth="6" />
      ))}
      <g transform="translate(1610 415)">
        <ellipse cx="0" cy="0" rx="110" ry="24" fill="#d9a366" />
        <path d="M-12 15v125h24V15" fill="#805a3b" />
        <path
          d="M-85 145q85-35 170 0"
          stroke="#805a3b"
          strokeWidth="15"
          fill="none"
        />
      </g>
      <path
        d="M180 25Q960 300 1740 25"
        stroke="#384f32"
        strokeWidth="5"
        fill="none"
      />
      {[240, 480, 720, 960, 1200, 1440, 1680].map((x, i) => (
        <g
          key={x}
          transform={`translate(${x} ${70 + 75 * Math.sin((i / 6) * Math.PI)})`}
        >
          <g className="sm-sway">
            <path d="M0 0v28" stroke="#384f32" strokeWidth="3" />
            <path
              d="M-16 28Q-25 60 0 75Q25 60 16 28Z"
              fill="#ffe4a2"
              stroke="#9c773e"
              strokeWidth="3"
            />
          </g>
        </g>
      ))}
      {[150, 1770].map((x) => (
        <g key={x} transform={`translate(${x} 525)`}>
          <path d="M-45-40h90l-15 60h-60Z" fill="#b76a45" />
          <g className="sm-sway" fill="#497646">
            <path d="M0-35Q-90-70-60-120Q0-100 0-35Q5-140 60-135Q90-70 0-35Z" />
          </g>
        </g>
      ))}
    </>
  );
});
