/**
 * Pure kart race simulation: a closed track, karts moving in track space
 * (distance along the centreline + sideways offset), toddler-safe walls,
 * mango boosts and rubber-banded AI. No DOM, no randomness: the same inputs
 * always produce the same race.
 */

export type KartMode = "easy" | "fast";
export const KART_COLOR_IDS = [
  "mango",
  "cherry",
  "sunny",
  "lime",
  "sky",
  "bubblegum",
] as const;
export type KartColorId = (typeof KART_COLOR_IDS)[number];

export const isKartColorId = (value: unknown): value is KartColorId =>
  KART_COLOR_IDS.some((id) => id === value);
export const isKartMode = (value: unknown): value is KartMode =>
  value === "easy" || value === "fast";
export type KartDriver = "player" | "zebra" | "giraffe" | "hippo";
export type KartInput = { throttle: boolean; steer: number; boost: boolean };

export type Kart = {
  driver: KartDriver;
  /** Distance driven along the centreline; negative behind the start line. */
  s: number;
  /** Sideways offset from the centreline, positive to the driver's left. */
  d: number;
  speed: number;
  boostMs: number;
  bumpMs: number;
  finishMs: number | null;
};

export type RaceEvent =
  "beep" | "go" | "bump" | "mango" | "boost" | "lap" | "finish";

export type RaceState = {
  mode: KartMode;
  /** Race clock in ms; negative during the 3-2-1 countdown, GO at 0. */
  clock: number;
  /** Index 0 is always the player. */
  karts: Kart[];
  /** Ms until each mango respawns; 0 means it is on the track. */
  mangos: number[];
  boostCooldownMs: number;
  lapStartMs: number;
  lapTimes: number[];
  finished: boolean;
  /** Things that happened during the last step, for sound and effects. */
  events: RaceEvent[];
};

export const KART_LAPS = 3;
export const COUNTDOWN_MS = 3000;
export const TRACK_HALF_WIDTH = 100;
export const KART_RADIUS = 22;
export const BOOST_MS = 1400;
export const BOOST_COOLDOWN_MS = 5000;
export const MANGO_BOOST_MS = 1600;
export const MANGO_RESPAWN_MS = 3000;
const STEP_MS = 1000 / 60;
const CRAWL_SPEED = 60;
const WALL = TRACK_HALF_WIDTH - KART_RADIUS;

const TUNING = {
  easy: {
    maxSpeed: 480,
    accel: 420,
    skill: [0.9, 0.87, 0.84],
    rubber: 1 / 600,
    slowest: 0.45,
    fastest: 1.18,
  },
  fast: {
    maxSpeed: 640,
    accel: 560,
    skill: [0.96, 0.94, 0.92],
    rubber: 1 / 2200,
    slowest: 0.9,
    fastest: 1.08,
  },
} as const;

// Hand-placed control points for a loop with two S-bends, smoothed below.
const CONTROL: [number, number][] = [
  [0, -560],
  [760, -560],
  [1180, -380],
  [1290, 0],
  [1170, 290],
  [1230, 580],
  [1000, 810],
  [500, 870],
  [-300, 830],
  [-860, 650],
  [-940, 280],
  [-1160, -60],
  [-1000, -440],
];
const TRACK_SCALE = 0.75;
const TABLE_STEP = 8;

