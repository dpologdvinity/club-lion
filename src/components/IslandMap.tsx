import { memo } from "react";
import type { PlaceId } from "../game.ts";

/**
 * Where each place sits on the island map, in % of the map (x, y). Districts
 * group like Fantage's island: parks west, water park and beach south-west,
 * town east, mountains north-east, the square in the middle.
 */
export const MAP_SPOTS: Record<PlaceId, [number, number]> = {
  square: [48, 47],
  water: [33, 60],
  cafe: [40, 37],
  arcade: [56, 37],
  den: [46, 69],
  "downtown-plaza": [60, 57],
  kainan: [72, 67],
  "dino-dig": [83, 75],
  "secret-scout-base": [67, 41],
  "penthouse-condo": [80, 53],
  "club-pulse": [59, 77],
  "wonder-park-entrance": [27, 31],
  "wonder-park-midway": [16, 22],
  "splash-oasis-entry": [22, 52],
  "splash-oasis-river": [11, 62],
  "sunset-beach": [33, 82],
  "coastal-pier": [20, 78],
  "lion-aquarium": [47, 83],
  "pet-paradise": [55, 24],
  "lion-speedway": [86, 38],
  "mt-mist": [76, 13],
  "snowflake-rink": [89, 21],
  "canyon-rapids": [62, 16],
};

const INK = "#3a2a1a";

/** The island painted under the map pins. */
export const IslandArt = memo(function IslandArt() {
  return (
    <svg
      className="map-island-art"
      viewBox="0 0 1000 640"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="isl-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fc4f0" />
          <stop offset="1" stopColor="#2a8ad8" />
        </linearGradient>
      </defs>
      <rect width="1000" height="640" fill="url(#isl-sea)" />
      <g stroke="#bfe9ff" strokeWidth="3" fill="none" opacity="0.7">
        <path d="M40 80q20 -10 40 0t40 0" />
        <path d="M860 560q20 -10 40 0t40 0" />
        <path d="M80 590q20 -10 40 0t40 0" />
      </g>
      {/* Sandy rim, then the grassy island */}
      <path
        d="M70 160Q120 40 330 50Q520 20 700 40Q930 40 960 200Q990 360 920 470Q870 600 620 610Q420 630 230 600Q60 570 50 420Q30 300 70 160Z"
        fill="#f6dc9a"
        stroke={INK}
        strokeWidth="4"
      />
      <path
        d="M100 170Q150 70 340 80Q520 52 700 70Q900 72 925 210Q950 350 885 450Q835 560 610 575Q420 592 245 565Q95 535 85 410Q70 300 100 170Z"
        fill="#8fdc5a"
        stroke={INK}
        strokeWidth="4"
      />
      {/* Mountains, north-east */}
      <path
        d="M600 150L670 40L740 150ZM700 160L790 30L880 160ZM820 170L880 90L940 170Z"
        fill="#a8b4c8"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M650 72L670 40L690 72ZM765 66L790 30L815 66ZM865 112L880 90L895 112Z"
        fill="#ffffff"
      />
      {/* Town blocks, east */}
      <g stroke={INK} strokeWidth="3">
        <rect x="610" y="300" width="60" height="70" fill="#ffd27a" />
        <rect x="680" y="280" width="50" height="90" fill="#ff9ab8" />
        <rect x="740" y="300" width="56" height="70" fill="#9ad0ff" />
      </g>
      {/* Park, west: a little Ferris wheel */}
      <circle
        cx="200"
        cy="170"
        r="48"
        fill="none"
        stroke="#e8333a"
        strokeWidth="6"
      />
      <path d="M200 170L180 240M200 170L220 240" stroke={INK} strokeWidth="5" />
      {/* Water park pool and the river */}
      <ellipse
        cx="210"
        cy="350"
        rx="70"
        ry="34"
        fill="#5fd0f0"
        stroke={INK}
        strokeWidth="3"
      />
      <path
        d="M90 400Q160 420 150 470Q140 520 210 540"
        fill="none"
        stroke="#5fd0f0"
        strokeWidth="18"
        strokeLinecap="round"
      />
      {/* Trees */}
      <g stroke={INK} strokeWidth="3" fill="#4fb044">
        <circle cx="320" cy="150" r="22" />
        <circle cx="520" cy="430" r="20" />
        <circle cx="430" cy="200" r="18" />
        <circle cx="860" cy="300" r="20" />
        <circle cx="300" cy="460" r="18" />
      </g>
    </svg>
  );
});
