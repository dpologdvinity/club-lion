import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Play, RotateCcw, Star } from "lucide-react";
import { playCuteSound } from "../utils/cuteSfx.ts";
import {
  SHAPE_LABELS,
  SHAPE_SORTER_ROUNDS,
  SORTER_ANIMALS,
  SORTER_ROUNDS,
  isMatch,
  shuffled,
  type ShapeId,
  type SorterAnimal,
} from "../utils/shapeSorter.ts";
import { AnimalArt } from "./AnimalArt";
import { ShapeGlyph } from "./ShapeGlyph";

const COLORS: Record<ShapeId, string> = {
  circle: "#ff7aa2",
  square: "#5ec8e2",
  triangle: "#ffb347",
  star: "#ffd84d",
  heart: "#ff5f7e",
};
const STICKERS = ["🌟", "🌈", "🏆"];
const NAMES: Record<SorterAnimal, string> = {
  lion: "Lion",
  zebra: "Zebra",
  giraffe: "Giraffe",
  hippo: "Hippo",
  monkey: "Monkey",
  parrot: "Parrot",
  bunny: "Bunny",
  bear: "Bear",
  elephant: "Elephant",
  frog: "Frog",
};
/** Confetti pieces laid out on a fixed grid, so they never shift between renders. */
const CONFETTI = Array.from({ length: 18 }, (_, index) => ({
  left: (index * 37) % 100,
  top: (index * 53) % 70,
  delay: (index % 6) * 90,
  color: Object.values(COLORS)[index % 5],
}));

type Gesture = { shape: ShapeId; x: number; y: number; moved: boolean };

