import { memo, type ReactNode } from "react";
import {
  FROSTING_COLORS,
  SPONGE_COLORS,
  type Cake,
  type CakeShape,
  type PlacedTopping,
} from "../utils/bakery.ts";

type Tier = { cy: number; rx: number; ry: number; h: number };

const SINGLE: Tier[] = [{ cy: 46, rx: 36, ry: 14, h: 28 }];
const TIERS: Tier[] = [
  { cy: 58, rx: 38, ry: 13, h: 18 },
  { cy: 42, rx: 27, ry: 9.5, h: 16 },
  { cy: 27, rx: 17, ry: 6.5, h: 15 },
];

/** Unit outline of the top face, x and y in -1..1, sampled clockwise. */
function unitOutline(shape: CakeShape): [number, number][] {
  return Array.from({ length: 48 }, (_, i) => {
    const t = (i / 48) * Math.PI * 2;
    if (shape === "heart") {
      const x = 16 * Math.sin(t) ** 3;
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);
      return [x / 17, -(y + 2.5) / 15];
    }
    if (shape === "star") {
      const r = 0.6 + 0.4 * Math.cos(t * 5);
      return [Math.sin(t) * r, -Math.cos(t) * r];
    }
    return [Math.sin(t), -Math.cos(t)];
  });
}

const path = (points: [number, number][], tier: Tier, dy = 0) =>
  `M${points
    .map(
      ([x, y]) =>
        `${(50 + x * tier.rx).toFixed(2)} ${(tier.cy + dy + y * tier.ry).toFixed(2)}`,
    )
    .join("L")}Z`;

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.max(0, Math.min(255, ((n >> shift) & 255) + amount));
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
}

const SPRINKLES = [
  [-4, -1, 20],
  [-1.5, -3, -40],
  [2, -1.5, 60],
  [4.5, 0.5, -10],
  [0.5, 1.5, 80],
  [-3, 2, 35],
  [3, 3, -60],
  [-0.5, -0.2, 5],
];
const SPRINKLE_COLORS = [
  "#ff5fa2",
  "#4fc3f7",
  "#ffd23f",
  "#7bd389",
  "#b388ff",
  "#ff8a3d",
];
const GUMMY_COLORS = ["#ff5d73", "#4cc96a", "#ffc93a", "#ff9a3c", "#a77bff"];
const CANDLE_COLORS = ["#7fd1ff", "#ff9ccf", "#b6f08a", "#ffd166"];

