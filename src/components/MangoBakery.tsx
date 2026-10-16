import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { CakeArt, ToppingIcon } from "./CakeArt";
import {
  CAKE_SHAPES,
  FROSTINGS,
  FROSTING_COLORS,
  SPONGES,
  SPONGE_COLORS,
  TOPPINGS,
  addTopping,
  autoSpot,
  newCake,
  orderAsCake,
  pickOrder,
  scoreCake,
  type Cake,
  type ToppingKind,
} from "../utils/bakery.ts";
import { playCuteSound } from "../utils/cuteSfx.ts";

const CUSTOMERS = ["🐻", "🐼", "🐰", "🦊", "🐨", "🐯", "🐷", "🐸"];
const SHAPE_NAMES = {
  round: "Round cake",
  heart: "Heart cake",
  star: "Star cake",
  tiers: "Tall tiered cake",
} as const;
const TOPPING_NAMES = {
  sprinkles: "Sprinkles",
  mango: "Mango slice",
  candle: "Candle",
  gummy: "Gummy bear",
  cherry: "Cherry",
  lion: "Lion topper",
} as const;

type Served = { stars: number } | null;
type Drag = { kind: ToppingKind; x: number; y: number; moved: boolean };

function describeOrder(cake: Cake) {
  const counts = TOPPINGS.map((kind) => {
    const n = cake.toppings.filter((t) => t.kind === kind).length;
    return n ? `${n} ${TOPPING_NAMES[kind].toLowerCase()}` : "";
  }).filter(Boolean);
  return `Order: ${SHAPE_NAMES[cake.shape].toLowerCase()}, ${cake.sponge} sponge, ${cake.frosting} frosting, ${counts.join(", ")}`;
}

