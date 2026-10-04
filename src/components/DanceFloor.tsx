import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_BPM,
  FLOOR_COLUMNS,
  FLOOR_ROWS,
  FLOOR_TILE_COUNT,
  TILE_GLOW_MS,
  beatAt,
  detectFootfall,
  pulseStrength,
  registerFootfall,
  tileColor,
  tileCoord,
  type FloorBounds,
  type FloorPoint,
  type TileFootfall,
} from "../utils/danceFloorRhythm.ts";

/** Tropical pentatonic scale, so any tile pattern stays harmonious. */
const TILE_SCALE_HZ = [261.63, 293.66, 329.63, 392.0, 440.0];

/** Idle brightness used when the player asked for reduced motion. */
const STATIC_PULSE = 0.35;

function getAudioContextClass(): typeof AudioContext | undefined {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

/** Synth chime: a triangle note with a soft pluck envelope, no audio assets. */
function playTileChime(ctx: AudioContext, tile: number) {
  const coord = tileCoord(tile);
  if (!coord) return;
  const degree = TILE_SCALE_HZ[coord.column % TILE_SCALE_HZ.length];
  const octave = coord.row >= FLOOR_ROWS / 2 ? 1 : 2;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = degree * octave;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export type DanceFloorProps = {
  /** Tempo the tiles pulse to; defaults to the club's 120 BPM house beat. */
  bpm?: number;
  /**
   * Stage rectangle the floor occupies. Supplying it switches the component to
   * bounded mode: the floor positions and sizes itself to the rectangle and
   * maps avatar positions onto the same rectangle. See the placement contract
   * on {@link DanceFloor}.
   */
  floorBounds?: FloorBounds;
  /** Current avatar stage position; each new tile it enters lights up. */
  avatarPosition?: FloorPoint | null;
  /** Silences the procedural chimes without changing the lighting. */
  muted?: boolean;
  /** Reports every tile that lights, from a footfall or a direct press. */
  onTileLight?: (tile: number) => void;
};

/**
 * The Club Pulse LED dance floor: an 8x6 grid of tiles that cycles colour on
 * every beat and flares under avatar footfalls. Tiles are real buttons so the
 * floor is playable with a pointer or the keyboard.
 *
 * Placement contract for world routing (Task 7):
 *
 * - Without `floorBounds` the floor is a responsive standalone fixture: it
 *   fills its container up to 640px wide at an 8:6 aspect ratio.
 * - With `floorBounds` the floor is bounded. It owns its own x/y placement:
 *   the root element is absolutely positioned at `left: bounds.x`,
 *   `top: bounds.y` with `width: bounds.width` and `height: bounds.height` in
 *   stage units. Mount it as a child of the element that establishes the stage
 *   coordinate space (the same positioned container as the room's depth layers
 *   and avatar), and do not wrap it in extra offsets or transforms of your own.
 *   Any scale transform on that container scales the floor with the stage.
 * - In bounded mode the grid rectangle is exactly `floorBounds`: the floor has
 *   no padding, no border, no gap and no corner radius, so the 8 columns and 6
 *   rows each measure `bounds.width / 8` by `bounds.height / 6` and tile
 *   boundaries line up with `tileFromPosition`. Tile borders are drawn inside
 *   the cell (`box-sizing: border-box`), so they never shift the mapping.
 *
 * Audio limitation: the Web Audio context is only created on a direct tile
 * press, which browsers accept as an activation gesture. Footfalls driven by
 * `avatarPosition` light tiles silently until some allowed gesture has
 * initialized the context, so the first avatar step is not guaranteed to chime.
 */
export function DanceFloor({
  bpm = DEFAULT_BPM,
  floorBounds,
  avatarPosition,
  muted = false,
  onTileLight,
}: DanceFloorProps) {
  const floorRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const previousPositionRef = useRef<FloorPoint | null>(null);
  const [footfalls, setFootfalls] = useState<TileFootfall[]>([]);
  const [beat, setBeat] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Under reduced motion the floor holds a steady glow instead of pulsing.
  useEffect(() => {
    const floor = floorRef.current;
    if (!floor) return;
    if (reducedMotion) {
      floor.style.setProperty("--floor-pulse", String(STATIC_PULSE));
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      floor.style.setProperty(
        "--floor-pulse",
        pulseStrength(elapsed, bpm).toFixed(3),
      );
      setBeat(beatAt(elapsed, bpm));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [bpm, reducedMotion]);

  const lightTile = useCallback(
    (tile: number, fromGesture: boolean) => {
      setFootfalls((current) => registerFootfall(current, tile, Date.now()));
      if (!muted) {
        // Only a direct press counts as an activation gesture, so footfalls
        // stay silent until one press has created the context.
        if (!audioRef.current && fromGesture) {
          const AudioContextClass = getAudioContextClass();
          if (AudioContextClass) audioRef.current = new AudioContextClass();
        }
        const ctx = audioRef.current;
        if (ctx) {
          if (ctx.state === "suspended") void ctx.resume();
          playTileChime(ctx, tile);
        }
      }
      onTileLight?.(tile);
    },
    [muted, onTileLight],
  );

  // Each tile the avatar walks into lights once, not once per frame.
  useEffect(() => {
    if (!avatarPosition || !floorBounds) {
      previousPositionRef.current = avatarPosition ?? null;
      return;
    }
    const stepped = detectFootfall(
      previousPositionRef.current,
      avatarPosition,
      floorBounds,
    );
    previousPositionRef.current = avatarPosition;
    if (stepped !== null) lightTile(stepped, false);
  }, [avatarPosition, floorBounds, lightTile]);

  // Clear faded footfalls so tiles return to their idle beat colour.
  useEffect(() => {
    if (footfalls.length === 0) return;
    const timer = window.setTimeout(
      () =>
        setFootfalls((current) => registerFootfall(current, -1, Date.now())),
      TILE_GLOW_MS,
    );
    return () => window.clearTimeout(timer);
  }, [footfalls]);

  useEffect(
    () => () => {
      void audioRef.current?.close();
      audioRef.current = null;
    },
    [],
  );

  const litTiles = new Map(footfalls.map((hit) => [hit.tile, hit.atMs]));
  const bounded = floorBounds ?? null;

  return (
    <div
      className="dance-floor-stage"
      data-bounded={bounded ? "true" : "false"}
      style={
        bounded
          ? {
              left: `${bounded.x}px`,
              top: `${bounded.y}px`,
              width: `${bounded.width}px`,
              height: `${bounded.height}px`,
            }
          : undefined
      }
    >
      <div
        className="dance-floor"
        ref={floorRef}
        role="group"
        aria-label="Club Pulse dance floor"
        data-reduced-motion={reducedMotion ? "true" : "false"}
        data-bounds={
          bounded
            ? `${bounded.x},${bounded.y},${bounded.width},${bounded.height}`
            : undefined
        }
      >
        {Array.from({ length: FLOOR_TILE_COUNT }, (_, tile) => {
          const coord = tileCoord(tile)!;
          const litAt = litTiles.get(tile);
          return (
            <button
              key={tile}
              type="button"
              className="dance-floor-tile"
              data-lit={litAt === undefined ? "false" : "true"}
              style={{ ["--tile-color" as string]: tileColor(tile, beat) }}
              onClick={() => lightTile(tile, true)}
            >
              <span className="sr-only">
                Light tile column {coord.column + 1}, row {coord.row + 1}
              </span>
              {litAt !== undefined && (
                <span
                  key={litAt}
                  className="dance-floor-tile-led"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
      <p className={bounded ? "sr-only" : "dance-floor-hint"}>
        {FLOOR_COLUMNS}&times;{FLOOR_ROWS} LED tiles pulsing at {bpm} BPM. Step
        on a tile to light it and ring a synth chime.
      </p>
    </div>
  );
}
