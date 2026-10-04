import { PLACES } from "../game.ts";

export type CustomServer = {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  capacity: number;
  passwordProtected: boolean;
  password?: string;
  currentRoomId: string;
  occupants: string[];
  mutedPlayerIds: string[];
  bannedPlayerIds: string[];
  createdAt: number;
};

function text(value: unknown, max = 64): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= max
  );
}

function room(value: unknown): value is string {
  return PLACES.some((place) => place.id === value);
}

export function createCustomServer(
  hostId: string,
  hostName: string,
  name: string,
  options: { password?: string; capacity?: number; startingRoom?: string } = {},
): CustomServer {
  if (!text(hostId) || !text(hostName) || !text(name)) {
    throw new Error("Choose a host and lounge name of 1–64 characters.");
  }
  const currentRoomId = options.startingRoom ?? "square";
  if (!room(currentRoomId))
    throw new Error("Choose an available starting room.");
  const password = options.password || undefined;
  if (password !== undefined && !text(password, 128)) {
    throw new Error(
      "Choose a password of 1–128 characters, or leave it empty.",
    );
  }
  const capacity = Number.isFinite(options.capacity)
    ? Math.max(1, Math.min(50, Math.floor(options.capacity!)))
    : 25;
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    hostId,
    hostName: hostName.trim(),
    capacity,
    passwordProtected: password !== undefined,
    ...(password !== undefined ? { password } : {}),
    currentRoomId,
    occupants: [hostId],
    mutedPlayerIds: [],
    bannedPlayerIds: [],
    createdAt: Date.now(),
  };
}

export function joinCustomServer(
  server: CustomServer,
  playerId: string,
  passwordAttempt?: string,
): { success: boolean; nextServer?: CustomServer; error?: string } {
  if (!text(playerId)) return { success: false, error: "Invalid player ID." };
  if (server.bannedPlayerIds.includes(playerId)) {
    return { success: false, error: "You are banned from this lounge." };
  }
  if (server.occupants.includes(playerId)) {
    return { success: true, nextServer: server };
  }
  if (server.passwordProtected && passwordAttempt !== server.password) {
    return { success: false, error: "Incorrect lounge password." };
  }
  if (server.occupants.length >= server.capacity) {
    return { success: false, error: "This world is full. Try another lounge." };
  }
  return {
    success: true,
    nextServer: { ...server, occupants: [...server.occupants, playerId] },
  };
}

export function leaveCustomServer(
  server: CustomServer,
  playerId: string,
): CustomServer {
  if (
    !server.occupants.includes(playerId) &&
    !server.mutedPlayerIds.includes(playerId)
  )
    return server;
  return {
    ...server,
    occupants: server.occupants.filter((id) => id !== playerId),
    mutedPlayerIds: server.mutedPlayerIds.filter((id) => id !== playerId),
  };
}

export function moderateServer(
  server: CustomServer,
  requesterId: string,
  action: "mute" | "unmute" | "kick" | "ban",
  targetId: string,
): CustomServer {
  if (
    requesterId !== server.hostId ||
    targetId === server.hostId ||
    !text(targetId)
  )
    return server;
  switch (action) {
    case "mute":
      if (
        !server.occupants.includes(targetId) ||
        server.mutedPlayerIds.includes(targetId)
      )
        return server;
      return {
        ...server,
        mutedPlayerIds: [...server.mutedPlayerIds, targetId],
      };
    case "unmute":
      if (!server.mutedPlayerIds.includes(targetId)) return server;
      return {
        ...server,
        mutedPlayerIds: server.mutedPlayerIds.filter((id) => id !== targetId),
      };
    case "kick":
      return leaveCustomServer(server, targetId);
    case "ban": {
      const next = leaveCustomServer(server, targetId);
      if (next.bannedPlayerIds.includes(targetId)) return next;
      return { ...next, bannedPlayerIds: [...next.bannedPlayerIds, targetId] };
    }
    default:
      return server;
  }
}

export function getOfficialServers(): CustomServer[] {
  return [
    ["official-savanna", "Savanna Prime", "downtown-plaza"],
    ["official-wonderland", "Wonderland Oasis", "wonder-park-entrance"],
    ["official-nightclub", "The Nightclub Lounge", "club-pulse"],
  ].map(([id, name, currentRoomId]) => ({
    id,
    name,
    hostId: "club-lion",
    hostName: "Club Lion",
    capacity: 25,
    passwordProtected: false,
    currentRoomId,
    occupants: [],
    mutedPlayerIds: [],
    bannedPlayerIds: [],
    createdAt: 0,
  }));
}

/** localStorage is untrusted. Reject inconsistent saves before restoring membership. */
export function restoreCustomServer(value: unknown): CustomServer | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const saved = value as Record<string, unknown>;
  const ids = (list: unknown): list is string[] =>
    Array.isArray(list) &&
    list.every((id) => text(id)) &&
    new Set(list).size === list.length;
  if (
    !text(saved.id) ||
    !text(saved.name) ||
    !text(saved.hostId) ||
    !text(saved.hostName) ||
    typeof saved.capacity !== "number" ||
    !Number.isInteger(saved.capacity) ||
    saved.capacity < 1 ||
    saved.capacity > 50 ||
    typeof saved.passwordProtected !== "boolean" ||
    (saved.passwordProtected
      ? !text(saved.password, 128)
      : saved.password !== undefined) ||
    !room(saved.currentRoomId) ||
    typeof saved.createdAt !== "number" ||
    !Number.isFinite(saved.createdAt) ||
    saved.createdAt < 0 ||
    !ids(saved.occupants) ||
    saved.occupants.length > saved.capacity ||
    !ids(saved.mutedPlayerIds) ||
    !ids(saved.bannedPlayerIds) ||
    saved.bannedPlayerIds.includes(saved.hostId) ||
    saved.occupants.some((id) =>
      (saved.bannedPlayerIds as string[]).includes(id),
    ) ||
    saved.mutedPlayerIds.some(
      (id) =>
        id === saved.hostId || !(saved.occupants as string[]).includes(id),
    )
  )
    return null;
  return {
    id: saved.id,
    name: saved.name,
    hostId: saved.hostId,
    hostName: saved.hostName,
    capacity: saved.capacity,
    passwordProtected: saved.passwordProtected,
    ...(saved.passwordProtected ? { password: saved.password as string } : {}),
    currentRoomId: saved.currentRoomId,
    occupants: [...saved.occupants],
    mutedPlayerIds: [...saved.mutedPlayerIds],
    bannedPlayerIds: [...saved.bannedPlayerIds],
    createdAt: saved.createdAt,
  };
}
