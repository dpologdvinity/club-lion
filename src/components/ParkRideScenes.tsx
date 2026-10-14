import {
  useEffect,
  useId,
  useRef,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from "react";
import { Hand } from "lucide-react";
import { Avatar } from "./Avatar";
import { PetCompanion } from "./PetCompanion";
import type { AvatarLook, PetState } from "../types/world.ts";
import {
  spinTeacup,
  teacupDizziness,
  TEACUP_BASE_SPEED,
  type ParkRideId,
} from "../utils/parkRides.ts";

export type SceneProps = {
  look: AvatarLook;
  pet?: PetState;
  armsUp: boolean;
  holding: RefObject<boolean>;
};

/*
 * Every scene is a full-bleed backdrop SVG (1000 x 1000, sliced to the stage)
 * plus a centred rider. Anything the vehicle touches (wheel, track, tower) is
 * drawn in the rider's own 200 x 200 units so it lines up at any aspect ratio.
 */

function Backdrop({ children }: { children: ReactNode }) {
  return (
    <svg
      className="pr-scene"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Rider({
  look,
  pet,
  armsUp,
  behind,
  back,
  front,
  over,
}: {
  look: AvatarLook;
  pet?: PetState;
  armsUp: boolean;
  behind?: ReactNode;
  back: ReactNode;
  front: ReactNode;
  over?: ReactNode;
}) {
  return (
    <div className="pr-rider" aria-hidden="true">
      {behind && (
        <svg className="pr-layer" viewBox="0 0 200 200" overflow="visible">
          {behind}
        </svg>
      )}
      <div className="pr-rider-body">
        <svg className="pr-layer" viewBox="0 0 200 200" overflow="visible">
          {back}
        </svg>
        <Avatar
          look={look}
          action={armsUp ? "wave" : "sit"}
          className="pr-avatar"
        />
        {pet && (
          <div className="pr-pet">
            <PetCompanion pet={pet} isTrotting={false} />
          </div>
        )}
        <svg className="pr-layer" viewBox="0 0 200 200" overflow="visible">
          {front}
        </svg>
      </div>
      {over && (
        <svg className="pr-layer" viewBox="0 0 200 200" overflow="visible">
          {over}
        </svg>
      )}
    </div>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
      <ellipse cx="0" cy="0" rx="70" ry="30" />
      <circle cx="-30" cy="-18" r="30" />
      <circle cx="18" cy="-28" r="38" />
      <circle cx="55" cy="-6" r="24" />
    </g>
  );
}

function Tent({
  x,
  y,
  w,
  h,
  a,
  b,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  a: string;
  b: string;
}) {
  const stripes = 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h * 0.45} width={w} height={h * 0.45} fill={a} />
      <path d={`M0 ${-h} L${-w / 2} ${-h * 0.45} H${w / 2} Z`} fill={a} />
      {Array.from({ length: stripes }, (_, i) => (
        <path
          key={i}
          d={`M0 ${-h} L${-w / 2 + (i * w) / stripes} ${-h * 0.45} H${-w / 2 + ((i + 0.5) * w) / stripes} Z`}
          fill={b}
        />
      ))}
      <path
        d={`M${-w * 0.14} 0 V${-h * 0.32} Q0 ${-h * 0.42} ${w * 0.14} ${-h * 0.32} V0 Z`}
        fill="#3b1d4a"
      />
      <line
        x1="0"
        y1={-h}
        x2="0"
        y2={-h - 26}
        stroke="#7c4a1e"
        strokeWidth="4"
      />
      <path d={`M0 ${-h - 26} l22 7 l-22 7 Z`} fill={b} />
    </g>
  );
}

function Bulbs({
  from,
  to,
  count,
  sag = 30,
  r = 6,
}: {
  from: [number, number];
  to: [number, number];
  count: number;
  sag?: number;
  r?: number;
}) {
  const colors = ["#fde047", "#f472b6", "#67e8f9", "#fdba74"];
  const point = (t: number) => [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * sag,
  ];
  const [mx, my] = point(0.5);
  return (
    <g>
      <path
        d={`M${from[0]} ${from[1]} Q${mx} ${my + sag} ${to[0]} ${to[1]}`}
        fill="none"
        stroke="#3b2a4f"
        strokeWidth="2"
      />
      {Array.from({ length: count }, (_, i) => {
        const [x, y] = point((i + 0.5) / count);
        return (
          <circle
            key={i}
            className="sm-twinkle"
            style={{ "--sm-dur": "1.6s", "--sm-delay": `${-i * 0.37}s` }}
            cx={x}
            cy={y + 6}
            r={r}
            fill={colors[i % colors.length]}
          />
        );
      })}
    </g>
  );
}

function LionFace({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r / 50})`}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * 40}
            cy={Math.sin(a) * 40}
            r="15"
            fill="#ea580c"
          />
        );
      })}
      <circle r="42" fill="#f97316" />
      <circle cx="-26" cy="-26" r="10" fill="#fbbf24" />
      <circle cx="26" cy="-26" r="10" fill="#fbbf24" />
      <circle r="31" fill="#fcd34d" />
      <circle cx="-11" cy="-6" r="4.5" fill="#3b1d0a" />
      <circle cx="11" cy="-6" r="4.5" fill="#3b1d0a" />
      <path d="M-6 5 H6 L0 12 Z" fill="#7c2d12" />
      <path
        d="M-9 15 Q0 22 9 15"
        fill="none"
        stroke="#7c2d12"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

// ======================= Ferris wheel =======================

const WHEEL_R = 520;

function Gondola({ color }: { color: string }) {
  return (
    <g>
      <line x1="0" y1="0" x2="0" y2="22" stroke="#7c5a2a" strokeWidth="6" />
      <path
        d="M-62 48 Q0 4 62 48 Z"
        fill={color}
        stroke="#7c2d12"
        strokeWidth="4"
      />
      <line
        x1="-56"
        y1="48"
        x2="-56"
        y2="112"
        stroke="#b45309"
        strokeWidth="5"
      />
      <line x1="56" y1="48" x2="56" y2="112" stroke="#b45309" strokeWidth="5" />
      <path
        d="M-64 104 H64 L54 158 Q0 172 -54 158 Z"
        fill="#fff7ed"
        stroke="#7c2d12"
        strokeWidth="4"
      />
      <path d="M-60 122 H60" stroke={color} strokeWidth="10" />
    </g>
  );
}

function FerrisScene({ look, pet, armsUp }: SceneProps) {
  const id = useId();
  const gondolaColors = ["#f472b6", "#38bdf8", "#a3e635", "#facc15", "#c084fc"];
  return (
    <>
      <Backdrop>
        <defs>
          <linearGradient id={`${id}day`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fb8f0" />
            <stop offset="1" stopColor="#d9f2ff" />
          </linearGradient>
          <linearGradient id={`${id}dusk`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2f7a" />
            <stop offset="0.35" stopColor="#b8467d" />
            <stop offset="0.6" stopColor="#ff8a5c" />
            <stop offset="0.75" stopColor="#ffd27a" />
          </linearGradient>
          <radialGradient id={`${id}sun`}>
            <stop offset="0" stopColor="#fff7c2" />
            <stop offset="0.35" stopColor="#ffd56b" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff9a5c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="1000" fill={`url(#${id}day)`} />
        <rect
          className="pr-ferris-sunset"
          width="1000"
          height="1000"
          fill={`url(#${id}dusk)`}
        />
        <g className="pr-ferris-sun">
          <circle cx="640" cy="610" r="260" fill={`url(#${id}sun)`} />
          <circle cx="640" cy="610" r="82" fill="#fff1a8" />
        </g>
        <g className="pr-ferris-sunset">
          {[
            [120, 120],
            [330, 70],
            [880, 150],
            [760, 60],
            [60, 300],
          ].map(([x, y], i) => (
            <circle
              key={i}
              className="sm-twinkle"
              style={{ "--sm-dur": "2.2s", "--sm-delay": `${-i * 0.6}s` }}
              cx={x}
              cy={y}
              r="5"
              fill="#fff"
            />
          ))}
        </g>
        <g
          className="sm-drift"
          style={{ "--sm-dur": "70s", "--sm-dist": "1400px" }}
        >
          <g opacity="0.85">
            <Cloud x={-200} y={240} s={1.3} />
            <Cloud x={-900} y={160} />
            <Cloud x={300} y={300} s={0.8} />
          </g>
        </g>
        <g className="pr-ferris-far">
          <path
            d="M0 650 Q120 590 260 630 T540 610 T820 600 T1000 640 V1300 H0 Z"
            fill="#7c6fb0"
            opacity="0.8"
          />
          <path
            d="M0 690 Q160 640 320 680 T640 660 T1000 690 V1300 H0 Z"
            fill="#5b7f6e"
          />
          {[90, 230, 470, 790, 930].map((x, i) => (
            <g key={x} transform={`translate(${x} ${680 - (i % 2) * 14})`}>
              <rect x="-3" y="-34" width="6" height="34" fill="#3d4f3a" />
              <ellipse cx="0" cy="-38" rx="34" ry="10" fill="#3d5a40" />
            </g>
          ))}
        </g>
        <g className="pr-ferris-mid">
          <rect x="0" y="740" width="1000" height="600" fill="#e8b46a" />
          <path
            d="M-20 820 C120 740 220 900 360 820 S560 700 640 800 S820 900 1020 780"
            fill="none"
            stroke="#c2410c"
            strokeWidth="12"
          />
          <circle
            cx="520"
            cy="770"
            r="46"
            fill="none"
            stroke="#c2410c"
            strokeWidth="10"
          />
          <Tent x={180} y={930} w={150} h={130} a="#fff7ed" b="#ef4444" />
          <Tent x={420} y={980} w={120} h={110} a="#fff7ed" b="#3b82f6" />
          <Tent x={760} y={950} w={160} h={140} a="#fff7ed" b="#a855f7" />
          {[80, 300, 600, 900].map((x) => (
            <circle key={x} cx={x} cy={870} r="34" fill="#4d7c4f" />
          ))}
          <ellipse
            cx="610"
            cy="920"
            rx="70"
            ry="22"
            fill="#fde68a"
            stroke="#b45309"
            strokeWidth="5"
          />
        </g>
        <g className="pr-ferris-near">
          <rect x="0" y="760" width="1000" height="500" fill="#d98b4f" />
          <Tent x={130} y={780} w={300} h={330} a="#fff7ed" b="#f43f5e" />
          <Tent x={880} y={790} w={280} h={300} a="#fff7ed" b="#0ea5e9" />
          {[330, 700].map((x) => (
            <g key={x}>
              <rect x={x - 5} y="420" width="10" height="360" fill="#334155" />
              <circle cx={x} cy="414" r="20" fill="#fde047" />
            </g>
          ))}
          {[
            [420, 520, "#f43f5e"],
            [470, 480, "#facc15"],
            [560, 530, "#38bdf8"],
          ].map(([x, y, c]) => (
            <g key={String(c)}>
              <line
                x1={Number(x)}
                y1={Number(y)}
                x2="500"
                y2="760"
                stroke="#64748b"
                strokeWidth="2"
              />
              <ellipse
                cx={Number(x)}
                cy={Number(y)}
                rx="30"
                ry="36"
                fill={String(c)}
              />
            </g>
          ))}
        </g>
        <g className="pr-birds">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${i * 46} ${i * 22} q14 -14 28 0 q14 -14 28 0`}
              fill="none"
              stroke="#3b2f4a"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ))}
        </g>
      </Backdrop>
      <Rider
        look={look}
        pet={pet}
        armsUp={armsUp}
        behind={
          <g transform="translate(100 -70)">
            <g className="pr-ferris-turn pr-pivot">
              <circle
                cx="0"
                cy={-WHEEL_R}
                r={WHEEL_R}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="18"
              />
              <circle
                cx="0"
                cy={-WHEEL_R}
                r={WHEEL_R - 36}
                fill="none"
                stroke="#fcd34d"
                strokeWidth="6"
              />
              {Array.from({ length: 16 }, (_, i) => {
                const a = (i / 16) * Math.PI * 2;
                return (
                  <line
                    key={i}
                    x1="0"
                    y1={-WHEEL_R}
                    x2={Math.sin(a) * WHEEL_R}
                    y2={-WHEEL_R + Math.cos(a) * WHEEL_R}
                    stroke="#fbbf24"
                    strokeWidth="7"
                  />
                );
              })}
              {Array.from({ length: 40 }, (_, i) => {
                const a = (i / 40) * Math.PI * 2;
                return (
                  <circle
                    key={i}
                    className="sm-twinkle"
                    style={{
                      "--sm-dur": "1.2s",
                      "--sm-delay": `${-(i % 4) * 0.3}s`,
                    }}
                    cx={Math.sin(a) * WHEEL_R}
                    cy={-WHEEL_R + Math.cos(a) * WHEEL_R}
                    r="7"
                    fill={i % 2 ? "#fff7c2" : "#f9a8d4"}
                  />
                );
              })}
              <circle cx="0" cy={-WHEEL_R} r="70" fill="#f59e0b" />
              <circle cx="0" cy={-WHEEL_R} r="52" fill="#fde68a" />
              <circle cx="-16" cy={-WHEEL_R - 8} r="6" fill="#78350f" />
              <circle cx="16" cy={-WHEEL_R - 8} r="6" fill="#78350f" />
              <path
                d={`M-16 ${-WHEEL_R + 14} Q0 ${-WHEEL_R + 28} 16 ${-WHEEL_R + 14}`}
                fill="none"
                stroke="#78350f"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {Array.from({ length: 11 }, (_, k) => {
                const a = ((k + 1) / 12) * Math.PI * 2;
                return (
                  <g
                    key={k}
                    transform={`translate(${Math.sin(a) * WHEEL_R} ${-WHEEL_R + Math.cos(a) * WHEEL_R})`}
                  >
                    <g className="pr-ferris-counter pr-pivot">
                      <Gondola
                        color={gondolaColors[k % gondolaColors.length]}
                      />
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
        }
        back={
          <>
            <line
              x1="100"
              y1="-70"
              x2="100"
              y2="-36"
              stroke="#7c5a2a"
              strokeWidth="9"
            />
            <ellipse cx="100" cy="100" rx="80" ry="16" fill="#9a3412" />
          </>
        }
        front={
          <>
            <path
              d="M14 -6 Q100 -62 186 -6 Z"
              fill="#f43f5e"
              stroke="#881337"
              strokeWidth="5"
            />
            {[40, 70, 100, 130, 160].map((x) => (
              <circle key={x} cx={x} cy="-6" r="6" fill="#fde047" />
            ))}
            <line
              x1="20"
              y1="-4"
              x2="20"
              y2="104"
              stroke="#b45309"
              strokeWidth="7"
            />
            <line
              x1="180"
              y1="-4"
              x2="180"
              y2="104"
              stroke="#b45309"
              strokeWidth="7"
            />
            <path
              d="M10 96 H190 L176 176 Q100 198 24 176 Z"
              fill="#fff7ed"
              stroke="#7c2d12"
              strokeWidth="5"
            />
            <path d="M14 118 H186" stroke="#f43f5e" strokeWidth="14" />
            <path d="M17 140 H183" stroke="#facc15" strokeWidth="8" />
          </>
        }
      />
    </>
  );
}

// ======================= Midway panorama (teacups + carousel) =======================

function MidwayPanorama({ id }: { id: string }) {
  return (
    <>
      <defs>
        <g id={`${id}pano`}>
          <path
            d="M0 640 Q250 560 500 620 T1000 600 T1500 630 T2000 640 V700 H0 Z"
            fill="#4b2a6b"
          />
          <g transform="translate(330 400)">
            <circle r="200" fill="none" stroke="#fbbf24" strokeWidth="10" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <g key={i}>
                  <line
                    x2={Math.cos(a) * 200}
                    y2={Math.sin(a) * 200}
                    stroke="#fcd34d"
                    strokeWidth="4"
                  />
                  <circle
                    cx={Math.cos(a) * 200}
                    cy={Math.sin(a) * 200}
                    r="16"
                    fill={["#f472b6", "#67e8f9", "#a3e635"][i % 3]}
                  />
                </g>
              );
            })}
            <path
              d="M-120 250 L0 0 L120 250"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="14"
            />
          </g>
          <path
            d="M620 640 C680 380 760 380 820 560 S960 300 1040 640"
            fill="none"
            stroke="#fb7185"
            strokeWidth="12"
          />
          {[650, 720, 790, 860, 930, 1000].map((x) => (
            <line
              key={x}
              x1={x}
              y1="470"
              x2={x}
              y2="640"
              stroke="#be185d"
              strokeWidth="6"
            />
          ))}
          <Tent x={1220} y={660} w={260} h={270} a="#fff7ed" b="#ef4444" />
          <Tent x={1560} y={660} w={200} h={220} a="#fff7ed" b="#22c55e" />
          <Tent x={1850} y={660} w={240} h={250} a="#fff7ed" b="#3b82f6" />
          <Bulbs from={[0, 260]} to={[500, 280]} count={10} sag={50} />
          <Bulbs from={[500, 280]} to={[1000, 250]} count={10} sag={50} />
          <Bulbs from={[1000, 250]} to={[1500, 270]} count={10} sag={50} />
          <Bulbs from={[1500, 270]} to={[2000, 260]} count={10} sag={50} />
          <rect y="700" width="2000" height="320" fill="#f5d6a0" />
          {Array.from({ length: 20 }, (_, i) => (
            <path
              key={i}
              d={`M${i * 100} 700 l60 0 l-120 320 l-60 0 Z`}
              fill="#f59e0b"
              opacity="0.55"
            />
          ))}
          {[
            [160, "#f472b6"],
            [760, "#38bdf8"],
            [1380, "#a3e635"],
          ].map(([x, c]) => (
            <g key={String(x)} transform={`translate(${x} 720)`}>
              <ellipse
                cy="40"
                rx="110"
                ry="24"
                fill="#fef3c7"
                stroke="#b45309"
                strokeWidth="5"
              />
              <path
                d="M-90 -20 Q-86 40 0 44 Q86 40 90 -20 Z"
                fill={String(c)}
                stroke="#7c2d12"
                strokeWidth="5"
              />
              <ellipse
                cy="-20"
                rx="90"
                ry="20"
                fill="#fff7ed"
                stroke="#7c2d12"
                strokeWidth="5"
              />
              <LionFace x={-34} y={-40} r={24} />
              <LionFace x={32} y={-44} r={24} />
            </g>
          ))}
        </g>
      </defs>
      <use href={`#${id}pano`} />
      <use href={`#${id}pano`} x="2000" />
    </>
  );
}

