/**
 * Pure predicate logic for the global mute keyboard shortcut, split out of
 * AudioControls so it is unit-testable without a DOM (repeat/modifier
 * guarding, typing exemptions, and the remap/disable setting).
 */

export const SHORTCUT_KEY_STORAGE_KEY = "club-lion:audio-shortcut-key";
export const DEFAULT_SHORTCUT_KEY = "m";

/** Non-text input types that don't accept printable-key text entry. */
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  "range",
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "color",
  "file",
]);

export interface ShortcutEventLike {
  key: string;
  repeat: boolean;
  isComposing: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface ShortcutTargetLike {
  tagName: string;
  isContentEditable: boolean;
  type?: string;
}

/** Text-entry controls where a printable-key shortcut must not fire. */
export function isTypingTarget(target: ShortcutTargetLike | null): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  if (target.tagName === "TEXTAREA") return true;
  if (target.tagName === "INPUT") {
    return !NON_TEXT_INPUT_TYPES.has(target.type ?? "text");
  }
  return false;
}

/**
 * Whether a keydown event should trigger the global mute shortcut: not a
 * repeat, not mid-IME-composition, no Ctrl/Alt/Meta modifier, matches the
 * configured (possibly remapped) key, and not focused on a text-entry
 * control. An empty `shortcutKey` disables the shortcut entirely.
 */
export function shouldHandleMuteShortcut(
  event: ShortcutEventLike,
  target: ShortcutTargetLike | null,
  shortcutKey: string,
): boolean {
  if (event.repeat) return false;
  if (event.isComposing || event.ctrlKey || event.altKey || event.metaKey) {
    return false;
  }
  if (!shortcutKey) return false;
  if (event.key.toLowerCase() !== shortcutKey.toLowerCase()) return false;
  if (isTypingTarget(target)) return false;
  return true;
}

export function readShortcutKey(): string {
  try {
    const stored = localStorage.getItem(SHORTCUT_KEY_STORAGE_KEY);
    return stored === null ? DEFAULT_SHORTCUT_KEY : stored.toLowerCase();
  } catch {
    return DEFAULT_SHORTCUT_KEY;
  }
}
