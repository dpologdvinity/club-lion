import { useState } from "react";
import { Heart, Star } from "lucide-react";
import type { PlayerV2 } from "../game.ts";
import { Avatar } from "./Avatar.tsx";
import { Dialog } from "./Dialog.tsx";

const STARS_PER_LEVEL = 5;
const MOOD_QUOTE_MAX_LENGTH = 60;

const RIBBON_MEDALS = [
  { id: "savanna_explorer", name: "Savanna Explorer" },
  { id: "secret_finder", name: "Secret Finder" },
  { id: "smoothie_chef", name: "Smoothie Chef" },
  { id: "high_roller", name: "High Roller" },
];

function petHappiness(mood: string): number {
  return mood === "happy" ? 3 : mood === "idle" || mood === "sitting" ? 2 : 1;
}

export function PlayerCard({
  player,
  onClose,
  onSaveMoodQuote,
}: {
  player: PlayerV2;
  onClose: () => void;
  onSaveMoodQuote: (moodQuote: string) => void;
}) {
  const [moodQuote, setMoodQuote] = useState(player.moodQuote);
  const level = Math.floor((player.starRank - 1) / STARS_PER_LEVEL) + 1;
  const starsLit = ((player.starRank - 1) % STARS_PER_LEVEL) + 1;
  const hearts = petHappiness(player.pet.mood);
  const earnedMedals = new Set(
    [
      player.visited.length >= 4 ? "savanna_explorer" : null,
      player.owned.some((id) => id.startsWith("secret_"))
        ? "secret_finder"
        : null,
      player.owned.includes("mango_smoothie_cup") ? "smoothie_chef" : null,
      player.coins >= 1000 ? "high_roller" : null,
    ].filter((id): id is string => id !== null),
  );

  return (
    <Dialog title="Player ID Card" onClose={onClose}>
      <div className="player-card">
        <div className="player-card-avatar">
          <Avatar look={player.look} size={140} />
          <p className="player-card-name">{player.name}</p>
        </div>

        <div className="player-card-pet">
          <span className="player-card-pet-label">{player.pet.name}</span>
          <div
            className="player-card-hearts"
            role="img"
            aria-label={`Pet happiness: ${hearts} out of 3 hearts`}
          >
            {Array.from({ length: 3 }, (_, i) => (
              <Heart
                key={i}
                size={16}
                fill={i < hearts ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>

        <div
          className="player-card-rank"
          role="img"
          aria-label={`Star rank level ${level}, ${starsLit} of ${STARS_PER_LEVEL} stars`}
        >
          <span className="player-card-level">Level {level}</span>
          <div className="player-card-stars">
            {Array.from({ length: STARS_PER_LEVEL }, (_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < starsLit ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>

        <form
          className="player-card-mood"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = moodQuote.trim();
            if (trimmed)
              onSaveMoodQuote(trimmed.slice(0, MOOD_QUOTE_MAX_LENGTH));
          }}
        >
          <label className="field-label" htmlFor="mood-quote">
            Status
          </label>
          <input
            id="mood-quote"
            value={moodQuote}
            maxLength={MOOD_QUOTE_MAX_LENGTH}
            onChange={(e) => setMoodQuote(e.target.value)}
            placeholder="Living on the roller coaster"
          />
          <button type="submit" className="text-button">
            Save
          </button>
        </form>

        <ul className="player-card-ribbons">
          {RIBBON_MEDALS.map((medal) => (
            <li
              key={medal.id}
              className={`ribbon-medal ${earnedMedals.has(medal.id) ? "earned" : "locked"}`}
            >
              {medal.name}
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}

export default PlayerCard;
