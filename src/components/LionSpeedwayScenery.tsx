import { memo, type CSSProperties } from "react";
import { AnimalFace, LionTrophy, SideKart, type Animal } from "./kartArt.tsx";

const STAGE_WIDTH = 2400;
const TRACK_TOP = 400;
const TRACK_BOTTOM = 520;

// Rotate about the local origin, like an SVG rotate(), instead of the fill-box.
const PIVOT: CSSProperties = { transformBox: "view-box", "--sm-origin": "0 0" };

const FAN_SHIRTS = [
  "#ff6b6b",
  "#ffb347",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#c77dff",
  "#ff8fab",
  "#2ec4b6",
];
const FAN_FUR = ["#f6c25c", "#d9a066", "#a86b3c", "#8c8a99", "#f3e3c3"];

// Deterministic crowd so the stands never reshuffle between renders.
const FANS = Array.from({ length: 4 }, (_, row) =>
  Array.from({ length: 20 - row }, (_, i) => ({
    row,
    x: 130 + row * 22 + i * 42 + (row % 2) * 10,
    y: 236 + row * 40,
    shirt: FAN_SHIRTS[(i * 3 + row * 5) % FAN_SHIRTS.length],
    fur: FAN_FUR[(i * 7 + row * 3) % FAN_FUR.length],
    cheer: (i + row) % 3 === 0,
    flag: (i * 5 + row) % 7 === 0,
  })),
).flat();

const BUNTING = ["#ff6b6b", "#ffd93d", "#4d96ff", "#6bcb77", "#ff8fab"];

function Fan({ x, y, shirt, fur, cheer, flag }: (typeof FANS)[number]) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-14 26v-14q0-10 14-10t14 10v14Z" fill={shirt} />
      {cheer ? (
        <path
          d="M-11 8l-9-20M11 8l9-20"
          stroke={fur}
          strokeWidth="6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M-12 10l-6 10M12 10l6 10"
          stroke={fur}
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
      {flag && (
        <g transform="translate(20 -12)">
          <path d="M0 0V-30" stroke="#5b4636" strokeWidth="3" />
          <path d="M0-30l22 7l-22 7Z" fill="#ffd93d" stroke="#d9792b" />
        </g>
      )}
      <circle cx="-9" cy="-14" r="5" fill={fur} />
      <circle cx="9" cy="-14" r="5" fill={fur} />
      <circle cy="-6" r="11" fill={fur} />
      <circle cx="-4" cy="-8" r="1.8" fill="#2b2233" />
      <circle cx="4" cy="-8" r="1.8" fill="#2b2233" />
      <path
        d={cheer ? "M-4-3q4 6 8 0Z" : "M-4-3q4 3 8 0"}
        fill={cheer ? "#7a2e2e" : "none"}
        stroke="#7a2e2e"
        strokeWidth="1.5"
      />
    </g>
  );
}

