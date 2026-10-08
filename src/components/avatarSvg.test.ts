import test from "node:test";
import assert from "node:assert/strict";
import {
  generateAvatarSvgString,
  SKIN_TONE_COLORS,
  ANCHORS,
} from "./avatarSvg.ts";
import {
  DEFAULT_AVATAR_LOOK,
  EYE_STYLES,
  HAIR_STYLES,
  type AvatarLook,
} from "../types/world.ts";

test("generateAvatarSvgString outputs stacked SVG layers in correct order", () => {
  const svg = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "idle");
  assert.ok(svg.includes("avatar-body"));
  assert.ok(svg.includes("avatar-eyes"));
  assert.ok(svg.includes("avatar-hair-front"));

  const idxShadow = svg.indexOf("avatar-shadow");
  const idxBody = svg.indexOf("avatar-body");
  const idxEyes = svg.indexOf("avatar-eyes");
  const idxFootwear = svg.indexOf("avatar-footwear");
  const idxOutfit = svg.indexOf("avatar-outfit");
  const idxHairFront = svg.indexOf("avatar-hair-front");

  assert.ok(idxShadow !== -1, "avatar-shadow should be present");
  assert.ok(idxBody !== -1, "avatar-body should be present");
  assert.ok(idxEyes !== -1, "avatar-eyes should be present");
  assert.ok(idxFootwear !== -1, "avatar-footwear should be present");
  assert.ok(idxOutfit !== -1, "avatar-outfit should be present");
  assert.ok(idxHairFront !== -1, "avatar-hair-front should be present");

  assert.ok(idxShadow < idxBody, "shadow before body");
  assert.ok(idxBody < idxEyes, "body before eyes");
  assert.ok(idxEyes < idxFootwear, "eyes before footwear");
  assert.ok(idxFootwear < idxOutfit, "footwear before outfit");
  assert.ok(idxOutfit < idxHairFront, "outfit before hair front");
});

test("generates custom skin tone fill correctly", () => {
  const darkLook = { ...DEFAULT_AVATAR_LOOK, skinTone: "deep" as const };
  const svg = generateAvatarSvgString(darkLook, "idle");
  assert.ok(svg.includes("#5c3826"));
});

test("supports all standard skin tones and direct hex colors", () => {
  for (const [tone, color] of Object.entries(SKIN_TONE_COLORS)) {
    const look = { ...DEFAULT_AVATAR_LOOK, skinTone: tone };
    const svg = generateAvatarSvgString(look, "idle");
    assert.ok(
      svg.includes(color),
      `SVG should include color ${color} for skin tone ${tone}`,
    );
  }

  const customHexLook = { ...DEFAULT_AVATAR_LOOK, skinTone: "#123456" };
  const svgCustom = generateAvatarSvgString(customHexLook, "idle");
  assert.ok(svgCustom.includes("#123456"));
});

test("renders all eye styles distinctly", () => {
  const sparkleSvg = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    eyeStyle: "sparkle",
  });
  const winkSvg = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    eyeStyle: "wink",
  });
  const sleepySvg = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    eyeStyle: "sleepy",
  });
  const smirkSvg = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    eyeStyle: "smirk",
  });

  assert.ok(sparkleSvg.includes("eye-sparkle"));
  assert.ok(winkSvg.includes("eye-wink"));
  assert.ok(sleepySvg.includes("eye-sleepy"));
  assert.ok(smirkSvg.includes("eye-smirk"));
});

test("renders hair front and back layers with highlights and custom colors", () => {
  const longHairLook: AvatarLook = {
    ...DEFAULT_AVATAR_LOOK,
    hairId: "long_waves",
    hairColor: "#e67e22",
  };
  const svg = generateAvatarSvgString(longHairLook, "idle");
  assert.ok(
    svg.includes("avatar-hair-back"),
    "long_waves should render back hair layer",
  );
  assert.ok(svg.includes("avatar-hair-front"), "hair front should render");
  assert.ok(svg.includes("#e67e22"), "hair color fill should be present");
  assert.ok(
    svg.includes("hair-highlight"),
    "highlight streaks should be present",
  );

  const idxHairBack = svg.indexOf("avatar-hair-back");
  const idxBody = svg.indexOf("avatar-body");
  const idxHairFront = svg.indexOf("avatar-hair-front");
  assert.ok(idxHairBack < idxBody, "back hair must render before body layer");
  assert.ok(idxBody < idxHairFront, "front hair must render after body layer");
});

