import { useEffect, useRef, useState } from "react";
import { ArrowBigUp } from "lucide-react";
import {
  bigWaveBoost,
  JUMP_SECONDS,
  jumpLift,
  WATER_RIDE_SECONDS,
  waveSurface,
} from "../../utils/waterRides.ts";
import {
  playBloop,
  playGiggle,
  playSplash,
  playWheee,
  playWhoosh,
} from "../../utils/waterRideAudio.ts";
import {
  place,
  RideButton,
  RideWorld,
  TubeRider,
  useRideClock,
  useSplashes,
  type RideSceneProps,
} from "./rideKit";

const WATER_Y = 610;
const RIDER_X = 800;
const FLOATS = [
  { id: "ball", x: 380 },
  { id: "duck", x: 1230 },
] as const;
type FloatId = (typeof FLOATS)[number]["id"];

function surfacePath(t: number, base: number, shift: number, calm: number) {
  let d = "";
  for (let x = -40; x <= 1640; x += 40)
    d += `${x === -40 ? "M" : "L"}${x} ${(base + waveSurface(t, x + shift) * calm).toFixed(1)}`;
  return `${d}L1640 960L-40 960Z`;
}

export function WaveRide({
  look,
  pet,
  active,
  gentle,
  onDone,
  announce,
}: RideSceneProps) {
  const [splashes, addSplash] = useSplashes(gentle);
  const [big, setBig] = useState(false);
  const [jumping, setJumping] = useState(false);
  const backRef = useRef<SVGPathElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const foamRef = useRef<SVGPathElement>(null);
  const riderRef = useRef<HTMLDivElement>(null);
  const floatRefs = useRef<Partial<Record<FloatId, SVGGElement | null>>>({});
  const clock = useRef(0);
  const jumpAt = useRef(-10);
  const floatJumps = useRef<Record<FloatId, number>>({ ball: -10, duck: -10 });
  const bigRef = useRef(false);
  const lastSpray = useRef(0);

  const paint = (t: number) => {
    clock.current = t;
    const calm = gentle ? 0.4 : 1;
    const boost = bigWaveBoost(t);
    backRef.current?.setAttribute(
      "d",
      surfacePath(t, WATER_Y - 46, 260, calm * 0.7),
    );
    const front = surfacePath(t, WATER_Y, 0, calm);
    frontRef.current?.setAttribute("d", front);
    foamRef.current?.setAttribute("d", front);
    if (foamRef.current)
      foamRef.current.style.opacity = String(0.35 + boost * 0.65);
    const age = t - jumpAt.current;
    const slope =
      (waveSurface(t, RIDER_X + 30) - waveSurface(t, RIDER_X - 30)) / 60;
    place(
      riderRef.current,
      RIDER_X,
      // Floats a little proud of the surface, and the big wave lifts it high.
      WATER_Y -
        28 -
        boost * 50 +
        waveSurface(t, RIDER_X) * calm -
        jumpLift(age) * (gentle ? 0.5 : 1),
      `rotate(${Math.atan(slope * calm) * 40}deg)`,
    );
    if (age >= JUMP_SECONDS && jumping) {
      setJumping(false);
      addSplash(RIDER_X, WATER_Y + waveSurface(t, RIDER_X) * calm, 1.3);
      playSplash(0.6);
    }
    for (const float of FLOATS) {
      const el = floatRefs.current[float.id];
      const y =
        WATER_Y +
        waveSurface(t, float.x) * calm -
        jumpLift(t - floatJumps.current[float.id]) * 0.8;
      el?.setAttribute(
        "transform",
        `translate(${float.x} ${y.toFixed(1)}) rotate(${(waveSurface(t, float.x + 20) - waveSurface(t, float.x - 20)) * 0.8})`,
      );
    }
    const isBig = boost > 0.05;
    if (isBig !== bigRef.current) {
      bigRef.current = isBig;
      setBig(isBig);
      if (isBig) {
        announce("Here comes a BIG wave!");
        playWhoosh();
      }
    }
    if (boost > 0.97 && t - lastSpray.current > 0.35) {
      lastSpray.current = t;
      for (const x of [300, 800, 1300])
        addSplash(
          x + Math.sin(t * 7) * 120,
          WATER_Y + waveSurface(t, x) * calm - 30,
          1.1,
        );
    }
    if (t >= WATER_RIDE_SECONDS.wave) onDone();
  };
  useRideClock(active, (t) => paint(t));
  useEffect(() => {
    if (!active) paint(clock.current);
    else announce("Bobbing on the waves. Tap to jump!");
  }, [active]);

  // One cheer per big wave, at its crest.
  useEffect(() => {
    if (!big) return;
    const id = window.setTimeout(() => {
      playWheee();
      playGiggle();
    }, 1500);
    return () => window.clearTimeout(id);
  }, [big]);

  const jump = () => {
    if (!active || clock.current - jumpAt.current < JUMP_SECONDS) return;
    jumpAt.current = clock.current;
    setJumping(true);
    playBloop();
  };

  return (
    <>
      <RideWorld
        className={`wr-wave${big ? " is-big" : ""}`}
        onTap={(x, y, target) => {
          const float =
            target instanceof Element ? target.closest("[data-float]") : null;
          const id = FLOATS.find(
            (f) => f.id === float?.getAttribute("data-float"),
          )?.id;
          if (id) {
            floatJumps.current[id] = clock.current;
            playBloop();
            addSplash(x, y, 0.6);
          } else {
            if (y > WATER_Y - 40) {
              addSplash(x, y, 0.8);
              playSplash(0.3);
            }
            jump();
          }
        }}
      >
        <svg className="wr-art" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>
            <linearGradient id="wr-wave-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4cc0ef" />
              <stop offset="1" stopColor="#c8f1fb" />
            </linearGradient>
            <linearGradient id="wr-wave-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3fd0ea" />
              <stop offset="1" stopColor="#1478b8" />
            </linearGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#wr-wave-sky)" />
          <circle cx="1380" cy="120" r="64" fill="#fff4b0" />
          <circle cx="1380" cy="120" r="100" fill="#fff4b0" opacity=".35" />
          {[
            [240, 110],
            [760, 70],
          ].map(([x, y]) => (
            <g
              key={x}
              className="sm-drift"
              style={{ "--sm-dist": "60px", "--sm-dur": "14s" }}
              fill="#fff"
            >
              <ellipse cx={x} cy={y} rx="90" ry="32" />
              <ellipse cx={x - 60} cy={y + 12} rx="56" ry="24" />
              <ellipse cx={x + 64} cy={y + 10} rx="60" ry="24" />
            </g>
          ))}
          <g>
            <rect
              x="420"
              y="250"
              width="760"
              height="300"
              rx="20"
              fill="#ffe7c2"
            />
            <rect
              x="420"
              y="250"
              width="760"
              height="40"
              rx="14"
              fill="#ff6f59"
            />
            <path
              d="M400 250L800 150L1200 250Z"
              fill="#ffc93c"
              stroke="#e0901a"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <path
              d="M700 232c0-50 60-70 100-40-30-6-50 14-36 36 20 26 76 10 90-10"
              fill="none"
              stroke="#2fb3d6"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {[500, 640, 780, 920, 1060].map((x) => (
              <g key={x}>
                <path
                  d={`M${x} 520V380a50 50 0 0 1 100 0V520Z`}
                  fill="#2a6f8f"
                />
                <path
                  d={`M${x + 50} 330V520`}
                  stroke="#ffe7c2"
                  strokeWidth="8"
                />
              </g>
            ))}
            {[460, 620, 980, 1140].map((x, i) => (
              <g key={x} className="wr-wave-lamp">
                <circle
                  cx={x}
                  cy="270"
                  r="13"
                  fill={i % 2 ? "#ffd23c" : "#4fd1b5"}
                />
              </g>
            ))}
            {[440, 1160].map((x) => (
              <g key={x}>
                <path d={`M${x} 150V250`} stroke="#25748a" strokeWidth="6" />
                <path
                  d={`M${x} 150l60 18-60 18z`}
                  fill="#ff6f59"
                  className="sm-sway"
                  style={{
                    "--sm-origin": "0% 50%",
                    "--sm-deg": "8deg",
                    "--sm-dur": "1.4s",
                  }}
                />
              </g>
            ))}
          </g>
          {[120, 1480].map((x, i) => (
            <g key={x} transform={`translate(${x} 560) scale(${i ? -1 : 1} 1)`}>
              <path
                d="M0 0Q20-200-30-380"
                stroke="#8a5a32"
                strokeWidth="22"
                fill="none"
              />
              {[-160, -120, -80, -40, 0, 30].map((a) => (
                <path
                  key={a}
                  transform={`translate(-30 -380) rotate(${a})`}
                  d="M0 0Q70-40 150 10Q70-6 0 0Z"
                  fill="#3aa877"
                />
              ))}
            </g>
          ))}
          <path ref={backRef} fill="#7fe0f2" opacity=".85" />
          {FLOATS.map((float) => (
            <g
              key={float.id}
              ref={(node) => {
                floatRefs.current[float.id] = node;
              }}
              data-float={float.id}
            >
              {float.id === "ball" ? (
                <g transform="translate(0 -46)">
                  <circle r="56" fill="#fff" />
                  <path d="M0-56A56 56 0 0 1 48 28L0 0Z" fill="#ff6f59" />
                  <path d="M48 28A56 56 0 0 1-48 28L0 0Z" fill="#ffc93c" />
                  <path d="M-48 28A56 56 0 0 1 0-56L0 0Z" fill="#2fb3d6" />
                  <circle r="12" fill="#fff" />
                  <circle cx="-18" cy="-30" r="10" fill="#fff" opacity=".7" />
                </g>
              ) : (
                <g transform="translate(0 -40)">
                  <ellipse cx="0" cy="16" rx="70" ry="40" fill="#ffd23c" />
                  <path d="M40 0Q90-6 70 30" fill="#ffc400" />
                  <circle cx="-34" cy="-36" r="36" fill="#ffd23c" />
                  <circle cx="-44" cy="-44" r="7" fill="#1d2a33" />
                  <path d="M-66-34Q-96-30-90-18Q-76-16-62-24Z" fill="#ff8a3d" />
                </g>
              )}
            </g>
          ))}
        </svg>
        <TubeRider
          look={look}
          pet={pet}
          color="coral"
          action={jumping || big ? "wave" : "sit"}
          riderRef={riderRef}
        />
        <svg
          className="wr-art wr-front"
          viewBox="0 0 1600 900"
          aria-hidden="true"
        >
          <path ref={frontRef} fill="url(#wr-wave-water)" opacity=".86" />
          <path
            ref={foamRef}
            fill="none"
            stroke="#f4feff"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          <g
            stroke="#c9f4ff"
            strokeWidth="6"
            strokeLinecap="round"
            opacity=".5"
          >
            <path
              className="sm-drift"
              style={{ "--sm-dist": "50px", "--sm-dur": "3s" }}
              d="M120 760h140M560 820h200M1060 770h160M1340 850h120"
            />
          </g>
        </svg>
        {splashes}
      </RideWorld>
      <div className="wr-actions">
        <RideButton label="Jump the wave" onPress={jump}>
          <ArrowBigUp size={46} strokeWidth={2.6} />
        </RideButton>
      </div>
    </>
  );
}
