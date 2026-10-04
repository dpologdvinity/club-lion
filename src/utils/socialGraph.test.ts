import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACES } from "../game.ts";
import { ROOM_MANIFESTS } from "../rooms/registry.ts";
import {
  acceptFriendRequest,
  cancelOutgoingRequest,
  canSendSocialEmote,
  declineFriendRequest,
  getJumpSpawnCoordinate,
  recordRecentVisitor,
  removeFriend,
  sendFriendRequest,
  type SocialGraphState,
} from "./socialGraph.ts";

const empty = (): SocialGraphState => ({
  friends: [],
  pendingIncoming: [],
  pendingOutgoing: [],
  recentVisitors: [],
});

test("requests reject self, invalid IDs, existing relationships and full lists", () => {
  const graph = empty();
  for (const target of ["me", "", " ", "x".repeat(33)]) {
    assert.equal(sendFriendRequest(graph, "me", target), graph);
  }
  const requested = sendFriendRequest(graph, "me", "cleo");
  assert.deepEqual(requested.pendingOutgoing, ["cleo"]);
  assert.deepEqual(graph, empty());
  assert.equal(sendFriendRequest(requested, "me", "cleo"), requested);
  for (const field of [
    "friends",
    "pendingIncoming",
    "pendingOutgoing",
  ] as const) {
    const existing = { ...graph, [field]: ["cleo"] };
    assert.equal(sendFriendRequest(existing, "me", "cleo"), existing);
  }
  for (const field of ["friends", "pendingOutgoing"] as const) {
    const full = {
      ...graph,
      [field]: Array.from({ length: 100 }, (_, i) => `id-${i}`),
    };
    assert.equal(sendFriendRequest(full, "me", "new"), full);
  }
});

test("accept requires an incoming request, deduplicates and is idempotent", () => {
  const graph = {
    ...empty(),
    pendingIncoming: ["cleo", "cleo", "pip"],
    pendingOutgoing: ["cleo"],
  };
  const accepted = acceptFriendRequest(graph, "cleo");
  assert.deepEqual(accepted.friends, ["cleo"]);
  assert.deepEqual(accepted.pendingIncoming, ["pip"]);
  assert.deepEqual(accepted.pendingOutgoing, []);
  assert.equal(acceptFriendRequest(accepted, "cleo"), accepted);
  assert.equal(acceptFriendRequest(empty(), "stranger").friends.length, 0);
  assert.deepEqual(graph.pendingIncoming, ["cleo", "cleo", "pip"]);
  const full = {
    ...graph,
    friends: Array.from({ length: 100 }, (_, i) => `id-${i}`),
  };
  assert.equal(acceptFriendRequest(full, "cleo"), full);
  const duplicate = { ...graph, friends: ["cleo", "cleo"] };
  assert.deepEqual(acceptFriendRequest(duplicate, "cleo").friends, ["cleo"]);
});

test("decline, cancel and remove preserve unrelated lists and are repeatable", () => {
  const graph = {
    friends: ["a", "a", "b"],
    pendingIncoming: ["c", "c"],
    pendingOutgoing: ["d", "d"],
    recentVisitors: ["a"],
  };
  const declined = declineFriendRequest(graph, "c");
  const cancelled = cancelOutgoingRequest(declined, "d");
  const removed = removeFriend(cancelled, "a");
  assert.deepEqual(removed, {
    friends: ["b"],
    pendingIncoming: [],
    pendingOutgoing: [],
    recentVisitors: ["a"],
  });
  assert.deepEqual(removeFriend(removed, "a"), removed);
  assert.deepEqual(declineFriendRequest(declined, "c"), declined);
  assert.deepEqual(cancelOutgoingRequest(cancelled, "d"), cancelled);
  assert.deepEqual(graph.friends, ["a", "a", "b"]);
});