test("renders accessories in correct layer stacking positions", () => {
  const fullyEquippedLook: AvatarLook = {
    ...DEFAULT_AVATAR_LOOK,
    headwearId: "explorer_fedora",
    eyewearId: "sunshine_shades",
    boardId: "hover_leaf",
    handheldId: "mango_smoothie_cup",
  };
  const svg = generateAvatarSvgString(fullyEquippedLook, "idle");

  assert.ok(svg.includes("avatar-board"), "board layer present");
  assert.ok(svg.includes("avatar-headwear"), "headwear layer present");
  assert.ok(svg.includes("avatar-eyewear"), "eyewear layer present");
  assert.ok(svg.includes("avatar-handheld"), "handheld layer present");

  const idxBoard = svg.indexOf("avatar-board");
  const idxHairFront = svg.indexOf("avatar-hair-front");
  const idxHeadwear = svg.indexOf("avatar-headwear");
  const idxHandheld = svg.indexOf("avatar-handheld");

  assert.ok(idxBoard < idxHairFront, "board renders under avatar feet");
  assert.ok(idxHairFront < idxHeadwear, "headwear renders above hair front");
  assert.ok(idxHeadwear < idxHandheld, "handheld renders at front layer 8");
});

test("board equips sparkle trails and hover aura", () => {
  const boardLook: AvatarLook = {
    ...DEFAULT_AVATAR_LOOK,
    boardId: "hover_leaf",
  };
  const svg = generateAvatarSvgString(boardLook, "walk");
  assert.ok(svg.includes("sparkle-trail"));
  assert.ok(svg.includes("hover-leaf"));
});

test("uses standard 120x160 canvas coordinates and fixed anchor points", () => {
  const svg = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "idle");
  assert.ok(svg.includes('viewBox="0 0 120 160"'));
  assert.ok(svg.includes('width="120"'));
  assert.ok(svg.includes('height="160"'));

  assert.equal(ANCHORS.HeadCenter.x, 60);
  assert.equal(ANCHORS.HeadCenter.y, 38);
  assert.equal(ANCHORS.Neck.x, 60);
  assert.equal(ANCHORS.Neck.y, 68);
  assert.equal(ANCHORS.Waist.x, 60);
  assert.equal(ANCHORS.Waist.y, 98);
  assert.equal(ANCHORS.HandRight.x, 32);
  assert.equal(ANCHORS.HandRight.y, 92);
  assert.equal(ANCHORS.Feet.x, 60);
  assert.equal(ANCHORS.Feet.y, 142);
});

test("applies action classes and poses for idle, walk, wave, dance, sit, and jam", () => {
  for (const action of ["idle", "walk", "wave", "dance", "sit", "jam"]) {
    const svg = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, action);
    assert.ok(
      svg.includes(`action-${action}`),
      `Should include action-${action} class`,
    );
  }
});

test("wave action dynamically raises sleeve and arm together", () => {
  const svg = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "wave");
  assert.ok(svg.includes("avatar-right-sleeve"));
  assert.ok(svg.includes("arm-wave"));
});

/* -------------------------------------------------------------
 * Y2K glam redesign coverage
 * ------------------------------------------------------------- */

const OUTFITS = [
  "denim_jacket",
  "striped_tee",
  "cargo_pants",
  "barista_apron",
  "cropped_puffer",
  "mystery_outfit",
];
const SHOES = ["canvas_sneakers", "platform_boots", "mystery_shoes"];
const ACTIONS = ["idle", "walk", "wave", "dance", "sit", "jam"];

/** Returns tag names whose opening and closing counts differ. */
function unbalancedTags(svg: string): string[] {
  const counts = new Map<string, number>();
  const tagPattern = /<(\/?)([A-Za-z][\w:-]*)\b[^>]*?(\/?)>/g;
  for (const match of svg.matchAll(tagPattern)) {
    const [, closing, name, selfClosing] = match;
    if (selfClosing) continue;
    counts.set(name, (counts.get(name) ?? 0) + (closing ? -1 : 1));
  }
  return [...counts].filter(([, count]) => count !== 0).map(([name]) => name);
}

function assertValidSvg(svg: string, label: string) {
  for (const bad of ["NaN", "undefined", "Infinity"]) {
    assert.ok(!svg.includes(bad), `${label} should not contain ${bad}`);
  }
  assert.deepEqual(unbalancedTags(svg), [], `${label} has unclosed tags`);
}

test("tag balance checker detects unclosed tags", () => {
  assert.deepEqual(unbalancedTags("<g><path d='M0 0' /></g>"), []);
  assert.deepEqual(unbalancedTags("<g><g></g>"), ["g"]);
});

test("every eye style and hairstyle combo produces valid SVG markup", () => {
  for (const eyeStyle of EYE_STYLES) {
    for (const hairId of HAIR_STYLES) {
      const look = { ...DEFAULT_AVATAR_LOOK, eyeStyle, hairId };
      assertValidSvg(
        generateAvatarSvgString(look, "idle"),
        `${eyeStyle}/${hairId}`,
      );
    }
  }
});

test("every outfit, shoe, and action produces valid SVG markup", () => {
  for (const outfitId of OUTFITS) {
    for (const shoesId of SHOES) {
      for (const action of ACTIONS) {
        const look: AvatarLook = {
          ...DEFAULT_AVATAR_LOOK,
          outfitId,
          shoesId,
          handheldId: "mango_smoothie_cup",
          boardId: "hover_leaf",
          eyewearId: "sunshine_shades",
          headwearId: "explorer_fedora",
        };
        assertValidSvg(
          generateAvatarSvgString(look, action),
          `${outfitId}/${shoesId}/${action}`,
        );
      }
    }
  }
});

