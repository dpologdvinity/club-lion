import { getSharedAudioBus, type AudioBus } from "./audioBus.ts";

/** Toast text a voice can read: emoji and symbols dropped, spaces collapsed. */
export function spokenText(message: string): string {
  return message
    .replace(/[^\p{L}\p{N}\s.,!?'’…-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reads short messages aloud for children who cannot read yet; silent when sound effects are muted. */
export function speak(message: string, bus: AudioBus = getSharedAudioBus()) {
  const synth = globalThis.speechSynthesis;
  const text = spokenText(message);
  if (
    !synth ||
    typeof SpeechSynthesisUtterance === "undefined" ||
    !text ||
    bus.isMasterMuted() ||
    bus.isSfxMuted()
  )
    return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.2;
  utterance.volume = bus.getMasterVolume();
  synth.speak(utterance);
}
