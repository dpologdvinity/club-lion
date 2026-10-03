import { useEffect, useEffectEvent, useRef, type JSX } from "react";
import { computeArcTrajectory, type Point } from "../utils/ballistics.ts";

/** Coordinates are CSS pixels relative to the positioned parent. Remount for a repeat toss. */
export function MangoToss({
  origin,
  target,
  onImpact,
}: {
  origin: Point;
  target: Point;
  onImpact: (hitPoint: Point) => void;
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const impact = useEffectEvent((point: Point) => onImpact(point));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const flightMs = reducedMotion ? 0 : 700;
    const splashMs = 400;
    const started = performance.now();
    let frame = 0;
    let impacted = false;
    let cancelled = false;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context?.setTransform(scale, 0, 0, scale, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - started;
      context?.clearRect(0, 0, width, height);

      if (elapsed < flightMs) {
        const progress = elapsed / flightMs;
        const point = computeArcTrajectory(
          origin.x,
          origin.y,
          target.x,
          target.y,
          progress,
        );
        if (context) {
          context.save();
          context.translate(point.x, point.y);
          context.rotate(progress * Math.PI * 2);
          context.fillStyle = "#ee964c";
          context.beginPath();
          context.ellipse(0, 0, 10, 14, -0.4, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#294b3c";
          context.beginPath();
          context.ellipse(5, -13, 7, 3, -0.5, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }
      } else {
        if (!impacted) {
          impacted = true;
          impact({ x: target.x, y: target.y });
        }
        const progress = Math.min((elapsed - flightMs) / splashMs, 1);
        if (context && progress < 1) {
          context.save();
          context.globalAlpha = 1 - progress;
          context.fillStyle = "#ee964c";
          for (let index = 0; index < 8; index++) {
            const angle = (index * Math.PI * 2) / 8;
            const radius = reducedMotion ? 10 : 6 + 32 * progress;
            context.beginPath();
            context.arc(
              target.x + Math.cos(angle) * radius,
              target.y +
                Math.sin(angle) * radius +
                (reducedMotion ? 0 : 18 * progress * progress),
              4 * (1 - progress),
              0,
              Math.PI * 2,
            );
            context.fill();
          }
          context.restore();
        }
        if (progress === 1) return;
      }
      if (!cancelled) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      context?.clearRect(0, 0, width, height);
    };
  }, [origin.x, origin.y, target.x, target.y]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
