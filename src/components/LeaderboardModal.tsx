import { useState, useId } from "react";
import {
  Trophy,
  Medal,
  Flame,
  Sparkles,
  ChevronRight,
  Award,
} from "lucide-react";
import { Dialog } from "./Dialog";
import {
  type MinigameId,
  type LeaderboardEntry,
  MINIGAME_METAS,
  getLeaderboardEntries,
  playLeaderboardSound,
} from "../utils/leaderboard.ts";
import type { PlayerBase } from "../game.ts";

interface LeaderboardModalProps {
  player: PlayerBase;
  onClose: () => void;
  defaultGameId?: MinigameId;
}

const ORDERED_GAMES: MinigameId[] = [
  "dj-beat-drop",
  "river-surf",
  "extreme-sled",
  "smoothie-kitchen",
  "fashion-show",
  "mango-run",
  "fruit-catch",
  "paw-steps",
  "bee-stop",
];

export function LeaderboardModal({
  player,
  onClose,
  defaultGameId = "dj-beat-drop",
}: LeaderboardModalProps) {
  const [selectedGame, setSelectedGame] = useState<MinigameId>(defaultGameId);
  const tablistId = useId();

  const currentMeta = MINIGAME_METAS[selectedGame];
  const entries: LeaderboardEntry[] = getLeaderboardEntries(
    selectedGame,
    player,
  );
  const playerEntry = entries.find((e) => e.isPlayer);

  const handleSelectGame = (gameId: MinigameId) => {
    setSelectedGame(gameId);
    playLeaderboardSound("tab");
  };

  const getTierIcon = (tier: LeaderboardEntry["tier"]) => {
    switch (tier) {
      case "grandmaster":
        return <Trophy size={16} className="tier-icon-gm" />;
      case "diamond":
        return <Medal size={16} className="tier-icon-diamond" />;
      case "gold":
        return <Award size={16} className="tier-icon-gold" />;
      case "silver":
        return <Sparkles size={16} className="tier-icon-silver" />;
      default:
        return <Flame size={16} className="tier-icon-bronze" />;
    }
  };

  return (
    <Dialog
      title="Savanna Arcade Leaderboard"
      subtitle="Top scores, pride champions & legendary records"
      onClose={onClose}
      wide
    >
      <div className="leaderboard-modal">
        {/* Minigame Category Sidebar / Tablist */}
        <div
          className="leaderboard-tabs"
          role="tablist"
          id={tablistId}
          aria-label="Minigame categories"
        >
          {ORDERED_GAMES.map((gameId) => {
            const meta = MINIGAME_METAS[gameId];
            const isSelected = selectedGame === gameId;
            return (
              <button
                key={gameId}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`leaderboard-tab-btn ${isSelected ? "active" : ""}`}
                onClick={() => handleSelectGame(gameId)}
              >
                <span className="tab-name">{meta.name}</span>
                <span className="tab-category">{meta.category}</span>
              </button>
            );
          })}
        </div>

        {/* Leaderboard Table & Stats Panel */}
        <div className="leaderboard-content" role="tabpanel">
          <header className="leaderboard-header">
            <div className="game-info">
              <h3>{currentMeta.name}</h3>
              <p>{currentMeta.description}</p>
            </div>
            {playerEntry && playerEntry.rank === 1 && (
              <div className="leaderboard-banner-record">
                <Trophy size={18} />
                <span>ALL-TIME RECORD HOLDER!</span>
              </div>
            )}
          </header>

          {/* Player Personal Standing Banner */}
          {playerEntry && (
            <div className="player-standing-card">
              <div className="standing-rank">
                <span className="standing-rank-num">#{playerEntry.rank}</span>
                <span className="standing-tier-badge">{playerEntry.tier}</span>
              </div>
              <div className="standing-details">
                <div className="standing-name">Your High Score</div>
                <div className="standing-score">
                  <strong>{playerEntry.score.toLocaleString()}</strong>{" "}
                  <span>{currentMeta.unit}</span>
                </div>
              </div>
              <button
                type="button"
                className="standing-celebrate-btn"
                aria-label="Celebrate score"
                onClick={() => playLeaderboardSound("rank_up")}
              >
                <Sparkles size={16} />
              </button>
            </div>
          )}

          {/* Rankings List */}
          <div className="leaderboard-list" role="list">
            <div
              className="leaderboard-row leaderboard-table-head"
              aria-hidden="true"
            >
              <span className="col-rank">Rank</span>
              <span className="col-name">Challenger</span>
              <span className="col-title">Title</span>
              <span className="col-score">{currentMeta.scoreLabel}</span>
            </div>

            {entries.map((entry) => (
              <div
                key={`${entry.name}-${entry.rank}`}
                role="listitem"
                className={`leaderboard-row ${entry.isPlayer ? "row-player" : ""} tier-${entry.tier}`}
                onClick={() => {
                  if (entry.rank <= 3) playLeaderboardSound("trophy");
                }}
              >
                <div className="col-rank">
                  <span className={`rank-badge rank-${entry.rank}`}>
                    {getTierIcon(entry.tier)}
                    {entry.rank}
                  </span>
                </div>
                <div className="col-name">
                  <span className="challenger-name">{entry.name}</span>
                  {entry.isPlayer && <span className="player-tag">YOU</span>}
                </div>
                <div className="col-title">
                  <span className="challenger-title">{entry.title}</span>
                </div>
                <div className="col-score">
                  <span className="score-val">
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="score-unit"> {currentMeta.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
