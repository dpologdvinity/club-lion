export type CoasterTrackPoint = {
  x: number;
  y: number;
  /** Tangent heading in degrees, matching the Task 2 public interface. */
  angle: number;
  speedMultiplier: number;
  isInverted: boolean;
};

const TRACK_WIDTH = 2800;
const TRACK_HEIGHT = 720;
const GROUND_Y = 650;
const LIFT_HILL_TOP_Y = 150;
const LOOP_RADIUS = 110;

/** Phases of the circuit. Each knot owns the span that starts at it. */
export type CoasterPhase = "lift" | "drop" | "loop" | "hop" | "return";

type CoasterKnot = {
  x: number;
  y: number;
  /** Unit tangent direction, shared by both spans meeting at this knot. */
  dx: number;
  dy: number;
  phase: CoasterPhase;
};

// The loop is a true circle, so its centre and radius are named once and the
// loop knots are placed on it.
const LOOP_CENTER_X = 1260;
const LOOP_CENTER_Y = GROUND_Y - LOOP_RADIUS;

const DIAGONAL = Math.SQRT1_2;

/**
 * Knots of the closed circuit, in travel order. The last knot wraps back to
 * the first, so the station seam is an ordinary spline join: the arriving and
 * departing track share both a position and a tangent direction there.
 *
 * Because every knot carries one tangent direction used by the span before it
 * and the span after it, the evaluator is tangent-continuous at every join by
 * construction. No join can reverse or snap the heading.
 */
const COASTER_KNOTS: readonly CoasterKnot[] = [
  // Station platform, level, departing to the right.
  { x: 320, y: GROUND_Y, dx: 1, dy: 0, phase: "lift" },
  // Lift hill: a straight diagonal climb between two level ends.
  { x: 650, y: 410, dx: 0.809, dy: -0.588, phase: "lift" },
  // Crest, level.
  { x: 980, y: LIFT_HILL_TOP_Y, dx: 1, dy: 0, phase: "drop" },
  // First drop: steepest in the middle, levelling out at the loop entry.
  { x: 1130, y: 400, dx: 0.515, dy: 0.857, phase: "drop" },
  // Loop base, level, entering the inversion.
  { x: LOOP_CENTER_X, y: GROUND_Y, dx: 1, dy: 0, phase: "loop" },
  {
    x: LOOP_CENTER_X + LOOP_RADIUS,
    y: LOOP_CENTER_Y,
    dx: 0,
    dy: -1,
    phase: "loop",
  },
  // Loop apex: travelling left, upside down.
  {
    x: LOOP_CENTER_X,
    y: LOOP_CENTER_Y - LOOP_RADIUS,
    dx: -1,
    dy: 0,
    phase: "loop",
  },
  {
    x: LOOP_CENTER_X - LOOP_RADIUS,
    y: LOOP_CENTER_Y,
    dx: 0,
    dy: 1,
    phase: "loop",
  },
  // Loop exit: same point and heading as the entry, one revolution later.
  { x: LOOP_CENTER_X, y: GROUND_Y, dx: 1, dy: 0, phase: "hop" },
  // Airtime hill crest and trough, both level.
  { x: 1500, y: GROUND_Y - 90, dx: 1, dy: 0, phase: "hop" },
  { x: 1740, y: GROUND_Y, dx: 1, dy: 0, phase: "hop" },
  // End of the outbound run, still travelling right.
  { x: 2100, y: GROUND_Y, dx: 1, dy: 0, phase: "return" },
  // Right-hand turnaround: up the far wall, then over onto the high return.
  { x: 2620, y: 430, dx: 0, dy: -1, phase: "return" },
  { x: 2440, y: 270, dx: -1, dy: 0, phase: "return" },
  // High return run, travelling left above the outbound track.
  { x: 1500, y: 250, dx: -1, dy: 0, phase: "return" },
  { x: 700, y: 270, dx: -1, dy: 0, phase: "return" },
  // Left-hand turnaround: a half circle that swings the car back to the right
  // so it arrives at the station already travelling in the departure
  // direction. This is what closes the circuit without a reversal.
  { x: 190, y: 300, dx: -1, dy: 0, phase: "return" },
  { x: 60, y: 450, dx: 0, dy: 1, phase: "return" },
  { x: 190, y: 580, dx: DIAGONAL, dy: DIAGONAL, phase: "return" },
];

/**
 * Hermite tangent length as a multiple of the span's chord length. A quarter
 * circle needs 4/3 * tan(pi/8) * 3 / sqrt(2) ~= 1.1716 chords, so this value
 * makes the circular spans (the loop and both turnarounds) round rather than
 * flattened, while leaving collinear spans straight.
 */
const TANGENT_SCALE = 1.1716;

const SPAN_COUNT = COASTER_KNOTS.length;

function knotAt(index: number): CoasterKnot {
  return COASTER_KNOTS[((index % SPAN_COUNT) + SPAN_COUNT) % SPAN_COUNT];
}

/**
 * Span parameter widths proportional to chord length, so the car covers the
 * circuit at a roughly even rate instead of crawling through long straights.
 */
