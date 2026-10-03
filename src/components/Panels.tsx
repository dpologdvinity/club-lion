import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Coffee,
  Home,
  MapPin,
  PawPrint,
  Shirt,
  Sparkles,
} from "lucide-react";
import {
  PAW_STEPS_COINS_PER_ROUND,
  PLACES,
  SHOP_ITEMS,
  type LionColor,
  type PlaceId,
  type Player,
} from "../game";
import { Coin, Lion } from "./Lion";
import { MemorySafari } from "./MemorySafari";
import { PawSteps } from "./PawSteps";

export function WorldMap({
  place,
  onNavigate,
}: {
  place: PlaceId;
  onNavigate: (place: PlaceId) => void;
}) {
  return (
    <div className="map-grid">
      {PLACES.map((destination) => (
        <button
          className={`map-destination ${place === destination.id ? "selected" : ""}`}
          key={destination.id}
          onClick={() => onNavigate(destination.id)}
        >
          <span className={`scene map-image ${destination.imageClass}`} />
          <span className="map-destination-copy">
            <span>
              <strong>{destination.name}</strong>
              <small>{destination.subtitle}</small>
            </span>
            {place === destination.id ? (
              <span className="here-label">You’re here</span>
            ) : (
              <ArrowRight size={18} />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

const COLORS: { id: LionColor; name: string; hex: string }[] = [
  { id: "gold", name: "Golden", hex: "#f4b448" },
  { id: "sand", name: "Sandy", hex: "#d4bd8a" },
  { id: "copper", name: "Copper", hex: "#c78356" },
  { id: "rose", name: "Rosy", hex: "#d88b9b" },
];

export function Wardrobe({
  player,
  onSave,
}: {
  player: Player;
  onSave: (name: string, color: LionColor, accessory: string) => void;
}) {
  const [name, setName] = useState(player.name);
  const [color, setColor] = useState(player.color);
  const [accessory, setAccessory] = useState(player.accessory);
  const [error, setError] = useState("");
  const accessories = SHOP_ITEMS.filter(
    (item) => item.kind === "accessory" && player.owned.includes(item.id),
  );
  return (
    <form
      className="wardrobe"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) {
          setError(
            "Your lion needs a name. Try Sunny, Roary, or your own idea.",
          );
          document.getElementById("lion-name")?.focus();
          return;
        }
        onSave(name.trim(), color, accessory);
      }}
    >
      <div className="wardrobe-preview">
        <span className="preview-sparkle sparkle-one">✧</span>
        <Lion color={color} accessory={accessory} />
        <span className="preview-sparkle sparkle-two">✦</span>
        <span className="preview-name">{name.trim() || "Your lion"}</span>
      </div>
      <div className="wardrobe-options">
        <label className="field-label" htmlFor="lion-name">
          Your lion’s name
        </label>
        <input
          id="lion-name"
          maxLength={16}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "name-error" : "name-hint"}
          autoComplete="nickname"
        />
        <small id="name-hint">
          A name that feels like you. Up to 16 characters.
        </small>
        {error && (
          <p className="field-error" id="name-error">
            {error}
          </p>
        )}
        <fieldset>
          <legend>Mane mood</legend>
          <div className="color-options">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`color-option ${color === c.id ? "selected" : ""}`}
                onClick={() => setColor(c.id)}
                aria-pressed={color === c.id}
              >
                <span style={{ background: c.hex }}>
                  {color === c.id && <Check size={17} />}
                </span>
                <small>{c.name}</small>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>A little extra</legend>
          <div className="accessory-options">
            <button
              type="button"
              className={accessory === "none" ? "selected" : ""}
              onClick={() => setAccessory("none")}
              aria-pressed={accessory === "none"}
            >
              <PawPrint size={15} /> Just me
            </button>
            {accessories.map((item) => (
              <button
                key={item.id}
                type="button"
                className={accessory === item.id ? "selected" : ""}
                onClick={() => setAccessory(item.id)}
                aria-pressed={accessory === item.id}
              >
                <ItemIcon id={item.id} />
                {item.name}
              </button>
            ))}
          </div>
          <small>Find more little extras at Paw & style.</small>
        </fieldset>
        <button className="button button-primary wardrobe-save" type="submit">
          <Check size={17} /> Save my look
        </button>
      </div>
    </form>
  );
}

function ItemIcon({ id }: { id: string }) {
  const symbols: Record<string, string> = {
    scarf: "🧣",
    glasses: "🕶️",
    hat: "👒",
    flower: "🌼",
    plant: "🪴",
    cushion: "🛋️",
  };
  return (
    <span className="item-emoji" aria-hidden="true">
      {symbols[id]}
    </span>
  );
}

export function Shop({
  player,
  onBuy,
  onEquip,
}: {
  player: Player;
  onBuy: (id: string) => void;
  onEquip: (id: string) => void;
}) {
  const [tab, setTab] = useState<"accessory" | "decor">("accessory");
  return (
    <div className="shop">
      <div className="shop-top">
        <div className="shop-tabs" role="group" aria-label="Shop category">
          <button
            className={tab === "accessory" ? "selected" : ""}
            onClick={() => setTab("accessory")}
            aria-pressed={tab === "accessory"}
          >
            <Shirt size={17} /> For your lion
          </button>
          <button
            className={tab === "decor" ? "selected" : ""}
            onClick={() => setTab("decor")}
            aria-pressed={tab === "decor"}
          >
            <Home size={17} /> For your den
          </button>
        </div>
        <span className="shop-wallet">
          <Coin amount={player.coins} />
        </span>
      </div>
      <div className="shop-grid">
        {SHOP_ITEMS.filter((item) => item.kind === tab).map((item) => {
          const owned = player.owned.includes(item.id);
          const equipped =
            item.kind === "accessory"
              ? player.accessory === item.id
              : player.decor.includes(item.id);
          return (
            <article className="shop-item" key={item.id}>
              <div className={`shop-item-art item-art-${item.id}`}>
                {item.kind === "accessory" ? (
                  <Lion accessory={item.id} color={player.color} />
                ) : (
                  <ItemIcon id={item.id} />
                )}
                {owned && (
                  <span className="owned-badge">
                    <Check size={11} /> Yours
                  </span>
                )}
              </div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <button
                className={`button ${owned ? "button-secondary" : "button-primary"}`}
                disabled={equipped || (!owned && player.coins < item.price)}
                onClick={() => (owned ? onEquip(item.id) : onBuy(item.id))}
              >
                {equipped ? (
                  <>
                    <Check size={15} />{" "}
                    {item.kind === "decor" ? "In your den" : "Wearing"}
                  </>
                ) : owned ? (
                  "Wear it"
                ) : player.coins < item.price ? (
                  <>
                    <Coin amount={item.price} /> Need more coins
                  </>
                ) : (
                  <>
                    <Coin amount={item.price} /> Make it mine
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
      <p className="shop-note">
        <Sparkles size={14} /> Earn more coins at the arcade or by finishing
        your adventures.
      </p>
    </div>
  );
}

type ArcadeGame = "safari" | "paw-steps";

export function GamesPanel({
  player,
  onSafariFinish,
  onPawStepsFinish,
  onClose,
}: {
  player: Player;
  onSafariFinish: (pairs: number) => void;
  onPawStepsFinish: (rounds: number) => void;
  onClose: () => void;
}) {
  const [game, setGame] = useState<ArcadeGame | null>(null);
  const menuButtons = useRef<
    Partial<Record<ArcadeGame, HTMLButtonElement | null>>
  >({});
  const returnTo = useRef<ArcadeGame | null>(null);
  const backToMenu = () => {
    returnTo.current = game;
    setGame(null);
  };
  useEffect(() => {
    if (game === null && returnTo.current) {
      menuButtons.current[returnTo.current]?.focus();
    }
  }, [game]);
  if (game === "safari")
    return (
      <MemorySafari
        onFinish={onSafariFinish}
        onBack={backToMenu}
        onClose={onClose}
      />
    );
  if (game === "paw-steps")
    return (
      <PawSteps
        best={player.pawStepsBest}
        onFinish={onPawStepsFinish}
        onBack={backToMenu}
        onClose={onClose}
      />
    );
  return (
    <div className="arcade-menu">
      <button
        ref={(node) => {
          menuButtons.current.safari = node;
        }}
        className="arcade-card"
        onClick={() => setGame("safari")}
      >
        <span className="arcade-card-art" aria-hidden="true">
          🎴
        </span>
        <strong>Memory Safari</strong>
        <small>Find all 6 matching pairs. 60 coins a game.</small>
      </button>
      <button
        ref={(node) => {
          menuButtons.current["paw-steps"] = node;
        }}
        className="arcade-card"
        onClick={() => setGame("paw-steps")}
      >
        <span className="arcade-card-art" aria-hidden="true">
          🐾
        </span>
        <strong>Paw Steps</strong>
        <small>
          Repeat the lion&apos;s paw steps. {PAW_STEPS_COINS_PER_ROUND} coins a
          round.
          {player.pawStepsBest > 0 && ` Best: ${player.pawStepsBest}.`}
        </small>
      </button>
    </div>
  );
}

export function Help() {
  return (
    <div className="help-content">
      <div className="help-welcome">
        <Lion accessory="scarf" />
        <div>
          <h3>A little wild. A lot of fun.</h3>
          <p>
            There’s no right way to adventure. Start with whatever makes you
            smile.
          </p>
        </div>
      </div>
      <div className="help-steps">
        <p>
          <MapPin size={20} />
          <span>
            <strong>Find your feet</strong>Click the ground to wander. You can
            also focus the world and use arrow keys or WASD.
          </span>
        </p>
        <p>
          <PawPrint size={20} />
          <span>
            <strong>Meet the neighborhood</strong>Click Milo, Cleo, and Pip to
            hear their greetings. Type in the chat bar or send an emote.
          </span>
        </p>
        <p>
          <Coffee size={20} />
          <span>
            <strong>Follow your curiosity</strong>Use the map to visit the café,
            watering hole, arcade, or your own den.
          </span>
        </p>
        <p>
          <Shirt size={20} />
          <span>
            <strong>Make it yours</strong>Style your lion, play Memory Safari or
            Paw Steps to earn coins, and shop for something special.
          </span>
        </p>
      </div>
      <div className="local-notice">
        <strong>Your own little corner of the savanna</strong>
        <p>
          This is a single-player world. Your neighbors are game characters, and
          chat stays on your screen. Your lion and progress are saved in this
          browser.
        </p>
      </div>
    </div>
  );
}
