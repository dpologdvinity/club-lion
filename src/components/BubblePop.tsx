import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Coins,
  Leaf,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Timer,
  Trophy,
  Waves,
} from "lucide-react";
import {
  BUBBLE_COLORS,
  CHALLENGE_MS,
  CHALLENGE_SPAWN_MS,
  RELAX_SPAWN_MS,
  START_BUBBLES,
  START_SCORE,
  bubblePopCoins,
  makeBubble,
  multiplierFor,
  scorePop,
  type Bubble,
  type BubbleSurprise,
} from "../utils/bubblePop.ts";
import { playGiggle, playPop, playSparkle } from "../utils/playfulSfx.ts";

type Live = Bubble & { delay: number };
type Burst = {
  id: number;
  x: number;
  y: number;
  color: Bubble["color"];
  golden: boolean;
  surprise: BubbleSurprise | null;
  points: number | null;
  at: number;
};
type Phase = "play" | "ready" | "done";
type Scene = "savanna" | "beach";

const TICK_MS = 200;
const BURST_MS = 900;
/** Reduced-motion bubbles rest in a 4×2 grid instead of floating away. */
const SLOTS = Array.from({ length: 8 }, (_, index) => ({
  x: 14 + (index % 4) * 24,
  y: index < 4 ? 32 : 70,
}));

const colorLabel = (color: Bubble["color"]) =>
  BUBBLE_COLORS.find((item) => item.id === color)?.label ?? "";

const bubbleName = (bubble: Bubble) =>
  `${bubble.golden ? "Golden" : colorLabel(bubble.color)} bubble${
    bubble.surprise ? ` with ${bubble.surprise.label}` : ""
  }`;

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Adds one bubble unless the field is full; still bubbles take a free grid slot. */
function addBubble(
  list: Live[],
  id: number,
  challenge: boolean,
  still: boolean,
  delay = 0,
): Live[] {
  const cap = still ? 7 : challenge ? 12 : 8;
  if (list.length >= cap) return list;
  const bubble: Live = { ...makeBubble(id, challenge), delay };
  if (still) {
    const free = SLOTS.filter(
      (slot) => !list.some((item) => item.x === slot.x && item.y === slot.y),
    );
    const slot = free[Math.floor(Math.random() * free.length)];
    if (!slot) return list;
    bubble.x = slot.x;
    bubble.y = slot.y;
  }
  return [...list, bubble];
}

