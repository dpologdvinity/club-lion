import { getSharedAudioBus, resetSharedAudioBusForTests } from "./audioBus.ts";
import test from "node:test";
import assert from "node:assert/strict";
import {
  SLED_ITEMS,
  SLED_OBSTACLES,
  stepSledPhysics,
  checkSledCollision,
  checkSledPickup,
  calculateSledPayout,
  playSledSound,
  type SledState,
  type Collectible,
} from "./sledPhysics.ts";

const initial: SledState = {
  laneX: 0,
  distance: 0,
  speed: 12,
  airborne: false,
  jumpHeight: 0,
  coinsCollected: 0,
  tricksCompleted: 0,
  crashed: false,
};

test("sled accelerates downhill, clamps steering, and never mutates its input", () => {
  const next = stepSledPhysics(initial, 1, false, 50);
  assert.ok(next.speed > initial.speed);
  assert.ok(next.distance > 0);
  assert.ok(next.laneX > 0);
  assert.equal(initial.distance, 0);
  assert.equal(
    stepSledPhysics({ ...initial, laneX: 179 }, 20, false, 50).laneX,
    180,
  );
  assert.equal(
    stepSledPhysics({ ...initial, laneX: -179 }, -20, false, 50).laneX,
    -180,
  );
});

test("invalid time is inert, long frames are bounded, and terminal runs stop", () => {
  for (const dt of [0, -1, NaN, Infinity])
    assert.deepEqual(stepSledPhysics(initial, 1, true, dt), initial);
  assert.deepEqual(
    stepSledPhysics(initial, 0, false, 5000),
    stepSledPhysics(initial, 0, false, 50),
  );
  const crashed = { ...initial, crashed: true };
  assert.deepEqual(stepSledPhysics(crashed, 1, true, 50), crashed);
  const finish = stepSledPhysics(
    { ...initial, distance: 799.9, speed: 42 },
    0,
    false,
    50,
  );
  assert.equal(finish.distance, 800);
  assert.equal(finish.speed, 0);
  assert.deepEqual(stepSledPhysics(finish, 1, true, 50), finish);
});

test("collision requires nearby distance and lane; airborne sled clears low obstacles", () => {
  const state = { ...initial, distance: 50 };
  assert.equal(
    checkSledCollision(state, [{ distance: 50, laneX: 0, type: "tree" }]),
    true,
  );
  assert.equal(
    checkSledCollision(state, [{ distance: 70, laneX: 0, type: "rock" }]),
    false,
  );
  assert.equal(
    checkSledCollision(state, [{ distance: 50, laneX: 100, type: "rock" }]),
    false,
  );
  const air = { ...state, airborne: true, jumpHeight: 2 };
  assert.equal(
    checkSledCollision(air, [{ distance: 50, laneX: 0, type: "rock" }]),
    false,
  );
  assert.equal(
    checkSledCollision(air, [{ distance: 50, laneX: 0, type: "tree" }]),
    true,
  );
});

test("pinecone pickup adds one and boost pads raise bounded speed", () => {
  const pinecone: Collectible = {
    distance: 0,
    laneX: 0,
    type: "golden_pinecone",
  };
  const result = checkSledPickup(initial, [pinecone]);
  assert.equal(result.pickedUp, pinecone);
  assert.equal(result.nextState.coinsCollected, 1);
  assert.equal(initial.coinsCollected, 0);
  assert.equal(
    checkSledPickup(initial, [{ ...pinecone, laneX: 100 }]).pickedUp,
    null,
  );
  assert.equal(
    checkSledPickup(initial, [{ ...pinecone, distance: 30 }]).pickedUp,
    null,
  );
  assert.equal(checkSledPickup(result.nextState, []).pickedUp, null);
  const boost = checkSledPickup(initial, [
    { ...pinecone, type: "speed_boost" },
  ]);
  assert.ok(boost.nextState.speed > initial.speed);
  assert.ok(
    checkSledPickup({ ...initial, speed: 42 }, [
      { ...pinecone, type: "speed_boost" },
    ]).nextState.speed <= 42,
  );
  assert.equal(
    checkSledPickup({ ...initial, crashed: true }, [pinecone]).pickedUp,
    null,
  );
});

