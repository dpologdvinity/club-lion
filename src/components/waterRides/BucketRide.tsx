import { useEffect, useRef, useState } from "react";
import { Droplets } from "lucide-react";
import { Avatar } from "../Avatar";
import { PetCompanion } from "../PetCompanion";
import {
  bucketDumpStarted,
  bucketFrame,
  WATER_RIDE_SECONDS,
} from "../../utils/waterRides.ts";
import {
  playGiggle,
  playSparkle,
  playSplash,
  playSquirt,
} from "../../utils/waterRideAudio.ts";
import {
  RideButton,
  RideWorld,
  u,
  useRideClock,
  useSplashes,
  type RideSceneProps,
} from "./rideKit";

const PIVOT_X = 800;
const PIVOT_Y = 190;
const CANNONS = [
  { x: 250, y: 600, dir: 1 },
  { x: 1350, y: 600, dir: -1 },
] as const;
type Squirt = { id: number; d: string };

export function BucketRide({
  look,
  pet,
  active,
  gentle,
  onDone,
  announce,
}: RideSceneProps) {
  const [splashes, addSplash] = useSplashes(gentle, 16);
  const [squirts, setSquirts] = useState<Squirt[]>([]);
  const [drench, setDrench] = useState(0);
  const [giggling, setGiggling] = useState(false);
  const [wobble, setWobble] = useState(false);
  const bucketRef = useRef<SVGGElement>(null);
  const gaugeRef = useRef<SVGRectElement>(null);
  const pourRef = useRef<SVGGElement>(null);
  const clock = useRef(0);
  const nextSquirt = useRef(0);
  const timers = useRef<number[]>([]);
  const wobbleRef = useRef(false);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const giggle = () => {
    setGiggling(true);
    playGiggle();
    later(() => setGiggling(false), 1800);
  };

  const paint = (t: number) => {
    const previous = clock.current;
    clock.current = t;
    const bucket = bucketFrame(t);
    bucketRef.current?.setAttribute(
      "transform",
      `rotate(${bucket.tipAngleDeg * 1.25} ${PIVOT_X} ${PIVOT_Y})`,
    );
    gaugeRef.current?.setAttribute("height", String(2.6 * bucket.fillPercent));
    gaugeRef.current?.setAttribute("y", String(450 - 2.6 * bucket.fillPercent));
    if (pourRef.current)
      pourRef.current.style.opacity = String(
        Math.min(1, bucket.splashRadius / 60),
      );
    const nearlyFull =
      !bucket.isDumping && bucket.fillPercent > 82 && bucket.tipAngleDeg === 0;
    if (nearlyFull !== wobbleRef.current) {
      wobbleRef.current = nearlyFull;
      setWobble(nearlyFull);
      if (nearlyFull) {
        announce("The bucket is wobbling. It's going to tip!");
        playSparkle();
      }
    }
    if (bucketDumpStarted(previous, t)) {
      announce("SPLASH! The bucket tipped all over you!");
      later(() => {
        playSplash(1);
        setDrench((n) => n + 1);
        for (const [x, y, size] of [
          [800, 700, 3.2],
          [600, 780, 1.8],
          [1000, 780, 1.8],
          [700, 520, 1.4],
          [900, 540, 1.4],
          [800, 380, 1.2],
        ] as const)
          addSplash(x, y, size);
      }, 350);
      later(giggle, 1100);
    }
    if (t >= WATER_RIDE_SECONDS.bucket) onDone();
  };
  useRideClock(active, (t) => paint(t));
  useEffect(() => {
    if (!active) paint(clock.current);
    else announce("Stand under the bucket and watch it fill. Tap to squirt!");
  }, [active]);

  const squirt = (x: number, y: number) => {
    const cannon = x < 800 ? CANNONS[0] : CANNONS[1];
    const nx = cannon.x + cannon.dir * 90;
    const ny = cannon.y - 60;
    const d = `M${nx} ${ny}Q${(nx + x) / 2} ${Math.min(ny, y) - 220} ${x} ${y}`;
    const id = nextSquirt.current++;
    setSquirts((list) => [...list.slice(-5), { id, d }]);
    playSquirt();
    later(() => {
      addSplash(x, y, 0.9);
      if (Math.abs(x - 800) < 160 && y > 420) giggle();
    }, 380);
  };

  return (
    <>
      <RideWorld
        className="wr-bucket"
        onTap={(x, y) => squirt(x, Math.min(y, 860))}
      >
        <svg className="wr-art" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>
            <linearGradient id="wr-bucket-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5cc8f0" />
              <stop offset="1" stopColor="#d6f6ff" />
            </linearGradient>
            <linearGradient id="wr-bucket-pour" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7fdcf2" stopOpacity=".7" />
              <stop offset=".5" stopColor="#e8fbff" />
              <stop offset="1" stopColor="#7fdcf2" stopOpacity=".7" />
            </linearGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#wr-bucket-sky)" />
          {[
            [200, 120],
            [1300, 90],
          ].map(([x, y]) => (
            <g
              key={x}
              className="sm-drift"
              style={{ "--sm-dist": "50px", "--sm-dur": "12s" }}
              fill="#fff"
            >
              <ellipse cx={x} cy={y} rx="90" ry="30" />
              <ellipse cx={x + 60} cy={y + 10} rx="60" ry="24" />
            </g>
          ))}
          {/* Fortress frame: posts, decks, railings and side slides */}
          {[330, 520, 1080, 1270].map((x) => (
            <rect
              key={x}
              x={x - 18}
              y="120"
              width="36"
              height="700"
              fill="#2a8fb0"
            />
          ))}
          <rect
            x="300"
            y="96"
            width="1000"
            height="40"
            rx="14"
            fill="#ff6f59"
          />
          {[
            [300, 470, 260],
            [1060, 470, 260],
            [160, 640, 300],
            [1140, 640, 300],
          ].map(([x, y, w]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width={w} height="28" rx="8" fill="#ffc93c" />
              <path
                d={`M${x} ${y - 50}H${x + w}`}
                stroke="#ff6f59"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {Array.from({ length: Math.floor(w / 40) + 1 }, (_, i) => (
                <path
                  key={i}
                  d={`M${x + i * 40} ${y - 50}V${y}`}
                  stroke="#ff6f59"
                  strokeWidth="6"
                />
              ))}
            </g>
          ))}
          <path
            d="M300 500C220 560 260 640 120 700L80 760"
            stroke="#a66be0"
            strokeWidth="56"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M1300 500C1380 560 1340 640 1480 700L1520 760"
            stroke="#4fd1b5"
            strokeWidth="56"
            fill="none"
            strokeLinecap="round"
          />
          {[400, 1200].map((x, i) => (
            <path
              key={x}
              d={`M${x} 96V20l70 22-70 22`}
              fill={i ? "#ffc93c" : "#4fd1b5"}
              stroke="#25748a"
              strokeWidth="6"
            />
          ))}
          {/* Fill gauge: a tall tube on the left post that fills before each tip */}
          <rect
            x="530"
            y="180"
            width="60"
            height="276"
            rx="30"
            fill="#fffdf9"
            stroke="#25748a"
            strokeWidth="8"
          />
          <rect
            ref={gaugeRef}
            x="538"
            y="450"
            width="44"
            height="0"
            rx="22"
            fill="#2fb3d6"
          />
          <circle
            cx="560"
            cy="160"
            r="22"
            fill="#ffd23c"
            stroke="#25748a"
            strokeWidth="6"
            className={wobble ? "wr-alarm" : undefined}
          />
          {/* Feeder pipe */}
          <path
            d="M1300 60H800V110"
            stroke="#9aa6ab"
            strokeWidth="34"
            fill="none"
            strokeLinejoin="round"
          />
          <rect
            x="785"
            y="104"
            width="30"
            height="70"
            fill="#bff0fb"
            opacity=".8"
            className="sm-flicker"
          />
          {/* Ground splash pad */}
          <rect y="800" width="1600" height="100" fill="#5fd3ee" />
          <ellipse cx="800" cy="830" rx="420" ry="40" fill="#8fe3f5" />
          <g ref={pourRef} className="wr-pour" opacity="0">
            <path
              d="M740 250C720 420 660 600 600 830H1000C940 600 900 420 880 250Z"
              fill="url(#wr-bucket-pour)"
            />
            <g
              className="wr-pour-lines"
              stroke="#fff"
              strokeWidth="10"
              strokeLinecap="round"
            >
              <path d="M780 300v140M840 360v160M720 540v120M900 520v140M800 620v120M680 700v80M940 700v90" />
            </g>
          </g>
          {/* Axle beam and the bucket */}
          <rect
            x={PIVOT_X - 260}
            y={PIVOT_Y - 12}
            width="520"
            height="24"
            rx="12"
            fill="#25748a"
          />
          <g ref={bucketRef}>
            <g className={wobble ? "wr-wobble" : undefined}>
              <path
                d={`M${PIVOT_X - 150} ${PIVOT_Y - 110}H${PIVOT_X + 150}L${PIVOT_X + 120} ${PIVOT_Y + 110}H${PIVOT_X - 120}Z`}
                fill="#ff8a3d"
                stroke="#c25a1a"
                strokeWidth="10"
                strokeLinejoin="round"
              />
              <ellipse
                cx={PIVOT_X}
                cy={PIVOT_Y - 110}
                rx="150"
                ry="26"
                fill="#2fb3d6"
                stroke="#c25a1a"
                strokeWidth="10"
              />
              {[-60, 0, 60].map((dy) => (
                <path
                  key={dy}
                  d={`M${PIVOT_X - 140 + Math.abs(dy) * 0.1} ${PIVOT_Y + dy}H${PIVOT_X + 140 - Math.abs(dy) * 0.1}`}
                  stroke="#ffc93c"
                  strokeWidth="14"
                />
              ))}
              <circle cx={PIVOT_X} cy={PIVOT_Y} r="22" fill="#25748a" />
            </g>
          </g>
          {CANNONS.map((cannon) => (
            <g
              key={cannon.x}
              transform={`translate(${cannon.x} ${cannon.y}) scale(${cannon.dir} 1)`}
            >
              <rect
                x="-50"
                y="-10"
                width="100"
                height="50"
                rx="14"
                fill="#25748a"
              />
              <g transform="rotate(-28)">
                <rect
                  x="-10"
                  y="-40"
                  width="110"
                  height="44"
                  rx="20"
                  fill="#ffc93c"
                  stroke="#e0901a"
                  strokeWidth="6"
                />
                <rect
                  x="88"
                  y="-46"
                  width="22"
                  height="56"
                  rx="8"
                  fill="#ff6f59"
                />
              </g>
            </g>
          ))}
          {squirts.map((s) => (
            <path
              key={s.id}
              className="wr-squirt"
              d={s.d}
              pathLength={1}
              onAnimationEnd={() =>
                setSquirts((list) => list.filter((item) => item.id !== s.id))
              }
            />
          ))}
        </svg>
        <div
          className={`wr-stander${giggling ? " is-giggling" : ""}`}
          style={{ left: u(800), top: u(830) }}
          aria-hidden="true"
        >
          <Avatar
            look={look}
            action={giggling ? "dance" : "idle"}
            className="wr-avatar"
          />
          <span className="wr-giggle">😆</span>
        </div>
        {pet && (
          <div
            className="wr-stander-pet"
            style={{ left: u(960), top: u(830) }}
            aria-hidden="true"
          >
            <PetCompanion pet={pet} isTrotting={giggling} />
          </div>
        )}
        {splashes}
        <div
          key={drench}
          className={`wr-lens${drench ? " is-on" : ""}`}
          aria-hidden="true"
        >
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </RideWorld>
      <div className="wr-actions is-side">
        <RideButton
          label="Squirt the water cannons"
          onPress={() => {
            squirt(760, 560);
            later(() => squirt(840, 600), 120);
          }}
        >
          <Droplets size={40} strokeWidth={2.6} />
        </RideButton>
      </div>
    </>
  );
}
