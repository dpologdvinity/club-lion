import type { RoomManifest } from "./types.ts";
import { FANTAGE_GAMES } from "../games/fantage.ts";

/** The game cabinets standing in a room, like Fantage's games around town. */
export function gameCabinets(room: string): RoomManifest["interactives"] {
  return FANTAGE_GAMES.filter((game) => game.room === room).map((game) => ({
    id: `fg-${game.id}`,
    label: game.name,
    icon: game.icon,
    type: "game_launch",
    position: game.spot,
    actionData: { gameId: game.id },
    object: { kind: "cabinet", width: 110, height: 170 },
  }));
}