function TwilightSky({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c224d" />
          <stop offset="0.45" stopColor="#7b3f7a" />
          <stop offset="0.7" stopColor="#e8855e" />
          <stop offset="0.85" stopColor="#fcd37d" />
        </linearGradient>
      </defs>
      <rect width="1000" height="1000" fill={`url(#${id}sky)`} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          className="sm-twinkle"
          style={{ "--sm-dur": "2.4s", "--sm-delay": `${-i * 0.41}s` }}
          cx={(i * 337) % 1000}
          cy={40 + ((i * 131) % 260)}
          r={i % 3 ? 3 : 5}
          fill="#fff"
        />
      ))}
    </>
  );
}

// ======================= Mango teacups =======================

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function TeacupScene({ look, pet, armsUp, holding }: SceneProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let cup = { angle: 0, speed: TEACUP_BASE_SPEED };
    let spun = 0;
    let last: number | null = null;
    let frame = requestAnimationFrame(function tick(now) {
      const dt = last === null || document.hidden ? 0 : (now - last) / 1000;
      last = now;
      const before = cup.angle;
      cup = spinTeacup(cup, dt, holding.current);
      spun += (cup.angle - before + 360) % 360;
      const dizzy = teacupDizziness(cup.speed);
      el.style.setProperty("--dizzy", dizzy.toFixed(3));
      el.style.setProperty("--pano", `${(-(spun % 360) / 360) * 2000}px`);
      el.style.setProperty("--spin", `${spun % 360}deg`);
      el.style.setProperty("--swirl", `${(spun * 0.6) % 360}deg`);
      el.style.setProperty("--band", `${-((spun * 0.5) % 60)}px`);
      el.style.setProperty("--wobble", `${Math.sin(now / 160) * dizzy * 7}deg`);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [holding]);
  const mango = (
    <g>
      <ellipse rx="13" ry="10" fill="#f59e0b" />
      <path d="M2 -9 q8 -8 14 -3 q-6 3 -14 3" fill="#22c55e" />
    </g>
  );
  return (
    <div ref={root} className="pr-scene-root">
      <Backdrop>
        <TwilightSky id={id} />
        <g className="pr-teacup-pano">
          <MidwayPanorama id={id} />
        </g>
        <g className="pr-streaks">
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={(i * 293) % 900}
              y={120 + i * 66}
              width={120 + (i % 3) * 60}
              height="6"
              rx="3"
              fill="#fff"
            />
          ))}
        </g>
        <g transform="translate(500 500)">
          <g className="pr-swirl pr-pivot">
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                transform={`rotate(${i * 90})`}
                d="M0 0 C120 -40 260 40 320 200 C360 320 280 420 160 460"
                fill="none"
                stroke={["#f9a8d4", "#fde047", "#a5f3fc", "#c4b5fd"][i]}
                strokeWidth="26"
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
      </Backdrop>
      <Rider
        look={look}
        pet={pet}
        armsUp={armsUp}
        back={
          <>
            <ellipse
              cx="100"
              cy="186"
              rx="110"
              ry="22"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="5"
            />
            <ellipse cx="100" cy="98" rx="92" ry="24" fill="#9a3412" />
          </>
        }
        front={
          <>
            <defs>
              <clipPath id={`${id}cup`}>
                <path d="M8 100 Q12 178 100 182 Q188 178 192 100 Z" />
              </clipPath>
            </defs>
            <path
              d="M188 112 q40 -6 34 30 q-6 30 -42 22"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
            />
            <path
              d="M8 100 Q12 178 100 182 Q188 178 192 100 Z"
              fill="#fde047"
              stroke="#b45309"
              strokeWidth="5"
            />
            <g clipPath={`url(#${id}cup)`}>
              <g className="pr-cup-band">
                {Array.from({ length: 8 }, (_, i) => (
                  <g key={i} transform={`translate(${i * 60 - 10} 138)`}>
                    {mango}
                  </g>
                ))}
              </g>
            </g>
            <path
              d="M8 100 Q100 128 192 100"
              fill="none"
              stroke="#f472b6"
              strokeWidth="9"
            />
            <g transform="translate(100 112)">
              <g className="pr-cup-wheel pr-pivot">
                <circle r="20" fill="none" stroke="#b45309" strokeWidth="6" />
                <line x1="-20" x2="20" stroke="#b45309" strokeWidth="5" />
                <line y1="-20" y2="20" stroke="#b45309" strokeWidth="5" />
                <circle r="6" fill="#facc15" />
              </g>
            </g>
          </>
        }
        over={
          <g transform="translate(100 6) scale(1 0.35)">
            <g className="pr-dizzy-stars pr-pivot">
              {[0, 120, 240].map((a) => (
                <path
                  key={a}
                  transform={`rotate(${a}) translate(70 0) rotate(${-a})`}
                  d="M0 -16 L5 -5 L16 -5 L7 2 L10 14 L0 7 L-10 14 L-7 2 L-16 -5 L-5 -5 Z"
                  fill="#fde047"
                  stroke="#b45309"
                  strokeWidth="2"
                />
              ))}
            </g>
          </g>
        }
      />
      <span className="pr-hold-hint" aria-hidden="true">
        <Hand size={44} strokeWidth={2.4} />
      </span>
    </div>
  );
}