/** Puts a shape into the matching animal's hole. Rounds pay once each. */
export function ShapeSorter({
  onRoundDone,
}: {
  /** Called once per finished round with its 1-based number. */
  onRoundDone: (round: number) => void;
}) {
  const [round, setRound] = useState(0);
  const [pieces, setPieces] = useState<ShapeId[]>(() =>
    shuffled(SORTER_ROUNDS[0].map((pair) => pair.shape)),
  );
  const [filled, setFilled] = useState<Partial<Record<SorterAnimal, ShapeId>>>(
    {},
  );
  const [selected, setSelected] = useState<ShapeId | null>(null);
  const [drag, setDrag] = useState<{
    shape: ShapeId;
    x: number;
    y: number;
  } | null>(null);
  const [miss, setMiss] = useState<{
    animal: SorterAnimal;
    key: number;
  } | null>(null);
  const [stickers, setStickers] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const filledRef = useRef<Partial<Record<SorterAnimal, ShapeId>>>({});
  const paidRound = useRef<number | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const dragged = useRef(false);
  const refocus = useRef(false);
  const missKey = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef(onRoundDone);
  finishRef.current = onRoundDone;

  const pairs = SORTER_ROUNDS[round];
  const done = Object.keys(filled).length === pairs.length;

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    gameRef.current
      ?.querySelector<HTMLButtonElement>(".sorter-piece, .sorter-next")
      ?.focus();
  }, [pieces]);

  const drop = (shape: ShapeId, animal: SorterAnimal) => {
    if (done || filledRef.current[animal]) return;
    if (!isMatch(pairs, animal, shape)) {
      // A wrong drop bounces back with a boing; it never costs anything.
      playCuteSound("boing");
      missKey.current += 1;
      setMiss({ animal, key: missKey.current });
      setAnnouncement(
        `Boing! The ${SHAPE_LABELS[shape].toLowerCase()} does not fit there. Try another animal.`,
      );
      return;
    }
    const next = { ...filledRef.current, [animal]: shape };
    filledRef.current = next;
    setFilled(next);
    setPieces((list) => list.filter((item) => item !== shape));
    setSelected(null);
    refocus.current = true;
    if (Object.keys(next).length < pairs.length) {
      playCuteSound("pop");
      setAnnouncement(`${SHAPE_LABELS[shape]} fits the ${NAMES[animal]}!`);
      return;
    }
    playCuteSound("yay");
    setStickers((list) => [...list, STICKERS[round]]);
    if (paidRound.current !== round) {
      paidRound.current = round;
      finishRef.current(round + 1);
    }
    setAnnouncement(`Round ${round + 1} done! You earned a sticker.`);
  };

  const startRound = (index: number) => {
    filledRef.current = {};
    setFilled({});
    setPieces(shuffled(SORTER_ROUNDS[index].map((pair) => pair.shape)));
    setSelected(null);
    setMiss(null);
    setRound(index);
    if (index === 0) setStickers([]);
    setAnnouncement(
      `Round ${index + 1}. Drag each shape into the animal it fits.`,
    );
  };

  const pieceDown = (
    shape: ShapeId,
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    gesture.current = {
      shape,
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
    setDrag({ shape: current.shape, x: event.clientX, y: event.clientY });
  };

  const pieceUp = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    gesture.current = null;
    setDrag(null);
    if (!current?.moved) return;
    // A drag ends with no click on the piece, so the next click is not swallowed.
    dragged.current = true;
    const hole = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-animal]");
    const animal = SORTER_ANIMALS.find((item) => item === hole?.dataset.animal);
    if (animal) drop(current.shape, animal);
  };

  const pickPiece = (shape: ShapeId) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    setSelected((current) => (current === shape ? null : shape));
  };

  const pickHole = (animal: SorterAnimal) => {
    if (selected) drop(selected, animal);
    else setAnnouncement("Pick a shape first, then tap an animal.");
  };

  return (
    <div className="sorter-game" ref={gameRef}>
      <div className="sorter-bar">
        <ol
          className="sorter-rounds"
          aria-label={`Round ${round + 1} of ${SHAPE_SORTER_ROUNDS}`}
        >
          {Array.from({ length: SHAPE_SORTER_ROUNDS }, (_, index) => (
            <li
              key={index}
              className={`sorter-round${index === round ? " is-current" : ""}`}
              aria-hidden="true"
            >
              {stickers[index] ?? <Star size={18} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
      <div className="sorter-board">
        {pairs.map((pair) => {
          const placed = filled[pair.animal];
          const missed = miss?.animal === pair.animal ? miss.key : 0;
          return (
            <button
              key={pair.animal}
              type="button"
              data-animal={pair.animal}
              className={`sorter-hole${selected && !placed ? " is-ready" : ""}${placed ? " is-filled" : ""}`}
              aria-label={`${NAMES[pair.animal]} hole${placed ? ", filled" : ""}`}
              onClick={() => pickHole(pair.animal)}
            >
              <span
                key={missed}
                className={missed ? "sorter-bounce" : undefined}
              >
                <span className="sorter-art">
                  <AnimalArt animal={pair.animal} hole={pair.shape} />
                  {placed && (
                    <svg
                      className="sorter-fill"
                      viewBox="0 0 200 220"
                      aria-hidden="true"
                    >
                      <g transform="translate(76 148) scale(0.5)">
                        <ShapeGlyph shape={placed} fill={COLORS[placed]} />
                      </g>
                    </svg>
                  )}
                </span>
              </span>
              <span className="sorter-name">{NAMES[pair.animal]}</span>
            </button>
          );
        })}
        {done && (
          <div className="sorter-overlay">
            <div className="sorter-confetti-field" aria-hidden="true">
              {CONFETTI.map((piece, index) => (
                <span
                  key={index}
                  className="sorter-confetti"
                  style={{
                    left: `${piece.left}%`,
                    top: `${piece.top}%`,
                    animationDelay: `${piece.delay}ms`,
                    background: piece.color,
                  }}
                />
              ))}
            </div>
            <span
              className="sorter-sticker"
              role="img"
              aria-label="Sticker earned"
            >
              {STICKERS[round]}
            </span>
            <button
              type="button"
              className="sorter-next"
              autoFocus
              aria-label={
                round + 1 < SHAPE_SORTER_ROUNDS ? "Next round" : "Play again"
              }
              onClick={() =>
                startRound(round + 1 < SHAPE_SORTER_ROUNDS ? round + 1 : 0)
              }
            >
              {round + 1 < SHAPE_SORTER_ROUNDS ? (
                <Play size={30} fill="currentColor" aria-hidden="true" />
              ) : (
                <RotateCcw size={30} aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>
      <div className="sorter-tray" role="group" aria-label="Shapes to sort">
        {pieces.map((shape) => (
          <button
            key={shape}
            type="button"
            className={`sorter-piece${selected === shape ? " is-selected" : ""}`}
            aria-label={`${SHAPE_LABELS[shape]} piece`}
            aria-pressed={selected === shape}
            onPointerDown={(event) => pieceDown(shape, event)}
            onPointerMove={pieceMove}
            onPointerUp={pieceUp}
            onPointerCancel={() => {
              gesture.current = null;
              setDrag(null);
            }}
            onClick={() => pickPiece(shape)}
          >
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <ShapeGlyph shape={shape} fill={COLORS[shape]} />
            </svg>
          </button>
        ))}
      </div>
      {drag && (
        <div
          className="sorter-ghost"
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100">
            <ShapeGlyph shape={drag.shape} fill={COLORS[drag.shape]} />
          </svg>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
