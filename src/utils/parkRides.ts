/**
 * Wonder Park ride timelines. Each ride is a fixed, fail-free loop; the
 * matching CSS keyframes in parkRides.css use the same beat times, written as
 * percentages of `seconds`.
 */

export type ParkRideId =
  "ferris" | "teacups" | "carousel" | "flume" | "drop-tower";

export type RideCue =
  | "board"
  | "rise"
  | "top"
  | "descend"
  | "spin"
  | "music"
  | "climb"
  | "drop"
  | "splash"
  | "float"
  | "slow"
  | "home";

export type RideBeat = { at: number; cue: RideCue; say: string };

export type ParkRide = {
  name: string;
  seconds: number;
  stampId: string;
  beats: readonly RideBeat[];
};

export const PARK_RIDES: Record<ParkRideId, ParkRide> = {
  ferris: {
    name: "Sunshine Ferris Wheel",
    seconds: 30,
    stampId: "ferris_panoramic",
    beats: [
      { at: 0, cue: "rise", say: "Up, up, up we go!" },
      { at: 11, cue: "top", say: "The very top! Look at the sunset." },
      { at: 19, cue: "descend", say: "Floating back down." },
      { at: 28, cue: "home", say: "Back on the ground." },
    ],
  },
  teacups: {
    name: "Mango Teacups",
    seconds: 24,
    stampId: "mango_teacups",
    beats: [
      { at: 0, cue: "spin", say: "Round and round! Hold to spin faster." },
      { at: 21, cue: "slow", say: "The teacup slows down." },
    ],
  },
  carousel: {
    name: "Golden Carousel",
    seconds: 30,
    stampId: "golden_carousel",
    beats: [
      { at: 0, cue: "music", say: "The music box plays. Up and down!" },
      { at: 27, cue: "slow", say: "The carousel slows down." },
    ],
  },
  flume: {
    name: "Sunshine Flume",
    seconds: 28,
    stampId: "flume_splash",
    beats: [
      { at: 0, cue: "float", say: "Floating in a log boat." },
      { at: 3, cue: "climb", say: "Clack, clack, climbing the hill." },
      { at: 13, cue: "top", say: "At the top. Hold on!" },
      { at: 15, cue: "drop", say: "Down the big slide!" },
      { at: 17, cue: "splash", say: "SPLASH! A rainbow in the spray." },
      { at: 21, cue: "float", say: "Floating home." },
    ],
  },
  "drop-tower": {
    name: "Lion Leap Tower",
    seconds: 24,
    stampId: "lion_leap",
    beats: [
      { at: 0, cue: "rise", say: "Going up the tower." },
      { at: 9, cue: "top", say: "So high! Hold on tight." },
      { at: 13, cue: "drop", say: "Whoosh! Down we fall!" },
      { at: 15, cue: "home", say: "Boing! Safe at the bottom." },
    ],
  },
};

/** Scenery hotspot ids that open a ride. */
export const RIDE_HOTSPOTS: Record<string, ParkRideId> = {
  "giant-ferris-wheel": "ferris",
  "spinning-mango-teacups": "teacups",
  "grand-golden-carousel": "carousel",
  "sunshine-flume": "flume",
  "lion-leap-tower": "drop-tower",
};

/** The beat playing `seconds` into a ride, clamped to the first and last beat. */
export function rideBeatAt(id: ParkRideId, seconds: number): RideBeat {
  const beats = PARK_RIDES[id].beats;
  let current = beats[0];
  for (const beat of beats) if (seconds >= beat.at) current = beat;
  return current;
}

/** Degrees per second. */
export const TEACUP_BASE_SPEED = 120;
export const TEACUP_MAX_SPEED = 900;

export type TeacupSpin = { angle: number; speed: number };

/** Holding eases the cup up to full speed; letting go eases it back. */
export function spinTeacup(
  cup: TeacupSpin,
  dt: number,
  holding: boolean,
): TeacupSpin {
  if (!(dt > 0)) return cup;
  const step = Math.min(dt, 0.1);
  const target = holding ? TEACUP_MAX_SPEED : TEACUP_BASE_SPEED;
  const ease = Math.min(1, step * (holding ? 1.6 : 0.9));
  const speed = Math.min(
    TEACUP_MAX_SPEED,
    cup.speed + (target - cup.speed) * ease,
  );
  return { angle: (cup.angle + speed * step) % 360, speed };
}

/** 0 at cruising speed, 1 at full spin: drives the dizzy swirl effects. */
export function teacupDizziness(speed: number): number {
  return Math.min(
    1,
    Math.max(
      0,
      (speed - TEACUP_BASE_SPEED) / (TEACUP_MAX_SPEED - TEACUP_BASE_SPEED),
    ),
  );
}
