import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Coin } from "./Lion";

const SYMBOLS = ["🦁", "🌴", "🥭", "🌼", "🦋", "☀️"];
function shuffledCards() {
  const cards = [...SYMBOLS, ...SYMBOLS].map((symbol, id) => ({ symbol, id }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function MemorySafari({
  onFinish,
  onBack,
  onClose,
}: {
  onFinish: (pairs: number) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [cards, setCards] = useState(shuffledCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [won, setWon] = useState(false);
  const timeout = useRef<number | undefined>(undefined);
  const locked = useRef(false);
  useEffect(() => () => window.clearTimeout(timeout.current), []);

  const flip = (index: number) => {
    if (
      !playing ||
      locked.current ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;
    if (!flipped.length) {
      setFlipped([index]);
      return;
    }
    const previous = flipped[0];
    setFlipped([previous, index]);
    setMoves((m) => m + 1);
    locked.current = true;
    const match = cards[previous].symbol === cards[index].symbol;
    timeout.current = window.setTimeout(
      () => {
        if (match) {
          const next = [...matched, previous, index];
          setMatched(next);
          if (next.length === cards.length) {
            setWon(true);
            setPlaying(false);
            onFinish(6);
          }
        }
        setFlipped([]);
        locked.current = false;
      },
      match ? 380 : 900,
    );
  };
  const restart = () => {
    window.clearTimeout(timeout.current);
    locked.current = false;
    setCards(shuffledCards());
    setMatched([]);
    setFlipped([]);
    setMoves(0);
    setWon(false);
    setPlaying(true);
  };

  return (
    <div className="memory-game">
      <button className="arcade-back" onClick={onBack}>
        <ArrowLeft size={15} /> All games
      </button>
      {!playing && !won ? (
        <div className="game-intro">
          <div className="game-illustration">
            <span>🌴</span>
            <span>🦁</span>
            <span>🌼</span>
          </div>
          <h3>Memory Safari</h3>
          <p>
            A little game for your lion-sized brain.
            <br />
            Find all 6 matching pairs to earn <strong>60 coins.</strong>
          </p>
          <div className="game-features">
            <span>
              <Sparkles size={15} /> No timer. No rush.
            </span>
            <span>
              <Coin amount={60} /> per game
            </span>
          </div>
          <button className="button button-primary" onClick={restart}>
            Let’s play <ArrowRight size={18} />
          </button>
        </div>
      ) : won ? (
        <div className="game-intro game-win">
          <div className="trophy-icon">
            <Trophy size={53} />
          </div>
          <h3>That’s a roaring success!</h3>
          <p>
            All 6 pairs, found in {moves} moves.
            <br />A little well-earned treasure for your adventure.
          </p>
          <div className="reward-display">
            + <Coin amount={60} />
          </div>
          <div className="game-win-actions">
            <button className="button button-secondary" onClick={restart}>
              <RotateCcw size={16} /> Play again
            </button>
            <button className="button button-primary" onClick={onClose}>
              Back to the pride <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="game-stats">
            <span>
              <Gamepad2 size={17} /> {moves} moves
            </span>
            <span>
              <Check size={17} /> {matched.length / 2} / 6 pairs
            </span>
            <Coin amount={60} />
          </div>
          <div className="memory-grid">
            {cards.map((card, index) => {
              const revealed =
                flipped.includes(index) || matched.includes(index);
              return (
                <button
                  key={card.id}
                  className={`memory-card ${revealed ? "revealed" : ""} ${matched.includes(index) ? "matched" : ""}`}
                  disabled={matched.includes(index)}
                  onClick={() => flip(index)}
                  aria-label={
                    revealed ? card.symbol : `Reveal card ${index + 1}`
                  }
                  aria-pressed={revealed}
                >
                  {revealed ? (
                    <span>{card.symbol}</span>
                  ) : (
                    <span className="card-back">✿</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="game-help">
            Pick two cards. Find a match. Repeat until happy.
          </p>
        </>
      )}
    </div>
  );
}
