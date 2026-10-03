import test from "node:test";
import assert from "node:assert/strict";
import {
  COASTER_PHASE_STARTS,
  COASTER_STAGE,
  COASTER_TRACK_JOINS,
  computeCoasterTrackPosition,
  computeFerrisWheelCabin,
  computePendulumSwing,
} from "./kineticRides.ts";
import { wonderParkEntranceManifest } from "../rooms/manifests/wonderParkEntrance.ts";
import { wonderParkMidwayManifest } from "../rooms/manifests/wonderParkMidway.ts";
import { downtownPlazaManifest } from "../rooms/manifests/downtownPlaza.ts";
import type { RoomManifest } from "../rooms/types.ts";

const GROUND_LEVEL_Y = 650;

function angleDifference(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function tangentAngleDeg(t: number): number {
  const before = computeCoasterTrackPosition(t - 1e-5);
  const after = computeCoasterTrackPosition(t + 1e-5);
  return (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
}

const PHASE_ORDER = ["lift", "drop", "loop", "hop", "return"] as const;

/** End of a phase: the start of the next one, or 1 for the final phase. */
function phaseEnd(phase: (typeof PHASE_ORDER)[number]): number {
  const next = PHASE_ORDER[PHASE_ORDER.indexOf(phase) + 1];
  return next ? COASTER_PHASE_STARTS[next] : 1;
}

/** A parameter a given fraction of the way through a phase. */
function withinPhase(
  phase: (typeof PHASE_ORDER)[number],
  fraction: number,
): number {
  const start = COASTER_PHASE_STARTS[phase];
  return start + (phaseEnd(phase) - start) * fraction;
}

test("coaster track wraps t modulo 1 for values outside [0, 1)", () => {
  const base = computeCoasterTrackPosition(0.1);
  for (const t of [1.1, -0.9, 3.1]) {
    const wrapped = computeCoasterTrackPosition(t);
    assert.ok(Math.abs(wrapped.x - base.x) < 1e-6, `x should wrap for t=${t}`);
    assert.ok(Math.abs(wrapped.y - base.y) < 1e-6, `y should wrap for t=${t}`);
    assert.ok(
      angleDifference(wrapped.angle, base.angle) < 1e-6,
      `angle should wrap for t=${t}`,
    );
    assert.equal(wrapped.speedMultiplier, base.speedMultiplier);
    assert.equal(wrapped.isInverted, base.isInverted);
  }
});

test("circuit closes: the track returns to its starting point at t=1", () => {
  const start = computeCoasterTrackPosition(0);
  const almostEnd = computeCoasterTrackPosition(0.999999);
  assert.ok(Math.abs(start.x - almostEnd.x) < 1, "x should be continuous");
  assert.ok(Math.abs(start.y - almostEnd.y) < 1, "y should be continuous");
});

test("track position is continuous across every geometry join", () => {
  const epsilon = 1e-7;
  for (const boundary of [...COASTER_TRACK_JOINS, 1]) {
    const before = computeCoasterTrackPosition(boundary - epsilon);
    const after = computeCoasterTrackPosition(boundary + epsilon);
    const gap = Math.hypot(after.x - before.x, after.y - before.y);
    assert.ok(
      gap < 1,
      `position should not jump at t=${boundary} (gap ${gap})`,
    );
  }
});

test("track heading is continuous across every geometry join", () => {
  // Sampled a clear step either side of each join, well outside any
  // difference-quotient window, so a kink cannot hide inside it.
  const epsilon = 1e-3;
  assert.ok(COASTER_TRACK_JOINS.length >= 5, "joins must be enumerated");
  for (const boundary of [...COASTER_TRACK_JOINS, 1]) {
    const before = computeCoasterTrackPosition(boundary - epsilon);
    const after = computeCoasterTrackPosition(boundary + epsilon);
    const jump = angleDifference(before.angle, after.angle);
    assert.ok(
      jump < 15,
      `heading should not snap at t=${boundary} (${jump.toFixed(1)}deg)`,
    );
  }
});

test("track heading is continuous across the internal return join at t=0.86", () => {
  // Sampled a clear step back from the join so a kink cannot hide inside the
  // central-difference window used to derive the heading.
  const epsilon = 1e-3;
  const before = computeCoasterTrackPosition(0.86 - epsilon);
  const after = computeCoasterTrackPosition(0.86 + epsilon);
  const jump = angleDifference(before.angle, after.angle);
  assert.ok(
    jump < 15,
    `heading should not snap at t=0.86 (${jump.toFixed(1)}deg)`,
  );
});

test("the station seam closes smoothly in position and heading", () => {
  // The circuit is a closed loop, so the arriving and departing track must
  // agree in position and direction of travel across the modulo wrap.
  const epsilon = 1e-3;
  const arriving = computeCoasterTrackPosition(1 - epsilon);
  const departing = computeCoasterTrackPosition(epsilon);
  const gap = Math.hypot(departing.x - arriving.x, departing.y - arriving.y);
  assert.ok(gap < 20, `station seam should not jump in position (${gap})`);
  const jump = angleDifference(arriving.angle, departing.angle);
  assert.ok(
    jump < 15,
    `station seam should not reverse heading (${jump.toFixed(1)}deg)`,
  );
  assert.ok(
    Math.abs(arriving.y - GROUND_LEVEL_Y) < 2,
    `should arrive at ground level (y=${arriving.y})`,
  );
  assert.ok(
    Math.abs(departing.y - GROUND_LEVEL_Y) < 2,
    `should depart at ground level (y=${departing.y})`,
  );
});

test("the circuit has no heading snaps anywhere along its length", () => {
  // Dense sweep with wrap-aware angle comparison. A smooth closed curve turns
  // gradually, so neighbouring samples must stay close in heading.
  const step = 1e-4;
  let previous = computeCoasterTrackPosition(0);
  let worst = { t: 0, jump: 0 };
  for (let t = step; t <= 1 + step / 2; t += step) {
    const current = computeCoasterTrackPosition(t);
    const jump = angleDifference(previous.angle, current.angle);
    if (jump > worst.jump) worst = { t, jump };
    previous = current;
  }
  assert.ok(
    worst.jump < 5,
    `heading snapped by ${worst.jump.toFixed(1)}deg near t=${worst.t.toFixed(5)}`,
  );
});

test("the circuit has no position gaps anywhere along its length", () => {
  const step = 1e-4;
  let previous = computeCoasterTrackPosition(0);
  let worst = { t: 0, gap: 0 };
  for (let t = step; t <= 1 + step / 2; t += step) {
    const current = computeCoasterTrackPosition(t);
    const gap = Math.hypot(current.x - previous.x, current.y - previous.y);
    if (gap > worst.gap) worst = { t, gap };
    previous = current;
  }
  assert.ok(
    worst.gap < 10,
    `position jumped ${worst.gap.toFixed(2)}px near t=${worst.t.toFixed(5)}`,
  );
});

test("the whole circuit stays inside the 2800x720 stage", () => {
  assert.deepEqual(COASTER_STAGE, { width: 2800, height: 720 });
  for (let t = 0; t < 1; t += 1e-4) {
    const point = computeCoasterTrackPosition(t);
    assert.ok(
      point.x >= 0 && point.x <= COASTER_STAGE.width,
      `x=${point.x} out of bounds at t=${t}`,
    );
    assert.ok(
      point.y >= 0 && point.y <= COASTER_STAGE.height,
      `y=${point.y} out of bounds at t=${t}`,
    );
  }
});

test("reported heading agrees with the direction of travel along the track", () => {
  for (const t of [0.1, 0.2, 0.3, 0.45, 0.5, 0.55, 0.7, 0.9, 0.99]) {
    const reported = computeCoasterTrackPosition(t).angle;
    const diff = angleDifference(tangentAngleDeg(t), reported);
    assert.ok(
      diff < 15,
      `heading should track the tangent at t=${t} (off by ${diff}deg)`,
    );
  }
});

test("coaster wrapping holds inside curved sections, not only the lift hill", () => {
  for (const t of [0.5, 0.7]) {
    const base = computeCoasterTrackPosition(t);
    const wrapped = computeCoasterTrackPosition(t + 2);
    assert.ok(Math.abs(wrapped.x - base.x) < 1e-6, `x wraps at t=${t}`);
    assert.ok(Math.abs(wrapped.y - base.y) < 1e-6, `y wraps at t=${t}`);
    assert.equal(wrapped.isInverted, base.isInverted);
  }
});

test("lift hill climbs slower than the first drop plunges", () => {
  const liftHill = computeCoasterTrackPosition(withinPhase("lift", 0.5));
  const firstDrop = computeCoasterTrackPosition(withinPhase("drop", 0.5));
  assert.ok(liftHill.speedMultiplier < 1, "lift hill should be slow");
  assert.ok(firstDrop.speedMultiplier > 1.5, "first drop should be fast");
  assert.ok(firstDrop.speedMultiplier > liftHill.speedMultiplier);
});

test("lift hill is not inverted and climbs upward (y decreases)", () => {
  const early = computeCoasterTrackPosition(withinPhase("lift", 0.1));
  const late = computeCoasterTrackPosition(withinPhase("lift", 0.9));
  assert.equal(early.isInverted, false);
  assert.equal(late.isInverted, false);
  assert.ok(late.y < early.y, "lift hill should climb (y decreases upward)");
});

test("vertical loop inverts at the top of the loop, not at the bottom", () => {
  const samples = [];
  const loopStart = COASTER_PHASE_STARTS.loop;
  const loopEnd = phaseEnd("loop");
  for (let t = loopStart; t < loopEnd; t += (loopEnd - loopStart) / 100) {
    samples.push(computeCoasterTrackPosition(t));
  }
  const inverted = samples.filter((point) => point.isInverted);
  assert.ok(inverted.length > 0, "the loop should invert somewhere");

  const loopYs = samples.map((point) => point.y);
  const highest = Math.min(...loopYs);
  const lowest = Math.max(...loopYs);
  const midHeight = (highest + lowest) / 2;

  for (const point of inverted) {
    assert.ok(
      point.y < midHeight,
      `inversion must occur above loop mid-height (y=${point.y})`,
    );
  }
  const apex = samples.reduce((a, b) => (a.y <= b.y ? a : b));
  assert.equal(apex.isInverted, true, "the apex of the loop must be inverted");
});

test("vertical loop entry and exit are upright", () => {
  assert.equal(
    computeCoasterTrackPosition(withinPhase("loop", 0.01)).isInverted,
    false,
  );
  assert.equal(
    computeCoasterTrackPosition(withinPhase("loop", 0.99)).isInverted,
    false,
  );
});

test("vertical loop executes one full revolution", () => {
  const from = withinPhase("loop", 0.002);
  const to = withinPhase("loop", 0.998);
  const step = (to - from) / 400;
  let previous = tangentAngleDeg(from);
  let total = 0;
  for (let t = from; t <= to; t += step) {
    const current = tangentAngleDeg(t);
    let delta = ((current - previous + 540) % 360) - 180;
    total += delta;
    previous = current;
  }
  assert.ok(
    Math.abs(Math.abs(total) - 360) < 40,
    `loop should sweep a full revolution (swept ${total.toFixed(1)}deg)`,
  );
});

test("airtime hill and return run are not inverted", () => {
  const bunnyHop = computeCoasterTrackPosition(withinPhase("hop", 0.5));
  const returnRun = computeCoasterTrackPosition(withinPhase("return", 0.5));
  assert.equal(bunnyHop.isInverted, false);
  assert.equal(returnRun.isInverted, false);
});

test("ferris wheel cabin stays upright regardless of wheel rotation", () => {
  const center = { x: 500, y: 300 };
  for (const angleDeg of [0, 45, 90, 137, 270, 359]) {
    const cabin = computeFerrisWheelCabin(angleDeg, 200, center);
    assert.equal(cabin.cabinAngleDeg, 0);
  }
});

test("ferris wheel cabin orbits the center at the given radius", () => {
  const center = { x: 500, y: 300 };
  const radius = 200;
  const cabinAtTop = computeFerrisWheelCabin(90, radius, center);
  assert.ok(Math.abs(cabinAtTop.x - center.x) < 1e-6);
  const cabinAtRight = computeFerrisWheelCabin(0, radius, center);
  assert.ok(Math.abs(cabinAtRight.y - center.y) < 1e-6);
  assert.ok(Math.abs(cabinAtRight.x - (center.x + radius)) < 1e-6);
});

test("pendulum swing oscillates between +/- maxAngleDeg with the given period", () => {
  const maxAngleDeg = 40;
  const periodSeconds = 4;
  const atStart = computePendulumSwing(0, maxAngleDeg, periodSeconds);
  assert.ok(Math.abs(atStart.angleDeg) < 1e-6);

  const atQuarterPeriod = computePendulumSwing(1, maxAngleDeg, periodSeconds);
  assert.ok(Math.abs(atQuarterPeriod.angleDeg - maxAngleDeg) < 1e-6);

  const atFullPeriod = computePendulumSwing(4, maxAngleDeg, periodSeconds);
  assert.ok(Math.abs(atFullPeriod.angleDeg) < 1e-6);
});

test("pendulum swing rises higher as it approaches maximum angle", () => {
  const atRest = computePendulumSwing(0, 40, 4);
  const atPeak = computePendulumSwing(1, 40, 4);
  assert.ok(atPeak.heightOffset > atRest.heightOffset);
});

test("wonder park entrance manifest has valid structure", () => {
  const manifest = wonderParkEntranceManifest;
  assert.equal(manifest.id, "wonder-park-entrance");
  assert.equal(manifest.name, "Wonder Park Entrance");
  assert.equal(manifest.district, "wonder-park");
  assert.equal(manifest.stageWidth, 2800);
  assert.equal(manifest.stageHeight, 720);
  assert.equal(manifest.backgroundAsset, "wonder-park-entrance-bg.png");
  assert.ok(manifest.walkablePolygon.length >= 3);
  for (const [, y] of manifest.walkablePolygon) {
    assert.ok(y >= 540 && y <= 720);
  }
  assert.ok(manifest.depthLayers.length > 0);
  assert.ok(
    manifest.depthLayers.some((layer) => layer.id === "flume-splashdown"),
  );
  assert.equal(manifest.ambientAudioPreset, "carnival-ambient");

  const plazaPortal = manifest.portals.find(
    (p) => p.targetRoomId === "downtown-plaza",
  );
  assert.ok(plazaPortal);

  const midwayPortal = manifest.portals.find(
    (p) => p.targetRoomId === "wonder-park-midway",
  );
  assert.ok(midwayPortal);

  const rideInteractives = manifest.interactives.filter(
    (i) => i.type === "ride",
  );
  assert.ok(rideInteractives.length >= 2);
  const secretInteractives = manifest.interactives.filter(
    (i) => i.type === "secret_clickable",
  );
  assert.ok(secretInteractives.length >= 1);
});

test("wonder park midway manifest has valid structure", () => {
  const manifest = wonderParkMidwayManifest;
  assert.equal(manifest.id, "wonder-park-midway");
  assert.equal(manifest.name, "Carnival Midway");
  assert.equal(manifest.district, "wonder-park");
  assert.equal(manifest.stageWidth, 2800);
  assert.equal(manifest.stageHeight, 720);
  assert.equal(manifest.backgroundAsset, "wonder-park-midway-bg.png");
  assert.ok(manifest.walkablePolygon.length >= 3);
  assert.ok(manifest.depthLayers.length > 0);
  assert.equal(manifest.ambientAudioPreset, "carnival-midway");

  const entrancePortal = manifest.portals.find(
    (p) => p.targetRoomId === "wonder-park-entrance",
  );
  assert.ok(entrancePortal);
  assert.deepEqual(entrancePortal!.targetSpawn, { x: 2650, y: 600 });

  const rideInteractives = manifest.interactives.filter(
    (i) => i.type === "ride",
  );
  assert.ok(rideInteractives.length >= 2);
  const gameInteractives = manifest.interactives.filter(
    (i) => i.type === "game_launch",
  );
  assert.ok(gameInteractives.length >= 1);
});

test("portal spawns never land inside a trigger in the destination room", () => {
  const rooms: RoomManifest[] = [
    wonderParkEntranceManifest,
    wonderParkMidwayManifest,
    downtownPlazaManifest,
  ];
  const byId = new Map(rooms.map((room) => [room.id, room]));

  for (const room of rooms) {
    for (const portal of room.portals) {
      const destination = byId.get(portal.targetRoomId);
      if (!destination) continue;
      const { x, y } = portal.targetSpawn;
      for (const other of destination.portals) {
        const { x1, y1, x2, y2 } = other.triggerBounds;
        const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2;
        assert.ok(
          !inside,
          `${room.id} -> ${destination.id} spawns (${x}, ${y}) inside the "${other.label}" trigger`,
        );
      }
    }
  }
});

test("portal spawns land within the destination walkable band", () => {
  const rooms: RoomManifest[] = [
    wonderParkEntranceManifest,
    wonderParkMidwayManifest,
    downtownPlazaManifest,
  ];
  const byId = new Map(rooms.map((room) => [room.id, room]));

  for (const room of rooms) {
    for (const portal of room.portals) {
      const destination = byId.get(portal.targetRoomId);
      if (!destination) continue;
      const { x, y } = portal.targetSpawn;
      const ys = destination.walkablePolygon.map(([, py]) => py);
      assert.ok(
        x >= 0 && x <= destination.stageWidth,
        `${destination.id} spawn x=${x} must be on stage`,
      );
      assert.ok(
        y >= Math.min(...ys) && y <= Math.max(...ys),
        `${destination.id} spawn y=${y} must be walkable`,
      );
    }
  }
});