test("each eye style renders its glam class, liner, and lashes", () => {
  for (const eyeStyle of EYE_STYLES) {
    const svg = generateAvatarSvgString({ ...DEFAULT_AVATAR_LOOK, eyeStyle });
    assert.ok(
      svg.includes(`eye-${eyeStyle.replace(/_/g, "-")}`),
      `${eyeStyle} class present`,
    );
    assert.ok(svg.includes("eye-blink"), `${eyeStyle} has an open eye`);
    assert.ok(svg.includes("-iris)"), `${eyeStyle} iris gradient used`);
    assert.ok(svg.includes('clip-path="url(#'), `${eyeStyle} iris clipped`);
    if (eyeStyle === "wink") {
      assert.ok(svg.includes("eye-closed"), "wink closes one eye");
    } else {
      assert.ok(!svg.includes("eye-closed"), `${eyeStyle} keeps eyes open`);
    }
  }
});

test("unknown eye style falls back to winged glam", () => {
  const svg = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    eyeStyle: "laser_eyes",
  });
  assert.ok(svg.includes("eye-winged-glam"));
});

function hairClasses(svg: string) {
  return {
    back: svg.match(/avatar-hair-back (hair-[a-z-]+)/)?.[1],
    front: svg.match(/avatar-hair-front (hair-[a-z-]+)/)?.[1],
  };
}

test("each hairstyle renders matching back and front layers", () => {
  for (const hairId of HAIR_STYLES) {
    const cls = `hair-${hairId.replace(/_/g, "-")}`;
    const svg = generateAvatarSvgString({ ...DEFAULT_AVATAR_LOOK, hairId });
    assert.deepEqual(hairClasses(svg), { back: cls, front: cls }, hairId);
  }
});

test("legacy and unknown hair IDs map to glam hairstyles", () => {
  const expected: Record<string, string> = {
    classic_shag: "hair-blowout",
    long_waves: "hair-butterfly-waves",
    beach_wave_bangs: "hair-butterfly-waves",
    spiky_blaze: "hair-space-buns",
    retro_bob: "hair-blunt-bob",
    mohawk_supreme: "hair-blowout",
  };
  for (const [hairId, cls] of Object.entries(expected)) {
    const svg = generateAvatarSvgString({ ...DEFAULT_AVATAR_LOOK, hairId });
    assert.deepEqual(hairClasses(svg), { back: cls, front: cls }, hairId);
  }
});

test("idPrefix scopes gradient and clip IDs", () => {
  const svg = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "idle", {
    idPrefix: "p1",
  });
  assert.ok(svg.includes('id="p1-iris"'));
  assert.ok(svg.includes("url(#p1-iris)"));

  for (const unsafe of [":r1:", "«r1»"]) {
    const scoped = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "idle", {
      idPrefix: `av${unsafe}`,
    });
    assert.ok(scoped.includes('id="avr1-iris"'), `${unsafe} sanitized`);
    assert.ok(!/id="[^"]*[:«»]/.test(scoped), `${unsafe} stripped from IDs`);
  }
});

test("default IDs are deterministic per look and differ between looks", () => {
  const idsOf = (svg: string) => svg.match(/id="([^"]+)-iris"/)?.[1];
  const a = idsOf(generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "idle"));
  const b = idsOf(generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "walk"));
  const c = idsOf(
    generateAvatarSvgString(
      { ...DEFAULT_AVATAR_LOOK, hairColor: "#ff7675" },
      "idle",
    ),
  );
  assert.ok(a);
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("waving arm renders above front hair and carries the handheld", () => {
  const look: AvatarLook = {
    ...DEFAULT_AVATAR_LOOK,
    handheldId: "mango_smoothie_cup",
  };
  const wave = generateAvatarSvgString(look, "wave");
  const idle = generateAvatarSvgString(look, "idle");

  assert.ok(wave.includes("avatar-raised-arm"));
  assert.ok(
    wave.indexOf("avatar-hair-front") < wave.indexOf("avatar-raised-arm"),
    "raised arm after hair front",
  );
  assert.ok(!idle.includes("avatar-raised-arm"));

  const handheldTranslate = (svg: string) =>
    svg.match(/avatar-handheld[^>]*><g transform="(translate\([^)]+\))"/)?.[1];
  assert.ok(handheldTranslate(wave));
  assert.ok(handheldTranslate(idle));
  assert.notEqual(handheldTranslate(wave), handheldTranslate(idle));
});

test("hair color is XML-escaped", () => {
  const svg = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    hairColor: '"><script>alert(1)</script>',
  });
  assert.ok(!svg.includes("<script>"));
  assert.ok(!svg.includes('"><script'));
  assert.ok(svg.includes("&quot;&gt;&lt;script&gt;"));
});
