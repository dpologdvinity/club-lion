import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { PetCompanion } from "./PetCompanion";
import {
  DEFAULT_AVATAR_LOOK,
  type AvatarLook,
  type PetState,
} from "../types/world.ts";
import {
  advanceCoaster,
  coasterPointAtDistance,
  COASTER_TRACK_LENGTH,
  createCoasterState,
  type CoasterState,
} from "../utils/coasterPhysics.ts";
import { computeCoasterTrackPosition } from "../utils/kineticRides.ts";

export type CoasterCompletion = { elapsedSeconds: number; photoTaken: boolean };
export type RollerCoasterRideProps = {
  look?: AvatarLook;
  pet?: PetState;
  onClose: () => void;
  /** Reports a naturally completed circuit once per run. Does not grant rewards. */
  onFinish?: (result: CoasterCompletion) => void;
};
type RidePhase = "intro" | "running" | "finished";
type RideAudio = {
  update: (velocity: number, muted: boolean) => void;
  stop: () => void;
};

// One small procedural noise buffer and oscillator; no downloaded sound assets.
function startRideAudio(): RideAudio | null {
  let context: AudioContext | undefined;
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];
  const nodes: AudioNode[] = [];
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        /* May not have started after an audio failure. */
      }
    }
    for (const node of nodes) {
      try {
        node.disconnect();
      } catch {
        /* Already disconnected. */
      }
    }
    if (context && context.state !== "closed")
      void context.close().catch(() => {});
  };
  try {
    context = new AudioContext();
    const buffer = context.createBuffer(
      1,
      context.sampleRate,
      context.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const wind = context.createBufferSource();
    sources.push(wind);
    wind.buffer = buffer;
    wind.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    const windGain = context.createGain();
    windGain.gain.value = 0;
    const rattle = context.createOscillator();
    sources.push(rattle);
    rattle.type = "triangle";
    rattle.frequency.value = 35;
    const rattleGain = context.createGain();
    rattleGain.gain.value = 0;
    nodes.push(wind, filter, windGain, rattle, rattleGain);
    wind.connect(filter).connect(windGain).connect(context.destination);
    rattle.connect(rattleGain).connect(context.destination);
    wind.start();
    rattle.start();
    void context.resume().catch(stop);
    const audioContext = context;
    return {
      stop,
      update(velocity, muted) {
        if (stopped) return;
        try {
          const speed = Math.min(1, velocity / 480);
          const time = audioContext.currentTime;
          windGain.gain.setTargetAtTime(
            muted ? 0 : 0.015 + speed * 0.065,
            time,
            0.08,
          );
          filter.frequency.setTargetAtTime(350 + speed * 1500, time, 0.08);
          rattleGain.gain.setTargetAtTime(
            muted ? 0 : 0.008 + speed * 0.012,
            time,
            0.08,
          );
          rattle.frequency.setTargetAtTime(24 + speed * 45, time, 0.08);
        } catch {
          stop();
        }
      },
    };
  } catch {
    stop();
    return null;
  }
}

const TRACK_POINTS = Array.from({ length: 700 }, (_, i) =>
  computeCoasterTrackPosition(i / 699),
);

