import type { JSX } from "react";
import { Dialog } from "./Dialog";

export type EmoteId = "heart" | "star" | "laugh" | "shock" | "sleep";
export type ActionId = "dance" | "wave" | "sit" | "jam" | "toss";

const emotes: { id: EmoteId; label: string; symbol: string }[] = [
  { id: "heart", label: "Heart", symbol: "♡" },
  { id: "star", label: "Star", symbol: "★" },
  { id: "laugh", label: "Laugh", symbol: "😂" },
  { id: "shock", label: "Shock", symbol: "😲" },
  { id: "sleep", label: "Sleep", symbol: "💤" },
];
const actions: { id: ActionId; label: string }[] = [
  { id: "dance", label: "Dance" },
  { id: "wave", label: "Wave" },
  { id: "sit", label: "Sit" },
  { id: "jam", label: "Jam" },
  { id: "toss", label: "Toss mango" },
];
const phrases = [
  "Meet me at the café!",
  "Let's ride the roller coaster!",
  "Waterpark race!",
  "Love your outfit!",
  "Check out my den!",
  "AFK getting a smoothie 🥭",
];

export function ActionWheel({
  isOpen,
  onClose,
  onEmote,
  onAction,
  onPhrase,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEmote: (id: EmoteId) => void;
  onAction: (id: ActionId) => void;
  onPhrase: (text: string) => void;
}): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <Dialog title="Quick chat & emotes" onClose={onClose}>
      <div
        role="group"
        aria-label="Emotes"
        style={{
          position: "relative",
          width: 264,
          maxWidth: "100%",
          aspectRatio: "1",
          margin: "0 auto",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "38%",
            display: "grid",
            placeItems: "center",
          }}
        >
          Emotes
        </span>
        {emotes.map((emote, index) => {
          const angle = (index * Math.PI * 2) / emotes.length - Math.PI / 2;
          return (
            <button
              key={emote.id}
              type="button"
              className="button button-secondary"
              aria-label={emote.label}
              style={{
                position: "absolute",
                left: `${50 + Math.cos(angle) * 35}%`,
                top: `${50 + Math.sin(angle) * 35}%`,
                transform: "translate(-50%, -50%)",
                width: 64,
                height: 64,
                padding: 0,
                borderRadius: "50%",
                fontSize: 28,
              }}
              onClick={() => {
                onEmote(emote.id);
                onClose();
              }}
            >
              <span aria-hidden="true">{emote.symbol}</span>
            </button>
          );
        })}
      </div>
      <div
        role="group"
        aria-label="Actions"
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="button button-primary"
            onClick={() => {
              onAction(action.id);
              onClose();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
      <h3>Quick phrases</h3>
      <div
        role="group"
        aria-label="Quick phrases"
        style={{ display: "grid", gap: 8 }}
      >
        {phrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            className="button button-secondary"
            onClick={() => {
              onPhrase(phrase);
              onClose();
            }}
          >
            {phrase}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