function buildTrack() {
  const raw: [number, number][] = [];
  const n = CONTROL.length;
  for (let i = 0; i < n; i++) {
    const p0 = CONTROL[(i - 1 + n) % n];
    const p1 = CONTROL[i];
    const p2 = CONTROL[(i + 1) % n];
    const p3 = CONTROL[(i + 2) % n];
    for (let k = 0; k < 60; k++) {
      const t = k / 60;
      const at = (j: 0 | 1) =>
        TRACK_SCALE *
        0.5 *
        (2 * p1[j] +
          (p2[j] - p0[j]) * t +
          (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t +
          (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t);
      raw.push([at(0), at(1)]);
    }
  }
  // Relax the spline so no corner is tighter than the track is wide.
  for (let pass = 0; pass < 200; pass++) {
    const prev = raw.map(([x, y]) => [x, y]);
    for (let i = 0; i < raw.length; i++) {
      const a = prev[(i - 1 + raw.length) % raw.length];
      const b = prev[i];
      const c = prev[(i + 1) % raw.length];
      raw[i] = [(a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4];
    }
  }
  // Resample evenly by arc length so lookups are a simple index.
  const cumulative = [0];
  for (let i = 1; i <= raw.length; i++) {
    const [ax, ay] = raw[i - 1];
    const [bx, by] = raw[i % raw.length];
    cumulative.push(cumulative[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const length = cumulative[raw.length];
  const count = Math.round(length / TABLE_STEP);
  const xs: number[] = [];
  const ys: number[] = [];
  let seg = 0;
  for (let k = 0; k < count; k++) {
    const target = (k / count) * length;
    while (cumulative[seg + 1] < target) seg++;
    const f =
      (target - cumulative[seg]) / (cumulative[seg + 1] - cumulative[seg]);
    const [ax, ay] = raw[seg];
    const [bx, by] = raw[(seg + 1) % raw.length];
    xs.push(ax + (bx - ax) * f);
    ys.push(ay + (by - ay) * f);
  }
  const angles = xs.map((_, k) => {
    const next = (k + 1) % count;
    const prev = (k - 1 + count) % count;
    return Math.atan2(ys[next] - ys[prev], xs[next] - xs[prev]);
  });
  // Curvature towards the driver's left (screen y points down).
  const leftCurvature = angles.map((_, k) => {
    let turn = angles[(k + 1) % count] - angles[(k - 1 + count) % count];
    while (turn > Math.PI) turn -= 2 * Math.PI;
    while (turn < -Math.PI) turn += 2 * Math.PI;
    return -turn / ((2 * length) / count);
  });
  return { length, count, xs, ys, angles, leftCurvature };
}

const TRACK = buildTrack();
export const TRACK_LENGTH = TRACK.length;

/** Mango boosts spread round the lap, alternating sides. */
export const MANGO_SPOTS = Array.from({ length: 9 }, (_, i) => ({
  s: ((i + 0.6) / 9) * TRACK_LENGTH,
  d: [-50, 0, 50][i % 3],
}));

const wrap = (s: number) => ((s % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function sample(table: number[], s: number) {
  const pos = wrap(s) / (TRACK_LENGTH / TRACK.count);
  const i = Math.floor(pos) % TRACK.count;
  return [table[i], table[(i + 1) % TRACK.count], pos - Math.floor(pos)];
}

/** Centreline point, heading (radians, screen space) and left curvature at s. */
export function trackFrame(s: number) {
  const [x0, x1, f] = sample(TRACK.xs, s);
  const [y0, y1] = sample(TRACK.ys, s);
  const [a0, a1] = sample(TRACK.angles, s);
  const [k0, k1] = sample(TRACK.leftCurvature, s);
  return {
    x: x0 + (x1 - x0) * f,
    y: y0 + (y1 - y0) * f,
    angle: a0 + Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)) * f,
    curve: k0 + (k1 - k0) * f,
  };
}

/** Screen position and heading of a kart. */
export function kartPose(kart: Pick<Kart, "s" | "d">) {
  const frame = trackFrame(kart.s);
  return {
    x: frame.x + Math.sin(frame.angle) * kart.d,
    y: frame.y - Math.cos(frame.angle) * kart.d,
    angle: frame.angle,
  };
}

/** SVG path of the centreline, for drawing the track. */
export function trackPath(): string {
  return (
    TRACK.xs
      .map(
        (x, i) => `${i ? "L" : "M"}${x.toFixed(1)} ${TRACK.ys[i].toFixed(1)}`,
      )
      .join("") + "Z"
  );
}

export function lapsDone(kart: Pick<Kart, "s">): number {
  return kart.s <= 0
    ? 0
    : Math.min(KART_LAPS, Math.floor(kart.s / TRACK_LENGTH));
}

/** Red start lights lit (0-3) during the countdown, then 4 once it is GO. */
export function countdownStage(clock: number): number {
  return clock >= 0 ? 4 : Math.max(0, 4 - Math.ceil(-clock / 1000));
}

export function createRace(mode: KartMode): RaceState {
  const grid: [KartDriver, number, number][] = [
    ["zebra", 0, 45],
    ["giraffe", 0, -45],
    ["hippo", -70, 45],
    ["player", -70, -45],
  ];
  const karts = grid.map(([driver, s, d]) => ({
    driver,
    s,
    d,
    speed: 0,
    boostMs: 0,
    bumpMs: 0,
    finishMs: null,
  }));
  return {
    mode,
    // A short beat with all lights off before the first red light.
    clock: -COUNTDOWN_MS - 600,
    karts: [karts[3], karts[0], karts[1], karts[2]],
    mangos: MANGO_SPOTS.map(() => 0),
    boostCooldownMs: 0,
    lapStartMs: 0,
    lapTimes: [],
    finished: false,
    events: [],
  };
}

/** Finishers by finish time, then everyone else by distance; ties keep grid order. */
export function raceOrder(state: Pick<RaceState, "karts">): number[] {
  return state.karts
    .map((kart, index) => ({ kart, index }))
    .sort((a, b) => {
      const af = a.kart.finishMs;
      const bf = b.kart.finishMs;
      if (af !== null && bf !== null) return af - bf || a.index - b.index;
      if (af !== null) return -1;
      if (bf !== null) return 1;
      return b.kart.s - a.kart.s || a.index - b.index;
    })
    .map(({ index }) => index);
}

/** 1-based place of the player. */
export function playerPlace(state: Pick<RaceState, "karts">): number {
  return raceOrder(state).indexOf(0) + 1;
}

/** Signed gap from b to a along the lap, in (-L/2, L/2]. */
function lapGap(a: number, b: number) {
  const gap = wrap(a - b);
  return gap > TRACK_LENGTH / 2 ? gap - TRACK_LENGTH : gap;
}

function aiTarget(state: RaceState, index: number): number {
  const kart = state.karts[index];
  const ahead = trackFrame(kart.s + 160).curve;
  // Lean to the inside of the next bend, each driver in its own lane.
  let target = clamp(ahead * 9000, -55, 55) + [0, 30, -30, 0][index];
  const mango = MANGO_SPOTS.findIndex(
    (spot, i) =>
      state.mangos[i] === 0 &&
      lapGap(spot.s, kart.s) > 40 &&
      lapGap(spot.s, kart.s) < 260,
  );
  if (mango >= 0 && index !== 3) target = MANGO_SPOTS[mango].d;
  return clamp(target, -WALL + 8, WALL - 8);
}

function stepOnce(state: RaceState, input: KartInput, dt: number) {
  const ms = dt * 1000;
  const wasCounting = state.clock < 0;
  const before = countdownStage(state.clock);
  state.clock += ms;
  if (wasCounting) {
    const after = countdownStage(state.clock);
    if (after !== before) state.events.push(after === 4 ? "go" : "beep");
    if (state.clock < 0) return;
  }
  const tune = TUNING[state.mode];
  const player = state.karts[0];
  state.boostCooldownMs = Math.max(0, state.boostCooldownMs - ms);
  if (input.boost && state.boostCooldownMs === 0 && player.finishMs === null) {
    player.boostMs = BOOST_MS;
    state.boostCooldownMs = BOOST_COOLDOWN_MS;
    state.events.push("boost");
  }
  state.mangos = state.mangos.map((t) => Math.max(0, t - ms));

  state.karts.forEach((kart, index) => {
    if (kart.finishMs !== null && index !== 0) {
      // Finished AI karts cruise on so the track never looks empty.
      kart.s += 200 * dt;
      return;
    }
    kart.boostMs = Math.max(0, kart.boostMs - ms);
    kart.bumpMs = Math.max(0, kart.bumpMs - ms);
    const boost = kart.boostMs > 0 ? 1.45 : 1;
    let top: number;
    let steer: number;
    if (index === 0) {
      top = tune.maxSpeed * boost;
      if (!input.throttle) top = Math.min(CRAWL_SPEED, top);
      steer = clamp(input.steer, -1, 1);
    } else {
      const gap = kart.s - player.s;
      const rubber = clamp(1 - gap * tune.rubber, tune.slowest, tune.fastest);
      top = tune.maxSpeed * tune.skill[index - 1] * rubber * boost;
      steer = clamp((kart.d - aiTarget(state, index)) / 30, -1, 1);
    }
    kart.speed =
      kart.speed < top
        ? Math.min(top, kart.speed + tune.accel * (boost > 1 ? 2 : 1) * dt)
        : Math.max(top, kart.speed - 380 * dt);
    const grip = 0.35 + 0.65 * Math.min(1, kart.speed / tune.maxSpeed);
    kart.d -= steer * 200 * grip * dt;
    if (Math.abs(kart.d) > WALL) {
      // A soft bounce off the barrier: never a crash, just a wobble. Holding
      // into the wall afterwards only scrapes along it, so nobody gets stuck.
      if (kart.bumpMs === 0) {
        kart.d = Math.sign(kart.d) * (WALL - 12);
        kart.speed *= 0.6;
        kart.bumpMs = 500;
        if (index === 0) state.events.push("bump");
      } else kart.d = Math.sign(kart.d) * WALL;
    }
    // The inside line is shorter, so it gains ground through bends.
    const shrink = clamp(1 - trackFrame(kart.s).curve * kart.d, 0.6, 1.6);
    const before = kart.s;
    kart.s += (kart.speed * dt) / shrink;
    if (index === 0 && before > 0 && lapsDone(kart) > lapsDone({ s: before })) {
      state.lapTimes.push(state.clock - state.lapStartMs);
      state.lapStartMs = state.clock;
      state.events.push("lap");
    }
    if (kart.s >= KART_LAPS * TRACK_LENGTH && kart.finishMs === null) {
      kart.finishMs = state.clock;
      if (index === 0) state.events.push("finish");
    }
    MANGO_SPOTS.forEach((spot, i) => {
      if (
        state.mangos[i] === 0 &&
        Math.abs(lapGap(kart.s, spot.s)) < 34 &&
        Math.abs(kart.d - spot.d) < 40
      ) {
        state.mangos[i] = MANGO_RESPAWN_MS;
        kart.boostMs = Math.max(kart.boostMs, MANGO_BOOST_MS);
        if (index === 0) state.events.push("mango");
      }
    });
  });

  // Karts side by side nudge each other apart instead of crashing.
  for (let a = 0; a < state.karts.length; a++) {
    for (let b = a + 1; b < state.karts.length; b++) {
      const ka = state.karts[a];
      const kb = state.karts[b];
      const ds = lapGap(ka.s, kb.s);
      const dd = ka.d - kb.d;
      if (Math.abs(ds) >= KART_RADIUS * 2 || Math.abs(dd) >= KART_RADIUS * 2)
        continue;
      const push = (KART_RADIUS * 2 - Math.abs(dd)) / 2;
      const side = dd === 0 ? (a < b ? 1 : -1) : Math.sign(dd);
      ka.d = clamp(ka.d + side * push, -WALL, WALL);
      kb.d = clamp(kb.d - side * push, -WALL, WALL);
      const behind = ds < 0 ? ka : kb;
      behind.speed *= 0.97;
      if (a === 0 && ka.bumpMs === 0) {
        ka.bumpMs = 300;
        state.events.push("bump");
      }
    }
  }
  if (player.finishMs !== null) state.finished = true;
}

/** Advances the race by dtMs (split into fixed 60 Hz steps). Pure. */
export function stepRace(
  state: RaceState,
  input: KartInput,
  dtMs: number,
): RaceState {
  const next: RaceState = {
    ...state,
    karts: state.karts.map((kart) => ({ ...kart })),
    mangos: [...state.mangos],
    lapTimes: [...state.lapTimes],
    events: [],
  };
  if (state.finished || !(dtMs > 0)) return next;
  let left = Math.min(dtMs, 250);
  let first = true;
  while (left > 0 && !next.finished) {
    const step = Math.min(STEP_MS, left);
    // Boost is a single press; only the first sub-step may use it.
    stepOnce(next, first ? input : { ...input, boost: false }, step / 1000);
    first = false;
    left -= step;
  }
  return next;
}
