import { useEffect, useState } from "react";
import { migratePlayerSave, SAVE_KEY, type PlayerV2 } from "./game";

function loadPlayer(raw: string | null): PlayerV2 {
  try {
    return migratePlayerSave(raw ? JSON.parse(raw) : null);
  } catch {
    return migratePlayerSave(null);
  }
}

export function usePlayer() {
  const [player, setPlayer] = useState<PlayerV2>(() => {
    try {
      return loadPlayer(localStorage.getItem(SAVE_KEY));
    } catch {
      return loadPlayer(null);
    }
  });
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
  }, []);
  return { player, setPlayer, saveError };
}
