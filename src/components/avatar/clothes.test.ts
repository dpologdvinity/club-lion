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
import { DEFAULT_AVATAR_LOOK, type AvatarLook } from "../../types/world.ts";

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
