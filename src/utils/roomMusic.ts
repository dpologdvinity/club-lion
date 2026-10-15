import type { PlaceId } from "../game.ts";

/**
 * Pure room soundtrack data and scheduling rules. Each room gets a short
 * looping track written as scale degrees, so the same room id and tick always
 * produce the same notes. The Web Audio side lives in roomMusicPlayer.ts.
 */

export type ToneVoice =
  | "music-box"
  | "marimba"
  | "bell"
  | "steel-drum"
  | "ukulele"
  | "pizzicato"
  | "pad"
  | "lounge"
  | "calliope"
  | "pulse";

export type RoomVoice =
  ToneVoice | "kick" | "hat" | "snare" | "splash" | "seagull";

/** One loop step: a scale degree, a chord (several degrees), or `null` for a rest. */
export type RoomPatternEntry = number | readonly number[] | null;

export type RoomLayer = {
  voice: RoomVoice;
  /** One entry per loop step; length must equal the track's `loopSteps`. */
  pattern: readonly RoomPatternEntry[];
  /** Semitones added to the pitch (use +12 or -12 to move an octave). */
  transpose?: number;
  /** Relative loudness, 0 to 1. Defaults to 1. */
  level?: number;
};

/** Continuous ambience: a filtered noise bed that swells slowly, like waves or wind. */
export type RoomBed = {
  filter: "lowpass" | "bandpass";
  cutoff: number;
  q: number;
  level: number;
  swellHz: number;
  /** Must stay at or below `level` so the bed never goes negative. */
  swellDepth: number;
};

export type RoomMusicTrack = {
  id: string;
  bpm: number;
  stepsPerBeat: number;
  beatsPerBar: number;
  loopSteps: number;
  /** Semitone offsets of the scale steps within one octave. */
  scale: readonly number[];
  /** MIDI note of scale degree 0. */
  root: number;
  layers: readonly RoomLayer[];
  bed?: RoomBed;
};

export type RoomNote = { voice: RoomVoice; midi: number; level: number };

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_PENTATONIC = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC = [0, 3, 5, 7, 10];

const WAVE_BED: RoomBed = {
  filter: "lowpass",
  cutoff: 900,
  q: 0.7,
  level: 0.05,
  swellHz: 0.09,
  swellDepth: 0.03,
};
const WIND_BED: RoomBed = {
  filter: "bandpass",
  cutoff: 500,
  q: 0.8,
  level: 0.05,
  swellHz: 0.06,
  swellDepth: 0.03,
};
const RIVER_BED: RoomBed = {
  filter: "bandpass",
  cutoff: 1200,
  q: 0.6,
  level: 0.07,
  swellHz: 0.25,
  swellDepth: 0.03,
};
const HUM_BED: RoomBed = {
  filter: "bandpass",
  cutoff: 200,
  q: 1,
  level: 0.05,
  swellHz: 0.1,
  swellDepth: 0.02,
};

function parseToken(token: string): RoomPatternEntry {
  if (token === ".") return null;
  const degrees = token.split("+").map(Number);
  return degrees.length === 1 ? (degrees[0] ?? null) : degrees;
}

/** Space-separated tokens: a digit is a degree, `a+b` a chord, `.` a rest. */
function steps(text: string, repeat = 1): RoomPatternEntry[] {
  const tokens = text.trim().split(/\s+/);
  const pattern: RoomPatternEntry[] = [];
  for (let i = 0; i < repeat; i++) {
    for (const token of tokens) pattern.push(parseToken(token));
  }
  return pattern;
}

/** Joins bar strings, each written with exactly one bar's worth of tokens. */
function bars(...barTexts: string[]): RoomPatternEntry[] {
  return steps(barTexts.join(" "));
}

/** Sparse hits: `hits[index]` sounds at that step, every other step rests. */
function at(
  length: number,
  hits: Readonly<Record<number, RoomPatternEntry>>,
): RoomPatternEntry[] {
  return Array.from({ length }, (_, index) => hits[index] ?? null);
}

/** Repeating hits every `every` steps, starting at `offset`. */
function grid(
  length: number,
  every: number,
  offset: number,
  entry: RoomPatternEntry,
): RoomPatternEntry[] {
  return Array.from({ length }, (_, index) =>
    index >= offset && (index - offset) % every === 0 ? entry : null,
  );
}

