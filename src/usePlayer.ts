import { useEffect, useState } from "react";
import { restorePlayer, SAVE_KEY, type Player } from "./game";

export function usePlayer() {
  const [player, setPlayer] = useState<Player>(() => {
    try {
      return restorePlayer(localStorage.getItem(SAVE_KEY));
    } catch {
      return restorePlayer(null);
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
      if (event.key === SAVE_KEY) setPlayer(restorePlayer(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return { player, setPlayer, saveError };
}
