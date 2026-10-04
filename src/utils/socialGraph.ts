import type { LionColor, PlaceId } from "../game.ts";
import { ROOM_MANIFESTS } from "../rooms/registry.ts";
import { clampToWalkable, type StagePoint } from "../rooms/camera.ts";
import { getSharedAudioBus } from "./audioBus.ts";
import { isNetworkId } from "./networkProtocol.ts";

export type SocialGraphState = {
  friends: string[];
  pendingIncoming: string[];
  pendingOutgoing: string[];
  recentVisitors: string[];
};

/** Session presence is supplied by the caller and never stored in player saves. */
export type FriendProfile = {
  id: string;
  username: string;
  isOnline: boolean;
  currentRoomId?: PlaceId;
  lastSeenMs: number;
  color?: LionColor;
};
export type SocialEmote =
  "high_five" | "tandem_groove" | "paw_bump" | "wave" | "heart";

export const MAX_FRIENDS = 100;
export const MAX_RECENT_VISITORS = 15;
export const SOCIAL_EMOTE_COOLDOWN_MS = 2000;

function socialIds(
  raw: unknown,
  limit: number,
  excluded: string[] = [],
): string[] {
  if (!Array.isArray(raw)) return [];
  const result = new Set<string>();
  for (const id of raw) {
    // Reject oversized IDs rather than truncating and changing their identity.
    if (isNetworkId(id) && !excluded.includes(id)) result.add(id);
    if (result.size === limit) break;
  }
  return [...result];
}

/** Untrusted save data: friends take priority over requests; incoming over outgoing. */
export function sanitizeSocialGraph(
  raw: Partial<Record<keyof SocialGraphState, unknown>>,
): SocialGraphState {
  const friends = socialIds(raw.friends, MAX_FRIENDS);
  const pendingIncoming = socialIds(raw.pendingIncoming, MAX_FRIENDS, friends);
  return {
    friends,
    pendingIncoming,
    pendingOutgoing: socialIds(raw.pendingOutgoing, MAX_FRIENDS, [
      ...friends,
      ...pendingIncoming,
    ]),
    recentVisitors: socialIds(raw.recentVisitors, MAX_RECENT_VISITORS),
  };
}

export function sendFriendRequest(
  graph: SocialGraphState,
  myId: string,
  targetId: string,
): SocialGraphState {
  if (
    !isNetworkId(myId) ||
    !isNetworkId(targetId) ||
    myId === targetId ||
    graph.friends.length >= MAX_FRIENDS ||
    graph.pendingOutgoing.length >= MAX_FRIENDS ||
    [
      ...graph.friends,
      ...graph.pendingIncoming,
      ...graph.pendingOutgoing,
    ].includes(targetId)
  )
    return graph;
  return { ...graph, pendingOutgoing: [...graph.pendingOutgoing, targetId] };
}

export function acceptFriendRequest(
  graph: SocialGraphState,
  targetId: string,
): SocialGraphState {
  if (
    !isNetworkId(targetId) ||
    !graph.pendingIncoming.includes(targetId) ||
    (!graph.friends.includes(targetId) && graph.friends.length >= MAX_FRIENDS)
  )
    return graph;
  return {
    ...graph,
    friends: [...new Set([...graph.friends, targetId])],
    pendingIncoming: graph.pendingIncoming.filter((id) => id !== targetId),
    pendingOutgoing: graph.pendingOutgoing.filter((id) => id !== targetId),
  };
}

export function declineFriendRequest(
  graph: SocialGraphState,
  targetId: string,
): SocialGraphState {
  return {
    ...graph,
    pendingIncoming: graph.pendingIncoming.filter((id) => id !== targetId),
  };
}
export function cancelOutgoingRequest(
  graph: SocialGraphState,
  targetId: string,
): SocialGraphState {
  return {
    ...graph,
    pendingOutgoing: graph.pendingOutgoing.filter((id) => id !== targetId),
  };
}
export function removeFriend(
  graph: SocialGraphState,
  targetId: string,
): SocialGraphState {
  return { ...graph, friends: graph.friends.filter((id) => id !== targetId) };
}
export function recordRecentVisitor(
  graph: SocialGraphState,
  myId: string,
  visitorId: string,
  maxCount = MAX_RECENT_VISITORS,
): SocialGraphState {
  if (
    !isNetworkId(myId) ||
    !isNetworkId(visitorId) ||
    myId === visitorId ||
    !Number.isSafeInteger(maxCount) ||
    maxCount < 0
  )
    return graph;
  return {
    ...graph,
    recentVisitors: [
      visitorId,
      ...new Set(
        graph.recentVisitors.filter((id) => id !== visitorId && id !== myId),
      ),
    ].slice(0, maxCount),
  };
}

