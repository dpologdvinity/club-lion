import { useEffect, useRef, useState } from "react";
import { MaterialDefs } from "./components/MaterialDefs";
import { speak } from "./utils/speech";
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
  applySalonLook,
  buyCatalogItem,
  buyItem,
  dressAvatar,
  equipCatalogItem,
  claimReward,
  completeBeeStop,
  completeSledRun,
  completeGame,
  completeDJBeatDrop,
  completeSmoothieOrder,
  completeBakeryServe,
  completeSeekRound,
  completePawSteps,
  completeFruitCatch,
  completeBubblePop,
  completeAnimalBand,
  completeShapeSorterRound,
  completePicturePuzzle,
  completeBalloonRainbow,
  colorPage,
  completeFishingCatch,
  recordFashionShowResult,
  completeRiverSurf,
  completeKartRace,
  setKartPrefs,
  completeSpyPuzzle,
  applyPetCareAction,
  choosePetSpecies,
  meetLion,
  unlockSecretCatalogItem,
  unlockStamp,
  evaluateStampUnlocks,
  findSquareButterfly,
  collectPin,
  movePropSpot,
  completeMangoRun,
  completeHaloHalo,
  completeDressPet,
  completePetRoundUp,
  completePeekaboo,
  completeFantageGame,
  completeFireflies,
  STAMP_DEFINITIONS,
  PLACES,
  SHOP_ITEMS,
  visitPlace,
  type AdventureId,
  type EquipSlot,
  type LionColor,
  type PlaceId,
} from "./game";
import { usePlayer } from "./usePlayer";
import { useLightingPrefs } from "./useLightingPrefs";
import { Lion } from "./components/Lion";
import { Avatar } from "./components/Avatar";
import { Dialog } from "./components/Dialog";
import { World } from "./components/World";
import { Sidebar } from "./components/Sidebar";
import { Help, Shop, Wardrobe, WorldMap } from "./components/Panels";
import { GamesPanel, type GameId } from "./components/GamesPanel";
import { SafeRoomScenery } from "./components/SafeRoomScenery";
import { ROOM_MANIFESTS } from "./rooms/registry";
import { AudioControls } from "./components/AudioControls";
import { RoomMusic } from "./components/RoomMusic";
import { LightingControls } from "./components/LightingControls";
import { GameHud } from "./components/GameHud";
import { NewsPanel } from "./components/NewsPanel";
import { buyPixel, giftPixel, goldOf } from "./utils/gold.ts";
import {
  resolveBottomId,
  resolveShoeId,
  resolveTopId,
} from "./types/avatarOptions.ts";
import { LOCAL_PLAYER_ID, useCustomServers } from "./useCustomServers";
import { PET_PROFILES } from "./utils/petSpecies";
import { PARK_RIDES, type ParkRideId } from "./utils/parkRides";
import { WATER_RIDE_STAMPS, type WaterRideId } from "./utils/waterRides.ts";
import { lazyPanel } from "./components/lazyPanel";

