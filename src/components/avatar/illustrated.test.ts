import assert from "node:assert/strict";
import test from "node:test";
import {
  generateIllustratedDollSvg,
  ILLUSTRATED_LAYERS,
  type IllustratedAsset,
  type IllustratedSlot,
} from "./illustrated.ts";

const assets: Record<IllustratedAsset, string> = {
  "base-warm": "base.png",
  "hair-blowout": "hair.png",
  "top-holo-halter": "top.png",
  "bottom-flares-indigo": "bottom.png",
  "shoes-lavender-platforms": "shoes.png",
};

test("illustrated layers keep hair behind skin, shoes under hems, and fringe above the face", () => {
  const svg = generateIllustratedDollSvg(assets);
  const slots = ILLUSTRATED_LAYERS.map((layer) => layer.slot);
  let previous = -1;
  for (const slot of slots) {
    const position = svg.indexOf(`class="illustrated-${slot}"`);
    assert.ok(position > previous, slot);
    previous = position;
  }
  assert.ok(svg.includes('clip-path="url(#doll-illustrated-doll-fringe)"'));
});

test("each illustrated clothing or hair layer can be removed without removing the body", () => {
  for (const slot of [
    "hair-back",
    "hair-front",
    "top",
    "bottom",
    "shoes",
    "jewelry",
  ] satisfies IllustratedSlot[]) {
    const svg = generateIllustratedDollSvg(assets, [slot]);
    assert.ok(!svg.includes(`class="illustrated-${slot}"`));
    assert.ok(svg.includes('class="illustrated-body"'));
  }
});

test("illustrated image sources are XML escaped", () => {
  const svg = generateIllustratedDollSvg({
    ...assets,
    "base-warm": '\"/><script>alert(1)</script>',
  });
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&quot;/&gt;&lt;script&gt;"));
});

test("full-length trousers hide the base legs; removing them restores the modest base", () => {
  assert.ok(
    generateIllustratedDollSvg(assets).includes(
      'clip-path="url(#doll-illustrated-doll-body)"',
    ),
  );
  assert.ok(
    !generateIllustratedDollSvg(assets, ["bottom"]).includes(
      'clip-path="url(#doll-illustrated-doll-body)"',
    ),
  );
});

test("two fitting previews namespace their filters and clips", () => {
  const a = generateIllustratedDollSvg(assets, [], "first");
  const b = generateIllustratedDollSvg(assets, [], "second");
  assert.ok(a.includes('id="doll-first-cutout"'));
  assert.ok(b.includes('id="doll-second-cutout"'));
  assert.ok(!b.includes("doll-first"));
});
