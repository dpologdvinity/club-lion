import { useEffect, useRef, useState } from "react";
import { Fish, RotateCcw, Waves, X } from "lucide-react";
import { Coin } from "./Lion";
import {
  getRandomCatch,
  isWithinBiteWindow,
  updateReelTension,
  REEL_SWEET_SPOT,
  type FishRarity,
} from "../utils/fishingEngine.ts";

type Stage = "idle" | "waiting" | "bite" | "reeling" | "result";

const BITE_WINDOW_MS = 1000;
const REEL_HOLD_MS = 2500;
const WAIT_MIN_MS = 1200;
const WAIT_MAX_MS = 3200;
const FISH_PULL_POWER = 30;

const RARITY_LABEL: Record<FishRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
};

function createAudioContext(): AudioContext | null {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    return AudioContextClass ? new AudioContextClass() : null;
  } catch {
    return null;
  }
}

function playCastWhoosh(ctx: AudioContext) {
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + 0.4);
}

function playBobberPlop(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

function playReelClick(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(900, ctx.currentTime);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

function playTriumphFanfare(ctx: AudioContext) {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + index * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + index * 0.1);
    osc.stop(ctx.currentTime + index * 0.1 + 0.3);
  });
}

type CatchResult = { speciesId: string; weight: number; coins: number };

