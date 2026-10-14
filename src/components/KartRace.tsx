import { memo, useEffect, useRef, useState, type PointerEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  LogOut,
  Rabbit,
  RotateCcw,
  Timer,
  Turtle,
  Zap,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { AnimalFace, LionTrophy, SideKart } from "./kartArt.tsx";
import type { AvatarLook } from "../types/world.ts";
import type { KartRaceResult } from "../game.ts";
import {
  BOOST_COOLDOWN_MS,
  KART_LAPS,
  MANGO_SPOTS,
  TRACK_HALF_WIDTH,
  TRACK_LENGTH,
  countdownStage,
  createRace,
  kartPose,
  kartRaceCoins,
  lapsDone,
  playerPlace,
  raceOrder,
  stepRace,
  trackFrame,
  trackPath,
  type KartDriver,
  type KartInput,
  type KartMode,
  type RaceState,
} from "../utils/kartRace.ts";
import { playKartSound, startEngineHum } from "../utils/kartAudio.ts";

export const KART_COLORS = [
  { id: "mango", label: "Mango kart", color: "#ff9f1c" },
  { id: "cherry", label: "Cherry kart", color: "#ef476f" },
  { id: "sunny", label: "Sunny kart", color: "#ffd23f" },
  { id: "lime", label: "Lime kart", color: "#80d34f" },
  { id: "sky", label: "Sky kart", color: "#3a86ff" },
  { id: "bubblegum", label: "Bubblegum kart", color: "#ff8fd0" },
] as const;

const AI_COLORS: Record<Exclude<KartDriver, "player">, string> = {
  zebra: "#eef0f6",
  giraffe: "#2ec4b6",
  hippo: "#9b5de5",
};
const DRIVER_NAMES: Record<KartDriver, string> = {
  player: "You",
  zebra: "Zebra",
  giraffe: "Giraffe",
  hippo: "Hippo",
};
const PET_SRC = `${import.meta.env.BASE_URL}assets/lion-chibi-living-cub.png`;
const TRACK_D = trackPath();

type Phase = "garage" | "race" | "podium";
type Held =
  { kind: "drag"; x0: number; x: number } | { kind: "left" | "right" };

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

// Scenery placed off the tarmac once, so it never moves between frames.
const SCENERY = (() => {
  const centre = Array.from({ length: 160 }, (_, i) =>
    trackFrame((i / 160) * TRACK_LENGTH),
  );
  const start = centre[0];
  const clear = (x: number, y: number, room: number) =>
    centre.every((p) => Math.hypot(p.x - x, p.y - y) > TRACK_HALF_WIDTH + room);
  const trees: { x: number; y: number; r: number }[] = [];
  const tires: { x: number; y: number }[] = [];
  for (let i = 0; i < 70; i++) {
    const s = (i / 70) * TRACK_LENGTH;
    const side = i % 2 ? 1 : -1;
    const d = side * (TRACK_HALF_WIDTH + 90 + ((i * 37) % 120));
    const p = kartPose({ s, d });
    const stand = Math.abs(p.x - start.x) < 330 && p.y < start.y;
    if (clear(p.x, p.y, 60) && !stand)
      trees.push({ ...p, r: 26 + ((i * 13) % 18) });
  }
  for (let i = 0; i < 80; i++) {
    const s = (i / 80) * TRACK_LENGTH;
    const curve = trackFrame(s).curve;
    if (Math.abs(curve) < 0.004) continue;
    const p = kartPose({ s, d: -Math.sign(curve) * (TRACK_HALF_WIDTH + 30) });
    if (clear(p.x, p.y, 18)) tires.push(p);
  }
  const xs = centre.map((p) => p.x);
  const ys = centre.map((p) => p.y);
  const pad = TRACK_HALF_WIDTH + 140;
  return {
    trees,
    tires,
    middle: {
      x: xs.reduce((a, b) => a + b, 0) / xs.length,
      y: ys.reduce((a, b) => a + b, 0) / ys.length,
    },
    box: {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2,
    },
  };
})();

const TrackArt = memo(function TrackArt() {
  const start = trackFrame(0);
  const { box } = SCENERY;
  const deg = (start.angle * 180) / Math.PI;
  return (
    <g>
      <rect
        x={box.x - 2000}
        y={box.y - 2000}
        width={box.w + 4000}
        height={box.h + 4000}
        fill="#7cc46a"
      />
      {/* Mown stripes, drawn as plain shapes so no pattern seams show when the view turns */}
      {Array.from({ length: Math.ceil((box.w + 4000) / 320) }, (_, i) => (
        <rect
          key={i}
          x={box.x - 2000 + i * 320}
          y={box.y - 2000}
          width="160"
          height={box.h + 4000}
          fill="#86cc72"
        />
      ))}
      <path
        d={TRACK_D}
        fill="none"
        stroke="#5aa64f"
        strokeWidth={TRACK_HALF_WIDTH * 2 + 70}
        strokeLinejoin="round"
        opacity=".5"
      />
      <path
        d={TRACK_D}
        fill="none"
        stroke="#ff5a5a"
        strokeWidth={TRACK_HALF_WIDTH * 2 + 22}
      />
      <path
        d={TRACK_D}
        fill="none"
        stroke="#fff"
        strokeWidth={TRACK_HALF_WIDTH * 2 + 22}
        strokeDasharray="26 26"
      />
      <path
        d={TRACK_D}
        fill="none"
        stroke="#57556a"
        strokeWidth={TRACK_HALF_WIDTH * 2}
      />
      <path
        d={TRACK_D}
        fill="none"
        stroke="#fff"
        strokeOpacity=".45"
        strokeWidth="5"
        strokeDasharray="34 46"
      />
      <g
        transform={`translate(${start.x} ${start.y}) rotate(${deg})`}
        aria-hidden="true"
      >
        <rect
          x="-14"
          y={-TRACK_HALF_WIDTH}
          width="28"
          height={TRACK_HALF_WIDTH * 2}
          fill="url(#kr-checker)"
        />
        <rect
          x="-12"
          y={-TRACK_HALF_WIDTH - 40}
          width="24"
          height="26"
          rx="5"
          fill="#ffd23f"
        />
        <rect
          x="-12"
          y={TRACK_HALF_WIDTH + 14}
          width="24"
          height="26"
          rx="5"
          fill="#ffd23f"
        />
      </g>
      {/* Grandstand beside the start straight */}
      <g
        transform={`translate(${start.x - 260} ${start.y - TRACK_HALF_WIDTH - 150})`}
      >
        <rect width="520" height="110" rx="14" fill="#c9cfdc" />
        {Array.from({ length: 3 }, (_, row) =>
          Array.from({ length: 16 }, (_, i) => (
            <circle
              key={`${row}-${i}`}
              cx={22 + i * 32 + (row % 2) * 12}
              cy={24 + row * 32}
              r="12"
              fill={
                ["#ff6b6b", "#ffd93d", "#4d96ff", "#6bcb77", "#c77dff"][
                  (i + row * 2) % 5
                ]
              }
            />
          )),
        )}
        <rect y="-24" width="520" height="28" rx="10" fill="#ff5a5a" />
      </g>
      <g transform={`translate(${SCENERY.middle.x} ${SCENERY.middle.y})`}>
        <circle r="150" fill="#ffd23f" opacity=".9" />
        <circle r="150" fill="none" stroke="#fff" strokeWidth="10" />
        <g transform="scale(4.6)">
          <AnimalFace kind="lion" />
        </g>
      </g>
      {SCENERY.tires.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y})`}>
          <circle r="15" fill="#23202b" />
          <circle
            r="11"
            fill="none"
            stroke={i % 2 ? "#ff5a5a" : "#fff"}
            strokeWidth="4"
          />
        </g>
      ))}
      {SCENERY.trees.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y})`}>
          <circle cx="6" cy="8" r={t.r} fill="#000" opacity=".15" />
          <circle r={t.r} fill={i % 3 ? "#3f9a4d" : "#4fae5a"} />
          <circle
            cx={-t.r * 0.3}
            cy={-t.r * 0.3}
            r={t.r * 0.45}
            fill="#6cc46f"
          />
        </g>
      ))}
    </g>
  );
});

