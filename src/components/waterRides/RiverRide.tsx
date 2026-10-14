import { useEffect, useRef, useState } from "react";
import { Droplets, Hand, RotateCw } from "lucide-react";
import {
  RIVER_CRITTERS,
  RIVER_RIDER_X,
  RIVER_WATERFALL_X,
  riverDistance,
  WATER_RIDE_SECONDS,
  waterfallSoak,
  type RiverCritterId,
} from "../../utils/waterRides.ts";
import {
  playBloop,
  playCritter,
  playGiggle,
  playSplash,
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

const RIDER_Y = 730;
const HEART_Y: Record<RiverCritterId, number> = {
  parrot: 150,
  monkey: 150,
  turtle: 470,
  frog: 540,
  flamingo: 210,
};
const DOCK_X = riverDistance(WATER_RIDE_SECONDS.river) + RIVER_RIDER_X + 260;

function Critter({ id }: { id: RiverCritterId }) {
  switch (id) {
    case "parrot":
      return (
        <g transform="translate(0 250)">
          <path
            d="M-140 40Q0 10 140 46"
            stroke="#7a5532"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
          />
          <g className="wr-critter-body">
            <path d="M-4 30Q-30 90-16 130L6 128Q20 80 22 30Z" fill="#2f7fd8" />
            <ellipse cx="0" cy="0" rx="44" ry="58" fill="#ef4a3c" />
            <path d="M-30 -6Q-60 40-26 70Q-6 40-8 0Z" fill="#ffd23c" />
            <path d="M-34 10Q-56 56-30 80Q-12 50-14 14Z" fill="#2f9ee8" />
            <circle cx="10" cy="-30" r="30" fill="#ef4a3c" />
            <circle cx="20" cy="-36" r="11" fill="#fff" />
            <circle cx="23" cy="-36" r="6" fill="#1d2a33" />
            <path
              d="M36-30Q64-26 52 0Q44-14 34-14Z"
              fill="#ffd23c"
              stroke="#c88a12"
              strokeWidth="3"
            />
          </g>
        </g>
      );
    case "monkey":
      return (
        <g transform="translate(0 0)">
          <path d="M0 0V170" stroke="#3c8a3a" strokeWidth="10" />
          <g transform="translate(0 260)">
            <g className="wr-critter-body">
              <path
                d="M30 60Q90 70 80 130Q74 150 60 140"
                stroke="#8a5a32"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M-8-60L-4-96"
                stroke="#8a5a32"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <ellipse cx="0" cy="40" rx="44" ry="54" fill="#8a5a32" />
              <ellipse cx="0" cy="52" rx="26" ry="32" fill="#e8c49a" />
              <circle cx="-50" cy="-26" r="20" fill="#8a5a32" />
              <circle cx="50" cy="-26" r="20" fill="#8a5a32" />
              <circle cx="-50" cy="-26" r="10" fill="#e8c49a" />
              <circle cx="50" cy="-26" r="10" fill="#e8c49a" />
              <circle cx="0" cy="-24" r="46" fill="#8a5a32" />
              <path
                d="M-32-20Q-30-56 0-46Q30-56 32-20Q34 14 0 16Q-34 14-32-20Z"
                fill="#e8c49a"
              />
              <circle cx="-14" cy="-26" r="8" fill="#1d2a33" />
              <circle cx="14" cy="-26" r="8" fill="#1d2a33" />
              <circle cx="-11" cy="-29" r="3" fill="#fff" />
              <circle cx="17" cy="-29" r="3" fill="#fff" />
              <path
                d="M-12 0Q0 10 12 0"
                stroke="#5a3418"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      );
    case "turtle":
      return (
        <g transform="translate(0 600)">
          <rect
            x="-150"
            y="10"
            width="300"
            height="40"
            rx="20"
            fill="#8a5a32"
          />
          <rect x="-150" y="10" width="300" height="12" rx="6" fill="#a87444" />
          <g className="wr-critter-body">
            <ellipse cx="90" cy="-6" rx="30" ry="24" fill="#7cc06a" />
            <circle cx="102" cy="-12" r="6" fill="#1d2a33" />
            <path d="M-80 10Q-80-80 0-80Q80-80 80 10Z" fill="#3f9a52" />
            <path
              d="M-46-12L-24-52H24L46-12L24 6H-24Z"
              fill="#62b86a"
              stroke="#2e7a3c"
              strokeWidth="5"
            />
            <path
              d="M-80 10H80"
              stroke="#2e7a3c"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>
        </g>
      );
    case "frog":
      return (
        <g transform="translate(0 640)">
          <ellipse cx="0" cy="20" rx="120" ry="30" fill="#3aa877" />
          <path d="M0 20L60 -6" stroke="#5fd3ee" strokeWidth="8" />
          <g className="wr-critter-body">
            <ellipse cx="0" cy="-10" rx="60" ry="40" fill="#5cc85a" />
            <circle cx="-30" cy="-46" r="22" fill="#5cc85a" />
            <circle cx="30" cy="-46" r="22" fill="#5cc85a" />
            <circle cx="-30" cy="-48" r="13" fill="#fff" />
            <circle cx="30" cy="-48" r="13" fill="#fff" />
            <circle cx="-28" cy="-46" r="7" fill="#1d2a33" />
            <circle cx="32" cy="-46" r="7" fill="#1d2a33" />
            <path
              d="M-26-6Q0 14 26-6"
              stroke="#2e7a3c"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="-40" cy="-4" r="8" fill="#ff9aa8" opacity=".7" />
            <circle cx="40" cy="-4" r="8" fill="#ff9aa8" opacity=".7" />
          </g>
        </g>
      );
    case "flamingo":
      return (
        <g transform="translate(0 600)">
          <ellipse cx="0" cy="10" rx="70" ry="12" fill="#2aa3c8" opacity=".5" />
          <path
            d="M0 10V-120M0-60L24-90"
            stroke="#f08aa0"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <g className="wr-critter-body">
            <ellipse cx="-6" cy="-150" rx="70" ry="42" fill="#ff8fb1" />
            <path d="M-60-160Q-90-150-80-130Q-60-150-40-146Z" fill="#ff6f9a" />
            <path
              d="M40-160Q80-220 50-280Q30-320 70-330"
              stroke="#ff8fb1"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="74" cy="-330" r="26" fill="#ff8fb1" />
            <circle cx="80" cy="-338" r="6" fill="#1d2a33" />
            <path
              d="M96-334Q130-330 120-300Q110-316 98-318Z"
              fill="#fff4e0"
              stroke="#1d2a33"
              strokeWidth="3"
            />
          </g>
        </g>
      );
  }
}

function JungleTile({ variant }: { variant: "far" | "near" }) {
  // Drawn twice side by side so the strip can wrap seamlessly every 1600 units.
  return variant === "far" ? (
    <g>
      {[80, 420, 760, 1120, 1450].map((x, i) => (
        <g key={x}>
          <rect x={x - 14} y="60" width="28" height="520" fill="#2f6b45" />
          <circle
            cx={x}
            cy={100 + (i % 2) * 60}
            r={150}
            fill={i % 2 ? "#2c7f52" : "#348a5a"}
          />
          <circle cx={x + 120} cy={200} r={110} fill="#2a7550" />
        </g>
      ))}
      {[200, 640, 980, 1320].map((x) => (
        <path
          key={x}
          d={`M${x} 0Q${x + 30} 140 ${x - 10} 300`}
          stroke="#3c8a3a"
          strokeWidth="8"
          fill="none"
        />
      ))}
    </g>
  ) : (
    <g>
      <path
        d="M0 540Q200 500 400 530T800 520T1200 530T1600 540V600H0Z"
        fill="#3aa877"
      />
      {[60, 330, 610, 900, 1180, 1460].map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={520}
            r={80 + (i % 3) * 16}
            fill={i % 2 ? "#4fbd8a" : "#43ad7c"}
          />
          {i % 2 === 0 && (
            <g transform={`translate(${x + 30} 470)`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  transform={`rotate(${a}) translate(0 -14)`}
                  rx="9"
                  ry="15"
                  fill="#ff7ab0"
                />
              ))}
              <circle r="9" fill="#ffd23c" />
            </g>
          )}
        </g>
      ))}
      <ellipse cx="1300" cy="555" rx="90" ry="40" fill="#8f9aa0" />
      <ellipse cx="1280" cy="545" rx="60" ry="22" fill="#aab4b8" />
    </g>
  );
}

