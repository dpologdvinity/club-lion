import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { SpyTerminalModal } from "../../src/components/SpyTerminal";
import { newPlayer, completeSpyPuzzle } from "../../src/game";
import "../../src/styles.css";

function Fixture() {
  const [open, setOpen] = useState(false);
  const [player, setPlayer] = useState(newPlayer);
  return (
    <main>
      <h1>Spy terminal review</h1>
      <button onClick={() => setOpen(true)}>Open spy terminal</button>
      <output aria-label="Completed puzzles">
        {player.spyPuzzlesSolved ?? 0}
      </output>
      <output aria-label="Coins">{player.coins}</output>
      {open && (
        <SpyTerminalModal
          spyPuzzlesSolved={player.spyPuzzlesSolved ?? 0}
          onClose={() => setOpen(false)}
          onCompletePuzzle={(type, stage, coins) =>
            setPlayer((current) =>
              completeSpyPuzzle(current, type, stage, coins),
            )
          }
        />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
