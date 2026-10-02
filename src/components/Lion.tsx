import type { LionColor } from "../game";

export function Lion({
  color = "gold",
  accessory = "none",
  className = "",
}: {
  color?: LionColor;
  accessory?: string;
  className?: string;
}) {
  return (
    <span className={`lion lion-${color} ${className}`} aria-hidden="true">
      <img
        src="/assets/lion.webp"
        alt=""
        draggable={false}
        width="1024"
        height="1024"
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
