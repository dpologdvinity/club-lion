import { mat } from "./MaterialDefs";
import { memo, type CSSProperties } from "react";

const STAGE_WIDTH = 2400;
const HORIZON = 330;

// Deterministic sand speckles so the beach texture never reshuffles between frames.
const SAND_SPECKLES = Array.from({ length: 90 }, (_, i) => ({
  x: (i * 263) % STAGE_WIDTH,
  y: 560 + ((i * 97) % 150),
  r: 1.5 + (i % 3),
}));

// Rotate about the local origin, like an SVG rotate(), instead of the fill-box.
const PIVOT: CSSProperties = { transformBox: "view-box", "--sm-origin": "0 0" };

// sm-pulse grows from the still frame toward the farther end of the old range.
const pulseToward = (now: number, lo: number, hi: number) =>
  String((now - lo > hi - now ? lo : hi) / now);

function BeachPalm({
  x,
  y,
  scale = 1,
  lean = 1,
  swayDelay,
}: {
  x: number;
  y: number;
  scale?: number;
  lean?: 1 | -1;
  swayDelay: number;
}) {
  const fronds = [-150, -115, -80, -45, -10, 25];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * lean} ${scale})`}>
      <ellipse cx="40" cy="6" rx="90" ry="14" fill="#a8743f" opacity=".25" />
      <path
        d="M0 0Q-4-120 30-220Q48-270 70-300"
        fill="none"
        stroke="#6d4b2c"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d="M0 0Q-4-120 30-220Q48-270 70-300"
        fill="none"
        stroke="#9b6c40"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {Array.from({ length: 11 }, (_, i) => {
        const t = i / 11;
        const px = -2 + t * 70 + Math.sin(t * 3) * 8;
        const py = -t * 295;
        return (
          <path
            key={i}
            d={`M${px - 11} ${py}q11 -7 22 0`}
            fill="none"
            stroke="#5a3d22"
            strokeWidth="3"
            opacity=".7"
          />
        );
      })}
      <g transform="translate(70 -300)">
        <g
          className="sm-sway"
          style={{
            ...PIVOT,
            "--sm-deg": "3deg",
            "--sm-dur": "3.49s",
            "--sm-delay": `${swayDelay}s`,
          }}
        >
          {fronds.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path
                d="M0 0Q70-38 150 8Q78-12 0 0"
                fill={i % 2 ? "#2f7a4f" : "#3d9460"}
              />
              <path
                d="M0 0Q70-38 150 8"
                fill="none"
                stroke="#245c3c"
                strokeWidth="3"
              />
              {[30, 60, 90, 120].map((fx) => (
                <path
                  key={fx}
                  d={`M${fx} ${-16 + fx * 0.12}l12 22`}
                  stroke={i % 2 ? "#3d9460" : "#2f7a4f"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
            </g>
          ))}
          <circle cx="-8" cy="8" r="11" fill="#5d3b1d" />
          <circle cx="9" cy="12" r="10" fill="#6d4826" />
          <circle cx="1" cy="-2" r="9" fill="#4f321a" />
        </g>
      </g>
    </g>
  );
}

function TikiTorch({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        className="sm-pulse"
        style={{
          "--sm-dur": "0.35s",
          "--sm-scale": "1.2",
          "--sm-delay": `${delay}s`,
        }}
        cy="-150"
        r="58"
        fill="url(#sb-torch-glow)"
      />
      <path d="M-5 0L-7-118H7L5 0Z" fill="#7c5532" />
      {[-30, -60, -90].map((ry) => (
        <path key={ry} d={`M-8 ${ry}h16`} stroke="#4d321b" strokeWidth="4" />
      ))}
      <path
        d="M-14-118H14L10-136H-10Z"
        fill="#a5733f"
        stroke="#5e3f22"
        strokeWidth="3"
      />
      <path
        className="sm-pulse"
        style={{
          "--sm-dur": "0.3s",
          "--sm-scale": "1.25",
          "--sm-origin": "50% 100%",
          "--sm-delay": `${delay}s`,
        }}
        d="M-10-136Q-14-158 0-178Q14-158 10-136Z"
        fill="#ff8a3d"
      />
      <path
        className="sm-pulse"
        style={{
          "--sm-dur": "0.23s",
          "--sm-scale": "1.3",
          "--sm-origin": "50% 100%",
          "--sm-delay": `${delay * 0.7}s`,
        }}
        d="M-5-136Q-6-152 0-164Q6-152 5-136Z"
        fill="#ffe08a"
      />
    </g>
  );
}

function BeachUmbrella({
  x,
  y,
  tilt,
  colors,
}: {
  x: number;
  y: number;
  tilt: number;
  colors: [string, string];
}) {
  const panels = 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="20" cy="4" rx="150" ry="20" fill="#a8743f" opacity=".22" />
      <g transform={`rotate(${tilt})`}>
        <path d="M0 0V-190" stroke="#e8e0d0" strokeWidth="7" />
        {Array.from({ length: panels }, (_, i) => {
          const a = -130 + (i * 260) / panels;
          const b = -130 + ((i + 1) * 260) / panels;
          return (
            <path
              key={i}
              d={`M0 -190L${a} -125Q${(a + b) / 2} -142 ${b} -125Z`}
              fill={colors[i % 2]}
              stroke="#00000018"
              strokeWidth="2"
            />
          );
        })}
        <circle cy="-194" r="7" fill={colors[0]} />
      </g>
    </g>
  );
}

export function SunsetBeachScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return <SunsetBeachStage />;
}

const SunsetBeachStage = memo(function SunsetBeachStage() {
  const foamY = 506;
  const twinkle = (i: number) => 0.65 + Math.sin(i * 1.3) * 0.35;
  const twinkleStyle = (i: number): CSSProperties => ({
    "--sm-dur": "1.31s",
    "--sm-scale": pulseToward(twinkle(i), 0.3, 1),
    "--sm-delay": `${-(i * 1.3 + Math.PI / 2) / 2.4}s`,
  });
  const gulls = [0, 1, 2].map((i) => ({
    x: 120 + i * 140,
    y: 150 + i * 32 + Math.sin(i) * 10,
    flap: Math.sin(i * 2) * 6,
  }));
  const lightBulbs = Array.from({ length: 14 }, (_, i) => {
    const t = (i + 0.5) / 14;
    return { x: 1120 + t * 640, y: 330 + Math.sin(t * Math.PI) * 48 };
  });

  return (
    <g className="sunset-beach-scenery">
      <defs>
        <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c4677" />
          <stop offset="30%" stopColor="#7d5c8c" />
          <stop offset="60%" stopColor="#d9807a" />
          <stop offset="85%" stopColor="#f6ad6a" />
          <stop offset="100%" stopColor="#ffd796" />
        </linearGradient>
        <radialGradient id="sb-sun">
          <stop offset="0%" stopColor="#fffbe2" />
          <stop offset="60%" stopColor="#ffe08e" />
          <stop offset="100%" stopColor="#ffb760" />
        </radialGradient>
        <radialGradient id="sb-sun-glow">
          <stop offset="0%" stopColor="#ffe6a3" stopOpacity=".75" />
          <stop offset="100%" stopColor="#ffb36b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sb-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c48a92" />
          <stop offset="18%" stopColor="#7f8fa6" />
          <stop offset="55%" stopColor="#3f7f95" />
          <stop offset="100%" stopColor="#2b6b7f" />
        </linearGradient>
        <linearGradient id="sb-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9b980" />
          <stop offset="40%" stopColor="#f3cd95" />
          <stop offset="100%" stopColor="#dfaa6d" />
        </linearGradient>
        <linearGradient id="sb-thatch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2b766" />
          <stop offset="100%" stopColor="#a8783c" />
        </linearGradient>
        <radialGradient id="sb-torch-glow">
          <stop offset="0%" stopColor="#ffcf73" stopOpacity=".55" />
          <stop offset="100%" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sb-bulb-glow">
          <stop offset="0%" stopColor="#fff2bf" stopOpacity=".9" />
          <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky, clouds and setting sun */}
      <rect width={STAGE_WIDTH} height={HORIZON + 10} fill="url(#sb-sky)" />
      <circle cx="1250" cy={HORIZON - 10} r="300" fill="url(#sb-sun-glow)" />
      <circle cx="1250" cy={HORIZON - 10} r="120" fill="url(#sb-sun)" />
      <g
        className="sm-drift"
        style={{ "--sm-dist": `${STAGE_WIDTH}px`, "--sm-dur": "600s" }}
      >
        {[0, -STAGE_WIDTH].map((offset) => (
          <g key={offset} transform={`translate(${offset} 0)`} opacity=".85">
            {[
              [260, 110, 260, 22],
              [720, 70, 320, 18],
              [1660, 128, 300, 24],
              [2120, 64, 220, 16],
            ].map(([cx, cy, rx, ry]) => (
              <g key={cx}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#f7c1a4" />
                <ellipse
                  cx={cx + 20}
                  cy={cy + ry * 0.55}
                  rx={rx * 0.85}
                  ry={ry * 0.5}
                  fill="#e58f88"
                />
              </g>
            ))}
          </g>
        ))}
      </g>
      {gulls.map((g, i) => (
        <g
          key={i}
          className="sm-drift"
          style={{
            "--sm-dist": `${STAGE_WIDTH + 200}px`,
            "--sm-dur": `${(STAGE_WIDTH + 200) / (22 + i * 6)}s`,
          }}
        >
          {[0, -(STAGE_WIDTH + 200)].map((offset) => (
            <g key={offset} transform={`translate(${g.x + offset} ${g.y})`}>
              <g
                className="sm-bob"
                style={{
                  "--sm-dur": "2.24s",
                  "--sm-amp": "10px",
                  "--sm-delay": `${-(i + Math.PI / 2) / 1.4}s`,
                }}
                fill="none"
                stroke="#4b3b56"
                strokeWidth="3.5"
                strokeLinecap="round"
              >
                {/* Wings flap by rotating about the body; the left one mirrors the right. */}
                {[
                  { d: `M-16 ${g.flap}Q-8 -8 0 0`, mirror: Math.PI },
                  { d: `M0 0Q8 -8 16 ${g.flap}`, mirror: 0 },
                ].map(({ d, mirror }) => (
                  <path
                    key={d}
                    className="sm-sway"
                    style={{
                      ...PIVOT,
                      "--sm-deg": "22deg",
                      "--sm-dur": "0.52s",
                      "--sm-delay": `${-(i * 2 + Math.PI / 2 + mirror) / 6}s`,
                    }}
                    d={d}
                  />
                ))}
              </g>
            </g>
          ))}
        </g>
      ))}

      {/* Distant islands */}
      <path
        d={`M180 ${HORIZON}Q260 ${HORIZON - 46} 360 ${HORIZON - 30}Q470 ${HORIZON - 70} 620 ${HORIZON}Z`}
        fill="#7b5a7b"
        opacity=".75"
      />
      <path
        d={`M1850 ${HORIZON}Q1960 ${HORIZON - 40} 2080 ${HORIZON - 22}Q2160 ${HORIZON - 34} 2260 ${HORIZON}Z`}
        fill="#86627f"
        opacity=".7"
      />

      {/* Ocean with sun glitter and rolling swells */}
      <rect
        y={HORIZON}
        width={STAGE_WIDTH}
        height={720 - HORIZON}
        fill="url(#sb-ocean)"
      />
      <rect
        y={HORIZON}
        width={STAGE_WIDTH}
        height={720 - HORIZON}
        fill={mat("water")}
      />
      {Array.from({ length: 9 }, (_, i) => {
        const mid = 240 - i * 18;
        const w = mid + Math.sin(i) * 24;
        const shift = Math.sin(i * 2) * 12;
        return (
          <g
            key={i}
            className="sm-glide"
            style={{
              "--sm-dur": `${Math.PI}s`,
              "--sm-x": `${shift > 0 ? -24 : 24}px`,
            }}
          >
            <rect
              className="sm-pulse"
              style={{
                "--sm-dur": "1.96s",
                "--sm-scale": pulseToward(w, mid - 24, mid + 24),
                "--sm-delay": `${-(i + Math.PI / 2) / 1.6}s`,
              }}
              x={1250 - w / 2 + shift}
              y={HORIZON + 8 + i * 17}
              width={w}
              height="5"
              rx="2.5"
              fill="#ffe2a2"
              opacity={0.7 - i * 0.06}
            />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((row) => (
        <g
          key={row}
          className="sm-drift"
          style={{
            "--sm-dist": `${STAGE_WIDTH + 200}px`,
            "--sm-dur": `${(STAGE_WIDTH + 200) / (8 + row * 3)}s`,
          }}
          fill="none"
          stroke="#cfe6e1"
          strokeWidth={3 + row}
          strokeLinecap="round"
        >
          {[row, row + 4, row + 8, row + 12].flatMap((i) => {
            const x = ((i * 173) % (STAGE_WIDTH + 200)) - 100;
            const y = 370 + row * 34 + Math.sin(i) * 4;
            return [0, -(STAGE_WIDTH + 200)].map((offset) => (
              <path
                key={`${i}${offset}`}
                className="sm-bob"
                style={{
                  "--sm-dur": "3.49s",
                  "--sm-amp": "4px",
                  "--sm-delay": `${-(i + Math.PI / 2) / 0.9}s`,
                }}
                d={`M${x + offset} ${y}q40 -10 80 0t80 0`}
                opacity={0.35 + row * 0.1}
              />
            ));
          })}
        </g>
      ))}
      <g transform={`translate(300 ${HORIZON + 14})`}>
        <g
          className="sm-drift"
          style={{ "--sm-dist": "1900px", "--sm-dur": "211s" }}
        >
          <path d="M-26 0H26L18 9H-18Z" fill="#5d4560" />
          <path d="M0 -2V-46L24 -6Z" fill="#fff0d8" />
          <path d="M-2 -6V-38L-20 -6Z" fill="#f2b28c" />
        </g>
      </g>

      {/* Shoreline: wet sand, foam and dry beach */}
      <g
        className="sm-bob"
        style={{
          "--sm-dur": "3.93s",
          "--sm-amp": "7px",
          "--sm-delay": "-1.96s",
        }}
      >
        <path
          d={`M0 ${foamY + 6}Q600 ${foamY - 18} 1200 ${foamY + 4}T2400 ${foamY - 4}V720H0Z`}
          fill="#c9965f"
        />
        <path
          d={`M0 ${foamY + 6}Q600 ${foamY - 18} 1200 ${foamY + 4}T2400 ${foamY - 4}V720H0Z`}
          fill={mat("sand")}
        />
        <path
          d={`M0 ${foamY}Q600 ${foamY - 24} 1200 ${foamY - 2}T2400 ${foamY - 10}`}
          fill="none"
          stroke="#fff6e4"
          strokeWidth="10"
          strokeLinecap="round"
          opacity=".9"
        />
        <path
          d={`M0 ${foamY + 10}Q600 ${foamY - 12} 1200 ${foamY + 8}T2400 ${foamY}`}
          fill="none"
          stroke="#fff6e4"
          strokeWidth="4"
          strokeDasharray="30 22"
          opacity=".6"
        />
      </g>
      <path d="M0 540Q520 512 1100 536T2400 528V720H0Z" fill="url(#sb-sand)" />
      <path d="M0 540Q520 512 1100 536T2400 528V720H0Z" fill={mat("sand")} />
      <path
        d="M0 650Q420 610 900 640T1700 652T2400 628V720H0Z"
        fill="#e5b273"
        opacity=".55"
      />
      {SAND_SPECKLES.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={i % 2 ? "#c99459" : "#fff1d2"}
          opacity=".5"
        />
      ))}

      {/* Palms framing the bay */}
      <BeachPalm x={70} y={560} scale={1.15} swayDelay={-1.75} />
      <BeachPalm x={430} y={548} scale={0.85} lean={-1} swayDelay={-5.24} />
      <BeachPalm x={2050} y={552} scale={0.95} lean={-1} swayDelay={-1.75} />

      {/* Directional sign to Downtown */}
      <g transform="translate(190 560)">
        <path d="M-5 0V-120H5V0Z" fill="#8a5e36" />
        <path
          d="M-58-112H72V-80H-58L-76-96Z"
          fill="#e7c48f"
          stroke="#7a522d"
          strokeWidth="4"
        />
        <text x="6" y="-89" textAnchor="middle" fontSize="17" fill="#5d3d20">
          DOWNTOWN
        </text>
      </g>

      {/* Sunset Cabana tiki bar */}
      <TikiTorch x={600} y={560} delay={0} />
      <TikiTorch x={1070} y={560} delay={-0.17} />
      <g transform="translate(835 560)">
        <ellipse cy="8" rx="270" ry="26" fill="#a8743f" opacity=".3" />
        {[-185, -65, 65, 185].map((px) => (
          <g key={px}>
            <path d={`M${px - 9} 0V-210H${px + 9}V0Z`} fill="#b88a4a" />
            {[-40, -95, -150].map((ry) => (
              <path
                key={ry}
                d={`M${px - 10} ${ry}h20`}
                stroke="#7b5a2c"
                strokeWidth="4"
              />
            ))}
          </g>
        ))}
        {/* Layered thatch roof with fringe */}
        <path
          d="M-260-200Q-130-300 0-330Q130-300 260-200Z"
          fill="url(#sb-thatch)"
          stroke="#7d5428"
          strokeWidth="5"
        />
        <path
          d="M-260-200Q-130-300 0-330Q130-300 260-200Z"
          fill={mat("bamboo")}
        />
        <path
          d={`M-268-200${Array.from(
            { length: 27 },
            (_, i) =>
              `L${-268 + i * 20 + 10} ${-170 + (i % 2) * 6}L${-268 + (i + 1) * 20} -200`,
          ).join("")}Z`}
          fill="#c99a52"
          stroke="#7d5428"
          strokeWidth="3"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M0-326Q${-120 + i * 30}-270 ${-230 + i * 57}-205`}
            fill="none"
            stroke="#f0cf86"
            strokeWidth="4"
            opacity=".6"
          />
        ))}
        {/* Carved sign plank */}
        <g transform="translate(0 -232)">
          <rect
            x="-130"
            y="-24"
            width="260"
            height="46"
            rx="10"
            fill="#7a4f2a"
            stroke="#4f3219"
            strokeWidth="4"
          />
          <rect
            x="-130"
            y="-24"
            width="260"
            height="46"
            rx="10"
            fill={mat("wood")}
          />
          <text
            y="10"
            textAnchor="middle"
            fontSize="28"
            fill="#ffd98a"
            letterSpacing="2"
          >
            SUNSET CABANA
          </text>
        </g>
        {/* Hanging lanterns */}
        {[-125, 0, 125].map((lx, i) => (
          <g key={lx} transform={`translate(${lx} -168)`}>
            <path d="M0-4V14" stroke="#4f3219" strokeWidth="2" />
            <circle
              className="sm-pulse"
              style={twinkleStyle(i)}
              cy="30"
              r={30 * twinkle(i)}
              fill="url(#sb-bulb-glow)"
            />
            <ellipse
              cy="30"
              rx="12"
              ry="16"
              fill={["#ff9a6a", "#ffd56f", "#7fd0c0"][i]}
            />
            <path d="M-12 30h24" stroke="#00000030" strokeWidth="2" />
          </g>
        ))}
        {/* Bamboo bar counter */}
        <path d="M-210-78H210V-62H-210Z" fill="#8a5a2e" />
        <path d="M-210-78H210V-62H-210Z" fill={mat("bamboo")} />
        <rect x="-200" y="-62" width="400" height="62" fill="#d7ac62" />
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <path
              d={`M${-200 + i * 33 + 16} -62V0`}
              stroke="#a97c3d"
              strokeWidth="4"
            />
            <path
              d={`M${-200 + i * 33 + 6} -32h20`}
              stroke="#8e6430"
              strokeWidth="3"
            />
          </g>
        ))}
        {/* Coconut drinks */}
        {[-150, -40, 90, 160].map((cx, i) => (
          <g key={cx} transform={`translate(${cx} -78)`}>
            <circle cy="-12" r="13" fill="#6a4426" />
            <ellipse cy="-20" rx="10" ry="4" fill="#fff1d9" />
            <path
              d="M3-20L14-42"
              stroke={i % 2 ? "#ff6f91" : "#4fc3b0"}
              strokeWidth="3"
            />
            <path d="M-6-22l-8-12 12 4Z" fill="#ff9fb8" />
          </g>
        ))}
        {/* Bar stools */}
        {[-150, -50, 50, 150].map((sx) => (
          <g key={sx} transform={`translate(${sx} 20)`}>
            <path d="M-14 0L-8-34M14 0L8-34" stroke="#6d4826" strokeWidth="5" />
            <ellipse cy="-36" rx="22" ry="7" fill="#c46a4a" />
          </g>
        ))}
      </g>

      {/* Surfboard rack */}
      <g transform="translate(1150 560)">
        <path d="M-50-60H70" stroke="#7b5a2c" strokeWidth="8" />
        <path d="M-40 0V-70M60 0V-70" stroke="#7b5a2c" strokeWidth="8" />
        {(
          [
            [-30, "#ff7b6b", -8],
            [8, "#4fc3b0", -3],
            [46, "#ffd56f", 4],
          ] as const
        ).map(([sx, color, tilt]) => (
          <g key={sx} transform={`translate(${sx} 0) rotate(${tilt})`}>
            <path
              d="M0 0C-17-40-17-130 0-170C17-130 17-40 0 0Z"
              fill={color}
              stroke="#00000030"
              strokeWidth="3"
            />
            <path d="M0-8V-160" stroke="#fff6e4" strokeWidth="3" opacity=".8" />
          </g>
        ))}
      </g>

      {/* Festoon lights over the umbrella lounge */}
      <path
        d={`M1120 330Q1440 ${330 + 96} 1760 330`}
        fill="none"
        stroke="#4f3219"
        strokeWidth="2.5"
      />
      {lightBulbs.map((b, i) => (
        <g key={i}>
          <circle
            className="sm-pulse"
            style={twinkleStyle(i)}
            cx={b.x}
            cy={b.y + 8}
            r={16 * twinkle(i)}
            fill="url(#sb-bulb-glow)"
          />
          <circle
            cx={b.x}
            cy={b.y + 8}
            r="5"
            fill={i % 3 ? "#ffe9a8" : "#ffb0c4"}
          />
        </g>
      ))}
      <path d="M1120 560V322M1760 560V322" stroke="#7b5a2c" strokeWidth="8" />

      {/* Umbrella lounge */}
      <BeachUmbrella
        x={1340}
        y={590}
        tilt={-6}
        colors={["#e86a5c", "#fff3e0"]}
      />
      <BeachUmbrella
        x={1600}
        y={578}
        tilt={5}
        colors={["#2f9e95", "#fff3e0"]}
      />
      <g transform="translate(1340 604) skewX(-20)">
        <rect x="-70" y="-14" width="140" height="28" rx="6" fill="#ffd56f" />
        {[-45, -15, 15, 45].map((tx) => (
          <rect
            key={tx}
            x={tx - 6}
            y="-14"
            width="12"
            height="28"
            fill="#ff8a65"
          />
        ))}
      </g>
      <g transform="translate(1610 594) skewX(18)">
        <rect x="-62" y="-12" width="124" height="24" rx="6" fill="#7fd0c0" />
        <path d="M-62 0H62" stroke="#fff3e0" strokeWidth="6" />
      </g>
      <g transform="translate(1478 640)">
        <g
          className="sm-glide"
          style={{ "--sm-dur": "0.71s", "--sm-y": "-10px" }}
        >
          <circle r="20" fill="#fff6e4" />
          <path d="M-20 0A20 20 0 0 1 0-20V0Z" fill="#e86a5c" />
          <path d="M20 0A20 20 0 0 1 0 20V0Z" fill="#2f9e95" />
          <path d="M0-20A20 20 0 0 1 20 0H0Z" fill="#ffd56f" />
          <circle r="20" fill="none" stroke="#00000025" strokeWidth="2" />
        </g>
      </g>

      {/* Lifeguard tower with lion pennant */}
      <g transform="translate(1900 560)">
        <ellipse cy="6" rx="120" ry="16" fill="#a8743f" opacity=".25" />
        <path
          d="M-70 0L-50-150M70 0L50-150M-60-75H60M-62-75L58-150M62-75L-58-150"
          stroke="#f4ead8"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path d="M60 0L130-110" stroke="#c99a5e" strokeWidth="14" />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${72 + i * 15} ${-20 - i * 24}h24`}
            stroke="#8a5e36"
            strokeWidth="4"
          />
        ))}
        <rect x="-78" y="-158" width="156" height="14" fill="#d9534f" />
        <rect
          x="-64"
          y="-252"
          width="128"
          height="94"
          rx="6"
          fill="#fff6e4"
          stroke="#b9443f"
          strokeWidth="5"
        />
        <rect x="-46" y="-236" width="92" height="44" rx="4" fill="#9dd2d6" />
        <path d="M-46-214H46" stroke="#fff6e4" strokeWidth="3" />
        <path
          d="M-84-252L0-292L84-252Z"
          fill="#d9534f"
          stroke="#a63b37"
          strokeWidth="4"
        />
        <path
          d="M-42-262L0-282L42-262"
          stroke="#fff6e4"
          strokeWidth="6"
          fill="none"
        />
        <text
          y="-170"
          textAnchor="middle"
          fontSize="15"
          fill="#b9443f"
          letterSpacing="2"
        >
          LIFEGUARD
        </text>
        <path d="M0-292V-352" stroke="#7b5a2c" strokeWidth="4" />
        <g
          className="sm-sway"
          style={{
            "--sm-deg": "8deg",
            "--sm-dur": "0.98s",
            "--sm-origin": "0% 50%",
            "--sm-delay": "-0.49s",
          }}
        >
          <path d="M2-350Q24-354 48-344Q26-332 2-326Z" fill="#ffb84d" />
          <circle cx="18" cy="-338" r="6" fill="#c46a2a" />
        </g>
        {/* Ring buoy */}
        <circle
          cx="-60"
          cy="-95"
          r="16"
          fill="none"
          stroke="#ff6f61"
          strokeWidth="9"
        />
        <circle
          cx="-60"
          cy="-95"
          r="16"
          fill="none"
          stroke="#fff6e4"
          strokeWidth="9"
          strokeDasharray="8 17"
        />
      </g>

      {/* Foreground sandcastle and shells */}
      <g transform="translate(1180 660)">
        <path d="M-58 0V-34H58V0Z" fill="#d9a466" />
        <path
          d="M-50-34V-58H-26V-34M26-34V-58H50V-34M-18-34V-78H18V-34"
          fill="#e6b678"
        />
        {[-50, -36, 26, 40, -18, -4, 10].map((cx, i) => (
          <rect
            key={i}
            x={cx}
            y={i > 3 ? -86 : -66}
            width="8"
            height="8"
            fill="#e6b678"
          />
        ))}
        <path d="M-6-34V-52Q0-60 6-52V-34Z" fill="#a8743f" />
        <path d="M0-86V-112" stroke="#7b5a2c" strokeWidth="3" />
        <path
          className="sm-sway"
          style={{
            "--sm-deg": "10deg",
            "--sm-dur": "0.98s",
            "--sm-origin": "0% 50%",
            "--sm-delay": "-0.49s",
          }}
          d="M0-112L20-104L0-96Z"
          fill="#e86a5c"
        />
      </g>
      {(
        [
          [520, 670, "#ffb8a8"],
          [980, 692, "#fff1d9"],
          [1700, 676, "#ffcf9a"],
          [2240, 690, "#ffb8a8"],
        ] as const
      ).map(([sx, sy, color]) => (
        <g key={sx} transform={`translate(${sx} ${sy})`}>
          <path
            d="M-16 0Q0-30 16 0Z"
            fill={color}
            stroke="#c18d60"
            strokeWidth="3"
          />
          <path
            d="M0-13V0M-7-9L-4 0M7-9L4 0"
            stroke="#c18d60"
            strokeWidth="2"
          />
        </g>
      ))}
      {[
        [760, 700],
        [2010, 664],
      ].map(([sx, sy]) => (
        <path
          key={sx}
          transform={`translate(${sx} ${sy}) rotate(${sx % 40})`}
          d="M0-16L5-5L17-4L8 4L11 16L0 9L-11 16L-8 4L-17-4L-5-5Z"
          fill="#ff8a65"
          stroke="#c9563b"
          strokeWidth="2"
        />
      ))}

      {/* Boardwalk entrance to the Coastal Pier */}
      <g transform="translate(2250 540)">
        <path d="M0 0H150V70H-30Z" fill="#b38e6a" />
        <path d="M0 0H150V70H-30Z" fill={mat("planks")} />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${-8 * i} ${i * 18}H150`}
            stroke="#755e4a"
            strokeWidth="3"
          />
        ))}
        <path d="M10 0V-70M140 0V-70" stroke="#79614b" strokeWidth="10" />
        <path
          d="M10-56Q75-36 140-56"
          fill="none"
          stroke="#d8b78c"
          strokeWidth="5"
        />
        <g transform="translate(75 -110)">
          <path
            d="M-52-20H40L56 0L40 20H-52Z"
            fill="#e7c48f"
            stroke="#7a522d"
            strokeWidth="4"
          />
          <text x="-4" y="7" textAnchor="middle" fontSize="18" fill="#5d3d20">
            PIER
          </text>
          <path d="M-4 20V70" stroke="#8a5e36" strokeWidth="8" />
        </g>
      </g>
    </g>
  );
});
