import { useEffect, useRef, useState } from "react";
import type { RoomObstacle } from "../rooms/types.ts";
import { playPropSound } from "../utils/interactiveProps.ts";
import type { Point } from "../utils/obstacles.ts";
import {
  isNearProp,
  isThrottled,
  obstacleCenter,
  PROP_COOLDOWN_MS,
  seatFor,
} from "../utils/worldProps.ts";
import "./WorldProp.css";

const LABELS: Record<NonNullable<RoomObstacle["prop"]>, string> = {
  fountain: "Splash the lion fountain",
  bench: "Sit on the bench",
  lamp: "Switch the lamppost light",
  bush: "Rustle the flower bush",
};

/**
 * A tappable piece of solid scenery. Tapping or walking near it plays a little
 * reaction: the fountain surges, the lamp glows, the bush rustles and sheds
 * butterflies, and the bench takes you to its seat.
 */
export function WorldProp({
  obstacle,
  unit,
  avatar,
  seated,
  soundOn,
  onSit,
}: {
  obstacle: RoomObstacle;
  unit: "px" | "%";
  avatar: Point;
  seated: boolean;
  soundOn: boolean;
  onSit: (seat: Point) => void;
}) {
  const kind = obstacle.prop ?? "bush";
  const center = obstacleCenter(obstacle);
  const [active, setActive] = useState(false);
  const [lit, setLit] = useState(false);
  // Starting next to a prop is not a walk-up, so it does not react on mount.
  const wasNear = useRef(isNearProp(avatar, obstacle));
  const lastReaction = useRef(-Infinity);
  const timer = useRef<number | null>(null);
  const audio = soundOn ? undefined : null;

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const react = (source: "tap" | "near") => {
    const now = performance.now();
    if (
      source === "near" &&
      isThrottled(lastReaction.current, now, PROP_COOLDOWN_MS)
    )
      return;
    lastReaction.current = now;
    if (kind === "lamp") {
      const next = source === "tap" ? !lit : true;
      setLit(next);
      playPropSound("lamp", audio);
      return;
    }
    if (kind === "bench") return;
    setActive(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(false), 1400);
    playPropSound(kind === "fountain" ? "splash" : "rustle", audio);
  };

  useEffect(() => {
    const near = isNearProp(avatar, obstacle);
    if (near && !wasNear.current) react("near");
    wasNear.current = near;
  }, [avatar.x, avatar.y]);

  const tap = () => {
    if (kind === "bench") {
      onSit(seatFor(obstacle));
      return;
    }
    react("tap");
  };

  const className = [
    "world-prop",
    `world-prop-${kind}`,
    active ? "is-active" : "",
    lit ? "is-lit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      style={{ left: `${center.x}${unit}`, top: `${center.y}${unit}` }}
      aria-label={LABELS[kind]}
      title={LABELS[kind]}
      onClick={tap}
    >
      {kind === "fountain" && (
        <>
          <span className="world-prop-jets" aria-hidden="true" />
          <span className="world-prop-sparkles" aria-hidden="true">
            <span>✨</span>
            <span>✨</span>
            <span>✨</span>
          </span>
        </>
      )}
      {kind === "lamp" && (
        <span className="world-prop-glow" aria-hidden="true" />
      )}
      {kind === "bush" && (
        <span className="world-prop-butterflies" aria-hidden="true">
          <span>🦋</span>
          <span>🦋</span>
        </span>
      )}
      {kind === "bench" && seated && (
        <span className="world-prop-hearts" aria-hidden="true">
          <span>❤️</span>
          <span>❤️</span>
        </span>
      )}
    </button>
  );
}
