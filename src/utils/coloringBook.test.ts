import test from "node:test";
import assert from "node:assert/strict";
import {
  PALETTE,
  applyFill,
  findPage,
  restoreColoringBook,
  saveColoringPage,
  surpriseFills,
} from "./coloringBook.ts";
import { COLORING_PAGES } from "./coloringPages.ts";

test("there are at least six pages, each with uniquely named regions", () => {
  assert.ok(COLORING_PAGES.length >= 6);
  assert.equal(
    new Set(COLORING_PAGES.map((page) => page.id)).size,
    COLORING_PAGES.length,
  );
  for (const page of COLORING_PAGES) {
    const ids = page.regions.map((region) => region.id);
    assert.equal(new Set(ids).size, ids.length, page.id);
    assert.ok(page.regions.length >= 15, `${page.id} has plenty to color`);
    for (const region of page.regions) {
      assert.match(region.d, /^M[\d.-]/, `${page.id}/${region.id}`);
      assert.doesNotMatch(region.d, /NaN|undefined/, `${page.id}/${region.id}`);
    }
  }
});

test("filling replaces a region's color and the eraser clears it", () => {
  const filled = applyFill({ sky: "sky" }, "sky", "rainbow");
  assert.deepEqual(filled, { sky: "rainbow" });
  assert.deepEqual(applyFill(filled, "sky", null), {});
  assert.deepEqual(applyFill({}, "sun", "sunny"), { sun: "sunny" });
});

test("surprise me colors every region from a small palette", () => {
  const page = findPage("lion-cub")!;
  let seed = 0;
  const fills = surpriseFills(
    page,
    () => (seed = (seed * 9301 + 49297) % 233280) / 233280,
  );
  assert.deepEqual(
    Object.keys(fills).sort(),
    page.regions.map((region) => region.id).sort(),
  );
  const plain = new Set(
    Object.values(fills).filter(
      (fill) => fill !== "rainbow" && fill !== "sparkle",
    ),
  );
  assert.ok(plain.size <= 5);
  assert.ok(
    [...plain].every((fill) => PALETTE.some((color) => color.id === fill)),
  );
});

test("saving a page keeps valid fills and records the first finish once", () => {
  const started = saveColoringPage(undefined, "puppy", { head: "cocoa" });
  assert.deepEqual(started, {
    pages: { puppy: { head: "cocoa" } },
    finished: [],
  });
  const done = saveColoringPage(
    started,
    "puppy",
    { head: "cocoa", ball: "sparkle" },
    true,
  );
  assert.deepEqual(done?.finished, ["puppy"]);
  const again = saveColoringPage(done, "puppy", { head: "mango" }, true);
  assert.deepEqual(again, {
    pages: { puppy: { head: "mango" } },
    finished: ["puppy"],
  });
  assert.equal(saveColoringPage(again, "not-a-page", { head: "mango" }), again);
});

test("restoring a coloring book drops tampered pages, regions, colors and finishes", () => {
  assert.equal(restoreColoringBook(undefined), undefined);
  assert.equal(restoreColoringBook("lots of crayons"), undefined);
  assert.equal(
    restoreColoringBook({ pages: [], finished: ["puppy"] }),
    undefined,
  );
  assert.deepEqual(
    restoreColoringBook({
      pages: {
        puppy: { head: "cocoa", ball: "<script>", madeUp: "sunny", tail: 4 },
        dragon: { wing: "url(#evil)" },
        toString: { sky: "sunny" },
        "lion-cub": "red",
      },
      finished: ["puppy", "puppy", "dragon", "toString", 7, "beach"],
    }),
    { pages: { puppy: { head: "cocoa" } }, finished: ["puppy"] },
  );
});
