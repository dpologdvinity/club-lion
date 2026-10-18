import test from "node:test";
import assert from "node:assert/strict";
import { CHATTER_LINES, chatterFor } from "./chatter.ts";

test("room chatter picks a neighbour in the room and a friendly line", () => {
  assert.equal(chatterFor([], 3), null);
  const ids = ["milo", "cleo", "pip"];
  const seen = new Set<string>();
  for (let tick = 0; tick < 12; tick++) {
    const line = chatterFor(ids, tick);
    assert.ok(line && ids.includes(line.id));
    assert.ok(CHATTER_LINES.includes(line.text));
    seen.add(line.id);
  }
  assert.equal(seen.size, 3, "everyone gets a turn");
});
