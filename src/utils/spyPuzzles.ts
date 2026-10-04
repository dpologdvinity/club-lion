/**
 * Secret Scout Command Center puzzle engines: laser tripwire grid,
 * substitution cipher, spy rank progression, and procedural spy SFX.
 */
import { getSharedAudioBus } from "./audioBus.ts";

// --- Laser beam timing ---

export type LaserBeam = {
  id: string;
  x: number;
  y: number;
  axis: "horizontal" | "vertical";
  periodMs: number;
  activeWindowMs: number;
  warningWindowMs: number;
  offsetMs: number;
};

export type BeamStatus = "inactive" | "warning" | "active";

/**
 * Each beam cycles: warning window, then active window, then idle for the
 * rest of the period. The active window ends the cycle so a beam caught
 * active at t=periodMs reads as the start of the next cycle's warning/idle.
 */
export function getLaserBeamStatus(
  beam: LaserBeam,
  timeMs: number,
): BeamStatus {
  const { periodMs, activeWindowMs, warningWindowMs, offsetMs } = beam;
  const cyclePos = (((timeMs - offsetMs) % periodMs) + periodMs) % periodMs;
  const activeStart = periodMs - activeWindowMs;
  const warningStart = activeStart - warningWindowMs;
  if (cyclePos >= activeStart) return "active";
  if (cyclePos >= warningStart) return "warning";
  return "inactive";
}

// --- Laser grid state ---

export type GridPoint = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";

export type GridState = {
  width: number;
  height: number;
  start: GridPoint;
  goal: GridPoint;
  agent: GridPoint;
  walls: GridPoint[];
  beams: LaserBeam[];
  alarms: number;
  elapsedMs: number;
};

export type MoveResult = {
  nextState: GridState;
  trippedAlarm: boolean;
  reachedGoal: boolean;
};

const DIRECTION_DELTA: Record<Direction, GridPoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function isWall(walls: GridPoint[], point: GridPoint): boolean {
  return walls.some((w) => w.x === point.x && w.y === point.y);
}

export function moveAgent(
  gridState: GridState,
  direction: Direction,
  timeMs: number,
): MoveResult {
  const delta = DIRECTION_DELTA[direction];
  const target: GridPoint = {
    x: gridState.agent.x + delta.x,
    y: gridState.agent.y + delta.y,
  };
  const inBounds =
    target.x >= 0 &&
    target.x < gridState.width &&
    target.y >= 0 &&
    target.y < gridState.height;
  const blocked = !inBounds || isWall(gridState.walls, target);
  const nextAgent = blocked ? gridState.agent : target;

  const trippedAlarm =
    !blocked &&
    gridState.beams.some(
      (beam) =>
        beam.x === nextAgent.x &&
        beam.y === nextAgent.y &&
        getLaserBeamStatus(beam, timeMs) === "active",
    );

  const reachedGoal =
    !blocked &&
    nextAgent.x === gridState.goal.x &&
    nextAgent.y === gridState.goal.y;

  return {
    nextState: {
      ...gridState,
      agent: nextAgent,
      alarms: gridState.alarms + (trippedAlarm ? 1 : 0),
      elapsedMs: timeMs,
    },
    trippedAlarm,
    reachedGoal,
  };
}

export type LaserGridStage = {
  id: string;
  name: string;
  width: number;
  height: number;
  start: GridPoint;
  goal: GridPoint;
  walls: GridPoint[];
  beams: LaserBeam[];
};