export function BubblePop({
  best,
  onFinish,
}: {
  best: number;
  onFinish: (score: number) => void;
}) {
  const [still, setStill] = useState(prefersReducedMotion);
  const [hidden, setHidden] = useState(false);
  const [scene, setScene] = useState<Scene>("savanna");
  const [challenge, setChallenge] = useState(false);
  const [phase, setPhase] = useState<Phase>("play");
  const nextId = useRef(0);
  const fresh = (asChallenge: boolean) => {
    let list: Live[] = [];
    for (let index = 0; index < START_BUBBLES; index++) {
      // Negative delays start the first bubbles part-way up the sky.
      list = addBubble(
        list,
        ++nextId.current,
        asChallenge,
        still,
        -(index + 1) * (asChallenge ? 1_000 : 1_800),
      );
    }
    return list;
  };
  const [bubbles, setBubbles] = useState<Live[]>(() => fresh(false));
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [tray, setTray] = useState<BubbleSurprise[]>([]);
  const [score, setScore] = useState(START_SCORE);
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_MS / 1000);
  const [announcement, setAnnouncement] = useState("");
  const scoreRef = useRef(START_SCORE);
  // A fast-forwarded clock can tick again before "done" renders; pay once.
  const paid = useRef(false);
  const elapsed = useRef(0);
  const nextSpawn = useRef(RELAX_SPAWN_MS);
  const bestAtStart = useRef(best);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const fieldRef = useRef<HTMLDivElement>(null);
  const refocus = useRef(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setStill(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);

  // One timer drives spawning, burst cleanup, and the challenge clock. Time
  // only counts while the page is visible, so a hidden tab pauses the game.
  useEffect(() => {
    if (phase !== "play") return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - last, TICK_MS * 1.5);
      last = now;
      if (document.hidden) return;
      setBursts((list) =>
        list.some((burst) => now - burst.at > BURST_MS)
          ? list.filter((burst) => now - burst.at <= BURST_MS)
          : list,
      );
      elapsed.current += delta;
      if (challenge) {
        if (elapsed.current >= CHALLENGE_MS) {
          setTimeLeft(0);
          setPhase("done");
          setBubbles([]);
          if (!paid.current) finishRef.current(scoreRef.current.score);
          paid.current = true;
          return;
        }
        setTimeLeft(Math.ceil((CHALLENGE_MS - elapsed.current) / 1000));
      }
      if (elapsed.current >= nextSpawn.current) {
        nextSpawn.current += challenge ? CHALLENGE_SPAWN_MS : RELAX_SPAWN_MS;
        const bubbleId = ++nextId.current;
        setBubbles((list) => addBubble(list, bubbleId, challenge, still));
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase, challenge, still]);

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const field = fieldRef.current;
    (field?.querySelector<HTMLButtonElement>(".bubble") ?? field)?.focus();
  }, [bubbles]);

  const restart = (asChallenge: boolean, nextPhase: Phase) => {
    elapsed.current = 0;
    nextSpawn.current = asChallenge ? CHALLENGE_SPAWN_MS : RELAX_SPAWN_MS;
    scoreRef.current = START_SCORE;
    paid.current = false;
    bestAtStart.current = best;
    setScore(START_SCORE);
    setTimeLeft(CHALLENGE_MS / 1000);
    setBursts([]);
    setBubbles(nextPhase === "play" ? fresh(asChallenge) : []);
    setChallenge(asChallenge);
    setPhase(nextPhase);
  };

  const pop = (bubble: Live, event: MouseEvent<HTMLButtonElement>) => {
    const field = fieldRef.current?.getBoundingClientRect();
    const box = event.currentTarget.getBoundingClientRect();
    if (event.currentTarget.contains(document.activeElement))
      refocus.current = true;
    let points: number | null = null;
    if (challenge) {
      const next = scorePop(scoreRef.current, bubble);
      scoreRef.current = next.state;
      points = next.points;
      setScore(next.state);
      playPop(next.state.combo - 1);
      setAnnouncement(
        `${next.points} points. Score ${next.state.score}.${
          next.state.combo > 1 ? ` Combo ${next.state.combo}!` : ""
        }`,
      );
    } else {
      playPop(Math.floor(Math.random() * 5));
      if (bubble.surprise) {
        const found = bubble.surprise;
        setTray((list) => [...list, found].slice(-8));
      }
      setAnnouncement(
        `Pop! ${bubble.surprise ? `You found ${bubble.surprise.label}!` : ""}`,
      );
    }
    if (bubble.golden) playSparkle();
    if (bubble.surprise) playGiggle();
    setBubbles((list) => list.filter((item) => item.id !== bubble.id));
    setBursts((list) => [
      ...list,
      {
        id: bubble.id,
        x: field
          ? ((box.left + box.width / 2 - field.left) / field.width) * 100
          : bubble.x,
        y: field
          ? ((box.top + box.height / 2 - field.top) / field.height) * 100
          : bubble.y,
        color: bubble.color,
        golden: bubble.golden,
        surprise: bubble.surprise,
        points,
        at: performance.now(),
      },
    ]);
  };

  const floatAway = (id: number) => {
    if (
      fieldRef.current
        ?.querySelector(`[data-bubble="${id}"]`)
        ?.contains(document.activeElement)
    )
      refocus.current = true;
    setBubbles((list) => list.filter((item) => item.id !== id));
  };

  const coins = bubblePopCoins(score.score);
  const newBest = phase === "done" && score.score > bestAtStart.current;

  return (
    <div className="bubble-game">
      <div className="bubble-bar">
        {challenge ? (
          <div className="bubble-stats">
            <span
              className="bubble-chip"
              role="img"
              aria-label={`Score ${score.score}`}
            >
              <Sparkles size={18} aria-hidden="true" />
              {score.score}
            </span>
            <span
              className={`bubble-chip bubble-combo${score.combo > 1 ? " is-hot" : ""}`}
              role="img"
              aria-label={`Combo times ${multiplierFor(score.combo)}`}
            >
              {score.lastColor && (
                <span
                  className={`bubble-dot bubble-${score.lastColor}`}
                  aria-hidden="true"
                />
              )}
              ×{multiplierFor(score.combo)}
            </span>
            <span
              className={`bubble-chip${timeLeft <= 10 && phase === "play" ? " is-urgent" : ""}`}
              role="img"
              aria-label={`${timeLeft} seconds left`}
            >
              <Timer size={18} aria-hidden="true" />
              {timeLeft}
            </span>
          </div>
        ) : (
          <ul
            className="bubble-tray"
            aria-label={
              tray.length
                ? `Surprises found: ${tray.map((item) => item.label).join(", ")}`
                : "Surprises found: none yet"
            }
          >
            {Array.from({ length: 8 }, (_, index) => (
              <li key={index} aria-hidden="true">
                {tray[index]?.emoji}
              </li>
            ))}
          </ul>
        )}
        <div className="bubble-toggles">
          <button
            type="button"
            className="bubble-toggle"
            aria-label={
              scene === "savanna" ? "Go to the beach" : "Go to the savanna"
            }
            title={scene === "savanna" ? "Beach" : "Savanna"}
            onClick={() =>
              setScene((current) =>
                current === "savanna" ? "beach" : "savanna",
              )
            }
          >
            {scene === "savanna" ? <Waves size={22} /> : <Sun size={22} />}
          </button>
          <button
            type="button"
            className="bubble-toggle"
            aria-label="Challenge mode"
            aria-pressed={challenge}
            title="Challenge"
            onClick={() =>
              challenge ? restart(false, "play") : restart(true, "ready")
            }
          >
            <Trophy size={22} />
          </button>
        </div>
      </div>
      <div
        ref={fieldRef}
        className={`bubble-field bubble-${scene}${still ? " is-still" : ""}${
          hidden ? " is-paused" : ""
        }`}
        role="group"
        aria-label="Bubbles"
        tabIndex={-1}
      >
        <BubbleScene scene={scene} />
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            data-bubble={bubble.id}
            className="bubble-lane"
            style={{
              left: `${bubble.x}%`,
              top: still ? `${bubble.y}%` : undefined,
              animationDuration: `${bubble.riseMs}ms`,
              animationDelay: `${bubble.delay}ms`,
            }}
            onAnimationEnd={(event) => {
              if (event.animationName === "bubble-rise") floatAway(bubble.id);
            }}
          >
            <button
              type="button"
              className={`bubble bubble-${bubble.golden ? "golden" : bubble.color}`}
              style={{
                width: `min(${bubble.size}px, 24vw)`,
                height: `min(${bubble.size}px, 24vw)`,
                animationDuration: `${2_400 + (bubble.id % 5) * 300}ms`,
              }}
              aria-label={`Pop the ${bubbleName(bubble).toLowerCase()}`}
              onClick={(event) => pop(bubble, event)}
            >
              {bubble.surprise && (
                <span className="bubble-peek" aria-hidden="true">
                  {bubble.surprise.emoji}
                </span>
              )}
              {bubble.golden && !bubble.surprise && (
                <span className="bubble-peek" aria-hidden="true">
                  ✨
                </span>
              )}
            </button>
          </div>
        ))}
        {bursts.map((burst) => (
          <span
            key={burst.id}
            className={`bubble-burst bubble-${burst.golden ? "golden" : burst.color}`}
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
            aria-hidden="true"
          >
            <span className="burst-ring" />
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="burst-spark" />
            ))}
            {burst.surprise && (
              <span className="burst-surprise">{burst.surprise.emoji}</span>
            )}
            {burst.points !== null && (
              <span className="burst-points">+{burst.points}</span>
            )}
          </span>
        ))}
        {phase === "ready" && (
          <div className="bubble-overlay">
            <button
              type="button"
              className="bubble-start"
              aria-label="Start the 60 second challenge"
              autoFocus
              onClick={() => restart(true, "play")}
            >
              <Play size={44} fill="currentColor" aria-hidden="true" />
            </button>
            <div className="bubble-overlay-row">
              <span className="bubble-chip">
                <Timer size={18} aria-hidden="true" /> 60
              </span>
              {best > 0 && (
                <span
                  className="bubble-chip"
                  role="img"
                  aria-label={`Best ${best}`}
                >
                  <Trophy size={18} aria-hidden="true" /> {best}
                </span>
              )}
            </div>
          </div>
        )}
        {phase === "done" && (
          <div className="bubble-overlay">
            <div className={`bubble-card${newBest ? " is-record" : ""}`}>
              {newBest && (
                <span
                  className="bubble-trophy"
                  role="img"
                  aria-label="New best score!"
                >
                  <Trophy size={40} aria-hidden="true" />
                </span>
              )}
              <div
                className="bubble-final"
                role="img"
                aria-label={`Final score ${score.score}`}
              >
                <Sparkles size={26} aria-hidden="true" />
                {score.score}
              </div>
              <div className="bubble-overlay-row">
                <span
                  className="bubble-chip"
                  role="img"
                  aria-label={`${coins} coins earned`}
                >
                  <Coins size={18} aria-hidden="true" /> +{coins}
                </span>
                {!newBest && (
                  <span
                    className="bubble-chip"
                    role="img"
                    aria-label={`Best ${Math.max(best, score.score)}`}
                  >
                    <Trophy size={18} aria-hidden="true" />
                    {Math.max(best, score.score)}
                  </span>
                )}
              </div>
              <div className="bubble-overlay-row">
                <button
                  type="button"
                  className="bubble-round-button"
                  aria-label="Play the challenge again"
                  autoFocus
                  onClick={() => restart(true, "play")}
                >
                  <RotateCcw size={26} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="bubble-round-button is-calm"
                  aria-label="Back to relaxed bubbles"
                  onClick={() => restart(false, "play")}
                >
                  <Leaf size={26} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {phase === "done"
          ? `Time's up! You scored ${score.score} and earned ${coins} coins.`
          : announcement}
      </p>
    </div>
  );
}

