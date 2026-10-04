import { useId, useRef, useState } from "react";
import { LockKeyhole } from "lucide-react";
import type { Player, PlayerV2 } from "../game";
import {
  STAMP_DEFINITIONS,
  isStampUnlocked,
  type StampCategory,
} from "../utils/stampDefinitions";
import { Dialog } from "./Dialog";

const CATEGORIES: { id: StampCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "world_secrets", label: "World Secrets" },
  { id: "secrets", label: "Coastal Secrets" },
  { id: "park_thrills", label: "Park Thrills" },
  { id: "fashion_style", label: "Fashion & Style" },
  { id: "arcade_mastery", label: "Arcade Mastery" },
];

export function StampBook({
  player,
  onClose,
}: {
  player: Player | PlayerV2;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<StampCategory | "all">("all");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const total = STAMP_DEFINITIONS.length;
  const collected = STAMP_DEFINITIONS.filter((stamp) =>
    isStampUnlocked(player, stamp.id),
  ).length;
  const percent = Math.round((collected / total) * 100);
  const visible = STAMP_DEFINITIONS.filter(
    (stamp) => category === "all" || stamp.category === category,
  );

  return (
    <Dialog
      title="Savanna Stamp Book"
      subtitle="Little discoveries. Lasting memories."
      onClose={onClose}
      wide
    >
      <div className="stamp-book">
        <div className="stamp-progress">
          <p id={`${id}-progress`}>
            Stamps Collected: {collected} / {total} ({percent}%)
          </p>
          <progress
            aria-labelledby={`${id}-progress`}
            value={collected}
            max={total}
          />
        </div>
        <div
          className="stamp-tabs"
          role="tablist"
          aria-label="Stamp categories"
        >
          {CATEGORIES.map((tab, index) => (
            <button
              key={tab.id}
              id={`${id}-${tab.id}`}
              role="tab"
              aria-selected={category === tab.id}
              aria-controls={`${id}-stamps`}
              tabIndex={category === tab.id ? 0 : -1}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              onClick={() => setCategory(tab.id)}
              onKeyDown={(event) => {
                let next: number;
                if (event.key === "ArrowRight")
                  next = (index + 1) % CATEGORIES.length;
                else if (event.key === "ArrowLeft")
                  next = (index + CATEGORIES.length - 1) % CATEGORIES.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = CATEGORIES.length - 1;
                else return;
                event.preventDefault();
                setCategory(CATEGORIES[next].id);
                tabs.current[next]?.focus();
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          id={`${id}-stamps`}
          role="tabpanel"
          aria-labelledby={`${id}-${category}`}
          tabIndex={0}
        >
          <ul className="stamp-grid">
            {visible.map((stamp) => {
              const unlocked = isStampUnlocked(player, stamp.id);
              return (
                <li
                  key={stamp.id}
                  className={`stamp-slot ${unlocked ? "is-unlocked" : "is-locked"}`}
                >
                  <span className="stamp-icon" aria-hidden="true">
                    {unlocked ? stamp.icon : <LockKeyhole size={30} />}
                  </span>
                  <h3>{stamp.name}</h3>
                  <span className="stamp-badge">
                    {unlocked ? "Unlocked" : "Locked"}
                  </span>
                  <p>{unlocked ? stamp.description : stamp.unlockHint}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Dialog>
  );
}
