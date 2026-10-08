import type { LionColor } from "../game";

export type LionVariant = "chibi" | "bratz_cute" | "bratz_sassy";

const LION_SRC_MAP: Record<LionVariant, string> = {
  chibi: "/assets/lion-chibi-living.svg",
  bratz_cute: "/assets/lion-bratz-cute.svg",
  bratz_sassy: "/assets/lion-bratz-sassy.svg",
};

export function Lion({
  color = "gold",
  accessory = "none",
  variant = "chibi",
  className = "",
}: {
  color?: LionColor;
  accessory?: string;
  variant?: LionVariant;
  className?: string;
}) {
  const src = LION_SRC_MAP[variant] || LION_SRC_MAP.chibi;
  return (
    <span className={`lion lion-${color} lion-variant-${variant} ${className}`} aria-hidden="true">
      <img
        src={src}
        alt=""
        draggable={false}
        width="200"
        height="200"
      />
      {accessory !== "none" && (
        <span className={`lion-accessory accessory-${accessory}`}>
          {accessory === "flower" ? (
            "🌼"
          ) : accessory === "hat" ? (
            <>
              <i />
              <b />
            </>
          ) : accessory === "glasses" ? (
            <>
              <i />
              <i />
            </>
          ) : (
            <>
              <i />
              <b />
            </>
          )}
        </span>
      )}
    </span>
  );
}

export function Coin({ amount }: { amount?: number }) {
  return (
    <span className="coin-label">
      <span className="coin-icon" aria-hidden="true">
        ✦
      </span>
      {amount !== undefined && <span>{amount.toLocaleString("en-US")}</span>}
    </span>
  );
}
