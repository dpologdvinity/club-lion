import { useEffect, useState } from "react";
import type { PlaceId } from "../game.ts";
import {
  computeCoasterTrackPosition,
  computeFerrisWheelCabin,
} from "../utils/kineticRides.ts";
import {
  calculateWaveOffset,
  calculateBucketCycle,
  calculateRiverDrift,
} from "../utils/waterparkPhysics.ts";

const COASTER_LINE = Array.from({ length: 260 }, (_, i) => {
  const p = computeCoasterTrackPosition(i / 259);
  return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
}).join(" ");

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

/** Original vector scenery. Manifest asset names describe layers, never requests. */
export function RoomScenery({
  place,
  preview = false,
}: {
  place: PlaceId;
  preview?: boolean;
}) {
  const [seconds, setSeconds] = useState(0);
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
      if (!query.matches) frame = requestAnimationFrame(tick);
    };
    update();
    query.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", update);
    };
  }, [preview]);
  const club = place === "club-pulse";
  const downtown = place === "downtown-plaza";
  const midway = place === "wonder-park-midway";
  const isSplashEntry = place === "splash-oasis-entry";
  const isSplashRiver = place === "splash-oasis-river";
  const width = club ? 1920 : downtown ? 2400 : 2800;
  const cart = computeCoasterTrackPosition(seconds / 28);
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
      ) : downtown ? (
        <>
          <g transform="translate(160 525)">
            <rect
              x="-110"
              y="-345"
              width="270"
              height="345"
              rx="20"
              fill="#eec38b"
              stroke="#986849"
              strokeWidth="6"
            />
            <path d="M-145-330L25-415L190-330" fill="#8c725c" />
            <rect
              x="-55"
              y="-200"
              width="160"
              height="160"
              rx="15"
              fill="#527360"
            />
            <path d="M-105-220H155L175-140H-125Z" fill="#7ba889" />
            <text
              x="25"
              y="-250"
              textAnchor="middle"
              fontSize="37"
              fill="#4b5137"
            >
              LE SHOP
            </text>
          </g>
          <g transform="translate(2290 530)">
            <rect
              x="-170"
              y="-330"
              width="300"
              height="330"
              rx="22"
              fill="#f4dba5"
              stroke="#a2744f"
              strokeWidth="6"
            />
            <path d="M-210-310L-20-420L180-310" fill="#c17b55" />
            <path d="M-160-215H120L160-135H-200Z" fill="#729b6d" />
            <rect
              x="-100"
              y="-125"
              width="155"
              height="125"
              rx="15"
              fill="#48695d"
            />
            <text
              x="-20"
              y="-250"
              textAnchor="middle"
              fontSize="31"
              fill="#594c34"
            >
              CANOPY CAFÉ
            </text>
          </g>
          <g transform="translate(1200 515)">
            <ellipse cy="32" rx="185" ry="42" fill="#a77d57" />
            <ellipse
              rx="170"
              ry="36"
              fill="#8bd0ce"
              stroke="#efdbb8"
              strokeWidth="16"
            />
            <path d="M-15 0L-30-110H30L15 0" fill="#efd7b0" />
            <ellipse
              cy="-110"
              rx="85"
              ry="18"
              fill="#acdad3"
              stroke="#efd7b0"
              strokeWidth="10"
            />
            <path
              d="M0-115Q-60-220-30-250M0-115Q60-220 30-250"
              stroke="#bdece3"
              fill="none"
              strokeWidth="9"
            />
            <circle cy="-200" r="32" fill="#e4bf81" />
            <circle cy="-203" r="19" fill="#f5d9a4" />
            <text y="100" textAnchor="middle" fontSize="30" fill="#674e38">
              DOWNTOWN PLAZA
            </text>
          </g>
          <Tent x={680} y={540} color="#758c98" name="CLUB PULSE" />
          <Tent x={1780} y={540} color="#bd764f" name="WONDER PARK" />
          {[380, 950, 1510, 2050].map((x, i) => (
            <Tree key={x} x={x} y={530} scale={i % 2 ? 0.8 : 1} />
          ))}
          {[460, 1450, 2000].map((x) => (
            <g key={x} transform={`translate(${x} 530)`}>
              <path d="M0 0V-230M-28-230H28" stroke="#5b6755" strokeWidth="9" />
              <rect
                x="-21"
                y="-274"
                width="42"
                height="45"
                rx="12"
                fill="#ffe3a2"
                stroke="#5b6755"
                strokeWidth="6"
              />
            </g>
          ))}
        </>
      ) : club ? (
        <>
          <rect x="0" y="50" width="1920" height="340" fill="#354959" />
          <path d="M0 165H1920M0 280H1920" stroke="#798174" strokeWidth="8" />
          {[160, 460, 1460, 1760].map((x) => (
            <g key={x}>
              <rect
                x={x - 70}
                y="80"
                width="140"
                height="250"
                rx="65"
                fill="#83a29c"
                opacity=".23"
              />
              <path
                d={`M${x - 80} 100L${x - 190} 430H${x + 180}L${x + 80} 100Z`}
                fill="#e0ca88"
                opacity=".08"
              />
            </g>
          ))}
          <g transform="translate(960 350)">
            <rect
              x="-370"
              y="-160"
              width="740"
              height="170"
              rx="28"
              fill="#9ab0a2"
              stroke="#d9d6ac"
              strokeWidth="8"
            />
            <rect
              x="-280"
              y="-135"
              width="560"
              height="115"
              rx="15"
              fill="#314e55"
            />
            <text y="-61" textAnchor="middle" fontSize="64" fill="#f6d992">
              CLUB PULSE
            </text>
            <rect
              x="-235"
              y="10"
              width="470"
              height="65"
              rx="13"
              fill="#c29467"
            />
            <circle cx="-120" cy="40" r="21" fill="#455c60" />
            <circle cx="120" cy="40" r="21" fill="#455c60" />
            <path d="M-60 35H60M-40 45H40" stroke="#f7d797" strokeWidth="5" />
          </g>
          {[250, 1670].map((x) => (
            <g key={x} transform={`translate(${x} 405)`}>
              <rect
                x="-65"
                y="-190"
                width="130"
                height="190"
                rx="15"
                fill="#2e424d"
                stroke="#a09c7b"
                strokeWidth="6"
              />
              <circle
                cy="-125"
                r="37"
                fill="#5c7379"
                stroke="#8ea2a3"
                strokeWidth="6"
              />
              <circle
                cy="-50"
                r="37"
                fill="#5c7379"
                stroke="#8ea2a3"
                strokeWidth="6"
              />
            </g>
          ))}
          <g fill="#d6bc89">
            <circle cx="420" cy="360" r="12" />
            <circle cx="1490" cy="360" r="12" />
          </g>
          <path
            d="M0 400H270M1650 400H1920"
            stroke="#be9b76"
            strokeWidth="25"
          />
          <text
            x="125"
            y="545"
            textAnchor="middle"
            fill="#efe0bd"
            fontSize="28"
          >
            PLAZA ←
          </text>
        </>
      ) : midway ? (
        <>
          <path
            d="M0 100Q1400 350 2800 100"
            stroke="#735e48"
            strokeWidth="4"
            fill="none"
          />
          {Array.from({ length: 23 }, (_, i) => (
            <g
              key={i}
              transform={`translate(${i * 125} ${100 + Math.sin((i / 22) * Math.PI) * 120})`}
            >
              <path d="M0 0L22 42L44 0" fill={i % 2 ? "#e9a53e" : "#c57567"} />
            </g>
          ))}
          <g transform="translate(700 465)">
            <ellipse cy="65" rx="260" ry="50" fill="#b59473" />
            <ellipse
              cy="48"
              rx="250"
              ry="45"
              fill="#f1d29b"
              stroke="#ad7653"
              strokeWidth="8"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <g
                key={i}
                transform={`translate(${Math.cos(seconds * 0.28 + i * 1.256) * 185} ${Math.sin(seconds * 0.28 + i * 1.256) * 28})`}
              >
                <ellipse
                  cy="-15"
                  rx="56"
                  ry="17"
                  fill="#fff4ce"
                  stroke="#a97b53"
                  strokeWidth="5"
                />
                <path
                  d="M-55-15Q-55 65 0 55Q55 65 55-15"
                  fill={i % 2 ? "#da9b49" : "#b77e69"}
                />
                <path
                  d="M55 0Q90-5 78 25Q72 40 55 25"
                  fill="none"
                  stroke="#ffe6b8"
                  strokeWidth="8"
                />
              </g>
            ))}
            <text y="125" textAnchor="middle" fill="#65492d" fontSize="29">
              MANGO TEACUPS
            </text>
          </g>
          <g transform="translate(1500 475)">
            <ellipse cy="60" rx="245" ry="42" fill="#bd8c61" />
            <ellipse cy="45" rx="235" ry="38" fill="#eed59d" />
            <path d="M-260-230L0-385L260-230Z" fill="#b98062" />
            <path d="M-140-230L0-385L140-230" fill="#efd593" />
            <rect
              x="-265"
              y="-235"
              width="530"
              height="42"
              rx="12"
              fill="#e2ba77"
            />
            {[-180, -90, 0, 90, 180].map((x, i) => (
              <g
                key={x}
                transform={`translate(${x} ${Math.sin(seconds * 1.4 + i) * 12})`}
              >
                <path d="M0-195V30" stroke="#c5a25e" strokeWidth="10" />
                <path
                  d="M-32-65Q-75-135-35-135Q0-130 15-100L45-105L32-60Z"
                  fill="#fff0cb"
                  stroke="#a4754c"
                  strokeWidth="5"
                />
              </g>
            ))}
            <text y="123" textAnchor="middle" fill="#65492d" fontSize="29">
              GOLDEN CAROUSEL
            </text>
          </g>
          <Tent x={2200} y={555} color="#91a476" name="FRUIT CATCH" />
          <Tent x={420} y={490} color="#c48761" name="HONEY & MANGO" />
          {[100, 1100, 2500].map((x) => (
            <Tree key={x} x={x} y={550} scale={0.7} />
          ))}
        </>
      ) : (
        <>
          <g transform="translate(60 90) scale(.55)">
            <path
              d={COASTER_LINE}
              fill="none"
              stroke="#82714c"
              strokeWidth="16"
            />
            <path
              d={COASTER_LINE}
              fill="none"
              stroke="#e6c581"
              strokeWidth="6"
            />
            {[320, 650, 980, 1260, 1500, 1740, 2100, 2440].map((x) => (
              <path
                key={x}
                d={`M${x} 650V260`}
                stroke="#866b47"
                strokeWidth="8"
                opacity=".55"
              />
            ))}
            <g
              transform={`translate(${cart.x} ${cart.y}) rotate(${cart.angle})`}
            >
              <rect
                x="-45"
                y="-38"
                width="90"
                height="35"
                rx="10"
                fill="#d27c55"
                stroke="#573e2c"
                strokeWidth="6"
              />
              <circle cx="-25" cy="0" r="9" fill="#4b5144" />
              <circle cx="25" cy="0" r="9" fill="#4b5144" />
            </g>
          </g>
          <g transform="translate(1700 310)">
            <path
              d="M-130 235L0 0L130 235"
              fill="none"
              stroke="#a8744e"
              strokeWidth="20"
            />
            <circle
              r="215"
              fill="#dce5bd"
              fillOpacity=".2"
              stroke="#eaca87"
              strokeWidth="16"
            />
            {Array.from({ length: 12 }, (_, i) => {
              const p = computeFerrisWheelCabin(seconds * 5 + i * 30, 215, {
                x: 0,
                y: 0,
              });
              return (
                <g key={i}>
                  <path
                    d={`M0 0L${p.x} ${p.y}`}
                    stroke="#b69b65"
                    strokeWidth="5"
                  />
                  <g transform={`translate(${p.x} ${p.y})`}>
                    <rect
                      x="-27"
                      y="-12"
                      width="54"
                      height="55"
                      rx="12"
                      fill={i % 2 ? "#c77d59" : "#82a287"}
                      stroke="#fff0c3"
                      strokeWidth="5"
                    />
                    <path d="M-18 5H18" stroke="#fff0c3" strokeWidth="17" />
                  </g>
                </g>
              );
            })}
            <circle r="28" fill="#ebca81" />
          </g>
          <g transform="translate(2350 455)">
            <path
              d="M-160-240H-70L35-20H190"
              fill="none"
              stroke="#977b51"
              strokeWidth="48"
            />
            <path
              d="M-160-240H-70L35-20H190"
              fill="none"
              stroke="#9ccdc4"
              strokeWidth="30"
            />
            <ellipse cx="125" cy="55" rx="175" ry="40" fill="#76bcb4" />
            <path
              d="M35 40Q95-20 125 30Q170-10 190 50"
              fill="none"
              stroke="#e0f0db"
              strokeWidth="9"
            />
            <rect
              x={10 + Math.sin(seconds) * 15}
              y="-8"
              width="60"
              height="25"
              rx="8"
              fill="#b78355"
            />
            <text
              x="80"
              y="128"
              textAnchor="middle"
              fill="#674e38"
              fontSize="29"
            >
              SUNSHINE FLUME
            </text>
          </g>
          <Tent x={900} y={555} color="#bd7a52" name="SAVANNA SCREAMER" />
          <g transform="translate(1400 555)">
            <rect
              x="-70"
              y="-100"
              width="140"
              height="110"
              rx="12"
              fill="#f2deb5"
              stroke="#977751"
              strokeWidth="6"
            />
            <path d="M-70-110L0-155L70-110" fill="#75997a" />
            <path
              d="M-35-70L10-45L-20-20L35-5"
              fill="none"
              stroke="#91b294"
              strokeWidth="7"
            />
          </g>
          {[220, 1950, 2600].map((x) => (
            <Tree key={x} x={x} y={550} scale={0.7} />
          ))}
          <path
            d="M300 60Q1300 155 2700 60"
            stroke="#806549"
            fill="none"
            strokeWidth="4"
          />
          {Array.from({ length: 20 }, (_, i) => (
            <path
              key={i}
              d={`M${300 + i * 120} ${60 + Math.sin((i / 19) * Math.PI) * 48}l30 50 30-50`}
              fill={i % 2 ? "#d29454" : "#91ac7a"}
            />
          ))}
        </>
      )}
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
