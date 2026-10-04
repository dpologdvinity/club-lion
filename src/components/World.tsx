import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Coffee,
  Gamepad2,
  Home,
  Map,
  MapPin,
  PawPrint,
  Send,
  Shirt,
  Smile,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { NEIGHBORS, PLACES, type PlaceId, type PlayerV2 } from "../game";
import { ROOM_MANIFESTS } from "../rooms/registry";
import type { RoomManifest } from "../rooms/types";
import { clampToWalkable } from "../rooms/camera";
import { CameraViewport } from "./CameraViewport";
import { RoomScenery } from "./RoomScenery";
import { DanceFloor } from "./DanceFloor";
import { CLUB_PULSE_DANCE_FLOOR_BOUNDS } from "../rooms/manifests/clubPulse";
import type { GameId } from "./GamesPanel";
import { Lion } from "./Lion";
import { Avatar } from "./Avatar";
import { PetCompanion } from "./PetCompanion";
import { ActionWheel, type ActionId, type EmoteId } from "./ActionWheel";
import { MangoToss } from "./MangoToss";
import {
  generateSparkleStep,
  type SparkleParticle,
} from "../utils/particleTrail";

const BOARD_SPEED_MULTIPLIER = 1.5;
const WALK_DURATION_MS = 850;

const EMOTE_SYMBOLS: Record<EmoteId, string> = {
  heart: "❤️",
  star: "⭐",
  laugh: "😂",
  shock: "😲",
  sleep: "💤",
};

type WorldProps = {
  player: PlayerV2;
  place: PlaceId;
  navigate: (id: PlaceId, spawn?: { x: number; y: number }) => void;
  spawn?: { x: number; y: number };
  onActivity: (id: GameId) => void;
  onMap: () => void;
  onShop: () => void;
  onGame: () => void;
  onGreet: (id: string) => void;
  notify: (message: string) => void;
  onOpenCard?: () => void;
  onOpenCatalog?: () => void;
  onOpenSalon?: () => void;
};