// Panels, rides and games outside the world stay out of the startup bundle.
const SledRun = lazyPanel(() =>
  import("./components/SledRun").then((module) => module.SledRun),
);
const RiverSurf = lazyPanel(() =>
  import("./components/RiverSurf").then((module) => module.RiverSurf),
);
const KartRace = lazyPanel(() =>
  import("./components/KartRace").then((module) => module.KartRace),
);
const CatalogModal = lazyPanel(() =>
  import("./components/CatalogModal").then((module) => module.CatalogModal),
);
const StampBook = lazyPanel(() =>
  import("./components/StampBook").then((module) => module.StampBook),
);
const SalonModal = lazyPanel(() =>
  import("./components/SalonModal").then((module) => module.SalonModal),
);
const ClosetModal = lazyPanel(() =>
  import("./components/ClosetModal").then((module) => module.ClosetModal),
);
const FriendsPanel = lazyPanel(() =>
  import("./components/FriendsPanel").then((module) => module.FriendsPanel),
);
const JukeboxModal = lazyPanel(() =>
  import("./components/JukeboxModal").then((module) => module.JukeboxModal),
);
const Condo = lazyPanel(() =>
  import("./components/Condo").then((module) => module.Condo),
);
const SpyTerminalModal = lazyPanel(() =>
  import("./components/SpyTerminal").then((module) => module.SpyTerminalModal),
);
const AccountModal = lazyPanel(() =>
  import("./components/AccountModal").then((module) => module.AccountModal),
);
const ServerListModal = lazyPanel(() =>
  import("./components/ServerListModal").then(
    (module) => module.ServerListModal,
  ),
);
const PetCareModal = lazyPanel(() =>
  import("./components/PetCareModal").then((module) => module.PetCareModal),
);
const PetPickerModal = lazyPanel(() =>
  import("./components/PetPickerModal").then((module) => module.PetPickerModal),
);
const LeaderboardModal = lazyPanel(() =>
  import("./components/LeaderboardModal").then(
    (module) => module.LeaderboardModal,
  ),
);
const RooftopLounge = lazyPanel(() =>
  import("./components/RooftopLounge").then((module) => module.RooftopLounge),
);
const ParkRide = lazyPanel(() =>
  import("./components/ParkRide").then((module) => module.ParkRide),
);
const WaterRide = lazyPanel(() =>
  import("./components/WaterRide").then((module) => module.WaterRide),
);
const PlayerCard = lazyPanel(() =>
  import("./components/PlayerCard").then((module) => module.PlayerCard),
);

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
  | "closet"
  | "friends"
  | "jukebox"
  | "condo"
  | "spy"
  | "account"
  | "sled-run"
  | "river-surf"
  | "kart-race"
  | "servers"
  | "pet-care"
  | "pet-picker"
  | "leaderboard"
  | "rooftop"
  | "ride"
  | "news"
  | null;

