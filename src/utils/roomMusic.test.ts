import test from "node:test";
import assert from "node:assert/strict";
import {
  ROOM_MUSIC_FALLBACK,
  ROOM_MUSIC_TRACKS,
  degreeToMidi,
  roomMusicFor,
  roomNotesAt,
  roomNotesFor,
  roomStepSeconds,
  shouldPlayRoomMusic,
  type RoomMusicTrack,
} from "./roomMusic.ts";

const PLACE_IDS = [
  "square",
  "water",
  "cafe",
  "arcade",
  "den",
  "downtown-plaza",
  "wonder-park-entrance",
  "wonder-park-midway",
  "club-pulse",
  "splash-oasis-entry",
  "splash-oasis-river",
  "penthouse-condo",
  "secret-scout-base",
  "sunset-beach",
  "coastal-pier",
  "mt-mist",
  "canyon-rapids",
  "pet-paradise",
  "lion-speedway",
] as const;

const uniqueTracks = [
  ...new Set(PLACE_IDS.map((id) => ROOM_MUSIC_TRACKS[id])),
  ROOM_MUSIC_FALLBACK,
];

test("every place id has its own room music track", () => {
  for (const id of PLACE_IDS) {
    assert.ok(ROOM_MUSIC_TRACKS[id], `missing track for ${id}`);
  }
  assert.equal(Object.keys(ROOM_MUSIC_TRACKS).length, PLACE_IDS.length);
});

test("unknown and later room ids fall back to the gentle default", () => {
  assert.equal(roomMusicFor("future-treehouse"), ROOM_MUSIC_FALLBACK);
  assert.equal(roomMusicFor(""), ROOM_MUSIC_FALLBACK);
});

test("rooms that share a palette share one track id", () => {
  assert.equal(
    roomMusicFor("wonder-park-midway").id,
    roomMusicFor("wonder-park-entrance").id,
  );
  assert.notEqual(
    roomMusicFor("club-pulse").id,
    roomMusicFor("sunset-beach").id,
  );
  const ids = uniqueTracks.map((track) => track.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("notes are deterministic for a room id and tick, and the loop repeats", () => {
  for (const track of uniqueTracks) {
    for (let tick = 0; tick < track.loopSteps; tick++) {
      assert.deepEqual(
        roomNotesAt(track, tick),
        roomNotesAt(track, tick + track.loopSteps),
        `${track.id} tick ${tick} should repeat after the loop`,
      );
    }
  }
  assert.deepEqual(
    roomNotesFor("club-pulse", 5),
    roomNotesFor("club-pulse", 5),
  );
});

test("every layer has one pattern entry per loop step", () => {
  for (const track of uniqueTracks) {
    for (const layer of track.layers) {
      assert.equal(
        layer.pattern.length,
        track.loopSteps,
        `${track.id} has a layer whose pattern length is not ${track.loopSteps}`,
      );
    }
  }
});

test("loops close on a whole bar and last a few seconds", () => {
  for (const track of uniqueTracks) {
    const stepsPerBar = track.stepsPerBeat * track.beatsPerBar;
    assert.equal(track.loopSteps % stepsPerBar, 0, `${track.id} splits a bar`);
    const seconds = track.loopSteps * roomStepSeconds(track);
    assert.ok(seconds >= 5 && seconds <= 20, `${track.id} loop is ${seconds}s`);
  }
});

test("every note is a whole-number degree and sounds in a kid-friendly range", () => {
  for (const track of uniqueTracks) {
    for (let tick = 0; tick < track.loopSteps; tick++) {
      for (const note of roomNotesAt(track, tick)) {
        assert.ok(
          Number.isFinite(note.midi) && note.midi >= 48 && note.midi <= 96,
          `${track.id} tick ${tick} plays MIDI ${note.midi}`,
        );
        assert.ok(note.level > 0 && note.level <= 1, `${track.id} level`);
      }
    }
    for (const layer of track.layers) {
      for (const entry of layer.pattern) {
        const degrees = typeof entry === "number" ? [entry] : (entry ?? []);
        for (const degree of degrees) {
          assert.ok(
            Number.isInteger(degree) && degree >= 0 && degree <= 9,
            `${track.id} has degree ${degree}`,
          );
        }
      }
    }
  }
});

test("every track actually makes sound somewhere in its loop", () => {
  for (const track of uniqueTracks) {
    let notes = 0;
    for (let tick = 0; tick < track.loopSteps; tick++) {
      notes += roomNotesAt(track, tick).length;
    }
    assert.ok(notes > 0, `${track.id} is silent`);
  }
});

test("ambient beds swell without ever dropping below zero", () => {
  for (const track of uniqueTracks) {
    if (!track.bed) continue;
    assert.ok(track.bed.swellDepth <= track.bed.level, `${track.id} bed`);
    assert.ok(track.bed.cutoff > 0, `${track.id} bed cutoff`);
  }
});

test("degrees climb by octaves past the end of the scale", () => {
  const track: RoomMusicTrack = {
    ...ROOM_MUSIC_FALLBACK,
    root: 60,
    scale: [0, 2, 4, 5, 7, 9, 11],
  };
  assert.equal(degreeToMidi(track, 0), 60);
  assert.equal(degreeToMidi(track, 2), 64);
  assert.equal(degreeToMidi(track, 5), 60 + 9);
  assert.equal(degreeToMidi(track, 7), 60 + 12);
});

test("room music plays only when on, visible, unmuted, and no jukebox track", () => {
  const playing = {
    on: true,
    visible: true,
    musicMuted: false,
    masterMuted: false,
    jukeboxPlaying: false,
  };
  assert.equal(shouldPlayRoomMusic(playing), true);
  assert.equal(shouldPlayRoomMusic({ ...playing, on: false }), false);
  assert.equal(shouldPlayRoomMusic({ ...playing, visible: false }), false);
  assert.equal(shouldPlayRoomMusic({ ...playing, musicMuted: true }), false);
  assert.equal(shouldPlayRoomMusic({ ...playing, masterMuted: true }), false);
  assert.equal(
    shouldPlayRoomMusic({ ...playing, jukeboxPlaying: true }),
    false,
  );
});