export function WaterholeAngler({
  onClose,
  onCatch,
}: {
  onClose: () => void;
  onCatch: (result: CatchResult) => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [tension, setTension] = useState(50);
  const [caughtFish, setCaughtFish] = useState<ReturnType<
    typeof getRandomCatch
  > | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const strikeButtonRef = useRef<HTMLButtonElement>(null);
  const castButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  const audioCtxRef = useRef<AudioContext | null>(null);
  const biteStartRef = useRef(0);
  const reelStartRef = useRef(0);
  const reelingRef = useRef(false);
  const tensionRef = useRef(50);
  const frameRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    castButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timeoutRef.current);
      cancelAnimationFrame(frameRef.current);
      void audioCtxRef.current?.close().catch(() => {});
      const target = returnFocus.current?.isConnected
        ? returnFocus.current
        : document.querySelector<HTMLElement>(".world-ground");
      target?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === " " && stage === "reeling") {
        event.preventDefault();
        reelingRef.current = true;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === " " && stage === "reeling") {
        reelingRef.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [stage, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, []);

  function ensureAudio(): AudioContext | null {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
    const ctx = audioCtxRef.current;
    if (ctx) void ctx.resume().catch(() => {});
    return ctx;
  }

  function castLine() {
    setStage("waiting");
    const ctx = ensureAudio();
    if (ctx) {
      try {
        playCastWhoosh(ctx);
      } catch {
        // Audio is a nice-to-have; the game works silently if it fails.
      }
    }
    const waitMs = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
    timeoutRef.current = setTimeout(() => {
      biteStartRef.current = performance.now();
      setStage("bite");
      if (ctx) {
        try {
          playBobberPlop(ctx);
        } catch {
          // Audio is a nice-to-have; the game works silently if it fails.
        }
      }
      timeoutRef.current = setTimeout(() => {
        setStage("idle");
      }, BITE_WINDOW_MS);
    }, waitMs);
  }

  function strike() {
    const elapsed = performance.now() - biteStartRef.current;
    if (!isWithinBiteWindow(elapsed, 0, BITE_WINDOW_MS)) return;
    clearTimeout(timeoutRef.current);
    reelStartRef.current = performance.now();
    tensionRef.current = 50;
    setTension(50);
    reelingRef.current = false;
    setStage("reeling");

    const tick = () => {
      const now = performance.now();
      const elapsedReel = now - reelStartRef.current;
      tensionRef.current = updateReelTension(
        tensionRef.current,
        reelingRef.current,
        16,
        FISH_PULL_POWER,
      );
      setTension(tensionRef.current);
      if (tensionRef.current <= 0) {
        setStage("idle");
        return;
      }
      if (elapsedReel >= REEL_HOLD_MS) {
        const inSweetSpot =
          tensionRef.current >= REEL_SWEET_SPOT.min &&
          tensionRef.current <= REEL_SWEET_SPOT.max;
        if (inSweetSpot) {
          const result = getRandomCatch();
          setCaughtFish(result);
          setStage("result");
          const ctx = audioCtxRef.current;
          if (ctx) {
            try {
              playTriumphFanfare(ctx);
            } catch {
              // Audio is a nice-to-have; the game works silently if it fails.
            }
          }
          onCatch({
            speciesId: result.species.id,
            weight: result.weight,
            coins: result.coins,
          });
        } else {
          setStage("idle");
        }
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }

  function toggleReeling(isReeling: boolean) {
    reelingRef.current = isReeling;
    const ctx = audioCtxRef.current;
    if (isReeling && ctx) {
      try {
        playReelClick(ctx);
      } catch {
        // Audio is a nice-to-have; the game works silently if it fails.
      }
    }
  }

  function castAgain() {
    setCaughtFish(null);
    setTension(50);
    castLine();
  }

  return (
    <div
      className="dialog-backdrop waterhole-angler-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Waterhole Angler"
        className="dialog waterhole-angler"
      >
        <div className="dialog-inner">
          <header className="dialog-header">
            <div>
              <h2>Waterhole Angler</h2>
              <p>Cozy dock fishing at the watering hole</p>
            </div>
            <button
              ref={closeButtonRef}
              className="icon-button"
              aria-label="Close dialog"
              onClick={onClose}
            >
              <X size={21} />
            </button>
          </header>

          {stage === "idle" && (
            <div className="angler-scene angler-idle">
              <Waves size={40} aria-hidden="true" />
              <p>The sunny watering hole ripples off the wooden dock.</p>
              <button
                ref={castButtonRef}
                type="button"
                className="button-primary"
                onClick={castLine}
              >
                <Fish size={16} aria-hidden="true" />
                Cast Line
              </button>
            </div>
          )}

          {stage === "waiting" && (
            <div className="angler-scene angler-waiting" role="status">
              <div className="angler-bobber-ripples" aria-hidden="true">
                <span className="angler-ripple" />
                <span className="angler-ripple" />
                <span className="angler-ripple" />
                <span className="angler-bobber" />
              </div>
              <p>Waiting for a bite&hellip;</p>
            </div>
          )}

          {stage === "bite" && (
            <div className="angler-scene angler-bite">
              <div className="angler-bite-banner" role="alert">
                BITE!
              </div>
              <button
                ref={strikeButtonRef}
                type="button"
                className="button-primary angler-strike"
                onClick={strike}
                autoFocus
              >
                Strike &amp; Reel!
              </button>
            </div>
          )}

          {stage === "reeling" && (
            <div className="angler-scene angler-reeling">
              <p id="angler-tension-label">
                Hold Space or the button to keep the needle in the green zone.
              </p>
              <div
                className="angler-tension-bar"
                role="img"
                aria-label={`Line tension ${Math.round(tension)} out of 100`}
              >
                <div
                  className="angler-tension-sweet-spot"
                  style={{
                    left: `${REEL_SWEET_SPOT.min}%`,
                    width: `${REEL_SWEET_SPOT.max - REEL_SWEET_SPOT.min}%`,
                  }}
                />
                <div
                  className="angler-tension-needle"
                  style={{ left: `${tension}%` }}
                />
              </div>
              <button
                type="button"
                className="button-primary angler-reel-button"
                onPointerDown={() => toggleReeling(true)}
                onPointerUp={() => toggleReeling(false)}
                onPointerLeave={() => toggleReeling(false)}
              >
                Reel!
              </button>
            </div>
          )}

          {stage === "result" && caughtFish && (
            <div className="angler-scene angler-result">
              <h3>{caughtFish.species.name}</h3>
              <span
                className={`angler-rarity-badge angler-rarity-${caughtFish.species.rarity}`}
              >
                {RARITY_LABEL[caughtFish.species.rarity]}
              </span>
              <p>{caughtFish.species.description}</p>
              <p>Weight: {caughtFish.weight} kg</p>
              <p>
                <Coin amount={caughtFish.coins} />
              </p>
              <button
                type="button"
                className="button-primary"
                onClick={castAgain}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Cast Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
