import test from "node:test";
import assert from "node:assert/strict";
import {
  BOOST_COOLDOWN_MS,
  COUNTDOWN_MS,
  KART_LAPS,
  KART_RADIUS,
  MANGO_SPOTS,
  TRACK_HALF_WIDTH,
  TRACK_LENGTH,
  countdownStage,
  createRace,
  kartPose,
  lapsDone,
  playerPlace,
  raceOrder,
  stepRace,
  trackFrame,
  type KartInput,
  type RaceState,
} from "./kartRace.ts";

const GO: KartInput = { throttle: true, steer: 0, boost: false };
const FRAME = 1000 / 60;

/** A race already past the countdown. */
function racing(mode: "easy" | "fast" = "easy"): RaceState {
  return { ...createRace(mode), clock: 0 };
}

function run(state: RaceState, input: KartInput, ms: number) {
  let next = state;
  for (let t = 0; t < ms && !next.finished; t += FRAME)
    next = stepRace(next, input, FRAME);
  return next;
}

test("the track is a closed loop that starts heading right on the top straight", () => {
  assert.ok(TRACK_LENGTH > 3000 && TRACK_LENGTH < 8000);
  const start = trackFrame(0);
  const end = trackFrame(TRACK_LENGTH - 1);
  assert.ok(Math.hypot(start.x - end.x, start.y - end.y) < 10);
  assert.ok(Math.abs(start.angle) < 0.2);
  // Positive offsets sit on the driver's left: above the line when heading right.
  assert.ok(kartPose({ s: 0, d: 50 }).y < start.y);
});

test("countdown shows three red lights then GO, and nobody moves before GO", () => {
  const race = createRace("easy");
  assert.equal(countdownStage(race.clock), 0);
  assert.equal(countdownStage(-COUNTDOWN_MS + 1), 1);
  assert.equal(countdownStage(-1), 3);
  assert.equal(countdownStage(0), 4);
  let state = race;
  const events: string[] = [];
  while (state.clock < 0) {
    state = stepRace(state, GO, FRAME);
    events.push(...state.events);
    if (state.clock < 0)
      assert.deepEqual(
        state.karts.map((k) => k.s),
        race.karts.map((k) => k.s),
      );
  }
  assert.deepEqual(events, ["beep", "beep", "beep", "go"]);
});

test("throttle drives the player forward and lap times are recorded", () => {
  let state = run(racing(), GO, 2000);
  assert.ok(state.karts[0].s > 300);
  state = run(state, GO, 120_000);
  assert.ok(state.finished);
  assert.equal(lapsDone(state.karts[0]), KART_LAPS);
  assert.equal(state.lapTimes.length, KART_LAPS);
  assert.ok(state.lapTimes.every((ms) => ms > 3000 && ms < 30000));
  assert.ok(state.karts[0].finishMs !== null);
});

test("letting go only slows to a crawl so little drivers always finish", () => {
  const state = run(run(racing(), GO, 2000), { ...GO, throttle: false }, 4000);
  assert.ok(state.karts[0].speed > 0);
  assert.ok(state.karts[0].speed <= 60.01);
});

test("hitting the wall bounces back inside and slows down without stopping", () => {
  const start = run(racing(), GO, 2500);
  const fast = start.karts[0].speed;
  let state = start;
  let bumped = false;
  for (let i = 0; i < 120 && !bumped; i++) {
    state = stepRace(state, { ...GO, steer: -1 }, FRAME);
    bumped = state.events.includes("bump");
  }
  assert.ok(bumped, "expected the kart to reach the wall");
  const kart = state.karts[0];
  assert.ok(Math.abs(kart.d) <= TRACK_HALF_WIDTH - KART_RADIUS);
  assert.ok(kart.speed < fast * 0.8 && kart.speed > 0);
  // Keep holding into the wall: the kart scrapes along and still makes progress.
  const later = run(state, { ...GO, steer: -1 }, 3000);
  assert.ok(later.karts[0].s > kart.s + 500);
  assert.ok(Math.abs(later.karts[0].d) <= TRACK_HALF_WIDTH - KART_RADIUS);
});

