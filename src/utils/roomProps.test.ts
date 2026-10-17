import test from "node:test";
import assert from "node:assert/strict";
import {
  CATCH_RADIUS,
  YOUR_DOLL,
  catcherAt,
  clampToStage,
  thanksFor,
} from "./roomProps.ts";

const neighbors = [
  { id: "milo", x: 500, y: 600 },
  { id: "cleo", x: 900, y: 600 },
];

test("a prop dropped near a neighbor goes to the closest one", () => {
  assert.equal(catcherAt({ x: 520, y: 560 }, neighbors), "milo");
  assert.equal(catcherAt({ x: 880, y: 640 }, neighbors), "cleo");
  assert.equal(catcherAt({ x: 700, y: 600 }, neighbors), null);
  assert.equal(
    catcherAt({ x: 500 + CATCH_RADIUS + 1, y: 600 }, neighbors),
    null,
  );
});

test("a prop dropped on your own doll is caught by you, unless a neighbor is closer", () => {
  const doll = { x: 700, y: 600 };
  assert.equal(catcherAt({ x: 690, y: 580 }, neighbors, doll), YOUR_DOLL);
  assert.equal(catcherAt({ x: 560, y: 600 }, neighbors, doll), "milo");
  assert.equal(catcherAt({ x: 700, y: 300 }, neighbors, doll), null);
});

test("props stay on the stage however far they are flung", () => {
  const stage = { width: 2400, height: 720 };
  assert.deepEqual(clampToStage({ x: -50, y: 900 }, stage), {
    x: 40,
    y: 700,
  });
  assert.deepEqual(clampToStage({ x: 9000, y: -10 }, stage), {
    x: 2360,
    y: 60,
  });
  assert.deepEqual(clampToStage({ x: 300, y: 400 }, stage), {
    x: 300,
    y: 400,
  });
});

test("food gets a yum and toys get a thank you", () => {
  assert.equal(
    thanksFor({ emoji: "🥭", food: true }),
    "🥭 Yum yum! Thank you!",
  );
  assert.equal(thanksFor({ emoji: "🧸" }), "🧸 For me? Thank you!");
});

test("every room's props start on open floor with unique ids", async () => {
  const { ROOM_MANIFESTS } = await import("../rooms/registry.ts");
  const { pointInPolygon } = await import("./obstacles.ts");
  const withProps = Object.values(ROOM_MANIFESTS).filter(
    (room) => room?.props?.length,
  );
  assert.ok(withProps.length >= 8, "most rooms have something to carry");
  for (const room of withProps) {
    const props = room?.props ?? [];
    assert.equal(new Set(props.map((p) => p.id)).size, props.length);
    for (const prop of props) {
      assert.ok(
        pointInPolygon(prop, room?.walkablePolygon ?? []),
        `${room?.id} ${prop.id}`,
      );
      assert.ok(prop.label.trim() && prop.emoji.trim());
    }
  }
});