// ======================= Golden carousel =======================

function CarouselHorse({ color, saddle }: { color: string; saddle: string }) {
  return (
    <g>
      <path
        d="M30 120 Q24 92 60 92 L132 90 Q150 60 160 40 Q170 26 186 34 L196 52 Q186 56 176 58 Q168 90 168 112 Q166 140 140 142 L64 144 Q34 144 30 120 Z"
        fill={color}
        stroke="#92400e"
        strokeWidth="4"
      />
      <path
        d="M150 42 Q140 64 136 90"
        fill="none"
        stroke="#f472b6"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path d="M40 104 Q6 96 8 130 Q20 120 34 124" fill="#f472b6" />
      <path
        d="M62 140 L44 178 M82 142 L92 182 M136 140 L118 180 M150 136 L170 170"
        stroke={color}
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d="M62 140 L44 178 M82 142 L92 182 M136 140 L118 180 M150 136 L170 170"
        stroke="#92400e"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="178" cy="44" r="4" fill="#3b1d0a" />
      <path d="M72 92 Q100 82 124 92 L120 118 Q98 124 76 118 Z" fill={saddle} />
    </g>
  );
}

function CarouselScene({ look, pet, armsUp }: SceneProps) {
  const id = useId();
  return (
    <>
      <Backdrop>
        <TwilightSky id={id} />
        <g className="pr-carousel-pano">
          <MidwayPanorama id={id} />
        </g>
        <rect y="760" width="1000" height="240" fill="#7c2d12" />
        {Array.from({ length: 13 }, (_, i) => (
          <line
            key={i}
            x1={500 + (i - 6) * 70}
            y1="775"
            x2={500 + (i - 6) * 190}
            y2="1000"
            stroke="#9a3412"
            strokeWidth="5"
          />
        ))}
        <rect y="880" width="1000" height="14" fill="#fbbf24" opacity="0.5" />
        <rect y="752" width="1000" height="22" fill="#fbbf24" />
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={i * 100 + 50} cy="763" r="6" fill="#fff7c2" />
        ))}
        <path
          d="M0 0 H1000 V240 Q1000 300 937 300 Q875 300 875 240 Q875 300 812 300 Q750 300 750 240 Q750 300 687 300 Q625 300 625 240 Q625 300 562 300 Q500 300 500 240 Q500 300 437 300 Q375 300 375 240 Q375 300 312 300 Q250 300 250 240 Q250 300 187 300 Q125 300 125 240 Q125 300 62 300 Q0 300 0 240 Z"
          fill="#dc2626"
        />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M${i * 125 + 30} 0 H${i * 125 + 95} V240 Q${i * 125 + 62} 290 ${i * 125 + 30} 240 Z`}
            fill="#fff7ed"
          />
        ))}
        <rect y="226" width="1000" height="14" fill="#fbbf24" />
        {Array.from({ length: 20 }, (_, i) => (
          <circle
            key={i}
            className="sm-twinkle"
            style={{ "--sm-dur": "0.9s", "--sm-delay": `${-(i % 3) * 0.3}s` }}
            cx={i * 50 + 25}
            cy="233"
            r="8"
            fill="#fef08a"
          />
        ))}
        {[130, 870].map((x, i) => (
          <g key={x}>
            <rect x={x - 7} y="240" width="14" height="520" fill="#fcd34d" />
            <rect x={x - 7} y="240" width="5" height="520" fill="#fff7c2" />
            <g transform={`translate(${x - 115} 420) scale(1.15)`}>
              <g
                className="sm-bob"
                style={{
                  "--sm-amp": "26px",
                  "--sm-dur": "1.3s",
                  "--sm-delay": `${-0.65 - i * 0.4}s`,
                }}
              >
                <CarouselHorse
                  color={i ? "#fef3c7" : "#fde68a"}
                  saddle={i ? "#38bdf8" : "#a855f7"}
                />
              </g>
            </g>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${620 + i * 70} 680)`}>
            <g className="pr-note" style={{ animationDelay: `${-i * 0.9}s` }}>
              <path
                d="M0 0 a12 9 0 1 0 24 0 V-60 h22 v12 h-12 V0"
                fill={["#fde047", "#f9a8d4", "#a5f3fc", "#fff", "#fdba74"][i]}
              />
            </g>
          </g>
        ))}
      </Backdrop>
      <Rider
        look={look}
        pet={pet}
        armsUp={armsUp}
        behind={
          <>
            <rect x="132" y="-600" width="12" height="1200" fill="#fcd34d" />
            <rect x="132" y="-600" width="4" height="1200" fill="#fff7c2" />
          </>
        }
        back={null}
        front={
          <>
            <CarouselHorse color="#fde68a" saddle="#ef4444" />
            <path
              d="M70 100 Q100 94 130 100 L126 156 Q100 164 74 156 Z"
              fill="#ef4444"
              stroke="#7f1d1d"
              strokeWidth="4"
            />
            <path
              d="M74 150 Q100 158 126 150"
              stroke="#fbbf24"
              strokeWidth="6"
              fill="none"
            />
            {[84, 100, 116].map((x) => (
              <circle key={x} cx={x} cy="162" r="5" fill="#fbbf24" />
            ))}
          </>
        }
      />
    </>
  );
}