test("karts side by side push apart instead of overlapping", () => {
  const base = racing();
  const state = {
    ...base,
    karts: base.karts.map((kart, i) =>
      i === 0
        ? { ...kart, s: 500, d: 0, speed: 300 }
        : i === 1
          ? { ...kart, s: 505, d: 5, speed: 300 }
          : { ...kart, s: -2000 },
    ),
  };
  const next = stepRace(state, GO, FRAME);
  const gap = Math.abs(next.karts[0].d - next.karts[1].d);
  assert.ok(gap >= KART_RADIUS * 2 - 1, `gap ${gap}`);
});

test("boost works once per cool-down and mangos give a free boost", () => {
  let state = run(racing(), GO, 1500);
  state = stepRace(state, { ...GO, boost: true }, FRAME);
  assert.ok(state.events.includes("boost"));
  assert.ok(state.karts[0].boostMs > 0);
  state = stepRace(state, { ...GO, boost: true }, FRAME);
  assert.ok(!state.events.includes("boost"));
  state = run(state, GO, BOOST_COOLDOWN_MS);
  state = stepRace(state, { ...GO, boost: true }, FRAME);
  assert.ok(state.events.includes("boost"));

  const spot = MANGO_SPOTS[0];
  const base = racing();
  const onMango = {
    ...base,
    karts: base.karts.map((kart, i) =>
      i === 0 ? { ...kart, s: spot.s - 5, d: spot.d, speed: 200 } : kart,
    ),
  };
  const ate = stepRace(onMango, GO, FRAME);
  assert.ok(ate.events.includes("mango"));
  assert.ok(ate.karts[0].boostMs > 0);
  assert.ok(ate.mangos[0] > 0, "the mango respawns later");
});

test("AI karts rubber-band: they ease off when far ahead and push when behind", () => {
  const base = racing();
  const spread = (gap: number) =>
    run(
      {
        ...base,
        karts: base.karts.map((kart, i) =>
          i === 0
            ? { ...kart, s: 2000, speed: 0 }
            : i === 1
              ? { ...kart, s: 2000 + gap, d: 60 }
              : { ...kart, s: -3000 },
        ),
      },
      { ...GO, throttle: false },
      3000,
    ).karts[1].speed;
  const ahead = spread(900);
  const behind = spread(-900);
  assert.ok(behind > ahead * 1.5, `ahead ${ahead}, behind ${behind}`);
});

test("races stay close in easy mode and the finish order is deterministic", () => {
  const drive = (mode: "easy" | "fast") => {
    let state = createRace(mode);
    let frame = 0;
    while (!state.finished && frame < 60 * 180) {
      state = stepRace(
        state,
        {
          throttle: true,
          steer: Math.sin(frame / 50) * 0.6,
          boost: frame % 400 === 0,
        },
        FRAME,
      );
      frame++;
    }
    return state;
  };
  const a = drive("easy");
  const b = drive("easy");
  assert.ok(a.finished);
  assert.deepEqual(raceOrder(a), raceOrder(b));
  assert.deepEqual(a.lapTimes, b.lapTimes);
  // Rubber-banding keeps every AI within about a lap of the player.
  for (const kart of a.karts)
    assert.ok(kart.s > a.karts[0].s - TRACK_LENGTH, kart.driver);
  const place = playerPlace(a);
  assert.ok(place >= 1 && place <= 4);
  assert.deepEqual([...raceOrder(a)].sort(), [0, 1, 2, 3]);
});

test("finishers rank by finish time, then distance, with grid order breaking ties", () => {
  const base = racing();
  const order = raceOrder({
    karts: [
      { ...base.karts[0], s: 100, finishMs: null },
      { ...base.karts[1], s: 9000, finishMs: 20000 },
      { ...base.karts[2], s: 9000, finishMs: 20000 },
      { ...base.karts[3], s: 200, finishMs: null },
    ],
  });
  assert.deepEqual(order, [1, 2, 3, 0]);
});

test("a finished race does not change any more", () => {
  const done = { ...racing(), finished: true };
  const next = stepRace(done, { ...GO, boost: true }, 500);
  assert.deepEqual(next.karts, done.karts);
  assert.deepEqual(next.events, []);
});
