import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { Play, RotateCcw, Star } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import {
  PICTURES,
  PUZZLE_HEIGHT,
  PUZZLE_WIDTH,
  isNearSlot,
  pieceShapes,
  shufflePieces,
  slotCenter,
  type PictureId,
  type PieceShape,
} from "../utils/picturePuzzle.ts";
import { PuzzleScene } from "./PuzzleScenes";

const STICKERS = ["🌟", "🌈", "🏆"];
/** Quiet time before the hint outlines the next spot. */
const HINT_MS = 8000;
const CONFETTI_COLORS = ["#ff7aa2", "#5ec8e2", "#ffb347", "#ffd84d", "#4cc97a"];
/** Confetti pieces laid out on a fixed grid, so they never shift between renders. */
const CONFETTI = Array.from({ length: 18 }, (_, index) => ({
  left: (index * 37) % 100,
  top: (index * 53) % 70,
  delay: (index % 6) * 90,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));

type Gesture = { piece: number; x: number; y: number; moved: boolean };
type Drag = { piece: number; x: number; y: number };
/** A piece that did not fit flies back to its place in the tray. */
type Back = {
  piece: number;
  key: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
};

/** Puts each piece into its spot on the picture. Pictures pay once each. */
export function PicturePuzzle({
  onPictureDone,
}: {
  /** Called once per finished picture with its piece count. */
  onPictureDone: (pieces: number) => void;
}) {
  const [round, setRound] = useState(0);
  const picture = PICTURES[round];
  const shapes = useMemo(() => pieceShapes(picture.pieces), [picture.pieces]);
  const [tray, setTray] = useState<number[]>(() =>
    shufflePieces(PICTURES[0].pieces),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [back, setBack] = useState<Back | null>(null);
  const [miss, setMiss] = useState<{ spot: number; key: number } | null>(null);
  const [idle, setIdle] = useState(0);
  const [hint, setHint] = useState(false);
  const [stickers, setStickers] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const trayRef = useRef(tray);
  const paidRound = useRef<number | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const dragged = useRef(false);
  const refocus = useRef(false);
  const missKey = useRef(0);
  const trayButtons = useRef<Partial<Record<number, HTMLButtonElement | null>>>(
    {},
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef(onPictureDone);
  finishRef.current = onPictureDone;

  const done = tray.length === 0;
  const hintSpot = hint && !done ? tray[0] : null;

  useEffect(() => {
    if (done) return;
    const id = window.setTimeout(() => setHint(true), HINT_MS);
    return () => window.clearTimeout(id);
  }, [idle, done]);

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    gameRef.current
      ?.querySelector<HTMLButtonElement>(".pp-piece, .pp-next")
      ?.focus();
  }, [tray]);

  const touch = () => {
    setIdle((count) => count + 1);
    setHint(false);
  };

  const fit = (piece: number) => {
    const remaining = trayRef.current.filter((item) => item !== piece);
    trayRef.current = remaining;
    setTray(remaining);
    setSelected(null);
    refocus.current = true;
    if (remaining.length) {
      playCuteSound("pop");
      setAnnouncement(`Piece ${piece + 1} fits! ${remaining.length} to go.`);
      return;
    }
    playCuteSound("yay");
    setStickers((list) => [...list, STICKERS[round]]);
    if (paidRound.current !== round) {
      paidRound.current = round;
      finishRef.current(picture.pieces);
    }
    setAnnouncement(`${picture.name} done! You earned a sticker.`);
  };

  /** A piece in the wrong spot boings and goes back to the tray. It never costs anything. */
  const refuse = (piece: number, spot: number) => {
    playCuteSound("boing");
    missKey.current += 1;
    setMiss({ spot, key: missKey.current });
    setAnnouncement("Boing! That piece goes in another spot. Try again.");
  };

  /** A spot is open while its own piece is still in the tray. */
  const tryPlace = (piece: number, spot: number) => {
    if (!trayRef.current.includes(spot)) return false;
    if (piece === spot) {
      fit(piece);
      return true;
    }
    refuse(piece, spot);
    return false;
  };

  const startRound = (index: number) => {
    const next = shufflePieces(PICTURES[index].pieces);
    trayRef.current = next;
    setTray(next);
    setSelected(null);
    setDrag(null);
    setBack(null);
    setMiss(null);
    setRound(index);
    setIdle((count) => count + 1);
    setHint(false);
    if (index === 0) setStickers([]);
    setAnnouncement(`${PICTURES[index].name}. Drag each piece to its spot.`);
  };

  const pieceDown = (piece: number, event: PointerEvent<HTMLButtonElement>) => {
    touch();
    gesture.current = {
      piece,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pieceMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    if (!current) return;
    if (
      !current.moved &&
      Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8
    )
      return;
    current.moved = true;
    setDrag({ piece: current.piece, x: event.clientX, y: event.clientY });
  };

  const pieceUp = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    gesture.current = null;
    setDrag(null);
    if (!current?.moved) return;
    // A drag ends with no click on the piece, so the next click is not swallowed.
    dragged.current = true;
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * PUZZLE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * PUZZLE_HEIGHT,
    };
    const shape = shapes[current.piece];
    const spot = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-spot]");
    const target = Number(spot?.dataset.spot);
    if (
      isNearSlot(
        point,
        slotCenter(shape),
        Math.min(shape.width, shape.height),
      ) ||
      target === current.piece
    ) {
      tryPlace(current.piece, current.piece);
      return;
    }
    const tile = trayButtons.current[current.piece]?.getBoundingClientRect();
    if (tile) {
      missKey.current += 1;
      setBack({
        piece: current.piece,
        key: missKey.current,
        x: event.clientX,
        y: event.clientY,
        dx: tile.left + tile.width / 2 - event.clientX,
        dy: tile.top + tile.height / 2 - event.clientY,
      });
    }
    if (spot && Number.isInteger(target)) tryPlace(current.piece, target);
  };

  const pickPiece = (piece: number) => {
    touch();
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    setSelected((current) => (current === piece ? null : piece));
  };

  const pickSpot = (spot: number) => {
    touch();
    if (selected !== null) {
      if (!tryPlace(selected, spot))
        setAnnouncement(
          "Not that spot. Try another, or pick a different piece.",
        );
    } else {
      setAnnouncement("Pick a piece first, then tap its spot.");
    }
  };

  return (
    <div className="pp-game" ref={gameRef}>
      <PuzzleScene picture={picture.id} />
      <div className="pp-bar">
        <ol
          className="pp-rounds"
          aria-label={`Picture ${round + 1} of ${PICTURES.length}`}
        >
          {PICTURES.map((item, index) => (
            <li
              key={item.id}
              className={`pp-round${index === round ? " is-current" : ""}`}
              aria-hidden="true"
            >
              {stickers[index] ?? <Star size={18} aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <span className="pp-caption">{picture.name}</span>
      </div>
      <div
        className={`pp-board${done ? " is-done" : ""}`}
        ref={boardRef}
        key={round}
      >
        <svg
          className="pp-frame"
          viewBox={`0 0 ${PUZZLE_WIDTH} ${PUZZLE_HEIGHT}`}
          aria-hidden="true"
        >
          {shapes.map((shape) => {
            const filled = !tray.includes(shape.index);
            const clip = `pp-board-${round}-${shape.index}`;
            return (
              <g
                key={shape.index}
                className={`pp-spot${hintSpot === shape.index ? " is-hint" : ""}${miss?.spot === shape.index ? " is-missed" : ""}`}
              >
                <clipPath id={clip}>
                  <path d={shape.d} />
                </clipPath>
                {filled && (
                  <g clipPath={`url(#${clip})`}>
                    <use href={`#pp-scene-${picture.id}`} />
                  </g>
                )}
                <path
                  d={shape.d}
                  className={filled ? "pp-edge" : "pp-ghost"}
                  key={miss?.spot === shape.index ? miss.key : 0}
                />
              </g>
            );
          })}
        </svg>
        {shapes.map((shape) => {
          const filled = !tray.includes(shape.index);
          return (
            <button
              key={shape.index}
              type="button"
              className="pp-slot"
              data-spot={shape.index}
              disabled={filled}
              aria-label={`Spot ${shape.index + 1} of ${picture.pieces}${filled ? ", filled" : ""}`}
              style={{
                left: `${(shape.x / PUZZLE_WIDTH) * 100}%`,
                top: `${(shape.y / PUZZLE_HEIGHT) * 100}%`,
                width: `${(shape.width / PUZZLE_WIDTH) * 100}%`,
                height: `${(shape.height / PUZZLE_HEIGHT) * 100}%`,
              }}
              onClick={() => pickSpot(shape.index)}
            >
              {selected !== null && !filled && (
                <span className="pp-target" aria-hidden="true" />
              )}
            </button>
          );
        })}
        {done && (
          <div className="pp-overlay">
            <div className="pp-confetti-field" aria-hidden="true">
              {CONFETTI.map((piece, index) => (
                <span
                  key={index}
                  className="pp-confetti"
                  style={{
                    left: `${piece.left}%`,
                    top: `${piece.top}%`,
                    animationDelay: `${piece.delay}ms`,
                    background: piece.color,
                  }}
                />
              ))}
            </div>
            <span className="pp-sticker" role="img" aria-label="Sticker earned">
              {STICKERS[round]}
            </span>
            <button
              type="button"
              className="pp-next"
              autoFocus
              aria-label={
                round + 1 < PICTURES.length ? "Next picture" : "Play again"
              }
              onClick={() =>
                startRound(round + 1 < PICTURES.length ? round + 1 : 0)
              }
            >
              {round + 1 < PICTURES.length ? (
                <Play size={30} fill="currentColor" aria-hidden="true" />
              ) : (
                <RotateCcw size={30} aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>
      <div className="pp-tray" role="group" aria-label="Puzzle pieces">
        {tray.map((piece) => {
          return (
            <button
              key={piece}
              ref={(node) => {
                trayButtons.current[piece] = node;
              }}
              type="button"
              className={`pp-piece${selected === piece ? " is-selected" : ""}`}
              aria-label={`Piece ${piece + 1}`}
              aria-pressed={selected === piece}
              onPointerDown={(event) => pieceDown(piece, event)}
              onPointerMove={pieceMove}
              onPointerUp={pieceUp}
              onPointerCancel={() => {
                gesture.current = null;
                setDrag(null);
              }}
              onClick={() => pickPiece(piece)}
            >
              <PieceArt
                prefix={`pp-tray-${round}`}
                shape={shapes[piece]}
                picture={picture.id}
              />
            </button>
          );
        })}
      </div>
      {drag && (
        <div
          className="pp-ghost-piece"
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          <PieceArt
            prefix={`pp-drag-${round}`}
            shape={shapes[drag.piece]}
            picture={picture.id}
          />
        </div>
      )}
      {back && (
        <div
          key={back.key}
          className="pp-ghost-piece pp-return"
          style={
            {
              left: back.x,
              top: back.y,
              "--pp-dx": `${back.dx}px`,
              "--pp-dy": `${back.dy}px`,
            } as CSSProperties
          }
          aria-hidden="true"
          onAnimationEnd={() => setBack(null)}
        >
          <PieceArt
            prefix={`pp-back-${round}`}
            shape={shapes[back.piece]}
            picture={picture.id}
          />
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

/** One piece cut from the picture; `prefix` keeps its clip id unique in the document. */
function PieceArt({
  prefix,
  shape,
  picture,
}: {
  prefix: string;
  shape: PieceShape;
  picture: PictureId;
}) {
  const clip = `${prefix}-${shape.index}`;
  const pad = shape.pad;
  return (
    <svg
      viewBox={`${shape.x - pad} ${shape.y - pad} ${shape.width + pad * 2} ${shape.height + pad * 2}`}
      aria-hidden="true"
    >
      <clipPath id={clip}>
        <path d={shape.d} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <use href={`#pp-scene-${picture}`} />
      </g>
      <path d={shape.d} className="pp-edge" />
    </svg>
  );
}
