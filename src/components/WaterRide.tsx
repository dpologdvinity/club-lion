import { useEffect, useRef, useState } from "react";
import { DoorOpen, RotateCcw, X } from "lucide-react";
import type { AvatarLook, PetState } from "../types/world.ts";
import type { WaterRideId } from "../utils/waterRides.ts";
import type { RideSceneProps } from "./waterRides/rideKit";
import {
  SlideRide,
  SLIDE_CHOICES,
  type SlideChoice,
} from "./waterRides/SlideRide";
import { RiverRide } from "./waterRides/RiverRide";
import { WaveRide } from "./waterRides/WaveRide";
import { BucketRide } from "./waterRides/BucketRide";
import { playSplash } from "../utils/waterRideAudio.ts";
import "./waterRides/waterRides.css";

export const WATER_RIDE_TITLES = {
  slides: "Speed Slides",
  river: "Lazy River Float",
  wave: "Tsunami Wave Pool",
  bucket: "Dump Bucket Splash",
} as const satisfies Record<WaterRideId, string>;

type Phase = "pick" | "riding" | "done";

/**
 * Full-screen Splash Oasis ride. Icon-only controls, no fail state; the ride
 * plays itself and every tap adds a splash.
 */
export function WaterRide({
  ride,
  look,
  pet,
  onClose,
  onFinish,
}: {
  ride: WaterRideId;
  look: AvatarLook;
  pet?: PetState;
  onClose: () => void;
  /** Called on each natural finish; rewards are idempotent upstream. */
  onFinish?: (ride: WaterRideId) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const exitRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>(
    ride === "slides" ? "pick" : "riding",
  );
  const [run, setRun] = useState(0);
  const finished = useRef(false);
  const [slide, setSlide] = useState<SlideChoice>("sunny");
  const [announcement, setAnnouncement] = useState("");
  const [gentle, setGentle] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const returnFocus = useRef(
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setGentle(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      const target = returnFocus.current?.isConnected
        ? returnFocus.current
        : document.querySelector<HTMLElement>(".camera-viewport-ground");
      target?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    (phase === "riding" ? exitRef : firstRef).current?.focus({
      preventScroll: true,
    });
  }, [phase]);

  const start = (choice?: SlideChoice) => {
    if (choice) setSlide(choice);
    finished.current = false;
    setRun((n) => n + 1);
    setPhase("riding");
  };
  const scene: RideSceneProps = {
    look,
    pet,
    gentle,
    active: phase === "riding",
    announce: setAnnouncement,
    onDone: () => {
      if (finished.current) return;
      finished.current = true;
      setPhase("done");
      setAnnouncement("Ride complete! Ride again or exit.");
      onFinish?.(ride);
    },
  };

  return (
    <dialog
      ref={dialogRef}
      className="water-ride"
      aria-label={`${WATER_RIDE_TITLES[ride]} ride`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={`wr-stage wr-${ride}`} data-phase={phase}>
        {ride === "slides" && <SlideRide key={run} {...scene} color={slide} />}
        {ride === "river" && <RiverRide key={run} {...scene} />}
        {ride === "wave" && <WaveRide key={run} {...scene} />}
        {ride === "bucket" && <BucketRide key={run} {...scene} />}
      </div>
      {phase !== "done" && (
        <button
          ref={exitRef}
          type="button"
          className="wr-button wr-exit"
          aria-label="Exit ride"
          title="Exit ride"
          onClick={onClose}
        >
          <X size={34} strokeWidth={3} />
        </button>
      )}
      {phase === "pick" && (
        <div
          className="wr-overlay wr-pick"
          role="group"
          aria-label="Pick a slide"
        >
          {SLIDE_CHOICES.map((choice, i) => (
            <button
              key={choice.id}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              className={`wr-pick-button is-${choice.id}`}
              aria-label={`Ride the ${choice.name} slide`}
              title={choice.name}
              onClick={() => {
                playSplash(0.3);
                start(choice.id);
              }}
            >
              <svg viewBox="0 0 80 80" aria-hidden="true">
                <path
                  d="M18 12C64 14 62 34 34 40S14 66 64 70"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
      {phase === "done" && (
        <div className="wr-overlay wr-done">
          <button
            ref={firstRef}
            type="button"
            className="wr-button wr-big is-again"
            aria-label="Ride again"
            title="Ride again"
            onClick={() => (ride === "slides" ? setPhase("pick") : start())}
          >
            <RotateCcw size={56} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="wr-button wr-big is-leave"
            aria-label="Exit ride"
            title="Exit ride"
            onClick={onClose}
          >
            <DoorOpen size={56} strokeWidth={3} />
          </button>
        </div>
      )}
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </dialog>
  );
}
