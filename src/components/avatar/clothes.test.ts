import test from "node:test";
import assert from "node:assert/strict";
import {
  renderLayer4Footwear,
  renderLayer5Outfit,
  sleeveSpecFor,
} from "./clothes.ts";
import { generateAvatarSvgString } from "../avatarSvg.ts";
import {
  BOTTOMS,
  OUTFIT_PRESETS,
  SHOES,
  TOPS,
} from "../../types/avatarOptions.ts";
import {
  CATALOG_ITEMS,
  DEFAULT_AVATAR_LOOK,
  type AvatarLook,
} from "../../types/world.ts";

/** Counts open vs close tags per name, ignoring self-closing elements. */
function unbalancedTags(markup: string): string[] {
  const counts = new Map<string, number>();
  for (const match of markup.matchAll(/<(\/?)([a-zA-Z]+)\b[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = match;
    if (selfClosing) continue;
    counts.set(name, (counts.get(name) ?? 0) + (closing ? -1 : 1));
  }
  return [...counts].filter(([, c]) => c !== 0).map(([name]) => name);
}

function assertValidMarkup(markup: string, context: string) {
  assert.doesNotMatch(markup, /NaN|undefined|Infinity/, context);
  assert.deepEqual(unbalancedTags(markup), [], context);
}

const dashed = (id: string) => id.replace(/_/g, "-");

test("every top × bottom combination renders valid, classed markup", () => {
  for (const top of TOPS) {
    for (const bottom of BOTTOMS) {
      for (const action of ["idle", "wave"]) {
        const look: AvatarLook = {
          ...DEFAULT_AVATAR_LOOK,
          topId: top.id,
          bottomId: bottom.id,
        };
        const outfit = renderLayer5Outfit(look, action);
        const context = `${top.id}/${bottom.id}/${action}`;
        assertValidMarkup(outfit, context);
        assert.ok(outfit.includes(`top-${dashed(top.id)}`), context);
        assert.ok(outfit.includes(`bottom-${dashed(bottom.id)}`), context);
        assert.ok(outfit.includes("avatar-hip-hand"), context);
      }
    }
  }
});

test("every shoe renders valid mirrored footwear with its class", () => {
  for (const shoe of SHOES) {
    for (const skinTone of ["fair", "deep"]) {
      const markup = renderLayer4Footwear({
        ...DEFAULT_AVATAR_LOOK,
        shoesId: shoe.id,
        skinTone,
      });
      assertValidMarkup(markup, shoe.id);
      assert.ok(markup.includes(`footwear-${dashed(shoe.id)}`), shoe.id);
      assert.ok(markup.includes("shoe-left") && markup.includes("shoe-right"));
    }
  }
});

test("each top, bottom, and shoe has distinct artwork", () => {
  const art = (look: Partial<AvatarLook>) =>
    renderLayer5Outfit({ ...DEFAULT_AVATAR_LOOK, ...look }).replace(
      /class="[^"]*"/,
      "",
    );
  const tops = new Set(
    TOPS.map((t) => art({ topId: t.id, bottomId: "flares_indigo" })),
  );
  assert.equal(tops.size, TOPS.length);
  const bottoms = new Set(
    BOTTOMS.map((b) => art({ topId: "white_baby_tee", bottomId: b.id })),
  );
  assert.equal(bottoms.size, BOTTOMS.length);
  const shoes = new Set(
    SHOES.map((s) =>
      renderLayer4Footwear({ ...DEFAULT_AVATAR_LOOK, shoesId: s.id }).replace(
        /class="[^"]*"/,
        "",
      ),
    ),
  );
  assert.equal(shoes.size, SHOES.length);
});

test("explicit pieces beat the legacy outfit, which beats the default", () => {
  const override = renderLayer5Outfit({
    ...DEFAULT_AVATAR_LOOK,
    outfitId: "cargo_pants",
    topId: "moto_jacket",
  });
  assert.ok(override.includes("top-moto-jacket"));
  assert.ok(override.includes("bottom-cargo-pants"), "bottom from preset");
  assert.ok(!override.includes("outfit-cargo-pants"), "no legacy class");

  const unknown = renderLayer5Outfit({
    ...DEFAULT_AVATAR_LOOK,
    outfitId: "mystery",
    topId: "nope",
    bottomId: "nope",
  });
  assert.ok(unknown.includes("top-denim-jacket bottom-flares-indigo"));
});

test("legacy outfits render their preset pieces with the legacy class", () => {
  for (const [outfitId, preset] of Object.entries(OUTFIT_PRESETS)) {
    const markup = renderLayer5Outfit({ ...DEFAULT_AVATAR_LOOK, outfitId });
    assert.ok(markup.includes(`outfit-${dashed(outfitId)}`), outfitId);
    assert.ok(markup.includes(`top-${dashed(preset.top)}`), outfitId);
    assert.ok(markup.includes(`bottom-${dashed(preset.bottom)}`), outfitId);
  }
});

