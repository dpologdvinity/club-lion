import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACES } from "../game.ts";
import {
  createCustomServer,
  getOfficialServers,
  joinCustomServer,
  leaveCustomServer,
  moderateServer,
  restoreCustomServer,
} from "./customServers.ts";

test("creation starts with the host, unique IDs and bounded capacity", () => {
  const server = createCustomServer("host", "Roary", "  Cozy pride  ");
  assert.equal(server.name, "Cozy pride");
  assert.equal(server.hostId, "host");
  assert.equal(server.hostName, "Roary");
  assert.equal(server.capacity, 25);
  assert.equal(server.currentRoomId, "square");
  assert.equal(server.passwordProtected, false);
  assert.equal(server.password, undefined);
  assert.deepEqual(server.occupants, ["host"]);
  assert.deepEqual(server.mutedPlayerIds, []);
  assert.deepEqual(server.bannedPlayerIds, []);
  assert.ok(Number.isFinite(server.createdAt));
  assert.notEqual(createCustomServer("host", "Roary", "Other").id, server.id);
  for (const [capacity, expected] of [
    [100, 50],
    [0, 1],
    [-5, 1],
    [3.9, 3],
    [NaN, 25],
    [Infinity, 25],
  ]) {
    assert.equal(
      createCustomServer("host", "Roary", "Pride", { capacity }).capacity,
      expected,
    );
  }
  const custom = createCustomServer("host", "Roary", "Pride", {
    password: " secret ",
    startingRoom: "club-pulse",
  });
  assert.equal(custom.passwordProtected, true);
  assert.equal(custom.password, " secret ");
  assert.equal(custom.currentRoomId, "club-pulse");
  for (const [hostId, hostName, name] of [
    ["", "Roary", "Pride"],
    ["host", " ", "Pride"],
    ["host", "Roary", " "],
    ["host", "Roary", "x".repeat(65)],
  ]) {
    assert.throws(() => createCustomServer(hostId, hostName, name));
  }
  assert.throws(() =>
    createCustomServer("host", "Roary", "Pride", { startingRoom: "missing" }),
  );
});

test("joining enforces capacity, exact passwords and valid player IDs without mutation", () => {
  const server = createCustomServer("host", "Roary", "Private", {
    password: "Secret",
    capacity: 2,
  });
  for (const attempt of [undefined, "", "secret", " Secret"]) {
    const result = joinCustomServer(server, "guest", attempt);
    assert.equal(result.success, false);
    assert.match(result.error!, /password/i);
    assert.equal(result.nextServer, undefined);
  }
  assert.equal(joinCustomServer(server, " ", "Secret").success, false);
  const joined = joinCustomServer(server, "guest", "Secret");
  assert.equal(joined.success, true);
  assert.deepEqual(joined.nextServer!.occupants, ["host", "guest"]);
  assert.deepEqual(server.occupants, ["host"]);
  const full = joinCustomServer(joined.nextServer!, "third", "Secret");
  assert.equal(full.success, false);
  assert.match(full.error!, /full/i);
  assert.equal(
    joinCustomServer(joined.nextServer!, "guest").nextServer,
    joined.nextServer,
  );
});

test("only hosts may moderate and hosts cannot moderate themselves", () => {
  const server = joinCustomServer(
    createCustomServer("host", "Roary", "Pride"),
    "guest",
  ).nextServer!;
  for (const action of ["mute", "unmute", "kick", "ban"] as const) {
    assert.equal(moderateServer(server, "guest", action, "host"), server);
    assert.equal(moderateServer(server, "stranger", action, "guest"), server);
    assert.equal(moderateServer(server, "host", action, "host"), server);
    assert.equal(moderateServer(server, "host", action, " "), server);
  }
  assert.equal(moderateServer(server, "host", "mute", "absent"), server);
});

