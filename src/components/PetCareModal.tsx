import { useState, useEffect, useRef } from "react";
import { Dialog } from "./Dialog.tsx";
import type { PetCareState, CareAction } from "../utils/petCare.ts";
import {
  performPetCare,
  isPetFullyPampered,
  playPetSound,
} from "../utils/petCare.ts";
import { Heart, Sparkles } from "lucide-react";
import { Lion } from "./Lion.tsx";
import type { LionColor } from "../game.ts";

export type PetCareModalProps = {
  lionColor: LionColor;
  lionAccessory: string;
  petCare: PetCareState;
  onCare: (action: CareAction) => void;
  onClose: () => void;
};

const CARE_ACTIONS = [
  { action: "wash" as const, label: "Wash", icon: "🧼" },
  { action: "brush" as const, label: "Brush", icon: "✨" },
  { action: "feed" as const, label: "Treat", icon: "🍯" },
  { action: "play" as const, label: "Play", icon: "🧶" },
] as const;

export function PetCareModal({
  lionColor,
  lionAccessory,
  petCare,
  onCare,
  onClose,
}: PetCareModalProps) {
  const [effectType, setEffectType] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const effectTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(effectTimer.current), []);

  const handleCareAction = (action: CareAction) => {
    const result = performPetCare(petCare, action);
    const newlyPampered =
      !isPetFullyPampered(petCare) && isPetFullyPampered(result.nextState);
    setEffectType(newlyPampered ? "hearts" : result.effectType);
    if (soundEnabled) {
      const sounds = {
        wash: "bubble_pop",
        brush: "heart_chime",
        feed: "munch",
        play: "happy_roar",
      } as const;
      playPetSound(newlyPampered ? "heart_chime" : sounds[action]);
    }
    onCare(action);
    window.clearTimeout(effectTimer.current);
    effectTimer.current = window.setTimeout(() => setEffectType(null), 1500);
  };

  return (
    <Dialog
      title="Pet Paradise Nursery"
      subtitle="Pamper your companion with love and care"
      onClose={onClose}
      wide
    >
      <div className="pet-care-modal">
        <button
          type="button"
          className="button button-secondary"
          aria-pressed={soundEnabled}
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          Sound {soundEnabled ? "on" : "off"}
        </button>
        {/* Pet Avatar Area */}
        <div className="pet-avatar-section">
          <div className="pet-avatar-container">
            <Lion
              color={lionColor}
              accessory={lionAccessory}
              className="pet-avatar"
            />
            {effectType === "hearts" && (
              <div className="heart-burst" aria-hidden="true">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className="floating-heart"
                    style={{
                      left: `${15 + i * 10}%`,
                      top: `${30 + (i % 3) * 15}%`,
                    }}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            )}
            {effectType && effectType !== "hearts" && (
              <div
                className={`effect-particles effect-${effectType}`}
                aria-hidden="true"
              >
                {effectType === "bubbles" &&
                  [...Array(5)].map((_, i) => (
                    <span key={i} className="particle">
                      ●
                    </span>
                  ))}
                {effectType === "sparkle" &&
                  [...Array(6)].map((_, i) => (
                    <span key={i} className="particle">
                      ✨
                    </span>
                  ))}
                {effectType === "munch" && <span className="particle">😋</span>}
                {effectType === "bounce" && (
                  <span className="particle bounce-particle">🎉</span>
                )}
              </div>
            )}
          </div>
        </div>

        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Happiness {Math.round(petCare.happiness)}%, cleanliness{" "}
          {Math.round(petCare.cleanliness)}%, energy{" "}
          {Math.round(petCare.energy)}%, fullness {Math.round(petCare.hunger)}%.
        </p>
        {/* Stats Section */}
        <div className="pet-stats">
          <div className="pet-stat-item">
            <div className="pet-stat-label">
              <Heart size={16} aria-hidden="true" />
              <span>Happiness</span>
            </div>
            <div
              className="pet-stat-bar"
              role="progressbar"
              aria-valuenow={Math.round(petCare.happiness)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Pet happiness level"
            >
              <div
                className="stat-fill happiness-fill"
                style={{ width: `${petCare.happiness}%` }}
              />
            </div>
            <span className="pet-stat-value">
              {Math.round(petCare.happiness)}%
            </span>
          </div>

          <div className="pet-stat-item">
            <div className="pet-stat-label">
              <Sparkles size={16} aria-hidden="true" />
              <span>Cleanliness</span>
            </div>
            <div
              className="pet-stat-bar"
              role="progressbar"
              aria-valuenow={Math.round(petCare.cleanliness)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Pet cleanliness level"
            >
              <div
                className="stat-fill cleanliness-fill"
                style={{ width: `${petCare.cleanliness}%` }}
              />
            </div>
            <span className="pet-stat-value">
              {Math.round(petCare.cleanliness)}%
            </span>
          </div>

          <div className="pet-stat-item">
            <div className="pet-stat-label">⚡ Energy</div>
            <div
              className="pet-stat-bar"
              role="progressbar"
              aria-valuenow={Math.round(petCare.energy)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Pet energy level"
            >
              <div
                className="stat-fill energy-fill"
                style={{ width: `${petCare.energy}%` }}
              />
            </div>
            <span className="pet-stat-value">
              {Math.round(petCare.energy)}%
            </span>
          </div>

          <div className="pet-stat-item">
            <div className="pet-stat-label">🍽️ Fullness</div>
            <div
              className="pet-stat-bar"
              role="progressbar"
              aria-valuenow={Math.round(petCare.hunger)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Pet satiety level"
            >
              <div
                className="stat-fill hunger-fill"
                style={{ width: `${petCare.hunger}%` }}
              />
            </div>
            <span className="pet-stat-value">
              {Math.round(petCare.hunger)}%
            </span>
          </div>
        </div>

        {/* Care Actions */}
        <div className="care-actions">
          {CARE_ACTIONS.map(({ action, label, icon }) => (
            <button
              key={action}
              type="button"
              className="care-action-btn"
              onClick={() => handleCareAction(action)}
              aria-label={label}
            >
              <span className="action-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="action-label">{label}</span>
            </button>
          ))}
        </div>

        {isPetFullyPampered(petCare) && (
          <div className="achievement-message">
            <Sparkles size={20} aria-hidden="true" />
            Your pet is fully pampered! 🎉
          </div>
        )}
      </div>
    </Dialog>
  );
}
