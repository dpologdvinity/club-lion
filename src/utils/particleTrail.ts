export type SparkleParticle = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
};

const BOARD_PALETTES: Record<string, string[]> = {
  hover_leaf: ["#4ade80", "#22c55e", "#86efac"],
  star_cruiser: ["#fbbf24", "#f59e0b", "#fef08a"],
  neon_pulse: ["#22d3ee", "#06b6d4", "#67e8f9"],
};
const DEFAULT_PALETTE = ["#c084fc", "#a855f7"];

const MIN_LIFE_MS = 400;
const MAX_LIFE_MS = 600;
const MIN_SIZE = 2;
const MAX_SIZE = 5;
const DRIFT_SPEED = 20;

let spawnCounter = 0;

function paletteFor(boardId: string | undefined): string[] {
  return (boardId && BOARD_PALETTES[boardId]) || DEFAULT_PALETTE;
}

function spawnParticle(
  pos: { x: number; y: number },
  boardId: string | undefined,
): SparkleParticle {
  const palette = paletteFor(boardId);
  const color = palette[Math.floor(Math.random() * palette.length)];
  const maxLife = MIN_LIFE_MS + Math.random() * (MAX_LIFE_MS - MIN_LIFE_MS);
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2);
  const speed = DRIFT_SPEED * (0.5 + Math.random() * 0.5);
  spawnCounter += 1;
  return {
    id: `sparkle-${Date.now()}-${spawnCounter}`,
    x: pos.x,
    y: pos.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color,
    size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
    alpha: 1,
    life: maxLife,
    maxLife,
  };
}

export function generateSparkleStep(
  prevParticles: SparkleParticle[],
  currentPos: { x: number; y: number },
  isMoving: boolean,
  boardId: string | undefined,
  deltaMs: number,
): SparkleParticle[] {
  const deltaSeconds = deltaMs / 1000;
  const updated = prevParticles
    .map((p) => {
      const life = p.life - deltaMs;
      return {
        ...p,
        x: p.x + p.vx * deltaSeconds,
        y: p.y + p.vy * deltaSeconds,
        life,
        alpha: Math.max(0, life / p.maxLife),
      };
    })
    .filter((p) => p.life > 0);

  if (isMoving) {
    updated.push(spawnParticle(currentPos, boardId));
  }

  return updated;
}
