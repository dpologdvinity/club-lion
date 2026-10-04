import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import { Dialog } from "./Dialog";
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
  SPY_PUZZLE_MAX_COINS,
  type CipherPhraseId,
  type CipherPuzzle,
  type Direction,
  type GridState,
  type SpySoundType,
} from "../utils/spyPuzzles.ts";

type Mode = "laser" | "cipher";

type Result = {
  puzzleType: "laser_grid" | "cipher";
  scoreOrStage: number;
  coins: number;
};

const DIRECTION_KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const CIPHER_PHRASE_IDS: Exclude<CipherPhraseId, "custom">[] = [
  "golden_mane",
  "agent_lion",
  "savanna_shadow",
];

const LASER_GRID_MAX_ALARMS = 3;
const LASER_STAGE_COINS = 20;
const CIPHER_COINS = 20;

function initGridState(stageIndex: number): GridState {
  const stage = LASER_GRID_STAGES[stageIndex];
  return {
    width: stage.width,
    height: stage.height,
    start: stage.start,
    goal: stage.goal,
    agent: stage.start,
    walls: stage.walls,
    beams: stage.beams,
    alarms: 0,
    elapsedMs: 0,
  };
}

function LaserTripwireGrid({
  onFinish,
  playSound,
}: {
  onFinish: (result: Result) => void;
  playSound: (type: SpySoundType) => void;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [grid, setGrid] = useState<GridState>(() => initGridState(0));
  const [now, setNow] = useState(0);
  const [failed, setFailed] = useState(false);
  const [cleared, setCleared] = useState(false);
  const startRef = useRef(performance.now());
  const frameRef = useRef(0);
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const doneRef = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLButtonElement>(null);
  const focusBoardRef = useRef(false);

  useEffect(() => {
    if (failed || cleared) return;
    const tick = () => {
      setNow(performance.now() - startRef.current);
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [stageIndex, failed, cleared]);

  useEffect(() => {
    if (failed || cleared) resultRef.current?.focus();
    else if (focusBoardRef.current) {
      boardRef.current?.focus();
      focusBoardRef.current = false;
    }
  }, [stageIndex, failed, cleared]);

  const restart = (nextStageIndex: number) => {
    focusBoardRef.current = true;
    doneRef.current = false;
    setFailed(false);
    setCleared(false);
    setStageIndex(nextStageIndex);
    const nextGrid = initGridState(nextStageIndex);
    gridRef.current = nextGrid;
    setGrid(nextGrid);
    setNow(0);
    startRef.current = performance.now();
  };

  const move = (direction: Direction) => {
    if (doneRef.current) return;
    const elapsed = performance.now() - startRef.current;
    const { nextState, trippedAlarm, reachedGoal } = moveAgent(
      gridRef.current,
      direction,
      elapsed,
    );
    gridRef.current = nextState;
    setGrid(nextState);
    playSound("step");
    if (trippedAlarm) {
      playSound("alarm");
      if (nextState.alarms >= LASER_GRID_MAX_ALARMS) {
        doneRef.current = true;
        setFailed(true);
        return;
      }
    }
    if (reachedGoal) {
      doneRef.current = true;
      setCleared(true);
      playSound("puzzle_complete");
      onFinish({
        puzzleType: "laser_grid",
        scoreOrStage: stageIndex + 1,
        coins: LASER_STAGE_COINS,
      });
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const direction = DIRECTION_KEYS[event.key];
    if (!direction) return;
    event.preventDefault();
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    move(direction);
  };

  const stage = LASER_GRID_STAGES[stageIndex];
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) cells.push({ x, y });
  }

  return (
    <div className="spy-laser-game">
      <div className="spy-hud" role="status">
        <span>
          <ShieldAlert size={15} /> Alarms: {grid.alarms}/
          {LASER_GRID_MAX_ALARMS}
        </span>
        <span>
          Stage {stageIndex + 1}: {stage.name}
        </span>
        <span className="sr-only">
          Agent at column {grid.agent.x + 1}, row {grid.agent.y + 1}. Goal at
          column {grid.goal.x + 1}, row {grid.goal.y + 1}.
        </span>
      </div>
      <div
        ref={boardRef}
        className="spy-grid-board"
        role="group"
        tabIndex={0}
        aria-label={`Laser tripwire grid, stage ${stageIndex + 1}. Use arrow keys or WASD to move the agent to the vault terminal.`}
        onKeyDown={onKeyDown}
        style={{
          gridTemplateColumns: `repeat(${grid.width}, 1fr)`,
          gridTemplateRows: `repeat(${grid.height}, 1fr)`,
        }}
      >
        {cells.map(({ x, y }) => {
          const isAgent = grid.agent.x === x && grid.agent.y === y;
          const isGoal = grid.goal.x === x && grid.goal.y === y;
          const isWall = grid.walls.some((w) => w.x === x && w.y === y);
          const beam = grid.beams.find((b) => b.x === x && b.y === y);
          const beamStatus = beam ? getLaserBeamStatus(beam, now) : "inactive";
          return (
            <div
              key={`${x}-${y}`}
              role="img"
              aria-label={`Column ${x + 1}, row ${y + 1}: ${isAgent ? "Agent. " : ""}${isWall ? "Wall" : isGoal ? "Vault terminal" : beam ? `Laser ${beamStatus}` : "Clear"}`}
              className={[
                "spy-grid-cell",
                isWall ? "spy-cell-wall" : "",
                isGoal ? "spy-cell-goal" : "",
                beamStatus === "warning" ? "spy-cell-beam-warning" : "",
                beamStatus === "active" ? "spy-cell-beam-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isAgent && (
                <span className="spy-agent" aria-hidden="true">
                  🦁
                </span>
              )}
              {isGoal && !isAgent && <span aria-hidden="true">🔐</span>}
            </div>
          );
        })}
      </div>
      <div
        className="spy-dpad"
        role="group"
        aria-label="Agent movement controls"
      >
        <button
          aria-label="Move up"
          onClick={() => move("up")}
          className="spy-dpad-up"
        >
          ▲
        </button>
        <button
          aria-label="Move left"
          onClick={() => move("left")}
          className="spy-dpad-left"
        >
          ◀
        </button>
        <button
          aria-label="Move down"
          onClick={() => move("down")}
          className="spy-dpad-down"
        >
          ▼
        </button>
        <button
          aria-label="Move right"
          onClick={() => move("right")}
          className="spy-dpad-right"
        >
          ▶
        </button>
      </div>
      {failed && (
        <div className="spy-mission-result" role="alert">
          <p>Alarm limit reached! The vault locked down.</p>
          <button
            ref={resultRef}
            className="button button-secondary"
            onClick={() => restart(stageIndex)}
          >
            <RotateCcw size={16} /> Retry stage
          </button>
        </div>
      )}
      {cleared && stageIndex < LASER_GRID_STAGES.length - 1 && (
        <div className="spy-mission-result" role="status">
          <p>Vault terminal reached! Coins earned: {LASER_STAGE_COINS}.</p>
          <button
            ref={resultRef}
            className="button button-primary"
            onClick={() => restart(stageIndex + 1)}
          >
            Next stage <ArrowRight size={16} />
          </button>
        </div>
      )}
      {cleared && stageIndex === LASER_GRID_STAGES.length - 1 && (
        <div className="spy-mission-result" role="status">
          <p>All laser grid stages cleared, Agent!</p>
          <button
            ref={resultRef}
            className="button button-primary"
            onClick={() => restart(0)}
          >
            Train again <RotateCcw size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function ClassifiedAgentCipher({
  onFinish,
  playSound,
}: {
  onFinish: (result: Result) => void;
  playSound: (type: SpySoundType) => void;
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [puzzle, setPuzzle] = useState<CipherPuzzle>(() =>
    createCipherPuzzle(CIPHER_PHRASE_IDS[0]),
  );
  const [selectedCipherChar, setSelectedCipherChar] = useState<string | null>(
    null,
  );
  const [solved, setSolved] = useState(false);
  const doneRef = useRef(false);
  const puzzleRef = useRef(puzzle);
  const nextRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
  const focusHintRef = useRef(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (solved) nextRef.current?.focus();
    else if (focusHintRef.current) {
      hintRef.current?.focus();
      focusHintRef.current = false;
    }
  }, [solved]);

  const uniqueCipherChars = [
    ...new Set(puzzle.cipherText.split("").filter((c) => c !== " ")),
  ].sort();

  const updatePuzzle = (next: CipherPuzzle) => {
    puzzleRef.current = next;
    setPuzzle(next);
    if (checkCipherSolved(next)) {
      doneRef.current = true;
      setSolved(true);
      playSound("puzzle_complete");
      onFinish({
        puzzleType: "cipher",
        scoreOrStage: phraseIndex + 1,
        coins: CIPHER_COINS,
      });
    }
  };

  const guessLetter = (plainChar: string) => {
    if (!selectedCipherChar || doneRef.current) return;
    const next = applyCipherGuess(
      puzzleRef.current,
      selectedCipherChar,
      plainChar,
    );
    playSound("key_press");
    setFeedback(
      next === puzzleRef.current
        ? `${plainChar} does not decode ${selectedCipherChar}. Try another letter.`
        : `${selectedCipherChar} decoded as ${plainChar}.`,
    );
    updatePuzzle(next);
  };

  const hint = () => {
    if (doneRef.current) return;
    playSound("key_press");
    const next = getCipherHint(puzzleRef.current);
    const letter = Object.keys(next.guesses).find(
      (char) => !puzzleRef.current.guesses[char],
    );
    setFeedback(
      letter
        ? `${letter} decoded as ${next.guesses[letter]}.`
        : "All letters revealed.",
    );
    updatePuzzle(next);
  };

  const nextPhrase = () => {
    focusHintRef.current = true;
    const nextIndex = (phraseIndex + 1) % CIPHER_PHRASE_IDS.length;
    doneRef.current = false;
    setSolved(false);
    setSelectedCipherChar(null);
    setFeedback("");
    setPhraseIndex(nextIndex);
    const next = createCipherPuzzle(CIPHER_PHRASE_IDS[nextIndex]);
    puzzleRef.current = next;
    setPuzzle(next);
  };

  return (
    <div className="spy-cipher-game">
      <div
        className="spy-cipher-display"
        role="group"
        aria-label="Encrypted transmission"
      >
        {puzzle.cipherText.split("").map((ch, i) => (
          <span key={i} className="spy-cipher-char-group">
            <button
              type="button"
              disabled={ch === " " || solved}
              className={`spy-cipher-char ${selectedCipherChar === ch ? "is-selected" : ""} ${puzzle.guesses[ch] ? "is-revealed" : ""}`}
              aria-label={
                ch === " "
                  ? undefined
                  : `Cipher letter ${ch}${puzzle.guesses[ch] ? `, decoded as ${puzzle.guesses[ch]}` : ", select to guess"}`
              }
              aria-pressed={ch === " " ? undefined : selectedCipherChar === ch}
              onClick={() => ch !== " " && setSelectedCipherChar(ch)}
            >
              {ch === " " ? " " : ch}
            </button>
            <span className="spy-cipher-guess" aria-hidden="true">
              {puzzle.guesses[ch] ?? (ch === " " ? "" : "_")}
            </span>
          </span>
        ))}
      </div>
      <p className="sr-only" role="status">
        {feedback}
      </p>
      <div
        className="spy-letter-picker"
        role="group"
        aria-label="Plain text letter picker"
      >
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
          <button
            key={letter}
            className="spy-letter-key"
            aria-label={`Guess letter ${letter}`}
            disabled={!selectedCipherChar || solved}
            onClick={() => guessLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="spy-cipher-controls">
        <button
          ref={hintRef}
          className="button button-secondary"
          onClick={hint}
          aria-label="Reveal a hint letter"
          disabled={solved}
        >
          <Lightbulb size={16} /> Hint
        </button>
        <span className="spy-cipher-hint-text">
          {uniqueCipherChars.length} unique cipher letters ·{" "}
          {Object.keys(puzzle.guesses).length} revealed
        </span>
      </div>
      {solved && (
        <div className="spy-mission-result" role="status">
          <p>Transmission decrypted! Coins earned: {CIPHER_COINS}.</p>
          <button
            ref={nextRef}
            className="button button-primary"
            onClick={nextPhrase}
          >
            Next transmission <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export function SpyTerminal({
  spyPuzzlesSolved,
  onFinish,
  onClose,
}: {
  spyPuzzlesSolved: number;
  onFinish: (result: Result) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("laser");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const laserTabRef = useRef<HTMLButtonElement>(null);
  const cipherTabRef = useRef<HTMLButtonElement>(null);
  const rank = calculateSpyRank(spyPuzzlesSolved);
  const playSound = (type: SpySoundType) => {
    if (soundEnabled) playSpySound(type);
  };

  const onTabKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = mode === "laser" ? "cipher" : "laser";
      setMode(next);
      (next === "laser" ? laserTabRef : cipherTabRef).current?.focus();
    }
  };

  return (
    <div className="spy-terminal">
      <div className="spy-terminal-watermark" aria-hidden="true">
        🦁
      </div>
      <div className="spy-terminal-header">
        <button
          type="button"
          className="spy-tab"
          aria-pressed={soundEnabled}
          onClick={() => setSoundEnabled((enabled) => !enabled)}
        >
          Sound {soundEnabled ? "on" : "off"}
        </button>
        <span className="spy-rank-badge">
          <Trophy size={14} /> {rank.badge} {rank.title}
        </span>
      </div>
      <div className="spy-tabs" role="tablist" aria-label="Spy puzzle mode">
        <button
          ref={laserTabRef}
          role="tab"
          id="spy-tab-laser"
          aria-selected={mode === "laser"}
          aria-controls="spy-tabpanel"
          tabIndex={mode === "laser" ? 0 : -1}
          className={`spy-tab ${mode === "laser" ? "is-active" : ""}`}
          onClick={() => setMode("laser")}
          onKeyDown={onTabKeyDown}
        >
          Laser Tripwire Grid
        </button>
        <button
          ref={cipherTabRef}
          role="tab"
          id="spy-tab-cipher"
          aria-selected={mode === "cipher"}
          aria-controls="spy-tabpanel"
          tabIndex={mode === "cipher" ? 0 : -1}
          className={`spy-tab ${mode === "cipher" ? "is-active" : ""}`}
          onClick={() => setMode("cipher")}
          onKeyDown={onTabKeyDown}
        >
          Classified Agent Cipher
        </button>
      </div>
      <div
        id="spy-tabpanel"
        role="tabpanel"
        aria-labelledby={mode === "laser" ? "spy-tab-laser" : "spy-tab-cipher"}
      >
        {mode === "laser" ? (
          <LaserTripwireGrid onFinish={onFinish} playSound={playSound} />
        ) : (
          <ClassifiedAgentCipher onFinish={onFinish} playSound={playSound} />
        )}
      </div>
      <button className="button button-secondary" onClick={onClose}>
        Return to HQ <ArrowRight size={16} />
      </button>
    </div>
  );
}

export function SpyTerminalModal({
  spyPuzzlesSolved,
  onCompletePuzzle,
  onClose,
}: {
  spyPuzzlesSolved: number;
  onCompletePuzzle: (
    puzzleType: "laser_grid" | "cipher",
    scoreOrStage: number,
    coinsEarned: number,
  ) => void;
  onClose: () => void;
}) {
  const handleFinish = (result: Result) => {
    const cappedCoins = Math.min(result.coins, SPY_PUZZLE_MAX_COINS);
    onCompletePuzzle(result.puzzleType, result.scoreOrStage, cappedCoins);
  };

  return (
    <Dialog
      title="The Pride HQ Secret Scout Terminal"
      subtitle="Classified access only"
      onClose={onClose}
    >
      <SpyTerminal
        spyPuzzlesSolved={spyPuzzlesSolved}
        onFinish={handleFinish}
        onClose={onClose}
      />
    </Dialog>
  );
}
