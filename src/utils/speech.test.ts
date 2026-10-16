import test from "node:test";
import assert from "node:assert/strict";
import { speak, spokenText } from "./speech.ts";
import { createAudioBus } from "./audioBus.ts";

test("spoken text drops emoji and symbols but keeps words and punctuation", () => {
  assert.equal(
    spokenText("Whee! 🎈 The balloons float up high."),
    "Whee! The balloons float up high.",
  );
  assert.equal(
    spokenText("Caught a golden catfish! 🐟✨"),
    "Caught a golden catfish!",
  );
  assert.equal(spokenText("🎉"), "");
});

test("speaking without a speech engine or with sound muted does nothing", () => {
  const bus = createAudioBus(null);
  assert.doesNotThrow(() => speak("Hello", bus));
  bus.setSfxMuted(true);
  assert.doesNotThrow(() => speak("Hello", bus));
});