export function RiverRide({
  look,
  pet,
  active,
  gentle,
  onDone,
  announce,
}: RideSceneProps) {
  const [splashes, addSplash] = useSplashes(gentle);
  const [waving, setWaving] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [soaked, setSoaked] = useState(false);
  const farRef = useRef<SVGGElement>(null);
  const nearRef = useRef<SVGGElement>(null);
  const stripRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGGElement>(null);
  const ripplesRef = useRef<SVGGElement>(null);
  const riderRef = useRef<HTMLDivElement>(null);
  const critterRefs = useRef<
    Partial<Record<RiverCritterId, SVGGElement | null>>
  >({});
  const greeted = useRef(new Set<RiverCritterId>());
  const distance = useRef(0);
  const soakedRef = useRef(false);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const cheer = (id: RiverCritterId) => {
    const el = critterRefs.current[id];
    if (!el) return;
    el.classList.remove("is-happy");
    // Restart the hop animation on repeated taps.
    void el.getBoundingClientRect();
    el.classList.add("is-happy");
    playCritter(id);
  };

  const paint = (t: number) => {
    const d = riverDistance(t);
    distance.current = d;
    farRef.current?.setAttribute(
      "transform",
      `translate(${-((d * 0.3) % 1600)} 0)`,
    );
    nearRef.current?.setAttribute(
      "transform",
      `translate(${-((d * 0.65) % 1600)} 0)`,
    );
    ripplesRef.current?.setAttribute("transform", `translate(${-(d % 400)} 0)`);
    stripRef.current?.setAttribute("transform", `translate(${-d} 0)`);
    frontRef.current?.setAttribute("transform", `translate(${-d * 1.4} 0)`);
    const sway = gentle ? 0 : Math.sin(t * 1.3) * 5;
    place(
      riderRef.current,
      RIVER_RIDER_X + Math.sin(t * 0.4) * 30,
      RIDER_Y + Math.sin(t * 1.7) * 8,
      `rotate(${sway}deg)`,
    );
    for (const critter of RIVER_CRITTERS) {
      if (greeted.current.has(critter.id)) continue;
      if (Math.abs(critter.x - d - RIVER_RIDER_X) < 140) {
        greeted.current.add(critter.id);
        cheer(critter.id);
      }
    }
    const isSoaked = waterfallSoak(d) > 0.25;
    if (isSoaked !== soakedRef.current) {
      soakedRef.current = isSoaked;
      setSoaked(isSoaked);
      if (isSoaked) {
        announce("Under the waterfall! Splish splash!");
        playSplash(0.9);
        later(playGiggle, 500);
      }
    }
    if (t >= WATER_RIDE_SECONDS.river) onDone();
  };
  useRideClock(active, (t) => paint(t));
  useEffect(() => {
    if (!active) paint(distance.current / 120);
  }, [active]);
  useEffect(() => {
    announce("Floating down the lazy river. Wave at the animals!");
  }, [announce]);

  const splashNearRider = () => {
    addSplash(RIVER_RIDER_X + 180, RIDER_Y + 20, 1);
    playSplash(0.45);
  };
  const wave = () => {
    setWaving(true);
    later(() => setWaving(false), 1600);
    for (const critter of RIVER_CRITTERS) {
      if (Math.abs(critter.x - distance.current - RIVER_RIDER_X) < 700)
        cheer(critter.id);
    }
  };
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    playWhoosh();
    later(() => setSpinning(false), 1100);
  };

  return (
    <>
      <RideWorld
        className={`wr-river${soaked ? " is-drenched" : ""}`}
        onTap={(x, y, target) => {
          const critter =
            target instanceof Element ? target.closest("[data-critter]") : null;
          const id = RIVER_CRITTERS.find(
            (c) => c.id === critter?.getAttribute("data-critter"),
          )?.id;
          if (id) cheer(id);
          else {
            addSplash(x, y, y > 560 ? 0.9 : 0.6);
            if (y > 560) playSplash(0.35);
            else playBloop();
          }
        }}
      >
        <svg className="wr-art" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>
            <linearGradient id="wr-river-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8fdcc4" />
              <stop offset="1" stopColor="#d8f7e4" />
            </linearGradient>
            <linearGradient id="wr-river-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#48c6e4" />
              <stop offset="1" stopColor="#1f8fc0" />
            </linearGradient>
            <linearGradient id="wr-river-fall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e9fbff" stopOpacity=".95" />
              <stop offset="1" stopColor="#9be6f7" stopOpacity=".75" />
            </linearGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#wr-river-sky)" />
          {[
            [260, 120],
            [900, 60],
            [1300, 160],
          ].map(([x, y]) => (
            <ellipse
              key={x}
              cx={x}
              cy={y}
              rx="70"
              ry="40"
              fill="#fffbe0"
              opacity=".5"
            />
          ))}
          <g ref={farRef}>
            <JungleTile variant="far" />
            <g transform="translate(1600 0)">
              <JungleTile variant="far" />
            </g>
          </g>
          <g ref={nearRef}>
            <JungleTile variant="near" />
            <g transform="translate(1600 0)">
              <JungleTile variant="near" />
            </g>
          </g>
          <rect y="560" width="1600" height="340" fill="url(#wr-river-water)" />
          <g
            ref={ripplesRef}
            stroke="#c9f4ff"
            strokeWidth="7"
            strokeLinecap="round"
            opacity=".6"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={i}
                d={`M${i * 400} 620h120M${i * 400 + 200} 690h160M${i * 400 + 80} 790h200M${i * 400 + 300} 860h140`}
              />
            ))}
          </g>
          <g ref={stripRef}>
            <g transform={`translate(${RIVER_WATERFALL_X} 0)`}>
              <path
                d="M-260 580L-230 120Q-200 40-100 30H120Q220 40 240 140L270 580Z"
                fill="#7f8a8f"
              />
              <path
                d="M-200 560L-180 160Q-160 90-90 84H100Q180 90 190 170L210 560Z"
                fill="#96a2a6"
              />
              <rect
                x="-150"
                y="60"
                width="300"
                height="520"
                fill="url(#wr-river-fall)"
              />
              <g
                className="wr-fall-lines"
                stroke="#ffffff"
                strokeWidth="8"
                strokeLinecap="round"
                opacity=".8"
              >
                {[-120, -70, -20, 30, 80, 120].map((x, i) => (
                  <path
                    key={x}
                    d={`M${x} ${80 + i * 20}v${120 + (i % 3) * 40}M${x + 20} ${300 + i * 15}v${100}`}
                  />
                ))}
              </g>
              {[-140, -60, 20, 100, 150].map((x) => (
                <circle
                  key={x}
                  cx={x}
                  cy={585}
                  r={34}
                  fill="#fff"
                  opacity=".85"
                />
              ))}
            </g>
            {RIVER_CRITTERS.map((critter) => (
              <g key={critter.id} transform={`translate(${critter.x} 0)`}>
                <g
                  ref={(node) => {
                    critterRefs.current[critter.id] = node;
                  }}
                  className="wr-critter"
                  data-critter={critter.id}
                  onAnimationEnd={(event) =>
                    event.currentTarget.classList.remove("is-happy")
                  }
                >
                  <Critter id={critter.id} />
                  <g transform={`translate(0 ${HEART_Y[critter.id]})`}>
                    <g className="wr-hearts">
                      <path
                        d="M0-10c-10-14-34-4-20 14l20 18 20-18c14-18-10-28-20-14z"
                        fill="#ff5c8a"
                      />
                      <path
                        d="M-50 20l6 14 14 6-14 6-6 14-6-14-14-6 14-6z"
                        fill="#ffe066"
                      />
                      <path
                        d="M54 6l5 11 11 5-11 5-5 11-5-11-11-5 11-5z"
                        fill="#ffe066"
                      />
                    </g>
                  </g>
                </g>
              </g>
            ))}
            <g transform={`translate(${DOCK_X} 560)`}>
              <rect x="-160" y="-30" width="320" height="40" fill="#b7814e" />
              <rect x="-130" y="-230" width="18" height="200" fill="#8a5a32" />
              <rect x="112" y="-230" width="18" height="200" fill="#8a5a32" />
              <path
                d="M-180-210L0-300L180-210Z"
                fill="#e8b35c"
                stroke="#a87444"
                strokeWidth="6"
              />
              {["#ff6f59", "#ffc93c", "#4fd1b5"].map((c, i) => (
                <ellipse
                  key={c}
                  cx="0"
                  cy={-70 - i * 34}
                  rx="70"
                  ry="22"
                  fill={c}
                  stroke="#00000022"
                  strokeWidth="4"
                />
              ))}
            </g>
          </g>
        </svg>
        <TubeRider
          look={look}
          pet={pet}
          color="sunny"
          action={waving ? "wave" : "sit"}
          riderRef={riderRef}
          className={spinning ? "is-spinning" : ""}
        />
        <svg
          className="wr-art wr-front"
          viewBox="0 0 1600 900"
          aria-hidden="true"
        >
          <path
            d="M0 820Q200 800 400 820T800 820T1200 820T1600 820V900H0Z"
            fill="#1f8fc0"
            opacity=".55"
          />
          <g className="wr-curtain">
            <rect
              x="560"
              y="-20"
              width="480"
              height="820"
              fill="url(#wr-river-fall)"
              opacity=".7"
            />
            {[600, 680, 760, 840, 920, 1000].map((x, i) => (
              <path
                key={x}
                className="wr-fall-lines"
                d={`M${x} ${i * 30}v260M${x + 30} ${360 + i * 20}v200`}
                stroke="#fff"
                strokeWidth="10"
                strokeLinecap="round"
              />
            ))}
          </g>
          <g ref={frontRef}>
            {Array.from({ length: 12 }, (_, i) => (
              <g key={i} transform={`translate(${300 + i * 620} 900)`}>
                {[-60, -30, 0, 30, 60].map((a) => (
                  <path
                    key={a}
                    transform={`rotate(${a})`}
                    d="M0 0Q34-80 0-150Q-34-80 0 0Z"
                    fill={i % 2 ? "#2c8f63" : "#246f4e"}
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
        {splashes}
        <div className="wr-lens" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </RideWorld>
      <div className="wr-actions">
        <RideButton label="Splash" onPress={splashNearRider}>
          <Droplets size={40} strokeWidth={2.6} />
        </RideButton>
        <RideButton label="Spin the tube" onPress={spin}>
          <RotateCw size={40} strokeWidth={2.6} />
        </RideButton>
        <RideButton label="Wave at the animals" onPress={wave}>
          <Hand size={40} strokeWidth={2.6} />
        </RideButton>
      </div>
    </>
  );
}