test("Space at a ramp launches a ballistic stunt scored exactly once on landing", () => {
  assert.equal(stepSledPhysics(initial, 0, true, 50).airborne, false);
  const ramp = checkSledPickup(initial, [
    { distance: 0, laneX: 0, type: "ramp" },
  ]).nextState;
  let state = stepSledPhysics(ramp, 0, true, 50);
  assert.equal(state.airborne, true);
  assert.ok(state.jumpHeight > 0);
  assert.equal(state.tricksCompleted, 0);
  let maxHeight = state.jumpHeight;
  for (let i = 0; i < 50; i++) {
    state = stepSledPhysics(state, 0, true, 50);
    maxHeight = Math.max(maxHeight, state.jumpHeight);
  }
  assert.ok(maxHeight > 1);
  assert.equal(state.airborne, false);
  assert.equal(state.jumpHeight, 0);
  assert.equal(state.tricksCompleted, 1);
  const missed = stepSledPhysics({ ...ramp, distance: 20 }, 0, true, 50);
  assert.equal(missed.airborne, false);
});

test("payout includes participation, pinecones, landed stunts, and finish bonus", () => {
  assert.equal(calculateSledPayout(0, 0, 0), 10);
  assert.equal(calculateSledPayout(400, 3, 2), 45);
  assert.equal(calculateSledPayout(799, 3, 2), 45);
  assert.equal(calculateSledPayout(800, 3, 2), 75);
  assert.equal(calculateSledPayout(NaN, -4, Infinity), 10);
});

test("procedural audio safely tolerates unavailable, null, and closed contexts", () => {
  for (const type of ["whoosh", "boost", "pickup", "jump", "crash"] as const) {
    assert.doesNotThrow(() => playSledSound(type));
    assert.doesNotThrow(() => playSledSound(type, null));
    assert.doesNotThrow(() =>
      playSledSound(type, { state: "closed" } as AudioContext),
    );
  }
});

test("a full course reaches 800m without skipping hazards or repeating pickups", () => {
  let state = initial;
  let items = [...SLED_ITEMS];
  const picked = new Set<Collectible>();
  let frames = 0;
  while (state.distance < 800 && frames++ < 2000) {
    state = stepSledPhysics(state, frames <= 20 ? 1 : 0, false, 50);
    assert.equal(checkSledCollision(state, SLED_OBSTACLES), false);
    for (;;) {
      const result = checkSledPickup(state, items);
      if (!result.pickedUp) break;
      assert.equal(picked.has(result.pickedUp), false);
      picked.add(result.pickedUp);
      items = items.filter((item) => item !== result.pickedUp);
      state = result.nextState;
    }
  }
  assert.equal(state.distance, 800);
  assert.equal(state.speed, 0);
  assert.equal(
    calculateSledPayout(
      state.distance,
      state.coinsCollected,
      state.tricksCompleted,
    ),
    40,
  );
});

test("all sled sounds synthesize through the shared SFX bus and disconnect after ending", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  const sources: {
    target?: unknown;
    stopped: boolean;
    disconnected: boolean;
  }[] = [];
  const gains: unknown[] = [];
  const parameter = () => ({
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
  });
  const source = () => {
    const record = {
      target: undefined as unknown,
      stopped: false,
      disconnected: false,
    };
    sources.push(record);
    return {
      frequency: parameter(),
      onended: null as (() => void) | null,
      connect(target: unknown) {
        record.target = target;
      },
      disconnect() {
        record.disconnected = true;
      },
      start() {},
      stop() {
        record.stopped = true;
        this.onended?.();
      },
    };
  };
  class FakeContext {
    state = "suspended";
    currentTime = 0;
    sampleRate = 8000;
    destination = {};
    resume() {
      return Promise.resolve();
    }
    createGain() {
      const gain = {
        gain: { value: 1, ...parameter() },
        target: undefined as unknown,
        connect(target: unknown) {
          this.target = target;
        },
        disconnect() {},
      };
      gains.push(gain);
      return gain;
    }
    createOscillator() {
      return source();
    }
    createBufferSource() {
      return source();
    }
    createBuffer(_channels: number, length: number) {
      return { getChannelData: () => new Float32Array(length) };
    }
  }
  try {
    resetSharedAudioBusForTests();
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: FakeContext,
    });
    const bus = getSharedAudioBus();
    for (const type of ["whoosh", "boost", "pickup", "jump", "crash"] as const)
      playSledSound(type, bus.getContext());
    assert.equal(sources.length, 5);
    for (const record of sources) {
      assert.ok(record.stopped);
      assert.ok(record.disconnected);
      assert.equal(
        (record.target as { target: unknown }).target,
        bus.getSfxDestination(),
      );
    }
    assert.equal(gains.length, 8);
    playSledSound("jump", null);
    assert.equal(sources.length, 5);
  } finally {
    resetSharedAudioBusForTests();
    if (previous) Object.defineProperty(globalThis, "AudioContext", previous);
    else Reflect.deleteProperty(globalThis, "AudioContext");
  }
});
