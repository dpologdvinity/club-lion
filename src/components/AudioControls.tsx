import { useEffect, useState } from "react";
import { Volume2, Volume1, VolumeX, Music, Drum } from "lucide-react";
import { getSharedJukeboxController } from "../utils/proceduralJukebox.ts";
import { getSharedAudioBus } from "../utils/audioBus.ts";
import {
  readShortcutKey,
  shouldHandleMuteShortcut,
} from "../utils/audioShortcut.ts";

export function AudioControls() {
  const controller = getSharedJukeboxController();
  const bus = getSharedAudioBus();
  const [volume, setVolume] = useState(() =>
    Math.round(controller.getMusicVolume() * 100),
  );
  const [masterMuted, setMasterMuted] = useState(() => bus.isMasterMuted());
  const [musicMuted, setMusicMuted] = useState(() => bus.isMusicMuted());
  const [sfxMuted, setSfxMuted] = useState(() => bus.isSfxMuted());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const targetLike = target
        ? {
            tagName: target.tagName,
            isContentEditable: target.isContentEditable,
            type: (target as HTMLInputElement).type,
          }
        : null;
      if (!shouldHandleMuteShortcut(e, targetLike, readShortcutKey())) return;
      setMasterMuted((prev) => {
        const next = !prev;
        bus.setMasterMuted(next);
        return next;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bus]);

  const handleVolumeChange = (next: number) => {
    setVolume(next);
    controller.setMusicVolume(next / 100);
  };

  const toggleMasterMuted = () => {
    setMasterMuted((prev) => {
      const next = !prev;
      bus.setMasterMuted(next);
      return next;
    });
  };

  const toggleMusicMuted = () => {
    setMusicMuted((prev) => {
      const next = !prev;
      bus.setMusicMuted(next);
      return next;
    });
  };

  const toggleSfxMuted = () => {
    setSfxMuted((prev) => {
      const next = !prev;
      bus.setSfxMuted(next);
      return next;
    });
  };

  const Icon =
    masterMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const iconLabel = masterMuted
    ? "Muted"
    : volume < 50
      ? "Volume low"
      : "Volume high";

  return (
    <div className="audio-controls" role="group" aria-label="Audio controls">
      <button
        type="button"
        className="icon-button audio-controls-mute"
        aria-label={masterMuted ? "Unmute audio" : "Mute audio"}
        aria-pressed={masterMuted}
        title="Mute (M)"
        onClick={toggleMasterMuted}
      >
        <Icon size={18} aria-hidden="true" />
        <span className="sr-only">{iconLabel}</span>
      </button>
      <input
        type="range"
        className="audio-controls-slider"
        min={0}
        max={100}
        step={1}
        value={volume}
        disabled={masterMuted}
        aria-label="Music volume"
        aria-valuetext={`${volume}%`}
        onChange={(e) => handleVolumeChange(Number(e.target.value))}
      />
      <span className="audio-controls-value" aria-hidden="true">
        {masterMuted ? "Muted" : `${volume}%`}
      </span>
      <button
        type="button"
        className="icon-button audio-controls-channel"
        aria-label={musicMuted ? "Unmute music" : "Mute music"}
        aria-pressed={musicMuted}
        title="Toggle music"
        onClick={toggleMusicMuted}
      >
        <Music size={16} aria-hidden="true" />
        <span className="sr-only">
          {musicMuted ? "Music muted" : "Music on"}
        </span>
      </button>
      <button
        type="button"
        className="icon-button audio-controls-channel"
        aria-label={sfxMuted ? "Unmute sound effects" : "Mute sound effects"}
        aria-pressed={sfxMuted}
        title="Toggle sound effects"
        onClick={toggleSfxMuted}
      >
        <Drum size={16} aria-hidden="true" />
        <span className="sr-only">{sfxMuted ? "SFX muted" : "SFX on"}</span>
      </button>
    </div>
  );
}
