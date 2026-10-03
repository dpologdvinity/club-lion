import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { ActionWheel } from "../../src/components/ActionWheel";
import { MangoToss } from "../../src/components/MangoToss";
import "../../src/styles.css";

function Fixture() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [impacts, setImpacts] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);
  return (
    <main style={{ overflowWrap: "anywhere" }}>
      <button onClick={() => setOpen(true)}>Open actions</button>
      <ActionWheel
        isOpen={open}
        onClose={() => setOpen(false)}
        onEmote={(id) => setMessages((items) => [...items, `emote:${id}`])}
        onAction={(id) => setMessages((items) => [...items, `action:${id}`])}
        onPhrase={(text) =>
          setMessages((items) => [...items, `phrase:${text}`])
        }
      />
      <output aria-label="Selections">{JSON.stringify(messages)}</output>
      <button onClick={() => setRevision((value) => value + 1)}>
        Rerender
      </button>
      <output aria-label="Revision">{revision}</output>
      <button onClick={() => setTarget(null)}>Cancel toss</button>
      <button onClick={() => setTarget({ x: 80, y: 100 })}>Retarget</button>
      <div style={{ position: "relative", width: "100%", height: 240 }}>
        <button
          aria-label="Toss here"
          style={{ position: "absolute", inset: 0 }}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setTarget({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }}
        >
          Toss here
        </button>
        {target && (
          <MangoToss
            origin={{ x: 20, y: 200 }}
            target={target}
            onImpact={(point) =>
              setImpacts((items) => [
                ...items,
                `${point.x},${point.y}:v${revision}`,
              ])
            }
          />
        )}
      </div>
      <output aria-label="Impacts">{JSON.stringify(impacts)}</output>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
