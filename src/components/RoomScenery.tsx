import { useEffect, useId, useState } from "react";
import type { PlaceId } from "../game.ts";
import {
  calculateWaveOffset,
  calculateBucketCycle,
  calculateRiverDrift,
} from "../utils/waterparkPhysics.ts";
import { DowntownPlazaScenery } from "./DowntownPlazaScenery.tsx";
import { ClubPulseScenery } from "./ClubPulseScenery.tsx";
import { WonderParkEntranceScenery } from "./WonderParkEntranceScenery.tsx";
import { WonderParkMidwayScenery } from "./WonderParkMidwayScenery.tsx";
import { SunsetBeachScenery } from "./SunsetBeachScenery.tsx";
import { CoastalPierScenery } from "./CoastalPierScenery.tsx";
import { MtMistScenery } from "./MtMistScenery.tsx";
import { CanyonRapidsScenery } from "./CanyonRapidsScenery.tsx";
import { PetParadiseScenery } from "./PetParadiseScenery.tsx";
import { PenthouseCondoScenery } from "./PenthouseCondoScenery.tsx";
import { ScoutBaseScenery } from "./ScoutBaseScenery.tsx";

function PalmTree({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0Q15 -80 5 -160Q-5 -210 20 -260"
        fill="none"
        stroke="#8b6540"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <g transform="translate(20 -260)">
        <path d="M0 0Q-60 -40 -110 -15Q-60 10 0 0" fill="#4d9b62" />
        <path d="M0 0Q60 -50 120 -25Q70 15 0 0" fill="#58ad6f" />
        <path d="M0 0Q-40 -80 -70 -120Q-20 -60 0 0" fill="#3f8452" />
        <path d="M0 0Q40 -85 75 -125Q30 -60 0 0" fill="#4d9b62" />
        <path d="M0 0Q-10 -70 5 -135Q10 -65 0 0" fill="#5dbd76" />
        <circle cx="-6" cy="-2" r="8" fill="#664627" />
        <circle cx="8" cy="2" r="7" fill="#5a3d21" />
      </g>
    </g>
  );
}

function InnerTube({
  x,
  y,
  angle = 0,
  color = "#ff725c",
  scale = 1,
}: {
  x: number;
  y: number;
  angle?: number;
  color?: string;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <ellipse rx="36" ry="24" fill={color} stroke="#ffffff" strokeWidth="4" />
      <ellipse rx="16" ry="10" fill="#36969e" opacity="0.8" />
    </g>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-12 0L-8-145H12L18 0" fill="#926241" />
      <path
        d="M0-65Q-60-85-55-115M8-80Q65-95 62-130"
        fill="none"
        stroke="#926241"
        strokeWidth="12"
      />
      <ellipse cy="-158" rx="98" ry="48" fill="#468567" />
      <ellipse cx="-55" cy="-148" rx="72" ry="38" fill="#72a86d" />
      <ellipse cx="45" cy="-175" rx="64" ry="34" fill="#8abb78" />
    </g>
  );
}
function Tent({
  x,
  y,
  color,
  name,
}: {
  x: number;
  y: number;
  color: string;
  name: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-130"
        y="-190"
        width="260"
        height="190"
        rx="12"
        fill="#fff0d3"
        stroke="#975f47"
        strokeWidth="5"
      />
      <path d="M-160-180L0-305L160-180Z" fill={color} />
      <path
        d="M-90-180L0-305L90-180M-160-180H160"
        fill="none"
        stroke="#ffe4a5"
        strokeWidth="18"
      />
      <rect x="-110" y="-120" width="220" height="100" rx="14" fill="#456b59" />
      <rect
        x="-125"
        y="-205"
        width="250"
        height="65"
        rx="14"
        fill="#fff9e9"
        stroke="#b7764c"
        strokeWidth="5"
      />
      <text y="-161" textAnchor="middle" fontSize="27" fill="#593d2b">
        {name}
      </text>
      <path d="M-145-185V0M145-185V0" stroke="#a77349" strokeWidth="10" />
      <path
        d="M0-305V-345L60-325L0-315"
        fill="#e9a43e"
        stroke="#a77349"
        strokeWidth="5"
      />
    </g>
  );
}

