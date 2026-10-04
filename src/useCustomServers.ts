import { useCallback, useEffect, useState } from "react";
import {
  getOfficialServers,
  leaveCustomServer,
  restoreCustomServer,
  type CustomServer,
} from "./utils/customServers";

export const CUSTOM_SERVER_SAVE_KEY = "club-lion-active-server-v1";
export const LOCAL_PLAYER_ID = "local-player";

type ServerSession = { servers: CustomServer[]; activeId: string | null };

function loadSession(): ServerSession {
  const servers = getOfficialServers();
  try {
    const raw = localStorage.getItem(CUSTOM_SERVER_SAVE_KEY);
    const active = restoreCustomServer(raw ? JSON.parse(raw) : null);
    if (active?.occupants.includes(LOCAL_PLAYER_ID)) {
      const index = servers.findIndex((server) => server.id === active.id);
      if (index === -1) servers.push(active);
      else servers[index] = active;
      return { servers, activeId: active.id };
    }
  } catch {
    // Invalid saves and unavailable storage both leave the local world usable.
  }
  return { servers, activeId: null };
}

export function useCustomServers() {
  const [session, setSession] = useState(loadSession);
  const [saveError, setSaveError] = useState(false);
  const activeServer =
    session.servers.find((server) => server.id === session.activeId) ?? null;

  useEffect(() => {
    try {
      if (activeServer)
        localStorage.setItem(
          CUSTOM_SERVER_SAVE_KEY,
          JSON.stringify(activeServer),
        );
      else localStorage.removeItem(CUSTOM_SERVER_SAVE_KEY);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [activeServer]);

  const connect = useCallback((joined: CustomServer) => {
    setSession((current) => {
      const servers = current.servers.map((server) =>
        server.id === joined.id
          ? joined
          : server.id === current.activeId
            ? leaveCustomServer(server, LOCAL_PLAYER_ID)
            : server,
      );
      if (!servers.some((server) => server.id === joined.id))
        servers.push(joined);
      return { servers, activeId: joined.id };
    });
  }, []);

  const leave = useCallback(() => {
    setSession((current) => ({
      servers: current.servers.map((server) =>
        server.id === current.activeId
          ? leaveCustomServer(server, LOCAL_PLAYER_ID)
          : server,
      ),
      activeId: null,
    }));
  }, []);

  const updateServer = useCallback((next: CustomServer) => {
    setSession((current) => ({
      ...current,
      servers: current.servers.map((server) =>
        server.id === next.id ? next : server,
      ),
    }));
  }, []);

  const moveToRoom = useCallback((currentRoomId: string) => {
    setSession((current) => {
      const active = current.servers.find(
        (server) => server.id === current.activeId,
      );
      if (!active || active.currentRoomId === currentRoomId) return current;
      return {
        ...current,
        servers: current.servers.map((server) =>
          server.id === active.id ? { ...server, currentRoomId } : server,
        ),
      };
    });
  }, []);

  return {
    servers: session.servers,
    activeServer,
    saveError,
    connect,
    leave,
    updateServer,
    moveToRoom,
  };
}
