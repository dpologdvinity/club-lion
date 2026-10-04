export type TimeOfDay = "day" | "sunset" | "dusk" | "night";

export type LightingProfile = {
  time: TimeOfDay;
  overlayColor: string;
  overlayOpacity: number;
  sunPosition: { x: number; y: number };
  showStars: boolean;
  showFireflies: boolean;
  ambientBrightness: number;
};

const PROFILES: Record<TimeOfDay, LightingProfile> = {
  day: {
    time: "day",
    overlayColor: "transparent",
    overlayOpacity: 0,
    sunPosition: { x: 50, y: 15 },
    showStars: false,
    showFireflies: false,
    ambientBrightness: 1.0,
  },
  sunset: {
    time: "sunset",
    overlayColor: "#ff8c42",
    overlayOpacity: 0.25,
    sunPosition: { x: 80, y: 55 },
    showStars: false,
    showFireflies: false,
    ambientBrightness: 0.9,
  },
  dusk: {
    time: "dusk",
    overlayColor: "#4b2e83",
    overlayOpacity: 0.4,
    sunPosition: { x: 92, y: 80 },
    showStars: true,
    showFireflies: true,
    ambientBrightness: 0.75,
  },
  night: {
    time: "night",
    overlayColor: "#0b1a3a",
    overlayOpacity: 0.55,
    sunPosition: { x: 95, y: 95 },
    showStars: true,
    showFireflies: true,
    ambientBrightness: 0.65,
  },
};

export function getLightingProfile(time: TimeOfDay): LightingProfile {
  return PROFILES[time];
}

export function calculateTimeOfDayFromLocalTime(
  date: Date = new Date(),
): TimeOfDay {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 6 * 60 && minutes < 17 * 60) return "day";
  if (minutes >= 17 * 60 && minutes < 19.5 * 60) return "sunset";
  if (minutes >= 19.5 * 60 && minutes < 21.5 * 60) return "dusk";
  return "night";
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateStars(
  count: number,
  seed: number = 42,
): { x: number; y: number; size: number; opacity: number }[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: Math.round(random() * 1000) / 10,
    y: Math.round(random() * 600) / 10,
    size: Math.round((0.5 + random() * 1.5) * 100) / 100,
    opacity: Math.round((0.4 + random() * 0.6) * 100) / 100,
  }));
}