function PenthouseElevator({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="penthouse-elevator-scenery"
    >
      <ellipse cx="0" cy="5" rx="60" ry="14" fill="#3a3028" opacity="0.35" />
      <rect
        x="-55"
        y="-220"
        width="110"
        height="220"
        rx="14"
        fill="#e5e0d3"
        stroke="#9a8c78"
        strokeWidth="5"
      />
      <path
        d="M-65 -220 Q 0 -255 65 -220 Z"
        fill="#c99e52"
        stroke="#846429"
        strokeWidth="4"
      />
      <rect
        x="-46"
        y="-214"
        width="92"
        height="22"
        rx="6"
        fill="#294b3c"
        stroke="#c99e52"
        strokeWidth="2"
      />
      <text
        y="-199"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill="#ffeaaf"
        letterSpacing="1"
      >
        PENTHOUSE
      </text>
      <rect
        x="-42"
        y="-185"
        width="40"
        height="185"
        fill="#d4af37"
        stroke="#997a22"
        strokeWidth="3"
      />
      <rect
        x="2"
        y="-185"
        width="40"
        height="185"
        fill="#d4af37"
        stroke="#997a22"
        strokeWidth="3"
      />
      <path
        d="M-22 -140 L-2 -100 L-22 -60 L-42 -100 Z M22 -140 L42 -100 L22 -60 L2 -100 Z"
        fill="none"
        stroke="#b8932b"
        strokeWidth="2"
      />
      <circle
        cx="0"
        cy="-172"
        r="10"
        fill="#294b3c"
        stroke="#c99e52"
        strokeWidth="2"
      />
      <path d="M0 -178 L-5 -168 L5 -168 Z" fill="#ffd700" />
    </g>
  );
}

function PhoneBoothEntrance({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="phone-booth-scenery">
      <ellipse cx="0" cy="5" rx="45" ry="12" fill="#3a3028" opacity="0.4" />
      <rect
        x="-40"
        y="-220"
        width="80"
        height="220"
        rx="12"
        fill="#b83228"
        stroke="#781d16"
        strokeWidth="5"
      />
      <path
        d="M-45 -220 Q 0 -255 45 -220 Z"
        fill="#98251c"
        stroke="#781d16"
        strokeWidth="4"
      />
      <circle
        cx="0"
        cy="-232"
        r="6"
        fill="#ffd700"
        stroke="#a68500"
        strokeWidth="1.5"
      />
      <rect
        x="-34"
        y="-214"
        width="68"
        height="18"
        rx="4"
        fill="#ffffff"
        stroke="#781d16"
        strokeWidth="2"
      />
      <text
        y="-201"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#111111"
        letterSpacing="1"
      >
        TELEPHONE
      </text>
      <rect
        x="-32"
        y="-190"
        width="64"
        height="180"
        rx="4"
        fill="#ffeab0"
        opacity="0.85"
      />
      <line
        x1="-32"
        y1="-140"
        x2="32"
        y2="-140"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="-32"
        y1="-90"
        x2="32"
        y2="-90"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="-32"
        y1="-40"
        x2="32"
        y2="-40"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="-11"
        y1="-190"
        x2="-11"
        y2="-10"
        stroke="#781d16"
        strokeWidth="3"
      />
      <line
        x1="11"
        y1="-190"
        x2="11"
        y2="-10"
        stroke="#781d16"
        strokeWidth="3"
      />
      <rect x="-8" y="-135" width="16" height="24" rx="3" fill="#222222" />
      <path
        d="M-5 -138 Q 0 -144 5 -138 L4 -128 Q 0 -132 -4 -128 Z"
        fill="#111111"
      />
      <circle cx="20" cy="-115" r="3" fill="#2ef060" />
    </g>
  );
}

