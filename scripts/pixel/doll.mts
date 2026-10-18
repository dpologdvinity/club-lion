/**
 * The pixel doll's base body, face, eyes, hair, clothes, shoes and board.
 * Shapes are drawn on the shared 64×96 grid so every layer stacks.
 * References: inspo/fantage (base body, hair kit, clothes kit, shoes).
 */
import { G, renderAll, shade } from "./sprites.mts";
import {
  BOTTOM_LOOKS,
  HAIR_LOOKS,
  SHOE_LOOKS,
  TOP_LOOKS,
  type BottomLook,
  type HairShape,
  type ShoeLook,
  type TopLook,
} from "../../src/components/avatar/pixelItems.ts";

/* ------------------------------------------------------------- body */

const body = `
  <path d="M25 50L21 52L18 63L21 64.5L24 56Z" fill="${G.base}"/>
  <path d="M39 50L43 52L46 63L43 64.5L40 56Z" fill="${G.base}"/>
  <circle cx="19.5" cy="64.5" r="2.4" fill="${G.base}"/>
  <circle cx="44.5" cy="64.5" r="2.4" fill="${G.base}"/>
  <rect x="25" y="64" width="6" height="21" rx="2" fill="${G.base}"/>
  <rect x="33" y="64" width="6" height="21" rx="2" fill="${G.base}"/>
  <ellipse cx="27.6" cy="86" rx="3.6" ry="2" fill="${G.base}"/>
  <ellipse cx="36.4" cy="86" rx="3.6" ry="2" fill="${G.base}"/>
  <path d="M25 49Q32 46 39 49L40 64Q32 66 24 64Z" fill="${G.base}"/>
  <rect x="29" y="43" width="6" height="7" fill="${G.shade}"/>
  <rect x="24" y="60" width="16" height="6" rx="1" fill="${G.white}"/>
  <ellipse cx="32" cy="26" rx="20" ry="19" fill="${G.base}"/>
  <path d="M14 33Q18 44 32 45Q46 44 50 33Q46 42 32 43Q18 42 14 33Z" fill="${G.shade}"/>
`;

const face = `
  <rect x="31.5" y="37" width="1" height="1" fill="#c98068"/>
  <path d="M30 39.6Q32 41.4 34 39.6" fill="none" stroke="#a84858" stroke-width="1"/>
  <rect x="17" y="37" width="4" height="2" fill="#ff9fb0"/>
  <rect x="43" y="37" width="4" height="2" fill="#ff9fb0"/>
`;

function eye(cx: number, flip: 1 | -1): string {
  return `
    <ellipse cx="${cx}" cy="31" rx="4.4" ry="5.4" fill="${G.white}"/>
    <ellipse cx="${cx}" cy="32" rx="3.7" ry="4.6" fill="${G.shade}"/>
    <ellipse cx="${cx}" cy="34" rx="2.8" ry="2.2" fill="${G.light}"/>
    <ellipse cx="${cx}" cy="32" rx="1.8" ry="2.3" fill="${G.deep}"/>
    <rect x="${cx - 2.6}" y="28" width="2.4" height="2.4" fill="${G.white}"/>
    <rect x="${cx + 1}" y="34.2" width="1.2" height="1.2" fill="${G.white}"/>
    <path d="M${cx - 5} 28.2Q${cx} 23.4 ${cx + 5} 27.4" fill="none" stroke="${G.ink}" stroke-width="1.7"/>
    <path d="M${cx + 4.8 * flip} 27.2l${1.8 * flip} -1.6" stroke="${G.ink}" stroke-width="1.2"/>`;
}
const eyes = eye(25.6, -1) + eye(38.4, 1);

/* ------------------------------------------------------------- hair */

const strand = `fill="none" stroke="${G.shade}" stroke-width="1"`;
const shine = `fill="none" stroke="${G.white}" stroke-width="1.2"`;

