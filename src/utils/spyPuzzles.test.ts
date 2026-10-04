import { test } from "node:test";
import assert from "node:assert/strict";
import { getSharedAudioBus, resetSharedAudioBusForTests } from "./audioBus.ts";
import {
  getLaserBeamStatus,
  moveAgent,
  LASER_GRID_STAGES,
  createCipherPuzzle,
  applyCipherGuess,
  checkCipherSolved,
  getCipherHint,
  calculateSpyRank,
  playSpySound,
  type LaserBeam,
  type GridState,
} from "./spyPuzzles.ts";

// --- Laser beam timing ---

test("getLaserBeamStatus is inactive before the warning window begins", () => {
  const beam: LaserBeam = {
    id: "b1",
    x: 2,
    y: 2,
    axis: "horizontal",
    periodMs: 2000,
    activeWindowMs: 500,
    warningWindowMs: 300,
    offsetMs: 0,
  };
  assert.equal(getLaserBeamStatus(beam, 100), "inactive");
});

test("getLaserBeamStatus is warning just before the active window", () => {
  const beam: LaserBeam = {
    id: "b1",
    x: 2,
    y: 2,
    axis: "horizontal",
    periodMs: 2000,
    activeWindowMs: 500,
    warningWindowMs: 300,
    offsetMs: 0,
  };
  // activeStart=1500, warningStart=1200. t=1300 falls in [1200, 1500).
  assert.equal(getLaserBeamStatus(beam, 1300), "warning");
});

test("getLaserBeamStatus is active during the active window", () => {
  const beam: LaserBeam = {
    id: "b1",
    x: 2,
    y: 2,
    axis: "horizontal",
    periodMs: 2000,
    activeWindowMs: 500,
    warningWindowMs: 300,
    offsetMs: 0,
  };
  // activeStart=1500. t=1700 falls in [1500, 2000).
  assert.equal(getLaserBeamStatus(beam, 1700), "active");
});

test("getLaserBeamStatus respects offsetMs by shifting the cycle", () => {
  const beam: LaserBeam = {
    id: "b1",
    x: 2,
    y: 2,
    axis: "horizontal",
    periodMs: 2000,
    activeWindowMs: 500,
    warningWindowMs: 300,
    offsetMs: 1000,
  };
  // activeStart=1500, so with offsetMs=1000 the active window (shifted cycle)
  // falls at raw t in [2500, 3000). t=2600 lands inside it.
  assert.equal(getLaserBeamStatus(beam, 2600), "active");
  assert.equal(getLaserBeamStatus(beam, 1200), "inactive");
});

test("getLaserBeamStatus wraps correctly across multiple periods", () => {
  const beam: LaserBeam = {
    id: "b1",
    x: 2,
    y: 2,
    axis: "horizontal",
    periodMs: 1000,
    activeWindowMs: 200,
    warningWindowMs: 100,
    offsetMs: 0,
  };
  // activeStart=800, warningStart=700. At t=5750 cyclePos=750 -> warning.
  // At t=6050 cyclePos=50 (next cycle) -> inactive, so use 5850 -> active.
  assert.equal(getLaserBeamStatus(beam, 5750), "warning");
  assert.equal(getLaserBeamStatus(beam, 5850), "active");
});

// --- Agent movement ---

function makeGrid(): GridState {
  return {
    width: 4,
    height: 4,
    start: { x: 0, y: 0 },
    goal: { x: 3, y: 0 },
    agent: { x: 0, y: 0 },
    walls: [{ x: 1, y: 1 }],
    beams: [],
    alarms: 0,
    elapsedMs: 0,
  };
}

test("moveAgent moves the agent one cell in the requested direction", () => {
  const grid = makeGrid();
  const { nextState, trippedAlarm, reachedGoal } = moveAgent(grid, "right", 0);
  assert.deepEqual(nextState.agent, { x: 1, y: 0 });
  assert.equal(trippedAlarm, false);
  assert.equal(reachedGoal, false);
});

test("moveAgent blocks movement into a wall and keeps the agent in place", () => {
  const grid = makeGrid();
  const atWallEdge: GridState = { ...grid, agent: { x: 1, y: 0 } };
  const { nextState } = moveAgent(atWallEdge, "down", 0);
  assert.deepEqual(nextState.agent, { x: 1, y: 0 });
});

test("moveAgent blocks movement past the grid boundary", () => {
  const grid = makeGrid();
  const { nextState } = moveAgent(grid, "left", 0);
  assert.deepEqual(nextState.agent, { x: 0, y: 0 });
});

