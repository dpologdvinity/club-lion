import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SHORTCUT_KEY,
  isTypingTarget,
  shouldHandleMuteShortcut,
  type ShortcutEventLike,
} from "./audioShortcut.ts";

function makeEvent(
  overrides: Partial<ShortcutEventLike> = {},
): ShortcutEventLike {
  return {
    key: "m",
    repeat: false,
    isComposing: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...overrides,
  };
}

test("fires for a plain unmodified keypress matching the shortcut key", () => {
  assert.equal(
    shouldHandleMuteShortcut(makeEvent(), null, DEFAULT_SHORTCUT_KEY),
    true,
  );
});

test("is case-insensitive on both the event key and the configured key", () => {
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ key: "M" }), null, "m"),
    true,
  );
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ key: "m" }), null, "M"),
    true,
  );
});

test("ignores held-key auto-repeat events", () => {
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ repeat: true }), null, "m"),
    false,
  );
});

test("ignores events mid IME composition", () => {
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ isComposing: true }), null, "m"),
    false,
  );
});

test("ignores Ctrl/Alt/Meta modified shortcuts", () => {
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ ctrlKey: true }), null, "m"),
    false,
  );
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ altKey: true }), null, "m"),
    false,
  );
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ metaKey: true }), null, "m"),
    false,
  );
});

test("ignores a different key than configured", () => {
  assert.equal(
    shouldHandleMuteShortcut(makeEvent({ key: "n" }), null, "m"),
    false,
  );
});

test("empty shortcut key disables the shortcut entirely", () => {
  assert.equal(shouldHandleMuteShortcut(makeEvent(), null, ""), false);
});

test("ignores the shortcut while focus is on a text input or textarea", () => {
  assert.equal(
    shouldHandleMuteShortcut(
      makeEvent(),
      { tagName: "INPUT", isContentEditable: false, type: "text" },
      "m",
    ),
    false,
  );
  assert.equal(
    shouldHandleMuteShortcut(
      makeEvent(),
      { tagName: "TEXTAREA", isContentEditable: false },
      "m",
    ),
    false,
  );
  assert.equal(
    shouldHandleMuteShortcut(
      makeEvent(),
      { tagName: "DIV", isContentEditable: true },
      "m",
    ),
    false,
  );
});

test("stays live when focus is on a non-text input such as the volume range", () => {
  assert.equal(
    shouldHandleMuteShortcut(
      makeEvent(),
      { tagName: "INPUT", isContentEditable: false, type: "range" },
      "m",
    ),
    true,
  );
  assert.equal(
    shouldHandleMuteShortcut(
      makeEvent(),
      { tagName: "BUTTON", isContentEditable: false },
      "m",
    ),
    true,
  );
});

test("isTypingTarget classifies text vs. non-text controls", () => {
  assert.equal(isTypingTarget(null), false);
  assert.equal(
    isTypingTarget({
      tagName: "INPUT",
      isContentEditable: false,
      type: "range",
    }),
    false,
  );
  assert.equal(
    isTypingTarget({
      tagName: "INPUT",
      isContentEditable: false,
      type: "text",
    }),
    true,
  );
  assert.equal(
    isTypingTarget({ tagName: "INPUT", isContentEditable: false }),
    true,
  );
});
