import { memo } from "react";

export const NeighborhoodArcadeScenery = memo(
  function NeighborhoodArcadeScenery() {
    return (
      <>
        <path fill="#4c5878" d="M0 0H1920V720H0Z" />
        <path d="M0 0H1920L1780 120H140Z" fill="#394964" />
        <path d="M140 120H1780V530H140Z" fill="#6e7896" />
        <path d="M140 120V530L0 620V0M1780 120V530L1920 620V0" fill="#56627e" />
        <path d="M0 530H1920V720H0Z" fill="#bf9b9b" />
        {[550, 590, 645, 715].map((y) => (
          <path key={y} d={`M0 ${y}H1920`} stroke="#997f91" strokeWidth="3" />
        ))}
        {[0, 240, 480, 720, 960, 1200, 1440, 1680, 1920].map((x) => (
          <path
            key={x}
            d={`M${960 + (x - 960) * 0.7} 530L${x} 720`}
            stroke="#997f91"
            strokeWidth="3"
          />
        ))}
        <rect
          x="530"
          y="35"
          width="860"
          height="112"
          rx="40"
          fill="#e5a05c"
          stroke="#f4d7a4"
          strokeWidth="8"
        />
        <text x="960" y="113" fontSize="70" textAnchor="middle" fill="#343e5e">
          THE ARCADE
        </text>
        <path d="M175 177H1745M175 192H1745" stroke="#f4c983" strokeWidth="5" />
        <g fill="#fce9b4">
          {[235, 480, 725, 970, 1215, 1460, 1705].map((x) => (
            <g key={x} transform={`translate(${x} 178)`}>
              <g className="sm-twinkle">
                <circle r="10" />
              </g>
            </g>
          ))}
        </g>
        <path d="M180 220H1110V540H180Z" fill="#3c4966" />
        <path d="M180 220h930v28H180Z" fill="#8c9fa5" />
        <g transform="translate(1490 405)">
          <path
            d="M0 110l50-110h180l60 110Z"
            fill="#394760"
            stroke="#c3d9cf"
            strokeWidth="5"
          />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <path
                key={`${row}-${col}`}
                className="sm-pulse"
                d={`M${45 + col * 65 - row * 10} ${25 + row * 28}h52l10 20h-65Z`}
                fill={["#e9b273", "#91c7b7", "#d5a6bd"][(row + col) % 3]}
              />
            )),
          )}
        </g>
        <g transform="translate(1170 245)">
          <path d="M0 0h210v75H0Z" fill="#e6c38f" />
          <text x="105" y="48" textAnchor="middle" fontSize="29" fill="#35435d">
            SURPRISES
          </text>
        </g>
        <g transform="translate(65 330)">
          <path
            d="M0 0h135v190H0Z"
            fill="#c38865"
            stroke="#f4d9aa"
            strokeWidth="6"
          />
          <path d="M25 32h85v75H25Z" fill="#4d5f6b" />
          <path
            d="M40 83l16-30 17 20 20-35"
            fill="none"
            stroke="#efd78c"
            strokeWidth="7"
          />
          <text x="66" y="151" textAnchor="middle" fontSize="20" fill="#2e3e55">
            SCORES
          </text>
        </g>
        <g fill="#ead2a3">
          {[240, 1200, 1760].map((x) => (
            <path
              key={x}
              d={`M${x} 595l8 17 19 3-14 14 3 19-16-9-17 9 4-19-14-14 19-3Z`}
            />
          ))}
        </g>
      </>
    );
  },
);