/** Side-following camera, depth-offset rails, and three independent scenery planes. */
function paintRide(
  canvas: HTMLCanvasElement,
  cart: SVGSVGElement | null,
  state: CoasterState,
  gentle: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = 900;
  const height = 480;
  const point = coasterPointAtDistance(state.distance);
  const zoom = gentle ? 0.285 : 0.82;
  const shake = gentle ? 0 : Math.min(2.4, state.velocity / 180);
  const shakeX = Math.sin(state.elapsed * 43) * shake;
  const shakeY = Math.sin(state.elapsed * 57) * shake * 0.65;
  const cameraX = gentle ? 1400 : point.x;
  const cameraY = gentle ? 370 : point.y - 55;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#97d5e1");
  sky.addColorStop(1, "#ffebc8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff1af";
  ctx.beginPath();
  ctx.arc(745 - cameraX * 0.018, 74, 38, 0, Math.PI * 2);
  ctx.fill();
  // Distant mountain silhouettes lag behind the track camera.
  for (let layer = 0; layer < 2; layer++) {
    const offset = cameraX * (gentle ? 0 : 0.035 + layer * 0.035);
    ctx.fillStyle = layer === 0 ? "#b4c6a7" : "#8eaf8f";
    ctx.beginPath();
    ctx.moveTo(-200, height);
    for (let i = -1; i < 7; i++) {
      const x = i * 230 - offset;
      ctx.lineTo(x, 350 - layer * 30);
      ctx.lineTo(x + 105, 215 + ((i + 7) % 3) * 22 + layer * 45);
      ctx.lineTo(x + 230, 350 - layer * 30);
    }
    ctx.lineTo(width + 300, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.save();
  ctx.translate(width * 0.5 + shakeX, height * 0.55 + shakeY);
  ctx.scale(zoom, zoom);
  ctx.translate(-cameraX, -cameraY);
  ctx.fillStyle = "#cdd59a";
  ctx.fillRect(-1500, 650, 6000, 2200);
  // Acacias sit behind the supports but move faster than the mountains.
  for (let i = 0; i < 13; i++) {
    const x = i * 265 - 120;
    const y = 645;
    ctx.fillStyle = "#796149";
    ctx.fillRect(x - 6, y - 95, 12, 95);
    ctx.fillStyle = i % 2 ? "#648d68" : "#52775e";
    ctx.beginPath();
    ctx.ellipse(x, y - 100, 75, 23, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#b4a177";
  for (let i = 0; i < TRACK_POINTS.length; i += 19) {
    const p = TRACK_POINTS[i];
    ctx.beginPath();
    ctx.moveTo(p.x - 16, p.y + 10);
    ctx.lineTo(p.x - 16, 650);
    ctx.lineTo(p.x + 28, p.y + 10);
    ctx.stroke();
  }
  // Paired rails and ties provide the cart's depth and reveal the true loop.
  for (const [dx, dy, color, lineWidth] of [
    [-14, -8, "#847358", 8],
    [0, 0, "#294b3c", 8],
    [0, -3, "#f7d27c", 3],
  ] as const) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    TRACK_POINTS.forEach((p, i) =>
      i === 0 ? ctx.moveTo(p.x + dx, p.y + dy) : ctx.lineTo(p.x + dx, p.y + dy),
    );
    ctx.stroke();
  }
  ctx.strokeStyle = "#77583f";
  ctx.lineWidth = 4;
  for (let i = 0; i < TRACK_POINTS.length; i += 4) {
    const p = TRACK_POINTS[i];
    ctx.beginPath();
    ctx.moveTo(p.x - 14, p.y - 8);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  const gate = computeCoasterTrackPosition(0);
  ctx.fillStyle = "#ee964c";
  ctx.fillRect(gate.x - 55, gate.y + 8, 100, 18);
  ctx.restore();
  if (cart) {
    const x = width * 0.5 + (point.x - cameraX) * zoom + shakeX;
    const y = height * 0.55 + (point.y - cameraY) * zoom + shakeY;
    cart.style.width = `${((155 * zoom) / width) * 100}%`;
    cart.style.left = `${x / 9}%`;
    cart.style.top = `${y / 4.8}%`;
    cart.style.transform = `translate(-50%, -96%) rotate(${gentle ? 0 : point.angle}deg)`;
  }
}

function Passengers({ look, pet }: { look: AvatarLook; pet?: PetState }) {
  return (
    <>
      <g transform="translate(35 0)">
        <Avatar look={look} action="sit" width={75} height={100} />
      </g>
      {pet && (
        <g transform="translate(102 55)">
          <PetCompanion pet={pet} isTrotting={false} />
        </g>
      )}
      <path
        d="M17 81 L137 81 L126 114 L29 114 Z"
        fill="#ee964c"
        stroke="#59361b"
        strokeWidth="3"
      />
      <path
        d="M22 83 L31 94 L130 94"
        fill="none"
        stroke="#ffd497"
        strokeWidth="5"
      />
      <path
        d="M31 79 L123 79"
        stroke="#294b3c"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="42" cy="116" r="8" fill="#294b3c" />
      <circle cx="115" cy="116" r="8" fill="#294b3c" />
    </>
  );
}

export function RollerCoasterRide({
  look = DEFAULT_AVATAR_LOOK,
  pet,
  onClose,
  onFinish,
}: RollerCoasterRideProps) {
  const [phase, setPhase] = useState<RidePhase>("intro");
  const [gentle, setGentle] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [sound, setSound] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(false);
  const [announcement, setAnnouncement] = useState(
    "Your cart is ready at the station.",
  );
  const stateRef = useRef(createCoasterState());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cartRef = useRef<SVGSVGElement>(null);
  const souvenirRef = useRef<SVGSVGElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const exitRef = useRef<HTMLButtonElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const telemetryRef = useRef<HTMLOutputElement>(null);
  const audioRef = useRef<RideAudio | null>(null);
  const photoRef = useRef<string | null>(null);
  const gentleRef = useRef(gentle);
  const finishRef = useRef(onFinish);
  const frameRef = useRef(0);
  const activeRef = useRef(false);
  useEffect(() => {
    gentleRef.current = gentle;
    if (canvasRef.current)
      paintRide(canvasRef.current, cartRef.current, stateRef.current, gentle);
  }, [gentle]);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  const stopAudio = () => {
    audioRef.current?.stop();
    audioRef.current = null;
  };
  const clearPhoto = () => {
    if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    photoRef.current = null;
    setPhoto(null);
    setViewPhoto(false);
    setPhotoError(false);
  };
  const start = () => {
    if (activeRef.current) return;
    activeRef.current = true;
    stateRef.current = createCoasterState();
    clearPhoto();
    stopAudio();
    if (sound) audioRef.current = startRideAudio();
    setAnnouncement(
      "Climbing the lift hill. Your photo will be taken after the loop.",
    );
    setPhase("running");
  };
  const exit = () => {
    activeRef.current = false;
    cancelAnimationFrame(frameRef.current);
    stopAudio();
    clearPhoto();
    onClose();
  };

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setGentle(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let last: number | null = null;
    let lastHud = -1;
    let lastSection = "lift";
    const paint = () =>
      paintRide(canvas, cartRef.current, stateRef.current, gentleRef.current);
    paint();
    if (phase !== "running") return;
    const visibility = () => {
      last = null;
      audioRef.current?.update(stateRef.current.velocity, document.hidden);
    };
    const tick = (now: number) => {
      if (!activeRef.current) return;
      const dt = last === null || document.hidden ? 0 : (now - last) / 1000;
      last = now;
      const moved = advanceCoaster(stateRef.current, dt);
      stateRef.current = moved.state;
      paint();
      audioRef.current?.update(moved.state.velocity, document.hidden);
      if (moved.state.elapsed - lastHud >= 0.25) {
        lastHud = moved.state.elapsed;
        if (telemetryRef.current)
          telemetryRef.current.textContent = `${Math.round((moved.state.distance / COASTER_TRACK_LENGTH) * 100)}% of the circuit · ${Math.max(0, moved.state.gForce).toFixed(1)} g`;
      }
      const multiplier = coasterPointAtDistance(
        moved.state.distance,
      ).speedMultiplier;
      const section =
        multiplier === 0.6
          ? "lift"
          : multiplier === 2.2
            ? "drop"
            : multiplier === 1.4
              ? "loop"
              : multiplier === 1.1
                ? "hop"
                : "return";
      if (section !== lastSection) {
        lastSection = section;
        setAnnouncement(
          section === "drop"
            ? "Over the crest and down the big drop!"
            : section === "loop"
              ? "Around the loop!"
              : section === "hop"
                ? "Over the airtime hills."
                : "Heading back to the station.",
        );
      }
      if (moved.photoTriggered && souvenirRef.current) {
        try {
          const svg = new XMLSerializer().serializeToString(
            souvenirRef.current,
          );
          const url = URL.createObjectURL(
            new Blob([svg], { type: "image/svg+xml" }),
          );
          photoRef.current = url;
          setPhoto(url);
          setAnnouncement(
            "Photo taken after the loop! View it when you reach the station.",
          );
        } catch {
          setPhotoError(true);
        }
      }
      if (moved.finishedNow) {
        activeRef.current = false;
        if (telemetryRef.current)
          telemetryRef.current.textContent =
            "100% of the circuit · At the station";
        stopAudio();
        setAnnouncement("Back at the station. Your ride is complete.");
        setPhase("finished");
        finishRef.current?.({
          elapsedSeconds: moved.state.elapsed,
          photoTaken: photoRef.current !== null,
        });
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", visibility);
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      document.removeEventListener("visibilitychange", visibility);
      stopAudio();
    };
  }, [phase]);

  useEffect(() => {
    let mounted = true;
    // The parent Dialog opens in its effect after this child mounts.
    if (phase === "intro")
      queueMicrotask(() => {
        if (mounted) startRef.current?.focus();
      });
    else if (phase === "running") exitRef.current?.focus();
    else replayRef.current?.focus();
    return () => {
      mounted = false;
    };
  }, [phase]);

  useEffect(
    () => () => {
      activeRef.current = false;
      cancelAnimationFrame(frameRef.current);
      audioRef.current?.stop();
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    },
    [],
  );

  return (
    <section className="coaster-ride" aria-label="Savanna Screamer ride">
      <div className="coaster-stage" data-gentle-view={gentle}>
        <canvas ref={canvasRef} width={900} height={480} aria-hidden="true" />
        <svg
          ref={cartRef}
          className="coaster-cart"
          viewBox="0 0 155 125"
          width="155"
          height="125"
          aria-hidden="true"
        >
          <Passengers look={look} pet={pet} />
        </svg>
        <span className="coaster-stage-label">Savanna Screamer</span>
      </div>
      <p className="coaster-announce" role="status">
        {announcement}
      </p>
      <output
        ref={telemetryRef}
        className="coaster-telemetry"
        aria-live="off"
        aria-label="Ride progress"
      >
        0% of the circuit · 1.0 g
      </output>
      {phase === "intro" && (
        <p className="game-help">
          Climb the hill, swoop through the loop, and bring home a passenger
          photo. The cart drives itself.
        </p>
      )}
      <div className="coaster-settings">
        <label>
          <input
            type="checkbox"
            checked={gentle}
            onChange={(event) => {
              setGentle(event.target.checked);
            }}
          />{" "}
          Gentle view <span>(steady camera, no shake)</span>
        </label>
        <button
          type="button"
          className="button button-secondary"
          aria-pressed={sound}
          onClick={() => {
            setSound(!sound);
            stopAudio();
            if (!sound && phase === "running")
              audioRef.current = startRideAudio();
          }}
        >
          {sound ? "Sound on" : "Sound off"}
        </button>
      </div>
      {phase === "finished" && (
        <div className="coaster-souvenir">
          <h3>Back at the station!</h3>
          <p>
            {Math.round(stateRef.current.elapsed)} seconds around the savanna.
          </p>
          {photo && (
            <>
              <button
                type="button"
                className="button button-secondary"
                aria-expanded={viewPhoto}
                onClick={() => setViewPhoto(!viewPhoto)}
              >
                {viewPhoto ? "Hide souvenir photo" : "View souvenir photo"}
              </button>
              {viewPhoto && (
                <figure>
                  <img
                    src={photo}
                    alt={`Passenger souvenir at the loop exit${pet ? ` with ${pet.name}` : ""}`}
                  />
                  <figcaption>
                    Your look at the loop exit. This photo stays here until you
                    replay or leave.
                  </figcaption>
                  <a
                    className="button button-primary"
                    href={photo}
                    download="savanna-screamer-souvenir.svg"
                  >
                    Download photo
                  </a>
                </figure>
              )}
            </>
          )}
          {photoError && (
            <p>
              The photo couldn’t be created. You can ride again for another one.
            </p>
          )}
        </div>
      )}
      <div className="game-win-actions coaster-actions">
        {phase === "intro" && (
          <button
            ref={startRef}
            type="button"
            className="button button-primary"
            onClick={start}
          >
            Start ride
          </button>
        )}
        {phase === "finished" && (
          <button
            ref={replayRef}
            type="button"
            className="button button-primary"
            onClick={start}
          >
            Ride again
          </button>
        )}
        <button
          ref={exitRef}
          type="button"
          className="button button-secondary"
          onClick={exit}
        >
          Back to arcade
        </button>
      </div>
      <div hidden aria-hidden="true">
        <svg
          ref={souvenirRef}
          xmlns="http://www.w3.org/2000/svg"
          width="900"
          height="600"
          viewBox="0 0 900 600"
        >
          <rect width="900" height="600" rx="20" fill="#fffdf9" />
          <rect x="24" y="24" width="852" height="450" rx="14" fill="#97d5e1" />
          <circle cx="760" cy="106" r="44" fill="#fff1af" />
          <path
            d="M24 360 L174 180 L350 360 L560 160 L876 360 V474 H24Z"
            fill="#8eaf8f"
          />
          <path d="M24 392 Q430 320 876 388 V474 H24Z" fill="#cdd59a" />
          <circle
            cx="235"
            cy="310"
            r="118"
            fill="none"
            stroke="#294b3c"
            strokeWidth="12"
          />
          <path d="M220 428 H854" stroke="#294b3c" strokeWidth="12" />
          <g transform="translate(475 181) scale(2)">
            <Passengers look={look} pet={pet} />
          </g>
          <g fill="#294b3c" fontFamily="sans-serif" textAnchor="middle">
            <text x="450" y="524" fontSize="32" fontWeight="bold">
              Savanna Screamer
            </text>
            <text x="450" y="562" fontSize="20">
              Loop exit · Club Lion{pet ? ` · ${pet.name}` : ""}
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
}
