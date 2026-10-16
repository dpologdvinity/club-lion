import { RoomObject } from "./RoomObject.tsx";
import { speak } from "../utils/speech";
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
  Home,
  Map,
  MapPin,
  Music,
  PawPrint,
  Send,
  Shirt,
  Smile,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { NEIGHBORS, PLACES, type PlaceId, type PlayerV2 } from "../game";
import { ROOM_MANIFESTS } from "../rooms/registry";
import { portalIcon } from "../rooms/placeIcons";
import type { RoomManifest } from "../rooms/types";
import { roomFrameFor } from "../rooms/roomSpace";
import {
  planClickWalk,
  planKeyboardStep,
  legDurations,
} from "../utils/walkPlan.ts";
import { ObstacleDebugOverlay } from "./ObstacleDebugOverlay";
import { WorldProp } from "./WorldProp";
import { playBoing } from "../utils/worldPropSounds.ts";
import { benchAtPoint, petSideFor } from "../utils/worldProps.ts";
import { CameraViewport } from "./CameraViewport";
import { SafeRoomScenery } from "./SafeRoomScenery";
import { GlobalLightingOverlay } from "./GlobalLightingOverlay";
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
import {
  playFoghorn,
  playOceanSurf,
  stopOceanSurf,
} from "../utils/nauticalAudio.ts";
import { SpyPinModal } from "./SpyPinModal.tsx";
import { HotspotBurst } from "./HotspotBurst.tsx";
import type { TimeOfDay } from "../utils/environmentalLighting.ts";
import { playPropSound } from "../utils/interactiveProps.ts";
import { useCompactLayout } from "./compactLayout";
import { Dialog } from "./Dialog";
import { WorldMap } from "./Panels";
import { RIDE_HOTSPOTS, type ParkRideId } from "../utils/parkRides.ts";
import type { WaterRideId } from "../utils/waterRides.ts";
import { isRoomMusicOn, setRoomMusicOn } from "../utils/roomMusicPlayer.ts";

const BOARD_SPEED_MULTIPLIER = 1.5;
const WALK_DURATION_MS = 850;
const KEY_STEP_MS = 220;
const BUMP_THROTTLE_MS = 600;
const BUMP_KEYFRAMES: Keyframe[] = [
  { transform: "scale(1, 1)" },
  { transform: "scale(1.12, 0.86)", offset: 0.3 },
  { transform: "scale(0.94, 1.08)", offset: 0.6 },
  { transform: "scale(1, 1)" },
];
/** `?debug=obstacles` draws solid scenery and collision rings. */
const SHOW_OBSTACLE_DEBUG =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("debug") === "obstacles";

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
  onOpenSpy?: () => void;
  onOpenJukebox?: () => void;
  onOpenCondo?: () => void;
  onUnlockStamp?: (stampId: string) => void;
  onOpenRiverSurf?: () => void;
  onOpenPetCare?: () => void;
  onOpenPetPicker?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenRooftop?: () => void;
  onOpenKartRace?: () => void;
  onOpenRide?: (ride: ParkRideId) => void;
  onRide?: (ride: WaterRideId) => void;
  timeOfDay?: TimeOfDay;
};

const WATER_RIDE_HOTSPOTS: Record<string, WaterRideId> = {
  "speed-slides": "slides",
  "tsunami-wave-pool": "wave",
  "dump-bucket-fortress": "bucket",
  "lazy-river-current": "river",
};

