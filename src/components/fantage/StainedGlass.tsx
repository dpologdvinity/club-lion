import { useRef, useState } from "react";
import { Check, Play, RotateCcw } from "lucide-react";
import { playCuteSound } from "../../utils/cuteSfx.ts";
import { GLASS_COLORS, WINDOWS } from "../../utils/stainedGlass.ts";
import type { FantageGameProps } from "./registry";
import "./fantageGames.css";

type Phase = "ready" | "play" | "done";

/** Pick a colour and tap each pane until the whole window glows. */
export function StainedGlass({ onFinish }: FantageGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [window_, setWindow] = useState(0);
  const [color, setColor] = useState<string>(GLASS_COLORS[0].hex);
  const [fills, setFills] = useState<(string | null)[]>(() =>
    WINDOWS[0].panes.map(() => null),
  );
  const [announcement, setAnnouncement] = useState("");
  const paid = useRef(false);
  const glass = WINDOWS[window_];
  const full = fills.every(Boolean);

  const start = () => {
    paid.current = false;
    setWindow(0);
    setFills(WINDOWS[0].panes.map(() => null));
    setPhase("play");
    setAnnouncement("Pick a colour, then tap a pane!");
  };

  const fill = (index: number) => {
    if (phase !== "play") return;
    playCuteSound("pop");
    setFills((all) => all.map((c, i) => (i === index ? color : c)));
  };

  const next = () => {
    if (!full) return;
    playCuteSound("yay");
    if (window_ + 1 >= WINDOWS.length) {
      setPhase("done");
      setAnnouncement("Every window is glowing!");
      if (!paid.current) {
        paid.current = true;
        onFinish(WINDOWS.length);
      }
      return;
    }
    setWindow(window_ + 1);
    setFills(WINDOWS[window_ + 1].panes.map(() => null));
    setAnnouncement(
      `On to the ${WINDOWS[window_ + 1].name.toLowerCase()} window!`,
    );
  };

  return (
    <div className="fg-game glass-game">
      <p
        className="fg-hud"
        aria-label={`Window ${window_ + 1} of ${WINDOWS.length}`}
      >
        🪟 {window_ + 1}/{WINDOWS.length}
      </p>
      <div className="fg-board glass-frame">
        <svg viewBox="0 0 100 120" className="glass-window">
          <path
            d="M6 118V40Q6 4 50 4Q94 4 94 40V118Z"
            fill="#e8f4ff"
            stroke="#4a3a2a"
            strokeWidth="3"
          />
          {glass.panes.map((d, index) => (
            <path
              key={`${window_}-${index}`}
              d={d}
              role="button"
              tabIndex={phase === "play" ? 0 : -1}
              aria-label={`Pane ${index + 1}${fills[index] ? ", coloured" : ""}`}
              className="glass-pane"
              fill={fills[index] ?? "#ffffff"}
              stroke="#4a3a2a"
              strokeWidth="2"
              onClick={() => fill(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fill(index);
                }
              }}
            />
          ))}
        </svg>
        {phase !== "play" && (
          <div className="fg-overlay">
            {phase === "done" && <p className="fg-result">🪟 🌈</p>}
            <p className="fg-hint">Pick a colour and fill every pane!</p>
            <button
              type="button"
              className="fg-start"
              autoFocus
              aria-label={
                phase === "done" ? "Play again" : "Start Stained Glass"
              }
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
      <div className="glass-palette" role="group" aria-label="Colours">
        {GLASS_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`glass-swatch${color === c.hex ? " selected" : ""}`}
            style={{ background: c.hex }}
            aria-label={c.label}
            aria-pressed={color === c.hex}
            disabled={phase !== "play"}
            onClick={() => setColor(c.hex)}
          />
        ))}
        <button
          type="button"
          className="fg-start glass-done"
          aria-label="Window done"
          disabled={phase !== "play" || !full}
          onClick={next}
        >
          <Check size={34} aria-hidden="true" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
