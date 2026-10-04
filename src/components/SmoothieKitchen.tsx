import { useEffect, useRef, useState } from "react";
import { Martini, RotateCcw, Star } from "lucide-react";
import { Dialog } from "./Dialog";
import { Coin } from "./Lion";
import {
  INGREDIENTS,
  RECIPES,
  scoreSmoothie,
  type Ingredient,
  type Recipe,
  type SmoothieScore,
} from "../utils/smoothieRecipes.ts";

const BLEND_HOLD_MS = 1600;

function pickOrder(exclude?: string): Recipe {
  const choices = RECIPES.filter((r) => r.id !== exclude);
  return choices[Math.floor(Math.random() * choices.length)] ?? RECIPES[0];
}

function playBlenderBuzz(ctx: AudioContext, gainNode: GainNode): () => void {
  const oscillator = ctx.createOscillator();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(90, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.3);
  const wobble = ctx.createOscillator();
  wobble.type = "sine";
  wobble.frequency.setValueAtTime(7, ctx.currentTime);
  const wobbleGain = ctx.createGain();
  wobbleGain.gain.setValueAtTime(18, ctx.currentTime);
  wobble.connect(wobbleGain);
  wobbleGain.connect(oscillator.frequency);
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.08);
  oscillator.connect(gainNode);
  oscillator.start();
  wobble.start();
  return () => {
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    oscillator.stop(ctx.currentTime + 0.2);
    wobble.stop(ctx.currentTime + 0.2);
  };
}

