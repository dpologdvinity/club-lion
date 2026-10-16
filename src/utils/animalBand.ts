/**
 * Animal Orchestra rules with no React or DOM dependency: the six animal
 * instruments, the short song recorder, and the burst cadence.
 */

export const ANIMALS = [
  { id: "lion", label: "Lion" },
  { id: "zebra", label: "Zebra" },
  { id: "giraffe", label: "Giraffe" },
  { id: "hippo", label: "Hippo" },
  { id: "monkey", label: "Monkey" },
  { id: "parrot", label: "Parrot" },
] as const;
export type AnimalId = (typeof ANIMALS)[number]["id"];

/** A song is at most this many taps long. */
export const SONG_MAX_TAPS = 10;
/** Every fifth tap bursts into hearts and stars. */
export const BURST_EVERY = 5;

/** Appends one tap to a song; a full song stays as it is. */
export function addToSong(
  song: readonly AnimalId[],
  animal: AnimalId,
): AnimalId[] {
  return song.length >= SONG_MAX_TAPS ? [...song] : [...song, animal];
}

/** True for the fifth, tenth, fifteenth… tap of a session (1-based count). */
export function isBurstTap(tapCount: number): boolean {
  return tapCount > 0 && tapCount % BURST_EVERY === 0;
}
