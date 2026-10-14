import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Coin } from "./Lion";
import { SeekCoverArt, SeekSceneArt } from "./SeekSafariScenes";
import {
  SEEK_HINT_MS,
  SEEK_SCENE_LIST,
  planSeekRound,
  seekRoundCoins,
  type SeekPlacement,
  type SeekRound,
  type SeekSceneId,
} from "../utils/seekSafari.ts";
import { playCuteSound } from "../utils/cuteSfx.ts";

const SCENE_ICONS: Record<SeekSceneId, string> = {
  savanna: "🦓🌳",
  beach: "🦀🌊",
  jungle: "🐒🌿",
};

const seconds = (ms: number) => `${Math.floor(ms / 1000)}s`;

export function HideAndSeekSafari({
  bestMs,
  onComplete,
}: {
  bestMs?: number;
  onComplete: (round: {
    scene: SeekSceneId;
    hard: boolean;
    timeMs: number;
  }) => void;
}) {
  const [hard, setHard] = useState(false);
  const [round, setRound] = useState<SeekRound | null>(null);
  const [found, setFound] = useState(0);
  const [hint, setHint] = useState(false);
  const [miss, setMiss] = useState<{
    x: number;
    y: number;
    key: number;
  } | null>(null);
  const [shrug, setShrug] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalMs, setFinalMs] = useState<number | null>(null);
  const startedAt = useRef(0);
  const paidRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstSceneRef = useRef<HTMLButtonElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const done = round !== null && found >= round.targets.length;
  const target = round && !done ? round.targets[found] : null;

  // The hint wiggle waits a little longer on tricky rounds.
  useEffect(() => {
    setHint(false);
    if (!round || done) return;
    const id = window.setTimeout(
      () => setHint(true),
      round.hard ? SEEK_HINT_MS * 3 : SEEK_HINT_MS,
    );
    return () => window.clearTimeout(id);
  }, [round, found, done]);

  useEffect(() => {
    if (!round?.hard || done) return;
    const id = window.setInterval(
      () => setElapsed(performance.now() - startedAt.current),
      250,
    );
    return () => window.clearInterval(id);
  }, [round, done]);

  useEffect(() => {
    if (done) againRef.current?.focus();
    else if (round) cardRef.current?.focus();
    else firstSceneRef.current?.focus();
  }, [round, done, found]);

  const start = (scene: SeekSceneId) => {
    paidRef.current = false;
    startedAt.current = performance.now();
    setElapsed(0);
    setFinalMs(null);
    setFound(0);
    setRound(planSeekRound(scene, hard));
    playCuteSound("sparkle");
  };

  const tapCritter = (placement: SeekPlacement) => {
    if (!round || !target) return;
    if (placement !== target) {
      setShrug(placement.critter.id);
      playCuteSound("boing");
      return;
    }
    const next = found + 1;
    setFound(next);
    playCuteSound("yay");
    if (next === round.targets.length && !paidRef.current) {
      paidRef.current = true;
      const timeMs = Math.max(
        1,
        Math.round(performance.now() - startedAt.current),
      );
      setFinalMs(timeMs);
      onComplete({ scene: round.scene, hard: round.hard, timeMs });
    }
  };

  const tapScene = (event: MouseEvent<HTMLDivElement>) => {
    if (done) return;
    if (event.target instanceof Element && event.target.closest("button"))
      return;
    const box = event.currentTarget.getBoundingClientRect();
    setMiss({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
      key: Date.now(),
    });
    playCuteSound("boing");
  };

  if (!round) {
    return (
      <div className="seek">
        <div className="seek-intro">
          <h3 className="seek-title">
            <span aria-hidden="true">🔍🦁</span> Hide &amp; Seek Safari
          </h3>
          <div className="seek-places" role="group" aria-label="Pick a place">
            {SEEK_SCENE_LIST.map((scene, i) => (
              <button
                key={scene.id}
                ref={i === 0 ? firstSceneRef : undefined}
                type="button"
                className="seek-place"
                aria-label={`Play in the ${scene.name.toLowerCase()}`}
                onClick={() => start(scene.id)}
              >
                <SeekSceneArt scene={scene.id} />
                <span className="seek-place-icon" aria-hidden="true">
                  {SCENE_ICONS[scene.id]}
                </span>
              </button>
            ))}
          </div>
          <div className="seek-options">
            <button
              type="button"
              className="seek-tricky"
              aria-pressed={hard}
              aria-label="Tricky mode: smaller animals, decoys and a timer"
              onClick={() => {
                setHard((h) => !h);
                playCuteSound("sparkle");
              }}
            >
              <span aria-hidden="true">{hard ? "⭐" : "☆"}</span>
              <span aria-hidden="true">⏱️</span>
            </button>
            {bestMs !== undefined && (
              <span
                className="seek-best"
                role="img"
                aria-label={`Best tricky time ${seconds(bestMs)}`}
              >
                <span aria-hidden="true">🏆 {seconds(bestMs)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const lookFor = target
    ? `Find the ${target.critter.name.toLowerCase()}`
    : "You found them all";
  const placements = [...round.targets, ...round.decoys].sort(
    (a, b) => a.x - b.x,
  );
  const coverDepth = round.hard ? 0.55 : 0.32;
  return (
    <div className={`seek ${round.hard ? "is-hard" : ""}`}>
      <div className="seek-hud">
        <div
          ref={cardRef}
          tabIndex={-1}
          className="seek-card"
          role="img"
          aria-label={lookFor}
        >
          <span key={found} className="seek-card-critter" aria-hidden="true">
            {target ? target.critter.emoji : "🎉"}
          </span>
        </div>
        <ol
          className="seek-progress"
          aria-label={`${found} of ${round.targets.length} found`}
        >
          {round.targets.map((p, i) => (
            <li
              key={p.critter.id}
              className={i < found ? "is-found" : ""}
              aria-hidden="true"
            >
              {i < found ? p.critter.emoji : ""}
            </li>
          ))}
        </ol>
        {round.hard && (
          <span className="seek-timer" role="timer" aria-label="Time">
            <span aria-hidden="true">⏱️</span> {seconds(finalMs ?? elapsed)}
          </span>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {lookFor}
      </p>
      <div
        className={`seek-scene seek-scene-${round.scene}`}
        onClick={tapScene}
        data-testid="seek-scene"
      >
        <SeekSceneArt scene={round.scene} />
        {placements.map((p) => {
          const index = round.targets.indexOf(p);
          const isFound = index >= 0 && index < found;
          return (
            <div
              key={p.critter.id}
              className={[
                "seek-item",
                isFound ? "is-found" : "",
                p === target && hint ? "is-hint" : "",
                shrug === p.critter.id ? "is-shrug" : "",
              ].join(" ")}
              style={{ left: `${p.x}%`, top: `${p.y}%`, "--seek-size": p.size }}
              onAnimationEnd={() => shrug === p.critter.id && setShrug(null)}
            >
              <button
                type="button"
                className="seek-critter"
                aria-label={p.critter.name}
                disabled={isFound || done}
                onClick={() => tapCritter(p)}
              >
                <span aria-hidden="true">{p.critter.emoji}</span>
              </button>
              {!isFound && <SeekCoverArt cover={p.cover} depth={coverDepth} />}
              {isFound && <span className="seek-sparkle" aria-hidden="true" />}
            </div>
          );
        })}
        {miss && (
          <span
            key={miss.key}
            className="seek-miss"
            style={{ left: `${miss.x}%`, top: `${miss.y}%` }}
            aria-hidden="true"
          />
        )}
        {done && (
          <div className="seek-win">
            <div className="seek-parade" aria-hidden="true">
              {round.targets.map((p, i) => (
                <span key={p.critter.id} style={{ "--i": i }}>
                  {p.critter.emoji}
                </span>
              ))}
            </div>
            <p className="seek-win-reward">
              + <Coin amount={seekRoundCoins(round.hard)} />
              {round.hard && finalMs !== null && (
                <span className="seek-win-time">
                  <span aria-hidden="true">⏱️</span> {seconds(finalMs)}
                  {bestMs === undefined || finalMs <= bestMs ? (
                    <span role="img" aria-label="New best time">
                      {" "}
                      🏆
                    </span>
                  ) : null}
                </span>
              )}
            </p>
            <div className="seek-win-actions">
              <button
                ref={againRef}
                type="button"
                className="seek-big-button"
                aria-label="Play again"
                onClick={() => start(round.scene)}
              >
                <span aria-hidden="true">🔄</span>
              </button>
              <button
                type="button"
                className="seek-big-button"
                aria-label="Pick a new place"
                onClick={() => setRound(null)}
              >
                <span aria-hidden="true">🗺️</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