test("recent visitors are newest first, unique, bounded, and exclude self", () => {
  let graph = empty();
  assert.equal(recordRecentVisitor(graph, "me", "me"), graph);
  assert.equal(recordRecentVisitor(graph, "me", ""), graph);
  for (let i = 0; i < 20; i++)
    graph = recordRecentVisitor(graph, "me", `visitor-${i}`);
  assert.equal(graph.recentVisitors.length, 15);
  assert.equal(graph.recentVisitors[0], "visitor-19");
  assert.deepEqual(
    recordRecentVisitor(graph, "me", "visitor-10", 2).recentVisitors,
    ["visitor-10", "visitor-19"],
  );
  assert.deepEqual(
    recordRecentVisitor(graph, "me", "new", 0).recentVisitors,
    [],
  );
  assert.equal(recordRecentVisitor(graph, "me", "new", NaN), graph);
});

// Independent ray casting and boundary checks verify the resolver's geometry.
function strictlyInside(
  point: { x: number; y: number },
  polygon: [number, number][],
) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j],
      [bx, by] = polygon[i];
    const cross = (point.x - ax) * (by - ay) - (point.y - ay) * (bx - ax);
    if (
      Math.abs(cross) < 1e-6 &&
      point.x >= Math.min(ax, bx) &&
      point.x <= Math.max(ax, bx) &&
      point.y >= Math.min(ay, by) &&
      point.y <= Math.max(ay, by)
    )
      return false;
    if (
      ay > point.y !== by > point.y &&
      point.x < ((bx - ax) * (point.y - ay)) / (by - ay) + ax
    )
      inside = !inside;
  }
  return inside;
}

test("jump spawns are deterministic, strictly walkable and outside every portal in every room", () => {
  const ids = new Set([
    ...PLACES.map((place) => place.id),
    ...Object.keys(ROOM_MANIFESTS),
  ]);
  assert.equal(ids.size, 15);
  for (const id of ids) {
    const spawn = getJumpSpawnCoordinate(
      id as Parameters<typeof getJumpSpawnCoordinate>[0],
    );
    assert.deepEqual(
      spawn,
      getJumpSpawnCoordinate(
        id as Parameters<typeof getJumpSpawnCoordinate>[0],
      ),
    );
    const manifest = ROOM_MANIFESTS[id as keyof typeof ROOM_MANIFESTS];
    const width = manifest?.stageWidth ?? 100,
      height = manifest?.stageHeight ?? 100;
    assert.ok(
      spawn.x > 0 && spawn.x < width && spawn.y > 0 && spawn.y < height,
      id,
    );
    if (manifest) {
      assert.ok(strictlyInside(spawn, manifest.walkablePolygon), id);
      for (const { triggerBounds: b } of manifest.portals) {
        assert.ok(
          !(
            spawn.x >= b.x1 &&
            spawn.x <= b.x2 &&
            spawn.y >= b.y1 &&
            spawn.y <= b.y2
          ),
          `${id} overlaps a portal`,
        );
      }
    }
  }
});

test("safe spawn search handles a blocked center instead of returning a portal", () => {
  const manifest = ROOM_MANIFESTS["downtown-plaza"]!;
  const portals = manifest.portals;
  manifest.portals = [
    ...portals,
    {
      targetRoomId: "square",
      targetSpawn: { x: 43, y: 78 },
      triggerBounds: { x1: 1100, x2: 1300, y1: 560, y2: 720 },
      label: "Test center",
    },
  ];
  try {
    const point = getJumpSpawnCoordinate("downtown-plaza");
    assert.ok(point.x < 1100 || point.x > 1300);
    assert.ok(strictlyInside(point, manifest.walkablePolygon));
  } finally {
    manifest.portals = portals;
  }
});

test("emote cooldown permits first send and boundary, rejects invalid clocks", () => {
  assert.equal(canSendSocialEmote(0, 100), true);
  assert.equal(canSendSocialEmote(1000, 2999), false);
  assert.equal(canSendSocialEmote(1000, 3000), true);
  assert.equal(canSendSocialEmote(1000, 1500, 500), true);
  for (const args of [
    [NaN, 1000],
    [0, NaN],
    [-1, 1000],
    [1000, 900],
    [0, 1000, -1],
    [0, 1000, Infinity],
  ]) {
    assert.equal(canSendSocialEmote(args[0], args[1], args[2]), false);
  }
});

