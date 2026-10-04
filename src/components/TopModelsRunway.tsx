import { useEffect, useRef, useState, useId } from "react";
import { Sparkles, Trophy, Camera, Clock, X, Shirt, Star } from "lucide-react";
import {
  FASHION_THEMES,
  scoreOutfit,
  type FashionTheme,
  type ScoredOutfit,
} from "../utils/fashionScoring.ts";

export type TopModelsRunwayProps = {
  ownedItems: string[];
  onComplete: (result: {
    themeId: string;
    score: number;
    stars: number;
    coins: number;
  }) => void;
  onClose: () => void;
};

type Stage = "reveal" | "styling" | "catwalk" | "verdict";

const THEME_KEYS: FashionTheme[] = [
  "savanna_chic",
  "y2k_retro",
  "neon_nightlife",
  "beach_resort",
];

const AVAILABLE_CLOTHES = [
  { id: "wreath-gold", name: "Golden Mane Wreath", emoji: "🌿" },
  { id: "visor-neon", name: "Retro Neon Visor", emoji: "⚡" },
  { id: "hat-pirate", name: "Pirate Bicorne", emoji: "🏴‍☠️" },
  { id: "crown-lion", name: "Savanna Royal Crown", emoji: "👑" },
  { id: "apron-barista", name: "Barista Apron", emoji: "☕" },
  { id: "jacket-leather", name: "VIP Leather Jacket", emoji: "🧥" },
  { id: "tunic-savanna", name: "Savanna Gold Tunic", emoji: "👘" },
  { id: "hoodie-neon", name: "Neon Cyber Hoodie", emoji: "🥷" },
  { id: "shirt-floral", name: "Tropical Floral Shirt", emoji: "🌺" },
  { id: "board-leaf", name: "Hover Leaf Board", emoji: "🍃" },
  { id: "board-pulse", name: "Neon Pulse Board", emoji: "🛹" },
  { id: "board-star", name: "Solar Star Cruiser", emoji: "⭐" },
];

function playSound(type: "tick" | "flash" | "cheer") {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "tick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "flash") {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 4000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (type === "cheer") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    }
  } catch {
    // Gracefully ignore audio failures
  }
}

export function TopModelsRunway({
  ownedItems,
  onComplete,
  onClose,
}: TopModelsRunwayProps) {
  const [themeIndex, setThemeIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("reveal");
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [result, setResult] = useState<ScoredOutfit | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const activeTheme =
    FASHION_THEMES[THEME_KEYS[themeIndex % THEME_KEYS.length]];

  // Keyboard navigation & Escape handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus dialog on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // 30s Countdown timer during styling stage
  useEffect(() => {
    if (stage !== "styling") return;
    if (timeLeft <= 0) {
      handleWalkRunway();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) playSound("tick");
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  // Catwalk animation sequence
  useEffect(() => {
    if (stage !== "catwalk") return;

    playSound("flash");
    setFlashActive(true);

    const flashTimer = setTimeout(() => {
      setFlashActive(false);
      playSound("cheer");
    }, 800);

    const finishTimer = setTimeout(() => {
      const outcome = scoreOutfit(activeTheme.id, selectedItems);
      setResult(outcome);
      setStage("verdict");
      onComplete({
        themeId: activeTheme.id,
        score: outcome.score,
        stars: outcome.stars,
        coins: outcome.coins,
      });
    }, 2200);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(finishTimer);
    };
  }, [stage]);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleStartStyling = () => {
    setTimeLeft(30);
    setStage("styling");
  };

  const handleWalkRunway = () => {
    setStage("catwalk");
  };

  const handleResetGame = () => {
    setThemeIndex((prev) => prev + 1);
    setSelectedItems([]);
    setResult(null);
    setStage("reveal");
  };

  return (
    <div className="top-models-backdrop">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="top-models-dialog"
      >
        <div className="top-models-header">
          <div className="top-models-title-row">
            <Trophy className="top-models-trophy-icon" aria-hidden="true" />
            <h2 id={titleId}>Top Models Fashion Show</h2>
          </div>
          <button
            type="button"
            className="top-models-close"
            onClick={onClose}
            aria-label="Close Top Models Runway"
          >
            <X size={20} />
          </button>
        </div>

        {stage === "reveal" && (
          <div className="runway-stage-reveal">
            <div className="theme-banner">
              <span className="theme-tagline">
                Tonight&apos;s Challenge Theme:
              </span>
              <h3 className="theme-name">{activeTheme.name}</h3>
              <p className="theme-desc">{activeTheme.description}</p>
            </div>
            <div className="theme-hints">
              <p>
                <strong>Preferred Style Tags:</strong>{" "}
                {activeTheme.preferredTags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    #{tag}
                  </span>
                ))}
              </p>
              <p className="timer-notice">
                <Clock size={16} /> You will have 30 seconds to style your
                outfit.
              </p>
            </div>
            <button
              type="button"
              className="action-button primary-action"
              onClick={handleStartStyling}
            >
              Start Styling Now!
            </button>
          </div>
        )}

        {stage === "styling" && (
          <div className="runway-stage-styling">
            <div className="styling-bar">
              <div className="theme-indicator">
                Theme: <strong>{activeTheme.name}</strong>
              </div>
              <div
                className={`countdown-clock ${timeLeft <= 5 ? "urgent" : ""}`}
              >
                <Clock size={18} /> {timeLeft}s remaining
              </div>
            </div>

            <p className="closet-instruction">
              Select pieces from the wardrobe to craft your runway look:
            </p>

            <div className="runway-closet-grid">
              {AVAILABLE_CLOTHES.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`closet-card ${isSelected ? "selected" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <span className="closet-emoji">{item.emoji}</span>
                    <span className="closet-name">{item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="styling-footer">
              <span className="pieces-count">
                <Shirt size={16} /> {selectedItems.length} items styled
              </span>
              <button
                type="button"
                className="action-button primary-action"
                onClick={handleWalkRunway}
              >
                Walk the Runway! 💃
              </button>
            </div>
          </div>
        )}

        {stage === "catwalk" && (
          <div className="runway-stage-catwalk">
            <div
              className={`spotlight-arena ${flashActive ? "flash-bang" : ""}`}
            >
              <div className="runway-catwalk-avatar">
                <div className="catwalk-strut">
                  <span className="catwalk-lion">🦁✨</span>
                </div>
              </div>
              <div className="flashbulbs-container">
                <Camera size={28} className="flash-camera" />
                <span className="flash-text">📸 FLASH! 📸</span>
              </div>
            </div>
            <p className="catwalk-caption">
              Strutting the catwalk for the judges... Strike a pose!
            </p>
          </div>
        )}

        {stage === "verdict" && result && (
          <div className="runway-stage-verdict">
            <div className="verdict-card">
              <div className="verdict-stars">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={36}
                    className={`verdict-star ${star <= result.stars ? "star-earned" : "star-empty"}`}
                    fill={star <= result.stars ? "#ffd700" : "none"}
                  />
                ))}
              </div>
              <div className="verdict-score">
                Score: <strong>{result.score} / 100</strong>
              </div>
              <p className="verdict-feedback">
                &ldquo;{result.feedback}&rdquo;
              </p>
              <div className="verdict-reward">
                <Sparkles size={20} /> Won:{" "}
                <strong>+{result.coins} Coins!</strong>
              </div>
            </div>

            <div className="verdict-actions">
              <button
                type="button"
                className="action-button secondary-action"
                onClick={handleResetGame}
              >
                Try Another Theme
              </button>
              <button
                type="button"
                className="action-button primary-action"
                onClick={onClose}
              >
                Collect &amp; Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
