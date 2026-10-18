import { mat } from "./MaterialDefs";
import { memo } from "react";

/** Individual SVG layers leave the shore, plants and play objects independently extensible. */
export const WateringHoleScenery = memo(function WateringHoleScenery() {
  return (
    <>
      <defs>
        <linearGradient id="lagoon-sky" x2="0" y2="1">
          <stop stopColor="#a7ded9" />
          <stop offset="1" stopColor="#f9e9b8" />
        </linearGradient>
        <linearGradient id="lagoon-water" x2="0" y2="1">
          <stop stopColor="#419eaa" />
          <stop offset="1" stopColor="#91ddd0" />
        </linearGradient>
      </defs>
      <path fill="url(#lagoon-sky)" d="M0 0H1920V720H0Z" />
      <circle cx="1330" cy="110" r="64" fill="#fff1b3" />
      <g fill="#fff8dd" opacity=".75">
        <g className="sm-drift">
          <path d="M100 100q15-40 50-20q45-40 75 15q45-5 55 22H90Z" />
          <path d="M860 130q20-40 55-20q35-30 65 10q30-5 50 25H850Z" />
        </g>
      </g>
      <path
        d="M0 280Q240 150 520 260T1050 240T1560 225T1920 260V600H0Z"
        fill="#89b68c"
      />
      <path
        d="M0 280Q240 150 520 260T1050 240T1560 225T1920 260V600H0Z"
        fill={mat("grass")}
      />
      <path
        d="M0 340Q280 230 540 320T1120 295T1600 315T1920 275V620H0Z"
        fill="#5d966d"
      />
      <path
        d="M0 340Q280 230 540 320T1120 295T1600 315T1920 275V620H0Z"
        fill={mat("grass")}
      />
      <path
        d="M0 430Q260 380 450 405Q970 330 1450 405Q1720 345 1920 430V720H0Z"
        fill="#dfcd93"
      />
      <path
        d="M0 430Q260 380 450 405Q970 330 1450 405Q1720 345 1920 430V720H0Z"
        fill={mat("sand")}
      />
      <path
        d="M160 430C450 350 1250 350 1510 430C1690 480 1560 555 1270 566L440 566C180 550 50 490 160 430Z"
        fill="#b5a16d"
      />
      <path
        d="M160 430C450 350 1250 350 1510 430C1690 480 1560 555 1270 566L440 566C180 550 50 490 160 430Z"
        fill={mat("sand")}
      />
      <path
        d="M170 419C460 354 1250 367 1480 424C1640 468 1510 533 1260 538L450 539C200 527 70 467 170 419Z"
        fill="url(#lagoon-water)"
      />
      <path
        d="M170 419C460 354 1250 367 1480 424C1640 468 1510 533 1260 538L450 539C200 527 70 467 170 419Z"
        fill={mat("water")}
      />
      <g stroke="#d6fff0" strokeWidth="4" fill="none" opacity=".6">
        <g className="sm-pulse">
          <path d="M250 447q140-25 290 0M700 418q180-25 340 0M1080 481q170-20 300-5M500 510q200-15 400 0" />
        </g>
      </g>
      <path
        d="M0 620Q400 570 700 617T1350 615T1920 590V720H0Z"
        fill="#ead8a7"
      />
      <path
        d="M0 620Q400 570 700 617T1350 615T1920 590V720H0Z"
        fill={mat("sand")}
      />
      <path
        d="M0 659Q450 615 800 660T1540 650T1920 641"
        fill="none"
        stroke="#d6be8c"
        strokeWidth="4"
      />
      {[100, 1580, 1830].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i === 1 ? 360 : 330})`}>
          <path d="M-22 190Q-35 90-5-120L35-120Q10 85 25 190Z" fill="#876b47" />
          <path
            d="M-22 190Q-35 90-5-120L35-120Q10 85 25 190Z"
            fill={mat("wood")}
          />
          <g className="sm-sway" fill="#356b49">
            <path d="M0-100Q-120-180-180-60Q-85-95 0-75Q-120-35-100 40Q-45-35 10-65Q100 0 160-15Q120-100 25-95Q155-105 160-165Q60-180 0-100Z" />
          </g>
          <path d="M-20 180q-50-20-65 20h155q-25-40-65-20" fill="#52835a" />
        </g>
      ))}
      {[180, 740, 1390].map((x) => (
        <g key={x} transform={`translate(${x} 515)`}>
          <g
            className="sm-sway"
            stroke="#54754a"
            strokeWidth="7"
            fill="#a67c43"
          >
            <path
              d="M0 30Q-10-10-5-65M20 30Q20-5 29-55M-20 30Q-25 0-35-35"
              fill="none"
            />
            <rect x="-11" y="-90" width="12" height="35" rx="6" />
            <rect x="23" y="-80" width="12" height="35" rx="6" />
          </g>
        </g>
      ))}
      <g transform="translate(60 480)">
        <path
          d="M0 80V0h170v60H0"
          fill="#bf8950"
          stroke="#765333"
          strokeWidth="5"
        />
        <path d="M0 80V0h170v60H0" fill={mat("wood")} />
        <text x="85" y="37" textAnchor="middle" fontSize="25" fill="#fff6dd">
          SQUARE
        </text>
      </g>
      <g fill="#f2e5bf">
        {[340, 630, 1120, 1430, 1740].map((x) => (
          <ellipse key={x} cx={x} cy={680 - (x % 3) * 10} rx="30" ry="8" />
        ))}
      </g>
    </>
  );
});
