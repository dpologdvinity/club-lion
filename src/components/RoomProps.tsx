import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { RoomManifest } from "../rooms/types.ts";
import { playCuteSound } from "../utils/cuteSfx.ts";
import { catcherAt, clampToStage } from "../utils/roomProps.ts";
import "./roomProps.css";

type Prop = NonNullable<RoomManifest["props"]>[number];
type Point = { x: number; y: number };

// shortcut: spots last for the session (rooms remount on travel) and reset on reload; move into the save if kids miss them.
const spots = new Map<string, Point>();

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

/** Pick up, carry and drop props anywhere; drop one on a neighbor to give it. */
export function RoomProps({
  manifest,
  neighbors,
  sound,
  onGive,
}: {
  manifest: RoomManifest;
  neighbors: readonly ({ id: string } & Point)[];
  sound: boolean;
  onGive: (neighborId: string, prop: Prop) => void;
}) {
  const props = manifest.props ?? [];
  const key = (id: string) => `${manifest.id}:${id}`;
  const [places, setPlaces] = useState<Record<string, Point>>(() =>
    Object.fromEntries(
      props.map((p) => [p.id, spots.get(key(p.id)) ?? { x: p.x, y: p.y }]),
    ),
  );
  const [held, setHeld] = useState<string | null>(null);
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
    spots.set(key(id), spot);
    setPlaces((all) => ({ ...all, [id]: spot }));
    return spot;
  };
  const hop = (id: string) =>
    setHops((all) => ({ ...all, [id]: (all[id] ?? 0) + 1 }));

  const drop = (prop: Prop, point: Point) => {
    const catcher = catcherAt(point, neighbors);
    if (!catcher) {
      cue("pop");
      hop(prop.id);
      return;
    }
    cue("sparkle");
    onGive(catcher, prop);
    // The neighbor takes it; a fresh one appears back at its starting spot.
    spots.set(key(prop.id), { x: prop.x, y: prop.y });
    setGiven((all) => [...all, prop.id]);
    timers.current.push(
      window.setTimeout(() => {
        place(prop.id, { x: prop.x, y: prop.y });
        setGiven((all) => all.filter((id) => id !== prop.id));
      }, 1600),
    );
  };

  const down = (prop: Prop, event: PointerEvent<HTMLButtonElement>) => {
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
    place(prop.id, { x: at.x + step[0], y: at.y + step[1] });
  };

  return (
    <>
      {props.map((prop) => {
        if (given.includes(prop.id)) return null;
        const at = places[prop.id];
        return (
          <button
            key={prop.id}
            type="button"
            className={`room-prop${held === prop.id ? " is-held" : ""}`}
            style={{ left: at.x, top: at.y }}
            aria-label={`Pick up the ${prop.label}`}
            aria-pressed={held === prop.id}
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
