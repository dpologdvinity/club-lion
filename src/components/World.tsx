import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
import { Lion } from "./Lion";
import { Avatar } from "./Avatar";
import { PetCompanion } from "./PetCompanion";
import { ActionWheel, type ActionId, type EmoteId } from "./ActionWheel";
import { MangoToss } from "./MangoToss";

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
  navigate: (id: PlaceId) => void;
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
  onMap,
  onShop,
  onGame,
  onGreet,
  notify,
  onOpenCard,
  onOpenCatalog,
  onOpenSalon,
}: WorldProps) {
  const [position, setPosition] = useState({ x: 43, y: 78 });
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
  const [message, setMessage] = useState("");
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(
    null,
  );
  const [emotesOpen, setEmotesOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const currentPlace = PLACES.find((p) => p.id === place)!;

  useEffect(() => {
    setPosition({ x: 43, y: 78 });
    setBubble(null);
    setAvatarAction("idle");
    setIsTrotting(false);
  }, [place]);
  useEffect(() => {
    if (!bubble) return;
    const timer = window.setTimeout(() => setBubble(null), 6500);
    return () => window.clearTimeout(timer);
  }, [bubble]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );

  const chime = () => {
    if (!sound) return;
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      void context.resume();
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
    const targetX = Math.max(12, Math.min(88, x));
    const targetY = Math.max(57, Math.min(89, y));
    setAvatarHeading(targetX < position.x ? "left" : "right");
    setPosition({ x: targetX, y: targetY });
    setIsTrotting(true);
    setAvatarAction("walk");
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    walkTimer.current = window.setTimeout(() => {
      setIsTrotting(false);
      setAvatarAction("idle");
    }, 450);
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
      walk(position.x + delta[0], position.y + delta[1]);
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
    place === "den"
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
      <div className={`world-stage scene ${currentPlace.imageClass}`}>
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
        {place === "square" && (
          <>
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
            onClick={() => {
              setBubble({ id: "you", text: "One mango smoothie, please! 🥭" });
              notify("One imaginary mango smoothie, on the house!");
            }}
          >
            <Coffee size={18} /> Order a mango smoothie
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
        <div
          className="world-character your-character"
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
              onOpenCard();
            }
          }}
        >
          {bubble?.id === "you" && (
            <span className="speech-bubble">{bubble.text}</span>
          )}
          <div className="avatar-with-companion">
            <Avatar look={player.look} action={avatarAction} size={84} />
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
      </div>
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
