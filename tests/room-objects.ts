import type { Page } from "@playwright/test";
import { FANTAGE_GAMES } from "../src/games/fantage";

const GAME_NAMES = FANTAGE_GAMES.map((game) => game.name);

/** Room objects other than the scattered game machines. */
export function roomToys(page: Page) {
  return page
    .locator(".room-object")
    .evaluateAll(
      (nodes, names) =>
        nodes.filter(
          (node) => !names.includes(node.getAttribute("aria-label") ?? ""),
        ).length,
      GAME_NAMES,
    );
}
