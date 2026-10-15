import { getSharedAudioBus } from "./audioBus.ts";

/** Soft spring "boing" for bumping into solid scenery. Procedural, no asset. */
export function playBoing(audioContextOverride?: AudioContext | null): void {
  try {
    const bus = getSharedAudioBus();
    const ctx =
      audioContextOverride !== undefined
        ? audioContextOverride
        : bus.getContext();
    if (!ctx || ctx.state === "closed") return;

    const destination = bus.getSfxDestination() ?? ctx.destination;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(now);
    osc.stop(now + 0.33);
  } catch {
    // Audio is optional; a bump still animates without it.
  }
}
