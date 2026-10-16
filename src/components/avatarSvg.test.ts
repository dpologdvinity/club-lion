import test from "node:test";
import assert from "node:assert/strict";
import {
  generateAvatarSvgString,
  SKIN_TONE_COLORS,
  ANCHORS,
  PORTRAIT_VIEWBOX,
} from "./avatarSvg.ts";
import {
  DEFAULT_AVATAR_LOOK,
  EYE_STYLES,
  HAIR_STYLES,
  type AvatarLook,
} from "../types/world.ts";
import {
  PIERCINGS,
  JEWELRY,
  BANGS_OPTIONS,
  NECKLACES,
  HAIR_CLIPS,
  BRACELETS,
  BAGS,
} from "../types/avatarOptions.ts";
import { LEFT_ARM_HIP, RIG, RIGHT_ARM_DOWN } from "./avatar/shared.ts";

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

  assert.deepEqual(ANCHORS.HeadCenter, { x: 60, y: 31 });
  assert.deepEqual(ANCHORS.Neck, { x: 60, y: 60 });
  assert.deepEqual(ANCHORS.Waist, { x: 60, y: 90 });
  assert.deepEqual(ANCHORS.HandRight, { x: 44, y: 101 });
  assert.deepEqual(ANCHORS.Feet, { x: 60, y: 146 });
  // Doll proportions: the head is about a third of the standing height
  const headHeight = (ANCHORS.Neck.y - ANCHORS.HeadCenter.y) * 2;
  const standing = ANCHORS.Feet.y + 7 - (ANCHORS.HeadCenter.y - headHeight / 2);
  assert.ok(headHeight / standing > 0.3 && headHeight / standing < 0.42);
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

test("renders all piercing options distinctly", () => {
  for (const { id } of PIERCINGS) {
    const svg = generateAvatarSvgString({
      ...DEFAULT_AVATAR_LOOK,
      piercingId: id,
    });
    if (id === "none") {
      assert.ok(!svg.includes("avatar-piercing"));
    } else {
      const cls = `piercing-${id.replace(/_/g, "-")}`;
      assert.ok(svg.includes(cls), `Should include ${cls}`);
    }
  }
});

test("renders all jewelry options distinctly", () => {
  for (const { id } of JEWELRY) {
    const svg = generateAvatarSvgString({
      ...DEFAULT_AVATAR_LOOK,
      jewelryId: id,
    });
    if (id === "none") {
      assert.ok(!svg.includes("avatar-jewelry"));
    } else {
      const cls = `jewelry-${id.replace(/_/g, "-")}`;
      assert.ok(svg.includes(cls), `Should include ${cls}`);
    }
  }
});

test("renders all bangs options distinctly", () => {
  for (const { id } of BANGS_OPTIONS) {
    const svg = generateAvatarSvgString({
      ...DEFAULT_AVATAR_LOOK,
      bangsId: id,
    });
    if (id === "none") {
      assert.ok(!svg.includes("avatar-bangs"));
    } else {
      const cls = `bangs-${id.replace(/_/g, "-")}`;
      assert.ok(svg.includes(cls), `Should include ${cls}`);
    }
  }
});

test("headwear and eyewear wear the doll ink outline", () => {
  for (const headwearId of [
    "explorer_fedora",
    "retro_neon_visor",
    "golden_mane_wreath",
    "mystery_hat",
  ]) {
    const svg = generateAvatarSvgString({ ...DEFAULT_AVATAR_LOOK, headwearId });
    const hat = svg.slice(svg.indexOf("avatar-headwear"));
    assert.ok(hat.includes('stroke="#2a1610"'), headwearId);
  }
  for (const eyewearId of ["sunshine_shades", "mystery_specs"]) {
    const svg = generateAvatarSvgString({ ...DEFAULT_AVATAR_LOOK, eyewearId });
    const frames = svg.slice(svg.indexOf("avatar-eyewear"));
    assert.ok(frames.includes('stroke="#2a1610"'), eyewearId);
  }
});

test("portrait crop is a square around the head and shoulders", () => {
  const [x, y, w, h] = PORTRAIT_VIEWBOX.split(" ").map(Number);
  assert.equal(w, h);
  const head = ANCHORS.HeadCenter;
  assert.ok(x < head.x - 40 && x + w > head.x + 40, "hair fits across");
  assert.ok(y < 0 && y + h > ANCHORS.Neck.y + 20, "crown to shoulders");
  assert.ok(y + h < ANCHORS.Waist.y + 10, "stops above the legs");
});

