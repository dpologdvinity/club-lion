import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  slideFrame,
  WATER_RIDE_SECONDS,
  type SlideSection,
} from "../../utils/waterRides.ts";
import {
  playGiggle,
  playSparkle,
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

export const SLIDE_CHOICES = [
  {
    id: "sunny",
    name: "Sunny yellow",
    fill: "#ffc93c",
    dark: "#d48a12",
    tube: "coral",
  },
  {
    id: "grape",
    name: "Grape purple",
    fill: "#a66be0",
    dark: "#6e3fa8",
    tube: "sunny",
  },
  {
    id: "coral",
    name: "Coral red",
    fill: "#ff6f59",
    dark: "#c2412f",
    tube: "mint",
  },
] as const;
export type SlideChoice = (typeof SLIDE_CHOICES)[number]["id"];

const RINGS = 12;
const VANISH_X = 800;
const VANISH_Y = 400;
const SECTION_LINES: Record<SlideSection, string> = {
  launch: "Here we go!",
  tunnel: "Into the tunnel!",
  daylight: "Out into the sunshine!",
  drop: "The big drop!",
  splash: "SPLASH! Into the pool!",
};

export function SlideRide({
  look,
  pet,
  active,
  gentle,
  onDone,
  announce,
  color,
}: RideSceneProps & { color: SlideChoice }) {
  const slide = SLIDE_CHOICES.find((choice) => choice.id === color);
  const fill = slide?.fill ?? "#ffc93c";
  const dark = slide?.dark ?? "#d48a12";
  const [section, setSection] = useState<SlideSection>("launch");
  const [lightAhead, setLightAhead] = useState(false);
  const [cheer, setCheer] = useState(false);
  const [splashes, addSplash] = useSplashes(gentle);
  const tubeRef = useRef<SVGGElement>(null);
  const skyRef = useRef<SVGGElement>(null);
  const ringRefs = useRef<(SVGGElement | null)[]>([]);
  const riderRef = useRef<HTMLDivElement>(null);
  const flow = useRef(0);
  const surge = useRef(0);
  const sectionRef = useRef<SlideSection>("launch");
  const cheerTimer = useRef(0);

  const paint = (t: number, dt: number) => {
    const frame = slideFrame(t);
    const calm = gentle ? 0.25 : 1;
    surge.current = Math.max(0, surge.current - dt * 1.5);
    flow.current += dt * (frame.speed + surge.current) * (gentle ? 0.35 : 1.1);
    const twist = frame.twist * calm;
    tubeRef.current?.setAttribute(
      "transform",
      `rotate(${twist} ${VANISH_X} ${VANISH_Y})`,
    );
    skyRef.current?.setAttribute(
      "transform",
      `rotate(${-twist * 0.35} ${VANISH_X} ${VANISH_Y})`,
    );
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const p = (i / RINGS + flow.current) % 1;
      ring.setAttribute(
        "transform",
        `translate(${VANISH_X} ${VANISH_Y}) scale(${0.05 + p ** 3 * 3.2})`,
      );
      ring.style.opacity = String(Math.min(1, p * 5));
    });
    const shake =
      frame.section === "drop" && !gentle ? Math.sin(t * 60) * 6 : 0;
    const bob = frame.section === "splash" ? Math.sin(t * 2.4) * 10 : 0;
    place(
      riderRef.current,
      800 + twist * 4 + shake,
      frame.section === "splash" ? 680 + bob : 720,
      `rotate(${-twist * 0.7}deg)`,
    );
    if (frame.section !== sectionRef.current) {
      sectionRef.current = frame.section;
      setSection(frame.section);
      announce(SECTION_LINES[frame.section]);
      if (frame.section === "splash") {
        playSplash(1);
        window.setTimeout(playGiggle, 700);
        for (const [x, y, size] of [
          [800, 700, 2.2],
          [560, 640, 1.3],
          [1040, 640, 1.3],
          [700, 520, 1.2],
          [920, 540, 1.2],
        ] as const)
          addSplash(x, y, size);
      } else if (frame.section === "drop") playWheee();
      else playWhoosh();
    }
    setLightAhead(
      frame.section === "tunnel" && slideFrame(t + 0.9).section !== "tunnel",
    );
    if (t >= WATER_RIDE_SECONDS.slides) onDone();
  };

  useRideClock(active, paint);
  useEffect(() => {
    // Paint the still frame whenever the ride is waiting or finished.
    if (!active) paint(sectionRef.current === "splash" ? 30 : 0, 0);
  }, [active]);
  useEffect(() => () => window.clearTimeout(cheerTimer.current), []);

  const whee = (x = 800, y = 600) => {
    if (!active) return;
    surge.current = 0.8;
    playSparkle();
    addSplash(x, y, 0.8);
    setCheer(true);
    window.clearTimeout(cheerTimer.current);
    cheerTimer.current = window.setTimeout(() => setCheer(false), 900);
  };

  return (
    <>
      <RideWorld
        className={`wr-slide is-${section}${lightAhead ? " is-light-ahead" : ""}`}
        onTap={(x, y) => whee(x, y)}
      >
        <svg className="wr-art" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>
            <linearGradient id="wr-slide-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5cc8f0" />
              <stop offset=".7" stopColor="#bdeefa" />
              <stop offset="1" stopColor="#fff4d6" />
            </linearGradient>
            <radialGradient id="wr-slide-tunnel" cx=".5" cy=".44" r=".7">
              <stop offset="0" stopColor="#120a24" />
              <stop offset=".35" stopColor={dark} />
              <stop offset="1" stopColor={fill} />
            </radialGradient>
            <radialGradient id="wr-slide-glow" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#fffbe8" />
              <stop offset=".6" stopColor="#fff6c8" stopOpacity=".8" />
              <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g ref={skyRef}>
            <rect
              x="-600"
              y="-600"
              width="2800"
              height="2100"
              fill="url(#wr-slide-sky)"
            />
            <circle cx="1240" cy="150" r="70" fill="#fff4b0" />
            <circle cx="1240" cy="150" r="110" fill="#fff4b0" opacity=".3" />
            {[
              [260, 140, 1],
              [620, 90, 0.7],
              [1500, 220, 0.9],
            ].map(([x, y, s]) => (
              <g
                key={x}
                transform={`translate(${x} ${y}) scale(${s})`}
                fill="#fff"
              >
                <ellipse cx="0" cy="0" rx="90" ry="34" />
                <ellipse cx="-50" cy="10" rx="60" ry="26" />
                <ellipse cx="60" cy="12" rx="64" ry="24" />
              </g>
            ))}
            <path
              d="M-600 470Q-300 380 0 440T600 420T1200 430T1800 410T2200 450V1500H-600Z"
              fill="#3aa877"
            />
            <path
              d="M-600 500Q-200 450 200 490T1000 480T1800 470T2200 500V1500H-600Z"
              fill="#2c8f63"
            />
            {[120, 380, 1180, 1460].map((x, i) => (
              <g key={x} transform={`translate(${x} ${470 - (i % 2) * 20})`}>
                <path
                  d="M0 0Q8-90-6-170"
                  stroke="#7a5532"
                  strokeWidth="12"
                  fill="none"
                />
                {[-150, -110, -70, -30, 10].map((a) => (
                  <path
                    key={a}
                    transform={`translate(-6 -170) rotate(${a})`}
                    d="M0 0Q50-26 100 6"
                    stroke="#4fbd8a"
                    strokeWidth="16"
                    strokeLinecap="round"
                    fill="none"
                  />
                ))}
              </g>
            ))}
          </g>
          <g ref={tubeRef} className="wr-slide-tube">
            <rect
              className="wr-slide-tunnel"
              x="-600"
              y="-600"
              width="2800"
              height="2100"
              fill="url(#wr-slide-tunnel)"
            />
            <path
              className="wr-slide-trough"
              d={`M-400 ${VANISH_Y}A1200 700 0 0 0 2000 ${VANISH_Y}Z`}
              fill={fill}
            />
            <path
              className="wr-slide-trough"
              d={`M${VANISH_X - 60} ${VANISH_Y}L${VANISH_X - 520} 1100H${VANISH_X + 520}L${VANISH_X + 60} ${VANISH_Y}Z`}
              fill="#8fe3f5"
              opacity=".55"
            />
            {Array.from({ length: RINGS }, (_, i) => (
              <g
                key={i}
                ref={(node) => {
                  ringRefs.current[i] = node;
                }}
              >
                <ellipse
                  className="wr-ring-full"
                  rx="420"
                  ry="300"
                  fill="none"
                  stroke={i % 2 ? fill : dark}
                  strokeWidth="34"
                />
                <path
                  className="wr-ring-half"
                  d="M-420 0A420 300 0 0 0 420 0"
                  fill="none"
                  stroke={i % 2 ? "#ffffff" : dark}
                  strokeOpacity={i % 2 ? 0.6 : 0.7}
                  strokeWidth="22"
                />
              </g>
            ))}
            <ellipse
              className="wr-slide-pool-ahead"
              cx={VANISH_X}
              cy={VANISH_Y + 10}
              rx="90"
              ry="40"
              fill="#3fc1e0"
              stroke="#e8fbff"
              strokeWidth="8"
            />
            <ellipse
              className="wr-slide-light"
              cx={VANISH_X}
              cy={VANISH_Y}
              rx="160"
              ry="120"
              fill="url(#wr-slide-glow)"
            />
          </g>
          <g className="wr-slide-pool">
            {/* The tower you just came down, with its three tubes into the pool */}
            <g transform="translate(1230 440)">
              <path
                d="M-50 0L-40-300M50 0L40-300"
                stroke="#25748a"
                strokeWidth="12"
              />
              <rect x="-70" y="-312" width="140" height="16" fill="#ffcf4a" />
              <path d="M-80-312L0-370L80-312Z" fill="#ff6f59" />
              {SLIDE_CHOICES.map((choice, i) => (
                <path
                  key={choice.id}
                  d={`M${-20 + i * 20} ${-290 + i * 70}C${-260 + i * 40} ${-260 + i * 60} ${120 - i * 60} ${-120 + i * 30} ${-150 - i * 40} 0`}
                  stroke={choice.fill}
                  strokeWidth="30"
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </g>
            <rect y="430" width="1600" height="470" fill="#3fc1e0" />
            <path
              d="M0 470Q200 440 400 470T800 470T1200 470T1600 470V900H0Z"
              fill="#5fd3ee"
            />
            {[520, 640, 780, 900].map((y, i) => (
              <path
                key={y}
                className="sm-drift"
                style={{ "--sm-dist": "40px", "--sm-dur": `${3 + i}s` }}
                d={`M${100 + i * 90} ${y}h220M${900 - i * 60} ${y + 30}h260`}
                stroke="#e8fbff"
                strokeWidth="8"
                strokeLinecap="round"
                opacity=".6"
              />
            ))}
          </g>
        </svg>
        <TubeRider
          look={look}
          pet={pet}
          color={slide?.tube ?? "coral"}
          action={cheer || section === "splash" ? "wave" : "sit"}
          riderRef={riderRef}
          className={section === "splash" ? "is-floating" : ""}
        />
        {splashes}
        <div className="wr-lens" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </RideWorld>
      <div className="wr-actions">
        <RideButton label="Wheee!" onPress={() => whee()}>
          <Sparkles size={40} strokeWidth={2.6} />
        </RideButton>
      </div>
    </>
  );
}
