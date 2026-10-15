import type { ReactNode } from "react";
import type { PictureId } from "../utils/picturePuzzle.ts";
import { PUZZLE_HEIGHT, PUZZLE_WIDTH } from "../utils/picturePuzzle.ts";

const GONDOLAS = ["#ff5f7e", "#ffb347", "#ffd84d", "#4cc97a", "#4aa8ff"];

/*
 * Each picture is drawn once in a hidden <defs>; every puzzle piece then
 * shows its own crop of that drawing with <use>. Art stays in picture units.
 */
function SavannaLion() {
  return (
    <>
      <linearGradient id="pp-sky-lion" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffd8a8" />
        <stop offset="1" stopColor="#ffb36b" />
      </linearGradient>
      <rect
        width={PUZZLE_WIDTH}
        height={PUZZLE_HEIGHT}
        fill="url(#pp-sky-lion)"
      />
      <circle cx="312" cy="70" r="42" fill="#ffe066" />
      <path d="M0 170Q90 110 190 165T400 150V300H0Z" fill="#c58b4e" />
      <rect y="205" width={PUZZLE_WIDTH} height="95" fill="#9bd06b" />
      <rect x="66" y="128" width="12" height="90" rx="5" fill="#8a5a33" />
      <ellipse cx="72" cy="112" rx="58" ry="22" fill="#5fa84a" />
      <ellipse cx="40" cy="120" rx="28" ry="14" fill="#6fbb55" />
      <circle cx="260" cy="262" r="6" fill="#ff7aa2" />
      <circle cx="290" cy="252" r="5" fill="#fff" />
      <circle cx="330" cy="268" r="6" fill="#ff7aa2" />
      <circle cx="120" cy="262" r="5" fill="#fff" />
      <rect x="236" y="214" width="14" height="46" rx="6" fill="#d9822b" />
      <rect x="282" y="214" width="14" height="46" rx="6" fill="#d9822b" />
      <rect x="196" y="214" width="14" height="46" rx="6" fill="#f2a53a" />
      <rect x="150" y="214" width="14" height="46" rx="6" fill="#f2a53a" />
      <path
        d="M176 212Q140 214 146 176"
        fill="none"
        stroke="#d9822b"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <ellipse cx="226" cy="196" rx="66" ry="36" fill="#f2a53a" />
      <circle cx="170" cy="168" r="50" fill="#d9822b" />
      <circle cx="170" cy="168" r="36" fill="#f7b84b" />
      <ellipse cx="170" cy="182" rx="18" ry="13" fill="#ffe0a8" />
      <circle cx="156" cy="160" r="4.5" fill="#2b2140" />
      <circle cx="184" cy="160" r="4.5" fill="#2b2140" />
      <ellipse cx="170" cy="176" rx="5" ry="3.5" fill="#2b2140" />
      <path
        d="M170 180Q166 190 158 188M170 180Q174 190 182 188"
        fill="none"
        stroke="#2b2140"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  );
}

function BeachDay() {
  return (
    <>
      <linearGradient id="pp-sky-beach" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7fd4ff" />
        <stop offset="1" stopColor="#d9f6ff" />
      </linearGradient>
      <rect
        width={PUZZLE_WIDTH}
        height={PUZZLE_HEIGHT}
        fill="url(#pp-sky-beach)"
      />
      <circle cx="318" cy="62" r="34" fill="#ffd84d" />
      <rect y="120" width={PUZZLE_WIDTH} height="92" fill="#38b8e6" />
      <path
        d="M0 150Q25 140 50 150T100 150T150 150T200 150T250 150T300 150T350 150T400 150"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M0 180Q25 170 50 180T100 180T150 180T200 180T250 180T300 180T350 180T400 180"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M0 200Q200 186 400 200V300H0Z" fill="#ffd58a" />
      <rect x="92" y="150" width="8" height="120" fill="#c9824b" />
      <path d="M96 110L52 150H140Z" fill="#ff5f7e" />
      <path d="M96 110L74 150H96Z" fill="#fff" />
      <path d="M96 110L118 150H96Z" fill="#fff" />
      <path
        d="M52 150Q96 166 140 150"
        fill="none"
        stroke="#ff5f7e"
        strokeWidth="5"
      />
      <path d="M220 244H300V274H220Z" fill="#f5c26b" />
      <path d="M220 244L232 224H288L300 244Z" fill="#f5c26b" />
      <rect x="250" y="228" width="8" height="16" fill="#fff8ec" />
      <path d="M338 230L346 252H364L372 230Z" fill="#ff7aa2" />
      <path
        d="M344 250L352 270M362 250L354 270"
        stroke="#ff7aa2"
        strokeWidth="5"
      />
      <circle cx="40" cy="262" r="10" fill="#ff7aa2" />
      <path d="M180 264L190 252L200 264L190 278Z" fill="#ff9f43" />
      <path
        d="M130 236Q140 226 150 236"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
      />
    </>
  );
}

function FerrisWheel() {
  const hub = { x: 200, y: 132 };
  const radius = 104;
  return (
    <>
      <linearGradient id="pp-sky-wheel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fd3ff" />
        <stop offset="1" stopColor="#ffe0f0" />
      </linearGradient>
      <rect
        width={PUZZLE_WIDTH}
        height={PUZZLE_HEIGHT}
        fill="url(#pp-sky-wheel)"
      />
      <ellipse cx="70" cy="60" rx="36" ry="13" fill="#fff" />
      <ellipse cx="330" cy="40" rx="42" ry="14" fill="#fff" />
      <path d="M0 230Q100 190 200 228T400 220V300H0Z" fill="#7bd389" />
      <path
        d="M200 132L170 292M200 132L230 292"
        stroke="#7d5a9e"
        strokeWidth="8"
      />
      <path d="M188 226H212" stroke="#7d5a9e" strokeWidth="6" />
      <circle
        cx={hub.x}
        cy={hub.y}
        r={radius}
        fill="none"
        stroke="#ff5f7e"
        strokeWidth="8"
      />
      <circle
        cx={hub.x}
        cy={hub.y}
        r={radius - 16}
        fill="none"
        stroke="#ffd84d"
        strokeWidth="4"
      />
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const x = hub.x + Math.cos(angle) * radius;
        const y = hub.y + Math.sin(angle) * radius;
        return (
          <g key={index}>
            <path
              d={`M${hub.x} ${hub.y}L${x} ${y}`}
              stroke="#7d5a9e"
              strokeWidth="3"
            />
            <rect
              x={x - 13}
              y={y - 6}
              width="26"
              height="24"
              rx="6"
              fill={GONDOLAS[index % GONDOLAS.length]}
            />
          </g>
        );
      })}
      <circle cx={hub.x} cy={hub.y} r="12" fill="#7d5a9e" />
      <circle cx={hub.x} cy={hub.y} r="5" fill="#ffd84d" />
    </>
  );
}

const SCENES: Record<PictureId, () => ReactNode> = {
  "savanna-lion": SavannaLion,
  "beach-day": BeachDay,
  "ferris-wheel": FerrisWheel,
};

/** Hidden defs with one picture. Pieces and the board reference it by id. */
export function PuzzleScene({ picture }: { picture: PictureId }) {
  const Art = SCENES[picture];
  return (
    <svg
      className="pp-defs"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <g id={`pp-scene-${picture}`}>
          <Art />
        </g>
      </defs>
    </svg>
  );
}