/** Code-native backdrop: the savanna or the beach under a soft sky. */
function BubbleScene({ scene }: { scene: Scene }) {
  return (
    <svg
      className="bubble-scene"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bubble-sky" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0"
            stopColor={scene === "savanna" ? "#a9def0" : "#8fd7f2"}
          />
          <stop
            offset="0.7"
            stopColor={scene === "savanna" ? "#fdeccb" : "#e6f7fb"}
          />
        </linearGradient>
        <radialGradient id="bubble-sun">
          <stop offset="0.55" stopColor="#ffd86b" />
          <stop offset="1" stopColor="#ffd86b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="url(#bubble-sky)" />
      <circle cx="660" cy="96" r="70" fill="url(#bubble-sun)" />
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="170" cy="96" rx="58" ry="18" />
        <ellipse cx="200" cy="82" rx="34" ry="22" />
        <ellipse cx="470" cy="150" rx="44" ry="13" />
        <ellipse cx="492" cy="140" rx="24" ry="15" />
      </g>
      {scene === "savanna" ? (
        <>
          <path d="M0 360Q160 300 330 345T800 330V500H0Z" fill="#cddc9a" />
          {[
            [150, 286, 1],
            [618, 274, 0.8],
          ].map(([x, y, scale]) => (
            <g
              key={x}
              transform={`translate(${x} ${y}) scale(${scale})`}
              fill="#6f8f4e"
            >
              <path
                d="M0 70V18M0 30L-22 4M0 24L20 2"
                stroke="#6f8f4e"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="0" cy="0" rx="64" ry="12" />
              <ellipse cx="-28" cy="-8" rx="34" ry="11" />
              <ellipse cx="24" cy="-10" rx="38" ry="12" />
              <ellipse cx="-2" cy="-18" rx="26" ry="9" />
            </g>
          ))}
          <path d="M0 420Q200 380 420 415T800 400V500H0Z" fill="#a8c76d" />
          <g fill="#ffffff">
            <circle cx="90" cy="452" r="5" />
            <circle cx="300" cy="470" r="4" />
            <circle cx="560" cy="456" r="5" />
            <circle cx="730" cy="474" r="4" />
          </g>
          <g fill="#f7a541">
            <circle cx="90" cy="452" r="2" />
            <circle cx="560" cy="456" r="2" />
          </g>
        </>
      ) : (
        <>
          <path d="M0 330H800V420H0Z" fill="#5ec8e2" />
          <path
            d="M0 352q25-8 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path d="M0 410Q300 385 800 412V500H0Z" fill="#f6dfa8" />
          <g fill="#4f8a5b">
            <path d="M688 420Q676 350 706 290L716 294Q692 352 702 420Z" />
            <path d="M711 292Q676 262 640 284Q676 276 711 292Z" />
            <path d="M711 292Q738 252 778 266Q742 270 711 292Z" />
            <path d="M711 292Q700 250 728 228Q712 260 711 292Z" />
          </g>
          <g fill="#f29b7d">
            <circle cx="140" cy="460" r="6" />
            <circle cx="420" cy="472" r="5" />
          </g>
        </>
      )}
    </svg>
  );
}