/** Top-down kart pointing up (towards -y), about 44×60 units. */
function TopKart({ color, zebra = false }: { color: string; zebra?: boolean }) {
  return (
    <g>
      <ellipse cy="5" rx="25" ry="31" fill="#000" opacity=".22" />
      {[
        [-24, -24],
        [14, -24],
        [-25, 8],
        [14, 8],
      ].map(([x, y]) => (
        <rect
          key={`${x}${y}`}
          x={x}
          y={y}
          width="11"
          height="17"
          rx="4"
          fill="#23202b"
        />
      ))}
      <path
        d="M-15 26L-17-8Q-15-28 0-31Q15-28 17-8L15 26Z"
        fill={color}
        stroke="#2b2233"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {zebra && (
        <path
          d="M-15-6h30M-16 4h32M-15 14h30"
          stroke="#2b2233"
          strokeWidth="4"
        />
      )}
      <path
        d="M0-26V-12"
        stroke="#fff"
        strokeOpacity=".6"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="-12" y="-35" width="24" height="7" rx="3" fill="#2b2233" />
      <rect x="-21" y="23" width="42" height="8" rx="3" fill="#2b2233" />
      <circle cy="6" r="10" fill="#2b2233" opacity=".55" />
    </g>
  );
}

function PlayerDriver({
  look,
  petColor,
}: {
  look?: AvatarLook;
  petColor?: string;
}) {
  return (
    <g>
      <Avatar
        look={look}
        x={-28}
        y={-56}
        width={56}
        height={46}
        preserveAspectRatio="xMidYMin slice"
      />
      {petColor && (
        <image
          href={PET_SRC}
          className={`kart-pet kart-pet-${petColor}`}
          x="12"
          y="-34"
          width="30"
          height="30"
        />
      )}
    </g>
  );
}

