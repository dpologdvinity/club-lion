import { useEffect, useRef, useState } from "react";
import { Disc, Heart, Play, Square, Star, Trash2 } from "lucide-react";
import {
  ANIMALS,
  SONG_MAX_TAPS,
  addToSong,
  isBurstTap,
  type AnimalId,
} from "../utils/animalBand.ts";
import { playAnimalSound } from "../utils/animalBandSounds.ts";
import { AnimalArt } from "./AnimalArt";

/** Gap between the notes of a played-back song. */
const NOTE_MS = 650;
const BURST_MS = 900;
const DANCE_MS = 620;

type Dance = { animal: AnimalId; key: number };
type Burst = { animal: AnimalId; key: number; kind: "heart" | "star" };

export function AnimalBand({
  onFinish,
}: {
  /** Called once per song, the first time it plays through. */
  onFinish: (taps: number) => void;
}) {
  const [song, setSong] = useState<AnimalId[]>([]);
  const [recording, setRecording] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const [dance, setDance] = useState<Dance | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const songRef = useRef<AnimalId[]>([]);
  const playingRef = useRef(false);
  const paidRef = useRef(false);
  const tapCount = useRef(0);
  const nextKey = useRef(0);
  const timers = useRef<number[]>([]);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const later = (task: () => void, ms: number) => {
    timers.current.push(window.setTimeout(task, ms));
  };

  const sound = (animal: AnimalId) => {
    playAnimalSound(animal);
    const key = ++nextKey.current;
    setDance({ animal, key });
    later(
      () => setDance((current) => (current?.key === key ? null : current)),
      DANCE_MS,
    );
  };

  const tap = (animal: AnimalId) => {
    sound(animal);
    tapCount.current += 1;
    if (isBurstTap(tapCount.current)) {
      const key = ++nextKey.current;
      const kind = tapCount.current % 10 === 0 ? "star" : "heart";
      setBurst({ animal, key, kind });
      later(
        () => setBurst((current) => (current?.key === key ? null : current)),
        BURST_MS,
      );
    }
    if (!recording) return;
    const next = addToSong(songRef.current, animal);
    songRef.current = next;
    setSong(next);
    if (next.length >= SONG_MAX_TAPS) {
      setRecording(false);
      setAnnouncement("Song full. Press play to hear it.");
    } else {
      setAnnouncement(`${next.length} of ${SONG_MAX_TAPS} taps.`);
    }
  };

  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      setAnnouncement("Recording stopped.");
      return;
    }
    if (playingRef.current) return;
    songRef.current = [];
    paidRef.current = false;
    setSong([]);
    setRecording(true);
    setAnnouncement("Recording. Tap the animals.");
  };

  const clear = () => {
    if (playingRef.current) return;
    songRef.current = [];
    paidRef.current = false;
    setSong([]);
    setRecording(false);
    setAnnouncement("Song cleared.");
  };

  const play = () => {
    const notes = songRef.current;
    if (!notes.length || playingRef.current) return;
    playingRef.current = true;
    setRecording(false);
    setAnnouncement("Playing your song.");
    notes.forEach((animal, index) =>
      later(() => {
        setPlayhead(index);
        sound(animal);
      }, index * NOTE_MS),
    );
    later(() => {
      playingRef.current = false;
      setPlayhead(null);
      if (!paidRef.current) {
        paidRef.current = true;
        finishRef.current(notes.length);
        setAnnouncement("Nice song! Coins for your band.");
      }
    }, notes.length * NOTE_MS);
  };

  return (
    <div className="band-game">
      <div className="band-stage" role="group" aria-label="Animal instruments">
        {ANIMALS.map((animal) => (
          <button
            key={animal.id}
            type="button"
            className="band-animal"
            aria-label={animal.label}
            onClick={() => tap(animal.id)}
          >
            <span
              key={dance?.animal === animal.id ? dance.key : "rest"}
              className={`band-art sm-bob${dance?.animal === animal.id ? " is-dancing" : ""}`}
            >
              <AnimalArt animal={animal.id} />
            </span>
            {burst?.animal === animal.id && (
              <span
                key={burst.key}
                className={`band-burst band-burst-${burst.kind}`}
                aria-hidden="true"
              >
                {burst.kind === "heart" ? (
                  <Heart size={30} fill="currentColor" />
                ) : (
                  <Star size={30} fill="currentColor" />
                )}
                <Heart size={20} fill="currentColor" />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="band-controls">
        <button
          type="button"
          className={`band-control${recording ? " is-live" : ""}`}
          aria-label={recording ? "Stop recording" : "Record a new song"}
          aria-pressed={recording}
          onClick={toggleRecord}
        >
          {recording ? (
            <Square size={28} fill="currentColor" aria-hidden="true" />
          ) : (
            <Disc size={28} aria-hidden="true" />
          )}
        </button>
        <ol className="band-song" aria-label={`Song: ${song.length} taps`}>
          {Array.from({ length: SONG_MAX_TAPS }, (_, index) => {
            const note = song[index];
            return (
              <li
                key={index}
                className={`band-note${index === playhead ? " is-playing" : ""}`}
                aria-hidden="true"
              >
                {note && <AnimalArt animal={note} />}
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          className="band-control is-play"
          aria-label="Play the song"
          disabled={song.length === 0 || playhead !== null}
          onClick={play}
        >
          <Play size={28} fill="currentColor" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="band-control"
          aria-label="Clear the song"
          disabled={song.length === 0 || playhead !== null}
          onClick={clear}
        >
          <Trash2 size={24} aria-hidden="true" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