test("mute, unmute, leave and kick are immutable and idempotent; kicks allow rejoining", () => {
  const server = joinCustomServer(
    createCustomServer("host", "Roary", "Pride"),
    "guest",
  ).nextServer!;
  const muted = moderateServer(server, "host", "mute", "guest");
  assert.deepEqual(muted.mutedPlayerIds, ["guest"]);
  assert.deepEqual(server.mutedPlayerIds, []);
  assert.equal(moderateServer(muted, "host", "mute", "guest"), muted);
  const unmuted = moderateServer(muted, "host", "unmute", "guest");
  assert.deepEqual(unmuted.mutedPlayerIds, []);
  assert.equal(moderateServer(unmuted, "host", "unmute", "guest"), unmuted);
  for (const next of [
    leaveCustomServer(muted, "guest"),
    moderateServer(muted, "host", "kick", "guest"),
  ]) {
    assert.deepEqual(next.occupants, ["host"]);
    assert.deepEqual(next.mutedPlayerIds, []);
    assert.equal(leaveCustomServer(next, "guest"), next);
    assert.equal(moderateServer(next, "host", "kick", "guest"), next);
    assert.equal(joinCustomServer(next, "guest").success, true);
  }
  assert.deepEqual(muted.occupants, ["host", "guest"]);
  assert.deepEqual(leaveCustomServer(server, "host").occupants, ["guest"]);
});

test("bans remove occupancy and mute state, prevent joining, and are repeatable", () => {
  const server = joinCustomServer(
    createCustomServer("host", "Roary", "Pride"),
    "guest",
  ).nextServer!;
  const muted = moderateServer(server, "host", "mute", "guest");
  const banned = moderateServer(muted, "host", "ban", "guest");
  assert.deepEqual(banned.occupants, ["host"]);
  assert.deepEqual(banned.mutedPlayerIds, []);
  assert.deepEqual(banned.bannedPlayerIds, ["guest"]);
  assert.equal(moderateServer(banned, "host", "ban", "guest"), banned);
  assert.equal(leaveCustomServer(banned, "guest"), banned);
  const result = joinCustomServer(banned, "guest");
  assert.equal(result.success, false);
  assert.match(result.error!, /banned/i);
  assert.equal(result.nextServer, undefined);
  assert.deepEqual(server.bannedPlayerIds, []);
});

test("official worlds have stable IDs, available rooms and independent snapshots", () => {
  const servers = getOfficialServers();
  assert.deepEqual(
    servers.map((server) => server.name),
    ["Savanna Prime", "Wonderland Oasis", "The Nightclub Lounge"],
  );
  assert.deepEqual(
    servers.map((server) => server.currentRoomId),
    ["downtown-plaza", "wonder-park-entrance", "club-pulse"],
  );
  assert.equal(new Set(servers.map((server) => server.id)).size, 3);
  assert.deepEqual(getOfficialServers(), servers);
  for (const server of servers) {
    assert.ok(PLACES.some((place) => place.id === server.currentRoomId));
    assert.equal(server.passwordProtected, false);
    assert.deepEqual(server.occupants, []);
    assert.equal(joinCustomServer(server, "guest").success, true);
  }
  servers[0].occupants.push("guest");
  assert.deepEqual(getOfficialServers()[0].occupants, []);
});

test("saved servers round trip, clone arrays and reject malformed or inconsistent records", () => {
  const server = createCustomServer("host", "Roary", "Private", {
    password: "secret",
  });
  assert.deepEqual(
    restoreCustomServer(JSON.parse(JSON.stringify(server))),
    server,
  );
  const restored = restoreCustomServer(server)!;
  restored.occupants.push("other");
  assert.deepEqual(server.occupants, ["host"]);
  for (const value of [
    null,
    [],
    {},
    { ...server, capacity: 51 },
    { ...server, capacity: 1.5 },
    { ...server, createdAt: NaN },
    { ...server, currentRoomId: "missing" },
    { ...server, password: undefined },
    { ...server, passwordProtected: "yes" },
    { ...server, occupants: ["host", "host"] },
    { ...server, occupants: ["host", 1] },
    { ...server, mutedPlayerIds: ["absent"] },
    { ...server, bannedPlayerIds: ["host"] },
    { ...server, bannedPlayerIds: ["host"], occupants: ["host"] },
  ]) {
    assert.equal(restoreCustomServer(value), null);
  }
  assert.equal(
    restoreCustomServer({
      ...server,
      capacity: 1,
      occupants: ["host", "guest"],
    }),
    null,
  );
});

test("saved moderation history preserves every ban made by the engine", () => {
  let server = createCustomServer("host", "Roary", "Pride");
  for (let index = 0; index < 501; index++) {
    server = moderateServer(server, "host", "ban", `guest-${index}`);
  }
  assert.deepEqual(
    restoreCustomServer(JSON.parse(JSON.stringify(server))),
    server,
  );
});
