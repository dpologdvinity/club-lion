/**
 * Costume sprites (costume-<id>.png): whole-body pieces drawn over the doll on
 * its 64×96 grid. Full suits leave a hole for the face.
 * Run: node --experimental-strip-types scripts/pixel/costumes.mts
 */
import { renderAll, shade } from "./sprites.mts";
import { COSTUMES } from "../../src/components/avatar/pixelCostumes.ts";

const HOOD = `<ellipse cx="32" cy="26" rx="21.5" ry="20.5"/>`;
const TORSO = `<path d="M23 48Q32 44 41 48L42 66Q32 68 22 66Z"/>`;
const ARMS = `<path d="M24 48L21 51L19.8 64.6L25.6 65.2L26 56Z"/><path d="M40 48L43 51L44.2 64.6L38.4 65.2L38 56Z"/>`;
const HANDS = (c: string) =>
  `<circle cx="23" cy="66" r="2.8" fill="${c}"/><circle cx="41" cy="66" r="2.8" fill="${c}"/>`;
const LEGS = `<rect x="24" y="64" width="7.6" height="23" rx="2"/><rect x="32.4" y="64" width="7.6" height="23" rx="2"/>`;
const FEET = (c: string) =>
  `<ellipse cx="27.6" cy="87.4" rx="4.6" ry="2.6" fill="${c}"/><ellipse cx="36.4" cy="87.4" rx="4.6" ry="2.6" fill="${c}"/>`;
const SKIRT = (c: string, hem = 74) =>
  `<path d="M23 60H41L46 ${hem}Q32 ${hem + 3} 18 ${hem}Z" fill="${c}"/>`;
const TUTU = (c: string) =>
  `<path d="M23 59H41L48 66Q49 70 44 70Q40 72.5 36 70.6Q32 73 28 70.6Q24 72.5 20 70Q15 70 16 66Z" fill="${c}"/>`;
const SKATES = `${FEET("#ffffff")}<path d="M22 90.4H33M31 90.4H42" stroke="#9aa4b8" stroke-width="1.2"/>`;
const dress = (top: string, extra = "") =>
  `<g fill="${top}">${TORSO}${ARMS}</g>${extra}`;

let maskId = 0;
/** Draws `art` with the face cut out so the doll's face shows through. */
function faceHole(art: string, rx = 15.5, ry = 12): string {
  const id = `m${maskId++}`;
  return `<mask id="${id}"><rect width="64" height="96" fill="#ffffff"/><ellipse cx="32" cy="31.5" rx="${rx}" ry="${ry}" fill="#000000"/></mask><g mask="url(#${id})">${art}</g>`;
}

function suit(c: string, belly: string, extra = ""): string {
  return faceHole(
    `<g fill="${c}">${HOOD}${TORSO}${ARMS}${LEGS}</g>${HANDS(c)}${FEET(shade(c, -0.15))}<ellipse cx="32" cy="58" rx="6.5" ry="7" fill="${belly}"/>${extra}`,
  );
}

function hockey(c: string): string {
  const stripes = `<rect x="22" y="56" width="20" height="2.4" fill="#ffffff"/><rect x="22" y="60" width="20" height="2.4" fill="#26262e"/>`;
  return (
    `<g fill="#26262e">${LEGS}</g>` +
    `<rect x="24" y="74" width="7.6" height="4" fill="${c}"/><rect x="32.4" y="74" width="7.6" height="4" fill="${c}"/>` +
    SKATES +
    `<g fill="#f4f4f8">${TORSO}</g><g fill="${c}">${ARMS}</g>${stripes}` +
    `<path d="M22 64H42L43 70H21Z" fill="#26262e"/>` +
    HANDS("#26262e") +
    `<path d="M11 26Q11 3 32 3Q53 3 53 26L48.6 27Q48 13 32 12Q16 13 15.4 27Z" fill="${c}"/>` +
    `<path d="M15 21H49" stroke="${shade(c, -0.3)}" stroke-width="1.2"/>` +
    `<path d="M23 66L47 88" stroke="#c89a5a" stroke-width="2"/><path d="M45 88H53V90H45Z" fill="#26262e"/>`
  );
}

