import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import { CONSTELLATIONS } from "../../utils/staries.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "drawn" | "done";

/** Join the numbered stars in order to draw a picture in the night sky. */
export function Staries({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [picture, setPicture] = useState(0);
  const [joined, setJoined] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const sky = CONSTELLATIONS[picture];

  const start = () => {
    paid.current = false;
    setPicture(0);
    setJoined(0);
    setPhase("play");
    setAnnouncement("Tap star 1, then star 2, and so on!");
  };

  const next = () => {
    if (picture + 1 >= CONSTELLATIONS.length) {
      setPhase("done");
      setAnnouncement("You drew every star picture!");
      if (!paid.current) {
        paid.current = true;
        onFinish(CONSTELLATIONS.length);
      }
      return;
    }
    setPicture(picture + 1);
    setJoined(0);
    setPhase("play");
  };

  const tap = (index: number) => {
    if (phase !== "play") return;
    if (index !== joined) {
      playCuteSound("boing");
      setAnnouncement(`Find star ${joined + 1}.`);
      return;
    }
    playCuteSound("pop");
    const count = joined + 1;
    setJoined(count);
    if (count === sky.stars.length) {
      playCuteSound("yay");
      setPhase("drawn");
      setAnnouncement(`A ${sky.name.toLowerCase()}! ${sky.emoji}`);
    }
  };

  // The finished picture closes its loop back to the first star.
  const path = sky.stars
    .slice(0, joined)
    .map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`)
    .join("");
  const closed = phase === "drawn" || phase === "done";

  return (
    <div className="fg-game staries-game">
      <p
        className="fg-hud"
        aria-label={`Picture ${picture + 1} of ${CONSTELLATIONS.length}`}
      >
        🌙 {picture + 1}/{CONSTELLATIONS.length}
      </p>
      <div className="fg-board staries-sky">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path
            d={`${path}${closed ? "Z" : ""}`}
            fill={closed ? "#ffe36a33" : "none"}
            stroke="#ffe36a"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {sky.stars.map(([x, y], index) => (
          <button
            key={`${picture}-${index}`}
            type="button"
            className={`staries-star${index < joined ? " is-joined" : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`Star ${index + 1}`}
            disabled={phase !== "play"}
            onClick={() => tap(index)}
          >
            <span aria-hidden="true">{index + 1}</span>
          </button>
        ))}
        {phase === "drawn" && (
          <div className="fg-overlay staries-drawn">
            <p className="fg-result">{sky.emoji}</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label="Next picture"
              onClick={next}
            >
              <Play size={34} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        )}
        {(phase === "ready" || phase === "done") && (
          <div className="fg-overlay">
            {phase === "done" && (
              <p className="fg-result">
                {CONSTELLATIONS.map((c) => c.emoji).join(" ")}
              </p>
            )}
            <p className="fg-hint">
              Join the stars from 1 upward to draw a picture!
            </p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={phase === "done" ? "Play again" : "Start Staries"}
              onClick={start}
            >
              {phase === "done" ? (
                <RotateCcw size={34} aria-hidden="true" />
              ) : (
                <Play size={34} fill="currentColor" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
