import type { PlayerV2 } from "../game.ts";

/** Arcade cards in display order, with progress from the current save. */
export function gameCards(player: PlayerV2) {
  return [
    {
      id: "mango-run",
      name: "Mango Run",
      art: "🦁 🥭 🌴",
      description: "Run down the trail and grab mangoes. Bumps just bounce.",
      reward: "Stop whenever you like to keep your best run",
      best: player.mangoRunBest ?? 0,
      progressLabel: "Best",
    },
    {
      id: "bubble-pop",
      name: "Bubble Pop",
      art: "🫧 🦁 ⭐",
      description: "Pop floating bubbles to free the surprises inside.",
      reward: "Challenge mode scores your best pops",
      best: player.bubblePopBest ?? 0,
      progressLabel: "Best",
    },
    {
      id: "coloring-book",
      name: "Coloring Book",
      art: "🖍️ 🐉 🎡",
      description: "Tap to fill six pages. There is no wrong color.",
      reward: "Finish a page for a stamp",
      best: 0,
      progressLabel: "Best",
    },
    {
      id: "bakery",
      name: "Mango Bakery",
      art: "🎂 🥭 🕯️",
      description: "Bake, decorate and serve cakes to animal friends.",
      reward: "Earn up to 3 stars per cake",
      best: player.cakesServed ?? 0,
      progressLabel: "Orders served",
    },
    {
      id: "seek",
      name: "Hide & Seek Safari",
      art: "🔍 🦓 🌿",
      description: "Spot the animals hiding in the scene.",
      reward: "Earn a stamp for every place you find",
      best: player.seekRounds ?? 0,
      progressLabel: "Rounds found",
    },
    {
      id: "animal-band",
      name: "Animal Orchestra",
      art: "🦁 🦓 🦒",
      description: "Tap an animal to play its sound. Record a tiny song.",
      reward: "Play your song back to hear the band",
      best: player.animalBandSongs ?? 0,
      progressLabel: "Songs played",
    },
    {
      id: "shape-sorter",
      name: "Shape Sorter Safari",
      art: "🔺 ⭕ 🟦",
      description: "Drop each shape into the animal it fits.",
      reward: "Win a round, earn a star stamp",
      best: player.shapeSorterRounds ?? 0,
      progressLabel: "Rounds sorted",
    },
    {
      id: "picture-puzzle",
      name: "Picture Puzzle",
      art: "🧩 🦁 🎡",
      description: "Drag each piece to its spot. Big pictures, big pieces.",
      reward: "Finish a picture, earn a star stamp",
      best: player.picturePuzzles ?? 0,
      progressLabel: "Pictures finished",
    },
    {
      id: "balloon-parade",
      name: "Balloon Parade",
      art: "🎈 🌈 🎈",
      description: "Pop the balloons. Pop them in rainbow order for an arch.",
      reward: "Build a rainbow arch for a stamp",
      best: player.balloonRainbows ?? 0,
      progressLabel: "Rainbows built",
    },
    {
      id: "dj-beat-drop",
      name: "DJ Beat Drop",
      art: "🎧 🎵 🦁",
      description: "Match four lanes to the beat.",
      reward: "Keep the beat going",
      best: player.djBeatDropBest ?? 0,
      progressLabel: "Best",
    },
    {
      id: "smoothie",
      name: "Smoothie Kitchen",
      art: "🥭 🥥 🧊",
      description: "Follow café recipes, blend and serve.",
      reward: "Earn up to 3 stars per order",
      best: player.smoothiesServed ?? 0,
      progressLabel: "Orders served",
    },
    {
      id: "coaster",
      name: "Savanna Screamer",
      art: "🎢 🦁 🎡",
      description: "Ride the loop and keep a local souvenir.",
      reward: "A scenic ride",
      best: 0,
      progressLabel: "Best",
    },
    {
      id: "fishing",
      name: "Waterhole Angler",
      art: "🎣 🐟 🌊",
      description: "Cast your line, reel in exotic fish.",
      reward: "Catch rare fish for your collection",
      best: player.fishCaughtCount ?? 0,
      progressLabel: "Best",
    },
    {
      id: "runway",
      name: "Top Models Runway",
      art: "💃 📸 👑",
      description: "30s styling challenge on the catwalk.",
      reward: "Earn up to 3 stars on the runway",
      best: player.fashionBestScore ?? 0,
      progressLabel: "Best",
    },
    {
      id: "instrument",
      name: "World Instruments",
      art: "🎹 🥁 🎶",
      description: "Play procedural piano, marimba, and drums.",
      reward: "Harmonic jam mode · procedural audio",
      best: 0,
      progressLabel: "Best",
    },
  ] as const;
}

export type GameId =
  | ReturnType<typeof gameCards>[number]["id"]
  | "memory"
  | "bee"
  | "paw"
  | "fruit"
  | "sled-run";
