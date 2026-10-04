import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { FriendsPanel } from "../../src/components/FriendsPanel";
import { World } from "../../src/components/World";
import { migratePlayerSave, newPlayer, type PlaceId } from "../../src/game";
import type {
  FriendProfile,
  SocialGraphState,
} from "../../src/utils/socialGraph";
import "../../src/styles.css";

const profiles: FriendProfile[] = [
  {
    id: "online",
    username: "Sunny Paws",
    isOnline: true,
    currentRoomId: "downtown-plaza",
    lastSeenMs: 1000,
    color: "gold",
  },
  {
    id: "offline",
    username: "Sleepy Paws",
    isOnline: false,
    currentRoomId: "club-pulse",
    lastSeenMs: 1000,
    color: "sand",
  },
  {
    id: "incoming",
    username: "Amber",
    isOnline: true,
    currentRoomId: "square",
    lastSeenMs: 1000,
  },
  { id: "declined", username: "Cleo", isOnline: false, lastSeenMs: 0 },
  { id: "outgoing", username: "Pip", isOnline: false, lastSeenMs: 0 },
  {
    id: "recent",
    username: "Roary",
    isOnline: true,
    currentRoomId: "cafe",
    lastSeenMs: 1000,
  },
  {
    id: "me",
    username: "Myself",
    isOnline: true,
    currentRoomId: "square",
    lastSeenMs: 1000,
  },
];

function Fixture() {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<PlaceId>("square");
  const [spawn, setSpawn] = useState<{ x: number; y: number }>();
  const [emotes, setEmotes] = useState<string[]>([]);
  const [graph, setGraph] = useState<SocialGraphState>({
    friends: ["online", "offline", "missing"],
    pendingIncoming: ["incoming", "declined"],
    pendingOutgoing: ["outgoing"],
    recentVisitors: ["recent", "online"],
  });
  const navigate = (room: PlaceId, point?: { x: number; y: number }) => {
    setPlace(room);
    setSpawn(point);
  };
  return (
    <main>
      <h1>Friends review</h1>
      <button onClick={() => setOpen(true)}>Open friends</button>
      <output
        style={{ display: "block", overflowWrap: "anywhere" }}
        aria-label="Social graph"
      >
        {JSON.stringify(graph)}
      </output>
      <output aria-label="Emotes">{JSON.stringify(emotes)}</output>
      <output aria-label="Jump destination">{place}</output>
      <World
        key={place}
        place={place}
        spawn={spawn}
        player={migratePlayerSave(newPlayer())}
        navigate={navigate}
        onActivity={() => {}}
        onMap={() => {}}
        onShop={() => {}}
        onGame={() => {}}
        onGreet={() => {}}
        notify={() => {}}
      />
      {open && (
        <FriendsPanel
          myId="me"
          graph={graph}
          profiles={profiles}
          onUpdateSocialGraph={setGraph}
          onSendEmote={(friendId, emote) =>
            setEmotes((current) => [...current, `${friendId}:${emote}`])
          }
          onJumpToFriend={(room, point) => {
            navigate(room, point);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