test("social sound releases voices and uses the shared SFX destination", async () => {
  const { getSharedAudioBus, resetSharedAudioBusForTests } =
    await import("./audioBus.ts");
  const { playSocialSound } = await import("./socialGraph.ts");
  const original = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  const voices: {
    stopped: number;
    disconnected: number;
    onended: (() => void) | null;
    destination: unknown;
  }[] = [];
  const gains: {
    disconnected: number;
    gain: unknown;
    destination: unknown;
    connect: (node: unknown) => void;
    disconnect: () => void;
  }[] = [];
  const param = () => ({
    value: 1,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
  });
  let resumes = 0;
  const ctx = {
    currentTime: 10,
    state: "suspended",
    destination: {},
    resume: () => {
      resumes++;
      return Promise.reject(new Error("Audio blocked"));
    },
    createGain: () => {
      const gain = {
        disconnected: 0,
        gain: param(),
        destination: null as unknown,
        connect(node: unknown) {
          this.destination = node;
        },
        disconnect() {
          this.disconnected++;
        },
      };
      gains.push(gain);
      return gain;
    },
    createOscillator: () => {
      const voice = {
        stopped: 0,
        disconnected: 0,
        onended: null as (() => void) | null,
        destination: null as unknown,
        type: "sine",
        frequency: param(),
        start() {},
        stop() {
          this.stopped++;
        },
        connect(node: unknown) {
          this.destination = node;
        },
        disconnect() {
          this.disconnected++;
        },
      };
      voices.push(voice);
      return voice;
    },
  };
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: function () {
      return ctx;
    },
  });
  resetSharedAudioBusForTests();
  try {
    for (const type of [
      "request_sent",
      "request_accepted",
      "emote_highfive",
      "jump_teleport",
    ] as const)
      playSocialSound(type);
    assert.equal(resumes, 4);
    assert.equal(voices.length, 10);
    assert.ok(getSharedAudioBus().getSfxDestination());
    for (const voice of voices.slice(0, 5)) {
      assert.equal(
        (voice.destination as { destination: unknown }).destination,
        getSharedAudioBus().getSfxDestination(),
      );
      assert.equal(voice.stopped, 1);
      voice.onended?.();
      assert.equal(voice.disconnected, 1);
      assert.equal(
        (voice.destination as { disconnected: number }).disconnected,
        1,
      );
    }
    await Promise.resolve();
    for (const voice of voices) {
      // Both natural completion and rejected resume release each voice exactly once.
      assert.equal(voice.disconnected, 1);
      assert.equal(
        (voice.destination as { disconnected: number }).disconnected,
        1,
      );
      assert.equal(voice.onended, null);
    }
  } finally {
    resetSharedAudioBusForTests();
    if (original) Object.defineProperty(globalThis, "AudioContext", original);
    else Reflect.deleteProperty(globalThis, "AudioContext");
  }
});

test("social sound safely handles missing audio, failed creation and partially scheduled voices", async () => {
  const { resetSharedAudioBusForTests } = await import("./audioBus.ts");
  const { playSocialSound } = await import("./socialGraph.ts");
  const original = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  let disconnected = 0;
  let count = 0;
  const gain = () => ({
    gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    connect() {},
    disconnect() {
      disconnected++;
    },
  });
  const ctx = {
    state: "running",
    currentTime: 0,
    destination: {},
    createGain: gain,
    createOscillator: () => {
      if (++count === 2) throw new Error("Device failed");
      return {
        type: "sine",
        frequency: { setValueAtTime() {} },
        connect() {},
        disconnect() {
          disconnected++;
        },
        start() {},
        stop() {},
        onended: null,
      };
    },
  };
  try {
    for (const constructor of [
      undefined,
      function () {
        throw new Error("Unavailable");
      },
      function () {
        return ctx;
      },
    ]) {
      Object.defineProperty(globalThis, "AudioContext", {
        configurable: true,
        value: constructor,
      });
      resetSharedAudioBusForTests();
      assert.doesNotThrow(() => playSocialSound("request_sent"));
    }
    assert.ok(disconnected >= 2);
  } finally {
    resetSharedAudioBusForTests();
    if (original) Object.defineProperty(globalThis, "AudioContext", original);
    else Reflect.deleteProperty(globalThis, "AudioContext");
  }
});
