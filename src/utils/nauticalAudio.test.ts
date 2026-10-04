import test from "node:test";
import assert from "node:assert/strict";
import { playFoghorn, playOceanSurf, stopOceanSurf } from "./nauticalAudio.ts";
import { getSharedAudioBus, resetSharedAudioBusForTests } from "./audioBus.ts";

function fakeContext() {
  const nodes: ReturnType<typeof node>[] = [];
  function param() {
    return {
      value: 1,
      events: [] as [string, number, number][],
      setValueAtTime(value: number, time: number) {
        this.events.push(["set", value, time]);
      },
      exponentialRampToValueAtTime(value: number, time: number) {
        this.events.push(["exponential", value, time]);
      },
      linearRampToValueAtTime(value: number, time: number) {
        this.events.push(["linear", value, time]);
      },
    };
  }
  function node(kind: string) {
    const result = {
      kind,
      type: "",
      gain: param(),
      frequency: param(),
      Q: param(),
      buffer: null as AudioBuffer | null,
      connections: [] as unknown[],
      disconnected: false,
      onended: null as (() => void) | null,
      starts: [] as number[],
      stops: [] as number[],
      connect(dest: unknown) {
        this.connections.push(dest);
      },
      disconnect() {
        this.disconnected = true;
      },
      start(time: number) {
        this.starts.push(time);
      },
      stop(time: number) {
        this.stops.push(time);
      },
    };
    return result;
  }
  const createNode = (kind: string) => {
    const result = node(kind);
    nodes.push(result);
    return result;
  };
  const ctx = {
    currentTime: 10,
    sampleRate: 1000,
    state: "running",
    destination: {},
    createGain: () => createNode("gain"),
    createOscillator: () => createNode("oscillator"),
    createBiquadFilter: () => createNode("filter"),
    createConvolver: () => createNode("convolver"),
    createBufferSource: () => createNode("buffer"),
    createBuffer: (channels: number, length: number, sampleRate: number) => {
      const data = Array.from(
        { length: channels },
        () => new Float32Array(length),
      );
      return {
        length,
        duration: length / sampleRate,
        numberOfChannels: channels,
        getChannelData: (i: number) => data[i],
      };
    },
    resume: () => Promise.resolve(),
  };
  return { ctx: ctx as unknown as AudioContext, nodes };
}

function withContext(run: (fake: ReturnType<typeof fakeContext>) => void) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  const fake = fakeContext();
  resetSharedAudioBusForTests();
  let constructions = 0;
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: function () {
      constructions++;
      return fake.ctx;
    },
  });
  try {
    run(fake);
    assert.equal(constructions, 1);
  } finally {
    resetSharedAudioBusForTests();
    if (original) Object.defineProperty(globalThis, "AudioContext", original);
    else Reflect.deleteProperty(globalThis, "AudioContext");
  }
}

test("foghorn uses the shared SFX bus, two deep fifth tones, a 40ms attack and room decay", () => {
  withContext(({ ctx, nodes }) => {
    const bus = getSharedAudioBus();
    const start = nodes.length;
    playFoghorn();
    playFoghorn(ctx);
    assert.equal(getSharedAudioBus(), bus);
    const voices = nodes.slice(start);
    const oscillators = voices.filter((n) => n.kind === "oscillator");
    assert.deepEqual(
      oscillators.map((n) => n.frequency.events[0][1]),
      [110, 165, 110, 165],
    );
    assert.ok(
      voices.some(
        (n) =>
          n.kind === "filter" &&
          n.type === "lowpass" &&
          n.frequency.value === 450,
      ),
    );
    assert.ok(
      voices.some((n) =>
        n.gain.events.some(
          ([kind, , time]) => kind === "exponential" && time === 10.04,
        ),
      ),
    );
    const reverb = voices.find((n) => n.kind === "convolver");
    assert.equal(reverb?.buffer?.duration, 1.2);
    assert.equal(reverb?.buffer?.numberOfChannels, 2);
    assert.ok(
      voices.some((n) => n.connections.includes(bus.getSfxDestination())),
    );
    assert.ok(voices.every((n) => !n.connections.includes(ctx.destination)));
    for (const source of voices.filter(
      (n) => n.kind === "oscillator" || n.kind === "buffer",
    ))
      source.onended?.();
    assert.ok(
      voices.every((n) => n.disconnected),
      "completed voices and processing nodes must disconnect",
    );
  });
});

test("ocean surf synthesizes finite filtered noise and disconnects after the wave", () => {
  withContext(({ nodes }) => {
    const bus = getSharedAudioBus();
    const start = nodes.length;
    playOceanSurf();
    const voices = nodes.slice(start);
    const source = voices.find((n) => n.kind === "buffer");
    assert.ok(source?.buffer);
    assert.ok(source.buffer.getChannelData(0).some((n) => n !== 0));
    assert.ok(
      source.stops.length > 0,
      "surf must end without retaining looping voices",
    );
    assert.ok(voices.some((n) => n.kind === "filter" && n.type === "lowpass"));
    assert.ok(
      voices.some((n) => n.connections.includes(bus.getSfxDestination())),
    );
    source.onended?.();
    assert.ok(voices.every((n) => n.disconnected));
  });
});

test("nautical audio never throws for null, missing or throwing AudioContext", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  try {
    for (const value of [
      undefined,
      function () {
        throw new Error("unavailable");
      },
    ]) {
      resetSharedAudioBusForTests();
      Object.defineProperty(globalThis, "AudioContext", {
        configurable: true,
        value,
      });
      assert.doesNotThrow(() => {
        playFoghorn();
        playOceanSurf();
        playFoghorn(null);
        playOceanSurf(null);
      });
    }
  } finally {
    resetSharedAudioBusForTests();
    if (original) Object.defineProperty(globalThis, "AudioContext", original);
    else Reflect.deleteProperty(globalThis, "AudioContext");
  }
});

test("failed audio setup disconnects partial nodes without throwing", () => {
  withContext(({ ctx, nodes }) => {
    getSharedAudioBus();
    const start = nodes.length;
    ctx.createBiquadFilter = () => {
      throw new Error("audio device lost");
    };
    assert.doesNotThrow(() => {
      playFoghorn(ctx);
      playOceanSurf(ctx);
    });
    assert.ok(nodes.slice(start).every((n) => n.disconnected));
  });
});

test("leaving the coast or disabling sound stops the active surf voice", () => {
  withContext(({ nodes }) => {
    getSharedAudioBus();
    const start = nodes.length;
    playOceanSurf();
    stopOceanSurf();
    assert.ok(nodes.slice(start).every((n) => n.disconnected));
    assert.doesNotThrow(() => stopOceanSurf());
  });
});