function Topping({
  topping,
  index,
  lit,
}: {
  topping: PlacedTopping;
  index: number;
  lit: boolean;
}) {
  let art: ReactNode;
  switch (topping.kind) {
    case "sprinkles":
      art = SPRINKLES.map(([x, y, angle], i) => (
        <rect
          key={i}
          x={x - 1.3}
          y={y - 0.45}
          width="2.6"
          height="0.9"
          rx="0.45"
          fill={SPRINKLE_COLORS[(i + index) % SPRINKLE_COLORS.length]}
          transform={`rotate(${angle} ${x} ${y})`}
        />
      ));
      break;
    case "mango":
      art = (
        <g transform="scale(1.3)">
          <path
            d="M-5 0Q0-8 5 0Q0-3-5 0Z"
            fill="#ffb627"
            stroke="#ef8a00"
            strokeWidth=".5"
          />
          <path
            d="M-3.4-1.2Q0-5.6 3.4-1.2"
            fill="none"
            stroke="#ffe08a"
            strokeWidth=".7"
          />
          <path
            d="M-5 0Q0-3 5 0"
            fill="none"
            stroke="#86b33a"
            strokeWidth=".9"
          />
        </g>
      );
      break;
    case "candle":
      art = (
        <>
          <rect
            x="-1.5"
            y="-12"
            width="3"
            height="12"
            rx=".7"
            fill={CANDLE_COLORS[index % CANDLE_COLORS.length]}
          />
          {[-10, -7, -4].map((y) => (
            <path
              key={y}
              d={`M-1.5 ${y + 1.2}L1.5 ${y - 0.6}`}
              stroke="#fff"
              strokeWidth=".8"
              opacity=".75"
            />
          ))}
          <path d="M0-12V-13.6" stroke="#4a3426" strokeWidth=".5" />
          {lit ? (
            <g className="cake-flame">
              <circle cy="-16" r="4.6" fill="#ffd54f" opacity=".3" />
              <path d="M0-20Q2.6-16 0-13.4Q-2.6-16 0-20Z" fill="#ff9f1a" />
              <path
                d="M0-17.8Q1.2-15.6 0-14.2Q-1.2-15.6 0-17.8Z"
                fill="#fff3a0"
              />
            </g>
          ) : (
            <g className="cake-smoke" fill="#cfcfd6">
              <circle cy="-16" r="1.4" />
              <circle cx="1.4" cy="-19" r="1.8" />
              <circle cx="-0.6" cy="-22.5" r="2.1" />
            </g>
          )}
        </>
      );
      break;
    case "gummy": {
      const color = GUMMY_COLORS[index % GUMMY_COLORS.length];
      art = (
        <g
          fill={color}
          stroke={shade(color, -60)}
          strokeWidth=".35"
          opacity=".92"
        >
          <ellipse cy="-2.6" rx="2.9" ry="3.1" />
          <circle cy="-7" r="2.3" />
          <circle cx="-1.7" cy="-8.8" r=".9" />
          <circle cx="1.7" cy="-8.8" r=".9" />
          <circle cx="-2.7" cy="-3.6" r=".9" />
          <circle cx="2.7" cy="-3.6" r=".9" />
          <ellipse
            cx="-.8"
            cy="-7.6"
            rx=".5"
            ry=".7"
            fill="#fff"
            stroke="none"
            opacity=".7"
          />
        </g>
      );
      break;
    }
    case "cherry":
      art = (
        <>
          <path
            d="M0-4.6Q.6-9 3.6-10.6"
            fill="none"
            stroke="#4e7d2a"
            strokeWidth=".8"
            strokeLinecap="round"
          />
          <circle cy="-2.6" r="3.2" fill="#e0263a" />
          <circle cx="-1.1" cy="-3.7" r=".9" fill="#fff" opacity=".75" />
        </>
      );
      break;
    case "lion":
      art = (
        <g transform="translate(0 -12)">
          <path d="M0 6V12" stroke="#c9a46a" strokeWidth="1" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={Math.sin((i / 12) * Math.PI * 2) * 5.4}
              cy={Math.cos((i / 12) * Math.PI * 2) * 5.4}
              r="2.6"
              fill={i % 2 ? "#e07b24" : "#f29a35"}
            />
          ))}
          <circle
            cx="-3.4"
            cy="-3.6"
            r="1.4"
            fill="#ffd27a"
            stroke="#c97a2a"
            strokeWidth=".4"
          />
          <circle
            cx="3.4"
            cy="-3.6"
            r="1.4"
            fill="#ffd27a"
            stroke="#c97a2a"
            strokeWidth=".4"
          />
          <circle r="4.6" fill="#ffd27a" />
          <circle cx="-1.6" cy="-.8" r=".65" fill="#3b2a1e" />
          <circle cx="1.6" cy="-.8" r=".65" fill="#3b2a1e" />
          <path d="M-.9 1H.9L0 2.1Z" fill="#c2566b" />
          <path
            d="M0 2.1Q-1 3.2-1.8 2.6M0 2.1Q1 3.2 1.8 2.6"
            fill="none"
            stroke="#3b2a1e"
            strokeWidth=".35"
          />
          <circle cx="-2.8" cy="1.2" r=".8" fill="#ff9aa2" opacity=".55" />
          <circle cx="2.8" cy="1.2" r=".8" fill="#ff9aa2" opacity=".55" />
        </g>
      );
      break;
  }
  return (
    <g transform={`translate(${topping.x} ${topping.y})`}>
      <g className="cake-topping">{art}</g>
    </g>
  );
}

