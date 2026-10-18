import { useEffect, useRef } from "react";

/**
 * Calls `tick(ms, dt)` every animation frame while `active`: `ms` since the
 * loop started, `dt` seconds since the last frame (capped so a background
 * tab never jumps). The latest `tick` is always used.
 */
export function useGameLoop(
  active: boolean,
  tick: (ms: number, dt: number) => void,
): void {
  const tickRef = useRef(tick);
  tickRef.current = tick;
  useEffect(() => {
    if (!active) return;
    const started = performance.now();
    let last = started;
    let frame = 0;
    const step = () => {
      const now = performance.now();
      tickRef.current(now - started, Math.min(0.05, (now - last) / 1000));
      last = now;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
