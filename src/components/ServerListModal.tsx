import { useEffect, useId, useRef, useState } from "react";
import { Crown, LockKeyhole } from "lucide-react";
import { PLACES } from "../game";
import {
  createCustomServer,
  joinCustomServer,
  moderateServer,
  type CustomServer,
} from "../utils/customServers";
import { Dialog } from "./Dialog";

const TABS = ["Browse Worlds", "Host New Lounge"] as const;

export function ServerListModal({
  playerId,
  playerName,
  servers,
  activeServer,
  onConnect,
  onUpdateServer,
  onLeave,
  onClose,
}: {
  playerId: string;
  playerName: string;
  servers: readonly CustomServer[];
  activeServer: CustomServer | null;
  onConnect: (server: CustomServer) => void;
  onUpdateServer: (server: CustomServer) => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  const id = useId();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Browse Worlds");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [startingRoom, setStartingRoom] = useState("square");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const joining = servers.find((server) => server.id === joiningId);
  const isHost = activeServer?.hostId === playerId;
  const roomName = (roomId: string) =>
    PLACES.find((place) => place.id === roomId)?.name ?? "Room unavailable";

  useEffect(() => {
    if (joiningId) passwordInput.current?.focus();
  }, [joiningId]);

  const selectTab = (next: (typeof TABS)[number]) => {
    setTab(next);
    setError("");
    setJoiningId(null);
    setPasswordAttempt("");
  };
  const join = (server: CustomServer, attempt?: string) => {
    const result = joinCustomServer(server, playerId, attempt);
    if (!result.success || !result.nextServer) {
      setError(result.error ?? "This lounge is unavailable.");
      passwordInput.current?.focus();
      return;
    }
    onConnect(result.nextServer);
  };

  return (
    <Dialog
      title="Worlds & lounges"
      subtitle="Choose a world or make a cozy lounge of your own."
      onClose={onClose}
      wide
    >
      <div className="server-list-modal">
        <p className="server-local-note">
          These worlds run locally in this browser. Occupant counts reflect this
          local session; passwords are saved here as local join gates. Only your
          active world is restored after reload.
        </p>
        {activeServer && (
          <section className="active-server-info" aria-label="Active world">
            <div className="server-active-heading">
              <div>
                <h3>{activeServer.name}</h3>
                <p>
                  Hosted by {activeServer.hostName} ·{" "}
                  {roomName(activeServer.currentRoomId)}
                </p>
              </div>
              {isHost && (
                <span className="host-crown">
                  <Crown size={20} aria-hidden="true" />
                  You’re the host
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  onLeave();
                  setStatus("You left the world.");
                }}
              >
                Leave world
              </button>
            </div>
            {isHost && (
              <div className="server-moderation">
                <h4>Host controls</h4>
                {!activeServer.occupants.some(
                  (occupant) => occupant !== playerId,
                ) && <p>No other players in this local lounge.</p>}
                <ul>
                  {activeServer.occupants
                    .filter((occupant) => occupant !== playerId)
                    .map((target) => {
                      const muted =
                        activeServer.mutedPlayerIds.includes(target);
                      return (
                        <li key={target}>
                          <span>
                            {target}
                            {muted ? " · Muted" : ""}
                          </span>
                          <div className="server-actions">
                            {(
                              [
                                muted ? "unmute" : "mute",
                                "kick",
                                "ban",
                              ] as const
                            ).map((action) => (
                              <button
                                key={action}
                                type="button"
                                aria-label={`${action[0].toUpperCase()}${action.slice(1)} ${target}`}
                                onClick={() => {
                                  onUpdateServer(
                                    moderateServer(
                                      activeServer,
                                      playerId,
                                      action,
                                      target,
                                    ),
                                  );
                                  setStatus(
                                    `${target}: ${action === "mute" ? "muted" : action === "unmute" ? "unmuted" : action === "kick" ? "kicked" : "banned"}.`,
                                  );
                                }}
                              >
                                {action === "unmute"
                                  ? "Unmute"
                                  : action === "mute"
                                    ? "Mute"
                                    : action === "kick"
                                      ? "Kick"
                                      : "Ban"}
                              </button>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </section>
        )}
        <div className="server-tabs" role="tablist" aria-label="World browser">
          {TABS.map((label, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={tab === label}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={tab === label ? 0 : -1}
              onClick={() => selectTab(label)}
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
                selectTab(TABS[next]);
                document.getElementById(`${id}-tab-${next}`)?.focus();
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="server-error" role="alert">
          {error}
        </p>
        <p className="server-feedback" role="status">
          {status}
        </p>
        {TABS.map((label, index) => (
          <div
            key={label}
            id={`${id}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${index}`}
            hidden={tab !== label}
            tabIndex={0}
          >
            {index === 0 ? (
              <>
                <div className="server-grid">
                  {servers.map((server) => {
                    const active = server.id === activeServer?.id;
                    const full = server.occupants.length >= server.capacity;
                    const banned = server.bannedPlayerIds.includes(playerId);
                    return (
                      <article className="server-card" key={server.id}>
                        <div className="server-card-heading">
                          <h3>{server.name}</h3>
                          {server.passwordProtected && (
                            <span className="server-lock">
                              <LockKeyhole size={18} aria-hidden="true" />
                              <span className="sr-only">
                                Password protected
                              </span>
                            </span>
                          )}
                        </div>
                        <p>Hosted by {server.hostName}</p>
                        <p>{roomName(server.currentRoomId)}</p>
                        <div className="server-card-footer">
                          <span
                            className="server-occupant-badge"
                            aria-label={`${server.occupants.length} of ${server.capacity} occupants`}
                          >
                            {server.occupants.length} / {server.capacity}
                          </span>
                          <button
                            type="button"
                            className="server-primary"
                            disabled={active || full || banned}
                            aria-label={
                              active
                                ? `Current world: ${server.name}`
                                : `Join ${server.name}`
                            }
                            onClick={() => {
                              setError("");
                              setStatus("");
                              if (server.passwordProtected) {
                                setJoiningId(server.id);
                                setPasswordAttempt("");
                              } else join(server);
                            }}
                          >
                            {active
                              ? "Current world"
                              : banned
                                ? "Banned"
                                : full
                                  ? "Full"
                                  : "Join"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {joining && (
                  <form
                    className="server-password-form"
                    noValidate
                    onSubmit={(event) => {
                      event.preventDefault();
                      join(joining, passwordAttempt);
                    }}
                  >
                    <label htmlFor={`${id}-join-password`}>
                      Password for {joining.name}
                    </label>
                    <input
                      ref={passwordInput}
                      id={`${id}-join-password`}
                      type="password"
                      autoComplete="off"
                      maxLength={128}
                      value={passwordAttempt}
                      onChange={(event) => {
                        setPasswordAttempt(event.target.value);
                        setError("");
                      }}
                    />
                    <div className="server-actions">
                      <button type="submit" className="server-primary">
                        Connect
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setJoiningId(null);
                          setPasswordAttempt("");
                          setError("");
                          document.getElementById(`${id}-tab-0`)?.focus();
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <form
                className="server-host-form"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!name.trim()) {
                    setError("Your lounge needs a name.");
                    nameInput.current?.focus();
                    return;
                  }
                  try {
                    onConnect(
                      createCustomServer(playerId, playerName, name, {
                        password,
                        startingRoom,
                      }),
                    );
                  } catch (reason) {
                    setError(
                      reason instanceof Error
                        ? reason.message
                        : "Unable to create this lounge.",
                    );
                  }
                }}
              >
                <label htmlFor={`${id}-name`}>Lounge name</label>
                <input
                  ref={nameInput}
                  id={`${id}-name`}
                  maxLength={64}
                  required
                  value={name}
                  aria-invalid={!!error && !name.trim()}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                />
                <label htmlFor={`${id}-password`}>
                  Lounge password (optional)
                </label>
                <input
                  id={`${id}-password`}
                  type="password"
                  autoComplete="new-password"
                  maxLength={128}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />
                <label htmlFor={`${id}-room`}>Starting room</label>
                <select
                  id={`${id}-room`}
                  value={startingRoom}
                  onChange={(event) => setStartingRoom(event.target.value)}
                >
                  {PLACES.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </select>
                <p>Room for 25 lions, including you.</p>
                <button type="submit" className="server-primary">
                  Create lounge
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </Dialog>
  );
}