function strictlyWalkable(
  point: StagePoint,
  polygon: [number, number][],
): boolean {
  if (clampToWalkable(point, polygon) !== point) return false;
  // clampToWalkable allows boundary points; fast travel requires a strict interior.
  return polygon.every(([ax, ay], index) => {
    const [bx, by] = polygon[(index + 1) % polygon.length];
    const cross = (point.x - ax) * (by - ay) - (point.y - ay) * (bx - ax);
    return (
      Math.abs(cross) > 1e-6 ||
      point.x < Math.min(ax, bx) ||
      point.x > Math.max(ax, bx) ||
      point.y < Math.min(ay, by) ||
      point.y > Math.max(ay, by)
    );
  });
}

/** Legacy stages use 0–100 percentages; manifest stages use world-space pixels. */
export function getJumpSpawnCoordinate(roomId: PlaceId): StagePoint {
  const room = ROOM_MANIFESTS[roomId];
  if (!room) {
    switch (roomId) {
      case "square":
      case "water":
      case "cafe":
      case "arcade":
      case "den":
        return { x: 43, y: 78 };
      default:
        throw new Error(`Unknown jump destination: ${roomId}`);
    }
  }
  const xs = room.walkablePolygon.map(([x]) => x),
    ys = room.walkablePolygon.map(([, y]) => y);
  const left = Math.max(0, Math.min(...xs)),
    right = Math.min(room.stageWidth, Math.max(...xs));
  const top = Math.max(0, Math.min(...ys)),
    bottom = Math.min(room.stageHeight, Math.max(...ys));
  const safe = (point: StagePoint) =>
    point.x > 0 &&
    point.x < room.stageWidth &&
    point.y > 0 &&
    point.y < room.stageHeight &&
    strictlyWalkable(point, room.walkablePolygon) &&
    room.portals.every(
      ({ triggerBounds: b }) =>
        !(
          point.x >= b.x1 &&
          point.x <= b.x2 &&
          point.y >= b.y1 &&
          point.y <= b.y2
        ),
    );
  const center = { x: (left + right) / 2, y: (top + bottom) / 2 };
  if (safe(center)) return center;
  // Deterministic search across the walkable bounds, independent of portal target spawns.
  for (let row = 0; row < 64; row++) {
    for (let col = 0; col < 64; col++) {
      const point = {
        x: left + ((col + 0.5) / 64) * (right - left),
        y: top + ((row + 0.5) / 64) * (bottom - top),
      };
      if (safe(point)) return point;
    }
  }
  // Fail closed rather than ever returning an unsafe portal or boundary coordinate.
  throw new Error(`No safe jump spawn in ${roomId}`);
}

export function canSendSocialEmote(
  lastEmoteTimestamp: number,
  now: number,
  cooldownMs = SOCIAL_EMOTE_COOLDOWN_MS,
): boolean {
  return (
    Number.isFinite(lastEmoteTimestamp) &&
    Number.isFinite(now) &&
    Number.isFinite(cooldownMs) &&
    lastEmoteTimestamp >= 0 &&
    now >= lastEmoteTimestamp &&
    cooldownMs >= 0 &&
    (lastEmoteTimestamp === 0 || now - lastEmoteTimestamp >= cooldownMs)
  );
}

export type SocialSound =
  "request_sent" | "request_accepted" | "emote_highfive" | "jump_teleport";
const SOCIAL_NOTES: Record<SocialSound, number[]> = {
  request_sent: [523.25, 659.25],
  request_accepted: [523.25, 659.25, 783.99],
  emote_highfive: [392, 783.99],
  jump_teleport: [261.63, 523.25, 1046.5],
};

/** Shared SFX routing includes the bus's vendor fallback and safe unavailable-audio behavior. */
export function playSocialSound(type: SocialSound): void {
  const voices: {
    oscillator: OscillatorNode;
    gain: GainNode;
    released: boolean;
  }[] = [];
  const release = (voice: (typeof voices)[number], stop = false) => {
    if (voice.released) return;
    voice.released = true;
    voice.oscillator.onended = null;
    if (stop) {
      try {
        voice.oscillator.stop();
      } catch {
        /* The voice may not have started. */
      }
    }
    try {
      voice.oscillator.disconnect();
    } catch {
      /* Device unavailable. */
    }
    try {
      voice.gain.disconnect();
    } catch {
      /* Device unavailable. */
    }
  };
  const releaseAll = () => voices.forEach((voice) => release(voice, true));
  try {
    const bus = getSharedAudioBus(),
      context = bus.getContext(),
      destination = bus.getSfxDestination();
    if (!context || !destination || context.state === "closed") return;
    if (context.state === "suspended") void context.resume().catch(releaseAll);
    SOCIAL_NOTES[type].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      let gain: GainNode;
      try {
        gain = context.createGain();
      } catch (error) {
        oscillator.disconnect();
        throw error;
      }
      const voice = { oscillator, gain, released: false };
      voices.push(voice);
      oscillator.onended = () => release(voice);
      const start = context.currentTime + index * 0.08;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.06, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      oscillator.connect(gain);
      gain.connect(destination);
      oscillator.start(start);
      oscillator.stop(start + 0.2);
    });
  } catch {
    // Also release partially scheduled voices if the audio device fails mid-cue.
    releaseAll();
  }
}
