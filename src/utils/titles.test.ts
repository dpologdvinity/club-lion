import test from "node:test";
import assert from "node:assert/strict";
import { titleFor } from "./titles.ts";

test("titles grow with the stamps you collect", () => {
  assert.equal(titleFor(0), "Newbie");
  assert.equal(titleFor(4), "Newbie");
  assert.equal(titleFor(5), "Explorer");
  assert.equal(titleFor(15), "Superstar");
  assert.equal(titleFor(99), "Legend");
});
