import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { Dialog } from "./Dialog";
import {
  JUKEBOX_TRACKS,
  getSharedJukeboxController,
  type TrackId,
} from "../utils/proceduralJukebox.ts";

export function JukeboxModal({ onClose }: { onClose: () => void }) {
  const controller = getSharedJukeboxController();
  const [currentTrack, setCurrentTrack] = useState<TrackId | null>(() =>
    controller.getCurrentTrack(),
  );

  const toggleTrack = (id: TrackId) => {
    if (currentTrack === id) {
      controller.stopTrack();
      setCurrentTrack(null);
      return;
    }
    const started = controller.playTrack(id);
    setCurrentTrack(started ? id : null);
  };

  return (
    <Dialog
      title="Jukebox"
      subtitle="Procedural Savanna soundtracks"
      onClose={onClose}
    >
      <ul className="jukebox-track-list">
        {JUKEBOX_TRACKS.map((track) => {
          const isActive = currentTrack === track.id;
          return (
            <li key={track.id} className="jukebox-track">
              <button
                type="button"
                className={`jukebox-track-button ${isActive ? "is-active" : ""}`}
                aria-pressed={isActive}
                aria-label={
                  isActive ? `Pause ${track.title}` : `Play ${track.title}`
                }
                onClick={() => toggleTrack(track.id)}
              >
                <span className="jukebox-track-play-icon" aria-hidden="true">
                  {isActive ? <Pause size={20} /> : <Play size={20} />}
                </span>
                <span className="jukebox-track-info">
                  <span className="jukebox-track-title">{track.title}</span>
                  <span className="jukebox-track-meta">
                    {track.genre} &middot; {track.bpm} BPM &middot; {track.mood}
                  </span>
                  <span className="jukebox-track-description">
                    {track.description}
                  </span>
                </span>
                <span
                  className={`jukebox-visualizer ${isActive ? "is-playing" : ""}`}
                  aria-hidden="true"
                >
                  <span className="jukebox-visualizer-bar" />
                  <span className="jukebox-visualizer-bar" />
                  <span className="jukebox-visualizer-bar" />
                  <span className="jukebox-visualizer-bar" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
