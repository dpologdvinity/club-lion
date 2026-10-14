/**
 * Coloring Book line art. Every fillable region is its own SVG path, drawn in
 * painter's order, so coloring is per-region state instead of a flood fill.
 * Pages share a 400×300 view box.
 */

export type ColoringRegion = { id: string; label: string; d: string };
export type ColoringDetail = { kind: "ink" | "line" | "shine"; d: string };
export type ColoringPage = {
  id: string;
  name: string;
  regions: ColoringRegion[];
  details: ColoringDetail[];
};

const r1 = (value: number) => Math.round(value * 10) / 10;

/** Clockwise circle; `hole` winds it the other way to cut a ring. */
export const circle = (cx: number, cy: number, r: number, hole = false) =>
  `M${r1(cx - r)} ${r1(cy)}a${r} ${r} 0 1 ${hole ? 0 : 1} ${r * 2} 0a${r} ${r} 0 1 ${hole ? 0 : 1} ${-r * 2} 0Z`;

export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r1(cx - rx)} ${r1(cy)}a${rx} ${ry} 0 1 1 ${rx * 2} 0a${rx} ${ry} 0 1 1 ${-rx * 2} 0Z`;

export const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;

export const poly = (...points: number[]) =>
  `M${points[0]} ${points[1]}${points
    .slice(2)
    .map((value, index) => (index % 2 ? ` ${value}` : `L${value}`))
    .join("")}Z`;

const ring = (cx: number, cy: number, outer: number, inner: number) =>
  circle(cx, cy, outer) + circle(cx, cy, inner, true);

/** A puffy round shape for manes, clouds, flowers and leaves. */
export function scallop(cx: number, cy: number, r: number, bumps: number) {
  const point = (index: number) => {
    const angle = (index / bumps) * Math.PI * 2 - Math.PI / 2;
    return [r1(cx + r * Math.cos(angle)), r1(cy + r * Math.sin(angle))];
  };
  const bump = r1(r * Math.sin(Math.PI / bumps));
  const [x0, y0] = point(0);
  let d = `M${x0} ${y0}`;
  for (let index = 1; index <= bumps; index++) {
    const [x, y] = point(index);
    d += `A${bump} ${bump} 0 0 1 ${x} ${y}`;
  }
  return `${d}Z`;
}

export function star(cx: number, cy: number, outer: number, inner: number) {
  const points: number[] = [];
  for (let index = 0; index < 10; index++) {
    const angle = (index / 10) * Math.PI * 2 - Math.PI / 2;
    const r = index % 2 ? inner : outer;
    points.push(r1(cx + r * Math.cos(angle)), r1(cy + r * Math.sin(angle)));
  }
  return poly(...points);
}

const mango = (x: number, y: number, s: number) =>
  `M${x - s} ${y}C${x - s} ${y - 1.3 * s} ${x + s} ${y - 1.1 * s} ${x + s} ${y + 0.1 * s}C${x + s} ${y + 1.1 * s} ${x - 0.2 * s} ${y + 1.2 * s} ${x - s} ${y}Z`;

/** A strip of water with a wavy top edge across the whole page. */
const waveBand = (y: number, height: number, amp: number, period: number) =>
  `M0 ${y}q${period / 4} ${-amp} ${period / 2} 0${` t${period / 2} 0`.repeat(
    Math.ceil(400 / (period / 2)) - 1,
  )}V${y + height}H0Z`;

/** A triangle spike standing on an ellipse, pointing away from its center. */
function spike(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  degrees: number,
  length: number,
) {
  const angle = (degrees * Math.PI) / 180;
  const at = (offset: number, scale: number) => [
    r1(cx + rx * scale * Math.cos(angle + offset)),
    r1(cy + ry * scale * Math.sin(angle + offset)),
  ];
  const tip = at(0, 1 + length / Math.max(rx, ry));
  return poly(...at(-0.17, 0.92), ...tip, ...at(0.17, 0.92));
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const regions = (...items: [string, ...string[]][]): ColoringRegion[] =>
  items.map(([label, ...paths]) => ({
    id: slug(label),
    label,
    d: paths.join(""),
  }));
const ink = (...paths: string[]): ColoringDetail[] =>
  paths.map((d) => ({ kind: "ink", d }));
const lines = (...paths: string[]): ColoringDetail[] =>
  paths.map((d) => ({ kind: "line", d }));
const shine = (...paths: string[]): ColoringDetail[] =>
  paths.map((d) => ({ kind: "shine", d }));

const sky = rect(0, 0, 400, 300);

const lionCub: ColoringPage = {
  id: "lion-cub",
  name: "Lion cub",
  regions: regions(
    ["Sky", sky],
    ["Sun", circle(340, 56, 28)],
    ["Cloud", scallop(84, 52, 22, 7)],
    ["Far hill", "M0 205Q90 165 190 196T400 186V300H0Z"],
    ["Grass", "M0 238Q110 218 210 238T400 232V300H0Z"],
    [
      "Tail",
      "M256 236C296 240 300 196 314 180L322 186C310 204 314 252 258 250Z",
    ],
    ["Tail tuft", scallop(320, 174, 13, 6)],
    ["Body", ellipse(205, 222, 64, 44)],
    ["Tummy", ellipse(205, 238, 34, 22)],
    ["Back paws", ellipse(150, 258, 22, 12), ellipse(260, 258, 22, 12)],
    ["Front paws", ellipse(184, 263, 18, 11), ellipse(226, 263, 18, 11)],
    ["Mane", scallop(200, 128, 74, 14)],
    ["Ears", circle(150, 78, 20), circle(250, 78, 20)],
    ["Inner ears", circle(150, 78, 10), circle(250, 78, 10)],
    ["Face", circle(200, 132, 54)],
    ["Cheeks", ellipse(162, 148, 10, 7), ellipse(238, 148, 10, 7)],
    ["Muzzle", ellipse(187, 157, 17, 13), ellipse(213, 157, 17, 13)],
    ["Nose", "M188 141Q200 135 212 141Q207 152 200 154Q193 152 188 141Z"],
    ["Flower", scallop(64, 266, 13, 6)],
    ["Flower middle", circle(64, 266, 5)],
    ["Little flower", scallop(352, 276, 10, 5)],
  ),
  details: [
    ...ink(circle(180, 120, 7), circle(220, 120, 7)),
    ...shine(circle(182.5, 117.5, 2.5), circle(222.5, 117.5, 2.5)),
    ...lines(
      "M200 154V162M200 162Q191 171 182 165M200 162Q209 171 218 165",
      "M180 232Q186 226 192 232M218 232Q224 226 230 232",
      "M24 286l5-12l5 12M290 292l5-12l5 12M120 280l4-10l4 10",
    ),
  ],
};

const puppy: ColoringPage = {
  id: "puppy",
  name: "Puppy",
  regions: regions(
    ["Wall", rect(0, 0, 400, 215)],
    ["Window frame", rect(34, 34, 108, 86, 10)],
    ["Window sky", rect(44, 44, 88, 66, 6)],
    ["Picture frame", rect(280, 38, 84, 64, 6)],
    ["Picture", rect(290, 48, 64, 44, 4)],
    ["Floor", rect(0, 215, 400, 85)],
    ["Rug", ellipse(208, 264, 162, 30)],
    ["Kibble", ellipse(82, 246, 28, 8)],
    ["Food bowl", "M48 246H116L108 272H56Z"],
    ["Tail", "M270 196Q300 172 296 146Q310 156 304 180Q296 206 276 214Z"],
    ["Body", ellipse(222, 214, 62, 42)],
    ["Back spot", ellipse(246, 198, 22, 14)],
    [
      "Paws",
      ellipse(178, 252, 17, 10),
      ellipse(208, 256, 17, 10),
      ellipse(262, 252, 17, 10),
    ],
    ["Head", ellipse(166, 140, 50, 44)],
    ["Tongue", ellipse(166, 182, 7, 9)],
    ["Left ear", "M128 106Q98 112 100 160Q104 186 122 176Q130 146 138 116Z"],
    ["Right ear", "M204 106Q234 112 232 160Q228 186 210 176Q202 146 194 116Z"],
    ["Eye patch", ellipse(186, 128, 15, 13)],
    ["Snout", ellipse(166, 162, 26, 18)],
    ["Nose", ellipse(166, 152, 10, 7)],
    ["Collar", rect(176, 184, 56, 11, 5)],
    ["Tag", circle(204, 202, 8)],
    ["Ball", circle(334, 256, 22)],
    ["Ball stripe", "M313 250Q334 240 355 252L354 262Q334 252 314 260Z"],
  ),
  details: [
    ...ink(circle(148, 130, 6), circle(186, 130, 6)),
    ...shine(circle(150, 128, 2), circle(188, 128, 2)),
    ...lines(
      "M166 159V169M166 169Q158 175 150 170M166 169Q174 175 182 170",
      "M88 44V110M44 77H132",
      "M322 62c-6-8-18 0 0 16c18-16 6-24 0-16",
      "M70 242l4 3M84 240l3 4M96 243l4 2",
    ),
  ],
};

const wheelSeats = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;
  return [r1(200 + 100 * Math.cos(angle)), r1(150 + 100 * Math.sin(angle))];
});
const spokes = Array.from({ length: 8 }, (_, index) => {
  const angle = ((index + 0.5) / 8) * Math.PI * 2;
  const across = angle + Math.PI / 2;
  const [dx, dy] = [2.2 * Math.cos(across), 2.2 * Math.sin(across)];
  const [x1, y1] = [200 + 12 * Math.cos(angle), 150 + 12 * Math.sin(angle)];
  const [x2, y2] = [200 + 97 * Math.cos(angle), 150 + 97 * Math.sin(angle)];
  return poly(
    r1(x1 + dx),
    r1(y1 + dy),
    r1(x2 + dx),
    r1(y2 + dy),
    r1(x2 - dx),
    r1(y2 - dy),
    r1(x1 - dx),
    r1(y1 - dy),
  );
});

const ferrisWheel: ColoringPage = {
  id: "ferris-wheel",
  name: "Ferris wheel",
  regions: regions(
    ["Sky", sky],
    ["Sun", circle(52, 50, 24)],
    ["Big cloud", scallop(334, 46, 24, 7)],
    ["Little cloud", scallop(40, 138, 15, 6)],
    ["Hills", "M0 250Q100 228 200 246T400 240V300H0Z"],
    ["Left leg", poly(197, 152, 136, 274, 154, 274, 205, 162)],
    ["Right leg", poly(203, 152, 264, 274, 246, 274, 195, 162)],
    ["Spokes", ...spokes],
    ["Outer rim", ring(200, 150, 104, 95)],
    ["Inner rim", ring(200, 150, 56, 50)],
    ...wheelSeats.map(([x, y], index): [string, string] => [
      `Seat ${index + 1}`,
      rect(x - 15, y + 5, 30, 22, 7),
    ]),
    ["Hub", circle(200, 150, 14)],
    ["Hub cap", circle(200, 150, 6)],
    ["Ticket booth", rect(318, 208, 58, 52, 4)],
    ["Booth roof", poly(308, 210, 347, 184, 386, 210)],
    ["Booth window", rect(331, 220, 32, 18, 4)],
    ["Flag", poly(347, 160, 368, 166, 347, 172)],
  ),
  details: lines(
    ...wheelSeats.map(([x, y]) => `M${x} ${y}V${y + 5}`),
    "M347 184V160",
    "M70 92q6-6 12 0q6-6 12 0M318 112q5-5 10 0q5-5 10 0",
  ),
};

const roofEdges = [218, 256.5, 295, 333.5, 372];
const beach: ColoringPage = {
  id: "beach",
  name: "Beach and cabana",
  regions: regions(
    ["Sky", sky],
    ["Sun", circle(334, 50, 26)],
    ["Cloud", scallop(156, 42, 18, 7)],
    ["Sea", rect(0, 128, 400, 90)],
    ["Far wave", waveBand(142, 14, 4, 40)],
    ["Near wave", waveBand(168, 14, 5, 50)],
    ["Sand", "M0 196Q200 178 400 198V300H0Z"],
    ["Palm trunk", "M30 216Q22 160 44 104L54 108Q36 160 44 216Z"],
    [
      "Palm leaves",
      "M49 104Q22 78 0 98Q26 90 49 104Z",
      "M49 104Q70 70 104 82Q74 84 49 104Z",
      "M49 104Q40 66 62 48Q50 74 49 104Z",
      "M49 104Q86 100 100 124Q80 106 49 104Z",
    ],
    ["Coconuts", circle(44, 112, 6), circle(57, 113, 6)],
    ["Curtain", rect(236, 134, 118, 96, 4)],
    ["Beach towel", rect(262, 208, 66, 16, 4)],
    ["Left pole", rect(228, 126, 9, 114, 3)],
    ["Right pole", rect(353, 126, 9, 114, 3)],
    ...roofEdges
      .slice(0, -1)
      .map((x, index): [string, string] => [
        `Roof stripe ${index + 1}`,
        poly(295, 78, x, 134, roofEdges[index + 1], 134),
      ]),
    ["Roof trim", `M218 134${" a9.625 9.625 0 0 0 19.25 0".repeat(8)}Z`],
    ["Beach ball", circle(98, 258, 24)],
    [
      "Ball stripes",
      "M98 234Q80 258 98 282Q90 258 98 234Z",
      "M98 234Q116 258 98 282Q106 258 98 234Z",
    ],
    ["Bucket", poly(142, 256, 176, 256, 171, 288, 147, 288)],
    ["Castle towers", rect(180, 238, 14, 42, 2), rect(222, 238, 14, 42, 2)],
    ["Castle", rect(186, 252, 44, 28, 2)],
    ["Castle flag", poly(208, 232, 222, 238, 208, 244)],
    ["Starfish", star(334, 270, 15, 6)],
    ["Shell", "M266 292Q258 270 276 266Q294 270 286 292Z"],
  ),
  details: lines(
    "M142 258Q159 236 176 258",
    "M208 252V232",
    "M270 290L276 270M276 291V268M282 290L276 270",
    "M90 70q6-6 12 0q6-6 12 0M244 34q5-5 10 0q5-5 10 0",
    "M180 238v-5h4v5M190 238v-5h4M222 238v-5h4v5M232 238v-5h4",
  ),
};

const dragon: ColoringPage = {
  id: "dragon",
  name: "Dragon",
  regions: regions(
    ["Sky", sky],
    ["Sun", circle(354, 44, 22)],
    ["Cloud", scallop(252, 42, 18, 7)],
    ["Mountain", poly(214, 240, 300, 108, 386, 240)],
    [
      "Snow cap",
      poly(300, 108, 280, 140, 292, 134, 300, 146, 308, 134, 320, 140),
    ],
    ["Grass", "M0 236Q200 216 400 240V300H0Z"],
    [
      "Wing",
      "M214 168Q236 84 316 78Q300 96 306 116Q284 110 282 134Q262 128 258 156Q240 150 234 178Z",
    ],
    [
      "Tail",
      "M256 228Q320 250 334 210Q340 196 352 200Q346 214 344 228Q330 270 252 252Z",
    ],
    ["Tail tip", "M342 206L364 180L372 212Z"],
    ...[-118, -92, -66, -40].map((degrees, index): [string, string] => [
      `Spike ${index + 1}`,
      spike(205, 212, 66, 50, degrees, 28),
    ]),
    ["Body", ellipse(205, 212, 66, 50)],
    ["Tummy", ellipse(188, 226, 36, 34)],
    ["Feet", ellipse(170, 262, 22, 11), ellipse(242, 262, 22, 11)],
    ["Arm", ellipse(226, 218, 9, 17)],
    ["Neck", ellipse(166, 166, 24, 20)],
    ["Horns", poly(118, 98, 110, 70, 132, 94), poly(150, 94, 162, 66, 166, 98)],
    ["Head", ellipse(140, 130, 44, 38)],
    ["Snout", ellipse(104, 142, 28, 20)],
    ["Cheek", ellipse(148, 148, 9, 6)],
    ["Eye", ellipse(140, 118, 11, 12)],
    ["Fire puff", scallop(42, 132, 22, 8)],
    ["Fire middle", scallop(42, 132, 11, 6)],
  ),
  details: [
    ...ink(
      circle(143, 120, 6),
      ellipse(92, 136, 3, 2),
      ellipse(105, 133, 3, 2),
    ),
    ...shine(circle(145, 117, 2)),
    ...lines(
      "M84 150Q100 160 118 152",
      "M162 208Q188 214 214 208M160 224Q188 230 216 224M164 240Q188 246 212 240",
      "M234 172Q268 112 316 80M258 154Q280 122 306 116",
      "M160 270l-2 5M170 272v5M180 270l2 5M232 270l-2 5M242 272v5M252 270l2 5",
    ),
  ],
};

const treehouse: ColoringPage = {
  id: "mango-treehouse",
  name: "Mango treehouse",
  regions: regions(
    ["Sky", sky],
    ["Sun", circle(48, 46, 22)],
    ["Cloud", scallop(356, 36, 18, 7)],
    ["Grass", "M0 252Q200 232 400 254V300H0Z"],
    ["Bush", scallop(352, 254, 24, 8)],
    ["Trunk", "M176 300Q188 230 184 150L216 150Q212 230 226 300Z"],
    ["Left branch", "M188 190Q150 170 112 150L116 142Q154 160 190 176Z"],
    ["Right branch", "M212 196Q256 176 290 152L296 160Q260 186 214 210Z"],
    ["Left leaves", scallop(106, 114, 48, 11)],
    ["Right leaves", scallop(298, 112, 50, 11)],
    ["Top leaves", scallop(200, 74, 62, 13)],
    ["Mango 1", mango(86, 140, 9)],
    ["Mango 2", mango(124, 96, 9)],
    ["Mango 3", mango(280, 140, 9)],
    ["Mango 4", mango(318, 96, 9)],
    ["Mango 5", mango(152, 42, 9)],
    ["Mango 6", mango(250, 48, 9)],
    ["Deck", rect(128, 152, 144, 12, 3)],
    ["Walls", rect(148, 104, 104, 48, 2)],
    ["Roof", poly(138, 108, 200, 66, 262, 108)],
    ["Door", rect(190, 118, 22, 34, 6)],
    ["Left window", rect(158, 114, 22, 20, 3)],
    ["Right window", rect(222, 114, 22, 20, 3)],
    ["Flag", poly(200, 40, 222, 46, 200, 52)],
    ["Ladder", rect(150, 164, 6, 92, 2), rect(172, 164, 6, 92, 2)],
    ["Swing seat", rect(246, 232, 46, 9, 3)],
  ),
  details: lines(
    "M200 66V40",
    "M156 182H172M156 200H172M156 218H172M156 236H172",
    "M254 232V180M284 232V162",
    "M169 114V134M158 124H180M233 114V134M222 124H244",
    "M207 136h2",
    ...[
      [86, 140],
      [124, 96],
      [280, 140],
      [318, 96],
      [152, 42],
      [250, 48],
    ].map(([x, y]) => `M${x + 2} ${y - 9}q2-5 6-6`),
  ),
};

export const COLORING_PAGES: readonly ColoringPage[] = [
  lionCub,
  puppy,
  ferrisWheel,
  beach,
  dragon,
  treehouse,
];
