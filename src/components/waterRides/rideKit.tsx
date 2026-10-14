import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { Avatar } from "../Avatar";
import { PetCompanion } from "../PetCompanion";
import type { AvatarLook, PetState } from "../../types/world.ts";

/**
 * Shared pieces for the Splash Oasis rides. Scenes draw in a 1600×900 world
 * that covers the screen; HTML layers place themselves in the same units with
 * `cqw` (1 world unit = 1/16 cqw because the world keeps a 16:9 box).
 */
export const WORLD_W = 1600;
export const WORLD_H = 900;
export const u = (units: number) => `${units / 16}cqw`;

export type RideSceneProps = {
  look: AvatarLook;
  pet?: PetState;
  active: boolean;
  gentle: boolean;
  onDone: () => void;
  announce: (message: string) => void;
};

/** One rAF loop per ride, paused while the tab is hidden and stopped on unmount. */
export function useRideClock(
  active: boolean,
  frame: (t: number, dt: number) => void,
) {
  const frameRef = useRef(frame);
  useEffect(() => {
    frameRef.current = frame;
  });
  useEffect(() => {
    if (!active) return;
    let id = 0;
    let last: number | null = null;
    let t = 0;
    const tick = (now: number) => {
      const dt =
        last === null || document.hidden
          ? 0
          : Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      frameRef.current(t, dt);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active]);
}

type Splash = { id: number; x: number; y: number; size: number };

/** Short-lived splash bursts in world units; the oldest drop off past `max`. */
export function useSplashes(gentle: boolean, max = 12) {
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const next = useRef(0);
  const add = useCallback(
    (x: number, y: number, size = 1) =>
      setSplashes((list) => [
        ...list.slice(-(max - 1)),
        { id: next.current++, x, y, size },
      ]),
    [max],
  );
  const layer = (
    <div className="wr-splashes" aria-hidden="true">
      {splashes.map((s) => (
        <span
          key={s.id}
          className={`wr-splash${gentle ? " is-gentle" : ""}`}
          style={{ left: u(s.x), top: u(s.y), "--size": s.size }}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget)
              setSplashes((list) => list.filter((item) => item.id !== s.id));
          }}
        >
          <b />
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      ))}
    </div>
  );
  return [layer, add] as const;
}

/** The cover-fit 16:9 world. Taps report world coordinates. */
export function RideWorld({
  children,
  onTap,
  worldRef,
  className = "",
}: {
  children: ReactNode;
  onTap?: (x: number, y: number, target: EventTarget) => void;
  worldRef?: Ref<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div
      ref={worldRef}
      className={`wr-world ${className}`}
      onPointerDown={(event) => {
        if (!onTap) return;
        const box = event.currentTarget.getBoundingClientRect();
        onTap(
          ((event.clientX - box.left) / box.width) * WORLD_W,
          ((event.clientY - box.top) / box.height) * WORLD_H,
          event.target,
        );
      }}
    >
      {children}
    </div>
  );
}

const TUBE_COLORS = {
  sunny: ["#ffc93c", "#e0901a"],
  grape: ["#a66be0", "#6e3fa8"],
  coral: ["#ff6f59", "#c2412f"],
  mint: ["#4fd1b5", "#1f9479"],
} as const;
export type TubeColor = keyof typeof TUBE_COLORS;

function TubeRing({ color, front }: { color: TubeColor; front?: boolean }) {
  const [fill, dark] = TUBE_COLORS[color];
  // The front half is drawn over the rider's lap so they sit inside the ring.
  return (
    <svg
      className={front ? "wr-tube-front" : "wr-tube-back"}
      viewBox="0 0 300 120"
      aria-hidden="true"
    >
      {front ? (
        <>
          <path
            d="M6 56A144 50 0 0 0 294 56L224 56A74 22 0 0 1 76 56Z"
            fill={fill}
            stroke={dark}
            strokeWidth="5"
          />
          <path
            d="M40 80Q150 112 260 80"
            fill="none"
            stroke="#fff"
            strokeWidth="9"
            strokeLinecap="round"
            opacity=".55"
          />
          <path
            d="M70 74L84 98M150 84V108M230 74L216 98"
            stroke={dark}
            strokeWidth="6"
            opacity=".35"
          />
        </>
      ) : (
        <path
          d="M6 56A144 50 0 0 1 294 56L224 56A74 22 0 0 0 76 56Z"
          fill={dark}
          stroke={dark}
          strokeWidth="5"
        />
      )}
    </svg>
  );
}

/** Avatar sitting in an inner tube, with the pet floating alongside. */
export function TubeRider({
  look,
  pet,
  color,
  action = "sit",
  riderRef,
  className = "",
}: {
  look: AvatarLook;
  pet?: PetState;
  color: TubeColor;
  action?: string;
  riderRef?: Ref<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div ref={riderRef} className={`wr-rider ${className}`} aria-hidden="true">
      <div className="wr-rider-body">
        <TubeRing color={color} />
        {/* Clipped at the waist: the rider sits down inside the ring. */}
        <span className="wr-avatar-clip">
          <Avatar look={look} action={action} className="wr-avatar" />
        </span>
        <TubeRing color={color} front />
        {pet && (
          <span className="wr-pet">
            <PetCompanion pet={pet} isTrotting={false} />
          </span>
        )}
      </div>
    </div>
  );
}

export function RideButton({
  label,
  onPress,
  children,
  className = "",
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`wr-button ${className}`}
      aria-label={label}
      title={label}
      onClick={onPress}
    >
      {children}
    </button>
  );
}

/** Sets an element's transform in world units without a React render. */
export function place(
  el: HTMLElement | SVGElement | null,
  x: number,
  y: number,
  extra = "",
) {
  if (el) el.style.transform = `translate3d(${u(x)}, ${u(y)}, 0) ${extra}`;
}
