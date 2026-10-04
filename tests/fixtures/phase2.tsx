import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DanceFloor } from "../../src/components/DanceFloor";
import { DJBeatDropModal } from "../../src/components/DJBeatDrop";
import { SmoothieKitchen } from "../../src/components/SmoothieKitchen";
import "../../src/styles.css";

function Fixture() {
  const [open, setOpen] = useState<"dj" | "smoothie" | null>(null);
  const [rewards, setRewards] = useState<unknown[]>([]);
  const [smoothies, setSmoothies] = useState<number[]>([]);
  const [tiles, setTiles] = useState<number[]>([]);
  return (
    <main>
      <h1>Phase 2 minigames</h1>
      <button onClick={() => setOpen("dj")}>Open DJ booth</button>
      <button onClick={() => setOpen("smoothie")}>Open smoothie kitchen</button>
      <output aria-label="DJ rewards">{JSON.stringify(rewards)}</output>
      <output aria-label="Smoothie rewards">{JSON.stringify(smoothies)}</output>
      <output aria-label="Lit tiles">{JSON.stringify(tiles)}</output>
      <DanceFloor
        muted
        onTileLight={(tile) => setTiles((items) => [...items, tile])}
      />
      {open === "dj" && (
        <DJBeatDropModal
          best={0}
          onClose={() => setOpen(null)}
          onFinish={(result) => setRewards((items) => [...items, result])}
        />
      )}
      {open === "smoothie" && (
        <SmoothieKitchen
          onClose={() => setOpen(null)}
          onServe={(coins) => setSmoothies((items) => [...items, coins])}
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