export default function App() {
  const { player, setPlayer, saveError: playerSaveError } = usePlayer();
  const {
    autoTime,
    setAutoTime,
    timeOfDay,
    setTimeOfDay,
    saveError: lightingSaveError,
  } = useLightingPrefs();
  const saveError = playerSaveError || lightingSaveError;
  const serverSession = useCustomServers();
  const [place, setPlace] = useState<PlaceId>(
    () =>
      PLACES.find(
        (room) => room.id === serverSession.activeServer?.currentRoomId,
      )?.id ?? "square",
  );
  const [spawn, setSpawn] = useState<{ x: number; y: number } | undefined>();
  const [initialGame, setInitialGame] = useState<GameId | null>(null);
  const [waterRide, setWaterRide] = useState<WaterRideId | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [ride, setRide] = useState<ParkRideId>("ferris");
  const rideStamp = PARK_RIDES[ride].stampId;
  // Fantage has no side panel: adventures open from the compass when wanted.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    if (!settingsOpen) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setSettingsOpen(false);
      } else if (
        !(event.target instanceof Element) ||
        !event.target.closest(".header-actions")
      ) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [settingsOpen]);
  const [toast, setToast] = useState("");
  const spokenToast = useRef("");
  useEffect(() => {
    const said = spokenToast.current;
    spokenToast.current = toast;
    if (!toast) return;
    // A stamp appended to the showing toast is read on its own, not the whole toast again.
    speak(said && toast.startsWith(said) ? toast.slice(said.length) : toast);
    const id = window.setTimeout(() => setToast(""), 4800);
    return () => window.clearTimeout(id);
  }, [toast]);
  const notify = (message: string) => setToast(message);
  // Every newly earned stamp gets its own celebration; stamps already in the save stay quiet.
  const knownStamps = useRef(player.stamps ?? []);
  useEffect(() => {
    const fresh = (player.stamps ?? []).filter(
      (id) => !knownStamps.current.includes(id),
    );
    knownStamps.current = player.stamps ?? [];
    const message = STAMP_DEFINITIONS.filter((item) => fresh.includes(item.id))
      .map((stamp) => `${stamp.icon} New stamp: ${stamp.name}!`)
      .join(" ");
    if (!message) return;
    setToast((current) => (current ? `${current} ${message}` : message));
  }, [player.stamps]);
  const openGames = (game: GameId | null = null) => {
    setInitialGame(game);
    setPanel(game === "sled-run" ? "sled-run" : "games");
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
    serverSession.moveToRoom(destination);
    setPlayer((p) => visitPlace(p, destination));
    setPanel(null);
  };
  const adventure = (id: AdventureId) => {
    if (id === "neighbors") {
      navigate("square");
      notify("Click Milo, Cleo, and Pip to say hello!");
    } else if (id === "game") {
      setPlace("arcade");
      serverSession.moveToRoom("arcade");
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
    "sled-run": [
      "Mt. Mist Sled Run",
      "Follow the snow trail. Land your stunts.",
    ],
    games: [
      "Let the good times roar",
      "A little friendly competition at the arcade.",
    ],
    help: ["Welcome to Club Lion", "Your next little adventure starts here."],
  };
  return (
    <>
      <MaterialDefs />
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
          <div className="header-actions header-player">
            <span className="gold-counter" data-gold={goldOf(player)}>
              <span aria-hidden="true">🪙</span> {goldOf(player)}
              <span className="sr-only"> gold</span>
            </span>
            <div className="player-menu">
              <button
                className="avatar-button"
                onClick={() => setPanel("style")}
                aria-label="Customize your lion"
              >
                <span className="header-avatar">
                  <Avatar look={player.look} size={36} framing="portrait" />
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
        {serverSession.saveError && (
          <p className="save-warning" role="alert">
            Your browser couldn’t save this lounge. It will stay available until
            you close this page.
          </p>
        )}
        <div className="game-layout">
          <RoomMusic place={place} />
          <World
            key={`${serverSession.activeServer?.id ?? "local"}:${place}`}
            spawn={spawn}
            player={player}
            place={place}
            timeOfDay={timeOfDay}
            navigate={navigate}
            onMap={() => setPanel("map")}
            onShop={() => setPanel("shop")}
            onGame={() => openGames()}
            onActivity={openGames}
            onGreet={(id) => setPlayer((p) => meetLion(p, id))}
            notify={notify}
            onOpenCatalog={() => setPanel("catalog")}
            onOpenSalon={() => setPanel("salon")}
            onOpenSpy={() => setPanel("spy")}
            onOpenJukebox={() => setPanel("jukebox")}
            onOpenCondo={() => setPanel("condo")}
            onCollectPin={(day, pinId) =>
              setPlayer((p) => collectPin(p, day, pinId))
            }
            onFindButterfly={(day, spot) =>
              setPlayer((p) => findSquareButterfly(p, day, spot))
            }
            onMoveProp={(roomId, propId, point) =>
              setPlayer((p) => movePropSpot(p, roomId, propId, point))
            }
            onUnlockStamp={(stampId) =>
              setPlayer((p) => unlockStamp(p, stampId))
            }
            onOpenRiverSurf={() => setPanel("river-surf")}
            onOpenKartRace={() => setPanel("kart-race")}
            onOpenPetCare={() => setPanel("pet-care")}
            onOpenPetPicker={() => setPanel("pet-picker")}
            onOpenLeaderboard={() => setPanel("leaderboard")}
            onOpenRooftop={() => setPanel("rooftop")}
            onOpenRide={(id) => {
              setRide(id);
              setPanel("ride");
            }}
            onRide={setWaterRide}
          />
          <GameHud
            panel={panel}
            place={place}
            sidebarOpen={sidebarOpen}
            settingsOpen={settingsOpen}
            settings={
              <>
                <LightingControls
                  timeOfDay={timeOfDay}
                  autoTime={autoTime}
                  onSelectTime={(time) => {
                    setAutoTime(false);
                    setTimeOfDay(time);
                  }}
                  onToggleAuto={() => setAutoTime((prev) => !prev)}
                />
                <AudioControls />
                <button
                  className="icon-button help-button"
                  aria-label="How to play"
                  onClick={() => {
                    setSettingsOpen(false);
                    setPanel("help");
                  }}
                >
                  <CircleHelp size={22} />
                </button>
              </>
            }
            onPanel={setPanel}
            onWorld={() => {
              navigate("square");
              closePanel();
            }}
            onGames={() => openGames()}
            onDen={() => navigate("den")}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onToggleSettings={() => setSettingsOpen((open) => !open)}
          />
          <aside
            className={`sidebar-drawer ${sidebarOpen ? "is-open" : "is-collapsed"}`}
            aria-label="Adventures and profile"
          >
            <div className="sidebar-drawer-top">
              <span className="sidebar-drawer-heading">
                Adventures & Profile
              </span>
              <button
                type="button"
                className="icon-button sidebar-drawer-close"
                aria-label="Close adventures sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
            </div>
            <Sidebar
              player={player}
              onStyle={() => setPanel("style")}
              onAdventure={adventure}
              onClaim={(id) => {
                setPlayer((p) => claimReward(p, id));
                notify("Adventure complete! Hooray! 🎉");
              }}
            />
          </aside>
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
                    <SafeRoomScenery place={destination.id} preview />
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
      {panel === "friends" && (
        <FriendsPanel
          myId={LOCAL_PLAYER_ID}
          graph={{
            friends: player.friends ?? [],
            pendingIncoming: player.incomingFriendRequests ?? [],
            pendingOutgoing: player.outgoingFriendRequests ?? [],
            recentVisitors: player.recentVisitors ?? [],
          }}
          profiles={[]}
          onJumpToFriend={navigate}
          onSendEmote={() =>
            notify("No online player is connected in this local session.")
          }
          onUpdateSocialGraph={(graph) =>
            setPlayer((p) => ({
              ...p,
              friends: graph.friends,
              incomingFriendRequests: graph.pendingIncoming,
              outgoingFriendRequests: graph.pendingOutgoing,
              recentVisitors: graph.recentVisitors,
            }))
          }
          onClose={closePanel}
        />
      )}
      {panel === "servers" && (
        <ServerListModal
          playerId={LOCAL_PLAYER_ID}
          playerName={player.name}
          servers={serverSession.servers}
          activeServer={serverSession.activeServer}
          onConnect={(server) => {
            const room = PLACES.find(
              (destination) => destination.id === server.currentRoomId,
            );
            if (!room) return;
            serverSession.connect(server);
            navigate(room.id);
            if (server.hostId === LOCAL_PLAYER_ID) {
              setPlayer((p) => unlockStamp(p, "server_host"));
              notify(`Lounge Host! Joined ${server.name}.`);
            } else {
              notify(`Joined ${server.name}.`);
            }
          }}
          onUpdateServer={serverSession.updateServer}
          onLeave={serverSession.leave}
          onClose={closePanel}
        />
      )}
      {panel === "stamps" && <StampBook player={player} onClose={closePanel} />}
      {panel === "card" && (
        <PlayerCard
          player={player}
          onClose={closePanel}
          onSaveMoodQuote={(moodQuote) => {
            setPlayer((p) => ({ ...p, moodQuote }));
            notify("Status updated!");
          }}
          onPickPet={() => setPanel("pet-picker")}
        />
      )}
      {panel === "catalog" && (
        <CatalogModal
          player={player}
          onClose={closePanel}
          onBuy={(id) => {
            setPlayer((p) => buyCatalogItem(p, id));
            notify("Added to your closet!");
          }}
          onEquip={(id) => {
            setPlayer((p) => equipCatalogItem(p, id));
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
          player={player}
          onBuy={(id) => {
            setPlayer((p) => buyPixel(p, "hair", id));
            notify("Bought! A fresh new hairstyle.");
          }}
          onClose={closePanel}
          onSave={(look) => {
            setPlayer((p) => {
              const styled = applySalonLook(p, look);
              return look.hairStreak
                ? unlockStamp(styled, "hair_highlight")
                : styled;
            });
            closePanel();
            notify("Looking fabulous! Fresh look saved.");
          }}
        />
      )}
      {panel === "closet" && (
        <ClosetModal
          player={player}
          onBuy={(kind, id) => {
            setPlayer((p) => buyPixel(p, kind, id));
            notify("Bought! It's in your closet now.");
          }}
          onClose={closePanel}
          onShop={() => setPanel("catalog")}
          onSave={(outfit) => {
            setPlayer((p) => dressAvatar(p, outfit));
            closePanel();
            notify("Outfit on! Serving looks.");
          }}
        />
      )}
      {panel === "jukebox" && <JukeboxModal onClose={closePanel} />}
      {panel === "news" && (
        <Dialog
          title="The Daily Roar"
          subtitle="Today's news from around town"
          onClose={closePanel}
        >
          <NewsPanel
            look={player.look}
            onPlay={(game) => openGames(game)}
            onWear={(dressId) => {
              setPlayer((p) =>
                dressAvatar(giftPixel(p, "dress", dressId), {
                  topId: resolveTopId(p.look),
                  bottomId: resolveBottomId(p.look),
                  shoesId: resolveShoeId(p.look),
                  shoeKitId: p.look.shoeKitId,
                  dressId,
                }),
              );
              closePanel();
              notify("Outfit of the Day on! Looking great!");
            }}
          />
        </Dialog>
      )}
      {panel === "condo" && (
        <Dialog
          title="Luxury Penthouse Condo"
          subtitle="Customize your 16×16 isometric furniture grid"
          onClose={closePanel}
          wide
        >
          <Condo
            condoLayout={player.condoLayout}
            onSaveLayout={(layout) => {
              setPlayer((p) => ({ ...p, condoLayout: layout }));
              notify("Condo layout saved!");
            }}
            onClose={closePanel}
          />
        </Dialog>
      )}
      {panel === "spy" && (
        <SpyTerminalModal
          spyPuzzlesSolved={player.spyPuzzlesSolved ?? 0}
          onCompletePuzzle={(puzzleType, scoreOrStage) => {
            setPlayer((p) => completeSpyPuzzle(p, puzzleType, scoreOrStage));
            notify("Mission complete!");
          }}
          onClose={closePanel}
        />
      )}
      {panel === "account" && (
        <AccountModal
          player={player}
          onUpdatePlayer={setPlayer}
          onClose={closePanel}
          notify={notify}
        />
      )}
      {panel === "ride" && (
        <Dialog
          title={PARK_RIDES[ride].name}
          onClose={closePanel}
          className="dialog-ride"
        >
          <ParkRide
            ride={ride}
            look={player.look}
            pet={player.pet}
            onFinish={() => setPlayer((p) => unlockStamp(p, rideStamp))}
            onClose={closePanel}
          />
        </Dialog>
      )}
      {panel === "river-surf" && (
        <Dialog title="Canyon Rapids River Surf" onClose={closePanel}>
          <RiverSurf
            best={player.riverSurfBest ?? 0}
            onComplete={(score) => {
              setPlayer((p) => {
                let updated = completeRiverSurf(p, { score });
                const eligible = evaluateStampUnlocks(updated);
                for (const id of eligible) {
                  updated = unlockStamp(updated, id);
                }
                return score >= 30
                  ? unlockStamp(updated, "river_surf_pro")
                  : updated;
              });
              notify("Gnarly run!");
            }}
            onClose={closePanel}
          />
        </Dialog>
      )}
      {panel === "kart-race" && (
        <Dialog title="Lion Speedway" onClose={closePanel} wide>
          <KartRace
            look={player.look}
            petColor={player.pet?.color || player.color}
            petSpecies={player.pet?.species}
            racesFinished={player.kartRacesFinished ?? 0}
            bestLapMs={player.kartBestLapMs}
            colorId={player.kartColor}
            mode={player.kartMode}
            onPrefs={(prefs) => setPlayer((p) => setKartPrefs(p, prefs))}
            onFinish={(result) =>
              setPlayer((p) => {
                let updated = completeKartRace(p, result);
                for (const id of evaluateStampUnlocks(updated))
                  updated = unlockStamp(updated, id);
                return updated;
              })
            }
            onExit={closePanel}
          />
        </Dialog>
      )}
      {panel === "pet-picker" && (
        <PetPickerModal
          species={player.pet.species}
          color={player.color}
          onPick={(species) => {
            setPlayer((p) => choosePetSpecies(p, species));
            notify(`Say hi to ${PET_PROFILES[species].petName}!`);
          }}
          onClose={closePanel}
        />
      )}
      {panel === "pet-care" && (
        <PetCareModal
          petName={player.pet.name}
          species={player.pet.species}
          lionColor={player.color}
          lionAccessory={player.accessory}
          petCare={player.petCare}
          onCare={(action) => {
            setPlayer((p) => applyPetCareAction(p, action));
          }}
          onPickPet={() => setPanel("pet-picker")}
          onClose={closePanel}
        />
      )}
      {panel === "leaderboard" && (
        <LeaderboardModal player={player} onClose={closePanel} />
      )}
      {panel === "rooftop" && <RooftopLounge onClose={closePanel} />}
      {waterRide && (
        <WaterRide
          ride={waterRide}
          look={player.look}
          pet={player.pet}
          onClose={() => setWaterRide(null)}
          onFinish={(ride) =>
            setPlayer((p) => unlockStamp(p, WATER_RIDE_STAMPS[ride]))
          }
        />
      )}
      {panel &&
        panel !== "card" &&
        panel !== "catalog" &&
        panel !== "salon" &&
        panel !== "closet" &&
        panel !== "stamps" &&
        panel !== "friends" &&
        panel !== "jukebox" &&
        panel !== "condo" &&
        panel !== "spy" &&
        panel !== "account" &&
        panel !== "servers" &&
        panel !== "river-surf" &&
        panel !== "kart-race" &&
        panel !== "pet-care" &&
        panel !== "pet-picker" &&
        panel !== "leaderboard" &&
        panel !== "rooftop" &&
        panel !== "ride" &&
        panel !== "news" && (
          <Dialog
            title={titles[panel][0]}
            subtitle={titles[panel][1]}
            onClose={closePanel}
            className={panel === "map" ? "map-sheet" : ""}
            wide={
              panel === "shop" ||
              panel === "map" ||
              panel === "style" ||
              panel === "games" ||
              panel === "sled-run"
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
            {panel === "sled-run" && (
              <SledRun
                look={player.look}
                best={player.sledRunBest}
                onComplete={(score, result) => {
                  setPlayer((p) => {
                    let updated = completeSledRun(p, result);
                    const eligible = evaluateStampUnlocks(updated);
                    for (const id of eligible) {
                      updated = unlockStamp(updated, id);
                    }
                    return result.tricksCompleted >= 3 || score >= 50
                      ? unlockStamp(updated, "sled_champion")
                      : updated;
                  });
                  navigate("mt-mist", { x: 1800, y: 600 });
                  notify("Sled run complete!");
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
                onCompleteSmoothie={() =>
                  setPlayer((p) => completeSmoothieOrder(p))
                }
                onServeCake={(cake) =>
                  setPlayer((p) => completeBakeryServe(p, cake))
                }
                onCompleteSeek={(round) =>
                  setPlayer((p) => completeSeekRound(p, round))
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
                  notify(`Caught a ${res.speciesId.replace(/_/g, " ")}!`);
                }}
                onCompleteFashion={(res) => {
                  setPlayer((p) => recordFashionShowResult(p, res));
                  notify("Runway show complete!");
                }}
                onCompleteMangoRun={(score) =>
                  setPlayer((p) => completeMangoRun(p, score))
                }
                onCompleteBubblePop={(score) =>
                  setPlayer((p) => completeBubblePop(p, score))
                }
                onCompleteAnimalBand={(taps) =>
                  setPlayer((p) => completeAnimalBand(p, taps))
                }
                onCompleteShapeSorter={(round) =>
                  setPlayer((p) => completeShapeSorterRound(p, round))
                }
                onCompletePicturePuzzle={(pieces) =>
                  setPlayer((p) => completePicturePuzzle(p, pieces))
                }
                onCompleteFireflies={(score) =>
                  setPlayer((p) => completeFireflies(p, score))
                }
                onCompleteFantage={(id, score) =>
                  setPlayer((p) => completeFantageGame(p, id, score))
                }
                onCompletePeekaboo={(found) =>
                  setPlayer((p) => completePeekaboo(p, found))
                }
                onShowPet={(theme, outfit) =>
                  setPlayer((p) => completeDressPet(p, theme, outfit))
                }
                onCompletePetRoundUp={(score) =>
                  setPlayer((p) => completePetRoundUp(p, score))
                }
                onServeHaloHalo={(layers) =>
                  setPlayer((p) => completeHaloHalo(p, layers))
                }
                onCompleteBalloonRainbow={() =>
                  setPlayer((p) => completeBalloonRainbow(p))
                }
                onColorPage={(pageId, fills, finish) =>
                  setPlayer((p) => colorPage(p, pageId, fills, finish))
                }
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
