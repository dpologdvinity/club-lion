export const SEEK_SCENES = ["savanna", "beach", "jungle"] as const;
export type SeekSceneId = (typeof SEEK_SCENES)[number];

export type SeekCover = "bush" | "rock" | "leaf" | "wave" | "trunk" | "sand";
/**
 * A hiding place in percent of the scene; `cover` is drawn over the animal.
 * Spots sit in six columns, two per column, so 56px touch targets never overlap on phones.
 */
export type SeekSpot = { x: number; y: number; cover: SeekCover };
export type SeekCritter = { id: string; emoji: string; name: string };

export type SeekScene = {
  id: SeekSceneId;
  name: string;
  critters: SeekCritter[];
  spots: SeekSpot[];
};

export const SEEK_TARGETS_PER_ROUND = 5;
export const SEEK_DECOYS_HARD = 4;
export const SEEK_COINS_EASY = 10;
export const SEEK_COINS_HARD = 20;
export const SEEK_HINT_MS = 5000;
export const SEEK_MAX_TIME_MS = 60 * 60 * 1000;

export const SEEK_STAMPS: Record<SeekSceneId, string> = {
  savanna: "seek_savanna",
  beach: "seek_beach",
  jungle: "seek_jungle",
};

export const SEEK_SCENE_LIST: SeekScene[] = [
  {
    id: "savanna",
    name: "Savanna",
    critters: [
      { id: "lion", emoji: "🦁", name: "Lion" },
      { id: "zebra", emoji: "🦓", name: "Zebra" },
      { id: "giraffe", emoji: "🦒", name: "Giraffe" },
      { id: "elephant", emoji: "🐘", name: "Elephant" },
      { id: "hippo", emoji: "🦛", name: "Hippo" },
      { id: "rhino", emoji: "🦏", name: "Rhino" },
      { id: "leopard", emoji: "🐆", name: "Leopard" },
      { id: "warthog", emoji: "🐗", name: "Warthog" },
      { id: "butterfly", emoji: "🦋", name: "Butterfly" },
      { id: "flower", emoji: "🌼", name: "Flower" },
    ],
    spots: [
      { x: 8, y: 52, cover: "trunk" },
      { x: 25, y: 58, cover: "bush" },
      { x: 42, y: 49, cover: "rock" },
      { x: 59, y: 57, cover: "bush" },
      { x: 76, y: 50, cover: "rock" },
      { x: 93, y: 55, cover: "trunk" },
      { x: 8, y: 80, cover: "rock" },
      { x: 25, y: 86, cover: "bush" },
      { x: 42, y: 77, cover: "bush" },
      { x: 59, y: 85, cover: "rock" },
      { x: 76, y: 78, cover: "bush" },
      { x: 93, y: 83, cover: "rock" },
    ],
  },
  {
    id: "beach",
    name: "Beach",
    critters: [
      { id: "crab", emoji: "🦀", name: "Crab" },
      { id: "turtle", emoji: "🐢", name: "Turtle" },
      { id: "fish", emoji: "🐠", name: "Fish" },
      { id: "octopus", emoji: "🐙", name: "Octopus" },
      { id: "shell", emoji: "🐚", name: "Shell" },
      { id: "dolphin", emoji: "🐬", name: "Dolphin" },
      { id: "seal", emoji: "🦭", name: "Seal" },
      { id: "starfish", emoji: "⭐", name: "Starfish" },
      { id: "flamingo", emoji: "🦩", name: "Flamingo" },
      { id: "ball", emoji: "🏐", name: "Beach ball" },
    ],
    spots: [
      { x: 8, y: 46, cover: "wave" },
      { x: 25, y: 52, cover: "wave" },
      { x: 42, y: 43, cover: "wave" },
      { x: 59, y: 51, cover: "wave" },
      { x: 76, y: 44, cover: "wave" },
      { x: 93, y: 49, cover: "trunk" },
      { x: 8, y: 78, cover: "sand" },
      { x: 25, y: 84, cover: "rock" },
      { x: 42, y: 75, cover: "sand" },
      { x: 59, y: 83, cover: "rock" },
      { x: 76, y: 76, cover: "sand" },
      { x: 93, y: 81, cover: "rock" },
    ],
  },
  {
    id: "jungle",
    name: "Jungle",
    critters: [
      { id: "monkey", emoji: "🐒", name: "Monkey" },
      { id: "parrot", emoji: "🦜", name: "Parrot" },
      { id: "frog", emoji: "🐸", name: "Frog" },
      { id: "snake", emoji: "🐍", name: "Snake" },
      { id: "tiger", emoji: "🐅", name: "Tiger" },
      { id: "sloth", emoji: "🦥", name: "Sloth" },
      { id: "gorilla", emoji: "🦍", name: "Gorilla" },
      { id: "toucan", emoji: "🐦", name: "Bird" },
      { id: "banana", emoji: "🍌", name: "Banana" },
      { id: "ladybug", emoji: "🐞", name: "Ladybug" },
    ],
    spots: [
      { x: 8, y: 32, cover: "leaf" },
      { x: 25, y: 38, cover: "leaf" },
      { x: 42, y: 29, cover: "leaf" },
      { x: 59, y: 37, cover: "leaf" },
      { x: 76, y: 30, cover: "leaf" },
      { x: 93, y: 35, cover: "leaf" },
      { x: 8, y: 64, cover: "trunk" },
      { x: 25, y: 70, cover: "leaf" },
      { x: 42, y: 61, cover: "bush" },
      { x: 59, y: 69, cover: "trunk" },
      { x: 76, y: 62, cover: "leaf" },
      { x: 93, y: 67, cover: "bush" },
    ],
  },
];

export type SeekPlacement = SeekSpot & {
  critter: SeekCritter;
  /** Visual size in percent of the scene width. */
  size: number;
  decoy: boolean;
};

export type SeekRound = {
  scene: SeekSceneId;
  hard: boolean;
  /** Find order; the first unfound one is shown on the picture card. */
  targets: SeekPlacement[];
  decoys: SeekPlacement[];
};

export function getSeekScene(id: SeekSceneId): SeekScene {
  return SEEK_SCENE_LIST.find((scene) => scene.id === id) ?? SEEK_SCENE_LIST[0];
}

function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks five different critters, each in its own hiding spot. Easy rounds are
 * big with nothing else around; hard rounds are smaller and add decoys.
 */
export function planSeekRound(
  sceneId: SeekSceneId,
  hard: boolean,
  random: () => number = Math.random,
): SeekRound {
  const scene = getSeekScene(sceneId);
  const critters = shuffle(scene.critters, random);
  const spots = shuffle(scene.spots, random);
  const size = hard ? 7 : 12;
  const place = (index: number, decoy: boolean): SeekPlacement => ({
    ...spots[index],
    critter: critters[index],
    size,
    decoy,
  });
  const targets = Array.from({ length: SEEK_TARGETS_PER_ROUND }, (_, i) =>
    place(i, false),
  );
  const decoys = hard
    ? Array.from({ length: SEEK_DECOYS_HARD }, (_, i) =>
        place(SEEK_TARGETS_PER_ROUND + i, true),
      )
    : [];
  return { scene: scene.id, hard, targets, decoys };
}

export function seekRoundCoins(hard: boolean): number {
  return hard ? SEEK_COINS_HARD : SEEK_COINS_EASY;
}

export function isSeekScene(value: unknown): value is SeekSceneId {
  return SEEK_SCENES.some((scene) => scene === value);
}