test("moveAgent trips alarm when moving onto an active laser beam cell", () => {
  const grid = makeGrid();
  const beam: LaserBeam = {
    id: "b1",
    x: 1,
    y: 0,
    axis: "vertical",
    periodMs: 1000,
    activeWindowMs: 1000,
    warningWindowMs: 0,
    offsetMs: 0,
  };
  const withBeam: GridState = { ...grid, beams: [beam] };
  const { nextState, trippedAlarm } = moveAgent(withBeam, "right", 500);
  assert.equal(trippedAlarm, true);
  assert.equal(nextState.alarms, 1);
});

test("moveAgent does not trip alarm when beam is inactive at move time", () => {
  const grid = makeGrid();
  const beam: LaserBeam = {
    id: "b1",
    x: 1,
    y: 0,
    axis: "vertical",
    periodMs: 2000,
    activeWindowMs: 200,
    warningWindowMs: 100,
    offsetMs: 0,
  };
  const withBeam: GridState = { ...grid, beams: [beam] };
  const { trippedAlarm } = moveAgent(withBeam, "right", 0);
  assert.equal(trippedAlarm, false);
});

test("moveAgent reports reachedGoal when agent steps onto the goal cell", () => {
  const grid: GridState = {
    ...makeGrid(),
    agent: { x: 2, y: 0 },
    goal: { x: 3, y: 0 },
  };
  const { reachedGoal } = moveAgent(grid, "right", 0);
  assert.equal(reachedGoal, true);
});

test("LASER_GRID_STAGES has at least 3 progressively challenging stages", () => {
  assert.ok(LASER_GRID_STAGES.length >= 3);
  for (const stage of LASER_GRID_STAGES) {
    assert.ok(stage.width >= 4);
    assert.ok(stage.height >= 4);
    assert.ok(stage.beams.length >= 0);
  }
  // Later stages should not be strictly easier (more beams or bigger grid).
  const beamCounts = LASER_GRID_STAGES.map((s) => s.beams.length);
  assert.ok(beamCounts[beamCounts.length - 1] >= beamCounts[0]);
});

// --- Cipher engine ---

test("createCipherPuzzle encrypts a known phrase with a letter substitution", () => {
  const puzzle = createCipherPuzzle("golden_mane");
  assert.equal(puzzle.plainText, "THE GOLDEN MANE GUARDS THE SECRET VAULT");
  assert.equal(puzzle.cipherText.length, puzzle.plainText.length);
  // Non-letter characters (spaces) remain unchanged.
  for (let i = 0; i < puzzle.plainText.length; i++) {
    if (puzzle.plainText[i] === " ") {
      assert.equal(puzzle.cipherText[i], " ");
    }
  }
  // Same plain letter always maps to same cipher letter.
  const mapping = new Map<string, string>();
  for (let i = 0; i < puzzle.plainText.length; i++) {
    const plain: string = puzzle.plainText[i];
    const cipher = puzzle.cipherText[i];
    if (plain === " ") continue;
    if (mapping.has(plain)) {
      assert.equal(mapping.get(plain), cipher);
    } else {
      mapping.set(plain, cipher);
    }
  }
});

test("createCipherPuzzle never maps a letter to itself", () => {
  const puzzle = createCipherPuzzle("agent_lion");
  for (let i = 0; i < puzzle.plainText.length; i++) {
    const plain = puzzle.plainText[i];
    if (plain === " ") continue;
    assert.notEqual(plain, puzzle.cipherText[i]);
  }
});

test("createCipherPuzzle supports custom text", () => {
  const puzzle = createCipherPuzzle("custom", "LION PRIDE");
  assert.equal(puzzle.plainText, "LION PRIDE");
});

test("applyCipherGuess records a correct guess as revealed", () => {
  const puzzle = createCipherPuzzle("golden_mane");
  const cipherChar = puzzle.cipherText[0];
  const plainChar = puzzle.plainText[0];
  const next = applyCipherGuess(puzzle, cipherChar, plainChar);
  assert.equal(next.guesses[cipherChar], plainChar);
});

test("applyCipherGuess rejects an incorrect guess without recording it", () => {
  const puzzle = createCipherPuzzle("golden_mane");
  const cipherChar = puzzle.cipherText[0];
  const wrongChar =
    puzzle.plainText[0] === "Z"
      ? "Y"
      : String.fromCharCode(
          ((puzzle.plainText.charCodeAt(0) - 65 + 1) % 26) + 65,
        );
  const next = applyCipherGuess(puzzle, cipherChar, wrongChar);
  assert.equal(next.guesses[cipherChar], undefined);
});