test("raw outfit IDs never reach the markup", () => {
  const markup = renderLayer5Outfit({
    ...DEFAULT_AVATAR_LOOK,
    outfitId: '"><script>alert(1)</script>',
    shoesId: '"><img>',
  });
  assert.ok(!markup.includes("<script"));
  assert.ok(
    !renderLayer4Footwear({
      ...DEFAULT_AVATAR_LOOK,
      shoesId: '"><img>',
    }).includes("<img"),
  );
});

test("waving raises the matching sleeve for sleeved tops only", () => {
  for (const top of TOPS) {
    const look: AvatarLook = { ...DEFAULT_AVATAR_LOOK, topId: top.id };
    const spec = sleeveSpecFor(look);
    const svg = generateAvatarSvgString(look, "wave");
    const raised = svg.slice(svg.indexOf("avatar-raised-arm"));
    assert.equal(
      raised.includes("avatar-right-sleeve"),
      spec !== null,
      `${top.id} raised sleeve`,
    );
    if (spec) assert.ok(raised.includes(`stroke="${spec.color}"`), top.id);

    const idle = renderLayer5Outfit(look, "idle");
    assert.equal(idle.includes("avatar-right-sleeve"), spec !== null, top.id);
    assert.ok(
      !renderLayer5Outfit(look, "wave").includes("avatar-right-sleeve"),
    );
  }
});

test("every top, bottom, and shoe is drawn with the doll ink outline", () => {
  const ink = 'stroke="#2a1610"';
  for (const { id } of TOPS) {
    const look = { ...DEFAULT_AVATAR_LOOK, topId: id };
    assert.ok(renderLayer5Outfit(look).includes(ink), id);
  }
  for (const { id } of BOTTOMS) {
    const look = { ...DEFAULT_AVATAR_LOOK, bottomId: id };
    assert.ok(renderLayer5Outfit(look).includes(ink), id);
  }
  for (const { id } of SHOES) {
    const look = { ...DEFAULT_AVATAR_LOOK, shoesId: id };
    assert.ok(renderLayer4Footwear(look).includes(ink), id);
  }
});

test("legs and footwear share the long-leg rig so platforms land on the ground", () => {
  const footwear = renderLayer4Footwear(DEFAULT_AVATAR_LOOK);
  const outfit = renderLayer5Outfit(DEFAULT_AVATAR_LOOK);
  const legsRig = /<g transform="(matrix\(0\.8 0 0 1\.38 [^"]+\))">/;
  const shoeRig = footwear.match(legsRig)?.[1];
  assert.ok(shoeRig, "footwear placed on the legs rig");
  assert.ok(outfit.includes(shoeRig), "bottoms use the same rig");
  // The 6.6-unit platform sole stretches to a chunky 8.7 units on screen
  const [, , , scaleY] = shoeRig.slice(7, -1).split(" ").map(Number);
  assert.ok(6.6 * scaleY > 8.5);
});

test("moon-boot fluff merges into the shaft outline instead of stitching", () => {
  const boots = renderLayer4Footwear({
    ...DEFAULT_AVATAR_LOOK,
    shoesId: "moon_boots",
  });
  const tufts = (stroke: string) =>
    boots.match(
      new RegExp(`<circle[^>]*fill="#fff5fb" stroke="${stroke}"`, "g"),
    ) ?? [];
  const inkedTufts = tufts("#2a1610");
  const plainTufts = tufts("none");
  assert.ok(inkedTufts.length >= 12);
  assert.equal(plainTufts.length, inkedTufts.length);
});

test("pink faux-fur jacket is a shop piece with merged fluffy edges", () => {
  const item = CATALOG_ITEMS.find((i) => i.id === "pink_fur_jacket");
  assert.equal(item?.slot, "top_outer");
  assert.ok(!TOPS.find((t) => t.id === "pink_fur_jacket" && "free" in t));
  assert.ok(TOPS.some((t) => t.id === "holo_halter" && "free" in t));
  const outfit = renderLayer5Outfit({
    ...DEFAULT_AVATAR_LOOK,
    topId: "pink_fur_jacket",
  });
  const tufts = (stroke: string) =>
    outfit.match(
      new RegExp(`<circle[^>]*fill="#ff(c4de|d6e8)" stroke="${stroke}"`, "g"),
    )?.length ?? 0;
  assert.ok(tufts("#2a1610") >= 18);
  assert.equal(tufts("none"), tufts("#2a1610"));
});