const SPAN_BOUNDS = (() => {
  const chords: number[] = [];
  for (let i = 0; i < SPAN_COUNT; i += 1) {
    const from = knotAt(i);
    const to = knotAt(i + 1);
    chords.push(Math.hypot(to.x - from.x, to.y - from.y));
  }
  const total = chords.reduce((sum, chord) => sum + chord, 0);
  const starts: number[] = [];
  let running = 0;
  for (const chord of chords) {
    starts.push(running / total);
    running += chord;
  }
  return { chords, starts, total };
})();

/** Normalized parameter at which each phase of the circuit begins. */
export const COASTER_PHASE_STARTS: Readonly<Record<CoasterPhase, number>> =
  (() => {
    const starts = {} as Record<CoasterPhase, number>;
    for (let i = 0; i < SPAN_COUNT; i += 1) {
      const phase = knotAt(i).phase;
      if (!(phase in starts)) starts[phase] = SPAN_BOUNDS.starts[i];
    }
    return starts;
  })();

/**
 * Every geometry join on the circuit, as normalized parameters. t=0 is the
 * station seam; the rest are internal spline joins. Tests sweep this list to
 * prove no join snaps the heading.
 */
export const COASTER_TRACK_JOINS: readonly number[] = SPAN_BOUNDS.starts;

function wrapParameter(t: number): number {
  return ((t % 1) + 1) % 1;
}

function spanIndexFor(wrapped: number): number {
  let index = 0;
  for (let i = SPAN_COUNT - 1; i >= 0; i -= 1) {
    if (wrapped >= SPAN_BOUNDS.starts[i]) {
      index = i;
      break;
    }
  }
  return index;
}

/**
 * Cubic Hermite evaluation of one span, returning both the point and the
 * derivative with respect to the span's local parameter. The derivative is
 * exact, so the reported heading is the true tangent rather than a difference
 * quotient that could straddle a join.
 */
function evaluateSpan(
  index: number,
  u: number,
): { x: number; y: number; dx: number; dy: number } {
  const from = knotAt(index);
  const to = knotAt(index + 1);
  const scale = SPAN_BOUNDS.chords[index] * TANGENT_SCALE;

  const m0x = from.dx * scale;
  const m0y = from.dy * scale;
  const m1x = to.dx * scale;
  const m1y = to.dy * scale;

  const u2 = u * u;
  const u3 = u2 * u;

  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;

  const d00 = 6 * u2 - 6 * u;
  const d10 = 3 * u2 - 4 * u + 1;
  const d01 = -6 * u2 + 6 * u;
  const d11 = 3 * u2 - 2 * u;

  return {
    x: h00 * from.x + h10 * m0x + h01 * to.x + h11 * m1x,
    y: h00 * from.y + h10 * m0y + h01 * to.y + h11 * m1y,
    dx: d00 * from.x + d10 * m0x + d01 * to.x + d11 * m1x,
    dy: d00 * from.y + d10 * m0y + d01 * to.y + d11 * m1y,
  };
}

function speedAndInversionAt(
  phase: CoasterPhase,
  y: number,
): { speedMultiplier: number; isInverted: boolean } {
  switch (phase) {
    case "lift":
      return { speedMultiplier: 0.6, isInverted: false };
    case "drop":
      return { speedMultiplier: 2.2, isInverted: false };
    case "loop":
      // Inverted whenever the car rides above the loop's centre height, which
      // is the geometric definition of the upper half of the revolution.
      return { speedMultiplier: 1.4, isInverted: y < LOOP_CENTER_Y };
    case "hop":
      return { speedMultiplier: 1.1, isInverted: false };
    case "return":
      return { speedMultiplier: 0.9, isInverted: false };
  }
}

export function computeCoasterTrackPosition(t: number): CoasterTrackPoint {
  const wrapped = wrapParameter(t);
  const index = spanIndexFor(wrapped);
  const start = SPAN_BOUNDS.starts[index];
  const end = index + 1 < SPAN_COUNT ? SPAN_BOUNDS.starts[index + 1] : 1;
  const here = evaluateSpan(index, (wrapped - start) / (end - start));

  // The tangent direction is continuous across joins because both spans at a
  // knot use the same unit tangent, so the heading never snaps.
  const angle = (Math.atan2(here.dy, here.dx) * 180) / Math.PI;

  const { speedMultiplier, isInverted } = speedAndInversionAt(
    knotAt(index).phase,
    here.y,
  );

  return { x: here.x, y: here.y, angle, speedMultiplier, isInverted };
}

/** Stage extents the circuit is designed to stay inside. */
export const COASTER_STAGE = { width: TRACK_WIDTH, height: TRACK_HEIGHT };

export function computeFerrisWheelCabin(
  angleDeg: number,
  radius: number,
  center: { x: number; y: number },
): { x: number; y: number; cabinAngleDeg: number } {
  const theta = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(theta),
    y: center.y - radius * Math.sin(theta),
    cabinAngleDeg: 0,
  };
}

export function computePendulumSwing(
  tSeconds: number,
  maxAngleDeg: number,
  periodSeconds: number,
): { angleDeg: number; heightOffset: number } {
  const angularFrequency = (2 * Math.PI) / periodSeconds;
  const angleDeg = maxAngleDeg * Math.sin(angularFrequency * tSeconds);
  const heightOffset = (1 - Math.cos((angleDeg * Math.PI) / 180)) * maxAngleDeg;
  return { angleDeg, heightOffset };
}
