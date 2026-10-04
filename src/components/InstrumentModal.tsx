import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import {
  DRUM_LABELS,
  NOTE_NAMES,
  playInstrumentNote,
  type InstrumentType,
} from "../utils/instrumentSynths.ts";

export type InstrumentModalProps = {
  instrument: InstrumentType;
  instrumentName: string;
  onClose: () => void;
};

const KEY_TO_NOTE: Record<string, number> = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
};

export function InstrumentContent({
  instrument,
  onClose,
}: {
  instrument: InstrumentType;
  onClose?: () => void;
}) {
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const labels = instrument === "drums" ? DRUM_LABELS : NOTE_NAMES;

  const press = (noteIndex: number) => {
    playInstrumentNote(instrument, noteIndex);
    setActiveNote(noteIndex);
    window.setTimeout(() => {
      setActiveNote((current) => (current === noteIndex ? null : current));
    }, 150);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const noteIndex = KEY_TO_NOTE[event.key];
      if (noteIndex === undefined) return;
      press(noteIndex);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrument]);

  return (
    <div className="instrument-modal">
      <p className="instrument-instruction">Press 1–8 or click keys to play</p>
      <div className="instrument-keyboard">
        {labels.map((label, noteIndex) => (
          <button
            key={label}
            type="button"
            className={`instrument-key ${activeNote === noteIndex ? "instrument-key-active" : ""}`}
            onPointerDown={() => press(noteIndex)}
            aria-label={label}
          >
            <span className="instrument-key-number">{noteIndex + 1}</span>
            <span className="instrument-key-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function InstrumentModal({
  instrument,
  instrumentName,
  onClose,
}: InstrumentModalProps) {
  return (
    <Dialog title={instrumentName} onClose={onClose}>
      <InstrumentContent instrument={instrument} onClose={onClose} />
    </Dialog>
  );
}