/** Side view of the player driving, with the pet riding on the nose. */
function SeatedPlayer({
  look,
  petColor,
  color,
  number = 1,
}: {
  look?: AvatarLook;
  petColor?: string;
  color: string;
  number?: number;
}) {
  return (
    <g>
      <Avatar
        look={look}
        x={-46}
        y={-86}
        width={64}
        height={56}
        preserveAspectRatio="xMidYMin slice"
      />
      <SideKart color={color} number={number} />
      {petColor && (
        <image
          href={PET_SRC}
          className={`kart-pet kart-pet-${petColor}`}
          x="16"
          y="-66"
          width="38"
          height="38"
        />
      )}
    </g>
  );
}

function DriverFace({ driver }: { driver: KartDriver }) {
  return driver === "player" ? null : (
    <g transform="translate(0 -22) scale(.75)">
      <AnimalFace kind={driver} />
    </g>
  );
}

function Confetti({ calm }: { calm: boolean }) {
  return (
    <div
      className={`kart-confetti${calm ? " is-calm" : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: calm ? 14 : 40 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: ["#ff6b6b", "#ffd93d", "#4d96ff", "#6bcb77", "#ff8fd0"][
              i % 5
            ],
            animationDelay: `${-((i * 0.29) % 2.4)}s`,
            animationDuration: `${2 + (i % 4) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}

export function KartRace({
  look,
  petColor,
  racesFinished,
  bestLapMs,
  onFinish,
  onExit,
}: {
  look?: AvatarLook;
  petColor?: string;
  racesFinished: number;
  bestLapMs?: number;
  onFinish: (result: KartRaceResult) => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("garage");
  const [colorId, setColorId] =
    useState<(typeof KART_COLORS)[number]["id"]>("mango");
  const [mode, setMode] = useState<KartMode>("easy");
  const [race, setRace] = useState<RaceState>(() => createRace("easy"));
  const [bumped, setBumped] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [result, setResult] = useState<{
    place: number;
    coins: number;
    lapMs: number | null;
    record: boolean;
  } | null>(null);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const raceRef = useRef(race);
  const keys = useRef({ up: false, left: false, right: false });
  const held = useRef(new Map<number, Held>());
  const boostQueued = useRef(false);
  const raceNumber = useRef(racesFinished + 1);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const stageRef = useRef<HTMLDivElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const camera = useRef(0);
  const color = KART_COLORS.find((c) => c.id === colorId)?.color ?? "#ff9f1c";

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (phase === "podium") againRef.current?.focus();
    if (phase !== "race") return;
    stageRef.current?.focus({ preventScroll: true });
    const hum = startEngineHum();
    let frame = 0;
    let last: number | null = null;
    let celebrate = 0;
    let lastBump = -1000;
    const release = () => {
      keys.current = { up: false, left: false, right: false };
      held.current.clear();
    };
    const input = (): KartInput => {
      const k = keys.current;
      let steer = Number(k.right) - Number(k.left);
      let throttle = k.up || k.left || k.right;
      for (const h of held.current.values()) {
        throttle = true;
        if (h.kind === "drag") steer += clamp((h.x - h.x0) / 60, -1, 1);
        else steer += h.kind === "left" ? -1 : 1;
      }
      const boost = boostQueued.current;
      boostQueued.current = false;
      return { throttle, steer: clamp(steer, -1, 1), boost };
    };
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min(100, now - last);
      last = now;
      const prev = raceRef.current;
      const next = stepRace(prev, input(), dt);
      raceRef.current = next;
      for (const event of next.events) {
        if (event === "bump") {
          if (next.clock - lastBump > 400) {
            playKartSound("bump");
            setBumped((n) => n + 1);
          }
          lastBump = next.clock;
        } else if (event === "beep" || event === "go") {
          playKartSound(event);
          setAnnouncement(
            event === "go" ? "Go!" : String(4 - countdownStage(next.clock)),
          );
        } else if (event === "lap") {
          playKartSound("lap");
          const lap = Math.min(KART_LAPS, lapsDone(next.karts[0]) + 1);
          setAnnouncement(`Lap ${lap} of ${KART_LAPS}`);
        } else if (event !== "finish") playKartSound(event);
      }
      const player = next.karts[0];
      // Chase camera: ease the view round so your kart always points up.
      const target = trackFrame(player.s).angle;
      camera.current +=
        Math.atan2(
          Math.sin(target - camera.current),
          Math.cos(target - camera.current),
        ) * Math.min(1, dt / 80);
      const top = next.mode === "fast" ? 640 : 480;
      hum.setSpeed(next.clock < 0 ? 0 : player.speed / top);
      setRace(next);
      if (next.finished) {
        hum.stop();
        const place = playerPlace(next);
        const lapMs = next.lapTimes.length ? Math.min(...next.lapTimes) : null;
        const lap = lapMs === null ? null : Math.round(lapMs);
        setResult({
          place,
          coins: kartRaceCoins(place),
          lapMs: lap,
          record: lap !== null && (bestLapMs === undefined || lap < bestLapMs),
        });
        finishRef.current({
          raceNumber: raceNumber.current,
          place,
          bestLapMs: lap,
        });
        playKartSound("cheer");
        setAnnouncement(`Finished! You came in place ${place} of 4.`);
        celebrate = window.setTimeout(() => setPhase("podium"), 1600);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      release();
      if (document.hidden) hum.setSpeed(-1);
      else if (!raceRef.current.finished) {
        last = null;
        frame = requestAnimationFrame(tick);
      }
    };
    const onKey = (event: KeyboardEvent, down: boolean) => {
      const key = event.key.toLowerCase();
      const k = keys.current;
      if (key === "arrowup" || key === "w") k.up = down;
      else if (key === "arrowleft" || key === "a") k.left = down;
      else if (key === "arrowright" || key === "d") k.right = down;
      else if (key === " " || key === "arrowdown") {
        if (down && !event.repeat) boostQueued.current = true;
      } else return;
      event.preventDefault();
    };
    const keyDown = (event: KeyboardEvent) => onKey(event, true);
    const keyUp = (event: KeyboardEvent) => onKey(event, false);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(celebrate);
      hum.stop();
      release();
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // bestLapMs is read once per race on purpose: a record beats the best
    // from before this race started.
  }, [phase]);

  const start = () => {
    const fresh = createRace(mode);
    raceRef.current = fresh;
    raceNumber.current = racesFinished + 1;
    camera.current = trackFrame(fresh.karts[0].s).angle;
    boostQueued.current = false;
    setRace(fresh);
    setResult(null);
    setAnnouncement("Get ready!");
    setPhase("race");
  };

  const hold = (kind: Held["kind"]) => (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    held.current.set(
      event.pointerId,
      kind === "drag"
        ? { kind, x0: event.clientX, x: event.clientX }
        : { kind },
    );
  };
  const letGo = (event: PointerEvent<HTMLElement>) => {
    held.current.delete(event.pointerId);
  };

  if (phase === "garage")
    return (
      <section className="kart-race kart-garage" aria-label="Kart garage">
        <svg
          className="kart-garage-preview"
          viewBox="-130 -120 260 150"
          aria-hidden="true"
        >
          <ellipse cy="6" rx="120" ry="14" fill="#000" opacity=".12" />
          <g className="kart-garage-kart">
            <SeatedPlayer look={look} petColor={petColor} color={color} />
          </g>
        </svg>
        <div className="kart-swatches" role="group" aria-label="Kart color">
          {KART_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="kart-swatch"
              style={{ background: c.color }}
              aria-label={c.label}
              aria-pressed={c.id === colorId}
              onClick={() => {
                setColorId(c.id);
                playKartSound("mango");
              }}
            />
          ))}
        </div>
        <div className="kart-garage-actions">
          <button
            type="button"
            className={`kart-round kart-mode${mode === "fast" ? " is-fast" : ""}`}
            aria-label="Fast mode"
            title="Fast mode"
            aria-pressed={mode === "fast"}
            onClick={() => setMode(mode === "fast" ? "easy" : "fast")}
          >
            {mode === "fast" ? <Rabbit size={30} /> : <Turtle size={30} />}
          </button>
          <button
            type="button"
            className="kart-go"
            aria-label="Start race"
            onClick={start}
          >
            <Flag size={34} /> Go!
          </button>
          <span
            className="kart-best"
            aria-label={
              bestLapMs ? `Best lap ${seconds(bestLapMs)}` : "No best lap yet"
            }
          >
            <Timer size={22} aria-hidden="true" />
            {bestLapMs ? seconds(bestLapMs) : "–"}
          </span>
        </div>
      </section>
    );

  const order = raceOrder(race);
  const player = race.karts[0];
  const stage = countdownStage(race.clock);
  const place = order.indexOf(0) + 1;
  const lap = Math.min(KART_LAPS, lapsDone(player) + 1);
  const pose = kartPose(player);
  const turn = reduced ? 0 : -90 - (camera.current * 180) / Math.PI;
  const box = SCENERY.box;
  const viewBox = reduced
    ? `${box.x} ${box.y} ${box.w} ${box.h}`
    : "-330 -380 660 640";
  const world = reduced
    ? undefined
    : `rotate(${turn}) translate(${-pose.x} ${-pose.y})`;
  const charge = 1 - race.boostCooldownMs / BOOST_COOLDOWN_MS;

  if (phase === "podium" && result) {
    const podium = [order[1], order[0], order[2]];
    const fourth = race.karts[order[3]]?.driver;
    return (
      <section className="kart-race kart-podium" aria-label="Race results">
        <Confetti calm={reduced} />
        <p className="sr-only" role="status">
          {`You came in place ${result.place} of 4 and earned ${result.coins} coins.`}
        </p>
        <div className="kart-podium-stage" aria-hidden="true">
          {podium.map((index, column) => {
            const kart = race.karts[index];
            const rank = [2, 1, 3][column];
            return (
              <div
                key={kart.driver}
                className={`kart-step kart-step-${rank}${index === 0 ? " is-you" : ""}`}
              >
                <svg viewBox="-70 -150 140 160" className="kart-step-racer">
                  {rank === 1 && (
                    <g transform="translate(48 -64) scale(.62)">
                      <LionTrophy />
                    </g>
                  )}
                  {kart.driver === "player" ? (
                    <SeatedPlayer
                      look={look}
                      petColor={petColor}
                      color={color}
                      number={rank}
                    />
                  ) : (
                    <SideKart
                      color={AI_COLORS[kart.driver]}
                      number={rank}
                      driver={kart.driver}
                    />
                  )}
                </svg>
                <div className="kart-step-block">{rank}</div>
              </div>
            );
          })}
        </div>
        <div className="kart-podium-summary">
          <span className={`kart-medal kart-medal-${result.place}`}>
            {result.place}
          </span>
          <span className="kart-coins" aria-label={`${result.coins} coins`}>
            +{result.coins}
          </span>
          {result.lapMs !== null && (
            <span
              className={`kart-best${result.record ? " is-record" : ""}`}
              aria-label={`Best lap ${seconds(result.lapMs)}${result.record ? ", new record" : ""}`}
            >
              <Timer size={22} aria-hidden="true" />
              {seconds(result.lapMs)}
              {result.record && <span aria-hidden="true"> ★</span>}
            </span>
          )}
          {fourth && (
            <span
              className="kart-fourth"
              aria-label={`Fourth place: ${DRIVER_NAMES[fourth]}`}
            >
              4
              <svg viewBox="-30 -30 60 60" aria-hidden="true">
                {fourth === "player" ? (
                  <Avatar
                    look={look}
                    x={-26}
                    y={-30}
                    width={52}
                    height={56}
                    preserveAspectRatio="xMidYMin slice"
                  />
                ) : (
                  <AnimalFace kind={fourth} />
                )}
              </svg>
            </span>
          )}
        </div>
        <div className="kart-garage-actions">
          <button
            ref={againRef}
            type="button"
            className="kart-round kart-again"
            aria-label="Race again"
            title="Race again"
            onClick={() => setPhase("garage")}
          >
            <RotateCcw size={30} />
          </button>
          <button
            type="button"
            className="kart-round"
            aria-label="Back to the speedway"
            title="Back to the speedway"
            onClick={onExit}
          >
            <LogOut size={30} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="kart-race" aria-label="Kart race">
      <div
        ref={stageRef}
        tabIndex={-1}
        className="kart-stage"
        aria-label="Race track. Hold to drive, arrow keys steer, space boosts."
        role="group"
        onPointerDown={hold("drag")}
        onPointerMove={(event) => {
          const h = held.current.get(event.pointerId);
          if (h?.kind === "drag") h.x = event.clientX;
        }}
        onPointerUp={letGo}
        onPointerCancel={letGo}
        onLostPointerCapture={letGo}
      >
        <svg
          className={`kart-track${bumped && !reduced ? ` is-bumped-${bumped % 2}` : ""}`}
          viewBox={viewBox}
          preserveAspectRatio={reduced ? "xMidYMid meet" : "xMidYMid slice"}
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="kr-checker"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <rect width="14" height="14" fill="#fff" />
              <rect width="7" height="7" fill="#23202b" />
              <rect x="7" y="7" width="7" height="7" fill="#23202b" />
            </pattern>
          </defs>
          <g transform={world}>
            <TrackArt />
            {MANGO_SPOTS.map((spot, i) => {
              if (race.mangos[i] > 0) return null;
              const p = kartPose(spot);
              return (
                <g
                  key={i}
                  transform={`translate(${p.x} ${p.y}) rotate(${-turn})`}
                >
                  <circle r="24" fill="#fff6c4" opacity=".55" />
                  <ellipse
                    rx="15"
                    ry="12"
                    fill="#ffb627"
                    stroke="#d9792b"
                    strokeWidth="2"
                  />
                  <path d="M3-11q8-9 15-4q-7 3-15 4Z" fill="#4caf50" />
                </g>
              );
            })}
            {race.karts.map((kart, index) => {
              const p = kartPose(kart);
              const deg = (p.angle * 180) / Math.PI + 90;
              const kartColor =
                kart.driver === "player" ? color : AI_COLORS[kart.driver];
              return (
                <g
                  key={kart.driver}
                  // The calm whole-track view draws karts bigger so they stay easy to spot.
                  transform={`translate(${p.x} ${p.y}) scale(${reduced ? 1.8 : 1})`}
                >
                  <g
                    transform={`rotate(${deg + (kart.bumpMs > 0 && !reduced ? Math.sin(kart.bumpMs / 30) * 10 : 0)})`}
                  >
                    {kart.boostMs > 0 && (
                      <path
                        d="M-10 32l10 34l10-34Z"
                        fill="#ffb627"
                        opacity=".9"
                      />
                    )}
                    <TopKart
                      color={kartColor}
                      zebra={kart.driver === "zebra"}
                    />
                  </g>
                  <g transform={`rotate(${-turn})`}>
                    {index === 0 ? (
                      <>
                        <PlayerDriver look={look} petColor={petColor} />
                        {reduced && (
                          <circle
                            r="44"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="6"
                            strokeDasharray="10 8"
                          />
                        )}
                      </>
                    ) : (
                      <DriverFace driver={kart.driver} />
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {player.boostMs > 0 && !reduced && (
          <div className="kart-speed" aria-hidden="true">
            {[4, 9, 15, 85, 91, 96].map((left, i) => (
              <span
                key={left}
                style={{ left: `${left}%`, animationDelay: `${-i * 0.11}s` }}
              />
            ))}
          </div>
        )}
        <div className="kart-hud" aria-hidden="true">
          <span className="kart-laps">
            {Array.from({ length: KART_LAPS }, (_, i) => (
              <Flag
                key={i}
                size={26}
                className={
                  i < lapsDone(player)
                    ? "is-done"
                    : i === lap - 1
                      ? "is-now"
                      : ""
                }
              />
            ))}
          </span>
          <span className={`kart-medal kart-medal-${place}`}>{place}</span>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        {race.clock < 900 && (
          <div
            className={`kart-lights${stage === 4 ? " is-go" : ""}`}
            aria-hidden="true"
          >
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={stage === 4 ? "go" : n <= stage ? "on" : ""}
              />
            ))}
          </div>
        )}
        {race.finished && (
          <div className="kart-finish-flag" aria-hidden="true">
            <Flag size={96} />
            <Confetti calm={reduced} />
          </div>
        )}

        <div className="kart-controls">
          <button
            type="button"
            className="kart-pad"
            aria-label="Steer left"
            onPointerDown={hold("left")}
            onPointerUp={letGo}
            onPointerCancel={letGo}
            onLostPointerCapture={letGo}
            onContextMenu={(event) => event.preventDefault()}
          >
            <ChevronLeft size={44} />
          </button>
          <button
            type="button"
            className="kart-boost"
            aria-label="Boost"
            disabled={charge < 1 || race.clock < 0 || race.finished}
            style={{ "--charge": `${Math.round(charge * 360)}deg` }}
            onPointerDown={(event) => {
              event.stopPropagation();
              boostQueued.current = true;
            }}
            onClick={(event) => {
              if (event.detail === 0) boostQueued.current = true;
            }}
          >
            <Zap size={38} />
          </button>
          <button
            type="button"
            className="kart-pad"
            aria-label="Steer right"
            onPointerDown={hold("right")}
            onPointerUp={letGo}
            onPointerCancel={letGo}
            onLostPointerCapture={letGo}
            onContextMenu={(event) => event.preventDefault()}
          >
            <ChevronRight size={44} />
          </button>
        </div>
      </div>
    </section>
  );
}
