import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DJBeatDropModal } from "../../src/components/DJBeatDrop";
import "../../src/styles.css";

function Fixture() {
  const [open, setOpen] = useState(false);
  const [rewards, setRewards] = useState<unknown[]>([]);
  return (
    <main>
      <h1>Phase 2 minigames</h1>
      <button onClick={() => setOpen(true)}>Open DJ booth</button>
      <output aria-label="DJ rewards">{JSON.stringify(rewards)}</output>
      {open && (
        <DJBeatDropModal
          best={0}
          onClose={() => setOpen(false)}
          onFinish={(result) => setRewards((items) => [...items, result])}
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