export function RoomScenery({
  place,
  preview = false,
}: {
  place: PlaceId;
  preview?: boolean;
}) {
  const [seconds, setSeconds] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (preview) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let start = performance.now();
    const tick = (now: number) => {
      if (now - last >= 80) {
        setSeconds((now - start) / 1000);
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      setSeconds(0);
      start = performance.now();
      setReducedMotion(query.matches);
      if (!query.matches) frame = requestAnimationFrame(tick);
    };
    update();
    query.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", update);
    };
  }, [preview]);
  if (place === "sunset-beach") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <SunsetBeachScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "coastal-pier") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <CoastalPierScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "mt-mist") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <MtMistScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "downtown-plaza") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <DowntownPlazaScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "club-pulse") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 1920 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <ClubPulseScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "wonder-park-entrance") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2800 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <WonderParkEntranceScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "wonder-park-midway") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2800 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <WonderParkMidwayScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "canyon-rapids") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <CanyonRapidsScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "pet-paradise") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 2400 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <PetParadiseScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "penthouse-condo") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 1920 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <PenthouseCondoScenery seconds={seconds} />
      </svg>
    );
  }
  if (place === "secret-scout-base") {
    return (
      <svg
        className="room-scenery"
        viewBox="0 0 1920 720"
        preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
        aria-hidden="true"
      >
        <ScoutBaseScenery seconds={seconds} />
      </svg>
    );
  }
  const club = false;
  const isSplashEntry = place === "splash-oasis-entry";
  const isSplashRiver = place === "splash-oasis-river";
  const width = 2800;
  return (
    <svg
      className="room-scenery"
      viewBox={`0 0 ${width} 720`}
      preserveAspectRatio={preview ? "xMidYMid slice" : "none"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${place}`} x2="0" y2="1">
          <stop
            stopColor={
              club
                ? "#294050"
                : isSplashEntry || isSplashRiver
                  ? "#58b5be"
                  : "#91cfc9"
            }
          />
          <stop
            offset="1"
            stopColor={
              club
                ? "#58687a"
                : isSplashEntry || isSplashRiver
                  ? "#e3f3db"
                  : "#f7e4aa"
            }
          />
        </linearGradient>
        <pattern
          id={`pavers-${place}`}
          width="130"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0H130V48H0ZM65 0V48"
            fill="none"
            stroke={club ? "#687985" : "#bd9d78"}
            strokeWidth="2"
            opacity=".25"
          />
        </pattern>
      </defs>
      <rect width={width} height="720" fill={`url(#sky-${place})`} />
      {!club && (
        <>
          <circle cx={width - 360} cy="100" r="57" fill="#ffedbb" />
          <g fill="#fff8df" opacity=".7">
            <ellipse cx="380" cy="116" rx="160" ry="36" />
            <ellipse cx="1250" cy="80" rx="210" ry="28" />
            <ellipse cx="2140" cy="165" rx="150" ry="36" />
          </g>
          <path
            d={`M0 400Q200 215 480 365Q720 140 1050 375Q1400 180 1800 360Q2200 170 ${width} 340V580H0Z`}
            fill="#97b88a"
          />
          <path
            d={`M0 470Q500 330 970 440Q1700 300 ${width} 470V590H0Z`}
            fill="#6e9a73"
          />
        </>
      )}
      <rect
        y={club ? 420 : 540}
        width={width}
        height="300"
        fill={
          club
            ? "#425566"
            : isSplashEntry
              ? "#dfca99"
              : isSplashRiver
                ? "#d6be8e"
                : "#e7c794"
        }
      />
      <rect
        y={club ? 420 : 540}
        width={width}
        height="300"
        fill={`url(#pavers-${place})`}
      />
      {isSplashEntry ? (
        <>
          <g transform="translate(900 500)">
            <ellipse rx="460" ry="110" fill="#2c818f" opacity="0.4" />
            <path
              d="M-440 0 C-300 -60, 300 -60, 440 0 C300 70, -300 70, -440 0 Z"
              fill="#42a8b8"
            />
            {[-300, -150, 0, 150, 300].map((wx, i) => {
              const waveY = calculateWaveOffset(seconds * 1000, 900 + wx);
              return (
                <path
                  key={i}
                  d={`M${wx - 60} ${waveY} Q${wx} ${waveY - 14} ${wx + 60} ${waveY}`}
                  fill="none"
                  stroke="#def8f8"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              );
            })}
            <text
              y="75"
              textAnchor="middle"
              fontSize="28"
              fill="#1b4d54"
              fontWeight="bold"
            >
              TSUNAMI WAVE POOL
            </text>
          </g>

          {(() => {
            const bucket = calculateBucketCycle(seconds * 1000);
            return (
              <g transform="translate(1900 480)">
                <path
                  d="M-80 60 L-50 -180 L50 -180 L80 60"
                  stroke="#d48a37"
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d="M-65 -40 L65 -40 M-60 -110 L60 -110"
                  stroke="#d48a37"
                  strokeWidth="6"
                />
                <g
                  transform={`translate(0 -180) rotate(${bucket.tipAngleDeg})`}
                >
                  <path
                    d="M-36 -45 L36 -45 L26 30 L-26 30 Z"
                    fill="#ffb43b"
                    stroke="#aa681a"
                    strokeWidth="4"
                  />
                  <rect
                    x="-22"
                    y={30 - (bucket.fillPercent / 100) * 65}
                    width="44"
                    height={(bucket.fillPercent / 100) * 65}
                    fill="#3dbbd4"
                    opacity="0.85"
                  />
                  <ellipse
                    cy="-45"
                    rx="36"
                    ry="10"
                    fill="#ffd470"
                    stroke="#aa681a"
                    strokeWidth="3"
                  />
                </g>
                {bucket.isDumping && (
                  <g>
                    <path
                      d="M-20 -150 Q-30 0 -50 60 L50 60 Q30 0 20 -150 Z"
                      fill="#72d8eb"
                      opacity="0.75"
                    />
                    <ellipse
                      cy="60"
                      rx={bucket.splashRadius}
                      ry={bucket.splashRadius * 0.35}
                      fill="#baf0fa"
                      opacity="0.7"
                    />
                  </g>
                )}
                <text
                  y="90"
                  textAnchor="middle"
                  fontSize="28"
                  fill="#3b4b52"
                  fontWeight="bold"
                >
                  DUMP BUCKET FORTRESS
                </text>
              </g>
            );
          })()}

          <g transform="translate(2400 520)">
            <rect
              x="-80"
              y="-120"
              width="160"
              height="120"
              rx="8"
              fill="#ffeec9"
              stroke="#9e724a"
              strokeWidth="4"
            />
            <path d="M-100 -120 L0 -180 L100 -120 Z" fill="#52a882" />
            <text y="-50" textAnchor="middle" fontSize="20" fill="#5a452d">
              CABANA
            </text>
          </g>

          {[160, 520, 1420, 2250, 2680].map((x, i) => (
            <PalmTree key={x} x={x} y={530} scale={i % 2 === 0 ? 0.9 : 1.1} />
          ))}

          <text
            x="80"
            y="550"
            textAnchor="middle"
            fill="#54412c"
            fontSize="26"
            fontWeight="bold"
          >
            ← DOWNTOWN
          </text>
          <text
            x="2720"
            y="550"
            textAnchor="middle"
            fill="#54412c"
            fontSize="26"
            fontWeight="bold"
          >
            LAZY RIVER →
          </text>
        </>
      ) : isSplashRiver ? (
        <>
          <g>
            <path
              d="M100 360 C 100 150, 2700 150, 2700 360 C 2700 570, 100 570, 100 360 Z"
              fill="none"
              stroke="#3caebd"
              strokeWidth="90"
              opacity="0.85"
            />
            <path
              d="M100 360 C 100 150, 2700 150, 2700 360 C 2700 570, 100 570, 100 360 Z"
              fill="none"
              stroke="#96e7f2"
              strokeWidth="10"
              strokeDasharray="40 60"
              opacity="0.6"
            />
            {[0, 0.2, 0.4, 0.6, 0.8].map((offset, i) => {
              const drift = calculateRiverDrift((seconds / 25 + offset) % 1);
              const colors = [
                "#ff6053",
                "#ffba3b",
                "#4cdb83",
                "#bb5fe6",
                "#3bb8ff",
              ];
              return (
                <InnerTube
                  key={i}
                  x={drift.x}
                  y={drift.y}
                  angle={drift.angle}
                  color={colors[i]}
                  scale={0.9}
                />
              );
            })}
          </g>

          <path d="M0 540 H2800" stroke="#875d36" strokeWidth="8" />
          {Array.from({ length: 29 }, (_, i) => (
            <line
              key={i}
              x1={i * 100}
              y1={540}
              x2={i * 100}
              y2={565}
              stroke="#875d36"
              strokeWidth="6"
            />
          ))}

          <g transform="translate(1400 520)">
            <rect
              x="-100"
              y="-120"
              width="200"
              height="120"
              rx="10"
              fill="#fcf0d4"
              stroke="#9e724a"
              strokeWidth="5"
            />
            <path d="M-115 -120 L0 -175 L115 -120 Z" fill="#e66847" />
            <text
              y="-55"
              textAnchor="middle"
              fontSize="22"
              fill="#543c25"
              fontWeight="bold"
            >
              TUBE RENTALS
            </text>
            <InnerTube
              x={-60}
              y={-10}
              angle={-15}
              color="#ffba3b"
              scale={0.7}
            />
            <InnerTube x={60} y={-10} angle={15} color="#4cdb83" scale={0.7} />
          </g>

          {[200, 750, 1950, 2550].map((x, i) => (
            <PalmTree key={x} x={x} y={535} scale={i % 2 === 0 ? 0.95 : 1.15} />
          ))}

          <text
            x="80"
            y="550"
            textAnchor="middle"
            fill="#54412c"
            fontSize="26"
            fontWeight="bold"
          >
            ← SPLASH OASIS
          </text>
        </>
      ) : null}
      {!club && (
        <>
          <path d={`M0 690H${width}`} stroke="#d3ae7c" strokeWidth="4" />
          {Array.from({ length: Math.floor(width / 170) }, (_, i) => (
            <g key={i} transform={`translate(${i * 170 + 30} 685)`}>
              <ellipse rx="25" ry="7" fill="#9c9a67" opacity=".4" />
              <path
                d="M0 0L-10-15M0 0L15-22"
                stroke="#91a46c"
                strokeWidth="5"
              />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}
