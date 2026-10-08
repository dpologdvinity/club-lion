import type { PlayerBase } from "../game.ts";

export type MinigameId =
  | "dj-beat-drop"
  | "river-surf"
  | "extreme-sled"
  | "smoothie-kitchen"
  | "fashion-show"
  | "mango-run"
  | "fruit-catch"
  | "paw-steps"
  | "bee-stop";

export type LeaderboardTier =
  "grandmaster" | "diamond" | "gold" | "silver" | "bronze";

export interface MinigameMeta {
  id: MinigameId;
  name: string;
  category: "rhythm" | "action" | "skill" | "puzzle";
  scoreLabel: string;
  unit: string;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  tier: LeaderboardTier;
  title: string;
  isPlayer?: boolean;
}

export const MINIGAME_METAS: Record<MinigameId, MinigameMeta> = {
  "dj-beat-drop": {
    id: "dj-beat-drop",
    name: "DJ Beat Drop",
    category: "rhythm",
    scoreLabel: "Peak Groove Score",
    unit: "pts",
    description: "Hit the bass drops on the Club Pulse stage.",
  },
  "river-surf": {
    id: "river-surf",
    name: "Canyon River Surf",
    category: "action",
    scoreLabel: "Stunt Combo Score",
    unit: "pts",
    description: "Carve the white water rapids and land air stunts.",
  },
  "extreme-sled": {
    id: "extreme-sled",
    name: "Mt. Mist Sled Run",
    category: "action",
    scoreLabel: "Downhill Distance",
    unit: "m",
    description: "Dodge icy boulders and jump ramps down the alpine slopes.",
  },
  "smoothie-kitchen": {
    id: "smoothie-kitchen",
    name: "Canopy Smoothie Kitchen",
    category: "skill",
    scoreLabel: "Smoothies Blended",
    unit: "served",
    description: "Blend fresh mango and papaya recipes against the timer.",
  },
  "fashion-show": {
    id: "fashion-show",
    name: "Top Models Runway",
    category: "skill",
    scoreLabel: "Catwalk Glam Score",
    unit: "pts",
    description: "Strike fashion poses in time with the spotlight judges.",
  },
  "mango-run": {
    id: "mango-run",
    name: "Mango Target Splash",
    category: "action",
    scoreLabel: "Direct Target Hits",
    unit: "hits",
    description:
      "Lob ballistic mangoes into secret targets across Savanna Square.",
  },
  "fruit-catch": {
    id: "fruit-catch",
    name: "Fruit Catch",
    category: "skill",
    scoreLabel: "Baskets Filled",
    unit: "pts",
    description: "Catch falling baobab fruit before they hit the grass.",
  },
  "paw-steps": {
    id: "paw-steps",
    name: "Paw Steps",
    category: "puzzle",
    scoreLabel: "Memory Sequences",
    unit: "rounds",
    description: "Recall rhythmic paw patterns across the stone tiles.",
  },
  "bee-stop": {
    id: "bee-stop",
    name: "Bee Stop",
    category: "skill",
    scoreLabel: "Reflex Stops",
    unit: "pts",
    description: "Reflex timing challenge in the blooming wildflower meadow.",
  },
};

const SAVANNA_LEGENDS: Record<
  MinigameId,
  { name: string; score: number; title: string }[]
