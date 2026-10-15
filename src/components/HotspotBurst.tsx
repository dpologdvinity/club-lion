import type { CSSProperties } from "react";

// Picture feedback for a room hotspot: emoji float up and fade, then World clears them.
export function HotspotBurst({
  x,
  y,
  emojis,
}: {
  x: number;
  y: number;
  emojis: string[];
}) {
  return (
    <div
      className="hotspot-burst"
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      {emojis.map((emoji, i) => {
        const style: CSSProperties = {
          translate: `${(i - (emojis.length - 1) / 2) * 34}px 0`,
          animationDelay: `${i * 90}ms`,
        };
        return (
          <span key={i} className="hotspot-burst-emoji" style={style}>
            {emoji}
          </span>
        );
      })}
    </div>
  );
}