// ======================= Log flume =======================

// Track in rider units: flat, climb, crest, drop, splash pool.
const FLUME_TRACK = "M-1200 0 H0 L900 -360 H1100 L1400 0 H2800";

function FlumeScene({ look, pet, armsUp }: SceneProps) {
  const id = useId();
  return (
    <>
      <Backdrop>
        <defs>
          <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#e0f7ff" />
          </linearGradient>
        </defs>
        <rect width="1000" height="1000" fill={`url(#${id}sky)`} />
        <circle cx="820" cy="170" r="70" fill="#fff59d" />
        <g
          className="sm-drift"
          style={{ "--sm-dur": "60s", "--sm-dist": "1200px" }}
        >
          <Cloud x={-300} y={160} s={1.2} />
          <Cloud x={200} y={250} />
          <Cloud x={-800} y={300} s={0.9} />
        </g>
        <g className="pr-flume-far">
          <path
            d="M0 620 L160 380 L300 560 L470 330 L640 560 L800 400 L1000 600 V1400 H0 Z"
            fill="#7aa58a"
          />
          <path
            d="M160 400 Q172 500 166 610"
            stroke="#dbeafe"
            strokeWidth="14"
            fill="none"
          />
          <path
            d="M0 700 Q200 600 420 690 T1000 680 V1400 H0 Z"
            fill="#4f8a5b"
          />
        </g>
      </Backdrop>
      <Rider
        look={look}
        pet={pet}
        armsUp={armsUp}
        behind={
          <g className="pr-flume-world">
            <path d="M-1200 30 H0 V900 H-1200 Z" fill="#3fa36a" />
            {[-1000, -760, -480, -200].map((x, i) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <path
                  d={`M0 0 Q${10 + i * 4} -120 0 -190`}
                  stroke="#7c4a1e"
                  strokeWidth="14"
                  fill="none"
                />
                {[-60, -20, 20, 60].map((a) => (
                  <ellipse
                    key={a}
                    cx="0"
                    cy="-190"
                    rx="70"
                    ry="18"
                    fill="#22a05b"
                    transform={`rotate(${a} 0 -190)`}
                  />
                ))}
              </g>
            ))}
            {Array.from({ length: 16 }, (_, i) => {
              const x = 40 + i * 85;
              const y =
                x <= 900
                  ? -0.4 * x
                  : x <= 1100
                    ? -360
                    : -360 + (x - 1100) * 1.2;
              return (
                <g key={x}>
                  <rect
                    x={x - 6}
                    y={y + 20}
                    width="12"
                    height={Math.max(0, 900 - y)}
                    fill="#8b5a2b"
                  />
                  <line
                    x1={x - 40}
                    y1={y + 120}
                    x2={x + 40}
                    y2={y + 220}
                    stroke="#8b5a2b"
                    strokeWidth="6"
                  />
                </g>
              );
            })}
            <path
              d={FLUME_TRACK}
              fill="none"
              stroke="#8b5a2b"
              strokeWidth="44"
              strokeLinejoin="round"
            />
            <path
              d={FLUME_TRACK}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="26"
              strokeLinejoin="round"
              transform="translate(0 -10)"
            />
            <path
              d={FLUME_TRACK}
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="5"
              strokeDasharray="18 30"
              transform="translate(0 -14)"
            />
            {[960, 1040].map((x) => (
              <g key={x} transform={`translate(${x} -380)`}>
                <line y2="-90" stroke="#7c2d12" strokeWidth="6" />
                <path
                  d="M0 -90 l46 14 l-46 14 Z"
                  fill={x === 960 ? "#f43f5e" : "#facc15"}
                />
              </g>
            ))}
            <rect x="1400" y="-6" width="1400" height="900" fill="#38bdf8" />
            <rect x="1400" y="60" width="1400" height="840" fill="#0ea5e9" />
            <path
              d="M1400 60 Q1500 40 1600 60 T1800 60 T2000 60 T2200 60 T2400 60 T2600 60 T2800 60"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="6"
            />
            {[1560, 1800, 2100, 2400].map((x) => (
              <ellipse
                key={x}
                cx={x}
                cy="10"
                rx="40"
                ry="8"
                fill="#e0f2fe"
                opacity="0.8"
              />
            ))}
            {[1700, 2250].map((x) => (
              <g key={x} transform={`translate(${x} 18)`}>
                <ellipse rx="28" ry="9" fill="#16a34a" />
                <circle cx="8" cy="-4" r="7" fill="#f9a8d4" />
              </g>
            ))}
            <g className="pr-rainbow" transform="translate(1400 10)">
              {[
                "#f87171",
                "#fb923c",
                "#facc15",
                "#4ade80",
                "#60a5fa",
                "#a78bfa",
              ].map((c, i) => (
                <path
                  key={c}
                  d={`M${-330 + i * 16} 0 A${330 - i * 16} ${330 - i * 16} 0 0 1 ${330 - i * 16} 0`}
                  fill="none"
                  stroke={c}
                  strokeWidth="16"
                  opacity="0.85"
                />
              ))}
            </g>
          </g>
        }
        back={<ellipse cx="100" cy="124" rx="88" ry="16" fill="#5b3413" />}
        front={
          <>
            <path
              d="M6 120 H190 Q202 156 186 186 H22 Q0 168 6 120 Z"
              fill="#a0612f"
              stroke="#5b3413"
              strokeWidth="5"
            />
            <path
              d="M24 144 Q90 138 170 146 M30 166 Q100 160 176 168"
              stroke="#7c4a1e"
              strokeWidth="4"
              fill="none"
            />
            <ellipse
              cx="190"
              cy="153"
              rx="13"
              ry="33"
              fill="#e9b882"
              stroke="#5b3413"
              strokeWidth="4"
            />
            <ellipse
              cx="190"
              cy="153"
              rx="5"
              ry="16"
              fill="none"
              stroke="#a0612f"
              strokeWidth="3"
            />
            <path
              d="M0 184 Q50 176 100 186 T200 182"
              stroke="#e0f2fe"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          </>
        }
        over={
          <g transform="translate(100 180)">
            <g className="pr-splash">
              {[1, -1].map((side) => (
                <g key={side} transform={`scale(${side} 1)`}>
                  <path
                    d="M70 0 Q200 -90 260 -240 Q240 -110 110 10 Z"
                    fill="#bae6fd"
                  />
                  <path
                    d="M90 6 Q260 -40 340 -150 Q270 -40 130 20 Z"
                    fill="#e0f2fe"
                  />
                </g>
              ))}
              <ellipse rx="210" ry="26" fill="#e0f2fe" />
            </g>
            <g className="pr-droplets">
              {Array.from({ length: 22 }, (_, i) => {
                // Spray fans out to both sides, never straight over the rider.
                const a = -Math.PI * ((i % 2 ? 0.05 : 0.65) + (0.3 * i) / 21);
                const reach = 200 + (i % 5) * 45;
                return (
                  <circle
                    key={i}
                    r={4 + (i % 3) * 2}
                    fill={i % 3 ? "#7dd3fc" : "#fff"}
                    style={{
                      "--dx": `${Math.cos(a) * reach}px`,
                      "--dy": `${Math.sin(a) * reach}px`,
                    }}
                  />
                );
              })}
            </g>
          </g>
        }
      />
    </>
  );
}

