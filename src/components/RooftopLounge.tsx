import { useState, useEffect, useRef } from "react";
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Disc,
  Sliders,
  Zap,
  Sparkles,
} from "lucide-react";
import { Dialog } from "./Dialog";
import { DJMixerEngine, type DJState } from "../utils/djMixing.ts";

interface RooftopLoungeProps {
  onClose: () => void;
}

export function RooftopLounge({ onClose }: RooftopLoungeProps) {
  const engineRef = useRef<DJMixerEngine | null>(null);
  const [djState, setDjState] = useState<DJState>({
    bpm: 128,
    isPlaying: false,
    crossfader: 0.5,
    filterCutoff: 1800,
    bassMuted: false,
    drumsMuted: false,
    leadMuted: false,
  });
  const [partyMode, setPartyMode] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const engine = new DJMixerEngine();
    engineRef.current = engine;
    setDjState(engine.getState());

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Visualizer step interval when playing
  useEffect(() => {
    if (!djState.isPlaying) {
      setActiveStep(0);
      return;
    }
    const stepInterval = (60 / djState.bpm / 4) * 1000;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 16);
    }, stepInterval);

    return () => clearInterval(interval);
  }, [djState.isPlaying, djState.bpm]);

  const handleTogglePlay = () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (djState.isPlaying) {
      engine.stop();
    } else {
      engine.start();
    }
    setDjState(engine.getState());
  };

  const handleBpmChange = (newBpm: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setBpm(newBpm);
    setDjState(engine.getState());
  };

  const handleCrossfaderChange = (val: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setCrossfader(val);
    setDjState(engine.getState());
  };

  const handleFilterChange = (hz: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setFilterCutoff(hz);
    setDjState(engine.getState());
  };

  const handleToggleMute = (track: "bass" | "drums" | "lead") => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.toggleMute(track);
    setDjState(engine.getState());
  };

  const handleAirhorn = () => {
    engineRef.current?.triggerAirhorn();
  };

  return (
    <Dialog
      title="VIP Penthouse Rooftop Lounge"
      subtitle="Neon skyline views & live Web Audio DJ mixing desk"
      onClose={onClose}
      wide
    >
      <div className={`rooftop-lounge ${partyMode ? "party-mode-active" : ""}`}>
        {/* Rooftop Skyline Panorama Banner */}
        <div className="rooftop-skyline-banner">
          <div className="skyline-neon-backdrop" />
          <div className="skyline-lasers" aria-hidden="true">
            <span className="laser-beam beam-1" />
            <span className="laser-beam beam-2" />
            <span className="laser-beam beam-3" />
          </div>
          <div className="skyline-header-info">
            <div className="badge-vip">★ VIP ACCESS ONLY ★</div>
            <h3>Club Lion Skydeck</h3>
            <p>
              Elevated 40 stories above Savanna Square with panoramic skyline
              beats
            </p>
          </div>
          <button
            type="button"
            className={`party-mode-toggle ${partyMode ? "active" : ""}`}
            onClick={() => setPartyMode(!partyMode)}
            aria-pressed={partyMode}
          >
            <Sparkles size={16} />
            <span>{partyMode ? "Party Mode: ON" : "Party Mode"}</span>
          </button>
        </div>

        {/* 16-Step Animated VU Meter */}
        <div
          className="dj-step-visualizer"
          role="region"
          aria-label="DJ 16-step beat sequencer visualizer"
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const isQuarterBeat = i % 4 === 0;
            const isActive = djState.isPlaying && activeStep === i;
            return (
              <span
                key={i}
                className={`step-led ${isQuarterBeat ? "led-beat" : ""} ${isActive ? "led-active" : ""}`}
              />
            );
          })}
        </div>

        {/* DJ Console Board */}
        <div className="dj-console-board">
          {/* Deck Master Controls */}
          <div className="console-section console-master">
            <div className="section-title">
              <Disc size={16} />
              <span>Master Deck</span>
            </div>

            <div className="dj-playback-actions">
              <button
                type="button"
                className={`dj-btn-play ${djState.isPlaying ? "playing" : ""}`}
                onClick={handleTogglePlay}
                aria-label={
                  djState.isPlaying ? "Stop DJ mixer" : "Start DJ mixer"
                }
              >
                {djState.isPlaying ? <Square size={18} /> : <Play size={18} />}
                <span>{djState.isPlaying ? "PAUSE DECK" : "DROP BEAT"}</span>
              </button>

              <button
                type="button"
                className="dj-btn-airhorn"
                onClick={handleAirhorn}
                aria-label="Trigger airhorn sound effect"
              >
                <Zap size={18} />
                <span>AIRHORN</span>
              </button>
            </div>

            {/* Tempo BPM Controls */}
            <div className="console-control-row">
              <div className="control-label">
                <span>Tempo (BPM)</span>
                <strong>{djState.bpm}</strong>
              </div>
              <input
                type="range"
                min="90"
                max="160"
                value={djState.bpm}
                onChange={(e) => handleBpmChange(Number(e.target.value))}
                className="dj-slider"
                aria-label="DJ tempo BPM slider"
              />
              <div className="tempo-presets">
                <button
                  type="button"
                  className={djState.bpm === 120 ? "active" : ""}
                  onClick={() => handleBpmChange(120)}
                >
                  120 House
                </button>
                <button
                  type="button"
                  className={djState.bpm === 128 ? "active" : ""}
                  onClick={() => handleBpmChange(128)}
                >
                  128 Club
                </button>
                <button
                  type="button"
                  className={djState.bpm === 138 ? "active" : ""}
                  onClick={() => handleBpmChange(138)}
                >
                  138 Rave
                </button>
              </div>
            </div>
          </div>

          {/* Mixing Crossfader & Filter Sweeps */}
          <div className="console-section console-mixer">
            <div className="section-title">
              <Sliders size={16} />
              <span>Crossfader & Filter Sweep</span>
            </div>

            {/* Crossfader */}
            <div className="console-control-row">
              <div className="control-label">
                <span>Crossfader (Deck A vs B)</span>
                <span>
                  {Math.round((1 - djState.crossfader) * 100)}% /{" "}
                  {Math.round(djState.crossfader * 100)}%
                </span>
              </div>
              <div className="crossfader-container">
                <span className="deck-tag">DECK A (BASS)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={djState.crossfader}
                  onChange={(e) =>
                    handleCrossfaderChange(Number(e.target.value))
                  }
                  className="dj-slider crossfader-slider"
                  aria-label="Crossfader between deck A and deck B"
                />
                <span className="deck-tag">DECK B (LEAD)</span>
              </div>
            </div>

            {/* Lowpass Filter Cutoff */}
            <div className="console-control-row">
              <div className="control-label">
                <span>Lowpass Resonance Filter</span>
                <strong>{Math.round(djState.filterCutoff)} Hz</strong>
              </div>
              <input
                type="range"
                min="100"
                max="3600"
                step="50"
                value={djState.filterCutoff}
                onChange={(e) => handleFilterChange(Number(e.target.value))}
                className="dj-slider"
                aria-label="Lowpass filter cutoff frequency slider"
              />
            </div>
          </div>

          {/* Stems & Track Mute Panel */}
          <div className="console-section console-stems">
            <div className="section-title">
              <Volume2 size={16} />
              <span>Stem Channels</span>
            </div>

            <div className="stem-toggles">
              <button
                type="button"
                className={`stem-toggle ${djState.bassMuted ? "muted" : "active"}`}
                onClick={() => handleToggleMute("bass")}
                aria-pressed={!djState.bassMuted}
              >
                {djState.bassMuted ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
                <span>808 Bassline</span>
              </button>

              <button
                type="button"
                className={`stem-toggle ${djState.drumsMuted ? "muted" : "active"}`}
                onClick={() => handleToggleMute("drums")}
                aria-pressed={!djState.drumsMuted}
              >
                {djState.drumsMuted ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
                <span>Drums & Hats</span>
              </button>

              <button
                type="button"
                className={`stem-toggle ${djState.leadMuted ? "muted" : "active"}`}
                onClick={() => handleToggleMute("lead")}
                aria-pressed={!djState.leadMuted}
              >
                {djState.leadMuted ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
                <span>Neon Arp Lead</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