const PLAZA_WALTZ: RoomMusicTrack = {
  id: "plaza-music-box-waltz",
  bpm: 108,
  stepsPerBeat: 2,
  beatsPerBar: 3,
  loopSteps: 24,
  scale: MAJOR,
  root: 60,
  layers: [
    {
      voice: "music-box",
      pattern: bars("0 . 2 . 4 .", "5 . 4 . 2 .", "3 . 4 . 5 .", "4 . 2 . 0 ."),
    },
    {
      voice: "marimba",
      transpose: -12,
      level: 0.6,
      pattern: bars("0 . 4 . 4 .", "3 . 0 . 0 .", "4 . 1 . 1 .", "0 . 4 . 4 ."),
    },
  ],
};

const CLUB_PULSE_GROOVE: RoomMusicTrack = {
  id: "club-pulse-groove",
  bpm: 116,
  stepsPerBeat: 2,
  beatsPerBar: 4,
  loopSteps: 32,
  scale: MINOR_PENTATONIC,
  root: 60,
  layers: [
    { voice: "kick", level: 0.5, pattern: steps("0 . 0 . 0 . 0 .", 4) },
    { voice: "hat", level: 0.35, pattern: steps("0 0 0 0 0 0 0 0", 4) },
    {
      voice: "pulse",
      transpose: -12,
      level: 0.7,
      pattern: bars(
        "0 . 0 . 3 . 2 .",
        "2 . 2 . 0 . 3 .",
        "4 . 4 . 3 . 2 .",
        "0 . 0 . 3 . 4 .",
      ),
    },
    {
      voice: "marimba",
      transpose: 12,
      level: 0.8,
      pattern: bars(
        "4 . 3 . 2 . 3 .",
        "0 . 1 . 2 . 3 .",
        "4 . 3 . 2 . 1 .",
        "0 . 2 . 4 . 2 .",
      ),
    },
  ],
};

const WONDER_PARK_CALLIOPE: RoomMusicTrack = {
  id: "wonder-park-calliope",
  bpm: 120,
  stepsPerBeat: 2,
  beatsPerBar: 3,
  loopSteps: 24,
  scale: MAJOR,
  root: 60,
  layers: [
    {
      voice: "calliope",
      transpose: 12,
      level: 0.8,
      pattern: bars("0 2 4 2 4 .", "5 4 2 4 2 .", "4 5 7 5 4 2", "1 2 4 2 0 ."),
    },
    {
      voice: "calliope",
      transpose: -12,
      level: 0.5,
      pattern: steps("0 . 4 . 4 .", 4),
    },
  ],
};

const SUNSET_BEACH_UKULELE: RoomMusicTrack = {
  id: "sunset-beach-ukulele",
  bpm: 92,
  stepsPerBeat: 2,
  beatsPerBar: 4,
  loopSteps: 32,
  scale: MAJOR,
  root: 60,
  layers: [
    {
      voice: "ukulele",
      level: 0.9,
      pattern: bars(
        "0+2+4 . . 2 . 4 . .",
        "3+5+7 . . 5 . 7 . .",
        "4+6+8 . . 6 . 8 . .",
        "0+2+4 . . 2 . 0 . .",
      ),
    },
  ],
  bed: WAVE_BED,
};

const COASTAL_PIER_BELLS: RoomMusicTrack = {
  id: "coastal-pier-bells",
  bpm: 80,
  stepsPerBeat: 1,
  beatsPerBar: 4,
  loopSteps: 16,
  scale: MAJOR_PENTATONIC,
  root: 60,
  layers: [
    {
      voice: "bell",
      transpose: 12,
      level: 0.8,
      pattern: at(16, { 0: 0, 4: 2, 8: 4, 12: 2 }),
    },
    { voice: "seagull", pattern: at(16, { 6: 0, 13: 0 }) },
  ],
  bed: WAVE_BED,
};

const MT_MIST_PADS: RoomMusicTrack = {
  id: "mt-mist-pads",
  bpm: 66,
  stepsPerBeat: 1,
  beatsPerBar: 4,
  loopSteps: 16,
  scale: MAJOR,
  root: 60,
  layers: [
    {
      voice: "pad",
      transpose: -12,
      level: 0.9,
      pattern: at(16, {
        0: [0, 2, 4],
        4: [3, 5, 7],
        8: [4, 6, 8],
        12: [0, 2, 4],
      }),
    },
    {
      voice: "bell",
      transpose: 12,
      level: 0.6,
      pattern: at(16, { 2: 4, 6: 2, 10: 5, 14: 2 }),
    },
  ],
  bed: WIND_BED,
};

