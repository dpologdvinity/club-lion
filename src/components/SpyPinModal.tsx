import {
  useState,
  useEffect,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Dialog } from "./Dialog.tsx";
import {
  playSpySound,
  VALID_SPY_PINS,
  verifySpyPin,
} from "../utils/spyPuzzles.ts";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Delete,
  ArrowRight,
} from "lucide-react";

export type SpyPinModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
};

const KEYPAD_BUTTONS = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "clear", letters: "CLEAR" },
  { digit: "0", letters: "+" },
  { digit: "enter", letters: "DIAL" },
] as const;

export function SpyPinModal({ isOpen, onClose, onUnlock }: SpyPinModalProps) {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "denied" | "granted">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen]);

  const verify = (candidate: string) => {
    if (verifySpyPin(candidate)) {
      setStatus("granted");
      setErrorMsg("");
      playSpySound("puzzle_complete");
      window.setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setStatus("denied");
      setErrorMsg("ACCESS DENIED: INVALID SECURITY PIN");
      playSpySound("alarm");
      window.setTimeout(() => {
        setPin("");
        setStatus("idle");
      }, 1200);
    }
  };

  const handlePress = (digit: string) => {
    if (status === "granted") return;
    if (digit === "clear") {
      playSpySound("key_press");
      setPin("");
      setStatus("idle");
      setErrorMsg("");
      return;
    }
    if (digit === "enter") {
      if (pin.length === 4) {
        verify(pin);
      }
      return;
    }
    if (pin.length >= 4) return;

    playSpySound("key_press");
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      verify(next);
    }
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      handlePress(e.key);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      handlePress("clear");
    } else if (e.key === "Enter" && pin.length === 4) {
      e.preventDefault();
      verify(pin);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      title="Classified Telephone Booth"
      subtitle="Dial the 4-digit agency code to unlock subterranean transit."
      onClose={onClose}
    >
      <div
        className="spy-pin-container"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Security PIN Keypad"
      >
        <div className="spy-pin-terminal">
          <div className="spy-pin-header">
            <KeyRound size={20} className="spy-pin-icon" aria-hidden="true" />
            <span className="spy-pin-classification">
              TOP SECRET // THE PRIDE HQ
            </span>
          </div>

          <div
            className={`spy-pin-display ${status === "granted" ? "is-granted" : status === "denied" ? "is-denied" : ""}`}
            role="status"
            aria-live="polite"
          >
            {status === "granted" ? (
              <span className="spy-pin-status granted">
                <ShieldCheck size={20} aria-hidden="true" /> CLEARANCE GRANTED
              </span>
            ) : status === "denied" ? (
              <span className="spy-pin-status denied">
                <ShieldAlert size={20} aria-hidden="true" /> {errorMsg}
              </span>
            ) : (
              <div
                className="spy-pin-slots"
                aria-label={`Current PIN: ${pin.length} of 4 digits entered`}
              >
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`spy-pin-slot ${idx < pin.length ? "filled" : ""}`}
                  >
                    {idx < pin.length ? pin[idx] : "•"}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            className="spy-pin-keypad"
            role="group"
            aria-label="Telephone Keypad"
          >
            {KEYPAD_BUTTONS.map(({ digit, letters }) => (
              <button
                key={digit}
                type="button"
                className={`spy-pin-btn ${digit === "clear" ? "btn-clear" : digit === "enter" ? "btn-dial" : ""}`}
                disabled={status === "granted"}
                onClick={() => handlePress(digit)}
                aria-label={
                  digit === "clear"
                    ? "Clear PIN"
                    : digit === "enter"
                      ? "Dial and submit PIN"
                      : `Digit ${digit} ${letters ? `letters ${letters}` : ""}`
                }
              >
                {digit === "clear" ? (
                  <span className="btn-label-action">
                    <Delete size={16} aria-hidden="true" />
                    <span>CLR</span>
                  </span>
                ) : digit === "enter" ? (
                  <span className="btn-label-action">
                    <ArrowRight size={16} aria-hidden="true" />
                    <span>DIAL</span>
                  </span>
                ) : (
                  <>
                    <span className="btn-digit">{digit}</span>
                    {letters && <span className="btn-letters">{letters}</span>}
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="spy-pin-hint">
            <span className="hint-label">AGENT MEMO:</span> The Pride security
            access code spells
            <strong> PRID (7743)</strong> on standard telephone letters.
          </div>
        </div>
      </div>
    </Dialog>
  );
}