test("necklaces, hair clips, and bangles render each option and nothing by default", () => {
  const plain = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "idle");
  for (const cls of [
    "avatar-necklace",
    "avatar-hair-clips",
    "avatar-bangles",
  ]) {
    assert.ok(!plain.includes(cls), `old looks have no ${cls}`);
  }
  const groups = [
    ["necklaceId", NECKLACES, "necklace"],
    ["hairClipId", HAIR_CLIPS, "clips"],
    ["braceletId", BRACELETS, "bangles"],
  ] as const;
  for (const [field, options, prefix] of groups) {
    for (const { id } of options) {
      for (const action of ["idle", "wave"]) {
        const svg = generateAvatarSvgString(
          { ...DEFAULT_AVATAR_LOOK, [field]: id },
          action,
        );
        assertValidSvg(svg, `${field}/${id}/${action}`);
        const cls = `${prefix}-${id.replace(/_/g, "-")}`;
        assert.equal(svg.includes(cls), id !== "none", cls);
      }
    }
    const unknown = generateAvatarSvgString({
      ...DEFAULT_AVATAR_LOOK,
      [field]: "mystery",
    });
    assert.ok(!unknown.includes(`${prefix}-mystery`), `${field} unknown`);
  }
});

test("new earrings render", () => {
  for (const id of ["silver_hoops", "gold_jhumkas"]) {
    const svg = generateAvatarSvgString({
      ...DEFAULT_AVATAR_LOOK,
      jewelryId: id,
    });
    assert.ok(svg.includes(`jewelry-${id.replace(/_/g, "-")}`), id);
  }
  const look = {
    ...DEFAULT_AVATAR_LOOK,
    jewelryId: "gold_jhumkas",
    necklaceId: "heart_chain",
    hairClipId: "rhinestone_barrettes",
    braceletId: "rainbow_bangles",
  };
});

test("shoulder bags render every option", () => {
  for (const { id } of BAGS) {
    const svg = generateAvatarSvgString({ ...DEFAULT_AVATAR_LOOK, bagId: id });
    assertValidSvg(svg, id);
    assert.equal(
      svg.includes(`bag-${id.replace(/_/g, "-")}`),
      id !== "none",
      id,
    );
  }
});

test("braided topknot and big curls carry doll details", () => {
  const knot = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    hairId: "braided_topknot",
  });
  assert.ok(knot.includes("hair-braided-topknot"));
  assert.ok(knot.includes("baby-hairs"), "baby hairs at the hairline");
  assert.ok(knot.includes('stroke="#f4c542"'), "gold braid cuffs");
  const curls = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    hairId: "big_curls",
  });
  assert.ok(curls.includes("baby-hairs"));
  assert.ok(curls.includes("rgba(255,255,255,0.55)"), "grey shine bands");
  const tiara = generateAvatarSvgString({
    ...DEFAULT_AVATAR_LOOK,
    hairClipId: "tiara",
  });
  assert.ok(tiara.includes("clips-tiara"));
});

test("metallic tops sparkle with star glints", () => {
  for (const topId of ["holo_halter", "sequin_tube"]) {
    const svg = generateAvatarSvgString({ ...DEFAULT_AVATAR_LOOK, topId });
    assert.ok(svg.includes("fabric-glint"), topId);
  }
});

test("head boost swaps every head rig for the larger one", () => {
  const look: AvatarLook = {
    ...DEFAULT_AVATAR_LOOK,
    jewelryId: "silver_hoops",
    headwearId: "explorer_fedora",
  };
  const plain = generateAvatarSvgString(look, "walk");
  const boosted = generateAvatarSvgString(look, "walk", { headBoost: true });
  const count = (svg: string, matrix: string) =>
    svg.split(`transform="${matrix}"`).length - 1;
  const heads = count(plain, RIG.head);
  assert.ok(heads >= 6, "hair, body head, face, hair front, earrings, hat");
  assert.equal(count(boosted, RIG.head), 0);
  assert.equal(count(boosted, RIG.headBoost), heads);
  assertValidSvg(boosted, "boosted");
});

test("arm shoulders stay on the slimmed torso edges", () => {
  // Torso art spans x 48-72 at the shoulder line (see renderLayer2BodyBase)
  const [scaleX, , , , tx] = RIG.torso.slice(7, -1).split(" ").map(Number);
  const left = 48 * scaleX + tx;
  const right = 72 * scaleX + tx;
  assert.ok(Math.abs(RIGHT_ARM_DOWN.shoulder[0] - left) < 1.6);
  assert.ok(Math.abs(LEFT_ARM_HIP.shoulder[0] - right) < 1.6);
});

test("doll head takes about two fifths of the standing figure", () => {
  // Head art spans y 13 (crown) to 69 (chin); the rigs place it on the canvas
  const [, , , scale, , ty] = RIG.head.slice(7, -1).split(" ").map(Number);
  const crown = 13 * scale + ty;
  const chin = 69 * scale + ty;
  const feet = ANCHORS.Feet.y + 7;
  const ratio = (chin - crown) / (feet - crown);
  assert.ok(ratio > 0.33 && ratio < 0.45, `head ratio ${ratio}`);
});
