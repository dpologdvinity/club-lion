import test from "node:test";
import assert from "node:assert/strict";
import {
  generateAvatarSvgString,
  SKIN_TONE_COLORS,
  ANCHORS,
} from "./avatarSvg.ts";
import { DEFAULT_AVATAR_LOOK, type AvatarLook } from "../types/world.ts";

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