/** In-world avatar widths, large enough for the doll face to read. */
const WORLD_AVATAR_SIZE = { map: 118, stage: 184 } as const;
/** How far above the avatar's feet a hotspot label moves to clear the head. */
const AVATAR_LABEL_LIFT = 330;

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
  onOpenSpy,
  onOpenJukebox,
  onOpenCondo,
  onUnlockStamp,
  onOpenRiverSurf,
  onOpenPetCare,
  onOpenPetPicker,
  onOpenLeaderboard,
  onOpenRooftop,
  onOpenKartRace,
  onOpenRide,
  onRide,
  timeOfDay = "day",
}: WorldProps) {
  const manifest = ROOM_MANIFESTS[place];
  const [objectStates, setObjectStates] = useState<Record<string, number>>({});
  const roomItems =
    manifest?.interactives.filter(
      (item) =>
        !item.requiresDecor || player.decor.includes(item.requiresDecor),
    ) ?? [];
  const [position, setPosition] = useState(() =>
    manifest
      ? {
          x:
            ((spawn?.x ?? manifest.stageWidth / 2) / manifest.stageWidth) * 100,
          y: ((spawn?.y ?? 600) / manifest.stageHeight) * 100,
        }
      : (spawn ?? { x: 43, y: 78 }),
  );
  const stagePosition = manifest
    ? {
        x: Math.round((position.x / 100) * manifest.stageWidth * 1e6) / 1e6,
        y: Math.round((position.y / 100) * manifest.stageHeight * 1e6) / 1e6,
      }
    : position;
  // Apply explicit fast-travel spawns even when the destination is this room.
  useEffect(() => {
    if (!spawn) return;
    setPosition(
      manifest
        ? {
            x: (spawn.x / manifest.stageWidth) * 100,
            y: (spawn.y / manifest.stageHeight) * 100,
          }
        : spawn,
    );
  }, [spawn, manifest]);
  const [avatarAction, setAvatarAction] = useState<string>("idle");
  const [avatarHeading, setAvatarHeading] = useState<"left" | "right">("right");
  const [isTrotting, setIsTrotting] = useState(false);
  const [actionWheelOpen, setActionWheelOpen] = useState(false);
  const compact = useCompactLayout();
  // Phones: the bar's Map opens this sheet, which also lists this room's activities.
  const [roomSheetOpen, setRoomSheetOpen] = useState(false);
  const [mangoToss, setMangoToss] = useState<{
    origin: { x: number; y: number };
    target: { x: number; y: number };
  } | null>(null);
  const [tossPending, setTossPending] = useState(false);
  const walkTimer = useRef<number | null>(null);
  const lastBump = useRef(-Infinity);
  const avatarBodyRef = useRef<HTMLDivElement>(null);
  const [glideMs, setGlideMs] = useState(WALK_DURATION_MS);
  const sitAfterWalk = useRef(false);
  const [seatedOn, setSeatedOn] = useState<string | null>(null);
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
  const [burst, setBurst] = useState<{
    id: number;
    x: number;
    y: number;
    emojis: string[];
  } | null>(null);
  // Room music is session-wide, so the speaker state survives travel.
  const [sound, setSound] = useState(isRoomMusicOn);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!sound || manifest?.ambientAudioPreset !== "ocean-surf") return;
    playOceanSurf();
    const interval = window.setInterval(() => playOceanSurf(), 6500);
    return () => {
      window.clearInterval(interval);
      stopOceanSurf();
    };
  }, [sound, manifest]);
  const currentPlace = PLACES.find((p) => p.id === place)!;
  const [spyPinOpen, setSpyPinOpen] = useState(false);
  const [pendingPortalSpawn, setPendingPortalSpawn] = useState<{
    x: number;
    y: number;
  }>({ x: 250, y: 600 });

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
  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(null), 2200);
    return () => window.clearTimeout(timer);
  }, [burst]);
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
              // Particle velocity uses pixels per second, including in wide rooms.
              x: parseFloat(style.left),
              y: parseFloat(style.top),
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

  const frame = roomFrameFor(place, manifest);
  const toSpace = (point: { x: number; y: number }) => ({
    x: point.x * frame.scale.x,
    y: point.y * frame.scale.y,
  });
  const toPercent = (point: { x: number; y: number }) => ({
    x: point.x / frame.scale.x,
    y: point.y / frame.scale.y,
  });
  const petSide = petSideFor(
    toSpace(position),
    frame.space,
    frame.petRadius,
    frame.petOffset,
  );
  // Glide through each route leg in turn; each leg is one CSS transition.
  const glideLegs = (
    from: { x: number; y: number },
    legs: { x: number; y: number }[],
    totalMs: number,
  ) => {
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    const durations = legDurations(toSpace(from), legs.map(toSpace), totalMs);
    let previousX = from.x;
    const end = legs.at(-1);
    const runLeg = (index: number) => {
      const next = legs[index];
      if (!next) {
        walkTimer.current = null;
        setIsTrotting(false);
        const bench = end
          ? benchAtPoint(toSpace(end), frame.space.obstacles)
          : undefined;
        const sitting = sitAfterWalk.current || !!bench;
        sitAfterWalk.current = false;
        setAvatarAction(sitting ? "sit" : "idle");
        setSeatedOn(sitting ? (bench?.id ?? null) : null);
        return;
      }
      setAvatarHeading(next.x < previousX ? "left" : "right");
      previousX = next.x;
      setGlideMs(durations[index]);
      setPosition(next);
      setIsTrotting(true);
      setAvatarAction("walk");
      walkTimer.current = window.setTimeout(
        () => runLeg(index + 1),
        durations[index],
      );
    };
    runLeg(0);
  };
  // Tapping a bench walks to its seat, then the avatar sits.
  const sitOnBench = (seat: { x: number; y: number }) => {
    const percent = toPercent(seat);
    walk(percent.x, percent.y);
    sitAfterWalk.current = true;
  };
  const bumpAvatar = () => {
    const now = performance.now();
    if (now - lastBump.current < BUMP_THROTTLE_MS) return;
    lastBump.current = now;
    if (!reducedMotion)
      avatarBodyRef.current?.animate(BUMP_KEYFRAMES, {
        duration: 360,
        easing: "ease-out",
      });
    playBoing(sound ? undefined : null);
  };

  const walk = (x: number, y: number, mode: "route" | "slide" = "route") => {
    const speedMultiplier = boardId ? BOARD_SPEED_MULTIPLIER : 1;
    const target = toSpace({ x, y });
    sitAfterWalk.current = false;
    setSeatedOn(null);
    const plan =
      mode === "slide"
        ? planKeyboardStep(toSpace(position), target, frame.space, frame.radius)
        : planClickWalk(toSpace(position), target, frame.space, frame.radius);
    if (plan.bump) bumpAvatar();
    if (plan.legs.length === 0) return;
    chime();
    glideLegs(
      position,
      plan.legs.map(toPercent),
      (mode === "slide" ? KEY_STEP_MS : WALK_DURATION_MS) / speedMultiplier,
    );
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
        "slide",
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
    speak(neighbor.greeting);
  };
  const visibleNeighbors = manifest
    ? (manifest.neighbors ?? []).flatMap((at) => {
        const neighbor = NEIGHBORS.find((n) => n.id === at.id);
        return neighbor ? [{ ...neighbor, x: at.x, y: at.y }] : [];
      })
    : place === "square"
      ? NEIGHBORS
      : [];

  const portal = (target: string, targetSpawn: { x: number; y: number }) => {
    if (target === "le-shop") {
      onOpenCatalog?.();
      return;
    }
    if (target === "secret-scout-base" && place === "downtown-plaza") {
      setPendingPortalSpawn(targetSpawn);
      setSpyPinOpen(true);
      return;
    }
    const destination = PLACES.find((p) => p.id === target);
    if (destination) navigate(destination.id, targetSpawn);
  };

  const handleSpyPinUnlock = () => {
    setSpyPinOpen(false);
    navigate("secret-scout-base", pendingPortalSpawn);
    notify("Clearance accepted. Welcome to Secret Scout HQ, Agent.");
  };
  const stageWalk = (x: number, y: number, mode?: "route" | "slide") => {
    if (!manifest) return;
    if (tossPending) {
      setMangoToss({
        origin: { x: stagePosition.x, y: stagePosition.y - 40 },
        target: { x, y },
      });
      setTossPending(false);
    } else
      walk(
        (x / manifest.stageWidth) * 100,
        (y / manifest.stageHeight) * 100,
        mode,
      );
  };
  const hotspot = (id: string) => {
    const item = roomItems.find((item) => item.id === id);
    if (item?.reaction) {
      stageWalk(
        Math.min(item.position.x + 190, (manifest?.stageWidth ?? 1920) - 100),
        650,
      );
      setObjectStates((states) => ({ ...states, [id]: (states[id] ?? 0) + 1 }));
      playPropSound(item.reaction.sound, sound ? undefined : null);
      notify(item.reaction.message);
    }
    if (item?.actionData.roomAction === "games") {
      onGame();
      return;
    }
    if (item?.actionData.roomAction === "shop") {
      onShop();
      return;
    }
    if (item?.actionData.roomAction === "leaderboard") {
      onOpenLeaderboard?.();
      return;
    }
    const gameId = item?.actionData.gameId;
    if (gameId) {
      onActivity(gameId);
      return;
    }
    if (id === "lighthouse-foghorn") {
      playFoghorn(sound ? undefined : null);
      onUnlockStamp?.("lighthouse_foghorn");
      notify("BWWWOOOOMMM! 📯 The lighthouse foghorn echoes across the bay!");
    } else if (id === "park-map-kiosk") onMap();
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
    else if (Object.hasOwn(WATER_RIDE_HOTSPOTS, id))
      onRide?.(WATER_RIDE_HOTSPOTS[id]);
    else if (id === "pet-grooming-station") onOpenPetCare?.();
    else if (id === "pet-pick-pet") onOpenPetPicker?.();
    else if (id === "spy-terminal") onOpenSpy?.();
    else if (id === "river-surf-dock") onOpenRiverSurf?.();
    else if (id === "kart-race-gate") onOpenKartRace?.();
    else if (id === "aquarium-feed-fish") {
      const at = manifest?.interactives.find(
        (item) => item.id === id,
      )?.position;
      onUnlockStamp?.("aquarium_feeder");
      if (at)
        setBurst({
          id: Date.now(),
          x: at.x,
          y: at.y - 120,
          emojis: ["🐟", "💖", "🐠", "💖", "🐟"],
        });
      playPropSound("chime", sound ? undefined : null);
      notify("Yum! The fish swarm to the snack. 🐟💖");
    } else if (id === "aquarium-touch-pool") {
      const at = manifest?.interactives.find(
        (item) => item.id === id,
      )?.position;
      if (at)
        setBurst({
          id: Date.now(),
          x: at.x,
          y: at.y - 120,
          emojis: ["⭐", "🦀", "💧"],
        });
      playPropSound("chime", sound ? undefined : null);
      notify("Starfish says hi! The crab wiggles its claws. 🦀");
    } else if (id === "rink-skate") {
      onUnlockStamp?.("rink_spinner");
      setAvatarAction("skate");
      if (walkTimer.current) window.clearTimeout(walkTimer.current);
      walkTimer.current = window.setTimeout(
        () => setAvatarAction("idle"),
        4000,
      );
      notify("Whee! Spin on the ice! ⛸️");
    } else if (id === "rink-hot-cocoa") {
      const at = manifest?.interactives.find(
        (item) => item.id === id,
      )?.position;
      if (at)
        setBurst({
          id: Date.now(),
          x: at.x,
          y: at.y - 120,
          emojis: ["☕", "💛", "♨️"],
        });
      notify("Hot cocoa with a toasty marshmallow! ☕");
    } else if (id === "winner-podium" && manifest) {
      walk(
        (2020 / manifest.stageWidth) * 100,
        (600 / manifest.stageHeight) * 100,
      );
      setBubble({ id: "you", text: "🏆📸" });
      playPropSound("chime", sound ? undefined : null);
      notify(
        "Say cheese! 📸 You strike a champion pose on the winner's podium!",
      );
    } else if (id === "condo-furniture-editor") onOpenCondo?.();
    else if (id === "condo-jukebox") onOpenJukebox?.();
    else if (id === "surveillance-holo-map")
      notify("The Pride Agency satellite grid is scanning the savanna.");
    else if (RIDE_HOTSPOTS[id]) onOpenRide?.(RIDE_HOTSPOTS[id]);
  };
  // Picture-first labels for hotspots, so pre-readers can spot them.
  const hotspotIcon = (icon: string | undefined) =>
    icon && (
      <span className="hotspot-icon" aria-hidden="true">
        {icon}
      </span>
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
            onClick={() => {
              const next = !sound;
              setSound(next);
              setRoomMusicOn(next);
            }}
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
        glideMs={glideMs}
        board={!!boardId}
        timeOfDay={timeOfDay}
        reducedMotion={reducedMotion}
      >
        {manifest && <SafeRoomScenery place={place} />}
        {place === "club-pulse" && (
          <DanceFloor
            floorBounds={CLUB_PULSE_DANCE_FLOOR_BOUNDS}
            avatarPosition={stagePosition}
            muted={!sound}
            onStep={(point) => stageWalk(point.x, point.y)}
          />
        )}
        {roomItems
          .filter(
            (item) =>
              !item.object &&
              (item.type !== "instrument" || item.id === "lighthouse-foghorn"),
          )
          .map((item) => {
            const top =
              item.position.y - (item.id === "lighthouse-foghorn" ? 210 : 95);
            // A label in front of the avatar hides its face: lift it above the head.
            const coversAvatar =
              Math.abs(item.position.x - stagePosition.x) < 150 &&
              top > stagePosition.y - AVATAR_LABEL_LIFT + 5 &&
              top < stagePosition.y + 30;
            return (
              <button
                key={item.id}
                className="building-label room-hotspot"
                tabIndex={-1}
                style={{
                  left: item.position.x,
                  top: coversAvatar ? stagePosition.y - AVATAR_LABEL_LIFT : top,
                }}
                onClick={() => hotspot(item.id)}
              >
                {hotspotIcon(item.icon)}
                {item.label} <ArrowUpRight size={17} />
              </button>
            );
          })}
        {roomItems
          .filter((item) => item.object)
          .map((item) => (
            <RoomObject
              key={item.id}
              item={item}
              state={objectStates[item.id] ?? 0}
              onActivate={() => hotspot(item.id)}
            />
          ))}
        {SHOW_OBSTACLE_DEBUG && <ObstacleDebugOverlay frame={frame} />}
        {frame.space.obstacles.map(
          (obstacle) =>
            obstacle.prop && (
              <WorldProp
                key={obstacle.id}
                obstacle={obstacle}
                unit={frame.unit}
                avatar={toSpace(position)}
                seated={seatedOn === obstacle.id}
                soundOn={sound}
                onSit={sitOnBench}
              />
            ),
        )}
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
            <button
              type="button"
              className="room-interactive-prop square-fountain"
              aria-label="Savanna fountain"
              title="Plaza fountain"
              style={{ left: "50%", top: "44%" }}
              onClick={() => {
                playPropSound("splash", sound ? undefined : null);
                notify(
                  "A sparkling splash of savanna sunshine from the fountain! ⛲✨",
                );
              }}
            >
              ⛲
            </button>
          </>
        )}
        {place === "mt-mist" && (
          <button
            className="room-action"
            onClick={() => onActivity("sled-run")}
          >
            Sled Run Race <ArrowUpRight size={17} />
          </button>
        )}
        {place === "canyon-rapids" && (
          <button className="room-action" onClick={() => onOpenRiverSurf?.()}>
            <Waves size={18} /> River Surf Rapids
          </button>
        )}
        {place === "penthouse-condo" && (
          <>
            <button className="room-action" onClick={onOpenCondo}>
              <Home size={18} /> Edit Furniture Grid
            </button>
            <button
              className="room-action"
              onClick={onOpenJukebox}
              style={{ top: "80px" }}
            >
              <Sparkles size={18} /> Grand Jukebox
            </button>
            <button
              className="room-action"
              onClick={onOpenRooftop}
              style={{ top: "140px" }}
            >
              <Music size={18} /> Skydeck VIP Lounge
            </button>
          </>
        )}
        {place === "coastal-pier" && (
          <button
            className="room-action"
            onClick={() => hotspot("lighthouse-foghorn")}
          >
            <Volume2 size={18} /> Sound Foghorn
          </button>
        )}
        {place === "mt-mist" && (
          <button
            className="room-action"
            onClick={() => hotspot("sled-run-gate")}
          >
            <Sparkles size={18} /> Sled Run
          </button>
        )}
        {place === "canyon-rapids" && (
          <button
            className="room-action"
            onClick={() => hotspot("river-surf-dock")}
          >
            <Sparkles size={18} /> River Surf
          </button>
        )}
        {place === "pet-paradise" && (
          <button
            className="room-action"
            onClick={() => hotspot("pet-grooming-station")}
          >
            <Sparkles size={18} /> Grooming Spa
          </button>
        )}
        {place === "secret-scout-base" && (
          <button className="room-action" onClick={onOpenSpy}>
            <Sparkles size={18} /> Spy Terminal
          </button>
        )}
        {place === "downtown-plaza" && (
          <>
            <button
              className="room-action"
              style={{ left: "21%", top: "72%", right: "auto" }}
              onClick={() => navigate("penthouse-condo", { x: 960, y: 400 })}
              aria-label="Penthouse Elevator"
            >
              <Home size={18} /> Penthouse Elevator
            </button>
            <button
              className="room-action"
              style={{ left: "80%", top: "72%", right: "auto" }}
              onClick={() => {
                setPendingPortalSpawn({ x: 250, y: 600 });
                setSpyPinOpen(true);
              }}
              aria-label="Telephone Booth - Classified Entrance"
            >
              <Sparkles size={18} /> Telephone Booth
            </button>
          </>
        )}
        {visibleNeighbors.map((n) => (
          <button
            key={n.id}
            className={`world-character neighbor ${bubble?.id === n.id ? "talking" : ""}`}
            style={{
              left: manifest ? n.x : `${n.x}%`,
              top: manifest ? n.y : `${n.y}%`,
            }}
            onClick={() => greet(n.id)}
            aria-label={`Say hello to ${n.name}`}
          >
            {bubble?.id === n.id && (
              <span className="speech-bubble">{bubble.text}</span>
            )}
            <span className="neighbor-idle">
              <Lion color={n.color} accessory={n.accessory} />
            </span>
            <span className="character-name">
              {n.name}
              <span className="greet-indicator"> ♡</span>
            </span>
          </button>
        ))}
        {burst && (
          <HotspotBurst
            key={burst.id}
            x={burst.x}
            y={burst.y}
            emojis={burst.emojis}
          />
        )}
        <div className="sparkle-trail-layer" aria-hidden="true">
          {sparkles.map((p) => (
            <span
              key={p.id}
              className="sparkle-particle"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
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
          className={`world-character your-character${boardId ? " is-gliding" : ""}${avatarAction === "skate" ? " is-skating" : ""}`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            cursor: onOpenCard ? "pointer" : undefined,
            transition: `left ${glideMs}ms cubic-bezier(0.2, 0.6, 0.4, 1), top ${glideMs}ms cubic-bezier(0.2, 0.6, 0.4, 1)`,
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
          <div className="avatar-with-companion" ref={avatarBodyRef}>
            <Avatar
              look={player.look}
              action={avatarAction}
              size={manifest ? WORLD_AVATAR_SIZE.stage : WORLD_AVATAR_SIZE.map}
              headBoost
            />
            <PetCompanion
              pet={{
                ...player.pet,
                color: player.pet?.color || player.color,
                accessory:
                  player.accessory !== "none"
                    ? player.accessory
                    : player.pet?.accessory,
              }}
              isTrotting={isTrotting}
              heading={avatarHeading}
              side={petSide}
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
          {compact && (
            <button
              type="button"
              className="button-secondary room-nav-tile room-nav-map"
              onClick={() => setRoomSheetOpen(true)}
            >
              <span className="room-nav-icon" aria-hidden="true">
                🗺️
              </span>
              <span className="sr-only">Map</span>
            </button>
          )}
          {/* Phones keep the three nearest exits; the Map sheet lists the rest. */}
          {(compact ? manifest.portals.slice(0, 3) : manifest.portals).map(
            (p) => (
              <button
                key={p.targetRoomId}
                className="button-secondary room-nav-tile"
                onClick={() => portal(p.targetRoomId, p.targetSpawn)}
              >
                <span className="room-nav-icon" aria-hidden="true">
                  {portalIcon(p.targetRoomId)}
                </span>
                <span className="room-nav-caption">{p.label}</span>
              </button>
            ),
          )}
          {!compact &&
            roomItems.map((item) => (
              <button
                key={item.id}
                className="button-secondary room-nav-tile"
                onClick={() => hotspot(item.id)}
              >
                <span className="room-nav-icon" aria-hidden="true">
                  {item.icon ?? "✨"}
                </span>
                <span className="room-nav-caption">{item.label}</span>
              </button>
            ))}
          {!compact && (
            <span className="room-navigation-hint">
              Click the ground or use arrow keys to explore. Paths at the edges
              lead to the next room.
            </span>
          )}
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
        {!(compact && manifest) && (
          <button className="map-button" aria-label="Map" onClick={onMap}>
            <Map size={19} fill="currentColor" strokeWidth={1.5} />
            <span>Map</span>
          </button>
        )}
      </div>
      {roomSheetOpen && manifest && (
        <Dialog
          title="A whole little world"
          subtitle="Where will your paws take you next?"
          onClose={() => setRoomSheetOpen(false)}
          className="map-sheet"
        >
          <WorldMap
            place={place}
            onNavigate={(destination) => {
              setRoomSheetOpen(false);
              const exit = manifest.portals.find(
                (item) => item.targetRoomId === destination,
              );
              if (exit) portal(destination, exit.targetSpawn);
              else navigate(destination);
            }}
          />
          <h3 className="map-activities-title">Things to do here</h3>
          <div className="map-activities">
            {roomItems.map((item) => (
              <button
                key={item.id}
                className="button-secondary map-activity"
                onClick={() => {
                  setRoomSheetOpen(false);
                  hotspot(item.id);
                }}
              >
                <span className="room-nav-icon" aria-hidden="true">
                  {item.icon ?? "✨"}
                </span>
                <span className="room-nav-caption">{item.label}</span>
              </button>
            ))}
          </div>
        </Dialog>
      )}
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
      <SpyPinModal
        isOpen={spyPinOpen}
        onClose={() => setSpyPinOpen(false)}
        onUnlock={handleSpyPinUnlock}
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
  glideMs,
  board,
  timeOfDay,
  reducedMotion,
  children,
}: {
  manifest?: RoomManifest;
  imageClass: string;
  avatarPos: { x: number; y: number };
  heading: "left" | "right";
  onWalk: (x: number, y: number, mode?: "route" | "slide") => void;
  onPortal: (target: string, spawn: { x: number; y: number }) => void;
  glideMs: number;
  board: boolean;
  timeOfDay: TimeOfDay;
  reducedMotion: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`world-stage scene ${imageClass}${manifest ? " camera-world" : ""}`}
    >
      <GlobalLightingOverlay
        timeOfDay={timeOfDay}
        reducedMotion={reducedMotion}
      />
      {manifest ? (
        <CameraViewport
          manifest={manifest}
          avatarPos={avatarPos}
          avatarHeading={heading}
          onWalk={onWalk}
          onPortal={onPortal}
          movementMultiplier={board ? BOARD_SPEED_MULTIPLIER : 1}
          glideMs={glideMs}
        >
          {children}
        </CameraViewport>
      ) : (
        children
      )}
    </div>
  );
}