test("getCipherHint reveals one unsolved mapping pair without solving the puzzle", () => {
  const puzzle = createCipherPuzzle("golden_mane");
  const hinted = getCipherHint(puzzle);
  const revealedCount = Object.keys(hinted.guesses).length;
  assert.equal(revealedCount, 1);
  assert.equal(checkCipherSolved(hinted), false);
});

test("checkCipherSolved returns true only once every letter is correctly guessed", () => {
  let puzzle = createCipherPuzzle("custom", "CAT DOG");
  assert.equal(checkCipherSolved(puzzle), false);
  const uniqueCipherChars = [...new Set(puzzle.cipherText.replace(/ /g, ""))];
  for (const cipherChar of uniqueCipherChars) {
    const index = puzzle.cipherText.indexOf(cipherChar);
    const plainChar = puzzle.plainText[index];
    puzzle = applyCipherGuess(puzzle, cipherChar, plainChar);
  }
  assert.equal(checkCipherSolved(puzzle), true);
});

// --- Spy rank progression ---

test("calculateSpyRank returns Recruit at zero puzzles solved", () => {
  const rank = calculateSpyRank(0);
  assert.equal(rank.rank, 1);
  assert.equal(rank.title, "Recruit");
});

test("calculateSpyRank promotes through all five ranks as puzzles solved increases", () => {
  assert.equal(calculateSpyRank(0).title, "Recruit");
  assert.equal(calculateSpyRank(3).title, "Field Operative");
  assert.equal(calculateSpyRank(8).title, "Special Agent");
  assert.equal(calculateSpyRank(15).title, "Master Infiltrator");
  assert.equal(calculateSpyRank(25).title, "Pride Director");
});

test("calculateSpyRank caps at rank 5 for very high puzzle counts", () => {
  const rank = calculateSpyRank(999);
  assert.equal(rank.rank, 5);
  assert.equal(rank.title, "Pride Director");
});

test("calculateSpyRank includes a badge string for every rank", () => {
  for (const solved of [0, 3, 8, 15, 25]) {
    const rank = calculateSpyRank(solved);
    assert.ok(typeof rank.badge === "string" && rank.badge.length > 0);
  }
});

// --- Procedural audio ---

test("playSpySound does not throw when AudioContext is undefined", () => {
  assert.doesNotThrow(() => playSpySound("step", null));
  assert.doesNotThrow(() => playSpySound("laser_warning", null));
  assert.doesNotThrow(() => playSpySound("alarm", null));
  assert.doesNotThrow(() => playSpySound("key_press", null));
  assert.doesNotThrow(() => playSpySound("puzzle_complete", null));
});

test("playSpySound does not throw when the provided context throws on use", () => {
  const throwingCtx = {
    createOscillator() {
      throw new Error("no audio in this environment");
    },
  } as unknown as AudioContext;
  assert.doesNotThrow(() => playSpySound("alarm", throwingCtx));
});

test("spy SFX reuse the shared bus and disconnect completed voices", () => {
  let contexts = 0;
  const connections: unknown[] = [];
  const voices: { onended?: () => void; disconnected: boolean }[] = [];
  const gains: { disconnected: boolean }[] = [];
  const parameter = () => ({
    value: 1,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
  });
  class FakeContext {
    currentTime = 0;
    state = "suspended";
    destination = {};
    constructor() {
      contexts++;
    }
    resume() {
      return Promise.resolve();
    }
    createOscillator() {
      const voice = {
        frequency: parameter(),
        type: "sine",
        onended: undefined as (() => void) | undefined,
        disconnected: false,
        connect() {},
        disconnect() {
          voice.disconnected = true;
        },
        start() {},
        stop() {},
      };
      voices.push(voice);
      return voice;
    }
    createGain() {
      const gain = {
        gain: parameter(),
        disconnected: false,
        connect(destination: unknown) {
          connections.push(destination);
        },
        disconnect() {
          gain.disconnected = true;
        },
      };
      gains.push(gain);
      return gain;
    }
  }
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "AudioContext",
  );
  resetSharedAudioBusForTests();
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: FakeContext,
  });
  try {
    const bus = getSharedAudioBus();
    playSpySound("step");
    playSpySound("alarm");
    assert.equal(contexts, 1);
    assert.equal(connections.at(-1), bus.getSfxDestination());
    voices.forEach((voice) => voice.onended?.());
    assert.ok(voices.every((voice) => voice.disconnected));
    assert.ok(gains.slice(-2).every((gain) => gain.disconnected));
  } finally {
    resetSharedAudioBusForTests();
    if (descriptor)
      Object.defineProperty(globalThis, "AudioContext", descriptor);
    else delete (globalThis as { AudioContext?: unknown }).AudioContext;
  }
});