function TireStack({ x, y, n = 3 }: { x: number; y: number; n?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(0 ${-i * 13})`}>
          <ellipse rx="22" ry="9" fill="#23202b" />
          <ellipse cy="-3" rx="22" ry="8" fill="#3a3644" />
          <ellipse cy="-3" rx="10" ry="3.5" fill="#23202b" />
          <path
            d="M-22-3a22 8 0 0 0 44 0"
            fill="none"
            stroke={i % 2 ? "#ff6b6b" : "#fff"}
            strokeWidth="3"
          />
        </g>
      ))}
    </g>
  );
}

function Flag({
  x,
  y,
  checkered = false,
  color = "#ffd93d",
  delay,
}: {
  x: number;
  y: number;
  checkered?: boolean;
  color?: string;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0V-120" stroke="#e6e2ef" strokeWidth="6" />
      <circle cy="-122" r="5" fill="#ffd93d" />
      <g transform="translate(0 -116)">
        <g
          className="sm-sway"
          style={{
            ...PIVOT,
            "--sm-deg": "6deg",
            "--sm-dur": "1.3s",
            "--sm-delay": `${delay}s`,
          }}
        >
          {checkered ? (
            <>
              <path
                d="M0 0q30-10 60 0t60 0v48q-30-10-60 0t-60 0Z"
                fill="#fff"
              />
              {Array.from({ length: 24 }, (_, i) => {
                const col = i % 6;
                const row = Math.floor(i / 6);
                return (col + row) % 2 ? (
                  <rect
                    key={i}
                    x={col * 20}
                    y={row * 12 + (col % 2 ? -1.5 : 1.5)}
                    width="20"
                    height="12"
                    fill="#23202b"
                  />
                ) : null;
              })}
            </>
          ) : (
            <>
              <path
                d="M0 0q30-10 60 0t50 0v44q-25-10-50 0t-60 0Z"
                fill={color}
              />
              <g transform="translate(52 22) scale(.55)">
                <AnimalFace kind="lion" />
              </g>
            </>
          )}
        </g>
      </g>
    </g>
  );
}

function RaceKart({
  y,
  color,
  number,
  driver,
  duration,
  delay,
}: {
  y: number;
  color: string;
  number: number;
  driver: Animal;
  duration: number;
  delay: number;
}) {
  return (
    <g
      className="sm-drift"
      style={{
        "--sm-dist": `${STAGE_WIDTH + 400}px`,
        "--sm-dur": `${duration}s`,
        "--sm-delay": `${delay}s`,
      }}
    >
      <g transform={`translate(-200 ${y})`}>
        <path
          d="M-70-20h-60M-74-34h-40M-70-8h-50"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".6"
        />
        <g
          className="sm-bob"
          style={{ "--sm-amp": "1.5px", "--sm-dur": "0.18s" }}
        >
          <SideKart color={color} number={number} driver={driver} />
        </g>
      </g>
    </g>
  );
}

function Garage({
  x,
  color,
  door,
}: {
  x: number;
  color: string;
  door: number;
}) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect y="250" width="150" height="150" fill="#eef0f6" />
      <rect y="250" width="150" height="26" fill={color} />
      <path
        d="M0 276h150"
        stroke="#2b2233"
        strokeOpacity=".2"
        strokeWidth="4"
      />
      <rect x="15" y="292" width="120" height="108" fill="#2f2b3a" />
      <rect x="22" y="330" width="40" height="8" fill="#5b5668" />
      {[30, 42, 54].map((tx) => (
        <path key={tx} d={`M${tx} 338v14`} stroke="#9b97a8" strokeWidth="3" />
      ))}
      <circle cx="108" cy="380" r="14" fill="#23202b" />
      <circle cx="108" cy="380" r="6" fill="#5b5668" />
      <rect
        x="15"
        y="292"
        width="120"
        height={door}
        fill={color}
        opacity=".9"
      />
      {Array.from({ length: Math.floor(door / 9) }, (_, i) => (
        <path
          key={i}
          d={`M15 ${300 + i * 9}h120`}
          stroke="#000"
          strokeOpacity=".12"
          strokeWidth="2"
        />
      ))}
    </g>
  );
}

export function LionSpeedwayScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <LionSpeedwayStage />;
}

const LionSpeedwayStage = memo(function LionSpeedwayStage() {
  return (
    <g className="lion-speedway-scenery">
      <defs>
        <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ec6ff" />
          <stop offset="60%" stopColor="#b9e6ff" />
          <stop offset="100%" stopColor="#fff1c9" />
        </linearGradient>
        <radialGradient id="ls-sun-glow">
          <stop offset="0%" stopColor="#fff6c4" stopOpacity=".9" />
          <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ls-asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a4858" />
          <stop offset="100%" stopColor="#5d5b6c" />
        </linearGradient>
        <linearGradient id="ls-paddock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9e3d6" />
          <stop offset="100%" stopColor="#d6cdb9" />
        </linearGradient>
        <linearGradient id="ls-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff2a8" />
          <stop offset="45%" stopColor="#ffcf3d" />
          <stop offset="100%" stopColor="#d98c12" />
        </linearGradient>
        <pattern
          id="ls-checker"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <rect width="24" height="24" fill="#fff" />
          <rect width="12" height="12" fill="#23202b" />
          <rect x="12" y="12" width="12" height="12" fill="#23202b" />
        </pattern>
        <pattern
          id="ls-curb"
          width="40"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <rect width="40" height="12" fill="#fff" />
          <rect width="20" height="12" fill="#ff5a5a" />
        </pattern>
      </defs>

      {/* Sky, sun and drifting clouds */}
      <rect width={STAGE_WIDTH} height="420" fill="url(#ls-sky)" />
      <circle cx="2060" cy="90" r="190" fill="url(#ls-sun-glow)" />
      <g transform="translate(2060 90)">
        <g className="sm-spin" style={{ "--sm-dur": "60s" }}>
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              transform={`rotate(${i * 30})`}
              d="M-8-70L0-100L8-70Z"
              fill="#ffd93d"
              opacity=".8"
            />
          ))}
        </g>
        <circle r="58" fill="#ffe066" />
        <circle r="46" fill="#fff2a8" />
      </g>
      <g
        className="sm-drift"
        style={{ "--sm-dist": `${STAGE_WIDTH}px`, "--sm-dur": "420s" }}
      >
        {[0, -STAGE_WIDTH].map((offset) => (
          <g key={offset} transform={`translate(${offset} 0)`} fill="#fff">
            {[
              [300, 80, 1],
              [880, 120, 0.8],
              [1500, 60, 1.1],
            ].map(([cx, cy, s]) => (
              <g key={cx} transform={`translate(${cx} ${cy}) scale(${s})`}>
                <ellipse rx="90" ry="26" />
                <circle cx="-30" cy="-18" r="30" />
                <circle cx="20" cy="-26" r="38" />
                <circle cx="58" cy="-8" r="24" />
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* Rolling hills behind the circuit */}
      <path
        d="M0 330Q260 250 520 300T1040 290T1560 280T2080 300T2400 280V420H0Z"
        fill="#9fd88a"
      />
      <path
        d="M0 360Q300 310 620 350T1240 340T1880 350T2400 330V420H0Z"
        fill="#7cc46a"
      />
      {[60, 1040, 1330, 2300].map((x, i) => (
        <g key={x} transform={`translate(${x} ${350 - (i % 2) * 14})`}>
          <path d="M-4 0h8v30h-8Z" fill="#8a5a33" />
          <circle cy="-14" r="30" fill="#4fae5a" />
          <circle cx="-14" cy="-2" r="20" fill="#5fbf68" />
          <circle cx="16" cy="-6" r="22" fill="#3f9a4d" />
        </g>
      ))}

      {/* Bunting strung across the whole speedway */}
      {[0, 800, 1600].map((start) => (
        <g key={start}>
          <path
            d={`M${start} 40Q${start + 400} 110 ${start + 800} 40`}
            fill="none"
            stroke="#5b4636"
            strokeWidth="3"
          />
          {Array.from({ length: 14 }, (_, i) => {
            const t = (i + 0.5) / 14;
            const x = start + t * 800;
            const y = 40 + 4 * t * (1 - t) * 70 * 0.98;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <g
                  className="sm-sway"
                  style={{
                    ...PIVOT,
                    "--sm-deg": "7deg",
                    "--sm-dur": "1.7s",
                    "--sm-delay": `${-i * 0.23}s`,
                  }}
                >
                  <path
                    d="M-14 0H14L0 28Z"
                    fill={BUNTING[(i + start / 800) % BUNTING.length]}
                  />
                </g>
              </g>
            );
          })}
        </g>
      ))}

      {/* Grandstand with a cheering crowd */}
      <g>
        <path d="M80 400V200H1000V400Z" fill="#c9cfdc" />
        {[0, 1, 2, 3].map((row) => (
          <rect
            key={row}
            x={96 + row * 22}
            y={246 + row * 40}
            width={890 - row * 44}
            height="22"
            rx="4"
            fill={row % 2 ? "#4d96ff" : "#ff6b6b"}
          />
        ))}
        {[0, 1, 2].map((group) => (
          <g
            key={group}
            className="sm-bob"
            style={{
              "--sm-amp": "4px",
              "--sm-dur": "0.45s",
              "--sm-delay": `${-group * 0.15}s`,
            }}
          >
            {FANS.filter((_, i) => i % 3 === group).map((fan) => (
              <Fan key={`${fan.row}-${fan.x}`} {...fan} />
            ))}
          </g>
        ))}
        {[100, 540, 980].map((x) => (
          <path key={x} d={`M${x} 400V150`} stroke="#9aa1b3" strokeWidth="12" />
        ))}
        <path d="M50 160L540 110L1030 160V190H50Z" fill="#fff" />
        {Array.from({ length: 7 }, (_, i) => {
          const x1 = 50 + (i * 2 + 1) * 70;
          const x2 = x1 + 70;
          const roof = (x: number) => 110 + (Math.abs(x - 540) * 50) / 490;
          return (
            <path
              key={i}
              d={`M${x1} ${roof(x1)}L${x2} ${roof(x2)}V190H${x1}Z`}
              fill="#ff5a5a"
            />
          );
        })}
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M${50 + i * 70} 190q35 26 70 0`}
            fill={i % 2 ? "#ff5a5a" : "#fff"}
            stroke="#ff5a5a"
            strokeWidth="2"
          />
        ))}
        <Flag x={140} y={150} color="#ffd93d" delay={-0.2} />
        <Flag x={540} y={150} checkered delay={-0.7} />
        <Flag x={940} y={150} color="#4d96ff" delay={-1.1} />
      </g>

      {/* Pit garages with team colors and a little control tower */}
      <g>
        <rect x="1400" y="200" width="560" height="50" fill="#fff" />
        <rect x="1400" y="200" width="560" height="14" fill="#2b2233" />
        <rect x="1590" y="120" width="180" height="80" rx="10" fill="#eef0f6" />
        <rect x="1606" y="134" width="148" height="40" rx="6" fill="#7fd3ff" />
        <path
          d="M1606 154h148"
          stroke="#fff"
          strokeOpacity=".6"
          strokeWidth="4"
        />
        <rect x="1590" y="112" width="180" height="16" rx="6" fill="#ff8a00" />
        <Garage x={1405} color="#ff8a00" door={30} />
        <Garage x={1590} color="#4d96ff" door={46} />
        <Garage x={1775} color="#ff5fa2" door={22} />
        <g transform="translate(1680 228)">
          <circle r="24" fill="#ff8a00" />
          <g transform="scale(.8)">
            <AnimalFace kind="lion" />
          </g>
        </g>
      </g>

      {/* Giant scoreboard with today's racers */}
      <g>
        <path
          d="M2010 400V300M2210 400V300"
          stroke="#6d6a7c"
          strokeWidth="14"
        />
        <rect
          x="1980"
          y="110"
          width="260"
          height="200"
          rx="16"
          fill="#2b2233"
        />
        <rect
          x="1994"
          y="124"
          width="232"
          height="172"
          rx="10"
          fill="#1a1724"
        />
        {(["lion", "zebra", "giraffe", "hippo"] as const).map((kind, i) => (
          <g key={kind} transform={`translate(2010 ${142 + i * 40})`}>
            <text
              x="6"
              y="9"
              fontSize="22"
              fontWeight="900"
              fill={i === 0 ? "#ffd93d" : "#fff"}
              fontFamily="system-ui, sans-serif"
            >
              {i + 1}
            </text>
            <g transform="translate(42 0) scale(.55)">
              <AnimalFace kind={kind} />
            </g>
            <rect
              x="68"
              y="-6"
              width={120 - i * 22}
              height="12"
              rx="6"
              fill={["#ffd93d", "#4d96ff", "#6bcb77", "#ff5fa2"][i]}
            />
          </g>
        ))}
        {Array.from({ length: 16 }, (_, i) => {
          const top = i < 8;
          const x = 1996 + ((i % 8) + 0.5) * 28.5;
          return (
            <circle
              key={i}
              className="sm-twinkle"
              style={{ "--sm-dur": "0.6s", "--sm-delay": `${-i * 0.15}s` }}
              cx={x}
              cy={top ? 117 : 303}
              r="4"
              fill="#ffd93d"
            />
          );
        })}
      </g>

      {/* Advertising wall along the back of the track */}
      <rect y="368" width={STAGE_WIDTH} height="32" fill="#fff" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={i * 200 + 8}
          y="372"
          width="184"
          height="24"
          rx="5"
          fill={["#ff8a00", "#4d96ff", "#6bcb77", "#ff5fa2"][i % 4]}
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`translate(${i * 200 + 100} 384)`}>
          {i % 2 ? (
            <path
              d="M-40 0h80"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="1 14"
            />
          ) : (
            <g transform="scale(.42)">
              <AnimalFace kind="lion" />
            </g>
          )}
        </g>
      ))}

      {/* The racing straight with curbs and the checkered line */}
      <rect
        y={TRACK_TOP}
        width={STAGE_WIDTH}
        height="12"
        fill="url(#ls-curb)"
      />
      <rect
        y={TRACK_TOP + 12}
        width={STAGE_WIDTH}
        height={TRACK_BOTTOM - TRACK_TOP - 24}
        fill="url(#ls-asphalt)"
      />
      <path
        d={`M0 ${(TRACK_TOP + TRACK_BOTTOM) / 2}H${STAGE_WIDTH}`}
        stroke="#fff"
        strokeOpacity=".7"
        strokeWidth="5"
        strokeDasharray="50 40"
      />
      <rect
        y={TRACK_BOTTOM - 12}
        width={STAGE_WIDTH}
        height="12"
        fill="url(#ls-curb)"
      />
      <rect
        x="1166"
        y={TRACK_TOP + 12}
        width="36"
        height={TRACK_BOTTOM - TRACK_TOP - 24}
        fill="url(#ls-checker)"
      />
      <RaceKart
        y={452}
        color="#4d96ff"
        number={2}
        driver="zebra"
        duration={5.2}
        delay={-1}
      />
      <RaceKart
        y={500}
        color="#6bcb77"
        number={3}
        driver="giraffe"
        duration={4.6}
        delay={-3.4}
      />
      <RaceKart
        y={476}
        color="#ff5fa2"
        number={4}
        driver="hippo"
        duration={5.8}
        delay={-4.6}
      />

      {/* Start / finish gantry with start lights */}
      <g>
        <path
          d="M1070 530V230M1300 530V230"
          stroke="#e6e2ef"
          strokeWidth="22"
        />
        <path d="M1070 530V230M1300 530V230" stroke="#b8b4c6" strokeWidth="8" />
        <rect
          x="1046"
          y="196"
          width="278"
          height="76"
          rx="12"
          fill="url(#ls-checker)"
          stroke="#23202b"
          strokeWidth="5"
        />
        <rect
          x="1104"
          y="206"
          width="162"
          height="56"
          rx="10"
          fill="#ff8a00"
          stroke="#23202b"
          strokeWidth="4"
        />
        <text
          x="1185"
          y="244"
          textAnchor="middle"
          fontSize="28"
          fontWeight="900"
          fill="#fff"
          stroke="#23202b"
          strokeWidth="1.5"
          fontFamily="system-ui, sans-serif"
        >
          START
        </text>
        <rect x="1100" y="280" width="170" height="44" rx="10" fill="#23202b" />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            className="sm-twinkle"
            style={{
              "--sm-dur": "2.4s",
              "--sm-min": ".15",
              "--sm-delay": `${-i * 0.6}s`,
            }}
            cx={1124 + i * 41}
            cy="302"
            r="14"
            fill={i === 3 ? "#5dff7a" : "#ff4040"}
          />
        ))}
        <g transform="translate(1185 168)">
          <circle
            r="34"
            fill="url(#ls-gold)"
            stroke="#b36d00"
            strokeWidth="4"
          />
          <g transform="scale(1.05)">
            <AnimalFace kind="lion" />
          </g>
        </g>
      </g>

      {/* Low tire wall in front of the track */}
      <rect y="520" width={STAGE_WIDTH} height="20" fill="#9fd88a" />
      {[180, 420, 690, 940, 1460, 1720, 2280].map((x, i) => (
        <TireStack key={x} x={x} y={538} n={2 + (i % 2)} />
      ))}

      {/* Paddock where the player walks */}
      <rect y="540" width={STAGE_WIDTH} height="180" fill="url(#ls-paddock)" />
      <rect y="540" width={STAGE_WIDTH} height="10" fill="url(#ls-checker)" />
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d={`M${80 + i * 240} 650h120`}
          stroke="#fff"
          strokeWidth="8"
          strokeLinecap="round"
          opacity=".8"
        />
      ))}

      {/* Painted starting grid, cones and a crate of boost mangos */}
      {[280, 470, 660, 850].map((x, i) => (
        <g key={x} transform={`translate(${x} 596)`}>
          <path
            d="M-60-20h120M-60-20v44M60-20v44"
            fill="none"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <text
            y="16"
            textAnchor="middle"
            fontSize="26"
            fontWeight="900"
            fill="#fff"
            fontFamily="system-ui, sans-serif"
          >
            {i + 1}
          </text>
        </g>
      ))}
      {[150, 1000, 1370, 2240].map((x) => (
        <g key={x} transform={`translate(${x} 600)`}>
          <ellipse cy="2" rx="20" ry="6" fill="#000" opacity=".15" />
          <path d="M-18 0h36l-11-44h-14Z" fill="#ff8a00" />
          <path d="M-12-16h24l-3-11h-18Z" fill="#fff" />
          <rect x="-20" y="-4" width="40" height="6" rx="3" fill="#e06f00" />
        </g>
      ))}
      <g transform="translate(1300 592)">
        <rect x="-36" y="-34" width="72" height="34" rx="4" fill="#c98a4a" />
        <path d="M-36-22h72M-36-11h72" stroke="#9c6533" strokeWidth="3" />
        {[-22, -4, 14, -13, 5].map((x, i) => (
          <g key={i} transform={`translate(${x + 4} ${i < 3 ? -38 : -50})`}>
            <ellipse rx="11" ry="9" fill="#ffb627" stroke="#d9792b" />
            <path d="M2-8q5-6 10-3q-5 2-10 3Z" fill="#4caf50" />
          </g>
        ))}
      </g>

      {/* Parked karts waiting in the paddock, the mango kart by the start */}
      <g transform="translate(1185 588)">
        <SideKart color="#ffa62b" number={1} driver="lion" />
        <g transform="translate(-50 -22) rotate(-20)">
          <ellipse rx="13" ry="10" fill="#ffb627" />
          <path d="M2-9q6-8 12-4q-6 2-12 4Z" fill="#4caf50" />
        </g>
      </g>
      <g transform="translate(1530 572) scale(.85)">
        <SideKart color="#4d96ff" number={2} driver="zebra" />
      </g>
      <g transform="translate(1810 572) scale(-.85 .85)">
        <SideKart color="#ff5fa2" number={4} driver="hippo" />
      </g>

      {/* Winner's podium with the golden lion trophy */}
      <g>
        <rect x="1872" y="572" width="296" height="22" rx="11" fill="#c2324a" />
        <rect x="1872" y="572" width="296" height="8" rx="4" fill="#e04b63" />
        {(
          [
            [1885, 480, "#c7d2e6"],
            [1975, 428, "#ffd93d"],
            [2065, 506, "#e9a66b"],
          ] as const
        ).map(([x, y, fill]) => (
          <g key={x}>
            <rect x={x} y={y} width="90" height={576 - y} rx="8" fill={fill} />
            <rect
              x={x}
              y={y}
              width="90"
              height="12"
              rx="6"
              fill="#fff"
              opacity=".35"
            />
          </g>
        ))}
        {[
          [1930, 532, "2"],
          [2020, 484, "1"],
          [2110, 556, "3"],
        ].map(([x, y, n]) => (
          <text
            key={n}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="40"
            fontWeight="900"
            fill="#fff"
            stroke="#2b2233"
            strokeWidth="1.5"
            fontFamily="system-ui, sans-serif"
          >
            {n}
          </text>
        ))}
        <g transform="translate(2020 428)">
          <g
            className="sm-bob"
            style={{ "--sm-amp": "4px", "--sm-dur": "1.6s" }}
          >
            <g transform="scale(1.25)">
              <LionTrophy />
            </g>
          </g>
          {[
            [-48, -100],
            [46, -112],
            [-30, -134],
            [36, -64],
          ].map(([x, y], i) => (
            <path
              key={i}
              className="sm-twinkle"
              style={{ "--sm-dur": "0.9s", "--sm-delay": `${-i * 0.3}s` }}
              transform={`translate(${x} ${y})`}
              d="M0-9L2.5-2.5L9 0L2.5 2.5L0 9L-2.5 2.5L-9 0L-2.5-2.5Z"
              fill="#fff6c4"
            />
          ))}
        </g>
        {Array.from({ length: 12 }, (_, i) => (
          <g
            key={i}
            className="sm-glide"
            style={{
              "--sm-y": "70px",
              "--sm-x": `${(i % 3) * 6 - 6}px`,
              "--sm-dur": `${1.6 + (i % 4) * 0.3}s`,
              "--sm-delay": `${-i * 0.37}s`,
            }}
          >
            <rect
              x={1910 + ((i * 53) % 220)}
              y={380 + ((i * 29) % 50)}
              width="8"
              height="12"
              rx="2"
              transform={`rotate(${i * 37} ${1914 + ((i * 53) % 220)} ${386 + ((i * 29) % 50)})`}
              fill={BUNTING[i % BUNTING.length]}
            />
          </g>
        ))}
      </g>

      {/* Flags and a final tire wall on the far right */}
      <Flag x={2220} y={560} checkered delay={-0.4} />
      <Flag x={2330} y={570} color="#ff8a00" delay={-0.9} />
      <TireStack x={2360} y={600} n={3} />
      <Flag x={40} y={580} color="#6bcb77" delay={-0.5} />
    </g>
  );
});