const CANYON_RAPIDS_DRUMS: RoomMusicTrack = {
  id: "canyon-rapids-drums",
  bpm: 110,
  stepsPerBeat: 2,
  beatsPerBar: 4,
  loopSteps: 32,
  scale: MINOR_PENTATONIC,
  root: 60,
  layers: [
    { voice: "kick", level: 0.8, pattern: grid(32, 4, 0, 0) },
    { voice: "snare", level: 0.6, pattern: grid(32, 4, 2, 0) },
    { voice: "hat", level: 0.35, pattern: grid(32, 1, 0, 0) },
    {
      voice: "marimba",
      level: 0.8,
      pattern: steps("0 . 2 . 3 . 2 .", 4),
    },
  ],
  bed: RIVER_BED,
};

const PET_PARADISE_PIZZICATO: RoomMusicTrack = {
  id: "pet-paradise-pizzicato",
  bpm: 126,
  stepsPerBeat: 2,
  beatsPerBar: 4,
  loopSteps: 32,
  scale: MAJOR,
  root: 60,
  layers: [
    {
      voice: "pizzicato",
      level: 0.9,
      pattern: bars(
        "0 2 4 2 0 . 2 .",
        "4 . 5 4 2 . 4 .",
        "3 5 7 5 3 . 5 .",
        "4 2 0 . 2 4 5 .",
      ),
    },
    {
      voice: "pizzicato",
      transpose: -12,
      level: 0.7,
      pattern: steps("0 . . . 4 . . .", 4),
    },
    {
      voice: "bell",
      transpose: 12,
      level: 0.5,
      pattern: grid(32, 8, 6, 4),
    },
  ],
};

const CONDO_LOUNGE: RoomMusicTrack = {
  id: "condo-lounge",
  bpm: 84,
  stepsPerBeat: 1,
  beatsPerBar: 4,
  loopSteps: 16,
  scale: MAJOR,
  root: 60,
  layers: [
    {
      voice: "lounge",
      transpose: -12,
      level: 0.8,
      pattern: at(16, {
        0: [0, 2, 4, 6],
        4: [3, 5, 7],
        8: [4, 6, 8],
        12: [0, 2, 4, 6],
      }),
    },
    {
      voice: "marimba",
      transpose: 12,
      level: 0.6,
      pattern: at(16, { 2: 4, 6: 2, 10: 5, 14: 2 }),
    },
  ],
};

const SCOUT_BASE_PULSE: RoomMusicTrack = {
  id: "scout-base-pulse",
  bpm: 90,
  stepsPerBeat: 1,
  beatsPerBar: 4,
  loopSteps: 16,
  scale: MINOR_PENTATONIC,
  root: 60,
  layers: [
    {
      voice: "pulse",
      transpose: -12,
      level: 0.7,
      pattern: steps("0 0 0 0 3 3 0 0 0 0 4 4 0 0 2 2"),
    },
    {
      voice: "bell",
      transpose: 12,
      level: 0.5,
      pattern: at(16, { 6: 5, 14: 3 }),
    },
  ],
  bed: HUM_BED,
};

const SPLASH_OASIS_STEEL_DRUM: RoomMusicTrack = {
  id: "splash-oasis-steel-drum",
  bpm: 104,
  stepsPerBeat: 2,
  beatsPerBar: 4,
  loopSteps: 32,
  scale: MAJOR_PENTATONIC,
  root: 60,
  layers: [
    {
      voice: "steel-drum",
      transpose: 12,
      level: 0.8,
      pattern: bars(
        "0 . 2 . 4 . 2 .",
        "3 . 4 . 2 . 1 .",
        "0 . 2 . 4 . 2 .",
        "4 . 2 . 1 . 0 .",
      ),
    },
    {
      voice: "steel-drum",
      transpose: -12,
      level: 0.6,
      pattern: steps("0 . . . 4 . . .", 4),
    },
    { voice: "splash", level: 0.6, pattern: grid(32, 8, 6, 0) },
  ],
  bed: WAVE_BED,
};

const LION_SPEEDWAY_RACE: RoomMusicTrack = {
  id: "lion-speedway-race",
  bpm: 140,
  stepsPerBeat: 2,
  beatsPerBar: 4,
  loopSteps: 32,
  scale: MAJOR,
  root: 60,
  layers: [
    { voice: "kick", level: 0.7, pattern: grid(32, 4, 0, 0) },
    { voice: "snare", level: 0.5, pattern: grid(32, 4, 2, 0) },
    { voice: "hat", level: 0.3, pattern: grid(32, 1, 0, 0) },
    {
      voice: "pulse",
      transpose: -12,
      level: 0.6,
      pattern: steps("0 . 0 . 4 . 4 .", 4),
    },
    {
      voice: "marimba",
      level: 0.9,
      pattern: bars(
        "4 5 7 5 4 . 2 .",
        "2 3 5 3 2 . 0 .",
        "4 5 7 5 4 . 2 .",
        "5 4 2 0 . 2 4 .",
      ),
    },
  ],
};

