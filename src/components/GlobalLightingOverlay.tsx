import {
  getLightingProfile,
  generateStars,
  generateFireflies,
  type TimeOfDay,
} from "../utils/environmentalLighting.ts";

const OVERLAY_STARS = generateStars(50);
const OVERLAY_FIREFLIES = generateFireflies(14);

export function GlobalLightingOverlay({
  timeOfDay,
  reducedMotion,
}: {
  timeOfDay: TimeOfDay;
  reducedMotion: boolean;
}) {
  const profile = getLightingProfile(timeOfDay);
  const dimOpacity = 1 - profile.ambientBrightness;
  return (
    <div
      className="global-lighting-overlay"
      aria-hidden="true"
      data-time-of-day={timeOfDay}
    >
      {dimOpacity > 0 && (
        <div className="global-lighting-dim" style={{ opacity: dimOpacity }} />
      )}
      {profile.overlayOpacity > 0 && (
        <div
          className="global-lighting-tint"
          style={{
            backgroundColor: profile.overlayColor,
            opacity: profile.overlayOpacity,
          }}
        />
      )}
      {!profile.showStars && (
        <div
          className="global-lighting-sun-glow"
          style={{
            left: `${profile.sunPosition.x}%`,
            top: `${profile.sunPosition.y}%`,
          }}
        />
      )}
      {profile.showStars &&
        OVERLAY_STARS.map((star, i) => (
          <span
            key={`star-${i}`}
            className={
              reducedMotion
                ? "global-lighting-star"
                : "global-lighting-star lighting-star-twinkle"
            }
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
              opacity: star.opacity,
              animationDelay: reducedMotion ? undefined : `${(i % 10) * 0.3}s`,
            }}
          />
        ))}
      {profile.showFireflies &&
        OVERLAY_FIREFLIES.map((fly, i) => (
          <span
            key={`firefly-${i}`}
            className={
              reducedMotion
                ? "global-lighting-firefly"
                : "global-lighting-firefly lighting-firefly-drift"
            }
            style={{
              left: `${fly.x}%`,
              top: `${fly.y}%`,
              animationDelay: reducedMotion ? undefined : `${fly.delay}s`,
            }}
          />
        ))}
    </div>
  );
}
