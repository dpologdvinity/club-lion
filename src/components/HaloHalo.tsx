import { useState } from "react";
import { Check, Palette, Play, Star, Undo2 } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import "./haloHalo.css";
import { speak } from "../utils/speech.ts";
import {
  HALO_INGREDIENTS,
  MAX_LAYERS,
  pickHaloOrder,
  scoreHaloHalo,
  type HaloIngredient,
  type HaloOrder,
} from "../utils/haloHalo.ts";

const INGREDIENT = Object.fromEntries(
  HALO_INGREDIENTS.map((item) => [item.id, item]),
);

/** Confetti on a fixed grid, so it never shifts between renders. */
const CONFETTI = Array.from({ length: 16 }, (_, index) => ({
  left: (index * 37) % 100,
  top: (index * 53) % 70,
  delay: (index % 6) * 90,
  color: HALO_INGREDIENTS[index % HALO_INGREDIENTS.length].color,
}));

/** A tall glass with layers stacked bottom-first. */
function Glass({
  layers,
  label,
  small = false,
}: {
  layers: readonly HaloIngredient[];
  label: string;
  small?: boolean;
}) {
  const layerHeight = 200 / MAX_LAYERS;
  return (
    <svg
      className={small ? "halo-glass halo-glass-small" : "halo-glass"}
      viewBox="0 0 160 250"
      role="img"
      aria-label={label}
    >
      <clipPath id={small ? "halo-cup-small" : "halo-cup"}>
        <path d="M20 20H140L126 230Q80 244 34 230Z" />
      </clipPath>
      <g clipPath={`url(#${small ? "halo-cup-small" : "halo-cup"})`}>
        {layers.map((layer, index) => (
          <g key={index} className={small ? undefined : "halo-layer-drop"}>
            <rect
              x="0"
              y={230 - (index + 1) * layerHeight}
              width="160"
              height={layerHeight + 1}
              fill={INGREDIENT[layer].color}
            />
            <text
              x="80"
              y={230 - index * layerHeight - layerHeight / 2 + 9}
              fontSize="24"
              textAnchor="middle"
            >
              {INGREDIENT[layer].emoji}
            </text>
          </g>
        ))}
      </g>
      <path
        d="M20 20H140L126 230Q80 244 34 230Z"
        fill="#ffffff22"
        stroke="#ffffff"
        strokeWidth="6"
      />
      <path d="M44 34L40 200" stroke="#ffffff99" strokeWidth="6" />
    </svg>
  );
}

/** Lola's halo-halo stand: copy the picture order or build your own cup. Every cup gets stars. */
export function HaloHalo({
  onServe,
}: {
  /** Called once for each served cup. */
  onServe: (layers: HaloIngredient[]) => void;
}) {
  const [order, setOrder] = useState<HaloOrder | null>(() =>
    pickHaloOrder(null),
  );
  const [cup, setCup] = useState<HaloIngredient[]>([]);
  const [stars, setStars] = useState<1 | 2 | 3 | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const add = (id: HaloIngredient) => {
    if (stars || cup.length >= MAX_LAYERS) {
      playCuteSound("boing");
      return;
    }
    playCuteSound("pop");
    setCup([...cup, id]);
    setAnnouncement(`${INGREDIENT[id].label} in the glass.`);
  };

  const serve = () => {
    if (stars || cup.length === 0) return;
    const score = scoreHaloHalo(order, cup);
    setStars(score);
    playCuteSound("yay");
    onServe(cup);
    const thanks = "Masarap! Salamat!";
    setAnnouncement(`${thanks} ${score} stars.`);
    speak(thanks);
  };

  const next = (freePlay: boolean) => {
    setOrder(freePlay ? null : pickHaloOrder(order?.id ?? null));
    setCup([]);
    setStars(null);
  };

  return (
    <div className="halo-game">
      <div className="halo-order">
        {order ? (
          <>
            <span className="halo-order-who" aria-hidden="true">
              👵
            </span>
            <Glass
              small
              layers={order.layers}
              label={`Lola wants: ${order.layers
                .map((layer) => INGREDIENT[layer].label)
                .join(", ")}`}
            />
          </>
        ) : (
          <span className="halo-order-free">🎨 Your own way!</span>
        )}
        <button
          type="button"
          className="halo-mode"
          aria-pressed={order === null}
          aria-label="Make my own"
          onClick={() => next(order !== null)}
        >
          <Palette size={28} aria-hidden="true" />
        </button>
      </div>
      <div className="halo-stage">
        <Glass layers={cup} label={`Your glass has ${cup.length} layers`} />
        {stars && (
          <div className="halo-overlay">
            <div className="halo-confetti-field" aria-hidden="true">
              {CONFETTI.map((piece, index) => (
                <span
                  key={index}
                  className="halo-confetti"
                  style={{
                    left: `${piece.left}%`,
                    top: `${piece.top}%`,
                    animationDelay: `${piece.delay}ms`,
                    background: piece.color,
                  }}
                />
              ))}
            </div>
            <p className="halo-thanks">Masarap! Salamat!</p>
            <p
              className="halo-stars"
              role="img"
              aria-label={`${stars} stars`}
              data-stars={stars}
            >
              {Array.from({ length: 3 }, (_, index) => (
                <Star
                  key={index}
                  size={40}
                  aria-hidden="true"
                  fill={index < stars ? "currentColor" : "none"}
                />
              ))}
            </p>
            <button
              type="button"
              className="halo-next"
              autoFocus
              aria-label="Next cup"
              onClick={() => next(order === null)}
            >
              <Play size={30} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div className="halo-actions">
        <button
          type="button"
          className="halo-undo"
          aria-label="Take one off"
          disabled={cup.length === 0 || stars !== null}
          onClick={() => setCup(cup.slice(0, -1))}
        >
          <Undo2 size={28} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="halo-serve"
          aria-label="Serve"
          disabled={cup.length === 0 || stars !== null}
          onClick={serve}
        >
          <Check size={34} aria-hidden="true" />
        </button>
      </div>
      <div className="halo-tray" role="group" aria-label="Halo-halo treats">
        {HALO_INGREDIENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="halo-ingredient"
            style={{ background: item.color }}
            aria-label={`Add ${item.label}`}
            onClick={() => add(item.id)}
          >
            <span aria-hidden="true">{item.emoji}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