export function MangoBakery({
  photos,
  onServe,
}: {
  photos: Cake[];
  onServe: (cake: Cake) => void;
}) {
  const [orderMode, setOrderMode] = useState(false);
  const [order, setOrder] = useState(() => pickOrder());
  const [cake, setCake] = useState<Cake>(newCake);
  const [blown, setBlown] = useState<number[]>([]);
  const [tool, setTool] = useState<ToppingKind>("sprinkles");
  const [served, setServed] = useState<Served>(null);
  const [customer, setCustomer] = useState(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [status, setStatus] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const servedRef = useRef(false);
  const dragRef = useRef<Drag | null>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const serveRef = useRef<HTMLButtonElement>(null);

  const hadServed = useRef(false);
  useEffect(() => {
    if (served) againRef.current?.focus();
    else if (hadServed.current) serveRef.current?.focus();
    hadServed.current = !!served;
  }, [served]);

  const litCandles = cake.toppings.flatMap((t, i) =>
    t.kind === "candle" && !blown.includes(i) ? [i] : [],
  );

  const place = (kind: ToppingKind, spot = autoSpot(cake.toppings.length)) => {
    if (served) return;
    setTool(kind);
    setCake((c) => addTopping(c, { kind, ...spot }));
    setStatus(`${TOPPING_NAMES[kind]} added`);
    playCuteSound("pop");
  };

  const stageSpot = (clientX: number, clientY: number) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return null;
    const x = ((clientX - box.left) / box.width) * 100;
    const y = ((clientY - box.top) / box.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return null;
    const clamp = (v: number, lo: number, hi: number) =>
      Math.round(Math.min(hi, Math.max(lo, v)));
    return { x: clamp(x, 6, 94), y: clamp(y, 22, 86) };
  };

  // Dragging from the tray: a ghost follows the finger and lands where it is let go.
  const startDrag = (kind: ToppingKind, event: PointerEvent) => {
    if (served || event.button !== 0) return;
    dragRef.current = {
      kind,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (e: globalThis.PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      const moved =
        current.moved ||
        Math.hypot(e.clientX - startX, e.clientY - startY) > 10;
      dragRef.current = { kind, x: e.clientX, y: e.clientY, moved };
      if (moved) setDrag(dragRef.current);
    };
    const up = (e: globalThis.PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const current = dragRef.current;
      setDrag(null);
      if (!current?.moved || e.type === "pointercancel") {
        dragRef.current = null;
        return;
      }
      const spot = stageSpot(e.clientX, e.clientY);
      if (spot) place(kind, spot);
      // Keep the moved flag until the click that follows this drag is swallowed.
      window.setTimeout(() => (dragRef.current = null), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const tapStage = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("button"))
      return;
    const spot = stageSpot(event.clientX, event.clientY);
    if (spot) place(tool, spot);
  };

  const blow = (indexes: number[]) => {
    if (!indexes.length) return;
    setBlown((b) => [...b, ...indexes]);
    setStatus(indexes.length > 1 ? "Candles blown out" : "Candle blown out");
    playCuteSound("whoosh");
    if (indexes.length === litCandles.length)
      window.setTimeout(() => playCuteSound("yay"), 350);
  };

  const pickBase = (next: Partial<Cake>) => {
    if (served) return;
    setCake((c) => ({ ...c, ...next }));
    playCuteSound("sparkle");
  };

  const serve = () => {
    if (servedRef.current) return;
    servedRef.current = true;
    const result = orderMode ? scoreCake(order, cake) : { stars: 3 };
    onServe(cake);
    setServed(result);
    setStatus(
      orderMode ? `Served! ${result.stars} of 3 stars` : "Served! Yummy!",
    );
    playCuteSound("yay");
  };

  const again = () => {
    servedRef.current = false;
    setServed(null);
    setCake(newCake());
    setBlown([]);
    setOrder((o) => {
      // A few tries for a different order; a repeat is fine if luck insists.
      let next = pickOrder();
      for (let i = 0; i < 4 && JSON.stringify(next) === JSON.stringify(o); i++)
        next = pickOrder();
      return next;
    });
    setCustomer((c) => (c + 1) % CUSTOMERS.length);
    setStatus("");
  };

  const switchMode = (next: boolean) => {
    if (next === orderMode || served) return;
    setOrderMode(next);
    playCuteSound("sparkle");
  };

  return (
    <div className={`bakery ${served ? "is-served" : ""}`}>
      <div className="bakery-top">
        <h3 className="bakery-title">
          <span aria-hidden="true">🥭🎂</span> Mango Bakery
        </h3>
        <div className="bakery-customer">
          <span className="bakery-animal" role="img" aria-label="Your customer">
            {CUSTOMERS[customer]}
          </span>
          <div className="bakery-bubble">
            {served ? (
              <span className="bakery-reaction" aria-hidden="true">
                {orderMode ? "⭐".repeat(served.stars) : "😋"}
              </span>
            ) : orderMode ? (
              <div
                className="bakery-order"
                role="img"
                aria-label={describeOrder(orderAsCake(order))}
              >
                <CakeArt cake={orderAsCake(order)} className="cake-still" />
              </div>
            ) : (
              <span className="bakery-reaction" aria-hidden="true">
                🎂❓
              </span>
            )}
          </div>
          {served && (
            <div className="bakery-hearts" aria-hidden="true">
              {["💖", "💛", "💕", "🧡", "💗"].map((h, i) => (
                <span key={i} style={{ "--i": i }}>
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bakery-modes" role="group" aria-label="Bakery mode">
          <button
            type="button"
            aria-pressed={!orderMode}
            aria-label="Free decorating"
            onClick={() => switchMode(false)}
          >
            <span aria-hidden="true">🎨</span>
          </button>
          <button
            type="button"
            aria-pressed={orderMode}
            aria-label="Picture orders with stars"
            onClick={() => switchMode(true)}
          >
            <span aria-hidden="true">📋⭐</span>
          </button>
        </div>
      </div>

      <div className="bakery-main">
        <div className="bakery-counter">
          <div
            ref={stageRef}
            className="bakery-stage"
            onClick={tapStage}
            data-testid="cake-stage"
          >
            <CakeArt cake={cake} blown={blown} className="bakery-cake" />
            {litCandles.map((i) => (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                className="bakery-flame"
                aria-label="Blow out candle"
                style={{
                  left: `${cake.toppings[i].x}%`,
                  top: `${cake.toppings[i].y - 16}%`,
                }}
                onClick={() => blow([i])}
              />
            ))}
          </div>

          <div className="bakery-actions">
            <button
              type="button"
              className="bakery-round-button"
              aria-label="Undo last topping"
              disabled={!!served || cake.toppings.length === 0}
              onClick={() =>
                setCake((c) => ({ ...c, toppings: c.toppings.slice(0, -1) }))
              }
            >
              <span aria-hidden="true">↩️</span>
            </button>
            <button
              type="button"
              className="bakery-round-button"
              aria-label="Clear all toppings"
              disabled={!!served || cake.toppings.length === 0}
              onClick={() => {
                setCake((c) => ({ ...c, toppings: [] }));
                setBlown([]);
              }}
            >
              <span aria-hidden="true">🧽</span>
            </button>
            {litCandles.length > 0 && !served && (
              <button
                type="button"
                className="bakery-round-button bakery-blow"
                aria-label="Blow out the candles"
                onClick={() => blow(litCandles)}
              >
                <span aria-hidden="true">🌬️</span>
              </button>
            )}
            {served ? (
              <>
                <button
                  ref={againRef}
                  type="button"
                  className="bakery-serve"
                  aria-label="Bake another cake"
                  onClick={again}
                >
                  <span aria-hidden="true">🔄🎂</span>
                </button>
              </>
            ) : (
              <button
                ref={serveRef}
                type="button"
                className="bakery-serve"
                aria-label="Serve the cake"
                onClick={serve}
              >
                <span aria-hidden="true">🍽️✨</span>
              </button>
            )}
          </div>
        </div>

        <div className="bakery-tools">
          <div className="bakery-row" role="group" aria-label="Cake shape">
            {CAKE_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                className="bakery-option"
                aria-pressed={cake.shape === shape}
                aria-label={SHAPE_NAMES[shape]}
                disabled={!!served}
                onClick={() => pickBase({ shape })}
              >
                <CakeArt
                  cake={{ ...cake, shape, toppings: [] }}
                  className="cake-still"
                />
              </button>
            ))}
          </div>
          <div className="bakery-row" role="group" aria-label="Sponge">
            {SPONGES.map((sponge) => (
              <button
                key={sponge}
                type="button"
                className="bakery-option bakery-swatch"
                aria-pressed={cake.sponge === sponge}
                aria-label={`${sponge} sponge`}
                disabled={!!served}
                onClick={() => pickBase({ sponge })}
              >
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <path
                    d="M6 14V28A14 5 0 0 0 34 28V14Z"
                    fill={SPONGE_COLORS[sponge]}
                  />
                  <path
                    d="M6 21A14 5 0 0 0 34 21"
                    fill="none"
                    stroke="#fff6e6"
                    strokeWidth="3"
                  />
                  <ellipse
                    cx="20"
                    cy="14"
                    rx="14"
                    ry="5"
                    fill={SPONGE_COLORS[sponge]}
                    stroke="#00000026"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            ))}
          </div>
          <div className="bakery-row" role="group" aria-label="Frosting">
            {FROSTINGS.map((frosting) => (
              <button
                key={frosting}
                type="button"
                className="bakery-option bakery-swatch"
                aria-pressed={cake.frosting === frosting}
                aria-label={`${frosting} frosting`}
                disabled={!!served}
                onClick={() => pickBase({ frosting })}
              >
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <path
                    d="M5 20Q5 8 20 8Q35 8 35 20V23Q32 28 30 23Q28 32 25 23Q22 27 19 23Q16 33 12 23Q9 28 5 23Z"
                    fill={FROSTING_COLORS[frosting]}
                    stroke="#00000026"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 15Q15 11 21 11"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity=".6"
                  />
                </svg>
              </button>
            ))}
          </div>
          <div
            className="bakery-row bakery-tray"
            role="group"
            aria-label="Toppings"
          >
            {TOPPINGS.map((kind) => (
              <button
                key={kind}
                type="button"
                className={`bakery-option bakery-topping ${tool === kind ? "is-tool" : ""}`}
                aria-label={`Add ${TOPPING_NAMES[kind].toLowerCase()}`}
                disabled={!!served}
                onPointerDown={(e) => startDrag(kind, e)}
                onClick={() => {
                  if (!dragRef.current?.moved) place(kind);
                }}
              >
                <ToppingIcon kind={kind} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="bakery-photos">
          <span aria-hidden="true">📸</span>
          <ul aria-label="Cake photos">
            {[...photos].reverse().map((photo, i) => (
              <li key={photos.length - i}>
                <div role="img" aria-label={`Cake photo ${i + 1}`}>
                  <CakeArt cake={photo} className="cake-still" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {drag?.moved && (
        <div
          className="bakery-ghost"
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          <ToppingIcon kind={drag.kind} />
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
