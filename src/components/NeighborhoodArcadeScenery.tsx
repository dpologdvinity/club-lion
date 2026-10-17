import { memo } from "react";
import { ARCADE_WIDTH as W } from "../rooms/manifests/neighborhoodArcade.ts";

const MID = W / 2;
const LIGHTS = Array.from(
  { length: Math.floor((W - 400) / 245) + 1 },
  (_, i) => 235 + i * 245,
);
const FLOOR_LINES = Array.from(
  { length: Math.floor(W / 240) + 1 },
  (_, i) => i * 240,
);
const STARS = [240, 1200, 1760, 2600, 3400, 4300, 4960];

function Neon({ x, text, color }: { x: number; text: string; color: string }) {
  return (
    <g>
      <rect
        x={x - 300}
        y="45"
        width="600"
        height="90"
        rx="34"
        fill="#343e5e"
        stroke={color}
        strokeWidth="7"
      />
      <text
        x={x}
        y="108"
        fontSize="52"
        fontWeight="900"
        textAnchor="middle"
        fill={color}
      >
        {text}
      </text>
    </g>
  );
}

export const NeighborhoodArcadeScenery = memo(
  function NeighborhoodArcadeScenery() {
    return (
      <>
        <path fill="#4c5878" d={`M0 0H${W}V720H0Z`} />
        <path d={`M0 0H${W}L${W - 140} 120H140Z`} fill="#394964" />
        <path d={`M140 120H${W - 140}V530H140Z`} fill="#6e7896" />
        <path
          d={`M140 120V530L0 620V0M${W - 140} 120V530L${W} 620V0`}
          fill="#56627e"
        />
        <path d={`M0 530H${W}V720H0Z`} fill="#bf9b9b" />
        {[550, 590, 645, 715].map((y) => (
          <path key={y} d={`M0 ${y}H${W}`} stroke="#997f91" strokeWidth="3" />
        ))}
        {FLOOR_LINES.map((x) => (
          <path
            key={x}
            d={`M${MID + (x - MID) * 0.85} 530L${x} 720`}
            stroke="#997f91"
            strokeWidth="3"
          />
        ))}
        <rect
          x={MID - 430}
          y="35"
          width="860"
          height="112"
          rx="40"
          fill="#e5a05c"
          stroke="#f4d7a4"
          strokeWidth="8"
        />
        <text x={MID} y="113" fontSize="70" textAnchor="middle" fill="#343e5e">
          THE ARCADE
        </text>
        <Neon x={1200} text="PLAY ALL DAY" color="#ff8fab" />
        <Neon x={W - 1200} text="GAMES GALORE" color="#7fe0d0" />
        <path
          d={`M175 177H${W - 175}M175 192H${W - 175}`}
          stroke="#f4c983"
          strokeWidth="5"
        />
        <g fill="#fce9b4">
          {LIGHTS.map((x, i) => (
            <g key={x} transform={`translate(${x} 178)`}>
              <g
                className="sm-twinkle"
                style={{ "--sm-delay": `${-(i % 5) * 0.4}s` }}
              >
                <circle r="10" />
              </g>
            </g>
          ))}
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
          {STARS.map((x) => (
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
