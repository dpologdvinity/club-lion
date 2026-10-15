import { useId } from "react";
import type { SorterAnimal, ShapeId } from "../utils/shapeSorter.ts";
import { ShapeGlyph } from "./ShapeGlyph";

const INK = "#2b2140";
const HOLE = "#3b2a52";

type Look = {
  fur: string;
  muzzle: string;
  ears: "round" | "long" | "floppy" | "horns" | "none";
  wide?: boolean;
  mane?: boolean;
  stripes?: boolean;
  beak?: boolean;
  trunk?: boolean;
  bulgingEyes?: boolean;
};

const LOOKS: Record<SorterAnimal, Look> = {
  lion: { fur: "#f2a53a", muzzle: "#ffe0a8", ears: "round", mane: true },
  zebra: { fur: "#ffffff", muzzle: "#e9e4dc", ears: "round", stripes: true },
  giraffe: { fur: "#f6c25b", muzzle: "#fde9b6", ears: "horns" },
  hippo: { fur: "#a9a7d6", muzzle: "#d9d7ee", ears: "round", wide: true },
  monkey: { fur: "#c98f5a", muzzle: "#f1d2a9", ears: "floppy" },
  parrot: { fur: "#57c97a", muzzle: "#ffb347", ears: "none", beak: true },
  bunny: { fur: "#f7d6e6", muzzle: "#ffffff", ears: "long" },
  bear: { fur: "#a77452", muzzle: "#e4c39b", ears: "round" },
  elephant: { fur: "#9fb6cf", muzzle: "#c9d8e8", ears: "floppy", trunk: true },
  frog: { fur: "#6cc76b", muzzle: "#c9efb0", ears: "none", bulgingEyes: true },
};

/**
 * A friendly animal face and body. Pass `hole` to cut a shape-shaped hole in
 * its belly for the Shape Sorter; the same art serves the Animal Orchestra.
 */
export function AnimalArt({
  animal,
  hole,
}: {
  animal: SorterAnimal;
  hole?: ShapeId;
}) {
  const look = LOOKS[animal];
  const clip = `stripes-${useId().replace(/:/g, "")}`;
  const headRx = look.wide ? 68 : 56;
  return (
    <svg className="animal-art" viewBox="0 0 200 220" aria-hidden="true">
      {look.mane && <circle cx="100" cy="92" r="74" fill="#d9822b" />}
      {look.ears === "floppy" && (
        <>
          <ellipse cx="34" cy="98" rx="20" ry="36" fill={look.fur} />
          <ellipse cx="166" cy="98" rx="20" ry="36" fill={look.fur} />
        </>
      )}
      {look.trunk && (
        <path
          d="M96 136Q88 170 104 176Q116 180 110 164"
          fill="none"
          stroke={look.fur}
          strokeWidth="16"
          strokeLinecap="round"
        />
      )}
      <ellipse cx="100" cy="176" rx="60" ry="40" fill={look.fur} />
      {look.ears === "round" && (
        <>
          <circle cx="50" cy="50" r="22" fill={look.fur} />
          <circle cx="150" cy="50" r="22" fill={look.fur} />
          <circle cx="50" cy="50" r="11" fill={look.muzzle} />
          <circle cx="150" cy="50" r="11" fill={look.muzzle} />
        </>
      )}
      {look.ears === "long" && (
        <>
          <ellipse
            cx="72"
            cy="34"
            rx="15"
            ry="40"
            transform="rotate(-12 72 34)"
            fill={look.fur}
          />
          <ellipse
            cx="128"
            cy="34"
            rx="15"
            ry="40"
            transform="rotate(12 128 34)"
            fill={look.fur}
          />
        </>
      )}
      {look.ears === "horns" && (
        <>
          <rect x="84" y="6" width="9" height="30" rx="4" fill="#8a5a2b" />
          <rect x="107" y="6" width="9" height="30" rx="4" fill="#8a5a2b" />
          <circle cx="88" cy="6" r="7" fill="#8a5a2b" />
          <circle cx="112" cy="6" r="7" fill="#8a5a2b" />
        </>
      )}
      <ellipse cx="100" cy="96" rx={headRx} ry="52" fill={look.fur} />
      {look.stripes && (
        <>
          <clipPath id={clip}>
            <ellipse cx="100" cy="96" rx={headRx} ry="52" />
          </clipPath>
          <g clipPath={`url(#${clip})`} fill={INK} opacity="0.85">
            <rect x="30" y="50" width="140" height="10" />
            <rect x="30" y="72" width="140" height="10" />
            <rect x="30" y="94" width="140" height="10" />
          </g>
        </>
      )}
      {look.bulgingEyes ? (
        <>
          <circle cx="66" cy="48" r="20" fill={look.fur} />
          <circle cx="134" cy="48" r="20" fill={look.fur} />
          <circle cx="66" cy="48" r="11" fill="#ffffff" />
          <circle cx="134" cy="48" r="11" fill="#ffffff" />
          <circle cx="66" cy="50" r="5" fill={INK} />
          <circle cx="134" cy="50" r="5" fill={INK} />
        </>
      ) : (
        <>
          <circle cx="80" cy="90" r="8" fill={INK} />
          <circle cx="120" cy="90" r="8" fill={INK} />
          <circle cx="83" cy="87" r="3" fill="#ffffff" />
          <circle cx="123" cy="87" r="3" fill="#ffffff" />
        </>
      )}
      <ellipse cx="100" cy="122" rx="30" ry="22" fill={look.muzzle} />
      <circle cx="68" cy="112" r="7" fill="#ff9fb2" opacity="0.6" />
      <circle cx="132" cy="112" r="7" fill="#ff9fb2" opacity="0.6" />
      {look.beak ? (
        <path d="M90 112L110 112L100 132Z" fill="#ffb347" />
      ) : (
        <ellipse cx="100" cy="112" rx="7" ry="5" fill={INK} />
      )}
      {!look.beak && (
        <path
          d="M90 128Q100 137 110 128"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {hole && (
        <g transform="translate(76 148) scale(0.5)">
          <ShapeGlyph shape={hole} fill={HOLE} />
        </g>
      )}
    </svg>
  );
}
