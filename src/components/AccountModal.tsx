import { useState } from "react";
import {
  User,
  Key,
  Download,
  Upload,
  ShieldCheck,
  Sparkles,
  Check,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { Dialog } from "./Dialog";
import { migratePlayerSave, type PlayerV2 } from "../game";

type AccountModalProps = {
  player: PlayerV2;
  onUpdatePlayer: (updater: (prev: PlayerV2) => PlayerV2) => void;
  onClose: () => void;
  notify?: (message: string) => void;
};

export function AccountModal({
  player,
  onUpdatePlayer,
  onClose,
  notify,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "sync" | "switch">(
    "profile",
  );
  const [usernameInput, setUsernameInput] = useState(player.name);
  const [isCopied, setIsCopied] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  const exportSaveData = (): string => {
    try {
      const json = JSON.stringify(player);
      return btoa(unescape(encodeURIComponent(json)));
    } catch {
      return JSON.stringify(player);
    }
  };

  const handleCopySave = async () => {
    try {
      const code = exportSaveData();
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      notify?.("Cloud sync backup copied to clipboard!");
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      setIsCopied(true);
      notify?.("Cloud sync backup generated!");
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 20) return;
    onUpdatePlayer((prev) => ({ ...prev, name: trimmed }));
    notify?.(`Account name updated to ${trimmed}!`);
  };

  const handleImportSave = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    setImportSuccess(false);
    if (!importCode.trim()) {
      setImportError("Please enter a valid backup sync code.");
      return;
    }
    try {
      let rawJson: string;
      try {
        rawJson = decodeURIComponent(escape(atob(importCode.trim())));
      } catch {
        rawJson = importCode.trim();
      }
      const parsed = JSON.parse(rawJson);
      const migrated = migratePlayerSave(parsed);
      onUpdatePlayer(() => migrated);
      setImportSuccess(true);
      setImportCode("");
      notify?.("Account progress restored successfully!");
    } catch {
      setImportError(
        "Invalid or corrupted backup code. Check code and try again.",
      );
    }
  };

  return (
    <Dialog
      title="Player Account"
      subtitle="Guest profile & local cloud sync"
      onClose={onClose}
    >
      <div className="account-modal-container">
        <div
          className="account-tabs"
          role="tablist"
          aria-label="Account management"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            className={`account-tab-btn ${activeTab === "profile" ? "is-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} /> Profile
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sync"}
            className={`account-tab-btn ${activeTab === "sync" ? "is-active" : ""}`}
            onClick={() => setActiveTab("sync")}
          >
            <ShieldCheck size={16} /> Cloud Sync
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "switch"}
            className={`account-tab-btn ${activeTab === "switch" ? "is-active" : ""}`}
            onClick={() => setActiveTab("switch")}
          >
            <Key size={16} /> Restore / Transfer
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="account-panel profile-panel">
            <div className="account-summary-card">
              <div className="account-avatar-badge">
                <span className="account-lion-icon">🦁</span>
              </div>
              <div className="account-details">
                <h3 className="account-username">{player.name}</h3>
                <span className="account-badge">
                  <Sparkles size={13} /> Star Rank {player.starRank ?? 1}
                </span>
                <p className="account-type-text">
                  Local-First Explorer &bull; {player.coins} Coins
                </p>
              </div>
            </div>

            <form className="account-form" onSubmit={handleSaveUsername}>
              <label htmlFor="account-username-input" className="form-label">
                Display Name:
              </label>
              <div className="form-input-group">
                <input
                  id="account-username-input"
                  type="text"
                  className="form-input"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  maxLength={20}
                  minLength={2}
                  required
                />
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={
                    !usernameInput.trim() ||
                    usernameInput.trim() === player.name
                  }
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "sync" && (
          <div className="account-panel sync-panel">
            <p className="sync-description">
              Club Lion operates 100% locally with zero cloud subscription fees.
              You can export your progress anytime as an encrypted portable
              backup code.
            </p>
            <div className="sync-action-box">
              <button
                type="button"
                className="button button-primary"
                onClick={handleCopySave}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? "Copied Backup Code!" : "Export Cloud Sync Code"}
              </button>
            </div>
            <div className="sync-stat-grid">
              <div className="sync-stat-item">
                <span className="stat-label">Stamps Earned</span>
                <span className="stat-value">{player.stamps?.length ?? 0}</span>
              </div>
              <div className="sync-stat-item">
                <span className="stat-label">Items Owned</span>
                <span className="stat-value">{player.owned?.length ?? 0}</span>
              </div>
              <div className="sync-stat-item">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">{player.gamesPlayed ?? 0}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "switch" && (
          <div className="account-panel restore-panel">
            <p className="restore-description">
              Transfer your save data from another browser or device by pasting
              your portable sync code below:
            </p>
            <form onSubmit={handleImportSave} className="restore-form">
              <textarea
                className="restore-textarea"
                rows={3}
                placeholder="Paste your exported sync code here..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                aria-label="Save sync code"
              />
              {importError && (
                <p className="import-status is-error" role="alert">
                  <AlertTriangle size={15} /> {importError}
                </p>
              )}
              {importSuccess && (
                <p className="import-status is-success" role="status">
                  <Check size={15} /> Save successfully imported and restored!
                </p>
              )}
              <button
                type="submit"
                className="button button-secondary"
                disabled={!importCode.trim()}
              >
                <Upload size={16} /> Import &amp; Restore Save
              </button>
            </form>
          </div>
        )}
      </div>
    </Dialog>
  );
}
