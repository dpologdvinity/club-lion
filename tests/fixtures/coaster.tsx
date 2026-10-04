import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Dialog } from "../../src/components/Dialog";
import {
  RollerCoasterRide,
  type CoasterCompletion,
} from "../../src/components/RollerCoasterRide";
import { DEFAULT_AVATAR_LOOK, DEFAULT_PET_STATE } from "../../src/types/world";
import "../../src/styles.css";

function Fixture() {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<CoasterCompletion[]>([]);
  return (
    <main>
      <h1>Savanna Screamer review</h1>
      <button className="button button-primary" onClick={() => setOpen(true)}>
        Open coaster
      </button>
      <output aria-label="Completed rides">{completed.length}</output>
      {open && (
        <Dialog title="Savanna Screamer" onClose={() => setOpen(false)} wide>
          <RollerCoasterRide
            look={DEFAULT_AVATAR_LOOK}
            pet={{ ...DEFAULT_PET_STATE, name: "Leo" }}
            onClose={() => setOpen(false)}
            onFinish={(result) => setCompleted((items) => [...items, result])}
          />
        </Dialog>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
