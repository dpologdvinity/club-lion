import { useEffect, useState } from "react";
import {
  calculateTimeOfDayFromLocalTime,
  decodeAutoTime,
  decodeTimeOfDay,
  type TimeOfDay,
} from "./utils/environmentalLighting.ts";

// New keys: older saves stored the clock sync as on, and the game now starts bright.
export const AUTO_TIME_KEY = "clubLion.autoClock";
export const TIME_OF_DAY_KEY = "clubLion.lighting";

function readAutoTime(): boolean {
  try {
    return decodeAutoTime(localStorage.getItem(AUTO_TIME_KEY));
  } catch {
    return false;
  }
}

function readTimeOfDay(autoTime: boolean): TimeOfDay {
  if (autoTime) return calculateTimeOfDayFromLocalTime();
  try {
    return decodeTimeOfDay(localStorage.getItem(TIME_OF_DAY_KEY)) ?? "day";
  } catch {
    return "day";
  }
}

export function useLightingPrefs() {
  const [autoTime, setAutoTime] = useState(readAutoTime);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() =>
    readTimeOfDay(readAutoTime()),
  );
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(AUTO_TIME_KEY, String(autoTime));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [autoTime]);
  useEffect(() => {
    try {
      localStorage.setItem(TIME_OF_DAY_KEY, timeOfDay);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [timeOfDay]);
  useEffect(() => {
    if (!autoTime) return;
    const sync = () => setTimeOfDay(calculateTimeOfDayFromLocalTime());
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, [autoTime]);
  return { autoTime, setAutoTime, timeOfDay, setTimeOfDay, saveError };
}