export const LASER_GRID_STAGES: LaserGridStage[] = [
  {
    id: "vault-approach",
    name: "Vault Approach",
    width: 6,
    height: 6,
    start: { x: 0, y: 5 },
    goal: { x: 5, y: 0 },
    walls: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
    beams: [
      {
        id: "beam-1",
        x: 3,
        y: 3,
        axis: "horizontal",
        periodMs: 2200,
        activeWindowMs: 700,
        warningWindowMs: 400,
        offsetMs: 0,
      },
    ],
  },
  {
    id: "camera-corridor",
    name: "Camera Corridor",
    width: 6,
    height: 6,
    start: { x: 0, y: 5 },
    goal: { x: 5, y: 0 },
    walls: [
      { x: 1, y: 1 },
      { x: 3, y: 4 },
      { x: 4, y: 1 },
    ],
    beams: [
      {
        id: "beam-1",
        x: 2,
        y: 3,
        axis: "horizontal",
        periodMs: 1800,
        activeWindowMs: 600,
        warningWindowMs: 350,
        offsetMs: 0,
      },
      {
        id: "beam-2",
        x: 4,
        y: 3,
        axis: "vertical",
        periodMs: 2000,
        activeWindowMs: 600,
        warningWindowMs: 350,
        offsetMs: 500,
      },
    ],
  },
  {
    id: "the-vault-floor",
    name: "The Vault Floor",
    width: 7,
    height: 7,
    start: { x: 0, y: 6 },
    goal: { x: 6, y: 0 },
    walls: [
      { x: 2, y: 2 },
      { x: 2, y: 4 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
    ],
    beams: [
      {
        id: "beam-1",
        x: 1,
        y: 3,
        axis: "horizontal",
        periodMs: 1600,
        activeWindowMs: 500,
        warningWindowMs: 300,
        offsetMs: 0,
      },
      {
        id: "beam-2",
        x: 3,
        y: 3,
        axis: "vertical",
        periodMs: 1700,
        activeWindowMs: 500,
        warningWindowMs: 300,
        offsetMs: 300,
      },
      {
        id: "beam-3",
        x: 5,
        y: 3,
        axis: "horizontal",
        periodMs: 1900,
        activeWindowMs: 500,
        warningWindowMs: 300,
        offsetMs: 600,
      },
    ],
  },
];

// --- Cipher decryption engine ---

export type CipherPhraseId =
  "golden_mane" | "agent_lion" | "savanna_shadow" | "custom";

const CIPHER_PHRASES: Record<Exclude<CipherPhraseId, "custom">, string> = {
  golden_mane: "THE GOLDEN MANE GUARDS THE SECRET VAULT",
  agent_lion: "AGENT LION DETECTED AT WATERHOLE",
  savanna_shadow: "OPERATION SAVANNA SHADOW INITIATED",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type CipherPuzzle = {
  phraseId: CipherPhraseId;
  plainText: string;
  cipherText: string;
  /** cipher letter -> plain letter, built from a fixed derangement. */
  solutionKey: Record<string, string>;
  /** Player's current confirmed guesses: cipher letter -> plain letter. */
  guesses: Record<string, string>;
};

/**
 * Fixed-offset derangement (shift by 13, i.e. ROT13) guarantees no letter
 * maps to itself since 13 and 26 share no odd divisor overlap issue for any
 * letter (A<->N, B<->O, ...), keeping the cipher deterministic and testable.
 */
function buildSolutionKey(): Record<string, string> {
  const key: Record<string, string> = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    const plain = ALPHABET[i];
    const cipher = ALPHABET[(i + 13) % 26];
    key[cipher] = plain;
  }
  return key;
}

function encrypt(
  plainText: string,
  solutionKey: Record<string, string>,
): string {
  const cipherOf: Record<string, string> = {};
  for (const [cipher, plain] of Object.entries(solutionKey)) {
    cipherOf[plain] = cipher;
  }
  return plainText
    .split("")
    .map((ch) => (ch === " " ? " " : (cipherOf[ch] ?? ch)))
    .join("");
}

export function createCipherPuzzle(
  phraseId: CipherPhraseId,
  customText?: string,
): CipherPuzzle {
  const plainText =
    phraseId === "custom"
      ? (customText ?? "").toUpperCase()
      : CIPHER_PHRASES[phraseId];
  const solutionKey = buildSolutionKey();
  return {
    phraseId,
    plainText,
    cipherText: encrypt(plainText, solutionKey),
    solutionKey,
    guesses: {},
  };
}

export function applyCipherGuess(
  state: CipherPuzzle,
  cipherChar: string,
  plainChar: string,
): CipherPuzzle {
  if (state.solutionKey[cipherChar] !== plainChar) return state;
  return {
    ...state,
    guesses: { ...state.guesses, [cipherChar]: plainChar },
  };
}

export function getCipherHint(state: CipherPuzzle): CipherPuzzle {
  const unsolved = Object.keys(state.solutionKey).filter(
    (cipherChar) =>
      state.cipherText.includes(cipherChar) &&
      state.guesses[cipherChar] === undefined,
  );
  if (unsolved.length === 0) return state;
  const cipherChar = unsolved[0];
  return {
    ...state,
    guesses: { ...state.guesses, [cipherChar]: state.solutionKey[cipherChar] },
  };
}

export function checkCipherSolved(state: CipherPuzzle): boolean {
  const uniqueCipherChars = new Set(
    state.cipherText.split("").filter((ch) => ch !== " "),
  );
  for (const cipherChar of uniqueCipherChars) {
    if (state.guesses[cipherChar] !== state.solutionKey[cipherChar]) {
      return false;
    }
  }
  return true;
}

// --- Spy agency ranks ---

/** Highest coin reward a single spy puzzle completion may pay out. */
export const SPY_PUZZLE_MAX_COINS = 100;

export type SpyRank = { rank: number; title: string; badge: string };

export const SPY_RANKS: SpyRank[] = [
  { rank: 1, title: "Recruit", badge: "🥉" },
  { rank: 2, title: "Field Operative", badge: "🥈" },
  { rank: 3, title: "Special Agent", badge: "🥇" },
  { rank: 4, title: "Master Infiltrator", badge: "🎖️" },
  { rank: 5, title: "Pride Director", badge: "👑" },
];

const SPY_RANK_THRESHOLDS = [0, 3, 8, 15, 25];

export function calculateSpyRank(puzzlesSolved: number): SpyRank {
  const solved =
    Number.isSafeInteger(puzzlesSolved) && puzzlesSolved > 0
      ? puzzlesSolved
      : 0;
  let index = 0;
  for (let i = 0; i < SPY_RANK_THRESHOLDS.length; i++) {
    if (solved >= SPY_RANK_THRESHOLDS[i]) index = i;
  }
  return SPY_RANKS[index];
}

// --- Procedural spy SFX ---

export type SpySoundType =
  "step" | "laser_warning" | "alarm" | "key_press" | "puzzle_complete";

export function playSpySound(
  type: SpySoundType,
  audioCtx?: AudioContext | null,
): void {
  try {
    const bus = audioCtx === undefined ? getSharedAudioBus() : null;
    const ctx = bus ? bus.getContext() : audioCtx;
    if (!ctx) return;
    const destination = bus ? bus.getSfxDestination() : ctx.destination;
    if (!destination) return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    switch (type) {
      case "step":
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        break;
      case "laser_warning":
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        break;
      case "alarm":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        break;
      case "key_press":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        break;
      case "puzzle_complete":
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(1046, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        break;
    }
    osc.connect(gain);
    gain.connect(destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start();
    osc.stop(now + 0.5);
  } catch {
    // Sound is optional; unavailable or failing audio must never throw.
  }
}
