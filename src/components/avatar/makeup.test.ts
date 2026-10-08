import test from "node:test";
import assert from "node:assert/strict";
import { generateAvatarSvgString } from "../avatarSvg.ts";
import { resolveMakeup } from "./makeup.ts";
import { DEFAULT_AVATAR_LOOK, type AvatarLook } from "../../types/world.ts";
import {
  BLUSHES,
  EYE_COLORS,
  EYE_LOOKS,
  EYESHADOWS,
  FACE_DETAILS,
  LIP_COLORS,
} from "../../types/avatarOptions.ts";

function render(overrides: Partial<AvatarLook>): string {
  return generateAvatarSvgString(
    { ...DEFAULT_AVATAR_LOOK, ...overrides },
    "idle",
    { idPrefix: "t" },
  );
}

function assertValidSvg(svg: string, label: string): void {
  for (const bad of ["NaN", "undefined", "Infinity", "null"]) {
    assert.ok(!svg.includes(bad), `${label}: contains ${bad}`);
  }
  const counts = new Map<string, number>();
  for (const match of svg.matchAll(/<(\/?)([a-zA-Z]+)\b[^>]*?(\/?)>/g)) {
    const [, closing, tag, selfClosing] = match;
    if (selfClosing) continue;
    counts.set(tag, (counts.get(tag) ?? 0) + (closing ? -1 : 1));
  }
  for (const [tag, count] of counts) {
    assert.equal(count, 0, `${label}: unbalanced <${tag}>`);
  }
}

test("every eye look renders valid markup with its own class", () => {
  for (const look of EYE_LOOKS) {
    const svg = render({ eyeStyle: look.id });
    assertValidSvg(svg, look.id);
    assert.ok(
      svg.includes(`eye-${look.id.replace(/_/g, "-")}`),
      `${look.id} class`,
    );
  }
});

test("every eye look is visually distinct", () => {
  const faces = EYE_LOOKS.map((look) => render({ eyeStyle: look.id }));
  assert.equal(new Set(faces).size, EYE_LOOKS.length);
});

test("sampled makeup combinations all render valid SVG", () => {
  // Walk each option list in step so every option appears with varied partners
  const rounds = Math.max(
    EYE_LOOKS.length,
    EYESHADOWS.length,
    LIP_COLORS.length,
    EYE_COLORS.length,
    BLUSHES.length,
    FACE_DETAILS.length,
  );
  for (let i = 0; i < rounds * 3; i++) {
    const look: Partial<AvatarLook> = {
      eyeStyle: EYE_LOOKS[i % EYE_LOOKS.length].id,
      eyeshadowId: EYESHADOWS[(i * 5) % EYESHADOWS.length].id,
      lipId: LIP_COLORS[(i * 7) % LIP_COLORS.length].id,
      eyeColorId: EYE_COLORS[(i * 3) % EYE_COLORS.length].id,
      blushId: BLUSHES[i % BLUSHES.length].id,
      faceDetailId: FACE_DETAILS[(i * 2) % FACE_DETAILS.length].id,
    };
    assertValidSvg(render(look), JSON.stringify(look));
  }
});

test("each makeup override changes the rendered face", () => {
  const base = render({});
  const overrides: Partial<AvatarLook>[] = [
    { eyeshadowId: "teal" },
    { lipId: "cherry" },
    { eyeColorId: "blue" },
    { blushId: "peach" },
    { faceDetailId: "freckles" },
  ];
  for (const override of overrides) {
    assert.notEqual(render(override), base, JSON.stringify(override));
  }
});

test("overrides resolve from the registry while absent ones keep preset colors", () => {
  const preset = resolveMakeup({ ...DEFAULT_AVATAR_LOOK });
  assert.equal(preset.shadow, "#b8704c");
  assert.equal(preset.lipFinish, "gloss");
  assert.equal(preset.blush, "#ff5f86");
  assert.equal(preset.faceDetail, "none");

  const custom = resolveMakeup({
    ...DEFAULT_AVATAR_LOOK,
    eyeshadowId: "emerald",
    lipId: "plum",
    eyeColorId: "grey",
    blushId: "none",
  });
  assert.equal(custom.shadow, "#1f8a5a");
  assert.equal(custom.lips, "#6e2346");
  assert.equal(custom.lipFinish, "matte");
  assert.deepEqual(custom.iris, ["#e0e4ea", "#8a94a4", "#2e343e"]);
  assert.equal(custom.blush, null);
});

test("unknown makeup IDs fall back safely without leaking raw strings", () => {
  const hostile = '"><script>alert(1)</script>';
  const look: Partial<AvatarLook> = {
    eyeStyle: hostile,
    eyeshadowId: hostile,
    lipId: hostile,
    eyeColorId: hostile,
    blushId: hostile,
    faceDetailId: hostile,
  };
  const svg = render(look);
  assertValidSvg(svg, "hostile");
  assert.ok(!svg.includes("<script"));
  assert.ok(svg.includes("eye-winged-glam"));
  assert.equal(svg, render({}));
});

test("blush none removes the blush while keeping the cheek contour", () => {
  const svg = render({ blushId: "none" });
  assert.ok(!svg.includes("avatar-blush"));
  assert.ok(!svg.includes("t-blush"));
  assert.ok(render({}).includes("avatar-blush"));
});

test("lip finishes render their own treatments", () => {
  assert.ok(render({ lipId: "rose" }).includes("lip-gloss"));
  const matte = render({ lipId: "plum" });
  assert.ok(matte.includes("lip-matte"));
  assert.ok(!matte.includes("url(#t-gloss)"));
  assert.ok(render({ lipId: "frosted_lilac" }).includes("lip-frost"));
  assert.ok(render({ lipId: "glitter_gloss" }).includes("lip-glitter"));
});

test("premium looks render their signature markers", () => {
  assert.ok(render({ eyeStyle: "graphic_liner" }).includes("graphic-liner"));
  assert.ok(render({ eyeStyle: "glitter_pop" }).includes("glitter-pop"));
  assert.ok(render({ eyeStyle: "doe_lash" }).includes("lower-lashes"));
  const holo = render({ eyeshadowId: "holo_shimmer" });
  assert.ok(holo.includes("#7fe3ff"), "holo gradient stops");
  const ombre = render({ eyeshadowId: "sunset_ombre" });
  assert.ok(ombre.includes("#ff9a3c"), "ombre gradient stops");
});

test("every face detail except none renders a tagged group", () => {
  for (const detail of FACE_DETAILS) {
    const svg = render({ faceDetailId: detail.id });
    const cls = `face-${detail.id.replace(/_/g, "-")}`;
    if (detail.id === "none") {
      assert.ok(!svg.includes("face-detail"));
    } else {
      assert.ok(svg.includes(cls), cls);
    }
  }
});

test("the wink keeps one closed eye with the chosen eyeshadow color", () => {
  const svg = render({ eyeStyle: "wink", eyeshadowId: "teal" });
  assert.ok(svg.includes("eye-closed"));
  assert.ok(svg.includes('fill="#2a9d9a" opacity="0.55"'));
});
