import { useCallback, useEffect, useState, type SetStateAction } from "react";
import {
  migratePlayerSave,
  unlockStamp,
  SAVE_KEY,
  type PlayerV2,
} from "./game";

import { evaluateStampUnlocks } from "./utils/stampDefinitions";

function collectStamps(player: PlayerV2): PlayerV2 {
  return evaluateStampUnlocks(player).reduce(unlockStamp<PlayerV2>, player);
}

function loadPlayer(raw: string | null): PlayerV2 {
  try {
    return collectStamps(migratePlayerSave(raw ? JSON.parse(raw) : null));
  } catch {
    return migratePlayerSave(null);
  }
}

export function usePlayer() {
  const [player, updatePlayer] = useState<PlayerV2>(() => {
    try {
      return loadPlayer(localStorage.getItem(SAVE_KEY));
    } catch {
      return loadPlayer(null);
    }
  });
  const setPlayer = useCallback((action: SetStateAction<PlayerV2>) => {
    updatePlayer((current) =>
      collectStamps(typeof action === "function" ? action(current) : action),
    );
  }, []);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(player));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [player]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === SAVE_KEY) setPlayer(loadPlayer(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [setPlayer]);
  return { player, setPlayer, saveError };
}