/** Gentle default for rooms that have no track of their own, including later rooms. */
export const ROOM_MUSIC_FALLBACK: RoomMusicTrack = {
  id: "fallback-music-box",
  bpm: 84,
  stepsPerBeat: 1,
  beatsPerBar: 4,
  loopSteps: 16,
  scale: MAJOR_PENTATONIC,
  root: 60,
  layers: [
    {
      voice: "music-box",
      pattern: steps("0 . 2 . 4 . 2 . 3 . 4 . 2 . 0 ."),
    },
    {
      voice: "pad",
      transpose: -12,
      level: 0.7,
      pattern: at(16, { 0: [0, 2, 4], 8: [3, 4, 0] }),
    },
  ],
};

export const ROOM_MUSIC_TRACKS: Record<PlaceId, RoomMusicTrack> = {
  square: PLAZA_WALTZ,
  "downtown-plaza": PLAZA_WALTZ,
  water: SUNSET_BEACH_UKULELE,
  cafe: CONDO_LOUNGE,
  arcade: CLUB_PULSE_GROOVE,
  den: MT_MIST_PADS,
  "wonder-park-entrance": WONDER_PARK_CALLIOPE,
  "wonder-park-midway": WONDER_PARK_CALLIOPE,
  "club-pulse": CLUB_PULSE_GROOVE,
  "splash-oasis-entry": SPLASH_OASIS_STEEL_DRUM,
  "splash-oasis-river": SPLASH_OASIS_STEEL_DRUM,
  "penthouse-condo": CONDO_LOUNGE,
  "secret-scout-base": SCOUT_BASE_PULSE,
  "sunset-beach": SUNSET_BEACH_UKULELE,
  "coastal-pier": COASTAL_PIER_BELLS,
  "mt-mist": MT_MIST_PADS,
  "canyon-rapids": CANYON_RAPIDS_DRUMS,
  "pet-paradise": PET_PARADISE_PIZZICATO,
  "lion-speedway": LION_SPEEDWAY_RACE,
  "lion-aquarium": COASTAL_PIER_BELLS,
  "snowflake-rink": MT_MIST_PADS,
};

const TRACKS_BY_ROOM: Partial<Record<string, RoomMusicTrack>> =
  ROOM_MUSIC_TRACKS;

/** Track for a room id; unknown or future room ids get the fallback track. */
export function roomMusicFor(placeId: string): RoomMusicTrack {
  return TRACKS_BY_ROOM[placeId] ?? ROOM_MUSIC_FALLBACK;
}

/** Scale degree to MIDI note; degrees past the octave climb by 12 semitones. */
export function degreeToMidi(track: RoomMusicTrack, degree: number): number {
  const size = track.scale.length;
  const octave = Math.floor(degree / size);
  const within = degree - octave * size;
  return track.root + octave * 12 + (track.scale[within] ?? 0);
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function roomStepSeconds(track: RoomMusicTrack): number {
  return 60 / (track.bpm * track.stepsPerBeat);
}

/** Notes every layer sounds at a given tick. The loop wraps, so tick is unbounded. */
export function roomNotesAt(track: RoomMusicTrack, tick: number): RoomNote[] {
  const notes: RoomNote[] = [];
  for (const layer of track.layers) {
    const entry = layer.pattern[tick % layer.pattern.length] ?? null;
    if (entry === null) continue;
    const degrees = typeof entry === "number" ? [entry] : entry;
    for (const degree of degrees) {
      notes.push({
        voice: layer.voice,
        midi: degreeToMidi(track, degree) + (layer.transpose ?? 0),
        level: layer.level ?? 1,
      });
    }
  }
  return notes;
}

export function roomNotesFor(placeId: string, tick: number): RoomNote[] {
  return roomNotesAt(roomMusicFor(placeId), tick);
}

export type RoomMusicState = {
  /** Room music is switched on (the World speaker button). */
  on: boolean;
  /** The tab is visible. Hidden tabs stay silent. */
  visible: boolean;
  musicMuted: boolean;
  masterMuted: boolean;
  /** A jukebox track is playing; it takes over from the room bed. */
  jukeboxPlaying: boolean;
};

export function shouldPlayRoomMusic(state: RoomMusicState): boolean {
  return (
    state.on &&
    state.visible &&
    !state.musicMuted &&
    !state.masterMuted &&
    !state.jukeboxPlaying
  );
}
