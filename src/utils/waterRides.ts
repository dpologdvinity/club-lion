import {
  calculateBucketCycle,
  calculateWaveOffset,
  type BucketState,
} from "./waterparkPhysics.ts";

/** Timelines for the four Splash Oasis rides. Every value is a pure function of ride time. */
export type WaterRideId = "slides" | "river" | "wave" | "bucket";

export const WATER_RIDE_SECONDS = {
  slides: 24,
  river: 36,
  wave: 30,
  bucket: 28,
} as const satisfies Record<WaterRideId, number>;

/** First finish of each ride unlocks its stamp; stamps unlock once. */
export const WATER_RIDE_STAMPS = {
  slides: "speed_slider",
  river: "lazy_floater",
  wave: "wave_pool",
  bucket: "bucket_drench",
} as const satisfies Record<WaterRideId, string>;

export type SlideSection = "launch" | "tunnel" | "daylight" | "drop" | "splash";

const SLIDE_SECTIONS: readonly [number, SlideSection][] = [
  [2.5, "launch"],
  [6.5, "tunnel"],
  [10, "daylight"],
  [14, "tunnel"],
  [17.5, "daylight"],
  [19.5, "drop"],
  [Infinity, "splash"],
];

/** Which part of the tube the rider is in, how hard it twists (deg) and how fast it rushes (0..1.6). */
export function slideFrame(t: number): {
  section: SlideSection;
  twist: number;
  speed: number;
} {
  const section = SLIDE_SECTIONS.find(([until]) => t < until)?.[1] ?? "splash";
  if (section === "splash") return { section, twist: 0, speed: 0 };
  if (section === "drop") return { section, twist: 0, speed: 1.6 };
  const twist = Math.sin(t * 1.4) * 26 + Math.sin(t * 0.55) * 12;
  return section === "launch"
    ? { section, twist: twist * (t / 2.5), speed: 0.3 + (0.7 * t) / 2.5 }
    : { section, twist, speed: 1 };
}

/** The river strip scrolls under a rider who stays centred at RIVER_RIDER_X. */
export const RIVER_SPEED = 120;
export const RIVER_RIDER_X = 800;
export const RIVER_WATERFALL_X = 2700;
export const RIVER_CRITTERS = [
  { id: "parrot", x: 1150 },
  { id: "monkey", x: 1900 },
  { id: "turtle", x: 3350 },
  { id: "frog", x: 4050 },
  { id: "flamingo", x: 4700 },
] as const;
export type RiverCritterId = (typeof RIVER_CRITTERS)[number]["id"];

export function riverDistance(t: number): number {
  return Math.max(0, t) * RIVER_SPEED;
}

/** 1 when the rider floats straight under the waterfall curtain, fading to 0 at its edges. */
export function waterfallSoak(distance: number, halfWidth = 160): number {
  const offset = Math.abs(distance + RIVER_RIDER_X - RIVER_WATERFALL_X);
  return Math.max(0, 1 - offset / halfWidth);
}

/** Big waves roll in every BIG_WAVE_EVERY seconds, the first after a calm start. */
export const BIG_WAVE_FIRST = 6;
export const BIG_WAVE_EVERY = 10;
export const BIG_WAVE_SECONDS = 3.4;

/** 0 in calm water, rising smoothly to 1 at the top of a big wave. */
export function bigWaveBoost(t: number): number {
  if (t < BIG_WAVE_FIRST) return 0;
  const into = (t - BIG_WAVE_FIRST) % BIG_WAVE_EVERY;
  return into < BIG_WAVE_SECONDS
    ? Math.sin((Math.PI * into) / BIG_WAVE_SECONDS) ** 2
    : 0;
}

/** Height of the pool surface (positive is down, like SVG y) under x. */
export function waveSurface(t: number, x: number): number {
  return calculateWaveOffset(t * 1000, x, 3200, 16 + 74 * bigWaveBoost(t));
}

export const JUMP_SECONDS = 0.8;
export const JUMP_HEIGHT = 150;

/** Upward lift of a tap-jump `age` seconds after it started. */
export function jumpLift(age: number): number {
  if (age < 0 || age >= JUMP_SECONDS) return 0;
  const p = age / JUMP_SECONDS;
  return 4 * JUMP_HEIGHT * p * (1 - p);
}

export const BUCKET_CYCLE_MS = 12000;

export function bucketFrame(t: number): BucketState {
  return calculateBucketCycle(t * 1000, BUCKET_CYCLE_MS);
}

/** True on the first frame of a tip, so the big splash plays once per dump. */
export function bucketDumpStarted(previousT: number, t: number): boolean {
  return !bucketFrame(previousT).isDumping && bucketFrame(t).isDumping;
}
