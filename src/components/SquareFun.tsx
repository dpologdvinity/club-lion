import { useEffect, useRef, useState } from "react";
import {
  BUTTERFLY_COUNT,
  BUTTERFLY_SPOTS,
  butterfliesForDay,
  nextWeather,
  type Weather,
} from "../utils/squareFun.ts";
import { playPropSound } from "../utils/interactiveProps.ts";
import "./squareFun.css";

const WEATHER_WORDS: Record<Weather, string> = {
  sunny: "Sunshine!",
  rain: "Rain! Splash in the puddles!",
  rainbow: "A rainbow!",
  snow: "Snow!",
};
const WEATHER_ICONS: Record<Weather, string> = {
  sunny: "☀️",
  rain: "🌧️",
  rainbow: "🌈",
  snow: "❄️",
};

/** Savanna Square's weather toy and daily butterfly hunt, drawn in stage units. */
export function SquareFun({
  found,
  day,
  sound,
  onFind,
  onSay,
}: {
  found: number[];
  day: string;
  sound: boolean;
  onFind: (spot: number) => void;
  onSay: (message: string) => void;
}) {
  const [weather, setWeather] = useState<Weather>("sunny");
  // Confetti only for the find that completes the hunt, then it clears.
  const [celebrating, setCelebrating] = useState(false);
  const party = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(party.current), []);
  const hiding = butterfliesForDay(day).filter((spot) => !found.includes(spot));
  const done = found.length >= BUTTERFLY_COUNT;
  return (
    <>
      <div className={`square-weather weather-${weather}`} aria-hidden="true" />
      <button
        type="button"
        className="square-weather-toy"
        style={{ left: 640, top: 650 }}
        aria-label="Change the weather"
        onClick={() => {
          const next = nextWeather(weather);
          setWeather(next);
          if (next === "rain")
            playPropSound("bubble", sound ? undefined : null);
          onSay(WEATHER_WORDS[next]);
        }}
      >
        <span aria-hidden="true">{WEATHER_ICONS[weather]}</span>
      </button>
      {hiding.map((spot) => (
        <button
          key={spot}
          type="button"
          className="square-butterfly"
          style={{
            left: BUTTERFLY_SPOTS[spot].x,
            top: BUTTERFLY_SPOTS[spot].y,
          }}
          aria-label="Butterfly"
          onClick={() => {
            onFind(spot);
            const last = found.length + 1 >= BUTTERFLY_COUNT;
            onSay(
              last
                ? "All five butterflies! Party time!"
                : "You found a butterfly!",
            );
            if (last) {
              setCelebrating(true);
              window.clearTimeout(party.current);
              party.current = window.setTimeout(
                () => setCelebrating(false),
                3000,
              );
            }
          }}
        >
          <span aria-hidden="true">🦋</span>
        </button>
      ))}
      <div
        className={`square-jar${done ? " is-full" : ""}`}
        style={{ left: 768, top: 400 }}
        role="status"
        aria-label={`Butterflies found: ${found.length} of ${BUTTERFLY_COUNT}`}
      >
        <span aria-hidden="true">🫙🦋</span> {found.length}/{BUTTERFLY_COUNT}
      </div>
      {celebrating && <div className="square-confetti" aria-hidden="true" />}
    </>
  );
}