function drawWhirlpool(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  colors: string[],
) {
  context.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 4;
  const spin = progress * Math.PI * 10;
  context.save();
  context.translate(cx, cy);
  const palette = colors.length > 0 ? colors : ["#f4a53a"];
  for (let i = 0; i < 24; i++) {
    const t = i / 24;
    const angle = spin + t * Math.PI * 2;
    const r = radius * (0.15 + 0.8 * t);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    context.fillStyle = palette[i % palette.length];
    context.globalAlpha = 0.85;
    context.beginPath();
    context.arc(x, y, 5 * (1 - t * 0.6), 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

type KitchenProps = {
  onClose: () => void;
  onServe: (coinsEarned: number) => void;
  onOrder?: (name: string) => void;
};

/** Standalone fixture wrapper; live world uses the shared games dialog. */
export function SmoothieKitchen(props: KitchenProps) {
  const [orderName, setOrderName] = useState("");
  return (
    <Dialog
      title="Canopy Café Smoothie Kitchen"
      subtitle={`Order up: ${orderName}`}
      onClose={props.onClose}
    >
      <SmoothieKitchenContent {...props} onOrder={setOrderName} />
    </Dialog>
  );
}

export function SmoothieKitchenContent({
  onClose,
  onServe,
  onOrder,
}: KitchenProps) {
  const [order, setOrder] = useState<Recipe>(() => pickOrder());
  useEffect(() => {
    onOrder?.(order.name);
  }, [order.name, onOrder]);
  const [pitcher, setPitcher] = useState<Ingredient[]>([]);
  const [blending, setBlending] = useState(false);
  const [result, setResult] = useState<SmoothieScore | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopBuzzRef = useRef<(() => void) | null>(null);
  const holdFrameRef = useRef(0);
  const cancelledRef = useRef(false);
  const servedRef = useRef(false);
  const serveRef = useRef<HTMLButtonElement>(null);
  const ingredientRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (result) serveRef.current?.focus();
    else if (!blending) ingredientRef.current?.focus();
  }, [result, blending]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      cancelAnimationFrame(holdFrameRef.current);
      stopBuzzRef.current?.();
      void audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const addIngredient = (id: Ingredient) => {
    if (blending || result) return;
    setPitcher((prev) => [...prev, id]);
  };

  const resetPitcher = () => {
    if (blending) return;
    setPitcher([]);
    setResult(null);
  };

  const startBlend = () => {
    if (blending || pitcher.length === 0 || result) return;
    setBlending(true);
    cancelledRef.current = false;
    servedRef.current = false;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        const ctx = audioCtxRef.current ?? new AudioContextClass();
        audioCtxRef.current = ctx;
        void ctx.resume().catch(() => {});
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        stopBuzzRef.current = playBlenderBuzz(ctx, gainNode);
      }
    } catch {
      // The kitchen still works when sound is unavailable.
      stopBuzzRef.current = null;
    }

    const started = performance.now();
    const colors = pitcher.map(
      (id) => INGREDIENTS.find((i) => i.id === id)?.color ?? "#f4a53a",
    );

    const tick = (now: number) => {
      if (cancelledRef.current) return;
      const elapsed = now - started;
      const progress = Math.min(elapsed / BLEND_HOLD_MS, 1);
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (canvas && context) {
        drawWhirlpool(
          context,
          canvas.width,
          canvas.height,
          reducedMotion ? 0 : progress,
          colors,
        );
      }
      if (progress >= 1) {
        stopBuzzRef.current?.();
        stopBuzzRef.current = null;
        setBlending(false);
        setResult(scoreSmoothie(order, pitcher));
        return;
      }
      holdFrameRef.current = requestAnimationFrame(tick);
    };
    holdFrameRef.current = requestAnimationFrame(tick);
  };

  const serveAndContinue = () => {
    if (!result || servedRef.current) return;
    servedRef.current = true;
    onServe(result.coins);
    setOrder(pickOrder(order.id));
    setPitcher([]);
    setResult(null);
  };

  return (
    <>
      <h3>Smoothie Kitchen</h3>
      <p id="smoothie-order" className="game-instructions">
        Order up: <strong>{order.name}</strong>
      </p>
      <div className="smoothie-kitchen">
        <div className="smoothie-order-card">
          <Martini size={18} aria-hidden="true" />
          <span>
            Blend a <strong>{order.name}</strong>
          </span>
        </div>

        <ul className="smoothie-recipe" aria-label="Recipe ingredients">
          {INGREDIENTS.map((ingredient) => {
            const scoops = order.ingredients.filter(
              (id) => id === ingredient.id,
            ).length;
            return scoops > 0 ? (
              <li key={ingredient.id}>
                {ingredient.label} × {scoops}
              </li>
            ) : null;
          })}
        </ul>

        <div
          className="smoothie-dispensers"
          role="group"
          aria-label="Ingredient dispensers"
        >
          {INGREDIENTS.map((ingredient) => (
            <button
              key={ingredient.id}
              ref={
                ingredient.id === INGREDIENTS[0].id ? ingredientRef : undefined
              }
              type="button"
              className="smoothie-dispenser"
              style={{ borderColor: ingredient.color }}
              onClick={() => addIngredient(ingredient.id)}
              disabled={blending || !!result}
            >
              <span
                className="smoothie-dispenser-swatch"
                style={{ background: ingredient.color }}
                aria-hidden="true"
              />
              {ingredient.label}
            </button>
          ))}
        </div>

        <div className="smoothie-pitcher">
          <canvas
            ref={canvasRef}
            width={160}
            height={160}
            className="smoothie-canvas"
            aria-hidden="true"
          />
          <p aria-live="polite">
            Pitcher:{" "}
            {pitcher.length === 0 ? "empty" : `${pitcher.length} scoops`}
          </p>
        </div>

        <div className="smoothie-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={resetPitcher}
            disabled={blending || pitcher.length === 0}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={startBlend}
            disabled={blending || pitcher.length === 0 || !!result}
          >
            {blending ? "Blending…" : "Blend"}
          </button>
        </div>

        {result && (
          <div className="smoothie-result" role="status">
            <div className="smoothie-stars">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  size={20}
                  fill={n <= result.stars ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p>
              {result.accuracy}% match &mdash; serve for{" "}
              <Coin amount={result.coins} />
            </p>
            <button
              ref={serveRef}
              type="button"
              className="button-primary"
              onClick={serveAndContinue}
            >
              Serve &amp; next order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
