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
  completeDJBeatDrop,
  completeSmoothieOrder,
  completePawSteps,
  completeFruitCatch,
  completeFishingCatch,
  recordFashionShowResult,
  meetLion,
  unlockSecretCatalogItem,
  unlockStamp,
  PLACES,
  SHOP_ITEMS,
  visitPlace,
  type AdventureId,
  type EquipSlot,
  type LionColor,
  type PlaceId,
} from "./game";
import { usePlayer } from "./usePlayer";
import { Coin, Lion } from "./components/Lion";
import { Dialog } from "./components/Dialog";
import { World } from "./components/World";
import { Sidebar } from "./components/Sidebar";
import { Help, Shop, Wardrobe, WorldMap } from "./components/Panels";
import { GamesPanel, type GameId } from "./components/GamesPanel";
import { RoomScenery } from "./components/RoomScenery";
import { ROOM_MANIFESTS } from "./rooms/registry";
import { PlayerCard } from "./components/PlayerCard";
import { CatalogModal } from "./components/CatalogModal";
import { StampBook } from "./components/StampBook";
import { SalonModal } from "./components/SalonModal";

type Panel =
  | "map"
  | "style"
  | "shop"
  | "games"
  | "help"
  | "card"
  | "catalog"
  | "stamps"
  | "salon"
  | null;

export default function App() {
  const { player, setPlayer, saveError } = usePlayer();
  const [place, setPlace] = useState<PlaceId>("square");
  const [spawn, setSpawn] = useState<{ x: number; y: number } | undefined>();
  const [initialGame, setInitialGame] = useState<GameId | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 4800);
    return () => window.clearTimeout(id);
  }, [toast]);
  const notify = (message: string) => setToast(message);
  const openGames = (game: GameId | null = null) => {
    setInitialGame(game);
    setPanel("games");
  };
  const closePanel = () => {
    setPanel(null);
  };
  const navigate = (
    destination: PlaceId,
    targetSpawn?: { x: number; y: number },
  ) => {
    setSpawn(targetSpawn);
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
      openGames();
    } else navigate("den");
  };

  const titles: Record<string, [string, string]> = {
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
                place !== "den" &&
                panel !== "games" &&
                panel !== "shop" &&
                !panel
                  ? "selected"
                  : ""
              }
              onClick={() => {
                navigate("square");
                closePanel();
              }}
            >
              World
            </button>
            <button
              className={panel === "catalog" ? "selected" : ""}
              onClick={() => setPanel("catalog")}
            >
              Le Shop
            </button>
            <button
              className={panel === "salon" ? "selected" : ""}
              onClick={() => setPanel("salon")}
            >
              Salon
            </button>
            <button
              className={panel === "games" ? "selected" : ""}
              onClick={() => openGames()}
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
            <button
              className={panel === "card" ? "selected" : ""}
              onClick={() => setPanel("card")}
            >
              ID Card
            </button>
            <button
              className={panel === "stamps" ? "selected" : ""}
              onClick={() => setPanel("stamps")}
            >
              Stamp Book
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
            key={place}
            spawn={spawn}
            player={player}
            place={place}
            navigate={navigate}
            onMap={() => setPanel("map")}
            onShop={() => setPanel("shop")}
            onGame={() => openGames()}
            onActivity={openGames}
            onGreet={(id) => setPlayer((p) => meetLion(p, id))}
            notify={notify}
            onOpenCard={() => setPanel("card")}
            onOpenCatalog={() => setPanel("catalog")}
            onOpenSalon={() => setPanel("salon")}
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
                  {ROOM_MANIFESTS[destination.id] && (
                    <RoomScenery place={destination.id} preview />
                  )}
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
      {panel === "stamps" && <StampBook player={player} onClose={closePanel} />}
      {panel === "card" && (
        <PlayerCard
          player={player}
          onClose={closePanel}
          onSaveMoodQuote={(moodQuote) => {
            setPlayer((p) => ({ ...p, moodQuote }));
            notify("Status updated!");
          }}
        />
      )}
      {panel === "catalog" && (
        <CatalogModal
          player={player}
          onClose={closePanel}
          onBuy={(id) => {
            setPlayer((p) => buyItem(p, id));
            notify("Purchased! Added to your collection.");
          }}
          onEquip={(id, slot: EquipSlot) => {
            setPlayer((p) => ({
              ...p,
              look: {
                ...p.look,
                ...(slot === "top_outer"
                  ? { outfitId: id }
                  : slot === "shoes"
                    ? { shoesId: id }
                    : slot === "board"
                      ? { boardId: id }
                      : slot === "handheld"
                        ? { handheldId: id }
                        : slot === "headwear"
                          ? { headwearId: id }
                          : { outfitId: id }),
              },
            }));
            notify("Equipped!");
          }}
          onUnlockSecret={(secretId) => {
            setPlayer((p) => unlockSecretCatalogItem(p, secretId));
            notify("✨ Secret uncovered! Item added to inventory.");
          }}
        />
      )}
      {panel === "salon" && (
        <SalonModal
          look={player.look}
          onClose={closePanel}
          onSave={(hairId, hairColor, streakDye) => {
            setPlayer((p) => {
              const styled = { ...p, look: { ...p.look, hairId, hairColor } };
              return streakDye !== "none"
                ? unlockStamp(styled, "hair_highlight")
                : styled;
            });
            closePanel();
            notify("Looking fabulous! Fresh hairstyle saved.");
          }}
        />
      )}
      {panel &&
        panel !== "card" &&
        panel !== "catalog" &&
        panel !== "salon" &&
        panel !== "stamps" && (
          <Dialog
            title={titles[panel][0]}
            subtitle={titles[panel][1]}
            onClose={closePanel}
            wide={
              panel === "shop" ||
              panel === "map" ||
              panel === "style" ||
              panel === "games"
            }
          >
            {panel === "map" && (
              <WorldMap place={place} onNavigate={navigate} />
            )}
            {panel === "style" && (
              <Wardrobe
                player={player}
                onSave={(name: string, color: LionColor, accessory: string) => {
                  setPlayer((p) => ({
                    ...p,
                    name,
                    color,
                    accessory,
                    pet: {
                      ...p.pet,
                      color,
                      accessory,
                    },
                  }));
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
                  setPlayer((p) => ({
                    ...p,
                    accessory: id,
                    pet: {
                      ...p.pet,
                      accessory: id,
                    },
                  }));
                  notify("The perfect finishing touch!");
                }}
              />
            )}
            {panel === "games" && (
              <GamesPanel
                player={player}
                initialGame={initialGame}
                onCompleteDJ={(score, combo) =>
                  setPlayer((p) => completeDJBeatDrop(p, score, combo))
                }
                onCompleteSmoothie={(coins) =>
                  setPlayer((p) => completeSmoothieOrder(p, coins))
                }
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
                onCompleteFishing={(res) => {
                  setPlayer((p) => completeFishingCatch(p, res));
                  notify(
                    `Caught a ${res.speciesId.replace(/_/g, " ")}! +${res.coins} coins.`,
                  );
                }}
                onCompleteFashion={(res) => {
                  setPlayer((p) => recordFashionShowResult(p, res));
                  notify(`Runway show complete! +${res.coins} coins.`);
                }}
                onSafariFinish={(pairs) =>
                  setPlayer((p) => completeGame(p, pairs))
                }
                onPawStepsFinish={(rounds) =>
                  setPlayer((p) => completePawSteps(p, rounds))
                }
                onFruitFinish={(caught, hits, score) =>
                  setPlayer((p) => completeFruitCatch(p, caught, hits, score))
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