const HAIR_BACK: Record<HairShape, string> = {
  long: `<path d="M12 28Q10 8 32 7Q54 8 52 28L55 74Q52 79 48 76L45 50H19L16 76Q12 79 9 74Z" fill="${G.base}"/>
    <path d="M14 44Q13 60 14 72M50 44Q51 60 50 72" ${strand}/>`,
  wavy: `<path d="M12 28Q10 8 32 7Q54 8 52 28Q58 40 53 50Q59 60 53 70Q48 78 43 72Q45 62 43 52H21Q19 62 21 72Q16 78 11 70Q5 60 11 50Q6 40 12 28Z" fill="${G.base}"/>
    <path d="M13 46Q9 55 13 63Q11 68 14 72M51 46Q55 55 51 63Q53 68 50 72" ${strand}/>`,
  bob: `<path d="M11 30Q9 7 32 6Q55 7 53 30Q56 44 50 50Q46 52 44 47H20Q18 52 14 50Q8 44 11 30Z" fill="${G.base}"/>`,
  pony: `<path d="M38 12Q55 4 58 20Q61 36 56 52Q54 60 50 55Q54 42 50 30Q46 20 38 18Z" fill="${G.base}"/>
    <path d="M52 24Q55 36 52 48" ${strand}/>`,
  sidepony: `<path d="M46 24Q58 28 57 44Q56 58 50 62Q48 58 50 50Q52 38 44 32Z" fill="${G.base}"/>`,
  pigtails: `<path d="M13 34Q2 36 3 52Q4 62 10 63Q9 54 12 47Q16 41 15 35Z" fill="${G.base}"/>
    <path d="M51 34Q62 36 61 52Q60 62 54 63Q55 54 52 47Q48 41 49 35Z" fill="${G.base}"/>`,
  buns: `<circle cx="16" cy="10" r="7" fill="${G.base}"/><circle cx="48" cy="10" r="7" fill="${G.base}"/>
    <path d="M12 8Q15 5 19 6M44 6Q48 5 51 8" ${shine}/>`,
  topknot: `<ellipse cx="32" cy="5" rx="8" ry="6" fill="${G.base}"/>`,
  braids: `<path d="M15 36Q12 50 15 63Q14 70 17 75Q20 70 19 63Q21 50 19 37Z" fill="${G.base}"/>
    <path d="M49 36Q52 50 49 63Q50 70 47 75Q44 70 45 63Q43 50 45 37Z" fill="${G.base}"/>
    <path d="M14 44h5M14 51h5M15 58h4M15 65h4M45 44h5M45 51h5M45 58h4M45 65h4" ${strand}/>`,
  curly: `<path d="M32 2Q42 -1 47 6Q56 6 56 15Q62 21 58 29Q63 37 57 44Q58 52 50 53Q45 58 39 52H25Q19 58 14 53Q6 52 7 44Q1 37 6 29Q2 21 8 15Q8 6 17 6Q22 -1 32 2Z" fill="${G.base}"/>
    <path d="M9 30q3 2 2 5M55 30q-3 2 -2 5M12 44q3 1 3 4M52 44q-3 1 -3 4" ${strand}/>`,
  pixie: "",
};

const FRINGE = {
  side: `<path d="M11 33Q9 7 32 6Q55 7 53 33Q52 22 48 18Q47 25 42 26Q43 20 40 18Q36 26 30 27Q33 22 32 18Q26 25 19 26Q22 21 21 18Q15 22 11 33Z" fill="${G.base}"/>`,
  blunt: `<path d="M11 34Q9 6 32 5Q55 6 53 34Q52 26 50 22H14Q12 26 11 34Z" fill="${G.base}"/>`,
  curly: `<path d="M10 32Q7 6 32 5Q57 6 54 32Q50 24 46 25Q44 20 39 22Q35 17 31 22Q26 18 23 23Q17 21 16 26Q12 25 10 32Z" fill="${G.base}"/>`,
  spiky: `<path d="M11 32Q9 14 20 9L22 2L27 8L32 0L36 8L42 2L44 10Q55 16 53 32Q50 24 44 22Q42 26 37 23Q33 28 28 23Q23 27 20 22Q14 25 11 32Z" fill="${G.base}"/>`,
};

