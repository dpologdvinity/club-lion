/**
 * The pixel doll's base body, face, eyes, hair, clothes, shoes and board.
 * Shapes are drawn on the shared 64×96 grid so every layer stacks.
 * References: inspo/fantage (base body, hair kit, clothes kit, shoes).
 */
import { G, renderAll, shade } from "./sprites.mts";
import {
  type Motif,
  BOTTOM_LOOKS,
  HAIR_LOOKS,
  SHOE_LOOKS,
  TOP_LOOKS,
  type BottomLook,
  type HairShape,
  type Motif,
  type ShoeLook,
  type TopLook,
} from "../../src/components/avatar/pixelItems.ts";

/* ------------------------------------------------------------- body */

const body = `
  <path d="M25 50L22.4 52.4L21.6 64L24.6 64.4L25.4 57Z" fill="${G.base}"/>
  <path d="M39 50L41.6 52.4L42.4 64L39.4 64.4L38.6 57Z" fill="${G.base}"/>
  <circle cx="23" cy="65.4" r="2.4" fill="${G.base}"/>
  <circle cx="41" cy="65.4" r="2.4" fill="${G.base}"/>
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

/** Salon bangs: each is a whole front layer (fringe, strands and shine). */
const BANGS: Record<string, string> = {
  none: `<path d="M11 30Q9 6 32 5Q55 6 53 30Q50 16 32 14Q14 16 11 30Z" fill="${G.base}"/>`,
  curtain_bangs: `<path d="M10 34Q8 6 32 5Q56 6 54 34Q52 24 46 18Q40 15 33 17Q32 12 31 17Q24 15 18 18Q12 24 10 34Z" fill="${G.base}"/>`,
  blunt_bangs: FRINGE.blunt,
  wispy_tendrils: `${FRINGE.side}<path d="M13 30Q11 36 13 40M51 30Q53 36 51 40" fill="none" stroke="${G.base}" stroke-width="1.6"/>`,
  baby_edges: `<path d="M11 30Q9 6 32 5Q55 6 53 30Q50 16 32 14Q14 16 11 30Z" fill="${G.base}"/><path d="M20 17q-3 2 0 4q3 1 1 3M44 17q3 2 0 4q-3 1 -1 3" fill="none" stroke="${G.deep}" stroke-width="1"/>`,
  side_sweep: FRINGE.side,
};

const frontDetails =
  `<path d="M24 10Q22 15 21 20M32 8Q31 14 30 19M40 10Q42 14 43 19" ${strand}/>` +
  `<path d="M17 15Q28 9 44 12" ${shine}/>` +
  `<path d="M19 18Q23 15 27 14" fill="none" stroke="${G.light}" stroke-width="1"/>`;

/** A highlight streak through the front hair, one grey level, recoloured in game. */
const STREAK = `<path d="M22 6Q18 14 16 30" fill="none" stroke="${G.light}" stroke-width="3.2"/><path d="M38 6Q40 12 41 20" fill="none" stroke="${G.light}" stroke-width="2.4"/>`;

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

/** Chest prints for graphic tees, centred on (32, 55), about 7 px wide. */
const MOTIFS: Record<Motif, (c: string) => string> = {
  ghost: (c) =>
    `<path d="M28.6 59V54.4Q28.6 51 32 51Q35.4 51 35.4 54.4V59L34.2 58L33 59L32 58L31 59L29.8 58Z" fill="${c}"/><rect x="30.4" y="53.6" width="1" height="1.2" fill="#26262e"/><rect x="32.6" y="53.6" width="1" height="1.2" fill="#26262e"/>`,
  pumpkin: (c) =>
    `<ellipse cx="32" cy="55.6" rx="3.6" ry="3" fill="${c}"/><rect x="31.6" y="51.6" width="0.8" height="1.4" fill="#3a8a2a"/><path d="M30.4 55h1v1h-1zM32.6 55h1v1h-1zM30.6 57h2.8v0.8h-2.8z" fill="#26262e"/>`,
  star: (c) =>
    `<path d="M32 51.6l1.2 2.6 2.8.2-2.2 1.8.8 2.8L32 57.6l-2.6 1.4.8-2.8-2.2-1.8 2.8-.2Z" fill="${c}"/>`,
  leaf: (c) =>
    `<path d="M29 58Q29 52 35 51.6Q35.4 57.6 29 58Z" fill="${c}"/><path d="M29.4 57.6L34 53" stroke="#26262e" stroke-width="0.6"/>`,
  bunny: (c) =>
    `<circle cx="32" cy="56.4" r="2.6" fill="${c}"/><rect x="30.4" y="51.4" width="1.2" height="3.4" rx="0.6" fill="${c}"/><rect x="32.4" y="51.4" width="1.2" height="3.4" rx="0.6" fill="${c}"/><rect x="31" y="56" width="0.8" height="0.8" fill="#26262e"/><rect x="32.4" y="56" width="0.8" height="0.8" fill="#26262e"/>`,
  face: (c) =>
    `<circle cx="32" cy="55.4" r="3.4" fill="${c}"/><rect x="30.4" y="54.2" width="1" height="1.2" fill="#ffffff"/><rect x="32.6" y="54.2" width="1" height="1.2" fill="#ffffff"/><path d="M30.6 56.8Q32 57.8 33.4 56.8" fill="none" stroke="#ffffff" stroke-width="0.6"/>`,
  tie: (c) =>
    `<path d="M31.2 50.6H32.8L33.4 52L32.8 58.6L32 59.6L31.2 58.6L30.6 52Z" fill="${c}"/>`,
  heart: (c) =>
    `<path d="M32 59q-4-2.6-4-5q0-2 2-2q1.4 0 2 1.4q.6-1.4 2-1.4q2 0 2 2q0 2.4-4 5Z" fill="${c}"/>`,
  skull: (c) =>
    `<path d="M28.8 55Q28.8 51.4 32 51.4Q35.2 51.4 35.2 55V57H34V58.6H30V57H28.8Z" fill="${c}"/><rect x="30" y="54" width="1.4" height="1.4" fill="#26262e"/><rect x="32.6" y="54" width="1.4" height="1.4" fill="#26262e"/>`,
  berry: (c) =>
    `<path d="M29 53.6H35Q35 58 32 59.4Q29 58 29 53.6Z" fill="${c}"/><path d="M29.4 53.6L31 52.2L32 53.2L33 52.2L34.6 53.6Z" fill="#3a8a2a"/><g fill="#ffe14a"><rect x="30.6" y="55" width="0.6" height="0.6"/><rect x="32.8" y="56" width="0.6" height="0.6"/><rect x="31.6" y="57.4" width="0.6" height="0.6"/></g>`,
  clover: (c) =>
    `<g fill="${c}"><circle cx="32" cy="53" r="1.6"/><circle cx="30.4" cy="55" r="1.6"/><circle cx="33.6" cy="55" r="1.6"/></g><path d="M32 55.4L33 58.6" stroke="${c}" stroke-width="0.8"/>`,
  peace: (c) =>
    `<circle cx="32" cy="55.4" r="3" fill="none" stroke="${c}" stroke-width="0.9"/><path d="M32 52.4V58.4M32 55.6L29.9 57.5M32 55.6L34.1 57.5" stroke="${c}" stroke-width="0.8"/>`,
  crown: (c) =>
    `<path d="M28.6 58.4V53L30.4 55L32 52.4L33.6 55L35.4 53V58.4Z" fill="${c}"/>`,
  planet: (c) =>
    `<circle cx="32" cy="55.4" r="2.6" fill="${c}"/><ellipse cx="32" cy="55.4" rx="4.2" ry="1.2" fill="none" stroke="#ffd84d" stroke-width="0.7"/>`,
  burger: (c) =>
    `<path d="M28.8 54.4Q28.8 51.8 32 51.8Q35.2 51.8 35.2 54.4Z" fill="${c}"/><rect x="28.6" y="54.6" width="6.8" height="1" fill="#3ac83a"/><rect x="28.8" y="55.6" width="6.4" height="1.2" fill="#6a3a1a"/><path d="M28.8 57H35.2Q35.2 58.6 32 58.6Q28.8 58.6 28.8 57Z" fill="${c}"/>`,
  hotdog: (c) =>
    `<rect x="28.4" y="54" width="7.2" height="3" rx="1.5" fill="${c}"/><rect x="28" y="54.8" width="8" height="1.4" rx="0.7" fill="#c8402a"/>`,
  target: (c) =>
    `<circle cx="32" cy="55.4" r="3.4" fill="${c}"/><circle cx="32" cy="55.4" r="2.2" fill="#ffffff"/><circle cx="32" cy="55.4" r="1" fill="${c}"/>`,
  bow: (c) =>
    `<path d="M32 55L28.8 53V57ZM32 55L35.2 53V57Z" fill="${c}"/><rect x="31.4" y="54.4" width="1.2" height="1.2" fill="${c}"/>`,
  turkey: (c) =>
    `<g fill="#ffd84d"><circle cx="30" cy="53" r="1.2"/><circle cx="34" cy="53" r="1.2"/></g><g fill="#e8603a"><circle cx="32" cy="52.2" r="1.2"/></g><circle cx="32" cy="56" r="2.4" fill="${c}"/><rect x="31.6" y="55.4" width="0.8" height="0.8" fill="#26262e"/>`,
  one: (c) =>
    `<path d="M31 52.6L32.6 51.4H33.4V58H32.2V53.2L31.4 53.8Z" fill="${c}"/>`,
  balloon: (c) =>
    `<ellipse cx="32" cy="54" rx="2.6" ry="3" fill="${c}"/><path d="M32 57V59.6" stroke="#26262e" stroke-width="0.5"/>`,
  snow: (c) =>
    `<circle cx="32" cy="57" r="2.2" fill="${c}"/><circle cx="32" cy="53.6" r="1.6" fill="${c}"/><rect x="31.8" y="53.6" width="0.6" height="0.4" fill="#f2902a"/>`,
  flag: (c) =>
    `<g fill="${c}"><rect x="29" y="52" width="1.4" height="1.4"/><rect x="31.8" y="52" width="1.4" height="1.4"/><rect x="30.4" y="53.4" width="1.4" height="1.4"/><rect x="33.2" y="53.4" width="1.4" height="1.4"/><rect x="29" y="54.8" width="1.4" height="1.4"/><rect x="31.8" y="54.8" width="1.4" height="1.4"/></g><path d="M29 52V59" stroke="${c}" stroke-width="0.6"/>`,
  arrow: (c) =>
    `<path d="M32 51.4L35.4 55H33.2V58.8H30.8V55H28.6Z" fill="${c}"/>`,
  spade: (c) =>
    `<path d="M32 51.6Q35.6 55 35 56.6Q34 58 32.6 56.8L33.4 59H30.6L31.4 56.8Q30 58 29 56.6Q28.4 55 32 51.6Z" fill="${c}"/>`,
  diamond: (c) => `<path d="M32 51.4L35 55.4L32 59.4L29 55.4Z" fill="${c}"/>`,
  club: (c) =>
    `<g fill="${c}"><circle cx="32" cy="53.4" r="1.5"/><circle cx="30.4" cy="55.8" r="1.5"/><circle cx="33.6" cy="55.8" r="1.5"/></g><path d="M31.4 56H32.6L33.2 59H30.8Z" fill="${c}"/>`,
  flower: (c) =>
    `<g fill="${c}"><circle cx="32" cy="53.2" r="1.4"/><circle cx="34" cy="55" r="1.4"/><circle cx="33.2" cy="57.2" r="1.4"/><circle cx="30.8" cy="57.2" r="1.4"/><circle cx="30" cy="55" r="1.4"/></g><circle cx="32" cy="55.4" r="1" fill="#ffe14a"/>`,
  bolt: (c) =>
    `<path d="M33 51.2L29.6 55.8H32L30.8 59.6L34.4 54.6H32Z" fill="${c}"/>`,
  melon: (c) =>
    `<path d="M28.6 54H35.4Q35.4 58.6 32 58.6Q28.6 58.6 28.6 54Z" fill="${c}"/><path d="M29.4 54H34.6Q34.6 57.6 32 57.6Q29.4 57.6 29.4 54Z" fill="#ff5a6a"/><g fill="#26262e"><rect x="31" y="55" width="0.6" height="0.8"/><rect x="32.8" y="55.4" width="0.6" height="0.8"/></g>`,
  fire: (c) =>
    `<path d="M32 51.4Q35 54.4 34.6 56.8Q34.2 58.6 32 58.6Q29.8 58.6 29.4 56.8Q29 54.6 31 53.4Q31 55 32 55.4Q31.6 53.4 32 51.4Z" fill="${c}"/><path d="M32 55.6Q33.4 57 32.8 57.8H31.2Q30.8 57 32 55.6Z" fill="#ffd84d"/>`,
};

function top(look: TopLook): string {
  const f = look.color;
  const arm = look.sleeves ?? f;
  const s = shade(f, -0.2);
  const parts: string[] = [];
  if (look.cut === "jacket" || look.cut === "hoodie")
    parts.push(
      `<path d="M25 49L22.2 52.2L21.4 62.6L24.6 62.9L25.4 55Z" fill="${arm}"/>`,
      `<path d="M39 49L41.8 52.2L42.6 62.6L39.4 62.9L38.6 55Z" fill="${arm}"/>`,
    );
  if (look.cut === "tee")
    parts.push(
      `<path d="M25 49L22 51.4L21.4 56.6L24.6 57L25.2 53Z" fill="${arm}"/>`,
      `<path d="M39 49L42 51.4L42.6 56.6L39.4 57L38.8 53Z" fill="${arm}"/>`,
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
  if (look.motif) parts.push(MOTIFS[look.motif](look.accent));
  if (look.pattern === "trim")
    parts.push(
      `<path d="M24.5 50Q32 47 39.5 50" fill="none" stroke="${look.accent}" stroke-width="2"/>`,
    );
  return parts.join("");
}

function bottom(look: BottomLook): string {
  return bottomShape(look) + bottomPattern(look);
}

/** Hem height of each cut, for trims. */
const BOTTOM_HEM: Record<BottomLook["cut"], number> = {
  pants: 82.6,
  flares: 83.6,
  shorts: 68.8,
  mini: 69.8,
  skirt: 76.4,
};

function bottomPattern(look: BottomLook): string {
  const c = look.accent ?? shade(look.color, -0.3);
  const hem = BOTTOM_HEM[look.cut];
  switch (look.pattern) {
    case "trim":
      return `<path d="M22 ${hem}H42" stroke="${c}" stroke-width="1.6"/>`;
    case "stripes":
      return `<path d="M23 64.6H41M23 67.4H41" stroke="${c}" stroke-width="1.2"/>`;
    case "dots":
      return `<g fill="${c}"><rect x="26" y="64" width="1.4" height="1.4"/><rect x="35" y="65.6" width="1.4" height="1.4"/><rect x="29" y="67.6" width="1.4" height="1.4"/><rect x="33" y="62.6" width="1.4" height="1.4"/></g>`;
    case "pleats":
      return `<path d="M27 63L26 ${hem}M30 63V${hem}M34 63V${hem}M37 63L38 ${hem}" stroke="${c}" stroke-width="0.8"/>`;
    default:
      return "";
  }
}

function bottomShape(look: BottomLook): string {
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
  ...Object.entries(BANGS).map(([id, fringe]) => ({
    name: `hair-bangs-${id}`,
    svg: fringe + frontDetails,
    grey: true,
  })),
  { name: "hair-streak", svg: STREAK, grey: true, outline: false as const },
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
