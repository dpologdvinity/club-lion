import { memo } from "react";
import { mat } from "./MaterialDefs";
import { GAME_HALL_WIDTH as W } from "../rooms/manifests/gameHall.ts";

const FLOOR_TOP = 535;
const BULB_COLORS = ["#ff5a8a", "#ffd23f", "#4fc3ff", "#7be36a", "#b98cff"];

// String lights swagged along the ceiling.
const BULBS = Array.from({ length: Math.ceil(W / 50) }, (_, i) => {
  const x = 25 + i * 50;
  const swag = Math.sin(((i % 12) / 12) * Math.PI) * 30;
  return { x, y: 34 + swag, color: BULB_COLORS[i % BULB_COLORS.length] };
});

// Big glossy stars on the wall, every 300 px.
const STARS = Array.from({ length: Math.floor(W / 300) }, (_, i) => ({
  x: 150 + i * 300,
  y: i % 2 ? 150 : 110,
  r: i % 3 === 0 ? 34 : 24,
}));

const star = (x: number, y: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? "L" : "M"}${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr}`;
  }).join("") + "Z";

export function GameHallScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <GameHallStage />;
}

/** A bright Fantage-style game hall: sky-blue walls, stars, a checker floor. */
const GameHallStage = memo(function GameHallStage() {
  return (
    <g>
      <defs>
        <linearGradient id="hall-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc8ff" />
          <stop offset="1" stopColor="#c9ecff" />
        </linearGradient>
        <pattern
          id="hall-checks"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <rect width="120" height="120" fill="#8a5ae0" />
          <rect width="60" height="60" fill="#5fd0c8" />
          <rect x="60" y="60" width="60" height="60" fill="#5fd0c8" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={W} height={FLOOR_TOP} fill="url(#hall-wall)" />
      {/* Wavy candy trim along the top of the wainscot */}
      <rect x="0" y="400" width={W} height={FLOOR_TOP - 400} fill="#ffb3d1" />
      <path
        d={`M0 400${Array.from({ length: Math.ceil(W / 60) }, () => "q15 -16 30 0q15 16 30 0").join("")}V410H0Z`}
        fill="#ff7ab0"
      />
      {STARS.map((s, i) => (
        <path
          key={i}
          className="sm-twinkle"
          style={{ "--sm-delay": `${-(i % 5) * 0.4}s` }}
          d={star(s.x, s.y, s.r)}
          fill="#fff3a0"
          stroke="#ffc83a"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      ))}
      {/* Sign over the arcade door */}
      <rect
        x="70"
        y="190"
        width="200"
        height="70"
        rx="18"
        fill="#2366c2"
        stroke="#ffffff"
        strokeWidth="6"
      />
      <text
        x="170"
        y="238"
        fontSize="34"
        fontWeight="900"
        fill="#ffffff"
        textAnchor="middle"
      >
        GAME HALL
      </text>
      {/* Doorway back to the arcade */}
      <path
        d="M95 535V340Q95 290 170 290Q245 290 245 340V535Z"
        fill="#143e84"
      />
      <path
        d="M110 535V345Q110 305 170 305Q230 305 230 345V535Z"
        fill="#2d72c8"
      />
      {BULBS.map((b) => (
        <circle key={b.x} cx={b.x} cy={b.y} r="9" fill={b.color} />
      ))}
      <path
        d={`M0 30${BULBS.map((b) => `L${b.x} ${b.y - 8}`).join("")}`}
        fill="none"
        stroke="#2a3a5a"
        strokeWidth="2"
      />
      <rect
        x="0"
        y={FLOOR_TOP}
        width={W}
        height={720 - FLOOR_TOP}
        fill="url(#hall-checks)"
      />
      <rect
        x="0"
        y={FLOOR_TOP}
        width={W}
        height={720 - FLOOR_TOP}
        fill={mat("tile")}
      />
      <rect x="0" y={FLOOR_TOP - 6} width={W} height="10" fill="#ffffff" />
    </g>
  );
});