function canoe(body: string, rim: string, extra = ""): string {
  return (
    dress("#4aa84a") +
    `<path d="M2 68Q32 80 62 68L58 84Q32 93 6 84Z" fill="${body}"/>` +
    `<path d="M2 68Q32 80 62 68" fill="none" stroke="${rim}" stroke-width="2.4"/>` +
    `<path d="M50 54L40 90" stroke="#a8642a" stroke-width="1.6"/><ellipse cx="39.6" cy="90" rx="2" ry="3.4" fill="#a8642a"/>` +
    extra
  );
}

const FISHING_ROD = `<path d="M19 64L6 24" stroke="#5a3a1e" stroke-width="1.2"/><path d="M6 24Q2 40 4 52" fill="none" stroke="#d8d8e0" stroke-width="0.8"/><rect x="3" y="51" width="2" height="2" fill="#e8302e"/>`;

const ART: Record<string, string> = {
  teddy_bear: suit(
    "#ff4f8a",
    "#7ad8f0",
    `<circle cx="14" cy="9" r="6.4" fill="#ff4f8a"/><circle cx="50" cy="9" r="6.4" fill="#ff4f8a"/><circle cx="14" cy="9" r="3" fill="#ffb0cc"/><circle cx="50" cy="9" r="3" fill="#ffb0cc"/><path d="M32 63Q27 58 29 55Q31 54 32 56Q33 54 35 55Q37 58 32 63Z" fill="#ff4f8a"/>`,
  ),
  heart_suit: faceHole(
    `<path d="M32 72C12 58 3 45 3 29C3 16 12 7 22 7C27 7 30 10 32 13C34 10 37 7 42 7C52 7 61 16 61 29C61 45 52 58 32 72Z" fill="#e8253a"/>` +
      `<path d="M10 22Q12 13 20 12" fill="none" stroke="#ff8a98" stroke-width="2"/>` +
      `<circle cx="5" cy="44" r="3.4" fill="#ffffff"/><circle cx="59" cy="44" r="3.4" fill="#ffffff"/>` +
      `<rect x="26" y="70" width="3" height="14" fill="#e8253a"/><rect x="35" y="70" width="3" height="14" fill="#e8253a"/>` +
      FEET("#ffffff"),
    13.5,
    11,
  ),
  dolphin_suit: suit(
    "#a8b0c8",
    "#e6eaf4",
    `<path d="M24 8Q32 -2 44 4Q38 5 36 9Z" fill="#a8b0c8"/><path d="M40 78Q52 76 58 66Q60 74 54 80Q62 82 62 88Q54 86 48 86Z" fill="#8a92b0"/>`,
  ),
  skater:
    `<g fill="#3a5ab8">${LEGS}</g>${FEET("#26262e")}` +
    `<g fill="#3a9a4a">${TORSO}${ARMS}</g><path d="M30 48V56M34 48V56" stroke="#ffd84d" stroke-width="1"/>` +
    `<path d="M11 22Q11 3 32 3Q53 3 53 22Z" fill="#d8302a"/><rect x="11" y="18" width="42" height="4.6" fill="#a81e1a"/><circle cx="32" cy="2.6" r="2.6" fill="#a81e1a"/>` +
    `<rect x="12" y="89.4" width="40" height="2.6" rx="1.3" fill="#d8302a"/><circle cx="17" cy="93" r="1.6" fill="#26262e"/><circle cx="47" cy="93" r="1.6" fill="#26262e"/>`,
  masquerade_noir:
    dress("#26262e", TUTU("#3a3a46")) +
    HANDS("#26262e") +
    `<path fill-rule="evenodd" d="M12 30Q18 21 32 26Q46 21 52 30Q50 39 40 38Q35 37 32 34Q29 37 24 38Q14 39 12 30ZM20.6 31a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM33.4 31a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z" fill="#26262e"/>` +
    `<path d="M13 29Q19 22 32 27Q45 22 51 29" fill="none" stroke="#c8ccd8" stroke-width="1"/>` +
    `<path d="M14 26Q4 14 10 2Q14 14 18 24Z" fill="#3a3a46"/><path d="M15 25Q9 16 13 6" fill="none" stroke="#9aa0b0" stroke-width="0.8"/>`,
  masquerade_violet:
    dress("#7a3ac0", SKIRT("#5a2a9a", 88)) +
    `<path fill-rule="evenodd" d="M12 30Q18 21 32 26Q46 21 52 30Q50 39 40 38Q35 37 32 34Q29 37 24 38Q14 39 12 30ZM20.6 31a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM33.4 31a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z" fill="#9a5ae0"/>` +
    `<path d="M13 29Q19 22 32 27Q45 22 51 29" fill="none" stroke="#f2c84a" stroke-width="1.2"/>` +
    `<path d="M48 25Q58 12 52 2Q50 14 45 23Z" fill="#c99aff"/><path d="M18 23Q10 10 16 3Q18 14 21 22Z" fill="#c99aff"/>`,
  ice_skater:
    dress("#4a7ae0", TUTU("#7aa8ff")) +
    `<path d="M26 52L38 52M27 56L37 56" stroke="#bfe0ff" stroke-width="0.8"/>` +
    SKATES,
  hockey_red: hockey("#d8302a"),
  hockey_purple: hockey("#8a4ae0"),
  hockey_teal: hockey("#2ab8c8"),
  hockey_orange: hockey("#f2902a"),
  hula:
    dress("#d8202a", SKIRT("#d8202a", 86)) +
    `<g fill="#ffffff"><circle cx="27" cy="53" r="1.4"/><circle cx="37" cy="58" r="1.4"/><circle cx="25" cy="70" r="1.6"/><circle cx="38" cy="76" r="1.6"/><circle cx="30" cy="82" r="1.4"/></g>` +
    `<g fill="#ff5a8a"><circle cx="50" cy="12" r="3"/><circle cx="54" cy="15" r="3"/><circle cx="50" cy="18" r="3"/><circle cx="46" cy="15" r="3"/></g><circle cx="50" cy="15" r="1.6" fill="#ffd84d"/>`,
  cheerleader:
    dress("#2a5ad8") +
    `<path d="M23 48L32 56L41 48" fill="none" stroke="#ffffff" stroke-width="1.6"/>` +
    `<path d="M23 59H41L45 71Q32 73 19 71Z" fill="#d8202a"/><path d="M27 60L25 71M32 60V72M37 60L39 71" stroke="#ffffff" stroke-width="1"/>` +
    FEET("#ffffff") +
    `<circle cx="21" cy="65" r="5.6" fill="#7aa8ff"/><circle cx="43" cy="65" r="5.6" fill="#7aa8ff"/><path d="M17 63L25 67M19 69L23 61M39 63L47 67M41 69L45 61" stroke="#d8e8ff" stroke-width="0.8"/>`,
  canoe_yellow: canoe(
    "#f2b632",
    "#a8642a",
    `<path d="M50 74L53 68L56 74Z" fill="#2a8a3a"/><path d="M49.4 77L53 70L56.6 77Z" fill="#2a8a3a"/>`,
  ),
  canoe_purple: canoe(
    "#6a3ad8",
    "#f2c84a",
    `<path d="M10 78L16 74L22 78L28 74L34 78L40 74L46 78L52 74" fill="none" stroke="#c99aff" stroke-width="1"/>${FISHING_ROD}`,
  ),
  raft_blue:
    canoe("#3a8ae0", "#bfe0ff", FISHING_ROD) +
    `<ellipse cx="32" cy="10" rx="22" ry="5" fill="#f2e0a8"/><path d="M18 10Q18 0 32 0Q46 0 46 10Z" fill="#f2e0a8"/><rect x="18" y="7" width="28" height="2.4" fill="#a8642a"/>`,
  duck_float:
    dress("#ffffff") +
    `<ellipse cx="32" cy="68" rx="20" ry="7" fill="#ffd84d"/><ellipse cx="32" cy="66" rx="12" ry="3.4" fill="#e6b82a"/>` +
    `<circle cx="13" cy="60" r="5" fill="#ffd84d"/><path d="M8 60L4 61.6L8 63Z" fill="#f2902a"/><rect x="12" y="58" width="1.4" height="1.4" fill="#26262e"/>` +
    `<path d="M11 18Q11 4 32 4Q53 4 53 18Z" fill="#ffd84d"/><path d="M11 18H58V21H11Z" fill="#e6b82a"/>`,
  beach_bandana:
    dress("#4ac8c8") +
    `<path d="M23 60H41L41 70H33L32 66L31 70H23Z" fill="#2a8ad8"/>` +
    FEET("#ffffff") +
    `<path d="M12 18Q32 8 52 18L52 22Q32 13 12 22Z" fill="#2a8ad8"/><path d="M52 19L58 24L54 26Z" fill="#2a8ad8"/><g fill="#ffffff"><rect x="20" y="15" width="1.2" height="1.2"/><rect x="31" y="12" width="1.2" height="1.2"/><rect x="42" y="15" width="1.2" height="1.2"/></g>`,
  turtle:
    dress("#6ac83a", SKIRT("#4aa82a", 76)) +
    `<path d="M26 64H38L40 72H24Z" fill="#2a7a2a"/><path d="M28 66H36M27 70H37" stroke="#9ae86a" stroke-width="0.8"/>` +
    `<path d="M44 10Q52 2 58 8Q52 10 48 15Z" fill="#6ac83a"/><path d="M45 11Q51 6 56 8" fill="none" stroke="#2a7a2a" stroke-width="0.6"/>`,
  torch_bearer:
    dress("#f6c83a") +
    `<path d="M23 60H41L41 70H33L32 66L31 70H23Z" fill="#ffffff"/>` +
    FEET("#ffffff") +
    `<path d="M41 64L45 40" stroke="#c8a040" stroke-width="2.4"/><path d="M43 41H51L49 44H45Z" fill="#f2c84a"/><path d="M47 40Q41 34 46 26Q47 31 50 28Q53 34 47 40Z" fill="#ff7a2a"/><path d="M47 39Q44 35 47 31Q49 34 47 39Z" fill="#ffd84d"/>`,
  eagle_mascot: faceHole(
    `<g fill="#f4f4f8">${HOOD}</g><path d="M10 34Q22 46 32 46Q42 46 54 34L50 50Q32 56 14 50Z" fill="#f2c84a"/>` +
      `<path d="M10 16Q32 0 54 16L52 20Q32 6 12 20Z" fill="#7a3ac0"/>` +
      `<g fill="#7a3ac0">${TORSO}</g><path d="M23 48L8 70L20 66L22 72L26 58Z" fill="#9a5ae0"/><path d="M41 48L56 70L44 66L42 72L38 58Z" fill="#9a5ae0"/>` +
      `<g fill="#3a5ab8">${LEGS}</g>${FEET("#f2c84a")}`,
    14,
    10,
  ),
  pajama_pink:
    `<g fill="#ffb0cc">${LEGS}</g>${FEET("#ff6fa0")}` +
    dress("#ff8ab8") +
    `<g fill="#ffffff"><circle cx="27" cy="54" r="1.2"/><circle cx="36" cy="58" r="1.2"/><circle cx="28" cy="72" r="1.2"/><circle cx="36" cy="80" r="1.2"/></g>` +
    `<rect x="46" y="62" width="14" height="10" rx="3" fill="#ffffff"/><path d="M48 64H58" stroke="#ffb0cc" stroke-width="1"/>`,
  pajama_blue:
    `<g fill="#9ad0ff">${LEGS}</g>${FEET("#3a7ae0")}` +
    dress("#5aa8f0") +
    `<g fill="#ffd84d"><rect x="26" y="53" width="1.4" height="1.4"/><rect x="36" y="57" width="1.4" height="1.4"/><rect x="27" y="74" width="1.4" height="1.4"/><rect x="35" y="81" width="1.4" height="1.4"/></g>` +
    `<rect x="46" y="62" width="14" height="10" rx="3" fill="#f4f4f8"/><path d="M48 64H58" stroke="#9ad0ff" stroke-width="1"/>`,
  sleeping_bag: faceHole(
    `<rect x="9" y="6" width="46" height="88" rx="18" fill="#ff7ab8"/><rect x="14" y="44" width="36" height="46" rx="10" fill="#ffb0d4"/>` +
      `<path d="M14 52H50" stroke="#ff4f9a" stroke-width="1.2"/><g fill="#ffffff"><circle cx="22" cy="62" r="2"/><circle cx="40" cy="70" r="2"/><circle cx="26" cy="80" r="2"/></g><g fill="#ffd84d"><circle cx="22" cy="62" r="0.8"/><circle cx="40" cy="70" r="0.8"/><circle cx="26" cy="80" r="0.8"/></g>`,
  ),
  ufo:
    dress("#3ac83a") +
    `<ellipse cx="32" cy="74" rx="30" ry="10" fill="#3ab84a"/><ellipse cx="32" cy="71" rx="22" ry="4" fill="#8af07a"/>` +
    `<g fill="#ffd84d"><circle cx="10" cy="76" r="1.6"/><circle cx="21" cy="80" r="1.6"/><circle cx="32" cy="81.6" r="1.6"/><circle cx="43" cy="80" r="1.6"/><circle cx="54" cy="76" r="1.6"/></g>` +
    `<path d="M2 80L-4 76L-2 84Z" fill="#ff7a2a"/><path d="M14 84L10 92L18 88Z" fill="#ff7a2a"/>`,
  cave_mane: faceHole(
    `<path d="M32 2Q54 2 56 28Q60 52 54 74Q50 86 42 84L32 86L22 84Q14 86 10 74Q4 52 8 28Q10 2 32 2Z" fill="#8a5a2a"/>` +
      `<path d="M14 30Q12 50 16 70M50 30Q52 50 48 70M24 10Q20 30 22 50M40 10Q44 30 42 50" fill="none" stroke="#6a3a1a" stroke-width="1"/>` +
      `<path d="M18 16Q24 8 30 12" fill="none" stroke="#b07a3a" stroke-width="1.2"/>` +
      FEET("#c89a6a"),
    14,
    11,
  ),
  ballerina:
    dress("#8a5ae0", TUTU("#c99aff")) +
    FEET("#ffb0d4") +
    `<path d="M20 9L23 3L26 7L29 1L32 6L35 1L38 7L41 3L44 9Z" fill="#d8dce8"/><circle cx="32" cy="5" r="1.4" fill="#8af0ff"/>`,
  rain_hood: faceHole(
    `<g fill="#ffd84d">${HOOD}${TORSO}${ARMS}</g><path d="M22 60H42L45 78Q32 81 19 78Z" fill="#ffd84d"/>` +
      `<path d="M32 48V78" stroke="#e6b82a" stroke-width="1"/><g fill="#e6b82a"><circle cx="34" cy="54" r="0.9"/><circle cx="34" cy="62" r="0.9"/><circle cx="34" cy="70" r="0.9"/></g>` +
      `<rect x="24" y="78" width="7.6" height="10" rx="2" fill="#ffd84d"/><rect x="32.4" y="78" width="7.6" height="10" rx="2" fill="#ffd84d"/>`,
  ),
  sailor_pink:
    dress("#ff8ab8", SKIRT("#ff8ab8", 76)) +
    `<path d="M24 48L32 55L40 48L38 47Q32 50 26 47Z" fill="#ffffff"/><path d="M32 55L28 52.6V57.4ZM32 55L36 52.6V57.4Z" fill="#d8202a"/>` +
    `<path d="M20 74Q32 77 44 74" fill="none" stroke="#ffffff" stroke-width="1.2"/>` +
    FEET("#d8202a"),
};

const missing = COSTUMES.filter((c) => !ART[c.id]);
if (missing.length) throw new Error(`no art for ${missing.map((c) => c.id)}`);

await renderAll(
  COSTUMES.map((c) => ({
    name: `costume-${c.id}`,
    svg: ART[c.id],
    shading: true as const,
  })),
);
console.log(`${COSTUMES.length} costume sprites written`);
