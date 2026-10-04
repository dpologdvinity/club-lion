import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import type { AvatarLook } from "../types/world.ts";
import {
  SLED_FINISH_DISTANCE,
  SLED_ITEMS,
  SLED_OBSTACLES,
  stepSledPhysics,
  checkSledCollision,
  checkSledPickup,
  calculateSledPayout,
  playSledSound,
  type SledState,
} from "../utils/sledPhysics.ts";

const INITIAL_STATE: SledState = {
  laneX: 0,
  distance: 0,
  speed: 12,
  airborne: false,
  jumpHeight: 0,
  coinsCollected: 0,
  tricksCompleted: 0,
  crashed: false,
};
type Phase = "ready" | "running" | "paused" | "finished";

export function SledRun({
  look,
  best = 0,
  onComplete,
}: {
  look?: AvatarLook;
  best?: number;
  onComplete: (coinsEarned: number, result: SledState) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [state, setState] = useState(INITIAL_STATE);
  const [remaining, setRemaining] = useState([...SLED_ITEMS]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sound, setSound] = useState(false);
  const [announcement, setAnnouncement] = useState(
    "Steer around trees and use ramps to earn stunt coins.",
  );
  const simulation = useRef(INITIAL_STATE);
  const items = useRef([...SLED_ITEMS]);
  const input = useRef({
    left: false,
    right: false,
    jump: false,
    pointer: 0,
    pulseUntil: 0,
  });
  const reduced = useRef(false);
  const soundEnabled = useRef(false);
  const collected = useRef(false);
  const track = useRef<HTMLDivElement>(null);
  const collectButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = query.matches;
      setReducedMotion(query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (phase === "finished") collectButton.current?.focus();
    if (phase !== "running") return;
    track.current?.focus({ preventScroll: true });
    let frame = 0;
    let last = performance.now();
    let lastDraw = 0;
    let lastWhoosh = 0;
    let lastMilestone = Math.floor(simulation.current.distance / 100);
    const announced = new Set<number>();
    const clearInput = () => {
      input.current = {
        left: false,
        right: false,
        jump: false,
        pointer: 0,
        pulseUntil: 0,
      };
    };
    const onVisibility = () => {
      last = performance.now();
      clearInput();
    };
    const soundEffect = (type: Parameters<typeof playSledSound>[0]) => {
      if (soundEnabled.current) playSledSound(type);
    };
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(50, now - last));
      last = now;
      if (document.hidden) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const controls = input.current;
      const direction =
        Number(controls.right) - Number(controls.left) + controls.pointer;
      if (controls.pulseUntil > 0 && now >= controls.pulseUntil) {
        controls.pointer = 0;
        controls.pulseUntil = 0;
      }
      const previous = simulation.current;
      let next = stepSledPhysics(previous, direction, controls.jump, dt);
      controls.jump = false;
      if (next.airborne && !previous.airborne) {
        soundEffect("jump");
        setAnnouncement("Air stunt! Land safely to earn 10 coins.");
      }
      if (next.tricksCompleted > previous.tricksCompleted)
        setAnnouncement("Stunt landed! +10 coins.");
      // Remove every collected item immediately, including overlapping ramp/pinecone pairs.
      for (;;) {
        const pickup = checkSledPickup(next, items.current);
        if (!pickup.pickedUp) break;
        next = pickup.nextState;
        items.current = items.current.filter(
          (item) => item !== pickup.pickedUp,
        );
        if (pickup.pickedUp.type === "golden_pinecone") soundEffect("pickup");
        else if (pickup.pickedUp.type === "speed_boost") {
          soundEffect("boost");
          setAnnouncement("Speed boost!");
        } else
          setAnnouncement(
            "Ramp ready! Press Space or Jump now for an air stunt.",
          );
      }
      if (checkSledCollision(next, SLED_OBSTACLES)) {
        next = { ...next, crashed: true, speed: 0 };
        soundEffect("crash");
      }
      simulation.current = next;
      if (next.crashed || next.distance >= SLED_FINISH_DISTANCE) {
        setState(next);
        setRemaining([...items.current]);
        setPhase("finished");
        setAnnouncement(
          next.crashed
            ? "Run over. Your earned coins are ready to collect."
            : "Finish line crossed! Your earned coins are ready to collect.",
        );
        return;
      }
      const hazard = SLED_OBSTACLES.find(
        (obstacle) =>
          obstacle.distance > next.distance &&
          obstacle.distance - next.distance < 55 &&
          !announced.has(obstacle.distance),
      );
      if (hazard) {
        announced.add(hazard.distance);
        setAnnouncement(
          `${hazard.type} ahead in the ${hazard.laneX < -40 ? "left" : hazard.laneX > 40 ? "right" : "center"} lane. Steer to a clear lane.`,
        );
      } else if (Math.floor(next.distance / 100) > lastMilestone) {
        lastMilestone = Math.floor(next.distance / 100);
        setAnnouncement(
          `${lastMilestone * 100} of 800 meters. ${next.coinsCollected} pinecones, ${next.tricksCompleted} stunts.`,
        );
      }
      if (now - lastWhoosh > 1600) {
        soundEffect("whoosh");
        lastWhoosh = now;
      }
      // Essential track cues remain playable as discrete steps under reduced motion.
      if (!reduced.current || now - lastDraw >= 200) {
        setState(next);
        setRemaining([...items.current]);
        lastDraw = now;
      }
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("blur", clearInput);
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearInput();
      window.removeEventListener("blur", clearInput);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase]);

  const payout = calculateSledPayout(
    state.crashed ? Math.min(state.distance, 799) : state.distance,
    state.coinsCollected,
    state.tricksCompleted,
  );
  const stars = state.crashed
    ? state.distance >= 400
      ? 2
      : 1
    : state.tricksCompleted >= 3
      ? 3
      : 2;
  const visible = (distance: number) =>
    distance - state.distance > -10 && distance - state.distance < 85;
  const y = (distance: number) => 345 - (distance - state.distance) * 4;
  const rampReady =
    state.rampUntil !== undefined && state.distance <= state.rampUntil;
  const steerTap = (direction: number) => {
    input.current.pointer = direction;
    input.current.pulseUntil = performance.now() + 250;
  };

  return (
    <section
      className="sled-run"
      aria-label="Sled Run downhill race"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          input.current.left = false;
          input.current.right = false;
          input.current.pointer = 0;
        }
      }}
      onKeyDown={(event) => {
        if (phase !== "running") return;
        const key = event.key.toLowerCase();
        if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
          event.preventDefault();
          if (key === "arrowleft" || key === "a") input.current.left = true;
          else input.current.right = true;
        }
        if (key === " " && event.target === track.current) {
          event.preventDefault();
          if (!event.repeat) input.current.jump = true;
        }
      }}
      onKeyUp={(event) => {
        const key = event.key.toLowerCase();
        if (key === "arrowleft" || key === "a") input.current.left = false;
        if (key === "arrowright" || key === "d") input.current.right = false;
      }}
    >
      <p id="sled-instructions">
        Steer with ← / → or A / D. Press Space on a ramp to launch a stunt.
        Avoid trees, rocks, and snowdrifts. Pinecones earn 5 coins; landed
        stunts earn 10.
      </p>
      <div className="sled-hud">
        <label>
          Distance{" "}
          <progress
            aria-label="Distance down slope"
            max={800}
            value={state.distance}
          />{" "}
          <span>{Math.floor(state.distance)} / 800 m</span>
        </label>
        <span>
          Speed <strong>{Math.round(state.speed * 3.6)} km/h</strong>
        </span>
        <span>
          Golden pinecones <strong>{state.coinsCollected}</strong>
        </span>
        <span>
          Air time{" "}
          <strong>{state.airborne ? "2× · airborne" : "1× · grounded"}</strong>
        </span>
      </div>
      <p
        className="sled-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
      {phase === "ready" ? (
        <div className="sled-start">
          <h3>The 800-meter Alpine Dash</h3>
          <p>Best payout: {best} coins. Finish safely for a 30-coin bonus.</p>
          <button
            className="button-primary"
            onClick={() => setPhase("running")}
          >
            Start Sled Run
          </button>
        </div>
      ) : phase === "finished" ? (
        <div className="sled-results" aria-labelledby="sled-result-title">
          <h3 id="sled-result-title">
            {state.crashed
              ? "Run over · snow happens!"
              : "Victory · Alpine champion!"}
          </h3>
          <p aria-label={`${stars} out of 3 stars`}>
            {"★".repeat(stars)}
            {"☆".repeat(3 - stars)}
          </p>
          <p>
            {Math.floor(state.distance)} meters · {state.coinsCollected} golden
            pinecones · {state.tricksCompleted} landed stunts
          </p>
          <p>
            <strong>{payout} coins earned</strong>
          </p>
          <button
            ref={collectButton}
            className="button-primary"
            onClick={() => {
              if (collected.current) return;
              collected.current = true;
              onComplete(payout, state);
            }}
          >
            Collect Coins &amp; Return to Basecamp
          </button>
        </div>
      ) : (
        <>
          <div
            ref={track}
            className="sled-track"
            tabIndex={0}
            role="region"
            aria-label="Downhill track"
            aria-describedby="sled-instructions"
          >
            <svg viewBox="0 0 520 420" aria-hidden="true">
              <rect width="520" height="420" fill="#d9eaf0" />
              <path d="M65 0H455L475 420H45Z" fill="#fffdf9" />
              <path
                d="M80 0L60 420M440 0L460 420"
                stroke="#8ca7ad"
                strokeWidth="4"
                strokeDasharray="10 12"
              />
              {!reducedMotion &&
                Array.from({ length: 10 }, (_, i) => (
                  <g
                    key={i}
                    transform={`translate(${i % 2 ? 500 : 20} ${((i * 70 + state.distance * 5) % 480) - 30})`}
                  >
                    <path d="M0-30L-24 15H24ZM0-10L-30 35H30Z" fill="#46725f" />
                    <path d="M0 35V45" stroke="#80654e" strokeWidth="6" />
                  </g>
                ))}
              {SLED_OBSTACLES.filter((obstacle) =>
                visible(obstacle.distance),
              ).map((obstacle) => (
                <g
                  key={obstacle.distance}
                  transform={`translate(${260 + obstacle.laneX} ${y(obstacle.distance)})`}
                >
                  {obstacle.type === "tree" ? (
                    <>
                      <path
                        d="M0-48L-25-5H25ZM0-28L-32 12H32Z"
                        fill="#315f49"
                      />
                      <path d="M0 10V25" stroke="#7a5338" strokeWidth="8" />
                    </>
                  ) : obstacle.type === "rock" ? (
                    <path
                      d="M-22 12L-25-5L-10-20L15-16L27 12Z"
                      fill="#788a8e"
                      stroke="#4c6268"
                      strokeWidth="3"
                    />
                  ) : (
                    <ellipse
                      rx="30"
                      ry="15"
                      fill="#c1d7e2"
                      stroke="#637f8d"
                      strokeWidth="3"
                    />
                  )}
                </g>
              ))}
              {remaining
                .filter((item) => visible(item.distance))
                .map((item) => (
                  <g
                    key={`${item.type}-${item.distance}`}
                    transform={`translate(${260 + item.laneX} ${y(item.distance)})`}
                  >
                    {item.type === "golden_pinecone" ? (
                      <>
                        <ellipse
                          rx="10"
                          ry="15"
                          fill="#f1b14f"
                          stroke="#855718"
                          strokeWidth="3"
                        />
                        <path
                          d="M-6-5L6 5M-6 5L6-5"
                          stroke="#855718"
                          strokeWidth="2"
                        />
                      </>
                    ) : item.type === "speed_boost" ? (
                      <>
                        <rect
                          x="-25"
                          y="-12"
                          width="50"
                          height="24"
                          rx="5"
                          fill="#f2cd7a"
                        />
                        <path
                          d="M-12 6L-5-6L2 6L9-6L16 6"
                          fill="none"
                          stroke="#69491e"
                          strokeWidth="4"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M-30 12L0-18L30 12Z"
                          fill="#71a9ba"
                          stroke="#345768"
                          strokeWidth="3"
                        />
                        <text
                          y="30"
                          textAnchor="middle"
                          fill="#294b3c"
                          fontSize="13"
                          fontWeight="800"
                        >
                          SPACE
                        </text>
                      </>
                    )}
                  </g>
                ))}
              {visible(800) && (
                <g transform={`translate(60 ${y(800)})`}>
                  <rect width="400" height="12" fill="#294b3c" />
                  <text
                    x="200"
                    y="-10"
                    textAnchor="middle"
                    fill="#294b3c"
                    fontSize="20"
                    fontWeight="800"
                  >
                    FINISH
                  </text>
                </g>
              )}
              <g
                transform={`translate(${260 + state.laneX} ${345 - state.jumpHeight * 20}) rotate(${state.airborne && !reducedMotion ? ((8 - (state.jumpVelocity ?? 8)) / 16) * 360 : 0})`}
              >
                <ellipse cy="26" rx="25" ry="7" fill="#9cbdc4" />
                <path
                  d="M-23 16H23M-25 22H25M-21 8V24M21 8V24"
                  stroke="#855932"
                  strokeWidth="5"
                />
                <Avatar look={look} x={-22} y={-51} width={44} height={59} />
              </g>
            </svg>
          </div>
          <p className="sled-ramp-cue">
            {rampReady
              ? "Ramp ready — Jump now!"
              : state.airborne
                ? "Air stunt — landing earns 10 coins"
                : "Look for blue ramps and golden boost pads"}
          </p>
          <div className="sled-controls">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                className="button-secondary"
                disabled={phase !== "running"}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  input.current.pointer = direction;
                  input.current.pulseUntil = 0;
                }}
                onPointerUp={() => {
                  input.current.pointer = 0;
                }}
                onPointerCancel={() => {
                  input.current.pointer = 0;
                }}
                onLostPointerCapture={() => {
                  input.current.pointer = 0;
                }}
                onClick={(event) => {
                  if (event.detail === 0) steerTap(direction);
                }}
              >
                {direction < 0 ? "← Steer left" : "Steer right →"}
              </button>
            ))}
            <button
              className="button-primary"
              disabled={phase !== "running"}
              onClick={() => {
                input.current.jump = true;
              }}
            >
              Jump / Stunt
            </button>
            <button
              className="button-secondary"
              onClick={() => {
                setPhase(phase === "running" ? "paused" : "running");
                setAnnouncement(
                  phase === "running" ? "Race paused." : "Race resumed.",
                );
              }}
            >
              {phase === "running" ? "Pause race" : "Resume race"}
            </button>
          </div>
        </>
      )}
      {phase !== "finished" && (
        <button
          className="button-secondary sled-sound"
          aria-pressed={sound}
          onClick={() => {
            soundEnabled.current = !sound;
            setSound(!sound);
            if (!sound) playSledSound("pickup");
          }}
        >
          {sound ? "Sound on" : "Sound off"}
        </button>
      )}
    </section>
  );
}
