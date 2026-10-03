export type PetMood = "happy" | "sleepy" | "bouncy";
export type PetHeading = "left" | "right";

export type PetState = {
  id: string;
  name: string;
  species: "lion";
  color: "gold" | "sand" | "copper" | "rose";
  accessory?: string; // "scarf" | "bandana" | "bell_collar" | "flower"
  position: { x: number; y: number };
  mood: PetMood;
};

export type PetTrailingStep = {
  newPos: { x: number; y: number };
  isTrotting: boolean;
  heading: PetHeading;
};

const TRAIL_OFFSET_X = 35;
const TRAIL_OFFSET_Y = 5;
const TROT_THRESHOLD = 8;

export function computePetTrailingStep(
  currentPetPos: { x: number; y: number },
  targetAvatarPos: { x: number; y: number },
  avatarHeading: PetHeading,
  deltaSeconds: number = 0.016,
  followStiffness: number = 5.0,
): PetTrailingStep {
  const targetX =
    avatarHeading === "right"
      ? targetAvatarPos.x - TRAIL_OFFSET_X
      : targetAvatarPos.x + TRAIL_OFFSET_X;
  const targetY = targetAvatarPos.y + TRAIL_OFFSET_Y;

  const factor = Math.min(1, followStiffness * deltaSeconds);
  const newX = currentPetPos.x + (targetX - currentPetPos.x) * factor;
  const newY = currentPetPos.y + (targetY - currentPetPos.y) * factor;

  const dx = targetX - currentPetPos.x;
  const dy = targetY - currentPetPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return {
    newPos: { x: newX, y: newY },
    isTrotting: distance > TROT_THRESHOLD,
    heading: avatarHeading,
  };
}