// ======================= Lion Leap drop tower =======================

function DropTowerScene({ look, pet, armsUp }: SceneProps) {
  const id = useId();
  return (
    <>
      <Backdrop>
        <defs>
          <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4f46e5" />
            <stop offset="0.5" stopColor="#c084fc" />
            <stop offset="0.8" stopColor="#fda4af" />
            <stop offset="1" stopColor="#fde68a" />
          </linearGradient>
        </defs>
        <rect width="1000" height="1000" fill={`url(#${id}sky)`} />
        <g className="pr-drop-far">
          <circle cx="210" cy="560" r="80" fill="#fff1a8" opacity="0.9" />
          <path
            d="M0 620 Q180 560 380 610 T760 590 T1000 620 V1600 H0 Z"
            fill="#8b5cf6"
            opacity="0.55"
          />
          <circle
            cx="760"
            cy="540"
            r="80"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="8"
            opacity="0.8"
          />
          <path
            d="M0 660 Q250 620 500 650 T1000 640 V1600 H0 Z"
            fill="#6d28d9"
            opacity="0.6"
          />
        </g>
        <g className="pr-speed-lines">
          {Array.from({ length: 14 }, (_, i) => (
            <rect
              key={i}
              x={40 + ((i * 271) % 920)}
              y={(i * 173) % 700}
              width="7"
              height={160 + (i % 3) * 90}
              rx="3"
              fill="#fff"
              opacity="0.8"
            />
          ))}
        </g>
      </Backdrop>
      <Rider
        look={look}
        pet={pet}
        armsUp={armsUp}
        behind={
          <g className="pr-drop-world">
            <rect x="-1400" y="230" width="3000" height="900" fill="#c97c4a" />
            <Tent x={-280} y={250} w={260} h={250} a="#fff7ed" b="#ef4444" />
            <Tent x={470} y={250} w={240} h={230} a="#fff7ed" b="#3b82f6" />
            <Tent x={-620} y={250} w={200} h={190} a="#fff7ed" b="#22c55e" />
            <Tent x={780} y={250} w={220} h={200} a="#fff7ed" b="#f59e0b" />
            <rect x="40" y="-1000" width="120" height="1250" fill="#e11d48" />
            <rect x="60" y="-1000" width="80" height="1250" fill="#fb7185" />
            {Array.from({ length: 21 }, (_, i) => (
              <g key={i}>
                <circle
                  className="sm-twinkle"
                  style={{
                    "--sm-dur": "0.8s",
                    "--sm-delay": `${-(i % 2) * 0.4}s`,
                  }}
                  cx="48"
                  cy={200 - i * 60}
                  r="7"
                  fill="#fef08a"
                />
                <circle
                  className="sm-twinkle"
                  style={{
                    "--sm-dur": "0.8s",
                    "--sm-delay": `${-((i + 1) % 2) * 0.4}s`,
                  }}
                  cx="152"
                  cy={200 - i * 60}
                  r="7"
                  fill="#fef08a"
                />
              </g>
            ))}
            <g transform="translate(100 -1130)">
              <path
                d="M-110 40 L-80 -40 L-40 10 L0 -60 L40 10 L80 -40 L110 40 Z"
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth="6"
              />
              <LionFace x={0} y={80} r={72} />
            </g>
            {[
              [-300, -300, "#f43f5e"],
              [480, -480, "#facc15"],
              [-420, -640, "#38bdf8"],
              [380, -760, "#a3e635"],
            ].map(([x, y, c]) => (
              <g key={String(c)} transform={`translate(${x} ${y})`}>
                <line y1="40" y2="150" stroke="#475569" strokeWidth="2" />
                <ellipse rx="38" ry="46" fill={String(c)} />
                <ellipse
                  cx="-12"
                  cy="-16"
                  rx="8"
                  ry="12"
                  fill="#fff"
                  opacity="0.6"
                />
              </g>
            ))}
            <Cloud x={-360} y={-800} s={2.2} />
            <Cloud x={520} y={-1020} s={1.8} />
            <Cloud x={-520} y={-1080} s={1.4} />
          </g>
        }
        back={
          <>
            <rect
              x="-240"
              y="22"
              width="680"
              height="14"
              rx="7"
              fill="#b45309"
            />
            <rect
              x="-240"
              y="22"
              width="680"
              height="5"
              rx="2"
              fill="#fde68a"
            />
            {[-110, 310].map((x) => (
              <g key={x} transform={`translate(${x - 100} 0)`}>
                <DropSeat />
                <LionFace x={100} y={52} r={34} />
                <DropHarness />
              </g>
            ))}
            <DropSeat />
          </>
        }
        front={<DropHarness />}
      />
    </>
  );
}

function DropSeat() {
  return (
    <>
      <rect x="40" y="6" width="120" height="96" rx="36" fill="#facc15" />
      <rect x="52" y="16" width="96" height="76" rx="28" fill="#14b8a6" />
      <rect x="30" y="88" width="140" height="16" rx="8" fill="#0f766e" />
    </>
  );
}

function DropHarness() {
  return (
    <>
      <path
        d="M54 30 Q44 76 84 92 M146 30 Q156 76 116 92"
        stroke="#7c2d12"
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M54 30 Q44 76 84 92 M146 30 Q156 76 116 92"
        stroke="#fbbf24"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="72" y="84" width="56" height="14" rx="7" fill="#f43f5e" />
      <rect x="62" y="150" width="76" height="9" rx="4" fill="#0f766e" />
    </>
  );
}

export const RIDE_SCENES: Record<ParkRideId, ComponentType<SceneProps>> = {
  ferris: FerrisScene,
  teacups: TeacupScene,
  carousel: CarouselScene,
  flume: FlumeScene,
  "drop-tower": DropTowerScene,
};
