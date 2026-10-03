import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Heart,
  PawPrint,
  Sun,
} from "lucide-react";
import {
  buyItem,
  claimReward,
  completeBeeStop,
  completeGame,
  completeFruitCatch,
  meetLion,
  PLACES,
  SHOP_ITEMS,
  visitPlace,
  type AdventureId,
  type LionColor,
  type PlaceId,
} from "./game";
import { usePlayer } from "./usePlayer";
import { Coin, Lion } from "./components/Lion";
import { Dialog } from "./components/Dialog";
import { World } from "./components/World";
import { Sidebar } from "./components/Sidebar";
import { Help, Shop, Wardrobe, WorldMap } from "./components/Panels";
import { GamesPanel } from "./components/GamesPanel";

type Panel = "map" | "style" | "shop" | "games" | "help" | null;

export default function App() {
  const { player, setPlayer, saveError } = usePlayer();
  const [place, setPlace] = useState<PlaceId>("square");
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 4800);
    return () => window.clearTimeout(id);
  }, [toast]);
  const notify = (message: string) => setToast(message);
  const navigate = (destination: PlaceId) => {
    setPlace(destination);
    setPlayer((p) => visitPlace(p, destination));
    setPanel(null);
  };
  const adventure = (id: AdventureId) => {
    if (id === "neighbors") {
      navigate("square");
      notify("Click Milo, Cleo, and Pip to say hello!");
    } else if (id === "game") {
      setPlace("arcade");
      setPlayer((p) => visitPlace(p, "arcade"));
      setPanel("games");
    } else navigate("den");
  };
  const closePanel = () => {
    setPanel(null);
  };
  const titles = {
    map: ["A whole little world", "Where will your paws take you next?"],
    style: [
      "A lion, all your own",
      "Big personality. Little finishing touches.",
    ],
    shop: ["Paw & style", "A little something for your next adventure."],
    games: [
      "Let the good times roar",
      "A little friendly competition at the arcade.",
    ],
    help: ["Welcome to Club Lion", "Your next little adventure starts here."],
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to your lion world
      </a>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => navigate("square")}
            aria-label="Club Lion home"
          >
            <span className="brand-lion">
              <Lion />
            </span>
            <span>
              CLUB LION
              <span className="brand-sun">
                <Sun size={17} />
              </span>
            </span>
          </button>
          <nav className="main-nav" aria-label="Main navigation">
            <button
              className={
                place !== "den" && panel !== "games" && panel !== "shop"
                  ? "selected"
                  : ""
              }
              onClick={() => navigate("square")}
            >
              World
            </button>
            <button
              className={panel === "games" ? "selected" : ""}
              onClick={() => setPanel("games")}
            >
              Games
            </button>
            <button
              className={place === "den" && !panel ? "selected" : ""}
              onClick={() => navigate("den")}
            >
              My den
            </button>
            <button
              className={panel === "shop" ? "selected" : ""}
              onClick={() => setPanel("shop")}
            >
              Shop
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button help-button"
              aria-label="How to play"
              title="How to play"
              onClick={() => setPanel("help")}
            >
              <CircleHelp size={22} />
            </button>
            <div className="player-menu">
              <span className="wallet" aria-label={`${player.coins} coins`}>
                <Coin amount={player.coins} />
              </span>
              <span className="player-menu-divider" />
              <button
                className="avatar-button"
                onClick={() => setPanel("style")}
                aria-label="Customize your lion"
              >
                <span className="header-avatar">
                  <Lion color={player.color} accessory={player.accessory} />
                </span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" className="page-container">
        <section className="welcome">
          <div>
            <h1>
              Welcome to the pride<span className="welcome-period">.</span>
            </h1>
            <p>A little adventure. A lot of new friends.</p>
          </div>
          <span className="weather-pill">
            <Sun size={24} />
            <span>Sunny days ahead.</span>
          </span>
        </section>
        {saveError && (
          <p className="save-warning" role="alert">
            Your browser couldn’t save this adventure. You can keep playing, but
            progress may be lost when you leave.
          </p>
        )}
        <div className="game-layout">
          <World
            player={player}
            place={place}
            navigate={navigate}
            onMap={() => setPanel("map")}
            onShop={() => setPanel("shop")}
            onGame={() => setPanel("games")}
            onGreet={(id) => setPlayer((p) => meetLion(p, id))}
            notify={notify}
          />
          <Sidebar
            player={player}
            onStyle={() => setPanel("style")}
            onAdventure={adventure}
            onClaim={(id) => {
              setPlayer((p) => claimReward(p, id));
              notify("Adventure complete! 50 happy little coins are yours.");
            }}
          />
        </div>
        <section className="destinations">
          <div className="section-heading">
            <h2>Where to next?</h2>
            <button className="text-button" onClick={() => setPanel("map")}>
              See the whole world <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="destination-grid">
            {PLACES.filter((p) => p.id !== "square").map((destination) => (
              <button
                className={`destination-card ${destination.id === place ? "is-current" : ""}`}
                key={destination.id}
                onClick={() => navigate(destination.id)}
              >
                <span
                  className={`destination-image scene ${destination.imageClass}`}
                >
                  <span className="destination-caption">
                    {destination.subtitle}
                  </span>
                </span>
                <span className="destination-bottom">
                  <strong>{destination.name}</strong>
                  <span className="destination-arrow">
                    {destination.id === place ? (
                      <Check size={17} />
                    ) : (
                      <ChevronRight size={19} />
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <footer className="site-footer">
          <span className="footer-line">
            <span className="footer-paw">
              <PawPrint size={16} />
            </span>
          </span>
          <div>
            <Sun size={23} />
            <span>Made for a little adventure.</span>
            <button
              className="text-button footer-help"
              onClick={() => setPanel("help")}
            >
              How to play <CircleHelp size={12} />
            </button>
          </div>
          <span className="footer-line">
            <span className="footer-heart">
              <Heart size={15} />
            </span>
          </span>
        </footer>
      </main>
      <div
        className={`toast ${toast ? "toast-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span className="toast-icon">
          <Check size={17} />
        </span>
        <span>{toast}</span>
      </div>
      {panel && (
        <Dialog
          title={titles[panel][0]}
          subtitle={titles[panel][1]}
          onClose={closePanel}
          wide={panel === "shop" || panel === "map" || panel === "style"}
        >
          {panel === "map" && <WorldMap place={place} onNavigate={navigate} />}
          {panel === "style" && (
            <Wardrobe
              player={player}
              onSave={(name: string, color: LionColor, accessory: string) => {
                setPlayer((p) => ({ ...p, name, color, accessory }));
                closePanel();
                notify("Looking good! Your lion has a new look.");
              }}
            />
          )}
          {panel === "shop" && (
            <Shop
              player={player}
              onBuy={(id) => {
                setPlayer((p) => buyItem(p, id));
                const item = SHOP_ITEMS.find((i) => i.id === id)!;
                notify(
                  `${item.name} is yours! ${item.kind === "decor" ? "It’s waiting in your den." : "You’re wearing it already."}`,
                );
              }}
              onEquip={(id) => {
                setPlayer((p) => ({ ...p, accessory: id }));
                notify("The perfect finishing touch!");
              }}
            />
          )}
          {panel === "games" && (
            <GamesPanel
              player={player}
              onCompleteGame={(pairs) =>
                setPlayer((p) => completeGame(p, pairs))
              }
              onCompleteBeeStop={(score) =>
                setPlayer((p) => completeBeeStop(p, score))
              }
              onCompleteFruitCatch={(result) =>
                setPlayer((p) =>
                  completeFruitCatch(
                    p,
                    result.caught,
                    result.hits,
                    result.score,
                  ),
                )
              }
              onClose={closePanel}
            />
          )}
          {panel === "help" && <Help />}
        </Dialog>
      )}
    </>
  );
}
