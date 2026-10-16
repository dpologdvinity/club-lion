import type { LionColor } from "../game";

const LION_SRC = `${import.meta.env.BASE_URL}assets/lion-chibi-living-cub.webp`;

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
      <img src={LION_SRC} alt="" draggable={false} width="200" height="200" />
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
