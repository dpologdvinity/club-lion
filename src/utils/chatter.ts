/**
 * Room chatter with no React or DOM dependency: now and then a neighbour in
 * the room says something friendly, so rooms feel busy like in Fantage.
 */

export const CHATTER_EVERY_MS = 9000;
export const CHATTER_SHOW_MS = 3500;

export const CHATTER_LINES = [
  "Hi everyone! 👋",
  "I love your outfit! 💖",
  "Wanna play a game? 🎮",
  "This place is so cool! ✨",
  "Let's be friends! 🤝",
  "Has anyone seen a butterfly? 🦋",
  "I'm going to the café next! ☕",
  "Wheee! 🎉",
  "Nice hair! 💇",
  "Race you to the fountain! 🏃",
];

/** Who speaks and what, for the `tick`-th chatter in a room. */
export function chatterFor(
  ids: readonly string[],
  tick: number,
): { id: string; text: string } | null {
  if (!ids.length) return null;
  return {
    id: ids[(tick * 7) % ids.length],
    text: CHATTER_LINES[(tick * 3 + ids.length) % CHATTER_LINES.length],
  };
}