export function World({
  player,
  place,
  navigate,
  spawn,
  onActivity,
  onMap,
  onShop,
  onGame,
  onGreet,
  notify,
  onOpenCard,
  onOpenCatalog,
  onOpenSalon,
}: WorldProps) {
  const manifest = ROOM_MANIFESTS[place];
  const [position, setPosition] = useState(() =>
    manifest
      ? {
          x:
            ((spawn?.x ?? manifest.stageWidth / 2) / manifest.stageWidth) * 100,
          y: ((spawn?.y ?? 600) / manifest.stageHeight) * 100,
        }
      : { x: 43, y: 78 },
  );
  const stagePosition = manifest
    ? {
        x: Math.round((position.x / 100) * manifest.stageWidth * 1e6) / 1e6,
        y: Math.round((position.y / 100) * manifest.stageHeight * 1e6) / 1e6,
      }
    : position;
  const [avatarAction, setAvatarAction] = useState<string>("idle");
  const [avatarHeading, setAvatarHeading] = useState<"left" | "right">("right");
  const [isTrotting, setIsTrotting] = useState(false);
  const [actionWheelOpen, setActionWheelOpen] = useState(false);
  const [mangoToss, setMangoToss] = useState<{
    origin: { x: number; y: number };
    target: { x: number; y: number };
  } | null>(null);
  const [tossPending, setTossPending] = useState(false);
  const walkTimer = useRef<number | null>(null);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const characterRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const boardId = player.look.boardId;
  const [message, setMessage] = useState("");
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(
    null,
  );
  const [emotesOpen, setEmotesOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const currentPlace = PLACES.find((p) => p.id === place)!;

  useEffect(() => {
    if (manifest)
      document
        .querySelector<HTMLButtonElement>(".camera-viewport-ground")
        ?.focus({ preventScroll: true });
    setBubble(null);
    setAvatarAction("idle");
    setIsTrotting(false);
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    sparklesRef.current = [];
    setSparkles([]);
  }, [place]);
  useEffect(() => {
    if (!bubble) return;
    const timer = window.setTimeout(() => setBubble(null), 6500);
    return () => window.clearTimeout(timer);
  }, [bubble]);
  useEffect(
    () => () => {
      void audio.current?.close().catch(() => {});
      if (walkTimer.current) window.clearTimeout(walkTimer.current);
    },
    [],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || !boardId) {
      sparklesRef.current = [];
      setSparkles([]);
      return;
    }
    if (!isTrotting && sparklesRef.current.length === 0) return;
    let frame: number;
    let last: number | null = null;
    const tick = (now: number) => {
      const deltaMs = Math.min(100, now - (last ?? now));
      last = now;
      const character = characterRef.current;
      const stage = character?.parentElement;
      const style = character && getComputedStyle(character);
      const renderedPosition =
        stage && style
          ? {
              x: (parseFloat(style.left) / stage.clientWidth) * 100,
              y: (parseFloat(style.top) / stage.clientHeight) * 100,
            }
          : position;
      sparklesRef.current = generateSparkleStep(
        sparklesRef.current,
        renderedPosition,
        isTrotting,
        boardId,
        deltaMs,
      );
      setSparkles(sparklesRef.current);
      if (isTrotting || sparklesRef.current.length > 0) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [position, isTrotting, boardId, reducedMotion]);

  const chime = () => {
    if (!sound) return;
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      void context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(650, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        900,
        context.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.055, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
    } catch {
      setSound(false);
    }
  };

  const walk = (x: number, y: number) => {
    const speedMultiplier = boardId ? BOARD_SPEED_MULTIPLIER : 1;
    const clamped = manifest
      ? clampToWalkable(
          {
            x: (x / 100) * manifest.stageWidth,
            y: (y / 100) * manifest.stageHeight,
          },
          manifest.walkablePolygon,
        )
      : null;
    const targetX =
      clamped && manifest
        ? (clamped.x / manifest.stageWidth) * 100
        : Math.max(12, Math.min(88, x));
    const targetY =
      clamped && manifest
        ? (clamped.y / manifest.stageHeight) * 100
        : Math.max(57, Math.min(89, y));
    setAvatarHeading(targetX < position.x ? "left" : "right");
    setPosition({ x: targetX, y: targetY });
    setIsTrotting(true);
    setAvatarAction("walk");
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    walkTimer.current = window.setTimeout(() => {
      setIsTrotting(false);
      setAvatarAction("idle");
    }, WALK_DURATION_MS / speedMultiplier);
    chime();
  };
  const keyboardWalk = (event: KeyboardEvent<HTMLButtonElement>) => {
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-3, 0],
      ArrowRight: [3, 0],
      ArrowUp: [0, -3],
      ArrowDown: [0, 3],
      a: [-3, 0],
      d: [3, 0],
      w: [0, -3],
      s: [0, 3],
    };
    const delta = directions[event.key];
    if (delta) {
      event.preventDefault();
      const speedMultiplier = boardId ? BOARD_SPEED_MULTIPLIER : 1;
      walk(
        position.x + delta[0] * speedMultiplier,
        position.y + delta[1] * speedMultiplier,
      );
    }
  };
  const say = (text: string) => {
    const trimmed = text.trim().slice(0, 100);
    if (!trimmed) return;
    setBubble({ id: "you", text: trimmed });
    setMessage("");
    setEmotesOpen(false);
    chime();
  };
  const greet = (id: string) => {
    const neighbor = NEIGHBORS.find((n) => n.id === id)!;
    onGreet(id);
    setBubble({ id, text: neighbor.greeting });
    chime();
  };
  const visibleNeighbors =
    place === "den" || manifest
      ? []
      : place === "square"
        ? NEIGHBORS
        : NEIGHBORS.filter((n) =>
            place === "cafe"
              ? n.id === "milo"
              : place === "arcade"
                ? n.id === "pip"
                : n.id === "cleo",
          );

  const portal = (target: string, targetSpawn: { x: number; y: number }) => {
    if (target === "le-shop") {
      onOpenCatalog?.();
      return;
    }
    const destination = PLACES.find((p) => p.id === target);
    if (destination) navigate(destination.id, targetSpawn);
  };
  const stageWalk = (x: number, y: number) => {
    if (!manifest) return;
    if (tossPending) {
      setMangoToss({
        origin: { x: stagePosition.x, y: stagePosition.y - 40 },
        target: { x, y },
      });
      setTossPending(false);
    } else
      walk((x / manifest.stageWidth) * 100, (y / manifest.stageHeight) * 100);
  };
  const hotspot = (id: string) => {
    if (id === "coaster-ticket-gate") onActivity("coaster");
    else if (id === "club-pulse-dj-booth") onActivity("dj-beat-drop");
    else if (id === "midway-game-booth") onActivity("fruit");
    else if (id === "park-map-kiosk") onMap();
    else if (id === "club-pulse-dance-floor") {
      walk(50, 75);
      document
        .querySelector<HTMLButtonElement>(".camera-viewport-ground")
        ?.focus();
      notify(
        "Walk across the tiles with arrow keys to light your path. Press a tile to play its chime.",
      );
    } else if (id === "marble-lion-fountain")
      notify(
        "A little splash of sunshine! The lion fountain keeps the plaza cool.",
      );
    else
      notify(
        id === "giant-ferris-wheel"
          ? "Watch the Ferris wheel cabins turn above Wonder Park."
          : id === "spinning-mango-teacups"
            ? "The mango teacups spin around the midway. Enjoy the spectacle!"
            : "The golden carousel horses bob to the carnival rhythm. Enjoy the spectacle!",
      );
  };
  const hotspotLabels: Record<string, string> = {
    "coaster-ticket-gate": "Ride Savanna Screamer",
    "giant-ferris-wheel": "Watch the Ferris wheel",
    "park-map-kiosk": "Park map",
    "spinning-mango-teacups": "Watch Mango Teacups",
    "grand-golden-carousel": "Watch Golden Carousel",
    "midway-game-booth": "Play Fruit Catch!",
    "club-pulse-dj-booth": "DJ Booth · DJ Beat Drop",
    "club-pulse-dance-floor": "Step onto the dance floor",
    "marble-lion-fountain": "Visit the lion fountain",
  };
  return (
    <section className="world-panel" aria-label="Lion world">
      <div className="world-heading">
        <div className="world-location">
          {place === "square" ? (
            <span className="location-icon">
              <MapPin size={17} fill="currentColor" strokeWidth={1.5} />
            </span>
          ) : (
            <button
              className="icon-button"
              aria-label="Return to Savanna Square"
              onClick={() => navigate("square")}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2>{currentPlace.name}</h2>
          <span className="world-local">
            <span /> Your neighborhood
          </span>
        </div>
        <div className="world-settings">
          <button
            className={`icon-button ${sound ? "is-active" : ""}`}
            title={sound ? "Turn sound off" : "Turn sound on"}
            aria-label={sound ? "Turn sound off" : "Turn sound on"}
            aria-pressed={sound}
            onClick={() => setSound((s) => !s)}
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className="icon-button"
            aria-label="World tips"
            title="World tips"
            onClick={() =>
              notify(
                "Click the ground to walk, or use arrow keys. Click a lion to say hello!",
              )
            }
          >
            <Sparkles size={18} />
          </button>
        </div>
      </div>
      <WorldStage
        manifest={manifest}
        imageClass={currentPlace.imageClass}
        avatarPos={stagePosition}
        heading={avatarHeading}
        onWalk={stageWalk}
        onPortal={portal}
        board={!!boardId}
      >
        {manifest && <RoomScenery place={place} />}
        {place === "club-pulse" && (
          <DanceFloor
            floorBounds={CLUB_PULSE_DANCE_FLOOR_BOUNDS}
            avatarPosition={stagePosition}
            muted={!sound}
            onStep={(point) => stageWalk(point.x, point.y)}
          />
        )}
        {manifest?.interactives
          .filter((item) => item.type !== "instrument")
          .map((item) => (
            <button
              key={item.id}
              className="building-label room-hotspot"
              tabIndex={-1}
              style={{ left: item.position.x, top: item.position.y - 95 }}
              onClick={() => hotspot(item.id)}
            >
              {hotspotLabels[item.id]} <ArrowUpRight size={17} />
            </button>
          ))}
        {mangoToss && (
          <MangoToss
            origin={mangoToss.origin}
            target={mangoToss.target}
            onImpact={() => {
              chime();
              setMangoToss(null);
              notify("Splash! 🥭 Mango landed!");
            }}
          />
        )}
        {!manifest && (
          <button
            className="world-ground"
            aria-label="Walk around the village. Use arrow keys or click the ground."
            onKeyDown={keyboardWalk}
            onClick={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              if (tossPending) {
                const clickX = e.clientX - box.left;
                const clickY = e.clientY - box.top;
                const startX = (position.x / 100) * box.width;
                const startY = (position.y / 100) * box.height - 40;
                setMangoToss({
                  origin: { x: startX, y: startY },
                  target: { x: clickX, y: clickY },
                });
                setTossPending(false);
                return;
              }
              walk(
                ((e.clientX - box.left) / box.width) * 100,
                ((e.clientY - box.top) / box.height) * 100,
              );
            }}
          />
        )}
        {place === "square" && (
          <>
            <button
              className="building-label downtown-label"
              onClick={() => navigate("downtown-plaza")}
            >
              Downtown Plaza <ArrowUpRight size={12} />
            </button>
            <button
              className="building-label cafe-label"
              onClick={() => navigate("cafe")}
            >
              <Coffee size={13} /> Canopy café <ArrowUpRight size={12} />
            </button>
            <button className="building-label shop-label" onClick={onShop}>
              <Shirt size={13} /> Paw & style <ArrowUpRight size={12} />
            </button>
          </>
        )}
        {place === "arcade" && (
          <button className="room-action" onClick={onGame}>
            <Gamepad2 size={19} /> Choose a game <ArrowUpRight size={17} />
          </button>
        )}
        {place === "den" && (
          <button className="room-action" onClick={onShop}>
            <Home size={18} /> Find something cozy <ArrowUpRight size={17} />
          </button>
        )}
        {place === "cafe" && (
          <button
            className="room-action"
            onClick={() => onActivity("smoothie")}
          >
            <Coffee size={18} /> Blend smoothies
          </button>
        )}
        {player.decor.includes("plant") && place === "den" && (
          <span
            className="den-decoration plant-decor"
            aria-label="Your happy houseplant"
          >
            🪴
          </span>
        )}
        {player.decor.includes("cushion") && place === "den" && (
          <span
            className="den-decoration cushion-decor"
            aria-label="Your sunny cushion"
          >
            🛋️
          </span>
        )}
        {visibleNeighbors.map((n) => (
          <button
            key={n.id}
            className={`world-character neighbor ${bubble?.id === n.id ? "talking" : ""}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            onClick={() => greet(n.id)}
            aria-label={`Say hello to ${n.name}`}
          >
            {bubble?.id === n.id && (
              <span className="speech-bubble">{bubble.text}</span>
            )}
            <Lion color={n.color} accessory={n.accessory} />
            <span className="character-name">
              {n.name}
              <span className="greet-indicator"> ♡</span>
            </span>
          </button>
        ))}
        <div className="sparkle-trail-layer" aria-hidden="true">
          {sparkles.map((p) => (
            <span
              key={p.id}
              className="sparkle-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: p.alpha,
              }}
            />
          ))}
        </div>
        <div
          ref={characterRef}
          data-stage-x={manifest ? stagePosition.x : undefined}
          data-stage-y={manifest ? stagePosition.y : undefined}
          className={`world-character your-character${boardId ? " is-gliding" : ""}`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            cursor: onOpenCard ? "pointer" : undefined,
          }}
          onClick={(e) => {
            if (onOpenCard) {
              e.stopPropagation();
              onOpenCard();
            }
          }}
          role={onOpenCard ? "button" : undefined}
          tabIndex={onOpenCard ? 0 : undefined}
          aria-label={onOpenCard ? `${player.name}'s player card` : undefined}
          onKeyDown={(e) => {
            if (onOpenCard && (e.key === "Enter" || e.key === " ")) {
              e.stopPropagation();
              e.preventDefault();
              onOpenCard();
            }
          }}
        >
          {bubble?.id === "you" && (
            <span className="speech-bubble">{bubble.text}</span>
          )}
          <div className="avatar-with-companion">
            <Avatar
              look={player.look}
              action={avatarAction}
              size={manifest ? 132 : 84}
            />
            <PetCompanion
              pet={{
                ...player.pet,
                color: (player.pet?.color || player.color) as any,
                accessory:
                  player.accessory !== "none"
                    ? player.accessory
                    : player.pet?.accessory,
              }}
              isTrotting={isTrotting}
              heading={avatarHeading}
            />
          </div>
          <span className="character-name your-name">
            {player.name}
            <span className="you-tag"> you</span>
          </span>
        </div>
        <span className="walk-hint">
          <span>✧</span> Click anywhere to wander <span>✧</span>
        </span>
        <div className="scene-vignette" />
      </WorldStage>
      {manifest && (
        <div className="room-navigation" aria-label="Room paths and activities">
          {manifest.portals.map((p) => (
            <button
              key={p.targetRoomId}
              className="button-secondary"
              onClick={() => portal(p.targetRoomId, p.targetSpawn)}
            >
              {p.label} <ArrowUpRight size={14} />
            </button>
          ))}
          {manifest.interactives.map((item) => (
            <button
              key={item.id}
              className="button-secondary"
              onClick={() => hotspot(item.id)}
            >
              {hotspotLabels[item.id]}
            </button>
          ))}
          <span className="room-navigation-hint">
            Click the ground or use arrow keys to explore. Paths at the edges
            lead to the next room.
          </span>
        </div>
      )}
      <div className="chat-toolbar">
        <button
          type="button"
          className="icon-button action-wheel-toggle"
          aria-label="Action wheel"
          title="Quick chat, emotes & mango toss"
          onClick={() => setActionWheelOpen(true)}
        >
          <Sparkles size={20} />
        </button>
        <div className="emote-anchor">
          <button
            className="icon-button emote-toggle"
            aria-label="Choose an emote"
            aria-expanded={emotesOpen}
            onClick={() => setEmotesOpen((o) => !o)}
          >
            <Smile size={23} />
          </button>
          {emotesOpen && (
            <div className="emote-popover" aria-label="Emotes">
              {["👋", "❤️", "☀️", "🌼", "🎉", "🦁"].map((emoji) => (
                <button
                  key={emoji}
                  aria-label={`Send ${emoji} emote`}
                  onClick={() => say(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <form
          className="chat-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            say(message);
          }}
        >
          <label className="sr-only" htmlFor="chat-message">
            Say something in your local neighborhood
          </label>
          <input
            id="chat-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={100}
            placeholder="Say hello to the pride…"
            autoComplete="off"
          />
          <button
            className="send-button"
            type="submit"
            aria-label="Send message"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </form>
        <button
          className="icon-button paw-button"
          aria-label="Wave to the pride"
          title="Wave to the pride"
          onClick={() => say("Hey, pride! 👋")}
        >
          <PawPrint size={22} fill="currentColor" />
        </button>
        <button className="map-button" aria-label="Map" onClick={onMap}>
          <Map size={19} fill="currentColor" strokeWidth={1.5} />
          <span>Map</span>
        </button>
      </div>
      <ActionWheel
        isOpen={actionWheelOpen}
        onClose={() => setActionWheelOpen(false)}
        onEmote={(id) => {
          const symbol = EMOTE_SYMBOLS[id] || "✨";
          say(symbol);
        }}
        onAction={(id) => {
          if (id === "toss") {
            setTossPending(true);
            notify("Click anywhere on the ground to toss a mango! 🥭");
          } else {
            setAvatarAction(id);
            if (id === "wave") {
              say("👋");
            } else if (id === "dance") {
              notify("Dancing the savanna groove! 💃");
            } else if (id === "jam") {
              notify("Jamming to the downtown beat! 🎵");
            } else if (id === "sit") {
              notify("Taking a seat to relax.");
            }
          }
        }}
        onPhrase={(text) => say(text)}
      />
    </section>
  );
}

function WorldStage({
  manifest,
  imageClass,
  avatarPos,
  heading,
  onWalk,
  onPortal,
  board,
  children,
}: {
  manifest?: RoomManifest;
  imageClass: string;
  avatarPos: { x: number; y: number };
  heading: "left" | "right";
  onWalk: (x: number, y: number) => void;
  onPortal: (target: string, spawn: { x: number; y: number }) => void;
  board: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`world-stage scene ${imageClass}${manifest ? " camera-world" : ""}`}
    >
      {manifest ? (
        <CameraViewport
          manifest={manifest}
          avatarPos={avatarPos}
          avatarHeading={heading}
          onWalk={onWalk}
          onPortal={onPortal}
          movementMultiplier={board ? BOARD_SPEED_MULTIPLIER : 1}
        >
          {children}
        </CameraViewport>
      ) : (
        children
      )}
    </div>
  );
}