function TierArt({
  tier,
  shape,
  sponge,
  frosting,
}: {
  tier: Tier;
  shape: CakeShape;
  sponge: string;
  frosting: string;
}) {
  const outline = unitOutline(shape);
  const steps = 12;
  // Drips hang from the front edge, at lengths that look hand-poured.
  const drips = outline.filter(([, y], i) => y > 0.05 && i % 3 === 0);
  return (
    <g>
      {Array.from({ length: steps + 1 }, (_, i) => {
        const dy = tier.h - (i * tier.h) / steps;
        return (
          <path
            key={i}
            d={path(outline, tier, dy)}
            fill={
              i === 0
                ? shade(sponge, -45)
                : i % 4 === 2
                  ? shade(sponge, -18)
                  : sponge
            }
          />
        );
      })}
      {[4, 3, 2, 1, 0].map((dy) => (
        <path
          key={dy}
          d={path(outline, tier, dy)}
          fill={dy === 4 ? shade(frosting, -22) : frosting}
        />
      ))}
      {drips.map(([x, y], i) => (
        <ellipse
          key={i}
          cx={50 + x * tier.rx}
          cy={tier.cy + y * tier.ry + 4 + ((i * 5) % 7) / 2}
          rx="2"
          ry={2.4 + ((i * 7) % 5) / 2}
          fill={frosting}
        />
      ))}
      <path d={path(outline, tier)} fill={frosting} />
      <path
        d={path(outline, {
          ...tier,
          rx: tier.rx * 0.78,
          ry: tier.ry * 0.62,
          cy: tier.cy - tier.ry * 0.12,
        })}
        fill="#fff"
        opacity=".22"
      />
    </g>
  );
}

/** Draws a whole cake in a 100×100 box; `blown` lists candle indexes that are out. */
export const CakeArt = memo(function CakeArt({
  cake,
  blown = [],
  className,
}: {
  cake: Cake;
  blown?: number[];
  className?: string;
}) {
  const tiers = cake.shape === "tiers" ? TIERS : SINGLE;
  const shape = cake.shape === "tiers" ? "round" : cake.shape;
  const sponge = SPONGE_COLORS[cake.sponge];
  const frosting = FROSTING_COLORS[cake.frosting];
  const sorted = cake.toppings
    .map((topping, index) => ({ topping, index }))
    .sort((a, b) => a.topping.y - b.topping.y);
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="50" cy="83" rx="47" ry="11" fill="#d9cfc0" />
      <ellipse
        cx="50"
        cy="81"
        rx="46"
        ry="10.5"
        fill="#fffaf2"
        stroke="#e7dccb"
        strokeWidth=".6"
      />
      <ellipse cx="50" cy="80" rx="36" ry="7" fill="#000" opacity=".08" />
      {tiers.map((tier, i) => (
        <TierArt
          key={i}
          tier={tier}
          shape={shape}
          sponge={sponge}
          frosting={frosting}
        />
      ))}
      {sorted.map(({ topping, index }) => (
        <Topping
          key={index}
          topping={topping}
          index={index}
          lit={topping.kind === "candle" && !blown.includes(index)}
        />
      ))}
    </svg>
  );
});

/** One topping on its own, for the tray buttons and the drag ghost. */
// Square frames that center each topping's art in its tray button.
const ICON_BOXES: Record<PlacedTopping["kind"], string> = {
  sprinkles: "-7 -7 14 14",
  mango: "-8 -9.5 16 16",
  candle: "-11 -21.5 22 22",
  gummy: "-6.5 -11.5 13 13",
  cherry: "-6.5 -12 13 13",
  lion: "-11 -21.5 22 22",
};

/** One topping on its own, for the tray buttons and the drag ghost. */
export function ToppingIcon({ kind }: { kind: PlacedTopping["kind"] }) {
  return (
    <svg viewBox={ICON_BOXES[kind]} aria-hidden="true" focusable="false">
      <Topping topping={{ kind, x: 0, y: 0 }} index={0} lit />
    </svg>
  );
}
