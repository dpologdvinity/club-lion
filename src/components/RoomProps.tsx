import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { RoomManifest } from "../rooms/types.ts";
import { playCuteSound } from "../utils/cuteSfx.ts";
import { YOUR_DOLL, catcherAt, clampToStage } from "../utils/roomProps.ts";
import "./roomProps.css";

type Prop = NonNullable<RoomManifest["props"]>[number];
type Point = { x: number; y: number };

/** Where a held prop sits next to the doll's feet point (stage px): beside her hand. */
const HAND = { x: 78, y: -150 };
/** The doll's body is this far above her feet; drops aim at the body. */
const BODY_LIFT = 100;

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-40, 0],
  ArrowRight: [40, 0],
  ArrowUp: [0, -30],
  ArrowDown: [0, 30],
};

type Drag = {
  id: string;
  pointer: number;
  startX: number;
  startY: number;
  origin: Point;
  scale: number;
  moved: boolean;
};

/**
 * Pick up, carry and drop props anywhere; drop one on a neighbor to give it,
 * or on your own doll to hold it while she walks.
 */
export function RoomProps({
  manifest,
  neighbors,
  doll,
  saved,
  sound,
  onGive,
  onMove,
}: {
  manifest: RoomManifest;
  neighbors: readonly ({ id: string } & Point)[];
  /** The player's doll: feet in stage px and her current glide time. */
  doll: Point & { glideMs: number };
  /** Saved spots keyed `${roomId}:${propId}`. */
  saved: Readonly<Record<string, Point>> | undefined;
  sound: boolean;
  onGive: (neighborId: string, prop: Prop) => void;
  /** Persist a put-down spot; null sends the prop back home. */
  onMove: (propId: string, point: Point | null) => void;
}) {
  const props = manifest.props ?? [];
  const [places, setPlaces] = useState<Record<string, Point>>(() =>
    Object.fromEntries(
      props.map((p) => [
        p.id,
        saved?.[`${manifest.id}:${p.id}`] ?? { x: p.x, y: p.y },
      ]),
    ),
  );
  const [held, setHeld] = useState<string | null>(null);
  // Session-only: the prop in the doll's hand.
  const [inHand, setInHand] = useState<string | null>(null);
  const [hops, setHops] = useState<Record<string, number>>({});
  const [given, setGiven] = useState<string[]>([]);
  const drag = useRef<Drag | null>(null);
  const skipClick = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const cue = (name: "pop" | "boing" | "sparkle") => {
    if (sound) playCuteSound(name);
  };
  const place = (id: string, point: Point) => {
    const spot = clampToStage(point, {
      width: manifest.stageWidth,
      height: manifest.stageHeight,
    });
    setPlaces((all) => ({ ...all, [id]: spot }));
    return spot;
  };
  const hop = (id: string) =>
    setHops((all) => ({ ...all, [id]: (all[id] ?? 0) + 1 }));

  const putDown = (prop: Prop) => {
    setInHand(null);
    onMove(prop.id, place(prop.id, { x: doll.x + 60, y: doll.y }));
    cue("pop");
    hop(prop.id);
  };

  const drop = (prop: Prop, point: Point) => {
    const catcher = catcherAt(point, neighbors, {
      x: doll.x,
      y: doll.y - BODY_LIFT,
    });
    if (!catcher) {
      onMove(prop.id, point);
      cue("pop");
      hop(prop.id);
      return;
    }
    if (catcher === YOUR_DOLL) {
      // One prop in hand at a time: the old one goes down at her feet.
      const old = props.find((p) => p.id === inHand && p.id !== prop.id);
      if (old) putDown(old);
      setInHand(prop.id);
      cue("boing");
      hop(prop.id);
      return;
    }
    cue("sparkle");
    onGive(catcher, prop);
    // The neighbor takes it; a fresh one appears back at its starting spot.
    onMove(prop.id, null);
    setGiven((all) => [...all, prop.id]);
    timers.current.push(
      window.setTimeout(() => {
        place(prop.id, { x: prop.x, y: prop.y });
        setGiven((all) => all.filter((id) => id !== prop.id));
      }, 1600),
    );
  };

  const down = (prop: Prop, event: PointerEvent<HTMLButtonElement>) => {
    // A drag that ended off the button never clicked; forget its skip.
    skipClick.current = false;
    if (inHand === prop.id) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      id: prop.id,
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: places[prop.id],
      scale: box.width / event.currentTarget.offsetWidth || 1,
      moved: false,
    };
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== event.pointerId) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    d.moved = true;
    place(d.id, { x: d.origin.x + dx / d.scale, y: d.origin.y + dy / d.scale });
  };
  const up = (prop: Prop, event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== event.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    skipClick.current = true;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    drop(
      prop,
      place(prop.id, {
        x: d.origin.x + dx / d.scale,
        y: d.origin.y + dy / d.scale,
      }),
    );
  };
  const click = (prop: Prop) => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    if (inHand === prop.id) {
      putDown(prop);
      return;
    }
    if (held === prop.id) {
      setHeld(null);
      drop(prop, places[prop.id]);
      return;
    }
    // A tap bounces the prop; Enter or a second tap carries it with the arrow keys.
    setHeld(prop.id);
    cue("boing");
    hop(prop.id);
  };
  const keyDown = (prop: Prop, event: KeyboardEvent<HTMLButtonElement>) => {
    const step = KEY_STEPS[event.key];
    if (!step || held !== prop.id) return;
    event.preventDefault();
    const at = places[prop.id];
    onMove(prop.id, place(prop.id, { x: at.x + step[0], y: at.y + step[1] }));
  };

  return (
    <>
      {props.map((prop) => {
        if (given.includes(prop.id)) return null;
        const at = places[prop.id];
        const holding = inHand === prop.id;
        return (
          <button
            key={prop.id}
            type="button"
            className={`room-prop${held === prop.id ? " is-held" : ""}${holding ? " is-in-hand" : ""}`}
            style={
              holding
                ? {
                    left: doll.x + HAND.x,
                    top: doll.y + HAND.y,
                    transition: `left ${doll.glideMs}ms cubic-bezier(0.2, 0.6, 0.4, 1), top ${doll.glideMs}ms cubic-bezier(0.2, 0.6, 0.4, 1)`,
                  }
                : { left: at.x, top: at.y }
            }
            aria-label={
              holding
                ? `Put down the ${prop.label}`
                : `Pick up the ${prop.label}`
            }
            aria-pressed={holding ? undefined : held === prop.id}
            data-prop={prop.id}
            onPointerDown={(event) => down(prop, event)}
            onPointerMove={move}
            onPointerUp={(event) => up(prop, event)}
            onPointerCancel={() => (drag.current = null)}
            onBlur={() => held === prop.id && setHeld(null)}
            onKeyDown={(event) => keyDown(prop, event)}
            onClick={() => click(prop)}
          >
            <span
              key={hops[prop.id] ?? 0}
              className={hops[prop.id] ? "room-prop-hop" : undefined}
              aria-hidden="true"
            >
              {prop.emoji}
            </span>
          </button>
        );
      })}
    </>
  );
}
