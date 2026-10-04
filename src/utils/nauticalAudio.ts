import { getSharedAudioBus } from "./audioBus.ts";

/** Finite voices always feed the shared SFX bus, including injected contexts. */
function playVoice(
  audioCtx: AudioContext | null | undefined,
  build: (
    ctx: AudioContext,
    destination: AudioNode,
    track: <T extends AudioNode>(node: T) => T,
    cleanup: () => void,
  ) => void,
): void {
  const nodes: AudioNode[] = [];
  const cleanup = () => {
    for (const node of nodes) {
      try {
        if ("stop" in node) (node as AudioScheduledSourceNode).stop();
      } catch {
        /* A completed source may already be stopped. */
      }
      try {
        node.disconnect();
      } catch {
        /* Audio device may be unavailable. */
      }
    }
  };
  try {
    if (audioCtx === null) return;
    const bus = getSharedAudioBus();
    const ctx = audioCtx ?? bus.getContext();
    const destination = bus.getSfxDestination();
    // Web Audio forbids connections between different AudioContexts.
    if (
      !ctx ||
      ctx !== bus.getContext() ||
      !destination ||
      ctx.state === "closed"
    )
      return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    build(
      ctx,
      destination,
      (node) => {
        nodes.push(node);
        return node;
      },
      cleanup,
    );
  } catch {
    cleanup();
  }
}

/** A brass fifth with a gentle attack and a synthesized stereo room tail. */
export function playFoghorn(audioCtx?: AudioContext | null): void {
  playVoice(audioCtx, (ctx, destination, track, cleanup) => {
    const now = ctx.currentTime;
    const sustainEnd = now + 1.5;
    const stop = sustainEnd + 0.3;
    const filter = track(ctx.createBiquadFilter());
    filter.type = "lowpass";
    filter.frequency.value = 450;
    filter.Q.value = 0.8;
    const envelope = track(ctx.createGain());
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.exponentialRampToValueAtTime(0.16, now + 0.04);
    envelope.gain.setValueAtTime(0.16, sustainEnd);
    envelope.gain.exponentialRampToValueAtTime(0.001, stop);
    filter.connect(envelope);
    envelope.connect(destination);

    const room = track(ctx.createConvolver());
    const impulse = ctx.createBuffer(
      2,
      Math.ceil(ctx.sampleRate * 1.2),
      ctx.sampleRate,
    );
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.exp((-7 * i) / data.length);
    }
    room.buffer = impulse;
    const wet = track(ctx.createGain());
    wet.gain.value = 0.22;
    envelope.connect(room);
    room.connect(wet);
    wet.connect(destination);

    for (const frequency of [110, 165]) {
      const oscillator = track(ctx.createOscillator());
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.connect(filter);
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
        } catch {
          /* Device lost. */
        }
      };
      oscillator.start(now);
      oscillator.stop(stop);
    }
    // A silent audio-clock voice retains the graph until the reverb finishes,
    // even if the context is suspended. No wall-clock timer truncates its tail.
    const tailClock = track(ctx.createBufferSource());
    tailClock.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    tailClock.loop = true;
    tailClock.connect(destination);
    tailClock.onended = cleanup;
    tailClock.start(now);
    tailClock.stop(stop + 1.2);
  });
}

let stopSurf: (() => void) | null = null;

/** Cancel the current ambient wave when sound is disabled or the room changes. */
export function stopOceanSurf(): void {
  stopSurf?.();
}

/** One gentle six-second wash of procedurally generated, lowpassed noise. */
export function playOceanSurf(audioCtx?: AudioContext | null): void {
  stopOceanSurf();
  playVoice(audioCtx, (ctx, destination, track, cleanup) => {
    const now = ctx.currentTime;
    const noise = track(ctx.createBufferSource());
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * 6),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const filter = track(ctx.createBiquadFilter());
    filter.type = "lowpass";
    filter.frequency.value = 650;
    filter.Q.value = 0.4;
    const envelope = track(ctx.createGain());
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.exponentialRampToValueAtTime(0.12, now + 2);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 6);
    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(destination);
    const stop = () => {
      if (stopSurf === stop) stopSurf = null;
      cleanup();
    };
    noise.onended = stop;
    noise.start(now);
    noise.stop(now + 6);
    stopSurf = stop;
  });
}
