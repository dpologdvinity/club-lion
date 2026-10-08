import test from "node:test";
import assert from "node:assert/strict";
import {
  renderLayer1HairBack,
  renderLayer6HairFront,
  hairDefs,
} from "./hair.ts";
import { HAIR_STYLE_OPTIONS } from "../../types/avatarOptions.ts";
import { DEFAULT_AVATAR_LOOK, type AvatarLook } from "../../types/world.ts";

const look = (over: Partial<AvatarLook>): AvatarLook => ({
  ...DEFAULT_AVATAR_LOOK,
  ...over,
});

function assertBalanced(svg: string, label: string): void {
  const counts = new Map<string, number>();
  for (const match of svg.matchAll(/<(\/?)([a-zA-Z]+)\b[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = match;
    if (selfClosing) continue;
    counts.set(name, (counts.get(name) ?? 0) + (closing ? -1 : 1));
  }
  for (const [name, count] of counts) {
    assert.equal(count, 0, `${label}: unbalanced <${name}>`);
  }
}

function render(over: Partial<AvatarLook>): { back: string; front: string } {
  const l = look(over);
  return {
    back: renderLayer1HairBack(l, "t"),
    front: renderLayer6HairFront(l, "t"),
  };
}

test("every hairstyle renders back and front layers with its own class", () => {
  for (const { id } of HAIR_STYLE_OPTIONS) {
    const cls = `hair-${id.replace(/_/g, "-")}`;
    const { back, front } = render({ hairId: id });
    assert.ok(back.includes(`avatar-hair-back ${cls}`), `${id} back`);
    assert.ok(front.includes(`avatar-hair-front ${cls}`), `${id} front`);
    assert.ok(front.includes("hair-highlight"), `${id} has a shine ribbon`);
    for (const svg of [back, front]) {
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, id);
      assertBalanced(svg, id);
    }
  }
});

test("every hairstyle draws distinct artwork", () => {
  const seen = new Map<string, string>();
  for (const { id } of HAIR_STYLE_OPTIONS) {
    const { back, front } = render({ hairId: id });
    const art = (back + front).replace(/hair-[a-z-]+/g, "");
    const twin = seen.get(art);
    assert.equal(twin, undefined, `${id} duplicates ${twin}`);
    seen.set(art, id);
  }
});

test("hair color fills each style", () => {
  for (const { id } of HAIR_STYLE_OPTIONS) {
    const { back, front } = render({ hairId: id, hairColor: "#123abc" });
    assert.ok((back + front).includes('fill="#123abc"'), id);
  }
});

test("streak renders only when a streak color is set", () => {
  for (const { id } of HAIR_STYLE_OPTIONS) {
    assert.ok(!render({ hairId: id }).front.includes("hair-streak"), id);
    assert.ok(
      !render({ hairId: id, hairStreak: "" }).front.includes("hair-streak"),
      id,
    );
    const front = render({ hairId: id, hairStreak: "#00f0ff" }).front;
    assert.ok(front.includes('class="hair-streak"'), id);
    assert.ok(front.includes("#00f0ff"), id);
    assertBalanced(front, `${id} streak`);
  }
});

test("streak color is XML-escaped", () => {
  const front = render({ hairStreak: '"><script>alert(1)</script>' }).front;
  assert.ok(!front.includes("<script>"));
  assert.ok(front.includes("&quot;&gt;&lt;script&gt;"));
});

test("legacy hair IDs still resolve to the redesigned cuts", () => {
  const legacy: Record<string, string> = {
    classic_shag: "hair-blowout",
    long_waves: "hair-butterfly-waves",
    beach_wave_bangs: "hair-butterfly-waves",
    spiky_blaze: "hair-space-buns",
    retro_bob: "hair-blunt-bob",
    mystery_cut: "hair-blowout",
  };
  for (const [id, cls] of Object.entries(legacy)) {
    assert.ok(render({ hairId: id }).front.includes(cls), id);
  }
});

test("hair defs define the shine and mermaid shimmer gradients", () => {
  const defs = hairDefs("t");
  assert.ok(defs.includes('id="t-shine"'));
  assert.ok(defs.includes('id="t-mermaid"'));
  assert.ok(
    render({ hairId: "mermaid_waves" }).back.includes("url(#t-mermaid)"),
  );
});