> = {
  "dj-beat-drop": [
    { name: "DJ_Roar", score: 4850, title: "Pulse Resident" },
    { name: "VelvetLioness", score: 4120, title: "Bassline Queen" },
    { name: "NeonWhiskers", score: 3640, title: "Drop Specialist" },
    { name: "SavannaSynth", score: 3100, title: "Track Master" },
    { name: "ManeBeats", score: 2450, title: "Club Regular" },
  ],
  "river-surf": [
    { name: "FringeSurfer", score: 3900, title: "Rapids Ace" },
    { name: "CascadeKing", score: 3450, title: "Wave Carver" },
    { name: "SplashPride", score: 2980, title: "Stunt Rider" },
    { name: "WaterWhisperer", score: 2400, title: "Eddy Jumper" },
    { name: "CurrentCruiser", score: 1850, title: "River Runner" },
  ],
  "extreme-sled": [
    { name: "MistRider", score: 800, title: "Alpine Champion" },
    { name: "SnowPaw", score: 760, title: "Glacier Glider" },
    { name: "FrostTail", score: 710, title: "Slope Daredevil" },
    { name: "IceCrusher", score: 650, title: "Downhill Racer" },
    { name: "PowderProwler", score: 580, title: "Trail Carver" },
  ],
  "smoothie-kitchen": [
    { name: "BaristaBella", score: 42, title: "Master Mixologist" },
    { name: "CanopyChef", score: 36, title: "Papaya Pro" },
    { name: "BlenderBoss", score: 30, title: "Crush Master" },
    { name: "GoldenSip", score: 25, title: "Smoothie Artisan" },
    { name: "CitrusPaw", score: 18, title: "Prep Cook" },
  ],
  "fashion-show": [
    { name: "CatwalkQueen", score: 980, title: "Supermodel" },
    { name: "GildedMane", score: 890, title: "Trendsetter" },
    { name: "VogueLion", score: 820, title: "Haute Couture" },
    { name: "SilkStrut", score: 740, title: "Glam Icon" },
    { name: "RunwayRoyalty", score: 660, title: "Pose Master" },
  ],
  "mango-run": [
    { name: "MangoKing", score: 28, title: "Bullseye Sharp" },
    { name: "SplashShot", score: 24, title: "Ballistics Ace" },
    { name: "ArcadeArc", score: 20, title: "Trick Lobber" },
    { name: "PrideSniper", score: 17, title: "Target Master" },
    { name: "SweetTrajectory", score: 13, title: "Fruit Chucker" },
  ],
  "fruit-catch": [
    { name: "HarvestHero", score: 540, title: "Basket Wizard" },
    { name: "QuickPaws", score: 480, title: "Fruit Catcher" },
    { name: "OrchardPride", score: 420, title: "Tree Shaker" },
    { name: "SavannaGleaner", score: 360, title: "Quick Reflexes" },
    { name: "SunnyGatherer", score: 290, title: "Field Hand" },
  ],
  "paw-steps": [
    { name: "PatternPride", score: 16, title: "Memory Savant" },
    { name: "RhythmPaw", score: 14, title: "Tile Master" },
    { name: "SavannaSteps", score: 12, title: "Dance Sage" },
    { name: "EchoClaw", score: 10, title: "Rhythm Keeper" },
    { name: "StepStalker", score: 8, title: "Path Finder" },
  ],
  "bee-stop": [
    { name: "BlinkMaster", score: 350, title: "Lightning Reflex" },
    { name: "MeadowFox", score: 310, title: "Sting Dodger" },
    { name: "FloralPaw", score: 270, title: "Pollen Watcher" },
    { name: "HoneyWhisper", score: 220, title: "Precision Stopper" },
    { name: "BuzzBuster", score: 180, title: "Garden Guard" },
  ],
};

export function getPlayerScore(gameId: MinigameId, player: PlayerBase): number {
  switch (gameId) {
    case "dj-beat-drop":
      return player.djBeatDropBest ?? 0;
    case "river-surf":
      return player.riverSurfBest ?? 0;
    case "extreme-sled":
      return player.sledRunBest ?? 0;
    case "smoothie-kitchen":
      return player.smoothiesServed ?? 0;
    case "fashion-show":
      return player.fashionBestScore ?? 0;
    case "mango-run":
      return player.mangoRunBest ?? 0;
    case "fruit-catch":
      return player.fruitCatchBest ?? 0;
    case "paw-steps":
      return player.pawStepsBest ?? 0;
    case "bee-stop":
      return player.beeStopBest ?? 0;
    default:
      return 0;
  }
}

export function calculateTier(rank: number): LeaderboardTier {
  if (rank === 1) return "grandmaster";
  if (rank <= 3) return "diamond";
  if (rank <= 6) return "gold";
  if (rank <= 10) return "silver";
  return "bronze";
}

export function getLeaderboardEntries(
  gameId: MinigameId,
  player: PlayerBase,
): LeaderboardEntry[] {
  const legends = SAVANNA_LEGENDS[gameId] || [];
  const playerScore = getPlayerScore(gameId, player);
  const playerName = player.name?.trim() ? player.name : "You";

  const allParticipants = [
    ...legends.map((l) => ({
      name: l.name,
      score: l.score,
      title: l.title,
      isPlayer: false,
    })),
    {
      name: playerName,
      score: playerScore,
      title: playerScore > 0 ? "Pride Challenger" : "Rookie",
      isPlayer: true,
    },
  ];

  // Sort descending by score
  allParticipants.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Player wins tiebreaker if equal
    if (a.isPlayer) return -1;
    if (b.isPlayer) return 1;
    return a.name.localeCompare(b.name);
  });

  return allParticipants.map((entry, index) => {
    const rank = index + 1;
    return {
      rank,
      name: entry.name,
      score: entry.score,
      tier: calculateTier(rank),
      title: entry.title,
      isPlayer: entry.isPlayer,
    };
  });
}

/**
 * Procedural Web Audio arcade synthesizer for leaderboard UI.
 * Zero external audio assets ($0 stack).
 */
export function playLeaderboardSound(
  type: "tab" | "trophy" | "rank_up",
  customCtx?: AudioContext | null,
): void {
  try {
    if (typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = customCtx || new AudioContextClass();
    if (ctx.state === "closed") return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "tab") {
      // Crisp blip chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    } else if (type === "trophy") {
      // Gilded arcade arpeggio
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.07); // E5
      osc.frequency.setValueAtTime(783.99, t + 0.14); // G5
      osc.frequency.setValueAtTime(1046.5, t + 0.21); // C6
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.45);
    } else if (type === "rank_up") {
      // Fanfare power swell
      osc.type = "square";
      osc.frequency.setValueAtTime(440, t); // A4
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    }

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Safe release
      }
    };
  } catch {
    // Ignore audio failures safely
  }
}
