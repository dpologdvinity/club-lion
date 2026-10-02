import {
  Check,
  ChevronRight,
  Gamepad2,
  Gift,
  Leaf,
  Map,
  PawPrint,
  Shirt,
} from "lucide-react";
import { isAdventureComplete, type AdventureId, type Player } from "../game";
import { Coin, Lion } from "./Lion";

const ADVENTURES = [
  {
    id: "neighbors" as const,
    title: "Meet the neighborhood",
    description: "Say hello to 3 lions in the square.",
    Icon: Map,
    color: "yellow",
  },
  {
    id: "game" as const,
    title: "A little friendly competition",
    description: "Play a game at the arcade.",
    Icon: Gamepad2,
    color: "orange",
  },
  {
    id: "home" as const,
    title: "Make yourself at home",
    description: "Visit your very own cozy den.",
    Icon: Leaf,
    color: "green",
  },
];

export function Sidebar({
  player,
  onStyle,
  onAdventure,
  onClaim,
}: {
  player: Player;
  onStyle: () => void;
  onAdventure: (id: AdventureId) => void;
  onClaim: (id: AdventureId) => void;
}) {
  const level = 1 + player.claimed.length + Math.floor(player.gamesPlayed / 3);
  return (
    <aside className="sidebar">
      <section className="profile-panel">
        <h2 className="panel-label">Your lion</h2>
        <div className="profile-content">
          <div className="profile-portrait">
            <span className="portrait-sun" />
            <Lion color={player.color} accessory={player.accessory} />
            <span className="portrait-leaf leaf-left">❧</span>
            <span className="portrait-leaf leaf-right">❧</span>
          </div>
          <div className="profile-details">
            <h3>{player.name}</h3>
            <span className="level">
              <span>
                <PawPrint size={16} fill="currentColor" />
              </span>{" "}
              Level {level}
            </span>
            <p>Little explorer</p>
            <button
              className="button button-primary style-button"
              onClick={onStyle}
            >
              <Shirt size={15} fill="currentColor" /> Style your lion
            </button>
          </div>
        </div>
      </section>
      <section className="adventures-panel">
        <div className="adventures-heading">
          <h2 className="panel-label">Little adventures</h2>
          <span title="Complete an adventure to earn 50 coins">
            <Gift size={17} />
          </span>
        </div>
        <p className="panel-subtitle">Little things. Big happy feelings.</p>
        <div className="adventure-list">
          {ADVENTURES.map(({ id, title, description, Icon, color }) => {
            const complete = isAdventureComplete(player, id);
            const claimed = player.claimed.includes(id);
            const progress =
              id === "neighbors" ? player.met.length : complete ? 1 : 0;
            const total = id === "neighbors" ? 3 : 1;
            return (
              <div
                className={`adventure ${claimed ? "adventure-claimed" : ""}`}
                key={id}
              >
                <span className={`adventure-icon ${color}`}>
                  <Icon size={25} strokeWidth={1.6} />
                </span>
                <div className="adventure-content">
                  <button
                    className="adventure-title"
                    onClick={() => onAdventure(id)}
                  >
                    {title}
                    <ChevronRight size={15} />
                  </button>
                  <p>{description}</p>
                  {complete ? (
                    claimed ? (
                      <span className="adventure-done">
                        <Check size={13} /> Adventure complete
                      </span>
                    ) : (
                      <button
                        className="claim-button"
                        onClick={() => onClaim(id)}
                      >
                        <Gift size={13} /> Claim <Coin amount={50} />
                      </button>
                    )
                  ) : (
                    <div className="adventure-progress">
                      <span className="progress-track">
                        <span
                          style={{ width: `${(progress / total) * 100}%` }}
                        />
                      </span>
                      <span>
                        {progress} / {total}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="adventure-footer">
          <span className="tiny-sparkle">✧</span> Every little adventure earns
          50 coins.
        </div>
      </section>
    </aside>
  );
}
