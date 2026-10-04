import { useEffect, useId, useRef, useState } from "react";
import { PawPrint } from "lucide-react";
import { PLACES, type PlaceId } from "../game";
import { Dialog } from "./Dialog";
import { Lion } from "./Lion";
import {
  acceptFriendRequest,
  cancelOutgoingRequest,
  canSendSocialEmote,
  declineFriendRequest,
  getJumpSpawnCoordinate,
  MAX_FRIENDS,
  playSocialSound,
  removeFriend,
  sendFriendRequest,
  SOCIAL_EMOTE_COOLDOWN_MS,
  type FriendProfile,
  type SocialEmote,
  type SocialGraphState,
} from "../utils/socialGraph";

type FriendsPanelProps = {
  myId: string;
  graph: SocialGraphState;
  /** Current directory/presence snapshot. Missing profiles are shown offline. */
  profiles: readonly FriendProfile[];
  onJumpToFriend(roomId: PlaceId, spawn: { x: number; y: number }): void;
  onSendEmote(friendId: string, emote: SocialEmote): void;
  onUpdateSocialGraph(newGraph: SocialGraphState): void;
  onClose(): void;
};
const TABS = ["Friends", "Requests", "Recent"] as const;
type Tab = (typeof TABS)[number];

export function FriendsPanel({
  myId,
  graph,
  profiles,
  onJumpToFriend,
  onSendEmote,
  onUpdateSocialGraph,
  onClose,
}: FriendsPanelProps) {
  const [tab, setTab] = useState<Tab>("Friends");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [coolingDown, setCoolingDown] = useState(false);
  const lastEmote = useRef(0);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const id = useId();
  useEffect(() => () => clearTimeout(cooldownTimer.current), []);

  const profileFor = (friendId: string): FriendProfile =>
    profiles.find((profile) => profile.id === friendId) ?? {
      id: friendId,
      username: friendId,
      isOnline: false,
      lastSeenMs: 0,
    };
  const request = (targetId: string) => {
    const next = sendFriendRequest(graph, myId, targetId);
    if (next === graph) {
      setStatus(
        targetId === myId
          ? "That’s you! Try another player."
          : graph.friends.length >= MAX_FRIENDS
            ? "Your pride is full: 100 friends."
            : graph.pendingOutgoing.length >= MAX_FRIENDS
              ? "You have 100 outgoing requests. Cancel one before adding more."
              : "You’re already friends or have a pending request.",
      );
      return;
    }
    onUpdateSocialGraph(next);
    playSocialSound("request_sent");
    setStatus(`Friend request added for ${profileFor(targetId).username}.`);
  };
  const sendEmote = (profile: FriendProfile, emote: SocialEmote) => {
    const now = Date.now();
    if (!profile.isOnline || !canSendSocialEmote(lastEmote.current, now))
      return;
    lastEmote.current = now;
    setCoolingDown(true);
    clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(
      () => setCoolingDown(false),
      SOCIAL_EMOTE_COOLDOWN_MS,
    );
    onSendEmote(profile.id, emote);
    if (emote === "high_five") playSocialSound("emote_highfive");
    setStatus(
      `${emote === "high_five" ? "High-five" : "Tandem groove"} with ${profile.username}!`,
    );
  };
  const update = (next: SocialGraphState, message: string) => {
    onUpdateSocialGraph(next);
    setStatus(message);
  };
  const identity = (profile: FriendProfile) => (
    <div className="friend-identity">
      <span className="friend-avatar" aria-hidden="true">
        <Lion color={profile.color ?? "gold"} />
      </span>
      <div>
        <strong>{profile.username}</strong>
        <span
          className={`friend-status ${profile.isOnline ? "friend-online" : ""}`}
        >
          <span aria-hidden="true">● </span>
          {profile.isOnline ? "Online" : "Offline"}
        </span>
        {!profile.isOnline &&
          Number.isFinite(profile.lastSeenMs) &&
          profile.lastSeenMs > 0 && (
            <small>
              Last seen {new Date(profile.lastSeenMs).toLocaleDateString()}
            </small>
          )}
      </div>
    </div>
  );
  const friends = graph.friends
    .map(profileFor)
    .filter((profile) =>
      profile.username
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
    );

  return (
    <Dialog
      title="Your pride"
      subtitle="Friends, familiar paws, and little adventures together."
      onClose={onClose}
      wide
    >
      <div className="friends-panel">
        <div className="friends-summary">
          <PawPrint size={20} aria-hidden="true" />
          <span>
            {graph.friends.length} / {MAX_FRIENDS} friends
          </span>
        </div>
        <form
          className="friends-search"
          onSubmit={(event) => {
            event.preventDefault();
            const matches = profiles.filter(
              (profile) =>
                profile.username.toLocaleLowerCase() ===
                query.trim().toLocaleLowerCase(),
            );
            if (matches.length !== 1) {
              setStatus(
                matches.length
                  ? "More than one player has that name. Add them from Recent instead."
                  : "No known player has that username. Try someone you’ve recently met.",
              );
              return;
            }
            request(matches[0].id);
          }}
        >
          <label htmlFor={`${id}-search`}>Find a friend by username</label>
          <div>
            <input
              id={`${id}-search`}
              value={query}
              maxLength={64}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your pride…"
            />
            <button
              type="submit"
              className="friends-primary"
              disabled={!query.trim()}
            >
              Add Friend
            </button>
          </div>
        </form>
        <div className="friends-tabs" role="tablist" aria-label="Social lists">
          {TABS.map((name, index) => (
            <button
              key={name}
              type="button"
              role="tab"
              id={`${id}-${name}`}
              aria-selected={tab === name}
              aria-controls={`${id}-content`}
              tabIndex={tab === name ? 0 : -1}
              onClick={() => setTab(name)}
              onKeyDown={(event) => {
                let next: number;
                if (event.key === "ArrowRight")
                  next = (index + 1) % TABS.length;
                else if (event.key === "ArrowLeft")
                  next = (index + TABS.length - 1) % TABS.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = TABS.length - 1;
                else return;
                event.preventDefault();
                setTab(TABS[next]);
                document.getElementById(`${id}-${TABS[next]}`)?.focus();
              }}
            >
              {name}
              {name === "Requests"
                ? ` (${graph.pendingIncoming.length + graph.pendingOutgoing.length})`
                : ""}
            </button>
          ))}
        </div>
        <p className="friends-feedback" role="status" aria-live="polite">
          {status ||
            (coolingDown
              ? "Give your paws a moment before another emote."
              : "")}
        </p>
        <div
          id={`${id}-content`}
          role="tabpanel"
          aria-labelledby={`${id}-${tab}`}
          tabIndex={0}
        >
          {tab === "Friends" && (
            <>
              {!friends.length && (
                <p className="friends-empty">
                  {graph.friends.length
                    ? "No friends match your search."
                    : "Your pride starts here. Add someone you’ve met!"}
                </p>
              )}
              <ul className="friends-list">
                {friends.map((profile) => {
                  const room = PLACES.find(
                    (place) => place.id === profile.currentRoomId,
                  );
                  return (
                    <li
                      className="friend-card"
                      key={profile.id}
                      aria-label={profile.username}
                    >
                      {identity(profile)}
                      <p className="friend-room">
                        {profile.isOnline && room
                          ? `📍 ${room.name}`
                          : profile.isOnline
                            ? "Room unavailable"
                            : "Catch up when they’re online"}
                      </p>
                      <div className="friend-actions">
                        <button
                          type="button"
                          className="friends-primary"
                          disabled={!profile.isOnline || !room}
                          aria-label={`Jump to ${profile.username}`}
                          onClick={() => {
                            if (!profile.isOnline || !room) return;
                            try {
                              const spawn = getJumpSpawnCoordinate(room.id);
                              onJumpToFriend(room.id, spawn);
                              playSocialSound("jump_teleport");
                            } catch {
                              setStatus(
                                "This room has no safe landing spot. Try another friend.",
                              );
                            }
                          }}
                        >
                          Jump
                        </button>
                        <button
                          type="button"
                          disabled={!profile.isOnline || coolingDown}
                          aria-label={`High-five ${profile.username}`}
                          onClick={() => sendEmote(profile, "high_five")}
                        >
                          High-five
                        </button>
                        <button
                          type="button"
                          disabled={!profile.isOnline || coolingDown}
                          aria-label={`Tandem groove with ${profile.username}`}
                          onClick={() => sendEmote(profile, "tandem_groove")}
                        >
                          Tandem groove
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${profile.username} from friends`}
                          onClick={() =>
                            update(
                              removeFriend(graph, profile.id),
                              `${profile.username} removed from your friends.`,
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {tab === "Requests" && (
            <>
              <h3>Incoming ({graph.pendingIncoming.length})</h3>
              {!graph.pendingIncoming.length && (
                <p className="friends-empty">No incoming requests.</p>
              )}
              <ul className="friends-list">
                {graph.pendingIncoming.map((friendId) => {
                  const profile = profileFor(friendId);
                  return (
                    <li className="friend-card" key={friendId}>
                      {identity(profile)}
                      <div className="friend-actions">
                        <button
                          type="button"
                          className="friends-primary"
                          disabled={graph.friends.length >= MAX_FRIENDS}
                          aria-label={`Accept ${profile.username}`}
                          onClick={() => {
                            const next = acceptFriendRequest(graph, friendId);
                            if (next === graph) return;
                            update(
                              next,
                              `${profile.username} joined your pride!`,
                            );
                            playSocialSound("request_accepted");
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          aria-label={`Decline ${profile.username}`}
                          onClick={() =>
                            update(
                              declineFriendRequest(graph, friendId),
                              "Request declined.",
                            )
                          }
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {graph.friends.length >= MAX_FRIENDS && (
                <p className="friends-empty">
                  Remove a friend to make room for new requests.
                </p>
              )}
              <h3>Outgoing ({graph.pendingOutgoing.length})</h3>
              {!graph.pendingOutgoing.length && (
                <p className="friends-empty">No outgoing requests.</p>
              )}
              <ul className="friends-list">
                {graph.pendingOutgoing.map((friendId) => {
                  const profile = profileFor(friendId);
                  return (
                    <li className="friend-card" key={friendId}>
                      {identity(profile)}
                      <div className="friend-actions">
                        <button
                          type="button"
                          aria-label={`Cancel request to ${profile.username}`}
                          onClick={() =>
                            update(
                              cancelOutgoingRequest(graph, friendId),
                              "Request cancelled.",
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {tab === "Recent" && (
            <>
              {!graph.recentVisitors.length && (
                <p className="friends-empty">No recent visitors yet.</p>
              )}
              <ul className="friends-list">
                {graph.recentVisitors.map((friendId) => {
                  const profile = profileFor(friendId);
                  const isFriend = graph.friends.includes(friendId),
                    incoming = graph.pendingIncoming.includes(friendId),
                    outgoing = graph.pendingOutgoing.includes(friendId);
                  return (
                    <li className="friend-card" key={friendId}>
                      {identity(profile)}
                      <div className="friend-actions">
                        <button
                          type="button"
                          className="friends-primary"
                          disabled={
                            friendId === myId ||
                            isFriend ||
                            incoming ||
                            outgoing ||
                            graph.friends.length >= MAX_FRIENDS ||
                            graph.pendingOutgoing.length >= MAX_FRIENDS
                          }
                          aria-label={`Add ${profile.username} as a friend`}
                          onClick={() => request(friendId)}
                        >
                          {isFriend
                            ? "Friends"
                            : incoming
                              ? "Incoming request"
                              : outgoing
                                ? "Request pending"
                                : "Add Friend"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
