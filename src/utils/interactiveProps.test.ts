import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getPropInteraction,
  playPropSound,
  type PropType,
  type PropSound,
} from "./interactiveProps.ts";

test("getPropInteraction returns expected results for all known prop types", () => {
  const propTypes: PropType[] = [
    "chair",
    "bed",
    "lamp",
    "plant",
    "water",
    "table",
    "blender",
    "arcade_cabinet",
    "clock",
    "tub",
    "bridge",
    "fireplace",
  ];

  for (const type of propTypes) {
    const res = getPropInteraction(type, false);
    assert.ok(res.message.length > 0, `message for ${type} must not be empty`);
    assert.ok(res.action.length > 0, `action for ${type} must not be empty`);
    assert.equal(res.nextActiveState, true);

    const toggled = getPropInteraction(type, true);
    assert.equal(toggled.nextActiveState, false);
  }
});

test("lamp toggling produces distinct messages for on and off states", () => {
  const on = getPropInteraction("lamp", false);
  assert.ok(on.message.includes("warm amber glow"));
  assert.equal(on.nextActiveState, true);

  const off = getPropInteraction("lamp", true);
  assert.ok(off.message.includes("turns off"));
  assert.equal(off.nextActiveState, false);
});

test("playPropSound tolerates null/unsupported AudioContext without throwing", () => {
  const sounds: PropSound[] = [
    "sit",
    "splash",
    "chime",
    "lamp",
    "blender",
    "bubble",
    "rustle",
    "crackle",
  ];

  for (const sound of sounds) {
    assert.doesNotThrow(() => {
      playPropSound(sound, null);
    });
  }
});