function hairFront(shape: HairShape): string {
  const fringe =
    shape === "pixie"
      ? FRINGE.spiky
      : shape === "bob"
        ? FRINGE.blunt
        : shape === "curly"
          ? FRINGE.curly
          : FRINGE.side;
  return (
    fringe +
    `<path d="M24 10Q22 15 21 20M32 8Q31 14 30 19M40 10Q42 14 43 19" ${strand}/>` +
    `<path d="M17 15Q28 9 44 12" ${shine}/>` +
    `<path d="M19 18Q23 15 27 14" fill="none" stroke="${G.light}" stroke-width="1"/>`
  );
}

/* ---------------------------------------------------------- clothes */

const ink = (fill: string) => shade(fill, -0.45);

function top(look: TopLook): string {
  const f = look.color;
  const s = shade(f, -0.2);
  const parts: string[] = [];
  if (look.cut === "jacket" || look.cut === "hoodie")
    parts.push(
      `<path d="M25 49L21 52L18 62L21 63L24 55Z" fill="${f}"/>`,
      `<path d="M39 49L43 52L46 62L43 63L40 55Z" fill="${f}"/>`,
    );
  if (look.cut === "tee")
    parts.push(
      `<path d="M25 49L21 51L19.5 56L23 57L24.5 53Z" fill="${f}"/>`,
      `<path d="M39 49L43 51L44.5 56L41 57L39.5 53Z" fill="${f}"/>`,
    );
  if (look.cut === "tank" || look.cut === "halter" || look.cut === "tube")
    parts.push(
      look.cut === "tube"
        ? `<path d="M24.6 53H39.4L40 63Q32 64.6 24 63Z" fill="${f}"/>`
        : `<path d="M25 51Q32 49 39 51L40 63Q32 64.6 24 63Z" fill="${f}"/>`,
      look.cut === "halter"
        ? `<path d="M27 51L31 46H33L37 51" fill="none" stroke="${f}" stroke-width="1.6"/>`
        : look.cut === "tank"
          ? `<path d="M27 51V48M37 51V48" stroke="${f}" stroke-width="1.6"/>`
          : "",
    );
  else
    parts.push(
      `<path d="M25 49Q32 46 39 49L40 63Q32 64.6 24 63Z" fill="${f}"/>`,
    );
  parts.push(`<path d="M24 61Q32 63 40 61V63Q32 64.6 24 63Z" fill="${s}"/>`);
  if (look.cut === "jacket")
    parts.push(`<path d="M32 48V63" stroke="${ink(f)}" stroke-width="1"/>`);
  if (look.cut === "hoodie")
    parts.push(
      `<path d="M26 48Q32 52 38 48" fill="none" stroke="${s}" stroke-width="2"/>`,
      `<rect x="28" y="56" width="8" height="4" fill="${s}"/>`,
    );
  if (look.pattern === "stripes")
    parts.push(
      `<path d="M24.5 53H39.5M24.5 57H39.5" stroke="${look.accent}" stroke-width="1.4"/>`,
    );
  if (look.pattern === "star")
    parts.push(
      `<path d="M32 52l1.2 2.6 2.8.2-2.2 1.8.8 2.8L32 58l-2.6 1.4.8-2.8-2.2-1.8 2.8-.2Z" fill="${look.accent}"/>`,
    );
  if (look.pattern === "heart")
    parts.push(
      `<path d="M32 59q-4-2.6-4-5q0-2 2-2q1.4 0 2 1.4q.6-1.4 2-1.4q2 0 2 2q0 2.4-4 5Z" fill="${look.accent}"/>`,
    );
  if (look.pattern === "dots")
    parts.push(
      `<g fill="${look.accent}"><rect x="27" y="52" width="1.6" height="1.6"/><rect x="34" y="54" width="1.6" height="1.6"/><rect x="29" y="58" width="1.6" height="1.6"/><rect x="36" y="59" width="1.6" height="1.6"/></g>`,
    );
  if (look.pattern === "trim")
    parts.push(
      `<path d="M24.5 50Q32 47 39.5 50" fill="none" stroke="${look.accent}" stroke-width="2"/>`,
    );
  return parts.join("");
}

function bottom(look: BottomLook): string {
  const f = look.color;
  const s = shade(f, -0.2);
  switch (look.cut) {
    case "pants":
      return (
        `<path d="M24 61H40L40.6 84H33.4L32 67L30.6 84H23.4Z" fill="${f}"/>` +
        `<path d="M24 61H40V63H24Z" fill="${s}"/>`
      );
    case "flares":
      return (
        `<path d="M24 61H40L41.6 85H33.2L32 67L30.8 85H22.4Z" fill="${f}"/>` +
        `<path d="M24 61H40V63H24Z" fill="${s}"/>`
      );
    case "shorts":
      return `<path d="M24 61H40L40.6 70H33L32 66L31 70H23.4Z" fill="${f}"/><path d="M24 61H40V63H24Z" fill="${s}"/>`;
    case "mini":
      return `<path d="M24 61H40L43 71H21Z" fill="${f}"/><path d="M24 61H40V63H24Z" fill="${s}"/>`;
    case "skirt":
      return (
        `<path d="M24 61H40L45 77Q32 80 19 77Z" fill="${f}"/>` +
        `<path d="M27 66L25 77M32 66V78M37 66L39 77" stroke="${s}" stroke-width="1"/>`
      );
  }
}

function shoe(look: ShoeLook): string {
  const f = look.color;
  const s = look.sole ?? "#ffffff";
  const boot = look.cut === "boots";
  const tall = boot
    ? `<rect x="24.6" y="76" width="6.4" height="9" fill="${f}"/><rect x="33" y="76" width="6.4" height="9" fill="${f}"/>`
    : "";
  const heel =
    look.cut === "heels"
      ? `<rect x="29.6" y="86" width="1.6" height="3" fill="${s}"/><rect x="38.2" y="86" width="1.6" height="3" fill="${s}"/>`
      : "";
  return (
    tall +
    `<path d="M23.4 84H31.6V88Q27.6 89.4 22.6 88Z" fill="${f}"/>` +
    `<path d="M32.4 84H40.6L41.4 88Q36.4 89.4 32.4 88Z" fill="${f}"/>` +
    (look.cut === "sneakers"
      ? `<path d="M22.6 88H31.6M32.4 88H41.4" stroke="${s}" stroke-width="1.4"/>`
      : "") +
    heel
  );
}

const board = `
  <ellipse cx="32" cy="91" rx="20" ry="3.4" fill="#7ec8f0"/>
  <ellipse cx="28" cy="90" rx="11" ry="1" fill="#e4f6ff"/>
`;

/* ------------------------------------------------------------- run */

await renderAll([
  { name: "body", svg: body, grey: true },
  { name: "face", svg: face, outline: false },
  { name: "eyes", svg: eyes, grey: true, outline: false },
  { name: "board", svg: board },
  ...[...new Set(Object.values(HAIR_LOOKS))].flatMap((shape) => [
    { name: `hair-back-${shape}`, svg: HAIR_BACK[shape] || "<g/>", grey: true },
    { name: `hair-front-${shape}`, svg: hairFront(shape), grey: true },
  ]),
  ...Object.entries(TOP_LOOKS).map(([id, look]) => ({
    name: `top-${id}`,
    svg: top(look),
  })),
  ...Object.entries(BOTTOM_LOOKS).map(([id, look]) => ({
    name: `bottom-${id}`,
    svg: bottom(look),
  })),
  ...Object.entries(SHOE_LOOKS).map(([id, look]) => ({
    name: `shoes-${id}`,
    svg: shoe(look),
  })),
]);
console.log("pixel doll sprites written");
